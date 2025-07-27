// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import db from './db';

type DictionaryRow = {
    id: number;
    source: string;
    info: string;
};

export function getDictionary(word_id: number): DictionaryRow[] {
    const query = db.prepare(`SELECT id, source, info FROM dictionary WHERE word_id = ? ORDER BY id ASC`);
    return query.all(word_id) as DictionaryRow[];
}

export function saveDictionary(word_id: number, source: string, dictionary: string): void {
    const insertQuery = db.prepare(`INSERT INTO dictionary (word_id, source, info) VALUES (?, ?, ?)`);
    insertQuery.run(word_id, source, dictionary);
}
