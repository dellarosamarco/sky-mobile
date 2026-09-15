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
  { id: 'skytoday', label: 'Sky Today', icon: '/sky-assets/sky-today.png' },
  { id: 'youtube', label: 'YouTube', icon: '/app-icons/youtube.jpg' },
  { id: 'mysodexo', label: 'My Sodexo', icon: '/app-icons/mysodexo.png' },
  { id: 'mail', label: 'Mail', icon: '/app-icons/mail.jpg' },
  { id: 'google', label: 'Google', icon: '/app-icons/google.jpg' },
  { id: 'sky', label: "Catch 'em all" },
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
      <img className="catch-em-all-chip" src="/sky-assets/chip.png" alt="" draggable="false" />
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

  const openGame = () => {
    primeAudio()
    onOpen?.()
  }

  return (
    <main className="phone-home phone-home--no-statusbar">
      <div className="phone-home-wallpaper" aria-hidden="true" />

      <section className="iphone-home-grid" aria-label="Home smartphone">
        {APPS.map((app) => {
          if (app.id === 'sky') {
            return (
              <div className="ios-app-cell sky-cell" key={app.id}>
                {isGame ? (
                  <button className="ios-app-button sky-app-launcher" type="button" onClick={openGame} aria-label="Apri Catch 'em all">
                    <CatchEmAllIcon />
                    <span className="ios-app-label">Catch 'em all</span>
                  </button>
                ) : (
                  <div className="ios-app-button is-static" aria-hidden="true">
                    <CatchEmAllIcon />
                    <span className="ios-app-label">Catch 'em all</span>
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
