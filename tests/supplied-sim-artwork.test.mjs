import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the supplied SIM artwork is reused in gameplay, intro and the catch em all launcher', async () => {
  const [game, home, artwork] = await Promise.all([
    read('src/components/GameExperienceImpl.jsx'),
    read('src/components/PhoneHome.jsx'),
    read('src/sim-artwork.css'),
  ])

  assert.match(artwork, /data:image\/webp;base64/)
  assert.match(game, /falling-sim supplied-sim-art/)
  assert.match(home, /falling-sim supplied-sim-art catch-em-all-sim/)
  assert.doesNotMatch(game, /collectible-sim-art/)
  assert.doesNotMatch(home, /catch-em-all\.svg/)
})
