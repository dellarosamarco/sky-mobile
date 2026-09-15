import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the supplied Chip artwork replaces the old SIM artwork in game and launcher', async () => {
  const [game, home, assetScript] = await Promise.all([
    read('src/components/GameExperienceImpl.jsx'),
    read('src/components/PhoneHome.jsx'),
    read('scripts/prepare-sky-assets.mjs'),
  ])

  assert.match(assetScript, /Grafica Chip - Sky_Mobile\.png/)
  assert.match(game, /\/sky-assets\/chip\.png/)
  assert.match(home, /\/sky-assets\/chip\.png/)
  assert.doesNotMatch(game, /falling-sim supplied-sim-art|collectible-sim-art/)
  assert.doesNotMatch(home, /falling-sim supplied-sim-art|catch-em-all\.svg/)
})
