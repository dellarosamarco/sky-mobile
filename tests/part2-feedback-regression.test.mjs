import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Sky part 2 assets and home feedback are wired to the supplied materials', async () => {
  const [pkg, main, home, assetScript, fonts, settings] = await Promise.all([
    read('package.json'),
    read('src/main.jsx'),
    read('src/components/PhoneHome.jsx'),
    read('scripts/prepare-sky-assets.mjs'),
    read('src/sky-fonts.css'),
    read('public/app-icons/settings-clean.svg'),
  ])

  assert.match(pkg, /"prepare:sky"/)
  assert.match(pkg, /npm run prepare:sky/)
  assert.match(assetScript, /Grafica Chip - Sky_Mobile\.png/)
  assert.match(assetScript, /ChatGPT Image 15 set 2026, 13_12_15\.png/)
  assert.doesNotMatch(assetScript, /ChatGPT Image 15 set 2026, 11_49_06\.png/)
  assert.doesNotMatch(assetScript, /Icona Sky Today\.png/)
  assert.match(assetScript, /SKYTEXT-REGULAR\.TTF/)
  assert.match(assetScript, /SKYTEXT-MEDIUM\.TTF/)
  assert.match(main, /import '\.\/sky-fonts\.css'/)
  assert.match(main, /import '\.\/sky-part2\.css'/)
  assert.match(fonts, /@font-face[\s\S]*Sky Text[\s\S]*skytext-regular\.ttf/)
  assert.match(fonts, /@font-face[\s\S]*skytext-medium\.ttf[\s\S]*font-weight:\s*500/)

  assert.match(home, /skytoday'.*\/sky-assets\/sky-today\.png/)
  assert.match(home, /settings'.*\/app-icons\/settings-clean\.svg/)
  assert.match(home, /label: "Catch 'em all"/)
  assert.match(home, /\/sky-assets\/chip\.png/)
  assert.doesNotMatch(home, /phone-statusbar|iphone-status-time|CellularIcon|WifiIcon|BatteryIcon/)
  assert.match(settings, /^<svg[\s>]/)
})

test('Sky part 2 game copy, chip artwork and results layout are implemented', async () => {
  const game = await read('src/components/GameExperienceImpl.jsx')

  assert.match(game, /Prendi i chip e occhio ai bonus!/)
  assert.match(game, /\/sky-assets\/chip\.png/)
  assert.doesNotMatch(game, /CATCH 'EM ALL|Tocca direttamente le SIM|Preparati|Tocca le SIM per prenderle|game-copy-strip|tap-game-hint/)
  assert.match(game, /<small>PUNTEGGIO<\/small>/)
  assert.doesNotMatch(game, /Partita terminata|SIM prese|Giga consumati|Con Sky Mobile hai/)
  assert.match(game, /result-box[\s\S]*Punteggio[\s\S]*\{simCount\}/)
  assert.match(game, /result-box[\s\S]*Giga[\s\S]*Con Sky Mobile puoi avere anche giga illimitati/)
  assert.match(game, /event\.currentTarget\.style\.pointerEvents = 'none'/)
})

test('intro chip uses glow, float and pulse animation without affecting gameplay collectibles', async () => {
  const css = await read('src/sky-part2.css')

  assert.match(css, /\.intro-chip-card::before/)
  assert.match(css, /animation:\s*intro-chip-float/)
  assert.match(css, /animation:\s*intro-chip-glow/)
  assert.match(css, /animation:\s*intro-chip-pop/)
  assert.match(css, /@keyframes intro-chip-float/)
  assert.match(css, /@keyframes intro-chip-glow/)
  assert.match(css, /@keyframes intro-chip-pop/)
  assert.match(css, /drop-shadow\([^)]*rgba\(88,190,255/)
  assert.doesNotMatch(css, /\.collectible--sim[^}]*animation:\s*intro-chip-/s)
})

test('Sky part 2 video call feedback is implemented without replacing pending talent content', async () => {
  const video = await read('src/components/VideoCallExperience.jsx')

  assert.doesNotMatch(video, /<p>Scorri per rispondere<\/p>/)
  assert.match(video, />Scorri per rispondere<\/span>/)
  assert.match(video, /<span aria-hidden="true">📞<\/span>/)
  assert.match(video, /ended-icon[\s\S]*\/sky-assets\/chip\.png/)
  assert.match(video, /aspectRatio: \{ ideal: 9 \/ 16 \}/)
  assert.match(video, /orientation\?\.lock\?\.\('portrait-primary'\)/)
  assert.match(video, /Talent 2/)
  assert.match(video, /copy definitiva da inserire/)
})
