import { useEffect, useMemo, useState } from 'react'

const APPS = [
  { id: 'messages', label: 'Messaggi', icon: '/app-icons/messages.jpg' },
  { id: 'camera', label: 'Fotocamera', icon: '/app-icons/camera.jpg' },
  { id: 'maps', label: 'Mappe', icon: '/app-icons/maps.jpg' },
  { id: 'weather', label: 'Meteo', icon: '/app-icons/weather.jpg' },
  { id: 'photos', label: 'Foto', icon: '/app-icons/photos.jpg' },
  { id: 'notes', label: 'Note', icon: '/app-icons/notes.jpg' },
  { id: 'safari', label: 'Safari', icon: '/app-icons/safari.jpg' },
]

const DOCK_APPS = [
  { id: 'phone', label: 'Telefono', icon: '/app-icons/phone.jpg' },
  { id: 'safari', label: 'Safari', icon: '/app-icons/safari.jpg' },
  { id: 'messages', label: 'Messaggi', icon: '/app-icons/messages.jpg' },
  { id: 'music', label: 'Musica', icon: '/app-icons/music.jpg' },
]

function SkyIcon() {
  return (
    <span className="ios-app-icon sky-home-icon">
      <span className="sky-wordmark">sky</span>
      <span className="mobile-wordmark">mobile</span>
    </span>
  )
}

function AppleArtwork({ src, label }) {
  return (
    <span className="ios-app-icon ios-official-app-icon">
      <img className="ios-app-artwork" src={src} alt={`${label} app`} draggable="false" />
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
              <AppleArtwork src={app.icon} label={app.label} />
              <span className="ios-app-label">{app.label}</span>
            </div>
          </div>
        ))}
      </section>

      {isGame && <div className="ios-home-prompt">Tocca Sky Mobile per iniziare</div>}
      <div className="ios-page-dots" aria-hidden="true"><i className="active" /><i /></div>

      <div className="phone-dock" aria-hidden="true">
        {DOCK_APPS.map((app) => (
          <span className="ios-dock-app" key={app.id}>
            <img src={app.icon} alt="" draggable="false" />
          </span>
        ))}
      </div>

      {overlay}
      <div className="dark-home-indicator" aria-hidden="true" />
    </main>
  )
}
