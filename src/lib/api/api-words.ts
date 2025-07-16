// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { Word } from "$lib";
import type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from '$lib';
import { api } from './api';

export async function getWords(): Promise<Word[]> {
    const data = await api<WordDto[]>({ input: '/api/words', errorMessage: 'Failed to load words' });
    return data ? data.map(dto => new Word(dto)) : [];
}

export async function saveWord(word: Word): Promise<SaveStatisticsDto> {
    return saveWords([word]) as Promise<SaveStatisticsDto>;
}

const emptySaveStatistics: SaveStatisticsDto = {
    created: { count: 0, words: [] },
    updated: { count: 0, words: [] },
    duplicates: { count: 0, words: [] },
    skipped: { count: 0 }
};

export async function saveWords(words: Word[]): Promise<SaveStatisticsDto> {
    const data = await api<SaveStatisticsDto>({
        input: '/api/words',
        init: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(words.map(word => word.toDto()))
        },
        errorMessage: 'Failed to save words'
    });
    return data ?? emptySaveStatistics;
}

export async function deleteWord(word: Word): Promise<DeleteStatisticsDto> {
    return deleteWords([word]) as Promise<DeleteStatisticsDto>;
}

const emptyDeleteStatistics: DeleteStatisticsDto = {
    deleted: 0,
    skipped: 0
};

export async function deleteWords(words: Word[]): Promise<DeleteStatisticsDto> {
    const data = await api<DeleteStatisticsDto>({
        input: '/api/words',
        init: {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(words.map(word => word.toDto()))
        },
        errorMessage: 'Failed to delete words'
    });
    return data ?? emptyDeleteStatistics;
}