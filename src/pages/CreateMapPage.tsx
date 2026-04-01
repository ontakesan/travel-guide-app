import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createMap } from '../lib/api'

const PRESET_TAGS = ['神社仏閣', '絶景', 'カフェ', 'グルメ', '自然', '温泉', '歴史', 'アート']

export default function CreateMapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSubmitting(true)

    try {
      const map = await createMap(user.id, { title, description, area, tags, is_public: isPublic })
      navigate(`/maps/${map.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1 as never)}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ←
        </button>
        <h1 className="text-base font-bold text-gray-800">新しいマップを作成</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: 京都 穴場スポット巡り"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
            />
          </div>

          {/* エリア */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">エリア</label>
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="例: 京都、奈良、沖縄"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="このマップについて説明を書いてください"
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DCAA5] resize-none"
            />
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#5DCAA5]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 公開設定 */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">公開する</p>
              <p className="text-xs text-gray-400">オフにすると自分だけ見られます</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-[#1D9E75]' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {submitting ? '作成中...' : 'マップを作成する'}
          </button>
        </form>
      </main>
    </div>
  )
}
