<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
 
<script lang="ts">
    import { Word } from "$lib";
    import { textToSpeech, WordDeleteIcon, WordListenIcon } from "$lib";

    interface Props {
        id?: string;
        words: Word[];
        search?: string;
        selected?: Word;
        onSaveWord: (word: Word) => any;
        onDeleteWord: (word: Word) => any;
        onDoubleClick?: (word: Word) => void;
    }

    let { id = "words-all", words = $bindable(), search, selected = $bindable(), onSaveWord, onDeleteWord, onDoubleClick = () => {} }: Props = $props();

    let filteredWords = $derived(words.filter(word => word.word.toLowerCase().includes(search??"".toLowerCase())));

    $effect(() => {
        if (selected && filteredWords.includes(selected)) {
            const row = document.querySelector(`.word-row[data-id="${selected.id}"]`);
            row?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
</script>

<div id={id} class="overflow-x-hidden rounded-box border border-base-content/5 bg-base-100 h-96">
    <div class="overflow-x-hidden h-full w-full">
    <table class="table-sm table-pin-rows table-fixed w-full max-w-xl">
        <thead class="sticky top-0 z-10 bg-base-100">
        <tr>
            <th class="w-16">Known</th>
            <th class="w-16">Listen</th>
            <th class="w-auto">Word</th>
            <th class="w-24 hidden md:table-cell">Learning</th>
            <th class="w-16">Delete</th>
        </tr>
        </thead>
        <tbody>
        {#each filteredWords as word (word.id)}
        <tr data-id="{word.id}" class="word-row hover:bg-base-300 {word.id === selected?.id ? 'bg-base-300' : ''}" ondblclick={() => { onDoubleClick(word); }}>
            <th>
            <label>
                <input type="checkbox" class="word-checkbox checkbox" checked={word.isLearned} onchange={() => { word.isLearned = !word.isLearned; onSaveWord(word); }} />
            </label>
            </th>
            <td>
                <button class="word-pronunciation btn btn-square btn-success" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}>
                    <WordListenIcon />
                </button>
            </td>
            <td class="word-word whitespace-nowrap overflow-hidden text-ellipsis">{word.word}</td>
            <td class="word-period hidden md:table-cell whitespace-nowrap overflow-hidden text-ellipsis">{word.learningPeriod}</td>
            <td>
                <button class="word-delete btn btn-square" aria-label="Delete word" onclick={() => onDeleteWord(word)}>
                    <WordDeleteIcon />
                </button>
            </td>
        </tr>
        {/each}
        </tbody>
    </table>
    </div>
</div>