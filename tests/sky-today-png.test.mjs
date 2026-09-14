import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const file = new URL('../public/app-icons/skytoday.png', import.meta.url)

test('Sky Today reference asset is a valid PNG file', async () => {
  const bytes = await readFile(file)
  const signature = bytes.subarray(0, 8).toString('hex')
  assert.equal(signature, '89504e470d0a1a0a')
})
