import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('September Sky feedback remains implemented across lock, home, game and video call', async () => {
  const [lockCss, home, game, video] = await Promise.all([
    read('src/viewport-fix.css'),
    read('src/components/PhoneHome.jsx'),
    read('src/components/GameExperienceImpl.jsx'),
    read('src/components/VideoCallExperience.jsx'),
  ])

  assert.match(lockCss, /\.ios-passcode-panel\s*\{[\s\S]*?translateY\(-50px\)/)

  const appsBlock = home.match(/const APPS = \[([\s\S]*?)\]\n\nconst DOCK_APPS/)?.[1] ?? ''
  const dockBlock = home.match(/const DOCK_APPS = \[([\s\S]*?)\]\n/)?.[1] ?? ''
  for (const id of ['spotify', 'facetime', 'teams', 'mysky', 'xfactor', 'skytoday', 'youtube', 'mysodexo']) {
    assert.match(appsBlock, new RegExp(`id: '${id}'`))
  }
  assert.doesNotMatch(appsBlock, /id: 'safari'/)
  assert.doesNotMatch(appsBlock, /id: 'messages'/)
  assert.match(dockBlock, /id: 'safari'/)
  assert.match(dockBlock, /id: 'messages'/)
  assert.match(home, /catch 'em all/)
  assert.match(home, /supplied-sim-art/)

  assert.match(game, /const GAME_SECONDS = 30/)
  assert.match(game, /const COUNTDOWN_SECONDS = 3/)
  assert.match(game, /const INTRO_MS = 8300/)
  assert.doesNotMatch(game, /TARGET_SIMS|\/35|Tentativo|Raccogli almeno 35|shopper|catcher/i)
  assert.match(game, /Prendi più SIM possibili prima dello scadere del tempo!/)
  assert.match(game, /onPointerDown=\{\(event\) => collectItem\(event, item\)\}/)
  assert.match(game, /SIM PRESE/)
  assert.match(game, /Giga consumati/)
  assert.match(game, /Con Sky Mobile hai/)
  assert.match(game, />Riprova<\/button>/)

  assert.match(video, /incoming-call-screen/)
  assert.match(video, /slide-answer-track/)
  assert.match(video, /onPointerMove=\{onSlidePointerMove\}/)
  assert.doesNotMatch(video, /ios-call-banner/)
  assert.doesNotMatch(video, /Grazie!/)
  assert.match(video, /Chiamata terminata/)
})
