import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Word, NormalizationError } from './word';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

test('create word with required values only', () => {
    vi.setSystemTime(new Date('2024-02-29T12:15:59Z'));
    const word = new Word({ word: 'test' });
    expect(word.id).toBeUndefined();
    expect(word.word).toBe('test');
    expect(word.created).toBe('2024-02-29T12:15:59.000Z');
    expect(word.learned).toBeUndefined();
});

test('create word with all custom values', () => {
    const word = new Word({ id: 1, word: 'custom-dates', created: '2024-01-01T10:00:00Z', learned: '2024-01-02T10:00:00Z' });
    expect(word.id).toBe(1);
    expect(word.word).toBe('custom-dates');
    expect(word.created).toBe('2024-01-01T10:00:00.000Z');
    expect(word.learned).toBe('2024-01-02T10:00:00.000Z');
});

test('normalize word', () => {
    const word = new Word({ word: ' - !Un  it--Th\'\'ree \' ' });
    expect(word.word).toBe('un it-th\'ree');
    word.word = ' - !An  it--Th\'\'ree \' ';
    expect(word.word).toBe('an it-th\'ree');
});

test('normalize word in different languages', () => {
    const word = new Word({ word: 'Їжачок' });
    expect(word.word).toBe('їжачок');
    word.word = 'München';
    expect(word.word).toBe('münchen');
});

test('normalize word to empty string', () => {
    expect(() => new Word({ word: ' !!! ' })).toThrow(NormalizationError);
    expect(() => new Word({ word: ' !!! ' })).toThrow('Word is empty after normalization');
});

test('isLearned value', () => {
    const word = new Word({ word: 'test' });
    expect(word.isLearned).toBe(false);
    word.learned = new Date();
    expect(word.isLearned).toBe(true);
});

test('learning period between created and learned dates', () => {
    const word = new Word({ word: 'test', created: '2024-01-01T00:00:00Z' });
    word.learned = new Date('2024-01-01T00:00:00Z');
    expect(word.learningPeriod).toBe('0 days');
    word.learned = new Date('2024-01-01T23:59:59Z');
    expect(word.learningPeriod).toBe('0 days');
    word.learned = new Date('2024-01-02T00:00:00Z');
    expect(word.learningPeriod).toBe('1 day');
    word.learned = new Date('2024-03-30T00:00:00Z');
    expect(word.learningPeriod).toBe('89 days');
    word.learned = new Date('2024-03-31T00:00:00Z');
    expect(word.learningPeriod).toBe('3 months');
    word.learned = new Date('2025-12-30T00:00:00Z');
    expect(word.learningPeriod).toBe('24 months');
    word.learned = new Date('2025-12-31T00:00:00Z');
    expect(word.learningPeriod).toBe('2 years');
});

test('learning period between created and today dates', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const word = new Word({ word: 'test' });
    expect(word.learningPeriod).toBe('0 days');
    vi.setSystemTime(new Date('2024-01-01T23:59:59Z'));
    expect(word.learningPeriod).toBe('0 days');
    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));
    expect(word.learningPeriod).toBe('1 day');
    vi.setSystemTime(new Date('2024-03-30T00:00:00Z'));
    expect(word.learningPeriod).toBe('89 days');
    vi.setSystemTime(new Date('2024-03-31T00:00:00Z'));
    expect(word.learningPeriod).toBe('3 months');
    vi.setSystemTime(new Date('2025-12-30T00:00:00Z'));
    expect(word.learningPeriod).toBe('24 months');
    vi.setSystemTime(new Date('2025-12-31T00:00:00Z'));
    expect(word.learningPeriod).toBe('2 years');
});

test('mark as learned', () => {
    const word = new Word({ word: 'test' });
    expect(word.learned).toBeUndefined();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    word.markAsLearned();
    expect(word.learned).toBe('2024-01-01T00:00:00.000Z');
});

test('reset learning', () => {
    const word = new Word({ word: 'test', learned: '2024-01-01T00:00:00Z' });
    expect(word.learned).toBeDefined();
    word.resetLearning();
    expect(word.learned).toBeUndefined();
});

test('convert to DTO', () => {
    const wordDto = {
        id: 1,
        word: 'test',
        created: '2024-01-01T10:00:00.000Z',
        learned: '2024-01-02T10:00:00.000Z',
    };
    const word = new Word(wordDto);
    expect(word.toDto()).toEqual(wordDto);
});

test('equals to string', () => {
    const word = new Word({ word: 'test' });
    expect(word.equals('test')).toBe(true);
    expect(word.equals(' TEST!')).toBe(true);
    expect(word.equals('other')).toBe(false);
});

test('equals to Word instance', () => {
    const word1 = new Word({ word: 'test' });
    const word2 = new Word({ word: 'test' });
    const word3 = new Word({ word: 'other' });
    expect(word1.equals(word2)).toBe(true);
    expect(word1.equals(word3)).toBe(false);
});

test('equals to WordDto', () => {
    const word = new Word({ word: 'test' });
    expect(word.equals({ word: 'test' })).toBe(true);
    expect(word.equals({ word: 'other' })).toBe(false);
});