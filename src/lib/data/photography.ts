import urls from './pexels-photos.json';

export interface Photograph {
	id: string;
	title: string;
	place?: string;
	href: string;
}

// The camera Aditya shoots with (from the V3 brief). Per-photo EXIF is not published here.
export const cameraBody = 'Fujifilm X-T30 II';
export const pexelsProfile = 'https://www.pexels.com/@oberai';

const properNouns: Record<string, string> = {
	bengaluru: 'Bengaluru',
	india: 'India',
	toronto: 'Toronto',
	canada: 'Canada',
	ontario: 'Ontario',
	jaipur: 'Jaipur',
	hawa: 'Hawa',
	mahal: 'Mahal',
	maruti: 'Maruti',
	cn: 'CN',
	blue: 'blue',
	mountains: 'mountains'
};
const places = ['Bengaluru', 'Toronto', 'Jaipur', 'Ontario'];

// Titles come from the Pexels URL slug, which is the photo's published title.
function fromUrl(url: string): Photograph | null {
	const match = /\/photo\/([a-z0-9-]+)-(\d+)\/?$/.exec(url);
	if (!match) return null;
	const [, slug, id] = match;
	const words = slug.split('-').map((word) => properNouns[word] ?? word);
	if (slug.includes('blue-mountains')) {
		const i = words.indexOf('blue');
		words.splice(i, 2, 'Blue', 'Mountains');
	}
	const title = words.join(' ').replace(/^\w/, (c) => c.toUpperCase());
	return { id, title, place: places.find((place) => title.includes(place)), href: url };
}

export const photographs: Photograph[] = urls
	.map(fromUrl)
	.filter((photo): photo is Photograph => photo !== null);

// Pexels serves resized copies from its CDN; no API key is needed to display them.
export function photoSrc(photo: Photograph, width: number) {
	return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const photoPlaces = [...new Set(photographs.map((photo) => photo.place).filter(Boolean))];
