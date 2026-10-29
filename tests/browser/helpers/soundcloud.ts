import type { Page } from '@playwright/test';

// Exercise the real widget integration without sending playback traffic to SoundCloud.
export async function stubSoundCloud(page: Page, stallFirstPlayer = false) {
	await page.route('https://w.soundcloud.com/player/**', (route) => {
		if (new URL(route.request().url()).pathname !== '/player/api.js')
			return route.fulfill({
				contentType: 'text/html',
				body: '<!doctype html><title>SoundCloud player</title>'
			});
		return route.fulfill({
			contentType: 'text/javascript',
			body: `window.__soundcloud = [];
			let players = 0;
			const factory = (frame) => {
				players++;
				const listeners = {};
				let paused = true;
				const emit = (name) => (listeners[name] || []).forEach((fn) => fn());
				const report = (value) => { paused = value; emit(value ? 'pause' : 'play'); };
				window.__soundcloudPlayback = report;
				window.__soundcloudError = () => emit('error');
				return {
					bind(name, fn) {
						(listeners[name] ||= []).push(fn);
						if (name === 'ready' && (!${stallFirstPlayer} || players > 1)) setTimeout(fn, 50);
					},
					unbind(name) { delete listeners[name]; },
					play() { window.__soundcloud.push('play'); report(false); },
					pause() { window.__soundcloud.push('pause'); report(true); },
					isPaused(callback) { callback(paused); }
				};
			};
			factory.Events = { READY: 'ready', PLAY: 'play', PAUSE: 'pause', FINISH: 'finish', ERROR: 'error' };
			window.SC = { Widget: factory };`
		});
	});
}

export const soundcloudCalls = (page: Page) =>
	page.evaluate(() => (Reflect.get(window, '__soundcloud') as string[] | undefined) ?? []);

export const soundcloudPlayback = (page: Page, paused: boolean) =>
	page.evaluate((value) => Reflect.get(window, '__soundcloudPlayback')(value), paused);
