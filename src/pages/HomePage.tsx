import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchPublicMaps, fetchMyMaps } from '../lib/api'
import MapCard from '../components/MapCard'
import type { MapSummary } from '../types'

type Tab = 'public' | 'mine'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('public')
  const [maps, setMaps] = useState<MapSummary[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />

  useEffect(() => {
    setFetching(true)
    setError('')
    const fn = tab === 'public' ? fetchPublicMaps() : fetchMyMaps(user.id)
    fn.then(setMaps)
      .catch(e => setError(e.message))
      .finally(() => setFetching(false))
  }, [tab])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-sky-600">旅先案内</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* タブ */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(['public', 'mine'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'public' ? '公開マップ' : 'マイマップ'}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        {fetching ? (
          <div className="text-center py-20 text-gray-400">読み込み中...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : maps.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p>{tab === 'public' ? 'まだ公開マップがありません' : 'まだマップを作っていません'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {maps.map(map => (
              <MapCard key={map.id} map={map} />
            ))}
          </div>
        )}
      </main>

      {/* 新規作成ボタン（FAB） */}
      <button
        onClick={() => navigate('/maps/new')}
        className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  )
}
