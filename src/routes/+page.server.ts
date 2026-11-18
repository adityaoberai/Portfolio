import { readMode } from '$lib/server/mode';

// Serve the welcome or the visitor's preferred view in the initial HTML.
export const prerender = false;

export function load({ cookies, setHeaders }) {
	setHeaders({ vary: 'Cookie', 'cache-control': 'private, no-cache' });
	return { mode: readMode(cookies) };
}
