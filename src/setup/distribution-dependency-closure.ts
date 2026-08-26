import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { extname, isAbsolute, join, posix, relative, sep, win32 } from "node:path";
import type * as TS from "typescript";
import ts from "../shared/typescript-lazy";
import {
  loadDistributionCapabilityArtifactCatalog,
  projectDistributionArtifacts,
} from "./distribution-artifact-projection";
import { type DistributionProfile, loadDistributionProfileCatalog } from "./distribution-profile";

export interface DistributionDependencyEdge {
  importer: string;
  specifier: string;
  resolved_path: string | null;
  kind: "static" | "dynamic";
}

export interface DistributionDependencyClosure {
  ok: boolean;
  entrypoints: string[];
  visited_paths: string[];
  edges: DistributionDependencyEdge[];
  missing_paths: string[];
  reachable_excluded_paths: string[];
  unowned_dynamic_paths: string[];
  unsafe_paths: string[];
}

export interface LiteCanaryFastCheck {
  profile_ok: boolean;
  manifest_ok: boolean;
  closure_ok: boolean;
  artifact_paths: string[];
  closure_paths: string[];
  source_head: string | null;
  candidate_head: string;
  path_read_failed: boolean;
}

/**
 * Liteのimport closureだけでは表現できない実行対象も、canary skip判定のclosureに含める。
 * README等の配布入力と、Windows durability laneのcoverageを落とすと、変更をauthorized skip
 * と誤判定してしまうため、source artifactの依存関係として同じfail-close境界で扱う。
 */
export const LITE_CANARY_COVERAGE_PATHS = [
  "README-LITE.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "PROVENANCE.md",
  "DISCLAIMER.md",
  "src/orchestration/loop-store.ts",
  "tests/loop-store-durability.test.ts",
  "tests/loop-store-durability-node.test.ts",
  "tests/distribution-lite-consumer-canary.test.ts",
] as const;

function normalize(path: string): string {
  return posix.normalize(path.replaceAll("\\", "/")).replace(/^\.\//, "");
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

function sourceKind(path: string): TS.ScriptKind {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (path.endsWith(".js") || path.endsWith(".mjs") || path.endsWith(".cjs")) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function relativeSpecifiers(
  source: string,
  path: string,
): Array<{
  specifier: string;
  kind: "static" | "dynamic";
}> {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, sourceKind(path));
  const found: Array<{ specifier: string; kind: "static" | "dynamic" }> = [];
  const add = (value: TS.Expression | undefined, kind: "static" | "dynamic") => {
    if (!value || !ts.isStringLiteralLike(value) || !value.text.startsWith(".")) return;
    found.push({ specifier: value.text, kind });
  };
  const visit = (node: TS.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      add(node.moduleSpecifier, "static");
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      add(node.arguments[0], "dynamic");
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "require"
    ) {
      add(node.arguments[0], "dynamic");
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

function resolveRelative(
  importer: string,
  specifier: string,
  sourcePaths: Set<string>,
): string | null {
  const base = normalize(posix.join(posix.dirname(importer), specifier));
  const candidates = extname(base)
    ? [base]
    : [
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        `${base}.mjs`,
        `${base}.cjs`,
        `${base}.json`,
        `${base}/index.ts`,
        `${base}/index.tsx`,
        `${base}/index.js`,
      ];
  return candidates.find((candidate) => sourcePaths.has(candidate)) ?? null;
}

function pathInside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`));
}

function resolvePhysicalSource(
  root: string,
  sourcePath: string,
): { state: "ok"; path: string } | { state: "missing" } | { state: "unsafe" } {
  const normalized = normalize(sourcePath);
  const portablePath = sourcePath.replaceAll("\\", "/");
  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    portablePath.split("/").includes("..") ||
    isAbsolute(sourcePath) ||
    isAbsolute(normalized) ||
    win32.isAbsolute(sourcePath)
  ) {
    return { state: "unsafe" };
  }
  let cursor = root;
  for (const part of normalized.split("/")) {
    cursor = join(cursor, part);
    if (!existsSync(cursor)) return { state: "missing" };
    if (lstatSync(cursor).isSymbolicLink()) return { state: "unsafe" };
    const physical = realpathSync(cursor);
    if (!pathInside(root, physical)) return { state: "unsafe" };
    cursor = physical;
  }
  return lstatSync(cursor).isFile() ? { state: "ok", path: cursor } : { state: "unsafe" };
}

export function analyzeDistributionDependencyClosure(input: {
  repoRoot: string;
  artifactPaths: readonly string[];
  sourcePaths: readonly string[];
  entrypoints: readonly string[];
  dynamicAssetPaths?: readonly string[];
  excludedArtifactPaths?: readonly string[];
}): DistributionDependencyClosure {
  const unsafeInputPaths = input.entrypoints
    .filter(
      (path) => path.replaceAll("\\", "/").split("/").includes("..") || win32.isAbsolute(path),
    )
    .map(normalize);
  const artifacts = new Set(input.artifactPaths.map(normalize));
  const sources = new Set(input.sourcePaths.map(normalize));
  const dynamicAssets = new Set((input.dynamicAssetPaths ?? []).map(normalize));
  const excludedArtifacts = new Set((input.excludedArtifactPaths ?? []).map(normalize));
  const entrypoints = [...new Set(input.entrypoints.map(normalize))].sort();
  const queue = [...entrypoints];
  const visited = new Set<string>();
  const edges: DistributionDependencyEdge[] = [];
  const missing = new Set<string>();
  const reachableExcluded = new Set<string>();
  const unownedDynamic = new Set<string>();
  const unsafe = new Set<string>(unsafeInputPaths);
  if (entrypoints.length === 0) missing.add("<entrypoint>");
  let physicalRoot: string | null = null;
  try {
    physicalRoot = realpathSync(input.repoRoot);
  } catch {
    for (const entrypoint of entrypoints) unsafe.add(entrypoint);
  }

  for (const entrypoint of entrypoints) {
    if (!artifacts.has(entrypoint) || !sources.has(entrypoint)) missing.add(entrypoint);
    if (excludedArtifacts.has(entrypoint)) reachableExcluded.add(entrypoint);
  }

  while (queue.length > 0) {
    const importer = queue.shift();
    if (!importer || visited.has(importer) || !sources.has(importer)) continue;
    visited.add(importer);
    if (!physicalRoot) continue;
    const physicalSource = resolvePhysicalSource(physicalRoot, importer);
    if (physicalSource.state === "missing") {
      missing.add(importer);
      continue;
    }
    if (physicalSource.state === "unsafe") {
      unsafe.add(importer);
      continue;
    }
    const source = readFileSync(physicalSource.path, "utf8");
    for (const dependency of relativeSpecifiers(source, importer)) {
      const resolved = resolveRelative(importer, dependency.specifier, sources);
      edges.push({
        importer,
        specifier: dependency.specifier,
        resolved_path: resolved,
        kind: dependency.kind,
      });
      if (dependency.kind === "dynamic" && (!resolved || !dynamicAssets.has(resolved))) {
        unownedDynamic.add(resolved ?? `${importer}::${dependency.specifier}`);
      }
      if (!resolved || !artifacts.has(resolved)) {
        const key = resolved ?? `${importer}::${dependency.specifier}`;
        missing.add(key);
        continue;
      }
      if (excludedArtifacts.has(resolved)) reachableExcluded.add(resolved);
      queue.push(resolved);
    }
  }

  return {
    ok:
      missing.size === 0 &&
      reachableExcluded.size === 0 &&
      unownedDynamic.size === 0 &&
      unsafe.size === 0,
    entrypoints,
    visited_paths: [...visited].sort(),
    edges: edges.sort((a, b) =>
      `${a.importer}\0${a.specifier}\0${a.kind}`.localeCompare(
        `${b.importer}\0${b.specifier}\0${b.kind}`,
      ),
    ),
    missing_paths: [...missing].sort(),
    reachable_excluded_paths: [...reachableExcluded].sort(),
    unowned_dynamic_paths: [...unownedDynamic].sort(),
    unsafe_paths: [...unsafe].sort(),
  };
}

/** profile、artifact manifest、dependency closureを一度に検査するCI用の軽量read surface。 */
export function runLiteCanaryFastCheck(input: {
  repoRoot: string;
  candidateHead: string;
}): LiteCanaryFastCheck {
  const result: LiteCanaryFastCheck = {
    profile_ok: false,
    manifest_ok: false,
    closure_ok: false,
    artifact_paths: [],
    closure_paths: [],
    source_head: null,
    candidate_head: input.candidateHead,
    path_read_failed: false,
  };
  let sourcePaths: string[] = [];
  try {
    sourcePaths = execFileSync("git", ["ls-files"], {
      cwd: input.repoRoot,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .filter(Boolean);
    result.source_head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: input.repoRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    result.path_read_failed = true;
  }

  let profile: DistributionProfile | undefined;
  try {
    const profileResult = loadDistributionProfileCatalog(input.repoRoot);
    profile = profileResult.catalog?.profiles.find(
      (candidate) => candidate.profile_id === "consumer_core_v1",
    );
    result.profile_ok = profileResult.ok && profile !== undefined;
    const projection = profile
      ? projectDistributionArtifacts({
          profile,
          catalog: loadDistributionCapabilityArtifactCatalog(input.repoRoot),
          source_paths: sourcePaths,
        })
      : null;
    result.manifest_ok = profileResult.ok && projection?.ok === true;
    result.artifact_paths = projection?.artifact_paths ?? [];
  } catch {
    result.path_read_failed = true;
  }

  try {
    const closure = analyzeDistributionDependencyClosure({
      repoRoot: input.repoRoot,
      artifactPaths: result.artifact_paths,
      sourcePaths,
      entrypoints: ["src/setup/distribution-consumer-cli.ts"],
    });
    const coverageSourceEntrypoints = LITE_CANARY_COVERAGE_PATHS.filter((path) =>
      /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path),
    );
    // coverage sourceはLite配布artifactの所有権とは別軸で、tracked source全体を探索対象にする。
    // ここを入口だけの列挙にすると、coverage pathのimport先変更がauthorized skipへ抜ける。
    const coverageClosure = analyzeDistributionDependencyClosure({
      repoRoot: input.repoRoot,
      artifactPaths: sourcePaths,
      sourcePaths,
      entrypoints: coverageSourceEntrypoints,
    });
    const missingCoveragePaths = LITE_CANARY_COVERAGE_PATHS.filter(
      (path) => !sourcePaths.includes(path),
    );
    result.closure_ok = closure.ok && coverageClosure.ok && missingCoveragePaths.length === 0;
    result.path_read_failed ||= missingCoveragePaths.length > 0;
    result.closure_paths = sortedUnique([
      ...closure.entrypoints,
      ...closure.visited_paths,
      ...coverageClosure.entrypoints,
      ...coverageClosure.visited_paths,
      ...LITE_CANARY_COVERAGE_PATHS,
    ]);
  } catch {
    result.path_read_failed = true;
  }
  return result;
}
