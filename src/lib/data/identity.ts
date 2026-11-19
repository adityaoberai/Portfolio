import { socialLinks } from './links';
import { pexelsProfile } from './photography';
import { identityProfiles } from './profile';
import { site } from './site';

export type StructuredEntity = {
	'@type': string;
	'@id': string;
	[property: string]: unknown;
};

export const person = {
	'@type': 'Person',
	'@id': `${site.url}/#person`,
	name: site.name,
	url: `${site.url}/`,
	image: `${site.url}${site.portrait}`,
	description: site.description,
	jobTitle: site.jobTitle,
	worksFor: { '@type': 'Organization', ...site.employer },
	address: {
		'@type': 'PostalAddress',
		addressLocality: site.location.city,
		addressCountry: site.location.countryCode
	},
	mainEntityOfPage: { '@id': `${site.url}/about#webpage` },
	email: `mailto:${site.email}`,
	sameAs: [
		...socialLinks.map((link) => link.url),
		'https://oberai.blog',
		pexelsProfile,
		...Object.values(identityProfiles)
	]
};
