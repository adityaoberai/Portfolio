import { redirect } from '@sveltejs/kit';

export const trailingSlash = 'ignore';
// Runtime redirect: a prerendered one becomes a 200 meta-refresh page.
export const prerender = false;

export async function load() {
	// Redirect to the static PDF file
	redirect(302, '/resume.pdf');
}
