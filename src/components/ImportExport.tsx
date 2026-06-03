import { useState } from 'react'
import { AppData } from '../types'
import { exportData, validateImportData } from '../utils/storage'

interface ImportExportProps {
  data: AppData
  onImport: (data: AppData) => void
}

export default function ImportExport({ data, onImport }: ImportExportProps) {
  const [error, setError] = useState('')

  const handleExport = () => {
    exportData(data)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string)
          if (!validateImportData(parsed)) {
            setError('文件格式不正确，请选择有效的备份文件')
            setTimeout(() => setError(''), 3000)
            return
          }
          if (!confirm('导入将覆盖当前所有数据，确定继续吗？')) return
          onImport(parsed)
          setError('')
          alert('导入成功！')
        } catch {
          setError('文件解析失败，请确认文件内容正确')
          setTimeout(() => setError(''), 3000)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleExport}
        className="text-xs bg-white border border-gray-200 text-gray-600 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
      >
        导出备份
      </button>
      <button
        onClick={handleImport}
        className="text-xs bg-white border border-gray-200 text-gray-600 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
      >
        导入备份
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
