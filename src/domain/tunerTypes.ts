export type PitchStatus =
  | 'idle'
  | 'waiting'
  | 'quiet'
  | 'unstable'
  | 'flat'
  | 'sharp'
  | 'in-tune'
  | 'denied'
  | 'unavailable'

export interface GuitarString {
  id: number
  label: string
  note: string
  octave: number
  midi: number
}

export interface TuningDefinition {
  id: string
  name: string
  shortName: string
  strings: GuitarString[]
}

export interface PitchReading {
  frequency: number
  note: string
  octave: number
  midi: number
  cents: number
  clarity: number
  rms: number
  target: GuitarString
  status: PitchStatus
}

export interface TunerSettings {
  tuningId: string
  referencePitch: number
  mode: 'auto' | 'manual'
  sensitivity: number
  animationIntensity: number
  enable3d: boolean
  reducedEffects: boolean
  selectedDeviceId: string
}
