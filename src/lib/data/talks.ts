type TalkDetail = {
	slug: string;
	location: string;
	coSpeakers?: string[];
	takeaways: string[];
	sources: { label: string; href: string }[];
};

export type Talk = {
	title: string;
	event: string;
	year: number;
	description: string;
	recording?: string;
	slides?: string;
	featured?: boolean;
	detail?: TalkDetail;
};

export const talks: Talk[] = [
	{
		title: 'The Content ROI Shift: Is AI-Scaled Technical Blogging Your New Growth Moat?',
		event: 'RenderATL',
		year: 2026,
		description:
			'How AI-assisted long-form technical content can drive growth for developer-facing products, with a practical workflow for articles that rank on Google and influence AI-generated answers.',
		slides: 'https://drive.google.com/file/d/1FOhj1zm_a3tnqiyf2m6A5d20hojDqWUN/view?usp=sharing',
		detail: {
			slug: 'ai-assisted-technical-content',
			location: 'Atlanta, Georgia, USA',
			takeaways: [
				'How long-form technical writing can support growth for a developer tool.',
				'How search rankings and the way answer engines retrieve and cite sources differ.',
				'A practical workflow for producing technically accurate, in-depth articles with AI assistance.'
			],
			sources: [
				{
					label: 'Session abstract',
					href: 'https://sessionize.com/s/adityaoberai/the-content-roi-shift-is-ai-scaled-technical-blogg/181278'
				}
			]
		},
		featured: true
	},
	{
		title: 'Why Agents Make Different Decisions With the Same Tools',
		event: 'MCP Dev Summit Bengaluru',
		year: 2026,
		description:
			'Why agents can choose different tools for the same task, and how to test a Model Context Protocol (MCP) server for more reliable tool selection.',
		recording: 'https://www.youtube.com/watch?v=lSjakfdOUqc',
		detail: {
			slug: 'why-agents-make-different-decisions-with-the-same-tools',
			location: 'Bengaluru, India',
			coSpeakers: ['Jyoti Bisht', 'Animesh Pathak'],
			takeaways: [
				'The same set of tool capabilities can lead to different choices when presented differently to an agent.',
				'Tool names and descriptions are inputs to the model and can affect which option it picks.',
				'Test which tool the agent selects in representative tasks, alongside testing whether each tool works when called.'
			],
			sources: [
				{
					label: 'Agentic AI Foundation conference recap',
					href: 'https://aaif.io/blog/56-things-we-learned-from-mcp-dev-summit-bengaluru'
				}
			]
		},
		featured: true
	},
	{
		title: 'Does Your Tech Company Even Need A Community?',
		event: 'All Things Open',
		year: 2025,
		description:
			"A framework for evaluating your company's readiness to launch community initiatives, before you burn goodwill finding out the hard way.",
		slides: 'https://drive.google.com/file/d/1dbsZEPMbhGjr3Q_uaAx6l9DHuG2BKgsA/view?usp=sharing',
		detail: {
			slug: 'does-your-tech-company-need-a-community',
			location: 'Raleigh, North Carolina, USA',
			takeaways: [
				'Where a developer community can help a company learn what to build and help developers adopt it.',
				'What teams can learn from community programs at Microsoft, Twilio, and Appwrite.',
				'How to assess whether to launch a dedicated program, work with existing forums, or wait.'
			],
			sources: [
				{
					label: 'All Things Open session page',
					href: 'https://2025.allthingsopen.org/sessions/does-your-tech-company-even-need-a-community'
				}
			]
		},
		featured: true
	},
	{
		title: 'Introducing the Developer Relations Foundation',
		event: 'Open Source Summit India',
		year: 2025,
		description:
			'An introduction to the DevRel Foundation, a Linux Foundation project working to define and advance the practice of developer relations.',
		recording: 'https://www.youtube.com/watch?v=naUmKGglTac'
	},
	{
		title: 'Understanding Model Context Protocol (MCP): Revolutionizing LLM Integration',
		event: 'Analytics Vidhya DataHour',
		year: 2025,
		description:
			'How MCP enhances language model interactions with external knowledge: benefits, limitations, real-world examples, and building a simple MCP server hands-on.',
		recording:
			'https://www.analyticsvidhya.com/events/datahour/mastering-model-context-protocol-mcp-revolutionizing-llm-integration/'
	},
	{
		title: 'Effortless Language Translation with Serverless Functions and GPT-4o',
		event: 'ServerlessDays Bengaluru',
		year: 2024,
		description:
			'How GPT models can support event-driven consumer use-cases like language translation, demonstrated with serverless architectures.'
	},
	{
		title: "Balancing Community Health and Open Source Growth: The Contributor's Role",
		event: 'GitTogether Bengaluru',
		year: 2024,
		description:
			'What a healthy open source community looks like, and how contributors can sustain it while collaborating better with maintainers.',
		recording: 'https://www.youtube.com/watch?v=YuUt5qABv_k'
	},
	{
		title: 'Understanding Role-Based Access Control with ASP.NET Web APIs',
		event: '.NET Conf',
		year: 2023,
		description:
			'Building custom role-based access control in .NET 8 Web APIs, beyond what the framework gives you out of the box.',
		recording: 'https://www.youtube.com/watch?v=r8fVjPqpVkA'
	},
	{
		title: 'Build AI-Enabled Apps with .NET MAUI and Azure Cognitive Services',
		event: 'Global Azure Bengaluru',
		year: 2023,
		description:
			'Adding vision, speech, and language features to cross-platform .NET MAUI apps with Azure Cognitive Services.',
		recording: 'https://www.youtube.com/watch?v=jeqKTGhcMCg'
	},
	{
		title: 'How Can DevRel Enable Engineering?',
		event: 'DevRelCon Yokohama',
		year: 2023,
		description:
			'How developer relations can serve engineering as much as marketing: the feedback loops and collaboration models that make it work.',
		recording: 'https://www.youtube.com/watch?v=9s3G5un7Ms8'
	},
	{
		title: 'Overcoming stage fright',
		event: 'DevRelCon London',
		year: 2023,
		description:
			'An honest talk about stage fright, and the techniques that let you get up and speak anyway.',
		recording: 'https://www.youtube.com/watch?v=TlV4Igt6yyQ',
		featured: true
	},
	{
		title: 'Why DevRel Needs More Students To Lead',
		event: 'DevRelCon Tokyo',
		year: 2021,
		description:
			'Why student communities are an untapped source of developer relations talent, and how DevRel teams can give students room to lead.',
		recording: 'https://www.youtube.com/watch?v=u9Mqygwah58'
	}
];

export const talkPages = talks.filter((talk): talk is Talk & { detail: TalkDetail } =>
	Boolean(talk.detail)
);

export const talkPagePath = (slug: string) => `/speaking/${slug}`;

export function talkResources(talk: Talk): { label: string; href: string; action?: string }[] {
	return [
		...(talk.recording
			? [{ label: 'Watch the recording', href: talk.recording, action: 'recording' }]
			: []),
		...(talk.slides ? [{ label: 'See the slides', href: talk.slides, action: 'slides' }] : []),
		...(talk.detail?.sources ?? [])
	];
}

export const speakingTopics: string[] = [
	'developer relations',
	'community building',
	'technical writing',
	'open source',
	'developer education',
	'AI-driven development',
	'storytelling',
	'product ideation',
	'startups',
	'web development',
	'cloud computing',
	'API development'
];
