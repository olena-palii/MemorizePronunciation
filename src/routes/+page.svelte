<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, AddWord, WordsTable, addToast } from "$lib";
  import type { WordDto } from "$lib";
  let wordsUnknown: Word[];
  let wordsLearned: Word[];

  onMount(async () => {
    const wordsLoaded = await apiWords.getWords();
    wordsUnknown = wordsLoaded.filter((word) => !word.isLearned);
    wordsLearned = wordsLoaded.filter((word) => word.isLearned);
  });

  function updateTables(wordDto: WordDto) {
    const word = new Word(wordDto);
    if (word.isLearned) {
      wordsLearned = [word, ...wordsLearned];
      wordsUnknown = wordsUnknown.filter((w) => w.id !== word.id);
    } else {
      wordsUnknown = [word, ...wordsUnknown];
      wordsLearned = wordsLearned.filter((w) => w.id !== word.id);
    }
  }

  let searchValue = "";

  async function addWord() {
    if (!searchValue) return;
    const stat = await apiWords.saveWord(new Word({ word: searchValue }));
    if (stat.created.count > 0) {
      addToast({ message: "Successfully created word", duration: 1000 });
      stat.created.words.forEach(updateTables);
      searchValue = "";
    } else if (stat.duplicates.count > 0) {
      addToast({ message: "Word already exists", duration: 3000, type: "warning" });
      searchValue = "";
    }
  }

  async function saveWord(word: Word) {
    const stat = await apiWords.saveWord(word);
    if (stat.updated.count > 0) stat.updated.words.forEach(updateTables);
  }

  async function deleteWord(word: Word) {
    const stat = await apiWords.deleteWord(word);
    if (stat.deleted > 0) {
      addToast({ message: "Successfully deleted word", duration: 1000 });
      wordsUnknown = wordsUnknown.filter((w) => w.id !== word.id);
      wordsLearned = wordsLearned.filter((w) => w.id !== word.id);
    }
  }
</script>

<div class="top-container">
  {#if wordsUnknown && wordsLearned}
    <AddWord bind:search={searchValue} onSubmit={addWord} />
    <WordsTable id="words-unknown" h="h-96" bind:words={wordsUnknown} onSaveWord={saveWord} onDeleteWord={deleteWord} search={searchValue}/>
    <WordsTable id="words-learned" h="h-96" bind:words={wordsLearned} onSaveWord={saveWord} onDeleteWord={deleteWord} search={searchValue}/>
  {:else}
    <div class="flex justify-center items-center min-h-screen"> 
      <span class="loading loading-spinner loading-xl"></span>
    </div>
  {/if}
</div>
