/**
 * Generate a click sound programmatically using Web Audio API
 */
export function generateClickBuffer(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.05; // 50ms
  const numSamples = Math.floor(sampleRate * duration);

  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Generate a short click with exponential decay
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const frequency = 1200;
    const decay = Math.exp(-t * 100);

    channelData[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.5;
  }

  return buffer;
}
