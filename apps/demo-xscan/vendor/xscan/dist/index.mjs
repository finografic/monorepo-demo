#!/usr/bin/env node
import { createRequire } from "node:module";
import process$1 from "node:process";
import { renderHelp, withHelp } from "@finografic/cli-kit/render-help";
import { createFlowContext } from "@finografic/cli-kit/flow";
import { execSync } from "node:child_process";
import { tasks } from "@clack/prompts";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createXdgPaths } from "@finografic/cli-kit/xdg";
import semver from "semver";
import { load } from "js-yaml";
import pc from "picocolors";
//#region src/cli.help.ts
const cliHelp = {
	main: {
		bin: "xscan",
		args: "[command] [options]"
	},
	commands: {
		title: "Commands",
		list: [{
			label: "scan",
			description: "Cross-check lockfile deps against OSV.dev and Node.js advisories"
		}]
	},
	examples: {
		title: "Examples",
		list: [
			{
				label: "Scan current project",
				description: "xscan scan"
			},
			{
				label: "Terminal-only report",
				description: "xscan scan --format terminal"
			},
			{
				label: "Bare flags (scan implied)",
				description: "xscan --verbose"
			}
		]
	},
	footer: {
		title: "Show Help",
		list: [{
			label: "xscan scan --help",
			description: "Detailed scan options"
		}]
	}
};
//#endregion
//#region src/commands/scan/scan.help.ts
const scanHelp = {
	command: "xscan scan",
	description: "Deep dependency security analysis across OSV.dev, Node.js advisories, and GitHub",
	usage: "xscan scan [options]",
	options: [
		{
			flag: "--project <path>",
			description: "Project root directory (default: current directory)"
		},
		{
			flag: "--cache-ttl <hours>",
			description: "Cache TTL in hours (default: 24)"
		},
		{
			flag: "--no-cache",
			description: "Disable caching entirely"
		},
		{
			flag: "--format <type>",
			description: "Output format: terminal | json | both (default: both)"
		},
		{
			flag: "--node-posts <n>",
			description: "Number of Node.js security posts to scan (default: 5)"
		},
		{
			flag: "--json-out <path>",
			description: "Path for JSON report output"
		},
		{
			flag: "-v, --verbose",
			description: "Show detailed progress"
		},
		{
			flag: "--skip-osv",
			description: "Skip OSV.dev vulnerability queries (enabled by default)"
		},
		{
			flag: "--skip-node-posts",
			description: "Skip Node.js runtime security post scraping (enabled by default)"
		},
		{
			flag: "--skip-github",
			description: "Skip GitHub Advisory Database queries (enabled by default)"
		},
		{
			flag: "--skip-dependabot",
			description: "Skip Dependabot alert fetching (enabled by default)"
		},
		{
			flag: "--remote-repo <owner/repo>",
			description: "Remote repository for Dependabot alerts (auto-detected from git origin)"
		},
		{
			flag: "--github-alert-states <states>",
			description: "Dependabot alert states, comma-separated (default: open)"
		},
		{
			flag: "--github-token-env <names>",
			description: "Env var(s) for GitHub token, comma-separated"
		},
		{
			flag: "-h, --help",
			description: "Show this help"
		}
	],
	examples: [
		{
			command: "xscan scan",
			description: "Scan the current project with all sources enabled"
		},
		{
			command: "xscan scan --project ./my-app --format terminal",
			description: "Terminal-only report"
		},
		{
			command: "xscan scan --skip-github --project ./my-app",
			description: "Skip slow GitHub Advisory Database queries"
		},
		{
			command: "xscan scan --skip-dependabot --project ./my-app",
			description: "Skip Dependabot alerts when no token is available"
		},
		{
			command: "xscan scan --project /tmp/checkout --remote-repo owner/repo",
			description: "Scan a materialized checkout and pin the remote repo for Dependabot"
		},
		{
			command: "xscan scan --no-cache --node-posts 10 --verbose",
			description: "Fresh scan with verbose output"
		}
	],
	howItWorks: [
		"Parse the lockfile and resolve the full dependency tree",
		"Scrape recent Node.js security blog posts for runtime CVEs",
		"Query OSV.dev and GitHub Advisory Database for each resolved package version",
		"Fetch Dependabot alerts when a GitHub repo and token are available",
		"Correlate and deduplicate findings, then emit a report"
	]
};
//#endregion
//#region src/lib/cache.utils.ts
/** Subfolder under `~/.config/finografic/` for hashed per-request cache JSON files. */
const CACHE_PACKAGE_DIR = "deps-xscan/cache";
/** Pre-XDG cache location (migrated on first write). */
const LEGACY_CACHE_DIR = join(homedir(), ".deps-xscan-cache");
let legacyMigrationDone = false;
const DEFAULT_OPTIONS = {
	ttlHours: 24,
	disabled: false
};
/** Resolved cache directory (e.g. `~/.config/finografic/deps-xscan/cache`). */
function getCacheDirectory() {
	return join(createXdgPaths().configDir(), CACHE_PACKAGE_DIR);
}
function ensureCacheDir() {
	const dir = getCacheDirectory();
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	migrateLegacyCacheIfNeeded();
}
function migrateLegacyCacheIfNeeded() {
	if (legacyMigrationDone || !existsSync(LEGACY_CACHE_DIR)) return;
	legacyMigrationDone = true;
	const targetDir = getCacheDirectory();
	for (const file of readdirSync(LEGACY_CACHE_DIR)) {
		if (!file.endsWith(".json")) continue;
		const sourcePath = join(LEGACY_CACHE_DIR, file);
		const targetPath = join(targetDir, file);
		if (existsSync(targetPath)) continue;
		try {
			renameSync(sourcePath, targetPath);
		} catch {}
	}
	try {
		if (readdirSync(LEGACY_CACHE_DIR).length === 0) rmdirSync(LEGACY_CACHE_DIR);
	} catch {}
}
function cacheKey(key) {
	return createHash("sha256").update(key).digest("hex");
}
function cachePath(key) {
	return join(getCacheDirectory(), `${cacheKey(key)}.json`);
}
function getCached(key, opts = {}) {
	const options = {
		...DEFAULT_OPTIONS,
		...opts
	};
	if (options.disabled) return null;
	const path = cachePath(key);
	if (!existsSync(path)) return null;
	const stat = statSync(path);
	if ((Date.now() - stat.mtimeMs) / (1e3 * 60 * 60) > options.ttlHours) return null;
	try {
		const raw = readFileSync(path, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setCache(key, data, opts = {}) {
	if ({
		...DEFAULT_OPTIONS,
		...opts
	}.disabled) return data;
	ensureCacheDir();
	writeFileSync(cachePath(key), JSON.stringify(data, null, 2), "utf-8");
	return data;
}
//#endregion
//#region src/lib/correlate.utils.ts
function correlateNodeVersion(nodeVersion, posts) {
	if (!nodeVersion) return [];
	const cleanVersion = semver.clean(nodeVersion);
	if (!cleanVersion) return [];
	const findings = [];
	for (const post of posts) for (const vuln of post.vulnerabilities) try {
		if (vuln.affectedVersions !== "unknown") {
			const patchedVersion = vuln.patchedIn;
			if (patchedVersion && patchedVersion !== "unknown") {
				const cleanPatched = semver.clean(patchedVersion);
				if (cleanPatched && semver.major(cleanVersion) === semver.major(cleanPatched) && semver.lt(cleanVersion, cleanPatched)) findings.push({
					currentVersion: cleanVersion,
					cve: vuln.cve,
					severity: vuln.severity,
					type: vuln.type,
					title: vuln.title,
					patchedIn: cleanPatched,
					postUrl: vuln.postUrl
				});
			}
		}
	} catch {}
	return findings;
}
function correlateDependencies(deps, osvResults, posts, githubAdvisoryResults = [], dependabotAlerts = []) {
	const findingsMap = /* @__PURE__ */ new Map();
	const depLookup = /* @__PURE__ */ new Map();
	for (const dep of deps) depLookup.set(`${dep.name}@${dep.version}`, dep);
	for (const osvResult of osvResults) ingestOsvFindings(findingsMap, osvResult, depLookup, posts);
	for (const githubResult of githubAdvisoryResults) ingestGithubAdvisoryFindings(findingsMap, githubResult, depLookup);
	for (const alert of dependabotAlerts) ingestDependabotAlert(findingsMap, alert, depLookup);
	return [...findingsMap.values()];
}
function ingestOsvFindings(findingsMap, osvResult, depLookup, posts) {
	const depKey = `${osvResult.packageName}@${osvResult.packageVersion}`;
	const dep = depLookup.get(depKey);
	for (const vuln of osvResult.vulnerabilities) {
		const findingId = `${vuln.id}-${depKey}`;
		if (findingsMap.has(findingId)) {
			addSource(findingsMap.get(findingId), "osv");
			continue;
		}
		findingsMap.set(findingId, {
			id: vuln.id,
			packageName: osvResult.packageName,
			installedVersion: osvResult.packageVersion,
			isDirect: dep?.isDirect ?? false,
			isPeer: dep?.isPeer ?? false,
			dependencyKind: dep?.dependencyKind ?? "transitive",
			dependencyPaths: dep?.dependencyPaths ?? [[osvResult.packageName]],
			severity: vuln.severity === "Unknown" ? "Medium" : vuln.severity,
			type: classifyFromDescription(vuln.summary + " " + vuln.details),
			title: vuln.summary || vuln.id,
			description: vuln.details.slice(0, 300),
			affectedVersions: vuln.affectedVersions,
			fixedIn: vuln.fixedIn,
			action: suggestedAction(osvResult.packageName, dep, vuln.fixedIn),
			riskContext: riskContext(dep),
			sources: ["osv"],
			references: vuln.references
		});
		for (const alias of vuln.aliases) for (const post of posts) for (const nodeVuln of post.vulnerabilities) if (nodeVuln.cve === alias || nodeVuln.cve === vuln.id) {
			const existing = findingsMap.get(findingId);
			addSource(existing, "node-blog");
			existing.severity = higherSeverity(existing.severity, nodeVuln.severity);
		}
	}
}
function findExistingFinding(findingsMap, depKey, candidateIds) {
	const ids = candidateIds.filter(Boolean);
	for (const id of ids) {
		const direct = findingsMap.get(`${id}-${depKey}`);
		if (direct) return direct;
	}
	for (const finding of findingsMap.values()) {
		if (`${finding.packageName}@${finding.installedVersion}` !== depKey) continue;
		if (ids.includes(finding.id)) return finding;
	}
}
function ingestGithubAdvisoryFindings(findingsMap, githubResult, depLookup) {
	const depKey = `${githubResult.packageName}@${githubResult.packageVersion}`;
	const dep = depLookup.get(depKey);
	for (const vuln of githubResult.vulnerabilities) {
		const findingId = `${vuln.id}-${depKey}`;
		const existing = findExistingFinding(findingsMap, depKey, [vuln.id, ...vuln.aliases]);
		if (existing) {
			addSource(existing, "github-advisory");
			mergeGithubMetadata(existing, {
				references: vuln.references,
				fixedIn: vuln.fixedIn,
				cvssScore: vuln.cvssScore,
				cvssVector: vuln.cvssVector,
				epssPercentage: vuln.epssPercentage,
				cwes: vuln.cwes
			});
			existing.severity = higherSeverity(existing.severity, vuln.severity);
			continue;
		}
		findingsMap.set(findingId, {
			id: vuln.id,
			packageName: githubResult.packageName,
			installedVersion: githubResult.packageVersion,
			isDirect: dep?.isDirect ?? false,
			isPeer: dep?.isPeer ?? false,
			dependencyKind: dep?.dependencyKind ?? "transitive",
			dependencyPaths: dep?.dependencyPaths ?? [[githubResult.packageName]],
			severity: vuln.severity === "Unknown" ? "Medium" : vuln.severity,
			type: classifyFromDescription(vuln.summary + " " + vuln.details),
			title: vuln.summary || vuln.id,
			description: vuln.details.slice(0, 300),
			affectedVersions: vuln.affectedVersions,
			fixedIn: vuln.fixedIn,
			action: suggestedAction(githubResult.packageName, dep, vuln.fixedIn),
			riskContext: riskContext(dep),
			sources: ["github-advisory"],
			references: vuln.references,
			cvssScore: vuln.cvssScore ?? void 0,
			cvssVector: vuln.cvssVector ?? void 0,
			epssPercentage: vuln.epssPercentage ?? void 0,
			cwes: vuln.cwes.length > 0 ? vuln.cwes : void 0
		});
	}
}
function ingestDependabotAlert(findingsMap, alert, depLookup) {
	const depKey = `${alert.packageName}@${alert.packageVersion}`;
	const dep = depLookup.get(depKey);
	const findingId = `${alert.ghsaId || alert.cveId || `dependabot-${alert.alertNumber}`}-${depKey}`;
	const existing = findExistingFinding(findingsMap, depKey, [alert.ghsaId, alert.cveId]);
	if (existing) {
		addSource(existing, "github-dependabot");
		existing.githubAlertUrl = alert.htmlUrl || existing.githubAlertUrl;
		existing.manifestPath = alert.manifestPath || existing.manifestPath;
		existing.alertState = alert.alertState || existing.alertState;
		existing.scope = alert.scope !== "unknown" ? alert.scope : existing.scope;
		existing.severity = higherSeverity(existing.severity, alert.severity);
		if (alert.fixedIn) existing.fixedIn = alert.fixedIn;
		return;
	}
	findingsMap.set(findingId, {
		id: alert.ghsaId || alert.cveId || `dependabot-${alert.alertNumber}`,
		packageName: alert.packageName,
		installedVersion: alert.packageVersion,
		isDirect: dep?.isDirect ?? false,
		isPeer: dep?.isPeer ?? false,
		dependencyKind: dep?.dependencyKind ?? "transitive",
		dependencyPaths: dep?.dependencyPaths ?? [[alert.packageName]],
		severity: alert.severity === "Unknown" ? "Medium" : alert.severity,
		type: classifyFromDescription(alert.title + " " + alert.description),
		title: alert.title,
		description: alert.description.slice(0, 300),
		affectedVersions: alert.affectedVersions,
		fixedIn: alert.fixedIn,
		action: suggestedAction(alert.packageName, dep, alert.fixedIn),
		riskContext: dependabotRiskContext(alert, dep),
		sources: ["github-dependabot"],
		references: alert.references,
		githubAlertUrl: alert.htmlUrl,
		manifestPath: alert.manifestPath,
		alertState: alert.alertState,
		scope: alert.scope
	});
}
function addSource(finding, source) {
	if (!finding.sources.includes(source)) finding.sources.push(source);
}
function mergeGithubMetadata(finding, metadata) {
	finding.references = [.../* @__PURE__ */ new Set([...finding.references, ...metadata.references])];
	if (metadata.fixedIn && !finding.fixedIn) finding.fixedIn = metadata.fixedIn;
	if (metadata.cvssScore != null) finding.cvssScore = metadata.cvssScore;
	if (metadata.cvssVector) finding.cvssVector = metadata.cvssVector;
	if (metadata.epssPercentage != null) finding.epssPercentage = metadata.epssPercentage;
	if (metadata.cwes.length > 0) finding.cwes = metadata.cwes;
}
function dependabotRiskContext(alert, dep) {
	const base = `Dependabot confirmed this ${alert.scope === "runtime" ? "runtime" : alert.scope === "development" ? "development" : "unknown"} alert in ${alert.manifestPath}.`;
	if (dep?.dependencyKind === "prod") return `${base} Direct production dependency.`;
	if (dep?.dependencyKind === "dev") return `${base} Direct dev dependency.`;
	return `${base} Transitive dependency.`;
}
function suggestedAction(packageName, dep, fixedIn) {
	const target = fixedIn ? `${packageName}@${fixedIn}` : packageName;
	if (!dep || dep.dependencyKind === "transitive") {
		const parent = dep?.dependencyPaths[0]?.at(-2);
		return parent ? `Update the parent dependency that brings this in, starting with ${parent}.` : `Update the parent dependency that brings in ${packageName}.`;
	}
	if (dep.dependencyKind === "prod") return `Update runtime dependency to ${target}.`;
	if (dep.dependencyKind === "dev") return `Update dev dependency to ${target}.`;
	return `Update peer dependency range to allow ${target}.`;
}
function riskContext(dep) {
	if (!dep) return "Dependency relationship could not be resolved from the lockfile.";
	if (dep.dependencyKind === "prod") return "Direct runtime dependency; prioritize because it can affect package consumers.";
	if (dep.dependencyKind === "dev") return "Direct dev dependency; usually affects local tooling, tests, builds, or publishing.";
	if (dep.dependencyKind === "peer") return "Peer dependency; review the supported version range and consuming projects.";
	const root = dep.dependencyPaths[0]?.[0];
	return root ? `Transitive dependency via ${root}; update the nearest parent dependency when possible.` : "Transitive dependency; update the parent dependency when possible.";
}
function classifyFromDescription(text) {
	const lower = text.toLowerCase();
	for (const [pattern, label] of [
		["prototype pollution", "Prototype Pollution"],
		["denial of service", "Denial of Service"],
		["redos", "ReDoS"],
		["regular expression", "ReDoS"],
		["xss", "Cross-Site Scripting"],
		["cross-site scripting", "Cross-Site Scripting"],
		["code injection", "Code Injection"],
		["command injection", "Command Injection"],
		["sql injection", "SQL Injection"],
		["path traversal", "Path Traversal"],
		["directory traversal", "Path Traversal"],
		["buffer overflow", "Buffer Overflow"],
		["remote code", "Remote Code Execution"],
		["arbitrary code", "Remote Code Execution"],
		["privilege escalation", "Privilege Escalation"],
		["authentication bypass", "Authentication Bypass"],
		["information disclosure", "Information Disclosure"],
		["information exposure", "Information Disclosure"],
		["open redirect", "Open Redirect"],
		["ssrf", "Server-Side Request Forgery"],
		["csrf", "Cross-Site Request Forgery"]
	]) if (lower.includes(pattern)) return label;
	return "Other";
}
function higherSeverity(a, b) {
	const rank = {
		Critical: 4,
		High: 3,
		Medium: 2,
		Low: 1,
		Unknown: 0
	};
	return (rank[a] || 0) >= (rank[b] || 0) ? a : b;
}
function correlate(deps, nodeVersion, posts, osvResults, githubAdvisoryResults = [], dependabotAlerts = []) {
	const nodeVersionFindings = correlateNodeVersion(nodeVersion, posts);
	const dependencyFindings = correlateDependencies(deps, osvResults, posts, githubAdvisoryResults, dependabotAlerts);
	dependencyFindings.sort((a, b) => {
		const severityRank = {
			Critical: 4,
			High: 3,
			Medium: 2,
			Low: 1,
			Unknown: 0
		};
		const sDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
		if (sDiff !== 0) return sDiff;
		if (a.isDirect && !b.isDirect) return -1;
		if (!a.isDirect && b.isDirect) return 1;
		return 0;
	});
	const summary = {
		critical: dependencyFindings.filter((f) => f.severity === "Critical").length,
		high: dependencyFindings.filter((f) => f.severity === "High").length,
		medium: dependencyFindings.filter((f) => f.severity === "Medium").length,
		low: dependencyFindings.filter((f) => f.severity === "Low").length,
		unknown: dependencyFindings.filter((f) => f.severity === "Unknown").length,
		total: dependencyFindings.length,
		affectedDirect: dependencyFindings.filter((f) => f.isDirect).length,
		affectedTransitive: dependencyFindings.filter((f) => !f.isDirect && !f.isPeer).length,
		affectedPeer: dependencyFindings.filter((f) => f.isPeer).length
	};
	return {
		scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
		projectNodeVersion: nodeVersion,
		totalDeps: deps.length,
		nodeVersionFindings,
		dependencyFindings,
		summary
	};
}
//#endregion
//#region src/lib/env.utils.ts
const ENV_FILENAMES = [".env", ".env.local"];
/** Load `.env` / `.env.local` from a project root without overriding existing shell env. */
function loadProjectEnv(projectRoot) {
	for (const filename of ENV_FILENAMES) {
		const filePath = join(projectRoot, filename);
		if (!existsSync(filePath)) continue;
		applyEnvFile(readFileSync(filePath, "utf-8"));
	}
}
function applyEnvFile(content) {
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const equalsIndex = trimmed.indexOf("=");
		if (equalsIndex === -1) continue;
		const key = trimmed.slice(0, equalsIndex).trim();
		if (!key || process.env[key] !== void 0) continue;
		let value = trimmed.slice(equalsIndex + 1).trim();
		if (value.startsWith("\"") && value.endsWith("\"") || value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
		process.env[key] = value;
	}
}
//#endregion
//#region src/constants/source-endpoints.constants.ts
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";
const GITHUB_MEDIA_TYPE = "application/vnd.github+json";
/**
* Auto-detected env var names when --github-token-env is omitted.
* Order matters: first non-empty wins. Shell env takes precedence over .env file values.
*/
const GITHUB_TOKEN_ENV_FALLBACKS = [
	"NPM_TOKEN",
	"GH_TOKEN",
	"GITHUB_TOKEN"
];
/** Optional path to a file containing the token (used after env var fallbacks). */
const GITHUB_TOKEN_FILE_ENV = "GITHUB_TOKEN_FILE";
//#endregion
//#region src/lib/github-source.utils.ts
const ADVISORY_CACHE_PREFIX = "github-advisory-v1";
function resolveGithubToken(tokenEnv) {
	const envNames = tokenEnv ? parseTokenEnvNames(tokenEnv) : [...GITHUB_TOKEN_ENV_FALLBACKS];
	for (const name of envNames) {
		const value = process.env[name]?.trim();
		if (value) return value;
	}
	return readTokenFromFile(process.env[GITHUB_TOKEN_FILE_ENV]);
}
function githubTokenEnvLabel(tokenEnv) {
	if (tokenEnv) return parseTokenEnvNames(tokenEnv).join(" or ");
	const fileHint = process.env["GITHUB_TOKEN_FILE"] ? ` or ${GITHUB_TOKEN_FILE_ENV}` : "";
	return `${GITHUB_TOKEN_ENV_FALLBACKS.join(" or ")}${fileHint}`;
}
function parseTokenEnvNames(tokenEnv) {
	return tokenEnv.split(",").map((name) => name.trim()).filter(Boolean);
}
function readTokenFromFile(filePath) {
	if (!filePath?.trim()) return void 0;
	try {
		if (!existsSync(filePath)) return void 0;
		return readFileSync(filePath, "utf-8").trim() || void 0;
	} catch {
		return;
	}
}
function parseGithubRepoFromRemote(remoteUrl) {
	const sshMatch = remoteUrl.match(/git@github\.com:([^/]+\/[^/.]+)(?:\.git)?$/);
	if (sshMatch) return sshMatch[1];
	const httpsMatch = remoteUrl.match(/github\.com\/([^/]+\/[^/.]+)(?:\.git)?$/);
	if (httpsMatch) return httpsMatch[1];
	return null;
}
function detectGithubRepo(projectRoot) {
	try {
		return parseGithubRepoFromRemote(execSync("git remote get-url origin", {
			cwd: projectRoot,
			encoding: "utf-8",
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			]
		}).trim());
	} catch {
		return null;
	}
}
async function queryGithubAdvisoryBatch(packages, cacheOpts = {}, token, options = {}) {
	const unique = dedupePackages(packages);
	const results = [];
	if (options.verbose) console.log(`[github-advisory] Querying ${unique.length} package versions`);
	options.onProgress?.(0, unique.length);
	for (let i = 0; i < unique.length; i++) {
		const { name, version } = unique[i];
		results.push(await queryGithubAdvisorySingle(name, version, cacheOpts, token, options));
		options.onProgress?.(i + 1, unique.length);
	}
	return results;
}
async function queryGithubAdvisorySingle(name, version, cacheOpts = {}, token, options = {}) {
	const cacheKey = `${ADVISORY_CACHE_PREFIX}-${name}@${version}`;
	const cached = getCached(cacheKey, cacheOpts);
	if (cached) return cached;
	const fetch = (await import("node-fetch")).default;
	const params = new URLSearchParams({
		ecosystem: "npm",
		affects: `${name}@${version}`,
		type: "reviewed"
	});
	const headers = githubHeaders(token);
	const res = await fetch(`${GITHUB_API_BASE}/advisories?${params.toString()}`, { headers });
	if (!res.ok) {
		if (options.verbose) console.warn(`[github-advisory] Warning: query failed for ${name}@${version} (${String(res.status)})`);
		return {
			packageName: name,
			packageVersion: version,
			vulnerabilities: []
		};
	}
	return setCache(cacheKey, {
		packageName: name,
		packageVersion: version,
		vulnerabilities: (await res.json()).filter((advisory) => !advisory.withdrawn_at).map((advisory) => parseGithubAdvisory(advisory, name, version))
	}, cacheOpts);
}
async function fetchDependabotAlerts(repository, cacheOpts = {}, token, alertStates = ["open"], options = {}) {
	if (!token) {
		if (options.verbose) console.warn(`[github-dependabot] Warning: ${githubTokenEnvLabel()} required for Dependabot alerts`);
		return [];
	}
	const cacheKey = `${ADVISORY_CACHE_PREFIX}-dependabot-${repository}-${alertStates.join(",")}`;
	const cached = getCached(cacheKey, cacheOpts);
	if (cached) return cached;
	const fetch = (await import("node-fetch")).default;
	const [owner, repo] = repository.split("/");
	if (!owner || !repo) {
		if (options.verbose) console.warn(`[github-dependabot] Warning: invalid repository "${repository}"`);
		return [];
	}
	const alerts = [];
	let after;
	do {
		const params = new URLSearchParams({
			ecosystem: "npm",
			per_page: String(100)
		});
		for (const state of alertStates) params.append("state", state);
		if (after) params.set("after", after);
		const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/dependabot/alerts?${params.toString()}`, { headers: githubHeaders(token) });
		if (!res.ok) {
			if (options.verbose) console.warn(`[github-dependabot] Warning: fetch failed for ${repository} (${String(res.status)})`);
			break;
		}
		const page = await res.json();
		alerts.push(...page.map(parseDependabotAlert));
		after = parseLinkAfter(res.headers.get("link"));
	} while (after);
	return setCache(cacheKey, alerts, cacheOpts);
}
function githubHeaders(token) {
	const headers = {
		"Accept": GITHUB_MEDIA_TYPE,
		"X-GitHub-Api-Version": GITHUB_API_VERSION
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}
function parseGithubAdvisory(advisory, packageName, _packageVersion) {
	const vulnEntry = advisory.vulnerabilities?.find((entry) => entry.package?.name === packageName) || advisory.vulnerabilities?.[0];
	const fixedIn = vulnEntry?.first_patched_version?.identifier || null;
	const aliases = [advisory.ghsa_id, advisory.cve_id].filter(Boolean);
	return {
		id: advisory.ghsa_id || advisory.cve_id || "unknown",
		summary: advisory.summary || "",
		details: (advisory.description || "").slice(0, 500),
		severity: mapGithubSeverity(advisory.severity),
		aliases,
		affectedVersions: vulnEntry?.vulnerable_version_range || "unknown",
		fixedIn,
		references: (advisory.references || []).flatMap((ref) => ref.url ? [ref.url] : []),
		published: advisory.published_at || "",
		modified: advisory.updated_at || "",
		cvssScore: advisory.cvss?.score ?? null,
		cvssVector: advisory.cvss?.vector_string ?? null,
		epssPercentage: advisory.epss?.percentage ?? null,
		cwes: (advisory.cwes || []).map((cwe) => cwe.cwe_id).filter(Boolean)
	};
}
function parseDependabotAlert(alert) {
	const advisory = alert.security_advisory;
	const vuln = alert.security_vulnerability;
	const packageName = vuln?.package?.name || alert.dependency?.package?.name || "unknown";
	const packageVersion = alert.dependency?.version || "unknown";
	return {
		alertNumber: alert.number,
		packageName,
		packageVersion,
		severity: mapGithubSeverity(advisory?.severity),
		title: advisory?.summary || packageName,
		description: (advisory?.description || "").slice(0, 500),
		affectedVersions: vuln?.vulnerable_version_range || "unknown",
		fixedIn: vuln?.first_patched_version?.identifier || null,
		ghsaId: advisory?.ghsa_id || null,
		cveId: advisory?.cve_id || null,
		manifestPath: alert.dependency?.manifest_path || "unknown",
		scope: mapDependabotScope(alert.dependency?.scope),
		alertState: alert.state || "unknown",
		htmlUrl: alert.html_url || "",
		references: advisory?.references?.flatMap((ref) => ref.url ? [ref.url] : []) || []
	};
}
function mapGithubSeverity(severity) {
	switch ((severity || "").toLowerCase()) {
		case "critical": return "Critical";
		case "high": return "High";
		case "medium":
		case "moderate": return "Medium";
		case "low": return "Low";
		default: return "Unknown";
	}
}
function mapDependabotScope(scope) {
	if (scope === "runtime") return "runtime";
	if (scope === "development") return "development";
	return "unknown";
}
function dedupePackages(packages) {
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	for (const pkg of packages) {
		const key = `${pkg.name}@${pkg.version}`;
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(pkg);
	}
	return unique;
}
function parseLinkAfter(linkHeader) {
	if (!linkHeader) return void 0;
	for (const part of linkHeader.split(",")) {
		const match = part.match(/<([^>]+)>;\s*rel="next"/);
		if (!match) continue;
		return new URL(match[1]).searchParams.get("after") || void 0;
	}
}
//#endregion
//#region src/lib/lockfile.utils.ts
/**
* Auto-detect and parse the lockfile in the given project root. Supports package-lock.json (v2/v3) and
* pnpm-lock.yaml.
*/
function parseLockfile(projectRoot) {
	const npmLockPath = join(projectRoot, "package-lock.json");
	const pnpmLockPath = join(projectRoot, "pnpm-lock.yaml");
	const pkgJsonPath = join(projectRoot, "package.json");
	let prodDeps = /* @__PURE__ */ new Set();
	let devDeps = /* @__PURE__ */ new Set();
	let peerDeps = /* @__PURE__ */ new Set();
	let nodeVersion = null;
	if (existsSync(pkgJsonPath)) {
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
		prodDeps = new Set(Object.keys(pkgJson.dependencies || {}));
		devDeps = new Set(Object.keys(pkgJson.devDependencies || {}));
		peerDeps = new Set(Object.keys(pkgJson.peerDependencies || {}));
		nodeVersion = pkgJson.engines?.node || null;
	}
	if (!nodeVersion) for (const f of [".nvmrc", ".node-version"]) {
		const p = join(projectRoot, f);
		if (existsSync(p)) {
			nodeVersion = readFileSync(p, "utf-8").trim().replace(/^v/, "");
			break;
		}
	}
	if (existsSync(npmLockPath)) return {
		format: "npm",
		nodeVersion,
		deps: parseNpmLock(npmLockPath, prodDeps, devDeps, peerDeps)
	};
	if (existsSync(pnpmLockPath)) return {
		format: "pnpm",
		nodeVersion,
		deps: parsePnpmLock(pnpmLockPath, prodDeps, devDeps, peerDeps)
	};
	throw new Error(`No supported lockfile found in ${projectRoot}. Expected package-lock.json or pnpm-lock.yaml`);
}
function getDependencyKind(name, prodDeps, devDeps, peerDeps) {
	if (prodDeps.has(name)) return "prod";
	if (devDeps.has(name)) return "dev";
	if (peerDeps.has(name)) return "peer";
	return "transitive";
}
function parseNpmLock(lockPath, prodDeps, devDeps, peerDeps) {
	const lock = JSON.parse(readFileSync(lockPath, "utf-8"));
	const deps = [];
	const packages = lock.packages || {};
	const directDeps = /* @__PURE__ */ new Set([...prodDeps, ...devDeps]);
	for (const [pkgPath, meta] of Object.entries(packages)) {
		if (!pkgPath || typeof meta !== "object" || meta === null) continue;
		const version = "version" in meta && typeof meta.version === "string" ? meta.version : void 0;
		const segments = pkgPath.replace(/^node_modules\//, "").split("node_modules/");
		const name = segments[segments.length - 1];
		if (!name || !version) continue;
		deps.push({
			name,
			version,
			isDirect: directDeps.has(name),
			isPeer: peerDeps.has(name),
			dependencyKind: getDependencyKind(name, prodDeps, devDeps, peerDeps),
			dependencyPaths: [[name]]
		});
	}
	if (deps.length === 0 && lock.dependencies) parseNpmLockV1(lock.dependencies, prodDeps, devDeps, peerDeps, deps);
	return deps;
}
function parseNpmLockV1(dependencies, prodDeps, devDeps, peerDeps, result, parentPath = []) {
	const directDeps = /* @__PURE__ */ new Set([...prodDeps, ...devDeps]);
	for (const [name, meta] of Object.entries(dependencies)) {
		if (typeof meta !== "object" || meta === null) continue;
		const dependencyMeta = meta;
		const dependencyPath = [...parentPath, name];
		if (dependencyMeta.version) result.push({
			name,
			version: dependencyMeta.version,
			isDirect: directDeps.has(name),
			isPeer: peerDeps.has(name),
			dependencyKind: getDependencyKind(name, prodDeps, devDeps, peerDeps),
			dependencyPaths: [dependencyPath]
		});
		if (dependencyMeta.dependencies) parseNpmLockV1(dependencyMeta.dependencies, prodDeps, devDeps, peerDeps, result, dependencyPath);
	}
}
function parsePnpmPackageId(key) {
	const match = key.match(/^\/?(@?[^@]+)@(.+)$/);
	if (!match) return null;
	return {
		name: match[1],
		version: cleanPnpmVersion(match[2])
	};
}
function cleanPnpmVersion(version) {
	return version.replace(/\(.*\)/, "").trim();
}
function resolvePnpmSnapshotKey(packageName, packageRef, snapshots) {
	const preferredKey = `${packageName}@${packageRef}`;
	if (preferredKey in snapshots) return preferredKey;
	const cleanRef = cleanPnpmVersion(packageRef);
	for (const key of Object.keys(snapshots)) {
		const id = parsePnpmPackageId(key);
		if (id?.name === packageName && id.version === cleanRef) return key;
	}
	return null;
}
function collectPnpmDependencyPaths(lock) {
	const snapshots = lock.snapshots || {};
	const importer = lock.importers?.["."];
	const paths = /* @__PURE__ */ new Map();
	if (!importer) return paths;
	const rootDependencies = [
		...Object.entries(importer.dependencies || {}),
		...Object.entries(importer.devDependencies || {}),
		...Object.entries(importer.peerDependencies || {})
	];
	const queue = [];
	for (const [name, meta] of rootDependencies) {
		if (!meta.version) continue;
		const key = resolvePnpmSnapshotKey(name, meta.version, snapshots);
		if (!key) continue;
		queue.push({
			key,
			path: [name]
		});
	}
	const seen = /* @__PURE__ */ new Set();
	while (queue.length > 0) {
		const item = queue.shift();
		const id = parsePnpmPackageId(item.key);
		if (!id) continue;
		const depKey = `${id.name}@${id.version}`;
		const existingPaths = paths.get(depKey) || [];
		if (!existingPaths.some((path) => path.join(">") === item.path.join(">"))) paths.set(depKey, [...existingPaths, item.path]);
		const visitKey = `${item.key}:${item.path.join(">")}`;
		if (seen.has(visitKey)) continue;
		seen.add(visitKey);
		const snapshot = snapshots[item.key];
		const childDependencies = {
			...snapshot?.dependencies,
			...snapshot?.optionalDependencies
		};
		for (const [childName, childRef] of Object.entries(childDependencies)) {
			const childKey = resolvePnpmSnapshotKey(childName, childRef, snapshots);
			if (!childKey) continue;
			queue.push({
				key: childKey,
				path: [...item.path, childName]
			});
		}
	}
	return paths;
}
function parsePnpmLock(lockPath, prodDeps, devDeps, peerDeps) {
	const lock = load(readFileSync(lockPath, "utf-8"));
	const deps = [];
	const packages = lock.packages || {};
	const dependencyPaths = collectPnpmDependencyPaths(lock);
	const directDeps = /* @__PURE__ */ new Set([...prodDeps, ...devDeps]);
	for (const [key] of Object.entries(packages)) {
		const id = parsePnpmPackageId(key);
		if (!id) continue;
		deps.push({
			name: id.name,
			version: id.version,
			isDirect: directDeps.has(id.name),
			isPeer: peerDeps.has(id.name),
			dependencyKind: getDependencyKind(id.name, prodDeps, devDeps, peerDeps),
			dependencyPaths: dependencyPaths.get(`${id.name}@${id.version}`) || [[id.name]]
		});
	}
	return deps;
}
//#endregion
//#region src/lib/node-posts.utils.ts
const NODE_BLOG_VULN_FEED = "https://nodejs.org/en/blog/vulnerability";
const CACHE_KEY_PREFIX$1 = "node-security-posts";
async function fetchSecurityPostUrls(count = 5) {
	const fetch = (await import("node-fetch")).default;
	const html = await (await fetch(NODE_BLOG_VULN_FEED)).text();
	const linkPattern = /href="(\/en\/blog\/vulnerability\/[^"]+)"/g;
	const urls = [];
	let match;
	while ((match = linkPattern.exec(html)) !== null && urls.length < count) {
		const fullUrl = `https://nodejs.org${match[1]}`;
		if (!urls.includes(fullUrl)) urls.push(fullUrl);
	}
	return urls;
}
async function fetchPostContent(url) {
	const fetch = (await import("node-fetch")).default;
	return (await fetch(url)).text();
}
function extractVulnsFromHtml(html, postUrl, postDate) {
	const vulns = [];
	const cves = [...new Set(html.match(/CVE-\d{4}-\d{4,}/g) || [])];
	const severityMap = {
		critical: "Critical",
		high: "High",
		medium: "Medium",
		moderate: "Medium",
		low: "Low"
	};
	for (const cve of cves) {
		const cveIdx = html.indexOf(cve);
		if (cveIdx === -1) continue;
		const start = Math.max(0, cveIdx - 500);
		const end = Math.min(html.length, cveIdx + 1500);
		const textContext = html.slice(start, end).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
		let severity = "Medium";
		for (const [keyword, level] of Object.entries(severityMap)) if (textContext.toLowerCase().includes(keyword)) {
			severity = level;
			break;
		}
		const versions = textContext.match(/(\d+\.\d+\.\d+)/g) || [];
		vulns.push({
			cve,
			title: extractTitle(textContext, cve),
			description: textContext.slice(0, 300).trim(),
			severity,
			type: classifyVulnType(textContext),
			affectedVersions: versions.length > 0 ? `< ${versions[versions.length - 1]}` : "unknown",
			patchedIn: versions.length > 0 ? versions[versions.length - 1] : "unknown",
			postUrl,
			postDate
		});
	}
	return vulns;
}
function extractTitle(text, cve) {
	const lines = text.split(/[.\n]/);
	for (const line of lines) if (line.includes(cve) && line.trim().length > 20) return line.trim().slice(0, 120);
	return cve;
}
function classifyVulnType(text) {
	const lower = text.toLowerCase();
	for (const [pattern, label] of [
		["http request smuggling", "HTTP Request Smuggling"],
		["http smuggling", "HTTP Request Smuggling"],
		["buffer overflow", "Buffer Overflow"],
		["buffer over-read", "Buffer Over-read"],
		["dns rebinding", "DNS Rebinding"],
		["dns rebind", "DNS Rebinding"],
		["path traversal", "Path Traversal"],
		["directory traversal", "Path Traversal"],
		["denial of service", "Denial of Service"],
		["denial-of-service", "Denial of Service"],
		["dos", "Denial of Service"],
		["prototype pollution", "Prototype Pollution"],
		["code injection", "Code Injection"],
		["remote code execution", "Remote Code Execution"],
		["rce", "Remote Code Execution"],
		["privilege escalation", "Privilege Escalation"],
		["permission", "Permission Bypass"],
		["bypass", "Security Bypass"],
		["memory leak", "Memory Leak"],
		["use after free", "Use After Free"],
		["integer overflow", "Integer Overflow"],
		["race condition", "Race Condition"],
		["timing attack", "Timing Attack"],
		["side channel", "Side Channel Attack"],
		["certificate", "Certificate Validation"],
		["tls", "TLS/SSL Issue"],
		["ssl", "TLS/SSL Issue"],
		["xss", "Cross-Site Scripting"],
		["cross-site", "Cross-Site Scripting"],
		["header injection", "Header Injection"],
		["crlf", "CRLF Injection"],
		["regex", "ReDoS"],
		["redos", "ReDoS"]
	]) if (lower.includes(pattern)) return label;
	return "Other";
}
async function scrapeNodeSecurityPosts(count = 5, cacheOpts = {}, options = {}) {
	const cacheKey = `${CACHE_KEY_PREFIX$1}-${count}`;
	const cached = getCached(cacheKey, cacheOpts);
	if (cached) {
		if (options.verbose) console.log(`[cache hit] Using cached Node.js security posts (${cached.length} posts)`);
		return cached;
	}
	if (options.verbose) console.log(`[fetch] Retrieving last ${count} Node.js security post URLs...`);
	const urls = await fetchSecurityPostUrls(count);
	if (options.verbose) console.log(`[fetch] Found ${urls.length} security post URLs`);
	const posts = [];
	for (const url of urls) {
		if (options.verbose) console.log(`[fetch] Parsing: ${url}`);
		const html = await fetchPostContent(url);
		const dateMatch = url.match(/(\w+-\d{4})/);
		const postDate = dateMatch ? dateMatch[1] : "unknown";
		const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : url.split("/").pop() || url;
		const vulns = extractVulnsFromHtml(html, url, postDate);
		posts.push({
			url,
			title,
			date: postDate,
			vulnerabilities: vulns
		});
	}
	setCache(cacheKey, posts, cacheOpts);
	return posts;
}
//#endregion
//#region src/lib/osv.utils.ts
const OSV_API_BASE = "https://api.osv.dev/v1";
const CACHE_KEY_PREFIX = "osv-query-v2";
async function queryOsvSingle(name, version, cacheOpts = {}, options = {}) {
	const cacheKey = `${CACHE_KEY_PREFIX}-${name}@${version}`;
	const cached = getCached(cacheKey, cacheOpts);
	if (cached) return cached;
	const fetch = (await import("node-fetch")).default;
	const res = await fetch(`${OSV_API_BASE}/query`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			version,
			package: {
				name,
				ecosystem: "npm"
			}
		})
	});
	if (!res.ok) {
		if (options.verbose) console.warn(`[osv] Warning: query failed for ${name}@${version} (${res.status})`);
		return {
			packageName: name,
			packageVersion: version,
			vulnerabilities: []
		};
	}
	const data = await res.json();
	const result = {
		packageName: name,
		packageVersion: version,
		vulnerabilities: (await Promise.all((data.vulns || []).map((v) => fetchOsvVulnDetail(v, cacheOpts)))).map((v) => parseOsvVuln(v, name))
	};
	setCache(cacheKey, result, cacheOpts);
	return result;
}
async function queryOsvBatch(packages, cacheOpts = {}, options = {}) {
	const fetch = (await import("node-fetch")).default;
	const total = packages.length;
	const results = [];
	const uncached = [];
	let completed = 0;
	const tick = () => {
		completed += 1;
		options.onProgress?.(completed, total);
	};
	options.onProgress?.(0, total);
	for (let i = 0; i < packages.length; i++) {
		const { name, version } = packages[i];
		const cached = getCached(`${CACHE_KEY_PREFIX}-${name}@${version}`, cacheOpts);
		if (cached) {
			results[i] = cached;
			tick();
		} else uncached.push({
			name,
			version,
			index: i
		});
	}
	if (uncached.length === 0) {
		if (options.verbose) console.log(`[osv] All ${packages.length} packages served from cache`);
		return results;
	}
	if (options.verbose) console.log(`[osv] Querying ${uncached.length} packages (${packages.length - uncached.length} cached)`);
	const BATCH_SIZE = 100;
	for (let offset = 0; offset < uncached.length; offset += BATCH_SIZE) {
		const chunk = uncached.slice(offset, offset + BATCH_SIZE);
		const queries = chunk.map(({ name, version }) => ({
			version,
			package: {
				name,
				ecosystem: "npm"
			}
		}));
		try {
			const res = await fetch(`${OSV_API_BASE}/querybatch`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ queries })
			});
			if (!res.ok) {
				if (options.verbose) console.warn(`[osv] Batch query failed (${res.status}), falling back to individual queries`);
				for (const item of chunk) {
					results[item.index] = await queryOsvSingle(item.name, item.version, cacheOpts, options);
					tick();
				}
				continue;
			}
			const batchResults = (await res.json()).results || [];
			for (let j = 0; j < chunk.length; j++) {
				const { name, version, index } = chunk[j];
				const result = {
					packageName: name,
					packageVersion: version,
					vulnerabilities: (await Promise.all((batchResults[j]?.vulns || []).map((v) => fetchOsvVulnDetail(v, cacheOpts)))).map((v) => parseOsvVuln(v, name))
				};
				results[index] = result;
				setCache(`${CACHE_KEY_PREFIX}-${name}@${version}`, result, cacheOpts);
				tick();
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (options.verbose) console.warn(`[osv] Batch error: ${message}`);
			for (const item of chunk) {
				results[item.index] = {
					packageName: item.name,
					packageVersion: item.version,
					vulnerabilities: []
				};
				tick();
			}
		}
	}
	return results;
}
async function fetchOsvVulnDetail(raw, cacheOpts) {
	if (!raw.id || raw.summary || raw.affected) return raw;
	const cacheKey = `osv-vuln-detail-v1-${raw.id}`;
	const cached = getCached(cacheKey, cacheOpts);
	if (cached) return cached;
	const fetch = (await import("node-fetch")).default;
	const res = await fetch(`${OSV_API_BASE}/vulns/${raw.id}`);
	if (!res.ok) return raw;
	return setCache(cacheKey, await res.json(), cacheOpts);
}
function parseOsvVuln(raw, packageName) {
	const severity = extractSeverity(raw);
	const affected = findAffectedPackage(raw, packageName);
	const ranges = affected.ranges || [];
	const fixedVersions = [];
	const affectedRanges = [];
	for (const range of ranges) {
		let introduced = null;
		for (const event of range.events || []) {
			if (event.fixed) fixedVersions.push(event.fixed);
			if (event.introduced) introduced = event.introduced;
			if (event.last_affected && introduced) affectedRanges.push(`>= ${introduced} <= ${event.last_affected}`);
		}
		const fixed = fixedVersions[fixedVersions.length - 1];
		if (introduced && fixed) affectedRanges.push(`>= ${introduced} < ${fixed}`);
	}
	const databaseAffectedRange = affected.database_specific?.last_known_affected_version_range;
	if (databaseAffectedRange && affectedRanges.length === 0) affectedRanges.push(databaseAffectedRange);
	return {
		id: raw.id || "unknown",
		summary: raw.summary || "",
		details: (raw.details || "").slice(0, 500),
		severity,
		aliases: raw.aliases || [],
		affectedVersions: affectedRanges.join(", ") || "unknown",
		fixedIn: fixedVersions.length > 0 ? fixedVersions[fixedVersions.length - 1] : null,
		references: (raw.references || []).flatMap((r) => r.url ? [r.url] : []).slice(0, 5),
		published: raw.published || "",
		modified: raw.modified || ""
	};
}
function findAffectedPackage(raw, packageName) {
	return raw.affected?.find((affected) => affected.package?.name === packageName) || raw.affected?.[0] || {};
}
function extractSeverity(raw) {
	const dbSeverity = raw.database_specific?.severity;
	if (dbSeverity) {
		const upper = dbSeverity.toUpperCase();
		if (upper === "CRITICAL") return "Critical";
		if (upper === "HIGH") return "High";
		if (upper === "MODERATE" || upper === "MEDIUM") return "Medium";
		if (upper === "LOW") return "Low";
	}
	const severityEntries = raw.severity || [];
	for (const entry of severityEntries) {
		const numericScore = typeof entry.score === "number" ? entry.score : Number(entry.score);
		if (Number.isFinite(numericScore)) {
			if (numericScore >= 9) return "Critical";
			if (numericScore >= 7) return "High";
			if (numericScore >= 4) return "Medium";
			return "Low";
		}
		if (typeof entry.score === "string" && entry.score.startsWith("CVSS:3.")) return severityFromCvss3Vector(entry.score);
	}
	return "Unknown";
}
function severityFromCvss3Vector(vector) {
	const metrics = Object.fromEntries(vector.split("/").slice(1).map((part) => {
		const [key, value] = part.split(":");
		return [key, value];
	}));
	const attackVector = {
		N: .85,
		A: .62,
		L: .55,
		P: .2
	}[metrics.AV || ""] ?? 0;
	const attackComplexity = {
		L: .77,
		H: .44
	}[metrics.AC || ""] ?? 0;
	const scopeChanged = metrics.S === "C";
	const privilegesRequired = scopeChanged ? {
		N: .85,
		L: .68,
		H: .5
	}[metrics.PR || ""] ?? 0 : {
		N: .85,
		L: .62,
		H: .27
	}[metrics.PR || ""] ?? 0;
	const userInteraction = {
		N: .85,
		R: .62
	}[metrics.UI || ""] ?? 0;
	const confidentiality = {
		H: .56,
		L: .22,
		N: 0
	}[metrics.C || ""] ?? 0;
	const integrity = {
		H: .56,
		L: .22,
		N: 0
	}[metrics.I || ""] ?? 0;
	const availability = {
		H: .56,
		L: .22,
		N: 0
	}[metrics.A || ""] ?? 0;
	const impactSubScore = 1 - (1 - confidentiality) * (1 - integrity) * (1 - availability);
	const impact = scopeChanged ? 7.52 * (impactSubScore - .029) - 3.25 * (impactSubScore - .02) ** 15 : 6.42 * impactSubScore;
	const exploitability = 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;
	if (impact <= 0) return "Low";
	const score = scopeChanged ? roundUp(Math.min(1.08 * (impact + exploitability), 10)) : roundUp(Math.min(impact + exploitability, 10));
	if (score >= 9) return "Critical";
	if (score >= 7) return "High";
	if (score >= 4) return "Medium";
	return "Low";
}
function roundUp(input) {
	return Math.ceil(input * 10) / 10;
}
//#endregion
//#region src/lib/report-summary.utils.ts
const SEVERITY_RANK = {
	Critical: 4,
	High: 3,
	Medium: 2,
	Low: 1,
	Unknown: 0
};
function buildActionSummary(result) {
	const hasDeps = result.dependencyFindings.length > 0;
	const hasNode = result.nodeVersionFindings.length > 0;
	if (!hasDeps && !hasNode) return null;
	return {
		foundLines: buildFoundLines(result),
		actionSteps: buildActionSteps(result),
		recommendation: buildRecommendation(result),
		exposureNote: buildExposureNote(result)
	};
}
function buildFoundLines(result) {
	const counts = /* @__PURE__ */ new Map();
	for (const finding of result.dependencyFindings) {
		const scope = resolveFindingScope(finding);
		incrementCount(counts, finding.severity, scope);
	}
	for (const finding of result.nodeVersionFindings) incrementCount(counts, finding.severity, "runtime");
	const rows = [];
	const severities = [
		"Critical",
		"High",
		"Medium",
		"Low",
		"Unknown"
	];
	const scopes = ["runtime", "development"];
	for (const severity of severities) for (const scope of scopes) {
		const count = counts.get(foundKey(severity, scope)) || 0;
		if (!(severity === "Critical" && scope === "runtime") && count === 0) continue;
		rows.push({
			label: `${severity} (${scope})`,
			count,
			severity,
			scope
		});
	}
	return rows;
}
function incrementCount(counts, severity, scope) {
	const key = foundKey(severity, scope);
	counts.set(key, (counts.get(key) || 0) + 1);
}
function foundKey(severity, scope) {
	return `${severity}:${scope}`;
}
function resolveFindingScope(finding) {
	if (finding.sources.includes("github-dependabot")) {
		if (finding.scope === "runtime") return "runtime";
		if (finding.scope === "development") return "development";
	}
	return finding.dependencyKind === "prod" ? "runtime" : "development";
}
function hasRuntimeExposure(result) {
	if (result.nodeVersionFindings.length > 0) return true;
	return result.dependencyFindings.some((f) => resolveFindingScope(f) === "runtime");
}
function isDevToolchainOnly(result) {
	if (result.dependencyFindings.length === 0) return false;
	return result.dependencyFindings.every((f) => resolveFindingScope(f) === "development");
}
function buildExposureNote(result) {
	if (!isDevToolchainOnly(result) || hasRuntimeExposure(result)) return;
	return "No production runtime exposure — development / transitive toolchain only.";
}
function buildActionSteps(result) {
	const steps = [];
	let step = 1;
	const directProd = uniqueByPackage(result.dependencyFindings.filter((f) => f.dependencyKind === "prod")).toSorted(bySeverityDesc);
	for (const finding of directProd) {
		const cmd = updateCommand(finding);
		steps.push(`${step}. Update ${finding.packageName} first — ${prodPriorityReason(finding)}.\n   ${cmd}`);
		step++;
	}
	const parentRoots = collectParentUpdateTargets(result.dependencyFindings);
	if (parentRoots.length > 0) {
		const label = parentRoots.join(" ");
		steps.push(`${step}. Update the dev toolchain that pulls in transitive findings — High items usually arrive through commitlint, Vitest/Vite, or tsx.\n   pnpm update ${label}`);
		step++;
	}
	const transitiveFixes = collectTransitivePackageUpdates(result.dependencyFindings, parentRoots);
	for (const finding of transitiveFixes) {
		const cmd = updateCommand(finding);
		steps.push(`${step}. Update ${finding.packageName} (${finding.severity.toLowerCase()} transitive, development) — does not affect production runtime consumers.\n   ${cmd}`);
		step++;
	}
	if (result.nodeVersionFindings.length > 0) {
		const patched = [...new Set(result.nodeVersionFindings.map((f) => f.patchedIn))].toSorted();
		steps.push(`${step}. Upgrade Node.js to a patched release (${patched.join(" or ")}).\n   Use your version manager (.nvmrc / pnpm devEngines) and reinstall dependencies.`);
		step++;
	}
	steps.push(`${step}. Rerun the scan to confirm the tree is clean.\n   xscan --no-cache`);
	step++;
	steps.push(`${step}. If anything remains, check the Via: line in each finding — the package immediately before the vulnerable package is usually the parent that needs to move.`);
	return steps;
}
function buildRecommendation(result) {
	const directProd = result.dependencyFindings.some((f) => f.dependencyKind === "prod");
	const highTransitive = result.dependencyFindings.some((f) => f.severity === "High" && f.dependencyKind !== "prod");
	const nodeIssues = result.nodeVersionFindings.length > 0;
	if (isDevToolchainOnly(result) && !directProd && !nodeIssues) return "No production runtime exposure from these findings. They are limited to development or transitive toolchain dependencies. Apply the updates above when you next refresh dev dependencies—recommended before release, not a production deploy blocker.";
	if (directProd && highTransitive) return "Update direct runtime dependencies first, then refresh dev tooling that pulls in vulnerable transitive packages. Most findings are dev-toolchain exposure rather than runtime exposure, but High transitive findings should still be resolved before release.";
	if (directProd) return "Prioritize direct runtime dependency updates — these affect consumers of your package. Rerun xscan after upgrading to confirm the lockfile resolved the advisories.";
	if (highTransitive) return "These findings are in development tooling or transitive dependencies. Follow the update steps above, then rerun xscan to verify the lockfile picked up patched versions.";
	if (nodeIssues) return "Upgrade your Node.js runtime to a patched version, then rerun xscan. Engine advisories affect every dependency scan until the runtime itself is updated.";
	return "Review the findings above, apply the suggested updates, and rerun xscan --no-cache to confirm the dependency tree is clean.";
}
function prodPriorityReason(finding) {
	if (finding.sources.includes("github-dependabot")) {
		const scopeNote = finding.scope === "runtime" ? "GitHub Dependabot confirms this as a runtime dependency" : finding.scope === "development" ? "GitHub Dependabot confirms this as a development dependency" : "GitHub Dependabot confirmed this alert for your repository";
		if (finding.githubAlertUrl) return `${scopeNote} (${finding.githubAlertUrl})`;
		return scopeNote;
	}
	if (finding.dependencyKind === "prod") return "this is a direct production dependency and affects runtime consumers";
	if (finding.dependencyKind === "dev") return "this is a direct dev dependency used in local tooling";
	return "this dependency is declared directly in your manifest";
}
function updateCommand(finding) {
	if (finding.fixedIn) return `pnpm update ${finding.packageName}@${finding.fixedIn}`;
	return `pnpm update ${finding.packageName}`;
}
function collectParentUpdateTargets(findings) {
	const roots = /* @__PURE__ */ new Set();
	for (const finding of findings) {
		if (finding.dependencyKind === "prod") continue;
		if ((SEVERITY_RANK[finding.severity] ?? 0) < SEVERITY_RANK.Medium) continue;
		const root = finding.dependencyPaths[0]?.[0];
		if (root && root !== finding.packageName) roots.add(root);
	}
	return [...roots].toSorted();
}
/** Direct package bumps when no parent root is available (e.g. path is only the vulnerable package). */
function collectTransitivePackageUpdates(findings, parentRoots) {
	const parentSet = new Set(parentRoots);
	return uniqueByPackage(findings.filter((f) => f.dependencyKind !== "prod" && (SEVERITY_RANK[f.severity] ?? 0) >= SEVERITY_RANK.High).filter((f) => {
		const root = f.dependencyPaths[0]?.[0];
		if (root && root !== f.packageName && parentSet.has(root)) return false;
		return true;
	})).toSorted(bySeverityDesc);
}
function uniqueByPackage(findings) {
	const byPackage = /* @__PURE__ */ new Map();
	for (const finding of findings) {
		const existing = byPackage.get(finding.packageName);
		if (!existing || (SEVERITY_RANK[finding.severity] ?? 0) > (SEVERITY_RANK[existing.severity] ?? 0)) byPackage.set(finding.packageName, finding);
	}
	return [...byPackage.values()];
}
function bySeverityDesc(a, b) {
	return (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
}
//#endregion
//#region src/constants/security-sources.constants.ts
const SECURITY_SOURCE_LABELS = {
	"osv": "OSV.dev",
	"node-blog": "Node.js Blog",
	"github-advisory": "GitHub Advisory Database",
	"github-dependabot": "Dependabot"
};
//#endregion
//#region src/constants/tui.constants.ts
const HR_SEPARATOR = "─".repeat(100);
const TITLE_BORDER_OPEN = "╔══════════════════════════════════════════════════════╗";
const TITLE_BORDER_CLOSE = "╚══════════════════════════════════════════════════════╝";
//#endregion
//#region src/lib/tui.utils.ts
/** Double-line title box matching the Security Report header style. */
function printTitleBanner(label) {
	const inner = label.startsWith("  ") ? label : `  ${label}`;
	const padding = Math.max(0, 54 - inner.length);
	console.log();
	console.log(pc.bold(pc.white(TITLE_BORDER_OPEN)));
	console.log(pc.bold(pc.white("║")) + pc.bold(pc.cyan(inner)) + pc.bold(pc.white(`${" ".repeat(padding)}║`)));
	console.log(pc.bold(pc.white(TITLE_BORDER_CLOSE)));
	console.log();
}
const FETCHING_SOURCES_BANNER = "xscan — fetching vulnerability sources";
function skippedSourceLabel(label) {
	return pc.dim(`${label} (skipped)`);
}
//#endregion
//#region src/lib/report.utils.ts
function generateReport(result, format = "both", jsonOutputPath) {
	const actionSummary = buildActionSummary(result);
	let savedJsonPath;
	if (format === "json" || format === "both") {
		savedJsonPath = jsonOutputPath || "deps-xscan-report.json";
		const jsonOutput = JSON.stringify(actionSummary ? {
			...result,
			actionSummary
		} : result, null, 2);
		writeFileSync(savedJsonPath, jsonOutput, "utf-8");
	}
	if (format === "terminal" || format === "both") printTerminalReport(result, actionSummary, savedJsonPath);
	if (format === "json") console.log(`\n${pc.dim(`  JSON report saved to: ${savedJsonPath}`)}`);
}
function printTerminalReport(result, actionSummary, savedJsonPath) {
	const { summary, nodeVersionFindings, dependencyFindings } = result;
	console.log();
	printTitleBanner("deps-xscan — Security Report");
	console.log(pc.dim(`  Scanned at:     ${result.scannedAt}`));
	console.log(pc.dim(`  Node version:   ${result.projectNodeVersion || "not detected"}`));
	console.log(pc.dim(`  Total deps:     ${result.totalDeps}`));
	console.log();
	printSummaryBar(summary);
	if (nodeVersionFindings.length > 0) {
		console.log();
		console.log(pc.bold(pc.yellow("  ⚠  Node.js Version Vulnerabilities")));
		console.log(pc.dim(HR_SEPARATOR));
		for (const f of nodeVersionFindings) {
			const sevColor = severityColor(f.severity);
			console.log(`  ${sevColor(`[${f.severity.toUpperCase()}]`)} ${pc.white(f.cve)}`);
			console.log(`    ${pc.dim("Type:")}      ${f.type}`);
			console.log(`    ${pc.dim("Current:")}   v${f.currentVersion}`);
			console.log(`    ${pc.dim("Patched:")}   v${f.patchedIn}`);
			console.log(`    ${pc.dim("Details:")}   ${f.postUrl}`);
			console.log();
		}
	}
	if (dependencyFindings.length > 0) {
		console.log();
		console.log(pc.bold(pc.red("  🔍  Dependency Vulnerabilities")));
		const grouped = groupBySeverity(dependencyFindings);
		for (const [severity, findings] of grouped) {
			if (findings.length === 0) continue;
			console.log();
			printSeveritySectionHeader(severity, findings.length);
			const sevColor = severityColor(severity);
			for (const f of findings) {
				const directLabel = f.isDirect ? pc.yellow(` [direct ${f.dependencyKind}]`) : f.isPeer ? pc.magenta(" [peer]") : pc.dim(" [transitive]");
				console.log();
				console.log(`  ${sevColor("●")} ${pc.bold(pc.white(f.packageName))}@${pc.dim(f.installedVersion)}${directLabel}`);
				console.log(`    ${pc.dim("ID:")}     ${f.id}`);
				console.log(`    ${pc.dim("Type:")}   ${f.type}`);
				console.log(`    ${pc.dim("Title:")}  ${f.title.slice(0, 80)}`);
				if (f.description) console.log(`    ${pc.dim("Info:")}   ${singleLine(f.description, 100)}`);
				if (f.affectedVersions !== "unknown") console.log(`    ${pc.dim("Range:")}  ${f.affectedVersions}`);
				if (f.fixedIn) console.log(`    ${pc.dim("Fix:")}    Upgrade to ${pc.green(f.fixedIn)}`);
				else console.log(`    ${pc.dim("Fix:")}    ${pc.red("No fixed version found in advisory")}`);
				console.log(`    ${pc.dim("Via:")}    ${formatDependencyPaths(f)}`);
				console.log(`    ${pc.dim("Risk:")}   ${f.riskContext}`);
				console.log(`    ${pc.dim("Action:")} ${f.action}`);
				const reference = f.references[0];
				if (reference) console.log(`    ${pc.dim("Ref:")}    ${reference}`);
				const sourceLabels = f.sources.map((s) => pc.cyan(formatSourceLabel(s)));
				console.log(`    ${pc.dim("Source:")} ${sourceLabels.join(", ")}`);
				if (f.manifestPath && f.manifestPath !== "unknown") console.log(`    ${pc.dim("Manifest:")} ${f.manifestPath}`);
				if (f.scope && f.scope !== "unknown") console.log(`    ${pc.dim("Scope:")} ${f.scope}`);
				if (f.githubAlertUrl) console.log(`    ${pc.dim("GitHub:")} ${f.githubAlertUrl}`);
				if (f.epssPercentage != null) console.log(`    ${pc.dim("EPSS:")} ${f.epssPercentage.toFixed(2)}%`);
				if (f.cwes && f.cwes.length > 0) console.log(`    ${pc.dim("CWE:")} ${f.cwes.join(", ")}`);
			}
		}
	}
	if (dependencyFindings.length === 0 && nodeVersionFindings.length === 0) {
		console.log();
		console.log(pc.bold(pc.green("  ✅ No known vulnerabilities found!")));
		console.log(pc.dim("  Your dependency tree looks clean against all checked sources."));
	}
	console.log();
	console.log(pc.dim(HR_SEPARATOR));
	console.log();
	console.log(pc.dim("  Sources: Node.js Security Blog, OSV.dev, GitHub Advisory Database, Dependabot"));
	console.log(pc.dim("  Note: This scan is a point-in-time snapshot. New vulns may be"));
	console.log(pc.dim("  disclosed at any time. Run regularly for best coverage."));
	if (savedJsonPath) {
		console.log();
		console.log(pc.dim(`  JSON report saved to: ${savedJsonPath}`));
	}
	if (actionSummary) printActionSummary(actionSummary);
	console.log();
}
function printActionSummary(actionSummary) {
	console.log();
	console.log(pc.dim(HR_SEPARATOR));
	console.log();
	console.log(pc.bold(pc.green("SUMMARY & ACTIONS:")));
	if (actionSummary.exposureNote) console.log(pc.dim(`  ${actionSummary.exposureNote}`));
	console.log();
	printFoundLines(actionSummary.foundLines);
	console.log();
	console.log(pc.bold(pc.dim(pc.cyan("WHAT TO DO:"))));
	console.log();
	for (const step of actionSummary.actionSteps) {
		for (const [index, line] of step.split("\n").entries()) console.log(index === 0 ? line : pc.cyan(line.trim()));
		console.log();
	}
	console.log(pc.bold(pc.dim(pc.cyan("RECOMMENDATION:"))));
	console.log();
	console.log(actionSummary.recommendation);
}
function printFoundLines(lines) {
	const labelWidth = Math.max(...lines.map((line) => line.label.length));
	const countWidth = Math.max(...lines.map((line) => String(line.count).length), 1);
	for (const line of lines) {
		const label = `${line.label}:`.padEnd(labelWidth + 1);
		const count = String(line.count).padStart(countWidth);
		console.log(`${label} ${foundCountColor(line)(count)}`);
	}
}
function foundCountColor(line) {
	if (line.count === 0) return pc.green;
	return severityColor(line.severity);
}
function formatSourceLabel(source) {
	return SECURITY_SOURCE_LABELS[source] || source;
}
function singleLine(text, maxLength) {
	const cleaned = text.replace(/\s+/g, " ").trim();
	if (cleaned.length <= maxLength) return cleaned;
	return `${cleaned.slice(0, maxLength - 1)}…`;
}
function formatDependencyPaths(finding) {
	const paths = finding.dependencyPaths.slice(0, 2).map((path) => path.join(" -> "));
	const suffix = finding.dependencyPaths.length > 2 ? ` (+${finding.dependencyPaths.length - 2} more)` : "";
	return `${paths.join("; ")}${suffix}`;
}
function printSummaryBar(summary) {
	const parts = [
		summary.critical > 0 ? summaryBadge("41", "37", `${summary.critical} CRITICAL`) : null,
		summary.high > 0 ? summaryBadge("43", "30", `${summary.high} HIGH`) : null,
		summary.medium > 0 ? summaryBadge("46", "30", `${summary.medium} MEDIUM`) : null,
		summary.low > 0 ? summaryBadge("47", "30", `${summary.low} LOW`) : null
	].filter(Boolean);
	if (parts.length > 0) {
		console.log(`  ${parts.join(" ")}`);
		console.log();
		console.log(pc.dim(`  ${summary.affectedDirect} direct | ${summary.affectedTransitive} transitive | ${summary.affectedPeer} peer`));
	} else console.log(pc.green("  No vulnerabilities found ✓"));
}
/** Picocolors nests fg reset before bg close; explicit SGR keeps black on cyan legible. */
function summaryBadge(bg, fg, label) {
	if (!pc.isColorSupported) return ` ${label} `;
	return `\x1b[${bg}m\x1b[${fg}m ${label} \x1b[0m`;
}
function printSeveritySectionHeader(severity, count) {
	const label = `${severity.toUpperCase()} vulnerabilities (${count})`;
	const dashCount = Math.max(0, HR_SEPARATOR.length - label.length - 1);
	const sevColor = severityColor(severity);
	console.log(`${sevColor(label)} ${pc.dim("─".repeat(dashCount))}`);
}
function severityColor(severity) {
	switch (severity) {
		case "Critical": return pc.red;
		case "High": return pc.yellow;
		case "Medium": return pc.cyan;
		case "Low": return pc.dim;
		default: return pc.white;
	}
}
function groupBySeverity(findings) {
	const order = [
		"Critical",
		"High",
		"Medium",
		"Low",
		"Unknown"
	];
	const grouped = /* @__PURE__ */ new Map();
	for (const sev of order) grouped.set(sev, []);
	for (const f of findings) (grouped.get(f.severity) || grouped.get("Unknown")).push(f);
	return order.map((sev) => [sev, grouped.get(sev) || []]);
}
//#endregion
//#region src/commands/scan/scan.logic.ts
function log(msg, verbose) {
	if (verbose) {
		const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[1].split(".")[0];
		console.log(`[${timestamp}] ${msg}`);
	}
}
function shouldUseSpinners(verbose) {
	const forceProgress = process.env.DEMO_XSCAN_FORCE_PROGRESS === "1";
	return ((process.stdout.isTTY ?? false) || forceProgress) && !verbose;
}
function usesTerminalOutput(format) {
	return format === "terminal" || format === "both";
}
function sourceErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
function countOsvVulnerabilities(results) {
	return results.reduce((sum, r) => sum + r.vulnerabilities.length, 0);
}
function countGithubVulnerabilities(results) {
	return results.reduce((sum, r) => sum + r.vulnerabilities.length, 0);
}
async function runScanPipeline(options) {
	const cacheOpts = {
		ttlHours: options.cacheTtl,
		disabled: options.noCache
	};
	const startTime = Date.now();
	loadProjectEnv(options.project);
	log("Loaded .env from project root (if present)", options.verbose);
	if (!options.noCache) log(`  API cache directory: ${getCacheDirectory()}`, options.verbose);
	log("Stage 1: Parsing lockfile...", options.verbose);
	const lockResult = parseLockfile(options.project);
	log(`  Found ${lockResult.deps.length} deps (${lockResult.format} format)`, options.verbose);
	log(`  Node.js version: ${lockResult.nodeVersion || "not detected"}`, options.verbose);
	let { nodeVersion } = lockResult;
	if (!nodeVersion) try {
		nodeVersion = execSync("node --version", { encoding: "utf-8" }).trim().replace(/^v/, "");
		log(`  Node.js version (runtime): ${nodeVersion}`, options.verbose);
	} catch {
		log("  Could not detect Node.js version", options.verbose);
	}
	const useSpinners = shouldUseSpinners(options.verbose);
	const packages = lockResult.deps.map((d) => ({
		name: d.name,
		version: d.version
	}));
	const githubToken = resolveGithubToken(options.githubTokenEnv);
	let posts = [];
	let osvResults = packages.map((p) => ({
		packageName: p.name,
		packageVersion: p.version,
		vulnerabilities: []
	}));
	let githubAdvisoryResults = [];
	let dependabotAlerts = [];
	let osvError;
	let githubAdvisoryError;
	if (useSpinners && usesTerminalOutput(options.format)) {
		printTitleBanner(FETCHING_SOURCES_BANNER);
		await tasks(buildSourceTasks(options, cacheOpts, packages, githubToken, {
			posts: (value) => {
				posts = value;
			},
			osvResults: (value) => {
				osvResults = value;
			},
			githubAdvisoryResults: (value) => {
				githubAdvisoryResults = value;
			},
			dependabotAlerts: (value) => {
				dependabotAlerts = value;
			},
			osvError: (value) => {
				osvError = value;
			},
			githubAdvisoryError: (value) => {
				githubAdvisoryError = value;
			}
		}));
	} else await runSourcesWithoutSpinners(options, cacheOpts, packages, githubToken, {
		posts: (value) => {
			posts = value;
		},
		osvResults: (value) => {
			osvResults = value;
		},
		githubAdvisoryResults: (value) => {
			githubAdvisoryResults = value;
		},
		dependabotAlerts: (value) => {
			dependabotAlerts = value;
		},
		osvError: (value) => {
			osvError = value;
		},
		githubAdvisoryError: (value) => {
			githubAdvisoryError = value;
		}
	});
	if (!options.osvEnabled) log("  OSV.dev: skipped (--skip-osv)", options.verbose);
	else if (osvError) {
		console.warn(`Warning: OSV.dev query failed: ${sourceErrorMessage(osvError)}`);
		console.warn("Continuing without OSV.dev data...");
	} else log(`  OSV.dev: ${countOsvVulnerabilities(osvResults)} vulnerabilities`, options.verbose);
	if (!options.githubEnabled) log("  GitHub Advisory Database: skipped (--skip-github)", options.verbose);
	else if (githubAdvisoryError) {
		console.warn(`Warning: GitHub Advisory Database query failed: ${sourceErrorMessage(githubAdvisoryError)}`);
		console.warn("Continuing without GitHub advisory data...");
	} else log(`  GitHub Advisory Database: ${countGithubVulnerabilities(githubAdvisoryResults)} vulnerabilities`, options.verbose);
	if (!options.dependabot) log("  Dependabot alerts: skipped (--skip-dependabot)", options.verbose);
	else log(`  Dependabot: ${dependabotAlerts.length} open alerts`, options.verbose);
	log("Stage 5: Correlating findings...", options.verbose);
	const result = correlate(lockResult.deps, nodeVersion, posts, osvResults, githubAdvisoryResults, dependabotAlerts);
	log("Stage 6: Generating report...", options.verbose);
	generateReport(result, options.format, options.jsonOut);
	log(`Done in ${((Date.now() - startTime) / 1e3).toFixed(1)}s`, options.verbose);
	if (result.summary.critical > 0 || result.summary.high > 0) return 1;
	return 0;
}
function buildSourceTasks(options, cacheOpts, packages, githubToken, sink) {
	const repository = options.remoteRepo || detectGithubRepo(options.project);
	return [
		{
			title: `Node.js security posts (${options.nodePosts} posts)`,
			task: async () => {
				if (!options.nodePostsEnabled) return skippedSourceLabel("Node.js security posts");
				try {
					const posts = await scrapeNodeSecurityPosts(options.nodePosts, cacheOpts);
					sink.posts(posts);
					const totalCves = posts.reduce((sum, p) => sum + p.vulnerabilities.length, 0);
					return `Node.js security posts: ${posts.length} posts, ${totalCves} CVEs`;
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					console.warn(`Warning: Could not fetch Node.js security posts: ${message}`);
					console.warn("Continuing without Node.js security post data...");
					sink.posts([]);
					return "Node.js security posts unavailable; continuing without Node.js post data";
				}
			}
		},
		{
			title: `OSV.dev (${packages.length} package versions)`,
			task: async (message) => {
				if (!options.osvEnabled) return skippedSourceLabel("OSV.dev");
				try {
					const osvResults = await queryOsvBatch(packages, cacheOpts, { onProgress: (completed, total) => {
						message(`OSV.dev (${completed} / ${total} package versions)`);
					} });
					sink.osvResults(osvResults);
					return `OSV.dev: ${countOsvVulnerabilities(osvResults)} vulnerabilities`;
				} catch (err) {
					sink.osvError(err);
					return "OSV.dev unavailable; continuing without OSV data";
				}
			}
		},
		{
			title: `GitHub Advisory Database (${packages.length} package versions)`,
			task: async (message) => {
				if (!options.githubEnabled) return skippedSourceLabel("GitHub Advisory Database");
				try {
					const githubAdvisoryResults = await queryGithubAdvisoryBatch(packages, cacheOpts, githubToken, { onProgress: (completed, total) => {
						message(`GitHub Advisory Database (${completed} / ${total} package versions)`);
					} });
					sink.githubAdvisoryResults(githubAdvisoryResults);
					return `GitHub Advisory Database: ${countGithubVulnerabilities(githubAdvisoryResults)} vulnerabilities`;
				} catch (err) {
					sink.githubAdvisoryError(err);
					return "GitHub Advisory Database unavailable; continuing without GitHub advisory data";
				}
			}
		},
		{
			title: repository ? `Dependabot alerts (${repository})` : "Dependabot alerts",
			task: async () => {
				if (!options.dependabot) return skippedSourceLabel("Dependabot alerts");
				if (!repository) {
					console.warn("Warning: Could not detect GitHub repository for Dependabot alerts.");
					console.warn("  Use --remote-repo owner/repo or run from a git clone with a GitHub origin remote.");
					return skippedSourceLabel("Dependabot alerts");
				}
				if (!githubToken) {
					console.warn(`Warning: ${githubTokenEnvLabel(options.githubTokenEnv)} not set — Dependabot alerts require a GitHub token.`);
					console.warn("  Add a token to the project .env (e.g. NPM_TOKEN), export it in your shell, or set GITHUB_TOKEN_FILE.");
					return skippedSourceLabel("Dependabot alerts");
				}
				const dependabotAlerts = await fetchDependabotAlerts(repository, cacheOpts, githubToken, options.githubAlertStates);
				sink.dependabotAlerts(dependabotAlerts);
				return `Dependabot alerts: ${dependabotAlerts.length} alerts`;
			}
		}
	];
}
async function runSourcesWithoutSpinners(options, cacheOpts, packages, githubToken, sink) {
	if (!options.nodePostsEnabled) log("Stage 2: Node.js security posts skipped (--skip-node-posts)", options.verbose);
	else {
		log(`Stage 2: Scraping last ${options.nodePosts} Node.js security posts...`, options.verbose);
		try {
			const posts = await scrapeNodeSecurityPosts(options.nodePosts, cacheOpts, { verbose: options.verbose });
			sink.posts(posts);
			log(`  Extracted ${posts.reduce((sum, p) => sum + p.vulnerabilities.length, 0)} CVEs from ${posts.length} posts`, options.verbose);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.warn(`Warning: Could not fetch Node.js security posts: ${message}`);
			console.warn("Continuing without Node.js security post data...");
			sink.posts([]);
		}
	}
	log(`Stage 3: Querying OSV.dev and GitHub for ${packages.length} packages...`, options.verbose);
	const [osvSettled, githubAdvisorySettled] = await Promise.allSettled([options.osvEnabled ? queryOsvBatch(packages, cacheOpts, { verbose: options.verbose }) : Promise.resolve(null), options.githubEnabled ? queryGithubAdvisoryBatch(packages, cacheOpts, githubToken, { verbose: options.verbose }) : Promise.resolve(null)]);
	if (options.osvEnabled) {
		if (osvSettled.status === "fulfilled" && osvSettled.value) sink.osvResults(osvSettled.value);
		else if (osvSettled.status === "rejected") sink.osvError(osvSettled.reason);
	}
	if (options.githubEnabled) {
		if (githubAdvisorySettled.status === "fulfilled" && githubAdvisorySettled.value) sink.githubAdvisoryResults(githubAdvisorySettled.value);
		else if (githubAdvisorySettled.status === "rejected") sink.githubAdvisoryError(githubAdvisorySettled.reason);
	}
	if (!options.dependabot) {
		log("Stage 4: Dependabot alerts skipped (--skip-dependabot)", options.verbose);
		return;
	}
	log("Stage 4: Fetching Dependabot alerts...", options.verbose);
	const repository = options.remoteRepo || detectGithubRepo(options.project);
	if (!repository) {
		console.warn("Warning: Could not detect GitHub repository for Dependabot alerts.");
		console.warn("  Use --remote-repo owner/repo or run from a git clone with a GitHub origin remote.");
		return;
	}
	if (!githubToken) {
		console.warn(`Warning: ${githubTokenEnvLabel(options.githubTokenEnv)} not set — Dependabot alerts require a GitHub token.`);
		console.warn("  Add a token to the project .env (e.g. NPM_TOKEN), export it in your shell, or set GITHUB_TOKEN_FILE.");
		return;
	}
	log(`  Repository: ${repository}`, options.verbose);
	const dependabotAlerts = await fetchDependabotAlerts(repository, cacheOpts, githubToken, options.githubAlertStates, { verbose: options.verbose });
	sink.dependabotAlerts(dependabotAlerts);
}
//#endregion
//#region src/commands/scan/scan.command.ts
const SCAN_FLAG_DEFS = {
	"project": {
		type: "string",
		description: "Project root directory"
	},
	"cache-ttl": {
		type: "number",
		description: "Cache TTL in hours"
	},
	"no-cache": {
		type: "boolean",
		description: "Disable caching"
	},
	"format": {
		type: "string",
		description: "Output format: terminal | json | both"
	},
	"node-posts": {
		type: "number",
		description: "Number of Node.js security posts"
	},
	"json-out": {
		type: "string",
		description: "JSON report output path"
	},
	"verbose": {
		alias: "v",
		type: "boolean",
		description: "Verbose progress output"
	},
	"skip-osv": {
		type: "boolean",
		description: "Skip OSV.dev vulnerability queries"
	},
	"skip-node-posts": {
		type: "boolean",
		description: "Skip Node.js runtime security post scraping"
	},
	"skip-github": {
		type: "boolean",
		description: "Skip GitHub Advisory Database queries"
	},
	"skip-dependabot": {
		type: "boolean",
		description: "Skip Dependabot alert fetching"
	},
	"remote-repo": {
		type: "string",
		description: "Remote owner/repo for Dependabot alerts"
	},
	"github-alert-states": {
		type: "string",
		description: "Dependabot alert states (comma-separated, default: open)"
	},
	"github-token-env": {
		type: "string",
		description: "Env var(s) for GitHub token, comma-separated (default: NPM_TOKEN, GH_TOKEN, GITHUB_TOKEN)"
	}
};
const runScanCommand = async ({ argv, cwd }) => {
	await withHelp(argv, scanHelp, async () => {
		const flow = createFlowContext(argv, SCAN_FLAG_DEFS);
		const formatInput = flow.flags.format || "both";
		const format = formatInput === "terminal" || formatInput === "json" || formatInput === "both" ? formatInput : "both";
		const exitCode = await runScanPipeline({
			project: flow.flags.project || cwd,
			cacheTtl: flow.flags["cache-ttl"] || 24,
			noCache: flow.flags["no-cache"] ?? false,
			format,
			nodePosts: flow.flags["node-posts"] || 5,
			jsonOut: flow.flags["json-out"] || void 0,
			verbose: flow.flags.verbose ?? false,
			osvEnabled: !(flow.flags["skip-osv"] ?? false),
			nodePostsEnabled: !(flow.flags["skip-node-posts"] ?? false),
			githubEnabled: !(flow.flags["skip-github"] ?? false),
			dependabot: !(flow.flags["skip-dependabot"] ?? false),
			remoteRepo: flow.flags["remote-repo"] || void 0,
			githubAlertStates: parseAlertStates(flow.flags["github-alert-states"]),
			githubTokenEnv: flow.flags["github-token-env"] || void 0
		});
		if (exitCode !== 0) process.exit(exitCode);
	});
};
function parseAlertStates(raw) {
	if (!raw) return ["open"];
	const states = raw.split(",").map((s) => s.trim()).filter(Boolean);
	return states.length > 0 ? states : ["open"];
}
//#endregion
//#region src/cli.ts
const { version } = createRequire(import.meta.url)("../package.json");
function isScanInvocation(argv) {
	if (argv.length === 0) return true;
	const first = argv[0];
	return first === "scan" || first.startsWith("-");
}
async function main() {
	const cwd = process$1.cwd();
	const [, , ...argv] = process$1.argv;
	if (argv.length === 0) {
		await runScanCommand({
			argv: [],
			cwd
		});
		return;
	}
	const [first, ...rest] = argv;
	if (first === "--help" || first === "-h") {
		renderHelp(cliHelp);
		return;
	}
	if (first === "--version" || first === "-v") {
		console.log(version);
		return;
	}
	if (isScanInvocation(argv)) {
		await runScanCommand({
			argv: first === "scan" ? rest : argv,
			cwd
		});
		return;
	}
	const handler = {
		scan: runScanCommand,
		help: () => renderHelp(cliHelp)
	}[first];
	if (!handler) {
		console.error(`Unknown command: ${first}`);
		renderHelp(cliHelp);
		process$1.exit(1);
		return;
	}
	await handler({
		argv: rest,
		cwd
	});
}
main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process$1.exit(2);
});
//#endregion
export {};

//# sourceMappingURL=index.mjs.map