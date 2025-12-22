<script lang="ts">
  import { onMount } from "svelte";
  import { metronome } from "$lib/audio/metronome-state.svelte";
  import { swingState } from "$lib/swing-state.svelte";

  onMount(async () => {
    await metronome.init();
    await metronome.switchSequence(swingState.currentSequence);
    metronome.updateBPM(swingState.internalBPM);
  });

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    metronome.updateVolume(Number(target.value));
  }

  function handleBackwardSwingChange(e: Event) {
    const target = e.target as HTMLInputElement;
    swingState.setBackwardSwingMs(Number(target.value));
  }

  function handleForwardSwingChange(e: Event) {
    const target = e.target as HTMLInputElement;
    swingState.setForwardSwingMs(Number(target.value));
  }

  const presets2to1 = [5, 6, 7, 8, 9, 10];
  const presets3to1 = [5, 6, 7, 8, 9, 10];
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
  <div class="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
    <h1 class="mb-6 text-center text-3xl font-bold">Tour Tempo</h1>

    <div class="space-y-8">
      <!-- Ratio Mode Selector -->
      <div>
        <div class="mb-2 block text-sm font-medium">Ratio Mode</div>
        <div class="flex gap-4">
          <button
            onclick={() => swingState.setRatioMode(2)}
            class="flex-1 rounded py-2 {swingState.ratioMode === 2
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'} transition-colors"
          >
            2:1
          </button>
          <button
            onclick={() => swingState.setRatioMode(3)}
            class="flex-1 rounded py-2 {swingState.ratioMode === 3
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'} transition-colors"
          >
            3:1
          </button>
        </div>
      </div>

      <!-- Large Display -->
      <div class="rounded-lg bg-gray-50 p-6">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-sm text-gray-600">Backward Swing</div>
            <div class="text-3xl font-bold">{Math.round(swingState.backwardSwingMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Forward Swing</div>
            <div class="text-3xl font-bold">{Math.round(swingState.forwardSwingMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Total Time</div>
            <div class="text-3xl font-bold">{Math.round(swingState.totalSwingMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">BPM</div>
            <div class="text-3xl font-bold">{Math.round(swingState.displayBPM)}</div>
          </div>
        </div>
      </div>

      <!-- Timing Sliders -->
      <div class="space-y-4">
        <!-- Backward Swing Slider -->
        <div>
          <label for="backward" class="mb-2 block text-sm font-medium">
            Backward Swing: {Math.round(swingState.backwardSwingMs)} ms
          </label>
          <input
            id="backward"
            type="range"
            min="200"
            max="2000"
            value={swingState.backwardSwingMs}
            oninput={handleBackwardSwingChange}
            class="w-full"
          />
          <div class="mt-1 flex justify-between text-xs text-gray-500">
            <span>200ms</span>
            <span>2000ms</span>
          </div>
        </div>

        <!-- Forward Swing Slider -->
        <div>
          <label for="forward" class="mb-2 block text-sm font-medium">
            Forward Swing: {Math.round(swingState.forwardSwingMs)} ms
          </label>
          <input
            id="forward"
            type="range"
            min="100"
            max="1000"
            value={swingState.forwardSwingMs}
            oninput={handleForwardSwingChange}
            class="w-full"
          />
          <div class="mt-1 flex justify-between text-xs text-gray-500">
            <span>100ms</span>
            <span>1000ms</span>
          </div>
        </div>
      </div>

      <!-- Preset Buttons -->
      <div>
        <div class="mb-2 block text-sm font-medium">Presets</div>
        {#if swingState.ratioMode === 2}
          <div class="grid grid-cols-6 gap-2">
            {#each presets2to1 as forward (forward)}
              <button
                onclick={() => swingState.loadPreset(forward)}
                class="rounded bg-gray-200 py-2 text-sm font-medium transition-colors hover:bg-gray-300"
              >
                {forward * 2}/{forward}
              </button>
            {/each}
          </div>
        {:else}
          <div class="grid grid-cols-6 gap-2">
            {#each presets3to1 as forward (forward)}
              <button
                onclick={() => swingState.loadPreset(forward)}
                class="rounded bg-gray-200 py-2 text-sm font-medium transition-colors hover:bg-gray-300"
              >
                {forward * 3}/{forward}
              </button>
            {/each}
          </div>
        {/if}
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
