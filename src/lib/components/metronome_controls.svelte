<script lang="ts">
  import { onMount } from "svelte";
  import { metronomeEngineState } from "$lib/components/metronome_engine_state.svelte";
  import { swingState } from "$lib/components/swing_state.svelte";

  onMount(async () => {
    await metronomeEngineState.init(swingState.currentSequence);
    metronomeEngineState.updateBPM(swingState.internalBPM);
  });

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    metronomeEngineState.updateVolume(Number(target.value));
  }

  function handleBackswingChange(e: Event) {
    const target = e.target as HTMLInputElement;
    swingState.setBackswingTimeMs(Number(target.value));
  }

  function handleDownswingChange(e: Event) {
    const target = e.target as HTMLInputElement;
    swingState.setDownswingTimeMs(Number(target.value));
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
            <div class="text-sm text-gray-600">Backswing</div>
            <div class="text-3xl font-bold">{Math.round(swingState.backswingTimeMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Downswing</div>
            <div class="text-3xl font-bold">{Math.round(swingState.downswingTimeMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Total Time</div>
            <div class="text-3xl font-bold">{Math.round(swingState.totalSwingTimeMs)} ms</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Perceived BPM</div>
            <div class="text-3xl font-bold">{Math.round(swingState.perceivedBPM)}</div>
          </div>
        </div>
      </div>

      <!-- Emphasize Impact Checkbox -->
      <div>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={swingState.emphasizeImpact}
            onchange={(e) => swingState.setEmphasizeImpact((e.target as HTMLInputElement).checked)}
            class="h-4 w-4"
          />
          <span class="text-sm font-medium">Emphasize Impact</span>
        </label>
      </div>

      <!-- Timing Sliders -->
      <div class="space-y-4">
        <!-- Backswing Slider -->
        <div>
          <label for="backswing" class="mb-2 block text-sm font-medium">
            Backswing: {Math.round(swingState.backswingTimeMs)} ms
          </label>
          <input
            id="backswing"
            type="range"
            min="200"
            max="2000"
            value={swingState.backswingTimeMs}
            oninput={handleBackswingChange}
            class="w-full"
          />
          <div class="mt-1 flex justify-between text-xs text-gray-500">
            <span>200ms</span>
            <span>2000ms</span>
          </div>
        </div>

        <!-- Downswing Slider -->
        <div>
          <label for="downswing" class="mb-2 block text-sm font-medium">
            Downswing: {Math.round(swingState.downswingTimeMs)} ms
          </label>
          <input
            id="downswing"
            type="range"
            min="100"
            max="1000"
            value={swingState.downswingTimeMs}
            oninput={handleDownswingChange}
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
            {#each presets2to1 as downswingFrames (downswingFrames)}
              <button
                onclick={() => swingState.loadPreset(downswingFrames)}
                class="rounded bg-gray-200 py-2 text-sm font-medium transition-colors hover:bg-gray-300"
              >
                {downswingFrames * 2}/{downswingFrames}
              </button>
            {/each}
          </div>
        {:else}
          <div class="grid grid-cols-6 gap-2">
            {#each presets3to1 as downswingFrames (downswingFrames)}
              <button
                onclick={() => swingState.loadPreset(downswingFrames)}
                class="rounded bg-gray-200 py-2 text-sm font-medium transition-colors hover:bg-gray-300"
              >
                {downswingFrames * 3}/{downswingFrames}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Volume Control -->
      <div>
        <label for="volume" class="mb-2 block text-sm font-medium">
          Volume: {Math.round(metronomeEngineState.volume * 100)}%
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="2.0"
          step="0.01"
          value={metronomeEngineState.volume}
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
        onclick={() => metronomeEngineState.togglePlay()}
        class="w-full rounded py-4 text-xl font-bold {metronomeEngineState.isPlaying
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-green-500 hover:bg-green-600'} text-white transition-colors"
      >
        {metronomeEngineState.isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  </div>
</div>
