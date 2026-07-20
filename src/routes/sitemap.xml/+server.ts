import { site } from '$lib/data/site';

export const prerender = true;

const pages = ['/', '/about', '/work', '/projects', '/community', '/speaking', '/contact'];

export function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `\t<url><loc>${site.url}${path}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
