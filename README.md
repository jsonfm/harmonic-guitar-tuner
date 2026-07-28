# Harmonic

Harmonic is a private, browser-based guitar tuner with real-time pitch detection and an animated instrument interface. It is built for quick, practical everyday tuning on phones and desktops—without recording or uploading microphone audio.

## Features

- Real-time YIN pitch detection for monophonic guitar signals
- Automatic or manual string selection
- Standard, Drop D, half-step-down, and Open G tunings
- Adjustable A4 reference pitch from 430–450 Hz
- Stable flat, sharp, and in-tune feedback with median smoothing
- Animated Three.js guitar headstock and audio-reactive strings
- Lightweight, reduced-motion, and non-WebGL fallbacks
- Per-string synthesized reference tones
- Input sensitivity, microphone selection, and locally saved preferences
- Responsive, accessible controls and meaningful status announcements
- Development-only frequency simulator
- Automated tests and GitHub Pages deployment

## Screenshot

Add a current product screenshot here after deployment:

`docs/harmonic-tuner.png`

## Local development

Prerequisites: Node.js 20 or newer and pnpm 10.

```bash
pnpm install
pnpm dev
```

The development server prints the local address. Microphone access works on `localhost` and on secure HTTPS origins.

Available commands:

```bash
pnpm dev          # Start the development server
pnpm build        # Type-check and create a production build
pnpm preview      # Preview the production build
pnpm test         # Run unit tests once
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run ESLint
pnpm format       # Format source files
```

## How pitch detection works

The microphone stream is connected to a Web Audio `AnalyserNode` configured for a 4096-sample time-domain window. Harmonic applies the YIN difference function and cumulative mean-normalized difference function to estimate the fundamental frequency, then rejects low-volume or low-clarity frames.

Accepted readings pass through a rolling median filter. Pitch status is only considered stable after several consistent frames, which prevents a brief crossing of the target frequency from producing a false in-tune confirmation. Frequencies are converted using twelve-tone equal temperament and the selected A4 reference pitch.

## Architecture

- `src/audio` — framework-independent pitch detection, smoothing, and reference-tone audio
- `src/domain` — note math, tuning definitions, and shared types
- `src/hooks` — microphone lifecycle and local preference persistence
- `src/components` — accessible two-dimensional tuner controls
- `src/three` — lazy-loaded React Three Fiber presentation and fallback
- `src/tests` — music theory, tuning, smoothing, and pitch-detection unit tests

The core tuning workflow does not depend on WebGL. If Three.js cannot load, if reduced motion is requested, or if 3D effects are disabled, the microphone and tuner controls continue to work.

## Privacy

Harmonic requests microphone access only when **Start tuning** is pressed. Samples are analyzed in memory on the current device. Audio is not recorded, retained, transmitted, or sent to an API. Stopping the tuner closes the audio context and stops every microphone track.

## Browser compatibility

Current Chrome, Edge, Firefox, and Safari releases are supported. A secure context is required for microphone access outside `localhost`. Browser and operating-system audio processing can affect electric instruments connected through audio interfaces; selecting the interface directly in settings is recommended.

## Tests

The Vitest suite covers:

- frequency/note conversion and custom reference pitch
- cents calculation and tuning thresholds
- tuning definition integrity and closest-string selection
- clean-signal pitch detection and silence rejection
- smoothing and stability confirmation

The development build also includes a small signal simulator in the lower-left corner, allowing known frequencies to drive the interface without a microphone. Vite removes it from production builds.

## Deploying to GitHub Pages

1. Push the project to a GitHub repository with `main` as the default branch.
2. Open **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` or run the **Deploy to GitHub Pages** workflow manually.

The Vite configuration derives the repository subpath from `GITHUB_REPOSITORY` during GitHub Actions builds, so assets load correctly from both a user site and a project site.

## Known limitations

- The tuner is designed for one note at a time, not chords.
- Very noisy rooms, clipped audio, or strong overtones may temporarily reduce confidence.
- iOS can suspend audio when the browser is backgrounded; return to the page and restart tuning.
- Built-in laptop microphones are less reliable for low E and Drop D than a close phone microphone or audio interface.

## Future improvements

- AudioWorklet-based analysis for even lower main-thread overhead
- Additional user-defined and orchestral tunings
- Temperament presets
- Optional strobe-tuner mode
- Offline install support
