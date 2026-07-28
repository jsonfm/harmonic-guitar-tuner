import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { TUNINGS } from '../domain/tuningDefinitions'
import type { TunerSettings } from '../domain/tunerTypes'

interface SettingsPanelProps {
  open: boolean
  settings: TunerSettings
  devices: MediaDeviceInfo[]
  onChange: (settings: TunerSettings) => void
  onClose: () => void
  onReset: () => void
}

export function SettingsPanel({
  open,
  settings,
  devices,
  onChange,
  onClose,
  onReset,
}: SettingsPanelProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  const update = <K extends keyof TunerSettings>(key: K, value: TunerSettings[K]) =>
    onChange({ ...settings, [key]: value })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="settings-scrim"
            aria-label="Close settings"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          >
            <header className="settings-header">
              <div>
                <span className="eyebrow">CALIBRATION</span>
                <h2 id="settings-title">Tuner settings</h2>
              </div>
              <button
                ref={closeButton}
                type="button"
                className="icon-button"
                onClick={onClose}
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </header>

            <div className="settings-scroll">
              <label className="setting-block">
                <span>
                  Tuning{' '}
                  <small>{TUNINGS.find((item) => item.id === settings.tuningId)?.shortName}</small>
                </span>
                <select
                  value={settings.tuningId}
                  onChange={(event) => update('tuningId', event.target.value)}
                >
                  {TUNINGS.map((tuning) => (
                    <option key={tuning.id} value={tuning.id}>
                      {tuning.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="setting-block">
                <span>Selection mode</span>
                <div className="segmented-control wide">
                  <button
                    type="button"
                    className={settings.mode === 'auto' ? 'active' : ''}
                    onClick={() => update('mode', 'auto')}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    className={settings.mode === 'manual' ? 'active' : ''}
                    onClick={() => update('mode', 'manual')}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <label className="setting-block range-setting">
                <span>
                  Reference pitch <output>{settings.referencePitch} Hz</output>
                </span>
                <input
                  type="range"
                  min="430"
                  max="450"
                  step="1"
                  value={settings.referencePitch}
                  onChange={(event) => update('referencePitch', Number(event.target.value))}
                />
                <span className="range-ends">
                  <small>430</small>
                  <small>450</small>
                </span>
              </label>

              <label className="setting-block">
                <span>Microphone input</span>
                <select
                  value={settings.selectedDeviceId}
                  onChange={(event) => update('selectedDeviceId', event.target.value)}
                >
                  <option value="">System default</option>
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="setting-block range-setting">
                <span>
                  Input sensitivity <output>{Math.round(settings.sensitivity * 100)}%</output>
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.sensitivity}
                  onChange={(event) => update('sensitivity', Number(event.target.value))}
                />
              </label>

              <label className="setting-block range-setting">
                <span>
                  Motion intensity <output>{Math.round(settings.animationIntensity * 100)}%</output>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.animationIntensity}
                  onChange={(event) => update('animationIntensity', Number(event.target.value))}
                />
              </label>

              <label className="toggle-row">
                <span>
                  3D instrument
                  <small>Animated headstock and strings</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.enable3d}
                  onChange={(event) => update('enable3d', event.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  Reduced visual effects
                  <small>Fewer particles and reflections</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.reducedEffects}
                  onChange={(event) => update('reducedEffects', event.target.checked)}
                />
              </label>

              <button type="button" className="reset-button" onClick={onReset}>
                <RotateCcw size={16} />
                Reset all settings
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
