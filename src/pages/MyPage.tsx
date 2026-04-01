import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchGuideProfile, fetchMyMaps } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { MapSummary, Guide } from '../types'

const COVER_COLORS = [
  'bg-[#9FE1CB]', 'bg-[#FAC775]', 'bg-[#F5C4B3]',
  'bg-[#CECBF6]', 'bg-[#C0DD97]', 'bg-[#B5D9F8]',
]
function coverColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return COVER_COLORS[n % COVER_COLORS.length]
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [myMaps, setMyMaps] = useState<MapSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchGuideProfile(user.id),
      fetchMyMaps(user.id),
    ]).then(([g, maps]) => {
      setGuide(g)
      setMyMaps(maps)
    }).finally(() => setLoading(false))
  }, [user])

  const displayName = guide?.display_name ?? user?.email?.split('@')[0] ?? 'ユーザー'
  const totalSpots = myMaps.reduce((acc, m) => acc + m.pin_count, 0)

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">読み込み中...</div>
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* プロフィールヘッダー */}
      <div className="bg-[#E1F5EE] px-4 pt-6 pb-5 flex flex-col items-center text-center shrink-0">
        <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl font-medium mb-2 overflow-hidden ${guide?.avatar_url ? '' : 'bg-[#9FE1CB] text-[#085041]'}`}>
          {guide?.avatar_url
            ? <img src={guide.avatar_url} className="w-full h-full object-cover" alt="" />
            : displayName.slice(0, 2)
          }
        </div>
        <p className="text-[16px] font-medium text-[#085041] mb-1">{displayName}</p>
        {guide?.bio && <p className="text-[11px] text-[#0F6E56] mb-2">{guide.bio}</p>}

        <div className="flex gap-6 mt-1 mb-3">
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#085041]">{guide?.map_count ?? myMaps.length}</p>
            <p className="text-[9px] text-[#0F6E56]">マップ</p>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#085041]">{guide?.follower_count ?? 0}</p>
            <p className="text-[9px] text-[#0F6E56]">フォロワー</p>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#085041]">{totalSpots}</p>
            <p className="text-[9px] text-[#0F6E56]">スポット</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-5 py-1.5 border border-[#0F6E56] rounded-full text-[11px] font-medium text-[#0F6E56]"
        >
          ログアウト
        </button>
      </div>

      {/* 公開マップ */}
      <div className="flex-1">
        <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pt-4 pb-2">公開マップ</p>
        {myMaps.filter(m => m.is_public).length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-sm">公開マップがありません</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-5 py-2 rounded-full bg-[#1D9E75] text-white text-sm font-medium"
            >
              マップを作る
            </button>
          </div>
        ) : (
          myMaps.filter(m => m.is_public).map(map => (
            <div
              key={map.id}
              onClick={() => navigate(`/maps/${map.id}`)}
              className="mx-4 mb-3 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 cursor-pointer active:opacity-80"
            >
              <div className={`h-28 relative ${map.cover_url ? '' : coverColor(map.id)}`}>
                {map.cover_url && (
                  <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-[#085041] ${coverColor(map.id)} border border-white/60`}>
                    {displayName.slice(0, 2)}
                  </div>
                  <span className="text-white text-[10px] font-medium drop-shadow">{displayName}</span>
                  {map.area && <span className="ml-auto text-white/80 text-[9px] drop-shadow">📍 {map.area}</span>}
                </div>
              </div>
              <div className="px-3 pt-2 pb-2.5">
                <h3 className="text-[13px] font-bold text-gray-800 mb-1 line-clamp-2 leading-snug">{map.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {map.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">{tag}</span>
                  ))}
                  <span className="ml-auto text-[10px] text-gray-400">{map.pin_count}スポット</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
