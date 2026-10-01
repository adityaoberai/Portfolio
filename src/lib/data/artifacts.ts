import { cardImage, collection, favouriteCards } from './collection';
import { communityInitiatives } from './community';
import { photographs, photoSrc } from './photography';
import { podcasts } from './podcasts';
import { projects } from './projects';
import { talks } from './talks';
import { workThemes } from './work';
import { writingSamples } from './writing';

export type ArtifactType =
	| 'project'
	| 'work'
	| 'essay'
	| 'photo'
	| 'collectible'
	| 'talk'
	| 'community'
	| 'note';
export type World = 'build' | 'write' | 'gather' | 'speak' | 'photograph' | 'collect' | 'personal';

export interface Artifact {
	id: string;
	type: ArtifactType;
	worlds: World[];
	title: string;
	description?: string;
	date?: string;
	// Where it happened or what it belongs to: an event, a show, a theme, a place.
	context?: string;
	image?: string;
	/** Describes `image` when the title alone doesn't (card artwork). */
	imageAlt?: string;
	href?: string;
	externalUrl?: string;
	/** What following `externalUrl` gets you, when that matters (a recording, slides). */
	externalLabel?: string;
	featured?: boolean;
}

export const worldLabels: Record<World, string> = {
	build: 'Build',
	write: 'Write',
	gather: 'Gather',
	speak: 'Speak',
	photograph: 'Photograph',
	collect: 'Collect',
	personal: 'Personal'
};

const slug = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

// Artifacts are views over the existing records, never copies of their facts.
// Only the world tags below are new information, and an artifact may belong to several.
const themeWorlds: Record<string, World[]> = {
	'developer-relations': ['build', 'write'],
	'product-storytelling': ['write', 'build'],
	community: ['gather', 'build'],
	'developer-experience': ['build'],
	recognition: ['personal', 'build']
};
const talkWorlds: Record<string, World[]> = {
	RenderATL: ['speak', 'build', 'write'],
	'MCP Dev Summit Bengaluru': ['speak', 'build'],
	'All Things Open': ['speak', 'gather'],
	'Open Source Summit India': ['speak', 'gather'],
	'Analytics Vidhya DataHour': ['speak', 'build'],
	'ServerlessDays Bengaluru': ['speak', 'build'],
	'GitTogether Bengaluru': ['speak', 'gather'],
	'.NET Conf': ['speak', 'build'],
	'Global Azure Bengaluru': ['speak', 'build'],
	'DevRelCon Yokohama': ['speak', 'gather'],
	'DevRelCon London': ['speak', 'personal'],
	'DevRelCon Tokyo': ['speak', 'gather']
};
const communityWorlds: Record<string, World[]> = {
	'writers-room': ['gather', 'write', 'photograph'],
	'photo-walks': ['gather', 'photograph'],
	'doon-tech-community': ['gather'],
	'devrelcon-bengaluru': ['gather', 'speak'],
	hackon: ['gather', 'build']
};

const work: Artifact[] = workThemes.flatMap((theme) =>
	theme.items.map((item, i) => ({
		id: `work-${slug(item.title)}`,
		type: 'work' as const,
		worlds: themeWorlds[theme.slug] ?? ['build'],
		title: item.title,
		description: item.description,
		context: theme.title,
		date: theme.slug === 'recognition' ? item.tag : undefined,
		href: `/work#${theme.slug}`,
		externalUrl: item.link?.href,
		featured: theme.slug === 'developer-relations' && i === 0
	}))
);

const built: Artifact[] = projects.map((project) => ({
	id: `project-${project.slug}`,
	type: 'project',
	worlds: ['build'],
	title: project.name,
	description: project.overview,
	context: project.outcome,
	href: `/projects#${project.slug}`,
	externalUrl: project.links[0]?.href,
	featured: project.slug === 'relief-atl'
}));

const spoken: Artifact[] = [
	...talks.map((talk) => ({
		id: `talk-${slug(talk.event)}-${talk.year}`,
		type: 'talk' as const,
		worlds: talkWorlds[talk.event] ?? ['speak'],
		title: talk.title,
		description: talk.description,
		context: talk.event,
		date: String(talk.year),
		href: '/speaking',
		externalUrl: talk.recording ?? talk.slides,
		externalLabel: talk.recording
			? 'Watch the recording'
			: talk.slides
				? 'See the slides'
				: undefined,
		featured: talk.featured
	})),
	...podcasts.map((episode) => ({
		id: `podcast-${episode.year}-${slug(episode.title)}`,
		type: 'talk' as const,
		worlds: ['speak'] as World[],
		title: episode.title,
		context: episode.show,
		date: String(episode.year),
		href: '/speaking#podcasts',
		externalUrl: episode.url
	}))
];

const written: Artifact[] = writingSamples.map((essay, i) => ({
	id: `essay-${slug(essay.title)}`,
	type: 'essay',
	worlds: ['write', 'personal'],
	title: essay.title,
	description: essay.description,
	date: essay.meta,
	externalUrl: essay.href,
	featured: i === 0
}));

const photographed: Artifact[] = photographs.map((photo, i) => ({
	id: `photo-${photo.id}`,
	type: 'photo',
	worlds: ['photograph', 'personal'],
	title: photo.title,
	context: photo.place,
	image: photoSrc(photo, 800),
	externalUrl: photo.href,
	featured: i === 0
}));

const gathered: Artifact[] = communityInitiatives.map((initiative) => ({
	id: `community-${initiative.slug}`,
	type: 'community',
	worlds: communityWorlds[initiative.slug] ?? ['gather'],
	title: initiative.title,
	description: initiative.what,
	context: initiative.who,
	href: `/community#${initiative.slug}`,
	externalUrl: initiative.links?.[0]?.href,
	featured: initiative.slug === 'writers-room'
}));

const collected: Artifact[] = favouriteCards.map((card) => ({
	id: `collectible-${card.id}`,
	type: 'collectible',
	worlds: ['collect', 'personal'],
	title: card.name,
	description: card.note,
	context: `${card.set} · ${card.number}`,
	image: cardImage(card),
	imageAlt: card.alt,
	href: `/collection#${card.id}`,
	externalUrl: collection.showcaseUrl,
	featured: card.name === collection.favourite
}));

export const artifacts: Artifact[] = [
	...work,
	...built,
	...spoken,
	...written,
	...photographed,
	...gathered,
	...collected
];

export const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));

export function inWorld(world: World, type?: ArtifactType) {
	return artifacts.filter((a) => a.worlds.includes(world) && (!type || a.type === type));
}

export function ofType(type: ArtifactType) {
	return artifacts.filter((a) => a.type === type);
}

export const featured = artifacts.filter((a) => a.featured);

// The first artifact for each room object; stations and Index share these records.
export const deskArtifact = work[0];
export const notebookArtifact = written[0];
export const cameraArtifact = photographed[0];
export const shelfArtifact = collected[0];

export const collectionUrl = collection.showcaseUrl;
