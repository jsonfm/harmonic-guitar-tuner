import type { GuitarString, TuningDefinition } from './tunerTypes'

const makeStrings = (notes: Array<[string, number, number]>): GuitarString[] =>
  notes.map(([note, octave, midi], index) => ({
    id: index + 1,
    label: `${note}${octave}`,
    note,
    octave,
    midi,
  }))

export const TUNINGS: TuningDefinition[] = [
  {
    id: 'standard',
    name: 'Standard',
    shortName: 'E A D G B E',
    strings: makeStrings([
      ['E', 2, 40],
      ['A', 2, 45],
      ['D', 3, 50],
      ['G', 3, 55],
      ['B', 3, 59],
      ['E', 4, 64],
    ]),
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    shortName: 'D A D G B E',
    strings: makeStrings([
      ['D', 2, 38],
      ['A', 2, 45],
      ['D', 3, 50],
      ['G', 3, 55],
      ['B', 3, 59],
      ['E', 4, 64],
    ]),
  },
  {
    id: 'half-step',
    name: 'Half step down',
    shortName: 'E♭ A♭ D♭ G♭ B♭ E♭',
    strings: makeStrings([
      ['E♭', 2, 39],
      ['A♭', 2, 44],
      ['D♭', 3, 49],
      ['G♭', 3, 54],
      ['B♭', 3, 58],
      ['E♭', 4, 63],
    ]),
  },
  {
    id: 'open-g',
    name: 'Open G',
    shortName: 'D G D G B D',
    strings: makeStrings([
      ['D', 2, 38],
      ['G', 2, 43],
      ['D', 3, 50],
      ['G', 3, 55],
      ['B', 3, 59],
      ['D', 4, 62],
    ]),
  },
]

export const DEFAULT_TUNING = TUNINGS[0]
