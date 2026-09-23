import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('portrait kiosk compensates the physically rotated self-view camera', async () => {
  const [videoCall, main, cameraFix] = await Promise.all([
    read('src/components/VideoCallExperience.jsx'),
    read('src/main.jsx'),
    read('src/videocall-camera-fix.css'),
  ])

  assert.match(videoCall, /<div className={`self-view/)
  assert.match(main, /import '\.\/videocall-camera-fix\.css'/)
  assert.match(cameraFix, /@media \(min-width: 900px\) and \(min-height: 1200px\) and \(orientation: portrait\)/)
  assert.match(cameraFix, /\.self-view video\s*\{[\s\S]*?position:\s*absolute[\s\S]*?left:\s*50%[\s\S]*?top:\s*50%[\s\S]*?width:\s*calc\(100% \/ \.76\)[\s\S]*?height:\s*76%[\s\S]*?rotate\(90deg\)[\s\S]*?scaleY\(-1\)[\s\S]*?\}/)
})
