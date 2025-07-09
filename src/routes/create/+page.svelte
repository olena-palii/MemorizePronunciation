<script lang="ts">
  import { Word, apiWords, Loader } from "$lib";
  import type { SaveStatisticsDto } from "$lib";

  let text = "";
  let stat: SaveStatisticsDto;

  let saving: boolean = false;
  async function saveWords() {
    text = text.trim();
    if (!text) return;
    const words: Word[] = text
      .split("\n")
      .map((word: string) => new Word({ word }))
      .filter((word: Word) => word.word !== "");
    text = "";
    if (words.length === 0) return;
    saving = true;
    try {
      stat = await apiWords.saveWords(words);
    } finally {
      saving = false;
    }
  }
</script>

<form class="flex flex-col items-center min-h-screen gap-4 p-4" id="create-words" onsubmit={saveWords}>
  <textarea class="textarea w-full max-w-xl" rows="12" placeholder="Enter words, one per line" bind:value={text}></textarea>
  {#if saving}
    <Loader />
  {:else}
      <button type="submit" class="btn btn-success flex w-full max-w-xl">Create words</button>
      <div class="join flex w-full max-w-xl">
        {#if stat}
          <div class="flex gap-4 p-4"  id="create-stat">
            {#if stat.created.count > 0}<span class="text-green-500">Created: {stat.created.count}</span>{/if}
            {#if stat.updated.count > 0}<span class="text-blue-500">Updated: {stat.updated.count}</span>{/if}
            {#if stat.duplicates.count > 0}<span class="text-yellow-500">Duplicates: {stat.duplicates.count}</span>{/if}
            {#if stat.skipped.count > 0}<span class="text-gray-500">Skipped: {stat.skipped.count}</span>{/if}
          </div>
        {/if}
      </div>
  {/if}
</form>