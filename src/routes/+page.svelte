
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, AddWord, WordsTable, Loader } from "$lib";
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
    if(searchValue.trim()) {
      await apiWords.saveWord(new Word({ word: searchValue }));
      refreshTables();
    }
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

{#if words && wordsLearned}
  <div class="flex flex-col items-center min-h-screen gap-4 p-4">
    <AddWord bind:search={searchValue} addWord={addWord} />
    <div class="flex-col justify-center min-h-screen">
      <div class="mb-4" id="words-unknown">
        <WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord} search={searchValue}/>
      </div>
      <div id="words-learned">
        <WordsTable words={wordsLearned} saveWord={saveWord} deleteWord={deleteWord} search={searchValue}/>
      </div>
    </div>
  </div>
  {:else}
    <Loader />
  {/if}

