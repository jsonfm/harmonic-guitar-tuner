import type { GuitarString, PitchStatus } from './tunerTypes'

export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

export function noteToFrequency(midi: number, referencePitch = 440): number {
  return referencePitch * 2 ** ((midi - 69) / 12)
}

export function frequencyToMidi(frequency: number, referencePitch = 440): number {
  return 69 + 12 * Math.log2(frequency / referencePitch)
}

export function frequencyToNote(
  frequency: number,
  referencePitch = 440,
): { midi: number; note: string; octave: number; cents: number } {
  const fractionalMidi = frequencyToMidi(frequency, referencePitch)
  const midi = Math.round(fractionalMidi)
  return {
    midi,
    note: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    cents: (fractionalMidi - midi) * 100,
  }
}

export function centsBetween(frequency: number, targetFrequency: number): number {
  return 1200 * Math.log2(frequency / targetFrequency)
}

export function closestString(
  frequency: number,
  strings: GuitarString[],
  referencePitch = 440,
): GuitarString {
  return strings.reduce((closest, current) => {
    const currentDistance = Math.abs(
      centsBetween(frequency, noteToFrequency(current.midi, referencePitch)),
    )
    const closestDistance = Math.abs(
      centsBetween(frequency, noteToFrequency(closest.midi, referencePitch)),
    )
    return currentDistance < closestDistance ? current : closest
  })
}

export function tuningStatus(cents: number, stable: boolean): PitchStatus {
  if (!stable) return 'unstable'
  if (Math.abs(cents) <= 5) return 'in-tune'
  return cents < 0 ? 'flat' : 'sharp'
}
