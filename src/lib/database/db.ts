// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import Database from 'better-sqlite3';

const DEFAULT_PATH = 'data.db';
const db = new Database(process.env.DB_PATH ?? DEFAULT_PATH);

db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        created DATE DEFAULT CURRENT_TIMESTAMP,
        learned DATE
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS dictionary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        source TEXT NOT NULL,
        info TEXT NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
  `);
}

initializeDatabase();

export default db;