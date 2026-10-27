import { site } from '$lib/data/site';

const siteOrigin = new URL(site.url).origin;

// Identify the public destination independently of the room station that links to it.
export function linkDestinationId(href: string) {
	try {
		const url = new URL(href, siteOrigin);
		if (!['https:', 'http:'].includes(url.protocol)) return undefined;
		return `${url.origin === siteOrigin ? '' : url.origin}${url.pathname}${url.hash}`;
	} catch {
		return undefined;
	}
}

// Render the same link behavior on the server and client, including without JavaScript.
export function externalLinkAttrs(href?: string) {
	if (!href) return {};
	try {
		const url = new URL(href, siteOrigin);
		if (['https:', 'http:'].includes(url.protocol) && url.origin !== siteOrigin) {
			return { target: '_blank', rel: 'noopener' } as const;
		}
	} catch {
		// Leave malformed or unsupported destinations to the browser.
	}
	return {};
}
