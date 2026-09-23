import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('videocall uses the supplied Del Piero and Luca Argentero media', async () => {
  const video = await read('src/components/VideoCallExperience.jsx')

  assert.match(video, /id: 'talent-a'[\s\S]*?name: 'Alessandro Del Piero'/)
  assert.match(video, /avatar: 'ADP'/)
  assert.match(video, /avatarImage: '\/media\/talent-a\/avatar_2\.jpg'/)
  assert.match(video, /intro: '\/media\/talent-a\/intro\.mp4'/)
  assert.match(video, /correct: '\/media\/talent-a\/correct\.mp4'/)
  assert.match(video, /wrong: '\/media\/talent-a\/wrong\.mp4'/)

  assert.match(video, /id: 'talent-b'[\s\S]*?name: 'Luca Argentero'/)
  assert.match(video, /avatar: 'LA'/)
  assert.match(video, /avatarImage: '\/media\/talent-b\/avatar_2\.jpg'/)
  assert.match(video, /intro: '\/media\/talent-b\/intro\.mp4'/)
  assert.match(video, /correct: '\/media\/talent-b\/correct\.mp4'/)
  assert.match(video, /wrong: '\/media\/talent-b\/wrong\.mp4'/)

  assert.match(video, /const currentVideo = videoStage === 'intro' \? talent\.intro : videoStage === 'correct' \? talent\.correct : talent\.wrong/)
})
