import { rememberMode } from '$lib/server/mode';

// Server-rendered on every request so the visit can set the mode preference.
export const prerender = false;

export function load({ cookies, url }) {
	// Following a legacy shared link opens a station without choosing a default view.
	if (url.searchParams.get('keep-mode') === '1') return;
	rememberMode(cookies, url, 'world');
}
