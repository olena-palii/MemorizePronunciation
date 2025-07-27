// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { DictionaryapiDto } from './dto';

export class Dictionary {
    phonetics: string[] = [];
    meanings: Meaning[] = [];
    loaded: boolean = false;

    private addPhonetic(phonetic?: string): void {
        if (phonetic && phonetic.trim() !== '') {
            this.phonetics = Array.from(new Set([...this.phonetics, phonetic]));
        }
    }

    private addMeaning(meaning: Meaning): void {
        if (meaning.partOfSpeech && meaning.definitions.length > 0) {
            this.meanings.push(meaning);
        }
    }

    addFromDictionaryapi(dictionaries: DictionaryapiDto[]): void {
        for (const dictionary of dictionaries) {
            if (dictionary.phonetic) {
                this.addPhonetic(dictionary.phonetic);
            }
            if (dictionary.phonetics && dictionary.phonetics.length > 0) {
                for (const phonetic of dictionary.phonetics) this.addPhonetic(phonetic.text);
            }
            if (dictionary.meanings && dictionary.meanings.length > 0) {
                for (const meaning of dictionary.meanings) {
                    const newMeaning = new Meaning(meaning.partOfSpeech);
                    if (meaning.definitions && meaning.definitions.length > 0) {
                        for (const definition of meaning.definitions) newMeaning.addDefinition(definition.definition, definition.example);
                    }
                    this.addMeaning(newMeaning);
                }
            }
        }
        this.loaded = true;
    }
}

class Meaning {
    partOfSpeech: string;
    definitions: Definition[] = [];

    constructor(partOfSpeech: string = "") {
        this.partOfSpeech = partOfSpeech;
    }

    addDefinition(definition?: string, example?: string): void {
        if (definition) this.definitions.push(new Definition(definition, example));
    }
}

class Definition {
    definition: string;
    example?: string;

    constructor(definition: string = "", example?: string) {
        this.definition = definition;
        this.example = example;
    }
}