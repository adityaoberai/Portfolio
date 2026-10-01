import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Portable Node runtime for the V3 spike; see the deployment decision in v3.md.
		adapter: adapter(),
		paths: {
			// Absolute asset URLs so the prerendered 404.html works from any URL depth
			relative: false
		}
	}
};

export default config;
