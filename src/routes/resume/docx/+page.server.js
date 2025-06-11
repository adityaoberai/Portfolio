import { redirect } from '@sveltejs/kit';

export async function load() {
	// Redirect to the static DOCX file
	throw redirect(302, '/resume.docx');
}
