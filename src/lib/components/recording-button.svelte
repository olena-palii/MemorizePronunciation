<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { startRecordingAudio, stopRecordingAudio, WordRecordIcon } from "$lib";

  interface Props {
    onstop: () => any;
  }

  let { onstop }: Props = $props();

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  let recording = $state<boolean>(false);
  let timerInSeconds = $state<string>("0.00");
  let progress = $state<number>(0);

  async function record() {
    timerInSeconds = "0.00";
    progress = 0;
    recording = true;
    await startRecordingAudio();
    timer(5000);
  }

  function timer(duration: number) {
    let elapsed = 0;
    const interval = 50;

    const timer = setInterval(() => {
      elapsed += interval;
      timerInSeconds = `${(elapsed / 1000).toFixed(2)}`;
      progress = Math.min((elapsed / duration) * 100, 100);
      if (elapsed >= duration || !recording) {
        clearInterval(timer);
        stop();
      }
    }, interval);
  }

  function stop() {
    stopRecordingAudio();
    recording = false;
    onstop();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "r" || event.key === "R") {
      if (recording) stop();
      else record();
    }
  }
</script>

{#if recording}
    <div class="inline-flex items-center justify-center" style="width: 3.5rem; height: 3.5rem;">
        <div class="radial-progress pointer-events-none" style="--value: {progress}; --size: 3.5rem; --thickness: 0.5rem;" aria-valuenow="{progress}" role="progressbar"></div>
        <button class="btn btn-circle btn-error absolute" aria-label="Stop recording" onclick={stop}>{timerInSeconds}</button>
    </div>
{:else}
    <button class="btn btn-circle btn-info btn-xl" aria-label="Start recording" onclick={record}>
        <WordRecordIcon />
    </button>
{/if}