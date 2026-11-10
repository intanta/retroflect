// Fails when `npm audit` reports a high or critical advisory that is not an accepted risk.
//
// Accepted risks live in audit-allowlist.json. Each entry needs a reason and an expiry
// date, so an accepted risk is revisited instead of being forgotten. The check also
// fails when an entry has expired, or when it no longer matches any advisory (so the
// allowlist doesn't keep stale exceptions around).
//
// Usage: npm run audit:check
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const BLOCKING = new Set(['high', 'critical'])

function runAudit() {
	try {
		return execFileSync('npm', ['audit', '--json'], { encoding: 'utf8' })
	} catch (error) {
		// npm audit exits non-zero when it finds anything; the JSON is still on stdout.
		if (error.stdout) return error.stdout
		throw error
	}
}

const report = JSON.parse(runAudit())
if (report.error) {
	console.error('npm audit failed:', report.error.summary ?? report.error)
	process.exit(1)
}

const allowlist = JSON.parse(readFileSync(new URL('../audit-allowlist.json', import.meta.url), 'utf8'))
const today = new Date().toISOString().slice(0, 10)

// Each vulnerable package lists its advisories in `via` (objects); strings in `via`
// only point at other vulnerable packages, so they're skipped here.
const advisories = new Map()
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
	for (const via of vulnerability.via) {
		if (typeof via !== 'object') continue
		const id = via.url?.split('/').pop() ?? String(via.source)
		advisories.set(id, { id, package: via.name, severity: via.severity, title: via.title })
	}
}

const problems = []

for (const advisory of advisories.values()) {
	if (!BLOCKING.has(advisory.severity)) continue
	const entry = allowlist.find((item) => item.id === advisory.id)
	if (!entry) {
		problems.push(`${advisory.severity}: ${advisory.package} – ${advisory.title} (${advisory.id})`)
	} else if (entry.expires < today) {
		problems.push(`expired allowlist entry ${entry.id} (${entry.package}, expired ${entry.expires}): fix it or renew it with a reason`)
	}
}

for (const entry of allowlist) {
	if (!advisories.has(entry.id)) {
		problems.push(`stale allowlist entry ${entry.id} (${entry.package}): no longer reported, remove it`)
	}
}

const counts = Object.entries(report.metadata?.vulnerabilities ?? {})
	.filter(([severity, count]) => severity !== 'total' && count > 0)
	.map(([severity, count]) => `${count} ${severity}`)
console.log(`npm audit: ${counts.join(', ') || 'no vulnerabilities'} (packages, including allowlisted and non-blocking)`)

if (problems.length > 0) {
	console.error('\nAudit check failed:')
	for (const problem of problems) console.error(`  - ${problem}`)
	process.exit(1)
}

console.log('Audit check passed: no unaccepted high or critical advisories.')
