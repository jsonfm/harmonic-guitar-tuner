export interface DetectedPitch {
  frequency: number
  clarity: number
  rms: number
}

export function detectPitchYin(
  buffer: Float32Array,
  sampleRate: number,
  threshold = 0.12,
): DetectedPitch | null {
  let sumSquares = 0
  for (const sample of buffer) sumSquares += sample * sample
  const rms = Math.sqrt(sumSquares / buffer.length)
  if (rms < 0.003) return null

  const minLag = Math.max(2, Math.floor(sampleRate / 1100))
  const maxLag = Math.min(Math.floor(sampleRate / 55), Math.floor(buffer.length / 2))
  const difference = new Float32Array(maxLag + 1)
  const cumulative = new Float32Array(maxLag + 1)

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0
    for (let index = 0; index < maxLag; index += 1) {
      const delta = buffer[index] - buffer[index + lag]
      sum += delta * delta
    }
    difference[lag] = sum
  }

  cumulative[0] = 1
  let runningSum = 0
  for (let lag = 1; lag <= maxLag; lag += 1) {
    runningSum += difference[lag]
    cumulative[lag] = runningSum === 0 ? 1 : (difference[lag] * lag) / runningSum
  }

  let lag = minLag
  while (lag <= maxLag) {
    if (cumulative[lag] < threshold) {
      while (lag + 1 <= maxLag && cumulative[lag + 1] < cumulative[lag]) lag += 1
      const previous = cumulative[lag - 1]
      const current = cumulative[lag]
      const next = cumulative[lag + 1] ?? current
      const denominator = 2 * (2 * current - next - previous)
      const adjustment = denominator === 0 ? 0 : (next - previous) / denominator
      const refinedLag = lag + Math.max(-1, Math.min(1, adjustment))
      return {
        frequency: sampleRate / refinedLag,
        clarity: Math.max(0, Math.min(1, 1 - current)),
        rms,
      }
    }
    lag += 1
  }

  return null
}
