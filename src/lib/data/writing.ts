export type WritingSample = {
	meta: string;
	title: string;
	description: string;
	href: string;
};

export type TechnicalArticle = WritingSample & {
	published: string;
	kind: 'Tutorial' | 'Announcement' | 'Customer story';
};

// Selected published work. Dates and authorship checked on Appwrite on 31 October 2026.
export const technicalWritingSamples: TechnicalArticle[] = [
	{
		meta: 'OCT 2026',
		published: '2026-10-01',
		kind: 'Tutorial',
		title: 'How to build a multi-tenant SaaS app with Appwrite Teams',
		description:
			'A forms app that shows how Teams and permissions keep tenant data separate, with DocumentsDB for the application data.',
		href: 'https://appwrite.io/blog/post/multi-tenant-app-appwrite-teams-documentsdb'
	},
	{
		meta: 'SEP 2026',
		published: '2026-09-09',
		kind: 'Customer story',
		title: 'How Lorari scaled to 130+ fitness studios solo with Appwrite',
		description:
			'A conversation with the founder of Lorari about building software for fitness studios, running the business solo, and choosing a managed backend.',
		href: 'https://appwrite.io/blog/post/customer-story-lorari'
	},
	{
		meta: 'AUG 2026',
		published: '2026-08-06',
		kind: 'Tutorial',
		title: 'Build a financial analysis MCP server with Appwrite Functions',
		description:
			'From a financial data model to a deployed MCP server: scoped reporting tools, structured results, and a working demo built with Functions and TablesDB.',
		href: 'https://appwrite.io/blog/post/financial-analysis-mcp-server'
	},
	{
		meta: 'MAY 2026',
		published: '2026-05-11',
		kind: 'Announcement',
		title: 'Introducing the Appwrite plugin for Codex: Skills and MCP in one install',
		description:
			'How Appwrite packages SDK guidance, deployment skills, and access to its remote MCP server for developers working in Codex.',
		href: 'https://appwrite.io/blog/post/announcing-appwrite-codex-plugin'
	}
];

// Curated posts from https://oberai.blog, newest first.
// meta: a short mono tag shown left of the title (e.g. 'MAY 2026').
export const writingSamples: WritingSample[] = [
	{
		meta: 'AUG 2026',
		title: 'The Grief And Rage Leaving Home Brings',
		description: 'Remembering The Caterpillar Before The Butterfly.',
		href: 'https://www.oberai.blog/p/the-grief-and-rage-leaving-home-brings'
	},
	{
		meta: 'MAY 2026',
		title: 'The Glorious Burden Of Leaving Footsteps In The Sand',
		description: 'On legacy, purpose, and the strange comfort of being forgotten.',
		href: 'https://www.oberai.blog/p/the-glorious-burden-of-leaving-footsteps'
	},
	{
		meta: 'JAN 2026',
		title: "Celebrating Friendships Of 'Inconvenience'",
		description: 'Because some people are worth the effort!',
		href: 'https://www.oberai.blog/p/celebrating-friendships-of-inconvenience'
	},
	{
		meta: 'JUL 2025',
		title: 'Re-visiting Superman: My Thoughts On Masculinity, Privilege, and Hope',
		description: "Cause I'm a punkrocker, yes I am!",
		href: 'https://www.oberai.blog/p/re-visiting-superman-my-thoughts'
	},
	{
		meta: 'APR 2025',
		title: 'Paid Mentorship and Referrals: A Discussion On Desperation, Greed, And Ethics',
		description: 'Should you even try to commoditize them?',
		href: 'https://www.oberai.blog/p/paid-mentorship-and-referrals-a-discussion'
	}
];
