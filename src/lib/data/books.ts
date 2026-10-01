// The books on the room's shelf (Aditya's list, 2026-10-01), left to right. Spine
// colours follow well-known covers; sizes are in room units.
export interface Book {
	title: string;
	author: string;
	spine: string;
	/** The title band across the spine. */
	band: string;
	height: number;
	thickness: number;
}

export const books: Book[] = [
	{
		title: 'The Godfather',
		author: 'Mario Puzo',
		spine: '#1b1b1d',
		band: '#e8e2d4',
		height: 0.36,
		thickness: 0.07
	},
	{
		title: 'Around the World in 80 Days',
		author: 'Jules Verne',
		spine: '#2e5e6e',
		band: '#d9b45a',
		height: 0.33,
		thickness: 0.05
	},
	{
		title: 'The Da Vinci Code',
		author: 'Dan Brown',
		spine: '#6e2a1c',
		band: '#e3c27a',
		height: 0.38,
		thickness: 0.075
	},
	{
		title: 'Animal Farm',
		author: 'George Orwell',
		spine: '#e07b39',
		band: '#f4efe2',
		height: 0.3,
		thickness: 0.035
	},
	{
		title: 'The Myth of Sisyphus',
		author: 'Albert Camus',
		spine: '#d9d4c7',
		band: '#2b2b2a',
		height: 0.32,
		thickness: 0.04
	},
	{
		title: 'The Killing Joke',
		author: 'Alan Moore and Brian Bolland',
		spine: '#4b2f7a',
		band: '#7ab648',
		height: 0.41,
		thickness: 0.025
	}
];
