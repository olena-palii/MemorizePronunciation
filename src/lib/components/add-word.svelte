
<script lang="ts">
  interface Props {
    search: string;
    addWord: () => any;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") addWord();
  }

  let { search = $bindable(), addWord }: Props = $props();
</script>

<div class="join flex justify-center w-full" id="add-word">
    <input type="text" placeholder="Add new word" class="input join-item border-base-content/5" bind:value={search} onkeydown={handleKeydown}/>
    <button class="btn join-item" onclick={addWord}>Add</button>
</div>