import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Home uses the supplied reference artwork for My Sodexo and Sky Today', async () => {
  const [home, iconScript] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.png'/)
  assert.match(home, /id: 'skytoday'.*icon: '\/app-icons\/skytoday\.png'/)
  assert.doesNotMatch(home, /mysodexo\.svg/)
  assert.doesNotMatch(home, /skytoday\.svg/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
})
