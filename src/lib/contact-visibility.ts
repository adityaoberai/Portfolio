import { trackEvent } from '$lib/analytics';

type ContactSection = { section: string; page?: string };

// A view means at least half of the contact controls are on screen in a visible tab.
// The footer persists across navigations, so reset its view for each new page.
export function contactVisibility(node: HTMLElement, initial: ContactSection) {
	if (typeof IntersectionObserver === 'undefined') return;
	let current = initial;
	let seen = false;
	let visible = false;
	const record = () => {
		if (seen || !visible || document.visibilityState !== 'visible') return;
		seen = true;
		trackEvent('contact_section_viewed', { section: current.section });
		observer.disconnect();
	};
	const observer = new IntersectionObserver(
		(entries) => {
			const entry = entries.at(-1);
			visible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
			record();
		},
		{ threshold: 0.5 }
	);
	observer.observe(node);
	document.addEventListener('visibilitychange', record);
	return {
		update(next: ContactSection) {
			if (next.section === current.section && next.page === current.page) return;
			current = next;
			seen = false;
			visible = false;
			observer.disconnect();
			observer.observe(node);
		},
		destroy() {
			observer.disconnect();
			document.removeEventListener('visibilitychange', record);
		}
	};
}
