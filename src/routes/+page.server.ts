import * as privateEnv from '$env/static/private';
import { photos as placeholders, type Photo } from '$lib/data/photos';
import photoUrls from '$lib/data/pexels-photos.json';

export const prerender = true;

type PexelsPhoto = {
	id: number;
	url: string;
	alt: string | null;
	width: number;
	height: number;
	src: { large: string };
};

// Resolves the maintained list in pexels-photos.json against the Pexels API
// at build time. Falls back to the placeholder plates if the key is missing
// or the API is unreachable, so the build never breaks.
export async function load({ fetch }) {
	// A missing optional key must also work in a clean, secret-free checkout.
	const PEXELS_API_KEY = Reflect.get(privateEnv, 'PEXELS_API_KEY') as string | undefined;
	if (!PEXELS_API_KEY) {
		console.warn('PEXELS_API_KEY is empty; using placeholder photos.');
		return { photos: placeholders };
	}

	const ids = photoUrls
		.map((url) => /(\d+)\/?$/.exec(url)?.[1])
		.filter((id): id is string => Boolean(id));

	try {
		const results = await Promise.all(
			ids.map(async (id) => {
				const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
					headers: { Authorization: PEXELS_API_KEY }
				});
				if (!res.ok) throw new Error(`Pexels photo ${id} returned ${res.status}`);
				return (await res.json()) as PexelsPhoto;
			})
		);

		const photos: Photo[] = results.map((photo) => ({
			src: photo.src.large,
			alt: photo.alt || 'Photograph by Aditya Oberai',
			href: photo.url,
			width: photo.width,
			height: photo.height
		}));

		if (!photos.length) throw new Error('pexels-photos.json resolved to no photos');
		return { photos };
	} catch (error) {
		console.warn('Pexels fetch failed; using placeholder photos.', error);
		return { photos: placeholders };
	}
}
