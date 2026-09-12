import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAudioContext } from '../utils/audio'

const GAME_SECONDS = 29
const COUNTDOWN_SECONDS = 5
const RESULT_SECONDS = 5
const TARGET_SIMS = 35
const MAX_ATTEMPTS = 2
const FINAL_WARNING_SECONDS = 5

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
    tone(880, 0.07, 0.07, 'triangle')
    window.setTimeout(() => tone(1320, 0.08, 0.05, 'triangle'), 55)
  }, [tone])

  const miss = useCallback(() => tone(180, 0.11, 0.035, 'sine'), [tone])
  const countdown = useCallback((last = false) => tone(last ? 980 : 540, last ? 0.2 : 0.08, 0.055, 'square'), [tone])

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
      tone(melody[index % melody.length], 0.2, 0.04, 'triangle')

      if (index % 2 === 0) {
        tone(bass[(index / 2) % bass.length], 0.24, 0.022, 'sine')
      }

      if (index % 4 === 0) {
        tone(784, 0.045, 0.014, 'square')
      }

      index += 1
    }

    // Play immediately instead of waiting for the first interval tick. This also
    // makes it obvious on iOS that audio was successfully unlocked.
    playStep()
    musicTimerRef.current = window.setInterval(playStep, 260)
  }, [ensureContext, tone])

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) window.clearInterval(musicTimerRef.current)
    musicTimerRef.current = null
  }, [])

  useEffect(() => () => stopMusic(), [stopMusic])

  return useMemo(
    () => ({ ensureContext, collect, miss, countdown, finalWarning, startMusic, stopMusic }),
    [ensureContext, collect, miss, countdown, finalWarning, startMusic, stopMusic],
  )
}

export default function GameExperience({ onReset }) {
  const [phase, setPhase] = useState('intro')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [score, setScore] = useState(0)
  const [simCount, setSimCount] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [sims, setSims] = useState([])
  const [flash, setFlash] = useState(false)

  const fieldRef = useRef(null)
  const catcherRef = useRef(null)
  const activePointerRef = useRef(null)
  const gameStartedAtRef = useRef(0)
  const lastFrameRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const nextIdRef = useRef(1)
  const scoreRef = useRef(0)
  const simCountRef = useRef(0)
  const catcherXRef = useRef(50)
  const lastDisplayedSecondRef = useRef(GAME_SECONDS)
  const audio = useArcadeAudio()

  useEffect(() => {
    if (phase !== 'intro') return undefined
    audio.startMusic()
    const timer = window.setTimeout(() => setPhase('countdown'), 8300)
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

  const moveCatcher = useCallback((clientX) => {
    const field = fieldRef.current
    const catcher = catcherRef.current
    if (!field || !catcher) return

    const rect = field.getBoundingClientRect()
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92)

    catcherXRef.current = x
    catcher.style.left = `${x}%`
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    const field = fieldRef.current
    if (!field) return undefined

    const latestSample = (event) => {
      const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : null
      return samples?.length ? samples[samples.length - 1] : event
    }

    const applyPointer = (event) => {
      const sample = latestSample(event)
      moveCatcher(sample.clientX)
    }

    const onPointerDown = (event) => {
      if (activePointerRef.current !== null && activePointerRef.current !== event.pointerId) return
      if (event.cancelable) event.preventDefault()
      activePointerRef.current = event.pointerId
      audio.ensureContext()
      try {
        field.setPointerCapture?.(event.pointerId)
      } catch {
        // Pointer capture can fail on a pointer that already ended; tracking still works.
      }
      applyPointer(event)
    }

    const onPointerMove = (event) => {
      if (activePointerRef.current !== event.pointerId) return
      if (event.cancelable) event.preventDefault()
      applyPointer(event)
    }

    const onPointerEnd = (event) => {
      if (activePointerRef.current !== event.pointerId) return
      try {
        if (field.hasPointerCapture?.(event.pointerId)) field.releasePointerCapture(event.pointerId)
      } catch {
        // Safe no-op when the browser already released the pointer.
      }
      activePointerRef.current = null
    }

    field.addEventListener('pointerdown', onPointerDown, { passive: false })
    const moveEvent = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove'
    field.addEventListener(moveEvent, onPointerMove, { passive: false })
    field.addEventListener('pointerup', onPointerEnd)
    field.addEventListener('pointercancel', onPointerEnd)

    return () => {
      field.removeEventListener('pointerdown', onPointerDown)
      field.removeEventListener(moveEvent, onPointerMove)
      field.removeEventListener('pointerup', onPointerEnd)
      field.removeEventListener('pointercancel', onPointerEnd)
      activePointerRef.current = null
    }
  }, [phase, moveCatcher, audio])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    gameStartedAtRef.current = performance.now()
    lastFrameRef.current = gameStartedAtRef.current
    lastSpawnRef.current = gameStartedAtRef.current - 700
    lastDisplayedSecondRef.current = GAME_SECONDS
    catcherXRef.current = 50
    if (catcherRef.current) catcherRef.current.style.left = '50%'
    setTimeLeft(GAME_SECONDS)
    setScore(0)
    setSimCount(0)
    scoreRef.current = 0
    simCountRef.current = 0
    setSims([])
    audio.startMusic()

    let animationFrame
    const tick = (now) => {
      const elapsedSeconds = (now - gameStartedAtRef.current) / 1000
      const remaining = Math.max(0, Math.ceil(GAME_SECONDS - elapsedSeconds))

      if (remaining !== lastDisplayedSecondRef.current) {
        lastDisplayedSecondRef.current = remaining
        setTimeLeft(remaining)

        if (remaining <= FINAL_WARNING_SECONDS) {
          audio.finalWarning(remaining)
        }
      }

      if (elapsedSeconds >= GAME_SECONDS) {
        audio.stopMusic()
        if (simCountRef.current >= TARGET_SIMS) {
          setPhase('results')
        } else if (attempt < MAX_ATTEMPTS) {
          setPhase('failed')
        } else {
          setPhase('failed-final')
        }
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
            simCountRef.current += 1
            setScore(scoreRef.current)
            setSimCount(simCountRef.current)
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
  }, [phase, attempt, audio])

  useEffect(() => {
    if (phase !== 'results' && phase !== 'failed-final') return undefined
    const timer = window.setTimeout(() => onReset?.(), RESULT_SECONDS * 1000)
    return () => window.clearTimeout(timer)
  }, [phase, onReset])

  const retry = () => {
    if (attempt >= MAX_ATTEMPTS) return
    setAttempt((current) => current + 1)
    setPhase('countdown')
  }

  if (phase === 'intro') {
    return (
      <main className="game-intro" onPointerDown={() => audio.ensureContext()}>
        <div className="game-glow" aria-hidden="true" />
        <div className="game-logo"><b>sky</b><span>mobile</span></div>
        <p className="game-kicker">SIM CATCH</p>
        <h1>Con Sky Mobile hai <span>_____ _____.</span></h1>
        <p className="game-instruction">Raccogli almeno {TARGET_SIMS} SIM prima dello scadere del tempo.</p>
        <div className="intro-sim-card"><SkySim /></div>
      </main>
    )
  }

  if (phase === 'countdown') {
    return (
      <main className="game-countdown" onPointerDown={() => audio.ensureContext()}>
        <span>Tentativo {attempt} di {MAX_ATTEMPTS}</span>
        <strong key={countdown}>{countdown}</strong>
        <p>Obiettivo: {TARGET_SIMS} SIM</p>
      </main>
    )
  }

  if (phase === 'failed') {
    return (
      <main className="game-results game-failure-screen">
        <div className="results-card failure-card">
          <div className="result-error">×</div>
          <span>Tempo scaduto</span>
          <h1>{simCount}</h1>
          <p>SIM prese su {TARGET_SIMS}</p>
          <div className="result-divider" />
          <strong>Non hai raccolto abbastanza SIM</strong>
          <p className="result-copy">Ti resta un ultimo tentativo.</p>
          <button className="retry-button" type="button" onClick={retry}>Riprova</button>
          <small>Tentativo {attempt} di {MAX_ATTEMPTS}</small>
        </div>
      </main>
    )
  }

  if (phase === 'failed-final') {
    return (
      <main className="game-results game-failure-screen">
        <div className="results-card failure-card">
          <div className="result-error">×</div>
          <span>Tempo scaduto</span>
          <h1>{simCount}</h1>
          <p>SIM prese su {TARGET_SIMS}</p>
          <div className="result-divider" />
          <strong>Tentativi terminati</strong>
          <p className="result-copy">Hai utilizzato entrambi i tentativi.</p>
          <small>Reset automatico in {RESULT_SECONDS} secondi</small>
        </div>
      </main>
    )
  }

  if (phase === 'results') {
    return (
      <main className="game-results">
        <div className="results-card success-card">
          <div className="result-check">✓</div>
          <span>Obiettivo raggiunto!</span>
          <h1>{simCount}</h1>
          <p>SIM prese</p>
          <div className="result-divider" />
          <strong>Complimenti!</strong>
          <p className="result-copy">Hai raccolto almeno {TARGET_SIMS} SIM.</p>
          <small>Reset automatico in {RESULT_SECONDS} secondi</small>
        </div>
      </main>
    )
  }

  return (
    <main ref={fieldRef} className={`game-field ${flash ? 'is-catching' : ''}`}>
      <div className="game-field-bg" aria-hidden="true" />
      <header className="game-hud game-hud-three">
        <div><small>SIM PRESE</small><strong>{simCount}<span className="target-sims">/{TARGET_SIMS}</span></strong></div>
        <div><small>TENTATIVO</small><strong>{attempt}/{MAX_ATTEMPTS}</strong></div>
        <div className={timeLeft <= 10 ? 'urgent' : ''}><small>TEMPO</small><strong>{formatTime(timeLeft)}</strong></div>
      </header>

      <div className="game-copy-strip">Raccogli almeno {TARGET_SIMS} SIM</div>

      {sims.map((sim) => (
        <SkySim
          key={sim.id}
          style={{ left: `${sim.x}%`, top: `${sim.y}%`, transform: `translate(-50%, -50%) rotate(${sim.rotate}deg)` }}
        />
      ))}

      <div className="catch-zone" aria-hidden="true" />
      <div ref={catcherRef} className="catcher" aria-hidden="true">
        <span className="catcher-glow" />
        <div className="catcher-body"><b>sky</b><small>mobile</small></div>
      </div>

      <div className="game-touch-hint">↔ TRASCINA</div>
    </main>
  )
}
