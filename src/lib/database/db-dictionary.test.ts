// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { test, expect, beforeEach, afterEach } from 'vitest';
import * as dbDictionary from './db-dictionary';
import * as dbWords from './db-words';

beforeEach(() => {
    dbWords.saveWords([{ word: 'word-one' }]);
    let wordId: number = dbWords.getWordByText('word-one')!.id!;
    dbDictionary.saveDictionary(wordId, 'source-1', 'dictionary-1');
    dbDictionary.saveDictionary(wordId, 'source-2', 'dictionary-2');
    dbWords.saveWords([{ word: 'word-two' }]);
    wordId = dbWords.getWordByText('word-two')!.id!;
    dbDictionary.saveDictionary(wordId, 'source-3', 'dictionary-3');
    dbWords.saveWords([{ word: 'word-three' }]);
});

afterEach(() => {
    dbWords.__testOnly_clearTable();
});

test('get all dictionaries of word', () => {
    const wordId: number = dbWords.getWordByText('word-one')!.id!;
    const dictionaries = dbDictionary.getDictionaries(wordId);
    expect(dictionaries).toBeDefined();
    expect(dictionaries.length).toBe(2);
    expect(dictionaries[0].source).toBe('source-1');
    expect(dictionaries[0].info).toBe('dictionary-1');
    expect(dictionaries[1].source).toBe('source-2');
    expect(dictionaries[1].info).toBe('dictionary-2');
});

test('get one dictionary of word', () => {
    const wordId: number = dbWords.getWordByText('word-one')!.id!;
    const dictionary = dbDictionary.getDictionary(wordId, 'source-1');
    expect(dictionary).toBe('dictionary-1');
});

test('get empty dictionaries for non-existing word', () => {
    const dictionaries = dbDictionary.getDictionaries(0);
    expect(dictionaries).toBeDefined();
    expect(dictionaries.length).toBe(0);
});

test('get empty dictionaries for word without dictionaries', () => {
    const wordId: number = dbWords.getWordByText('word-three')!.id!;
    const dictionaries = dbDictionary.getDictionaries(wordId);
    expect(dictionaries).toBeDefined();
    expect(dictionaries.length).toBe(0);
});

test('get empty dictionaries for word with non-existing source', () => {
    const wordId: number = dbWords.getWordByText('word-two')!.id!;
    const dictionary = dbDictionary.getDictionary(wordId, 'source-1');
    expect(dictionary).toBe("");
});

test('save dictionary for word without dictionaries', () => {
    const wordId: number = dbWords.getWordByText('word-three')!.id!;
    dbDictionary.saveDictionary(wordId, 'source-4', 'dictionary-4');
    const dictionaries = dbDictionary.getDictionaries(wordId);
    expect(dictionaries.length).toBe(1);
    expect(dictionaries[0].source).toBe('source-4');
    expect(dictionaries[0].info).toBe('dictionary-4');
});

test('save dictionary for word with existing dictionaries', () => {
    const wordId: number = dbWords.getWordByText('word-two')!.id!;
    dbDictionary.saveDictionary(wordId, 'source-5', 'dictionary-5');
    const dictionaries = dbDictionary.getDictionaries(wordId);
    expect(dictionaries.length).toBe(2);
    expect(dictionaries[0].source).toBe('source-3');
    expect(dictionaries[0].info).toBe('dictionary-3');
    expect(dictionaries[1].source).toBe('source-5');
    expect(dictionaries[1].info).toBe('dictionary-5');
});

test('delete dictionaries when word is deleted', () => {
    const wordId: number = dbWords.getWordByText('word-one')!.id!;
    const dictionariesBefore = dbDictionary.getDictionaries(wordId);
    expect(dictionariesBefore.length).toBe(2);
    dbWords.deleteWords([dbWords.getWordByText('word-one')!]);
    const dictionariesAfter = dbDictionary.getDictionaries(wordId);
    expect(dictionariesAfter.length).toBe(0);
});
