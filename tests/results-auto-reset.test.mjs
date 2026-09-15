import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('every results screen auto-resets to the PIN unless the user retries first', async () => {
  const game = await read('src/components/GameExperienceImpl.jsx')

  assert.doesNotMatch(game, /phase !== 'results' \|\| completedGames < MAX_GAMES/)
  assert.match(game, /if \(phase !== 'results'\) return undefined[\s\S]{0,240}setTimeout\(\(\) => onReset\?\.\(\), RESULT_SECONDS \* 1000\)/)
})

test('all collectible speeds and only SIM spawn increase 5 percent from the current tuning', async () => {
  const game = await read('src/components/GameExperienceImpl.jsx')

  assert.match(game, /SIM_SPEED_MULTIPLIER = 1\.38915/)
  assert.match(game, /FIVE_G_SPEED_MULTIPLIER = 1\.6905/)
  assert.match(game, /X2_SPEED_MULTIPLIER = 1\.911/)
  assert.doesNotMatch(game, /BONUS_SPEED_MULTIPLIER/)
  assert.match(game, /SIM_SPAWN_RATE_MULTIPLIER = 1\.2978/)
  assert.match(game, /NETWORK_SPAWN_WEIGHT = 0\.07/)
  assert.match(game, /FIVE_G_SPAWN_WEIGHT = 0\.11/)
  assert.match(game, /SIM_SPAWN_WEIGHT = 0\.82 \* SIM_SPAWN_RATE_MULTIPLIER/)
  assert.match(game, /TOTAL_SPAWN_WEIGHT = NETWORK_SPAWN_WEIGHT \+ FIVE_G_SPAWN_WEIGHT \+ SIM_SPAWN_WEIGHT/)
  assert.match(game, /const roll = Math\.random\(\) \* TOTAL_SPAWN_WEIGHT/)
  assert.match(game, /spawnEvery = Math\.max\(360, 680 - elapsedSeconds \* 4\.2\) \/ TOTAL_SPAWN_WEIGHT/)
  assert.match(game, /speedMultiplier = type === 'sim' \? SIM_SPEED_MULTIPLIER : type === '5g' \? FIVE_G_SPEED_MULTIPLIER : X2_SPEED_MULTIPLIER/)
  assert.match(game, /speed: \(22 \+ Math\.random\(\) \* 12\) \* speedMultiplier/)
  assert.doesNotMatch(game, /SPAWN_RATE_MULTIPLIER = 1\.1/)
})
