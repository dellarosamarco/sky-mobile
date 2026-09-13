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
  ['podcasts', 525463029],
  ['files', 1232058109],
  ['whatsapp', 310633997],
  ['instagram', 389801252],
  ['spotify', 324684580],
  ['facetime', 1110145091],
  ['teams', 1113153706],
  ['youtube', 544007664],
  ['mail', 1108187098],
  ['google', 284815942],
  ['copilot365', 541164041],
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

const XFACTOR_ID = 470542789
const xfactorLookupResponse = await fetch(`https://itunes.apple.com/lookup?id=${XFACTOR_ID}&country=it`)
if (!xfactorLookupResponse.ok) {
  throw new Error(`X Factor App Store lookup failed: ${xfactorLookupResponse.status} ${xfactorLookupResponse.statusText}`)
}

const xfactorPayload = await xfactorLookupResponse.json()
const xfactorApp = xfactorPayload.results.find((item) => Number(item.trackId) === XFACTOR_ID)
const xfactorArtworkUrl = xfactorApp?.artworkUrl512 || xfactorApp?.artworkUrl100
if (!xfactorArtworkUrl) {
  throw new Error(`Official Italian X Factor artwork missing (${XFACTOR_ID})`)
}

const xfactorIconResponse = await fetch(xfactorArtworkUrl)
if (!xfactorIconResponse.ok) {
  throw new Error(`Failed to download X Factor icon: ${xfactorIconResponse.status} ${xfactorIconResponse.statusText}`)
}

await writeFile(path.join(outDir, 'xfactor.jpg'), Buffer.from(await xfactorIconResponse.arrayBuffer()))
console.log('Fetched official X Factor 2026 icon from Italian Apple App Store')

const MY_SKY_ID = 1441293148
const mySkyLookupResponse = await fetch(`https://itunes.apple.com/lookup?id=${MY_SKY_ID}&country=it`)
if (!mySkyLookupResponse.ok) {
  throw new Error(`My Sky App Store lookup failed: ${mySkyLookupResponse.status} ${mySkyLookupResponse.statusText}`)
}

const mySkyPayload = await mySkyLookupResponse.json()
const mySkyApp = mySkyPayload.results.find((item) => Number(item.trackId) === MY_SKY_ID)
const mySkyArtworkUrl = mySkyApp?.artworkUrl512 || mySkyApp?.artworkUrl100
if (!mySkyArtworkUrl) {
  throw new Error(`Official Italian My Sky artwork missing (${MY_SKY_ID})`)
}

const mySkyIconResponse = await fetch(mySkyArtworkUrl)
if (!mySkyIconResponse.ok) {
  throw new Error(`Failed to download My Sky icon: ${mySkyIconResponse.status} ${mySkyIconResponse.statusText}`)
}

await writeFile(path.join(outDir, 'mysky.jpg'), Buffer.from(await mySkyIconResponse.arrayBuffer()))
console.log('Fetched official My Sky icon from Italian Apple App Store')

const appStoreFallback = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2fb8ff"/><stop offset="1" stop-color="#0875f5"/></linearGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#b)"/>
  <g fill="none" stroke="#fff" stroke-width="38" stroke-linecap="round" stroke-linejoin="round">
    <path d="M155 354 270 155"/><path d="m224 234 94 120"/><path d="M117 326h278"/>
  </g>
</svg>`

try {
  const appStoreResponse = await fetch('https://commons.wikimedia.org/wiki/Special:Redirect/file/App%20Store%20(iOS,%202024).svg')
  if (!appStoreResponse.ok) throw new Error(`${appStoreResponse.status}`)
  await writeFile(path.join(outDir, 'appstore.svg'), await appStoreResponse.text())
  console.log('Fetched App Store icon artwork')
} catch {
  await writeFile(path.join(outDir, 'appstore.svg'), appStoreFallback)
  console.log('Used local App Store icon fallback')
}

const settingsFallback = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9dadd"/><stop offset="1" stop-color="#74777e"/></linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <g transform="translate(256 256)">
    <circle r="115" fill="none" stroke="#fff" stroke-width="45"/>
    <circle r="42" fill="#85888f"/>
    <g fill="#fff">
      <rect x="-20" y="-174" width="40" height="82" rx="18"/>
      <rect x="-20" y="92" width="40" height="82" rx="18"/>
      <rect x="-174" y="-20" width="82" height="40" rx="18"/>
      <rect x="92" y="-20" width="82" height="40" rx="18"/>
      <rect x="-20" y="-174" width="40" height="82" rx="18" transform="rotate(45)"/>
      <rect x="-20" y="92" width="40" height="82" rx="18" transform="rotate(45)"/>
      <rect x="-174" y="-20" width="82" height="40" rx="18" transform="rotate(45)"/>
      <rect x="92" y="-20" width="82" height="40" rx="18" transform="rotate(45)"/>
    </g>
  </g>
</svg>`

try {
  const settingsResponse = await fetch('https://commons.wikimedia.org/wiki/Special:Redirect/file/Settings%20(iOS).png')
  if (!settingsResponse.ok) throw new Error(`${settingsResponse.status}`)
  const bytes = Buffer.from(await settingsResponse.arrayBuffer())
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><image width="1024" height="1024" href="data:image/png;base64,${bytes.toString('base64')}"/></svg>`
  await writeFile(path.join(outDir, 'settings.svg'), wrapped)
  console.log('Fetched Settings icon artwork')
} catch {
  await writeFile(path.join(outDir, 'settings.svg'), settingsFallback)
  console.log('Used local Settings icon fallback')
}
