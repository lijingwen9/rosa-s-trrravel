import { useState } from 'react'

interface ModalProps {
  title: string
  isLit: boolean
  note: string
  readOnly?: boolean
  litCities?: string[]
  onClose: () => void
  onToggle: (note: string) => void
}

export default function Modal({ title, isLit, note: initialNote, readOnly, litCities, onClose, onToggle }: ModalProps) {
  const [note, setNote] = useState(initialNote)

  return (
    <div className="modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {isLit && (
          <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-500 mb-1">已点亮</p>
            {initialNote && <p className="text-sm text-gray-600">{initialNote}</p>}
          </div>
        )}

        {!isLit && readOnly && (
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">未点亮</p>
          </div>
        )}

        {readOnly && litCities && litCities.length > 0 && (
          <div className="mb-3 px-3 py-2 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-500 mb-1.5">已点亮的城市</p>
            <div className="flex flex-wrap gap-1.5">
              {litCities.map(city => (
                <span key={city} className="text-xs bg-white border border-orange-200 text-orange-600 rounded px-2 py-0.5">
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {readOnly ? null : (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">备注</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="记录一些旅行回忆..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none h-20"
              />
            </div>

            <div className="flex gap-2">
              {isLit ? (
                <>
                  <button
                    onClick={() => onToggle(note)}
                    className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消点亮
                  </button>
                  <button
                    onClick={() => { onToggle(note); onClose() }}
                    className="flex-1 bg-blue-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    更新备注
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onToggle(note)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md"
                >
                  点亮
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
