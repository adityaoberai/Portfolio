import { appwriteCareer, cmxAward, microsoftMvpSince } from './profile';

// Compact proof points rendered in the On paper overview.
export const highlights: string[] = [
	`${appwriteCareer.articles} technical articles`,
	'8+ conference talks across 3 continents',
	`Microsoft MVP since ${microsoftMvpSince}`,
	`CMX ${cmxAward.title}, ${cmxAward.year}`
];
