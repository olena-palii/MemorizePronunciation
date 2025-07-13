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
}

initializeDatabase();

export default db;