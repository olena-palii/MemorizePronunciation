import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	reporter: [
		['html'],
		['@testomatio/reporter/playwright', {
			apiKey: process.env.TESTOMATIO,
		}]
	],
	projects: [
		{
			name: 'chromium',
		},
	],
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},

});