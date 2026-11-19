import { appwriteCareer, cmxAward, identityProfiles, microsoftMvpSince } from './profile';
import { projectPagePath } from './projects';

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
					"Leading Appwrite's public-facing product releases end to end, including Init, Appwrite's recurring launch week: announcements, blogs, documentation, newsletters, social media, events, and livestreams for every launch."
			},
			{
				tag: 'PROCESS',
				title: 'Agent-first content workflows',
				description:
					'Building agent-first workflows to document features, write tutorials, and create demos, while shaping that content for discovery through search and AI answer engines.'
			},
			{
				tag: 'DOCS',
				title: 'Documentation and website ownership',
				description:
					"Owning content strategy and updates across the Appwrite website and documentation, including leading all of Appwrite's docs and writing docs for Sites, Databases, and AI (MCP servers, AGENTS.md, agent skills, and plugins), so developers can build with Appwrite through tools like Claude Code, Codex, and Cursor."
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
				title: `${appwriteCareer.articles} published articles`,
				description: `Technical tutorials, product deep-dives, and announcements written for the Appwrite blog during my Developer Advocate tenure (${appwriteCareer.advocatePeriod}).`,
				link: { label: 'Appwrite author archive', href: identityProfiles.appwrite }
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
				tag: 'STUDENTS',
				title: "Appwrite's Education program",
				description: `Launched with GitHub Education in 2024. The program reached ${appwriteCareer.students} students during my Developer Advocate tenure (${appwriteCareer.advocatePeriod}).`,
				link: {
					label: 'Education program announcement',
					href: 'https://appwrite.io/blog/post/announcing-appwrite-education-program'
				}
			},
			{
				tag: 'AMBASSADORS',
				title: 'Appwrite Heroes',
				description:
					"Launched and ran Appwrite's superuser program for three years, supporting the community's most active contributors."
			},
			{
				tag: 'HACKATHONS',
				title: "Appwrite's Hackathons",
				description: `Planned and hosted hackathons that engaged ${appwriteCareer.hackathonParticipants} developers during my Developer Advocate tenure (${appwriteCareer.advocatePeriod}).`,
				link: {
					label: 'Appwrite hackathons',
					href: 'https://appwrite.io/blog/categories/hackathons'
				}
			},
			{
				tag: 'OPEN SOURCE',
				title: 'Hacktoberfest and open-source programs',
				description: `Represented Appwrite in initiatives like Hacktoberfest, which together helped onboard ${appwriteCareer.communityMembers} new community members during my Developer Advocate tenure (${appwriteCareer.advocatePeriod}).`
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
				description: `Launched Appwrite's integrations catalog in 2024 and grew it to 40+ integrations and templates during my Developer Advocate tenure (${appwriteCareer.advocatePeriod}).`,
				link: {
					label: 'Integrations catalog launch',
					href: 'https://appwrite.io/blog/post/announcing-appwrite-integration-catalog'
				}
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
				tag: `Since ${microsoftMvpSince}`,
				title: 'Microsoft MVP',
				description:
					'Recognised for contributions to the .NET, JavaScript, and Azure developer communities.',
				link: {
					label: 'MVP profile',
					href: identityProfiles.microsoftMvp
				}
			},
			{
				tag: String(cmxAward.year),
				title: 'CMX Community Industry Award',
				description: `${cmxAward.title}.`,
				link: {
					label: 'Announcement',
					href: cmxAward.url
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
					label: 'CodeCapture case study',
					href: projectPagePath('codecapture')
				}
			}
		]
	}
];
