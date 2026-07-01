import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  RENAME_PLAN_PACKET_COMMAND,
  type RelatedDecisionPacket,
  relatedDecisionPacket,
  uniqueRelatedDecisionPackets,
} from "./workflow-decision-packets";

export type IdentifierRenameToken = "ut-tdd" | ".ut-tdd" | "area=harness";
export type IdentifierRenameHitCategory =
  | "source_code"
  | "test_code"
  | "runtime_state"
  | "adapter_config"
  | "consumer_template"
  | "plan_doc"
  | "design_doc"
  | "governance_doc"
  | "distribution_surface"
  | "other";

export interface IdentifierRenameHit {
  token: IdentifierRenameToken;
  path: string;
  count: number;
  category: IdentifierRenameHitCategory;
}

export interface IdentifierRenameCategorySummary {
  category: IdentifierRenameHitCategory;
  hits: number;
  files: number;
}

export interface IdentifierRenameAudit {
  sourceRoot: string;
  targetCli: "helix";
  targetStateDir: ".helix";
  tokens: IdentifierRenameToken[];
  totalHits: number;
  hitsByToken: Record<IdentifierRenameToken, number>;
  filesByToken: Record<IdentifierRenameToken, number>;
  hitsByCategory: IdentifierRenameCategorySummary[];
  hits: IdentifierRenameHit[];
  cutoverApproved: boolean;
  status: "ready_for_cutover" | "blocked_pending_cutover_approval";
  requiredRecords: string[];
}

export interface IdentifierRenameMapping {
  from: IdentifierRenameToken;
  to: "helix" | ".helix" | "area=helix";
}

export interface IdentifierRenameCutoverPlan {
  schemaVersion: "identifier-rename-cutover-plan.v1";
  status: "ready_for_cutover_packet" | "blocked_pending_cutover_approval";
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  applyAuthorized: boolean;
  targetCli: "helix";
  targetStateDir: ".helix";
  renameMap: IdentifierRenameMapping[];
  audit: Pick<
    IdentifierRenameAudit,
    "status" | "totalHits" | "hitsByToken" | "filesByToken" | "requiredRecords"
  >;
  hitsByCategory: IdentifierRenameCategorySummary[];
  cutoverCategoryChecklist: Array<{
    category: IdentifierRenameHitCategory;
    hits: number;
    files: number;
    cutoverAction: string;
  }>;
  blockedReasons: string[];
  dryRunPlan: string[];
  rollbackPlan: string[];
  monitoringPlan: string[];
  stateBackupManifest: Array<{
    path: string;
    purpose: string;
    restoreRequired: true;
  }>;
  freezePolicy: {
    requiresFrozenHead: true;
    requiresQuietWindow: true;
    concurrencyPolicy: "single-run-no-concurrent-apply";
    reapprovalTriggers: string[];
  };
  cutoverSnapshot: IdentifierRenameCutoverSnapshot;
  provenanceRequirements: Array<{
    item: string;
    evidence: string;
  }>;
  relatedDecisionPackets: RelatedDecisionPacket[];
  approvalGate: {
    requiredRecords: string[];
    requiredDecision: "approve_cutover";
    requiredActionBinding: "approve_action_binding";
    approvedActorRequired: true;
    approvedToolRequired: true;
    approvedTargetRequired: true;
    approvedParamsRequired: true;
    reviewedSnapshotBindingRequired: true;
  };
}

export interface IdentifierRenameCutoverSnapshot {
  snapshotId: string;
  blastRadiusDigest: string;
  approvalScopeDigest: string;
  evidenceDigest: string;
  sourceLedgerCheckedDate: string | null;
  invalidatedBy: string[];
}

const TOKENS: IdentifierRenameToken[] = ["ut-tdd", ".ut-tdd", "area=harness"];
const HIT_CATEGORIES: IdentifierRenameHitCategory[] = [
  "source_code",
  "test_code",
  "runtime_state",
  "adapter_config",
  "consumer_template",
  "plan_doc",
  "design_doc",
  "governance_doc",
  "distribution_surface",
  "other",
];
const RENAME_MAP: IdentifierRenameMapping[] = [
  { from: "ut-tdd", to: "helix" },
  { from: ".ut-tdd", to: ".helix" },
  { from: "area=harness", to: "area=helix" },
];
const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "coverage"]);
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonl",
  ".md",
  ".mjs",
  ".ps1",
  ".sh",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function hasTextExtension(path: string): boolean {
  const match = path.match(/\.[^.\\/]+$/);
  return match ? TEXT_EXTENSIONS.has(match[0] ?? "") : false;
}

function countToken(text: string, token: IdentifierRenameToken): number {
  return text.split(token).length - 1;
}

function classifyRenameHitPath(path: string): IdentifierRenameHitCategory {
  if (path.startsWith(".ut-tdd/")) return "runtime_state";
  if (
    path === "AGENTS.md" ||
    path === "CLAUDE.md" ||
    path.startsWith(".claude/") ||
    path.startsWith(".codex/")
  ) {
    return "adapter_config";
  }
  if (path.startsWith("docs/templates/")) return "consumer_template";
  if (path.startsWith("docs/plans/")) return "plan_doc";
  if (path.startsWith("docs/design/") || path.startsWith("docs/test-design/")) {
    return "design_doc";
  }
  if (
    path.startsWith("docs/governance/") ||
    path.startsWith("docs/process/") ||
    path.startsWith("docs/adr/") ||
    path.startsWith("docs/reference/")
  ) {
    return "governance_doc";
  }
  if (path.startsWith("src/")) return "source_code";
  if (path.startsWith("tests/")) return "test_code";
  if (
    path === "package.json" ||
    path === "bun.lock" ||
    path.startsWith("scripts/") ||
    path.startsWith(".github/")
  ) {
    return "distribution_surface";
  }
  return "other";
}

function walkTextFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!hasTextExtension(abs)) continue;
      files.push(abs);
    }
  };
  walk(root);
  return files.sort();
}

interface CutoverApprovalEvaluation {
  approved: boolean;
  reasons: string[];
  cutoverSnapshotId: string;
  reviewedSnapshotBinding: string;
}

function evaluateCutoverApproval(root: string): CutoverApprovalEvaluation {
  const planPath = join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md");
  if (!existsSync(planPath) || !statSync(planPath).isFile()) {
    return {
      approved: false,
      reasons: ["missing PLAN-M-02-helix-identifier-rename.md approval source"],
      cutoverSnapshotId: "",
      reviewedSnapshotBinding: "",
    };
  }
  const text = readFileSync(planPath, "utf8");
  const blockFor = (recordName: string): string => {
    const match = text.match(
      new RegExp(`(?:^|\\n)${recordName}:\\s*\\n([\\s\\S]*?)(?=\\n\\S[^\\n]*:\\s*(?:\\n|$)|$)`),
    );
    return match?.[1] ?? "";
  };
  const valueFor = (block: string, field: string): string | null => {
    const line = block
      .split(/\r?\n/)
      .find((candidate) => new RegExp(`^\\s*-?\\s*${field}:`).test(candidate));
    return line?.replace(new RegExp(`^\\s*-?\\s*${field}:\\s*`), "").trim() ?? null;
  };
  const normalizedValue = (value: string | null): string =>
    (value ?? "").trim().replace(/^["'`]+|["'`]+$/g, "");
  const isExactOutcome = (value: string | null, expected: string): boolean =>
    normalizedValue(value) === expected;
  const cutoverBlock = blockFor("cutover_decision_record");
  const approvalBlock = blockFor("action_binding_approval_record");
  const reasons: string[] = [];
  const isConcreteValue = (value: string | null): boolean => {
    const normalized = normalizedValue(value);
    if (!normalized) return false;
    if (/^<[^>]+>$/.test(normalized)) return false;
    if (/^No\b/i.test(normalized)) return false;
    if (normalized.includes("`") && normalized.includes("/")) return false;
    if (/\bmust\s+(name|record|write|cite|review)\b/i.test(normalized)) return false;
    if (/\bbefore\s+(apply|approval|cutover|execution)\b/i.test(normalized)) return false;
    if (/\bnot approved\b/i.test(normalized)) return false;
    return true;
  };
  const requireOutcome = (input: {
    block: string;
    field: string;
    expected: string;
    recordName: string;
  }) => {
    const { block, field, expected, recordName } = input;
    if (!isExactOutcome(valueFor(block, field), expected)) {
      reasons.push(`missing concrete ${recordName}.${field}=${expected}`);
    }
  };
  const requireConcrete = (block: string, field: string, recordName: string) => {
    if (!isConcreteValue(valueFor(block, field))) {
      reasons.push(`missing concrete ${recordName}.${field}`);
    }
  };
  const requireSnapshot = (block: string, field: string, recordName: string) => {
    const value = normalizedValue(valueFor(block, field));
    if (!/\bsha256:[a-f0-9]{64}\b/.test(value)) {
      reasons.push(`missing concrete ${recordName}.${field} sha256 snapshot id`);
    }
  };
  const snapshotValue = (block: string, field: string): string =>
    normalizedValue(valueFor(block, field)).match(/\bsha256:[a-f0-9]{64}\b/)?.[0] ?? "";

  requireOutcome({
    block: cutoverBlock,
    field: "allowed_outcome",
    expected: "approve_cutover",
    recordName: "cutover_decision_record",
  });
  for (const field of [
    "decision_owner",
    "trigger_condition",
    "blast_radius_baseline",
    "dry_run_plan",
    "rollback_plan",
    "state_backup_plan",
    "execution_window_or_freeze_policy",
    "approval_scope",
    "audit_record",
    "post_cutover_monitoring",
    "legacy_alias_policy",
  ]) {
    requireConcrete(cutoverBlock, field, "cutover_decision_record");
  }
  requireSnapshot(cutoverBlock, "cutover_snapshot_id", "cutover_decision_record");

  requireOutcome({
    block: approvalBlock,
    field: "allowed_outcome",
    expected: "approve_action_binding",
    recordName: "action_binding_approval_record",
  });
  for (const field of [
    "approval_policy_or_named_approver",
    "approval_scope",
    "approved_actor",
    "approved_tool",
    "approved_target",
    "approved_params",
    "review_approval_evidence",
    "expires_at_or_trigger",
    "audit_record",
  ]) {
    requireConcrete(approvalBlock, field, "action_binding_approval_record");
  }
  requireSnapshot(approvalBlock, "reviewed_snapshot_binding", "action_binding_approval_record");

  return {
    approved: reasons.length === 0,
    reasons,
    cutoverSnapshotId: snapshotValue(cutoverBlock, "cutover_snapshot_id"),
    reviewedSnapshotBinding: snapshotValue(approvalBlock, "reviewed_snapshot_binding"),
  };
}

function cutoverApprovalPresent(root: string): boolean {
  return evaluateCutoverApproval(root).approved;
}

export function auditIdentifierRenameBlastRadius(root: string): IdentifierRenameAudit {
  const hits: IdentifierRenameHit[] = [];
  const hitsByToken: Record<IdentifierRenameToken, number> = {
    "ut-tdd": 0,
    ".ut-tdd": 0,
    "area=harness": 0,
  };
  const filesByToken: Record<IdentifierRenameToken, number> = {
    "ut-tdd": 0,
    ".ut-tdd": 0,
    "area=harness": 0,
  };
  const categoryStats = new Map<
    IdentifierRenameHitCategory,
    { hits: number; files: Set<string> }
  >();
  for (const category of HIT_CATEGORIES) categoryStats.set(category, { hits: 0, files: new Set() });

  for (const file of walkTextFiles(root)) {
    const rel = relative(root, file).replace(/\\/g, "/");
    const category = classifyRenameHitPath(rel);
    const text = readFileSync(file, "utf8");
    for (const token of TOKENS) {
      const count = countToken(text, token);
      if (count === 0) continue;
      hits.push({ token, path: rel, count, category });
      hitsByToken[token] += count;
      filesByToken[token] += 1;
      const stats = categoryStats.get(category);
      if (stats) {
        stats.hits += count;
        stats.files.add(rel);
      }
    }
  }

  const cutoverApproved = cutoverApprovalPresent(root);
  const hitsByCategory = HIT_CATEGORIES.map((category) => {
    const stats = categoryStats.get(category);
    return {
      category,
      hits: stats?.hits ?? 0,
      files: stats?.files.size ?? 0,
    };
  }).filter((summary) => summary.hits > 0);
  return {
    sourceRoot: root,
    targetCli: "helix",
    targetStateDir: ".helix",
    tokens: TOKENS,
    totalHits: hits.reduce((sum, hit) => sum + hit.count, 0),
    hitsByToken,
    filesByToken,
    hitsByCategory,
    hits,
    cutoverApproved,
    status: cutoverApproved ? "ready_for_cutover" : "blocked_pending_cutover_approval",
    requiredRecords: ["cutover_decision_record", "action_binding_approval_record"],
  };
}

function cutoverActionForCategory(category: IdentifierRenameHitCategory): string {
  switch (category) {
    case "runtime_state":
      return "backup and migrate state paths atomically, then verify restore before apply";
    case "adapter_config":
      return "rewrite Claude/Codex adapter markers and hook config in the same cutover commit";
    case "consumer_template":
      return "update generated project templates and rerun setup dry-run smoke";
    case "source_code":
      return "apply source codemod and run typecheck plus targeted runtime tests";
    case "test_code":
      return "update oracle fixtures and run targeted plus full test suite";
    case "plan_doc":
      return "update PLAN records and keep approval-gated semantics intact";
    case "design_doc":
      return "update design/test-design trace without collapsing approval_gated_cutover status";
    case "governance_doc":
      return "update governance/process references and rule-drift markers together";
    case "distribution_surface":
      return "update package/scripts/GitHub surfaces and run distribution smoke";
    case "other":
      return "inspect manually before approval and record disposition in audit_record";
  }
}

export function buildIdentifierRenameCutoverPlan(root: string): IdentifierRenameCutoverPlan {
  const audit = auditIdentifierRenameBlastRadius(root);
  const approvalEvaluation = evaluateCutoverApproval(root);
  const blockedReasons = approvalEvaluation.approved ? [] : [...approvalEvaluation.reasons];
  const hitsByCategory = audit.hitsByCategory;
  const cutoverCategoryChecklist = hitsByCategory.map((summary) => ({
    ...summary,
    cutoverAction: cutoverActionForCategory(summary.category),
  }));
  const stateBackupManifest: IdentifierRenameCutoverPlan["stateBackupManifest"] = [
    {
      path: ".ut-tdd/harness.db",
      purpose: "state DB projection and completion evidence baseline",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/memory",
      purpose: "HELIX shared memory before state-dir rename",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/state",
      purpose: "active plan, setup, and runtime state before migration",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/logs",
      purpose: "runtime/session/gate logs used as verification provenance",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/handover",
      purpose: "handover pointer and completion decision packet continuity",
      restoreRequired: true,
    },
    {
      path: ".claude/settings.json",
      purpose: "Claude hook/adapter config before marker rename",
      restoreRequired: true,
    },
    {
      path: ".codex/hooks.json",
      purpose: "Codex hook adapter config before marker rename",
      restoreRequired: true,
    },
  ];
  const freezePolicy: IdentifierRenameCutoverPlan["freezePolicy"] = {
    requiresFrozenHead: true,
    requiresQuietWindow: true,
    concurrencyPolicy: "single-run-no-concurrent-apply" as const,
    reapprovalTriggers: [
      "HEAD changes after approval",
      "blast-radius hit set changes after approval",
      "approval scope or approved params change",
      "dry-run, rollback, backup, or monitoring plan changes",
      "doctor, full test, or distribution smoke evidence becomes stale or red",
    ],
  };
  const provenanceRequirements = [
    {
      item: "blast_radius_baseline",
      evidence: "rename audit JSON captured at frozen HEAD with token/file counts",
    },
    {
      item: "state_backup_plan",
      evidence:
        "backup manifest with restore-required entries for DB, memory, state, logs, handover, and hook configs",
    },
    {
      item: "audit_record",
      evidence:
        "approver, git hash, command args, params hash, result, incident/rollback decision, and monitoring outcome",
    },
    {
      item: "execution_window_or_freeze_policy",
      evidence:
        "quiet window, single-run concurrency policy, frozen HEAD, and re-approval triggers",
    },
  ];
  const cutoverSnapshot = buildIdentifierRenameCutoverSnapshot({
    audit,
    renameMap: RENAME_MAP,
    hitsByCategory,
    cutoverCategoryChecklist,
    stateBackupManifest,
    freezePolicy,
    provenanceRequirements,
  });
  if (approvalEvaluation.approved) {
    if (approvalEvaluation.cutoverSnapshotId !== cutoverSnapshot.snapshotId) {
      blockedReasons.push(
        "cutover_decision_record.cutover_snapshot_id does not match current cutoverSnapshot.snapshotId",
      );
    }
    if (approvalEvaluation.reviewedSnapshotBinding !== cutoverSnapshot.snapshotId) {
      blockedReasons.push(
        "action_binding_approval_record.reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId",
      );
    }
  }
  const applyAuthorized = approvalEvaluation.approved && blockedReasons.length === 0;

  return {
    schemaVersion: "identifier-rename-cutover-plan.v1",
    status: applyAuthorized ? "ready_for_cutover_packet" : "blocked_pending_cutover_approval",
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    applyAuthorized,
    targetCli: audit.targetCli,
    targetStateDir: audit.targetStateDir,
    renameMap: RENAME_MAP,
    audit: {
      status: applyAuthorized ? "ready_for_cutover" : "blocked_pending_cutover_approval",
      totalHits: audit.totalHits,
      hitsByToken: audit.hitsByToken,
      filesByToken: audit.filesByToken,
      requiredRecords: audit.requiredRecords,
    },
    hitsByCategory,
    cutoverCategoryChecklist,
    blockedReasons,
    dryRunPlan: [
      "run rename audit and freeze the ut-tdd/.ut-tdd/area=harness blast-radius baseline",
      "rehearse source/test/docs codemod on a non-destructive branch",
      "rehearse state path migration with backup/restore proof for .ut-tdd/harness.db, memory, state, logs, and handover",
      "run targeted identifier-rename tests, typecheck, lint, db rebuild, doctor, and full test suite",
      "run compiled distribution smoke after the CLI/bin rename rehearsal",
    ],
    rollbackPlan: [
      "create a pre-cutover branch or tag at frozen HEAD",
      "backup .ut-tdd/harness.db, memory, state, logs, handover, provider handover, and repo-local hook configs",
      "restore old hook/adapter markers and state paths if doctor or full tests fail",
      "keep or restore a temporary ut-tdd alias only with an explicit sunset PLAN",
      "revert the cutover commit if post-cutover monitoring fails",
    ],
    monitoringPlan: [
      "run helix doctor and legacy alias smoke during the quiet window",
      "rebuild harness.db and inspect status/completion decision packet",
      "check rule-drift, hook adapter parity, and green-command digest after cutover",
      "watch feedback backlog, handover, and runtime logs for path or marker regressions",
    ],
    stateBackupManifest,
    freezePolicy,
    cutoverSnapshot,
    provenanceRequirements,
    relatedDecisionPackets: uniqueRelatedDecisionPackets([
      relatedDecisionPacket({
        command: RENAME_PLAN_PACKET_COMMAND,
        role: "primary",
        reason: "irreversible .ut-tdd to .helix cutover requires explicit cutover signoff",
        route:
          "use rename plan for blast-radius, dry-run, rollback, backup, monitoring, and approval-gate material",
      }),
      relatedDecisionPacket({
        command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
        role: "supporting",
        reason:
          "same cutover requires scoped human/action-binding approval before any irreversible apply",
        route:
          "record action_binding_approval_record with actor/tool/target/params before cutover execution",
      }),
    ]),
    approvalGate: {
      requiredRecords: audit.requiredRecords,
      requiredDecision: "approve_cutover",
      requiredActionBinding: "approve_action_binding",
      approvedActorRequired: true,
      approvedToolRequired: true,
      approvedTargetRequired: true,
      approvedParamsRequired: true,
      reviewedSnapshotBindingRequired: true,
    },
  };
}

function buildIdentifierRenameCutoverSnapshot(input: {
  audit: IdentifierRenameAudit;
  renameMap: IdentifierRenameMapping[];
  hitsByCategory: IdentifierRenameCategorySummary[];
  cutoverCategoryChecklist: IdentifierRenameCutoverPlan["cutoverCategoryChecklist"];
  stateBackupManifest: IdentifierRenameCutoverPlan["stateBackupManifest"];
  freezePolicy: IdentifierRenameCutoverPlan["freezePolicy"];
  provenanceRequirements: IdentifierRenameCutoverPlan["provenanceRequirements"];
}): IdentifierRenameCutoverSnapshot {
  const blastRadiusDigest = sha256Json({
    tokens: input.audit.tokens,
    hitsByToken: input.audit.hitsByToken,
    filesByToken: input.audit.filesByToken,
    hitsByCategory: input.hitsByCategory,
    hits: input.audit.hits.map((hit) => ({
      token: hit.token,
      path: hit.path,
      count: hit.count,
      category: hit.category,
    })),
  });
  const approvalScopeDigest = sha256Json({
    renameMap: input.renameMap,
    targetCli: input.audit.targetCli,
    targetStateDir: input.audit.targetStateDir,
    requiredRecords: input.audit.requiredRecords,
    cutoverCategoryChecklist: input.cutoverCategoryChecklist,
  });
  const evidenceDigest = sha256Json({
    stateBackupManifest: input.stateBackupManifest,
    freezePolicy: input.freezePolicy,
    provenanceRequirements: input.provenanceRequirements,
  });
  const snapshot = {
    blastRadiusDigest,
    approvalScopeDigest,
    evidenceDigest,
    sourceLedgerCheckedDate: null,
    invalidatedBy: input.freezePolicy.reapprovalTriggers,
  };
  return {
    snapshotId: sha256Json({
      schemaVersion: "identifier-rename-cutover-plan.v1",
      ...snapshot,
    }),
    ...snapshot,
  };
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}
