import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createPin } from '../lib/api'

const CATEGORIES = ['神社仏閣', '絶景', 'カフェ', '自然', '温泉', '路地裏']
const TAGS = ['穴場', '写真映え', '無料', '子連れOK', '混雑少', '季節限定']

type SavedPin = { title: string; category: string; tags: string[] }

export default function PinFormPage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const loc = state as { lat: number; lng: number } | null
  const lat = loc?.lat ?? 0
  const lng = loc?.lng ?? 0

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [accessNote, setAccessNote] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageCount, setImageCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedPin, setSavedPin] = useState<SavedPin | null>(null)

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSave = async () => {
    if (!user || !id || !title.trim()) return
    setSaving(true)
    try {
      const pin = await createPin(user.id, id, {
        title: title.trim(),
        description,
        lat,
        lng,
        category: category || undefined,
        access_note: accessNote || undefined,
        tags,
      })
      setSavedPin({ title: pin.title, category: pin.category ?? '', tags: pin.tags ?? [] })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  // 保存完了画面
  if (savedPin) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center shrink-0">
          <div className="w-8" />
          <p className="flex-1 text-center text-[14px] font-medium text-gray-800">保存完了</p>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex items-center justify-center px-5">
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E1F5EE] mx-auto mb-3 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1D9E75"/>
                  <path d="M7 12l3.5 3.5L17 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[15px] font-medium text-[#085041] mb-1.5">スポットを追加しました</p>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                続けてピンを追加するか、<br />マップに戻ることができます
              </p>

              <div className="bg-[#E1F5EE] rounded-xl px-4 py-3 text-left mb-4">
                <p className="text-[13px] font-medium text-[#085041]">{savedPin.title}</p>
                <p className="text-[10px] text-[#0F6E56] mt-0.5">
                  {[savedPin.category, ...savedPin.tags].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/maps/${id}`, { state: { addingPin: true } })}
                  className="w-full py-2.5 rounded-xl bg-[#1D9E75] text-white text-[13px] font-medium"
                >
                  続けてピンを追加する
                </button>
                <button
                  onClick={() => navigate(`/maps/${id}`)}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-500"
                >
                  マップに戻る
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">次のステップ：ピンの並び替えや非公開設定が可能です</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* トップバー */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1 as never)}
          className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <p className="flex-1 text-center text-[14px] font-medium text-gray-800">スポット情報を入力</p>
        <div className="w-8" />
      </div>

      {/* サブヘッダー（緑） */}
      <div className="bg-[#E1F5EE] px-4 pt-3 pb-3.5 shrink-0">
        <p className="text-[15px] font-medium text-[#085041]">新しいスポットを追加</p>
        <p className="text-[11px] text-[#0F6E56] mt-0.5">このスポットについて教えてください</p>
        <div className="inline-flex items-center gap-1 bg-[#085041] text-[#E1F5EE] text-[10px] px-2.5 py-1 rounded-full mt-2">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 1C3.8 1 2 2.8 2 5c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          北緯 {lat.toFixed(4)}°, 東経 {lng.toFixed(4)}°
        </div>
      </div>

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 flex flex-col gap-5">

          {/* 1. スポット名 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">1</div>
              <p className="text-[12px] font-medium text-gray-700">スポット名</p>
            </div>
            <input
              type="text"
              placeholder="例: 車折神社"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#5DCAA5] focus:ring-1 focus:ring-[#5DCAA5] placeholder-gray-300"
            />
          </div>

          {/* 2. ガイドコメント */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">2</div>
              <p className="text-[12px] font-medium text-gray-700">ガイドコメント</p>
            </div>
            <textarea
              placeholder="なぜここをおすすめするのか、あなたの言葉で教えてください"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#5DCAA5] focus:ring-1 focus:ring-[#5DCAA5] resize-none placeholder-gray-300 leading-relaxed"
            />
          </div>

          {/* 3. カテゴリ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">3</div>
              <p className="text-[12px] font-medium text-gray-700">カテゴリ</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`py-2 rounded-lg border text-[11px] text-center transition-colors ${
                    category === cat
                      ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 写真 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">4</div>
              <p className="text-[12px] font-medium text-gray-700">写真・イラスト</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {Array.from({ length: imageCount }).map((_, i) => {
                const colors = ['#9FE1CB', '#FAC775', '#F5C4B3', '#CECBF6']
                return (
                  <div
                    key={i}
                    className="w-[72px] h-[72px] rounded-xl flex-shrink-0 relative"
                    style={{ background: colors[i % colors.length] }}
                  >
                    <button
                      onClick={() => setImageCount(c => c - 1)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#085041] text-white text-[10px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
              {imageCount < 4 && (
                <button
                  onClick={() => setImageCount(c => c + 1)}
                  className="w-[72px] h-[72px] rounded-xl flex-shrink-0 border border-dashed border-gray-200 bg-white flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="5" width="18" height="14" rx="2" stroke="#ccc" strokeWidth="1.2"/>
                    <circle cx="8" cy="10" r="1.5" stroke="#ccc" strokeWidth="1.2"/>
                    <path d="M2 16l5-4 3 3 3-3 6 5" stroke="#ccc" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    <line x1="15" y1="1" x2="15" y2="7" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="12" y1="4" x2="18" y2="4" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-300 mt-1.5">写真アップロード機能は近日公開予定</p>
          </div>

          {/* 5. アクセスメモ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">5</div>
              <p className="text-[12px] font-medium text-gray-700">アクセス・メモ <span className="text-gray-300 font-normal">（任意）</span></p>
            </div>
            <input
              type="text"
              placeholder="例: 嵐電 車折神社駅すぐ / 9:00〜17:00"
              value={accessNote}
              onChange={e => setAccessNote(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#5DCAA5] focus:ring-1 focus:ring-[#5DCAA5] placeholder-gray-300"
            />
          </div>

          {/* 6. タグ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">6</div>
              <p className="text-[12px] font-medium text-gray-700">タグ</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041]'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="h-2" />
        </div>
      </div>

      {/* ボトムボタン */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 shrink-0 pb-safe">
        <button
          onClick={() => navigate(-1 as never)}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] text-gray-500"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-[2] py-2.5 rounded-xl bg-[#1D9E75] text-white text-[12px] font-medium disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存してマップに追加'}
        </button>
      </div>
    </div>
  )
}
