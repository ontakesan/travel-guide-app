import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from './BottomNav'

export default function MainLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
