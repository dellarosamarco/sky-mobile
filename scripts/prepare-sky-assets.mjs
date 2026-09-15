import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('public/sky-assets')
await mkdir(outDir, { recursive: true })

const assets = [
  ['Grafica Chip - Sky_Mobile.png', 'chip.png'],
  ['Icona Sky Today.png', 'sky-today.png'],
  ['SKYTEXT-REGULAR.TTF', 'skytext-regular.ttf'],
  ['SKYTEXT-MEDIUM.TTF', 'skytext-medium.ttf'],
]

for (const [source, target] of assets) {
  await copyFile(path.resolve(source), path.join(outDir, target))
  console.log(`Prepared Sky asset: ${target}`)
}
