import test from 'node:test'
import assert from 'node:assert/strict'
import { applyCollectible, canReplay } from '../src/gameLogic.js'

test('standard SIM adds one', () => {
  assert.equal(applyCollectible(7, 'sim'), 8)
})

test('5G adds ten', () => {
  assert.equal(applyCollectible(7, '5g'), 17)
})

test('network doubles current SIM total', () => {
  assert.equal(applyCollectible(7, 'network'), 14)
})

test('unknown collectible leaves the total unchanged', () => {
  assert.equal(applyCollectible(7, 'unknown'), 7)
})

test('only one replay is allowed per unlocked session', () => {
  assert.equal(canReplay(1), true)
  assert.equal(canReplay(2), false)
})
