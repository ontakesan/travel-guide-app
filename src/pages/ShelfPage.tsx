import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBookmarkedMaps, toggleBookmark } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { MapSummary } from '../types'

const COVER_COLORS = [
  'bg-[#9FE1CB]', 'bg-[#FAC775]', 'bg-[#F5C4B3]',
  'bg-[#CECBF6]', 'bg-[#C0DD97]', 'bg-[#E1F5EE]',
]
function coverColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return COVER_COLORS[n % COVER_COLORS.length]
}

export default function ShelfPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [maps, setMaps] = useState<MapSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchBookmarkedMaps(user.id)
      .then(setMaps)
      .finally(() => setLoading(false))
  }, [user])

  const handleRemove = async (mapId: string) => {
    if (!user) return
    await toggleBookmark(user.id, mapId)
    setMaps(prev => prev.filter(m => m.id !== mapId))
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <h1 className="text-[15px] font-medium text-gray-800">マイ本棚</h1>
        <p className="text-[10px] text-gray-400">保存したガイドマップ</p>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">読み込み中...</div>
        ) : maps.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-sm font-medium text-gray-500 mb-1">本棚はまだ空です</p>
            <p className="text-xs text-gray-400 text-center px-8">
              気に入ったガイドマップのハートをタップして保存しましょう
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-5 px-5 py-2 rounded-full bg-[#1D9E75] text-white text-sm font-medium"
            >
              マップをさがす
            </button>
          </div>
        ) : (
          <>
            <p className="px-3 py-2.5 text-[10px] text-gray-400">{maps.length}件のマップ</p>
            <div className="grid grid-cols-2 gap-3 px-3 pb-4">
              {maps.map(map => (
                <div key={map.id} className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                  <div
                    onClick={() => navigate(`/maps/${map.id}`)}
                    className={`h-[90px] relative cursor-pointer ${map.cover_url ? '' : coverColor(map.id)}`}
                  >
                    {map.cover_url && (
                      <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(map.id) }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 14 14" fill="#E24B4A" className="w-3 h-3">
                        <path d="M7 12S1 8.5 1 4.5A3 3 0 017 3a3 3 0 016 1.5C13 8.5 7 12 7 12z" stroke="#A32D2D" strokeWidth="1.2" />
                      </svg>
                    </button>
                  </div>
                  <div
                    className="p-2 cursor-pointer"
                    onClick={() => navigate(`/maps/${map.id}`)}
                  >
                    <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug mb-1">{map.title}</p>
                    <p className="text-[9px] text-gray-400">{map.author_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
