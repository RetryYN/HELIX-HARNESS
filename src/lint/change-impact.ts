import { execFileSync } from "node:child_process";
import type { DependencyDriftResult } from "./dependency-drift";
import { fmValue } from "./shared";

export interface ChangeImpactInput {
  changedFiles: string[];
}

export function changeSetIntegrityMessages(result: ChangeSetIntegrityResult): string[] {
  const summary = result.ok ? "change-set-integrity - OK" : "change-set-integrity - violation";
  return [
    `${summary} (categories=${result.categories.join(",") || "none"}; warnings=${result.warnings.length}; blockers=${result.blockers.length})`,
    ...result.blockers.map(
      (finding) =>
        `change-set-integrity - block ${finding.code}: ${finding.message}${finding.modules ? ` (${finding.modules.join(",")})` : ""}`,
    ),
    ...result.warnings.map(
      (finding) => `change-set-integrity - warn ${finding.code}: ${finding.message}`,
    ),
  ];
}

export interface ChangeImpactResult {
  sourceFiles: string[];
  hasDesignUpdate: boolean;
  hasTestUpdate: boolean;
  missingDesign: boolean;
  missingTest: boolean;
  ok: boolean;
}

export type ChangeSetCategory = "source" | "design" | "test";

export type ChangeSetIntegrityFindingCode =
  | "incomplete-artifact-set"
  | "singleton-artifact-set"
  | "dependent-regression-untouched"
  | "source-plan-missing"
  | "source-plan-contract-missing";

export interface ChangeSetIntegrityFinding {
  code: ChangeSetIntegrityFindingCode;
  severity: "warn" | "error";
  message: string;
  files?: string[];
  modules?: string[];
}

export interface ChangeSetIntegrityInput {
  changedFiles: string[];
  dependencyDrift?: DependencyDriftResult | null;
  planDocs?: ChangeSetPlanDoc[];
}

export interface ChangeSetPlanDoc {
  path: string;
  text: string;
}

export interface ChangeSetIntegrityResult {
  changedFiles: string[];
  sourceFiles: string[];
  designFiles: string[];
  testFiles: string[];
  categories: ChangeSetCategory[];
  warnings: ChangeSetIntegrityFinding[];
  blockers: ChangeSetIntegrityFinding[];
  ok: boolean;
}

function norm(path: string): string {
  return path.replaceAll("\\", "/").trim();
}

function isTransientHarnessDbFile(path: string): boolean {
  return /^\.ut-tdd\/harness\.db-(journal|shm|wal)$/.test(norm(path));
}

function isSource(path: string): boolean {
  return /^src\/.+\.(ts|tsx)$/.test(path);
}

function isDesignUpdate(path: string): boolean {
  return (
    /^docs\/design\/(?:harness|helix)\/.+\.md$/.test(path) ||
    /^docs\/plans\/PLAN-.+\.md$/.test(path)
  );
}

function isPlanDoc(path: string): boolean {
  return /^docs\/plans\/PLAN-.+\.md$/.test(path);
}

function isTestUpdate(path: string): boolean {
  return (
    /^tests\/.+\.test\.ts$/.test(path) ||
    /^docs\/test-design\/(?:harness|helix)\/.+\.md$/.test(path)
  );
}

function sourceModule(path: string): string | null {
  const parts = norm(path).split("/");
  if (parts[0] !== "src" || parts.length < 2) return null;
  const first = parts[1];
  if (first.endsWith(".ts") || first.endsWith(".tsx")) return first.replace(/\.(ts|tsx)$/, "");
  return first;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

const L7_SOURCE_PLAN_KINDS = new Set(["impl", "add-impl", "refactor", "retrofit", "troubleshoot"]);

function fmScalar(text: string, key: string): string | undefined {
  return fmValue(text, key)
    ?.replace(/^["']|["']$/g, "")
    .trim();
}

function hasNonEmptyFrontmatterScalar(text: string, key: string): boolean {
  const value = fmScalar(text, key);
  return value != null && value !== "" && value !== "null" && value !== "[]";
}

function hasParentDependency(text: string): boolean {
  const match = text.match(/^dependencies:\s*\n([\s\S]*?)(?:\n\S|$)/m);
  if (!match) return false;
  const value = match[1]?.match(/^ {2}parent:\s*(.+?)\s*$/m)?.[1]?.trim();
  return value != null && value !== "" && value !== "null";
}

function isEligibleL7SourcePlan(doc: ChangeSetPlanDoc): boolean {
  const kind = fmScalar(doc.text, "kind") ?? "";
  const layer = fmScalar(doc.text, "layer") ?? "";
  return layer === "L7" && L7_SOURCE_PLAN_KINDS.has(kind);
}

function l7SourcePlanContractGaps(doc: ChangeSetPlanDoc, testFiles: string[]): string[] {
  const gaps: string[] = [];
  if (!hasNonEmptyFrontmatterScalar(doc.text, "parent_design") && !hasParentDependency(doc.text)) {
    gaps.push("parent L6 design");
  }
  if (!hasNonEmptyFrontmatterScalar(doc.text, "pair_artifact")) {
    gaps.push("pair artifact");
  }
  if (testFiles.length === 0) {
    gaps.push("test evidence");
  }
  return gaps;
}

export function analyzeChangeImpact(input: ChangeImpactInput): ChangeImpactResult {
  const changedFiles = input.changedFiles.map(norm);
  const sourceFiles = changedFiles.filter(isSource).sort();
  const hasDesignUpdate = changedFiles.some(isDesignUpdate);
  const hasTestUpdate = changedFiles.some(isTestUpdate);
  const missingDesign = sourceFiles.length > 0 && !hasDesignUpdate;
  const missingTest = sourceFiles.length > 0 && !hasTestUpdate;
  return {
    sourceFiles,
    hasDesignUpdate,
    hasTestUpdate,
    missingDesign,
    missingTest,
    ok: !missingDesign && !missingTest,
  };
}

export function analyzeChangeSetIntegrity(
  input: ChangeSetIntegrityInput,
): ChangeSetIntegrityResult {
  const changedFiles = uniqueSorted(input.changedFiles.map(norm).filter(Boolean));
  const sourceFiles = changedFiles.filter(isSource);
  const designFiles = changedFiles.filter(isDesignUpdate);
  const testFiles = changedFiles.filter(isTestUpdate);
  const categories: ChangeSetCategory[] = [
    sourceFiles.length > 0 ? "source" : null,
    designFiles.length > 0 ? "design" : null,
    testFiles.length > 0 ? "test" : null,
  ].filter((category): category is ChangeSetCategory => category != null);
  const warnings: ChangeSetIntegrityFinding[] = [];
  const blockers: ChangeSetIntegrityFinding[] = [];

  if (categories.length === 1) {
    const category = categories[0];
    warnings.push({
      code: "singleton-artifact-set",
      severity: "warn",
      message: `${category} changed without its counterpart artifacts`,
      files: category === "source" ? sourceFiles : category === "design" ? designFiles : testFiles,
    });
  }

  if (categories.length > 0 && categories.length < 3) {
    const missing = (["source", "design", "test"] as const).filter(
      (category) => !categories.includes(category),
    );
    warnings.push({
      code: "incomplete-artifact-set",
      severity: "warn",
      message: `change set is missing ${missing.join(" + ")}`,
      files: changedFiles,
    });
  }

  if (sourceFiles.length > 0 && (designFiles.length === 0 || testFiles.length === 0)) {
    const missing = [
      designFiles.length === 0 ? "design/plan" : null,
      testFiles.length === 0 ? "test/test-design" : null,
    ]
      .filter(Boolean)
      .join(" + ");
    warnings.push({
      code: "incomplete-artifact-set",
      severity: "warn",
      message: `source changes are missing ${missing}`,
      files: sourceFiles,
    });
  }

  if (sourceFiles.length > 0 && input.planDocs != null) {
    const changedPlanPaths = new Set(changedFiles.filter(isPlanDoc));
    const changedPlans = input.planDocs
      .map((doc) => ({ path: norm(doc.path), text: doc.text }))
      .filter((doc) => changedPlanPaths.has(doc.path));
    const eligiblePlans = changedPlans.filter(isEligibleL7SourcePlan);
    if (eligiblePlans.length === 0) {
      blockers.push({
        code: "source-plan-missing",
        severity: "error",
        message:
          "source changes require a changed L7 implementation PLAN (impl/add-impl/refactor/retrofit/troubleshoot)",
        files: sourceFiles,
      });
    } else {
      const incompletePlans = eligiblePlans
        .map((doc) => ({ path: doc.path, gaps: l7SourcePlanContractGaps(doc, testFiles) }))
        .filter((entry) => entry.gaps.length > 0);
      if (incompletePlans.length === eligiblePlans.length) {
        blockers.push({
          code: "source-plan-contract-missing",
          severity: "error",
          message: `L7 source PLAN must cite parent design, pair artifact, and test evidence (${incompletePlans
            .map((entry) => `${entry.path}: missing ${entry.gaps.join("/")}`)
            .join("; ")})`,
          files: incompletePlans.map((entry) => entry.path),
        });
      }
    }
  }

  const drift = input.dependencyDrift;
  if (drift != null && sourceFiles.length > 0) {
    const changedModules = uniqueSorted(
      sourceFiles.map(sourceModule).filter((module): module is string => module != null),
    );
    const dependentModules = uniqueSorted(
      drift.moduleEdges
        .filter((edge) => changedModules.includes(edge.to) && !changedModules.includes(edge.from))
        .map((edge) => edge.from),
    );
    if (dependentModules.length > 0) {
      const expectedRegressionTests = new Set(
        drift.testCoverage
          .filter((edge) => changedModules.includes(edge.to) || dependentModules.includes(edge.to))
          .map((edge) => norm(edge.from)),
      );
      const touchedRegressionTests = testFiles.filter((file) => expectedRegressionTests.has(file));
      if (touchedRegressionTests.length === 0) {
        blockers.push({
          code: "dependent-regression-untouched",
          severity: "error",
          message:
            "source changes affect dependent modules but no mapped regression test was touched",
          files: sourceFiles,
          modules: dependentModules,
        });
      }
    }
  }

  return {
    changedFiles,
    sourceFiles,
    designFiles,
    testFiles,
    categories,
    warnings,
    blockers,
    ok: blockers.length === 0,
  };
}

export function parseGitPorcelain(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const rawPath = line.slice(3);
      const renamed = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
      return norm(renamed ?? rawPath);
    })
    .filter((path) => !isTransientHarnessDbFile(path));
}

export function loadChangedFiles(repoRoot: string = process.cwd()): string[] {
  const output = execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return parseGitPorcelain(output);
}

/** `git diff --cached --name-only` の出力をパース (1 行 1 path、staged 集合)。 */
export function parseStagedNames(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => norm(line));
}

/** commit にステージ済みのファイル一覧 (commit 前 staged-diff 確認の機械化、IMP-137)。 */
export function loadStagedFiles(repoRoot: string = process.cwd()): string[] {
  const output = execFileSync("git", ["-C", repoRoot, "diff", "--cached", "--name-only"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return parseStagedNames(output);
}

/**
 * repoRoot が git work-tree かを判定する。ZIP 展開のみ (非 git) の利用環境では change-impact
 * は「適用不能」なので fail-close でなく skip させるための前段ガード (tracked-canonical /
 * runtime-portability が既に採る非 git fail-open 慣行に揃える)。git は在るが status が壊れる等の
 * 実エラーは引き続き呼び出し側で fail-close する。
 */
export function isGitRepository(repoRoot: string = process.cwd()): boolean {
  try {
    const out = execFileSync("git", ["-C", repoRoot, "rev-parse", "--is-inside-work-tree"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim() === "true";
  } catch {
    return false;
  }
}

export function changeImpactMessages(result: ChangeImpactResult): string[] {
  if (result.sourceFiles.length === 0) {
    return ["change-impact — OK (src changes なし)"];
  }
  if (result.ok) {
    return [
      `change-impact — OK (src changes ${result.sourceFiles.length}件に design + test/test-design 更新あり)`,
    ];
  }
  const missing = [
    result.missingDesign ? "design" : null,
    result.missingTest ? "test/test-design" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  return [
    `change-impact — ⚠ src changes ${result.sourceFiles.length}件に対する ${missing} 更新なし (${result.sourceFiles.join(", ")})`,
  ];
}
