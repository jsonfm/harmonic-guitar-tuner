import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TUNINGS } from '../domain/tuningDefinitions'

interface TuningMenuProps {
  value: string
  onChange: (value: string) => void
}

export function TuningMenu({ value, onChange }: TuningMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const selected = TUNINGS.find((tuning) => tuning.id === value) ?? TUNINGS[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="tuning-menu" ref={wrapper}>
      <button
        type="button"
        className={`tuning-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="tuning-trigger-icon" aria-hidden="true">
          <SlidersHorizontal size={15} />
        </span>
        <span className="tuning-trigger-copy">
          <small>SELECTED TUNING</small>
          <strong>{selected.name}</strong>
        </span>
        <span className="tuning-trigger-notes">{selected.shortName}</span>
        <ChevronDown className="tuning-chevron" size={17} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="tuning-popover"
            role="listbox"
            aria-label="Guitar tunings"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
          >
            <div className="tuning-popover-header">
              <span>CHOOSE A TUNING</span>
              <small>A4 · 440 HZ</small>
            </div>
            {TUNINGS.map((tuning) => {
              const active = tuning.id === value
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`tuning-option ${active ? 'active' : ''}`}
                  key={tuning.id}
                  onClick={() => {
                    onChange(tuning.id)
                    setOpen(false)
                  }}
                >
                  <span className="tuning-option-indicator">
                    {active ? <Check size={13} /> : <i />}
                  </span>
                  <span>
                    <strong>{tuning.name}</strong>
                    <small>{tuning.shortName}</small>
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
