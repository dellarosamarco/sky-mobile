import { useEffect, useMemo, useState } from 'react'

const APPS = [
  { id: 'messages', label: 'Messaggi', glyph: '●', tone: 'green' },
  { id: 'camera', label: 'Fotocamera', glyph: '◉', tone: 'camera' },
  { id: 'maps', label: 'Mappe', glyph: '⌖', tone: 'maps' },
  { id: 'weather', label: 'Meteo', glyph: '☀', tone: 'weather' },
  { id: 'photos', label: 'Foto', glyph: '✿', tone: 'photos' },
  { id: 'notes', label: 'Note', glyph: '≡', tone: 'notes' },
  { id: 'settings', label: 'Impostazioni', glyph: '⚙', tone: 'settings' },
]

function SkyIcon() {
  return (
    <span className="ios-app-icon sky-home-icon">
      <span className="sky-wordmark">sky</span>
      <span className="mobile-wordmark">mobile</span>
    </span>
  )
}

export default function PhoneHome({ mode = 'game', onOpen, overlay = null }) {
  const isGame = mode === 'game'
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const time = useMemo(
    () => now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    [now],
  )

  return (
    <main className="phone-home">
      <div className="phone-home-wallpaper" aria-hidden="true" />

      <header className="phone-statusbar">
        <div className="phone-status-left">
          <strong>{time}</strong>
          <small>Sky Mobile</small>
        </div>
        <div className="phone-status-icons" aria-hidden="true">
          <span className="signal">▮▮▮▮</span>
          <span className="wifi">◒</span>
          <span className="battery"><i />100</span>
        </div>
      </header>

      <section className="iphone-home-grid" aria-label="Home smartphone">
        <div className="ios-app-cell sky-cell">
          {isGame ? (
            <button className="ios-app-button sky-app-launcher" type="button" onClick={onOpen} aria-label="Apri Sky Mobile SIM Catch">
              <SkyIcon />
              <span className="ios-app-label">Sky Mobile</span>
            </button>
          ) : (
            <div className="ios-app-button is-static" aria-hidden="true">
              <SkyIcon />
              <span className="ios-app-label">Sky Mobile</span>
            </div>
          )}
        </div>

        {APPS.map((app) => (
          <div className="ios-app-cell" key={app.id} aria-hidden="true">
            <div className="ios-app-button is-static">
              <span className={`ios-app-icon app-${app.tone}`}><b>{app.glyph}</b></span>
              <span className="ios-app-label">{app.label}</span>
            </div>
          </div>
        ))}
      </section>

      {isGame && <div className="ios-home-prompt">Tocca Sky Mobile per iniziare</div>}
      <div className="ios-page-dots" aria-hidden="true"><i className="active" /><i /></div>

      <div className="phone-dock" aria-hidden="true">
        <span className="dock-phone">☎</span>
        <span className="dock-browser">⌖</span>
        <span className="dock-messages">●</span>
        <span className="dock-music">♫</span>
      </div>

      {overlay}
      <div className="dark-home-indicator" aria-hidden="true" />
    </main>
  )
}
