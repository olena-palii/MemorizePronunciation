<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable, Card } from "$lib";
  import type { SaveStatisticsDto, DeleteStatisticsDto } from "$lib";
  let words: Word[] = [];
  
  onMount(async () => {
    words = await apiWords.getWords();
    selectFirstWord();
  });

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  let selectedWord: Word;

  function selectWord(word: Word) {
    selectedWord = word;
  }

  function selectFirstWord() {
    selectedWord = words[0] || new Word({ word: "word" });
  }

  async function saveWord(word: Word) {
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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextWord();
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      previousWord();
    }
  }
</script>

<div class="fixed top-16 w-full flex flex-col items-center min-h-screen gap-4 p-4">
  {#if words && selectedWord}
    <Card bind:word={selectedWord} onNextWord={nextWord} onPreviousWord={previousWord} onSaveWord={saveWord}/>
    <WordsTable bind:words={words} onSaveWord={saveWord} onDeleteWord={deleteWord} onDoubleClick={selectWord} bind:selected={selectedWord}/>
    {:else}
      <div class="flex justify-center items-center"> 
        <span class="loading loading-spinner loading-xl"></span>
      </div>
    {/if}
</div>