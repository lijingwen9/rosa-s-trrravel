import { useRef, useState } from 'react'

const NAME_COLORS = [
  { label: '蓝', value: '#3b82f6' },
  { label: '红', value: '#ef4444' },
  { label: '橙', value: '#f97316' },
  { label: '绿', value: '#22c55e' },
  { label: '紫', value: '#a855f7' },
  { label: '粉', value: '#ec4899' },
  { label: '青', value: '#06b6d4' },
  { label: '黑', value: '#1f2937' },
]

interface HeaderProps {
  avatar?: string
  username?: string
  nameColor?: string
  onAvatarChange: (avatar: string) => void
  onUsernameChange: (name: string) => void
  onNameColorChange: (color: string) => void
}

export default function Header({ avatar, username, nameColor, onAvatarChange, onUsernameChange, onNameColorChange }: HeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(username || '')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleAvatarClick = () => {
    fileRef.current?.click()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('头像文件不能超过2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAvatarChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleNameClick = () => {
    setEditValue(username || '')
    setEditing(true)
  }

  const handleNameConfirm = () => {
    onUsernameChange(editValue.trim())
    setEditing(false)
  }

  const color = nameColor || '#3b82f6'

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-0">
        {editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleNameConfirm}
            onKeyDown={e => { if (e.key === 'Enter') handleNameConfirm(); if (e.key === 'Escape') setEditing(false) }}
            placeholder="输入名字"
            className="w-20 sm:w-28 border-b-2 border-blue-400 outline-none text-lg sm:text-xl font-bold bg-transparent px-0"
            style={{ color }}
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color }}
            title="点击编辑名字"
          >
            {username || '___'}
          </span>
        )}
        <span>的旅行足迹</span>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="ml-2 w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: color }}
          title="选择颜色"
        />
      </h1>

      {showColorPicker && (
        <div className="absolute top-14 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1.5 z-50">
          {NAME_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => { onNameColorChange(c.value); setShowColorPicker(false) }}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c.value ? 'border-gray-800 scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleAvatarClick}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors"
        >
          {avatar ? (
            <img src={avatar} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300 text-xs">
              头像
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </header>
  )
}
