import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyMaps, fetchBookmarkedMaps, fetchFollowedGuides, fetchUserProfile } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { MapSummary, Guide, UserProfile } from '../types'

const COVER_COLORS = [
  'bg-[#9FE1CB]', 'bg-[#FAC775]', 'bg-[#F5C4B3]',
  'bg-[#CECBF6]', 'bg-[#C0DD97]', 'bg-[#E1F5EE]',
]
function coverColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return COVER_COLORS[n % COVER_COLORS.length]
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [myMaps, setMyMaps] = useState<MapSummary[]>([])
  const [bookmarked, setBookmarked] = useState<MapSummary[]>([])
  const [following, setFollowing] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchUserProfile(user.id),
      fetchMyMaps(user.id),
      fetchBookmarkedMaps(user.id),
      fetchFollowedGuides(user.id),
    ]).then(([prof, maps, saved, guides]) => {
      setProfile(prof)
      setMyMaps(maps)
      setBookmarked(saved)
      setFollowing(guides)
    }).finally(() => setLoading(false))
  }, [user])

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'ユーザー'
  const avatarInitials = displayName.slice(0, 2)

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">読み込み中...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Profile header */}
        <div className="bg-[#E1F5EE] px-4 pt-5 pb-4 text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#9FE1CB] text-[#085041] flex items-center justify-center text-lg font-medium mx-auto mb-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
            ) : (
              avatarInitials
            )}
          </div>
          <p className="text-[15px] font-medium text-[#085041] mb-0.5">{displayName}</p>
          {profile?.bio && <p className="text-[10px] text-[#0F6E56] mb-2">{profile.bio}</p>}

          <div className="flex justify-center gap-6 mb-3">
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#085041]">{myMaps.length}</p>
              <p className="text-[9px] text-[#0F6E56]">マイマップ</p>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#085041]">{bookmarked.length}</p>
              <p className="text-[9px] text-[#0F6E56]">本棚</p>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#085041]">{following.length}</p>
              <p className="text-[9px] text-[#0F6E56]">案内人</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400">{user?.email}</p>
        </div>

        {/* マイ本棚 */}
        <section className="mt-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <h2 className="text-[10px] font-medium text-gray-500 tracking-wide uppercase">マイ本棚</h2>
            <button onClick={() => navigate('/shelf')} className="text-[10px] text-[#0F6E56]">すべて見る</button>
          </div>
          {bookmarked.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-gray-400">まだ保存したマップがありません</p>
          ) : (
            <div className="flex gap-2.5 px-3 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {bookmarked.slice(0, 8).map(map => (
                <div
                  key={map.id}
                  onClick={() => navigate(`/maps/${map.id}`)}
                  className="w-20 flex-shrink-0 cursor-pointer"
                >
                  <div className={`h-14 rounded-lg mb-1 ${map.cover_url ? '' : coverColor(map.id)}`}>
                    {map.cover_url && (
                      <img src={map.cover_url} alt={map.title} className="w-full h-full rounded-lg object-cover" />
                    )}
                  </div>
                  <p className="text-[9px] text-gray-700 line-clamp-2 leading-snug">{map.title}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-gray-100 mx-3" />

        {/* 推し案内人 */}
        <section className="mt-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <h2 className="text-[10px] font-medium text-gray-500 tracking-wide uppercase">推し案内人</h2>
          </div>
          {following.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-gray-400">フォロー中の案内人はいません</p>
          ) : (
            <div>
              {following.map(guide => (
                <div key={guide.user_id} className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${coverColor(guide.user_id)} text-[#085041]`}>
                    {guide.avatar_url
                      ? <img src={guide.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                      : guide.display_name.slice(0, 2)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800">{guide.display_name}</p>
                    {guide.bio && <p className="text-[9px] text-gray-400 truncate">{guide.bio}</p>}
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{guide.map_count}マップ</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-gray-100 mx-3" />

        {/* マイマップ */}
        <section className="mt-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <h2 className="text-[10px] font-medium text-gray-500 tracking-wide uppercase">マイマップ</h2>
          </div>
          {myMaps.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-gray-400">まだマップを作っていません</p>
          ) : (
            <div>
              {myMaps.map(map => (
                <div
                  key={map.id}
                  onClick={() => navigate(`/maps/${map.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 cursor-pointer active:bg-gray-50"
                >
                  <div className={`w-12 h-12 rounded-lg flex-shrink-0 ${map.cover_url ? '' : coverColor(map.id)}`}>
                    {map.cover_url && (
                      <img src={map.cover_url} alt={map.title} className="w-full h-full rounded-lg object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{map.title}</p>
                    <p className="text-[9px] text-gray-400">
                      {map.pin_count}スポット · {map.is_public ? '公開' : '非公開'}
                    </p>
                  </div>
                  <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-gray-300 shrink-0">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 新規作成ボタン */}
        <div className="px-3 py-4">
          <button
            onClick={() => navigate('/create')}
            className="w-full py-3 rounded-xl bg-[#1D9E75] text-white text-[13px] font-medium"
          >
            新しいガイドマップを作る
          </button>
        </div>

        {/* ログアウト */}
        <div className="px-3 pb-6 text-center">
          <button
            onClick={signOut}
            className="text-[12px] text-gray-400 hover:text-gray-600"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}
