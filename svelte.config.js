import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Node runtime: `/` is rendered per request from the mode cookie (see docs/room.md).
		adapter: adapter(),
		paths: {
			// Absolute asset URLs so the prerendered 404.html works from any URL depth
			relative: false
		}
	}
};

export default config;
