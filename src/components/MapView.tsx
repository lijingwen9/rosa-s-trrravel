import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import { Project, MapMode, CityData } from '../types'
import { PROVINCE_ADCODES, CHINA_ADCODE } from '../data/adcodes'
import { fetchGeoJSON } from '../utils/geo'
import Modal from './Modal'

interface MapViewProps {
  project: Project
  mapMode: MapMode
  onUpdateProject: (project: Project) => void
}

interface ModalState {
  type: 'province' | 'city'
  name: string
  provinceName?: string
  isLit: boolean
  note: string
  readOnly?: boolean
  litCities?: string[]
}

// GeoJSON 中每个城市 feature 的 properties.center
interface GeoFeature {
  properties: { name: string; center?: [number, number] }
}

const MUNICIPALITIES = new Set(['北京市', '天津市', '上海市', '重庆市'])

const cityCenterCache: Record<string, Record<string, [number, number]>> = {}

function extractCityCenters(geoData: unknown, provinceName: string): Record<string, [number, number]> {
  if (cityCenterCache[provinceName]) return cityCenterCache[provinceName]
  const centers: Record<string, [number, number]> = {}
  const geo = geoData as { features?: GeoFeature[] }
  if (geo.features) {
    for (const f of geo.features) {
      if (f.properties.name && f.properties.center) {
        centers[f.properties.name] = f.properties.center
      }
    }
  }
  cityCenterCache[provinceName] = centers
  return centers
}

export default function MapView({ project, mapMode, onUpdateProject }: MapViewProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [currentProvince, setCurrentProvince] = useState<string | null>(null)
  const [cityMapReady, setCityMapReady] = useState(false)
  const mapModeRef = useRef(mapMode)
  const projectRef = useRef(project)

  mapModeRef.current = mapMode
  projectRef.current = project

  const loadProvinceDetail = useCallback(async (provinceName: string) => {
    const adcode = PROVINCE_ADCODES[provinceName]
    if (!adcode || adcode.includes('JD')) return

    // 直辖市不再细分到区，直接当省级点亮处理
    if (MUNICIPALITIES.has(provinceName)) {
      const provinceData = projectRef.current.provinces[provinceName]
      setModal({
        type: 'province',
        name: provinceName,
        isLit: provinceData?.lit ?? false,
        note: provinceData?.note ?? ''
      })
      return
    }

    setLoading(true)
    setCurrentProvince(provinceName)

    try {
      const geoData = await fetchGeoJSON(adcode)
      const mapName = `province_${adcode}`
      echarts.registerMap(mapName, geoData as never)

      extractCityCenters(geoData, provinceName)

      if (!chartInstance.current) return

      const chart = chartInstance.current
      chart.off('click')

      const citiesInProvince = projectRef.current.cities[provinceName] || {}
      const option = buildProvinceDetailOption(mapName, citiesInProvince)
      chart.setOption(option, true)

      chart.on('click', (params) => {
        const name = params.name as string
        if (!name) return
        const currentCities = projectRef.current.cities[provinceName] || {}
        const cityData = currentCities[name]
        setModal({
          type: 'city',
          name,
          provinceName,
          isLit: cityData?.lit ?? false,
          note: cityData?.note ?? ''
        })
      })

      setCityMapReady(true)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load province detail:', err)
      setLoading(false)
    }
  }, [])

  const initChart = useCallback(async () => {
    if (!chartRef.current) return
    setLoading(true)

    try {
      const geoData = await fetchGeoJSON(CHINA_ADCODE)
      echarts.registerMap('china', geoData as never)

      if (chartInstance.current) {
        chartInstance.current.dispose()
      }

      const chart = echarts.init(chartRef.current)
      chartInstance.current = chart
      setCurrentProvince(null)
      setCityMapReady(false)

      const option = buildChinaMapOption(projectRef.current, mapModeRef.current)
      chart.setOption(option)

      chart.on('click', (params) => {
        const name = params.name as string
        if (!name) return
        if (params.componentType === 'series' && params.seriesType === 'effectScatter') return
        if (mapModeRef.current === 'all') {
          const provinceData = projectRef.current.provinces[name]
          const provinceCities = projectRef.current.cities[name] || {}
          const litCityNames = Object.entries(provinceCities)
            .filter(([, v]) => v.lit)
            .map(([k]) => k)
          setModal({
            type: 'province',
            name,
            isLit: provinceData?.lit ?? false,
            note: provinceData?.note ?? '',
            readOnly: true,
            litCities: litCityNames
          })
        } else if (mapModeRef.current === 'province') {
          const provinceData = projectRef.current.provinces[name]
          setModal({
            type: 'province',
            name,
            isLit: provinceData?.lit ?? false,
            note: provinceData?.note ?? ''
          })
        } else if (mapModeRef.current === 'city') {
          loadProvinceDetail(name)
        }
      })

      setLoading(false)
    } catch (err) {
      console.error('Failed to load map:', err)
      setError('地图数据加载失败，请检查网络后刷新')
      setLoading(false)
    }
  }, [loadProvinceDetail])

  const handleToggle = useCallback((note: string) => {
    if (!modal) return

    if (modal.type === 'province') {
      const current = project.provinces[modal.name]
      const newProvinces = { ...project.provinces }
      if (current?.lit) {
        delete newProvinces[modal.name]
      } else {
        newProvinces[modal.name] = { lit: true, note }
      }
      onUpdateProject({ ...project, provinces: newProvinces })
    } else if (modal.type === 'city' && modal.provinceName) {
      const provinceCities = { ...(project.cities[modal.provinceName] || {}) }
      const current = provinceCities[modal.name]
      if (current?.lit) {
        delete provinceCities[modal.name]
      } else {
        const centers = cityCenterCache[modal.provinceName]
        const center = centers?.[modal.name]
        const cityData: CityData = { lit: true, note }
        if (center) cityData.center = center
        provinceCities[modal.name] = cityData
      }
      const newCities = { ...project.cities, [modal.provinceName]: provinceCities }
      const newProvinces = { ...project.provinces }
      // 点亮市时自动点亮省
      if (!current?.lit && !newProvinces[modal.provinceName]?.lit) {
        newProvinces[modal.provinceName] = { lit: true, note: '' }
      }
      onUpdateProject({ ...project, provinces: newProvinces, cities: newCities })
    }

    setModal(null)
  }, [modal, project, onUpdateProject])

  const handleBackToChina = useCallback(() => {
    setCurrentProvince(null)
    setCityMapReady(false)
    initChart()
  }, [initChart])

  useEffect(() => {
    initChart()
    return () => {
      chartInstance.current?.dispose()
    }
  }, [mapMode, project.id])

  useEffect(() => {
    if (!chartInstance.current) return
    if (currentProvince && cityMapReady) {
      const adcode = PROVINCE_ADCODES[currentProvince]
      if (!adcode) return
      const mapName = `province_${adcode}`
      const citiesInProvince = project.cities[currentProvince] || {}
      const option = buildProvinceDetailOption(mapName, citiesInProvince)
      chartInstance.current.setOption(option, true)
    } else if (!currentProvince) {
      const option = buildChinaMapOption(project, mapMode)
      chartInstance.current.setOption(option, true)
    }
  }, [project.provinces, project.cities])

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative w-full h-full" style={{ touchAction: 'none', minHeight: '500px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-sm text-gray-400">地图加载中...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-sm text-red-500 text-center px-4">
            <p>{error}</p>
            <button onClick={() => { setError(''); initChart() }} className="mt-2 text-blue-500 underline">重试</button>
          </div>
        </div>
      )}

      {currentProvince && mapMode === 'city' && (
        <button
          onClick={handleBackToChina}
          className="absolute top-3 left-3 z-10 bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          ← 返回全国
        </button>
      )}

      {currentProvince && mapMode === 'city' && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 shadow-sm">
          {currentProvince}
        </div>
      )}

      <div ref={chartRef} className="w-full" style={{ height: '100%', minHeight: '500px', touchAction: 'none' }} />

      {modal && (
        <Modal
          title={modal.name}
          isLit={modal.isLit}
          note={modal.note}
          readOnly={modal.readOnly}
          litCities={modal.litCities}
          onClose={() => setModal(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  )
}

function buildChinaMapOption(project: Project, mapMode: MapMode): echarts.EChartsOption {
  const litProvinces = new Set(
    Object.entries(project.provinces).filter(([, v]) => v.lit).map(([k]) => k)
  )

  const litCities: Record<string, Set<string>> = {}
  for (const [prov, cities] of Object.entries(project.cities)) {
    const litSet = new Set(
      Object.entries(cities).filter(([, v]) => v.lit).map(([k]) => k)
    )
    if (litSet.size > 0) litCities[prov] = litSet
  }

  const data = Object.keys(PROVINCE_ADCODES).map(name => {
    const isProvinceLit = litProvinces.has(name)
    const hasCityLit = !!litCities[name]
    let value = 0
    if (mapMode === 'province') {
      value = isProvinceLit ? 2 : 0
    } else {
      // 全部模式和市级模式都展示省+市
      value = isProvinceLit ? 2 : (hasCityLit ? 1 : 0)
    }
    return { name, value }
  })

  // 收集有坐标的已点亮城市，仅在市级模式用散点标注
  const cityScatterData: { name: string; value: [number, number, number] }[] = []
  if (mapMode === 'city') {
    for (const [prov, cities] of Object.entries(project.cities)) {
      for (const [cityName, cityData] of Object.entries(cities)) {
        if (cityData.lit && cityData.center) {
          cityScatterData.push({
            name: `${cityName}(${prov})`,
            value: [cityData.center[0], cityData.center[1], 1]
          })
        }
      }
    }
  }

  const series: echarts.EChartsOption['series'] = [
    {
      type: 'map',
      map: 'china',
      roam: true,
      zoom: 1.2,
      scaleLimit: { min: 0.8, max: 5 },
      label: {
        show: true,
        fontSize: 9,
        color: '#666'
      },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
        itemStyle: { areaColor: '#e0e7ff', borderColor: '#aaa' }
      },
      itemStyle: {
        borderColor: '#ccc',
        borderWidth: 0.5,
        areaColor: '#fff'
      },
      data: data.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: d.value === 2
          ? { areaColor: '#93c5fd', shadowColor: 'rgba(59,130,246,0.5)', shadowBlur: 10 }
          : d.value === 1
            ? { areaColor: '#fef3c7', shadowColor: 'rgba(249,115,22,0.2)', shadowBlur: 4 }
            : { areaColor: '#fff' }
      }))
    }
  ]

  // 添加城市散点图层
  if (cityScatterData.length > 0) {
    series.push({
      type: 'effectScatter',
      coordinateSystem: 'geo',
      symbolSize: 4,
      rippleEffect: {
        brushType: 'stroke',
        scale: 2,
        number: 2
      },
      itemStyle: {
        color: '#f97316',
        shadowColor: 'rgba(249,115,22,0.3)',
        shadowBlur: 3
      },
      label: {
        show: true,
        formatter: (params: unknown) => {
          const p = params as { name: string }
          return p.name.split('(')[0]
        },
        position: 'right',
        fontSize: 9,
        color: '#ea580c'
      },
      data: cityScatterData
    } as never)
  }

  return {
    geo: cityScatterData.length > 0 ? {
      map: 'china',
      roam: true,
      zoom: 1.2,
      scaleLimit: { min: 0.8, max: 5 },
      silent: true,
      itemStyle: { areaColor: 'transparent', borderWidth: 0 },
      label: { show: false }
    } : undefined,
    series,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number | number[]; seriesType: string }
        if (p.seriesType === 'effectScatter') {
          return `<strong>🏙️ ${p.name.split('(')[0]}</strong><br/>已点亮`
        }
        const val = typeof p.value === 'number' ? p.value : 0
        const status = val === 2 ? '✅ 省已点亮' : val === 1 ? '🏙️ 有城市点亮' : ''
        return `<strong>${p.name}</strong>${status ? '<br/>' + status : ''}`
      }
    }
  }
}

function buildProvinceDetailOption(
  mapName: string,
  cities: Record<string, { lit: boolean; note: string }>
): echarts.EChartsOption {
  return {
    geo: undefined,
    series: [{
      type: 'map',
      map: mapName,
      roam: true,
      zoom: 1.0,
      label: {
        show: true,
        fontSize: 10,
        color: '#555'
      },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
        itemStyle: { areaColor: '#fef3c7', borderColor: '#aaa' }
      },
      itemStyle: {
        borderColor: '#ddd',
        borderWidth: 0.5,
        areaColor: '#fff'
      },
      data: Object.entries(cities)
        .filter(([, v]) => v.lit)
        .map(([name]) => ({
          name,
          value: 1,
          itemStyle: {
            areaColor: '#fdba74',
            shadowColor: 'rgba(249,115,22,0.5)',
            shadowBlur: 10
          }
        }))
    }],
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string }
        const city = cities[p.name]
        const status = city?.lit ? '✅ 已点亮' : ''
        return `<strong>${p.name}</strong>${status ? '<br/>' + status : ''}`
      }
    }
  }
}
