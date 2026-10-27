import { browser, dev } from '$app/environment';
import { Analytics, Tracking } from 'appwrite';
import { client } from '$lib/appwrite';

type PortfolioEvent =
	| 'room_station_opened'
	| 'mode_switched'
	| 'photo_viewed'
	| 'contact_section_viewed'
	| 'contact_clicked';

let tracking: Tracking | undefined;

export function startTracking() {
	// The property belongs to the production site; keep local and preview traffic out.
	if (
		!browser ||
		dev ||
		tracking ||
		!['adityaoberai.com', 'www.adityaoberai.com'].includes(location.hostname)
	)
		return;
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
	const section =
		anchor.closest<HTMLElement>('[data-contact-section]')?.dataset.contactSection ??
		(anchor.closest('#room-menu')
			? 'room_menu'
			: anchor.closest('dialog.sheet')
				? 'room'
				: location.pathname === '/speaking'
					? 'speaking_page'
					: 'navigation');
	if (url.protocol === 'mailto:') {
		trackEvent('contact_clicked', {
			method: 'email',
			purpose: url.searchParams.get('subject') === 'Speaking invitation' ? 'speaking' : 'general',
			section
		});
		return;
	}
	if (
		url.origin === location.origin &&
		['/contact', '/meet'].includes(url.pathname.replace(/\/$/, ''))
	) {
		trackEvent('contact_clicked', {
			method:
				url.pathname.replace(/\/$/, '') === '/meet'
					? 'meeting'
					: section === 'room_menu'
						? 'contact_panel'
						: 'contact_page',
			purpose: 'general',
			section
		});
		return;
	}
	// Classify contact-area links; project and article links elsewhere continue
	// to use the SDK's generic outbound_link event only.
	if (anchor.closest('[data-contact-section]')) {
		const methods: Record<string, string> = {
			'linkedin.com': 'linkedin',
			'github.com': url.pathname.startsWith('/sponsors/') ? 'github_sponsors' : 'github',
			'x.com': 'x',
			'twitter.com': 'x',
			'instagram.com': 'instagram',
			'oberai.blog': 'newsletter',
			'pexels.com': 'pexels',
			'app.getcollectr.com': 'collectr',
			'meet.google.com': 'meeting'
		};
		const method = methods[url.hostname.replace(/^www\./, '')];
		if (method) {
			trackEvent('contact_clicked', { method, purpose: 'general', section });
			return;
		}
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
