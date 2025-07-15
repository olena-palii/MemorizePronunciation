<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, RecordingButton, WordListenIcon, WordPlayIcon } from "$lib";
  import { textToSpeech, playRecordedAudio } from "$lib";

  interface Props {
    word: Word;
    onNextWord: () => any;
    onPreviousWord: () => any;
    onSaveWord: (word: Word) => any;
  }

  let { word = $bindable(), onNextWord, onPreviousWord, onSaveWord }: Props = $props();

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
    onSaveWord(word);
    onNextWord();
  }

  async function resetLearning() {
    word.resetLearning();
    onSaveWord(word);
    onNextWord();
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

<div class="card flex justify-center w-full max-w-sm bg-base-100 shadow-sm gap-4 p-4" id="word-card">
  <h2 class="card-title text-xl font-bold flex justify-center">{word.word}</h2>
  <div class="card-pronunciation flex justify-center gap-8 p-8">
    <button class="btn btn-circle btn-success btn-xl" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}>
      <WordListenIcon />
    </button>
    <RecordingButton onStop={stopRecording} />
    <button class="btn btn-circle btn-info btn-xl" aria-label="Play recorded pronunciation" onclick={playRecordedAudio} disabled={!isRecorded()}>
      <WordPlayIcon />
    </button>
  </div>
  <div class="card-navigation join flex justify-center">
    <button class="btn join-item w-full max-w-1/4" aria-label="Previous word" onclick={onPreviousWord}>
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    {#if word.isLearned}
      <button class="reset-learning btn btn-error join-item w-full max-w-1/2" onclick={resetLearning}>Reset learning</button>
    {:else}
      <button class="mark-as-learned btn btn-success join-item w-full max-w-1/2" onclick={markAsLearned}>Mark as known</button>
    {/if}
    <button class="btn join-item w-full max-w-1/4" aria-label="Next word" onclick={onNextWord}>
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  <div class="card-tips hidden lg:flex join flex justify-center gap-1">
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