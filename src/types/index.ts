export interface ProvinceData {
  lit: boolean
  note: string
}

export interface CityData {
  lit: boolean
  note: string
  center?: [number, number]
}

export interface Project {
  id: string
  name: string
  provinces: Record<string, ProvinceData>
  cities: Record<string, Record<string, CityData>>
}

export interface AppData {
  currentProjectId: string
  projects: Project[]
  avatar?: string
  username?: string
  nameColor?: string
}

export type MapMode = 'all' | 'province' | 'city'
