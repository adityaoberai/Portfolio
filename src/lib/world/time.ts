// The window shows Bengaluru's sky at the current local time there.
// Computed once on load (and when the tab returns), never animated.

export type SkyPhase = 'dawn' | 'day' | 'golden' | 'dusk' | 'night';

export interface Sky {
	phase: SkyPhase;
	sky: string;
	lights: string | null;
	hemisphere: number;
	sun: number;
}

const SKIES: Record<SkyPhase, Omit<Sky, 'phase'>> = {
	dawn: { sky: '#f2c9a8', lights: '#f6d98a', hemisphere: 2.3, sun: 1.9 },
	day: { sky: '#b9d4c3', lights: null, hemisphere: 2.5, sun: 2.2 },
	golden: { sky: '#f0b77c', lights: null, hemisphere: 2.4, sun: 2.3 },
	dusk: { sky: '#8a7fa6', lights: '#f6d98a', hemisphere: 2.1, sun: 1.7 },
	night: { sky: '#2f3b57', lights: '#f6d98a', hemisphere: 1.9, sun: 1.3 }
};

export function bengaluruHour(date = new Date()): number {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Kolkata',
		hour: 'numeric',
		minute: 'numeric',
		hourCycle: 'h23'
	}).formatToParts(date);
	const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
	const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
	return hour + minute / 60;
}

export function skyAt(hour: number): Sky {
	const phase: SkyPhase =
		hour >= 5.5 && hour < 7
			? 'dawn'
			: hour >= 7 && hour < 17
				? 'day'
				: hour >= 17 && hour < 18.5
					? 'golden'
					: hour >= 18.5 && hour < 19.5
						? 'dusk'
						: 'night';
	return { phase, ...SKIES[phase] };
}
