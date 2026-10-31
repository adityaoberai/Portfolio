import { socialLinks } from './links';
import { pexelsProfile } from './photography';
import { site } from './site';

export const identityProfiles = {
	appwrite: 'https://appwrite.io/blog/author/aditya-oberai',
	microsoftMvp: 'https://mvp.microsoft.com/en-US/MVP/profile/4a922093-396f-ed11-81ab-000d3a5600fa',
	sessionize: 'https://sessionize.com/adityaoberai'
};

export const person = {
	'@type': 'Person',
	'@id': `${site.url}/#person`,
	name: site.name,
	url: `${site.url}/`,
	image: `${site.url}${site.portrait}`,
	description: site.description,
	jobTitle: 'Developer Relations Lead',
	worksFor: { '@type': 'Organization', name: 'Appwrite', url: 'https://appwrite.io' },
	address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
	email: `mailto:${site.email}`,
	sameAs: [
		...socialLinks.map((link) => link.url),
		'https://oberai.blog',
		pexelsProfile,
		...Object.values(identityProfiles)
	]
};
