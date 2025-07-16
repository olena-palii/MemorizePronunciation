// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

export interface WordDto {
    id?: number;
    word: string;
    created?: string;
    learned?: string;
}

export interface apiDto {
    input: RequestInfo,
    init?: RequestInit,
    errorMessage?: string
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

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastDto {
    id?: string;
    message: string;
    type?: ToastType;
    duration?: number;
}