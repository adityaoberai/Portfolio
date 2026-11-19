import { text } from '@sveltejs/kit';
import { llmsIndex } from '$lib/server/llms';

export const prerender = true;

export function GET() {
	return text(llmsIndex());
}
