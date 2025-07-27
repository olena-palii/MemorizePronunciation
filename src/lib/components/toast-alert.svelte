<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
  import { fly } from "svelte/transition";
  import { toasts, XCloseIcon } from "$lib";

  $: toastList = $toasts;

  function closeToast(id: string) {
    toasts.update((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }

  function alertType(type: string): string {
    switch (type) {
      case "success":
        return "alert alert-success";
      case "error":
        return "alert alert-error";
      case "warning":
        return "alert alert-warning";
      default:
        return "alert alert-info";
    }
  }
</script>

<div class="toast toast-top z-50" aria-live="assertive" aria-atomic="true">
  {#each toastList as toast (toast.id)}
    <div role="alert" class={alertType(toast.type)} in:fly={{ y: -20, duration: 200 }} out:fly={{ y: -20, duration: 200 }}>
        <span>{toast.message}</span>
        <button class="btn btn-sm btn-ghost !bg-transparent border-none shadow-none hover:text-inherit" aria-label="Close toast" onclick={() => closeToast(toast.id)}>
            <XCloseIcon />
        </button>
    </div>
  {/each}
</div>