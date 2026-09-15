import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Home uses supplied Sky Today, My Sodexo and clean Settings artwork', async () => {
  const [home, iconScript, assetScript, settings] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
    read('scripts/prepare-sky-assets.mjs'),
    read('public/app-icons/settings-clean.svg'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.png'/)
  assert.match(home, /id: 'skytoday'.*icon: '\/sky-assets\/sky-today\.png'/)
  assert.match(home, /id: 'settings'.*icon: '\/app-icons\/settings-clean\.svg'/)
  assert.match(assetScript, /Icona Sky Today\.png/)
  assert.match(settings, /^<svg[\s>]/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
})
