// Resolves the room's content (world.ts) into what the page renders, and checks it.
// Edit world.ts, not this file. Any bad reference throws while building, with a
// message that names the station, so a typo can't ship as an empty panel.
import { artifactById, artifacts, type Artifact, type World } from './artifacts';
import { sectionById, type SectionId } from './sections';
import {
	world,
	type Block,
	type Curiosity,
	type ItemStyle,
	type Link,
	type LinkTo,
	type Panel,
	type Pick
} from './world';
import { CURIOSITIES, STATIONS, type CuriosityId, type StationId } from '../world/layout';

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

export interface ResolvedLink {
	label: string;
	href: string;
	external: boolean;
}

type Shown = { description: boolean; date: boolean; context: boolean; link: boolean };

// Sensible defaults per item style; `show` in world.ts overrides any of them.
const defaultShow: Record<ItemStyle, Shown> = {
	list: { description: true, date: false, context: false, link: true },
	pages: { description: true, date: true, context: false, link: true },
	pins: { description: true, date: false, context: true, link: true },
	badges: { description: false, date: true, context: true, link: true },
	photos: { description: false, date: false, context: false, link: true },
	cards: { description: false, date: false, context: true, link: false }
};

const defaultLinkTo: Record<ItemStyle, LinkTo> = {
	list: 'external',
	pages: 'either',
	pins: 'page',
	badges: 'external',
	photos: 'either',
	cards: 'page'
};

// The URL an item links to, following `linkTo`.
export function linkFor(artifact: Artifact, to: LinkTo): string | undefined {
	if (to === 'external') return artifact.externalUrl;
	if (to === 'page') return artifact.href;
	return artifact.externalUrl ?? artifact.href;
}

// Blocks with their artifact references resolved, ready to render.
// Items carry `link`: the URL chosen by `linkTo`, or undefined for no link.
export type ResolvedBlock =
	| (Omit<Extract<Block, { type: 'items' }>, 'items' | 'show' | 'linkTo'> & {
			artifacts: (Artifact & { link?: string })[];
			show: Shown;
	  })
	| (Omit<Extract<Block, { type: 'feature' }>, 'item' | 'linkTo'> & {
			artifact: Artifact;
			link?: string;
	  })
	| (Omit<Extract<Block, { type: 'slab' }>, 'item'> & { artifact: Artifact })
	| { type: 'links'; links: ResolvedLink[] }
	| Exclude<Block, { type: 'items' | 'feature' | 'slab' | 'links' }>;

export interface ResolvedPanel {
	eyebrow?: string;
	title: string;
	lead?: string;
	blocks: ResolvedBlock[];
	links: ResolvedLink[];
}

const problem = (where: string, message: string) =>
	new Error(`src/lib/data/world.ts, ${where}: ${message} Run \`npm run content\` to list ids.`);

function need(id: string, where: string): Artifact {
	const artifact = artifactById.get(id);
	if (!artifact) throw problem(where, `no artifact with id "${id}".`);
	return artifact;
}

export function pick(picks: Pick[], where: string): Artifact[] {
	const chosen: Artifact[] = [];
	for (const entry of picks) {
		if (typeof entry === 'string') {
			chosen.push(need(entry, where));
			continue;
		}
		const matches = artifacts.filter(
			(a) =>
				(!entry.type || a.type === entry.type) &&
				(!entry.world || a.worlds.includes(entry.world)) &&
				(!entry.context || a.context === entry.context) &&
				(entry.featured === undefined || Boolean(a.featured) === entry.featured)
		);
		const offset = entry.offset ?? 0;
		const slice = matches.slice(offset, offset + (entry.limit ?? matches.length));
		if (!slice.length) throw problem(where, `the query ${JSON.stringify(entry)} matches nothing.`);
		chosen.push(...slice);
	}
	return chosen.filter((a, i) => chosen.findIndex((b) => b.id === a.id) === i);
}

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);

function resolveLinks(links: Link[], section: SectionId): ResolvedLink[] {
	return links.map((link) => {
		const href = link.href ?? sectionById[section].href;
		return { label: link.label, href, external: isExternal(href) };
	});
}

function resolveBlock(block: Block, section: SectionId, where: string): ResolvedBlock {
	switch (block.type) {
		case 'items': {
			const { items, show, linkTo, ...rest } = block;
			const to = linkTo ?? defaultLinkTo[block.style];
			const artifacts = pick(items, where).map((a) => ({ ...a, link: linkFor(a, to) }));
			if (block.style === 'photos' && artifacts.some((a) => !a.image))
				throw problem(where, "the 'photos' style needs artifacts with images (type: 'photo').");
			if (block.style === 'cards' && artifacts.some((a) => !a.image))
				throw problem(
					where,
					"the 'cards' style needs artifacts with images (type: 'collectible')."
				);
			return { ...rest, artifacts, show: { ...defaultShow[block.style], ...show } };
		}
		case 'feature': {
			const { item, linkTo, ...rest } = block;
			const artifact = need(item, where);
			return { ...rest, artifact, link: linkFor(artifact, linkTo ?? 'external') };
		}
		case 'slab': {
			const { item, ...rest } = block;
			return { ...rest, artifact: need(item, where) };
		}
		case 'links':
			return { type: 'links', links: resolveLinks(block.links, section) };
		default:
			return block;
	}
}

function resolvePanel(panel: Panel, section: SectionId, where: string): ResolvedPanel {
	if (!panel.blocks.length) throw problem(where, 'the panel has no blocks.');
	return {
		eyebrow: panel.eyebrow,
		title: panel.title,
		lead: panel.lead,
		blocks: panel.blocks.map((block, i) =>
			resolveBlock(block, section, `${where}, block ${i + 1} (${block.type})`)
		),
		links: resolveLinks(panel.links ?? [], section)
	};
}

// Every object in the room needs content, and every configured station must exist.
const layoutIds = new Set<string>(STATIONS.map((s) => s.id));
const configured = new Set<string>(world.stations.map((s) => s.id));
for (const station of world.stations)
	if (!layoutIds.has(station.id))
		throw problem(`station "${station.id}"`, 'there is no such object in the room (layout.ts).');
if (configured.size !== world.stations.length)
	throw problem('stations', 'a station is listed twice.');
for (const id of layoutIds)
	if (!configured.has(id))
		throw problem(`station "${id}"`, 'this object is in the room but has no content.');
for (const curiosity of CURIOSITIES) {
	if (!world.curiosities[curiosity.id])
		throw problem(`curiosity "${curiosity.id}"`, 'this object is in the room but has no note.');
	if (curiosity.approach && !world.curiosities[curiosity.id].use)
		throw problem(
			`curiosity "${curiosity.id}"`,
			'you walk up to this one, so it needs `use` (its hint).'
		);
}

const visible = world.stations.filter((s) => !s.hidden);

export const stations: Station[] = visible.map((s, i) => ({
	id: s.id,
	number: String(i + 1).padStart(2, '0'),
	object: s.object,
	short: s.short,
	area: s.area,
	world: s.world,
	summary: s.summary,
	section: s.section,
	href: sectionById[s.section].href,
	external: sectionById[s.section].external
}));

// Hidden stations are left out, so they can't be opened or linked to.
export const stationById = Object.fromEntries(stations.map((s) => [s.id, s])) as Partial<
	Record<StationId, Station>
>;

export const panels = Object.fromEntries(
	visible.map((s) => [s.id, resolvePanel(s.panel, s.section, `station "${s.id}"`)])
) as Partial<Record<StationId, ResolvedPanel>>;

export const curiosities: Record<CuriosityId, Curiosity> = world.curiosities;
export const page = world.page;
