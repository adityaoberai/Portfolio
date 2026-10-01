// ─────────────────────────────────────────────────────────────────────────────
// THE ROOM'S CONTENT. Edit this file to change what World says and shows.
//
// page        Title, hints, menu, loading and failure copy.
// stations    The objects you can inspect. Order here = order in the menu and
//             numbering (01, 02, …). `hidden: true` switches one off: it leaves
//             the menu and can't be clicked, but stays in the room as decor.
// panel       What opens when a station is inspected: a title, an optional
//             lead, then any number of `blocks`, stacked in order, then
//             `links`. Mix blocks freely; any station can use any block.
// curiosities One-line notes on the small objects.
//
// BLOCKS (see the `Block` type below for every option)
//   items    A list of artifacts. `style`: 'list' | 'pages' | 'pins' | 'badges'
//            | 'photos' | 'cards'. `items` takes artifact ids and/or queries such as
//            { type: 'photo', limit: 6 } or { type: 'talk', featured: true }.
//            `show` toggles description / date / context / link per item;
//            `linkLabel` sets the link text, `linkTo` where it goes ('external',
//            'page', or 'either'); `heading` adds a subheading.
//   feature  One artifact, as a highlighted 'card' or an inline 'aside'.
//   slab     A graded card slab for a collectible, showing its card image.
//            Cards themselves (names, sets, images) live in collection.ts.
//   profile  Portrait beside a paragraph.
//   text     A paragraph. `{time}` becomes the current time in Bengaluru.
//   tags     A row of small labels.
//   list     Titled points ({ title, text }).
//   facts    Label / value rows, optionally linked.
//   contact  An email address and a list of places.
//   links    A row of links, anywhere in the panel.
//
// Run `npm run content` to list every artifact id and query field. Facts
// (projects, talks, essays, photos, …) live in their own files in this folder;
// this file only chooses and frames them. A typo in an id or an empty query
// fails the build and `npm test` with a message naming the station and block.
// Positions and 3D objects live in src/lib/world/ (layout.ts, build.ts).
// ─────────────────────────────────────────────────────────────────────────────

import type { ArtifactType, World } from './artifacts';
import type { SectionId } from './sections';
import type { CuriosityId, StationId } from '../world/layout';
import { about } from './about';
import { collection } from './collection';
import { socialLinks, sponsorLink } from './links';
import { now } from './now';
import { cameraBody, pexelsProfile, photoPlaces } from './photography';
import { site } from './site';
import { talks } from './talks';
import { workThemes } from './work';

/** An artifact id, or a query over artifacts (fields combine with AND). */
export type Pick =
	| string
	| {
			type?: ArtifactType;
			world?: World;
			/** Matches the artifact's context: a work theme, talk event, photo place, … */
			context?: string;
			featured?: boolean;
			/** Skip this many matches first. */
			offset?: number;
			limit?: number;
	  };

/** A link. Omit `href` to link to the station's section. */
export interface Link {
	label: string;
	href?: string;
}

export type ItemStyle = 'list' | 'pages' | 'pins' | 'badges' | 'photos' | 'cards';

/** Where an item's link goes: its external source, its page on this site, or whichever exists. */
export type LinkTo = 'external' | 'page' | 'either';

export type Block =
	| {
			type: 'items';
			style: ItemStyle;
			items: Pick[];
			heading?: string;
			/** Which parts of each item to show. Defaults suit each style. */
			show?: { description?: boolean; date?: boolean; context?: boolean; link?: boolean };
			/** Text for each item's link; defaults to the item's own label or "Take a look". */
			linkLabel?: string;
			/** Defaults: 'page' for pins, 'external' for list and badges, 'either' otherwise. */
			linkTo?: LinkTo;
	  }
	| {
			type: 'feature';
			item: string;
			style?: 'card' | 'aside';
			kicker?: string;
			linkLabel?: string;
			/** Defaults to 'external'. */
			linkTo?: LinkTo;
	  }
	| { type: 'slab'; item: string; caption?: string }
	| { type: 'profile'; text: string; portrait?: boolean }
	| { type: 'text'; text: string }
	| { type: 'tags'; tags: string[] }
	| { type: 'list'; heading?: string; items: { title: string; text: string }[] }
	| { type: 'facts'; heading?: string; rows: { label: string; text: string; href?: string }[] }
	| { type: 'contact'; email?: string; places: { label: string; detail: string; href: string }[] }
	| { type: 'links'; links: Link[] };

export interface Panel {
	/** Replaces the default "01 / Desk & computer · Work & build" line. */
	eyebrow?: string;
	title: string;
	/** Supports `{time}`. */
	lead?: string;
	blocks: Block[];
	/** Links at the bottom of the panel. */
	links?: Link[];
}

export interface StationConfig {
	id: StationId;
	/** Name of the object, e.g. "Desk & computer". */
	object: string;
	/** Used in "Inspect the …" and announcements. */
	short: string;
	/** What the object stands for, e.g. "Work & build". */
	area: string;
	world: World;
	/** One line in the menu. */
	summary: string;
	/** Deep page the station links to. */
	section: SectionId;
	hidden?: boolean;
	panel: Panel;
}

export interface WorldConfig {
	page: {
		description: string;
		eyebrow: string;
		title: string;
		hint: {
			idleKicker: string;
			idleTitle: string;
			idleKeys: string;
			idleTouch: string;
			nearKeys: string;
			nearTouch: string;
		};
		menuTitle: string;
		menuFoot: string;
		indexLink: string;
		loading: { title: string; text: string };
		failed: { title: string; text: string };
	};
	stations: StationConfig[];
	curiosities: Record<CuriosityId, { label: string; line: string }>;
}

export const world: WorldConfig = {
	page: {
		description:
			"Come spend a minute in Aditya Oberai's world. A small, warm room to explore, with an accessible Index a click away.",
		eyebrow: "Aditya's room · Bengaluru",
		title: 'Come spend a minute in my world.',
		hint: {
			idleKicker: 'Start anywhere',
			idleTitle: 'Walk up to something.',
			idleKeys: 'or arrows to walk, or open the menu.',
			idleTouch: 'Tap the floor to walk, or open the menu.',
			nearKeys: 'to look closer',
			nearTouch: 'Tap it to look closer'
		},
		menuTitle: 'In the room',
		menuFoot: 'A work in progress, just like the person who lives here.',
		indexLink: "Prefer a list? Here's the Index →",
		loading: {
			title: 'Opening the room…',
			text: 'A small space for the things I make and care about.'
		},
		failed: {
			title: 'The room couldn’t open here.',
			text: 'Everything in it is still in the menu, and in the Index.'
		}
	},

	stations: [
		{
			id: 'desk',
			object: 'Desk & computer',
			short: 'desk',
			area: 'Work & build',
			world: 'build',
			summary: 'Developer relations at Appwrite, launches, and things I’ve built.',
			section: 'work',
			panel: {
				title: site.role,
				lead: workThemes[0].summary,
				blocks: [
					{
						type: 'items',
						style: 'list',
						items: [
							'work-product-launches',
							'work-ai-driven-content-processes',
							'work-documentation-and-website-ownership'
						]
					},
					{ type: 'feature', kicker: 'Recently built', item: 'project-relief-atl' }
				],
				links: [
					{ label: 'More about my work', href: '/work#developer-relations' },
					{ label: 'All projects', href: '/projects' }
				]
			}
		},
		{
			id: 'notebook',
			object: 'Notebook & fountain pen',
			short: 'notebook',
			area: 'Writing',
			world: 'write',
			summary: 'Essays on home, friendship, and being human. Plus 140+ technical articles.',
			section: 'writing',
			panel: {
				title: 'Pages from the notebook',
				lead: 'The personal essays live on oberai.blog; the professional writing lives on the Appwrite blog.',
				blocks: [
					{ type: 'items', style: 'pages', items: [{ type: 'essay', limit: 3 }] },
					{
						type: 'feature',
						style: 'aside',
						item: 'work-140-published-articles',
						linkLabel: 'On the Appwrite blog'
					}
				],
				links: [{ label: 'All my writing' }, { label: 'oberai.blog', href: 'https://oberai.blog' }]
			}
		},
		{
			id: 'camera',
			object: cameraBody,
			short: 'camera',
			area: 'Photography',
			world: 'photograph',
			summary: 'Street, travel, and the moments between conference sessions.',
			section: 'photography',
			panel: {
				title: cameraBody,
				lead: 'Street, travel, and the moments between conference sessions.',
				blocks: [
					{
						type: 'tags',
						tags: [cameraBody, ...photoPlaces.filter((place): place is string => Boolean(place))]
					},
					{ type: 'items', style: 'photos', items: [{ type: 'photo', limit: 6 }] }
				],
				links: [
					{ label: 'All photographs' },
					{ label: 'The full archive on Pexels', href: pexelsProfile }
				]
			}
		},
		{
			id: 'shelf',
			object: 'Pokémon shelf',
			short: 'Pokémon shelf',
			area: 'Collection',
			world: 'collect',
			summary: `Slabs, binders, and ${collection.favourite} in pride of place.`,
			section: 'collection',
			panel: {
				title: `${collection.favourite} gets the top shelf.`,
				lead: 'My favourite Pokémon, so it gets pride of place. A few other favourites share the shelf; the whole collection is catalogued on Collectr.',
				blocks: [
					{ type: 'slab', item: 'collectible-blastoise' },
					{
						type: 'items',
						style: 'cards',
						heading: 'Also on the shelf',
						items: [{ type: 'collectible', featured: false }]
					}
				],
				links: [{ label: 'Open the binder on Collectr', href: collection.showcaseUrl }]
			}
		},
		{
			id: 'corkboard',
			object: 'Corkboard',
			short: 'corkboard',
			area: 'Community',
			world: 'gather',
			summary: 'Tickets, photos, and notes from the communities I’ve helped build.',
			section: 'community',
			panel: {
				title: 'Pinned to the corkboard',
				lead: 'Spaces I’ve helped build for people to write, walk, meet, and make things together. Who they’re for matters more than how big they got.',
				blocks: [
					{
						type: 'items',
						style: 'pins',
						items: [{ type: 'community' }, { type: 'work', context: 'Community' }],
						linkLabel: 'Read more'
					}
				],
				links: [{ label: 'All community work' }]
			}
		},
		{
			id: 'lanyards',
			object: 'Conference wall',
			short: 'conference wall',
			area: 'Speaking',
			world: 'speak',
			summary: 'Lanyards and badges from DevRelCon, All Things Open, RenderATL, and more.',
			section: 'speaking',
			panel: {
				title: 'Lanyards from the road',
				lead: `${talks.length} talks and counting. A few of the badges I kept:`,
				blocks: [{ type: 'items', style: 'badges', items: [{ type: 'talk', featured: true }] }],
				links: [
					{ label: 'Every talk and podcast' },
					{ label: 'Invite me to speak', href: `mailto:${site.email}?subject=Speaking invitation` }
				]
			}
		},
		{
			id: 'mirror',
			object: 'Mirror',
			short: 'mirror',
			area: 'About',
			world: 'personal',
			summary: 'Who I am, how I got here, and what I care about.',
			section: 'about',
			panel: {
				title: about.headline,
				lead: about.standfirst,
				blocks: [
					{ type: 'profile', text: about.intro },
					{ type: 'list', heading: 'What I care about', items: about.careAbout }
				],
				links: [{ label: 'The longer story' }]
			}
		},
		{
			id: 'window',
			object: 'Window',
			short: 'window',
			area: 'Now',
			world: 'personal',
			summary: 'Bengaluru outside; what I’m up to right now.',
			section: 'now',
			panel: {
				title: 'Right now',
				lead: 'It’s {time} in Bengaluru.',
				blocks: [{ type: 'facts', rows: now.items }],
				links: [{ label: 'The Now page' }]
			}
		},
		{
			id: 'door',
			object: 'Door',
			short: 'door',
			area: 'Elsewhere & contact',
			world: 'personal',
			summary: 'GitHub, LinkedIn, the newsletter, Pexels, Collectr, and how to reach me.',
			section: 'contact',
			panel: {
				title: 'Elsewhere',
				lead: 'The quickest way to reach me is still email.',
				blocks: [
					{
						type: 'contact',
						email: site.email,
						places: [
							...socialLinks.map((link) => ({
								label: link.name,
								detail: `@${link.handle}`,
								href: link.url
							})),
							{ label: 'Newsletter', detail: 'oberai.blog', href: 'https://oberai.blog' },
							{ label: 'Photography', detail: 'Pexels', href: pexelsProfile },
							{ label: 'Collection', detail: 'Collectr', href: collection.showcaseUrl },
							{ label: 'Sponsor', detail: 'GitHub Sponsors', href: sponsorLink }
						]
					}
				],
				links: [{ label: 'Contact page' }]
			}
		}
	],

	// Copy written by Claude for Aditya to review (see WORKLOG.md).
	curiosities: {
		plush: {
			label: 'Squirtle plush',
			line: 'A Squirtle plush by the pillow. Two evolutions from now, it gets the top shelf.'
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
	}
};
