// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type{ DictionaryDto } from '$lib';

export async function getDefinition(word: string) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const json = await response.json();
    return json as DictionaryDto[];
}
    