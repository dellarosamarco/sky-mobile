export default function PhoneHome({ mode = 'game', onOpen }) {
  const isGame = mode === 'game'

  return (
    <main className="phone-home">
      <div className="phone-home-wallpaper" aria-hidden="true" />
      <header className="phone-statusbar">
        <strong>Sky Mobile</strong>
        <div className="phone-status-icons" aria-hidden="true">
          <span className="signal">●●●●</span>
          <span className="wifi">⌁</span>
          <span className="battery">100</span>
        </div>
      </header>

      <section className="phone-home-content">
        {isGame ? (
          <button className="sky-app-launcher" type="button" onClick={onOpen} aria-label="Apri Sky Mobile SIM Catch">
            <span className="sky-app-icon">
              <span className="sky-wordmark">sky</span>
              <span className="mobile-wordmark">mobile</span>
            </span>
            <span className="sky-app-name">Sky Mobile</span>
            <span className="tap-hint">Tocca per giocare</span>
          </button>
        ) : (
          <div className="home-idle-hint" aria-hidden="true">
            <span className="mini-clock">Home</span>
          </div>
        )}
      </section>

      <div className="phone-dock" aria-hidden="true">
        <span>☎</span><span>◉</span><span>✉</span><span>♫</span>
      </div>
      <div className="dark-home-indicator" aria-hidden="true" />
    </main>
  )
}
