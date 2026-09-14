import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Sky Today uses the standard app icon rendering with no dedicated crop hacks', async () => {
  const [home, css] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('src/official-icons.css'),
  ])

  assert.doesNotMatch(home, /sky-today-app-icon/)
  assert.match(home, /function AppleArtwork\(\{ src, label \}\)/)
  assert.match(home, /<AppleArtwork src=\{app\.icon\} label=\{app\.label\} \/>/)
  assert.doesNotMatch(css, /\.sky-today-app-icon/)
  assert.doesNotMatch(css, /scale\(1\.09\)/)
})
