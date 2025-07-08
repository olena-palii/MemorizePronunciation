
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable } from "$lib";
  let words: Word[] = [];
  let wordsLearned: Word[] = [];

  async function refreshTables() {
    const wordsLoaded = await apiWords.getWords();
    words = wordsLoaded.filter(word => !word.isLearned);
    wordsLearned = wordsLoaded.filter(word => word.isLearned);
  }

  onMount(async () => {
    await refreshTables();
  });

  let newWord = "";

  async function addWord() {
    if(newWord.trim()) {
      await apiWords.saveWord(new Word({ word: newWord }));
      refreshTables();
    }
    newWord = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") addWord();
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

<div class="flex flex-col items-center min-h-screen gap-4 p-4">
  <div class="join flex justify-center w-full">
    <input type="text" placeholder="Add new word" class="input join-item border-base-content/5" bind:value={newWord} on:keydown={handleKeydown}/>
    <button class="btn join-item" on:click={addWord}>Add</button>
  </div>

  <div class="flex-col justify-center min-h-screen">
    <div class="mb-4">
      <WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord} search={newWord}/>
    </div>
    <div>
      <WordsTable words={wordsLearned} saveWord={saveWord} deleteWord={deleteWord} search={newWord}/>
    </div>
  </div>
</div>