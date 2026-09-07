export type SocialLink = {
	name: string;
	handle: string;
	url: string;
};

export type Destination = {
	title: string;
	description: string;
	cta: string;
	href: string;
	external: boolean;
};

export const socialLinks: SocialLink[] = [
	{ name: 'LinkedIn', handle: 'adityaoberai1', url: 'https://www.linkedin.com/in/adityaoberai1/' },
	{ name: 'GitHub', handle: 'adityaoberai', url: 'https://github.com/adityaoberai' },
	{ name: 'X', handle: 'adityaoberai', url: 'https://x.com/adityaoberai' },
	{ name: 'Instagram', handle: 'adityaoberai1', url: 'https://instagram.com/adityaoberai1' }
];

export const destinations: Destination[] = [
	{
		title: 'Writing',
		description:
			'Essays and newsletters on developer relations, developer tools, and the craft of building communities.',
		cta: 'Read on Substack',
		href: 'https://oberai.blog',
		external: true
	},
	{
		title: 'Photography',
		description:
			'A growing archive of street, travel, and event photography from cities and conferences around the world.',
		cta: 'Explore on Pexels',
		href: 'https://www.pexels.com/@oberai',
		external: true
	},
	{
		title: 'Projects',
		description:
			'Open source demos, sample apps, and experiments, most built to teach something or test an idea.',
		cta: 'Browse GitHub',
		href: 'https://github.com/adityaoberai',
		external: true
	},
	{
		title: 'Resume',
		description:
			'The formal version: roles, launches, talks, and recognition on a single page, updated regularly.',
		cta: 'Download the PDF',
		href: '/resume.pdf',
		external: false
	}
];

export const sponsorLink = 'https://github.com/sponsors/adityaoberai';
