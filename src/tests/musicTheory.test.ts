import { describe, expect, it } from 'vitest'
import {
  centsBetween,
  closestString,
  frequencyToNote,
  noteToFrequency,
  tuningStatus,
} from '../domain/musicTheory'
import { TUNINGS } from '../domain/tuningDefinitions'

describe('music theory', () => {
  it('converts A4 between MIDI and frequency', () => {
    expect(noteToFrequency(69)).toBe(440)
    expect(frequencyToNote(440)).toMatchObject({ midi: 69, note: 'A', octave: 4, cents: 0 })
  })

  it('respects a custom reference pitch', () => {
    expect(noteToFrequency(69, 442)).toBe(442)
    expect(frequencyToNote(442, 442).midi).toBe(69)
  })

  it('calculates cents accurately', () => {
    expect(centsBetween(440, 440)).toBeCloseTo(0)
    expect(centsBetween(466.1637615, 440)).toBeCloseTo(100, 3)
  })

  it('selects the closest guitar string', () => {
    const standard = TUNINGS[0]
    expect(closestString(109.8, standard.strings).label).toBe('A2')
    expect(closestString(329.3, standard.strings).label).toBe('E4')
  })

  it('applies stable in-tune thresholds', () => {
    expect(tuningStatus(4.9, true)).toBe('in-tune')
    expect(tuningStatus(-6, true)).toBe('flat')
    expect(tuningStatus(7, true)).toBe('sharp')
    expect(tuningStatus(0, false)).toBe('unstable')
  })
})
