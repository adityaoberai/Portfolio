import { error } from '@sveltejs/kit';
import { talkPages } from '$lib/data/talks';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => talkPages.map(({ detail }) => ({ slug: detail.slug }));

export const load: PageLoad = ({ params }) => {
	const talk = talkPages.find(({ detail }) => detail.slug === params.slug);
	if (!talk) error(404, 'Talk not found');
	return { talk };
};
