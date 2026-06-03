import { CHINA_ADCODE } from '../data/adcodes'

const geoCache: Record<string, unknown> = {}

export async function fetchGeoJSON(adcode: string): Promise<unknown> {
  if (geoCache[adcode]) return geoCache[adcode]

  if (adcode === CHINA_ADCODE) {
    const base = import.meta.env.BASE_URL || './'
    const resp = await fetch(`${base}china.json`)
    if (!resp.ok) throw new Error('Failed to load china map data')
    const data = await resp.json()
    geoCache[adcode] = data
    return data
  }

  // 省份数据：尝试多个数据源
  const urls = [
    `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`,
    `https://geojson.cn/api/data/${adcode}_full.json`,
  ]

  for (const url of urls) {
    try {
      const resp = await fetch(url)
      if (resp.ok) {
        const data = await resp.json()
        geoCache[adcode] = data
        return data
      }
    } catch {
      continue
    }
  }

  throw new Error(`Failed to fetch geo data: ${adcode}`)
}
