type ProjectDetail = {
	period: string;
	contribution: string;
	approach: string;
	sources: Project['links'];
};

export type Project = {
	slug: string;
	name: string;
	overview: string;
	motivation: string;
	technologies: string[];
	outcome: string;
	links: { label: string; href: string }[];
	featured?: boolean;
	detail?: ProjectDetail;
};

export const projects: Project[] = [
	{
		slug: 'relief-atl',
		name: 'Relief ATL',
		overview:
			'A map of public restrooms in Atlanta that ranks nearby options by an Access Confidence Score, so you find one you can actually use rather than one that is merely close.',
		motivation:
			'Georgia State University researchers found that 55.3% of the 262 potential restroom locations they visited in Atlanta in 2025 were inaccessible. Relief ATL makes the audit data searchable and adds a way to report changes.',
		technologies: [
			'SvelteKit',
			'TypeScript',
			'MapLibre GL JS',
			'PostgreSQL',
			'TimescaleDB',
			'DigitalOcean App Platform'
		],
		outcome: 'Winner of Best Use of DigitalOcean at Hack RenderATL 2026.',
		links: [
			{ label: 'Devpost', href: 'https://devpost.com/software/relief-atl' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/hack-renderatl' }
		],
		detail: {
			period: '2026',
			contribution:
				'I designed and built Relief ATL at Hack RenderATL after finding that a nearby restroom on a map could still be locked or reserved for customers. I used the Georgia State University study as the starting point and built a way for people to report what they found in person.',
			approach:
				'The map scores nearby places using audit results and recent community reports, and shows the source and age of that information. A report can say whether someone got in and why they could not, without requiring an account. The score estimates access and can change as new reports come in.',
			sources: [
				{
					label: 'Georgia State University study',
					href: 'https://doi.org/10.1371/journal.pwat.0000574'
				},
				{ label: 'Original audit dataset', href: 'https://osf.io/fm9by/' }
			]
		},
		featured: true
	},
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
		detail: {
			period: 'April 2025',
			contribution:
				'I built the sample journal and wrote the Appwrite tutorial so JavaScript developers could try offline replication themselves.',
			approach:
				'The browser writes journal entries to the local RxDB collection first. RxDB can then push those edits to Appwrite Databases and pull remote changes when the network is available. The example walks through local data, user sign-in, and syncing entries in both directions.',
			sources: [
				{ label: 'Appwrite tutorial', href: 'https://appwrite.io/blog/post/offline-first-journal' },
				{ label: 'RxDB integration', href: 'https://appwrite.io/integrations/replication-rxdb' }
			]
		},
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
		detail: {
			period: '2020–2021',
			contribution:
				'I built CodeCapture with two other Microsoft Learn Student Ambassadors. We wanted students who were learning to program on paper to have a way to try their own code on a phone.',
			approach:
				'A student photographs handwritten code, checks and edits the text extracted from the image, then runs the program from the web app. The mobile workflow lets a student go from a notebook to a running program without needing a desktop computer.',
			sources: [
				{
					label: 'Microsoft Learn interview',
					href: 'https://techcommunity.microsoft.com/blog/studentdeveloperblog/meet-a-recent-microsoft-learn-student-ambassador-graduate-aditya-oberai/3579478'
				},
				{
					label: 'Imagine Cup winner certificate',
					href: 'https://imaginecup.microsoft.com/en-us/Member/WinnerCertificate?compId=HH0wAl06ACf%252fY9VUc3o6cw%253d%253d&teamId=42E6Y%252bB%252b088sXx%252bzVPud%252bw%253d%253d&userid=XDXErtXGleobIcan7GVTTA%253d%253d'
				}
			]
		},
		featured: true
	}
];

export const projectPages = projects.filter(
	(project): project is Project & { detail: ProjectDetail } => Boolean(project.detail)
);

export const projectPagePath = (slug: string) => `/projects/${slug}`;
