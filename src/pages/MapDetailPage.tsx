import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchMapDetail, fetchPins, createPin, deletePin } from '../lib/api'
import LeafletMap from '../components/LeafletMap'
import type { MapSummary, Pin } from '../types'

type PinForm = { title: string; description: string; lat: number; lng: number } | null

export default function MapDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [map, setMap] = useState<MapSummary | null>(null)
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ピン追加フォームの状態
  const [pinForm, setPinForm] = useState<PinForm>(null)
  const [saving, setSaving] = useState(false)

  // 選択中ピン（詳細パネル）
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)

  const isOwner = user?.id === map?.user_id

  useEffect(() => {
    if (!id) return
    Promise.all([fetchMapDetail(id), fetchPins(id)])
      .then(([mapData, pinsData]) => { setMap(mapData); setPins(pinsData) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 z-10">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-800 truncate">{map?.title}</h1>
          {map?.area && <p className="text-xs text-gray-400">📍 {map.area}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
          <span>📌 {pins.length}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 地図エリア */}
        <div className="flex-1 relative">
          <LeafletMap
            pins={pins}
            onMapClick={isOwner ? handleMapClick : undefined}
            onPinClick={setSelectedPin}
            readonly={!isOwner}
          />

          {/* オーナー向けヒント */}
          {isOwner && !pinForm && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow pointer-events-none">
              地図をタップしてピンを追加
            </div>
          )}

          {/* ピン追加フォーム */}
          {pinForm && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400 mb-2">
                {pinForm.lat.toFixed(5)}, {pinForm.lng.toFixed(5)}
              </p>
              <input
                autoFocus
                type="text"
                placeholder="スポット名 *"
                value={pinForm.title}
                onChange={e => setPinForm(f => f ? { ...f, title: e.target.value } : f)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
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
                  className="flex-1 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSavePin}
                  disabled={saving || !pinForm.title.trim()}
                  className="flex-1 py-2 text-sm text-white bg-[#1D9E75] rounded-lg hover:bg-[#0F6E56] disabled:opacity-50"
                >
                  {saving ? '保存中...' : '追加'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ピン一覧サイドパネル（sm以上） */}
        <aside className="hidden sm:flex flex-col w-64 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">スポット一覧</p>
          </div>
          {pins.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-4 text-center">
              {isOwner ? '地図をタップして\nスポットを追加しよう' : 'スポットがありません'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pins.map((pin, i) => (
                <li
                  key={pin.id}
                  onClick={() => setSelectedPin(pin === selectedPin ? null : pin)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPin?.id === pin.id ? 'bg-[#E1F5EE]' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#1D9E75] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{pin.title}</p>
                      {pin.description && (
                        <p className="text-xs text-gray-400 truncate">{pin.description}</p>
                      )}
                    </div>
                  </div>

                  {/* 選択時に削除ボタン表示 */}
                  {selectedPin?.id === pin.id && isOwner && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeletePin(pin) }}
                      className="mt-2 w-full text-xs text-red-400 hover:text-red-600 text-left"
                    >
                      削除する
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
