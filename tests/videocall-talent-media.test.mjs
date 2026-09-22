import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('talent 1 uses the supplied Del Piero intro and answer videos', async () => {
  const video = await read('src/components/VideoCallExperience.jsx')

  assert.match(video, /id: 'talent-a'[\s\S]*?name: 'Alessandro Del Piero'/)
  assert.match(video, /avatar: 'ADP'/)
  assert.match(video, /intro: 'https:\/\/sky-game-bay\.vercel\.app\/media\/talent-a\/intro\.mp4'/)
  assert.match(video, /correct: 'https:\/\/sky-game-bay\.vercel\.app\/media\/talent-a\/correct\.mp4'/)
  assert.match(video, /wrong: 'https:\/\/sky-game-bay\.vercel\.app\/media\/talent-a\/wrong\.mp4'/)
  assert.match(video, /id: 'talent-b'[\s\S]*?name: 'Talent 2'/)
  assert.match(video, /const currentVideo = videoStage === 'intro' \? talent\.intro : videoStage === 'correct' \? talent\.correct : talent\.wrong/)
})
