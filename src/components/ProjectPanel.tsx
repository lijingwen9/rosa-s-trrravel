import { useState } from 'react'
import { Project } from '../types'

interface ProjectPanelProps {
  projects: Project[]
  currentProjectId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export default function ProjectPanel({ projects, currentProjectId, onSelect, onAdd, onDelete, onRename }: ProjectPanelProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
    setAdding(false)
  }

  const handleRename = (id: string) => {
    const name = editName.trim()
    if (!name) return
    onRename(id, name)
    setEditingId(null)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定删除项目「${name}」吗？该项目的所有点亮数据将被删除。`)) {
      onDelete(id)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">项目列表</h2>

      <div className="space-y-1">
        {projects.map(p => (
          <div
            key={p.id}
            className={`group flex items-center rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              p.id === currentProjectId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(p.id)}
          >
            {editingId === p.id ? (
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => handleRename(p.id)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setEditingId(null) }}
                onClick={e => e.stopPropagation()}
                className="flex-1 text-sm border border-blue-300 rounded px-2 py-0.5 outline-none"
              />
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700 truncate">{p.name}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setEditingId(p.id); setEditName(p.name) }}
                    className="text-gray-400 hover:text-blue-500 text-xs px-1"
                    title="重命名"
                  >
                    ✎
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(p.id, p.name) }}
                    className="text-gray-400 hover:text-red-500 text-xs px-1"
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="项目名称"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400"
          />
          <button onClick={handleAdd} className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg">
            确定
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 w-full text-sm text-blue-500 border border-dashed border-blue-300 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
        >
          + 新建项目
        </button>
      )}
    </div>
  )
}
