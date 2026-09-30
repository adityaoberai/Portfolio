import { redirect } from '@sveltejs/kit';

export const trailingSlash = 'ignore';
// Runtime redirect: a prerendered one becomes a 200 meta-refresh page.
export const prerender = false;

export async function load() {
	// Redirect to the Google Meet link
	redirect(302, 'https://meet.google.com/erv-qmct-yvc');
}
