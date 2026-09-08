import { getAudioContext } from './utils/audio'

let lastSecond = null

function reinforceFinalWarning(second) {
  const context = getAudioContext()
  if (!context || context.state !== 'running') return

  const progress = 5 - second
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.value = 726 + progress * 115
  gain.gain.setValueAtTime(0.022, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.105)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.105)
}

function checkTimer() {
  const timer = document.querySelector('.game-field .game-hud .urgent strong')
  if (!timer) {
    lastSecond = null
    return
  }

  const match = timer.textContent?.match(/00:(\d{2})/)
  if (!match) return

  const second = Number(match[1])
  if (second > 5) {
    lastSecond = null
    return
  }

  if (second >= 1 && second <= 5 && second !== lastSecond) {
    lastSecond = second
    reinforceFinalWarning(second)
  }
}

// A lightweight check avoids tying extra work to the 60fps SIM render loop.
window.setInterval(checkTimer, 120)
