import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Sky Today uses the client-supplied PNG asset', async () => {
  const [home, assetScript] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/prepare-sky-assets.mjs'),
  ])

  assert.match(assetScript, /Icona Sky Today\.png/)
  assert.match(assetScript, /sky-today\.png/)
  assert.match(home, /\/sky-assets\/sky-today\.png/)
  assert.doesNotMatch(home, /\/app-icons\/skytoday\.svg/)
})
