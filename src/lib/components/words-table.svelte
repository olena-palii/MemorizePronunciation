
<script lang="ts">
  import { Word } from "$lib";

  interface Props {
    words: Word[];
    saveWord: (word: Word) => any;
    deleteWord: (word: Word) => any;
    onDoubkeClick?: (word: Word) => void;
  }

  let { words, saveWord, deleteWord, onDoubkeClick }: Props = $props();
</script>

<div class="overflow-x-hidden rounded-box border border-base-content/5 bg-base-100 h-96 w-120">
    <div class="overflow-x-hidden h-full w-full">
    <table class="table-sm table-pin-rows table-fixed w-full">
        <thead class="sticky top-0 z-10 bg-base-100">
        <tr>
            <th class="w-20">Learned</th>
            <th class="w-16">Listen</th>
            <th class="w-auto">Word</th>
            <th class="w-24">Learning</th>
            <th class="w-16">Delete</th>
        </tr>
        </thead>
        <tbody>
        {#each words as word (word.id)}
        <tr class="hover:bg-base-300" ondblclick={() => { if (onDoubkeClick) onDoubkeClick(word); }}>
            <th>
            <label>
                <input type="checkbox" class="checkbox" checked={word.isLearned} onchange={() => { word.isLearned = !word.isLearned; saveWord(word); }} />
            </label>
            </th>
            <td>
                <button class="btn btn-square btn-success" aria-label="Listen to pronunciation" data-tip>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                </button>
            </td>
            <td class="whitespace-nowrap overflow-hidden text-ellipsis">{word.word}</td>
            <td class="whitespace-nowrap overflow-hidden text-ellipsis">{word.learningPeriod}</td>
            <td>
                <button class="btn btn-square" aria-label="Delete word" onclick={() => deleteWord(word)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </td>
        </tr>
        {/each}
        </tbody>
    </table>
    </div>
</div>