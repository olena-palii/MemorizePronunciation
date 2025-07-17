// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';

const customStat = {"created":{"count":3,"words":[{"id":117,"word":"wonderful","created":"2025-07-09T20:30:40.281Z","learned":null},{"id":118,"word":"butter","created":"2025-07-09T20:30:40.281Z","learned":null},{"id":119,"word":"knife","created":"2025-07-09T20:30:40.281Z","learned":null}]},"updated":{"count":1,"words":[{"id":120,"word":"update","created":"2025-07-09T20:30:40.281Z","learned":null}]},"duplicates":{"count":2,"words":[{"id":75,"word":"test","created":"2025-07-09T19:10:14.097Z","learned":null},{"id":75,"word":"test","created":"2025-07-09T19:10:14.097Z","learned":null}]}};

test.beforeEach(async ({ page }) => {
	await page.goto('/create');
});

test('create page has expected components', async ({ page }) => {
	await expect(page.locator('#create-words')).toBeVisible();
});

test('create statistics', async ({ page }) => {
	await page.route('*/**/api/words*', async route => {
		await route.fulfill({
			body: JSON.stringify(customStat)
		});
	});
	await page.reload();
	await page.locator('#create-words').getByPlaceholder('Enter words, one per line').fill("test");
	await page.locator('#create-words').getByRole('button', { name: 'Create words' }).click();
	await expect(page.locator('.toast .alert-success').last()).toHaveText('Successfully created 3 words');
	await expect(page.locator('#create-stat')).toBeVisible();
	await expect(page.locator('#stat-created')).toHaveText('3 created');
	await expect(page.locator('#stat-updated')).toHaveText('1 updated');
	await expect(page.locator('#stat-duplicates')).toHaveText('2 duplicates');
});

test('create words', async ({ page }) => {
	const words: string[] = ["word-one", "word-two", "word-three"];
	const text = words.join('\n');
	await page.locator('#create-words').getByPlaceholder('Enter words, one per line').fill(text);
	await page.locator('#create-words').getByRole('button', { name: 'Create words' }).click();
	await expect(page.locator('.toast .alert-success').last()).toHaveText('Successfully created 3 words');
	await expect(page.locator('#stat-created')).toHaveText('3 created');
	await page.goto('/');
	const rows = page.locator('#words-unknown table .word-row');
	for (const word of words) {
		const row = rows.filter({ hasText: word });
		await expect(row).toHaveCount(1);
		await expect(row.locator('.word-word')).toHaveText(word);
		await row.locator('.word-delete').click();
	}
});

