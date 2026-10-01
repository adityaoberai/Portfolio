import { collection } from './collection';
import { cameraBody } from './photography';
import { sectionById } from './sections';
import { talks } from './talks';
import { writingSamples } from './writing';

export interface NowItem {
	label: string;
	text: string;
	href?: string;
}

const essay = writingSamples[0];
const recentTalks = talks.filter((talk) => talk.year === talks[0].year);

// "Right now", as seen through the window. Everything is derived from existing
// records. Reading and Thinking about need Aditya's own answers, so they are
// omitted until he adds them (see WORKLOG.md).
export const now = {
	basedIn: 'Bengaluru, India',
	timeZone: 'Asia/Kolkata',
	updated: '2026-09-30',
	items: [
		{
			label: 'Working on',
			text: 'Leading Developer Relations at Appwrite: launches, documentation, and AI tooling for developers building with Claude Code, Codex, and Cursor.',
			href: sectionById.work.href
		},
		{ label: 'Writing', text: `“${essay.title}”, the latest essay.`, href: essay.href },
		{
			label: 'Speaking',
			text: `Recent talks at ${recentTalks.map((talk) => talk.event).join(' and ')} (${talks[0].year}).`,
			href: sectionById.speaking.href
		},
		{
			label: 'Photographing',
			text: `Bengaluru's streets, markets, and cats, on a ${cameraBody}.`,
			href: sectionById.photography.href
		},
		{
			label: 'Collecting',
			text: `${collection.subject}. ${collection.favourite}, always.`,
			href: sectionById.collection.href
		},
		{ label: 'Based in', text: 'Bengaluru, India' }
	] satisfies NowItem[],
	reading: undefined as string | undefined,
	thinkingAbout: undefined as string | undefined
};

// The current time in Bengaluru, for the window and /now.
export function bengaluruTime(date = new Date()) {
	return new Intl.DateTimeFormat('en-IN', {
		timeZone: now.timeZone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(date);
}
