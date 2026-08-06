// PLAN-RECOVERY-16-outstanding-snapshot-owner (Issue #319)
// outstanding exact set の唯一の committed 正本。draft/confirmed 遷移で変化する分母を
// 生成 snapshot 1 ファイルへ集約し、audit doc・テスト・doctor は本 snapshot から導出する。
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { OutstandingWork } from "./outstanding";

export const OUTSTANDING_SNAPSHOT_PATH = "docs/governance/generated/outstanding-snapshot.json";

export interface OutstandingSnapshot {
  schema_version: "outstanding-snapshot.v1";
  decision_count: number;
  plan_ids: string[];
  blockers: string[];
  required_actions: string[];
}

export function buildOutstandingSnapshot(outstanding: OutstandingWork): OutstandingSnapshot {
  const planIds = [...new Set(outstanding.items.map((item) => item.planId))].sort();
  return {
    schema_version: "outstanding-snapshot.v1",
    decision_count: outstanding.items.length,
    plan_ids: planIds,
    blockers: [...new Set(outstanding.completionReadiness.blockers)].sort(),
    required_actions: [...new Set(outstanding.completionReadiness.requiredActions)].sort(),
  };
}

export function renderOutstandingSnapshot(snapshot: OutstandingSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function writeOutstandingSnapshot(
  repoRoot: string,
  outstanding: OutstandingWork,
): { path: string; changed: boolean } {
  const absolute = join(repoRoot, OUTSTANDING_SNAPSHOT_PATH);
  const next = renderOutstandingSnapshot(buildOutstandingSnapshot(outstanding));
  let previous: string | null = null;
  try {
    previous = readFileSync(absolute, "utf8");
  } catch {
    previous = null;
  }
  if (previous !== next) {
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, next, "utf8");
  }
  return { path: OUTSTANDING_SNAPSHOT_PATH, changed: previous !== next };
}

/**
 * committed snapshot text を返す。git repo では HEAD 版を優先する。
 * CI では checkout = candidate commit のため、post-test の再生成が working tree を
 * 書き換えても committed 正本の staleness を隠蔽できない (fail-close)。
 * git が使えない fixture root では working tree の file へフォールバックする。
 */
export function readCommittedOutstandingSnapshot(repoRoot: string): string | null {
  try {
    return execFileSync("git", ["show", `HEAD:${OUTSTANDING_SNAPSHOT_PATH}`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // fall through to the working-tree copy (non-git fixture roots)
  }
  try {
    return readFileSync(join(repoRoot, OUTSTANDING_SNAPSHOT_PATH), "utf8");
  } catch {
    return null;
  }
}

export function verifyOutstandingSnapshotText(
  snapshotText: string | null,
  outstanding: OutstandingWork,
): string[] {
  const violations: string[] = [];
  if (snapshotText === null) {
    return [`G-10: committed outstanding snapshot missing (${OUTSTANDING_SNAPSHOT_PATH})`];
  }
  let raw: unknown;
  try {
    raw = JSON.parse(snapshotText);
  } catch {
    return [`G-10: outstanding snapshot is not valid JSON (${OUTSTANDING_SNAPSHOT_PATH})`];
  }
  if (typeof raw !== "object" || raw === null) {
    return [`G-10: outstanding snapshot must be an object (${OUTSTANDING_SNAPSHOT_PATH})`];
  }
  const snapshot = raw as Partial<OutstandingSnapshot>;
  if (snapshot.schema_version !== "outstanding-snapshot.v1") {
    violations.push("G-10: outstanding snapshot schema_version must be outstanding-snapshot.v1");
  }
  const expected = buildOutstandingSnapshot(outstanding);
  if (snapshot.decision_count !== expected.decision_count) {
    violations.push(
      `G-10: outstanding snapshot decision_count must equal ${expected.decision_count} (actual=${snapshot.decision_count ?? "missing"})`,
    );
  }
  const snapshotPlanIds = Array.isArray(snapshot.plan_ids)
    ? snapshot.plan_ids.filter((id): id is string => typeof id === "string")
    : [];
  const duplicates = snapshotPlanIds.filter((id, index) => snapshotPlanIds.indexOf(id) !== index);
  for (const duplicate of [...new Set(duplicates)]) {
    violations.push(`G-10: outstanding snapshot duplicates plan ${duplicate}`);
  }
  const snapshotSet = new Set(snapshotPlanIds);
  for (const planId of expected.plan_ids) {
    if (!snapshotSet.has(planId)) {
      violations.push(`G-10: outstanding snapshot missing live plan ${planId}`);
    }
  }
  const expectedSet = new Set(expected.plan_ids);
  for (const planId of snapshotSet) {
    if (!expectedSet.has(planId)) {
      violations.push(`G-10: outstanding snapshot lists non-outstanding plan ${planId}`);
    }
  }
  const snapshotBlockers = Array.isArray(snapshot.blockers) ? snapshot.blockers : [];
  if (JSON.stringify([...snapshotBlockers].sort()) !== JSON.stringify(expected.blockers)) {
    violations.push(
      `G-10: outstanding snapshot blockers must equal live blockers (${expected.blockers.join("/") || "none"})`,
    );
  }
  const snapshotActions = Array.isArray(snapshot.required_actions) ? snapshot.required_actions : [];
  if (JSON.stringify([...snapshotActions].sort()) !== JSON.stringify(expected.required_actions)) {
    violations.push("G-10: outstanding snapshot required_actions must equal live required actions");
  }
  return violations;
}
