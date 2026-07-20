export type CommunityInitiative = {
	slug: string;
	title: string;
	what: string;
	why: string;
	who: string;
	impact: string;
	links?: { label: string; href: string }[];
	featured?: boolean;
};

export const communityInitiatives: CommunityInitiative[] = [
	{
		slug: 'writers-room',
		title: "The Writers' Room",
		what: 'A community program for developers who want to become better technical writers, with space to pitch, draft, and publish with editorial feedback.',
		why: 'Most developers are never taught to write, yet writing is how ideas travel in this industry. The Writers’ Room turns "I should blog more" into published work.',
		who: 'Developers in the community who want to sharpen their writing, from first-time bloggers to experienced authors.',
		impact:
			'A steady stream of community-authored technical content, and writers who keep publishing long after their first piece.',
		links: [
			{ label: 'Event Calendar', href: 'https://luma.com/the-writers-room' },
			{ label: 'X / Twitter', href: 'https://x.com/blrwritersroom' }
		],
		featured: true
	},
	{
		slug: 'photo-walks',
		title: 'Photo Walks',
		what: 'Casual photography walks organized around conferences and meetups, where developers explore a city together with cameras in hand.',
		why: 'The best conversations at conferences rarely happen in session rooms. A slow walk with a camera gives people something to do together besides networking.',
		who: 'Developers and community folks at tech events. No photography experience required.',
		impact: 'Friendships and photographs that outlast any conference talk.',
		links: [
			{ label: 'Event Calendar', href: 'https://luma.com/photo-walks' },
			{ label: 'Instagram', href: 'https://www.instagram.com/blrphotowalks' }
		],
		featured: true
	},
	{
		slug: 'doon-tech-community',
		title: 'Doon Tech Community',
		what: 'An independent tech community in Dehradun, bringing together the developers, students, and builders of the Doon valley for meetups, talks, and collaboration.',
		why: "Tech communities in India cluster in the big metros. Doon Tech exists so the people building in Dehradun don't have to leave home to find their people.",
		who: 'Developers, designers, students, and anyone curious about technology in and around Dehradun.',
		impact:
			'A dedicated, independent home for local builders, and a reminder that a tech community doesn’t need a metro’s pin code.',
		links: [{ label: 'Member Pokedex', href: 'https://doontech.in' }],
		featured: true
	},
	{
		slug: 'devrelcon-bengaluru',
		title: 'DevRelCon Bengaluru 2024',
		what: 'A full edition of the global DevRelCon conference series, organized in Bengaluru: the first-ever DevRelCon held in India.',
		why: 'India has one of the largest developer populations in the world but had no dedicated space to talk about developer relations as a discipline.',
		who: 'DevRel practitioners, community managers, and developer marketers across India.',
		impact:
			'Created awareness around modern DevRel practices, metrics, and business scenarios, and set a precedent for future editions.',
		links: [{ label: 'Conference', href: 'https://blr24.devrelcon.dev/' }]
	},
	{
		slug: 'hackon',
		title: 'HackOn 2.0',
		what: 'A community-run online hackathon and an official Major League Hacking 2021-season event, organized end to end: sponsors, marketing, submissions, and judging.',
		why: 'Hackathons were my own doorway into tech, so HackOn existed to hold that door open for thousands more: a weekend with the space, mentors, and deadline to ship a first project.',
		who: 'Students and early-career developers, backed by sponsors including GitHub, Google Cloud, Auth0, and DigitalOcean.',
		impact:
			'Almost 8,300 hackers registered, building everything from COVID-relief tools to mental-health apps in a single weekend.',
		links: [
			{ label: 'Hackathon', href: 'https://hackon.hackerearth.com' },
			{
				label: 'Summary Blog',
				href: 'https://medium.com/hackonhackathon/organizing-hackon-2-0-53d057160ab5'
			}
		]
	}
];
