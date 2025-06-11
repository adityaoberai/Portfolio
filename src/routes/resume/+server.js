import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
	try {
		// Read the PDF file from the static directory
		const pdfPath = join(process.cwd(), 'static', 'resume.pdf');
		const pdfBuffer = readFileSync(pdfPath);

		return new Response(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'inline; filename="resume.pdf"'
			}
		});
	} catch (error) {
		return new Response('Resume not found', {
			status: 404,
			headers: {
				'Content-Type': 'text/plain'
			}
		});
	}
}