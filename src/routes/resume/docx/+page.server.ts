import { redirect } from '@sveltejs/kit';

export const trailingSlash = 'ignore';

export async function load() {
	// Redirect to the static DOCX file
	redirect(302, '/resume.docx');
}
