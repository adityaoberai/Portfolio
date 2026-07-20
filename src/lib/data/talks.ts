export type Talk = {
	title: string;
	event: string;
	year: number;
	description: string;
	recording?: string;
	featured?: boolean;
};

export const talks: Talk[] = [
	{
		title: 'The Content ROI Shift: Is AI-Scaled Technical Blogging Your New Growth Moat?',
		event: 'RenderATL',
		year: 2026,
		description:
			'How AI-assisted long-form technical content can drive growth for developer-facing products, with a practical workflow for articles that rank on Google and influence AI-generated answers.',
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
		title: 'Understanding Role-Based Access Control with ASP.NET Web APIs',
		event: '.NET Conf',
		year: 2023,
		description:
			'Building custom role-based access control in .NET 8 Web APIs, beyond what the framework gives you out of the box.',
		recording: 'https://www.youtube.com/watch?v=r8fVjPqpVkA',
		featured: true
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
		recording: 'https://www.youtube.com/watch?v=TlV4Igt6yyQ'
	}
];

export const speakingTopics: string[] = [
	'Developer relations',
	'Community building',
	'AI-assisted content creation',
	'Technical writing',
	'Open source',
	'Developer education',
	'AI applications',
	'Product storytelling',
	'SvelteKit and web development',
	'.NET and Microsoft Azure'
];

export const speakerBio =
	'Aditya Oberai is the Developer Relations Lead at Appwrite and an avid tech community and hackathon enthusiast. Having worked with various technologies, including .NET, Microsoft Azure, and SvelteKit, he has spent the last six years empowering student and tech communities. He is a Microsoft MVP and a DigitalOcean Wavemaker. Aditya was awarded "Best Developer Relations Professional of the Year" at the CMX Community Industry Awards 2024 and currently serves as a Steering Committee member for the Developer Relations Foundation.';
