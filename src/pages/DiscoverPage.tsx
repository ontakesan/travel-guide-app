import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicMaps } from '../lib/api'
import type { MapSummary } from '../types'

const COVER_COLORS = [
  'bg-[#9FE1CB]', 'bg-[#FAC775]', 'bg-[#F5C4B3]',
  'bg-[#CECBF6]', 'bg-[#C0DD97]', 'bg-[#B5D9F8]',
]

function coverColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return COVER_COLORS[n % COVER_COLORS.length]
}

function MapCard({ map, onClick }: { map: MapSummary; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="mx-4 mb-4 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 cursor-pointer active:opacity-80"
    >
      {/* Cover image */}
      <div className={`h-44 relative ${map.cover_url ? '' : coverColor(map.id)}`}>
        {map.cover_url && (
          <img src={map.cover_url} alt={map.title} className="w-full h-full object-cover" />
        )}
        {/* Author overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent flex items-center gap-2">
          {map.author_avatar ? (
            <img src={map.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-white/60" />
          ) : (
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-[#085041] ${coverColor(map.id)} border border-white/60`}>
              {map.author_name?.slice(0, 2) ?? '??'}
            </div>
          )}
          <span className="text-white text-[11px] font-medium drop-shadow">{map.author_name}</span>
          {map.area && (
            <span className="ml-auto text-white/80 text-[10px] drop-shadow">📍 {map.area}</span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-3 pt-2.5 pb-3">
        <h3 className="text-[14px] font-bold text-gray-800 mb-1.5 line-clamp-2 leading-snug">
          {map.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {map.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">
              {tag}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-gray-400">{map.pin_count}スポット</span>
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [maps, setMaps] = useState<MapSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('すべて')

  useEffect(() => {
    fetchPublicMaps()
      .then(setMaps)
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
    if (activeTag !== 'すべて') {
      list = list.filter(m => m.tags.includes(activeTag))
    }
    return list
  }, [maps, search, activeTag])

  return (
    <div className="flex flex-col h-full">
      {/* Hero header */}
      <div className="bg-[#E1F5EE] px-4 pt-5 pb-4 shrink-0">
        <h1 className="text-[20px] font-bold text-[#085041] leading-tight mb-0.5">
          あなただけの<br />旅先案内人を見つけよう
        </h1>
        <p className="text-[11px] text-[#0F6E56] mb-3">マニアックな視点で旅が変わる</p>

        {/* Search bar — dark style */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-2.5">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-gray-400 shrink-0">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="エリア・テーマ・案内人を検索"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveTag('すべて') }}
            className="flex-1 text-[12px] bg-transparent outline-none placeholder:text-gray-500 text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-xs shrink-0">✕</button>
          )}
        </div>
      </div>

      {/* Tag filter pills */}
      <div className="shrink-0 bg-white border-b border-gray-100">
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {allTags.map(tag => {
            const active = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-medium border shrink-0 transition-colors ${
                  active
                    ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-sm">マップが見つかりません</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-[13px] font-bold text-gray-800">人気のガイドマップ</h2>
              <span className="text-[11px] text-[#0F6E56]">{filtered.length}件</span>
            </div>
            {filtered.map(map => (
              <MapCard key={map.id} map={map} onClick={() => navigate(`/maps/${map.id}`)} />
            ))}
            <div className="h-4" />
          </>
        )}
      </div>
    </div>
  )
}
