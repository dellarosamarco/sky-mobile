import { useEffect, useMemo, useState } from 'react'
import { primeAudio } from '../utils/audio'

const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'delete']

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 10V7.4a4.5 4.5 0 0 1 9 0V10" />
      <rect x="5" y="10" width="14" height="11" rx="3" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 30 22" aria-hidden="true">
      <path d="M11.2 2h12.3A4.5 4.5 0 0 1 28 6.5v9a4.5 4.5 0 0 1-4.5 4.5H11.2L2 11l9.2-9Z" />
      <path d="m16 7 6 8M22 7l-6 8" />
    </svg>
  )
}

export default function IPhoneLockScreen({ pin, onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const time = useMemo(
    () => now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    [now],
  )

  const date = useMemo(
    () => now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }),
    [now],
  )

  const press = (key) => {
    if (key === 'delete') {
      setError(false)
      setValue((current) => current.slice(0, -1))
      return
    }

    if (value.length >= pin.length) return

    const next = `${value}${key}`
    setValue(next)
    setError(false)

    if (next.length === pin.length) {
      if (next === pin) {
        primeAudio()
        window.setTimeout(() => onUnlock?.(), 160)
      } else {
        window.setTimeout(() => {
          setError(true)
          setValue('')
        }, 180)
      }
    }
  }

  return (
    <main className="ios-lockscreen">
      <div className="ios-wallpaper" aria-hidden="true" />
      <div className="ios-overlay" aria-hidden="true" />

      <section className="ios-passcode" aria-label="Schermata codice">
        <div className="ios-top-lock"><LockIcon /></div>
        <div className="ios-time" aria-label={`Ora ${time}`}>{time}</div>
        <div className="ios-date">{date}</div>

        <div className="ios-passcode-panel">
          <div className="ios-passcode-title">Inserisci codice</div>
          <div className={`ios-dots ${error ? 'is-error' : ''}`} aria-label={`${value.length} caratteri inseriti`}>
            {Array.from({ length: pin.length }).map((_, index) => (
              <span key={index} className={index < value.length ? 'filled' : ''} />
            ))}
          </div>

          <div className="ios-keypad">
            {keys.map((key) => {
              if (key === 'delete') {
                return (
                  <button className="ios-delete" key="delete" type="button" onClick={() => press('delete')} aria-label="Elimina carattere">
                    <DeleteIcon />
                  </button>
                )
              }

              return (
                <button className={`ios-key ${key === ',' ? 'ios-comma' : ''}`} key={key} type="button" onClick={() => press(key)}>
                  <span>{key}</span>
                  {typeof key === 'number' && key > 1 && key < 10 && (
                    <small>{['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'][key]}</small>
                  )}
                </button>
              )
            })}
          </div>

          {error && <div className="ios-passcode-error">Codice errato</div>}
        </div>
      </section>

      <div className="ios-home-indicator" aria-hidden="true" />
    </main>
  )
}
