import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('game intro copy is split across exactly two lines in both game modes', async () => {
  const [game, game2] = await Promise.all([
    read('src/components/GameExperienceImpl.jsx'),
    read('src/components/GameExperience2Impl.jsx'),
  ])

  for (const source of [game, game2]) {
    assert.match(source, /<h1>prendi i chip<br \/>e occhio ai bonus<\/h1>/)
    assert.doesNotMatch(source, /Prendi i chip e occhio ai bonus!/) 
  }
})
