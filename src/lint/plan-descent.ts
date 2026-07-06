import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * plan-descent gate (PLAN-L6-54 / PLAN-L7-347)。
 *
 * PO 規則 (2026-07-06): L6 機能設計 + test-design pair ⇒ L7 実装は必須。kind=impl / add-impl の
 * PLAN は L6 設計 doc への parent_design と docs/test-design/ への pair_artifact を持たない限り
 * 起票できない。bottom-up の正規入口は PLAN-DISCOVERY-* / reverse 系のみ。既存違反は
 * grandfather baseline に固定し ratchet (増加禁止・減少可) で段階是正する。
 * 設計正本: docs/design/harness/L6-function-design/plan-descent-gate.md (U-PDESC-001..010)。
 */

export const DESIGN_PARENT_PREFIX = "docs/design/";
export const L6_DESIGN_SEGMENT = "L6-";
export const TEST_DESIGN_PREFIX = "docs/test-design/";
export const PLAN_DESCENT_BASELINE_PATH = "docs/governance/plan-descent-baseline.json";

const TARGET_KINDS = new Set(["impl", "add-impl"]);
const CONFIRM_STATUSES = new Set(["confirmed", "completed"]);
const DISCOVERY_PLAN_PREFIX = "PLAN-DISCOVERY-";

export type PlanDescentReason =
  | "parent_design_absent"
  | "parent_design_not_l6_design_doc"
  | "pair_artifact_not_test_design"
  | "parent_design_not_confirmed"
  | "generates_missing_test_code";

export interface PlanDescentDoc {
  file: string;
  planId: string;
  kind: string | null;
  status: string | null;
  parentDesign: string | null;
  parentDesignExists: boolean;
  parentDesignStatus: string | null;
  pairArtifact: string | null;
  pairArtifactExists: boolean;
  generatesArtifactTypes: string[];
}

export interface PlanDescentBaseline {
  recorded: string | null;
  grandfathered: string[];
}

export interface PlanDescentViolation {
  planId: string;
  file: string;
  reason: PlanDescentReason;
  detail?: string;
}

export interface PlanDescentResult {
  checked: number;
  newViolations: PlanDescentViolation[];
  grandfathered: PlanDescentViolation[];
  baselineCount: number;
  ok: boolean;
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function markdownFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!match) return null;
  try {
    const parsed = parseYaml(match[1]);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function docStatus(repoRoot: string, relPath: string): string | null {
  const abs = join(repoRoot, relPath);
  if (!existsSync(abs)) return null;
  try {
    const raw = markdownFrontmatter(readFileSync(abs, "utf-8"));
    return raw ? stringField(raw.status) : null;
  } catch {
    return null;
  }
}

export function loadPlanDescentDocs(
  repoRoot: string = process.cwd(),
  target?: string,
): PlanDescentDoc[] {
  const plansDir = join(repoRoot, "docs", "plans");
  if (!existsSync(plansDir)) return [];
  const files = target
    ? [target]
    : readdirSync(plansDir)
        .filter((name) => name.startsWith("PLAN-") && name.endsWith(".md"))
        .map((name) => join("docs", "plans", name));
  const docs: PlanDescentDoc[] = [];
  for (const rel of files) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    const raw = markdownFrontmatter(readFileSync(abs, "utf-8"));
    if (!raw) continue;
    const parentDesign = stringField(raw.parent_design);
    const pairArtifact = stringField(raw.pair_artifact);
    const generates = Array.isArray(raw.generates) ? raw.generates : [];
    docs.push({
      file: rel,
      planId: stringField(raw.plan_id) ?? rel,
      kind: stringField(raw.kind),
      status: stringField(raw.status),
      parentDesign,
      parentDesignExists: parentDesign ? existsSync(join(repoRoot, parentDesign)) : false,
      parentDesignStatus: parentDesign ? docStatus(repoRoot, parentDesign) : null,
      pairArtifact,
      pairArtifactExists: pairArtifact ? existsSync(join(repoRoot, pairArtifact)) : false,
      generatesArtifactTypes: generates
        .map((g) =>
          g && typeof g === "object"
            ? stringField((g as Record<string, unknown>).artifact_type)
            : null,
        )
        .filter((t): t is string => t !== null),
    });
  }
  return docs;
}

export function loadPlanDescentBaseline(repoRoot: string = process.cwd()): PlanDescentBaseline {
  const abs = join(repoRoot, PLAN_DESCENT_BASELINE_PATH);
  if (!existsSync(abs)) return { recorded: null, grandfathered: [] };
  try {
    const parsed = JSON.parse(readFileSync(abs, "utf-8")) as Partial<PlanDescentBaseline>;
    return {
      recorded: typeof parsed.recorded === "string" ? parsed.recorded : null,
      grandfathered: Array.isArray(parsed.grandfathered)
        ? parsed.grandfathered.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { recorded: null, grandfathered: [] };
  }
}

function isL6DesignDoc(path: string): boolean {
  return path.startsWith(DESIGN_PARENT_PREFIX) && path.includes(`/${L6_DESIGN_SEGMENT}`);
}

function collectViolations(doc: PlanDescentDoc): PlanDescentViolation[] {
  const violations: PlanDescentViolation[] = [];
  if (!doc.parentDesign) {
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "parent_design_absent",
    });
  } else if (!isL6DesignDoc(doc.parentDesign) || !doc.parentDesignExists) {
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "parent_design_not_l6_design_doc",
      detail: doc.parentDesign,
    });
  } else if (
    doc.status !== null &&
    CONFIRM_STATUSES.has(doc.status) &&
    doc.parentDesignStatus !== "confirmed"
  ) {
    // 実装が設計 confirm を追い越す「実装先行」を confirm 時点で fail-close する
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "parent_design_not_confirmed",
      detail: `${doc.parentDesign} status=${doc.parentDesignStatus ?? "-"}`,
    });
  }
  if (
    !doc.pairArtifact ||
    !doc.pairArtifact.startsWith(TEST_DESIGN_PREFIX) ||
    !doc.pairArtifactExists
  ) {
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "pair_artifact_not_test_design",
      detail: doc.pairArtifact ?? undefined,
    });
  }
  if (!doc.generatesArtifactTypes.includes("test_code")) {
    // ドキュメント・検証資産に残らない実装の起票を拒否する (missing-test-plan-id 再発の根本遮断)
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "generates_missing_test_code",
    });
  }
  return violations;
}

export function analyzePlanDescent(
  docs: PlanDescentDoc[],
  baseline: PlanDescentBaseline,
): PlanDescentResult {
  const grandfatheredIds = new Set(baseline.grandfathered);
  const newViolations: PlanDescentViolation[] = [];
  const grandfathered: PlanDescentViolation[] = [];
  let checked = 0;
  for (const doc of docs) {
    if (!doc.kind || !TARGET_KINDS.has(doc.kind)) continue;
    if (doc.status === "archived") continue;
    if (doc.planId.startsWith(DISCOVERY_PLAN_PREFIX)) continue;
    checked += 1;
    for (const violation of collectViolations(doc)) {
      if (grandfatheredIds.has(violation.planId)) grandfathered.push(violation);
      else newViolations.push(violation);
    }
  }
  const grandfatheredPlanIds = new Set(grandfathered.map((v) => v.planId));
  return {
    checked,
    newViolations,
    grandfathered,
    baselineCount: baseline.grandfathered.length,
    ok: newViolations.length === 0 && grandfatheredPlanIds.size <= baseline.grandfathered.length,
  };
}

/** gate 導入時の baseline 機械生成 (手書き禁止)。既存違反 plan_id を昇順で固定する。 */
export function buildPlanDescentBaseline(
  docs: PlanDescentDoc[],
  recorded: string,
): PlanDescentBaseline {
  const empty: PlanDescentBaseline = { recorded: null, grandfathered: [] };
  const result = analyzePlanDescent(docs, empty);
  const ids = [...new Set(result.newViolations.map((v) => v.planId))].sort();
  return { recorded, grandfathered: ids };
}

export function planDescentMessages(result: PlanDescentResult): string[] {
  const grandfatheredIds = new Set(result.grandfathered.map((v) => v.planId)).size;
  if (result.ok) {
    return [
      `plan-descent - OK (impl PLAN checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})`,
    ];
  }
  const sample = result.newViolations
    .slice(0, 8)
    .map((v) => `${v.planId}:${v.reason}${v.detail ? `(${v.detail})` : ""}`)
    .join(", ");
  return [
    `plan-descent - violation ${result.newViolations.length} 件 (checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})。L6 設計 doc への parent_design と docs/test-design/ への pair_artifact、generates の test_code を確認 (PLAN-L6-54)`,
    `plan-descent - sample: ${sample}`,
  ];
}
