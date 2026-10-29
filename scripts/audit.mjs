// Dependency audit for CI. Fails on an npm audit finding of any severity unless its advisory
// is an exception triaged in docs/maintenance.md. Also fails when an exception is no longer
// reported, so the list never outlives the findings it covers.
// Usage: npm run audit (pipes `npm audit --json` into this script).
import { text } from 'node:stream/consumers';

// Advisory id → the severity it was triaged at. Keep in step with docs/maintenance.md.
// A re-scored advisory fails until it is triaged again.
const exceptions = {
	'GHSA-pfhg-q3qv-9q6r': 'low', // SvelteKit 2: enhanced form redirect
	'GHSA-27mw-82g8-phjj': 'low', // SvelteKit 2: prerendered cache-control header
	'GHSA-gcqx-w48m-w2h4': 'low' // deepmerge 4.3.1, build tooling: no patched release
};

const report = JSON.parse(await text(process.stdin));
if (report.auditReportVersion !== 2)
	throw new Error(`npm audit did not return a report: ${JSON.stringify(report.error ?? report)}`);

// Advisories are the objects in `via`; strings name the vulnerable package a finding comes through.
const advisories = new Map();
for (const { via } of Object.values(report.vulnerabilities))
	for (const advisory of via)
		if (typeof advisory === 'object') advisories.set(advisory.url.split('/').pop(), advisory);

const problems = [];
for (const [id, { name, severity, title }] of advisories) {
	if (exceptions[id] === severity) continue;
	problems.push(
		exceptions[id]
			? `${id} (${name}) is now ${severity}, triaged as ${exceptions[id]}: triage it again`
			: `${id} (${name}, ${severity}): ${title}`
	);
}
for (const id of Object.keys(exceptions))
	if (!advisories.has(id))
		problems.push(
			`${id} is no longer reported: remove it from scripts/audit.mjs and docs/maintenance.md`
		);

if (problems.length) {
	console.error(`npm audit failed (see docs/maintenance.md):\n- ${problems.join('\n- ')}`);
	process.exitCode = 1;
} else {
	console.log(`npm audit passed: only the ${advisories.size} documented exceptions are reported.`);
}
