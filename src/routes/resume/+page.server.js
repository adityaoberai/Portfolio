import { redirect } from '@sveltejs/kit';

export async function load() {
	// Redirect to the static PDF file
	throw redirect(302, '/resume.pdf');
}
