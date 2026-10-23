// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			roomPanel?: import('$lib/world/layout').StationId | null;
			roomPanelEntry?: boolean;
			photo?: { scope: string; id: string };
		}
		// interface Platform {}
	}
}

export {};
