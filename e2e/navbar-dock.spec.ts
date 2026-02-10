// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';

// #region Functions

async function mobileViewport(page) {
    await page.setViewportSize({ width: 412, height: 915 });
}

async function getTheme(page) {
    await page.waitForFunction(() => document.documentElement.getAttribute('data-theme') !== null);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(['light', 'dark']).toContain(theme);
    return theme;
}

async function checkThemeToggle(toggle, isDarkTheme: boolean) {
    if (isDarkTheme) await expect(toggle).toBeChecked();
    else await expect(toggle).not.toBeChecked();
}

// #endregion

// #region Tests

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('navbar and dock in web view @T10127904', async ({ page }) => {
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Memorize Pr.' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Cards' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Create' })).toBeVisible();
    const dock = page.locator('.dock');
    await expect(dock).not.toBeVisible();
});

test('navbar and dock in mobile view @T8ecb0772', async ({ page }) => {
    await mobileViewport(page);
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Memorize Pr.' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Home' })).not.toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Cards' })).not.toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Create' })).not.toBeVisible();
    const dock = page.locator('.dock');
    await expect(dock).toBeVisible();
    await expect(dock.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(dock.getByRole('link', { name: 'Cards' })).toBeVisible();
    await expect(dock.getByRole('link', { name: 'Create' })).toBeVisible();
});

test('navigation in web view @T6b761a55', async ({ page }) => {
    const navbar = page.locator('.navbar');
    await navbar.getByRole('link', { name: 'Cards' }).click();
    await expect(page).toHaveURL(/^.*\/cards.*$/);
    await navbar.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await navbar.getByRole('link', { name: 'Create' }).click();
    await expect(page).toHaveURL('/create');
    await navbar.getByRole('link', { name: 'Memorize Pr.' }).click();
    await expect(page).toHaveURL('/');
});

test('navigation in mobile view @T90cfb250', async ({ page }) => {
    await mobileViewport(page);
    const navbar = page.locator('.navbar');
    const dock = page.locator('.dock');
    await dock.getByRole('link', { name: 'Cards' }).click();
    await expect(page).toHaveURL(/^.*\/cards.*$/);
    await dock.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await dock.getByRole('link', { name: 'Create' }).click();
    await expect(page).toHaveURL('/create');
    await navbar.getByRole('link', { name: 'Memorize Pr.' }).click();
    await expect(page).toHaveURL('/');
});

test('default theme @T5927b209', async ({ page }) => {
    const theme = await getTheme(page);
    const isDarkTheme = theme === 'dark';
    const toggle = page.locator('.theme-toggle').locator('input.toggle');
    await checkThemeToggle(toggle, isDarkTheme);
});

test('theme toggle in web view @T942ddc96', async ({ page }) => {
    const themeBeforeToggle = await getTheme(page);
    let isDarkTheme = themeBeforeToggle === 'dark';
    const toggle = page.locator('.theme-toggle').locator('input.toggle');
    await checkThemeToggle(toggle, isDarkTheme);
    await toggle.click();
    await checkThemeToggle(toggle, !isDarkTheme);
    await toggle.click();
    await checkThemeToggle(toggle, isDarkTheme);
});

test('theme toggle in mobile view @T4c6ec060', async ({ page }) => {
    await mobileViewport(page);
    const themeBeforeToggle = await getTheme(page);
    let isDarkTheme = themeBeforeToggle === 'dark';
    const toggle = page.locator('.theme-toggle').locator('input.toggle');
    await checkThemeToggle(toggle, isDarkTheme);
    await toggle.click();
    await checkThemeToggle(toggle, !isDarkTheme);
    await toggle.click();
    await checkThemeToggle(toggle, isDarkTheme);
});

// #endregion