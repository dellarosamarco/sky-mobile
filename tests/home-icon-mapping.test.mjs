import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('My Sky uses official Italian App Store artwork and My Sodexo uses the exact PDF reference asset', async () => {
  const [home, iconScript] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.png'/)
  assert.doesNotMatch(home, /mysodexo\.svg/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
})
