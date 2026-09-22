import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PhoneHome from './PhoneHome'
import { getAudioContext } from '../utils/audio'

const TALENTS = [
  {
    id: 'talent-a',
    name: 'Alessandro Del Piero',
    avatar: 'ADP',
    intro: 'https://sky-game-bay.vercel.app/media/talent-a/intro.mp4',
    correct: 'https://sky-game-bay.vercel.app/media/talent-a/correct.mp4',
    wrong: 'https://sky-game-bay.vercel.app/media/talent-a/wrong.mp4',
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
    id: 'sky-mobile-1',
    text: 'La nuova offerta Sky Mobile è solo per chi è già cliente o anche per i nuovi?',
    answers: [
      { id: 'a', label: 'Solo i già clienti', correct: false },
      { id: 'b', label: 'Tutti', correct: true },
      { id: 'c', label: 'Solo i nuovi', correct: false },
    ],
  },
  {
    id: 'sky-mobile-2',
    text: 'Fino a quanti mesi gratis può avere chi è già abbonato Sky?',
    answers: [
      { id: 'a', label: 'Sei mesi', correct: true },
      { id: 'b', label: 'Quattro mesi', correct: false },
    ],
  },
  {
    id: 'sky-mobile-3',
    text: 'Quali vantaggi ha chi è cliente Sky da più di sei anni?',
    answers: [
      { id: 'a', label: 'Giga illimitati e 6 mesi gratis', correct: true },
      { id: 'b', label: '250 Giga e 2 mesi gratis', correct: false },
    ],
  },
  {
    id: 'sky-mobile-4',
    text: 'Qual è il prezzo di partenza della nuova offerta Sky Mobile?',
    answers: [
      { id: 'a', label: '7,90', correct: true },
      { id: 'b', label: '9,90', correct: false },
    ],
  },
  {
    id: 'sky-mobile-5',
    text: 'I nuovi clienti che scelgono Sky Mobile in abbinamento a TV o Wifi, hanno vantaggi sulla componente Mobile?',
    answers: [
      { id: 'a', label: 'No', correct: false },
      { id: 'b', label: 'Sì, giga illimitati', correct: true },
      { id: 'c', label: 'Mesi in regalo', correct: false },
    ],
  },
  {
    id: 'sky-mobile-6',
    text: 'Chi ha Sky Mobile Powered by Fastweb può passare alla nuova offerta Sky Mobile?',
    answers: [
      { id: 'a', label: 'Sì, in ogni momento e da qualsiasi canale', correct: true },
      { id: 'b', label: 'No, ma sarà possibile in futuro', correct: false },
    ],
  },
  {
    id: 'sky-mobile-7',
    text: 'Con Sky Mobile ci vuole per forza la SIM card o c’è anche la e-SIM?',
    answers: [
      { id: 'a', label: 'C’è solo la e-sim', correct: false },
      { id: 'b', label: 'C’è sia la SIM fisica che la e-SIM.', correct: true },
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
  const [slideProgress, setSlideProgress] = useState(0)
  const cameraVideoRef = useRef(null)
  const talentVideoRef = useRef(null)
  const streamRef = useRef(null)
  const fallbackTimerRef = useRef(null)
  const slideTrackRef = useRef(null)
  const slideKnobRef = useRef(null)
  const slidePointerRef = useRef(null)
  const slideStartXRef = useRef(0)
  const slideStartProgressRef = useRef(0)

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          aspectRatio: { ideal: 9 / 16 },
        },
        audio: false,
      })
      streamRef.current = stream
      setCameraState('ready')
    } catch {
      setCameraState('denied')
    }
  }, [])

  useEffect(() => {
    screen.orientation?.lock?.('portrait-primary').catch?.(() => {})
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

  useEffect(() => {
    if (phase === 'incoming') setSlideProgress(0)
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
    setSlideProgress(1)
    setVideoStage('intro')
    setVideoFailed(false)
    setPhase('call')
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    startCamera()
    const player = talentVideoRef.current
    if (player) player.play().catch(() => scheduleFallback('intro'))
  }

  const onSlidePointerDown = (event) => {
    if (!slideTrackRef.current || !slideKnobRef.current) return
    event.preventDefault()
    slidePointerRef.current = event.pointerId
    slideStartXRef.current = event.clientX
    slideStartProgressRef.current = slideProgress
    slideKnobRef.current.setPointerCapture?.(event.pointerId)
  }

  const onSlidePointerMove = (event) => {
    if (slidePointerRef.current !== event.pointerId || !slideTrackRef.current || !slideKnobRef.current) return
    event.preventDefault()
    const trackWidth = slideTrackRef.current.getBoundingClientRect().width
    const knobWidth = slideKnobRef.current.getBoundingClientRect().width
    const travel = Math.max(1, trackWidth - knobWidth - 12)
    const next = Math.max(0, Math.min(1, slideStartProgressRef.current + (event.clientX - slideStartXRef.current) / travel))
    setSlideProgress(next)
  }

  const finishSlide = (event) => {
    if (slidePointerRef.current !== event.pointerId) return
    slidePointerRef.current = null
    if (slideProgress >= 0.78) acceptCall()
    else setSlideProgress(0)
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
    return (
      <main className="incoming-call-screen" role="dialog" aria-label={`Videochiamata in arrivo da ${talent.name}`}>
        <div className="incoming-talent-backdrop" aria-hidden="true">
          <span>{talent.avatar}</span>
        </div>
        <div className="incoming-call-shade" aria-hidden="true" />
        <div className="incoming-call-copy">
          <small>VIDEOCHIAMATA IN ARRIVO</small>
          <h1>{talent.name}</h1>
          <p>Sky Mobile</p>
        </div>

        <div className="slide-answer-wrap">
          <div className="slide-answer-track" ref={slideTrackRef}>
            <div className="slide-answer-fill" style={{ width: `${Math.max(12, slideProgress * 100)}%` }} />
            <span className="slide-answer-label" style={{ opacity: Math.max(0, 1 - slideProgress * 1.7) }}>Scorri per rispondere</span>
            <button
              ref={slideKnobRef}
              className="slide-answer-knob"
              type="button"
              aria-label="Trascina per rispondere"
              onPointerDown={onSlidePointerDown}
              onPointerMove={onSlidePointerMove}
              onPointerUp={finishSlide}
              onPointerCancel={finishSlide}
              style={{ '--slide-progress': slideProgress }}
            >
              <span aria-hidden="true">📞</span>
            </button>
          </div>
        </div>

        <div className="ios-home-indicator" aria-hidden="true" />
      </main>
    )
  }

  if (phase === 'ended') {
    return (
      <main className="call-ended">
        <div className="ended-icon ended-chip"><img src="/sky-assets/chip.png" alt="" draggable="false" /></div>
        <h1>{endingCopy}</h1>
        <p>Continua verso la prossima tappa.</p>
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