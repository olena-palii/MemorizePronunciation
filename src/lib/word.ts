import type { WordDto } from '$lib';

export class Word {
    id?: number;
    private _word: string = '';
    private _created: Date = new Date();
    private _learned?: Date;

    constructor(word: WordDto) {
        this.id = word.id;
        this.word = word.word;
        this.created = word.created;
        this.learned = word.learned;
    }

    get word(): string {
        return this._word;
    }

    set word(value: string) {
        this._word = Word.normalize(value);
    }

    /**
     * Normalizes the word by:
     * - normalizing to NFC form
     * - converting to lowercase
     * - removing unsupported characters (only letters, apostrophes, hyphens, and spaces are allowed)
     * - removing multiple spaces, apostrophes, and hyphens
     * - trimming leading and trailing spaces, apostrophes, and hyphens
     * - limiting the length to 50 characters
     */
    static normalize(word: string): string {
        word = word.normalize("NFC");
        word = word.toLowerCase();
        word = word.replace(/[^\p{L}' -]/gu, '');
        word = word.replace(/\s{2,}/g, ' ');
        word = word.replace(/'{2,}/g, "'");
        word = word.replace(/-{2,}/g, '-');
        word = word.replace(/^[ '-]+|[ '-]+$/g, '');
        word = word.trim();
        word = word.slice(0, 50);
        return word;
    }

    get created(): string {
        return this._created.toISOString();
    }

    set created(value: Date | string | undefined) {
        this._created = value ? new Date(value) : new Date();
    }

    get learned(): string | undefined {
        return this._learned ? this._learned.toISOString() : undefined;
    }

    set learned(value: Date | string | undefined) {
        this._learned = value ? new Date(value) : undefined;
    }

    get isLearned(): boolean {
        return !!this.learned;
    }

    get learningPeriod(): string {
        const fromDate = new Date(this.created);
        const toDate = this.learned ? new Date(this.learned) : new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.abs(Math.floor((toDate.getTime() - fromDate.getTime()) / msPerDay));
        if (days === 1) return "1 day";
        if (days < 30 * 3) return `${days} days`;
        const months = Math.floor(days / 30);
        if (days < 365 * 2) return `${months} months`;
        const years = Math.floor(days / 365);
        return `${years} years`;
    }

    markAsLearned(): void {
        this.learned = new Date();
    }

    resetLearning(): void {
        this.learned = undefined;
    }

    toDto(): WordDto {
        return {
            id: this.id,
            word: this.word,
            created: this.created,
            learned: this.learned
        };
    }

    equals(other: Word | WordDto | string): boolean {
        if (typeof other === 'string') return this.word === Word.normalize(other);
        if (other instanceof Word) return this.word === other.word;
        if (typeof other === 'object' && 'word' in other) return this.word === other.word;
        return false;
    }

}