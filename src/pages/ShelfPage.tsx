import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBookmarkedMaps, fetchMyMaps, fetchFollowedGuides } from '../lib/api'
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

const SPOT_BG = ['#9FE1CB', '#FAC775', '#F5C4B3', '#CECBF6', '#C0DD97', '#B5D9F8']
function spotBg(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return SPOT_BG[n % SPOT_BG.length]
}

export default function ShelfPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState<MapSummary[]>([])
  const [myMaps, setMyMaps] = useState<MapSummary[]>([])
  const [following, setFollowing] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchBookmarkedMaps(user.id),
      fetchMyMaps(user.id),
      fetchFollowedGuides(user.id),
    ]).then(([saved, maps, guides]) => {
      setBookmarked(saved)
      setMyMaps(maps)
      setFollowing(guides)
    }).finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">読み込み中...</div>
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* マイ本棚 */}
      <section className="pt-4">
        <h2 className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pb-2">マイ本棚</h2>
        {bookmarked.length === 0 ? (
          <p className="px-4 pb-4 text-[11px] text-gray-400">まだ保存したマップがありません</p>
        ) : (
          <div className="flex gap-2.5 px-4 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {bookmarked.map(map => (
              <div
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="w-[90px] flex-shrink-0 cursor-pointer"
              >
                <div
                  className={`h-[60px] rounded-lg mb-1.5 overflow-hidden ${map.cover_url ? '' : coverColor(map.id)}`}
                  style={map.cover_url ? {} : { background: spotBg(map.id) }}
                >
                  {map.cover_url && (
                    <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-[10px] text-gray-700 line-clamp-2 leading-snug">{map.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-px bg-gray-100 mx-4" />

      {/* 推し案内人 */}
      <section className="pt-3">
        <h2 className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pb-2">推し案内人</h2>
        {following.length === 0 ? (
          <p className="px-4 pb-4 text-[11px] text-gray-400">フォロー中の案内人はいません</p>
        ) : (
          <div>
            {following.map(guide => (
              <div key={guide.user_id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 overflow-hidden text-[#085041] ${coverColor(guide.user_id)}`}
                >
                  {guide.avatar_url
                    ? <img src={guide.avatar_url} className="w-full h-full object-cover" alt="" />
                    : guide.display_name.slice(0, 2)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-gray-800">{guide.display_name}</p>
                  {guide.bio && <p className="text-[9px] text-gray-400 truncate">{guide.bio}</p>}
                </div>
                <span className="text-[9px] px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#085041] shrink-0">フォロー中</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-px bg-gray-100 mx-4 mt-1" />

      {/* マイマップ */}
      <section className="pt-3">
        <h2 className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pb-2">マイマップ</h2>
        {myMaps.length === 0 ? (
          <p className="px-4 pb-4 text-[11px] text-gray-400">まだマップを作っていません</p>
        ) : (
          myMaps.map(map => (
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
                    {map.author_name?.slice(0, 2) ?? 'ME'}
                  </div>
                  <span className="text-white text-[10px] font-medium drop-shadow">{map.author_name}</span>
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
                  {!map.is_public && <span className="text-[9px] text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded-full">非公開</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* 新規作成ボタン */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate('/create')}
          className="w-full py-3 rounded-xl bg-[#1D9E75] text-white text-[13px] font-medium"
        >
          新しいガイドマップを作る
        </button>
      </div>
      <div className="h-2" />
    </div>
  )
}
