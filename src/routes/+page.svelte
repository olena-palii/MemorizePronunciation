
<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, AddWord, WordsTable } from "$lib";
  let words: Word[];
  let wordsLearned: Word[];

  async function refreshTables() {
    const wordsLoaded = await apiWords.getWords();
    words = wordsLoaded.filter(word => !word.isLearned);
    wordsLearned = wordsLoaded.filter(word => word.isLearned);
  }

  onMount(async () => {
    await refreshTables();
  });

  let searchValue = "";

  async function addWord() {
    if(!searchValue) return;
    await apiWords.saveWord(new Word({ word: searchValue }));
    refreshTables();
    searchValue = "";
  }

  async function saveWord(word: Word) {
    await apiWords.saveWord(word);
    refreshTables();
  }

  async function deleteWord(word: Word) {
    await apiWords.deleteWord(word);
    refreshTables();
  }
</script>

<div class="top-container">
  {#if words && wordsLearned}
    <AddWord bind:search={searchValue} onSubmit={addWord} />
    <WordsTable id="words-unknown" h="h-96" bind:words={words} onSaveWord={saveWord} onDeleteWord={deleteWord} search={searchValue}/>
    <WordsTable id="words-learned" h="h-96" bind:words={wordsLearned} onSaveWord={saveWord} onDeleteWord={deleteWord} search={searchValue}/>
  {:else}
    <div class="flex justify-center items-center min-h-screen"> 
      <span class="loading loading-spinner loading-xl"></span>
    </div>
  {/if}
</div>
