// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from 'vitest';
import { Dictionary } from './dictionary';
import type { DictionaryapiDto } from './dto';

test('add from dictionaryapi', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetic: '/waʊnd/',
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [
                        { definition: 'a single distinct meaningful element of speech or writing', example: 'the word "cat"' },
                        { definition: 'a command or signal' }
                    ]
                },
                {
                    partOfSpeech: 'noun',
                    definitions: [{ definition: 'duplicate part of speech' }]
                },
                {
                    partOfSpeech: 'verb',
                    definitions: [{ definition: 'to express in words' }]
                }
            ]
        },
        {
            phonetics: [{ text: 'ˈother' }],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [{ definition: 'other word' }]
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(3);
    expect(dictionary.phonetics).toContain('/waʊnd/');
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.phonetics).toContain('ˈother');
    expect(dictionary.meanings.length).toBe(4);
    expect(dictionary.meanings[0].partOfSpeech).toBe('noun');
    expect(dictionary.meanings[0].definitions.length).toBe(2);
    expect(dictionary.meanings[0].definitions[0].definition).toBe('a single distinct meaningful element of speech or writing');
    expect(dictionary.meanings[0].definitions[0].example).toBe('the word "cat"');
    expect(dictionary.meanings[0].definitions[1].definition).toBe('a command or signal');
    expect(dictionary.meanings[0].definitions[1].example).toBeUndefined();
    expect(dictionary.meanings[1].partOfSpeech).toBe('noun');
    expect(dictionary.meanings[1].definitions.length).toBe(1);
    expect(dictionary.meanings[1].definitions[0].definition).toBe('duplicate part of speech');
    expect(dictionary.meanings[2].partOfSpeech).toBe('verb');
    expect(dictionary.meanings[2].definitions.length).toBe(1);
    expect(dictionary.meanings[2].definitions[0].definition).toBe('to express in words');
    expect(dictionary.meanings[3].partOfSpeech).toBe('noun');
    expect(dictionary.meanings[3].definitions.length).toBe(1);
    expect(dictionary.meanings[3].definitions[0].definition).toBe('other word');
    expect(dictionary.loaded).toBe(true);
});

test('add from dictionaryapi without phonetics', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [{ definition: 'a single distinct meaningful element of speech or writing' }]
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(0);
    expect(dictionary.meanings.length).toBe(1);
    expect(dictionary.meanings[0].partOfSpeech).toBe('noun');
    expect(dictionary.meanings[0].definitions.length).toBe(1);
    expect(dictionary.meanings[0].definitions[0].definition).toBe('a single distinct meaningful element of speech or writing');
    expect(dictionary.loaded).toBe(true);
});

test('add from dictionaryapi with empty phonetics array', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [{ definition: 'a single distinct meaningful element of speech or writing' }]
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(0);
    expect(dictionary.meanings.length).toBe(1);
    expect(dictionary.meanings[0].partOfSpeech).toBe('noun');
    expect(dictionary.meanings[0].definitions.length).toBe(1);
    expect(dictionary.meanings[0].definitions[0].definition).toBe('a single distinct meaningful element of speech or writing');
    expect(dictionary.loaded).toBe(true);
});

test('add from dictionaryapi without meanings', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add from dictionaryapi with empty meanings array', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: []
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add from dictionaryapi with empty data', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(0);
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add with empty phonetic', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: ' ' }, { text: '' }, { text: 'ˈwɜːrd' }],
            meanings: []
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add with duplicate phonetic', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }, { text: 'ˈwɜːrd' }],
            meanings: []
        },
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: []
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add meaning without part of speech', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: [
                {
                    partOfSpeech: '',
                    definitions: [{ definition: 'a single distinct meaningful element of speech or writing' }]
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add meaning without definitions', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: [
                {
                    partOfSpeech: 'noun',
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});

test('add meaning with empty definitions array', () => {
    const dictionary = new Dictionary();
    const mockData: DictionaryapiDto[] = [
        {
            phonetics: [{ text: 'ˈwɜːrd' }],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: []
                }
            ]
        }
    ];

    dictionary.addFromDictionaryapi(mockData);

    expect(dictionary.phonetics.length).toBe(1);
    expect(dictionary.phonetics).toContain('ˈwɜːrd');
    expect(dictionary.meanings.length).toBe(0);
    expect(dictionary.loaded).toBe(true);
});