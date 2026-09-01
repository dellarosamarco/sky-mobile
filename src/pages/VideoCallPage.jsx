import { Link } from 'react-router-dom'

export default function VideoCallPage() {
  return (
    <main className="screen">
      <section className="panel">
        <span className="eyebrow">Sky Mobile</span>
        <h1>Video call</h1>
        <p>Base route pronta per la videochiamata simulata con video preregistrati e risposte.</p>
        <Link className="link" to="/game">Vai a /game</Link>
      </section>
    </main>
  )
}
