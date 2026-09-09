import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PhoneHome from './PhoneHome'
import { getAudioContext } from '../utils/audio'

const TALENTS = [
  {
    id: 'talent-a',
    name: 'Mario',
    avatar: 'M',
    intro: '/media/talent-a/intro.mp4',
    correct: '/media/talent-a/correct.mp4',
    wrong: '/media/talent-a/wrong.mp4',
  },
  {
    id: 'talent-b',
    name: 'Talent 2',
    avatar: 'T2',
    intro: '/media/talent-b/intro.mp4',
    correct: '/media/talent-b/correct.mp4',
    wrong: '/media/talent-b/wrong.mp4',
  },
]

const QUESTIONS = [
  {
    id: 'placeholder-1',
    text: 'Domanda Sky Mobile — copy definitiva da inserire',
    answers: [
      { id: 'a', label: 'Risposta A', correct: true },
      { id: 'b', label: 'Risposta B', correct: false },
    ],
  },
  {
    id: 'placeholder-2',
    text: 'Seconda domanda — copy definitiva da inserire',
    answers: [
      { id: 'a', label: 'Risposta A', correct: false },
      { id: 'b', label: 'Risposta B', correct: true },
    ],
  },
]

const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

function nextTalent() {
  try {
    const previous = Number(window.sessionStorage.getItem('sky-mobile-last-talent') ?? -1)
    const index = (previous + 1) % TALENTS.length
    window.sessionStorage.setItem('sky-mobile-last-talent', String(index))
    return TALENTS[index]
  } catch {
    return randomItem(TALENTS)
  }
}

function useRingtone(active) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined
    const ctx = getAudioContext()
    if (!ctx) return undefined
    ctx.resume?.().catch(() => {})

    const playVoice = (frequency, start, duration, volume) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + duration + 0.03)
    }

    const ring = () => {
      const now = ctx.currentTime
      const chord = [659, 784, 988]
      ;[0, 0.46].forEach((pulseOffset) => {
        chord.forEach((frequency, index) => {
          playVoice(frequency, now + pulseOffset + index * 0.012, 0.31, index === 0 ? 0.026 : 0.018)
        })
      })
    }

    ring()
    timerRef.current = window.setInterval(ring, 1750)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [active])
}

export default function VideoCallExperience({ onReset }) {
  const [phase, setPhase] = useState('home')
  const [videoStage, setVideoStage] = useState('intro')
  const [videoFailed, setVideoFailed] = useState(false)
  const [cameraState, setCameraState] = useState('idle')
  const [endingCopy, setEndingCopy] = useState('Chiamata terminata')
  const cameraVideoRef = useRef(null)
  const talentVideoRef = useRef(null)
  const streamRef = useRef(null)
  const fallbackTimerRef = useRef(null)

  const talent = useMemo(() => nextTalent(), [])
  const question = useMemo(() => randomItem(QUESTIONS), [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop())
    streamRef.current = null
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unavailable')
      return
    }
    try {
      setCameraState('loading')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCameraState('ready')
    } catch {
      setCameraState('denied')
    }
  }, [])

  useEffect(() => {
    if (cameraState !== 'ready' || !cameraVideoRef.current || !streamRef.current) return
    cameraVideoRef.current.srcObject = streamRef.current
    cameraVideoRef.current.play().catch(() => {})
  }, [cameraState, phase])

  useEffect(() => () => {
    stopCamera()
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current)
  }, [stopCamera])

  useEffect(() => {
    if (phase !== 'home') return undefined
    const timer = window.setTimeout(() => setPhase('incoming'), 1000)
    return () => window.clearTimeout(timer)
  }, [phase])

  useRingtone(phase === 'incoming')

  useEffect(() => {
    if (phase !== 'incoming') return undefined
    let count = 1
    const timer = window.setInterval(() => {
      count += 1
      if (count >= 10) {
        window.clearInterval(timer)
        setEndingCopy('Chiamata non risposta')
        setPhase('ended')
      }
    }, 1750)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'ended') return undefined
    stopCamera()
    const timer = window.setTimeout(() => onReset?.(), 5000)
    return () => window.clearTimeout(timer)
  }, [phase, onReset, stopCamera])

  const clearFallback = () => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current)
    fallbackTimerRef.current = null
  }

  const scheduleFallback = (stage) => {
    clearFallback()
    const duration = stage === 'intro' ? 6500 : 5000
    fallbackTimerRef.current = window.setTimeout(() => {
      if (stage === 'intro') setPhase('question')
      else {
        setEndingCopy('Chiamata terminata')
        setPhase('ended')
      }
    }, duration)
  }

  const acceptCall = async () => {
    setVideoStage('intro')
    setVideoFailed(false)
    setPhase('call')
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    startCamera()
    const player = talentVideoRef.current
    if (player) player.play().catch(() => scheduleFallback('intro'))
  }

  const currentVideo = videoStage === 'intro' ? talent.intro : videoStage === 'correct' ? talent.correct : talent.wrong

  const handleVideoEnded = () => {
    clearFallback()
    if (videoStage === 'intro') {
      setPhase('question')
      return
    }
    setEndingCopy('Chiamata terminata')
    setPhase('ended')
  }

  const answer = (isCorrect) => {
    const nextStage = isCorrect ? 'correct' : 'wrong'
    setVideoStage(nextStage)
    setVideoFailed(false)
    setPhase('call')
    window.setTimeout(() => {
      const player = talentVideoRef.current
      if (player) {
        player.load()
        player.play().catch(() => scheduleFallback(nextStage))
      }
    }, 0)
  }

  if (phase === 'home') return <PhoneHome mode="videocall" />

  if (phase === 'incoming') {
    const banner = (
      <section className="ios-call-banner" role="dialog" aria-label={`Videochiamata in arrivo da ${talent.name}`}>
        <div className="ios-call-banner-avatar">{talent.avatar}</div>
        <div className="ios-call-banner-copy">
          <small>VIDEOCHIAMATA IN ARRIVO</small>
          <strong>{talent.name}</strong>
          <span>Sky Mobile</span>
        </div>
        <div className="ios-call-banner-actions">
          <button
            className="ios-call-banner-button decline"
            type="button"
            onClick={() => { setEndingCopy('Chiamata terminata'); setPhase('ended') }}
            aria-label="Rifiuta chiamata"
          >×</button>
          <button
            className="ios-call-banner-button accept"
            type="button"
            onClick={acceptCall}
            aria-label="Rispondi alla videochiamata"
          >☎</button>
        </div>
      </section>
    )

    return <PhoneHome mode="videocall" overlay={banner} />
  }

  if (phase === 'ended') {
    return (
      <main className="call-ended">
        <div className="ended-icon">✓</div>
        <h1>{endingCopy}</h1>
        <p>Grazie! Continua verso la prossima tappa.</p>
        <small>La postazione si resetterà automaticamente.</small>
      </main>
    )
  }

  return (
    <main className="video-call-screen">
      <video
        ref={talentVideoRef}
        className={`talent-video ${videoFailed ? 'is-fallback' : ''}`}
        src={currentVideo}
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        onPlaying={clearFallback}
        onError={() => {
          setVideoFailed(true)
          scheduleFallback(videoStage)
        }}
      />

      {videoFailed && (
        <div className="talent-placeholder">
          <div className="caller-avatar large">{talent.avatar}</div>
          <strong>{talent.name}</strong>
          <span>Video preregistrato da fornire</span>
        </div>
      )}

      <header className="call-topbar">
        <div><strong>{talent.name}</strong><small>Sky Mobile · videochiamata</small></div>
        <span className="secure-pill">● LIVE</span>
      </header>

      <div className={`self-view ${cameraState !== 'ready' ? 'camera-fallback' : ''}`}>
        <video ref={cameraVideoRef} autoPlay muted playsInline />
        {cameraState !== 'ready' && (
          <div className="camera-status">
            <span>◉</span>
            <small>{cameraState === 'denied' ? 'Fotocamera non disponibile' : cameraState === 'loading' ? 'Attivazione…' : 'Self view'}</small>
          </div>
        )}
      </div>

      {phase === 'question' && (
        <div className="question-overlay">
          <section className="question-card">
            <span className="question-kicker">{talent.name} ti chiede:</span>
            <h2>{question.text}</h2>
            <div className="answer-grid">
              {question.answers.map((option) => (
                <button key={option.id} type="button" onClick={() => answer(option.correct)}>{option.label}</button>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="ios-home-indicator" aria-hidden="true" />
    </main>
  )
}
