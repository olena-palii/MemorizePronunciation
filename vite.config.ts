import fs from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

const ip = '192.168.100.92'; // Replace with your local IP address
const keyPath = `certificate/${ip}-key.pem`;
const certPath = `certificate/${ip}.pem`;
const certExists = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		host: certExists ? ip : 'localhost',
		port: 5173,
		https: certExists ? {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath)
		} : undefined,
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