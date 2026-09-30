import type { CuriosityId, StationId } from '$lib/world/layout';
import type { World } from './artifacts';
import { collection } from './collection';
import { sectionById, type SectionId } from './sections';

// What each object in the room means. Shared by the room, its DOM guide, and Index.
export interface Station {
	id: StationId;
	number: string;
	object: string;
	short: string;
	area: string;
	world: World;
	summary: string;
	section: SectionId;
	href: string;
	external: boolean;
}

// Deep links come from the shared section list.
const link = (section: SectionId) => ({
	section,
	href: sectionById[section].href,
	external: sectionById[section].external
});

export const stations: Station[] = [
	{
		id: 'desk',
		number: '01',
		object: 'Desk & computer',
		short: 'desk',
		area: 'Work & build',
		world: 'build',
		summary: 'Developer relations at Appwrite, launches, and things I’ve built.',
		...link('work')
	},
	{
		id: 'notebook',
		number: '02',
		object: 'Notebook & fountain pen',
		short: 'notebook',
		area: 'Writing',
		world: 'write',
		summary: 'Essays on home, friendship, and being human. Plus 140+ technical articles.',
		...link('writing')
	},
	{
		id: 'camera',
		number: '03',
		object: 'Fujifilm X-T30 II',
		short: 'camera',
		area: 'Photography',
		world: 'photograph',
		summary: 'Street, travel, and the moments between conference sessions.',
		...link('photography')
	},
	{
		id: 'shelf',
		number: '04',
		object: 'Pokémon shelf',
		short: 'Pokémon shelf',
		area: 'Collection',
		world: 'collect',
		summary: `Slabs, binders, and ${collection.favourite} in pride of place.`,
		...link('collection')
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
