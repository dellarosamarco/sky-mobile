import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('X Factor home icon comes from the official Italian App Store artwork', async () => {
  const [home, fetchScript] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
  ])

  assert.match(home, /xfactor\.jpg/)
  assert.doesNotMatch(home, /xfactor\.svg/)
  assert.match(fetchScript, /470542789/)
  assert.match(fetchScript, /country=it/)
})
