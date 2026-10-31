import { about } from '$lib/data/about';
import { identityProfiles } from '$lib/data/identity';
import { sections } from '$lib/data/sections';
import { site } from '$lib/data/site';
import { technicalWritingSamples } from '$lib/data/writing';

export const prerender = true;

export function GET() {
	const primary = [
		'about',
		'work',
		'projects',
		'speaking',
		'writing',
		'community',
		'now',
		'contact'
	];
	const optional = ['photography', 'collection'];
	const sectionLinks = (ids: string[]) =>
		ids.map((id) => {
			const section = sections.find((section) => section.id === id)!;
			return `- [${section.label}](${site.url}${section.href}): ${section.summary}`;
		});
	const text = [
		`# ${site.name}`,
		'',
		`> ${site.role}, based in Bengaluru, India. Developer relations, technical writing, speaking, open source, and community building.`,
		'',
		about.intro,
		'',
		`The canonical site is ${site.url}/. The homepage is an interactive room; its mirror opens the introduction also published on /about. The On paper directory and individual content pages are readable without JavaScript.`,
		'',
		'## Profile and work',
		'',
		`- [On paper directory](${site.url}/index): A conventional introduction and links to every section.`,
		...sectionLinks(primary),
		`- [Resume (PDF)](${site.url}${site.resume}): The formal career summary.`,
		'',
		'## Selected technical writing',
		'',
		...technicalWritingSamples.map(
			(article) =>
				`- [${article.title}](${article.href}): ${article.kind}, published ${article.published} by ${site.name} on Appwrite. ${article.description}`
		),
		'',
		'## Other profiles',
		'',
		`- [Appwrite author profile](${identityProfiles.appwrite}): Role and published technical articles.`,
		`- [Microsoft MVP profile](${identityProfiles.microsoftMvp}): Microsoft community recognition.`,
		`- [Sessionize speaker profile](${identityProfiles.sessionize}): Speaker bio, topics, and session abstracts.`,
		'',
		'## Optional',
		'',
		...sectionLinks(optional),
		'- [Personal essays](https://oberai.blog): The Curious Mind of Aditya Oberai, a personal newsletter.',
		''
	].join('\n');

	return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
