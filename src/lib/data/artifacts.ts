import { workThemes } from './work';
import { writingSamples } from './writing';
import { collection } from './collection';
import { photographs, pexelsProfile } from './photography';

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
	image?: string;
	href?: string;
	externalUrl?: string;
	featured?: boolean;
}

// Artifacts are views over the existing records, never copies of their facts.
const launches = workThemes[0].items[0];
export const deskArtifact: Artifact = {
	id: 'appwrite-launches',
	type: 'work',
	worlds: ['build', 'write', 'gather'],
	title: launches.title,
	description: launches.description,
	href: '/work#developer-relations',
	externalUrl: launches.link?.href,
	featured: true
};

const essay = writingSamples[0];
export const notebookArtifact: Artifact = {
	id: 'latest-essay',
	type: 'essay',
	worlds: ['write', 'personal'],
	title: essay.title,
	description: essay.description,
	date: essay.meta,
	externalUrl: essay.href,
	featured: true
};

const photo = photographs[0];
export const cameraArtifact: Artifact = {
	id: `photo-${photo.id}`,
	type: 'photo',
	worlds: ['photograph', 'personal'],
	title: photo.title,
	externalUrl: photo.href ?? pexelsProfile,
	featured: true
};

export const shelfArtifact: Artifact = {
	id: 'blastoise',
	type: 'collectible',
	worlds: ['collect', 'personal'],
	title: collection.favourite,
	description: `My favourite Pokémon, so it gets pride of place.`,
	externalUrl: collection.showcaseUrl,
	featured: true
};

export const artifacts: Artifact[] = [
	deskArtifact,
	notebookArtifact,
	cameraArtifact,
	shelfArtifact
];

export const collectionUrl = collection.showcaseUrl;
