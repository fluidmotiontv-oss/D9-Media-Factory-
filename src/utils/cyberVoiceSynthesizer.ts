/**
 * Cyber Dragon Voice & Audio Synthesizer (CYBER_DRAGON_FACE.V4)
 * Generates robotic vocoded 432Hz cybernetic speech for the Dragon 9 Nutflox Special Render.
 *
 * Line: "Welcome to the Dragon 9 Synchronized Time Pipeline. Fluid Motion sequence is now active. Synchronize your time with the future."
 *
 * @license Apache-2.0
 */

export interface CyberVoicePlaybackOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onWaveformUpdate?: (level: number) => void;
  pitch?: number;
  subBassBoost?: boolean;
}

class CyberVoiceEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private animFrameId: number | null = null;

  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays the official Cyber Dragon VO with real-time 432Hz robotic sub-harmonics
   */
  public async speakCyberDragonLine(
    customText?: string,
    options: CyberVoicePlaybackOptions = {}
  ): Promise<void> {
    const textToSpeak = customText || 
      "Welcome to the Dragon 9 Synchronized Time Pipeline. Fluid Motion sequence is now active. Synchronize your time with the future.";

    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    if (options.onStart) options.onStart();

    const ctx = this.getAudioContext();

    // Clean speech synthesis with visual waveform analyzer (No background drone oscillators)
    const filter = ctx.createBiquadFilter();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(120, ctx.currentTime); // Filter out low-frequency rumble/hum

    filter.connect(analyser);
    analyser.connect(ctx.destination);

    // Animation monitor for visual waveforms
    const updateWaveform = () => {
      if (!this.isPlaying) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength / 255;
      if (options.onWaveformUpdate) {
        options.onWaveformUpdate(avg);
      }
      this.animFrameId = requestAnimationFrame(updateWaveform);
    };
    this.animFrameId = requestAnimationFrame(updateWaveform);

    // 2. Use SpeechSynthesis with robotic parameters if available in browser
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      utterance.pitch = options.pitch ?? 0.75; // Balanced crisp robotic tone without drone
      utterance.rate = 0.95; // Natural smooth cadence
      utterance.volume = 0.9;

      // Select deep voice if available
      const voices = window.speechSynthesis.getVoices();
      const deepVoice = voices.find(v => 
        v.name.includes('Google UK English Male') || 
        v.name.includes('Daniel') || 
        v.name.includes('David') || 
        v.name.toLowerCase().includes('male')
      );
      if (deepVoice) {
        utterance.voice = deepVoice;
      }

      utterance.onend = () => {
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (options.onWaveformUpdate) options.onWaveformUpdate(0);
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (options.onWaveformUpdate) options.onWaveformUpdate(0);
        if (options.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: timer
      setTimeout(() => {
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (options.onWaveformUpdate) options.onWaveformUpdate(0);
        if (options.onEnd) options.onEnd();
      }, 5500);
    }
  }

  private cleanupAudioNodes(
    oscs: OscillatorNode[],
    gains: GainNode[],
    ctx: AudioContext
  ) {
    try {
      gains.forEach(g => {
        g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      });
      setTimeout(() => {
        oscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch (e) {}
        });
      }, 350);
    } catch (err) {
      // Ignore cleanup error
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isVoicePlaying(): boolean {
    return this.isPlaying;
  }
}

export const cyberVoice = new CyberVoiceEngine();
