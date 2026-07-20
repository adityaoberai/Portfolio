export type Project = {
	slug: string;
	name: string;
	overview: string;
	motivation: string;
	technologies: string[];
	outcome: string;
	links: { label: string; href: string }[];
	featured?: boolean;
};

export const projects: Project[] = [
	{
		slug: 'ai-crystal-ball',
		name: 'AI Crystal Ball',
		overview:
			'An AI-driven GitHub profile reviewer that reads your public activity and tells you, with a wink, what your coding future holds.',
		motivation:
			"Built to demonstrate Appwrite's GitHub OAuth, Databases, and Sites working together in a single playful product.",
		technologies: ['Appwrite Sites', 'Appwrite Databases', 'GitHub OAuth', 'AI'],
		outcome: '400+ sign-ups within the first three days of launch.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/AI-Crystal-Ball' }],
		featured: true
	},
	{
		slug: 'offline-journal',
		name: 'Offline Journal',
		overview:
			'A journal app that works entirely offline and syncs when a connection returns, so an entry is never lost to a bad network.',
		motivation:
			"Built to demonstrate RxDB's Appwrite Databases integration and what local-first data replication looks like in practice.",
		technologies: ['RxDB', 'Appwrite Databases', 'JavaScript'],
		outcome: 'A working local-first reference app for offline data replication with Appwrite.',
		links: [{ label: 'GitHub', href: 'https://github.com/appwrite-community/offline-journal' }],
		featured: true
	},
	{
		slug: 'personal-crm',
		name: 'Personal CRM',
		overview:
			'A personal contact management platform for keeping track of the people you meet and the conversations worth following up on.',
		motivation:
			"Built to demonstrate Appwrite's bulk database actions on a realistically messy dataset.",
		technologies: ['Appwrite Databases', 'SvelteKit'],
		outcome:
			'A reference implementation for bulk create, update, and delete operations in Appwrite.',
		links: [{ label: 'GitHub', href: 'https://github.com/appwrite-community/personal-crm' }]
	},
	{
		slug: 'url-shortener',
		name: 'URL Shortener',
		overview:
			'A self-hostable URL shortener with the interface and the redirect logic packaged into a single serverless function.',
		motivation:
			'An experiment in minimalism: how much product can fit inside one Appwrite Function, with no separate frontend to deploy?',
		technologies: ['Appwrite Functions', 'Node.js'],
		outcome: 'A one-function deployment anyone can self-host in minutes.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/url-shortener-appwrite' }]
	},
	{
		slug: 'alt-text-generator',
		name: 'Alt Text Generator',
		overview:
			'A web app that takes any image and generates a caption ready to use as alternative text, making the web a little more accessible.',
		motivation:
			'Writing good alt text is the kind of accessibility work people skip when it takes effort. This makes it take seconds.',
		technologies: ['Svelte', 'JavaScript', 'Vercel Serverless Functions', 'Azure AI Vision'],
		outcome: 'Used more than 150,000 times.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/Alt-Text-Generator' }],
		featured: true
	},
	{
		slug: 'codecapture',
		name: 'CodeCapture',
		overview:
			'A web app that brings handwritten code from paper to a runnable state in the mobile browser, built for students learning to program without regular access to computers.',
		motivation:
			'Many students in India learn programming on paper. CodeCapture lets them photograph their handwritten code and actually run it.',
		technologies: [
			'.NET',
			'Azure Functions',
			'Azure AI',
			'Azure Database for MySQL',
			'Azure Static Web Apps'
		],
		outcome:
			'National winner in the Education category at the Microsoft Imagine Cup 2021 India chapter.',
		links: [{ label: 'Devpost', href: 'https://devpost.com/software/code-capture-compile' }],
		featured: true
	}
];
