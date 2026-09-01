import { Link } from 'react-router-dom'

export default function GamePage() {
  return (
    <main className="screen">
      <section className="panel">
        <span className="eyebrow">Sky Mobile</span>
        <h1>Game</h1>
        <p>Base route pronta per il minigioco di raccolta monete.</p>
        <Link className="link" to="/videocall">Vai a /videocall</Link>
      </section>
    </main>
  )
}
