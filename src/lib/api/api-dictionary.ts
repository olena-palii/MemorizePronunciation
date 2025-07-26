// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { DictionaryDto } from '$lib';
import { addToast } from '$lib';

export async function getDefinition(word: string): Promise<DictionaryDto[]> {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (response.ok) {
        const json = await response.json();
        return json as DictionaryDto[];
    }
    if (response.status === 404) return [];
    addToast({ message: "Failed to fetch definition", type: 'error' });
    return [];
}
