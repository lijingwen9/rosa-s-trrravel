import { CHINA_ADCODE } from '../data/adcodes'

const GEO_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

const geoCache: Record<string, unknown> = {}

export async function fetchGeoJSON(adcode: string): Promise<unknown> {
  const key = adcode
  if (geoCache[key]) return geoCache[key]

  const suffix = adcode === CHINA_ADCODE ? '_full' : '_full'
  const url = `${GEO_BASE}/${adcode}${suffix}.json`

  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch geo data: ${adcode}`)
  const data = await resp.json()
  geoCache[key] = data
  return data
}
