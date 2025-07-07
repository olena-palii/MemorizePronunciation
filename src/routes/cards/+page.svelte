
<script lang="ts">
  import { onMount } from "svelte";
  import { Word, apiWords, WordsTable, Card } from "$lib";
  let words: Word[] = [];

  async function refreshTable() {
    words = await apiWords.getWords();
  }

  onMount(async () => {
    await refreshTable();
  });

  async function saveWord(word: Word) {
    await apiWords.saveWord(word);
    refreshTable();
  }

  async function deleteWord(word: Word) {
    await apiWords.deleteWord(word);
    refreshTable();
  }
</script>


<div class="flex justify-center min-h-screen gap-4 p-4">
  <div>
    <Card />
  </div>
  <div>
    <WordsTable words={words} saveWord={saveWord} deleteWord={deleteWord} />
  </div>
</div>