import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('My Sky uses official Italian App Store artwork and My Sodexo keeps the PDF reference artwork', async () => {
  const [home, iconScript, mySodexo] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('scripts/fetch-apple-icons.mjs'),
    read('public/app-icons/mysodexo.svg'),
  ])

  assert.match(home, /id: 'mysky'.*icon: '\/app-icons\/mysky\.jpg'/)
  assert.match(home, /id: 'mysodexo'.*icon: '\/app-icons\/mysodexo\.svg'/)
  assert.match(iconScript, /1441293148/)
  assert.match(iconScript, /country=it/)
  assert.match(mySodexo, />MY<\/text>/)
  assert.match(mySodexo, /stroke="#ff3d57"/)
})
