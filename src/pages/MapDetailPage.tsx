import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  fetchMapDetail, fetchPins, deletePin,
  checkBookmark, toggleBookmark, checkFollow, toggleFollow,
} from '../lib/api'
import LeafletMap from '../components/LeafletMap'
import type { MapSummary, Pin } from '../types'

const SPOT_COLORS = ['#9FE1CB', '#FAC775', '#F5C4B3', '#CECBF6', '#C0DD97', '#B5D9F8']

export default function MapDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [map, setMap] = useState<MapSummary | null>(null)
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ピン配置モード
  const [placingMode, setPlacingMode] = useState(false)
  // タップした仮の場所
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null)
  // マップ上のピンをタップした時の情報シート
  const [pinInfoPin, setPinInfoPin] = useState<Pin | null>(null)
  // スポット一覧での選択（削除用）
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

  // 「続けてピンを追加する」から戻ってきた場合、配置モードに入る
  useEffect(() => {
    if (location.state && (location.state as { addingPin?: boolean }).addingPin) {
      setPlacingMode(true)
    }
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    if (!isOwner || !placingMode) return
    setPendingLocation({ lat, lng })
    setPlacingMode(false)
  }

  const handleConfirmLocation = () => {
    if (!pendingLocation || !id) return
    navigate(`/maps/${id}/pin/new`, { state: pendingLocation })
    setPendingLocation(null)
  }

  const handleDeletePin = async (pin: Pin) => {
    if (!confirm(`「${pin.title}」を削除しますか？`)) return
    try {
      await deletePin(pin.id)
      setPins(prev => prev.filter(p => p.id !== pin.id))
      setSelectedPin(null)
      setPinInfoPin(null)
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
          onPinClick={pin => { setPinInfoPin(pin); setSelectedPin(null) }}
          readonly={!isOwner}
          placingMode={placingMode}
        />

        {/* 配置モード中のヒント */}
        {placingMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#085041] text-[#E1F5EE] text-[11px] px-3.5 py-1.5 rounded-full pointer-events-none z-[500] whitespace-nowrap">
            地図をタップしてピンを置く
          </div>
        )}

        {/* オーナー向けFABボタン */}
        {isOwner && !placingMode && !pendingLocation && (
          <button
            onClick={() => { setPlacingMode(true); setPinInfoPin(null); setSelectedPin(null) }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] bg-[#1D9E75] text-white text-[13px] font-medium px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 active:bg-[#085041] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.5"/>
              <line x1="8" y1="5" x2="8" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="5" y1="8" x2="11" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            ピンを追加
          </button>
        )}

        {/* 配置モード中のキャンセル */}
        {placingMode && (
          <button
            onClick={() => setPlacingMode(false)}
            className="absolute bottom-3 right-3 z-[500] bg-white/90 text-gray-500 text-[11px] px-3 py-1.5 rounded-full shadow border border-gray-200 active:bg-gray-100"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* スポット一覧（スクロール可能） */}
      <div className="flex-1 overflow-y-auto pb-20">
        <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase px-4 pt-3 pb-2">スポット一覧</p>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <p className="text-3xl mb-3">📍</p>
            <p className="text-sm">{isOwner ? '「ピンを追加」をタップしてスポットを登録しよう' : 'スポットがありません'}</p>
          </div>
        ) : (
          pins.map((pin, i) => (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin === selectedPin ? null : pin)}
              className="mx-4 mb-3 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer active:opacity-80"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-6 h-6 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[11px] font-medium text-[#085041] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800">{pin.title}</p>
                  {pin.category && <p className="text-[10px] text-gray-400">{pin.category}</p>}
                </div>
              </div>

              <div className="h-[72px] w-full" style={{ background: SPOT_COLORS[i % SPOT_COLORS.length] }} />

              {pin.description && (
                <p className="px-3 py-2 text-[11px] text-gray-500 leading-relaxed">{pin.description}</p>
              )}

              {pin.access_note && (
                <div className="mx-3 mb-3 p-2.5 rounded-lg bg-gray-50 text-[10px] text-gray-500">
                  <span className="font-medium text-gray-600">アクセス </span>{pin.access_note}
                </div>
              )}

              {pin.tags && pin.tags.length > 0 && (
                <div className="flex gap-1.5 px-3 pb-3 flex-wrap">
                  {pin.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">{tag}</span>
                  ))}
                </div>
              )}

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

      {/* 場所確認シート */}
      {pendingLocation && (
        <div className="fixed inset-0 z-[900] flex flex-col">
          <div className="flex-1" onClick={() => setPendingLocation(null)} />
          <div className="bg-white rounded-t-2xl border-t border-gray-100 shadow-2xl">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-3" />
            <p className="text-[14px] font-medium text-gray-800 px-4 pb-3">ここにピンを置きますか？</p>
            <div className="px-4 pb-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">選択した場所</p>
                <p className="text-[13px] text-gray-700">
                  北緯 {pendingLocation.lat.toFixed(4)}°, 東経 {pendingLocation.lng.toFixed(4)}°
                </p>
              </div>
            </div>
            <div className="px-4 pb-8 flex gap-2">
              <button
                onClick={() => { setPendingLocation(null); setPlacingMode(true) }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] text-gray-500"
              >
                やり直す
              </button>
              <button
                onClick={handleConfirmLocation}
                className="flex-2 px-6 py-2.5 rounded-xl bg-[#1D9E75] text-white text-[12px] font-medium"
              >
                この場所に決定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ピン情報シート（マップ上のピンタップ時） */}
      {pinInfoPin && (
        <div className="fixed inset-0 z-[900] flex flex-col">
          <div className="flex-1" onClick={() => setPinInfoPin(null)} />
          <div className="bg-white rounded-t-2xl border-t border-gray-100 shadow-2xl">
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-1" />
            <p className="text-[14px] font-medium text-gray-800 px-4 pt-1 pb-3">{pinInfoPin.title}</p>
            <div className="px-4 pb-3 flex flex-col gap-2.5">
              {pinInfoPin.description && (
                <p className="text-[11px] text-gray-500 leading-relaxed">{pinInfoPin.description}</p>
              )}
              {pinInfoPin.tags && pinInfoPin.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {pinInfoPin.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 pb-8 flex gap-2">
              <button
                onClick={() => setPinInfoPin(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] text-gray-500"
              >
                閉じる
              </button>
              {isOwner && (
                <button
                  onClick={() => { handleDeletePin(pinInfoPin); setPinInfoPin(null) }}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-[12px] text-red-400"
                >
                  削除する
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 下部アクションバー（非オーナー） */}
      {!isOwner && user && !pinInfoPin && !pendingLocation && (
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
    </div>
  )
}
