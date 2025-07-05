import db from './db';
import { Word } from '$lib';
import type { WordDto } from '$lib';

// #region Get Words

const FIELDS = 'id, word, created, learned';

export function getWords(): Word[] {
    const query = db.prepare(`SELECT ${FIELDS} FROM words ORDER BY created DESC, id DESC`);
    const results = query.all() as WordDto[];
    return results.map(result => new Word(result));
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export function getWordByText(text: string): Word {
    const query = db.prepare(`SELECT ${FIELDS} FROM words WHERE word = ?`);
    const word = Word.normalize(text);
    const result = query.get(word);
    if (!result) throw new NotFoundError(`Word not found by text: ${word}`);
    return new Word(result as WordDto);
}

export function getWordById(id: number): Word {
    const query = db.prepare(`SELECT ${FIELDS} FROM words WHERE id = ?`);
    const result = query.get(id);
    if (!result) throw new NotFoundError(`Word not found by id: ${id}`);
    return new Word(result as WordDto);
}

// #endregion

// #region Save Words

interface SaveStatistics {
    created: number;
    updated: number;
}

export function saveWords(words: Word[]): SaveStatistics {
    const stat: SaveStatistics = { created: 0, updated: 0 };
    for (const word of words) {
        if (word.id) {
            updateWord(word);
            stat.updated++;
        }
        else {
            createWord(word);
            stat.created++;
        }
    }
    return stat;
}

export function saveWord(word: Word): void {
    if (word.id) updateWord(word);
    else createWord(word);
}

export function createWord(word: Word): void {
    const query = db.prepare(`
        INSERT INTO words (word, created, learned) VALUES (?, ?, ?)
        ON CONFLICT(word) DO UPDATE SET learned = COALESCE(excluded.learned, words.learned)
    `);
    query.run(word.word, word.created, word.learned);
}

export function updateWord(word: Word): void {
    const query = db.prepare(`UPDATE words SET word = ?, created = COALESCE(?, words.created), learned = ? WHERE id = ?`);
    query.run(word.word, word.created, word.learned, word.id);
}

// #endregion

// #region Delete Words

export function deleteWord(word: Word): void {
    if (word.id) deleteWordById(word.id);
}

export function deleteWordById(id: number): void {
    const query = db.prepare('DELETE FROM words WHERE id = ?');
    query.run(id);
}

export function __testOnly_clearTable(): void {
    const query = db.prepare('DELETE FROM words');
    query.run();
}

// #endregion
