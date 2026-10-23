import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// The room's Three.js chunk (~545 KB raw, ~137 KB gzip) is lazy-loaded by World only;
		// its budget is tracked in v3.md, so Vite's generic 500 KB warning is noise.
		chunkSizeWarningLimit: 600
	}
});
