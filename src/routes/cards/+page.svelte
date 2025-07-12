
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable, Card } from "$lib";
  import type { DeleteStatisticsDto } from "$lib";
  let words: Word[] = [];
  let selectedWord: Word;

  function selectWord(word: Word) {
    selectedWord = word;
  }

  async function refreshTable() {
    words = await apiWords.getWords();
  }

  function selectFirstWord() {
    selectedWord = words[0] || new Word({ word: "N/A" });
  }
  
  onMount(async () => {
    await refreshTable();
    selectFirstWord();
  });

  async function saveWord(word: Word) {
    await apiWords.saveWord(word);
    refreshTable();
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
        <div class="flex justify-center mb-4 fixed top-24 left-0 w-full z-40">
          <Card bind:word={selectedWord} next={nextWord} previous={previousWord}/>
        </div>
        <div class="pt-40 fixed top-50 left-0 w-full z-40">
          <div class="flex justify-center items-center">
            <WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord} onDoubkeClick={selectWord} bind:selected={selectedWord}/>
          </div>
        </div>
    </div>
  </div>
  {:else}
    <div class="flex justify-center items-center min-h-screen"> 
      <span class="loading loading-spinner loading-xl"></span>
    </div>
  {/if}