/**
 * Web Audio API-based metronome engine with precise timing
 * Uses look-ahead scheduling for sub-millisecond accuracy
 */

import { generateClickBuffer } from "./generate-click";
import { ClickIterator } from "./click-iterator";
import {
  type Sequence,
  type BufferBasedClickType,
  type FileBasedClickType,
  FILE_BASED_TYPES,
  type Click,
} from "./sequence";
import { assertNever } from "$lib/typing-utils";

export class MetronomeEngine {
  private readonly audioContext: AudioContext;
  private readonly masterGain: GainNode;
  private readonly buffers: Map<BufferBasedClickType, AudioBuffer>;
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
    buffers: Map<BufferBasedClickType, AudioBuffer>,
    sequence: Sequence,
  ) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
    this.buffers = buffers;
    this.clickIterator = new ClickIterator(sequence);
  }

  static async create(initialVolume: number, sequence: Sequence): Promise<MetronomeEngine> {
    const audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = initialVolume;

    const buffers = new Map<BufferBasedClickType, AudioBuffer>();

    // Generate synth2 buffer
    buffers.set("synth2", generateClickBuffer(audioContext));

    // Load all file-based samples
    await Promise.all(
      FILE_BASED_TYPES.map(async (clickType) => {
        const filename = MetronomeEngine.getSampleFilename(clickType);
        // I was hoping that `asset(filename)` (from `$app/paths`) would produce a relative URL here so that
        // it works on GitHub, but apparently the `relative: true` path setting will only mean that `asset`
        // returns relative paths during server-side rendering, not at runtime. Since we want relative URLs
        // we have to generate them manually.
        const url = `./${filename}`;
        try {
          const buffer = await MetronomeEngine.loadClickSample(audioContext, url);
          buffers.set(clickType, buffer);
        } catch (error) {
          console.warn(
            `Failed to load audio file for ${clickType} from ${url} (will be unavailable):`,
            error,
          );
        }
      }),
    );

    return new MetronomeEngine(audioContext, masterGain, buffers, sequence);
  }

  static getSampleFilename(clickType: FileBasedClickType): string {
    switch (clickType) {
      case "hi-hat1":
        return "185211__casmarrav__retro-hi-hat.wav";
      case "hi-hat2":
        return "203348__klemmy__12-typhoonb.wav";
      case "hi-hat3":
        return "219614__ani_music__filtered-closed-hi-hat-hhclfilt_1a.wav";
      case "hi-hat4":
        return "554650__0ai__hat.wav";
      case "hi-hat5":
        return "674296__theendofacycle__hi-hat-closed-hit-clean.wav";
      case "hi-hat6":
        return "78812__matiasromero__hi-hat2-waldir.wav";
      case "perc_clicktoy":
        return "548508__ludwigmueller__perc_clicktoy_hi.wav";
      case "perc_glass":
        return "548510__ludwigmueller__perc_glass_hi.wav";
      case "perc_metronomequartz":
        return "548518__ludwigmueller__perc_metronomequartz_hi.wav";
      case "perc_stick":
        return "548530__ludwigmueller__perc_stick_hi.wav";
      case "synth_block_e":
        return "548562__ludwigmueller__synth_block_e_hi.wav";
      case "synth_square_d":
        return "548588__ludwigmueller__synth_square_d_hi.wav";
      case "synth_square_e":
        return "548590__ludwigmueller__synth_square_e_hi.wav";
      case "synth_tick_b":
        return "548594__ludwigmueller__synth_tick_b_hi.wav";
      case "synth_tick_c":
        return "548596__ludwigmueller__synth_tick_c_hi.wav";
      case "synth_tick_e":
        return "548600__ludwigmueller__synth_tick_e_hi.wav";
      case "synth_tick_h":
        return "548606__ludwigmueller__synth_tick_h_hi.wav";
      default:
        return assertNever(clickType);
    }
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
    this.bpm = bpm;
  }

  setVolume(volume: number): void {
    this.masterGain.gain.value = volume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getBPM(): number {
    return this.bpm;
  }

  private scheduler(): void {
    const secondsPerBeat = 60.0 / this.bpm;

    function timeToBeat(time: number): number {
      return time / secondsPerBeat;
    }
    function beatToTime(beat: number): number {
      return beat * secondsPerBeat;
    }

    const currentTime = this.audioContext.currentTime;

    // BPM CHANGE HANDLING:
    // We cannot simply convert total elapsed audio time to beats using current BPM,
    // because BPM may have changed during playback. Instead, we:
    // 1. Track only the delta time since last scheduling
    // 2. Convert that delta using current BPM (assuming BPM is stable within ~25ms)
    // 3. Accumulate to currentBeat for absolute beat position
    // This ensures BPM changes don't cause jumps in the beat timeline.
    const deltaTime = currentTime - this.lastScheduleTime;
    const deltaBeat = timeToBeat(deltaTime);

    // Update current beat position based on elapsed time
    this.currentBeat += deltaBeat;

    // Calculate beat range to schedule (look ahead by scheduleAheadTime)
    const beatUpto = this.currentBeat + timeToBeat(this.scheduleAheadTime);

    // Get clicks with absolute beat positions
    const clicks = this.clickIterator.getClicksUpto(beatUpto);

    // Schedule each click at its absolute audio time
    for (const click of clicks) {
      // Convert click's absolute beat to audio time
      const clickTime = currentTime + beatToTime(click.beat - this.currentBeat);
      this.scheduleClick(clickTime, click);
    }

    // Update last schedule time
    this.lastScheduleTime = currentTime;
  }

  private scheduleClick(time: number, click: Click): void {
    if (click.type === "synth1") {
      this.scheduleSynthClick(time, click.volume);
    } else {
      const buffer = this.buffers.get(click.type);
      if (!buffer) {
        throw new Error(`Buffer not found for click type: ${click.type}`);
      }
      this.scheduleBufferClick(time, buffer, click.volume);
    }
  }

  private scheduleSynthClick(time: number, volume: number): void {
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

  private scheduleBufferClick(time: number, buffer: AudioBuffer, volume: number): void {
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
