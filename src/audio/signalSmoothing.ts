export class PitchSmoother {
  private readings: number[] = []
  private stableFrames = 0
  private previousMedian = 0

  constructor(private readonly windowSize = 7) {}

  add(frequency: number): { frequency: number; stable: boolean } {
    this.readings.push(frequency)
    if (this.readings.length > this.windowSize) this.readings.shift()

    const sorted = [...this.readings].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const deltaCents =
      this.previousMedian > 0 ? Math.abs(1200 * Math.log2(median / this.previousMedian)) : 100

    this.stableFrames = deltaCents < 8 ? this.stableFrames + 1 : 0
    this.previousMedian = median

    return {
      frequency: median,
      stable: this.readings.length >= 4 && this.stableFrames >= 2,
    }
  }

  reset(): void {
    this.readings = []
    this.stableFrames = 0
    this.previousMedian = 0
  }
}
