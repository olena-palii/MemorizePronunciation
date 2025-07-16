// Copyright 2025 Olena Palii
// SPDX-License-Identifier: Apache-2.0

// Place files you want to import through the `$lib` alias in this folder.

// Types
export { Word } from "./word";
export type { WordDto, SaveStatisticsDto, DeleteStatisticsDto, ToastDto, ToastType } from "./dto";
export { Toast } from "./toast";

// API
export * as apiWords from "./api/api-words";

// Utils
export { textToSpeech, startRecordingAudio, stopRecordingAudio, playRecordedAudio } from "./speech";
export { toasts, addToast } from "./toast";

// Components
export { default as WordsTable } from './components/words-table.svelte';
export { default as RecordingButton } from './components/recording-button.svelte';
export { default as Card } from './components/card.svelte';
export { default as AddWord } from './components/add-word.svelte';
export { default as Theme } from './components/theme.svelte';
export { default as CopyButton } from './components/copy-button.svelte';
export { default as ToastAlert } from './components/toast-alert.svelte';

// Icons
export { default as NavHomeIcon } from './icons/nav-home.svelte';
export { default as NavCardsIcon } from './icons/nav-cards.svelte';
export { default as NavCreateIcon } from './icons/nav-create.svelte';
export { default as ThemeLightIcon } from './icons/theme-light.svelte';
export { default as ThemeDarkIcon } from './icons/theme-dark.svelte';
export { default as WordDeleteIcon } from './icons/word-delete.svelte';
export { default as WordListenIcon } from './icons/word-listen.svelte';
export { default as WordRecordIcon } from './icons/word-record.svelte';
export { default as WordPlayIcon } from './icons/word-play.svelte';
export { default as CopyIcon } from './icons/copy.svelte';
export { default as ToastCloseIcon } from './icons/toast-close.svelte';