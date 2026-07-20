export type WorkItem = {
	tag: string;
	title: string;
	description: string;
	link?: { label: string; href: string };
};

export type WorkTheme = {
	slug: string;
	number: string;
	title: string;
	summary: string;
	items: WorkItem[];
};

export const workThemes: WorkTheme[] = [
	{
		slug: 'developer-relations',
		number: '01',
		title: 'Developer Relations',
		summary:
			'Helping developers discover, understand, and succeed with developer tools, from the first announcement to the last page of the docs.',
		items: [
			{
				tag: 'LAUNCHES',
				title: 'Product launches',
				description:
					"Leading Appwrite's public-facing product releases end to end: announcements, blogs, documentation, newsletters, and social media for every launch."
			},
			{
				tag: 'AI DOCS',
				title: 'AI documentation',
				description:
					"Planned and launched Appwrite's AI documentation (MCP servers, AGENTS.md, agent skills, and plugins) so developers can build with Appwrite through tools like Claude Code, Codex, and Cursor."
			},
			{
				tag: 'PROCESS',
				title: 'AI-driven content processes',
				description:
					'Designed content workflows built around AI tooling, publishing 200% more blogs in a year with a 50% smaller team.'
			},
			{
				tag: 'DOCS',
				title: 'Documentation and website ownership',
				description:
					'Owning content strategy and updates across the Appwrite website and documentation, keeping both accurate as the product evolves.'
			},
			{
				tag: 'SUPPORT',
				title: 'Technical support and Office Hours',
				description:
					"Years of hands-on support across Appwrite's Discord and GitHub, including weekly Office Hours that turn recurring questions into better docs and content."
			}
		]
	},
	{
		slug: 'product-storytelling',
		number: '02',
		title: 'Product Storytelling',
		summary:
			'Translating engineering work into stories developers actually want to read, and measuring whether they do.',
		items: [
			{
				tag: 'WRITING',
				title: '140+ published articles',
				description:
					'Technical tutorials, product deep-dives, and announcements written and published on the Appwrite blog.',
				link: { label: 'Appwrite blog', href: 'https://appwrite.io/blog/author/aditya-oberai' }
			},
			{
				tag: 'STORIES',
				title: 'Customer stories',
				description:
					"Led Appwrite's customer stories initiative, interviewing teams building on the platform and turning their experiences into narratives.",
				link: { label: 'Customer stories', href: 'https://appwrite.io/customer-stories' }
			}
		]
	},
	{
		slug: 'community',
		number: '03',
		title: 'Community',
		summary:
			'Building programs that turn users into contributors, students into builders, and community members into advocates.',
		items: [
			{
				tag: 'EDUCATION',
				title: 'Appwrite Education',
				description:
					'Launched with GitHub Education to support college and university students, growing to 15,000+ students.'
			},
			{
				tag: 'HEROES',
				title: 'Appwrite Heroes',
				description:
					"Launched and ran Appwrite's superuser program for three years, supporting the community's most active contributors."
			},
			{
				tag: 'HACKATHONS',
				title: 'Hackathons',
				description:
					'Planned and hosted multiple hackathons end to end, from marketing and submissions to community and judging, engaging 7,000+ developers.'
			},
			{
				tag: 'OPEN SOURCE',
				title: 'Hacktoberfest and open-source programs',
				description:
					'Represented Appwrite in collaborative initiatives like Hacktoberfest, onboarding 70,000+ new community members.'
			}
		]
	},
	{
		slug: 'developer-experience',
		number: '04',
		title: 'Developer Experience',
		summary:
			'The unglamorous work that makes a platform feel good to use: SDKs, integrations, tutorials, and runnable examples.',
		items: [
			{
				tag: 'SDKS',
				title: 'SDKs and runtimes',
				description: "Maintained Appwrite's .NET SDK and serverless Functions runtimes."
			},
			{
				tag: 'CATALOG',
				title: 'Integrations catalog',
				description:
					"Launched and grew Appwrite's integrations catalog to 40+ integrations and templates across Appwrite products.",
				link: { label: 'Integrations catalog', href: 'https://appwrite.io/integrations' }
			},
			{
				tag: 'TUTORIALS',
				title: 'Tutorials and samples',
				description:
					'Built tutorials and sample applications in .NET, Node.js, SvelteKit, etc. that double as documentation and starting points.'
			}
		]
	},
	{
		slug: 'recognition',
		number: '05',
		title: 'Recognition',
		summary: 'Milestones from along the way.',
		items: [
			{
				tag: '2022–27',
				title: 'Microsoft MVP',
				description:
					'Awarded five years running for contributions to the .NET, JavaScript, and Azure developer communities.',
				link: {
					label: 'MVP profile',
					href: 'https://mvp.microsoft.com/en-US/MVP/profile/4a922093-396f-ed11-81ab-000d3a5600fa'
				}
			},
			{
				tag: '2024',
				title: 'CMX Community Industry Award',
				description: 'Best Developer Relations Community Professional of the Year.',
				link: {
					label: 'Announcement',
					href: 'https://www.cmxhub.com/blog/the-2024-cmx-community-industry-awards-winners-are-in'
				}
			},
			{
				tag: '2021',
				title: "Major League Hacking's Top 50 Hackers",
				description: "Selected from Major League Hacking's community of 135,000 students.",
				link: {
					label: 'Top 50 profile',
					href: 'https://top.mlh.io/2021/profiles/aditya-oberai'
				}
			},
			{
				tag: '2021',
				title: 'Microsoft Imagine Cup',
				description:
					'National winner in the Education category at the India chapter, for CodeCapture.',
				link: {
					label: 'Certificate',
					href: 'https://drive.google.com/drive/folders/1123cDUF5Zvf1Rvd3Ctjz56itF3Qbz3e7?usp=drive_link'
				}
			}
		]
	}
];
