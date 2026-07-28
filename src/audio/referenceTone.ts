let context: AudioContext | null = null
let oscillator: OscillatorNode | null = null
let gain: GainNode | null = null

export async function playReferenceTone(frequency: number): Promise<void> {
  stopReferenceTone()
  context = new AudioContext()
  await context.resume()

  oscillator = context.createOscillator()
  gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, context.currentTime)
  gain.gain.linearRampToValueAtTime(0.075, context.currentTime + 0.04)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
}

export function stopReferenceTone(): void {
  if (!context || !oscillator || !gain) return
  const stopAt = context.currentTime + 0.05
  gain.gain.cancelScheduledValues(context.currentTime)
  gain.gain.setValueAtTime(gain.gain.value, context.currentTime)
  gain.gain.linearRampToValueAtTime(0, stopAt)
  oscillator.stop(stopAt)
  void context.close()
  oscillator = null
  gain = null
  context = null
}
