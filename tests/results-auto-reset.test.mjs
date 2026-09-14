import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('every results screen auto-resets to the PIN unless the user retries first', async () => {
  const game = await read('src/components/GameExperienceImpl.jsx')

  assert.doesNotMatch(game, /phase !== 'results' \|\| completedGames < MAX_GAMES/)
  assert.match(game, /if \(phase !== 'results'\) return undefined[\s\S]{0,240}setTimeout\(\(\) => onReset\?\.\(\), RESULT_SECONDS \* 1000\)/)
})

test('gameplay uses the requested speed and spawn multipliers', async () => {
  const game = await read('src/components/GameExperienceImpl.jsx')

  assert.match(game, /SIM_SPEED_MULTIPLIER = 1\.2/)
  assert.match(game, /BONUS_SPEED_MULTIPLIER = 1\.4/)
  assert.match(game, /SPAWN_RATE_MULTIPLIER = 1\.1/)
  assert.match(game, /spawnEvery = Math\.max\(360, 680 - elapsedSeconds \* 4\.2\) \/ SPAWN_RATE_MULTIPLIER/)
  assert.match(game, /speedMultiplier = type === 'sim' \? SIM_SPEED_MULTIPLIER : BONUS_SPEED_MULTIPLIER/)
  assert.match(game, /speed: \(22 \+ Math\.random\(\) \* 12\) \* speedMultiplier/)
})
