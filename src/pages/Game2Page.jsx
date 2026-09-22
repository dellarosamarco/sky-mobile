import { useCallback, useState } from 'react'
import IPhoneLockScreen from '../components/IPhoneLockScreen'
import PhoneHome from '../components/PhoneHome'
import GameExperience2 from '../components/GameExperience2'

export default function Game2Page() {
  const [phase, setPhase] = useState('locked')
  const reset = useCallback(() => setPhase('locked'), [])

  if (phase === 'locked') {
    return <IPhoneLockScreen pin="7,90" onUnlock={() => setPhase('home')} />
  }

  if (phase === 'home') {
    return <PhoneHome mode="game" onOpen={() => setPhase('game')} />
  }

  return <GameExperience2 onReset={reset} />
}
