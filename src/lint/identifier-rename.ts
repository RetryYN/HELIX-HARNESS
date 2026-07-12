import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { readRepoHeadSha } from "../shared/repo-info";
import {
  CUTOVER_SOURCE_LEDGER_EXPECTATIONS,
  REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS,
} from "./cutover-source-ledger";
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
  RENAME_APPROVAL_DRAFT_PACKET_COMMAND,
  RENAME_PLAN_PACKET_COMMAND,
  type RelatedDecisionPacket,
  relatedDecisionPacket,
  uniqueRelatedDecisionPackets,
} from "./workflow-decision-packets";

export type IdentifierRenameToken = string;
export type IdentifierRenameHitLocation = "path" | "content";
export type IdentifierRenameResidualToken = string;
export type IdentifierRenameResidualDisposition =
  | "safe_prose_candidate"
  | "fixture_only"
  | "adapter_marker"
  | "reference_source"
  | "approval_gated";
export type IdentifierRenameHitCategory =
  | "source_code"
  | "test_code"
  | "runtime_state"
  | "adapter_config"
  | "consumer_template"
  | "plan_doc"
  | "design_doc"
  | "governance_doc"
  | "historical_doc"
  | "handover_doc"
  | "skill_doc"
  | "research_doc"
  | "backlog_doc"
  | "top_level_doc"
  | "distribution_surface"
  | "other";

export interface IdentifierRenameHit {
  token: IdentifierRenameToken;
  path: string;
  count: number;
  category: IdentifierRenameHitCategory;
  location: IdentifierRenameHitLocation;
}

export interface IdentifierRenameResidualHit {
  token: IdentifierRenameResidualToken;
  path: string;
  count: number;
  category: IdentifierRenameHitCategory;
  location: IdentifierRenameHitLocation;
  disposition: IdentifierRenameResidualDisposition;
}

export interface IdentifierRenameCategorySummary {
  category: IdentifierRenameHitCategory;
  hits: number;
  files: number;
}

export interface IdentifierRenameResidualDispositionSummary {
  disposition: IdentifierRenameResidualDisposition;
  hits: number;
  files: number;
}

export interface IdentifierRenamePathRenameEntry {
  tokens: IdentifierRenameToken[];
  path: string;
  targetPath: string;
  category: IdentifierRenameHitCategory;
  approvalRequired: boolean;
  disposition:
    | "blocked_pending_cutover_approval"
    | "safe_after_cutover_approval"
    | "manual_review_required";
}

export interface IdentifierRenameAudit {
  sourceRoot: string;
  targetCli: "helix";
  targetStateDir: ".helix";
  tokens: IdentifierRenameToken[];
  totalHits: number;
  hitsByToken: Record<IdentifierRenameToken, number>;
  filesByToken: Record<IdentifierRenameToken, number>;
  pathHitsByToken: Record<IdentifierRenameToken, number>;
  contentHitsByToken: Record<IdentifierRenameToken, number>;
  pathEntriesByToken: Record<IdentifierRenameToken, number>;
  contentFilesByToken: Record<IdentifierRenameToken, number>;
  hitsByCategory: IdentifierRenameCategorySummary[];
  hits: IdentifierRenameHit[];
  residualsByDisposition: IdentifierRenameResidualDispositionSummary[];
  residuals: IdentifierRenameResidualHit[];
  pathRenameEntries: IdentifierRenamePathRenameEntry[];
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
    | "status"
    | "totalHits"
    | "hitsByToken"
    | "filesByToken"
    | "pathHitsByToken"
    | "contentHitsByToken"
    | "pathEntriesByToken"
    | "contentFilesByToken"
    | "requiredRecords"
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
  sourceCommand: "helix rename rehearsal --no-write --target helix --json";
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
  sourceCommand: "helix rename state-backup --dry-run --restore-drill --json";
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
  sourceCommand: "helix rename dist-smoke --no-write --target helix --json";
  currentBinary: {
    path: "dist/helix";
    exists: boolean;
    smokeCommand: "bun run build && ./dist/helix doctor";
  };
  renamedBinaryPreview: {
    path: "dist/helix";
    exists: boolean;
    smokeCommandAfterApproval: "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix doctor";
  };
  postCutoverConsumerSetupPreview: {
    commandAfterApproval: "bun build src/cli.ts --compile --outfile dist/helix && ./dist/helix setup project --dry-run --json";
    expected: "helix setup project emits the same consumer readiness, artifactReadiness, importReport, and blocked PLAN-M-02 boundary after cutover";
    evidencePath: ".helix/evidence/rename/post-cutover-consumer-setup-smoke.json";
    currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json";
  };
  legacyAliasPreview: {
    path: "dist/helix";
    dispositionRequired: "preserve_with_sunset_plan_or_remove_with_migration_notes";
  };
  blockedUntil: string[];
}

export interface IdentifierRenameMonitoringDryRun {
  schemaVersion: "identifier-rename-monitoring-dry-run.v1";
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  sourceCommand: "helix rename monitoring --no-write --json";
  quietWindow: {
    required: true;
    concurrencyPolicy: "single-run-no-concurrent-apply";
    approvalExpiresOnSignalChange: true;
  };
  monitoringPlan: string[];
  probes: Array<{
    phase: string;
    commandAfterApproval: string;
    currentNoWriteProxyCommand: string;
    expected: string;
    rollbackTrigger: string;
  }>;
  requiredEvidencePath: ".helix/evidence/rename/post-cutover-monitoring-dry-run.json";
  blockedUntil: string[];
}

export interface IdentifierRenameEvidencePack {
  schemaVersion: "identifier-rename-evidence-pack.v1";
  sourceCommand:
    | "helix rename evidence-pack --dry-run --json"
    | "helix rename evidence-pack --write --json";
  planOnly: true;
  mustNotApply: true;
  appliesCutover: false;
  approvalStillRequired: true;
  writePolicy: "no-write" | "local-evidence-write";
  targetDir: ".helix/evidence/rename";
  generatedArtifacts: IdentifierRenameGeneratedEvidenceArtifact[];
  pendingArtifacts: IdentifierRenamePendingEvidenceArtifact[];
  blockedUntil: string[];
}

export interface IdentifierRenameGeneratedEvidenceArtifact {
  path: string;
  source: "cutoverRunbook" | "stateBackupManifest";
  generatorCommand: string;
  schemaVersion: string;
  contentSha256: string;
  sizeBytes: number;
  written: boolean;
}

export interface IdentifierRenameApprovalDraftPacket {
  schemaVersion: "identifier-rename-approval-draft.v1";
  generatedAt: string;
  sourceCommand: typeof RENAME_APPROVAL_DRAFT_PACKET_COMMAND;
  freshness: DecisionPacketFreshness;
  planOnly: true;
  mustNotApply: true;
  approvalCommandAvailable: false;
  approvalAllowed: false;
  applyAuthorized: false;
  targetPlanId: "PLAN-M-02-helix-identifier-rename";
  targetCli: "helix";
  targetStateDir: ".helix";
  recommendedOutcome: "request_runbook_changes" | "ready_for_human_cutover_review";
  readiness: {
    evidenceComplete: boolean;
    worktreeClean: boolean;
    sourceLedgerFresh: boolean;
    sourceLedgerComplete: boolean;
    approvalRecordsConcrete: boolean;
    blockedReasonCount: number;
  };
  currentSnapshot: {
    cutoverSnapshotId: string;
    repoHeadSha: string | null;
    worktreeClean: boolean;
    worktreeDirtyPathCount: number;
    worktreeDirtyPaths: string[];
    evidenceArtifactsRequired: number;
    evidenceArtifactsPresent: number;
    missingEvidenceArtifacts: string[];
    blastRadiusDigest: string;
    approvalScopeDigest: string;
    evidenceDigest: string;
    evidenceArtifactsDigest: string;
    sourceLedgerCheckedDate: string | null;
    sourceLedgerRowsDigest: string;
  };
  draftRecords: IdentifierRenameApprovalDraftRecord[];
  blockedUntil: string[];
  relatedDecisionPackets: RelatedDecisionPacket[];
}

export interface IdentifierRenameApprovalDraftRecord {
  recordName: "cutover_decision_record" | "action_binding_approval_record";
  pasteReady: false;
  unsafeToTreatAsApproval: true;
  insertionHintJa: string;
  yamlLines: string[];
}

export interface IdentifierRenamePendingEvidenceArtifact {
  path: string;
  source: "cutoverRunbook" | "stateBackupManifest";
  requiredCommand: string;
  reason: string;
}

export interface IdentifierRenameSourceLedgerFreshness {
  ledgerLabel: "Cutover source ledger";
  checkedDate: string | null;
  stale: boolean;
  violation: string | null;
  maxAgeDays: number;
  rowCount: number;
  missingRows: string[];
  rowViolations: string[];
  rowsDigest: string;
}

export interface IdentifierRenameCutoverSnapshot {
  snapshotId: string;
  repoHeadSha: string | null;
  headDigest: string | null;
  worktreeStatusReadable: boolean;
  worktreeClean: boolean;
  worktreeStatusDigest: string | null;
  worktreeDirtyPathCount: number;
  worktreeDirtyPaths: string[];
  blastRadiusDigest: string;
  approvalScopeDigest: string;
  evidenceDigest: string;
  evidenceArtifactsDigest: string;
  evidenceArtifactsRequired: number;
  evidenceArtifactsPresent: number;
  missingEvidenceArtifacts: string[];
  evidenceArtifacts: IdentifierRenameEvidenceArtifact[];
  sourceLedgerCheckedDate: string | null;
  sourceLedgerRowsDigest: string;
  invalidatedBy: string[];
}

export interface IdentifierRenameWorktreeSnapshot {
  readable: boolean;
  clean: boolean;
  statusDigest: string | null;
  dirtyPathCount: number;
  dirtyPaths: string[];
}

export interface IdentifierRenameCutoverPlanOptions {
  repoHeadSha?: string | null;
  worktreeSnapshot?: IdentifierRenameWorktreeSnapshot;
}

export interface IdentifierRenameEvidenceArtifact {
  path: string;
  source: "cutoverRunbook" | "stateBackupManifest";
  exists: boolean;
  sha256: string | null;
  sizeBytes: number | null;
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

export interface IdentifierRenameStateBackupManifestViolation {
  subject: string;
  reason: string;
}

const LEGACY_CLI_TOKEN = ["ut", "tdd"].join("-");
const LEGACY_STATE_DIR_TOKEN = `.${LEGACY_CLI_TOKEN}`;
const LEGACY_AREA_TOKEN = `area=${"harness"}`;
const LEGACY_PRODUCT_TOKEN = ["UT", "TDD"].join("-");
const LEGACY_PRODUCT_HARNESS_TOKEN = `${LEGACY_PRODUCT_TOKEN}-agent-${"harness"}`;
const LEGACY_REPO_TOKEN = `${LEGACY_PRODUCT_TOKEN}_AGENT-${"HARNESS"}`;

const TOKENS: IdentifierRenameToken[] = [
  LEGACY_CLI_TOKEN,
  LEGACY_STATE_DIR_TOKEN,
  LEGACY_AREA_TOKEN,
];
const RESIDUAL_TOKENS: IdentifierRenameResidualToken[] = [
  LEGACY_PRODUCT_TOKEN,
  LEGACY_PRODUCT_HARNESS_TOKEN,
  LEGACY_REPO_TOKEN,
  `${LEGACY_REPO_TOKEN}-Pack`,
  "HELIX:managed",
];
const RESIDUAL_DISPOSITIONS: IdentifierRenameResidualDisposition[] = [
  "safe_prose_candidate",
  "fixture_only",
  "adapter_marker",
  "reference_source",
  "approval_gated",
];
const HIT_CATEGORIES: IdentifierRenameHitCategory[] = [
  "source_code",
  "test_code",
  "runtime_state",
  "adapter_config",
  "consumer_template",
  "plan_doc",
  "design_doc",
  "governance_doc",
  "historical_doc",
  "handover_doc",
  "skill_doc",
  "research_doc",
  "backlog_doc",
  "top_level_doc",
  "distribution_surface",
  "other",
];
const RENAME_MAP: IdentifierRenameMapping[] = [
  { from: LEGACY_CLI_TOKEN, to: "helix" },
  { from: LEGACY_STATE_DIR_TOKEN, to: ".helix" },
  { from: LEGACY_AREA_TOKEN, to: "area=helix" },
];
const RENAME_EVIDENCE_PATH_PREFIX = ".helix/evidence/rename/";
const RENAME_BACKUP_PATH_PREFIX = ".helix/backups/rename/<timestamp>/";
const EXTERNAL_REPO_REFERENCE_PATHS = new Set([
  "docs/governance/helix-adoption-design-completion-audit-2026-06-30.md",
  "docs/governance/helix-objective-evidence-audit.md",
  "docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md",
  "docs/plans/PLAN-L7-274-objective-external-ledger-refresh.md",
  "src/cli.ts",
  "src/lint/objective-evidence-audit.ts",
  "tests/cli-surface.test.ts",
  "tests/goal-evidence-audit.test.ts",
]);
const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "coverage"]);
const PATH_IGNORED_DIRS = new Set([".git", "node_modules", "coverage"]);
const IGNORED_PATH_PREFIXES = [".helix/evidence/", ".helix/backups/"];
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

function countResidualToken(text: string, token: IdentifierRenameResidualToken): number {
  if (token === LEGACY_PRODUCT_TOKEN) {
    const pattern = new RegExp(
      `${LEGACY_PRODUCT_TOKEN}(?!:managed|-agent-harness|_AGENT-HARNESS)`,
      "g",
    );
    return [...text.matchAll(pattern)].length;
  }
  if (token === LEGACY_PRODUCT_HARNESS_TOKEN) {
    const pattern = new RegExp(`${LEGACY_PRODUCT_HARNESS_TOKEN}(?!-Pack)`, "g");
    return [...text.matchAll(pattern)].length;
  }
  return text.split(token).length - 1;
}

function isExternalRepoReferenceToken(token: IdentifierRenameResidualToken): boolean {
  return token === LEGACY_REPO_TOKEN || token === `${LEGACY_REPO_TOKEN}-Pack`;
}

function isExternalRepoReferencePath(path: string): boolean {
  if (EXTERNAL_REPO_REFERENCE_PATHS.has(path)) return true;
  if (path.startsWith("docs/design/helix/") && path.endsWith("/upstream-substance-gap.md")) {
    return true;
  }
  if (path === "docs/test-design/helix/upstream-substance-gap.md") return true;
  return false;
}

function classifyRenameResidualDisposition(input: {
  token: IdentifierRenameResidualToken;
  category: IdentifierRenameHitCategory;
  path: string;
}): IdentifierRenameResidualDisposition {
  if (input.token === "HELIX:managed") return "adapter_marker";
  if (isExternalRepoReferenceToken(input.token) && isExternalRepoReferencePath(input.path)) {
    return "reference_source";
  }
  switch (input.category) {
    case "test_code":
      return "fixture_only";
    case "adapter_config":
      return "adapter_marker";
    case "historical_doc":
    case "research_doc":
      return "reference_source";
    case "source_code":
    case "runtime_state":
    case "consumer_template":
    case "distribution_surface":
      return "approval_gated";
    case "plan_doc":
    case "design_doc":
    case "governance_doc":
    case "handover_doc":
    case "skill_doc":
    case "backlog_doc":
    case "top_level_doc":
    case "other":
      return "safe_prose_candidate";
  }
}

function classifyRenameHitPath(path: string): IdentifierRenameHitCategory {
  if (path === LEGACY_STATE_DIR_TOKEN || path.startsWith(`${LEGACY_STATE_DIR_TOKEN}/`)) {
    return "runtime_state";
  }
  if (path === ".helix" || path.startsWith(".helix/")) return "runtime_state";
  if (
    path === "AGENTS.md" ||
    path === "CLAUDE.md" ||
    path.startsWith(".claude/") ||
    path.startsWith(".codex/")
  ) {
    return "adapter_config";
  }
  if (path.startsWith("docs/templates/")) return "consumer_template";
  if (path.startsWith("docs/archive/") || path.startsWith("docs/migration/")) {
    return "historical_doc";
  }
  if (path.startsWith("docs/handover/")) return "handover_doc";
  if (path.startsWith("docs/skills/")) return "skill_doc";
  if (path.startsWith("docs/research/")) return "research_doc";
  if (path === "docs/improvement-backlog.md" || path.startsWith("docs/feedback")) {
    return "backlog_doc";
  }
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
  if (path === "README.md" || path === "AGENTS.override.example.md") return "top_level_doc";
  if (path.startsWith("src/")) return "source_code";
  if (path.startsWith("tests/")) return "test_code";
  if (
    path === "package.json" ||
    path === "bun.lock" ||
    path === ".gitattributes" ||
    path === ".gitignore" ||
    path.startsWith("dist/") ||
    path.startsWith("scripts/") ||
    path.startsWith(".github/")
  ) {
    return "distribution_surface";
  }
  return "other";
}

function targetPathForRenameHit(path: string): string {
  return path
    .replaceAll(LEGACY_STATE_DIR_TOKEN, ".helix")
    .replaceAll(LEGACY_CLI_TOKEN, "helix")
    .replaceAll(LEGACY_PRODUCT_TOKEN, "HELIX")
    .replaceAll(LEGACY_REPO_TOKEN, "HELIX-HARNESS")
    .replaceAll(["ut", "tdd"].join(""), "helix")
    .replaceAll(["UT", "TDD"].join(""), "HELIX")
    .replaceAll(LEGACY_AREA_TOKEN, "area=helix");
}

function pathRenameDispositionForCategory(
  category: IdentifierRenameHitCategory,
): IdentifierRenamePathRenameEntry["disposition"] {
  switch (category) {
    case "runtime_state":
    case "adapter_config":
    case "consumer_template":
    case "distribution_surface":
      return "blocked_pending_cutover_approval";
    case "other":
      return "manual_review_required";
    default:
      return "safe_after_cutover_approval";
  }
}

function buildPathRenameEntries(
  hits: readonly IdentifierRenameHit[],
): IdentifierRenamePathRenameEntry[] {
  const entries = new Map<string, IdentifierRenamePathRenameEntry>();
  for (const hit of hits) {
    if (hit.location !== "path") continue;
    const existing = entries.get(hit.path);
    if (existing) {
      if (!existing.tokens.includes(hit.token)) existing.tokens.push(hit.token);
      continue;
    }
    const disposition = pathRenameDispositionForCategory(hit.category);
    entries.set(hit.path, {
      tokens: [hit.token],
      path: hit.path,
      targetPath: targetPathForRenameHit(hit.path),
      category: hit.category,
      approvalRequired: disposition !== "safe_after_cutover_approval",
      disposition,
    });
  }
  return [...entries.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function walkTextFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const abs = join(dir, entry.name);
      const rel = relative(root, abs).replace(/\\/g, "/");
      if (
        IGNORED_PATH_PREFIXES.some(
          (prefix) => rel === prefix.slice(0, -1) || rel.startsWith(prefix),
        )
      ) {
        continue;
      }
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

function walkPathEntries(root: string): string[] {
  const entries: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (PATH_IGNORED_DIRS.has(entry.name)) continue;
      const abs = join(dir, entry.name);
      const rel = relative(root, abs).replace(/\\/g, "/");
      if (
        IGNORED_PATH_PREFIXES.some(
          (prefix) => rel === prefix.slice(0, -1) || rel.startsWith(prefix),
        )
      ) {
        continue;
      }
      entries.push(rel);
      if (entry.isDirectory()) walk(abs);
    }
  };
  walk(root);
  return entries.sort();
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
  const residuals: IdentifierRenameResidualHit[] = [];
  const zeroByToken = () => Object.fromEntries(TOKENS.map((token) => [token, 0]));
  const hitsByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const pathHitsByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const contentHitsByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const filesByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const pathEntriesByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const contentFilesByToken: Record<IdentifierRenameToken, number> = zeroByToken();
  const fileSetsByToken = Object.fromEntries(TOKENS.map((token) => [token, new Set<string>()]));
  const pathEntrySetsByToken = Object.fromEntries(
    TOKENS.map((token) => [token, new Set<string>()]),
  );
  const contentFileSetsByToken = Object.fromEntries(
    TOKENS.map((token) => [token, new Set<string>()]),
  );
  const categoryStats = new Map<
    IdentifierRenameHitCategory,
    { hits: number; files: Set<string> }
  >();
  for (const category of HIT_CATEGORIES) categoryStats.set(category, { hits: 0, files: new Set() });
  const residualDispositionStats = new Map<
    IdentifierRenameResidualDisposition,
    { hits: number; files: Set<string> }
  >();
  for (const disposition of RESIDUAL_DISPOSITIONS) {
    residualDispositionStats.set(disposition, { hits: 0, files: new Set() });
  }

  for (const rel of walkPathEntries(root)) {
    const category = classifyRenameHitPath(rel);
    for (const token of TOKENS) {
      const pathCount = countToken(rel, token);
      if (pathCount > 0) {
        hits.push({ token, path: rel, count: pathCount, category, location: "path" });
        hitsByToken[token] += pathCount;
        pathHitsByToken[token] += pathCount;
        fileSetsByToken[token].add(rel);
        pathEntrySetsByToken[token].add(rel);
        const stats = categoryStats.get(category);
        if (stats) {
          stats.hits += pathCount;
          stats.files.add(rel);
        }
      }
    }
    for (const token of RESIDUAL_TOKENS) {
      const pathCount = countResidualToken(rel, token);
      if (pathCount === 0) continue;
      const disposition = classifyRenameResidualDisposition({ token, category, path: rel });
      residuals.push({
        token,
        path: rel,
        count: pathCount,
        category,
        location: "path",
        disposition,
      });
      const stats = residualDispositionStats.get(disposition);
      if (stats) {
        stats.hits += pathCount;
        stats.files.add(rel);
      }
    }
  }

  for (const file of walkTextFiles(root)) {
    const rel = relative(root, file).replace(/\\/g, "/");
    const category = classifyRenameHitPath(rel);
    const text = readFileSync(file, "utf8");
    for (const token of TOKENS) {
      const count = countToken(text, token);
      if (count === 0) continue;
      hits.push({ token, path: rel, count, category, location: "content" });
      hitsByToken[token] += count;
      contentHitsByToken[token] += count;
      fileSetsByToken[token].add(rel);
      contentFileSetsByToken[token].add(rel);
      const stats = categoryStats.get(category);
      if (stats) {
        stats.hits += count;
        stats.files.add(rel);
      }
    }
    for (const token of RESIDUAL_TOKENS) {
      const count = countResidualToken(text, token);
      if (count === 0) continue;
      const disposition = classifyRenameResidualDisposition({ token, category, path: rel });
      residuals.push({
        token,
        path: rel,
        count,
        category,
        location: "content",
        disposition,
      });
      const stats = residualDispositionStats.get(disposition);
      if (stats) {
        stats.hits += count;
        stats.files.add(rel);
      }
    }
  }
  for (const token of TOKENS) {
    filesByToken[token] = fileSetsByToken[token].size;
    pathEntriesByToken[token] = pathEntrySetsByToken[token].size;
    contentFilesByToken[token] = contentFileSetsByToken[token].size;
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
  const residualsByDisposition = RESIDUAL_DISPOSITIONS.map((disposition) => {
    const stats = residualDispositionStats.get(disposition);
    return {
      disposition,
      hits: stats?.hits ?? 0,
      files: stats?.files.size ?? 0,
    };
  }).filter((summary) => summary.hits > 0);
  const pathRenameEntries = buildPathRenameEntries(hits);
  return {
    sourceRoot: root,
    targetCli: "helix",
    targetStateDir: ".helix",
    tokens: TOKENS,
    totalHits: hits.reduce((sum, hit) => sum + hit.count, 0),
    hitsByToken,
    filesByToken,
    pathHitsByToken,
    contentHitsByToken,
    pathEntriesByToken,
    contentFilesByToken,
    hitsByCategory,
    hits,
    residualsByDisposition,
    residuals,
    pathRenameEntries,
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
    case "historical_doc":
      return "preserve historical/reference meaning or mark as archived; do not use as current cutover authority";
    case "handover_doc":
      return "update handover narrative only when it is current handover evidence; avoid stale prose as authority";
    case "skill_doc":
      return "update skill docs and skill-map references without treating legacy skill prose as runtime authority";
    case "research_doc":
      return "preserve research source context and update only adoption/cutover interpretation";
    case "backlog_doc":
      return "update backlog/feedback references while preserving historical feedback semantics";
    case "top_level_doc":
      return "update top-level user-facing docs together with distribution and setup wording";
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
    case "historical_doc":
      return "bun test tests/identifier-rename.test.ts && bun run src/cli.ts rename audit --json";
    case "handover_doc":
      return "bun run src/cli.ts doctor";
    case "skill_doc":
      return "bun test tests/skill-assignment.test.ts tests/design-language.test.ts";
    case "research_doc":
      return "bun test tests/design-language.test.ts && bun run src/cli.ts rename audit --json";
    case "backlog_doc":
      return "bun run src/cli.ts doctor";
    case "top_level_doc":
      return "bun test tests/design-language.test.ts && bun run src/cli.ts doctor";
    case "distribution_surface":
      return "bun run build && ./dist/helix doctor";
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
        "Cutover source ledger includes NIST SSDF, GitHub approval/concurrency/repository rename, VS Code task execution boundary, Google SRE release/canary guidance, Microsoft safe deployment/testing, OWASP LLM06, and SLSA provenance rows",
      sourceStatusDelta: "none; ledger remains inside the 90-day freshness window",
      adoptionDecision: "adopt-cutover-source-ledger-for-l14-approval-review",
      adoptionDecisionDelta: "none; keep irreversible cutover approval-gated and plan-only",
      workflowRouteImpact:
        "none; stale or incomplete source ledger routes cutover back to request_runbook_changes",
    },
    {
      phase: "repository-redirect-review",
      command: "bun run src/cli.ts rename plan --json",
      writePolicy: "no-write",
      expected:
        "GitHub repository rename redirect behavior, Pages exception, git remote update, and distribution reference impact are reviewed before external repo/package rename",
      evidence:
        "rename plan JSON attached to cutover approval record with GitHub repository rename source metadata",
      source: "GitHub repository rename",
      sourceUrl:
        "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus:
        "official GitHub docs state repository rename redirects repository information and git operations while project site URLs are an exception",
      sourceStatusDelta:
        "none; repository redirect behavior and Pages exception remain explicit cutover review inputs",
      adoptionDecision: "adopt-live-docs-for-repository-rename-redirect-review",
      adoptionDecisionDelta:
        "none; GitHub rename redirects do not authorize HELIX identifier/state cutover by themselves",
      workflowRouteImpact:
        "none; repo remote/package/docs distribution references must be reviewed before irreversible cutover approval",
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
      sourceCheckedAt: cutoverSourceCheckedAt,
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
      sourceCheckedAt: cutoverSourceCheckedAt,
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
      sourceCheckedAt: cutoverSourceCheckedAt,
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
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-irreversible-cutover",
      adoptionDecisionDelta: "none; keep full regression as irreversible cutover blocker",
      workflowRouteImpact: "none; full regression failure blocks cutover approval review",
    },
    {
      phase: "current-dist-smoke",
      command: "bun run build && ./dist/helix doctor",
      writePolicy: "local-artifact-write",
      expected: "current compiled helix CLI remains runnable before rename cutover approval",
      evidence: "build output and current compiled doctor smoke",
      source: "ADR-001 TypeScript/Bun single-binary distribution decision",
      sourceUrl: "docs/adr/ADR-001-helix-harness-redesign-and-language.md",
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus: "ADR-001 TypeScript/Bun distribution decision remains current at HEAD",
      sourceStatusDelta: "none; current helix binary remains the pre-cutover baseline",
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
      sourceCheckedAt: cutoverSourceCheckedAt,
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
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus:
        "L3 HR-FR-P6-03 keeps helix setup project current and helix setup project future until PLAN-M-02 approval",
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
      command: "bun run build && ./dist/helix doctor",
      writePolicy: "local-artifact-write",
      expected:
        "legacy helix alias behavior is either intentionally preserved with a sunset plan or explicitly absent with migration notes",
      evidence: "legacy alias smoke or no-alias disposition recorded in audit_record",
      source: "PLAN-M-02 legacy alias policy",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      sourceCheckedAt: cutoverSourceCheckedAt,
      latestOfficialStatus: "PLAN-M-02 legacy alias policy remains approval-gated at HEAD",
      sourceStatusDelta: "none; legacy helix alias disposition is still pending cutover decision",
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
      evidencePath: ".helix/evidence/rename/blast-radius-baseline.json",
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
      evidencePath: ".helix/evidence/rename/codemod-rehearsal.json",
      passCriteria: "source/docs/template rename diff is previewed without touching the worktree",
      rollbackCheck: "preview diff can be discarded without git or state mutation",
      source: "PLAN-M-02 non-destructive rehearsal policy",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
    },
    {
      id: "cutover-rb-02a",
      phase: "repository-redirect-and-remote-review",
      command: "bun run src/cli.ts rename plan --json",
      writePolicy: "no-write",
      evidencePath: ".helix/evidence/rename/github-repository-redirect-review.json",
      passCriteria:
        "GitHub repository rename redirect behavior, project-site exception, git remote update, and distribution references are reviewed before external repository/package rename",
      rollbackCheck:
        "remote URL and published documentation references can stay on the pre-cutover repository path until PO approval",
      source: "GitHub repository rename",
      sourceUrl:
        "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
    },
    {
      id: "cutover-rb-03",
      phase: "state-backup-restore-drill",
      command: "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
      writePolicy: "no-write",
      evidencePath: ".helix/evidence/rename/state-backup-restore-drill.json",
      passCriteria: "DB, memory, state, logs, handover, and hook configs have restorable backups",
      rollbackCheck: "restore drill proves old .helix state can be restored before apply",
      source: "Cutover source ledger backup/provenance requirements",
      sourceUrl: "docs/process/forward/L08-L14-verification-phase.md",
    },
    {
      id: "cutover-rb-04",
      phase: "static-and-state-gates",
      command:
        "bun run lint && bun run typecheck && bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      writePolicy: "state-write",
      evidencePath: ".helix/evidence/rename/static-state-gates.txt",
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
      evidencePath: ".helix/evidence/rename/dist-smoke-rehearsal.txt",
      passCriteria:
        "current CLI, renamed CLI rehearsal, post-cutover consumer setup smoke, and alias disposition are all reviewed before cutover",
      rollbackCheck: "failed renamed CLI smoke keeps old command/state path active",
      source: "ADR-001 TypeScript/Bun single-binary distribution decision",
      sourceUrl: "docs/adr/ADR-001-helix-harness-redesign-and-language.md",
    },
    {
      id: "cutover-rb-06",
      phase: "full-regression",
      command: "bun run test",
      writePolicy: "no-write",
      evidencePath: ".helix/evidence/rename/full-regression.txt",
      passCriteria: "full regression is green after rehearsal material is generated",
      rollbackCheck: "red full regression blocks approval and keeps PLAN-M-02 draft",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
    },
    {
      id: "cutover-rb-07",
      phase: "post-cutover-monitoring-dry-run",
      command: "bun run src/cli.ts rename monitoring --no-write --json",
      writePolicy: "no-write",
      evidencePath: ".helix/evidence/rename/post-cutover-monitoring-dry-run.json",
      passCriteria:
        "quiet-window monitoring probes, rollback triggers, and current no-write proxy commands are reviewed before cutover",
      rollbackCheck:
        "any red monitoring probe restores the pre-cutover tag/branch and old state path",
      source: "PLAN-M-02 post-cutover monitoring policy",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
    },
  ];
}

function buildMonitoringPlan(): IdentifierRenameCutoverPlan["monitoringPlan"] {
  return [
    "run helix doctor and legacy alias smoke during the quiet window",
    "rebuild harness.db and inspect status/completion decision packet",
    "check rule-drift, hook adapter parity, and green-command digest after cutover",
    "watch feedback backlog, continuation projection, and runtime logs for path or marker regressions",
  ];
}

function buildStateBackupManifest(): IdentifierRenameCutoverPlan["stateBackupManifest"] {
  return [
    {
      path: ".helix/harness.db",
      purpose: "state DB projection and completion evidence baseline",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/harness.db",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-harness-db.json",
      restoreRequired: true,
    },
    {
      path: ".helix/memory",
      purpose: "HELIX shared memory before state-dir rename",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/memory/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-memory.json",
      restoreRequired: true,
    },
    {
      path: ".helix/state",
      purpose: "active plan, setup, and runtime state before migration",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/state/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-state.json",
      restoreRequired: true,
    },
    {
      path: ".helix/logs",
      purpose: "runtime/session/gate logs used as verification provenance",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/logs/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-logs.json",
      restoreRequired: true,
    },
    {
      path: ".helix/handover",
      purpose: "handover pointer and completion decision packet continuity",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/handover/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-handover.json",
      restoreRequired: true,
    },
    {
      path: ".helix/handover/provider",
      purpose: "provider handover pointer used by cross-runtime continuation",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/handover/provider/",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-provider-handover.json",
      restoreRequired: true,
    },
    {
      path: ".helix/config/approval-policy.yaml",
      purpose: "action-binding approval policy before irreversible rename",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/config/approval-policy.yaml",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-approval-policy.json",
      restoreRequired: true,
    },
    {
      path: ".claude/settings.json",
      purpose: "Claude hook/adapter config before marker rename",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/.claude/settings.json",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-claude-settings.json",
      restoreRequired: true,
    },
    {
      path: ".codex/hooks.json",
      purpose: "Codex hook adapter config before marker rename",
      backupTargetPattern: ".helix/backups/rename/<timestamp>/.codex/hooks.json",
      checksumRequired: true,
      restoreDrillRequired: true,
      restoreEvidencePath: ".helix/evidence/rename/restore-codex-hooks.json",
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
  return {
    schemaVersion: "identifier-rename-rehearsal.v1",
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    target,
    targetStateDir: ".helix",
    sourceCommand: "helix rename rehearsal --no-write --target helix --json",
    auditStatus: audit.status,
    renameMap: RENAME_MAP,
    previewCategories: plan.hitsByCategory,
    previewCommands: [
      {
        phase: "codemod-preview",
        command: "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
        description:
          "preview legacy identifier residuals -> helix/.helix/area=helix token changes without applying them",
        writesRepo: false,
        evidencePath: ".helix/evidence/rename/codemod-rehearsal.json",
      },
      {
        phase: "renamed-binary-smoke-preview",
        command: "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
        description:
          "after approval, build the renamed binary on a non-destructive branch and run helix doctor before alias enablement",
        writesRepo: false,
        evidencePath: ".helix/evidence/rename/dist-smoke-rehearsal.txt",
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
    sourceCommand: "helix rename state-backup --dry-run --restore-drill --json",
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
    sourceCommand: "helix rename dist-smoke --no-write --target helix --json",
    currentBinary: {
      path: "dist/helix",
      exists: existsSync(join(root, "dist", "helix")),
      smokeCommand: "bun run build && ./dist/helix doctor",
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
      evidencePath: ".helix/evidence/rename/post-cutover-consumer-setup-smoke.json",
      currentNoWriteProxyCommand: "bun run src/cli.ts setup project --dry-run --json",
    },
    legacyAliasPreview: {
      path: "dist/helix",
      dispositionRequired: "preserve_with_sunset_plan_or_remove_with_migration_notes",
    },
    blockedUntil: [
      "cutover_decision_record approves the current cutoverSnapshot.snapshotId",
      "action_binding_approval_record scopes actor/tool/target/params for package/bin alias changes",
      "renamed dist/helix binary is built only in an approved cutover rehearsal branch or release job",
      "canonical `helix setup project --dry-run --json` consumer bootstrap smoke is recorded before external apply or completion decision",
      "legacy alias disposition is recorded before external apply or completion decision",
    ],
  };
}

export function buildIdentifierRenameMonitoringDryRun(): IdentifierRenameMonitoringDryRun {
  return {
    schemaVersion: "identifier-rename-monitoring-dry-run.v1",
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    sourceCommand: "helix rename monitoring --no-write --json",
    quietWindow: {
      required: true,
      concurrencyPolicy: "single-run-no-concurrent-apply",
      approvalExpiresOnSignalChange: true,
    },
    monitoringPlan: buildMonitoringPlan(),
    probes: [
      {
        phase: "doctor-status-completion",
        commandAfterApproval:
          "helix doctor && helix status && helix completion decision-packet --json",
        currentNoWriteProxyCommand:
          "bun run src/cli.ts doctor --json && bun run src/cli.ts status --json && bun run src/cli.ts completion decision-packet --json",
        expected:
          "doctor stays green and status/completion packet keeps PLAN-M-02 evidence bound to the approved snapshot",
        rollbackTrigger: "doctor red, status regression, or completion packet evidence drift",
      },
      {
        phase: "legacy-alias-continuation-and-runtime-logs",
        commandAfterApproval: "dist/helix doctor && helix status && helix db status",
        currentNoWriteProxyCommand:
          "bun run src/cli.ts rename dist-smoke --no-write --target helix --json && bun run src/cli.ts status --json && bun run src/cli.ts db status --json",
        expected:
          "legacy alias disposition, DB continuation projection health, and runtime log continuity are observable during the quiet window",
        rollbackTrigger:
          "alias breakage without approved sunset route, continuation projection regression, or runtime path regression in logs",
      },
      {
        phase: "rule-drift-and-feedback-backlog",
        commandAfterApproval: "helix doctor && helix feedback status",
        currentNoWriteProxyCommand:
          "bun run src/cli.ts doctor --json && bun run src/cli.ts feedback status --json",
        expected:
          "rule-drift, hook adapter parity, and feedback backlog stay inside the approved cutover boundary",
        rollbackTrigger:
          "rule-drift, hook parity failure, or cutover-related feedback backlog escalation",
      },
    ],
    requiredEvidencePath: ".helix/evidence/rename/post-cutover-monitoring-dry-run.json",
    blockedUntil: [
      "cutover_decision_record approves the current cutoverSnapshot.snapshotId",
      "action_binding_approval_record scopes the quiet window, monitoring commands, rollback owner, and rollback trigger handling",
      "post-cutover monitoring dry-run evidence is recorded before apply",
    ],
  };
}

const RENAME_EVIDENCE_PACK_GENERATED_RUNBOOK_PHASES = new Set([
  "blast-radius-baseline",
  "codemod-rehearsal",
  "repository-redirect-and-remote-review",
  "state-backup-restore-drill",
  "dist-smoke-rehearsal",
  "post-cutover-monitoring-dry-run",
]);

export function buildIdentifierRenameEvidencePack(
  root: string,
  options: { write?: boolean } = {},
): IdentifierRenameEvidencePack {
  const write = Boolean(options.write);
  const plan = buildIdentifierRenameCutoverPlan(root);
  const backupDryRun = buildIdentifierRenameStateBackupDryRun(root, true);
  const generatedCandidates = [
    ...plan.cutoverRunbook
      .filter((step) => RENAME_EVIDENCE_PACK_GENERATED_RUNBOOK_PHASES.has(step.phase))
      .map((step) => ({
        path: step.evidencePath,
        source: "cutoverRunbook" as const,
        generatorCommand: step.command,
      })),
    ...backupDryRun.restoreChecks.map((check) => ({
      path: check.restoreEvidencePath,
      source: "stateBackupManifest" as const,
      generatorCommand: "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
    })),
  ].sort((a, b) => `${a.source}:${a.path}`.localeCompare(`${b.source}:${b.path}`));

  const generatedArtifacts = generatedCandidates.map((candidate) => {
    const content = renameEvidencePackContent(root, candidate.path);
    if (write) {
      const abs = join(root, candidate.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content, "utf8");
    }
    return {
      ...candidate,
      schemaVersion: renameEvidencePackSchemaVersionForPath(candidate.path),
      contentSha256: sha256Text(content),
      sizeBytes: Buffer.byteLength(content, "utf8"),
      written: write,
    };
  });

  const generatedPaths = new Set(generatedArtifacts.map((artifact) => artifact.path));
  const pendingArtifacts: IdentifierRenamePendingEvidenceArtifact[] = [
    ...plan.cutoverRunbook
      .filter((step) => !generatedPaths.has(step.evidencePath))
      .map((step) => ({
        path: step.evidencePath,
        source: "cutoverRunbook" as const,
        requiredCommand: step.command,
        reason:
          step.phase === "static-and-state-gates" || step.phase === "full-regression"
            ? "この evidence は実コマンドの成功出力でなければならないため evidence-pack では代替生成しない"
            : "専用 command の実行証跡が必要",
      })),
    ...plan.stateBackupManifest
      .filter((entry) => !generatedPaths.has(entry.restoreEvidencePath))
      .map((entry) => ({
        path: entry.restoreEvidencePath,
        source: "stateBackupManifest" as const,
        requiredCommand: "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
        reason: "state backup restore evidence が未生成",
      })),
  ].sort((a, b) => `${a.source}:${a.path}`.localeCompare(`${b.source}:${b.path}`));

  return {
    schemaVersion: "identifier-rename-evidence-pack.v1",
    sourceCommand: write
      ? "helix rename evidence-pack --write --json"
      : "helix rename evidence-pack --dry-run --json",
    planOnly: true,
    mustNotApply: true,
    appliesCutover: false,
    approvalStillRequired: true,
    writePolicy: write ? "local-evidence-write" : "no-write",
    targetDir: ".helix/evidence/rename",
    generatedArtifacts,
    pendingArtifacts,
    blockedUntil: [
      "pendingArtifacts が 0 になるまで実コマンド証跡を記録する",
      "git worktree を clean にして cutoverSnapshot を再生成する",
      "cutover_decision_record が current cutoverSnapshot.snapshotId を approve_cutover として明示する",
      "action_binding_approval_record が actor/tool/target/params と reviewed_snapshot_binding を束縛する",
    ],
  };
}

export function buildIdentifierRenameApprovalDraft(
  root: string,
): IdentifierRenameApprovalDraftPacket {
  const plan = buildIdentifierRenameCutoverPlan(root);
  const provenance = buildDecisionPacketProvenance({
    sourceCommand: RENAME_APPROVAL_DRAFT_PACKET_COMMAND,
  });
  const evidenceComplete =
    plan.cutoverSnapshot.evidenceArtifactsPresent ===
      plan.cutoverSnapshot.evidenceArtifactsRequired &&
    plan.cutoverSnapshot.missingEvidenceArtifacts.length === 0;
  const sourceLedgerFresh =
    !plan.sourceLedgerFreshness.stale && plan.sourceLedgerFreshness.violation === null;
  const sourceLedgerComplete =
    plan.sourceLedgerFreshness.missingRows.length === 0 &&
    plan.sourceLedgerFreshness.rowViolations.length === 0;
  const readyForHumanReview =
    evidenceComplete &&
    plan.cutoverSnapshot.worktreeClean &&
    sourceLedgerFresh &&
    sourceLedgerComplete;
  return {
    schemaVersion: "identifier-rename-approval-draft.v1",
    generatedAt: provenance.generatedAt,
    sourceCommand: RENAME_APPROVAL_DRAFT_PACKET_COMMAND,
    freshness: provenance.freshness,
    planOnly: true,
    mustNotApply: true,
    approvalCommandAvailable: false,
    approvalAllowed: false,
    applyAuthorized: false,
    targetPlanId: "PLAN-M-02-helix-identifier-rename",
    targetCli: plan.targetCli,
    targetStateDir: plan.targetStateDir,
    recommendedOutcome: readyForHumanReview
      ? "ready_for_human_cutover_review"
      : "request_runbook_changes",
    readiness: {
      evidenceComplete,
      worktreeClean: plan.cutoverSnapshot.worktreeClean,
      sourceLedgerFresh,
      sourceLedgerComplete,
      approvalRecordsConcrete:
        plan.snapshotReview.cutoverSnapshotMatchesCurrent &&
        plan.snapshotReview.actionBindingSnapshotMatchesCurrent,
      blockedReasonCount: plan.blockedReasons.length,
    },
    currentSnapshot: {
      cutoverSnapshotId: plan.cutoverSnapshot.snapshotId,
      repoHeadSha: plan.cutoverSnapshot.repoHeadSha,
      worktreeClean: plan.cutoverSnapshot.worktreeClean,
      worktreeDirtyPathCount: plan.cutoverSnapshot.worktreeDirtyPathCount,
      worktreeDirtyPaths: plan.cutoverSnapshot.worktreeDirtyPaths,
      evidenceArtifactsRequired: plan.cutoverSnapshot.evidenceArtifactsRequired,
      evidenceArtifactsPresent: plan.cutoverSnapshot.evidenceArtifactsPresent,
      missingEvidenceArtifacts: plan.cutoverSnapshot.missingEvidenceArtifacts,
      blastRadiusDigest: plan.cutoverSnapshot.blastRadiusDigest,
      approvalScopeDigest: plan.cutoverSnapshot.approvalScopeDigest,
      evidenceDigest: plan.cutoverSnapshot.evidenceDigest,
      evidenceArtifactsDigest: plan.cutoverSnapshot.evidenceArtifactsDigest,
      sourceLedgerCheckedDate: plan.cutoverSnapshot.sourceLedgerCheckedDate,
      sourceLedgerRowsDigest: plan.cutoverSnapshot.sourceLedgerRowsDigest,
    },
    draftRecords: [
      buildCutoverDecisionDraftRecord(plan),
      buildActionBindingApprovalDraftRecord(plan),
    ],
    blockedUntil: [
      "この packet は approval draft であり、allowed_outcome / approver / audit_record は人間が判断して記録する",
      "git worktree が clean な current cutoverSnapshot.snapshotId で approval evidence を取り直す",
      "action_binding_approval_record が approved_actor / approved_tool / approved_target / approved_params と reviewed_snapshot_binding を明示する",
      "approval 後も applyAuthorized=false の rename plan を review し、別 action-binding apply surface なしに cutover を実行しない",
    ],
    relatedDecisionPackets: uniqueRelatedDecisionPackets([
      relatedDecisionPacket({
        command: RENAME_PLAN_PACKET_COMMAND,
        scopedCommand: RENAME_PLAN_PACKET_COMMAND,
        role: "primary",
        reason: "approval draft is bound to the current rename plan cutover snapshot",
        route: "review rename plan before copying any record draft into PLAN-M-02",
      }),
      relatedDecisionPacket({
        command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
        scopedCommand: `${ACTION_BINDING_APPROVAL_PACKET_COMMAND} --plan PLAN-M-02-helix-identifier-rename`,
        role: "supporting",
        reason:
          "action-binding approval packet remains the authority boundary for actor/tool/target/params",
        route: "review action-binding packet before any high-impact action approval",
      }),
    ]),
  };
}

function buildCutoverDecisionDraftRecord(
  plan: IdentifierRenameCutoverPlan,
): IdentifierRenameApprovalDraftRecord {
  return {
    recordName: "cutover_decision_record",
    pasteReady: false,
    unsafeToTreatAsApproval: true,
    insertionHintJa:
      "PLAN-M-02 の cutover_decision_record 草案。allowed_outcome / decision_owner / audit_record は PO が判断して具体化する。",
    yamlLines: [
      "cutover_decision_record:",
      '  - allowed_outcome: "<approve_cutover|reject_or_defer|request_runbook_changes>"',
      '  - decision_owner: "<PO or named approver>"',
      `  - cutover_snapshot_id: "cutoverSnapshot.snapshotId ${plan.cutoverSnapshot.snapshotId}"`,
      '  - trigger_condition: "frozen HEAD, clean worktree, evidenceArtifactsPresent equals evidenceArtifactsRequired, and action-binding approval record reviewed"',
      `  - blast_radius_baseline: ".helix/evidence/rename/blast-radius-baseline.json ${plan.cutoverSnapshot.blastRadiusDigest}"`,
      '  - dry_run_plan: ".helix/evidence/rename/codemod-rehearsal.json, .helix/evidence/rename/dist-smoke-rehearsal.txt, .helix/evidence/rename/static-state-gates.txt, .helix/evidence/rename/full-regression.txt"',
      '  - rollback_plan: "pre-cutover branch/tag plus .helix backup restore route; legacy alias disposition remains explicit"',
      '  - state_backup_plan: ".helix/evidence/rename/state-backup-restore-drill.json and restore-*.json"',
      '  - execution_window_or_freeze_policy: "single-run quiet window; reapprove if HEAD, dirty path set, evidence digest, source ledger, or approval scope changes"',
      '  - approval_scope: "CLI/bin rename and 旧 state path -> .helix state dir migration only; external repo/package rename requires separate approval"',
      '  - audit_record: "<approver, timestamp, command args, result, incident route, rollback decision>"',
      '  - post_cutover_monitoring: "helix doctor/status/completion packet, legacy alias smoke, feedback backlog, handover, and runtime logs during quiet window"',
      '  - legacy_alias_policy: "temporary helix alias/shim only with explicit sunset PLAN, or no-alias decision recorded here"',
      `  - source_ledger_freshness: "fresh Cutover source ledger checked ${plan.sourceLedgerFreshness.checkedDate ?? "<checked-date>"}"`,
      '  - source_status_delta: "none; official cutover sources reviewed for this snapshot"',
      '  - adoption_decision_delta: "none; adoption decisions unchanged for this snapshot"',
      '  - workflow_route_impact: "none; L14 cutover remains approval-gated and applyAuthorized=false until a separate approved apply surface exists"',
    ],
  };
}

function buildActionBindingApprovalDraftRecord(
  plan: IdentifierRenameCutoverPlan,
): IdentifierRenameApprovalDraftRecord {
  return {
    recordName: "action_binding_approval_record",
    pasteReady: false,
    unsafeToTreatAsApproval: true,
    insertionHintJa:
      "PLAN-M-02 の action_binding_approval_record 草案。approved_actor/tool/target/params と approver は人間が確定する。",
    yamlLines: [
      "action_binding_approval_record:",
      '  - allowed_outcome: "<approve_action_binding|deny_action|request_scope_reduction>"',
      '  - approval_policy_or_named_approver: "<PO or named approval policy>"',
      '  - approval_scope: "CLI/bin rename and 旧 state path -> .helix state dir migration only; no secrets, no external infra, no repository/package rename"',
      '  - approved_actor: "<codex|claude|named human/runtime>"',
      '  - approved_tool: "<exact non-destructive review command or future approved apply command>"',
      '  - approved_target: "旧 state path -> .helix state dir and HELIX CLI/bin identifiers only"',
      `  - approved_params: "cutoverSnapshot=${plan.cutoverSnapshot.snapshotId}; evidenceArtifactsDigest=${plan.cutoverSnapshot.evidenceArtifactsDigest}; approvalScopeDigest=${plan.cutoverSnapshot.approvalScopeDigest}"`,
      '  - review_approval_evidence: "rename plan, approval-draft packet, action-binding packet, static-state-gates, full-regression, and evidence artifact hashes reviewed"',
      `  - reviewed_snapshot_binding: "cutoverSnapshot.snapshotId ${plan.cutoverSnapshot.snapshotId}"`,
      '  - expires_at_or_trigger: "expires if HEAD, dirty path set, evidence digest, source ledger, approval scope, actor/tool/target/params, or quiet window changes"',
      '  - audit_record: "<approver, timestamp, reviewed packet digests, decision outcome, incident route>"',
    ],
  };
}

function renameEvidencePackContent(root: string, path: string): string {
  if (path === ".helix/evidence/rename/blast-radius-baseline.json") {
    return jsonEvidence(auditIdentifierRenameBlastRadius(root));
  }
  if (path === ".helix/evidence/rename/codemod-rehearsal.json") {
    return jsonEvidence(buildIdentifierRenameRehearsalPlan(root));
  }
  if (path === ".helix/evidence/rename/github-repository-redirect-review.json") {
    const plan = buildIdentifierRenameCutoverPlan(root);
    return jsonEvidence({
      schemaVersion: "identifier-rename-github-repository-redirect-review.v1",
      sourceCommand: "helix rename evidence-pack --write --json",
      planOnly: true,
      mustNotApply: true,
      appliesRemote: false,
      source: "GitHub repository rename",
      sourceUrl:
        "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
      verificationRow: plan.verificationCommandMatrix.find(
        (row) => row.phase === "repository-redirect-review",
      ),
      reviewedFacts: [
        "repository information and git operations are redirected after rename",
        "GitHub Pages project site URLs are an explicit exception",
        "actions hosted from renamed repositories are not redirected",
        "local clones should update origin with git remote set-url",
      ],
    });
  }
  if (path === ".helix/evidence/rename/state-backup-restore-drill.json") {
    return jsonEvidence(buildIdentifierRenameStateBackupDryRun(root, true));
  }
  if (path === ".helix/evidence/rename/dist-smoke-rehearsal.txt") {
    return `identifier-rename-dist-smoke-dry-run.v1\n${jsonEvidence(
      buildIdentifierRenameDistSmokeDryRun(root),
    )}`;
  }
  if (path === ".helix/evidence/rename/post-cutover-monitoring-dry-run.json") {
    return jsonEvidence(buildIdentifierRenameMonitoringDryRun());
  }
  if (path.startsWith(".helix/evidence/rename/restore-") && path.endsWith(".json")) {
    const backupDryRun = buildIdentifierRenameStateBackupDryRun(root, true);
    const check = backupDryRun.restoreChecks.find((item) => item.restoreEvidencePath === path);
    return jsonEvidence({
      schemaVersion: "identifier-rename-restore-check-evidence.v1",
      sourceCommand: "helix rename evidence-pack --write --json",
      planOnly: true,
      mustNotApply: true,
      restoreDrillRequested: true,
      check,
      status: check?.sourceExists
        ? "source_present_for_restore_drill"
        : "source_missing_requires_disposition",
    });
  }
  throw new Error(`unsupported rename evidence-pack artifact path: ${path}`);
}

function renameEvidencePackSchemaVersionForPath(path: string): string {
  if (path.endsWith("blast-radius-baseline.json")) return "identifier-rename-audit.v1";
  if (path.endsWith("codemod-rehearsal.json")) return "identifier-rename-rehearsal.v1";
  if (path.endsWith("github-repository-redirect-review.json")) {
    return "identifier-rename-github-repository-redirect-review.v1";
  }
  if (path.endsWith("state-backup-restore-drill.json")) {
    return "identifier-rename-state-backup-dry-run.v1";
  }
  if (path.endsWith("dist-smoke-rehearsal.txt")) {
    return "identifier-rename-dist-smoke-dry-run.v1";
  }
  if (path.endsWith("post-cutover-monitoring-dry-run.json")) {
    return "identifier-rename-monitoring-dry-run.v1";
  }
  if (path.includes("/restore-") && path.endsWith(".json")) {
    return "identifier-rename-restore-check-evidence.v1";
  }
  return "identifier-rename-evidence.v1";
}

function jsonEvidence(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function identifierRenameRunbookCommandViolations(
  plan: Pick<IdentifierRenameCutoverPlan, "cutoverRunbook">,
): IdentifierRenameRunbookCommandViolation[] {
  const allowedCommands = new Set([
    "bun run src/cli.ts rename audit --json",
    "bun run src/cli.ts rename plan --json",
    "bun run src/cli.ts rename rehearsal --no-write --target helix --json",
    "bun run src/cli.ts rename state-backup --dry-run --restore-drill --json",
    "bun run lint && bun run typecheck && bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
    "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
    "bun run src/cli.ts rename monitoring --no-write --json",
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
    const evidencePathViolation = renameEvidencePathViolation(step.evidencePath, {
      field: "cutoverRunbook.evidencePath",
      allowedExtensions: [".json", ".txt"],
    });
    if (evidencePathViolation) {
      violations.push({
        subject: step.id,
        reason: evidencePathViolation,
      });
    }
    return violations;
  });
}

export function identifierRenameStateBackupManifestViolations(
  plan: Pick<IdentifierRenameCutoverPlan, "stateBackupManifest">,
): IdentifierRenameStateBackupManifestViolation[] {
  return plan.stateBackupManifest.flatMap((entry) => {
    const violations: IdentifierRenameStateBackupManifestViolation[] = [];
    const subject = entry.path;
    const sourcePathViolation = repoLocalPathViolation(entry.path, {
      field: "stateBackupManifest.path",
      allowedPrefixes: [".helix/", ".claude/", ".codex/"],
    });
    if (sourcePathViolation) {
      violations.push({ subject, reason: sourcePathViolation });
    }
    const backupPatternViolation = repoLocalPathViolation(entry.backupTargetPattern, {
      field: "stateBackupManifest.backupTargetPattern",
      allowedPrefixes: [RENAME_BACKUP_PATH_PREFIX],
      allowTimestampPlaceholder: true,
    });
    if (backupPatternViolation) {
      violations.push({ subject, reason: backupPatternViolation });
    }
    const restoreEvidencePathViolation = renameEvidencePathViolation(entry.restoreEvidencePath, {
      field: "stateBackupManifest.restoreEvidencePath",
      allowedExtensions: [".json"],
    });
    if (restoreEvidencePathViolation) {
      violations.push({ subject, reason: restoreEvidencePathViolation });
    }
    if (entry.checksumRequired !== true) {
      violations.push({
        subject,
        reason: "stateBackupManifest.checksumRequired must be true",
      });
    }
    if (entry.restoreDrillRequired !== true) {
      violations.push({
        subject,
        reason: "stateBackupManifest.restoreDrillRequired must be true",
      });
    }
    if (entry.restoreRequired !== true) {
      violations.push({
        subject,
        reason: "stateBackupManifest.restoreRequired must be true",
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
    "bun run src/cli.ts rename plan --json",
    "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts",
    "bun run lint && bun run typecheck && git diff --check",
    "bun run test",
    "bun run src/cli.ts rename dist-smoke --no-write --target helix --json",
  ]);
  const allowedStateWriteCommands = new Set([
    "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
  ]);
  const allowedLocalArtifactWriteCommands = new Set(["bun run build && ./dist/helix doctor"]);
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

function renameEvidencePathViolation(
  path: string,
  input: { field: string; allowedExtensions: readonly string[] },
): string | null {
  const baseViolation = repoLocalPathViolation(path, {
    field: input.field,
    allowedPrefixes: [RENAME_EVIDENCE_PATH_PREFIX],
  });
  if (baseViolation) return baseViolation;
  if (!input.allowedExtensions.some((extension) => path.endsWith(extension))) {
    return `${input.field} must end with ${input.allowedExtensions.join(" or ")}: ${path}`;
  }
  return null;
}

function repoLocalPathViolation(
  path: string,
  input: {
    field: string;
    allowedPrefixes: readonly string[];
    allowTimestampPlaceholder?: boolean;
  },
): string | null {
  const value = path.trim();
  if (!value) return `${input.field} is empty`;
  if (value !== path) return `${input.field} must not contain leading or trailing whitespace`;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    return `${input.field} must be a repo-local relative path, not a URL: ${value}`;
  }
  if (value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value)) {
    return `${input.field} must be a repo-local relative path, not an absolute path: ${value}`;
  }
  if (value.includes("\\") || value.includes("\0")) {
    return `${input.field} must use POSIX repo-relative path syntax: ${value}`;
  }
  if (value.split("/").includes("..")) {
    return `${input.field} must not traverse outside the repository: ${value}`;
  }
  const normalizedForPattern = input.allowTimestampPlaceholder
    ? value.replace("<timestamp>", "timestamp")
    : value;
  if (!/^[A-Za-z0-9._/-]+$/.test(normalizedForPattern)) {
    return `${input.field} must be a concrete repo-local artifact path, not prose: ${value}`;
  }
  if (!input.allowedPrefixes.some((prefix) => value.startsWith(prefix))) {
    return `${input.field} must stay under ${input.allowedPrefixes.join(" or ")}: ${value}`;
  }
  return null;
}

function readRepoWorktreeSnapshot(root: string): IdentifierRenameWorktreeSnapshot {
  try {
    const status = execFileSync(
      "git",
      ["-C", root, "status", "--porcelain=v1", "--untracked-files=all"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    const lines = status
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .sort();
    const dirtyPaths = lines
      .map((line) => line.slice(3).trim())
      .filter(Boolean)
      .sort();
    return {
      readable: true,
      clean: dirtyPaths.length === 0,
      statusDigest: sha256Json({ porcelainV1: lines }),
      dirtyPathCount: dirtyPaths.length,
      dirtyPaths,
    };
  } catch {
    return {
      readable: false,
      clean: false,
      statusDigest: null,
      dirtyPathCount: 0,
      dirtyPaths: [],
    };
  }
}

function readEvidenceArtifacts(
  root: string,
  cutoverRunbook: IdentifierRenameCutoverPlan["cutoverRunbook"],
  stateBackupManifest: IdentifierRenameCutoverPlan["stateBackupManifest"],
): IdentifierRenameEvidenceArtifact[] {
  const artifacts = [
    ...cutoverRunbook.map((step) => ({
      path: step.evidencePath,
      source: "cutoverRunbook" as const,
    })),
    ...stateBackupManifest.map((entry) => ({
      path: entry.restoreEvidencePath,
      source: "stateBackupManifest" as const,
    })),
  ];
  return artifacts
    .filter(
      (artifact, index, self) =>
        self.findIndex(
          (candidate) => candidate.path === artifact.path && candidate.source === artifact.source,
        ) === index,
    )
    .sort((a, b) => `${a.source}:${a.path}`.localeCompare(`${b.source}:${b.path}`))
    .map((artifact) => {
      const absolutePath = join(root, artifact.path);
      if (!existsSync(absolutePath)) {
        return { ...artifact, exists: false, sha256: null, sizeBytes: null };
      }
      const stats = statSync(absolutePath);
      if (!stats.isFile()) {
        return { ...artifact, exists: false, sha256: null, sizeBytes: null };
      }
      return {
        ...artifact,
        exists: true,
        sha256: `sha256:${createHash("sha256").update(readFileSync(absolutePath)).digest("hex")}`,
        sizeBytes: stats.size,
      };
    });
}

export function buildIdentifierRenameCutoverPlan(
  root: string,
  semanticFeatureFrontierRecords: SemanticFeatureFrontierRecord[] = computeOutstandingWork(root)
    .semanticFeatureFrontierRecords ?? [],
  options: IdentifierRenameCutoverPlanOptions | string | null = {},
): IdentifierRenameCutoverPlan {
  const repoHeadSha =
    typeof options === "string" || options === null
      ? options
      : (options.repoHeadSha ?? readRepoHeadSha(root));
  const worktreeSnapshot =
    typeof options === "object" && options !== null && options.worktreeSnapshot
      ? options.worktreeSnapshot
      : readRepoWorktreeSnapshot(root);
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
  const evidenceArtifacts = readEvidenceArtifacts(root, cutoverRunbook, stateBackupManifest);
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
  if (sourceLedgerFreshness.rowViolations.length > 0) {
    blockedReasons.push(
      `source ledger cutover row violations: ${sourceLedgerFreshness.rowViolations.join("; ")}`,
    );
  }
  if (!repoHeadSha) {
    blockedReasons.push("cutover snapshot is not bound to a readable git HEAD sha");
  }
  if (!worktreeSnapshot.readable) {
    blockedReasons.push("cutover snapshot is not bound to readable git worktree status");
  } else if (!worktreeSnapshot.clean) {
    blockedReasons.push(
      `cutover snapshot requires a clean git worktree before approval; dirtyPathCount=${worktreeSnapshot.dirtyPathCount}`,
    );
  }
  const missingEvidenceArtifacts = evidenceArtifacts
    .filter((artifact) => !artifact.exists)
    .map((artifact) => artifact.path);
  if (missingEvidenceArtifacts.length > 0) {
    blockedReasons.push(
      `cutover evidence artifacts missing before approval: ${missingEvidenceArtifacts.slice(0, 5).join(", ")}${missingEvidenceArtifacts.length > 5 ? `, ... +${missingEvidenceArtifacts.length - 5}` : ""}`,
    );
  }
  const missingRestoreSources = buildIdentifierRenameStateBackupDryRun(root, true)
    .restoreChecks.filter((check) => check.restoreRequired && !check.sourceExists)
    .map((check) => check.path);
  if (missingRestoreSources.length > 0) {
    blockedReasons.push(
      `state backup restore sources missing before approval: ${missingRestoreSources.join(", ")}; create source or record explicit no-state-needed disposition before cutover`,
    );
  }
  const freezePolicy: IdentifierRenameCutoverPlan["freezePolicy"] = {
    requiresFrozenHead: true,
    requiresQuietWindow: true,
    concurrencyPolicy: "single-run-no-concurrent-apply" as const,
    reapprovalTriggers: [
      "HEAD changes after approval",
      "git worktree dirty path set changes after approval",
      "blast-radius hit set changes after approval",
      "approval scope or approved params change",
      "dry-run, rollback, backup, or monitoring plan changes",
      "cutover evidence artifact file hashes change after approval",
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
    worktreeSnapshot,
    evidenceArtifacts,
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
      pathHitsByToken: audit.pathHitsByToken,
      contentHitsByToken: audit.contentHitsByToken,
      pathEntriesByToken: audit.pathEntriesByToken,
      contentFilesByToken: audit.contentFilesByToken,
      requiredRecords: audit.requiredRecords,
    },
    hitsByCategory,
    cutoverCategoryChecklist,
    blockedReasons,
    recordTemplates: recordTemplatesForRecords(
      requiredRecordsForBlockers(["irreversible_migration_pending", "human_approval_pending"]),
    ),
    dryRunPlan: [
      "run rename audit and freeze the helix/.helix/area=helix blast-radius baseline",
      "rehearse source/test/docs codemod on a non-destructive branch",
      "rehearse state path migration with backup/restore proof for .helix/harness.db, memory, state, logs, and handover",
      "run targeted identifier-rename tests, typecheck, lint, db rebuild, doctor, and full test suite",
      "run compiled distribution smoke after the CLI/bin rename rehearsal",
    ],
    cutoverRunbook,
    verificationCommandMatrix,
    rollbackPlan: [
      "create a pre-cutover branch or tag at frozen HEAD",
      "backup .helix/harness.db, memory, state, logs, handover, provider handover, and repo-local hook configs",
      "restore old hook/adapter markers and state paths if doctor or full tests fail",
      "keep or restore a temporary helix alias only with an explicit sunset PLAN",
      "revert the cutover commit if post-cutover monitoring fails",
    ],
    monitoringPlan: buildMonitoringPlan(),
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
        reason: `irreversible ${LEGACY_STATE_DIR_TOKEN} to .helix cutover requires explicit cutover signoff`,
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
  worktreeSnapshot: IdentifierRenameWorktreeSnapshot;
  evidenceArtifacts: IdentifierRenameEvidenceArtifact[];
}): IdentifierRenameCutoverSnapshot {
  const headDigest = input.repoHeadSha ? sha256Json({ repoHeadSha: input.repoHeadSha }) : null;
  const blastRadiusDigest = sha256Json({
    tokens: input.audit.tokens,
    hitsByToken: input.audit.hitsByToken,
    filesByToken: input.audit.filesByToken,
    pathHitsByToken: input.audit.pathHitsByToken,
    contentHitsByToken: input.audit.contentHitsByToken,
    pathEntriesByToken: input.audit.pathEntriesByToken,
    contentFilesByToken: input.audit.contentFilesByToken,
    hitsByCategory: input.hitsByCategory,
    hits: input.audit.hits.map((hit) => ({
      token: hit.token,
      path: hit.path,
      count: hit.count,
      category: hit.category,
      location: hit.location,
      fileSha256: fileSha256ForRenameHit(input.audit.sourceRoot, hit),
    })),
  });
  const approvalScopeDigest = sha256Json({
    renameMap: input.renameMap,
    targetCli: input.audit.targetCli,
    targetStateDir: input.audit.targetStateDir,
    requiredRecords: input.audit.requiredRecords,
    cutoverCategoryChecklist: input.cutoverCategoryChecklist,
  });
  const evidenceArtifactsDigest = sha256Json({
    artifacts: input.evidenceArtifacts.map((artifact) => ({
      path: artifact.path,
      source: artifact.source,
      exists: artifact.exists,
      sha256: artifact.sha256,
      sizeBytes: artifact.sizeBytes,
    })),
  });
  const evidenceDigest = sha256Json({
    repoHeadSha: input.repoHeadSha,
    worktreeSnapshot: input.worktreeSnapshot,
    sourceLedgerFreshness: input.sourceLedgerFreshness,
    cutoverRunbook: input.cutoverRunbook,
    verificationCommandMatrix: input.verificationCommandMatrix,
    stateBackupManifest: input.stateBackupManifest,
    freezePolicy: input.freezePolicy,
    provenanceRequirements: input.provenanceRequirements,
    evidenceArtifactsDigest,
  });
  const missingEvidenceArtifacts = input.evidenceArtifacts
    .filter((artifact) => !artifact.exists)
    .map((artifact) => artifact.path);
  const snapshot = {
    repoHeadSha: input.repoHeadSha,
    headDigest,
    worktreeStatusReadable: input.worktreeSnapshot.readable,
    worktreeClean: input.worktreeSnapshot.clean,
    worktreeStatusDigest: input.worktreeSnapshot.statusDigest,
    worktreeDirtyPathCount: input.worktreeSnapshot.dirtyPathCount,
    worktreeDirtyPaths: input.worktreeSnapshot.dirtyPaths,
    blastRadiusDigest,
    approvalScopeDigest,
    evidenceDigest,
    evidenceArtifactsDigest,
    evidenceArtifactsRequired: input.evidenceArtifacts.length,
    evidenceArtifactsPresent: input.evidenceArtifacts.filter((artifact) => artifact.exists).length,
    missingEvidenceArtifacts,
    evidenceArtifacts: input.evidenceArtifacts,
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

function fileSha256ForRenameHit(root: string, hit: IdentifierRenameHit): string | null {
  const absolutePath = join(root, hit.path);
  try {
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) return null;
    return `sha256:${createHash("sha256").update(readFileSync(absolutePath)).digest("hex")}`;
  } catch {
    return null;
  }
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
      rowViolations: [],
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
  const rowViolations = cutoverSourceLedgerRowViolations(ledger.rows);
  return {
    ledgerLabel,
    checkedDate,
    stale: violation !== null || missingRows.length > 0 || rowViolations.length > 0,
    violation,
    maxAgeDays: SOURCE_LEDGER_MAX_AGE_DAYS,
    rowCount: ledger.rows.length,
    missingRows,
    rowViolations,
    rowsDigest: sha256Json(ledger.rows),
  };
}

function cutoverSourceLedgerRowViolations(rows: Record<string, string>[]): string[] {
  const rowsBySource = new Map(rows.map((row) => [row.source ?? "", row]));
  return REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS.flatMap((source) => {
    const row = rowsBySource.get(source);
    if (!row) return [];
    const officialUrl = row["official URL"] ?? "";
    const impact = row["required field impact"] ?? "";
    const expected = CUTOVER_SOURCE_LEDGER_EXPECTATIONS[source];
    return [
      ...expected.urls
        .filter((url) => !officialUrl.includes(url))
        .map((url) => `cutover source ledger ${source} official URL missing expected ${url}`),
      ...expected.impacts
        .filter((field) => !impact.includes(field))
        .map(
          (field) =>
            `cutover source ledger ${source} required field impact missing expected ${field}`,
        ),
    ];
  });
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
  const columns = tableCells(tableLines[0]).map((column) => cutoverSourceLedgerColumn(column));
  return {
    rows: tableLines.slice(2).map((line) => {
      const rowCells = tableCells(line);
      return Object.fromEntries(columns.map((column, index) => [column, rowCells[index] ?? ""]));
    }),
  };
}

function cutoverSourceLedgerColumn(column: string): string {
  const aliases: Record<string, string> = {
    "公式 URL": "official URL",
    "採用 version/date": "adopted version/date",
    "最新公式 status": "latest official status",
    採用判断: "adoption decision",
    "cutover 用途": "cutover use",
    "必須 field への影響": "required field impact",
  };
  return aliases[column] ?? column;
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

function sha256Text(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
