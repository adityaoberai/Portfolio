export type Photo = {
	src: string;
	alt: string;
	href: string;
	width: number;
	height: number;
};

// Build-time FALLBACK only: shown when PEXELS_API_KEY is missing or the
// Pexels API is unreachable. The real list lives in pexels-photos.json.
export const photos: Photo[] = [
	{
		src: '/photos/placeholder-1.svg',
		alt: 'Placeholder for a photograph. Swap with a real image.',
		href: 'https://www.pexels.com/@oberai',
		width: 800,
		height: 1000
	},
	{
		src: '/photos/placeholder-2.svg',
		alt: 'Placeholder for a photograph. Swap with a real image.',
		href: 'https://www.pexels.com/@oberai',
		width: 800,
		height: 1000
	},
	{
		src: '/photos/placeholder-3.svg',
		alt: 'Placeholder for a photograph. Swap with a real image.',
		href: 'https://www.pexels.com/@oberai',
		width: 800,
		height: 1000
	},
	{
		src: '/photos/placeholder-4.svg',
		alt: 'Placeholder for a photograph. Swap with a real image.',
		href: 'https://www.pexels.com/@oberai',
		width: 800,
		height: 1000
	}
];
