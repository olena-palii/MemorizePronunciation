// place files you want to import through the `$lib` alias in this folder.
export { Word } from "./word";
export type { WordDto, SaveStatisticsDto, DeleteStatisticsDto } from "./dto";
export * as apiWords from "./api/api-words";
export { playNativeAudio } from "./speech/textToSpeech";
export { default as WordsTable } from './components/words-table.svelte';
export { default as Card } from './components/card.svelte';
export { default as Loader } from './components/loader.svelte';
export { default as AddWord } from './components/add-word.svelte';