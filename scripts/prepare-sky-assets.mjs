import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('public/sky-assets')
await mkdir(outDir, { recursive: true })

const assets = [
  ['Grafica Chip - Sky_Mobile.png', 'chip.png'],
  ['ChatGPT Image 15 set 2026, 11_49_06.png', 'sky-today.png'],
  ['SKYTEXT-REGULAR.TTF', 'skytext-regular.ttf'],
  ['SKYTEXT-MEDIUM.TTF', 'skytext-medium.ttf'],
]

for (const [source, target] of assets) {
  await copyFile(path.resolve(source), path.join(outDir, target))
  console.log(`Prepared Sky asset: ${target}`)
}
