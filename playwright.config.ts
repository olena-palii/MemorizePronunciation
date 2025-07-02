import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	reporter: 'html',
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