<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { Word, apiDictionary, WordInfoIcon } from "$lib";

    interface Props {
        word: Word;
    }

    let { word = $bindable() }: Props = $props();

    $effect(() => {
        if (word && !word.hasDictionaryInfo) {
            apiDictionary.getDefinition(word.word).then((dictionaries) => {
                word.addDictionaryInfo(dictionaries);
                word = word;
            });
        }
    });
</script>

<button class="btn btn-rounded btn-ghost" aria-label="Open word dictionary info" onclick={() => (document.getElementById('dictionary-info') as HTMLDialogElement)?.showModal()}>
    <WordInfoIcon />
</button>
<dialog id="dictionary-info" class="modal">
    <div class="modal-box text-xl font-bold min-h-64 max-h-8/10 overflow-hidden rounded-box">
        <form method="dialog">
            <button class="btn btn-sm btn-square btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div class="overflow-y-auto max-h-[calc(90vh-4rem)]" style="scrollbar-width: none;">
            {#if !word || !word.hasDictionaryInfo}
                <div class="flex justify-center items-center">
                    <span class="loading loading-spinner loading-xl"></span>
                </div>
            {:else}
                <h3 class="word">{word.word}</h3>
                <p class="transcriptions font-normal pb-4">
                    {word.transcriptions.join(" ")}
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
