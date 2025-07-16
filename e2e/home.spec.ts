// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';

const customWords = [{ "id": 51, "word": "rarely", "created": "2025-07-08T20:09:08.391Z", "learned": null }, { "id": 5, "word": "james", "created": "2025-07-08T20:01:58.578Z", "learned": null }, { "id": 50, "word": "tonnel", "created": "2025-07-08T20:00:16.776Z", "learned": null }, { "id": 33, "word": "green", "created": "2025-07-08T19:14:44.211Z", "learned": null }, { "id": 34, "word": "yellow", "created": "2025-07-08T19:04:20.095Z", "learned": null }, { "id": 37, "word": "firewall", "created": "2025-07-08T17:00:09.377Z", "learned": null }, { "id": 32, "word": "opressive", "created": "2025-07-08T16:59:56.488Z", "learned": null }, { "id": 31, "word": "small", "created": "2025-07-08T16:59:54.388Z", "learned": null }, { "id": 30, "word": "big", "created": "2025-07-08T16:59:53.010Z", "learned": null }, { "id": 29, "word": "beautiful", "created": "2025-07-08T16:59:50.160Z", "learned": null }, { "id": 28, "word": "drum", "created": "2025-07-08T16:59:45.485Z", "learned": null }, { "id": 20, "word": "night", "created": "2025-07-08T16:51:33.519Z", "learned": null }, { "id": 19, "word": "day", "created": "2025-07-07T21:40:59.508Z", "learned": null }, { "id": 21, "word": "unhappy", "created": "2025-07-07T21:37:17.596Z", "learned": null }, { "id": 22, "word": "and", "created": "2025-07-07T21:24:58.372Z", "learned": null }, { "id": 7, "word": "spider", "created": "2025-07-07T19:44:50.151Z", "learned": null }, { "id": 17, "word": "today", "created": "2024-09-08T16:59:28.902Z", "learned": null }, { "id": 45, "word": "floccinaucinihilipilifica", "created": "2025-07-08T17:50:57.730Z", "learned": "2025-07-08T17:50:59.325Z" }, { "id": 14, "word": "interesting", "created": "2025-07-08T17:43:10.112Z", "learned": "2025-07-08T17:46:50.941Z" }, { "id": 36, "word": "fireball", "created": "2025-07-08T17:00:06.239Z", "learned": "2025-07-08T17:13:12.305Z" }, { "id": 16, "word": "more goals", "created": "2025-07-07T21:31:07.276Z", "learned": "2025-07-07T21:31:22.334Z" }, { "id": 18, "word": "tomorrow", "created": "2025-07-07T21:21:27.673Z", "learned": "2025-07-07T21:30:18.064Z" }, { "id": 11, "word": "new", "created": "2025-07-07T20:10:22.604Z", "learned": "2025-07-07T21:30:17.174Z" }, { "id": 13, "word": "happy", "created": "2025-07-05T21:24:52.916Z", "learned": "2025-07-07T21:25:00.022Z" }];

// #region Functions

async function modifyWordsResponse(page, words: any[]) {
	await page.route('*/**/api/words*', async route => {
		await route.fulfill({
			body: JSON.stringify(words)
		});
	});
	await page.reload();
}

async function createWord(page, word: string) {
	await page.locator('#add-word').getByPlaceholder('Add new word').fill(word);
	await page.locator('#add-word').getByRole('button', { name: 'Add' }).click();
	const firstRow = page.locator('#words-unknown table .word-row').first();
	await expect(firstRow.locator('.word-word')).toHaveText(word);
}

async function deleteWord(page, word: string) {
	const rows = page.locator('table .word-row');
	const rowToDelete = rows.filter({ hasText: word });
	const count = await rowToDelete.count();
	if (count > 0) {
		await expect(rowToDelete).toHaveCount(1);
		await rowToDelete.locator('.word-delete').click();
		await expect(rowToDelete).toHaveCount(0);
	}
}

async function checkWord(page, word: string) {
	const rows = page.locator('table .word-row');
	const rowToCheck = rows.filter({ hasText: word });
	await expect(rowToCheck).toHaveCount(1);
	await rowToCheck.locator('.word-checkbox').click();
}

// #endregion

// #region Tests

test.beforeEach(async ({ page, context }) => {
	await page.goto('/');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});

test('home page has expected components', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	await expect(page.locator('#add-word')).toBeVisible();
	await expect(page.locator('#words-unknown')).toBeVisible();
	await expect(page.locator('#words-learned')).toBeVisible();
});

test('home page displays words', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	await expect(page.locator('#words-unknown table .word-row')).toHaveCount(17);
	await expect(page.locator('#words-unknown table .word-row').first().locator('.word-word')).toHaveText('rarely');
	await expect(page.locator('#words-learned table .word-row')).toHaveCount(7);
	await expect(page.locator('#words-learned table .word-row').first().locator('.word-word')).toHaveText('floccinaucinihilipilifica');
});

test('learning period', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	const word = 'happy';
	const learnedWords = page.locator('#words-learned table .word-row');
	const wordRow = learnedWords.filter({ hasText: word });
	await expect(wordRow).toHaveCount(1);
	await expect(wordRow.first().locator('.word-period')).toHaveText('2 days');
});

test('filter tables by add word input', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	await page.locator('#add-word').getByPlaceholder('Add new word').fill('to');
	await expect(page.locator('#words-unknown table .word-row')).toHaveCount(2);
	await expect(page.locator('#words-unknown table .word-row').first().locator('.word-word')).toHaveText('tonnel');
	await expect(page.locator('#words-unknown table .word-row').last().locator('.word-word')).toHaveText('today');
	await expect(page.locator('#words-learned table .word-row')).toHaveCount(1);
	await expect(page.locator('#words-learned table .word-row').first().locator('.word-word')).toHaveText('tomorrow');
});

test('empty tables', async ({ page }) => {
	modifyWordsResponse(page, []);
	await expect(page.locator('#words-unknown table .word-row')).toHaveCount(0);
	await expect(page.locator('#words-learned table .word-row')).toHaveCount(0);
});

test('add and delete word', async ({ page }) => {
	const word = 'new-word';
	await createWord(page, word);
	await deleteWord(page, word);
});

test('check and uncheck word', async ({ page }) => {
	const word = 'check-word';
	const unknownWords = page.locator('#words-unknown table .word-row');
	const learnedWords = page.locator('#words-learned table .word-row');
	await createWord(page, word);
	await checkWord(page, word);
	await expect(unknownWords.filter({ hasText: word })).toHaveCount(0);
	await expect(learnedWords.filter({ hasText: word })).toHaveCount(1);
	await expect(learnedWords.first().locator('.word-word')).toHaveText(word);
	await checkWord(page, word);
	await expect(unknownWords.filter({ hasText: word })).toHaveCount(1);
	await expect(unknownWords.first().locator('.word-word')).toHaveText(word);
	await expect(learnedWords.filter({ hasText: word })).toHaveCount(0);
	await deleteWord(page, word);
});

test('copy words from filtered table', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	await page.locator('#add-word').getByPlaceholder('Add new word').fill('to');
	await page.locator('#words-unknown').getByRole('button', { name: 'Copy to clipboard' }).click();
	await expect(page.locator('.toast .alert.alert-success')).toHaveText('Copied to clipboard');	
	const clipboardContentUnknown = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboardContentUnknown).toBe("tonnel\ntoday");
	await page.locator('#words-learned').getByRole('button', { name: 'Copy to clipboard' }).click();
	await expect(page.locator('.toast .alert.alert-success')).toHaveCount(2);
	await expect(page.locator('.toast .alert.alert-success').first()).toHaveText('Copied to clipboard');
	await expect(page.locator('.toast .alert.alert-success').last()).toHaveText('Copied to clipboard');
	const clipboardContentLearned = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboardContentLearned).toBe("tomorrow");
});

test('copy words button is disabled for empty table', async ({ page }) => {
	modifyWordsResponse(page, customWords);
	await page.locator('#add-word').getByPlaceholder('Add new word').fill('non-existing-word');
	await expect(page.locator('#words-unknown').getByRole('button', { name: 'Copy to clipboard' })).toBeDisabled();
});

// #endregion