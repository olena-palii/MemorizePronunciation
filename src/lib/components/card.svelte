<script lang="ts">
  import { onMount } from "svelte";
  import { Word } from "$lib";
  import {
    textToSpeech,
    startRecordingAudio,
    stopRecordingAudio,
    playRecordedAudio,
  } from "$lib";

  interface Props {
    word: Word;
    next: () => any;
    previous: () => any;
    updateWord: (word: Word) => any;
  }

  let { word = $bindable(), next, previous, updateWord }: Props = $props();

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  let recording = $state<boolean>(false);
  let recordedWord = $state<Word | null>(null);
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
    recordedWord = word;
  }

  function play() {
    if (!recording) playRecordedAudio();
  }

  function isRecorded(): boolean {
    if (!recordedWord) return false;
    if (recordedWord.id !== word.id) return false;
    return true;
  }

  async function markAsLearned() {
    word.markAsLearned();
    updateWord(word);
    next();
  }

  async function resetLearning() {
    word.resetLearning();
    updateWord(word);
    next();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      previous();
    }
    if (event.key === "Enter") {
      if (word.isLearned) resetLearning();
      else markAsLearned();
    }
    if (event.key === " ") {
      event.preventDefault();
      textToSpeech(word.word);
    }
    if (event.key === "r" || event.key === "R") {
      if (recording) stop();
      else record();
    }
    if (event.key === "p" || event.key === "P") {
      play();
    }
  }
</script>

<div class="card w-96 bg-base-100 shadow-sm">
  <div class="card-body">
    <h2 class="flex text-xl font-bold justify-center">{word.word}</h2>
    <div class="flex justify-center gap-8 mt-8">
      <button class="listen btn btn-circle btn-success btn-xl" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      </button>
      {#if recording}
        <div class="relative inline-flex items-center justify-center" style="width: 3.5rem; height: 3.5rem;">
          <div class="radial-progress pointer-events-none" style="--value: {progress}; --size: 3.5rem; --thickness: 0.5rem;" aria-valuenow="{progress}" role="progressbar"></div>
          <button class="absolute btn btn-circle btn-error" aria-label="Stop recording" onclick={stop}>{timerInSeconds}</button>
        </div>
      {:else}
        <button class="record btn btn-circle btn-info btn-xl" aria-label="Record your pronunciation" onclick={record}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
      {/if}
      <button class="play btn btn-circle btn-info btn-xl" aria-label="Play recorded pronunciation" onclick={play} disabled={!isRecorded()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
      </button>
    </div>
    <div class="card-navigation flex join mt-4 justify-center">
      <button aria-label="Previous" class="btn join-item w-20" onclick={previous}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        {#if word.isLearned}
          <button class="btn join-item btn-error w-48" onclick={resetLearning}>Reset learning</button>
        {:else}
          <button class="btn join-item btn-success w-48" onclick={markAsLearned}>Mark as known</button>
        {/if}
      </div>
      <button aria-label="Next" class="btn join-item w-20" onclick={next}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <div class="card-tips flex join mt-4 justify-center hidden lg:flex">
        <kbd class="kbd tooltip" data-tip="Previous word">↑</kbd>
        <kbd class="kbd tooltip" data-tip="Next word">↓</kbd>
        <kbd class="kbd tooltip" data-tip="Previous word">←</kbd>
        <kbd class="kbd tooltip" data-tip="Next word">→</kbd>
        <kbd class="kbd tooltip" data-tip="Listen to pronunciation">Space</kbd>
        <kbd class="kbd tooltip" data-tip="Start recording. Stop recording">R</kbd>
        <kbd class="kbd tooltip" data-tip="Play recorded pronunciation">P</kbd>
        <kbd class="kbd tooltip" data-tip="Mark as known. Reset learning">Enter</kbd>
    </div>
  </div>
</div>