import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createMap } from '../lib/api'

const PRESET_TAGS = ['神社仏閣', '絶景', 'カフェ', 'グルメ', '自然', '温泉', '歴史', 'アート']

export default function CreateMapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
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
      const map = await createMap(user.id, { title, description: '', area, tags, is_public: isPublic })
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
      <header className="bg-[#E1F5EE] px-4 pt-5 pb-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1 as never)}
          className="text-[#0F6E56] text-sm mb-2 flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          もどる
        </button>
        <h1 className="text-[16px] font-medium text-[#085041] mb-0.5">新しいガイドマップを作る</h1>
        <p className="text-[11px] text-[#0F6E56]">あなたの視点で旅を案内しましょう</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">
              マップのタイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: 私の推し神社めぐり 奈良編"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
            />
          </div>

          {/* エリア */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">エリア</label>
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="都道府県や市区町村を選択"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5DCAA5]"
            />
          </div>

          {/* ジャンルタグ */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-2">ジャンルタグ（複数選択可）</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#5DCAA5]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 公開設定 */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">公開設定</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-medium border transition-colors ${
                  isPublic
                    ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#085041]'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                公開
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-medium border transition-colors ${
                  !isPublic
                    ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#085041]'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                非公開
              </button>
            </div>
          </div>

          {/* カバー画像 */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">カバー画像</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center cursor-pointer hover:border-[#5DCAA5] transition-colors">
              <p className="text-[13px] font-medium text-gray-400 mb-1">カバー画像を追加</p>
              <p className="text-[11px] text-gray-300">タップして写真を選択</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-[13px]"
          >
            {submitting ? '作成中...' : 'マップを作成してピンを追加する →'}
          </button>
        </form>
      </main>
    </div>
  )
}
