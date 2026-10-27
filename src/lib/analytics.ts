import { browser } from '$app/environment';
import { Analytics, Tracking } from 'appwrite';
import { client } from '$lib/appwrite';

type PortfolioEvent = 'room_station_opened' | 'mode_switched' | 'photo_viewed' | 'contact_clicked';

let tracking: Tracking | undefined;

export function startTracking() {
	if (!browser || tracking) return;
	// Keep the SDK's default respect for Do Not Track for every event.
	tracking = new Tracking(new Analytics(client), '6ae0a115002177037121');
	// Includes SPA history changes; a second router pageview hook would double count them.
	tracking.start();
	tracking.enableAutoDownloadTracking({ extensions: ['pdf', 'docx'] });
	document.addEventListener('click', trackPortfolioLink, { capture: true });
}

export function trackEvent(name: PortfolioEvent, props: Record<string, string>) {
	tracking?.track(name, { props });
}

function trackPortfolioLink(event: MouseEvent) {
	const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
	if (!(anchor instanceof HTMLAnchorElement)) return;
	const url = new URL(anchor.href);
	if (url.protocol === 'mailto:') {
		trackEvent('contact_clicked', {
			method: 'email',
			purpose: url.searchParams.get('subject') === 'Speaking invitation' ? 'speaking' : 'general'
		});
		return;
	}
	if (url.origin !== location.origin) return;
	// These extensionless routes redirect to files, so the SDK cannot infer their downloads.
	const downloads: Record<string, string> = {
		'/resume': '/resume.pdf',
		'/resume/docx': '/resume.docx'
	};
	const path = downloads[url.pathname.replace(/\/$/, '')];
	if (!path) return;
	const href = new URL(path, url).href;
	const filename = path.slice(1);
	tracking?.track('file_download', {
		url: href,
		props: { filename, extension: filename.split('.').pop(), href }
	});
}
