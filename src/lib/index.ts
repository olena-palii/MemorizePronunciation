// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

// Place files you want to import through the `$lib` alias in this folder.

// Types
export { Word } from "./word";
export type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from "./dto";

// API
export * as apiWords from "./api/api-words";

// Utils
export { textToSpeech, startRecordingAudio, stopRecordingAudio, playRecordedAudio } from "./speech";

// Components
export { default as WordsTable } from './components/words-table.svelte';
export { default as Card } from './components/card.svelte';
export { default as AddWord } from './components/add-word.svelte';
export { default as Theme } from './components/theme.svelte';

// Icons
export { default as NavHomeIcon } from './icons/nav-home.svelte';
export { default as NavCardsIcon } from './icons/nav-cards.svelte';
export { default as NavCreateIcon } from './icons/nav-create.svelte';
export { default as ThemeLightIcon } from './icons/theme-light.svelte';
export { default as ThemeDarkIcon } from './icons/theme-dark.svelte';