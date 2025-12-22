/**
 * Web Audio API-based metronome engine with precise timing
 * Uses look-ahead scheduling for sub-millisecond accuracy
 */

import { generateClickBuffer } from "./generate-click";
import { ClickIterator } from "./click-iterator";
import type { Sequence } from "./sequence";

export type SoundType = "synth1" | "synth2" | "sample";

export class MetronomeEngine {
  private readonly audioContext: AudioContext;
  private readonly masterGain: GainNode;
  private readonly generatedClickBuffer: AudioBuffer;
  private readonly sampleClickBuffer: AudioBuffer;
  private readonly clickIterator: ClickIterator;

  private schedulerIntervalId: number | null = null;
  private currentBeat = 0;
  private lastScheduleTime = 0;
  private isPlaying = false;

  // Scheduling parameters
  private readonly scheduleAheadTime = 0.1; // Schedule 100ms ahead
  private readonly lookahead = 25; // Check every 25ms

  // Metronome parameters
  private bpm = 120;

  private constructor(
    audioContext: AudioContext,
    masterGain: GainNode,
    generatedClickBuffer: AudioBuffer,
    sampleClickBuffer: AudioBuffer,
    sequence: Sequence,
  ) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
    this.generatedClickBuffer = generatedClickBuffer;
    this.sampleClickBuffer = sampleClickBuffer;
    this.clickIterator = new ClickIterator(sequence);
  }

  static async create(initialVolume: number, sequence: Sequence): Promise<MetronomeEngine> {
    const audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = initialVolume;

    const generatedClickBuffer = generateClickBuffer(audioContext);
    const sampleClickBuffer = await MetronomeEngine.loadClickSample(
      audioContext,
      "/548508__perc_clicktoy_hi.wav",
    );

    return new MetronomeEngine(
      audioContext,
      masterGain,
      generatedClickBuffer,
      sampleClickBuffer,
      sequence,
    );
  }

  private static async loadClickSample(
    audioContext: AudioContext,
    url: string,
  ): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  start(): void {
    if (this.isPlaying) return;

    // Resume AudioContext if suspended (required by browser autoplay policies)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.lastScheduleTime = this.audioContext.currentTime;
    this.clickIterator.reset();

    this.schedulerIntervalId = window.setInterval(() => {
      this.scheduler();
    }, this.lookahead);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.schedulerIntervalId !== null) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
  }

  setBPM(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm)); // Clamp between 20-300
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
    this.masterGain.gain.value = clampedVolume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getBPM(): number {
    return this.bpm;
  }

  private scheduler(): void {
    const currentTime = this.audioContext.currentTime;

    // BPM CHANGE HANDLING:
    // We cannot simply convert total elapsed audio time to beats using current BPM,
    // because BPM may have changed during playback. Instead, we:
    // 1. Track only the delta time since last scheduling
    // 2. Convert that delta using current BPM (assuming BPM is stable within ~25ms)
    // 3. Accumulate to currentBeat for absolute beat position
    // This ensures BPM changes don't cause jumps in the beat timeline.
    const deltaTime = currentTime - this.lastScheduleTime;
    const secondsPerBeat = 60.0 / this.bpm;
    const deltaBeat = deltaTime / secondsPerBeat;

    // Update current beat position based on elapsed time
    this.currentBeat += deltaBeat;

    // Calculate beat range to schedule (look ahead by scheduleAheadTime)
    const beatUpto = this.currentBeat + this.scheduleAheadTime / secondsPerBeat;

    // Get clicks with absolute beat positions
    const clicks = this.clickIterator.getClicksUpto(beatUpto);

    // Schedule each click at its absolute audio time
    for (const click of clicks) {
      // Convert click's absolute beat to audio time
      const clickTime = currentTime + (click.beat - this.currentBeat) * secondsPerBeat;
      this.scheduleClick(clickTime, click);
    }

    // Update last schedule time
    this.lastScheduleTime = currentTime;
  }

  private scheduleClick(time: number, click: { soundType: SoundType; volume: number }): void {
    const buffer =
      click.soundType === "synth2" ? this.generatedClickBuffer : this.sampleClickBuffer;

    if (click.soundType === "synth1") {
      this.playSynthClick(time, click.volume);
    } else {
      this.playBufferClick(time, buffer, click.volume);
    }
  }

  private playSynthClick(time: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Fixed frequency - no accent logic
    osc.frequency.value = 880;

    // Short click envelope with per-click volume
    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  private playBufferClick(time: number, buffer: AudioBuffer, volume: number): void {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Apply per-click volume
    gainNode.gain.value = volume;

    source.start(time);
  }

  destroy(): void {
    this.stop();
    this.audioContext.close();
  }
}
