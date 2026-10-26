// Lists what src/lib/data/world.ts can reference: every artifact id, its title,
// and the fields a query can match on; then each station and its blocks.
// Usage: npm run content            (everything)
//        npm run content -- photo   (only one artifact type)
import { artifacts, worldLabels } from '../src/lib/data/artifacts.ts';
import { world } from '../src/lib/data/world.ts';
import { panels } from '../src/lib/data/room.ts';

const only = process.argv[2];
const byType = new Map();
for (const artifact of artifacts) {
	if (only && artifact.type !== only) continue;
	if (!byType.has(artifact.type)) byType.set(artifact.type, []);
	byType.get(artifact.type).push(artifact);
}

console.log('ARTIFACTS  (use an id, or query by type / world / context / featured)\n');
for (const [type, list] of byType) {
	console.log(`${type} (${list.length})`);
	for (const a of list) {
		const flags = [a.featured ? 'featured' : '', a.context ? `context: ${a.context}` : '']
			.filter(Boolean)
			.join(' · ');
		console.log(`  ${a.id}`);
		console.log(`      ${a.title}${flags ? `  [${flags}]` : ''}  worlds: ${a.worlds.join(', ')}`);
	}
	console.log();
}
if (only) process.exit(0);

console.log(`Worlds: ${Object.keys(worldLabels).join(', ')}\n`);
console.log('STATIONS  (order = menu order)\n');
for (const station of world.stations) {
	const blocks = station.panel.blocks
		.map((block) => (block.type === 'items' ? `items:${block.style}` : block.type))
		.join(', ');
	const shown = panels[station.id]?.blocks
		.map((block) => ('artifacts' in block ? block.artifacts.length : null))
		.filter((n) => n !== null);
	console.log(
		`  ${station.id.padEnd(10)} ${station.hidden ? '(hidden) ' : ''}${station.object} → ${station.section}`
	);
	console.log(
		`      blocks: ${blocks}${shown?.length ? `  (items shown: ${shown.join(', ')})` : ''}`
	);
}
