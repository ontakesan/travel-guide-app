import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import CreateMapPage from './pages/CreateMapPage'
import MapDetailPage from './pages/MapDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/maps/new" element={<CreateMapPage />} />
        <Route path="/maps/:id" element={<MapDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
