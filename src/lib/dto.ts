export interface WordDto {
    id?: number;
    word: string;
    created?: string;
    learned?: string;
}

export interface SaveStatisticsDto {
    created: {
        count: number;
        words: WordDto[];
    }
    updated: {
        count: number;
        words: WordDto[];
    }
    duplicates: {
        count: number;
        words: WordDto[];
    },
    skipped: {
        count: number;
        // No skipped words because of possible unsafe values without normalization
    }
}

export interface DeleteStatisticsDto {
    deleted: number;
    skipped: number;
}