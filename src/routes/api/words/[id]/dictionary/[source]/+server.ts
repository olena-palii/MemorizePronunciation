// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import * as dbDictionary from '$lib/database/db-dictionary';

export async function GET(event: { params: { id: string, source: string } }) {
    const wordId: number = parseInt(event.params.id);
    const data = dbDictionary.getDictionary(wordId, event.params.source);
    if(!data) return new Response(undefined, { status: 204, headers: { 'Content-Type': 'application/json' } });
    return new Response(data, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(event: { params: { id: string, source: string }, request: Request }) {
    const wordId: number = parseInt(event.params.id);
    const info = await event.request.text();
    dbDictionary.saveDictionary(wordId, event.params.source, info);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}