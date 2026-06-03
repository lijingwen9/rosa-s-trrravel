import { useState, useCallback, useEffect } from 'react'
import { AppData, MapMode, Project } from './types'
import { loadData, saveData } from './utils/storage'
import Header from './components/Header'
import MapView from './components/MapView'
import ProjectPanel from './components/ProjectPanel'
import ImportExport from './components/ImportExport'
import CityListPanel from './components/CityListPanel'

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [mapMode, setMapMode] = useState<MapMode>('all')
  const [showProjectPanel, setShowProjectPanel] = useState(false)
  const [showCityList, setShowCityList] = useState(false)

  useEffect(() => {
    saveData(data)
  }, [data])

  const currentProject = data.projects.find(p => p.id === data.currentProjectId) || data.projects[0]

  const updateProject = useCallback((updated: Project) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updated.id ? updated : p)
    }))
  }, [])

  const setCurrentProjectId = useCallback((id: string) => {
    setData(prev => ({ ...prev, currentProjectId: id }))
  }, [])

  const addProject = useCallback((name: string) => {
    const np: Project = {
      id: crypto.randomUUID(),
      name,
      provinces: {},
      cities: {}
    }
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, np],
      currentProjectId: np.id
    }))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setData(prev => {
      const projects = prev.projects.filter(p => p.id !== id)
      if (projects.length === 0) {
        const np: Project = { id: crypto.randomUUID(), name: '全部足迹', provinces: {}, cities: {} }
        return { ...prev, projects: [np], currentProjectId: np.id }
      }
      const currentProjectId = prev.currentProjectId === id ? projects[0].id : prev.currentProjectId
      return { ...prev, projects, currentProjectId }
    })
  }, [])

  const renameProject = useCallback((id: string, name: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, name } : p)
    }))
  }, [])

  const setAvatar = useCallback((avatar: string) => {
    setData(prev => ({ ...prev, avatar }))
  }, [])

  const setUsername = useCallback((username: string) => {
    setData(prev => ({ ...prev, username }))
  }, [])

  const setNameColor = useCallback((nameColor: string) => {
    setData(prev => ({ ...prev, nameColor }))
  }, [])

  const setAppData = useCallback((newData: AppData) => {
    setData(newData)
  }, [])

  const litProvinceCount = Object.values(currentProject.provinces).filter(p => p.lit).length
  const litCityCount = Object.values(currentProject.cities).reduce(
    (acc, cities) => acc + Object.values(cities).filter(c => c.lit).length, 0
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        avatar={data.avatar}
        username={data.username}
        nameColor={data.nameColor}
        onAvatarChange={setAvatar}
        onUsernameChange={setUsername}
        onNameColorChange={setNameColor}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <main className="flex-1 flex flex-col p-2 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {(['all', 'province', 'city'] as MapMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    mapMode === mode ? 'tab-active' : 'tab-inactive'
                  }`}
                >
                  {mode === 'all' ? '全部' : mode === 'province' ? '省级' : '市级'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto text-sm text-gray-500">
              <button
                onClick={() => setShowCityList(true)}
                className="text-xs bg-white border border-gray-200 text-gray-600 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors"
              >
                查看列表
              </button>
              <span>省 <strong className="text-blue-500">{litProvinceCount}</strong>/34</span>
              <span>市 <strong className="text-orange-500">{litCityCount}</strong></span>
            </div>

            <button
              onClick={() => setShowProjectPanel(!showProjectPanel)}
              className="lg:hidden px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
            >
              {currentProject.name} ▾
            </button>
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <MapView
              project={currentProject}
              mapMode={mapMode}
              onUpdateProject={updateProject}
            />
          </div>

          <div className="mt-3">
            <ImportExport data={data} onImport={setAppData} />
          </div>
        </main>

        <aside className={`
          ${showProjectPanel ? 'block' : 'hidden'} lg:block
          w-full lg:w-64 p-2 sm:p-4 lg:border-l border-gray-200 bg-white lg:bg-transparent
          fixed lg:static inset-0 top-14 z-30 lg:z-auto overflow-y-auto
        `}>
          <div className="lg:hidden flex justify-end mb-2">
            <button onClick={() => setShowProjectPanel(false)} className="text-gray-400 text-xl">&times;</button>
          </div>
          <ProjectPanel
            projects={data.projects}
            currentProjectId={data.currentProjectId}
            onSelect={(id) => { setCurrentProjectId(id); setShowProjectPanel(false) }}
            onAdd={addProject}
            onDelete={deleteProject}
            onRename={renameProject}
          />
        </aside>
      </div>

      {showCityList && (
        <CityListPanel project={currentProject} onClose={() => setShowCityList(false)} />
      )}
    </div>
  )
}
