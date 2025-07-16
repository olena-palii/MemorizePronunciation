// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WordDto } from '$lib';
import * as dbWords from './db-words';

beforeEach(() => {
    vi.useFakeTimers();
    const wordUnknownOlder: WordDto = { word: 'unknown-older', created: '2000-01-01T00:00:00Z' };
    const wordKnownNewer: WordDto = { word: 'known-newer', created: '2020-12-31T23:59:59Z', learned: '2021-01-31T23:59:59Z' };
    dbWords.saveWords([wordUnknownOlder]);
    dbWords.saveWords([wordKnownNewer]);
});

afterEach(() => {
    vi.useRealTimers();
    dbWords.__testOnly_clearTable();
});

// #region Get Words

test('get word by text', () => {
    const firstWord = dbWords.getWords()[0];
    const word = dbWords.getWordByText(firstWord.word.toUpperCase());
    expect(word).toBeDefined();
    expect(word!.id).toBe(firstWord.id);
    expect(word!.word).toBe(firstWord.word);
});

test('get word by id', () => {
    const firstWord = dbWords.getWords()[0];
    const word = dbWords.getWordById(firstWord.id!);
    expect(word!.id).toBe(firstWord.id);
    expect(word!.word).toBe(firstWord.word);
});

test('word not found', () => {
    expect(dbWords.getWordByText("not-found")).toBeUndefined();
    expect(dbWords.getWordById(-1)).toBeUndefined();
});

// #endregion

// #region Create Words

test('create word', () => {
    vi.setSystemTime(new Date('2024-02-29T12:15:59Z'));
    dbWords.saveWords([{ word: 'new-word' }]);
    const firstWord = dbWords.getWords()[0];
    expect(firstWord.word).toBe('new-word');
    expect(firstWord.id).toBeDefined();
    expect(firstWord.created).toBe('2024-02-29T12:15:59.000Z');
    expect(firstWord.learned).toBeNull();
});

test('create word with custom dates', () => {
    dbWords.saveWords([{ word: 'custom-dates', created: '2024-01-01T10:00:00Z', learned: '2024-01-02T10:00:00Z' }]);
    const word = dbWords.getWordByText('custom-dates');
    expect(word).toBeDefined();
    expect(word!.created).toBe('2024-01-01T10:00:00.000Z');
    expect(word!.learned).toBe('2024-01-02T10:00:00.000Z');
});

test('create word with non-existed id', () => {
    dbWords.saveWords([{ id: 0, word: 'new-word' }]);
    const firstWord = dbWords.getWords()[0];
    expect(firstWord.word).toBe('new-word');
    expect(firstWord.id).toBeDefined();
    expect(firstWord.id).not.toBe(0);
});

// #endregion

// #region Duplicates

test('created duplicates must be ignored', () => {
    const wordsBefore = dbWords.getWords();
    dbWords.saveWords([{ word: 'known-newer' }, { word: 'unknown-older' }]);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length);
    for (let i = 0; i < wordsBefore.length; i++) {
        expect(wordsAfter[i].id).toBe(wordsBefore[i].id);
        expect(wordsAfter[i].word).toBe(wordsBefore[i].word);
        expect(wordsAfter[i].created).toBe(wordsBefore[i].created);
        expect(wordsAfter[i].learned).toBe(wordsBefore[i].learned);
    }
});

test('update duplicate with new learned date', () => {
    dbWords.saveWords([{ word: 'known-newer', created: '2020-12-31T23:59:59Z', learned: '2124-03-19T14:10:00Z' }]);
    const word = dbWords.getWordByText('known-newer');
    expect(word).toBeDefined();
    expect(word!.created).toBe('2020-12-31T23:59:59.000Z');
    expect(word!.learned).toBe('2124-03-19T14:10:00.000Z');
});

test('do not reset dates on duplicate', () => {
    dbWords.saveWords([{ word: 'known-newer' }]);
    const word = dbWords.getWordByText('known-newer');
    expect(word).toBeDefined();
    expect(word!.word).toBe('known-newer');
    expect(word!.created).toBe('2020-12-31T23:59:59.000Z');
    expect(word!.learned).toBe('2021-01-31T23:59:59.000Z');
});

// #endregion

// #region Update Words

test('update word', () => {
    const word = dbWords.getWordByText('known-newer');
    expect(word).toBeDefined();
    word!.word = 'updated-word';
    dbWords.saveWords([word!]);
    const updatedWord = dbWords.getWordById(word!.id!);
    expect(updatedWord).toBeDefined();
    expect(updatedWord!.word).toBe('updated-word');
    expect(updatedWord!.created).toBe('2020-12-31T23:59:59.000Z');
    expect(updatedWord!.learned).toBe('2021-01-31T23:59:59.000Z');
});

test('update learned date to null', () => {
    const word = dbWords.getWordByText('known-newer');
    expect(word).toBeDefined();
    word!.learned = undefined;
    dbWords.saveWords([word!]);
    const updatedWord = dbWords.getWordById(word!.id!);
    expect(updatedWord).toBeDefined();
    expect(updatedWord!.word).toBe('known-newer');
    expect(updatedWord!.created).toBe('2020-12-31T23:59:59.000Z');
    expect(updatedWord!.learned).toBeNull();
});

// #endregion

// #region Save Statistics

test('save many words', () => {
    const words: WordDto[] = dbWords.getWords();
    words[0].word = 'updated-word';
    words.push({ word: 'new-word' });
    words.push({ id: 0, word: 'non-existed-id' });
    words.push({ word: 'duplicate' });
    words.push({ word: 'duplicate' });
    words.push({ word: 'duplicate-new-learned' });
    words.push({ word: 'duplicate-new-learned', learned: '2024-01-01T00:00:00Z' });
    words.push({ word: ' !!! ' });
    const stats = dbWords.saveWords(words);
    console.log(JSON.stringify(stats));

    expect(stats.created.count).toBe(4);
    expect(stats.created.words.length).toBe(4);
    expect(stats.created.words[0].word).toBe('new-word');
    expect(stats.created.words[1].word).toBe('non-existed-id');
    expect(stats.created.words[2].word).toBe('duplicate');
    expect(stats.created.words[3].word).toBe('duplicate-new-learned');
    expect(stats.created.words[3].learned).toBeNull();

    expect(stats.updated.count).toBe(3);
    expect(stats.updated.words.length).toBe(3);
    expect(stats.updated.words[0].word).toBe('updated-word');
    expect(stats.updated.words[1].word).toBe('known-newer');
    expect(stats.updated.words[2].word).toBe('duplicate-new-learned');
    expect(stats.updated.words[2].learned).toBe('2024-01-01T00:00:00.000Z');

    expect(stats.duplicates.count).toBe(1);
    expect(stats.duplicates.words.length).toBe(1);
    expect(stats.duplicates.words[0].word).toBe('duplicate');
});

// #endregion

// #region Delete Words

test('delete word', () => {
    const wordsBefore = dbWords.getWords();
    const word = dbWords.getWordByText('known-newer');
    expect(word).toBeDefined();
    dbWords.deleteWords([word!]);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length - 1);
    expect(dbWords.getWordById(word!.id!)).toBeUndefined();
});

test('skip deleting word without id', () => {
    const wordsBefore = dbWords.getWords();
    const word: WordDto = { word: wordsBefore[0].word };
    dbWords.deleteWords([word]);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length);
});

test('delete statistics', () => {
    const wordsBefore = dbWords.getWords();
    const noIdWord: WordDto = { word: 'no-id-word' };
    const stats = dbWords.deleteWords([wordsBefore[0], noIdWord]);
    expect(stats.deleted).toBe(1);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length - 1);
    expect(dbWords.getWordById(wordsBefore[0].id!)).toBeUndefined();
});

// #endregion