import { useState } from 'react'
import IPhoneLockScreen from '../components/IPhoneLockScreen'

export default function VideoCallPage() {
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) {
    return <IPhoneLockScreen pin="4567" onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="experience-placeholder">
      <div>
        <span>Sky Mobile</span>
        <h1>Video call unlocked</h1>
        <p>Qui entrerà la videochiamata simulata.</p>
      </div>
    </main>
  )
}
