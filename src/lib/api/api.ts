// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { apiDto } from '$lib';
import { addToast } from '$lib';

export async function api<T>(dto: apiDto): Promise<T | undefined> {
    try {
        const response = await fetch(dto.input, dto.init);
        if (!response.ok) {
            addToast({ message: dto.errorMessage ?? 'Unexpected error happened', type: 'error' });
            return undefined;
        }
        return await response.json() as T;
    } catch (err) {
        console.error('API Error:', err);
        addToast({ message: 'No internet connection or server unreachable', type: 'error' });
        return undefined;
    }
}