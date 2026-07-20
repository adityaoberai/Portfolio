export const site = {
	name: 'Aditya Oberai',
	role: 'Developer Relations Lead at Appwrite',
	tagline: 'Developer Relations, communities, and open source',
	description:
		'Aditya Oberai is a DevRel practitioner, writer, speaker, and community builder helping developer tools communicate better, teach better, and build stronger developer communities.',
	url: 'https://oberai.dev',
	ogImage: 'https://oberai.dev/og.png',
	email: 'aditya@oberai.dev',
	twitterHandle: '@adityaoberai',
	portrait: '/aditya.jpg',
	resume: '/resume.pdf'
};

export type NavItem = {
	label: string;
	href: string;
};

export const primaryNav: NavItem[] = [
	{ label: 'Home', href: '/' },
	{ label: 'About', href: '/about' },
	{ label: 'Work', href: '/work' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Community', href: '/community' },
	{ label: 'Speaking', href: '/speaking' },
	{ label: 'Contact', href: '/contact' }
];
