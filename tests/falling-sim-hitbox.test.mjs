import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('falling SIMs use a 105 percent hitbox without changing the visible chip or game2', async () => {
  const [game, game2, rulesCss, visualCss] = await Promise.all([
    read('src/components/GameExperienceImpl.jsx'),
    read('src/components/GameExperience2Impl.jsx'),
    read('src/game-rules.css'),
    read('src/sky-part2.css'),
  ])

  assert.match(game, /collectible--hitbox-105/)
  assert.doesNotMatch(game2, /collectible--hitbox-105/)
  assert.match(rulesCss, /\.collectible--hitbox-105::before\s*\{[\s\S]*?inset:\s*-2\.5%[\s\S]*?pointer-events:\s*auto[\s\S]*?\}/)
  assert.match(visualCss, /\.collectible--sim \.falling-chip\s*\{[\s\S]*?width:\s*92%[\s\S]*?height:\s*92%/)
})
