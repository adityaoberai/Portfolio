import { error } from '@sveltejs/kit';
import { projectPages } from '$lib/data/projects';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => projectPages.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const project = projectPages.find(({ slug }) => slug === params.slug);
	if (!project) error(404, 'Project not found');
	return { project };
};
