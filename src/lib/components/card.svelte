<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, WordListenIcon, WordRecordIcon, WordPlayIcon } from "$lib";
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
    <h2 class="card-title flex text-xl font-bold justify-center">{word.word}</h2>
    <div class="card-pronunciation flex justify-center gap-8 mt-8">
      <button class="btn btn-circle btn-success btn-xl" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}>
        <WordListenIcon />
      </button>
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
      <button class="btn btn-circle btn-info btn-xl" aria-label="Play recorded pronunciation" onclick={play} disabled={!isRecorded()}>
        <WordPlayIcon />
      </button>
    </div>
    <div class="card-navigation flex join mt-4 justify-center">
      <button class="btn join-item w-20" aria-label="Previous word" onclick={previous}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        {#if word.isLearned}
          <button class="reset-learning btn join-item btn-error w-48" onclick={resetLearning}>Reset learning</button>
        {:else}
          <button class="mark-as-learned btn join-item btn-success w-48" onclick={markAsLearned}>Mark as known</button>
        {/if}
      </div>
      <button class="btn join-item w-20" aria-label="Next word" onclick={next}>
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