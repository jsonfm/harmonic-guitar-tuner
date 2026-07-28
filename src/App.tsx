import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Headphones, Info, Mic, MicOff, Settings, ShieldCheck } from 'lucide-react'
import { InputLevel } from './components/InputLevel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SettingsPanel } from './components/SettingsPanel'
import { StringSelector } from './components/StringSelector'
import { TunerDial } from './components/TunerDial'
import { TuningMenu } from './components/TuningMenu'
import { playReferenceTone, stopReferenceTone } from './audio/referenceTone'
import {
  centsBetween,
  closestString,
  frequencyToNote,
  noteToFrequency,
  tuningStatus,
} from './domain/musicTheory'
import { DEFAULT_TUNING, TUNINGS } from './domain/tuningDefinitions'
import type { GuitarString, PitchReading, TunerSettings } from './domain/tunerTypes'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePitchDetection } from './hooks/usePitchDetection'
import { SceneFallback } from './three/SceneFallback'

const TunerScene = lazy(() => import('./three/TunerScene'))

const DEFAULT_SETTINGS: TunerSettings = {
  tuningId: 'standard',
  referencePitch: 440,
  mode: 'auto',
  sensitivity: 0.68,
  animationIntensity: 0.75,
  enable3d: true,
  reducedEffects: false,
  selectedDeviceId: '',
}

function App() {
  const prefersReducedMotion = useReducedMotion()
  const [settings, setSettings] = useLocalStorage<TunerSettings>(
    'harmonic-tuner-settings',
    DEFAULT_SETTINGS,
  )
  const tuning = useMemo(
    () => TUNINGS.find((item) => item.id === settings.tuningId) ?? DEFAULT_TUNING,
    [settings.tuningId],
  )
  const [selectedStringId, setSelectedStringId] = useState(1)
  const selectedString =
    tuning.strings.find((guitarString) => guitarString.id === selectedStringId) ?? tuning.strings[0]
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toneStringId, setToneStringId] = useState<number | null>(null)
  const [simulatorEnabled, setSimulatorEnabled] = useState(false)
  const [simulatorFrequency, setSimulatorFrequency] = useState(110)

  const { isListening, status, reading, inputLevel, devices, start, stop } = usePitchDetection({
    tuning,
    selectedString,
    settings,
  })

  const simulatedReading = useMemo<PitchReading | null>(() => {
    if (!import.meta.env.DEV || !simulatorEnabled) return null
    const target =
      settings.mode === 'auto'
        ? closestString(simulatorFrequency, tuning.strings, settings.referencePitch)
        : selectedString
    const detected = frequencyToNote(simulatorFrequency, settings.referencePitch)
    const cents = Math.max(
      -50,
      Math.min(
        50,
        centsBetween(simulatorFrequency, noteToFrequency(target.midi, settings.referencePitch)),
      ),
    )
    return {
      frequency: simulatorFrequency,
      note: detected.note,
      octave: detected.octave,
      midi: detected.midi,
      cents,
      clarity: 0.98,
      rms: 0.08,
      target,
      status: tuningStatus(cents, true),
    }
  }, [selectedString, settings, simulatorEnabled, simulatorFrequency, tuning.strings])

  const activeReading = simulatedReading ?? reading
  const activeStatus = simulatedReading?.status ?? status
  const activeString = activeReading?.target ?? selectedString
  const effectiveMotionReduction = Boolean(prefersReducedMotion || settings.reducedEffects)

  useEffect(() => {
    setSelectedStringId(1)
    stopReferenceTone()
    setToneStringId(null)
  }, [tuning.id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopReferenceTone()
        setToneStringId(null)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      stopReferenceTone()
    }
  }, [])

  const handleTone = async (guitarString: GuitarString) => {
    if (toneStringId === guitarString.id) {
      stopReferenceTone()
      setToneStringId(null)
      return
    }
    await playReferenceTone(noteToFrequency(guitarString.midi, settings.referencePitch))
    setToneStringId(guitarString.id)
    setSelectedStringId(guitarString.id)
  }

  const handleMic = async () => {
    setSimulatorEnabled(false)
    if (isListening) stop()
    else await start()
  }

  const shouldShow3d = settings.enable3d && !effectiveMotionReduction

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="./" aria-label="Harmonic tuner home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>HARMONIC</strong>
            <small>PRECISION TUNER</small>
          </span>
        </a>

        <div className="topbar-actions">
          <div className="privacy-chip">
            <ShieldCheck size={14} />
            <span>Audio stays on this device</span>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      <main className="tuner-layout">
        <section className="instrument-stage" aria-label="Animated guitar headstock">
          <div className="stage-copy">
            <span className="eyebrow">
              LIVE INSTRUMENT <i className={isListening ? 'live' : ''} />
            </span>
            <h1>
              Find the note.
              <br />
              Feel the lock.
            </h1>
            <p>Pluck once, then tune with calm, precise feedback.</p>
          </div>

          <div className="scene-wrap" aria-hidden="true">
            <div className="scene-halo" />
            <ErrorBoundary
              fallback={
                <SceneFallback
                  strings={tuning.strings}
                  activeStringId={activeString.id}
                  status={activeStatus}
                />
              }
            >
              {shouldShow3d ? (
                <Suspense
                  fallback={
                    <SceneFallback
                      strings={tuning.strings}
                      activeStringId={activeString.id}
                      status={activeStatus}
                    />
                  }
                >
                  <TunerScene
                    strings={tuning.strings}
                    activeStringId={activeString.id}
                    cents={activeReading?.cents ?? 0}
                    status={activeStatus}
                    inputLevel={simulatedReading ? 0.65 : inputLevel}
                    intensity={settings.animationIntensity}
                    reducedEffects={settings.reducedEffects}
                  />
                </Suspense>
              ) : (
                <SceneFallback
                  strings={tuning.strings}
                  activeStringId={activeString.id}
                  status={activeStatus}
                />
              )}
            </ErrorBoundary>
          </div>

          <div className="stage-footer">
            <TuningMenu
              value={settings.tuningId}
              onChange={(tuningId) => setSettings({ ...settings, tuningId })}
            />
          </div>
        </section>

        <section className="control-deck">
          <div className="control-toolbar">
            <div className="segmented-control" aria-label="String selection mode">
              <button
                type="button"
                className={settings.mode === 'auto' ? 'active' : ''}
                onClick={() => setSettings({ ...settings, mode: 'auto' })}
              >
                AUTO
              </button>
              <button
                type="button"
                className={settings.mode === 'manual' ? 'active' : ''}
                onClick={() => setSettings({ ...settings, mode: 'manual' })}
              >
                MANUAL
              </button>
            </div>
            <div className="reference-readout">
              A<sub>4</sub> <strong>{settings.referencePitch}</strong> Hz
            </div>
          </div>

          <TunerDial
            note={activeReading?.note ?? activeString.note}
            octave={activeReading?.octave ?? activeString.octave}
            frequency={activeReading?.frequency}
            cents={activeReading?.cents}
            status={activeStatus}
            targetLabel={
              activeReading?.target.label ??
              (settings.mode === 'auto' ? 'AUTO' : activeString.label)
            }
          />

          <StringSelector
            strings={tuning.strings}
            selectedId={selectedStringId}
            detectedId={activeReading?.target.id}
            mode={settings.mode}
            status={activeStatus}
            onSelect={(guitarString) => {
              setSelectedStringId(guitarString.id)
              if (settings.mode === 'auto') setSettings({ ...settings, mode: 'manual' })
            }}
            onTone={handleTone}
            toneStringId={toneStringId}
          />

          <div className="deck-footer">
            <InputLevel level={simulatedReading ? 0.65 : inputLevel} />
            <motion.button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={handleMic}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isListening}
            >
              <span className="mic-icon">
                {isListening ? <MicOff size={21} /> : <Mic size={21} />}
              </span>
              <span>
                <small>{isListening ? 'LISTENING' : 'MICROPHONE'}</small>
                <strong>{isListening ? 'Stop tuning' : 'Start tuning'}</strong>
              </span>
            </motion.button>
            <button
              type="button"
              className="headphone-button"
              onClick={() => handleTone(activeString)}
              aria-label="Play selected string reference tone"
            >
              <Headphones size={19} />
            </button>
          </div>

          <div className="privacy-note">
            <Info size={14} />
            <span>Your microphone is analyzed locally. Nothing is recorded or uploaded.</span>
          </div>
        </section>
      </main>

      {import.meta.env.DEV && (
        <details className="signal-simulator">
          <summary>Signal simulator</summary>
          <label>
            <input
              type="checkbox"
              checked={simulatorEnabled}
              onChange={(event) => setSimulatorEnabled(event.target.checked)}
            />
            Simulate
          </label>
          <input
            aria-label="Simulated frequency"
            type="range"
            min="70"
            max="350"
            step="0.1"
            value={simulatorFrequency}
            onChange={(event) => setSimulatorFrequency(Number(event.target.value))}
          />
          <output>{simulatorFrequency.toFixed(1)} Hz</output>
        </details>
      )}

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        devices={devices}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
        onReset={() => setSettings(DEFAULT_SETTINGS)}
      />
    </div>
  )
}

export default App
