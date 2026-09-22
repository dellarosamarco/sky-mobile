import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('/game2 keeps the game flow but uses random static collectibles with a two second lifetime', async () => {
  const [app, page, game2] = await Promise.all([
    read('src/App.jsx'),
    read('src/pages/Game2Page.jsx'),
    read('src/components/GameExperience2Impl.jsx'),
  ])

  assert.match(app, /import Game2Page from '\.\/pages\/Game2Page'/)
  assert.match(app, /<Route path="\/game2" element=\{<Game2Page \/>\} \/>/)

  assert.match(page, /<IPhoneLockScreen pin="1234"/)
  assert.match(page, /<PhoneHome mode="game"/)
  assert.match(page, /<GameExperience2 onReset=\{reset\} \/>/)

  assert.match(game2, /const COLLECTIBLE_LIFETIME_MS = 2000/)
  assert.match(game2, /spawnedAt:\s*now/)
  assert.match(game2, /x:\s*9 \+ Math\.random\(\) \* 82/)
  assert.match(game2, /y:\s*18 \+ Math\.random\(\) \* 70/)
  assert.match(game2, /now - item\.spawnedAt < COLLECTIBLE_LIFETIME_MS/)
  assert.doesNotMatch(game2, /item\.y \+ item\.speed/)
  assert.doesNotMatch(game2, /speed:\s*\(22 \+ Math\.random\(\) \* 12\)/)
  assert.match(game2, /<h1>prendi i chip<br \/>e occhio ai bonus<\/h1>/)
  assert.match(game2, /Punteggio/)
  assert.match(game2, /Con Sky Mobile puoi avere anche giga illimitati/)
})

test('/game2 collectibles fade in and out, float subtly and do not render the falling-game shadow', async () => {
  const [game2, css] = await Promise.all([
    read('src/components/GameExperience2Impl.jsx'),
    read('src/game-rules.css'),
  ])

  assert.match(game2, /className=\{`collectible game2-collectible collectible--\$\{item\.type\}`\}/)
  assert.match(css, /\.game2-collectible\s*\{[\s\S]*?filter:\s*none[\s\S]*?animation:\s*game2-collectible-life\s+2s/)
  assert.match(css, /\.game2-collectible\s*>\s*\.falling-chip[\s\S]*?animation:\s*game2-chip-float/)
  assert.match(css, /@keyframes game2-collectible-life/)
  assert.match(css, /@keyframes game2-chip-float/)
  assert.match(css, /\.game2-collectible\.collectible--sim\s+\.falling-chip\s*\{[\s\S]*?filter:\s*none/)
})
