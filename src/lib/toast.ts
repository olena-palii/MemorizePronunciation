// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import type { ToastDto, ToastType } from '$lib';
import { writable } from 'svelte/store';

export class Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    constructor(toast: ToastDto) {
        this.id = crypto.randomUUID();
        this.message = toast.message;
        this.type = toast.type || 'success';
        this.duration = toast.duration;
    }
}

export const toasts = writable<Toast[]>([]);

export function addToast(toastDto: ToastDto) {
    const toast: Toast = new Toast(toastDto);
    toasts.update((all) => [...all, toast]);

    if (toast.duration) {
        setTimeout(() => {
            toasts.update((all) => all.filter((t) => t.id !== toast.id));
        }, toast.duration);
    }
}
