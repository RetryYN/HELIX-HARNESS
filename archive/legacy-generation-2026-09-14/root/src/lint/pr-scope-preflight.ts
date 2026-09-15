// PLAN-RECOVERY-1690-pr-scope-preflight
// CI と同じ analyzePrContext を push 前に実行する薄い入口。新しい判定器は作らない。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  analyzePrContext,
  commaValues,
  fieldValues,
  type PrContextFinding,
  type PrContextResult,
  type PrPlanContract,
  pathCovered,
  readPrPlanContract,
} from "./github-guards";
import { computeOutstandingWork } from "./outstanding";
import {
  buildOutstandingSnapshot,
  OUTSTANDING_SNAPSHOT_PATH,
  renderOutstandingSnapshot,
} from "./outstanding-snapshot";
import { fmValue } from "./shared";

export const PR_SCOPE_PREFLIGHT_SCHEMA_VERSION = "helix-pr-scope-preflight.v1" as const;

export interface PlanStatusChange {
  path: string;
  fromStatus: string | null;
  toStatus: string | null;
}

export interface OutstandingSnapshotImpact {
  snapshotPath: string;
  inDiff: boolean;
  planStatusChanges: PlanStatusChange[];
  baseEqualsLive: boolean;
  headEqualsLive: boolean | null;
  regenerationNeeded: boolean;
  guidance: string;
}

export interface PrScopePreflightInput {
  body: string;
  changedPaths: string[];
  headBranch?: string;
  baseBranch?: string;
  planContracts?: PrPlanContract[];
  planStatusChanges?: PlanStatusChange[];
  baseSnapshotText?: string | null;
  headSnapshotText?: string | null;
  liveSnapshotText?: string | null;
}

export interface PrScopePreflightResult {
  schema_version: typeof PR_SCOPE_PREFLIGHT_SCHEMA_VERSION;
  ok: boolean;
  eventName: "pull_request";
  headBranch: string;
  baseBranch: string;
  changedPaths: string[];
  findings: PrContextFinding[];
  context: PrContextResult;
  undeclared: string[];
  absent: string[];
  companionMissing: string[];
  outsideAllowed: string[];
  suggestedExpectedChangedPaths: string[];
  permissionRequiredPaths: string[];
  snapshotImpact: OutstandingSnapshotImpact;
}

export function collectAllowedAwareSuggestion(
  body: string,
  changedPaths: readonly string[],
): {
  undeclared: string[];
  absent: string[];
  outsideAllowed: string[];
  suggestedExpectedChangedPaths: string[];
  permissionRequiredPaths: string[];
} {
  const actual = [...new Set(changedPaths)].sort();
  const familyValues = fieldValues(body, "Allowed path families");
  const expectedValues = fieldValues(body, "Expected changed paths");
  const families = commaValues(familyValues[0] ?? "");
  const expected = commaValues(expectedValues[0] ?? "");
  const familiesUsable =
    familyValues.length === 1 && families.length > 0 && new Set(families).size === families.length;
  const expectedSet = new Set(expected);
  const undeclared = actual.filter((path) => !expectedSet.has(path));
  const absent = expected.filter((path) => !actual.includes(path));
  const outsideAllowed = familiesUsable
    ? actual.filter((path) => !families.some((family) => pathCovered(path, family)))
    : [];
  const permissionRequiredPaths = outsideAllowed.filter((path) => undeclared.includes(path));
  const suggestedExpectedChangedPaths = familiesUsable
    ? actual.filter((path) => !outsideAllowed.includes(path))
    : [];
  return {
    undeclared,
    absent,
    outsideAllowed,
    suggestedExpectedChangedPaths,
    permissionRequiredPaths,
  };
}

export function observeOutstandingSnapshotImpact(input: {
  changedPaths: readonly string[];
  planStatusChanges: readonly PlanStatusChange[];
  baseSnapshotText: string | null;
  headSnapshotText?: string | null;
  liveSnapshotText: string | null;
}): OutstandingSnapshotImpact {
  const snapshotPath = OUTSTANDING_SNAPSHOT_PATH;
  const inDiff = input.changedPaths.includes(snapshotPath);
  const live = input.liveSnapshotText;
  const baseEqualsLive = live !== null && live === input.baseSnapshotText;
  const headEqualsLive =
    input.headSnapshotText === undefined ? null : live !== null && live === input.headSnapshotText;
  const statusChanged = input.planStatusChanges.some(
    (change) => change.fromStatus !== change.toStatus,
  );
  const regenerationNeeded =
    live !== null && input.headSnapshotText != null && live !== input.headSnapshotText;
  const promotionToTerminal = input.planStatusChanges.some(
    (change) =>
      change.fromStatus !== null &&
      change.fromStatus !== "confirmed" &&
      change.toStatus === "confirmed",
  );
  const newDraft = input.planStatusChanges.some(
    (change) => change.fromStatus === null && change.toStatus === "draft",
  );
  let guidance = "PLAN status 由来の snapshot 影響なし";
  if (promotionToTerminal && baseEqualsLive) {
    guidance = inDiff
      ? "昇格したので snapshot は net-zero になる。宣言から外せ"
      : "昇格したので snapshot は net-zero になる。Expected に残しているなら外せ";
  } else if (newDraft && !baseEqualsLive) {
    guidance = inDiff
      ? "draft PLAN 追加で snapshot が diff に現れる。Expected へ宣言せよ。Allowed 外なら許可が必要"
      : "draft PLAN 追加で snapshot 再生成が必要。Expected へ宣言せよ。自動追加はしない";
  } else if (statusChanged && regenerationNeeded) {
    guidance =
      "PLAN status 変更で snapshot 再生成が必要。helix db rebuild を意図 commit に含めよ。自動 commit はしない";
  } else if (statusChanged && baseEqualsLive && inDiff) {
    guidance = "snapshot は base と同一（net-zero）。宣言から外せ";
  } else if (statusChanged && !baseEqualsLive && !inDiff) {
    guidance =
      "PLAN status 変更で snapshot が net-diff になる。再生成して Expected へ宣言せよ。Allowed 外なら許可が必要";
  }
  return {
    snapshotPath,
    inDiff,
    planStatusChanges: [...input.planStatusChanges],
    baseEqualsLive,
    headEqualsLive,
    regenerationNeeded,
    guidance,
  };
}

export function runPrScopePreflight(input: PrScopePreflightInput): PrScopePreflightResult {
  const changedPaths = [...new Set(input.changedPaths)].sort();
  const context = analyzePrContext({
    eventName: "pull_request",
    headBranch: input.headBranch,
    baseBranch: input.baseBranch,
    body: input.body,
    changedPaths,
    planContracts: input.planContracts,
  });
  const suggestion = collectAllowedAwareSuggestion(input.body, changedPaths);
  const companionMissing = context.findings
    .filter(
      (finding) =>
        finding.code === "pr_scope_companion_missing" ||
        finding.code === "pr_scope_source_companions_missing",
    )
    .map((finding) => finding.message);
  const snapshotImpact = observeOutstandingSnapshotImpact({
    changedPaths,
    planStatusChanges: input.planStatusChanges ?? [],
    baseSnapshotText: input.baseSnapshotText ?? null,
    headSnapshotText: input.headSnapshotText,
    liveSnapshotText: input.liveSnapshotText ?? null,
  });
  return {
    schema_version: PR_SCOPE_PREFLIGHT_SCHEMA_VERSION,
    ok: context.ok,
    eventName: "pull_request",
    headBranch: context.headBranch,
    baseBranch: context.baseBranch,
    changedPaths,
    findings: context.findings,
    context,
    undeclared: suggestion.undeclared,
    absent: suggestion.absent,
    companionMissing,
    outsideAllowed: suggestion.outsideAllowed,
    suggestedExpectedChangedPaths: suggestion.suggestedExpectedChangedPaths,
    permissionRequiredPaths: suggestion.permissionRequiredPaths,
    snapshotImpact,
  };
}

function gitText(repoRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitShow(repoRoot: string, ref: string, path: string): string | null {
  try {
    return gitText(repoRoot, ["show", `${ref}:${path}`]);
  } catch {
    return null;
  }
}

export function loadChangedPathsFromGit(repoRoot: string, base: string, head: string): string[] {
  const output = execFileSync(
    "git",
    ["-C", repoRoot, "diff", "--name-only", "-z", `${base}...${head}`],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  return output.split("\0").filter(Boolean).sort();
}

export function loadPlanStatusChangesFromGit(
  repoRoot: string,
  opts: { base: string; head: string; changedPaths: readonly string[] },
): PlanStatusChange[] {
  return opts.changedPaths
    .filter((path) => /^docs\/plans\/PLAN-.*\.md$/.test(path))
    .map((path) => {
      const fromText = gitShow(repoRoot, opts.base, path);
      const toText = gitShow(repoRoot, opts.head, path);
      return {
        path,
        fromStatus: fromText ? (fmValue(fromText, "status") ?? null) : null,
        toStatus: toText ? (fmValue(toText, "status") ?? null) : null,
      };
    })
    .filter((change) => change.fromStatus !== change.toStatus);
}

export function loadLiveOutstandingSnapshotText(repoRoot: string): string | null {
  try {
    return renderOutstandingSnapshot(buildOutstandingSnapshot(computeOutstandingWork(repoRoot)));
  } catch {
    return null;
  }
}

export function loadPrScopePreflightFromGit(
  repoRoot: string,
  opts: {
    base: string;
    head?: string;
    body: string;
    changedPaths?: string[];
  },
): PrScopePreflightResult {
  const head = opts.head ?? "HEAD";
  const changedPaths = opts.changedPaths ?? loadChangedPathsFromGit(repoRoot, opts.base, head);
  const planContracts = changedPaths
    .filter((path) => /^docs\/plans\/PLAN-.*\.md$/.test(path))
    .filter((path) => existsSync(join(repoRoot, path)))
    .map((path) => readPrPlanContract(path, readFileSync(join(repoRoot, path), "utf8")));
  return runPrScopePreflight({
    body: opts.body,
    changedPaths,
    headBranch: head,
    baseBranch: opts.base,
    planContracts,
    planStatusChanges: loadPlanStatusChangesFromGit(repoRoot, {
      base: opts.base,
      head,
      changedPaths,
    }),
    baseSnapshotText: gitShow(repoRoot, opts.base, OUTSTANDING_SNAPSHOT_PATH),
    headSnapshotText: gitShow(repoRoot, head, OUTSTANDING_SNAPSHOT_PATH),
    liveSnapshotText: loadLiveOutstandingSnapshotText(repoRoot),
  });
}

export function prScopePreflightMessages(result: PrScopePreflightResult): string[] {
  const lines = [
    `github pr-scope-preflight: ${result.ok ? "ok" : "blocked"} findings=${result.findings.length} undeclared=${result.undeclared.length} absent=${result.absent.length} outside=${result.outsideAllowed.length}`,
  ];
  for (const finding of result.findings) {
    lines.push(`  finding ${finding.code}: ${finding.message}`);
  }
  if (result.suggestedExpectedChangedPaths.length > 0) {
    lines.push(
      `  suggested Expected changed paths: ${result.suggestedExpectedChangedPaths.join(", ")}`,
    );
  }
  if (result.permissionRequiredPaths.length > 0) {
    lines.push(`  permission required (Allowed外): ${result.permissionRequiredPaths.join(", ")}`);
  }
  lines.push(`  snapshot: ${result.snapshotImpact.guidance}`);
  return lines;
}
