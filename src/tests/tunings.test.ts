import { describe, expect, it } from 'vitest'
import { TUNINGS } from '../domain/tuningDefinitions'

describe('tuning definitions', () => {
  it('provides six ordered strings for every tuning', () => {
    for (const tuning of TUNINGS) {
      expect(tuning.strings).toHaveLength(6)
      expect(tuning.strings.map((guitarString) => guitarString.id)).toEqual([1, 2, 3, 4, 5, 6])
    }
  })

  it('includes the requested tunings', () => {
    expect(TUNINGS.map((tuning) => tuning.id)).toEqual([
      'standard',
      'drop-d',
      'half-step',
      'open-g',
    ])
    expect(TUNINGS.find((tuning) => tuning.id === 'drop-d')?.strings[0].label).toBe('D2')
  })
})
