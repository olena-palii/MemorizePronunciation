// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { WordDto } from '$lib';
import * as dbWords from '$lib/database/db-words';

export async function GET() {
    const words: WordDto[] = dbWords.getWords();
    return new Response(JSON.stringify(words), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(event: { request: Request }) {
    const words = await event.request.json() as WordDto[];
    const stat = dbWords.saveWords(words);
    return new Response(JSON.stringify(stat), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(event: { request: Request }) {
    const words = await event.request.json() as WordDto[];
    const stat = dbWords.deleteWords(words);
    return new Response(JSON.stringify(stat), { status: 200, headers: { 'Content-Type': 'application/json' } });
}