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
	},
	{
		id: 'corkboard',
		number: '05',
		object: 'Corkboard',
		short: 'corkboard',
		area: 'Community',
		world: 'gather',
		summary: 'Tickets, photos, and notes from the communities I’ve helped build.',
		...link('community')
	},
	{
		id: 'lanyards',
		number: '06',
		object: 'Conference wall',
		short: 'conference wall',
		area: 'Speaking',
		world: 'speak',
		summary: 'Lanyards and badges from DevRelCon, All Things Open, RenderATL, and more.',
		...link('speaking')
	},
	{
		id: 'mirror',
		number: '07',
		object: 'Mirror',
		short: 'mirror',
		area: 'About',
		world: 'personal',
		summary: 'Who I am, how I got here, and what I care about.',
		...link('about')
	},
	{
		id: 'window',
		number: '08',
		object: 'Window',
		short: 'window',
		area: 'Now',
		world: 'personal',
		summary: 'Bengaluru outside; what I’m up to right now.',
		...link('now')
	},
	{
		id: 'door',
		number: '09',
		object: 'Door',
		short: 'door',
		area: 'Elsewhere & contact',
		world: 'personal',
		summary: 'GitHub, LinkedIn, the newsletter, Pexels, Collectr, and how to reach me.',
		...link('contact')
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
	},
	mug: {
		label: 'Superman mug',
		line: 'A Superman mug. I once wrote a whole essay about why he still matters.'
	},
	suitcase: {
		label: 'Suitcase',
		line: 'Luggage tags from Yokohama, London, Toronto, and Atlanta. Still room for more.'
	},
	football: {
		label: 'Football',
		line: 'A football by the door, a little scuffed. It has seen some games.'
	}
};
