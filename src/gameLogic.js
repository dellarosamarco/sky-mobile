export function applyCollectible(total, type) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0

  if (type === 'sim') return safeTotal + 1
  if (type === '5g') return safeTotal + 10
  if (type === 'network') return safeTotal * 2
  return safeTotal
}

export function canReplay(completedGames) {
  return completedGames < 2
}
