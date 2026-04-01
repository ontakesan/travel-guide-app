import { useNavigate } from 'react-router-dom'
import type { MapSummary } from '../types'

type Props = {
  map: MapSummary
}

export default function MapCard({ map }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/maps/${map.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* カバー画像 */}
      <div className="h-36 bg-gradient-to-br from-sky-100 to-blue-200 relative">
        {map.cover_url && (
          <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
        )}
        {map.area && (
          <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full">
            📍 {map.area}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-1 line-clamp-2">
          {map.title}
        </h3>
        {map.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{map.description}</p>
        )}

        {/* タグ */}
        {map.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {map.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            {map.author_avatar ? (
              <img src={map.author_avatar} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px]">
                {map.author_name?.[0] ?? '?'}
              </div>
            )}
            <span>{map.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📌 {map.pin_count}</span>
            <span>🔖 {map.bookmark_count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
