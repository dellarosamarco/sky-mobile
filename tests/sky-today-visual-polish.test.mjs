import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Sky Today gets dedicated visual treatment instead of generic double rounding', async () => {
  const [home, css] = await Promise.all([
    read('src/components/PhoneHome.jsx'),
    read('src/official-icons.css'),
  ])

  assert.match(home, /sky-today-app-icon/)
  assert.match(css, /\.sky-today-app-icon\s*\{/)
  assert.match(css, /border-radius:\s*18%/)
  assert.match(css, /\.sky-today-app-icon \.ios-app-artwork\s*\{[\s\S]*transform:\s*scale\(1\.09\)/)
})
