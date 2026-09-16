import { Navigate, Route, Routes } from 'react-router-dom'
import GamePage from './pages/GamePage'
import Game2Page from './pages/Game2Page'
import VideoCallPage from './pages/VideoCallPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/game" replace />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/game2" element={<Game2Page />} />
      <Route path="/videocall" element={<VideoCallPage />} />
      <Route path="*" element={<Navigate to="/game" replace />} />
    </Routes>
  )
}
