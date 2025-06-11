import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {	try {
		// Read the DOCX file from the static directory
		const docxPath = join(process.cwd(), 'static', 'resume.docx');
		const docxBuffer = readFileSync(docxPath);

		return new Response(docxBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'Content-Disposition': 'attachment; filename="resume.docx"'
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