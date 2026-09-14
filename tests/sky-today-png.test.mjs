import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const file = new URL('../public/app-icons/skytoday.svg', import.meta.url)

test('Sky Today artwork is clean vector SVG without embedded screenshot artifacts', async () => {
  const svg = await readFile(file, 'utf8')

  assert.match(svg, /^<svg[\s>]/)
  assert.doesNotMatch(svg, /<image\b/)
  assert.doesNotMatch(svg, /data:image\//)
  assert.match(svg, /<rect[^>]+rx=/)
  assert.match(svg, />sky<\/text>/)
  assert.match(svg, />today<\/text>/)
})
