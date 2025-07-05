import type { WordDto } from '$lib';
import * as dbWords from '$lib/database/db-words';

export async function GET() {
    const words: WordDto[] = dbWords.getWords();
    return new Response(JSON.stringify(words), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: Request) {
    const words = await request.json() as WordDto[];
    const stat = dbWords.saveWords(words);
    return new Response(JSON.stringify(stat), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(request: Request) {
    const words = await request.json() as WordDto[];
    const stat = dbWords.deleteWords(words);
    return new Response(JSON.stringify(stat), { status: 200, headers: { 'Content-Type': 'application/json' } });
}