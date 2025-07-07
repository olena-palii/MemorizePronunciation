
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

<div class="flex items-center gap-2 mb-4 p-4">
  <input type="text" placeholder="Add new word" class="input" bind:value={newWord} on:keydown={handleKeydown}/>
  <button class="btn" on:click={addWord}>Add</button>
</div>

<WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord} />

<WordsTable words={wordsLearned} saveWord={saveWord} deleteWord={deleteWord} />