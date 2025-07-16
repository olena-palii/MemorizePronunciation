<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
  import "../app.css";
  import { page } from '$app/state';
  import { Theme, ToastAlert, NavHomeIcon, NavCardsIcon, NavCreateIcon } from "$lib";
  const navItems = [
    { href: "/", icon: NavHomeIcon, label: "Home" },
    { href: "/cards", icon: NavCardsIcon, label: "Cards" },
    { href: "/create", icon: NavCreateIcon, label: "Create" },
  ];

  function dockActivePage(href: string): string {
    return page.url.pathname === href ? 'dock-active' : '';
  }

  function navActivePage(href: string): string {
    return page.url.pathname === href ? 'text-gray-400' : '';
  }
</script>

<nav class="navbar z-40 bg-base-100 shadow-sm fixed top-0 py-1" aria-label="Main navigation">
  <a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">Memorize Pr.</a>
  </div>
  <div class="navbar-end">
    <ul class="menu menu-horizontal px-1">
      {#each navItems as item}
        <li class="hidden lg:flex">
          <a href={item.href} class={navActivePage(item.href)}>
            <svelte:component this={item.icon} />
            {item.label}
          </a>
        </li>
      {/each}
      <li>
        <Theme />
      </li>
    </ul>
  </div>
</nav>

<nav class="dock z-40 lg:hidden fixed bottom-0 h-16" aria-label="Mobile navigation">
  {#each navItems as item}
    <a href={item.href} class="{dockActivePage(item.href)}">
      <svelte:component this={item.icon} />
      <span class="dock-label">{item.label}</span>
    </a>
  {/each}
</nav>

<ToastAlert />
<main id="main" tabindex="-1" class="pt-16">
  <slot />
</main>