import type { CuriosityId, StationId } from '$lib/world/layout';
import type { World } from './artifacts';
import { collection } from './collection';
import { pexelsProfile } from './photography';

// What each object in the room means. Shared by the room, its DOM guide, and Index.
export interface Station {
	id: StationId;
	number: string;
	object: string;
	short: string;
	area: string;
	world: World;
	summary: string;
	href: string;
	external: boolean;
}

export const stations: Station[] = [
	{
		id: 'desk',
		number: '01',
		object: 'Desk & computer',
		short: 'desk',
		area: 'Work & build',
		world: 'build',
		summary: 'Developer relations at Appwrite, launches, and things I’ve built.',
		href: '/work',
		external: false
	},
	{
		id: 'notebook',
		number: '02',
		object: 'Notebook & fountain pen',
		short: 'notebook',
		area: 'Writing',
		world: 'write',
		summary: 'Essays on home, friendship, and being human. Plus 140+ technical articles.',
		href: 'https://oberai.blog',
		external: true
	},
	{
		id: 'camera',
		number: '03',
		object: 'Fujifilm X-T30 II',
		short: 'camera',
		area: 'Photography',
		world: 'photograph',
		summary: 'Street, travel, and the moments between conference sessions.',
		href: pexelsProfile,
		external: true
	},
	{
		id: 'shelf',
		number: '04',
		object: 'Pokémon shelf',
		short: 'Pokémon shelf',
		area: 'Collection',
		world: 'collect',
		summary: `Slabs, binders, and ${collection.favourite} in pride of place.`,
		href: collection.showcaseUrl,
		external: true
	}
];

export const stationById = Object.fromEntries(stations.map((s) => [s.id, s])) as Record<
	StationId,
	Station
>;

// Small, true-to-the-room notes. Copy for Aditya to review; see HANDOVER.md.
export const curiosities: Record<CuriosityId, { label: string; line: string }> = {
	plush: {
		label: 'Blastoise plush',
		line: 'A Blastoise plush. The one on the shelf has competition.'
	}
};
