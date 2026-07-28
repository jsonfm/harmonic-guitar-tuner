import { useCallback, useEffect, useRef, useState } from 'react'
import { detectPitchYin } from '../audio/pitchDetector'
import { PitchSmoother } from '../audio/signalSmoothing'
import {
  centsBetween,
  closestString,
  frequencyToNote,
  noteToFrequency,
  tuningStatus,
} from '../domain/musicTheory'
import type {
  GuitarString,
  PitchReading,
  PitchStatus,
  TunerSettings,
  TuningDefinition,
} from '../domain/tunerTypes'

interface UsePitchDetectionOptions {
  tuning: TuningDefinition
  selectedString: GuitarString
  settings: TunerSettings
}

interface AudioResources {
  context: AudioContext
  stream: MediaStream
  source: MediaStreamAudioSourceNode
  analyser: AnalyserNode
}

export function usePitchDetection({ tuning, selectedString, settings }: UsePitchDetectionOptions) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState<PitchStatus>('idle')
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [inputLevel, setInputLevel] = useState(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const resources = useRef<AudioResources | null>(null)
  const animationFrame = useRef<number>(0)
  const lastAnalysis = useRef(0)
  const silenceStarted = useRef(0)
  const smoother = useRef(new PitchSmoother())
  const settingsRef = useRef(settings)
  const tuningRef = useRef(tuning)
  const selectedStringRef = useRef(selectedString)

  settingsRef.current = settings
  tuningRef.current = tuning
  selectedStringRef.current = selectedString

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    setDevices(allDevices.filter((device) => device.kind === 'audioinput'))
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(animationFrame.current)
    const current = resources.current
    if (current) {
      current.stream.getTracks().forEach((track) => track.stop())
      current.source.disconnect()
      current.analyser.disconnect()
      void current.context.close()
    }
    resources.current = null
    smoother.current.reset()
    setIsListening(false)
    setReading(null)
    setInputLevel(0)
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') {
      setStatus('unavailable')
      return
    }

    stop()
    setStatus('waiting')
    silenceStarted.current = performance.now()

    try {
      const currentSettings = settingsRef.current
      const constraints: MediaStreamConstraints = {
        audio: currentSettings.selectedDeviceId
          ? {
              deviceId: { exact: currentSettings.selectedDeviceId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
        video: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const context = new AudioContext({ latencyHint: 'interactive' })
      await context.resume()
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0
      source.connect(analyser)
      resources.current = { context, stream, source, analyser }
      setIsListening(true)
      await refreshDevices()

      const buffer = new Float32Array(analyser.fftSize)
      const analyse = (time: number) => {
        const active = resources.current
        if (!active) return
        animationFrame.current = requestAnimationFrame(analyse)
        if (time - lastAnalysis.current < 52) return
        lastAnalysis.current = time

        active.analyser.getFloatTimeDomainData(buffer)
        const detected = detectPitchYin(buffer, active.context.sampleRate)
        const liveSettings = settingsRef.current
        const liveTuning = tuningRef.current
        const liveSelectedString = selectedStringRef.current
        const noiseGate = 0.0025 + (1 - liveSettings.sensitivity) * 0.012

        if (!detected || detected.rms < noiseGate || detected.clarity < 0.72) {
          const level = detected ? Math.min(1, detected.rms * 14) : 0
          setInputLevel(level)
          setReading(null)
          setStatus(time - silenceStarted.current > 1600 ? 'quiet' : 'waiting')
          if (time - silenceStarted.current > 700) smoother.current.reset()
          return
        }

        silenceStarted.current = time
        const smoothed = smoother.current.add(detected.frequency)
        const target =
          liveSettings.mode === 'auto'
            ? closestString(smoothed.frequency, liveTuning.strings, liveSettings.referencePitch)
            : liveSelectedString
        const targetFrequency = noteToFrequency(target.midi, liveSettings.referencePitch)
        const cents = Math.max(-50, Math.min(50, centsBetween(smoothed.frequency, targetFrequency)))
        const noteData = frequencyToNote(smoothed.frequency, liveSettings.referencePitch)
        const nextStatus = tuningStatus(cents, smoothed.stable)
        const nextReading: PitchReading = {
          frequency: smoothed.frequency,
          note: noteData.note,
          octave: noteData.octave,
          midi: noteData.midi,
          cents,
          clarity: detected.clarity,
          rms: detected.rms,
          target,
          status: nextStatus,
        }

        setInputLevel(Math.min(1, detected.rms * 14))
        setReading(nextReading)
        setStatus(nextStatus)
      }

      animationFrame.current = requestAnimationFrame(analyse)
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
      setIsListening(false)
    }
  }, [refreshDevices, stop])

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices
    const handleDeviceChange = () => void refreshDevices()
    mediaDevices?.addEventListener?.('devicechange', handleDeviceChange)
    return () => {
      mediaDevices?.removeEventListener?.('devicechange', handleDeviceChange)
      stop()
    }
  }, [refreshDevices, stop])

  return {
    isListening,
    status,
    reading,
    inputLevel,
    devices,
    start,
    stop,
  }
}
