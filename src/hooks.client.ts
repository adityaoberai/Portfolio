import type { ClientInit } from '@sveltejs/kit';
import { startTracking } from '$lib/analytics';

// Runs once before SvelteKit starts the browser app, including direct visits to any route.
export const init: ClientInit = () => {
	startTracking();
};
