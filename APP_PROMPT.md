# Build an Interactive Guitar Tuner with React and Three.js

Create a polished, client-side guitar tuner web application inspired by the simplicity and usability of GuitarTuna, but with an original visual identity, premium animations, and an immersive interface built with React and Three.js.

The application must run entirely in the browser and be deployable as a static site on GitHub Pages.

## Technology Stack

Use:

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Web Audio API
- CSS Modules, Tailwind CSS, or a clean global CSS architecture
- Vitest for unit tests
- ESLint and Prettier

Do not use a backend, external database, paid API, or server-side functionality.

## Product Goal

Build a guitar tuner that feels fast, musical, elegant, and enjoyable to use.

The experience should combine:

- Accurate real-time pitch detection
- A clear tuning interface
- Beautiful Three.js visuals
- Smooth feedback animations
- Strong mobile usability
- Accessible controls
- A premium audio-tool aesthetic

The interface must remain practical. Animations should improve feedback and clarity rather than interfere with tuning.

## Core Tuner Functionality

Use the browser’s microphone through `navigator.mediaDevices.getUserMedia`.

Process audio with the Web Audio API.

Implement reliable monophonic pitch detection using one of the following:

- YIN
- McLeod Pitch Method
- Autocorrelation with noise filtering and interpolation

Prefer YIN or McLeod if the implementation remains maintainable.

The tuner must:

- Detect the fundamental frequency in real time
- Convert frequency into the nearest musical note
- Calculate the deviation from that note in cents
- Display whether the string is flat, sharp, or in tune
- Smooth unstable readings without making the interface feel slow
- Ignore silence and signals below a configurable confidence or volume threshold
- Avoid rapidly jumping between octaves
- Work with acoustic guitars captured through a microphone
- Work with electric guitars when their audio is available through the selected input device

Use the equal-tempered scale with A4 = 440 Hz by default.

Include an optional reference pitch setting from 430 Hz to 450 Hz.

## Guitar Tunings

Support at least:

### Standard

- E2
- A2
- D3
- G3
- B3
- E4

### Drop D

- D2
- A2
- D3
- G3
- B3
- E4

### Half Step Down

- Eb2
- Ab2
- Db3
- Gb3
- Bb3
- Eb4

### Open G

- D2
- G2
- D3
- G3
- B3
- D4

Design the tuning configuration so additional tunings can be added easily.

Include two modes:

1. **Automatic mode**
   Detect the closest string automatically.

2. **Manual mode**
   Let the user select a string before tuning it.

## Main User Experience

The main screen should contain:

- Current detected note
- Detected frequency
- Cents deviation
- Flat, sharp, or in-tune status
- Selected guitar tuning
- Six interactive guitar strings
- Microphone activation control
- Input level indicator
- Settings control
- Automatic/manual mode control

The central tuning indicator should be readable within a fraction of a second.

Use clear visual states:

- No microphone permission
- Waiting for sound
- Listening
- Signal too quiet
- Signal unstable
- Flat
- Sharp
- In tune
- Microphone unavailable
- Permission denied

Do not depend only on color. Use text, positioning, icons, motion, and shape changes as additional indicators.

## Visual Direction

Create an original design rather than copying GuitarTuna.

Use a sophisticated visual style inspired by:

- A dark recording studio
- Precision musical instruments
- Glowing guitar strings
- Brushed metal
- Glass surfaces
- Subtle neon light
- Warm wooden instrument details
- Modern audio plugins

The application should feel premium but not overloaded.

Suggested visual composition:

- A dark, atmospheric background
- A softly illuminated 3D guitar headstock or abstract string instrument
- Six animated strings extending vertically or diagonally
- A central chromatic tuning dial
- Floating particles that subtly react to audio amplitude
- Gentle bloom-like lighting without excessive post-processing
- Responsive glass panels for controls

Avoid excessive gradients, distracting particles, unreadable glassmorphism, or animations that reduce performance.

## Three.js Experience

Build a Three.js scene with React Three Fiber.

The scene can contain an abstract guitar headstock, tuning pegs, strings, or a stylized musical instrument structure.

Each string should:

- Correspond to a guitar string
- Be selectable
- React subtly to microphone amplitude
- Vibrate when its corresponding note is detected
- Change its visual tension based on cents deviation
- Settle into a stable, harmonious animation when the note is in tune

Suggested animation behavior:

- A flat note causes the indicator or string energy to lean left
- A sharp note causes it to lean right
- An in-tune note centers the indicator and triggers a subtle pulse
- Strong input increases vibration amplitude
- Low-confidence detection produces softer, less certain movement
- Switching tunings smoothly repositions or relabels the strings

Use procedural animation where practical rather than large assets.

Provide a lightweight fallback interface when:

- WebGL is unavailable
- Reduced motion is enabled
- The device has limited graphics capability

The tuner functionality must not depend on Three.js. Audio detection and core controls should continue working if the 3D scene is disabled.

## Animation Principles

Use Framer Motion for interface transitions and React Three Fiber animation hooks for the 3D scene.

Animations should feel:

- Responsive
- Musical
- Smooth
- Precise
- Calm
- Physically plausible

Include:

- Animated microphone activation
- Smooth note transitions
- Spring-based tuning needle movement
- String vibration
- In-tune confirmation pulse
- Animated tuning changes
- Graceful loading states
- Small tactile interactions for buttons and string selection

Respect `prefers-reduced-motion`.

Do not trigger a large celebration every time the pitch briefly crosses the correct value. Confirm an in-tune state only after the reading remains within a defined cents threshold for a short period.

## Pitch Feedback Logic

Use practical tuning thresholds such as:

- In tune: within ±5 cents
- Nearly in tune: within ±10 cents
- Noticeably flat or sharp: beyond ±10 cents

Make these values configurable.

Use smoothing to reduce jitter. Consider:

- Median filtering over recent readings
- Exponential moving averages
- Confidence weighting
- Hysteresis around note changes
- A short stability window before confirming the note

Do not average frequencies directly when notes change abruptly. Handle note transitions carefully.

Keep the pitch-analysis code separate from the React components.

Suggested modules:

- `audioEngine.ts`
- `pitchDetector.ts`
- `musicTheory.ts`
- `tuningDefinitions.ts`
- `signalSmoothing.ts`
- `useMicrophone.ts`
- `usePitchDetection.ts`

## Audio Architecture

Use an efficient audio processing architecture.

Prefer an `AudioWorklet` when supported, with a clean fallback if necessary.

Avoid blocking the main rendering thread.

The implementation should:

- Request microphone access only after a user gesture
- Stop microphone tracks when tuning is disabled
- Properly close or suspend the audio context
- Handle device changes
- Handle permission errors
- Avoid memory leaks
- Avoid creating duplicate animation or audio loops
- Minimize latency
- Avoid transmitting or recording audio

Add a privacy message explaining that microphone audio is processed locally and never uploaded.

## Responsive Design

Design mobile first.

The app should work well on:

- Small phones
- Large phones
- Tablets
- Laptops
- Desktop monitors

On mobile:

- Keep the main note and tuning direction visible
- Use large touch targets
- Avoid tiny settings controls
- Keep Three.js rendering lightweight
- Account for mobile browser viewport changes
- Handle portrait and landscape layouts
- Keep the interface usable when browser permission prompts appear

The layout should remain usable without scrolling during normal tuning on common phone sizes.

## Accessibility

Include:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- ARIA labels where appropriate
- Text descriptions of pitch status
- Sufficient contrast
- Reduced-motion support
- A non-3D fallback
- Screen-reader announcements when the selected string or tuning status changes

Avoid announcing every raw frequency update. Screen-reader updates should be throttled and meaningful.

## Settings

Include a settings panel with:

- Tuning selection
- Reference pitch
- Automatic/manual string selection
- Microphone input selection when supported
- Sensitivity or noise-gate control
- Animation intensity
- 3D effects toggle
- Reduced visual effects mode
- Reset settings

Persist non-sensitive preferences in `localStorage`.

Do not automatically persist microphone permission state.

## Optional Reference Tone

Add an optional reference-tone feature.

Users should be able to play the target frequency for an individual string using a synthesized oscillator.

Requirements:

- Start only after a user interaction
- Use a comfortable default volume
- Include a clear stop button
- Fade audio in and out to avoid clicks
- Automatically stop when appropriate
- Never play while hidden without the user’s awareness

## Application Structure

Use a maintainable component structure, for example:

```text
src/
  app/
    App.tsx
  components/
    TunerDial.tsx
    NoteDisplay.tsx
    StringSelector.tsx
    InputLevelMeter.tsx
    MicrophoneButton.tsx
    TuningSelector.tsx
    SettingsPanel.tsx
    StatusMessage.tsx
    PrivacyNotice.tsx
    ErrorBoundary.tsx
  three/
    TunerScene.tsx
    GuitarHeadstock.tsx
    AnimatedString.tsx
    TuningPeg.tsx
    AudioParticles.tsx
    SceneFallback.tsx
  audio/
    audioEngine.ts
    pitchDetector.ts
    pitch-worklet.ts
    signalSmoothing.ts
  hooks/
    useMicrophone.ts
    usePitchDetection.ts
    useLocalStorage.ts
    useReducedMotion.ts
  domain/
    musicTheory.ts
    tuningDefinitions.ts
    tunerTypes.ts
  styles/
  tests/
```

This structure is a suggestion. Refine it when there is a clear architectural benefit.

## State Management

Prefer React hooks and context unless a dedicated state library provides a clear advantage.

Keep these concerns separate:

- Microphone lifecycle
- Audio analysis
- Pitch-domain calculations
- Tuner UI state
- User preferences
- Three.js presentation state

Avoid unnecessary global state.

## GitHub Pages Deployment

Configure the app for GitHub Pages.

Requirements:

- Use Vite’s `base` configuration correctly
- Support deployment under a repository subpath
- Avoid server-dependent routing
- Use hash routing only if multiple routes are introduced
- Ensure static assets work under the GitHub Pages base path
- Add a GitHub Actions workflow that builds and deploys the app
- Add clear deployment instructions to the README
- Make the workflow compatible with GitHub Pages’ official deployment actions

Use an environment variable or repository-aware configuration for the base path when practical.

The production build must work after running:

```bash
npm install
npm run build
```

Include scripts for:

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

## Performance

Target a smooth experience on modern mid-range mobile devices.

Apply:

- Dynamic import for the Three.js scene
- Lazy loading
- Efficient geometry
- Limited particle count
- Controlled device pixel ratio
- Minimal post-processing
- Memoization only where useful
- Cleanup for animation frames and audio nodes
- Pausing expensive rendering when the page is hidden
- Reduced graphics mode for weaker devices

The initial interface should appear before the full Three.js scene finishes loading.

Do not sacrifice tuner responsiveness for visual effects.

## Error Handling

Handle:

- Unsupported browser APIs
- WebGL unavailable
- Microphone permission denied
- No microphone detected
- Audio context suspended
- Invalid device selection
- Very noisy input
- No detectable pitch
- Three.js rendering failures

Use an error boundary around the 3D experience so the rest of the tuner remains functional.

Provide helpful recovery actions rather than only displaying errors.

## Testing

Add unit tests for:

- Frequency-to-note conversion
- Note-to-frequency conversion
- Cents calculations
- Tuning definitions
- Closest-string selection
- Smoothing behavior
- In-tune threshold logic
- Stability confirmation

Add mocked tests for microphone-related hooks where practical.

Include a small development-only signal simulator that can feed known frequencies into the tuner UI without requiring a microphone. Ensure it is excluded or disabled in production.

## Code Quality

Write clean, strongly typed TypeScript.

Requirements:

- Avoid `any`
- Add meaningful interfaces and types
- Keep components focused
- Keep audio-domain logic framework-independent
- Add comments only where the reasoning is not obvious
- Avoid premature abstractions
- Avoid monolithic components
- Dispose of Three.js resources properly
- Clean up every audio node, event listener, timer, and animation loop

## README

Create a complete README containing:

- Project overview
- Feature list
- Screenshots placeholder
- Local development instructions
- Browser compatibility notes
- Microphone privacy explanation
- Architecture overview
- Pitch-detection approach
- GitHub Pages deployment instructions
- Known limitations
- Future improvements

## Deliverables

Produce:

1. A complete working React application
2. Accurate real-time guitar tuning
3. A polished responsive interface
4. A Three.js animated instrument visualization
5. Multiple guitar tunings
6. Automatic and manual modes
7. Settings persisted locally
8. Accessible fallbacks
9. Unit tests
10. GitHub Pages configuration
11. GitHub Actions deployment workflow
12. Complete README documentation

## Implementation Process

Work incrementally:

1. Scaffold the Vite React TypeScript project.
2. Implement and test music-theory utilities.
3. Implement microphone access and audio lifecycle.
4. Implement pitch detection and smoothing.
5. Build a functional two-dimensional tuner interface.
6. Add guitar tunings and string-selection logic.
7. Add the Three.js experience.
8. Add polished transitions and micro-interactions.
9. Optimize mobile performance and accessibility.
10. Add tests and the development signal simulator.
11. Configure GitHub Pages deployment.
12. Review the production build for asset-path and permission issues.

At every stage, keep the application runnable.

Prioritize correctness and usability before adding advanced visual effects.

## Final Quality Standard

The final result should feel like a credible consumer music application rather than a technical demo.

The tuner must be immediately understandable, visually distinctive, accurate enough for practical everyday guitar tuning, and robust when microphone, browser, or graphics capabilities are limited.
