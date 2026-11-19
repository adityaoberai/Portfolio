import { text } from '@sveltejs/kit';
import { llmsFull } from '$lib/server/llms';

export const prerender = true;

export function GET() {
	return text(llmsFull());
}
