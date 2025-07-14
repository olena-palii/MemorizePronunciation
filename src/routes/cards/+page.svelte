<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable, Card } from "$lib";
  import type { SaveStatisticsDto, DeleteStatisticsDto } from "$lib";
  let words: Word[] = [];
  let selectedWord: Word;

  function selectWord(word: Word) {
    selectedWord = word;
  }

  function selectFirstWord() {
    selectedWord = words[0] || new Word({ word: "word" });
  }
  
  onMount(async () => {
    words = await apiWords.getWords();
    selectFirstWord();
  });

  async function updateWord(word: Word) {
    const stat: SaveStatisticsDto = await apiWords.saveWord(word);
    if (stat.updated.count === 0) return;
    const index = words.findIndex((w) => w.id === word.id);
    if (index !== -1) words[index] = word;
    if (selectedWord && selectedWord.id === word.id) {
      selectedWord = word;
    }
  }

  async function deleteWord(word: Word) {
    const stat: DeleteStatisticsDto = await apiWords.deleteWord(word);
    if (stat.deleted === 0) return;
    words = words.filter((w) => w.id !== word.id);
    if (selectedWord && selectedWord.id === word.id) {
      selectFirstWord();
    }
  }

  function nextWord() {
    const currentIndex = words.indexOf(selectedWord);
    if (currentIndex < words.length - 1) {
      selectedWord = words[currentIndex + 1];
    }
  }

  function previousWord() {
    const currentIndex = words.indexOf(selectedWord);
    if (currentIndex > 0) {
      selectedWord = words[currentIndex - 1];
    }
  }
</script>

{#if words && selectedWord}
  <div class="flex flex-col items-center min-h-screen gap-4 p-4">
    <div class="flex-col min-h-screen gap-4 p-4">
        <div class="flex justify-center mb-4 fixed top-24 left-0 w-full z-52" id="word-card">
          <Card bind:word={selectedWord} next={nextWord} previous={previousWord} updateWord={updateWord}/>
        </div>
        <div class="pt-50 fixed top-52 left-0 w-full z-50" id="words-all">
          <div class="flex justify-center items-center">
            <WordsTable bind:words={words} saveWord={updateWord} deleteWord={deleteWord} onDoubkeClick={selectWord} bind:selected={selectedWord}/>
          </div>
        </div>
    </div>
  </div>
  {:else}
    <div class="flex justify-center items-center min-h-screen"> 
      <span class="loading loading-spinner loading-xl"></span>
    </div>
  {/if}