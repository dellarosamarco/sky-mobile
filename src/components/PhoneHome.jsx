import { useEffect, useMemo, useState } from 'react'
import { primeAudio } from '../utils/audio'

const APPS = [
  { id: 'maps', label: 'Mappe', icon: '/app-icons/maps.jpg' },
  { id: 'appstore', label: 'App Store', icon: '/app-icons/appstore.svg' },
  { id: 'podcasts', label: 'Podcast', icon: '/app-icons/podcasts.jpg' },
  { id: 'settings', label: 'Impostazioni', icon: '/app-icons/settings.svg' },
  { id: 'files', label: 'File', icon: '/app-icons/files.jpg' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '/app-icons/whatsapp.jpg' },
  { id: 'instagram', label: 'Instagram', icon: '/app-icons/instagram.jpg' },
  { id: 'spotify', label: 'Spotify', icon: '/app-icons/spotify.jpg' },
  { id: 'facetime', label: 'FaceTime', icon: '/app-icons/facetime.jpg' },
  { id: 'teams', label: 'Teams', icon: '/app-icons/teams.jpg' },
  { id: 'xfactor', label: 'X Factor', icon: '/app-icons/xfactor.jpg' },
  { id: 'mysky', label: 'My Sky', icon: '/app-icons/mysky.jpg' },
  { id: 'skytoday', label: 'Sky Today', icon: '/app-icons/skytoday.svg' },
  { id: 'youtube', label: 'YouTube', icon: '/app-icons/youtube.jpg' },
  { id: 'mysodexo', label: 'My Sodexo', icon: '/app-icons/mysodexo.png' },
  { id: 'mail', label: 'Mail', icon: '/app-icons/mail.jpg' },
  { id: 'google', label: 'Google', icon: '/app-icons/google.jpg' },
  { id: 'sky', label: "catch 'em all" },
  { id: 'copilot365', label: 'Microsoft 365', icon: '/app-icons/copilot365.jpg' },
  { id: 'camera', label: 'Fotocamera', icon: '/app-icons/camera.jpg' },
  { id: 'weather', label: 'Meteo', icon: '/app-icons/weather.jpg' },
  { id: 'photos', label: 'Foto', icon: '/app-icons/photos.jpg' },
  { id: 'notes', label: 'Note', icon: '/app-icons/notes.jpg' },
]

const DOCK_APPS = [
  { id: 'phone', label: 'Telefono', icon: '/app-icons/phone.jpg' },
  { id: 'safari', label: 'Safari', icon: '/app-icons/safari.jpg' },
  { id: 'messages', label: 'Messaggi', icon: '/app-icons/messages.jpg' },
  { id: 'music', label: 'Musica', icon: '/app-icons/music.jpg' },
]

function CatchEmAllIcon() {
  return (
    <span className="ios-app-icon sky-home-icon catch-em-all-icon" aria-hidden="true">
      <span className="falling-sim supplied-sim-art catch-em-all-sim" />
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

function CellularIcon() {
  return (
    <svg className="iphone-cellular" viewBox="0 0 18 12" aria-hidden="true">
      <rect x="0" y="7" width="3" height="5" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg className="iphone-wifi" viewBox="0 0 20 14" aria-hidden="true">
      <path d="M1.5 4.1a13 13 0 0 1 17 0" />
      <path d="M4.5 7.3a8.6 8.6 0 0 1 11 0" />
      <path d="M7.6 10.3a4 4 0 0 1 4.8 0" />
      <circle cx="10" cy="12.1" r="1.15" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <span className="iphone-battery" aria-hidden="true">
      <span className="iphone-battery-shell">
        <span className="iphone-battery-level" />
        <span className="iphone-battery-value">78</span>
      </span>
      <span className="iphone-battery-cap" />
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

  const openGame = () => {
    primeAudio()
    onOpen?.()
  }

  return (
    <main className="phone-home">
      <div className="phone-home-wallpaper" aria-hidden="true" />

      <header className="phone-statusbar iphone-statusbar" aria-label={`Ora ${time}`}>
        <strong className="iphone-status-time">{time}</strong>
        <div className="iphone-status-right" aria-hidden="true">
          <CellularIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </header>

      <section className="iphone-home-grid" aria-label="Home smartphone">
        {APPS.map((app) => {
          if (app.id === 'sky') {
            return (
              <div className="ios-app-cell sky-cell" key={app.id}>
                {isGame ? (
                  <button className="ios-app-button sky-app-launcher" type="button" onClick={openGame} aria-label="Apri catch 'em all">
                    <CatchEmAllIcon />
                    <span className="ios-app-label">catch 'em all</span>
                  </button>
                ) : (
                  <div className="ios-app-button is-static" aria-hidden="true">
                    <CatchEmAllIcon />
                    <span className="ios-app-label">catch 'em all</span>
                  </div>
                )}
              </div>
            )
          }

          return (
            <div className="ios-app-cell" key={app.id} aria-hidden="true">
              <div className="ios-app-button is-static">
                <AppleArtwork src={app.icon} label={app.label} />
                <span className="ios-app-label">{app.label}</span>
              </div>
            </div>
          )
        })}
      </section>

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
