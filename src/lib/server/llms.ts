import { about } from '$lib/data/about';
import { communityInitiatives } from '$lib/data/community';
import { now } from '$lib/data/now';
import { podcasts } from '$lib/data/podcasts';
import { identityProfiles } from '$lib/data/profile';
import { projectPagePath, projectPages, projects } from '$lib/data/projects';
import { sectionById, type SectionId } from '$lib/data/sections';
import { site } from '$lib/data/site';
import { speakingTopics, talkPagePath, talkPages, talkResources, talks } from '$lib/data/talks';
import { technicalWritingSamples, writingSamples } from '$lib/data/writing';
import { workThemes } from '$lib/data/work';

const link = (label: string, href: string) => `[${label}](${new URL(href, site.url).href})`;
const bullet = (label: string, href: string, description: string) =>
	`- ${link(label, href)}: ${description}`;
const sectionLinks = (ids: SectionId[]) =>
	ids.map((id) => {
		const { label, href, summary } = sectionById[id];
		return bullet(label, href, summary);
	});

const intro = [
	`# ${site.name}`,
	'',
	`> ${site.role}, based in ${site.location.city}, ${site.location.country}. Developer relations, technical writing, speaking, open source, and community building.`,
	''
];
const selectedArticles = technicalWritingSamples.map((article) =>
	bullet(
		article.title,
		article.href,
		`${article.kind}, published ${article.published} by ${site.name} on Appwrite. ${article.description}`
	)
);
const profiles = [
	bullet(
		'Appwrite author profile',
		identityProfiles.appwrite,
		'Role and published technical articles.'
	),
	bullet(
		'Microsoft MVP profile',
		identityProfiles.microsoftMvp,
		'Microsoft community recognition.'
	),
	bullet(
		'Sessionize speaker profile',
		identityProfiles.sessionize,
		'Speaker bio, topics, and session abstracts.'
	)
];
const resume = bullet('Resume (PDF)', site.resume, 'Career summary, roles, and recognition.');

export function llmsIndex() {
	return [
		...intro,
		about.intro,
		'',
		'## Profile and work',
		'',
		bullet(
			'On paper directory',
			'/index',
			'An introduction and links to each part of the portfolio.'
		),
		...sectionLinks([
			'about',
			'work',
			'projects',
			'speaking',
			'writing',
			'community',
			'now',
			'contact'
		]),
		resume,
		bullet(
			'Portfolio text export',
			'/llms-full.txt',
			'Biography, work, projects, talks, and writing in one file.'
		),
		'',
		'## Project case studies',
		'',
		...projectPages.map((project) =>
			bullet(project.name, projectPagePath(project.slug), project.overview)
		),
		'',
		'## Selected talks',
		'',
		...talkPages.map((talk) =>
			bullet(
				talk.title,
				talkPagePath(talk.detail.slug),
				`${talk.event} ${talk.year}. ${talk.description}`
			)
		),
		'',
		'## Selected technical writing',
		'',
		...selectedArticles,
		'',
		'## Other profiles',
		'',
		...profiles,
		'',
		'## Optional',
		'',
		...sectionLinks(['photography', 'collection']),
		bullet(
			'Personal essays',
			'https://oberai.blog',
			'The Curious Mind of Aditya Oberai, a personal newsletter.'
		),
		''
	].join('\n');
}

export function llmsFull() {
	return [
		...intro,
		`Portfolio: ${link(site.name, '/')} · ${link('Site directory', '/llms.txt')}`,
		'',
		'## About',
		'',
		link('About Aditya Oberai', '/about'),
		'',
		about.intro,
		'',
		about.journey.join('\n\n'),
		'',
		...profiles,
		'',
		'## Work and recognition',
		...workThemes.flatMap((theme) => [
			'',
			`### ${link(theme.title, `/work#${theme.slug}`)}`,
			'',
			theme.summary,
			'',
			...theme.items.map((item) => {
				const date = theme.slug === 'recognition' ? ` (${item.tag})` : '';
				const source = item.link ? ` ${link(item.link.label, item.link.href)}.` : '';
				return `- ${item.title}${date}: ${item.description}${source}`;
			})
		]),
		'',
		'## Projects',
		...projects.flatMap((project) => {
			const { detail } = project;
			const href = detail ? projectPagePath(project.slug) : `/projects#${project.slug}`;
			return [
				'',
				`### ${link(project.name, href)}`,
				'',
				...(detail ? [detail.period, ''] : []),
				project.overview,
				'',
				project.motivation,
				'',
				...(detail ? [detail.contribution, '', detail.approach, ''] : []),
				`Outcome: ${project.outcome}`,
				`Built with ${project.technologies.join(', ')}.`,
				'',
				...[...project.links, ...(detail?.sources ?? [])].map(
					(resource) => `- ${link(resource.label, resource.href)}`
				)
			];
		}),
		'',
		'## Speaking',
		'',
		link('Talk archive and speaker bio', '/speaking'),
		'',
		`Topics include ${speakingTopics.join(', ')}.`,
		...talks.flatMap((talk) => {
			const { detail } = talk;
			const title = detail ? link(talk.title, talkPagePath(detail.slug)) : talk.title;
			const location = detail ? ` · ${detail.location}` : '';
			const speakers = [site.name, ...(detail?.coSpeakers ?? [])].join(', ');
			return [
				'',
				`### ${title}`,
				'',
				`${talk.event} · ${talk.year}${location}. Speakers: ${speakers}.`,
				'',
				talk.description,
				'',
				...(detail ? [...detail.takeaways.map((takeaway) => `- ${takeaway}`), ''] : []),
				...talkResources(talk).map((resource) => `- ${link(resource.label, resource.href)}`)
			];
		}),
		'',
		'### Podcasts and streams',
		'',
		...podcasts.map((episode) =>
			bullet(episode.title, episode.url, `${episode.show}, ${episode.year}.`)
		),
		'',
		'## Writing',
		'',
		link('Writing portfolio', '/writing'),
		'',
		'### Selected technical writing',
		'',
		...selectedArticles,
		'',
		'### Personal essays',
		'',
		...writingSamples.map((essay) =>
			bullet(essay.title, essay.href, `${essay.meta}. ${essay.description}`)
		),
		'',
		'## Community',
		'',
		...communityInitiatives.map((initiative) =>
			bullet(initiative.title, `/community#${initiative.slug}`, initiative.what)
		),
		'',
		'## Now',
		'',
		link('Now page', '/now'),
		'',
		`Updated on ${now.updated}.`,
		'',
		...now.items.map((item) =>
			item.href ? bullet(item.label, item.href, item.text) : `- ${item.label}: ${item.text}`
		),
		'',
		'## Photography, collectibles, and contact',
		'',
		...sectionLinks(['photography', 'collection', 'contact']),
		resume,
		''
	].join('\n');
}
