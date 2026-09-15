import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../shared/canonical-digest";
import { DESIGN_REALITY_BINDING_MARKER } from "./design-reality-binding";

export const DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE_PATH =
  "config/design-artifact-source-digest-baseline.json";
export const DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION =
  "helix-design-artifact-source-digest-baseline.v1";

export interface DesignArtifactSourceDigestBaselineEntry {
  design_path: string;
  artifact_path: string;
  pinned_digest: Sha256Digest;
}

export interface DesignArtifactSourceDigestBaseline {
  schema_version: typeof DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION;
  entries: DesignArtifactSourceDigestBaselineEntry[];
  baseline_digest: Sha256Digest;
}

export interface DesignArtifactSourceDigestFinding {
  file: string;
  reason:
    | "baseline_invalid"
    | "baseline_expanded"
    | "invalid_current_authority_pin"
    | "design_artifact_path_unsafe"
    | "design_artifact_path_missing"
    | "design_artifact_path_outside_repo"
    | "design_artifact_source_digest_invalid"
    | "design_artifact_source_digest_drift";
  detail: string;
}

export interface DesignArtifactSourceDigestResult {
  ok: boolean;
  design_documents: number;
  pins_checked: number;
  stale_count: number;
  baseline_debt: number;
  new_stale_count: number;
  findings: DesignArtifactSourceDigestFinding[];
}

export interface AnalyzeDesignArtifactSourceDigestOptions {
  designFiles?: string[];
  baseline?: DesignArtifactSourceDigestBaseline;
}

/**
 * 1468 の初期 baseline。これは「新しい stale を baseline へ追加して gate を
 * 回避する」経路を閉じるため、config の自己申告だけに依存しない。
 * 既知 debt を修正したら config から該当 entry を削除し、この集合も同じ PR で
 * 減らす。値は origin/main の全数照合で取得した初期 snapshot に固定する。
 */
export const INITIAL_DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE: ReadonlyArray<DesignArtifactSourceDigestBaselineEntry> =
  [
    {
      design_path: "docs/design/helix/L6-function-design/worker-blind-benchmark.md",
      artifact_path: "src/runtime/worker-blind-benchmark.ts",
      pinned_digest: "sha256:5dcbac82100ff9cf5d907f66198fd5cc639bad1b46a67816f901d891f696efc3",
    },
    {
      design_path: "docs/design/helix/L6-function-design/worker-context-authority.md",
      artifact_path: "src/runtime/adapter.ts",
      pinned_digest: "sha256:86609ace1464ddeef6063a25067339f854c53ffe3fa8d7355a77ec42dc2acadb",
    },
    {
      design_path: "docs/design/helix/L6-function-design/worker-context-authority.md",
      artifact_path: "src/runtime/worker-context-packet.ts",
      pinned_digest: "sha256:27407a97b1d4920f68883ff5d9fb369dcb978e5f00f83f4a446f062161773ecc",
    },
    {
      design_path: "docs/design/helix/L6-function-design/worker-context-authority.md",
      artifact_path: "src/runtime/worker-isolation-broker.ts",
      pinned_digest: "sha256:dedcb8bfcf318ad88b57e754703b21186cfec02cbfff9bdd53b086925ea9da15",
    },
    {
      design_path: "docs/design/helix/L6-function-design/worker-risk-admission.md",
      artifact_path: "src/runtime/worker-blind-benchmark.ts",
      pinned_digest: "sha256:55a923a3fc7fbfdd1a9c6392424a7ad42360b3e0aa48abe6f38e97ac2e9b8eec",
    },
    {
      design_path: "docs/design/helix/L6-function-design/worker-wrapper-admission.md",
      artifact_path: "src/runtime/adapter.ts",
      pinned_digest: "sha256:3008234faf05163046293a3fb124715f3381c2f8baaf0afc329611b9e5690238",
    },
  ];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isSafeRepoPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !/^[A-Za-z]:[\\/]/u.test(value) &&
    !value.includes("\\") &&
    !value.includes("\0") &&
    !value.split("/").includes("..") &&
    !value.split("/").includes(".")
  );
}

function normalizeRelativePath(value: string): string {
  return value.replaceAll("\\", "/");
}

function compareBytewise(left: string, right: string): number {
  const utf8Order = Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
  if (utf8Order !== 0 || left === right) return utf8Order;
  const sharedLength = Math.min(left.length, right.length);
  for (let index = 0; index < sharedLength; index += 1) {
    const leftUnit = left.charCodeAt(index);
    const rightUnit = right.charCodeAt(index);
    if (leftUnit !== rightUnit) return leftUnit - rightUnit;
  }
  return left.length - right.length;
}

function parseDesignBinding(content: string): unknown {
  const marker = `<!-- ${DESIGN_REALITY_BINDING_MARKER} -->`;
  const start = content.indexOf(marker);
  if (start < 0) return null;
  const match = content.slice(start + marker.length).match(/```json\s*\n([\s\S]*?)\n```/u);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
}

function fingerprint(
  entry: Pick<
    DesignArtifactSourceDigestBaselineEntry,
    "design_path" | "artifact_path" | "pinned_digest"
  >,
): string {
  return `${entry.design_path}\u0000${entry.artifact_path}\u0000${entry.pinned_digest}`;
}

function sortEntries(
  entries: readonly DesignArtifactSourceDigestBaselineEntry[],
): DesignArtifactSourceDigestBaselineEntry[] {
  return [...entries].sort((left, right) => compareBytewise(fingerprint(left), fingerprint(right)));
}

function baselineDigest(entries: readonly DesignArtifactSourceDigestBaselineEntry[]): Sha256Digest {
  return sha256Digest(canonicalJson(sortEntries(entries)));
}

function parseBaselineEntry(value: unknown): DesignArtifactSourceDigestBaselineEntry | null {
  if (!isRecord(value)) return null;
  if (
    !isSafeRepoPath(value.design_path) ||
    !isSafeRepoPath(value.artifact_path) ||
    !isSha256Digest(value.pinned_digest)
  ) {
    return null;
  }
  return {
    design_path: normalizeRelativePath(value.design_path),
    artifact_path: normalizeRelativePath(value.artifact_path),
    pinned_digest: value.pinned_digest,
  };
}

function validateBaseline(value: unknown): DesignArtifactSourceDigestBaseline {
  if (!isRecord(value) || value.schema_version !== DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION) {
    throw new Error("invalid design artifact source digest baseline schema");
  }
  if (!Array.isArray(value.entries)) {
    throw new Error("design artifact source digest baseline entries must be an array");
  }
  const entries = value.entries.map(parseBaselineEntry);
  if (entries.some((entry) => entry === null)) {
    throw new Error("invalid design artifact source digest baseline entry");
  }
  const normalized = sortEntries(entries as DesignArtifactSourceDigestBaselineEntry[]);
  if (new Set(normalized.map(fingerprint)).size !== normalized.length) {
    throw new Error("duplicate design artifact source digest baseline entry");
  }
  if (
    !isSha256Digest(value.baseline_digest) ||
    value.baseline_digest !== baselineDigest(normalized)
  ) {
    throw new Error("design artifact source digest baseline digest mismatch");
  }
  return {
    schema_version: DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION,
    entries: normalized,
    baseline_digest: value.baseline_digest,
  };
}

export function loadDesignArtifactSourceDigestBaseline(
  repoRoot: string,
): DesignArtifactSourceDigestBaseline {
  return validateBaseline(
    JSON.parse(readFileSync(join(repoRoot, DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE_PATH), "utf8")),
  );
}

function collectDesignFiles(root: string, prefix = ""): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((left, right) =>
    compareBytewise(left.name, right.name),
  )) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = join(root, entry.name);
    if (entry.isDirectory()) files.push(...collectDesignFiles(absolute, relativePath));
    else if (entry.isFile() && entry.name.endsWith(".md"))
      files.push(`docs/design/helix/${relativePath}`);
  }
  return files.sort();
}

function insideRepo(repoRoot: string, candidate: string): boolean {
  try {
    const root = realpathSync(repoRoot);
    const target = realpathSync(candidate);
    const relativePath = relative(root, target);
    return (
      relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !relativePath.startsWith(sep)
    );
  } catch {
    return false;
  }
}

function finding(
  file: string,
  reason: DesignArtifactSourceDigestFinding["reason"],
  detail: string,
): DesignArtifactSourceDigestFinding {
  return { file, reason, detail };
}

export function designArtifactSourceDigestFingerprint(
  entry: Pick<
    DesignArtifactSourceDigestBaselineEntry,
    "design_path" | "artifact_path" | "pinned_digest"
  >,
): string {
  return fingerprint(entry);
}

export function analyzeDesignArtifactSourceDigest(
  repoRoot: string,
  options: AnalyzeDesignArtifactSourceDigestOptions = {},
): DesignArtifactSourceDigestResult {
  const findings: DesignArtifactSourceDigestFinding[] = [];
  let baseline: DesignArtifactSourceDigestBaseline;
  try {
    baseline = options.baseline ?? loadDesignArtifactSourceDigestBaseline(repoRoot);
  } catch (error) {
    return {
      ok: false,
      design_documents: 0,
      pins_checked: 0,
      stale_count: 0,
      baseline_debt: 0,
      new_stale_count: 0,
      findings: [finding("<baseline>", "baseline_invalid", String(error))],
    };
  }

  const baselineFingerprints = new Set(baseline.entries.map(fingerprint));
  const initialFingerprints = new Set(
    INITIAL_DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE.map(fingerprint),
  );
  for (const entry of baseline.entries) {
    if (!initialFingerprints.has(fingerprint(entry))) {
      findings.push(finding("<baseline>", "baseline_expanded", fingerprint(entry)));
    }
  }

  const designFiles =
    options.designFiles ?? collectDesignFiles(join(repoRoot, "docs/design/helix"));
  let pinsChecked = 0;
  let staleCount = 0;
  let baselineDebt = 0;
  let newStaleCount = 0;

  for (const designPath of designFiles) {
    const absoluteDesignPath = resolve(repoRoot, designPath);
    if (!existsSync(absoluteDesignPath)) continue;
    const parsed = parseDesignBinding(readFileSync(absoluteDesignPath, "utf8"));
    if (!isRecord(parsed) || !Array.isArray(parsed.assets)) continue;
    for (const [index, rawAsset] of parsed.assets.entries()) {
      if (!isRecord(rawAsset) || rawAsset.current_authority !== true) continue;
      if (rawAsset.classification !== "existing_runtime") {
        findings.push(
          finding(designPath, "invalid_current_authority_pin", `assets[${index}]:classification`),
        );
        continue;
      }
      pinsChecked += 1;
      if (!isSafeRepoPath(rawAsset.artifact_path)) {
        findings.push(
          finding(designPath, "design_artifact_path_unsafe", String(rawAsset.artifact_path)),
        );
        continue;
      }
      if (!isSha256Digest(rawAsset.source_digest)) {
        findings.push(
          finding(
            designPath,
            "design_artifact_source_digest_invalid",
            `${rawAsset.artifact_path}:${String(rawAsset.source_digest)}`,
          ),
        );
        continue;
      }
      const artifactPath = normalizeRelativePath(rawAsset.artifact_path);
      const artifactAbsolute = resolve(repoRoot, artifactPath);
      if (!existsSync(artifactAbsolute) || !statSync(artifactAbsolute).isFile()) {
        findings.push(finding(designPath, "design_artifact_path_missing", artifactPath));
        continue;
      }
      if (!insideRepo(repoRoot, artifactAbsolute)) {
        findings.push(finding(designPath, "design_artifact_path_outside_repo", artifactPath));
        continue;
      }
      const actualDigest = sha256Digest(readFileSync(artifactAbsolute));
      if (actualDigest === rawAsset.source_digest) continue;
      staleCount += 1;
      const pin = {
        design_path: designPath,
        artifact_path: artifactPath,
        pinned_digest: rawAsset.source_digest,
      } satisfies DesignArtifactSourceDigestBaselineEntry;
      if (baselineFingerprints.has(fingerprint(pin))) {
        baselineDebt += 1;
      } else {
        newStaleCount += 1;
        findings.push(
          finding(
            designPath,
            "design_artifact_source_digest_drift",
            `${artifactPath}:pinned=${rawAsset.source_digest}:actual=${actualDigest}`,
          ),
        );
      }
    }
  }

  return {
    ok: findings.length === 0,
    design_documents: designFiles.length,
    pins_checked: pinsChecked,
    stale_count: staleCount,
    baseline_debt: baselineDebt,
    new_stale_count: newStaleCount,
    findings,
  };
}

export function designArtifactSourceDigestMessages(
  result: DesignArtifactSourceDigestResult,
): string[] {
  if (result.ok) {
    return [
      `design-artifact-source-digest — OK (docs=${result.design_documents}, pins=${result.pins_checked}, stale=${result.stale_count}, baseline_debt=${result.baseline_debt}, new_stale=0)`,
    ];
  }
  return result.findings
    .slice(0, 12)
    .map(
      (item) =>
        `design-artifact-source-digest — violation: ${item.file}:${item.reason}:${item.detail}`,
    );
}
