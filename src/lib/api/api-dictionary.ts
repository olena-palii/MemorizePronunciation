// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { api } from './api';

export async function getDictionary(wordId: number, source: string): Promise<string> {
    const data = await api<string>({ input: `/api/words/${wordId}/dictionary/${source}`, errorMessage: 'Failed to load dictionaries' });
    return data as string;
}

export async function saveDictionary(wordId: number, source: string, info: string): Promise<void> {
    await api({
        input: `/api/words/${wordId}/dictionary/${source}`,
        init: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: info
        },
        errorMessage: 'Failed to save dictionary'
    });
}