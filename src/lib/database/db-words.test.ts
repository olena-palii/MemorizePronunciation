import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Word, dbWords } from '$lib';

beforeEach(() => {
    vi.useFakeTimers();
    const wordUnknownOlder = new Word({ word: 'unknown-older', created: '2000-01-01T00:00:00Z' });
    const wordKnownNewer = new Word({ word: 'known-newer', created: '2020-12-31T23:59:59Z', learned: '2021-01-31T23:59:59Z' });
    dbWords.createWord(wordUnknownOlder);
    dbWords.createWord(wordKnownNewer);
});

afterEach(() => {
    vi.useRealTimers();
    dbWords.__testOnly_clearTable();
});

// #region Get Words

test('get word by text', () => {
    const firstWord = dbWords.getWords()[0];
    const word = dbWords.getWordByText(firstWord.word.toUpperCase());
    expect(word.id).toBe(firstWord.id);
    expect(word.word).toBe(firstWord.word);
});

test('get word by id', () => {
    const firstWord = dbWords.getWords()[0];
    const word = dbWords.getWordById(firstWord.id!);
    expect(word.id).toBe(firstWord.id);
    expect(word.word).toBe(firstWord.word);
});

test('word not found', () => {
    expect(() => dbWords.getWordByText("not-found")).toThrow('Word not found');
    expect(() => dbWords.getWordById(-1)).toThrow('Word not found');
});

// #endregion

// #region Save Words

test('save new word', () => {
    vi.setSystemTime(new Date('2024-02-29T12:15:59Z'));
    const word = new Word({ word: 'new-word' });
    dbWords.saveWord(word);
    const savedWord = dbWords.getWordByText('new-word');
    expect(savedWord.word).toBe('new-word');
    expect(savedWord.id).toBeDefined();
    expect(savedWord.created).toBe('2024-02-29T12:15:59.000Z');
    expect(savedWord.learned).toBeUndefined();
});

test('save existing word', () => {
    const word = dbWords.getWordByText('known-newer');
    word.word = 'updated-word';
    vi.setSystemTime(new Date('2024-02-29T12:15:59Z'));
    word.resetLearning();
    dbWords.saveWord(word);
    const updatedWord = dbWords.getWordById(word.id!);
    expect(updatedWord.word).toBe('updated-word');
    expect(updatedWord.created).toBe('2020-12-31T23:59:59.000Z');
    expect(updatedWord.learned).toBeUndefined();
});

test('save many words', () => {
    const words = dbWords.getWords();
    words[0].word = 'updated-word';
    words.push(new Word({ word: 'new-word-one' }));
    words.push(new Word({ word: 'new-word-two' }));
    words.push(new Word({ word: 'new-word-three' }));
    const stats = dbWords.saveWords(words);
    expect(stats.created).toBe(3);
    expect(stats.updated).toBe(2);
    const savedWords = dbWords.getWords();
    expect(savedWords.length).toBe(5);
    expect(savedWords[0].word).toBe('new-word-three');
    expect(savedWords[1].word).toBe('new-word-two');
    expect(savedWords[2].word).toBe('new-word-one');
    expect(savedWords[3].word).toBe('updated-word');
    expect(savedWords[4].word).toBe('unknown-older');
});

// #endregion

// #region Create Words

test('create word', () => {
    vi.setSystemTime(new Date('2024-02-29T12:15:59Z'));
    dbWords.createWord(new Word({ word: 'test' }));
    const firstWord = dbWords.getWords()[0];
    expect(firstWord.word).toBe('test');
    expect(firstWord.id).toBeDefined();
    expect(firstWord.created).toBe('2024-02-29T12:15:59.000Z');
    expect(firstWord.learned).toBeUndefined();
});

test('create word with custom dates', () => {
    dbWords.createWord(new Word({ word: 'custom-dates', created: '2024-01-01T10:00:00Z', learned: '2024-01-02T10:00:00Z' }));
    const word = dbWords.getWordByText('custom-dates');
    expect(word.created).toBe('2024-01-01T10:00:00.000Z');
    expect(word.learned).toBe('2024-01-02T10:00:00.000Z');
});

test('created duplicates must be ignored', () => {
    const wordsBefore = dbWords.getWords();
    dbWords.createWord(new Word({ word: 'known-newer' }));
    dbWords.createWord(new Word({ word: 'unknown-older' }));
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length);
    for (let i = 0; i < wordsBefore.length; i++) {
        expect(wordsAfter[i].id).toBe(wordsBefore[i].id);
        expect(wordsAfter[i].word).toBe(wordsBefore[i].word);
        expect(wordsAfter[i].created).toBe(wordsBefore[i].created);
        expect(wordsAfter[i].learned).toBe(wordsBefore[i].learned);
    }
});

test('create duplicate with new learned date', () => {
    dbWords.createWord(new Word({ word: 'known-newer', created: '2020-12-31T23:59:59Z', learned: '2124-03-19T14:10:00Z' }));
    const word = dbWords.getWordByText('known-newer');
    expect(word.created).toBe('2020-12-31T23:59:59.000Z');
    expect(word.learned).toBe('2124-03-19T14:10:00.000Z');
});

test('do not reset dates on duplicate', () => {
    dbWords.createWord(new Word({ word: 'known-newer' }));
    const word = dbWords.getWordByText('known-newer');
    expect(word.word).toBe('known-newer');
    expect(word.created).toBe('2020-12-31T23:59:59.000Z');
    expect(word.learned).toBe('2021-01-31T23:59:59.000Z');
});

// #endregion

// #region Update Words

test('update word', () => {
    const word = dbWords.getWordByText('known-newer');
    word.word = 'updated-word';
    dbWords.updateWord(word);
    const updatedWord = dbWords.getWordById(word.id!);
    expect(updatedWord.word).toBe('updated-word');
});

// #endregion

// #region Delete Words

test('delete word', () => {
    const wordsBefore = dbWords.getWords();
    const word = dbWords.getWordByText('known-newer');
    dbWords.deleteWord(word);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length - 1);
    expect(() => dbWords.getWordById(word.id!)).toThrow('Word not found');
});

test('skip deleting word without id', () => {
    const wordsBefore = dbWords.getWords();
    const word = new Word({ word: wordsBefore[0].word });
    dbWords.deleteWord(word);
    const wordsAfter = dbWords.getWords();
    expect(wordsAfter.length).toBe(wordsBefore.length);
});

test('delete word by id', () => {
    const wordsBefore = dbWords.getWords();
    const word = dbWords.getWordByText('known-newer');
    dbWords.deleteWordById(word.id!);
    const words = dbWords.getWords();
    expect(words.length).toBe(wordsBefore.length - 1);
    expect(() => dbWords.getWordById(word.id!)).toThrow('Word not found');
});

// #endregion