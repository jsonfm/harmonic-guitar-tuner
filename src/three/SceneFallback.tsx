import type { GuitarString, PitchStatus } from '../domain/tunerTypes'

interface SceneFallbackProps {
  strings: GuitarString[]
  activeStringId: number
  status: PitchStatus
}

export function SceneFallback({ strings, activeStringId, status }: SceneFallbackProps) {
  return (
    <div className="scene-fallback" aria-label="Simplified guitar headstock">
      <div className={`fallback-headstock ${status === 'in-tune' ? 'in-tune' : ''}`}>
        {strings.map((guitarString) => (
          <span
            key={guitarString.id}
            className={guitarString.id === activeStringId ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  )
}
