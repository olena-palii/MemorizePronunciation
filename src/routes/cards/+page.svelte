<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from '$app/navigation';
  import { Word, apiWords, WordsTable, Card, addToast } from "$lib";
  import type { SaveStatisticsDto, DeleteStatisticsDto } from "$lib";
  let words: Word[] = [];
  const DEFAULT_WORD: Word = new Word({ word: "word" });
  let selectedWord: Word;
  
  onMount(async () => {
    words = await apiWords.getWords();
    selectWordFromUrl();
  });
  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  function selectWordFromUrl() {
    let url = new URL(window.location.href);
    const idParam = url.searchParams.get("id");
    const id = Number(idParam);
    const findWord = words.find((w) => w.id === id);
    selectWord(findWord || words[0] || DEFAULT_WORD);
  }

  function selectWord(word: Word) {
    selectedWord = word;
    updateUrlIdParam(word);
  }

  function updateUrlIdParam(word: Word) {
    const url = new URL(window.location.href);
    const idParam = word.id?.toString();
    if(idParam) url.searchParams.set("id", idParam);
    else url.searchParams.delete("id");
    goto(url.toString(), { replaceState: true });
  }

  async function saveWord(word: Word) {
    const stat: SaveStatisticsDto = await apiWords.saveWord(word);
    if (stat.updated.count === 0) return;
    const index = words.findIndex((w) => w.id === word.id);
    if (index !== -1) words[index] = word;
    if (selectedWord && selectedWord.id === word.id) {
      selectWord(word);
    }
  }

  async function deleteWord(word: Word) {
    const deletedWordIndex = words.indexOf(word);
    const stat: DeleteStatisticsDto = await apiWords.deleteWord(word);
    if (stat.deleted > 0) {
      addToast({ message: "Successfully deleted word", duration: 1000 });
      words = words.filter((w) => w.id !== word.id);
      if (selectedWord && selectedWord.id === word.id) nearestWord(deletedWordIndex);
    }
  }

  function nextWord() {
    const currentIndex = words.indexOf(selectedWord);
    if (currentIndex < words.length - 1) selectWord(words[currentIndex + 1]);
  }

  function previousWord() {
    const currentIndex = words.indexOf(selectedWord);
    if (currentIndex > 0) selectWord(words[currentIndex - 1]);
  }

  function nearestWord(currentIndex: number) {
    if (currentIndex < words.length) selectWord(words[currentIndex]);
    else if (currentIndex > 0) selectWord(words[currentIndex - 1]);
    else selectWord(DEFAULT_WORD);
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

<div class="top-container fixed top-16">
  {#if words && selectedWord}
    <Card bind:word={selectedWord} onNextWord={nextWord} onPreviousWord={previousWord} onSaveWord={saveWord}/>
    <WordsTable bind:words={words} onSaveWord={saveWord} onDeleteWord={deleteWord} onRowClick={selectWord} bind:selected={selectedWord}/>
    {:else}
      <div class="flex justify-center items-center min-h-screen"> 
        <span class="loading loading-spinner loading-xl"></span>
      </div>
    {/if}
</div>