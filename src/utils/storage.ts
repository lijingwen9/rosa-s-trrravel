import { AppData, Project } from '../types'

const STORAGE_KEY = 'travel-map-data'

function createDefaultProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: '全部足迹',
    provinces: {},
    cities: {}
  }
}

function createDefaultData(): AppData {
  const defaultProject = createDefaultProject()
  return {
    currentProjectId: defaultProject.id,
    projects: [defaultProject]
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultData()
    const data = JSON.parse(raw) as AppData
    if (!data.projects || data.projects.length === 0) {
      return createDefaultData()
    }
    return data
  } catch {
    return createDefaultData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(data: AppData): void {
  const date = new Date().toISOString().slice(0, 10)
  const filename = `travel-map-backup-${date}.json`
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function validateImportData(data: unknown): data is AppData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.projects)) return false
  if (typeof d.currentProjectId !== 'string') return false
  for (const p of d.projects) {
    if (!p || typeof p !== 'object') return false
    const proj = p as Record<string, unknown>
    if (typeof proj.id !== 'string') return false
    if (typeof proj.name !== 'string') return false
    if (typeof proj.provinces !== 'object') return false
    if (typeof proj.cities !== 'object') return false
  }
  return true
}

export function newProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    provinces: {},
    cities: {}
  }
}
