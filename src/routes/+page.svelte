<script lang="ts">
  import { onMount } from "svelte";
  import { metronome } from "$lib/components/metronome_state.svelte";
  import { swingState } from "$lib/components/swing_state.svelte";
  import MetronomeControls from "$lib/components/metronome_controls.svelte";

  onMount(async () => {
    await metronome.init(swingState.currentSequence);
    metronome.updateBPM(swingState.internalBPM);
  });
</script>

<MetronomeControls />
