import { useState, useEffect } from "react";

class AudioManager {
  private ctx: AudioContext | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private mainGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isMuted: boolean = true;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Lazy init on first user interaction
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("portfolio-muted") !== "false";
    }
  }

  private init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Create white noise buffer
    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill buffer with random values
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create noise source
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    // Filter to make it sound like pink/brown noise (deeper)
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 350;
    filter.Q.value = 1.0;

    // Modulate filter frequency for waving effect
    const filterLfo = this.ctx.createOscillator();
    filterLfo.frequency.value = 0.07; // Very slow cycle (approx 14 seconds)
    
    const filterLfoGain = this.ctx.createGain();
    filterLfoGain.gain.value = 180; // modulate filter by +/- 180Hz

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    // Main gain for volume control
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.value = 0.0; // start silent

    // LFO for volume modulation (swelling)
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 0.07;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.12; // wave amplitude

    this.lfo.connect(lfoGain);
    lfoGain.connect(this.mainGain.gain);

    // Connect nodes
    this.noiseSource.connect(filter);
    filter.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);

    // Start sound generators
    this.noiseSource.start(0);
    this.lfo.start(0);
    filterLfo.start(0);

    // Fade in wave volume if unmuted
    if (!this.isMuted) {
      this.ctx.resume();
      this.mainGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 1.5);
    }
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  public subscribe(cb: (muted: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isMuted));
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("portfolio-muted", String(this.isMuted));
    this.notify();

    if (!this.isMuted) {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      if (this.mainGain && this.ctx) {
        this.mainGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.8);
      }
      // Play a happy bubble confirmation
      setTimeout(() => this.playBubble(), 100);
    } else {
      if (this.mainGain && this.ctx) {
        this.mainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
    }
  }

  public playBubble() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    
    // Bubble sound sweep
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    // Create a mini splash sound (burst of noise + sine wave)
    const now = this.ctx.currentTime;
    
    // Low pop
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "triangle";
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.21);

    // High splash sparkle
    const spark = this.ctx.createOscillator();
    const sparkGain = this.ctx.createGain();
    spark.connect(sparkGain);
    sparkGain.connect(this.ctx.destination);
    spark.frequency.setValueAtTime(900, now);
    spark.frequency.exponentialRampToValueAtTime(2200, now + 0.1);
    sparkGain.gain.setValueAtTime(0.03, now);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    spark.start(now);
    spark.stop(now + 0.11);
  }
}

export const audioManager = new AudioManager();

export function useAudioState() {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(audioManager.getMutedState());
    return audioManager.subscribe((m) => {
      setMuted(m);
    });
  }, []);

  return {
    muted,
    toggleMute: () => audioManager.toggleMute(),
    playBubble: () => audioManager.playBubble(),
    playSplash: () => audioManager.playSplash(),
  };
}
