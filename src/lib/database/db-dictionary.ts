// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import db from './db';
import type { DictionaryDbDto } from '$lib';

export function getDictionary(word_id: number, source: string): string | undefined {
    const query = db.prepare(`SELECT id, source, info FROM dictionary WHERE word_id = ? AND source = ? ORDER BY id ASC`);
    const result = query.all(word_id, source) as DictionaryDbDto[];
    if(result.length === 0) return undefined;
    return result[0].info ?? undefined;
}

export function getDictionaries(word_id: number): DictionaryDbDto[] {
    const query = db.prepare(`SELECT id, source, info FROM dictionary WHERE word_id = ? ORDER BY id ASC`);
    return query.all(word_id) as DictionaryDbDto[];
}

export function saveDictionary(word_id: number, source: string, info: string): void {
    const wordExists = db.prepare(`SELECT 1 FROM words WHERE id = ?`).get(word_id);
    if (!wordExists) return;
    const insertQuery = db.prepare(`INSERT OR REPLACE INTO dictionary (word_id, source, info) VALUES (?, ?, ?)`);
    insertQuery.run(word_id, source, info);
}
