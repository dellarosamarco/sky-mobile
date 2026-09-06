import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const APPS = [
  ['messages', 1146560473],
  ['camera', 1584216193],
  ['maps', 915056765],
  ['weather', 1069513131],
  ['photos', 1584215428],
  ['notes', 1110145109],
  ['safari', 1146562112],
  ['phone', 1146562108],
  ['music', 1108187390],
]

const outDir = path.resolve('public/app-icons')
await mkdir(outDir, { recursive: true })

const ids = APPS.map(([, id]) => id).join(',')
const lookupUrl = `https://itunes.apple.com/lookup?id=${ids}&country=us`
const response = await fetch(lookupUrl)

if (!response.ok) {
  throw new Error(`Apple icon lookup failed: ${response.status} ${response.statusText}`)
}

const payload = await response.json()
const byId = new Map(payload.results.map((item) => [Number(item.trackId), item]))

for (const [name, id] of APPS) {
  const app = byId.get(id)
  const artworkUrl = app?.artworkUrl512 || app?.artworkUrl100

  if (!artworkUrl) {
    throw new Error(`Official App Store artwork missing for ${name} (${id})`)
  }

  const iconResponse = await fetch(artworkUrl)
  if (!iconResponse.ok) {
    throw new Error(`Failed to download ${name} icon: ${iconResponse.status} ${iconResponse.statusText}`)
  }

  const bytes = Buffer.from(await iconResponse.arrayBuffer())
  await writeFile(path.join(outDir, `${name}.jpg`), bytes)
  console.log(`Fetched official ${name} icon from Apple App Store`)
}
