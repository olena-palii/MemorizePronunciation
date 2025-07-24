<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { Word, apiDictionary, WordInfoIcon } from "$lib";
    import type { MeaningDto } from "$lib";

    interface Props {
        word: Word;
    }

    let { word = $bindable() }: Props = $props();

    $effect(() => {
        if (word && !word.hasDictionaryInfo) {
            apiDictionary.getDefinition(word.word).then((dictionaries) => {
                word.addDictionaryInfo(dictionaries);
            });
        }
    });
</script>

<button class="btn btn-rounded btn-ghost tooltip tooltip-bottom" aria-label="Open word dictionary info" disabled={!word.hasDictionaryInfo} onclick={() => (document.getElementById('my_modal_2') as HTMLDialogElement)?.showModal()}>
    <WordInfoIcon />
</button>
<dialog id="my_modal_2" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">{word.word}</h3>
        <p class="py-4">{word.transcriptions.join(", ")}</p>
        {#if word.hasDictionaryInfo}
            {#each word.meanings as meaning}
                <div class="meaning">
                    <p class="part-of-speech font-bold">{meaning.partOfSpeech}</p>
                    {#each meaning.definitions as definition}
                        {#if definition && definition.example}
                            <p class="definition py-4 font-normal">{definition.definition}</p>
                            <p class="example py-4 font-normal">{definition.example}</p>
                        {/if}
                    {/each}
                </div>
            {/each}
        {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
