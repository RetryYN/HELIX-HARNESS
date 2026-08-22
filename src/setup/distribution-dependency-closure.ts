import { readFileSync } from "node:fs";
import { extname, join, posix } from "node:path";
import ts from "typescript";

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
  unowned_dynamic_paths: string[];
}

function normalize(path: string): string {
  return posix.normalize(path.replaceAll("\\", "/")).replace(/^\.\//, "");
}

function sourceKind(path: string): ts.ScriptKind {
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
  const add = (value: ts.Expression | undefined, kind: "static" | "dynamic") => {
    if (!value || !ts.isStringLiteralLike(value) || !value.text.startsWith(".")) return;
    found.push({ specifier: value.text, kind });
  };
  const visit = (node: ts.Node): void => {
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

export function analyzeDistributionDependencyClosure(input: {
  repoRoot: string;
  artifactPaths: readonly string[];
  sourcePaths: readonly string[];
  entrypoints: readonly string[];
  dynamicAssetPaths?: readonly string[];
}): DistributionDependencyClosure {
  const artifacts = new Set(input.artifactPaths.map(normalize));
  const sources = new Set(input.sourcePaths.map(normalize));
  const dynamicAssets = new Set((input.dynamicAssetPaths ?? []).map(normalize));
  const entrypoints = [...new Set(input.entrypoints.map(normalize))].sort();
  const queue = [...entrypoints];
  const visited = new Set<string>();
  const edges: DistributionDependencyEdge[] = [];
  const missing = new Set<string>();
  const unownedDynamic = new Set<string>();

  for (const entrypoint of entrypoints) {
    if (!artifacts.has(entrypoint) || !sources.has(entrypoint)) missing.add(entrypoint);
  }

  while (queue.length > 0) {
    const importer = queue.shift();
    if (!importer || visited.has(importer) || !sources.has(importer)) continue;
    visited.add(importer);
    const source = readFileSync(join(input.repoRoot, importer), "utf8");
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
      queue.push(resolved);
    }
  }

  return {
    ok: missing.size === 0 && unownedDynamic.size === 0,
    entrypoints,
    visited_paths: [...visited].sort(),
    edges: edges.sort((a, b) =>
      `${a.importer}\0${a.specifier}\0${a.kind}`.localeCompare(
        `${b.importer}\0${b.specifier}\0${b.kind}`,
      ),
    ),
    missing_paths: [...missing].sort(),
    unowned_dynamic_paths: [...unownedDynamic].sort(),
  };
}
