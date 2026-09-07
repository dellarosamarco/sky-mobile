import { useCallback, useState } from 'react'
import IPhoneLockScreen from '../components/IPhoneLockScreen'
import VideoCallExperience from '../components/VideoCallExperience'

export default function VideoCallPage() {
  const [phase, setPhase] = useState('locked')
  const reset = useCallback(() => setPhase('locked'), [])

  if (phase === 'locked') {
    return <IPhoneLockScreen pin="9381" onUnlock={() => setPhase('experience')} />
  }

  return <VideoCallExperience onReset={reset} />
}
