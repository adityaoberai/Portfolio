import type { Cookies } from '@sveltejs/kit';

export type Mode = 'world' | 'index';

const COOKIE = 'mode';
const ONE_YEAR = 60 * 60 * 24 * 365;

// First-time visitors get World.
export function readMode(cookies: Cookies): Mode {
	return cookies.get(COOKIE) === 'index' ? 'index' : 'world';
}

// Explicit /world and /index visits win over the cookie, then become the preference.
export function rememberMode(cookies: Cookies, url: URL, mode: Mode) {
	if (cookies.get(COOKIE) === mode) return;
	cookies.set(COOKIE, mode, {
		path: '/',
		maxAge: ONE_YEAR,
		sameSite: 'lax',
		httpOnly: true,
		// SvelteKit only relaxes `secure` for http://localhost; honour plain-HTTP previews too.
		secure: url.protocol === 'https:'
	});
}
