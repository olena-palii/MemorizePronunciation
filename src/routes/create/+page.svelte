<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  import { Word, apiWords } from "$lib";
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

<div class="top-container">
  <form class="flex flex-col w-full max-w-xl gap-4" id="create-words" onsubmit={saveWords}>
    <textarea class="textarea w-full border-base-content/5" rows="12" placeholder="Enter words, one per line" bind:value={text}></textarea>
    {#if saving}
      <div class="flex justify-center w-full">
        <span class="loading loading-spinner loading-xl"></span>
      </div>
    {:else}
      <button type="submit" class="btn btn-success w-full">Create words</button>
      {#if stat}
        <div class="flex w-full gap-4"  id="create-stat">
          {#if stat.created.count > 0}<span class="text-green-500" id="stat-created">{stat.created.count} created</span>{/if}
          {#if stat.updated.count > 0}<span class="text-blue-500" id="stat-updated">{stat.updated.count} updated</span>{/if}
          {#if stat.duplicates.count > 0}<span class="text-yellow-500" id="stat-duplicates">{stat.duplicates.count} duplicate{stat.duplicates.count==1 ? "" :  "s"}</span>{/if}
          {#if stat.skipped.count > 0}<span class="text-gray-500" id="stat-skipped">{stat.skipped.count} skipped</span>{/if}
        </div>
      {/if}
    {/if}
  </form>
</div>