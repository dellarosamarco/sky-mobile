let sharedContext = null

export function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!sharedContext || sharedContext.state === 'closed') sharedContext = new AudioContext()
  return sharedContext
}

export function primeAudio() {
  const context = getAudioContext()
  if (!context) return null
  if (context.state === 'suspended') context.resume().catch(() => {})

  // A silent one-frame buffer is enough to bind audio permission to the user gesture.
  try {
    const buffer = context.createBuffer(1, 1, context.sampleRate)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start(0)
  } catch {
    // Audio is an enhancement; the experience must remain usable if unavailable.
  }

  return context
}
