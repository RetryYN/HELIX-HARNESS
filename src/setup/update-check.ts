import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const UPDATE_CHECK_TTL_MS = 24 * 60 * 60 * 1000;
export const UPDATE_CHECK_CACHE_PATH = join(".helix", "state", "update-check.json");
export const UPDATE_CHECK_DISABLE_ENV = "HELIX_SKIP_UPDATE_CHECK";
export const UPDATE_CHECK_REMOTE_ENV = "HELIX_UPDATE_CHECK_REMOTE";
export const DEFAULT_UPDATE_REMOTE = "https://github.com/RetryYN/HELIX-HARNESS-OS.git";

const LS_REMOTE_TIMEOUT_MS = 5000;

export interface UpdateCheckDeps {
  harnessRoot: string;
  nowMs: () => number;
  readText: (path: string) => string | null;
  writeText: (path: string, content: string) => void;
  remoteOverride?: () => string | null;
  listRemoteTags: (remote: string) => string[] | null;
}

export interface UpdateCheckResult {
  checked: boolean;
  localVersion: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
  source: "remote" | "cache" | "none";
  detail: string | null;
}

interface UpdateCheckCache {
  checkedAtMs: number;
  latestVersion: string | null;
  remote: string;
}

interface HarnessManifest {
  version: string | null;
  repositoryUrl: string | null;
  readable: boolean;
}

export function parseSemver(tag: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareSemver(a: [number, number, number], b: [number, number, number]): number {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

export function latestReleaseTag(tags: string[]): string | null {
  let best: string | null = null;
  let bestVersion: [number, number, number] | null = null;
  for (const tag of tags) {
    const version = parseSemver(tag);
    if (!version) continue;
    if (!bestVersion || compareSemver(version, bestVersion) > 0) {
      best = tag.trim();
      bestVersion = version;
    }
  }
  return best;
}

export function normalizeRepositoryUrl(repository: unknown): string | null {
  const raw =
    typeof repository === "string"
      ? repository
      : typeof (repository as { url?: unknown })?.url === "string"
        ? (repository as { url: string }).url
        : null;
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^git\+/, "");
  return trimmed.length > 0 ? trimmed : null;
}

function readManifest(deps: UpdateCheckDeps): HarnessManifest {
  const raw = deps.readText(join(deps.harnessRoot, "package.json"));
  if (raw === null) return { version: null, repositoryUrl: null, readable: false };
  try {
    const parsed = JSON.parse(raw) as { version?: unknown; repository?: unknown };
    const version =
      typeof parsed.version === "string" && parseSemver(parsed.version) ? parsed.version : null;
    return {
      version,
      repositoryUrl: normalizeRepositoryUrl(parsed.repository),
      readable: true,
    };
  } catch {
    return { version: null, repositoryUrl: null, readable: false };
  }
}

function readCache(deps: UpdateCheckDeps): UpdateCheckCache | null {
  const raw = deps.readText(join(deps.harnessRoot, UPDATE_CHECK_CACHE_PATH));
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<UpdateCheckCache>;
    if (typeof parsed.checkedAtMs !== "number" || typeof parsed.remote !== "string") return null;
    return {
      checkedAtMs: parsed.checkedAtMs,
      latestVersion: typeof parsed.latestVersion === "string" ? parsed.latestVersion : null,
      remote: parsed.remote,
    };
  } catch {
    return null;
  }
}

function failOpen(localVersion: string | null, detail: string): UpdateCheckResult {
  return {
    checked: false,
    localVersion,
    latestVersion: null,
    updateAvailable: false,
    source: "none",
    detail,
  };
}

export function updateCheckDisabled(reason = UPDATE_CHECK_DISABLE_ENV): UpdateCheckResult {
  return failOpen(null, `disabled by ${reason}`);
}

function configuredRemote(deps: UpdateCheckDeps, manifest: HarnessManifest): string {
  return deps.remoteOverride?.() ?? manifest.repositoryUrl ?? DEFAULT_UPDATE_REMOTE;
}

export function checkForUpdate(deps: UpdateCheckDeps): UpdateCheckResult {
  let localVersion: string | null = null;
  try {
    const manifest = readManifest(deps);
    localVersion = manifest.version;
    if (!manifest.readable) return failOpen(null, "harness package.json unreadable");
    if (localVersion === null) {
      return failOpen(null, "harness package.json version is not a release version");
    }

    const remote = configuredRemote(deps, manifest);
    const cache = readCache(deps);
    let latestVersion: string | null;
    let source: "remote" | "cache";
    if (
      cache &&
      cache.remote === remote &&
      deps.nowMs() - cache.checkedAtMs < UPDATE_CHECK_TTL_MS
    ) {
      latestVersion = cache.latestVersion;
      source = "cache";
    } else {
      const tags = deps.listRemoteTags(remote);
      if (tags === null) return failOpen(localVersion, "remote tags unreachable");
      latestVersion = latestReleaseTag(tags);
      source = "remote";
      const next: UpdateCheckCache = { checkedAtMs: deps.nowMs(), latestVersion, remote };
      try {
        deps.writeText(join(deps.harnessRoot, UPDATE_CHECK_CACHE_PATH), JSON.stringify(next));
      } catch {
        // Advisory only: cache write failure only means the next status run checks again.
      }
    }

    const local = parseSemver(localVersion);
    const latest = latestVersion ? parseSemver(latestVersion) : null;
    return {
      checked: true,
      localVersion,
      latestVersion,
      updateAvailable: Boolean(local && latest && compareSemver(latest, local) > 0),
      source,
      detail: null,
    };
  } catch (error) {
    return failOpen(localVersion, `update-check failed: ${String(error)}`);
  }
}

export function renderUpdateLine(result: UpdateCheckResult): string {
  if (result.updateAvailable && result.latestVersion) {
    return `update: v${result.localVersion} -> ${result.latestVersion} available (review CHANGELOG and run version-up activation before adopting)`;
  }
  if (result.checked) {
    return `update: current${result.latestVersion ? ` latest=${result.latestVersion}` : ""}`;
  }
  return `update: check skipped (${result.detail ?? "not checked"})`;
}

function harnessRootFromModule(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

function listRemoteTags(remote: string): string[] | null {
  const run = spawnSync("git", ["-c", "credential.helper=", "ls-remote", "--tags", remote], {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "Never",
    },
    timeout: LS_REMOTE_TIMEOUT_MS,
  });
  if (run.status !== 0) return null;
  return run.stdout
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[1])
    .filter((ref): ref is string => Boolean(ref))
    .map((ref) => ref.replace(/^refs\/tags\//, "").replace(/\^\{\}$/, ""));
}

export function nodeUpdateCheckDeps(harnessRoot = harnessRootFromModule()): UpdateCheckDeps {
  return {
    harnessRoot,
    nowMs: () => Date.now(),
    readText: (path) => {
      try {
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      } catch {
        return null;
      }
    },
    writeText: (path, content) => {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content, "utf8");
    },
    remoteOverride: () => process.env[UPDATE_CHECK_REMOTE_ENV]?.trim() || null,
    listRemoteTags,
  };
}
