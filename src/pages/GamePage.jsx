import { useCallback, useState } from 'react'
import IPhoneLockScreen from '../components/IPhoneLockScreen'
import PhoneHome from '../components/PhoneHome'
import GameExperience from '../components/GameExperience'

export default function GamePage() {
  const [phase, setPhase] = useState('locked')
  const reset = useCallback(() => setPhase('locked'), [])

  if (phase === 'locked') {
    return <IPhoneLockScreen pin="7,90" onUnlock={() => setPhase('home')} />
  }

  if (phase === 'home') {
    return <PhoneHome mode="game" onOpen={() => setPhase('game')} />
  }

  return <GameExperience onReset={reset} />
}
