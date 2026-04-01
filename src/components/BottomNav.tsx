import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'さがす',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
        <circle cx="11" cy="11" r="7" />
        <line x1="16" y1="16" x2="21" y2="21" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/shelf',
    label: '本棚',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    path: '/create',
    label: '作る',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/mypage',
    label: 'マイページ',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="flex border-t border-gray-200 bg-white shrink-0">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              active ? 'text-[#0F6E56]' : 'text-gray-400'
            }`}
          >
            {item.icon(active)}
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
