import { Word } from "$lib";
import type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from '$lib';

export async function getWords(): Promise<Word[]> {
    const response = await fetch('/api/words');
    const data = await response.json() as WordDto[];
    if (!response.ok) throw new Error('Failed to get words');
    return data.map((wordDto: WordDto) => new Word(wordDto));
}

export async function saveWord(word: Word): Promise<SaveStatisticsDto> {
    return await saveWords([word]) as SaveStatisticsDto;
}

export async function saveWords(words: Word[]): Promise<SaveStatisticsDto> {
    const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(words.map(word => word.toDto()))
    });
    if (!response.ok) throw new Error('Failed to create words');
    return await response.json() as SaveStatisticsDto;
}

export async function deleteWord(word: Word): Promise<DeleteStatisticsDto> {
    return await deleteWords([word]) as DeleteStatisticsDto;
}

export async function deleteWords(words: Word[]): Promise<DeleteStatisticsDto> {
    const response = await fetch('/api/words', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(words.map(word => word.toDto()))
    });
    if (!response.ok) throw new Error('Failed to delete words');
    return await response.json() as DeleteStatisticsDto;
}