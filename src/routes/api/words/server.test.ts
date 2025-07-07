import { test, expect, afterAll } from 'vitest';
import * as api from './+server';
import { Word } from '$lib';
import type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from '$lib';

const URL = 'http://localhost';

// #region Functions

async function getWords(): Promise<WordDto[]> {
    const response = await api.GET();
    expect(response.status).toBe(200);
    return await response.json() as WordDto[];
}

function generateRandomWords(count: number): WordDto[] {
    const words: WordDto[] = [];
    for (let i = 0; i < count; i++) {
        const wordText = Word.normalize(Math.random().toString(36).substring(2, 15));
        words.push({ word: wordText });
    }
    return words;
}

async function createWords(words: WordDto[]): Promise<SaveStatisticsDto> {
    const request = new Request(URL, { method: 'POST', body: JSON.stringify(words) });
    const response = await api.POST(request);
    expect(response.status).toBe(200);
    return await response.json() as SaveStatisticsDto;
}

async function deleteWords(words: WordDto[]): Promise<DeleteStatisticsDto> {
    const request = new Request(URL, { method: 'DELETE', body: JSON.stringify(words) });
    const response = await api.DELETE(request);
    expect(response.status).toBe(200);
    return await response.json() as DeleteStatisticsDto;
}

// #endregion

// #region Tests

test('get words', async () => {
    const generatedWords = generateRandomWords(3);
    await createWords(generatedWords);
    const words = await getWords();
    expect(words.length).toBeGreaterThanOrEqual(generatedWords.length);
    for (const word of words) {
        expect(word).toHaveProperty('word');
        expect(word).toHaveProperty('id');
        expect(word).toHaveProperty('created');
        expect(word).toHaveProperty('learned');
    }
});

test('create words', async () => {
    const generatedWords = generateRandomWords(3);
    const stat: SaveStatisticsDto = await createWords(generatedWords);
    expect(stat.created.count).toBe(generatedWords.length);
    expect(stat.created.words.length).toBe(generatedWords.length);
    for (let i = 0; i < generatedWords.length; i++) {
        expect(stat.created.words[i]).toHaveProperty('word');
        expect(stat.created.words[i].word).toBe(generatedWords[i].word);
    }
});

test('delete words', async () => {
    const generatedWords = generateRandomWords(3);
    const stat: SaveStatisticsDto = await createWords(generatedWords);
    expect(stat.created.words.length).toBe(generatedWords.length);
    const deleteStat: DeleteStatisticsDto = await deleteWords(stat.created.words);
    expect(deleteStat.deleted).toBe(generatedWords.length);
    expect(deleteStat.skipped).toBe(0);
});

afterAll(async () => {
    const words = await getWords();
    await deleteWords(words);
});

// #endregion