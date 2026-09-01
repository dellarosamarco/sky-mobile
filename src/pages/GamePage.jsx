import { useState } from 'react'
import IPhoneLockScreen from '../components/IPhoneLockScreen'

export default function GamePage() {
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) {
    return <IPhoneLockScreen pin="1234" onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="experience-placeholder">
      <div>
        <span>Sky Mobile</span>
        <h1>Game unlocked</h1>
        <p>Qui entrerà il minigioco delle monete.</p>
      </div>
    </main>
  )
}
