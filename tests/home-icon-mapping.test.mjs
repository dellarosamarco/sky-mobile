import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Home uses My Sodexo reference artwork and clean Sky Today vector artwork', async () => {
  const [home, iconScript, skyToday] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
    read('public/app-icons/skytoday.svg'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.png'/)
  assert.match(home, /id: 'skytoday'.*icon: '\/app-icons\/skytoday\.svg'/)
  assert.doesNotMatch(home, /skytoday\.png|skytoday\.webp/)
  assert.doesNotMatch(skyToday, /data:image\//)
  assert.match(skyToday, />sky<\/text>/)
  assert.match(skyToday, />today<\/text>/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
})
