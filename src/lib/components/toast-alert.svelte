<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { fly } from "svelte/transition";
    import { toasts, ToastCloseIcon } from "$lib";

    $: toastList = $toasts;

    function closeToast(id: string) {
        toasts.update((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }
</script>

<div class="toast toast-top z-50" aria-live="assertive" aria-atomic="true">
  {#each toastList as toast (toast.id)}
    <div role="alert" class="alert {`alert-${toast.type}`}" in:fly={{ y: -20, duration: 200 }} out:fly={{ y: -20, duration: 200 }}>
        <span>{toast.message}</span>
        <button class="btn btn-sm btn-ghost !bg-transparent border-none shadow-none" aria-label="Close toast" onclick={() => closeToast(toast.id)}>
            <ToastCloseIcon />
        </button>
    </div>
  {/each}
</div>