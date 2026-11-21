/**
 * Realistic Blue Mechanical Switch (Cherry MX Blue / Kailh Box White) Audio Synthesizer.
 * Built using native Web Audio API with zero external assets.
 * Accurately models:
 *  1. Click leaf tactile snap (filtered high-Q noise impulse)
 *  2. Stem & Keycap bottom-out thud (frequency-swept low-pass body)
 *  3. Acoustic keyboard plate resonance
 */

let audioCtx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {})
    }
    return audioCtx
  } catch {
    return null
  }
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.5) // 0.5 sec white noise buffer
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const channel = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      channel[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

export type TrainerSoundType = "hit" | "subhit" | "perfect" | "miss" | "start" | "reset"

export function playSwitchSound(type: TrainerSoundType = "hit"): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  if (type === "start") {
    // Double click-clack tap
    playSingleClick(ctx, now, { clickFreq: 4600, thudFreq: 360, gain: 0.28 })
    playSingleClick(ctx, now + 0.045, { clickFreq: 4200, thudFreq: 320, gain: 0.35, chime: true })
    return
  }

  if (type === "reset") {
    // Reverse double clack
    playSingleClick(ctx, now, { clickFreq: 3200, thudFreq: 280, gain: 0.25 })
    playSingleClick(ctx, now + 0.05, { clickFreq: 4000, thudFreq: 340, gain: 0.3 })
    return
  }

  if (type === "miss") {
    // Muted bottom-out thud (damped key bottom-out without click leaf snap)
    playMutedThud(ctx, now)
    return
  }

  if (type === "subhit") {
    // Lighter tap for multi-hit combos
    playSingleClick(ctx, now, { clickFreq: 4800, thudFreq: 420, gain: 0.26 })
    return
  }

  if (type === "perfect") {
    // Satisfying Blue switch click with brass plate harmonic resonance
    playSingleClick(ctx, now, { clickFreq: 4300, thudFreq: 350, gain: 0.38, chime: true })
    return
  }

  // Standard "hit": Crisp Cherry MX Blue tactile click
  playSingleClick(ctx, now, { clickFreq: 4200, thudFreq: 380, gain: 0.32 })
}

interface ClickOptions {
  clickFreq: number
  thudFreq: number
  gain: number
  chime?: boolean
}

function playSingleClick(ctx: AudioContext, startTime: number, opts: ClickOptions) {
  try {
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(opts.gain, startTime)
    masterGain.connect(ctx.destination)

    // 1. Tactile Click Leaf Snap (Sharp noise burst through bandpass filter)
    const noise = ctx.createBufferSource()
    noise.buffer = getNoiseBuffer(ctx)

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.setValueAtTime(opts.clickFreq, startTime)
    bandpass.Q.setValueAtTime(6.0, startTime)

    const clickGain = ctx.createGain()
    clickGain.gain.setValueAtTime(0.9, startTime)
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.014) // 14ms crisp snap

    noise.connect(bandpass)
    bandpass.connect(clickGain)
    clickGain.connect(masterGain)

    noise.start(startTime)
    noise.stop(startTime + 0.016)

    // 2. Keycap & Stem Bottom-Out Clack (Low-frequency downward pitch sweep)
    const thudOsc = ctx.createOscillator()
    thudOsc.type = "triangle"
    thudOsc.frequency.setValueAtTime(opts.thudFreq, startTime)
    thudOsc.frequency.exponentialRampToValueAtTime(140, startTime + 0.028) // drops to 140Hz

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = "lowpass"
    lowpass.frequency.setValueAtTime(750, startTime)
    lowpass.Q.setValueAtTime(1.5, startTime)

    const thudGain = ctx.createGain()
    thudGain.gain.setValueAtTime(0.7, startTime)
    thudGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.038) // 38ms bottom-out

    thudOsc.connect(lowpass)
    lowpass.connect(thudGain)
    thudGain.connect(masterGain)

    thudOsc.start(startTime)
    thudOsc.stop(startTime + 0.040)

    // 3. Optional Custom Plate Chime (Harmonic resonance for perfect hits)
    if (opts.chime) {
      const chimeOsc = ctx.createOscillator()
      chimeOsc.type = "sine"
      chimeOsc.frequency.setValueAtTime(1760, startTime) // A6 harmonic

      const chimeGain = ctx.createGain()
      chimeGain.gain.setValueAtTime(0.08, startTime)
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14)

      chimeOsc.connect(chimeGain)
      chimeGain.connect(masterGain)

      chimeOsc.start(startTime)
      chimeOsc.stop(startTime + 0.15)
    }
  } catch {
    // Audio node creation error ignored
  }
}

function playMutedThud(ctx: AudioContext, startTime: number) {
  try {
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.3, startTime)
    masterGain.connect(ctx.destination)

    // Dull, damped bottom-out (muted spacebar / incorrect hit)
    const osc = ctx.createOscillator()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(180, startTime)
    osc.frequency.exponentialRampToValueAtTime(65, startTime + 0.045)

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(320, startTime)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.8, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.065)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(startTime)
    osc.stop(startTime + 0.070)
  } catch {}
}
