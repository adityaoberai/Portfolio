import { writable } from 'svelte/store';
import type { StationId } from './layout';
import { world } from '../data/world';

export interface RoomPosition {
	x: number;
	z: number;
	heading: number;
}
export interface RoomJourney {
	position?: RoomPosition;
	station: StationId | null;
	panel: StationId | null;
	expanded: boolean;
	scroll: number;
}
const KEY = 'aditya-room-journey-v1';
export const roomJourney = writable<RoomJourney | null>(null);
export function stationId(value: string | null | undefined): StationId | null {
	return world.stations.find((station) => station.id === value && !station.hidden)?.id ?? null;
}
export function parseJourney(value: string | null): RoomJourney | null {
	try {
		if (!value) return null;
		const data = JSON.parse(value);
		if (!data || typeof data !== 'object') return null;
		const p = data.position;
		const position =
			p &&
			[p.x, p.z, p.heading].every((n) => typeof n === 'number' && Number.isFinite(n)) &&
			Math.abs(p.x) < 10 &&
			Math.abs(p.z) < 10
				? { x: p.x, z: p.z, heading: p.heading }
				: undefined;
		return {
			position,
			station: stationId(data.station),
			panel: stationId(data.panel),
			expanded: data.expanded === true,
			scroll:
				typeof data.scroll === 'number' && Number.isFinite(data.scroll)
					? Math.max(0, data.scroll)
					: 0
		};
	} catch {
		return null;
	}
}
export function readJourney(): RoomJourney | null {
	if (typeof window === 'undefined') return null;
	try {
		const saved = parseJourney(sessionStorage.getItem(KEY));
		roomJourney.set(saved);
		return saved;
	} catch {
		return null;
	}
}
export function rememberJourney(journey: RoomJourney) {
	if (typeof window === 'undefined') return;
	roomJourney.set(journey);
	try {
		sessionStorage.setItem(KEY, JSON.stringify(journey));
	} catch {
		/* Browsing works without storage. */
	}
}
