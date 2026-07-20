export type WritingSample = {
	meta: string;
	title: string;
	description: string;
	href: string;
};

// Curated posts from https://oberai.blog, newest first.
// meta: a short mono tag shown left of the title (e.g. 'MAY 2026').
export const writingSamples: WritingSample[] = [
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
