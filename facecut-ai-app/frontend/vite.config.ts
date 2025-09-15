import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '/FaceCut-AI' : ''),
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
