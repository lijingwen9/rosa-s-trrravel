import { useState } from 'react'
import { Project } from '../types'
import { CITY_TIERS, TIER_NAMES } from '../data/city-tiers'

interface CityListPanelProps {
  project: Project
  onClose: () => void
}

export default function CityListPanel({ project, onClose }: CityListPanelProps) {
  const [activeTier, setActiveTier] = useState(TIER_NAMES[0])

  const cities = CITY_TIERS[activeTier] || []

  const MUNICIPALITIES = new Set(['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区'])

  const isCityLit = (cityName: string, province: string): boolean => {
    if (MUNICIPALITIES.has(province) && project.provinces[province]?.lit) {
      return true
    }
    const provinceCities = project.cities[province]
    if (!provinceCities) return false
    for (const [name, data] of Object.entries(provinceCities)) {
      if (data.lit && (name === cityName || name.includes(cityName) || cityName.includes(name))) {
        return true
      }
    }
    return false
  }

  const litCount = cities.filter(c => isCityLit(c.name, c.province)).length

  return (
    <div className="modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div
        className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-lg h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold text-gray-800">城市列表</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex gap-1 overflow-x-auto">
            {TIER_NAMES.map(tier => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  activeTier === tier
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            已点亮 <span className="text-orange-500 font-medium">{litCount}</span> / {cities.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-1">
            {cities.map((city, idx) => {
              const lit = isCityLit(city.name, city.province)
              return (
                <div
                  key={`${city.name}-${idx}`}
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    lit ? 'bg-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                    lit ? 'bg-orange-400 shadow-sm' : 'bg-gray-300'
                  }`} />
                  <span className={`text-sm ${lit ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {city.name}
                  </span>
                  {!lit && (
                    <span className="ml-auto text-xs text-gray-400">
                      {city.province.replace(/(省|市|自治区|壮族自治区|回族自治区|维吾尔自治区)$/, '')}
                    </span>
                  )}
                  {lit && (
                    <span className="ml-auto text-xs text-orange-400">已点亮</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
