import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { PitchStatus } from '../domain/tunerTypes'

interface TunerDialProps {
  note: string
  octave?: number
  frequency?: number
  cents?: number
  status: PitchStatus
  targetLabel: string
}

const STATUS_COPY: Record<PitchStatus, string> = {
  idle: 'Microphone is off',
  waiting: 'Play a string',
  quiet: 'Signal is too quiet',
  unstable: 'Hold the note steady',
  flat: 'Tune up',
  sharp: 'Tune down',
  'in-tune': 'Beautiful — in tune',
  denied: 'Microphone access denied',
  unavailable: 'Microphone unavailable',
}

export function TunerDial({
  note,
  octave,
  frequency,
  cents = 0,
  status,
  targetLabel,
}: TunerDialProps) {
  const reduceMotion = useReducedMotion()
  const clamped = Math.max(-50, Math.min(50, cents))
  const needleAngle = (clamped / 50) * 48
  const style = { '--needle-angle': `${needleAngle}deg` } as CSSProperties

  return (
    <section
      className={`tuner-dial status-${status}`}
      aria-label={`Tuner: ${STATUS_COPY[status]}`}
      style={style}
    >
      <div className="dial-scale" aria-hidden="true">
        {Array.from({ length: 21 }, (_, index) => (
          <span
            className={index === 10 ? 'major' : index % 5 === 0 ? 'medium' : ''}
            key={index}
            style={{ transform: `rotate(${-50 + index * 5}deg)` }}
          />
        ))}
      </div>
      <div className="dial-labels" aria-hidden="true">
        <span>FLAT</span>
        <span>IN TUNE</span>
        <span>SHARP</span>
      </div>

      <motion.div
        className="needle"
        animate={{ rotate: needleAngle }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 190, damping: 22, mass: 0.7 }
        }
        aria-hidden="true"
      >
        <span />
      </motion.div>
      <div className="needle-hub" aria-hidden="true" />

      <div className="note-readout">
        <span className="target-kicker">TARGET · {targetLabel}</span>
        <AnimatePresence mode="wait">
          <motion.div
            className="detected-note"
            key={`${note}${octave ?? ''}`}
            initial={reduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <span>{note}</span>
            {octave !== undefined && <sup>{octave}</sup>}
          </motion.div>
        </AnimatePresence>
        <div className="measurement-row">
          <span>{frequency ? `${frequency.toFixed(1)} Hz` : '— Hz'}</span>
          <span className="measurement-separator" />
          <span>{frequency ? `${cents > 0 ? '+' : ''}${Math.round(cents)} cents` : '— cents'}</span>
        </div>
      </div>

      <div className="status-readout" role="status" aria-live="polite">
        <span className="status-symbol" aria-hidden="true">
          {status === 'flat' ? '←' : status === 'sharp' ? '→' : status === 'in-tune' ? '✓' : '●'}
        </span>
        <span>{STATUS_COPY[status]}</span>
      </div>
    </section>
  )
}
