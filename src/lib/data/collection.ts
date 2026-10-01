// Facts supplied in the V3 brief, plus the favourite cards Aditya chose to show
// (images supplied by him, 2026-10-01). The full inventory lives on Collectr;
// this site shows the favourites and links there for the rest.
export const collection = {
	favourite: 'Blastoise',
	subject: 'Pokémon cards',
	showcaseUrl: 'https://app.getcollectr.com/showcase/profile/9dfbe594-7f0a-467d-98d2-77179903ec6b'
};

export interface Card {
	/** Also the file name: assets/cards/<id>.png in, static/cards/<id>.webp out (npm run images). */
	id: string;
	name: string;
	/** The name as printed, for cards in another language. */
	printedName?: string;
	language: 'English' | 'Japanese';
	set: string;
	number: string;
	illustrator: string;
	/** The artwork, for screen readers. */
	alt: string;
	note?: string;
}

// Order matters: on the room's shelf the first four stand in a row, left to right
// (any more still show on the panel and /collection).
// After changing cards or their order, run `npm run images` to rebuild the images.
export const favouriteCards: Card[] = [
	{
		id: 'blastoise',
		name: 'Blastoise',
		language: 'English',
		set: 'Celebrations: Classic Collection',
		number: '2/102',
		illustrator: 'Ken Sugimori',
		alt: 'Blastoise card: Blastoise stands with its shell cannons raised against a holographic background.',
		note: 'My favourite Pokémon, so it gets pride of place.'
	},
	{
		id: 'squirtle-151',
		name: 'Squirtle',
		printedName: 'ゼニガメ',
		language: 'Japanese',
		set: 'Pokémon Card 151',
		number: '170/165 AR',
		illustrator: 'Mitsuhiro Arita',
		alt: 'Japanese Squirtle card: Squirtle floats in a swirl of shallow, rainbow-tinted water.'
	},
	{
		id: 'pikachu-151',
		name: 'Pikachu',
		printedName: 'ピカチュウ',
		language: 'Japanese',
		set: 'Pokémon Card 151',
		number: '173/165 AR',
		illustrator: 'Hiroyuki Yamamoto',
		alt: 'Japanese Pikachu card: Pikachu runs across a busy town square full of people and Pokémon.'
	},
	{
		id: 'mew-promo',
		name: 'Mew',
		language: 'English',
		set: 'Wizards Black Star Promos',
		number: 'No. 9',
		illustrator: 'Ken Sugimori',
		alt: 'Mew card: Mew floats against a starry holographic background.'
	}
];

export const cardImage = (card: Card) => `/cards/${card.id}.webp`;
export const CARD_IMAGE_WIDTH = 400;
export const CARD_IMAGE_HEIGHT = 559;

// The room's shelf: slabs that can show a card, and one small texture holding them.
export const SHELF_SLOTS = 4;
export const shelfCards = favouriteCards.slice(0, SHELF_SLOTS);
export const SHELF_ATLAS = '/cards/shelf.webp';
export const SHELF_CELL = { width: 160, height: 224 };
