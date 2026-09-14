import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const file = new URL('../public/app-icons/skytoday.svg', import.meta.url)

test('Sky Today reference asset embeds a valid WebP payload', async () => {
  const svg = await readFile(file, 'utf8')
  const match = svg.match(/data:image\/webp;base64,([^\"]+)/)
  assert.ok(match, 'embedded WebP data URI missing')
  const bytes = Buffer.from(match[1], 'base64')
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF')
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP')
})
