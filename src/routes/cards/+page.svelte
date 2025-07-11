
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable, Card } from "$lib";
  let words: Word[] = [];
  let selectedWord: Word;

  async function refreshTable() {
    words = await apiWords.getWords();
  }

  onMount(async () => {
    await refreshTable();
    selectedWord = words[0] || new Word({ word: "N/A" });
  });

  async function saveWord(word: Word) {
    await apiWords.saveWord(word);
    refreshTable();
  }

  async function deleteWord(word: Word) {
    await apiWords.deleteWord(word);
    refreshTable();
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
        <div class="flex justify-center mb-4">
          <Card bind:word={selectedWord} next={nextWord} previous={previousWord}/>
        </div>
        <div>
          <WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord}/>
        </div>
    </div>
  </div>
  {:else}
    <div class="flex justify-center items-center min-h-screen"> 
      <span class="loading loading-spinner loading-xl"></span>
    </div>
  {/if}