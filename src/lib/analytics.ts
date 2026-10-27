import { browser, dev } from '$app/environment';
import { Analytics, Tracking } from 'appwrite';
import { client } from '$lib/appwrite';

type PortfolioEvent =
	| 'room_station_opened'
	| 'mode_switched'
	| 'photo_viewed'
	| 'contact_section_viewed'
	| 'contact_clicked'
	| 'content_clicked'
	| 'resume_clicked'
	| 'speaker_bio_copied'
	| 'speaker_asset_clicked'
	| 'room_station_viewed'
	| 'room_curiosity_opened'
	| 'room_poem_viewed'
	| 'room_menu_opened'
	| 'room_setting_changed'
	| 'music_toggled'
	| 'music_playback_changed';

export type ContentTracking = { type: string; id: string; action?: string };

// Match the public artifact IDs used by the room, without importing its content into every page.
export function contentId(type: string, value: string) {
	return `${type}-${value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')}`;
}

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
	document.addEventListener('auxclick', trackPortfolioLink, { capture: true });
}

export function trackEvent(name: PortfolioEvent, props: Record<string, string>) {
	tracking?.track(name, { props });
}

function trackPortfolioLink(event: MouseEvent) {
	// Middle-click opens links too; right-click only opens a context menu.
	if (event.button !== 0 && event.button !== 1) return;
	const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
	if (!(anchor instanceof HTMLAnchorElement)) return;
	const url = new URL(anchor.href);
	const section =
		anchor.closest<HTMLElement>('[data-contact-section]')?.dataset.contactSection ??
		anchor.closest<HTMLElement>('[data-analytics-section]')?.dataset.analyticsSection ??
		(anchor.closest('#room-menu')
			? 'room_menu'
			: anchor.closest('dialog.sheet')
				? 'room'
				: location.pathname === '/speaking'
					? 'speaking_page'
					: 'navigation');
	const content = anchor.closest<HTMLElement>('[data-content-id]');
	if (content?.dataset.contentId && content.dataset.contentType) {
		trackEvent('content_clicked', {
			type: content.dataset.contentType,
			content_id: content.dataset.contentId,
			action: anchor.dataset.contentAction ?? 'open',
			section
		});
	}
	if (anchor.dataset.speakerAsset) {
		trackEvent('speaker_asset_clicked', { asset: anchor.dataset.speakerAsset, section });
	}
	const pathname = url.pathname.replace(/\/$/, '');
	if (
		url.origin === location.origin &&
		['/resume', '/resume/docx', '/resume.pdf', '/resume.docx'].includes(pathname)
	) {
		trackEvent('resume_clicked', {
			format: pathname.endsWith('docx') ? 'docx' : 'pdf',
			section
		});
	}
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
	// Explicit subscription CTAs also count outside the main contact areas.
	if (anchor.dataset.contactMethod || anchor.closest('[data-contact-section]')) {
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
		const method = anchor.dataset.contactMethod ?? methods[url.hostname.replace(/^www\./, '')];
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
