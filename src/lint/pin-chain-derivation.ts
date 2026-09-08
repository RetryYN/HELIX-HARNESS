import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { REVIEWED_SAFE_DISPOSITIONS } from "./l12-hybrid-reviewed-safe-v2";

export type PinKind = "deterministic_pin" | "semantic_review_pin";
export type PinAction = "refresh_candidate" | "requires_reassessment";

export interface PinChainFinding {
  changed_path: string;
  dependent_path: string;
  location: string;
  field: string;
  kind: PinKind;
  action: PinAction;
  recorded_value: string | number;
  live_value: string | number | null;
  stale: boolean;
}

export interface PinChainReport {
  schema_version: "helix-pin-chain-derivation.v1";
  status: "ok" | "degraded";
  changed_paths: string[];
  findings: PinChainFinding[];
  unsupported_surfaces: string[];
}

interface FeedbackBinding {
  test_path: string;
  test_file_sha256: string;
  expected_case_count: number;
}

const FEEDBACK_MANIFESTS = [
  "docs/governance/feedback-test-owner-disposition-residual.json",
  "docs/governance/feedback-test-owner-disposition-closure.json",
  "docs/governance/feedback-test-owner-disposition-direct.json",
] as const;

function sha256(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

function testCaseCount(source: string): number {
  return [...source.matchAll(/\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/gu)].length;
}

function lineOf(source: string, needle: string): number {
  const index = source.indexOf(needle);
  return index < 0 ? 0 : source.slice(0, index).split(/\r?\n/u).length;
}

function bindingFieldLine(source: string, testPath: string, field: string): number {
  const lines = source.replace(/\r\n?/gu, "\n").split("\n");
  const start = lines.findIndex((line) => line.includes(`"test_path": "${testPath}"`));
  if (start < 0) return 0;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line.includes('"test_path":')) break;
    if (line.includes(`"${field}":`)) return index + 1;
  }
  return 0;
}

function canonicalPath(root: string, path: string): string {
  return relative(root, join(root, path)).replaceAll("\\", "/");
}

export function derivePinChain(root: string, changedPaths: readonly string[]): PinChainReport {
  const changed = [...new Set(changedPaths.map((path) => canonicalPath(root, path)))].sort();
  const changedSet = new Set(changed);
  const findings: PinChainFinding[] = [];
  const unsupportedSurfaces: string[] = [];

  for (const manifestPath of FEEDBACK_MANIFESTS) {
    const absoluteManifest = join(root, manifestPath);
    if (!existsSync(absoluteManifest)) continue;
    const manifestSource = readFileSync(absoluteManifest, "utf8");
    const parsed = JSON.parse(manifestSource) as { bindings?: FeedbackBinding[] };
    if (!Array.isArray(parsed.bindings)) {
      unsupportedSurfaces.push(`${manifestPath}:bindings`);
      continue;
    }
    for (const binding of parsed.bindings) {
      if (!changedSet.has(binding.test_path)) continue;
      const absoluteTarget = join(root, binding.test_path);
      const targetSource = existsSync(absoluteTarget) ? readFileSync(absoluteTarget, "utf8") : null;
      const liveDigest = targetSource === null ? null : sha256(targetSource);
      const liveCount = targetSource === null ? null : testCaseCount(targetSource);
      findings.push({
        changed_path: binding.test_path,
        dependent_path: manifestPath,
        location: `${manifestPath}:${bindingFieldLine(manifestSource, binding.test_path, "test_file_sha256")}`,
        field: "test_file_sha256",
        kind: "deterministic_pin",
        action: "refresh_candidate",
        recorded_value: binding.test_file_sha256,
        live_value: liveDigest,
        stale: binding.test_file_sha256 !== liveDigest,
      });
      findings.push({
        changed_path: binding.test_path,
        dependent_path: manifestPath,
        location: `${manifestPath}:${bindingFieldLine(manifestSource, binding.test_path, "expected_case_count")}`,
        field: "expected_case_count",
        kind: "deterministic_pin",
        action: "refresh_candidate",
        recorded_value: binding.expected_case_count,
        live_value: liveCount,
        stale: binding.expected_case_count !== liveCount,
      });
    }
  }

  const reviewedSafePath = "src/lint/l12-hybrid-reviewed-safe-v2.ts";
  const reviewedSafeAbsolute = join(root, reviewedSafePath);
  const reviewedSafeSource = existsSync(reviewedSafeAbsolute)
    ? readFileSync(reviewedSafeAbsolute, "utf8")
    : null;
  for (const disposition of REVIEWED_SAFE_DISPOSITIONS) {
    if (!changedSet.has(disposition.path)) continue;
    if (reviewedSafeSource === null) {
      unsupportedSurfaces.push(`${disposition.path}:reviewed_safe_registry_unavailable`);
      continue;
    }
    const absoluteTarget = join(root, disposition.path);
    const liveDigest = existsSync(absoluteTarget)
      ? sha256(readFileSync(absoluteTarget, "utf8"))
      : null;
    findings.push({
      changed_path: disposition.path,
      dependent_path: reviewedSafePath,
      location: `${reviewedSafePath}:${lineOf(reviewedSafeSource, `path: "${disposition.path}"`)}`,
      field: "contentDigest",
      kind: "semantic_review_pin",
      action: "requires_reassessment",
      recorded_value: disposition.contentDigest,
      live_value: liveDigest,
      stale: disposition.contentDigest !== liveDigest,
    });
  }

  const representedPaths = new Set(findings.map((finding) => finding.changed_path));
  const unsupportedPaths = new Set(unsupportedSurfaces.map((surface) => surface.split(":", 1)[0]));
  unsupportedSurfaces.push(
    ...changed
      .filter((path) => !representedPaths.has(path) && !unsupportedPaths.has(path))
      .map((path) => `${path}:pin_surface_not_registered`),
  );

  return {
    schema_version: "helix-pin-chain-derivation.v1",
    status: unsupportedSurfaces.length > 0 ? "degraded" : "ok",
    changed_paths: changed,
    findings: findings.sort((a, b) =>
      `${a.changed_path}:${a.dependent_path}:${a.field}`.localeCompare(
        `${b.changed_path}:${b.dependent_path}:${b.field}`,
      ),
    ),
    unsupported_surfaces: unsupportedSurfaces.sort(),
  };
}
