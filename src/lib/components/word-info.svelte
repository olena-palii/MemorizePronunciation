<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { onMount } from "svelte";
    import { Word, apiDictionary, WordInfoIcon, WordListenMiniIcon, textToSpeech } from "$lib";

    interface Props {
        word: Word;
    }

    let { word = $bindable() }: Props = $props();

    onMount(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
        };
    });

    $effect(() => {
        if (word && !word.hasDictionaryInfo) {
            apiDictionary.getDefinition(word.word).then((dictionaries) => {
                word.addDictionaryInfo(dictionaries);
                word = word;
            });
        }
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "i" || event.key === "I") {
            (
                document.getElementById("dictionary-info") as HTMLDialogElement
            )?.showModal();
        }
    }
</script>

<button class="btn btn-circle btn-ghost" aria-label="Open word dictionary info" onclick={() => (document.getElementById('dictionary-info') as HTMLDialogElement)?.showModal()}>
    <WordInfoIcon />
</button>
<dialog id="dictionary-info" class="modal">
    <div class="modal-box text-xl font-bold min-h-64 max-h-8/10 overflow-hidden rounded-box">
        <form method="dialog">
            <button class="btn btn-sm btn-square btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div class="overflow-y-auto max-h-[calc(90vh-4rem)]" style="scrollbar-width: none;">
            {#if !word || !word.hasDictionaryInfo}
                <div class="flex justify-center items-center min-h-64">
                    <span class="loading loading-spinner loading-xl"></span>
                </div>
            {:else}
                <h3 class="word">{word.word} <button class="btn btn-circle btn-ghost" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}><WordListenMiniIcon /></button></h3>
                <p class="phonetics font-normal pb-4">
                    {word.phonetics.join(" ")}
                </p>
                {#if word.hasDictionaryInfo}
                    {#each word.meanings as meaning}
                        <div class="meaning pb-4">
                            <p class="part-of-speech">{meaning.partOfSpeech}</p>
                            <ul class="list bg-base-100 rounded-box shadow-md">
                                {#each meaning.definitions as definition}
                                    <li class="definition list-row font-normal p-1">
                                        <span>
                                            {definition.definition}
                                            {#if definition.example}
                                                <span class="example font-normal italic"> ({definition.example})</span>
                                            {/if}
                                        </span>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/each}
                {/if}
            {/if}
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>Close</button>
    </form>
</dialog>
