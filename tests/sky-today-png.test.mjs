import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Sky Today uses the latest client-supplied PNG asset', async () => {
  const [home, assetScript] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/prepare-sky-assets.mjs'),
  ])

  assert.match(assetScript, /ChatGPT Image 15 set 2026, 11_49_06\.png/)
  assert.doesNotMatch(assetScript, /Icona Sky Today\.png/)
  assert.match(assetScript, /sky-today\.png/)
  assert.match(home, /\/sky-assets\/sky-today\.png/)
  assert.doesNotMatch(home, /\/app-icons\/skytoday\.svg/)
})
