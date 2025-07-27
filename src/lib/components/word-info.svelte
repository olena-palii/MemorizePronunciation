<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { onMount } from "svelte";
    import { Word, apiDictionaryapi, WordInfoIcon, XCloseIcon, WordListenMiniIcon, textToSpeech } from "$lib";

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

    function isLoaded(): boolean {
        if (word?.dictionary.loaded) return true;
        if(word?.dictionary.phonetics.length || word?.dictionary.meanings.length) return true;
        return false;
    }

    async function loadWordInfo(): Promise<void> {
        if (!isLoaded()) {
            const info =  await apiDictionaryapi.getWord(word.word);
            word.dictionary.addFromDictionaryapi(info);
            word = word;
        }
    }

    async function showModal(): Promise<void> {
        const dialog = document.getElementById("dictionary-info") as HTMLDialogElement;
        dialog.showModal();
    }

    $effect(() => {
        if (!isLoaded()) loadWordInfo();
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "i" || event.key === "I") {
            showModal();
        }
    }
</script>

<button class="btn btn-circle btn-ghost" aria-label="Open word dictionary info" onclick={showModal}>
    <WordInfoIcon />
</button>
<dialog id="dictionary-info" class="modal">
    <div class="modal-box text-xl font-bold min-h-64 max-h-8/10 overflow-hidden rounded-box">
        <form method="dialog">
            <button class="btn btn-sm btn-square btn-ghost absolute right-2 top-2" aria-label="Close word dictionary info"><XCloseIcon /></button>
        </form>
        <div class="overflow-y-auto max-h-[calc(90vh-4rem)]" style="scrollbar-width: none;">
            {#if !isLoaded()}
                <div class="flex justify-center items-center min-h-64">
                    <span class="loading loading-spinner loading-xl"></span>
                </div>
            {:else}
                <h3 class="word">{word.word} <button class="btn btn-circle btn-ghost" aria-label="Listen to pronunciation" onclick={() => textToSpeech(word.word)}><WordListenMiniIcon /></button></h3>
                {#if word.dictionary.phonetics.length === 0}
                    <p class="meaning font-normal pb-4">[no phonetic found]</p>
                {:else}
                    <p class="phonetics font-normal pb-4">
                        {word.dictionary.phonetics.join(" ")}
                    </p>
                {/if}
                {#if word.dictionary.meanings.length === 0}
                    <p class="meaning font-normal pb-4">[no definition found]</p>
                {:else}
                    {#each word.dictionary.meanings as meaning}
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
