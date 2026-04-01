import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicMaps, fetchGuides, toggleFollow, checkFollow } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { MapSummary, Guide } from '../types'

type Tab = 'all' | 'area' | 'genre' | 'guide'

const COVER_COLORS = [
  'bg-[#9FE1CB]', 'bg-[#FAC775]', 'bg-[#F5C4B3]',
  'bg-[#CECBF6]', 'bg-[#C0DD97]', 'bg-[#E1F5EE]',
]

function coverColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return COVER_COLORS[n % COVER_COLORS.length]
}

function authorInitials(name: string) {
  return name?.slice(0, 2) ?? '??'
}

// ── Horizontal card (注目マップ) ─────────────────────────────────────────────
function HCard({ map, onClick }: { map: MapSummary; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="w-36 flex-shrink-0 rounded-xl border border-gray-100 overflow-hidden bg-white cursor-pointer shadow-sm active:opacity-80"
    >
      <div className={`h-[84px] relative ${map.cover_url ? '' : coverColor(map.id)}`}>
        {map.cover_url && (
          <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
        )}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
        >
          <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
            <path d="M7 12S1 8.5 1 4.5A3 3 0 017 3a3 3 0 016 1.5C13 8.5 7 12 7 12z" stroke="#A32D2D" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <div className="p-2">
        <p className="text-[11px] font-medium text-gray-800 leading-snug line-clamp-2 mb-1">{map.title}</p>
        <div className="flex items-center gap-1">
          <div
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0 ${coverColor(map.id)} text-[#085041]`}
          >
            {authorInitials(map.author_name)}
          </div>
          <span className="text-[9px] text-gray-400 truncate">{map.author_name}</span>
        </div>
      </div>
    </div>
  )
}

// ── Vertical card (新着マップ) ────────────────────────────────────────────────
function VCard({ map, onClick }: { map: MapSummary; onClick: () => void }) {
  const tag = map.tags[0]
  return (
    <div
      onClick={onClick}
      className="mx-3 mb-2.5 rounded-xl border border-gray-100 overflow-hidden bg-white flex cursor-pointer active:opacity-80"
    >
      <div className={`w-[74px] flex-shrink-0 ${map.cover_url ? '' : coverColor(map.id)}`}>
        {map.cover_url && (
          <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-2.5 flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-800 mb-0.5 line-clamp-2 leading-snug">{map.title}</p>
        <p className="text-[9px] text-gray-400 mb-1.5">
          {map.author_name} · {map.pin_count}スポット
        </p>
        {tag && (
          <span className="text-[9px] px-2 py-0.5 rounded-lg bg-[#E1F5EE] text-[#085041]">{tag}</span>
        )}
      </div>
    </div>
  )
}

// ── Area tab ──────────────────────────────────────────────────────────────────
const AREA_COLORS = ['#085041', '#1D9E75', '#0F6E56', '#5DCAA5', '#854F0B', '#BA7517']

function AreaTab({ maps, onSelect }: { maps: MapSummary[]; onSelect: (area: string) => void }) {
  const areas = useMemo(() => {
    const counts: Record<string, number> = {}
    maps.forEach(m => {
      if (m.area) counts[m.area] = (counts[m.area] ?? 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [maps])

  if (areas.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        エリアデータがありません
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {areas.map(([area, count], i) => (
        <div
          key={area}
          onClick={() => onSelect(area)}
          className="rounded-xl h-16 flex flex-col justify-end p-2.5 cursor-pointer active:opacity-80"
          style={{ background: AREA_COLORS[i % AREA_COLORS.length] }}
        >
          <p className="text-white text-[12px] font-medium">{area}</p>
          <p className="text-white/80 text-[9px]">{count}マップ</p>
        </div>
      ))}
    </div>
  )
}

// ── Genre tab ─────────────────────────────────────────────────────────────────
function GenreTab({ maps, onSelect }: { maps: MapSummary[]; onSelect: (tag: string) => void }) {
  const genres = useMemo(() => {
    const counts: Record<string, number> = {}
    maps.forEach(m => m.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [maps])

  if (genres.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        ジャンルデータがありません
      </div>
    )
  }

  return (
    <div>
      {genres.map(([tag, count]) => (
        <div
          key={tag}
          onClick={() => onSelect(tag)}
          className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
            <span className="text-base">🏷</span>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-800">{tag}</p>
            <p className="text-[9px] text-gray-400">{count}マップ</p>
          </div>
          <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-gray-300">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ── Guide tab ─────────────────────────────────────────────────────────────────
function GuideTab({ guides, userId }: { guides: Guide[]; userId: string }) {
  const [following, setFollowing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!guides.length) return
    Promise.all(
      guides.map(g => checkFollow(userId, g.user_id).then(v => [g.user_id, v] as [string, boolean]))
    ).then(results => {
      setFollowing(Object.fromEntries(results))
    })
  }, [guides, userId])

  const handleFollow = async (guideId: string) => {
    const next = await toggleFollow(userId, guideId)
    setFollowing(prev => ({ ...prev, [guideId]: next }))
  }

  if (guides.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        案内人がいません
      </div>
    )
  }

  return (
    <div>
      {guides.map(guide => {
        const isFollowing = following[guide.user_id]
        return (
          <div key={guide.user_id} className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
            {guide.avatar_url ? (
              <img src={guide.avatar_url} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" alt="" />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0 ${coverColor(guide.user_id)} text-[#085041]`}>
                {authorInitials(guide.display_name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-800">{guide.display_name}</p>
              {guide.bio && <p className="text-[9px] text-gray-400 truncate">{guide.bio}</p>}
              <p className="text-[9px] text-gray-400">
                {guide.map_count}マップ · {guide.follower_count}フォロワー
              </p>
            </div>
            <button
              onClick={() => handleFollow(guide.user_id)}
              className={`text-[9px] font-medium px-3 py-1 rounded-full border transition-colors ${
                isFollowing
                  ? 'border-gray-200 text-gray-400 bg-transparent'
                  : 'border-[#5DCAA5] bg-[#E1F5EE] text-[#085041]'
              }`}
            >
              {isFollowing ? 'フォロー中' : 'フォロー'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [maps, setMaps] = useState<MapSummary[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [activeTag, setActiveTag] = useState('すべて')
  const [areaFilter, setAreaFilter] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchPublicMaps(), fetchGuides()])
      .then(([m, g]) => { setMaps(m); setGuides(g) })
      .finally(() => setLoading(false))
  }, [])

  const allTags = useMemo(() => {
    const s = new Set<string>()
    maps.forEach(m => m.tags.forEach(t => s.add(t)))
    return ['すべて', ...Array.from(s)]
  }, [maps])

  const filtered = useMemo(() => {
    let list = maps
    if (search.trim()) {
      const q = search.trim()
      list = list.filter(
        m => m.title.includes(q) || m.area?.includes(q) || m.author_name?.includes(q) || m.tags.some(t => t.includes(q))
      )
    }
    if (areaFilter) {
      list = list.filter(m => m.area === areaFilter)
    }
    if (activeTag !== 'すべて') {
      list = list.filter(m => m.tags.includes(activeTag))
    }
    return list
  }, [maps, search, activeTag, areaFilter])

  const featured = filtered.slice(0, 6)
  const recent = filtered

  const handleAreaSelect = (area: string) => {
    setAreaFilter(area)
    setTab('all')
  }

  const handleGenreSelect = (tag: string) => {
    setActiveTag(tag)
    setTab('all')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hero / search */}
      <div className="bg-[#E1F5EE] px-4 pt-4 pb-3 shrink-0">
        <h1 className="text-[17px] font-medium text-[#085041] mb-2.5">旅先案内人をさがす</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-gray-400 shrink-0">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="エリア・テーマ・案内人を検索"
            value={search}
            onChange={e => { setSearch(e.target.value); setAreaFilter(null) }}
            className="flex-1 text-[12px] bg-transparent outline-none placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-xs shrink-0">✕</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white shrink-0">
        {(['all', 'area', 'genre', 'guide'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setAreaFilter(null) }}
            className={`flex-1 py-2.5 text-[10px] font-medium border-b-2 transition-colors ${
              tab === t ? 'text-[#0F6E56] border-[#1D9E75]' : 'text-gray-400 border-transparent'
            }`}
          >
            {t === 'all' ? 'すべて' : t === 'area' ? 'エリア' : t === 'genre' ? 'ジャンル' : '案内人'}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">読み込み中...</div>
        ) : (
          <>
            {/* ── すべてタブ ── */}
            {tab === 'all' && (
              <>
                {/* Filter pills */}
                <div className="flex gap-2 px-3 py-2.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                  {(areaFilter ? [`エリア: ${areaFilter}`, ...allTags] : allTags).map(tag => {
                    if (tag.startsWith('エリア:')) {
                      return (
                        <button
                          key="area-filter"
                          onClick={() => setAreaFilter(null)}
                          className="whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium border shrink-0 bg-[#085041] border-[#085041] text-white"
                        >
                          {tag} ✕
                        </button>
                      )
                    }
                    const active = activeTag === tag
                    return (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium border shrink-0 transition-colors ${
                          active
                            ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041]'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-gray-400">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="text-sm">マップが見つかりません</p>
                  </div>
                ) : (
                  <>
                    {/* 注目マップ */}
                    <div>
                      <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
                        <h2 className="text-[11px] font-medium text-gray-800">今週の注目マップ</h2>
                        <span className="text-[10px] text-[#0F6E56]">すべて見る</span>
                      </div>
                      <div className="flex gap-2.5 px-3 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {featured.map(map => (
                          <HCard key={map.id} map={map} onClick={() => navigate(`/maps/${map.id}`)} />
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 mx-3" />

                    {/* 新着マップ */}
                    <div className="pt-2.5">
                      <div className="flex items-center justify-between px-3 pb-1.5">
                        <h2 className="text-[11px] font-medium text-gray-800">新着マップ</h2>
                        <span className="text-[10px] text-[#0F6E56]">すべて見る</span>
                      </div>
                      {recent.map(map => (
                        <VCard key={map.id} map={map} onClick={() => navigate(`/maps/${map.id}`)} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── エリアタブ ── */}
            {tab === 'area' && <AreaTab maps={maps} onSelect={handleAreaSelect} />}

            {/* ── ジャンルタブ ── */}
            {tab === 'genre' && <GenreTab maps={maps} onSelect={handleGenreSelect} />}

            {/* ── 案内人タブ ── */}
            {tab === 'guide' && user && <GuideTab guides={guides} userId={user.id} />}
          </>
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
