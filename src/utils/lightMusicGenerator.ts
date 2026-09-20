/**
 * Light Ambient & Chill Music Generator
 * Generates soft, relaxing, non-intrusive background music with warm chords,
 * gentle chimes, and smooth melodies — completely free of drone frequencies or heavy sub buzz.
 *
 * @license Apache-2.0
 */

import { getMidiNoteFrequency432 } from './audioSynth';

export type LightMusicStyle = 'lofi_chords' | 'airy_ambient' | 'glass_bells' | 'smooth_chillwave';

export interface LightMusicPreset {
  id: LightMusicStyle;
  name: string;
  description: string;
  defaultBpm: number;
  iconName: string;
  chords: number[][]; // MIDI note numbers
  melodies?: number[][];
}

export const LIGHT_MUSIC_PRESETS: LightMusicPreset[] = [
  {
    id: 'lofi_chords',
    name: 'Lo-Fi Sunset Chords',
    description: 'Warm electric piano 7th & 9th chords with soft, gentle atmospheric harmony.',
    defaultBpm: 72,
    iconName: 'Coffee',
    chords: [
      [60, 64, 67, 71, 74], // Cmaj9
      [57, 60, 64, 67, 71], // Am9
      [53, 57, 60, 64, 67], // Fmaj9
      [55, 59, 62, 65, 69]  // G7(9)
    ],
    melodies: [
      [76, 74, 71, 67],
      [72, 71, 67, 64],
      [74, 72, 69, 65],
      [71, 69, 67, 62]
    ]
  },
  {
    id: 'airy_ambient',
    name: 'Airy Ambient Pads',
    description: 'Soft, floating ethereal pads with smooth harmonic blooms and peaceful decay.',
    defaultBpm: 60,
    iconName: 'CloudSun',
    chords: [
      [60, 65, 67, 72],     // Csus4
      [58, 62, 65, 70],     // Bbmaj7
      [57, 60, 64, 69],     // Am7
      [53, 57, 60, 65]      // Fadd9
    ],
    melodies: [
      [79, 84, 86],
      [77, 82, 84],
      [76, 81, 84],
      [72, 77, 79]
    ]
  },
  {
    id: 'glass_bells',
    name: 'Ethereal Glass Bells',
    description: 'Sparkling crystalline pentatonic chimes with serene space and natural decay.',
    defaultBpm: 66,
    iconName: 'Sparkles',
    chords: [
      [64, 67, 71, 76], // Em7
      [62, 65, 69, 74], // Dm7
      [60, 64, 67, 72], // Cmaj7
      [62, 67, 71, 74]  // G/B
    ],
    melodies: [
      [83, 86, 88, 91],
      [81, 84, 86, 88],
      [79, 83, 84, 86],
      [81, 83, 86, 88]
    ]
  },
  {
    id: 'smooth_chillwave',
    name: 'Smooth Chillwave',
    description: 'Melodic arpeggios, warm Rhodes keys, and relaxing progressive chord transitions.',
    defaultBpm: 78,
    iconName: 'Waves',
    chords: [
      [50, 57, 62, 65, 69], // Dm9
      [46, 53, 58, 62, 65], // Bbmaj7
      [53, 60, 65, 69, 72], // Fmaj7
      [48, 55, 60, 63, 67]  // C7
    ],
    melodies: [
      [74, 77, 81, 86],
      [70, 74, 77, 82],
      [72, 77, 81, 84],
      [67, 72, 75, 79]
    ]
  }
];

class LightMusicEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private isPlaying: boolean = false;
  private currentStyle: LightMusicStyle = 'lofi_chords';
  private currentBpm: number = 72;
  private volume: number = 0.65;
  private timerId: number | null = null;
  private step: number = 0;
  private chordIndex: number = 0;
  
  // Listeners
  private onBeatCallbacks: Set<(beat: number, chordName: string) => void> = new Set();
  private onStateChangeCallbacks: Set<(isPlaying: boolean) => void> = new Set();

  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.setupMasterNodes();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private setupMasterNodes() {
    if (!this.audioCtx) return;
    
    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume * 0.4, this.audioCtx.currentTime);

    // Highpass filter to eliminate any drone / rumble frequencies below 150Hz
    this.highPassFilter = this.audioCtx.createBiquadFilter();
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.setValueAtTime(160, this.audioCtx.currentTime);

    // Soft gentle lowpass to keep the high-end silky smooth and un-harsh
    const gentleLowPass = this.audioCtx.createBiquadFilter();
    gentleLowPass.type = 'lowpass';
    gentleLowPass.frequency.setValueAtTime(4500, this.audioCtx.currentTime);

    this.highPassFilter.connect(gentleLowPass);
    gentleLowPass.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentStyle(): LightMusicStyle {
    return this.currentStyle;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getBpm(): number {
    return this.currentBpm;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioCtx.currentTime + 0.1);
    }
  }

  public setStyle(styleId: LightMusicStyle) {
    this.currentStyle = styleId;
    const preset = LIGHT_MUSIC_PRESETS.find(p => p.id === styleId);
    if (preset) {
      this.currentBpm = preset.defaultBpm;
    }
    this.chordIndex = 0;
    this.step = 0;
  }

  public setBpm(bpm: number) {
    this.currentBpm = Math.max(50, Math.min(120, bpm));
  }

  public subscribeBeat(cb: (beat: number, chordName: string) => void): () => void {
    this.onBeatCallbacks.add(cb);
    return () => this.onBeatCallbacks.delete(cb);
  }

  public subscribeState(cb: (isPlaying: boolean) => void): () => void {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  private notifyState(playing: boolean) {
    this.onStateChangeCallbacks.forEach(cb => cb(playing));
  }

  /**
   * Plays a soft light music note with smooth envelope
   */
  private playSoftNote(midiNote: number, durationSec = 1.2, velocity = 0.4, type: OscillatorType = 'sine') {
    if (!this.isPlaying) return;
    const ctx = this.getAudioContext();
    const freq = getMidiNoteFrequency432(midiNote);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Warm soft detune for Rhodes chorus feel
    if (type === 'triangle') {
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);
    }

    // Soft ADSR envelope: gradual attack, gentle sustain, smooth fade out
    const attack = 0.06;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(velocity * 0.25, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    if (this.highPassFilter) {
      gain.connect(this.highPassFilter);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + durationSec + 0.1);
  }

  /**
   * Soft sparkling chime
   */
  private playChime(midiNote: number, durationSec = 0.8, velocity = 0.2) {
    if (!this.isPlaying) return;
    const ctx = this.getAudioContext();
    const freq = getMidiNoteFrequency432(midiNote);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(velocity * 0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    if (this.highPassFilter) {
      gain.connect(this.highPassFilter);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.getAudioContext();
    this.notifyState(true);
    this.step = 0;
    this.chordIndex = 0;
    this.tick();
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyState(false);
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  private tick() {
    if (!this.isPlaying) return;

    const preset = LIGHT_MUSIC_PRESETS.find(p => p.id === this.currentStyle) || LIGHT_MUSIC_PRESETS[0];
    const chords = preset.chords;
    const currentChord = chords[this.chordIndex % chords.length];
    const beatInBar = this.step % 4;

    const secondsPerBeat = 60 / this.currentBpm;

    // 1. Play warm chord pad on beat 1
    if (beatInBar === 0) {
      currentChord.forEach((note, idx) => {
        // Stagger notes slightly for strummed/humanized feel
        setTimeout(() => {
          if (!this.isPlaying) return;
          this.playSoftNote(note, secondsPerBeat * 3.8, 0.32, 'triangle');
        }, idx * 25);
      });
    }

    // 2. Play gentle arpeggiated melodic chimes on beats 2, 3, 4
    if (preset.melodies && preset.melodies.length > 0) {
      const melodySet = preset.melodies[this.chordIndex % preset.melodies.length];
      const melodyNote = melodySet[beatInBar % melodySet.length];
      if (melodyNote && Math.random() > 0.15) {
        setTimeout(() => {
          if (!this.isPlaying) return;
          this.playChime(melodyNote, secondsPerBeat * 1.5, 0.22);
        }, 120);
      }
    }

    // Notify UI listeners
    const chordNames = ['Cmaj9', 'Am9', 'Fmaj9', 'G9'];
    const chordName = chordNames[this.chordIndex % chordNames.length];
    this.onBeatCallbacks.forEach(cb => cb(beatInBar + 1, chordName));

    // Progress counter
    this.step++;
    if (beatInBar === 3) {
      this.chordIndex = (this.chordIndex + 1) % chords.length;
    }

    this.timerId = window.setTimeout(() => {
      this.tick();
    }, secondsPerBeat * 1000);
  }
}

export const lightMusic = new LightMusicEngine();
