import { workThemes } from './work';

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

// First shared artifact. Keep the existing record as the factual source of truth.
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

export const artifacts: Artifact[] = [deskArtifact];

// Supplied by Aditya in the V3 brief; this is a showcase, not a local inventory.
export const collectionUrl =
	'https://app.getcollectr.com/showcase/profile/9dfbe594-7f0a-467d-98d2-77179903ec6b';
