// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';

// #region Mocking

// Add spy flags for audio and TTS calls
declare global {
	interface Window {
		__audioWasPlayed?: boolean;
		__ttsCalled?: boolean;
	}
}

async function addSpyFlagsForAudioPlay(page) {
	await page.addInitScript(() => {
		window.__audioWasPlayed = false;
		Audio.prototype.play = function () {
			window.__audioWasPlayed = true;
			return Promise.resolve();
		};
	});
}

async function addSpyFlagsForTTScall(page) {
	await page.addInitScript(() => {
		window.__ttsCalled = false;
		window.speechSynthesis.speak = function (utterance) {
			window.__ttsCalled = true;
		};
	});
}

async function mockAudioRecording(page) {
	await page.addInitScript(() => {
		navigator.mediaDevices.getUserMedia = async () => {
			const canvas = document.createElement('canvas');
			const stream = canvas.captureStream();
			const audioContext = new AudioContext();
			const oscillator = audioContext.createOscillator();
			const dest = audioContext.createMediaStreamDestination();
			oscillator.connect(dest);
			oscillator.start();
			stream.addTrack(dest.stream.getAudioTracks()[0]);
			return stream;
		};
	});
}

async function deleteWord(page, word: string) {
	const rows = page.locator('table .word-row');
	const rowToDelete = rows.filter({ hasText: word });
	await expect(rowToDelete).toHaveCount(1);
	await rowToDelete.locator('.word-delete').click();
	await expect(rowToDelete).toHaveCount(0);
}

const customWords = [{ "id": 202, "word": "unknown-one", "created": "2025-07-12T19:39:22.660Z", "learned": null }, { "id": 201, "word": "unknown-two", "created": "2025-07-12T19:39:13.494Z", "learned": null }, { "id": 197, "word": "learned-one", "created": "2025-07-12T19:38:39.936Z", "learned": "2025-07-12T19:38:55.849Z" }, { "id": 198, "word": "learned-two", "created": "2025-07-12T19:38:44.915Z", "learned": "2025-07-12T19:38:55.512Z" }];

async function mockWordsAPI(page) {
	await page.route('*/**/api/words*', async route => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				body: JSON.stringify(customWords)
			});
		} else {
			await route.continue();
		}
	});
}

async function mockEmptyWordsAPI(page) {
	await page.route('*/**/api/words*', async route => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				body: JSON.stringify([])
			});
		} else {
			await route.continue();
		}
	});
}

async function mockMarkAsKnownAPI(page) {
	await page.route('*/**/api/words*', async route => {
		await route.fulfill({
			body: JSON.stringify({ "created": { "count": 0, "words": [] }, "updated": { "count": 1, "words": [{ "id": 202, "word": "unknown-one", "created": "2025-07-12T19:39:22.660Z", "learned": "2025-07-12T22:07:06.600Z" }] }, "duplicates": { "count": 0, "words": [] } })
		});
	});
}

async function mockResetLearningAPI(page) {
	await page.route('*/**/api/words*', async route => {
		await route.fulfill({
			body: JSON.stringify({ "created": { "count": 0, "words": [] }, "updated": { "count": 1, "words": [{ "id": 197, "word": "learned-one", "created": "2025-07-12T19:38:39.936Z", "learned": null }] }, "duplicates": { "count": 0, "words": [] } })
		});
	});
}

async function mockDeleteWordAPI(page) {
	await page.route('*/**/api/words/*', async route => {
		if (route.request().method() === 'DELETE') {
			await route.fulfill({
				status: 200,
				body: JSON.stringify({ "deleted": 1 })
			});
		} else {
			await route.continue();
		}
	});
}

const customDictionaryapi = [{ "word": "unknown-one", "phonetic": "/ˈphonetic1/", "phonetics": [{ "text": "/ˈphonetic2/" }, { "text": "/ˈphonetic3/" }], "meanings": [{ "partOfSpeech": "part1", "definitions": [{ "definition": "definition1" }, { "definition": "definition2" }] }, { "partOfSpeech": "part2", "definitions": [{ "definition": "definition3", "example": "example3" }] }] }, { "word": "unknown-one", "phonetics": [{ "text": "/ˈphonetic4/" }], "meanings": [{ "partOfSpeech": "part3", "definitions": [{ "definition": "definition4" }] }] }];

async function mockDictionaryAPI(page) {
	await page.route('*/**/api/words/*/dictionary/dictionaryapi', async route => {
		await route.fulfill({
			body: JSON.stringify(customDictionaryapi)
		});
	});
}

async function mockEmptyDictionaryAPI(page) {
	await page.route('*/**/api/words/*/dictionary/dictionaryapi', async route => {
		await route.fulfill({
			status: 204,
			body: JSON.stringify([])
		});
	});
}

async function mockDictionaryapiAPI(page) {
	await page.route('https://api.dictionaryapi.dev/api/v2/entries/en/*', async route => {
		await route.fulfill({
			body: JSON.stringify(customDictionaryapi)
		});
	});
}

// #endregion

// #region Tests

test.beforeEach(async ({ page, context }) => {
	await mockWordsAPI(page);
	await mockDictionaryAPI(page);
	await context.grantPermissions(['microphone', 'clipboard-read', 'clipboard-write']);
	await mockAudioRecording(page);
	await addSpyFlagsForAudioPlay(page);
	await addSpyFlagsForTTScall(page);
	await page.goto('/cards');
});

test('cards page has expected components', async ({ page }) => {
	await expect(page.locator('#word-card')).toBeVisible();
	await expect(page.locator('#words-all')).toBeVisible();
});

test('empty table', async ({ page }) => {
	await mockEmptyWordsAPI(page);
	await page.reload();
	await expect(page.locator('#word-card h2')).toHaveText("word");
	const url = new URL(page.url());
	expect(url.searchParams.get('id')).toBeNull();
});

test('default card', async ({ page }) => {
	await expect(page.locator('#word-card h2')).toHaveText("unknown-one");
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation.getByRole('button', { name: 'Listen to pronunciation' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeDisabled();
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Next word' })).toBeEnabled();
	await expect(cardNavigation.getByRole('button', { name: 'Previous word' })).toBeEnabled();
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).toBeEnabled();
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).not.toBeVisible();
});

test('select unknown card', async ({ page }) => {
	await page.locator('#words-all').getByRole('row', { name: 'learned-one' }).click();
	await expect(page.locator('#word-card h2')).toHaveText("learned-one");
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation.getByRole('button', { name: 'Listen to pronunciation' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeDisabled();
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Next word' })).toBeEnabled();
	await expect(cardNavigation.getByRole('button', { name: 'Previous word' })).toBeEnabled();
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).not.toBeVisible();
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).toBeEnabled();
});

test('cards navigation using next and previous buttons', async ({ page }) => {
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText("unknown-one");
	const buttonNext = page.locator('#word-card .card-navigation').getByRole('button', { name: 'Next word' });
	await buttonNext.click();
	await expect(cardTitle).toHaveText("unknown-two");
	await buttonNext.click();
	await expect(cardTitle).toHaveText("learned-one");
	await buttonNext.click();
	await expect(cardTitle).toHaveText("learned-two");
	await buttonNext.click();
	await expect(cardTitle).toHaveText("learned-two");
	const buttonPrevious = page.locator('#word-card .card-navigation').getByRole('button', { name: 'Previous word' });
	await buttonPrevious.click();
	await expect(cardTitle).toHaveText("learned-one");
	await buttonPrevious.click();
	await expect(cardTitle).toHaveText("unknown-two");
	await buttonPrevious.click();
	await expect(cardTitle).toHaveText("unknown-one");
	await buttonPrevious.click();
	await expect(cardTitle).toHaveText("unknown-one");
});

test('cards navigation using arrows on keyboard', async ({ page }) => {
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText("unknown-one");
	await page.keyboard.press('ArrowRight');
	await expect(cardTitle).toHaveText("unknown-two");
	await page.keyboard.press('ArrowDown');
	await expect(cardTitle).toHaveText("learned-one");
	await page.keyboard.press('ArrowRight');
	await expect(cardTitle).toHaveText("learned-two");
	await page.keyboard.press('ArrowDown');
	await expect(cardTitle).toHaveText("learned-two");
	await page.keyboard.press('ArrowLeft');
	await expect(cardTitle).toHaveText("learned-one");
	await page.keyboard.press('ArrowUp');
	await expect(cardTitle).toHaveText("unknown-two");
	await page.keyboard.press('ArrowLeft');
	await expect(cardTitle).toHaveText("unknown-one");
	await page.keyboard.press('ArrowUp');
	await expect(cardTitle).toHaveText("unknown-one");
});

test('recording pronunciation using record buttons', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await cardPronunciation.getByRole('button', { name: 'Start recording' }).click();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toBeEnabled();
	await page.waitForTimeout(100);
	const text = await cardPronunciation.getByRole('button', { name: 'Stop recording' }).textContent();
	expect(text).toMatch(/^0\.1[0-5]?$/);
	await cardPronunciation.getByRole('button', { name: 'Stop recording' }).click();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
});

test('recording pronunciation using R on keyboard', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toBeEnabled();
	await page.waitForTimeout(100);
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toHaveText('0.10');
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
});

test('recorded pronunciation is binded to word', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toBeEnabled();
	await page.waitForTimeout(100);
	const text = await cardPronunciation.getByRole('button', { name: 'Stop recording' }).textContent();
	expect(text).toMatch(/^0\.1[0-5]?$/);
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
	await page.keyboard.press('ArrowDown');
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeDisabled();
	await page.keyboard.press('ArrowUp');
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
});

test('recording stops after 5 seconds', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toBeEnabled();
	await page.waitForTimeout(4900);
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).toHaveText('4.90');
	await page.waitForTimeout(100);
	await expect(cardPronunciation.getByRole('button', { name: 'Stop recording' })).not.toBeVisible();
	await expect(cardPronunciation.getByRole('button', { name: 'Start recording' })).toBeEnabled();
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
});

test('play recorded audio using play button', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('R');
	await page.waitForTimeout(100);
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
	// Reset the flag and add a small delay
	await page.evaluate(() => window.__audioWasPlayed = false);
	await page.waitForTimeout(50);
	// Play recorded audio
	await cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' }).click();
	// Wait for the spy flag to be updated
	await page.waitForFunction(() => window.__audioWasPlayed === true, {
		timeout: 5000
	});
	const isAudioPlaying = await page.evaluate(() => window.__audioWasPlayed);
	expect(isAudioPlaying).toBeTruthy();
});

test('play recorded audio using P on keyboard', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('R');
	await page.waitForTimeout(100);
	await page.keyboard.press('R');
	await expect(cardPronunciation.getByRole('button', { name: 'Play recorded pronunciation' })).toBeEnabled();
	// Reset the flag and add a small delay
	await page.evaluate(() => window.__audioWasPlayed = false);
	await page.waitForTimeout(50);
	// Play recorded audio
	await page.keyboard.press('P');
	// Wait for the spy flag to be updated
	await page.waitForFunction(() => window.__audioWasPlayed === true, {
		timeout: 5000
	});
	const isAudioPlaying = await page.evaluate(() => window.__audioWasPlayed);
	expect(isAudioPlaying).toBeTruthy();
});

test('listen to pronunciation using listen button', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await cardPronunciation.getByRole('button', { name: 'Listen to pronunciation' }).click()
	const isTtsCalled = await page.evaluate(() => window.__ttsCalled);
	expect(isTtsCalled).toBeTruthy();
});

test('listen to pronunciation using Space on keyboard', async ({ page }) => {
	const cardPronunciation = page.locator('#word-card .card-pronunciation');
	await expect(cardPronunciation).toBeVisible();
	await page.keyboard.press('Space');
	const isTTScalled = await page.evaluate(() => window.__ttsCalled);
	expect(isTTScalled).toBeTruthy();
});

test('mark as known on card', async ({ page }) => {
	const word = "unknown-one";
	const wordNext = "unknown-two";
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).toBeEnabled();
	await mockMarkAsKnownAPI(page);
	await cardNavigation.getByRole('button', { name: 'Mark as known' }).click();
	await expect(cardTitle).toHaveText(wordNext);
	const wordsAll = page.locator('#words-all table .word-row');
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).toBeChecked();
});

test('mark as known using Enter on keyboard', async ({ page }) => {
	const word = "unknown-one";
	const wordNext = "unknown-two";
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).toBeEnabled();
	await mockMarkAsKnownAPI(page);
	await page.keyboard.press('Enter');
	await expect(cardTitle).toHaveText(wordNext);
	const wordsAll = page.locator('#words-all table .word-row');
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).toBeChecked();
});

test('mark as known on table', async ({ page }) => {
	const word = "unknown-one";
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).toBeEnabled();
	await mockMarkAsKnownAPI(page);
	const wordsAll = page.locator('#words-all table .word-row');
	wordsAll.filter({ hasText: word }).locator("input.checkbox").click();
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).toBeChecked();
	await expect(cardTitle).toHaveText(word);
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).toBeEnabled();
});

test('reset learning on card', async ({ page }) => {
	const word = "learned-one";
	const wordNext = "learned-two";
	await page.locator('#words-all').getByRole('row', { name: word }).click();
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).toBeEnabled();
	await mockResetLearningAPI(page);
	await cardNavigation.getByRole('button', { name: 'Reset learning' }).click();
	await expect(cardTitle).toHaveText(wordNext);
	const wordsAll = page.locator('#words-all table .word-row');
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).not.toBeChecked();
});

test('reset learning using Enter on keyboard', async ({ page }) => {
	const word = "learned-one";
	const wordNext = "learned-two";
	await page.locator('#words-all').getByRole('row', { name: word }).click();
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).toBeEnabled();
	await mockResetLearningAPI(page);
	await page.keyboard.press('Enter');
	await expect(cardTitle).toHaveText(wordNext);
	const wordsAll = page.locator('#words-all table .word-row');
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).not.toBeChecked();
});

test('reset learning on table', async ({ page }) => {
	const word = "learned-one";
	await page.locator('#words-all').getByRole('row', { name: word }).click();
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(word);
	const cardNavigation = page.locator('#word-card .card-navigation');
	await expect(cardNavigation.getByRole('button', { name: 'Reset learning' })).toBeEnabled();
	await mockResetLearningAPI(page);
	const wordsAll = page.locator('#words-all table .word-row');
	wordsAll.filter({ hasText: word }).locator("input.checkbox").click();
	await expect(wordsAll.filter({ hasText: word }).locator("input.checkbox")).not.toBeChecked();
	await expect(cardTitle).toHaveText(word);
	await expect(cardNavigation.getByRole('button', { name: 'Mark as known' })).toBeEnabled();
});

test('copy words from table with all words', async ({ page }) => {
	await page.locator('#words-all').getByRole('button', { name: 'Copy to clipboard' }).click();
	const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboardContent).toBe("unknown-one\nunknown-two\nlearned-one\nlearned-two");
	await expect(page.locator('.toast .alert-success').last()).toHaveText('Copied to clipboard');
});

test('word info from db', async ({ page }) => {
	await page.getByRole('button', { name: 'Open word dictionary info' }).click();
	await expect(page.locator('#dictionary-info')).toBeVisible();
	await expect(page.locator('#dictionary-info h3')).toHaveText("unknown-one");
	await expect(page.locator('#dictionary-info .phonetics')).toHaveText("/ˈphonetic1/ /ˈphonetic2/ /ˈphonetic3/ /ˈphonetic4/");

	const meanings = page.locator('#dictionary-info .meaning');
	await expect(meanings).toHaveCount(3);

	await expect(meanings.nth(0).locator('.part-of-speech')).toHaveText("part1");
	await expect(meanings.nth(0).locator('.definition')).toHaveCount(2);
	await expect(meanings.nth(0).locator('.example')).toHaveCount(0);
	await expect(meanings.nth(0).locator('.definition').nth(0)).toHaveText("definition1");
	await expect(meanings.nth(0).locator('.definition').nth(1)).toHaveText("definition2");

	await expect(meanings.nth(1).locator('.part-of-speech')).toHaveText("part2");
	await expect(meanings.nth(1).locator('.definition')).toHaveCount(1);
	await expect(meanings.nth(1).locator('.example')).toHaveCount(1);
	await expect(meanings.nth(1).locator('.definition')).toHaveText("definition3 (example3)");
	await expect(meanings.nth(1).locator('.example')).toHaveText("(example3)");

	await expect(meanings.nth(2).locator('.part-of-speech')).toHaveText("part3");
	await expect(meanings.nth(2).locator('.definition')).toHaveCount(1);
	await expect(meanings.nth(2).locator('.example')).toHaveCount(0);
	await expect(meanings.nth(2).locator('.definition').nth(0)).toHaveText("definition4");
});

test('word info from dictionaryapi', async ({ page }) => {
	await mockWordsAPI(page);
	await mockEmptyDictionaryAPI(page);
	await mockDictionaryapiAPI(page);
	await page.reload();

	await page.getByRole('button', { name: 'Open word dictionary info' }).click();
	await expect(page.locator('#dictionary-info')).toBeVisible();
	await expect(page.locator('#dictionary-info h3')).toHaveText("unknown-one");
	await expect(page.locator('#dictionary-info .phonetics')).toHaveText("/ˈphonetic1/ /ˈphonetic2/ /ˈphonetic3/ /ˈphonetic4/");

	const meanings = page.locator('#dictionary-info .meaning');
	await expect(meanings).toHaveCount(3);

	await expect(meanings.nth(0).locator('.part-of-speech')).toHaveText("part1");
	await expect(meanings.nth(0).locator('.definition')).toHaveCount(2);
	await expect(meanings.nth(0).locator('.example')).toHaveCount(0);
	await expect(meanings.nth(0).locator('.definition').nth(0)).toHaveText("definition1");
	await expect(meanings.nth(0).locator('.definition').nth(1)).toHaveText("definition2");

	await expect(meanings.nth(1).locator('.part-of-speech')).toHaveText("part2");
	await expect(meanings.nth(1).locator('.definition')).toHaveCount(1);
	await expect(meanings.nth(1).locator('.example')).toHaveCount(1);
	await expect(meanings.nth(1).locator('.definition')).toHaveText("definition3 (example3)");
	await expect(meanings.nth(1).locator('.example')).toHaveText("(example3)");

	await expect(meanings.nth(2).locator('.part-of-speech')).toHaveText("part3");
	await expect(meanings.nth(2).locator('.definition')).toHaveCount(1);
	await expect(meanings.nth(2).locator('.example')).toHaveCount(0);
	await expect(meanings.nth(2).locator('.definition').nth(0)).toHaveText("definition4");
});

test('close word info', async ({ page }) => {
	await page.getByRole('button', { name: 'Open word dictionary info' }).click();
	await expect(page.locator('#dictionary-info')).toBeVisible();

	await page.getByRole('button', { name: 'Close word dictionary info' }).click();
	await expect(page.locator('#dictionary-info')).not.toBeVisible();
});

test('empty word info', async ({ page }) => {
	await mockWordsAPI(page);
	await mockEmptyDictionaryAPI(page);
	await page.reload();

	await page.getByRole('button', { name: 'Open word dictionary info' }).click();
	await expect(page.locator('#dictionary-info')).toBeVisible();

	await expect(page.locator('#dictionary-info h3')).toHaveText("unknown-one");
	await expect(page.locator('#dictionary-info .phonetics')).toContainText("[no phonetic found]");
	await expect(page.locator('#dictionary-info .meaning')).toHaveCount(1);
	await expect(page.locator('#dictionary-info .meaning')).toHaveText("[no definition found]");
});

test('500 error handling on mark as known', async ({ page }) => {
	await expect(page.locator('#word-card h2')).toHaveText("unknown-one");
	const cardNavigation = page.locator('#word-card .card-navigation');
	await page.route('*/**/api/words*', async route => {
		await route.fulfill({
			status: 500
		});
	});
	await cardNavigation.getByRole('button', { name: 'Mark as known' }).click();
	await expect(page.locator('.toast .alert-error')).toHaveText('Failed to save words');
});

test('open page with id of word in params', async ({ page }) => {
	const cardTitle = page.locator('#word-card h2');
	const word = customWords[1];
	await page.goto(`/cards?id=${word.id}`);
	await expect(cardTitle).toHaveText(word.word);
});

test('open page with non-existing id of word in params', async ({ page }) => {
	const word = customWords[1];
	await page.goto(`/cards?id=test`);
	await expect(page.locator('#word-card h2')).toHaveText(customWords[0].word);
});

test('open page without id param', async ({ page }) => {
	const cardTitle = page.locator('#word-card h2');
	const word = customWords[0];
	await expect(cardTitle).toHaveText(word.word);
	const url = new URL(page.url());
	expect(url.searchParams.get('id')).toBe(word.id.toString());
});

test('change id param in url when selecting next word', async ({ page }) => {
	const cardTitle = page.locator('#word-card h2');
	await expect(cardTitle).toHaveText(customWords[0].word);
	await page.keyboard.press('ArrowDown');
	await expect(cardTitle).toHaveText(customWords[1].word);
	const url = new URL(page.url());
	expect(url.searchParams.get('id')).toBe(customWords[1].id.toString());
});

test('change id param in url when deleting word', async ({ page }) => {
	await mockDeleteWordAPI(page);
	const cardTitle = page.locator('#word-card h2');
	const deletedWord = customWords[0];
	const nextWord = customWords[1];
	await expect(cardTitle).toHaveText(deletedWord.word);
	await deleteWord(page, deletedWord.word);
	await expect(cardTitle).toHaveText(nextWord.word);
	const url = new URL(page.url());
	expect(url.searchParams.get('id')).toBe(nextWord.id.toString());
});

test('change id param in url when deleting all words', async ({ page }) => {
	await mockDeleteWordAPI(page);
	const cardTitle = page.locator('#word-card h2');
	for (const word of customWords) await deleteWord(page, word.word);
	await expect(cardTitle).toHaveText("word");
	const url = new URL(page.url());
	expect(url.searchParams.get('id')).toBeNull();
});

// #endregion