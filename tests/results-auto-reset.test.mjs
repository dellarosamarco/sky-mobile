import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('every results screen auto-resets to the PIN unless the user retries first', async () => {
  const game = await read('src/components/GameExperience.jsx')

  assert.doesNotMatch(game, /phase !== 'results' \|\| completedGames < MAX_GAMES/)
  assert.match(game, /if \(phase !== 'results'\) return undefined[\s\S]{0,240}setTimeout\(\(\) => onReset\?\.\(\), RESULT_SECONDS \* 1000\)/)
})
