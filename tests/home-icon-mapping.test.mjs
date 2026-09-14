import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Home uses the supplied reference artwork for My Sodexo and Sky Today', async () => {
  const [home, iconScript, skyToday] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
    read('public/app-icons/skytoday.svg'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.png'/)
  assert.match(home, /id: 'skytoday'.*icon: '\/app-icons\/skytoday\.svg'/)
  assert.doesNotMatch(home, /skytoday\.png|skytoday\.webp/)
  assert.match(skyToday, /data:image\/webp;base64,UklG/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
})
