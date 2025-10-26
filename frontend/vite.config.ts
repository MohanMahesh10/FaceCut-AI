import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const basePath = runtimeEnv.BASE_PATH ?? (runtimeEnv.NODE_ENV === 'production' ? '/FaceCut-AI' : '');

export default defineConfig({
	plugins: [sveltekit()],
	base: basePath,
	server: {
		proxy: {
			'/uploadimage': {
				target: 'http://127.0.0.1:8000',
				changeOrigin: true,
				secure: false
			},
			'/haircuts': {
				target: 'http://127.0.0.1:8000',
				changeOrigin: true,
				secure: false
			}
		}
	}
});