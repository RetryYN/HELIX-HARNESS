import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  type CompletionDecisionRecordTemplate,
  computeOutstandingWork,
  recordTemplatesForRecords,
  requiredRecordsForBlockers,
  type SemanticFeatureFrontierRecord,
} from "./outstanding";
import {
  semanticFrontierBindingForPlan,
  semanticFrontierBindingViolations,
} from "./semantic-frontier-binding";
import {
  SOURCE_LEDGER_MAX_AGE_DAYS,
  sourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
  verificationSourceMetadataViolations,
} from "./source-ledger-freshness";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  buildDecisionPacketProvenance,
  type DecisionPacketFreshness,
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
  approvalRecordsConcrete: boolean;
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
  generatedAt: string;
  sourceCommand: typeof RENAME_PLAN_PACKET_COMMAND;
  freshness: DecisionPacketFreshness;
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  approvalMaterialReady: boolean;
  applyAuthorized: boolean;
  targetCli: "helix";
  targetStateDir: ".helix";
  renameMap: IdentifierRenameMapping[];
  semanticFeatureFrontierRecord: SemanticFeatureFrontierRecord;
  audit: Pick<
    IdentifierRenameAudit,
    "status" | "totalHits" | "hitsByToken" | "filesByToken" | "requiredRecords"
  >;
  hitsByCategory: IdentifierRenameCategorySummary[];
  cutoverCategoryChecklist: Array<{
    category: IdentifierRenameHitCategory;
    hits: number;
    files: number;
    samplePaths: string[];
    cutoverAction: string;
    verificationCommand: string;
  }>;
  blockedReasons: string[];
  recordTemplates: CompletionDecisionRecordTemplate[];
  dryRunPlan: string[];
  cutoverRunbook: Array<{
    id: string;
    phase: string;
    command: string;
    writePolicy: "no-write" | "local-artifact-write" | "state-write";
    evidencePath: string;
    passCriteria: string;
    rollbackCheck: string;
    source: string;
    sourceUrl: string;
  }>;
  verificationCommandMatrix: Array<{
    phase: string;
    command: string;
    writePolicy: "no-write" | "local-artifact-write" | "state-write";
    expected: string;
    evidence: string;
    source: string;
    sourceUrl: string;
    sourceCheckedAt: string;
    latestOfficialStatus: string;
    sourceStatusDelta: string;
    adoptionDecision: string;
    adoptionDecisionDelta: string;
    workflowRouteImpact: string;
  }>;
  rollbackPlan: string[];
  monitoringPlan: string[];
  stateBackupManifest: Array<{
    path: string;
    purpose: string;
    backupTargetPattern: string;
    checksumRequired: true;
    restoreDrillRequired: true;
    restoreEvidencePath: string;
    restoreRequired: true;
  }>;
  freezePolicy: {
    requiresFrozenHead: true;
    requiresQuietWindow: true;
    concurrencyPolicy: "single-run-no-concurrent-apply";
    reapprovalTriggers: string[];
  };
  sourceLedgerFreshness: IdentifierRenameSourceLedgerFreshness;
  cutoverSnapshot: IdentifierRenameCutoverSnapshot;
  snapshotReview: IdentifierRenameSnapshotReview;
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

export interface IdentifierRenameRehearsalPlan {
  schemaVersion: "identifier-rename-rehearsal.v1";
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  target: "helix";
  targetStateDir: ".helix";
  sourceCommand: "ut-tdd rename rehearsal --no-write --target helix --json";
  auditStatus: IdentifierRenameAudit["status"];
  renameMap: IdentifierRenameMapping[];
  previewCategories: IdentifierRenameCategorySummary[];
  previewCommands: Array<{
    phase: string;
    command: string;
    description: string;
    writesRepo: false;
    evidencePath: string;
  }>;
  blockedUntil: string[];
}

export interface IdentifierRenameStateBackupDryRun {
  schemaVersion: "identifier-rename-state-backup-dry-run.v1";
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  sourceCommand: "ut-tdd rename state-backup --dry-run --restore-drill --json";
  restoreDrillRequested: boolean;
  manifest: IdentifierRenameCutoverPlan["stateBackupManifest"];
  restoreChecks: Array<{
    path: string;
    backupTargetPattern: string;
    restoreEvidencePath: string;
    checksumRequired: true;
    restoreRequired: true;
    sourceExists: boolean;
  }>;
  blockedUntil: string[];
}

export interface IdentifierRenameDistSmokeDryRun {
  schemaVersion: "identifier-rename-dist-smoke-dry-run.v1";
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  target: "helix";
  sourceCommand: "ut-tdd rename dist-smoke --no-write --target helix --json";
  currentBinary: {
    path: "dist/ut-tdd";
    exists: boolean;
    smokeCommand: "bun run build && ./dist/ut-tdd doctor";
  };
  renamedBinaryPreview: {
    path: "dist/helix";
    exists: boolean;
    smokeCommandAfterApproval: "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix doctor";
  };
  postCutoverConsumerSetupPreview: {
    commandAfterApproval: "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix setup project --dry-run --json";
    expected: "helix setup project emits the same consumer readiness, artifactReadiness, importReport, and blocked PLAN-M-02 boundary after cutover";
    evidencePath: ".ut-tdd/evidence/rename/post-cutover-consumer-setup-smoke.json";
    currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json";
  };
  legacyAliasPreview: {
    path: "dist/ut-tdd";
    dispositionRequired: "preserve_with_sunset_plan_or_remove_with_migration_notes";
  };
  blockedUntil: string[];
}

export interface IdentifierRenameSourceLedgerFreshness {
  ledgerLabel: "Cutover source ledger";
  checkedDate: string | null;
  stale: boolean;
  violation: string | null;
  maxAgeDays: number;
  rowCount: number;
  missingRows: string[];
  rowsDigest: string;
}

export interface IdentifierRenameCutoverSnapshot {
  snapshotId: string;
  repoHeadSha: string | null;
  headDigest: string | null;
  blastRadiusDigest: string;
  approvalScopeDigest: string;
  evidenceDigest: string;
  sourceLedgerCheckedDate: string | null;
  sourceLedgerRowsDigest: string;
  invalidatedBy: string[];
}

export interface IdentifierRenameSnapshotReview {
  recordedCutoverSnapshotId: string | null;
  recordedActionBindingSnapshotId: string | null;
  currentSnapshotId: string;
  cutoverSnapshotMatchesCurrent: boolean;
  actionBindingSnapshotMatchesCurrent: boolean;
  driftWarning: string | null;
  requiredAction: string;
}

export interface IdentifierRenameRunbookCommandViolation {
  subject: string;
  reason: string;
}

export interface IdentifierRenameVerificationCommandViolation {
  subject: string;
  reason: string;
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
const REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS = [
  "NIST SSDF SP 800-218",
  "GitHub Environments required reviewers",
  "GitHub Actions concurrency",
  "Google SRE Release Engineering",
  "OWASP LLM06:2025 Excessive Agency",
  "SLSA Provenance",
] as const;
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
const TEXT_DOTFILES = new Set([".gitattributes", ".gitignore"]);

function hasTextExtension(path: string): boolean {
  const match = path.match(/\.[^.\\/]+$/);
  return match ? TEXT_EXTENSIONS.has(match[0] ?? "") : false;
}

function isLikelyBinaryFile(path: string): boolean {
  const sample = readFileSync(path).subarray(0, 4096);
  return sample.includes(0);
}

function isTextCandidate(path: string, root: string): boolean {
  if (hasTextExtension(path)) return true;
  const rel = relative(root, path).replace(/\\/g, "/");
  if (TEXT_DOTFILES.has(rel)) return true;
  if (rel.startsWith("scripts/") && !rel.split("/").pop()?.includes(".")) {
    return !isLikelyBinaryFile(path);
  }
  return false;
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
    path === ".gitattributes" ||
    path === ".gitignore" ||
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
      if (!isTextCandidate(abs, root)) continue;
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
    if (/^(TBD|TODO|pending|-|n\/a)$/i.test(normalized)) return false;
    if (/\bmust\s+(name|record|write|cite|review)\b/i.test(normalized)) return false;
    if (/\bfuture approval\b/i.test(normalized)) return false;
    if (/\bpending\b/i.test(normalized)) return false;
    if (/\bwill be (recorded|reviewed|approved|named|written|provided)\b/i.test(normalized)) {
      return false;
    }
    if (/\bbefore\s+(apply|approval|cutover|execution)\b/i.test(normalized)) return false;
    if (/\bnot approved\b/i.test(normalized)) return false;
    if (/(予定|未定|保留|承認前|未承認)/.test(normalized)) return false;
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
    "source_ledger_freshness",
    "source_status_delta",
    "adoption_decision_delta",
    "workflow_route_impact",
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

  const approvalRecordsConcrete = cutoverApprovalPresent(root);
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
    cutoverApproved: false,
    approvalRecordsConcrete,
    status: "blocked_pending_cutover_approval",
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

function verificationCommandForCategory(category: IdentifierRenameHitCategory): string {
  switch (category) {
    case "source_code":
      return "bun run typecheck && bun test tests/identifier-rename.test.ts";
    case "test_code":
      return "bun test tests/identifier-rename.test.ts && bun run test";
    case "runtime_state":
      return "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor";
    case "adapter_config":
      return "bun run src/cli.ts doctor";
    case "consumer_template":
      return "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts";
    case "plan_doc":
      return "bun run src/cli.ts doctor";
    case "design_doc":
      return "bun test tests/design-language.test.ts tests/oracle-test-trace.test.ts";
    case "governance_doc":
      return "bun run src/cli.ts doctor";
    case "distribution_surface":
      return "bun run build && ./dist/ut-tdd doctor";
    case "other":
      return "bun run src/cli.ts rename audit --json";
  }
}

function samplePathsForCategory(
  hits: readonly IdentifierRenameHit[],
  category: IdentifierRenameHitCategory,
  limit = 5,
): string[] {
  const counts = new Map<string, number>();
  for (const hit of hits) {
    if (hit.category !== category) continue;
    counts.set(hit.path, (counts.get(hit.path) ?? 0) + hit.count);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([path]) => path);
}

function buildRenameVerificationCommandMatrix(
  sourceCheckedAt: string | null,
): IdentifierRenameCutoverPlan["verificationCommandMatrix"] {
  const cutoverSourceCheckedAt = sourceCheckedAt ?? "unknown";
  return [
    {
      phase: "baseline",
      command: "bun run src/cli.ts rename audit --json",
      writePolicy: "no-write",
      expected: "captures token/file/category/sample-path blast-radius at frozen HEAD",
      evidence: "rename audit JSON attached to cutover approval record",
      source: "HELIX identifier cutover source ledger",
      sourceUrl: "docs/process/forward/L08-L14-verification-phase.md",
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus:
        "Cutover source ledger includes NIST SSDF, GitHub approval/concurrency, Google SRE, OWASP LLM06, and SLSA provenance rows",
      sourceStatusDelta: "none; ledger remains inside the 90-day freshness window",
      adoptionDecision: "adopt-cutover-source-ledger-for-l14-approval-review",
      adoptionDecisionDelta: "none; keep irreversible cutover approval-gated and plan-only",
      workflowRouteImpact:
        "none; stale or incomplete source ledger routes cutover back to request_runbook_changes",
    },
    {
      phase: "targeted-regression",
      command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts",
      writePolicy: "no-write",
      expected:
        "rename packet, approval, snapshot, category checklist, and cutover readiness regressions stay green",
      evidence: "targeted vitest output",
      source: "HELIX L14 cutover regression oracle",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local L14 cutover regression oracle current at HEAD",
      sourceStatusDelta: "none; regression oracle remains the cutover packet safety net",
      adoptionDecision: "adopt-targeted-regression-before-cutover-approval-review",
      adoptionDecisionDelta: "none; keep targeted regression before any irreversible apply",
      workflowRouteImpact: "none; regression failure routes back to L7 repair",
    },
    {
      phase: "static-gates",
      command: "bun run lint && bun run typecheck && git diff --check",
      writePolicy: "no-write",
      expected: "format, type, and whitespace gates pass before cutover approval",
      evidence: "lint/typecheck/diff-check command output",
      source: "HELIX repository static gate policy",
      sourceUrl: "AGENTS.md#test-rules",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "repository AGENTS test rules current at HEAD",
      sourceStatusDelta: "none; static gate policy reviewed against current HEAD",
      adoptionDecision: "adopt-static-gates-before-cutover-approval-review",
      adoptionDecisionDelta: "none; keep static gates before irreversible cutover review",
      workflowRouteImpact: "none; static failure routes back to implementation repair",
    },
    {
      phase: "state-and-doctor",
      command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      writePolicy: "state-write",
      expected: "state projection rebuild and workflow gates pass against the renamed rehearsal",
      evidence: "db rebuild and doctor output",
      source: "HELIX state projection and doctor gate",
      sourceUrl: "docs/adr/ADR-007-harness-db-sqlite-projection.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX state projection contract current at HEAD",
      sourceStatusDelta: "none; state projection contract reviewed against current HEAD",
      adoptionDecision: "adopt-db-rebuild-and-doctor-before-cutover-approval-review",
      adoptionDecisionDelta: "none; keep db rebuild and doctor as cutover approval gates",
      workflowRouteImpact: "none; doctor failure routes back to cutover packet repair",
    },
    {
      phase: "full-regression",
      command: "bun run test",
      writePolicy: "no-write",
      expected: "full repository regression suite passes before irreversible cutover",
      evidence: "full vitest output",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-irreversible-cutover",
      adoptionDecisionDelta: "none; keep full regression as irreversible cutover blocker",
      workflowRouteImpact: "none; full regression failure blocks cutover approval review",
    },
    {
      phase: "current-dist-smoke",
      command: "bun run build && ./dist/ut-tdd doctor",
      writePolicy: "local-artifact-write",
      expected: "current compiled ut-tdd CLI remains runnable before rename cutover approval",
      evidence: "build output and current compiled doctor smoke",
      source: "ADR-001 TypeScript/Bun single-binary distribution decision",
      sourceUrl: "docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "ADR-001 TypeScript/Bun distribution decision remains current at HEAD",
      sourceStatusDelta: "none; current ut-tdd binary remains the pre-cutover baseline",
      adoptionDecision: "adopt-current-dist-smoke-as-pre-cutover-baseline",
      adoptionDecisionDelta: "none; keep current CLI smoke before alias changes",
      workflowRouteImpact: "none; current dist smoke failure blocks cutover approval review",
    },
    {
      phase: "renamed-helix-dist-smoke",
      command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
      writePolicy: "no-write",
      expected:
        "renamed compiled helix CLI smoke requirements are emitted as a no-write packet before alias enablement",
      evidence: "identifier-rename-dist-smoke-dry-run.v1 attached to cutover approval review",
      source: "PLAN-M-02 HELIX identifier rename runbook",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "PLAN-M-02 rename runbook remains draft approval material at HEAD",
      sourceStatusDelta: "none; helix binary target remains blocked pending cutover approval",
      adoptionDecision: "adopt-renamed-helix-dist-smoke-as-cutover-rehearsal-only",
      adoptionDecisionDelta: "none; do not enable package/bin alias before approval",
      workflowRouteImpact:
        "none; renamed helix smoke is rehearsal evidence and does not authorize apply",
    },
    {
      phase: "post-cutover-consumer-setup-smoke",
      command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
      writePolicy: "no-write",
      expected:
        "emits the approved-after-cutover helix setup project dry-run smoke and current no-write proxy command for consumer bootstrap readiness",
      evidence:
        "identifier-rename-dist-smoke-dry-run.v1 postCutoverConsumerSetupPreview attached to cutover approval review",
      source: "HELIX project setup command transition contract",
      sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "L3 HR-FR-P6-03 keeps ut-tdd setup project current and helix setup project future until PLAN-M-02 approval",
      sourceStatusDelta:
        "none; consumer setup command transition remains blocked pending cutover approval",
      adoptionDecision: "adopt-post-cutover-helix-setup-smoke-as-cutover-review-material",
      adoptionDecisionDelta:
        "none; do not expose helix setup project as available before cutover approval",
      workflowRouteImpact:
        "none; missing consumer setup smoke routes cutover back to request_runbook_changes",
    },
    {
      phase: "legacy-alias-smoke",
      command: "bun run build && ./dist/ut-tdd doctor",
      writePolicy: "local-artifact-write",
      expected:
        "legacy ut-tdd alias behavior is either intentionally preserved with a sunset plan or explicitly absent with migration notes",
      evidence: "legacy alias smoke or no-alias disposition recorded in audit_record",
      source: "PLAN-M-02 legacy alias policy",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "PLAN-M-02 legacy alias policy remains approval-gated at HEAD",
      sourceStatusDelta: "none; legacy ut-tdd alias disposition is still pending cutover decision",
      adoptionDecision: "adopt-legacy-alias-smoke-or-explicit-no-alias-disposition-before-cutover",
      adoptionDecisionDelta: "none; keep compatibility policy review before irreversible rename",
      workflowRouteImpact: "none; alias smoke/disposition absence blocks cutover approval review",
    },
  ];
}

function buildCutoverRunbook(): IdentifierRenameCutoverPlan["cutoverRunbook"] {
  return [
    {
      id: "cutover-rb-01",
      phase: "blast-radius-baseline",
      command: "bun run src/cli.ts rename audit --json",
      writePolicy: "no-write",
      evidencePath: ".ut-tdd/evidence/rename/blast-radius-baseline.json",
      passCriteria: "token/file/category hit set is captured at frozen HEAD",
      rollbackCheck: "re-run audit and compare blastRadiusDigest before approval",
      source: "HELIX identifier cutover source ledger",
      sourceUrl: "docs/process/forward/L08-L14-verification-phase.md",
    },
    {
      id: "cutover-rb-02",
      phase: "codemod-rehearsal",
      command: "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
      writePolicy: "no-write",
      evidencePath: ".ut-tdd/evidence/rename/codemod-rehearsal.json",
      passCriteria: "source/docs/template rename diff is previewed without touching the worktree",
      rollbackCheck: "preview diff can be discarded without git or state mutation",
      source: "PLAN-M-02 non-destructive rehearsal policy",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
    },
    {
      id: "cutover-rb-03",
      phase: "state-backup-restore-drill",
      command: "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
      writePolicy: "no-write",
      evidencePath: ".ut-tdd/evidence/rename/state-backup-restore-drill.json",
      passCriteria: "DB, memory, state, logs, handover, and hook configs have restorable backups",
      rollbackCheck: "restore drill proves old .ut-tdd state can be restored before apply",
      source: "Cutover source ledger backup/provenance requirements",
      sourceUrl: "docs/process/forward/L08-L14-verification-phase.md",
    },
    {
      id: "cutover-rb-04",
      phase: "static-and-state-gates",
      command:
        "bun run lint && bun run typecheck && bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      writePolicy: "state-write",
      evidencePath: ".ut-tdd/evidence/rename/static-state-gates.txt",
      passCriteria: "lint, typecheck, projection rebuild, and doctor are green before approval",
      rollbackCheck: "any red gate routes outcome to request_runbook_changes",
      source: "HELIX repository static gate and doctor policy",
      sourceUrl: "AGENTS.md#test-rules",
    },
    {
      id: "cutover-rb-05",
      phase: "dist-smoke-rehearsal",
      command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
      writePolicy: "no-write",
      evidencePath: ".ut-tdd/evidence/rename/dist-smoke-rehearsal.txt",
      passCriteria:
        "current CLI, renamed CLI rehearsal, post-cutover consumer setup smoke, and alias disposition are all reviewed before cutover",
      rollbackCheck: "failed renamed CLI smoke keeps old command/state path active",
      source: "ADR-001 TypeScript/Bun single-binary distribution decision",
      sourceUrl: "docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md",
    },
    {
      id: "cutover-rb-06",
      phase: "full-regression",
      command: "bun run test",
      writePolicy: "no-write",
      evidencePath: ".ut-tdd/evidence/rename/full-regression.txt",
      passCriteria: "full regression is green after rehearsal material is generated",
      rollbackCheck: "red full regression blocks approval and keeps PLAN-M-02 draft",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
    },
  ];
}

function buildStateBackupManifest(): IdentifierRenameCutoverPlan["stateBackupManifest"] {
  return [
    {
      path: ".ut-tdd/harness.db",
      purpose: "state DB projection and completion evidence baseline",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/harness.db",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-harness-db.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/memory",
      purpose: "HELIX shared memory before state-dir rename",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/memory/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-memory.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/state",
      purpose: "active plan, setup, and runtime state before migration",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/state/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-state.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/logs",
      purpose: "runtime/session/gate logs used as verification provenance",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/logs/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-logs.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/handover",
      purpose: "handover pointer and completion decision packet continuity",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/handover/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-handover.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/handover/provider",
      purpose: "provider handover pointer used by cross-runtime continuation",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/handover/provider/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-provider-handover.json",
      restoreRequired: true,
    },
    {
      path: ".ut-tdd/config/approval-policy.yaml",
      purpose: "action-binding approval policy before irreversible rename",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/config/approval-policy.yaml",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-approval-policy.json",
      restoreRequired: true,
    },
    {
      path: ".claude/settings.json",
      purpose: "Claude hook/adapter config before marker rename",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/.claude/settings.json",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-claude-settings.json",
      restoreRequired: true,
    },
    {
      path: ".codex/hooks.json",
      purpose: "Codex hook adapter config before marker rename",
      backupTargetPattern: ".ut-tdd/backups/rename/<timestamp>/.codex/hooks.json",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".ut-tdd/evidence/rename/restore-codex-hooks.json",
      restoreRequired: true,
    },
  ];
}

export function buildIdentifierRenameRehearsalPlan(
  root: string,
  target: "helix" = "helix",
): IdentifierRenameRehearsalPlan {
  const audit = auditIdentifierRenameBlastRadius(root);
  const plan = buildIdentifierRenameCutoverPlan(root);
  const currentCliToken = ["ut", "-tdd"].join("");
  const currentStateDirToken = [".ut", "-tdd"].join("");
  const currentAreaToken = ["area=", "harness"].join("");
  const futureStateDirToken = [".", "helix"].join("");
  const targetAreaToken = ["area=", "helix"].join("");
  return {
    schemaVersion: "identifier-rename-rehearsal.v1",
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    target,
    targetStateDir: ".helix",
    sourceCommand: "ut-tdd rename rehearsal --no-write --target helix --json",
    auditStatus: audit.status,
    renameMap: RENAME_MAP,
    previewCategories: plan.hitsByCategory,
    previewCommands: [
      {
        phase: "codemod-preview",
        command: "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
        description: `preview ${currentCliToken}/${currentStateDirToken}/${currentAreaToken} -> helix/${futureStateDirToken}/${targetAreaToken} token changes without applying them`,
        writesRepo: false,
        evidencePath: ".ut-tdd/evidence/rename/codemod-rehearsal.json",
      },
      {
        phase: "renamed-binary-smoke-preview",
        command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
        description:
          "after approval, build the renamed binary on a non-destructive branch and run helix doctor before alias enablement",
        writesRepo: false,
        evidencePath: ".ut-tdd/evidence/rename/dist-smoke-rehearsal.txt",
      },
    ],
    blockedUntil: [
      "cutover_decision_record approves the current cutoverSnapshot.snapshotId",
      "action_binding_approval_record scopes actor/tool/target/params for irreversible rename",
      "state-backup dry-run and restore drill evidence are recorded",
    ],
  };
}

export function buildIdentifierRenameStateBackupDryRun(
  root: string,
  restoreDrillRequested = false,
): IdentifierRenameStateBackupDryRun {
  const manifest = buildStateBackupManifest();
  return {
    schemaVersion: "identifier-rename-state-backup-dry-run.v1",
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    sourceCommand: "ut-tdd rename state-backup --dry-run --restore-drill --json",
    restoreDrillRequested,
    manifest,
    restoreChecks: manifest.map((entry) => ({
      path: entry.path,
      backupTargetPattern: entry.backupTargetPattern,
      restoreEvidencePath: entry.restoreEvidencePath,
      checksumRequired: true,
      restoreRequired: true,
      sourceExists: existsSync(join(root, entry.path)),
    })),
    blockedUntil: [
      "each restoreCheck has sourceExists=true or an explicit no-state-needed disposition",
      "restore drill evidence is recorded for every restoreRequired item",
      "cutover approval cites the resulting state-backup evidence path",
    ],
  };
}

export function buildIdentifierRenameDistSmokeDryRun(
  root: string,
  target: "helix" = "helix",
): IdentifierRenameDistSmokeDryRun {
  return {
    schemaVersion: "identifier-rename-dist-smoke-dry-run.v1",
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    target,
    sourceCommand: "ut-tdd rename dist-smoke --no-write --target helix --json",
    currentBinary: {
      path: "dist/ut-tdd",
      exists: existsSync(join(root, "dist", "ut-tdd")),
      smokeCommand: "bun run build && ./dist/ut-tdd doctor",
    },
    renamedBinaryPreview: {
      path: "dist/helix",
      exists: existsSync(join(root, "dist", "helix")),
      smokeCommandAfterApproval:
        "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix doctor",
    },
    postCutoverConsumerSetupPreview: {
      commandAfterApproval:
        "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix setup project --dry-run --json",
      expected:
        "helix setup project emits the same consumer readiness, artifactReadiness, importReport, and blocked PLAN-M-02 boundary after cutover",
      evidencePath: ".ut-tdd/evidence/rename/post-cutover-consumer-setup-smoke.json",
      currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json",
    },
    legacyAliasPreview: {
      path: "dist/ut-tdd",
      dispositionRequired: "preserve_with_sunset_plan_or_remove_with_migration_notes",
    },
    blockedUntil: [
      "cutover_decision_record approves the current cutoverSnapshot.snapshotId",
      "action_binding_approval_record scopes actor/tool/target/params for package/bin alias changes",
      "renamed dist/helix binary is built only in an approved cutover rehearsal branch or release job",
      "post-cutover `helix setup project --dry-run --json` consumer bootstrap smoke is recorded before package/bin alias activation",
      "legacy ut-tdd alias disposition is recorded before package/bin alias activation",
    ],
  };
}

export function identifierRenameRunbookCommandViolations(
  plan: Pick<IdentifierRenameCutoverPlan, "cutoverRunbook">,
): IdentifierRenameRunbookCommandViolation[] {
  const allowedCommands = new Set([
    "bun run src/cli.ts rename audit --json",
    "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
    "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
    "bun run lint && bun run typecheck && bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
    "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
    "bun run test",
  ]);
  return plan.cutoverRunbook.flatMap((step) => {
    const violations: IdentifierRenameRunbookCommandViolation[] = [];
    if (!step.command.trim()) {
      return [{ subject: step.id, reason: "cutoverRunbook command is empty" }];
    }
    if (!allowedCommands.has(step.command)) {
      violations.push({
        subject: step.id,
        reason: `cutoverRunbook command is not an executable approved surface for its writePolicy: ${step.command}`,
      });
    }
    if (step.writePolicy === "no-write" && commandWritesLocalStateOrArtifacts(step.command)) {
      violations.push({
        subject: step.id,
        reason: `cutoverRunbook no-write command may write local state or artifacts: ${step.command}`,
      });
    }
    if (step.writePolicy === "state-write" && !step.command.includes("db rebuild")) {
      violations.push({
        subject: step.id,
        reason: `cutoverRunbook state-write command must be explicit about state rebuild: ${step.command}`,
      });
    }
    return violations;
  });
}

export function identifierRenameVerificationCommandViolations(
  plan: Pick<IdentifierRenameCutoverPlan, "verificationCommandMatrix">,
): IdentifierRenameVerificationCommandViolation[] {
  const allowedNoWriteCommands = new Set([
    "bun run src/cli.ts rename audit --json",
    "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts",
    "bun run lint && bun run typecheck && git diff --check",
    "bun run test",
    "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
  ]);
  const allowedStateWriteCommands = new Set([
    "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
  ]);
  const allowedLocalArtifactWriteCommands = new Set(["bun run build && ./dist/ut-tdd doctor"]);
  return plan.verificationCommandMatrix.flatMap((row) => {
    const violations: IdentifierRenameVerificationCommandViolation[] = [];
    const allowedForPolicy =
      (row.writePolicy === "no-write" && allowedNoWriteCommands.has(row.command)) ||
      (row.writePolicy === "state-write" && allowedStateWriteCommands.has(row.command)) ||
      (row.writePolicy === "local-artifact-write" &&
        allowedLocalArtifactWriteCommands.has(row.command));
    if (!allowedForPolicy) {
      violations.push({
        subject: row.phase,
        reason: `verificationCommandMatrix command is not an executable approved surface for its writePolicy: ${row.command}`,
      });
    }
    if (row.writePolicy === "no-write" && commandWritesLocalStateOrArtifacts(row.command)) {
      violations.push({
        subject: row.phase,
        reason: `verificationCommandMatrix no-write command may write local state or artifacts: ${row.command}`,
      });
    }
    if (row.writePolicy === "state-write" && !row.command.includes("db rebuild")) {
      violations.push({
        subject: row.phase,
        reason: `verificationCommandMatrix state-write command must be explicit about state rebuild: ${row.command}`,
      });
    }
    if (
      row.writePolicy === "local-artifact-write" &&
      !commandWritesLocalStateOrArtifacts(row.command)
    ) {
      violations.push({
        subject: row.phase,
        reason: `verificationCommandMatrix local-artifact-write command must be explicit about local artifact output: ${row.command}`,
      });
    }
    violations.push(
      ...verificationSourceMetadataViolations({
        subject: row.phase,
        matrixName: "verificationCommandMatrix",
        row,
      }),
    );
    return violations;
  });
}

function commandWritesLocalStateOrArtifacts(command: string): boolean {
  return /\b(bun run build|bun build|db rebuild|--outfile|>\s*|tee\b)\b/.test(command);
}

function readRepoHeadSha(root: string): string | null {
  try {
    const head = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^[a-f0-9]{40}$/.test(head) ? head : null;
  } catch {
    return null;
  }
}

export function buildIdentifierRenameCutoverPlan(
  root: string,
  semanticFeatureFrontierRecords: SemanticFeatureFrontierRecord[] = computeOutstandingWork(root)
    .semanticFeatureFrontierRecords ?? [],
  repoHeadSha: string | null = readRepoHeadSha(root),
): IdentifierRenameCutoverPlan {
  const audit = auditIdentifierRenameBlastRadius(root);
  const provenance = buildDecisionPacketProvenance({ sourceCommand: RENAME_PLAN_PACKET_COMMAND });
  const approvalEvaluation = evaluateCutoverApproval(root);
  const semanticFrontierExpectation = {
    planId: "PLAN-M-02-helix-identifier-rename",
    classification: "approval_gated_cutover" as const,
    featureId: "name_cutover",
  };
  const semanticFeatureFrontierRecord = semanticFrontierBindingForPlan(
    semanticFeatureFrontierRecords,
    semanticFrontierExpectation,
  );
  const blockedReasons = [
    ...(approvalEvaluation.approved ? [] : approvalEvaluation.reasons),
    ...semanticFrontierBindingViolations(
      semanticFeatureFrontierRecords,
      semanticFrontierExpectation,
      "PLAN-M-02-helix-identifier-rename",
    ).map((violation) => violation.reason),
  ];
  const hitsByCategory = audit.hitsByCategory;
  const cutoverCategoryChecklist = hitsByCategory.map((summary) => ({
    ...summary,
    samplePaths: samplePathsForCategory(audit.hits, summary.category),
    cutoverAction: cutoverActionForCategory(summary.category),
    verificationCommand: verificationCommandForCategory(summary.category),
  }));
  const cutoverRunbook = buildCutoverRunbook();
  const stateBackupManifest = buildStateBackupManifest();
  const sourceLedgerFreshness = buildCutoverSourceLedgerFreshness(root);
  const verificationCommandMatrix = buildRenameVerificationCommandMatrix(
    sourceLedgerFreshness.checkedDate,
  );
  if (sourceLedgerFreshness.violation) {
    blockedReasons.push(
      `source ledger must be refreshed before cutover: ${sourceLedgerFreshness.violation}`,
    );
  }
  if (sourceLedgerFreshness.missingRows.length > 0) {
    blockedReasons.push(
      `source ledger missing cutover sources: ${sourceLedgerFreshness.missingRows.join(", ")}`,
    );
  }
  if (!repoHeadSha) {
    blockedReasons.push("cutover snapshot is not bound to a readable git HEAD sha");
  }
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
    cutoverRunbook,
    verificationCommandMatrix,
    stateBackupManifest,
    freezePolicy,
    provenanceRequirements,
    sourceLedgerFreshness,
    repoHeadSha,
  });
  const snapshotReview = buildIdentifierRenameSnapshotReview(
    approvalEvaluation,
    cutoverSnapshot.snapshotId,
  );
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
  const approvalMaterialReady = approvalEvaluation.approved && blockedReasons.length === 0;
  const applyAuthorized = false;

  return {
    schemaVersion: "identifier-rename-cutover-plan.v1",
    status: approvalMaterialReady ? "ready_for_cutover_packet" : "blocked_pending_cutover_approval",
    generatedAt: provenance.generatedAt,
    sourceCommand: RENAME_PLAN_PACKET_COMMAND,
    freshness: provenance.freshness,
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    approvalMaterialReady,
    applyAuthorized,
    targetCli: audit.targetCli,
    targetStateDir: audit.targetStateDir,
    renameMap: RENAME_MAP,
    semanticFeatureFrontierRecord,
    audit: {
      status: approvalMaterialReady ? "ready_for_cutover" : "blocked_pending_cutover_approval",
      totalHits: audit.totalHits,
      hitsByToken: audit.hitsByToken,
      filesByToken: audit.filesByToken,
      requiredRecords: audit.requiredRecords,
    },
    hitsByCategory,
    cutoverCategoryChecklist,
    blockedReasons,
    recordTemplates: recordTemplatesForRecords(
      requiredRecordsForBlockers(["irreversible_migration_pending", "human_approval_pending"]),
    ),
    dryRunPlan: [
      "run rename audit and freeze the ut-tdd/.ut-tdd/area=harness blast-radius baseline",
      "rehearse source/test/docs codemod on a non-destructive branch",
      "rehearse state path migration with backup/restore proof for .ut-tdd/harness.db, memory, state, logs, and handover",
      "run targeted identifier-rename tests, typecheck, lint, db rebuild, doctor, and full test suite",
      "run compiled distribution smoke after the CLI/bin rename rehearsal",
    ],
    cutoverRunbook,
    verificationCommandMatrix,
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
    sourceLedgerFreshness,
    cutoverSnapshot,
    snapshotReview,
    provenanceRequirements,
    relatedDecisionPackets: uniqueRelatedDecisionPackets([
      relatedDecisionPacket({
        command: RENAME_PLAN_PACKET_COMMAND,
        scopedCommand: RENAME_PLAN_PACKET_COMMAND,
        role: "primary",
        reason: "irreversible .ut-tdd to .helix cutover requires explicit cutover signoff",
        route:
          "use rename plan for blast-radius, dry-run, rollback, backup, monitoring, and approval-gate material",
      }),
      relatedDecisionPacket({
        command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
        scopedCommand: `${ACTION_BINDING_APPROVAL_PACKET_COMMAND} --plan PLAN-M-02-helix-identifier-rename`,
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
  cutoverRunbook: IdentifierRenameCutoverPlan["cutoverRunbook"];
  verificationCommandMatrix: IdentifierRenameCutoverPlan["verificationCommandMatrix"];
  stateBackupManifest: IdentifierRenameCutoverPlan["stateBackupManifest"];
  freezePolicy: IdentifierRenameCutoverPlan["freezePolicy"];
  provenanceRequirements: IdentifierRenameCutoverPlan["provenanceRequirements"];
  sourceLedgerFreshness: IdentifierRenameSourceLedgerFreshness;
  repoHeadSha: string | null;
}): IdentifierRenameCutoverSnapshot {
  const headDigest = input.repoHeadSha ? sha256Json({ repoHeadSha: input.repoHeadSha }) : null;
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
    repoHeadSha: input.repoHeadSha,
    sourceLedgerFreshness: input.sourceLedgerFreshness,
    cutoverRunbook: input.cutoverRunbook,
    verificationCommandMatrix: input.verificationCommandMatrix,
    stateBackupManifest: input.stateBackupManifest,
    freezePolicy: input.freezePolicy,
    provenanceRequirements: input.provenanceRequirements,
  });
  const snapshot = {
    repoHeadSha: input.repoHeadSha,
    headDigest,
    blastRadiusDigest,
    approvalScopeDigest,
    evidenceDigest,
    sourceLedgerCheckedDate: input.sourceLedgerFreshness.checkedDate,
    sourceLedgerRowsDigest: input.sourceLedgerFreshness.rowsDigest,
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

function buildIdentifierRenameSnapshotReview(
  approval: CutoverApprovalEvaluation,
  currentSnapshotId: string,
): IdentifierRenameSnapshotReview {
  const recordedCutoverSnapshotId = approval.cutoverSnapshotId || null;
  const recordedActionBindingSnapshotId = approval.reviewedSnapshotBinding || null;
  const cutoverSnapshotMatchesCurrent = recordedCutoverSnapshotId === currentSnapshotId;
  const actionBindingSnapshotMatchesCurrent = recordedActionBindingSnapshotId === currentSnapshotId;
  const hasRecordedSnapshot =
    recordedCutoverSnapshotId !== null || recordedActionBindingSnapshotId !== null;
  const driftWarning =
    hasRecordedSnapshot && (!cutoverSnapshotMatchesCurrent || !actionBindingSnapshotMatchesCurrent)
      ? "recorded cutover/action-binding snapshot does not match the current cutoverSnapshot.snapshotId; re-run rename plan and refresh approval evidence before any cutover"
      : null;
  return {
    recordedCutoverSnapshotId,
    recordedActionBindingSnapshotId,
    currentSnapshotId,
    cutoverSnapshotMatchesCurrent,
    actionBindingSnapshotMatchesCurrent,
    driftWarning,
    requiredAction:
      driftWarning ??
      "record cutover_decision_record.cutover_snapshot_id and action_binding_approval_record.reviewed_snapshot_binding using the current cutoverSnapshot.snapshotId before approval",
  };
}

function buildCutoverSourceLedgerFreshness(root: string): IdentifierRenameSourceLedgerFreshness {
  const ledgerLabel = "Cutover source ledger" as const;
  let text = "";
  try {
    text = readFileSync(join(root, "docs/process/forward/L08-L14-verification-phase.md"), "utf8");
  } catch {
    return {
      ledgerLabel,
      checkedDate: null,
      stale: true,
      violation: "Cutover source ledger missing source document",
      maxAgeDays: SOURCE_LEDGER_MAX_AGE_DAYS,
      rowCount: 0,
      missingRows: [...REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS],
      rowsDigest: sha256Json([]),
    };
  }
  const checkedDate = sourceLedgerCheckedDate(text, ledgerLabel);
  const violation =
    checkedDate === null
      ? "Cutover source ledger missing checked date"
      : sourceLedgerCheckedDateViolation(text, ledgerLabel);
  const ledger = parseCutoverSourceLedger(text);
  const rowSources = new Set(ledger.rows.map((row) => row.source ?? ""));
  const missingRows = REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS.filter(
    (source) => !rowSources.has(source),
  );
  return {
    ledgerLabel,
    checkedDate,
    stale: violation !== null || missingRows.length > 0,
    violation,
    maxAgeDays: SOURCE_LEDGER_MAX_AGE_DAYS,
    rowCount: ledger.rows.length,
    missingRows,
    rowsDigest: sha256Json(ledger.rows),
  };
}

function parseCutoverSourceLedger(text: string): { rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("Cutover source ledger");
  const headingIndex = lines.findIndex((line) => headingPattern.test(line));
  if (headingIndex < 0) return { rows: [] };
  const tableLines: string[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (line.trim() === "") {
      if (tableLines.length === 0) continue;
      break;
    }
    if (!line.trim().startsWith("|")) {
      if (tableLines.length === 0) continue;
      break;
    }
    tableLines.push(line);
  }
  if (tableLines.length < 2) return { rows: [] };
  const columns = tableCells(tableLines[0]);
  return {
    rows: tableLines.slice(2).map((line) => {
      const rowCells = tableCells(line);
      return Object.fromEntries(columns.map((column, index) => [column, rowCells[index] ?? ""]));
    }),
  };
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^<(.+)>$/, "$1"));
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}
