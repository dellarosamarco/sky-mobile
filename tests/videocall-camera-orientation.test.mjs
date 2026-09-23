import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('portrait kiosk keeps webcam upright and mirrored', async () => {
  const [videoCall, main, cameraFix] = await Promise.all([
    read('src/components/VideoCallExperience.jsx'),
    read('src/main.jsx'),
    read('src/videocall-camera-fix.css'),
  ])

  assert.match(videoCall, /<div className={`self-view/)
  assert.match(main, /import '\.\/videocall-camera-fix\.css'/)
  assert.match(cameraFix, /@media \(min-width: 900px\) and \(min-height: 1200px\) and \(orientation: portrait\)/)
  assert.match(cameraFix, /\.self-view video\s*\{[\s\S]*?width:\s*100%[\s\S]*?height:\s*100%[\s\S]*?transform:\s*scaleX\(-1\)[\s\S]*?\}/)
  assert.doesNotMatch(cameraFix, /rotate\(/)
})
