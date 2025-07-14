<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, RecordingButton, WordListenIcon, WordPlayIcon } from "$lib";
  import { textToSpeech, playRecordedAudio } from "$lib";

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

  let recordedWord = $state<Word | null>(null);

  function stopRecording() {
    recordedWord = word;
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
    if (event.key === "Enter") {
      if (word.isLearned) resetLearning();
      else markAsLearned();
    }
    if (event.key === " ") {
      event.preventDefault();
      textToSpeech(word.word);
    }
    if (event.key === "p" || event.key === "P") {
      playRecordedAudio();
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
      <RecordingButton onStop={stopRecording} />
      <button class="btn btn-circle btn-info btn-xl" aria-label="Play recorded pronunciation" onclick={playRecordedAudio} disabled={!isRecorded()}>
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