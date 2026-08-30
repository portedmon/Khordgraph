// Web Audio API based Polyphonic Piano Synthesizer and Audio Effects

class AudioSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVoices: Map<number, { oscs: OscillatorNode[]; gains: GainNode[] }> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Lazy init audio context on user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public midiToFreq(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Play a realistic piano-like tone using additive synthesis & filtered envelope
   */
  public playNote(midiNote: number, velocity = 0.8, duration?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // Stop existing voice on this note if any
    this.stopNote(midiNote);

    const now = this.ctx.currentTime;
    const freq = this.midiToFreq(midiNote);

    // Master filter for piano brightness curve (higher velocity = brighter)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 6 * (0.5 + velocity * 0.5), 14000), now);
    filter.Q.setValueAtTime(1.0, now);

    const voiceGain = this.ctx.createGain();
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Piano Harmonics: Fundamental + 2nd + 3rd + 4th harmonic
    const harmonics = [
      { mult: 1.0, gain: 0.7, type: 'triangle' as OscillatorType, decay: 2.2 },
      { mult: 2.0, gain: 0.35, type: 'sine' as OscillatorType, decay: 1.5 },
      { mult: 3.0, gain: 0.15, type: 'sine' as OscillatorType, decay: 0.9 },
      { mult: 4.0, gain: 0.05, type: 'sine' as OscillatorType, decay: 0.6 },
    ];

    harmonics.forEach((h) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = h.type;
      // Slight detune for acoustic richness
      osc.frequency.setValueAtTime(freq * h.mult + (Math.random() - 0.5) * 0.8, now);

      // Attack & decay envelope
      const maxAmp = h.gain * velocity;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(maxAmp, now + 0.006); // Fast strike attack
      g.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

      osc.connect(g);
      g.connect(voiceGain);
      osc.start(now);
      osc.stop(now + h.decay + 0.1);

      oscs.push(osc);
      gains.push(g);
    });

    voiceGain.connect(filter);
    filter.connect(this.masterGain);

    this.activeVoices.set(midiNote, { oscs, gains });

    // If duration specified, automatically stop after duration
    if (duration) {
      setTimeout(() => {
        this.stopNote(midiNote);
      }, duration * 1000);
    }
  }

  public stopNote(midiNote: number) {
    if (!this.ctx) return;
    const voice = this.activeVoices.get(midiNote);
    if (!voice) return;

    const now = this.ctx.currentTime;
    voice.gains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15); // Smooth release
      } catch {
        // ignore
      }
    });

    setTimeout(() => {
      voice.oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.activeVoices.delete(midiNote);
    }, 200);
  }

  /**
   * Play multiple notes as a block chord
   */
  public playChord(midiNotes: number[], duration = 2.0) {
    this.init();
    midiNotes.forEach((note, idx) => {
      // slight strum delay (5ms) for natural feel
      setTimeout(() => {
        this.playNote(note, 0.75, duration);
      }, idx * 8);
    });
  }

  /**
   * Play notes as an arpeggio
   */
  public playArpeggio(midiNotes: number[], noteDuration = 0.25) {
    this.init();
    midiNotes.forEach((note, idx) => {
      setTimeout(() => {
        this.playNote(note, 0.8, 1.2);
      }, idx * noteDuration * 1000);
    });
  }

  /**
   * "ピロリン♪" Success Chime Jingle
   * High-pitch pleasant bell chime (e.g. C6 -> E6 -> G6 -> C7 fast arpeggio)
   */
  public playSuccessJingle() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [72, 76, 79, 84]; // C5, E5, G5, C6 (bright & uplifting)
    const now = this.ctx.currentTime;

    notes.forEach((midi, i) => {
      if (!this.ctx || !this.masterGain) return;
      const startTime = now + i * 0.07;
      const freq = this.midiToFreq(midi);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.76, startTime); // metallic chime harmonic

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

      gain2.gain.setValueAtTime(0.001, startTime);
      gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.9);

      osc2.start(startTime);
      osc2.stop(startTime + 0.5);
    });
  }

  /**
   * Metronome click sound
   */
  public playMetronomeTick(isAccent = false) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);

    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioSynth = new AudioSynth();
