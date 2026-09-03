import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAudioContext } from '../utils/audio'

const GAME_SECONDS = 59
const COUNTDOWN_SECONDS = 5
const RESULT_SECONDS = 5

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds)
  return `00:${String(safe).padStart(2, '0')}`
}

function SkySim({ style }) {
  return (
    <div className="falling-sim" style={style} aria-hidden="true">
      <span className="sim-notch" />
      <span className="sim-brand"><b>sky</b><small>mobile</small></span>
    </div>
  )
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

  const collect = useCallback(() => {
    tone(880, 0.07, 0.06, 'triangle')
    window.setTimeout(() => tone(1320, 0.08, 0.04, 'triangle'), 55)
  }, [tone])

  const miss = useCallback(() => tone(180, 0.11, 0.025, 'sine'), [tone])
  const countdown = useCallback((last = false) => tone(last ? 980 : 540, last ? 0.2 : 0.08, 0.045, 'square'), [tone])

  const startMusic = useCallback(() => {
    ensureContext()
    if (musicTimerRef.current) return
    const notes = [262, 330, 392, 330, 294, 370, 440, 370]
    let index = 0
    musicTimerRef.current = window.setInterval(() => {
      tone(notes[index % notes.length], 0.16, 0.012, 'triangle')
      index += 1
    }, 260)
  }, [ensureContext, tone])

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) window.clearInterval(musicTimerRef.current)
    musicTimerRef.current = null
  }, [])

  useEffect(() => () => stopMusic(), [stopMusic])

  return useMemo(
    () => ({ ensureContext, collect, miss, countdown, startMusic, stopMusic }),
    [ensureContext, collect, miss, countdown, startMusic, stopMusic],
  )
}

export default function GameExperience({ onReset }) {
  const [phase, setPhase] = useState('intro')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [score, setScore] = useState(0)
  const [sims, setSims] = useState([])
  const [catcherX, setCatcherX] = useState(50)
  const [flash, setFlash] = useState(false)
  const fieldRef = useRef(null)
  const gameStartedAtRef = useRef(0)
  const lastFrameRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const nextIdRef = useRef(1)
  const scoreRef = useRef(0)
  const catcherXRef = useRef(50)
  const audio = useArcadeAudio()

  useEffect(() => {
    if (phase !== 'intro') return undefined
    const timer = window.setTimeout(() => setPhase('countdown'), 3300)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'countdown') return undefined
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
    lastSpawnRef.current = gameStartedAtRef.current - 700
    setTimeLeft(GAME_SECONDS)
    setScore(0)
    scoreRef.current = 0
    setSims([])
    audio.startMusic()

    let animationFrame
    const tick = (now) => {
      const elapsedSeconds = (now - gameStartedAtRef.current) / 1000
      const remaining = Math.ceil(GAME_SECONDS - elapsedSeconds)
      setTimeLeft(Math.max(0, remaining))

      if (elapsedSeconds >= GAME_SECONDS) {
        audio.stopMusic()
        setPhase('results')
        return
      }

      const dt = Math.min(0.035, (now - lastFrameRef.current) / 1000)
      lastFrameRef.current = now
      const difficulty = Math.min(1.55, 1 + elapsedSeconds / 95)
      const spawnEvery = Math.max(360, 700 - elapsedSeconds * 4.2)

      setSims((current) => {
        const updated = []
        current.forEach((sim) => {
          const nextY = sim.y + sim.speed * difficulty * dt
          const catchZone = nextY >= 82 && nextY <= 94
          const distance = Math.abs(sim.x - catcherXRef.current)

          if (catchZone && distance < 11) {
            scoreRef.current += 10
            setScore(scoreRef.current)
            setFlash(true)
            window.setTimeout(() => setFlash(false), 100)
            audio.collect()
            return
          }

          if (nextY > 108) {
            audio.miss()
            return
          }

          updated.push({ ...sim, y: nextY })
        })
        return updated
      })

      if (now - lastSpawnRef.current >= spawnEvery) {
        lastSpawnRef.current = now
        setSims((current) => [
          ...current,
          {
            id: nextIdRef.current++,
            x: 9 + Math.random() * 82,
            y: -14,
            speed: 24 + Math.random() * 13,
            rotate: -15 + Math.random() * 30,
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
  }, [phase, onReset])

  const moveCatcher = (clientX) => {
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92)
    catcherXRef.current = x
    setCatcherX(x)
  }

  const handlePointer = (event) => {
    audio.ensureContext()
    moveCatcher(event.clientX)
  }

  if (phase === 'intro') {
    return (
      <main className="game-intro" onPointerDown={() => audio.ensureContext()}>
        <div className="game-glow" aria-hidden="true" />
        <div className="game-logo"><b>sky</b><span>mobile</span></div>
        <p className="game-kicker">SIM CATCH</p>
        <h1>Con Sky Mobile hai <span>_____ _____.</span></h1>
        <p className="game-instruction">Prendi quante più SIM nel minor tempo possibile.</p>
        <div className="intro-sim-card"><SkySim /></div>
      </main>
    )
  }

  if (phase === 'countdown') {
    return (
      <main className="game-countdown" onPointerDown={() => audio.ensureContext()}>
        <span>Preparati</span>
        <strong key={countdown}>{countdown}</strong>
        <p>Trascina il catcher con il dito</p>
      </main>
    )
  }

  if (phase === 'results') {
    return (
      <main className="game-results">
        <div className="results-card">
          <div className="result-check">✓</div>
          <span>Tempo!</span>
          <h1>{score}</h1>
          <p>punti</p>
          <div className="result-divider" />
          <strong>Continua il percorso</strong>
          <p className="result-copy">Non hai raggiunto il record! Continua il percorso e mettiti alla prova nella prossima tappa.</p>
          <small>Reset automatico in {RESULT_SECONDS} secondi</small>
        </div>
      </main>
    )
  }

  return (
    <main
      ref={fieldRef}
      className={`game-field ${flash ? 'is-catching' : ''}`}
      onPointerDown={handlePointer}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch' || event.buttons === 1) handlePointer(event)
      }}
    >
      <div className="game-field-bg" aria-hidden="true" />
      <header className="game-hud">
        <div><small>PUNTI</small><strong>{score}</strong></div>
        <div className={timeLeft <= 10 ? 'urgent' : ''}><small>TEMPO</small><strong>{formatTime(timeLeft)}</strong></div>
      </header>

      <div className="game-copy-strip">Prendi le SIM!</div>

      {sims.map((sim) => (
        <SkySim
          key={sim.id}
          style={{ left: `${sim.x}%`, top: `${sim.y}%`, transform: `translate(-50%, -50%) rotate(${sim.rotate}deg)` }}
        />
      ))}

      <div className="catch-zone" aria-hidden="true" />
      <div className="catcher" style={{ left: `${catcherX}%` }} aria-hidden="true">
        <span className="catcher-glow" />
        <div className="catcher-body"><b>sky</b><small>mobile</small></div>
      </div>

      <div className="game-touch-hint">↔ TRASCINA</div>
    </main>
  )
}
