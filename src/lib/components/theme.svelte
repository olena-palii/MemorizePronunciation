<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
    import { onMount } from "svelte";
    import { ThemeLightIcon, ThemeDarkIcon } from "$lib";
    const themeDark = "dark";
    const themeLight = "light";
    let isDarkTheme: boolean = true;

    onMount(() => {
        if (typeof window !== "undefined") {
            const theme = window.localStorage.getItem("theme");
            const current_theme = theme === themeLight ? themeLight : themeDark;
            isDarkTheme = current_theme !== themeLight;
            document.documentElement.setAttribute("data-theme", current_theme);
        }
    });

    function toggleTheme() {
        const theme = isDarkTheme ? themeDark : themeLight;
        set_theme(theme);
    }

    function set_theme(theme: string) {
        const one_year = 60 * 60 * 24 * 365;
        window.localStorage.setItem("theme", theme);
        document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`;
        document.documentElement.setAttribute("data-theme", theme);
    }
</script>

<label class="theme-toggle flex cursor-pointer" title="Toggle theme">
    <ThemeLightIcon />
    <input
        type="checkbox"
        value="synthwave"
        class="toggle theme-controller"
        bind:checked={isDarkTheme}
        onchange={toggleTheme}
    />
    <ThemeDarkIcon />
</label>
