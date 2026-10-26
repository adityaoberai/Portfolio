import { readMode } from '$lib/server/mode';

// `/` renders the visitor's preferred mode on the server, so there is no client-side flash.
export const prerender = false;

export function load({ cookies, setHeaders }) {
	setHeaders({ vary: 'Cookie', 'cache-control': 'private, no-cache' });
	return { mode: readMode(cookies) };
}
