<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
  interface Props {
    search: string;
    onSubmit: () => any;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") onSubmit();
  }

  let { search = $bindable(), onSubmit }: Props = $props();
</script>

<div class="join flex justify-center w-full" id="add-word">
    <input type="text" placeholder="Add new word" class="input join-item border-base-content/5" bind:value={search} onkeydown={handleKeydown}/>
    <button class="btn join-item" onclick={onSubmit}>Add</button>
</div>