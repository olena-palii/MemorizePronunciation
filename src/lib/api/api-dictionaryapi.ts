// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { DictionaryapiDto } from '$lib';
import { addToast } from '$lib';

export async function getWord(word: string): Promise<DictionaryapiDto[] | undefined> {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (response.ok) {
        const json = await response.json();
        return json as DictionaryapiDto[];
    }
    if (response.status === 404) return undefined;
    addToast({ message: "Failed to fetch definition", type: 'error' });
    return undefined;
}
