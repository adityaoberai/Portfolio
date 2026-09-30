import { collection } from './collection';
import { communityInitiatives } from './community';
import { photographs, pexelsProfile } from './photography';
import { podcasts } from './podcasts';
import { projects } from './projects';
import { site } from './site';
import { talks } from './talks';
import { writingSamples } from './writing';

// The site's sections. World (room guide, station links) and Index link through
// this one list, so a destination changes in one place.
export type SectionId =
	| 'work'
	| 'projects'
	| 'speaking'
	| 'writing'
	| 'community'
	| 'photography'
	| 'collection'
	| 'about'
	| 'resume'
	| 'contact';

export interface Section {
	id: SectionId;
	label: string;
	href: string;
	external: boolean;
	summary: string;
}

export const sections: Section[] = [
	{
		id: 'work',
		label: 'Work',
		href: '/work',
		external: false,
		summary: 'Developer relations at Appwrite: launches, docs, AI tooling, and community programs.'
	},
	{
		id: 'projects',
		label: 'Projects',
		href: '/projects',
		external: false,
		summary: `${projects.length} things I've built, most of them to teach something or test an idea.`
	},
	{
		id: 'speaking',
		label: 'Speaking',
		href: '/speaking',
		external: false,
		summary: `${talks.length} talks and ${podcasts.length} podcasts and streams, from Tokyo to Atlanta.`
	},
	{
		id: 'writing',
		label: 'Writing',
		href: 'https://oberai.blog',
		external: true,
		summary: `Personal essays (latest: “${writingSamples[0].title}”) and 140+ technical articles.`
	},
	{
		id: 'community',
		label: 'Community',
		href: '/community',
		external: false,
		summary: `${communityInitiatives.length} spaces for people to write, walk, meet, and build together.`
	},
	{
		id: 'photography',
		label: 'Photography',
		href: pexelsProfile,
		external: true,
		summary: `Street and travel photographs from Bengaluru, Toronto, Jaipur and beyond. ${photographs.length} on Pexels.`
	},
	{
		id: 'collection',
		label: 'Collection',
		href: collection.showcaseUrl,
		external: true,
		summary: `Pokémon cards. ${collection.favourite} gets pride of place.`
	},
	{
		id: 'about',
		label: 'About',
		href: '/about',
		external: false,
		summary: 'From student hackathons to leading developer relations, and what I care about.'
	},
	{
		id: 'resume',
		label: 'Résumé',
		href: '/resume',
		external: false,
		summary: 'The formal version, as a PDF. Also available as a Word document.'
	},
	{
		id: 'contact',
		label: 'Contact',
		href: '/contact',
		external: false,
		summary: `Speaking invitations, collaborations, or just hello: ${site.email}.`
	}
];

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<
	SectionId,
	Section
>;
