<script lang="ts">
  import { onMount } from "svelte";
  import { metronome } from "$lib/audio/metronome-state.svelte";

  onMount(async () => {
    await metronome.init();
  });

  function handleBPMChange(e: Event) {
    const target = e.target as HTMLInputElement;
    metronome.updateBPM(Number(target.value));
  }

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    metronome.updateVolume(Number(target.value));
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
  <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
    <h1 class="mb-6 text-center text-3xl font-bold">Tour Tempo</h1>

    <div class="space-y-6">
      <!-- BPM Control -->
      <div>
        <label for="bpm" class="mb-2 block text-sm font-medium">
          BPM: {metronome.bpm}
        </label>
        <input
          id="bpm"
          type="range"
          min="20"
          max="300"
          value={metronome.bpm}
          oninput={handleBPMChange}
          class="w-full"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>20</span>
          <span>300</span>
        </div>
      </div>

      <!-- Volume Control -->
      <div>
        <label for="volume" class="mb-2 block text-sm font-medium">
          Volume: {Math.round(metronome.volume * 100)}%
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="2.0"
          step="0.01"
          value={metronome.volume}
          oninput={handleVolumeChange}
          class="w-full"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Play/Stop Button -->
      <button
        onclick={() => metronome.togglePlay()}
        class="w-full rounded py-4 text-xl font-bold {metronome.isPlaying
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-green-500 hover:bg-green-600'} text-white transition-colors"
      >
        {metronome.isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  </div>
</div>
