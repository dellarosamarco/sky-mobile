import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAudioContext } from '../utils/audio'
import { applyCollectible, canReplay } from '../gameLogic'

const GAME_SECONDS = 30
const COUNTDOWN_SECONDS = 3
const RESULT_SECONDS = 5
const INTRO_MS = 8300
const FINAL_WARNING_SECONDS = 5
const SIM_SPEED_MULTIPLIER = 1.38915
const FIVE_G_SPEED_MULTIPLIER = 1.6905
const X2_SPEED_MULTIPLIER = 1.911
const SIM_SPAWN_RATE_MULTIPLIER = 1.55736
const NETWORK_SPAWN_WEIGHT = 0.0735
const FIVE_G_SPAWN_WEIGHT = 0.121
const SIM_SPAWN_WEIGHT = 0.82 * SIM_SPAWN_RATE_MULTIPLIER
const TOTAL_SPAWN_WEIGHT = NETWORK_SPAWN_WEIGHT + FIVE_G_SPAWN_WEIGHT + SIM_SPAWN_WEIGHT

function formatTime(seconds) {
  const safe = Math.max(0, seconds)
  return `00:${String(safe).padStart(2, '0')}`
}

function SkyChip({ className = '' }) {
  return <img className={`falling-chip ${className}`.trim()} src="/sky-assets/chip.png" alt="" draggable="false" aria-hidden="true" />
}

function CollectibleArtwork({ type }) {
  if (type === '5g') {
    return (
      <span className="bonus-art bonus-art-5g" aria-hidden="true">
        <strong>5G</strong>
        <small>+10</small>
      </span>
    )
  }

  if (type === 'network') {
    return (
      <span className="bonus-art bonus-art-network" aria-hidden="true">
        <span className="network-bars"><i /><i /><i /><i /></span>
        <strong>×2</strong>
      </span>
    )
  }

  return <SkyChip />
}

function useArcadeAudio() {
  const musicTimerRef = useRef(null)

  const ensureContext = useCallback(() => {
    const context = getAudioContext()
    if (context?.state === 'suspended') context.resume().catch(() => {})
    return context
  }, [])

  const tone = useCallback((frequency, duration = 0.08, volume = 0.05, type = 'sine') => {
    const ctx = ensureContext()
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + duration)
  }, [ensureContext])

  const collect = useCallback((type) => {
    if (type === '5g') {
      tone(880, 0.11, 0.095, 'square')
      window.setTimeout(() => tone(1320, 0.16, 0.085, 'triangle'), 70)
      window.setTimeout(() => tone(1760, 0.18, 0.07, 'triangle'), 145)
      return
    }

    if (type === 'network') {
      tone(520, 0.12, 0.09, 'sawtooth')
      window.setTimeout(() => tone(780, 0.16, 0.08, 'square'), 70)
      window.setTimeout(() => tone(1040, 0.2, 0.075, 'triangle'), 145)
      return
    }

    tone(880, 0.07, 0.07, 'triangle')
    window.setTimeout(() => tone(1320, 0.08, 0.05, 'triangle'), 55)
  }, [tone])

  const countdown = useCallback((last = false) => {
    tone(last ? 980 : 540, last ? 0.2 : 0.08, 0.055, 'square')
  }, [tone])

  const finalWarning = useCallback((remaining) => {
    if (remaining <= 0) {
      tone(220, 0.34, 0.12, 'sawtooth')
      window.setTimeout(() => tone(110, 0.42, 0.095, 'square'), 85)
      return
    }

    const progress = FINAL_WARNING_SECONDS - remaining
    const frequency = 720 + progress * 115
    const volume = 0.09 + progress * 0.009
    tone(frequency, 0.1, volume, 'square')

    if (remaining <= 2) {
      window.setTimeout(() => tone(frequency * 1.28, 0.065, volume * 0.78, 'triangle'), 90)
    }
  }, [tone])

  const startMusic = useCallback(() => {
    ensureContext()
    if (musicTimerRef.current) return

    const melody = [392, 494, 587, 494, 440, 554, 659, 554]
    const bass = [131, 147, 165, 147]
    let index = 0

    const playStep = () => {
      tone(melody[index % melody.length], 0.2, 0.035, 'triangle')
      if (index % 2 === 0) tone(bass[(index / 2) % bass.length], 0.24, 0.02, 'sine')
      if (index % 4 === 0) tone(784, 0.045, 0.012, 'square')
      index += 1
    }

    playStep()
    musicTimerRef.current = window.setInterval(playStep, 260)
  }, [ensureContext, tone])

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) window.clearInterval(musicTimerRef.current)
    musicTimerRef.current = null
  }, [])

  useEffect(() => () => stopMusic(), [stopMusic])

  return useMemo(
    () => ({ ensureContext, collect, countdown, finalWarning, startMusic, stopMusic }),
    [ensureContext, collect, countdown, finalWarning, startMusic, stopMusic],
  )
}

function randomCollectibleType() {
  const roll = Math.random() * TOTAL_SPAWN_WEIGHT
  if (roll < NETWORK_SPAWN_WEIGHT) return 'network'
  if (roll < NETWORK_SPAWN_WEIGHT + FIVE_G_SPAWN_WEIGHT) return '5g'
  return 'sim'
}

function collectLabel(type) {
  if (type === '5g') return '+10'
  if (type === 'network') return '×2'
  return '+1'
}

export default function GameExperience({ onReset }) {
  const [phase, setPhase] = useState('intro')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [simCount, setSimCount] = useState(0)
  const [completedGames, setCompletedGames] = useState(0)
  const [collectibles, setCollectibles] = useState([])
  const [effects, setEffects] = useState([])
  const [boostType, setBoostType] = useState(null)

  const gameStartedAtRef = useRef(0)
  const lastFrameRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const nextIdRef = useRef(1)
  const nextEffectIdRef = useRef(1)
  const simCountRef = useRef(0)
  const lastDisplayedSecondRef = useRef(GAME_SECONDS)
  const audio = useArcadeAudio()

  useEffect(() => {
    if (phase !== 'intro') return undefined
    audio.startMusic()
    const timer = window.setTimeout(() => setPhase('countdown'), INTRO_MS)
    return () => window.clearTimeout(timer)
  }, [phase, audio])

  useEffect(() => {
    if (phase !== 'countdown') return undefined
    audio.startMusic()
    setCountdown(COUNTDOWN_SECONDS)
    let current = COUNTDOWN_SECONDS
    audio.countdown(false)

    const timer = window.setInterval(() => {
      current -= 1
      if (current <= 0) {
        window.clearInterval(timer)
        audio.countdown(true)
        setPhase('playing')
        return
      }
      setCountdown(current)
      audio.countdown(current === 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase, audio])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    gameStartedAtRef.current = performance.now()
    lastFrameRef.current = gameStartedAtRef.current
    lastSpawnRef.current = gameStartedAtRef.current - 650
    lastDisplayedSecondRef.current = GAME_SECONDS
    simCountRef.current = 0
    setTimeLeft(GAME_SECONDS)
    setSimCount(0)
    setCollectibles([])
    setEffects([])
    setBoostType(null)
    audio.startMusic()

    let animationFrame

    const tick = (now) => {
      const elapsedSeconds = (now - gameStartedAtRef.current) / 1000
      const remaining = Math.max(0, Math.ceil(GAME_SECONDS - elapsedSeconds))

      if (remaining !== lastDisplayedSecondRef.current) {
        lastDisplayedSecondRef.current = remaining
        setTimeLeft(remaining)
        if (remaining <= FINAL_WARNING_SECONDS) audio.finalWarning(remaining)
      }

      if (elapsedSeconds >= GAME_SECONDS) {
        audio.stopMusic()
        setCompletedGames((current) => current + 1)
        setPhase('results')
        return
      }

      const dt = Math.min(0.035, (now - lastFrameRef.current) / 1000)
      lastFrameRef.current = now
      const difficulty = Math.min(1.5, 1 + elapsedSeconds / 100)
      const spawnEvery = Math.max(360, 680 - elapsedSeconds * 4.2) / TOTAL_SPAWN_WEIGHT

      setCollectibles((current) => current
        .map((item) => ({ ...item, y: item.y + item.speed * difficulty * dt }))
        .filter((item) => item.y <= 112))

      if (now - lastSpawnRef.current >= spawnEvery) {
        lastSpawnRef.current = now
        const type = randomCollectibleType()
        const speedMultiplier = type === 'sim' ? SIM_SPEED_MULTIPLIER : type === '5g' ? FIVE_G_SPEED_MULTIPLIER : X2_SPEED_MULTIPLIER
        setCollectibles((current) => [
          ...current,
          {
            id: nextIdRef.current++,
            type,
            x: 9 + Math.random() * 82,
            y: -12,
            speed: (22 + Math.random() * 12) * speedMultiplier,
            rotate: -13 + Math.random() * 26,
          },
        ])
      }

      animationFrame = requestAnimationFrame(tick)
    }

    animationFrame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animationFrame)
      audio.stopMusic()
    }
  }, [phase, audio])

  useEffect(() => {
    if (phase !== 'results') return undefined
    const timer = window.setTimeout(() => onReset?.(), RESULT_SECONDS * 1000)
    return () => window.clearTimeout(timer)
  }, [phase, completedGames, onReset])

  const collectItem = useCallback((event, item) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.style.pointerEvents = 'none'
    event.currentTarget.style.opacity = '0'

    setCollectibles((current) => current.filter((entry) => entry.id !== item.id))

    const nextTotal = applyCollectible(simCountRef.current, item.type)
    simCountRef.current = nextTotal
    setSimCount(nextTotal)
    audio.collect(item.type)

    const effectX = event.clientX
    const effectY = event.clientY
    const effectId = nextEffectIdRef.current++
    setEffects((current) => [
      ...current,
      {
        id: effectId,
        type: item.type,
        label: collectLabel(item.type),
        x: effectX,
        y: effectY,
      },
    ])

    if (item.type !== 'sim') {
      setBoostType(item.type)
      window.setTimeout(() => setBoostType(null), 520)
    }

    window.setTimeout(() => {
      setEffects((current) => current.filter((effect) => effect.id !== effectId))
    }, 700)
  }, [audio])

  const retry = () => {
    if (!canReplay(completedGames)) return
    setPhase('countdown')
  }

  if (phase === 'intro') {
    return (
      <main className="game-intro sky-text-brand" onPointerDown={() => audio.ensureContext()}>
        <div className="game-glow" aria-hidden="true" />
        <h1>Prendi i chip e occhio ai bonus!</h1>
        <div className="intro-chip-card"><SkyChip className="intro-chip-art" /></div>
      </main>
    )
  }

  if (phase === 'countdown') {
    return (
      <main className="game-countdown sky-text-brand" onPointerDown={() => audio.ensureContext()}>
        <strong key={countdown}>{countdown}</strong>
      </main>
    )
  }

  if (phase === 'results') {
    const replayAvailable = canReplay(completedGames)
    return (
      <main className="game-results neutral-results sky-text-brand">
        <div className="results-card neutral-results-card">
          <div className="result-chip"><SkyChip className="result-chip-art" /></div>
          <div className="result-box result-box-score">
            <span>Punteggio</span>
            <strong>{simCount}</strong>
          </div>
          <div className="result-box result-box-giga">
            <span>Giga</span>
            <strong>Con Sky Mobile puoi avere anche giga illimitati</strong>
          </div>
          {replayAvailable ? (
            <button className="retry-button" type="button" onClick={retry}>Riprova</button>
          ) : (
            <small>Reset automatico in {RESULT_SECONDS} secondi</small>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className={`game-field tap-game ${boostType ? `is-boosting boost-${boostType}` : ''}`} onPointerDown={() => audio.ensureContext()}>
      <div className="game-field-bg" aria-hidden="true" />

      <header className="game-hud game-hud-two">
        <div><small>PUNTEGGIO</small><strong>{simCount}</strong></div>
        <div className={timeLeft <= 10 ? 'urgent' : ''}><small>TEMPO</small><strong>{formatTime(timeLeft)}</strong></div>
      </header>

      {collectibles.map((item) => (
        <button
          key={item.id}
          className={`collectible collectible--${item.type}${item.type === 'sim' ? ' collectible--hitbox-105' : ''}`}
          type="button"
          aria-label={item.type === 'sim' ? 'Raccogli chip' : item.type === '5g' ? 'Bonus 5G più 10 punti' : 'Bonus rete raddoppia il punteggio'}
          onPointerDown={(event) => collectItem(event, item)}
          style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) rotate(${item.rotate}deg)` }}
        >
          <CollectibleArtwork type={item.type} />
        </button>
      ))}

      {effects.map((effect) => (
        <div
          className={`collect-effect collect-effect--${effect.type}`}
          key={effect.id}
          style={{ left: effect.x, top: effect.y }}
          aria-hidden="true"
        >
          <span>{effect.label}</span>
          <i /><i /><i /><i />
        </div>
      ))}
    </main>
  )
}
