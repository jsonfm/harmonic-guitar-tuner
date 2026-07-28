import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { GuitarString, PitchStatus } from '../domain/tunerTypes'

interface StringSelectorProps {
  strings: GuitarString[]
  selectedId: number
  detectedId?: number
  mode: 'auto' | 'manual'
  status: PitchStatus
  onSelect: (guitarString: GuitarString) => void
  onTone: (guitarString: GuitarString) => void
  toneStringId: number | null
}

export function StringSelector({
  strings,
  selectedId,
  detectedId,
  mode,
  status,
  onSelect,
  onTone,
  toneStringId,
}: StringSelectorProps) {
  const activeId = mode === 'auto' && detectedId ? detectedId : selectedId

  return (
    <div className="string-selector" aria-label="Guitar strings">
      {strings.map((guitarString) => {
        const active = guitarString.id === activeId
        return (
          <div className="string-control-wrap" key={guitarString.id}>
            <motion.button
              type="button"
              className={`string-button ${active ? 'active' : ''} ${
                active && status === 'in-tune' ? 'in-tune' : ''
              }`}
              onClick={() => onSelect(guitarString)}
              whileTap={{ scale: 0.94 }}
              aria-pressed={active}
              aria-label={`Select ${guitarString.label}, string ${guitarString.id}`}
            >
              <span className="string-number">0{guitarString.id}</span>
              <span className="string-wire" aria-hidden="true" />
              <span className="string-note">
                {guitarString.note}
                <small>{guitarString.octave}</small>
              </span>
            </motion.button>
            <button
              type="button"
              className={`tone-button ${toneStringId === guitarString.id ? 'playing' : ''}`}
              onClick={() => onTone(guitarString)}
              aria-label={`${toneStringId === guitarString.id ? 'Stop' : 'Play'} ${guitarString.label} reference tone`}
            >
              <Volume2 size={13} strokeWidth={1.8} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
