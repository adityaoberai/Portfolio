// Renders og/og.html to static/og.png with headless Chrome (1200x630 at 2x).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = [
	process.env.CHROME,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].filter(Boolean);

const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
	console.error('No Chrome or Edge binary found. Set CHROME=/path/to/chrome and retry.');
	process.exit(1);
}

const out = resolve('static/og.png');
execFileSync(
	chrome,
	[
		'--headless=new',
		'--disable-gpu',
		'--hide-scrollbars',
		'--window-size=1200,630',
		'--force-device-scale-factor=2',
		'--virtual-time-budget=4000',
		`--screenshot=${out}`,
		pathToFileURL(resolve('og/og.html')).href
	],
	{ stdio: 'inherit' }
);
console.log(`Wrote ${out}`);
