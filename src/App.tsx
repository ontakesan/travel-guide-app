import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import AuthPage from './pages/AuthPage'
import DiscoverPage from './pages/DiscoverPage'
import ShelfPage from './pages/ShelfPage'
import CreateMapPage from './pages/CreateMapPage'
import MyPage from './pages/MyPage'
import MapDetailPage from './pages/MapDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Main app shell (auth guard + bottom nav) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/shelf" element={<ShelfPage />} />
          <Route path="/create" element={<CreateMapPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* Full-screen pages (no bottom nav) */}
        <Route path="/maps/:id" element={<MapDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
