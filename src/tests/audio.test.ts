import { describe, expect, it } from 'vitest'
import { detectPitchYin } from '../audio/pitchDetector'
import { PitchSmoother } from '../audio/signalSmoothing'

function sineWave(frequency: number, sampleRate = 48_000, size = 4096) {
  return Float32Array.from({ length: size }, (_, index) =>
    Math.sin((2 * Math.PI * frequency * index) / sampleRate),
  )
}

describe('audio analysis', () => {
  it('detects a clean guitar-range sine wave', () => {
    const result = detectPitchYin(sineWave(110), 48_000)
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(110, 0)
    expect(result!.clarity).toBeGreaterThan(0.9)
  })

  it('ignores silence', () => {
    expect(detectPitchYin(new Float32Array(4096), 48_000)).toBeNull()
  })

  it('rejects outliers with a median window and confirms stability', () => {
    const smoother = new PitchSmoother(5)
    smoother.add(110)
    smoother.add(110.2)
    smoother.add(220)
    const result = smoother.add(109.9)
    expect(result.frequency).toBeCloseTo(110.2, 1)
    expect(result.stable).toBe(true)
  })
})
