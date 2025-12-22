/**
 * Utility functions for converting between golf swing timing parameters and BPM
 */

/**
 * Converts time in milliseconds to BPM.
 * @param timeMs Time in milliseconds for one beat
 * @returns BPM value
 */
export function msToBPM(timeMs: number): number {
  return 60000 / timeMs;
}

/**
 * Converts frame notation (at 30 Hz) to milliseconds.
 * Used for preset buttons like "21/7" where numbers represent video frames.
 * @param frames Number of frames at 30 Hz
 * @returns Time in milliseconds
 */
export function frameNotationToMs(frames: number): number {
  return (frames * 1000) / 30;
}

/**
 * Calculates backward swing time from forward swing time and ratio.
 * @param forwardSwingMs Forward swing time in milliseconds
 * @param ratio Ratio mode (2 for 2:1, 3 for 3:1)
 * @returns Backward swing time in milliseconds
 */
export function getBackwardSwingTime(forwardSwingMs: number, ratio: 2 | 3): number {
  return forwardSwingMs * ratio;
}
