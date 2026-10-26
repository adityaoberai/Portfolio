import { rememberMode } from '$lib/server/mode';

// Server-rendered on every request so the visit can set the mode preference.
export const prerender = false;

export function load({ cookies, url }) {
	rememberMode(cookies, url, 'index');
}
