import { CHINA_ADCODE } from '../data/adcodes'

const geoCache: Record<string, unknown> = {}

export async function fetchGeoJSON(adcode: string): Promise<unknown> {
  if (geoCache[adcode]) return geoCache[adcode]

  const base = import.meta.env.BASE_URL || './'
  let url: string

  if (adcode === CHINA_ADCODE) {
    url = `${base}china.json`
  } else {
    url = `${base}geo/${adcode}.json`
  }

  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch geo data: ${adcode}`)
  const data = await resp.json()
  geoCache[adcode] = data
  return data
}
