import fs from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { certExpiresSoon, generateCert, keyPath, certPath } from './certificate.js';

const certExists = fs.existsSync(certPath) && fs.existsSync(keyPath);
if (!certExists || certExpiresSoon(certPath)) generateCert();

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		host: 'localhost',
		port: 5173,
		https: {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath)
		}
	},
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});