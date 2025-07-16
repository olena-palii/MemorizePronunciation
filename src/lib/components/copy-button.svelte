<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { CopyIcon } from "$lib";

    interface Props {
        text: string;
    }

    let { text = $bindable() }: Props = $props();

    function copy() {
        navigator.clipboard.writeText(text);
    }
</script>

<button class="btn btn-square btn-ghost tooltip tooltip-bottom" aria-label="Copy to clipboard" data-tip="Copy to clipboard" disabled={!text} onclick={copy}>
    <CopyIcon />
</button>