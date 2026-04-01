import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  fetchMapDetail, fetchPins, createPin, deletePin,
  checkBookmark, toggleBookmark, checkFollow, toggleFollow,
} from '../lib/api'
import LeafletMap from '../components/LeafletMap'
import type { MapSummary, Pin } from '../types'

type PinForm = { title: string; description: string; lat: number; lng: number } | null

const SPOT_COLORS = ['#9FE1CB', '#FAC775', '#F5C4B3', '#CECBF6', '#C0DD97', '#B5D9F8']

export default function MapDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [map, setMap] = useState<MapSummary | null>(null)
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pinForm, setPinForm] = useState<PinForm>(null)
  const [saving, setSaving] = useState(false)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)

  const [bookmarked, setBookmarked] = useState(false)
  const [following, setFollowing] = useState(false)

  const isOwner = user?.id === map?.user_id

  useEffect(() => {
    if (!id) return
    Promise.all([fetchMapDetail(id), fetchPins(id)])
      .then(([mapData, pinsData]) => { setMap(mapData); setPins(pinsData) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id || !map) return
    checkBookmark(user.id, id).then(setBookmarked)
    if (!isOwner) checkFollow(user.id, map.user_id).then(setFollowing)
  }, [user, id, map, isOwner])

  const handleMapClick = (lat: number, lng: number) => {
    if (!isOwner) return
    setSelectedPin(null)
    setPinForm({ title: '', description: '', lat, lng })
  }

  const handleSavePin = async () => {
    if (!pinForm || !user || !id) return
    setSaving(true)
    try {
      const newPin = await createPin(user.id, id, pinForm)
      setPins(prev => [...prev, newPin])
      setPinForm(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePin = async (pin: Pin) => {
    if (!confirm(`「${pin.title}」を削除しますか？`)) return
    try {
      await deletePin(pin.id)
      setPins(prev => prev.filter(p => p.id !== pin.id))
      setSelectedPin(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleToggleBookmark = async () => {
    if (!user || !id) return
    const result = await toggleBookmark(user.id, id)
    setBookmarked(result)
  }

  const handleToggleFollow = async () => {
    if (!user || !map) return
    const result = await toggleFollow(user.id, map.user_id)
    setFollowing(result)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-[#E1F5EE] px-4 pt-4 pb-3 shrink-0">
        <button
          onClick={() => navigate(-1 as never)}
          className="text-[#0F6E56] text-[12px] mb-2 flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          もどる
        </button>
        <h1 className="text-[17px] font-medium text-[#085041] mb-0.5 leading-snug">{map?.title}</h1>
        <p className="text-[11px] text-[#0F6E56] mb-2">
          by {map?.author_name} · {pins.length}スポット
        </p>
        {map?.tags && map.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {map.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#085041]">{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* 地図エリア（固定高さ） */}
      <div className="h-52 shrink-0 relative">
        <LeafletMap
          pins={pins}
          onMapClick={isOwner ? handleMapClick : undefined}
          onPinClick={setSelectedPin}
          readonly={!isOwner}
        />

        {/* タップ位置インジケーター */}
        {pinForm && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1 rounded-full pointer-events-none z-[500]">
            📍 {pinForm.lat.toFixed(4)}, {pinForm.lng.toFixed(4)}
          </div>
        )}

        {/* オーナー向けヒント */}
        {isOwner && !pinForm && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow pointer-events-none">
            地図をタップしてピンを追加
          </div>
        )}
      </div>

      {/* スポット一覧（スクロール可能） */}
      <div className="flex-1 overflow-y-auto pb-20">
        <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pt-3 pb-2">スポット一覧</p>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <p className="text-3xl mb-3">📍</p>
            <p className="text-sm">{isOwner ? '地図をタップしてスポットを追加しよう' : 'スポットがありません'}</p>
          </div>
        ) : (
          pins.map((pin, i) => (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin === selectedPin ? null : pin)}
              className="mx-4 mb-3 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer active:opacity-80"
            >
              {/* ヘッダー */}
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-6 h-6 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[11px] font-medium text-[#085041] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800">{pin.title}</p>
                  {pin.category && <p className="text-[10px] text-gray-400">{pin.category}</p>}
                </div>
              </div>

              {/* カラーサムネイル */}
              <div
                className="h-[72px] w-full"
                style={{ background: SPOT_COLORS[i % SPOT_COLORS.length] }}
              />

              {/* 説明 */}
              {pin.description && (
                <p className="px-3 py-2 text-[11px] text-gray-500 leading-relaxed">{pin.description}</p>
              )}

              {/* アクセスメモ */}
              {pin.access_note && (
                <div className="mx-3 mb-3 p-2.5 rounded-lg bg-gray-50 text-[10px] text-gray-500">
                  <span className="font-medium text-gray-600">アクセス </span>{pin.access_note}
                </div>
              )}

              {/* オーナー向け削除ボタン */}
              {isOwner && selectedPin?.id === pin.id && (
                <div className="px-3 pb-3">
                  <button
                    onClick={e => { e.stopPropagation(); handleDeletePin(pin) }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    削除する
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 下部アクションバー（非オーナー） */}
      {!isOwner && user && (
        <div className="fixed inset-x-0 bottom-0 z-[100] bg-white border-t border-gray-100 px-4 py-3 flex gap-3 pb-safe">
          <button
            onClick={handleToggleBookmark}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-colors ${
              bookmarked
                ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#085041]'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            {bookmarked ? '✓ 本棚に保存済み' : '本棚に追加'}
          </button>
          <button
            onClick={handleToggleFollow}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-colors ${
              following
                ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#085041]'
                : 'border-none bg-[#1D9E75] text-white'
            }`}
          >
            {following ? 'フォロー中' : '案内人をフォロー'}
          </button>
        </div>
      )}

      {/* ピン追加フォーム（オーナー） */}
      {pinForm && (
        <div className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-2xl shadow-2xl p-4 pb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">スポットを追加</p>
            <button onClick={() => setPinForm(null)} className="text-gray-400 text-sm">✕</button>
          </div>
          <input
            type="text"
            placeholder="スポット名 *"
            value={pinForm.title}
            onChange={e => setPinForm(f => f ? { ...f, title: e.target.value } : f)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
          />
          <textarea
            placeholder="メモ（任意）"
            value={pinForm.description}
            onChange={e => setPinForm(f => f ? { ...f, description: e.target.value } : f)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setPinForm(null)}
              className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-300 rounded-xl"
            >
              キャンセル
            </button>
            <button
              onClick={handleSavePin}
              disabled={saving || !pinForm.title.trim()}
              className="flex-1 py-2.5 text-sm text-white bg-[#1D9E75] rounded-xl disabled:opacity-50"
            >
              {saving ? '保存中...' : '追加する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
