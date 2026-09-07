export type Talk = {
	title: string;
	event: string;
	year: number;
	description: string;
	recording?: string;
	slides?: string;
	featured?: boolean;
};

export const talks: Talk[] = [
	{
		title: 'The Content ROI Shift: Is AI-Scaled Technical Blogging Your New Growth Moat?',
		event: 'RenderATL',
		year: 2026,
		description:
			'How AI-assisted long-form technical content can drive growth for developer-facing products, with a practical workflow for articles that rank on Google and influence AI-generated answers.',
		slides: 'https://drive.google.com/file/d/1FOhj1zm_a3tnqiyf2m6A5d20hojDqWUN/view?usp=sharing',
		featured: true
	},
	{
		title: 'Why Agents Make Different Decisions With the Same Tools',
		event: 'MCP Dev Summit Bengaluru',
		year: 2026,
		description:
			'Practical testing and development practices for MCP servers that make AI agents meaningfully more reliable. Presented with Jyoti Bisht and Animesh Pathak.',
		recording: 'https://www.youtube.com/watch?v=lSjakfdOUqc',
		featured: true
	},
	{
		title: 'Does Your Tech Company Even Need A Community?',
		event: 'All Things Open',
		year: 2025,
		description:
			"A framework for evaluating your company's readiness to launch community initiatives, before you burn goodwill finding out the hard way.",
		slides: 'https://drive.google.com/file/d/1dbsZEPMbhGjr3Q_uaAx6l9DHuG2BKgsA/view?usp=sharing',
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

export const speakerBio = [
	'Aditya Oberai is the Developer Relations Lead at Appwrite and an avid tech community and hackathon enthusiast. Having worked with various web and cloud technologies, he has spent the last seven years empowering student and tech communities in India and beyond.',
	'Aditya has been an active Microsoft MVP since 2022. He was awarded "Best Developer Relations Professional of the Year" at the CMX Community Industry Awards 2024 and led the organisation of the first-ever DevRelCon in India in 2024.'
].join('\n\n');
