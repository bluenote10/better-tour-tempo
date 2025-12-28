export type ClickType =
  | "synth1"
  | "synth2"
  | "hi-hat1"
  | "hi-hat2"
  | "hi-hat3"
  | "hi-hat4"
  | "hi-hat5"
  | "hi-hat6"
  | "perc_clicktoy"
  | "perc_glass"
  | "perc_metronomequartz"
  | "perc_stick"
  | "synth_block_e"
  | "synth_square_d"
  | "synth_square_e"
  | "synth_tick_b"
  | "synth_tick_c"
  | "synth_tick_e"
  | "synth_tick_h";

export type FileBasedClickType = Exclude<ClickType, "synth1" | "synth2">;
export type BufferBasedClickType = Exclude<ClickType, "synth1">;

export interface Click {
  type: ClickType;
  beat: number;
  volume: number; // 0.0 - 1.0
}

export interface Sequence {
  clicks: Click[];
  maxBeat: number;
  perceivedBpmBeats: number;
}

export const FILE_BASED_TYPES: FileBasedClickType[] = [
  "hi-hat1",
  "hi-hat2",
  "hi-hat3",
  "hi-hat4",
  "hi-hat5",
  "hi-hat6",
  "perc_clicktoy",
  "perc_glass",
  "perc_metronomequartz",
  "perc_stick",
  "synth_block_e",
  "synth_square_d",
  "synth_square_e",
  "synth_tick_b",
  "synth_tick_c",
  "synth_tick_e",
  "synth_tick_h",
];
