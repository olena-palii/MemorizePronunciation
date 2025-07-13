// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import db from './db';
import { Word } from '$lib';
import type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from '$lib';

// #region Get Words

const FIELDS = 'id, word, created, learned';

export function getWords(): WordDto[] {
    const query = db.prepare(`SELECT ${FIELDS} FROM words ORDER BY (learned IS NOT NULL), learned DESC, created DESC, id DESC`);
    return query.all() as WordDto[];
}

export function getWordByText(text: string): WordDto | undefined {
    const query = db.prepare(`SELECT ${FIELDS} FROM words WHERE word = ?`);
    const word = Word.normalize(text);
    const result = query.get(word);
    if (!result) return undefined;
    return result as WordDto;
}

export function getWordById(id: number): WordDto | undefined {
    const query = db.prepare(`SELECT ${FIELDS} FROM words WHERE id = ?`);
    const result = query.get(id);
    if (!result) return undefined;
    return result as WordDto;
}

// #endregion

// #region Save Words

export function saveWords(words: WordDto[]): SaveStatisticsDto {
    const stat: SaveStatisticsDto = {
        created: { count: 0, words: [] },
        updated: { count: 0, words: [] },
        duplicates: { count: 0, words: [] },
        skipped: { count: 0 }
    };

    for (const word of words) {
        // Skip empty words
        word.word = Word.normalize(word.word);
        if (!word.word) {
            stat.skipped.count++;
            continue;
        }
        // Update if word with this id exists
        if (word.id && getWordById(word.id)) {
            updateWord(word, stat);
            continue;
        }
        // Update learned date of duplicate if it is changed
        const duplicate = getWordByText(word.word);
        if (duplicate && word.learned && duplicate.learned != word.learned) {
            duplicate!.learned = word.learned;
            updateWord(duplicate!, stat);
            continue;
        }
        // Skip duplicate
        if (duplicate) {
            stat.duplicates.count++;
            stat.duplicates.words.push(duplicate);
            continue;
        }
        // Create new word otherwise
        createWord(word, stat);
    }
    return stat;
}

function createWord(word: WordDto, stat: SaveStatisticsDto): void {
    const query = db.prepare(`INSERT INTO words (word, created, learned) VALUES (?, ?, ?) RETURNING ${FIELDS}`);
    const createdISO = word.created ? new Date(word.created).toISOString() : new Date().toISOString();
    const learnedISO = word.learned ? new Date(word.learned).toISOString() : null;
    const inserted = query.get(word.word, createdISO, learnedISO) as WordDto;
    stat.created.count++;
    stat.created.words.push(inserted);
}

function updateWord(word: WordDto, stat: SaveStatisticsDto): void {
    const query = db.prepare(`UPDATE words SET word = ?, created = COALESCE(?, words.created), learned = ? WHERE id = ? RETURNING ${FIELDS}`);
    const createdISO = word.created ? new Date(word.created).toISOString() : null;
    const learnedISO = word.learned ? new Date(word.learned).toISOString() : null;
    const updated = query.get(word.word, createdISO, learnedISO, word.id) as WordDto;
    stat.updated.count++;
    stat.updated.words.push(updated);
}

// #endregion

// #region Delete Words

export function deleteWords(words: WordDto[]): DeleteStatisticsDto {
    const stat: DeleteStatisticsDto = {
        deleted: 0,
        skipped: 0
    };
    for (const word of words) {
        if (word.id) deleteWordById(word.id, stat);
        else stat.skipped++;
    }
    return stat;
}

function deleteWordById(id: number, stat: DeleteStatisticsDto): void {
    const query = db.prepare('DELETE FROM words WHERE id = ?');
    query.run(id);
    stat.deleted++;
}

export function __testOnly_clearTable(): void {
    const query = db.prepare('DELETE FROM words');
    query.run();
}

// #endregion
