<!-- Copyright 2025 Olena Palii -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<script lang="ts">
  import "../app.css";
  import { Theme, NavHomeIcon, NavCardsIcon, NavCreateIcon } from "$lib";
  const navItems = [
    { href: "/", icon: NavHomeIcon, label: "Home" },
    { href: "/cards", icon: NavCardsIcon, label: "Cards" },
    { href: "/create", icon: NavCreateIcon, label: "Create" },
  ];
</script>

<div class="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-50" role="navigation" aria-label="Main navigation">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">Memorize Pr.</a>
  </div>
  <div class="navbar-end">
    <ul class="menu menu-horizontal px-1">
      {#each navItems as item}
        <li class="hidden lg:flex">
          <a href={item.href}>
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
</div>

<div class="dock lg:hidden" role="navigation" aria-label="Mobile navigation">
  {#each navItems as item}
    <a href={item.href}>
      <svelte:component this={item.icon} />
      <span class="dock-label">{item.label}</span>
    </a>
  {/each}
</div>

<main class="pt-16">
  <slot />
</main>