// Fails when a dependency in package.json uses a version range (^, ~, *, x, >=, …)
// instead of an exact version. Exact versions make every upgrade an explicit change.
//
// Usage: node scripts/check-pinned.mjs
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/

const unpinned = ['dependencies', 'devDependencies', 'optionalDependencies']
	.flatMap((section) => Object.entries(pkg[section] ?? {}).map(([name, version]) => ({ section, name, version })))
	.filter(({ version }) => !EXACT.test(version))

if (unpinned.length > 0) {
	console.error('These dependencies are not pinned to an exact version:')
	for (const { section, name, version } of unpinned) console.error(`  - ${section}: ${name}@${version}`)
	process.exit(1)
}

console.log('All dependencies are pinned to exact versions.')
