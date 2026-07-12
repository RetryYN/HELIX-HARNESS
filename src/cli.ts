#!/usr/bin/env bun
import { execFileSync, spawn, spawnSync } from "node:child_process";
/**
 * HELIX-HARNESS CLI (TypeScript core, ADR-001).
 * 薄い OS 別 entrypoint (scripts/helix, helix.ps1) が本 core を呼ぶ。
 * status / doctor / plan lint / vmodel lint / gate / runtime adapter を集約する。
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { Command } from "commander";
import { catalogAutomationAssets } from "./assets/catalog";
import { loadBranchAudit, renderBranchAudit } from "./audit/branches";
import { gateCiAutoFixRepush } from "./audit/ci-auto-fix-gate";
import {
  ciAutoFixGateInputSchema,
  prReviewRouteInputSchema,
  releaseAutomationDecisionInputSchema,
} from "./audit/enforcement-route-input";
import {
  loadGithubCiStatus,
  loadGithubMergeReadiness,
  loadGithubPrBodyDraft,
  renderGithubCiStatus,
  renderGithubMergeReadiness,
  runGithubPrCreate,
} from "./audit/github-merge-readiness";
import {
  buildReleasePublicationPlan,
  evaluateGithubOpsGuard,
  renderGithubOpsGuard,
  renderReleasePublicationPlan,
} from "./audit/github-ops-guard";
import { validatePrReviewRoute } from "./audit/pr-review-route";
import { renderQualityAudit, runQualityAudit } from "./audit/quality";
import { planReleaseAutomationDecision } from "./audit/release-automation-decision";
import { registerRenameCommands } from "./cli/commands/rename";
import { registerRouteCommands } from "./cli/commands/route";
import { packetFreshnessLine, verificationSourceLines, writeRecordTemplates } from "./cli/helpers";
import { runConsumerDoctor, runDoctor } from "./doctor";
import { computeSkillMetrics, emitFeedbackEvents } from "./feedback/engine";
import {
  ackFeedback,
  reconcileFeedbackLifecycle,
  recordFeedbackSurface,
} from "./feedback/lifecycle";
import { nodeFeedbackLifecycleDeps } from "./feedback/lifecycle-node";
import { autoAckTelemetry } from "./feedback/lifecycle-surface";
import {
  loadFeedbackLifecycleSources,
  renderTakeoverFeedback,
  selectTakeoverFeedback,
} from "./feedback/surface";
import {
  evaluateGateReview,
  judgmentReviewPlanForMode,
  loadReviewChecklistIfPresent,
} from "./gate/review-tier";
import { evaluateStaticGate } from "./gate/static";
import { loadRelationGraphSourceSet } from "./graph/loader";
import {
  buildActionBindingApprovalPackets,
  loadActionBindingApprovalReadinessInput,
} from "./lint/action-binding-approval-readiness";
import {
  analyzeBranchKind,
  type BranchKindInput,
  type BranchPlanDoc,
  branchKindMessages,
  loadBranchKindInput,
  loadPlanDoc,
} from "./lint/branch-kind";
import { loadChangedFiles, loadStagedFiles } from "./lint/change-impact";
import {
  analyzeCommitSubjects,
  analyzePrContext,
  commitlintMessages,
  prContextGuardMessages,
} from "./lint/github-guards";
import { l1L2GapCheckMessages, loadL1L2GapCheckPacket } from "./lint/l1-l2-gap-check";
import {
  analyzeObjectiveEvidenceAudit,
  loadObjectiveEvidenceAuditInput,
  loadObjectiveProgress,
  objectiveEvidenceAuditMessages,
} from "./lint/objective-evidence-audit";
import {
  completionDecisionPacketForOutstanding,
  completionReadinessLine,
  completionReviewBundleForOutstanding,
  computeOutstandingWork,
  outstandingSummaryLine,
  workflowNextActionForOutstanding,
  workflowNextActionsForOutstanding,
} from "./lint/outstanding";
import {
  analyzeRelationImpact,
  collectRelationGraphProjection,
  exportRelationDiagram,
  filterRelationGraphProjectionByScope,
  isSafeRelationGraphScope,
  type RelationDiagramAdapter,
} from "./lint/relation-graph";
import { buildS4DecisionPackets, loadS4DecisionReadinessInput } from "./lint/s4-decision-readiness";
import {
  analyzeVerificationProfileSafety,
  inspectMcpProfile,
  listVerificationProfiles,
  nodeVerificationProbeDeps,
  probeVerificationProfile,
  recommendVerificationProfiles,
  renderGeneratedMcpConfig,
  runVerificationProfile,
  saveVerificationEvidence,
  verificationRecommendationMermaid,
} from "./lint/verification-profile";
import { buildVersionUpActivationReviewBundle } from "./lint/version-up-bundle";
import {
  buildVersionUpActivationPackets,
  buildVersionUpActivationRehearsalPacket,
  buildVersionUpgradeDryRunPlan,
  buildVersionUpSecurityChecklistPacket,
  loadVersionUpReadinessInput,
} from "./lint/version-up-readiness";
import {
  compactMemoryV2,
  consumeTakeover,
  deliverTakeover,
  listMemory,
  type MemoryLayer,
  type MemoryLayerV2,
  type MemoryRuntime,
  type MemoryType,
  nodeMemoryV2Deps,
  resolveMemoryView,
  sameWriteIntent,
  surfaceMemory,
  surfaceMemoryV2,
  writeMemory,
  writeMemoryV2,
} from "./memory";
import { compactMemory, nodeMemoryCompactionDeps } from "./memory/memory-compaction";
import { fileMemoryDeps } from "./memory/memory-store";
import { buildAutonomousLoopRunReceipt } from "./orchestration/autonomous-loop-run-receipts";
import { selectVerifier } from "./orchestration/cross-verifier";
import { nodeTickDeps } from "./orchestration/loop-bridge";
import { canResume, tick } from "./orchestration/loop-runner";
import type { Provider as LoopProvider, LoopState } from "./orchestration/loop-state";
import { durableFileLoopStore } from "./orchestration/loop-store";
import {
  buildPairAgentAdapterPlans,
  buildPairAgentTddPlan,
  type PairAgentPhaseExecutor,
  type PairAgentRunResult,
  type PairAgentTddPlan,
  runPairAgentTddPlan,
} from "./orchestration/pair-agent";
import { lintPlanWithGateOptions } from "./plan/lint";
import {
  analyzeClosureAuthorityDrift,
  classifyClosureAuthorities,
  loadClosureAuthorityRegistry,
} from "./policy/closure-authority-registry";
import {
  type AdapterContextInjection,
  type AdapterProvider,
  adapterExecutionEnv,
  buildAdapterPlan,
  buildProviderInvocation,
  normalizeInvokeResult,
} from "./runtime/adapter";
import { DELEGATION_MEMORY_BUDGET } from "./runtime/adapter-policy";
import { buildAgentCatalogWatchReport } from "./runtime/agent-catalog-watch";
import {
  type AgentGuardInput,
  evaluateAgentGuard,
  normalizeModelFamily,
  type ResolvedFamily,
} from "./runtime/agent-guard";
import {
  type AgentLockRecord,
  buildAgentLockReport,
  buildAgentMessageDryRun,
} from "./runtime/agent-mailbox-conflict-locks";
import { buildAgentObservabilityProvenanceReport } from "./runtime/agent-observability-provenance";
import { buildAgentSessionBoardReport } from "./runtime/agent-session-command-center";
import {
  DEFAULT_MAX_PARALLEL,
  nodeAgentSlotsDeps,
  recordGuardFire,
  releaseOldestGuardSlot,
  sweepStaleGuardSlots,
} from "./runtime/agent-slots";
import {
  type AgentSsotProjectionItem,
  buildAgentSsotRuntimeProjectionReport,
} from "./runtime/agent-ssot-runtime-projection";
import {
  type ArtifactType,
  buildArtifactConvergenceReport,
} from "./runtime/artifact-convergence-analyzer";
import {
  attemptsFromSessionEvents,
  evaluateAttemptEscalation,
  renderEscalationSignals,
  selectPrecedingSessionFile,
} from "./runtime/attempt-escalation";
import {
  buildChangePackageDeltaArchiveReport,
  type ChangePackageStatus,
} from "./runtime/change-package-delta-archive";
import {
  buildConstitutionTemplateStackReport,
  type TemplateSourceKind,
} from "./runtime/constitution-template-stack";
import { writePlanCompletionContinuation } from "./runtime/continuation";
import {
  buildCrossRepoSpecStoreReport,
  type SpecStoreOperation,
} from "./runtime/cross-repo-spec-store";
import { detectMode, nextActionForMode, type RuntimeDetection } from "./runtime/detect";
import {
  type BundleCatalog,
  type BundleKind,
  buildExtensionPresetBundleRegistryReport,
} from "./runtime/extension-preset-bundle-registry";
import {
  type ClassifyResult,
  emitClassifyRequest,
  type FeedbackCtx,
  pendingRecoveryProposals,
  recordFeedback,
  scanDanglingStops,
} from "./runtime/forced-stop";
import { runGitCommandGuardHook } from "./runtime/git-command-guard-hook";
import {
  buildHarnessTaxonomyCurationReport,
  type HarnessTaxonomySource,
} from "./runtime/harness-taxonomy-curation-policy";
import {
  requireHostedSurfacePreflight,
  validateAdapterParityMap,
} from "./runtime/hosted-preflight";
import { buildIsolatedWorktreePlan } from "./runtime/isolated-worktree-sandbox-runner";
import { inspectLane } from "./runtime/lane-hygiene";
import {
  composeDelegationInjection,
  type MemoryInjectionSurface,
} from "./runtime/memory-injection";
import {
  buildCandidateCouncilReport,
  type CandidateVerifierInput,
} from "./runtime/parallel-candidate-verifier-council";
import {
  nodeProviderHandoverDeps,
  type ProviderRuntime,
  readProviderHandoverCurrent,
  runProviderHandover,
} from "./runtime/provider-handover";
import {
  buildReviewFeedbackSessionIntakeReport,
  type ReviewFeedbackEventInput,
  type ReviewFeedbackSessionRow,
} from "./runtime/review-feedback-session-intake";
import {
  assessReviewSession,
  isReadOnlyDelegationRole,
  reviewGuardMessages,
  summarizeStagedReview,
} from "./runtime/review-guard";
import {
  appendRuntimeVerificationLogEvent,
  DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
  type RuntimeClaim,
  type RuntimeEvidenceSource,
  type RuntimeSurface,
} from "./runtime/run-debug";
import {
  buildRuntimeCapabilityMatrixReport,
  isRuntimeCapability,
  type RuntimeCapability,
} from "./runtime/runtime-capability-matrix";
import {
  type ActivationKind,
  buildSecurityCredentialEgressGuardReport,
  type EgressPolicy,
} from "./runtime/security-credential-egress-guard";
import {
  activatePlan,
  clearActivePlan,
  dispatch,
  nodeDeps,
  parseSessionEvents,
  recordEventResult,
  resolveActivePlan,
  type SessionHookInput,
  safeName,
} from "./runtime/session-log";
import {
  buildSkillEfficacyEvaluationReport,
  type SkillEfficacyEvalInput,
} from "./runtime/skill-efficacy-evaluation";
import {
  buildSkillMemoryHygieneReport,
  loadSkillHygieneTelemetryFromDb,
} from "./runtime/skill-memory-hygiene";
import {
  buildSourceContentMirrorCompletenessReport,
  type SourceMirrorRepoRecord,
} from "./runtime/source-content-mirror-completeness";
import {
  buildStateMachineTemplatePlan,
  type ExecutionTriple,
} from "./runtime/state-machine-template-planner";
import {
  buildStateMachineToolPolicyReport,
  type EnforcementMode,
} from "./runtime/state-machine-tool-policy";
import {
  buildSummarySurfaceCommandAudit as buildSummarySurfaceCommandAuditFromPayloads,
  summaryJsonCommand,
  summaryJsonCommandOrNull,
} from "./runtime/summary-surface-audit";
import { buildToolAugmentationRegistryReport } from "./runtime/tool-augmentation-registry";
import {
  evaluateWorkGuardTargets,
  extractEditTargets,
  normalizeRepoRelative,
  resolveForeignEditOverride,
} from "./runtime/work-guard";
import { runWorkGuardHook } from "./runtime/work-guard-hook";
import { findReference } from "./search/index";
import {
  buildCleanDistributionPlan,
  buildConsumerReadinessPlan,
  buildPackSyncPlan,
  cleanDistributionSourcePath,
  gitAddPathspecCommands,
  LOCAL_DISTRIBUTION_PACKAGE_VERSION,
  nodeSetupDeps,
  packageJsonDeclaresHelixScript,
  packageJsonDeclaresScript,
  runHelixProjectSetup,
  runSetup,
  type SetupArgs,
  transformCleanDistributionArtifact,
} from "./setup/index";
import {
  checkForUpdate,
  nodeUpdateCheckDeps,
  renderUpdateLine,
  UPDATE_CHECK_DISABLE_ENV,
  updateCheckDisabled,
} from "./setup/update-check";
import { shellQuote } from "./shared/shell-quote";
import { scaffoldSkill } from "./skill-engine/scaffold";
import {
  bucketRecommendations,
  buildSkillInjectionSet,
  recommendSkillsForPlan,
  recommendSkillsForText,
  recordSkillRecommendations,
} from "./skills/recommend";
import {
  buildClosureAuthorityBackfillWindow,
  readCompletedClosureAuthorityBackfillWindow,
  recoverClosureAuthorityBackfill,
} from "./state-db/closure-authority-backfill";
import {
  buildCurrentClosureAuthorityBackfillRun,
  ClosureAuthorityBackfillInputError,
  loadCurrentClosureAuthorityBackfillInput,
} from "./state-db/closure-authority-backfill-production";
import {
  appendClosureTerminalBoundaryEvent,
  buildClosureConvergenceTargetSet,
  terminalBoundaryClassificationForAuthority,
} from "./state-db/closure-authority-convergence-epoch";
import {
  applyClosureAuthorityConvergenceWindow,
  createClosureAuthorityReviewDraft,
  loadClosureAuthorityProposal,
  loadClosureAuthorityReviewDraft,
  loadClosureAuthorityReviewReceipt,
  loadClosureAuthorityReviewTaskEvidence,
  persistClosureAuthorityProposal,
  recordClosureAuthorityReview,
} from "./state-db/closure-authority-convergence-production";
import {
  applyClosureAutoApprovalAtomic,
  type ClosureAutoApprovalEvaluation,
  type ClosureAutoApprovalManifest,
  canonicalClosureAuthorityDigest,
  closureAutoApprovalWindows,
  evaluateClosureAutoApproval,
  loadGithubRequiredCheckReceipt,
  parseClosureAutoApprovalManifest,
  parseClosureBatchInteger,
  recoverClosureAutoApprovalTransaction,
  refetchGithubRequiredCheckReceipt,
} from "./state-db/closure-auto-approval";
import { materializeClosureEvidence } from "./state-db/closure-evidence-materialization";
import {
  ClosureEvidenceRunner,
  type ClosureGateAllowlistEntry,
} from "./state-db/closure-evidence-runner";
import {
  buildProjectArtifactRemapBatchReport,
  buildProjectClosureApplyPlan,
  buildProjectClosureBatchReport,
  buildProjectClosureDecisionDraftPacket,
  buildProjectClosureEvidenceApplyPlan,
  buildProjectClosureEvidenceApprovalDraftPacket,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureEvidencePatchPacket,
  buildProjectClosureEvidencePlan,
  buildProjectClosureEvidenceProbePacket,
  buildProjectClosureOverview,
  buildProjectClosureReviewBundle,
  buildProjectClosureTransitionPlan,
  buildProjectCurrentLocationSnapshot,
  buildProjectDriveModelReport,
  buildProjectRecoveryPlan,
  buildProjectRoadmapCurrentReport,
  isProjectArtifactRemapStatus,
  isProjectClosureQueueNextAction,
  type ProjectArtifactRemapBatchReport,
  type ProjectClosureApplyPlan,
  type ProjectClosureBatchReport,
  type ProjectClosureDecisionDraftPacket,
  type ProjectClosureEvidenceApplyPlan,
  type ProjectClosureEvidenceApprovalDraftPacket,
  type ProjectClosureEvidenceMaterializePacket,
  type ProjectClosureEvidencePatchPacket,
  type ProjectClosureEvidencePlan,
  type ProjectClosureEvidenceProbePacket,
  type ProjectClosureOverview,
  type ProjectClosureReviewBundle,
  type ProjectClosureTransitionPlan,
  type ProjectCurrentLocationSnapshot,
  type ProjectDriveModelReport,
  type ProjectRecoveryPlan,
  type ProjectRoadmapCurrentReport,
} from "./state-db/current-location";
import { refreshPersistedDriveDbRegistrationStats } from "./state-db/drive-registration";
import { runHistoricalVpairMigrationDryRun } from "./state-db/historical-vpair-migration-authority";
import {
  defaultHarnessDbPath,
  type HarnessDb,
  openHarnessDb,
  openHarnessDbReadOnly,
} from "./state-db/index";
import { harnessDbStatus } from "./state-db/maintenance";
import { migrate } from "./state-db/migration";
import {
  projectFeedbackLifecycle,
  projectModelEvaluations,
  projectTokenUsage,
  rebuildHarnessDb,
} from "./state-db/projection-writer";
import { collectReverseCandidates } from "./state-db/reverse-candidates";
import { compactHarnessDb, databaseFreelist, gcTmp } from "./state-db/state-hygiene";
import { loadRuntimeSessionUsage, summarizeRunUsage } from "./state-db/token-tracker";
import { buildVisualizationSnapshot } from "./state-db/visualization-read-model";
import { buildVisualizationViewModel } from "./state-db/visualization-view-model";
import { buildVmodelFitReport, type VmodelFitReport } from "./state-db/vmodel-fit";
import { classifyProposalDocumentCoverage, classifyTask } from "./task/classify";
import {
  type Provider,
  type RouterRole,
  roster,
  route,
  routeTeamMembers,
  routeToAdapterPlan,
} from "./task/tier-router";
import { recommendTeamLaunch } from "./team/launch-policy";
import { MODEL_IDS, TASK_DIFFICULTIES, type TaskDifficulty } from "./team/model-policy";
import {
  buildTeamRunPlan,
  executeTeamRunPlan,
  loadTeamDefinition,
  type MemberPlacement,
} from "./team/run";
import { formatVmodelInjection, resolveVmodelInjection } from "./vmodel/injection";
import { lintVmodel } from "./vmodel/lint";
import { analyzeVmodelZipManifest } from "./vmodel/zip-manifest";
import { helixVscodePackageManifest } from "./vscode/extension-manifest";
import { buildVisualizationTreeView } from "./vscode/tree-view-provider";
import { buildCommandCatalog } from "./workflow/contracts";
import { evaluateAutomationReadiness } from "./workflow/readiness";

const HOOK_EVENT_SESSION_START = "SessionStart";
const SAVE_EVIDENCE_OPTION_DESCRIPTION = "persist normalized evidence for DB collector";
const SESSION_OPTION_DESCRIPTION = "session_id (defaults to stdin session_id or helix-cli)";
const MODE_OVERRIDE_OPTION_DESCRIPTION = "override execution mode for tests";
const TASK_FILE_OPTION_DESCRIPTION = "read task text from file";
const TEXT_REPAIR_TARGET_LIMIT = 3;
const TEXT_REPAIR_TARGET_ID_LIMIT = 40;
const CLOSURE_SUMMARY_SAMPLE_LIMIT = 5;

function truncateCliText(value: string, limit: number): string {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3))}...`;
}

function formatRepairTargetsText(targets: Array<{ component: string; id: string }>): string {
  if (targets.length === 0) return "-";
  const sample = targets
    .slice(0, TEXT_REPAIR_TARGET_LIMIT)
    .map(
      (target) => `${target.component}:${truncateCliText(target.id, TEXT_REPAIR_TARGET_ID_LIMIT)}`,
    );
  const omitted = targets.length - sample.length;
  return omitted > 0 ? `${sample.join(",")} (+${omitted} omitted)` : sample.join(",");
}

const CLOSURE_EVIDENCE_PROBE_EXCERPT_LIMIT = 4_000;

function buildClosureEvidenceProbeOutputExcerpt(stdout: string, stderr: string) {
  const limit = CLOSURE_EVIDENCE_PROBE_EXCERPT_LIMIT;
  return {
    stdout_head: stdout.slice(0, limit),
    stdout_tail: stdout.length > limit ? stdout.slice(-limit) : stdout,
    stderr_head: stderr.slice(0, limit),
    stderr_tail: stderr.length > limit ? stderr.slice(-limit) : stderr,
    truncated: stdout.length > limit || stderr.length > limit,
    limit,
  };
}

function runClosureEvidenceProbeCommand(repoRoot: string, command: string) {
  const parts = command
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  const startedAt = new Date().toISOString();
  if (parts.length === 0) {
    const completedAt = new Date().toISOString();
    const provenanceSeed = `command=${command}\nstarted_at=${startedAt}\ncompleted_at=${completedAt}`;
    const provenanceDigest = createHash("sha256").update(provenanceSeed).digest("hex");
    return {
      command,
      session_id: `closure-probe:${provenanceDigest.slice(0, 16)}`,
      correlation_id: `closure-correlation:${provenanceDigest.slice(16, 32)}`,
      started_at: startedAt,
      completed_at: completedAt,
      exit_code: null,
      status: "error" as const,
      output_digest: `sha256:${createHash("sha256").update("").digest("hex")}`,
      stdout_bytes: 0,
      stderr_bytes: 0,
      output_excerpt: buildClosureEvidenceProbeOutputExcerpt("", ""),
      error_message: "empty command",
    };
  }
  const result = spawnSync(parts[0], parts.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const completedAt = new Date().toISOString();
  const stdout = typeof result.stdout === "string" ? result.stdout : "";
  const stderr = typeof result.stderr === "string" ? result.stderr : "";
  const digestPayload = [
    `command=${command}`,
    `exit_code=${result.status ?? "null"}`,
    "--- stdout ---",
    stdout,
    "--- stderr ---",
    stderr,
  ].join("\n");
  const status: "passed" | "failed" | "error" = result.error
    ? "error"
    : result.status === 0
      ? "passed"
      : "failed";
  const outputDigest = `sha256:${createHash("sha256").update(digestPayload).digest("hex")}`;
  const provenanceSeed = [
    `command=${command}`,
    `started_at=${startedAt}`,
    `completed_at=${completedAt}`,
    `output_digest=${outputDigest}`,
  ].join("\n");
  const provenanceDigest = createHash("sha256").update(provenanceSeed).digest("hex");
  return {
    command,
    session_id: `closure-probe:${provenanceDigest.slice(0, 16)}`,
    correlation_id: `closure-correlation:${provenanceDigest.slice(16, 32)}`,
    started_at: startedAt,
    completed_at: completedAt,
    exit_code: result.status,
    status,
    output_digest: outputDigest,
    stdout_bytes: Buffer.byteLength(stdout),
    stderr_bytes: Buffer.byteLength(stderr),
    output_excerpt: buildClosureEvidenceProbeOutputExcerpt(stdout, stderr),
    error_message: result.error?.message ?? null,
  };
}

function readClosureEvidenceProbeExecution(path: string | undefined) {
  if (!path) return null;
  const payload = JSON.parse(readFileSync(path, "utf8")) as {
    execution?: unknown;
  };
  const execution = payload.execution as
    | {
        command?: unknown;
        started_at?: unknown;
        completed_at?: unknown;
        session_id?: unknown;
        correlation_id?: unknown;
        exit_code?: unknown;
        status?: unknown;
        output_digest?: unknown;
        stdout_bytes?: unknown;
        stderr_bytes?: unknown;
        output_excerpt?: unknown;
        error_message?: unknown;
      }
    | null
    | undefined;
  if (!execution) return null;
  if (
    typeof execution.command !== "string" ||
    typeof execution.started_at !== "string" ||
    typeof execution.completed_at !== "string" ||
    !(execution.session_id === undefined || typeof execution.session_id === "string") ||
    !(execution.correlation_id === undefined || typeof execution.correlation_id === "string") ||
    !(typeof execution.exit_code === "number" || execution.exit_code === null) ||
    !(
      execution.status === "passed" ||
      execution.status === "failed" ||
      execution.status === "error"
    ) ||
    typeof execution.output_digest !== "string" ||
    typeof execution.stdout_bytes !== "number" ||
    typeof execution.stderr_bytes !== "number" ||
    !(typeof execution.error_message === "string" || execution.error_message === null)
  ) {
    throw new Error("invalid probe record execution");
  }
  const excerpt = execution.output_excerpt as
    | {
        stdout_head?: unknown;
        stdout_tail?: unknown;
        stderr_head?: unknown;
        stderr_tail?: unknown;
        truncated?: unknown;
        limit?: unknown;
      }
    | undefined;
  if (
    excerpt !== undefined &&
    !(
      typeof excerpt.stdout_head === "string" &&
      typeof excerpt.stdout_tail === "string" &&
      typeof excerpt.stderr_head === "string" &&
      typeof excerpt.stderr_tail === "string" &&
      typeof excerpt.truncated === "boolean" &&
      typeof excerpt.limit === "number"
    )
  ) {
    throw new Error("invalid probe record execution");
  }
  const outputExcerpt =
    excerpt === undefined
      ? undefined
      : {
          stdout_head: excerpt.stdout_head as string,
          stdout_tail: excerpt.stdout_tail as string,
          stderr_head: excerpt.stderr_head as string,
          stderr_tail: excerpt.stderr_tail as string,
          truncated: excerpt.truncated as boolean,
          limit: excerpt.limit as number,
        };
  const status: "passed" | "failed" | "error" = execution.status;
  return {
    command: execution.command,
    ...(execution.session_id ? { session_id: execution.session_id } : {}),
    ...(execution.correlation_id ? { correlation_id: execution.correlation_id } : {}),
    started_at: execution.started_at,
    completed_at: execution.completed_at,
    exit_code: execution.exit_code,
    status,
    output_digest: execution.output_digest,
    stdout_bytes: execution.stdout_bytes,
    stderr_bytes: execution.stderr_bytes,
    ...(outputExcerpt ? { output_excerpt: outputExcerpt } : {}),
    error_message: execution.error_message,
  };
}

function gitBranch(): string | null {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function gitHead(): string | null {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** review-guard 用: loadChangedFiles を fail-open でラップ (非 git / 一時失敗で委譲を壊さない、IMP-137)。 */
function safeLoadChangedFiles(repoRoot: string): string[] {
  try {
    return loadChangedFiles(repoRoot);
  } catch {
    // guard probe は best-effort。git が無い/失敗しても委譲本体は止めない (fail-open)。
    return [];
  }
}

function collectDistributionCandidatePaths(repoRoot: string): string[] {
  const ignored = new Set([".git", "node_modules", "dist"]);
  const out: string[] = [];
  const walk = (dir: string, prefix = ""): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else {
        out.push(rel);
      }
    }
  };
  walk(repoRoot);
  return out.sort();
}

function copyCleanDistributionArtifact(input: {
  sourceRoot: string;
  sourcePath: string;
  targetRoot: string;
  artifactPath: string;
}): void {
  const from = join(input.sourceRoot, ...input.sourcePath.split("/"));
  const to = join(input.targetRoot, ...input.artifactPath.split("/"));
  mkdirSync(dirname(to), { recursive: true });
  if (input.artifactPath === "package.json") {
    writeFileSync(
      to,
      transformCleanDistributionArtifact(input.artifactPath, readFileSync(from, "utf8")),
      "utf8",
    );
    return;
  }
  cpSync(from, to, { recursive: true });
}

function optionFromCommandChain<T>(cmd: Command, key: string): T | undefined {
  let current: Command | null = cmd;
  while (current) {
    const value = (current.opts() as Record<string, unknown>)[key];
    if (value !== undefined) return value as T;
    current = current.parent ?? null;
  }
  return undefined;
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function loadBranchKindInputForGuard(opts: {
  branch?: string;
  changed?: string[];
  strictUnknownPrefix?: boolean;
}): BranchKindInput {
  const repoRoot = process.cwd();
  const base = loadBranchKindInput(repoRoot);
  const changedPaths = opts.changed && opts.changed.length > 0 ? opts.changed : base.changedPaths;
  const planPaths = changedPaths
    .map((path) => path.replace(/\\/g, "/"))
    .filter((path) => /^docs\/plans\/PLAN-.+\.md$/.test(path));
  const plans: BranchPlanDoc[] = planPaths
    .map((path) => {
      try {
        return loadPlanDoc(repoRoot, path);
      } catch {
        return { file: path };
      }
    })
    .filter((plan): plan is BranchPlanDoc => plan != null);
  return {
    branch: opts.branch ?? base.branch,
    changedPaths,
    plans: opts.changed && opts.changed.length > 0 ? plans : base.plans,
    strictUnknownPrefix: opts.strictUnknownPrefix,
  };
}

function gitCommitSubjectsForRange(range: string): string[] {
  return execFileSync("git", ["log", "--format=%s", range], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveTaskText(opts: { task?: string; taskFile?: string }): string | null {
  if (opts.task && opts.taskFile) return null;
  if (opts.taskFile) {
    try {
      return readFileSync(opts.taskFile, "utf8");
    } catch {
      return null;
    }
  }
  return opts.task ?? null;
}

function resolveSkillContextInjection(
  planId: string | undefined,
  surface: MemoryInjectionSurface,
): AdapterContextInjection | undefined {
  // memory recall の載る面は composeDelegationInjection の surface policy が機械固定する
  // (L6-64 §4 段階導入: delegation のみ。team_run / task_route は follow-up)。
  // read は fail-soft (memory 不在 = 空)。
  return composeDelegationInjection({
    skills: resolveSkillInjectionPaths(planId),
    memoryLines: surfaceMemory(fileMemoryDeps({ root: process.cwd() }), DELEGATION_MEMORY_BUDGET),
    surface,
  });
}

function resolveSkillInjectionPaths(planId: string | undefined): {
  required_paths: string[];
  optional_paths: string[];
} {
  if (!planId) return { required_paths: [], optional_paths: [] };
  const repoRoot = process.cwd();
  const { db } = openSkillSuggestDb(repoRoot, false);
  try {
    const recommendations = recommendSkillsForPlan(db, planId);
    const injection = buildSkillInjectionSet(db, recommendations);
    return {
      required_paths: injection.required_paths,
      optional_paths: injection.optional_paths,
    };
  } finally {
    db.close();
  }
}

function openSkillSuggestDb(
  repoRoot: string,
  record: boolean,
): { db: ReturnType<typeof openHarnessDb> } {
  if (record) {
    const db = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
    rebuildHarnessDb({ repoRoot, db });
    return { db };
  }
  const dbPath = defaultHarnessDbPath(repoRoot);
  if (existsSync(dbPath)) {
    return { db: openHarnessDb(dbPath, { repoRoot }) };
  }
  const db = openHarnessDb(":memory:", { repoRoot });
  rebuildHarnessDb({ repoRoot, db });
  return { db };
}

function planIdFromPath(path: string | undefined): string | undefined {
  if (!path) return undefined;
  try {
    const raw = readFileSync(path, "utf8");
    return raw.match(/^plan_id:\s*([^\r\n]+)/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

function readHookInput(defaultEvent: string, sessionId?: string): SessionHookInput {
  const raw = process.stdin.isTTY ? "" : readStdin();
  const normalized = raw.replace(/^\uFEFF/, "").trim();
  let parsed: SessionHookInput = {};
  if (normalized) {
    try {
      parsed = JSON.parse(normalized) as SessionHookInput;
    } catch {
      parsed = {};
    }
  }
  return {
    ...parsed,
    hook_event_name: parsed.hook_event_name ?? defaultEvent,
    session_id: sessionId ?? parsed.session_id ?? "helix-cli",
  };
}

function readStrictHookInput(): AgentGuardInput | null {
  const raw = process.stdin.isTTY ? "" : readStdin();
  const normalized = raw.replace(/^\uFEFF/, "").trim();
  if (!normalized) return null;
  try {
    return JSON.parse(normalized) as AgentGuardInput;
  } catch {
    return null;
  }
}

function resolveAgentFamilyFromRepo(repoRoot: string, subagentType: string): ResolvedFamily {
  const md = join(repoRoot, ".claude", "agents", `${subagentType}.md`);
  if (!existsSync(md)) return "missing";
  const content = readFileSync(md, "utf8");
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return "unknown";
  const modelLine = fm[1].match(/^model:[ \t]*(\S+)/m);
  return normalizeModelFamily(modelLine?.[1]?.trim()) ?? "unknown";
}

function sessionTouchedFilesForGuard(repoRoot: string, sessionId: string | undefined): string[] {
  if (!sessionId) return [];
  const safe = sessionId.replace(/[\\/]+/g, "_");
  const file = join(repoRoot, ".helix", "logs", "session", `${safe}.jsonl`);
  if (!existsSync(file)) return [];
  const touched: string[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const ev = JSON.parse(line) as { target?: string };
      if (ev.target) touched.push(normalizeRepoRelative(ev.target, repoRoot));
    } catch {
      // Ignore malformed session-log rows; preflight should keep checking other rows.
    }
  }
  return touched;
}

function guardTargetsFromPatchText(patchText: string, repoRoot: string): string[] {
  return extractEditTargets({ input: patchText }).map((target) =>
    normalizeRepoRelative(target, repoRoot),
  );
}

function runSessionStartSideEffects(
  repoRoot: string,
  input: SessionHookInput,
  deps: ReturnType<typeof nodeDeps>,
): void {
  try {
    scanDanglingStops(deps, input.session_id);
    sweepStaleGuardSlots(nodeAgentSlotsDeps(repoRoot));
  } catch {
    // fail-open: lifecycle maintenance must not block the runtime.
  }
  surfaceTakeoverFeedbackToStdout(repoRoot, input.session_id);
  surfaceAttemptEscalationToStdout(repoRoot, input.session_id);
}

/**
 * 引き継ぎ (SessionStart) 時に **直前 session** の連続失敗ループ (Iron Law escalation) を surface
 * する (PLAN-RECOVERY-05 item 2、Q2=b)。harness.db には書かず、直前 session の jsonl ログを都度
 * 再導出する (core rebuild の入力境界を広げない)。現セッションを除いた最新 1 ファイルのみを読むため
 * 古い失敗は再浮上しない。独立した fail-open: ログ不在 / 破損で runtime を止めない。
 */
function surfaceAttemptEscalationToStdout(repoRoot: string, currentSessionId?: string): void {
  try {
    const dir = join(repoRoot, ".helix", "logs", "session");
    if (!existsSync(dir)) return;
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".jsonl"))
      .map((name) => ({ name, mtimeMs: statSync(join(dir, name)).mtimeMs }));
    const currentName = currentSessionId ? `${safeName(currentSessionId)}.jsonl` : undefined;
    const preceding = selectPrecedingSessionFile(files, currentName);
    if (!preceding) return;
    const events = parseSessionEvents(readFileSync(join(dir, preceding), "utf8"));
    const signals = evaluateAttemptEscalation(attemptsFromSessionEvents(events));
    const block = renderEscalationSignals(signals);
    if (block) process.stdout.write(block);
  } catch {
    // fail-open: escalation surface は best-effort。
  }
}

/**
 * 引き継ぎ (SessionStart) 時に harness.db の open feedback をエージェントへ surface する
 * (PLAN-L7-110)。stale な prose handover や、共有 working tree の都度計測ではなく、DB を
 * 正本として feedback を「受け取る」経路。独立した fail-open: Codex の並行 db rebuild と競合して
 * ロックされても、引き継ぎ維持処理 (上) も runtime も阻害しない。
 */
function maintainFeedbackLifecycle(repoRoot: string, db: HarnessDb, sessionId?: string): void {
  migrate(db);
  const sources = loadFeedbackLifecycleSources(db);
  const now = new Date().toISOString();
  const lifecycleDeps = nodeFeedbackLifecycleDeps(repoRoot, () => now);
  const sessionRef = createHash("sha256")
    .update(`${sessionId ?? "unknown"}:${JSON.stringify(sources)}`)
    .digest("hex");
  const reconciled = reconcileFeedbackLifecycle(
    {
      sources,
      mode: "full",
      completeTables: ["findings", "quality_signals", "feedback_events"],
      operationId: `session-reconcile:${sessionRef}`,
    },
    lifecycleDeps,
  );
  if (reconciled.ok) {
    autoAckTelemetry(
      {
        operationId: `ttl:${createHash("sha256")
          .update(`${now}:${JSON.stringify(sources)}`)
          .digest("hex")}`,
        now,
      },
      lifecycleDeps,
    );
  }
  projectFeedbackLifecycle(repoRoot, db);
}

function surfaceTakeoverFeedbackToStdout(repoRoot: string, sessionId?: string): void {
  try {
    const db = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
    try {
      maintainFeedbackLifecycle(repoRoot, db, sessionId);
      const receiptSession = createHash("sha256")
        .update(sessionId ?? "unknown")
        .digest("hex")
        .slice(0, 24);
      const result = selectTakeoverFeedback(db, { sessionId: receiptSession });
      const block = renderTakeoverFeedback(result);
      if (block) {
        process.stdout.write(block);
        const lifecycleDeps = nodeFeedbackLifecycleDeps(repoRoot);
        for (const ref of result.items.flatMap((item) => item.surface_source_refs ?? [])) {
          const separator = ref.indexOf(":");
          const generationAt = ref.lastIndexOf("@");
          if (separator <= 0 || generationAt <= separator) continue;
          const sourceTable = ref.slice(0, separator);
          if (
            !(["findings", "quality_signals", "feedback_events"] as string[]).includes(sourceTable)
          )
            continue;
          const sourceId = ref.slice(separator + 1, generationAt);
          const sourceGeneration = ref.slice(generationAt + 1);
          recordFeedbackSurface(
            {
              sourceTable: sourceTable as "findings" | "quality_signals" | "feedback_events",
              sourceId,
              sourceGeneration,
              operationId: `surface:${createHash("sha256")
                .update(`${receiptSession}:${ref}`)
                .digest("hex")}`,
              sessionId: receiptSession,
            },
            lifecycleDeps,
          );
        }
        projectFeedbackLifecycle(repoRoot, db);
      }
    } finally {
      db.close();
    }
  } catch {
    // fail-open: feedback surface は best-effort。DB 不在 / ロック / 破損で runtime を止めない。
  }
}

function parseMemoryLayer(layer: string): MemoryLayer | null {
  if (layer === "harness" || layer === "project") return layer;
  process.stderr.write(`invalid memory layer: ${layer} (expected harness|project)\n`);
  process.exitCode = 1;
  return null;
}

function parseLoopProvider(provider: string): LoopProvider | null {
  if (provider === "claude" || provider === "codex") return provider;
  return null;
}

function loopStoreForRoot(root: string) {
  return durableFileLoopStore({
    root,
    readLegacyText: (path: string) => {
      if (!existsSync(path)) return null;
      return readFileSync(path, "utf8");
    },
  });
}

function safeEvidenceFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
}

function parseTaskDifficulty(value: string | undefined): TaskDifficulty | undefined {
  if (value == null) return undefined;
  return TASK_DIFFICULTIES.includes(value as TaskDifficulty)
    ? (value as TaskDifficulty)
    : undefined;
}

function parsePositiveIntegerOption(value: string | undefined): number | undefined | null {
  if (value == null) return undefined;
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}

function sha256Text(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function pairAgentTranscriptDigest(result: PairAgentRunResult): string {
  return sha256Text(
    result.transcript
      .map((entry) =>
        [entry.phase, entry.cycle, entry.status, entry.verdict ?? "null", entry.outputExcerpt].join(
          "\n",
        ),
      )
      .join("\n---\n"),
  );
}

function pairAgentLoopSummary(result: PairAgentRunResult): Record<string, number | string> {
  const lightCycles = new Set(
    result.steps
      .filter((step) => step.phase === "light_implementation" && step.cycle > 0)
      .map((step) => step.cycle),
  );
  const consultationCount = result.steps.filter(
    (step) => step.phase === "light_implementation" && step.status === "pending",
  ).length;
  return {
    phase_count: result.steps.length,
    smart_test_author_count: result.steps.filter((step) => step.phase === "smart_test_author")
      .length,
    light_implementation_count: result.steps.filter((step) => step.phase === "light_implementation")
      .length,
    smart_review_count: result.steps.filter((step) => step.phase === "smart_review").length,
    consultation_count: consultationCount,
    pending_consultation_count: consultationCount,
    failed_review_count: result.steps.filter(
      (step) => step.phase === "smart_review" && step.verdict === "fail",
    ).length,
    fix_cycle_count: Math.max(0, lightCycles.size - 1),
    transcript_digest: pairAgentTranscriptDigest(result),
  };
}

function savePairAgentPlanEvidence(input: {
  plan: PairAgentTddPlan;
  adapterPlans: unknown[];
  mode: string;
  execute: boolean;
  recordedAt: string;
}): string {
  const stamp = input.recordedAt.replace(/[^0-9]/g, "").slice(0, 14);
  const safePlanId = safeEvidenceFileName(input.plan.planId);
  const spanId = `pair-agent-plan:${safePlanId}:${stamp}`;
  const agents = new Map(input.plan.agents.map((agent) => [agent.key, agent]));
  const rel = join(".helix", "evidence", "pair-agent", `${stamp}-${safePlanId}-plan.json`);
  const abs = join(process.cwd(), rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(
    abs,
    `${JSON.stringify(
      {
        schema_version: "pair-agent-plan-evidence.v1",
        recorded_at: input.recordedAt,
        plan_id: input.plan.planId,
        mode: input.mode,
        execute: input.execute,
        trace: {
          plan_id: input.plan.planId,
          span_id: spanId,
          tool_contract_id: "HC-P2.buildPairAgentTddPlan",
          guardrail_decision: {
            guardrail: "frontier-approval",
            decision: input.execute && !input.plan.executionAuthorized ? "block" : "allow",
            human_signoff_required: input.execute && input.plan.frontierApprovalRequired,
          },
          eval_outcome: {
            ok: input.plan.ok,
            status: input.plan.ok ? "planned" : "blocked",
          },
          adapter_plans_digest: sha256Text(JSON.stringify(input.adapterPlans)),
          phase_spans: input.plan.phases.map((phase) => {
            const agent = agents.get(phase.agentKey);
            return {
              span_id: `${spanId}:phase:${phase.index}`,
              parent_span_id: spanId,
              phase: phase.name,
              agent_key: phase.agentKey,
              provider: agent?.provider ?? null,
              model: agent?.model ?? null,
              required_evidence: phase.requiredEvidence,
              prompt_digest: sha256Text(phase.prompt),
              handoff_target: phase.onFail,
              eval_outcome: {
                status: input.plan.ok ? "planned" : "blocked",
                verdict: null,
                exit_code: null,
              },
            };
          }),
        },
        plan: input.plan,
        adapterPlans: input.adapterPlans,
      },
      null,
      2,
    )}\n`,
  );
  return rel.replaceAll("\\", "/");
}

function savePairAgentRunEvidence(input: {
  plan: PairAgentTddPlan;
  result: PairAgentRunResult;
  mode: string;
  execute: boolean;
  startedAt: string;
  completedAt: string;
}): string {
  const recordedAt = input.completedAt;
  const stamp = recordedAt.replace(/[^0-9]/g, "").slice(0, 14);
  const safePlanId = safeEvidenceFileName(input.plan.planId);
  const runId = `pair-agent:${safePlanId}:${stamp}`;
  const durationMs = Math.max(
    0,
    new Date(input.completedAt).getTime() - new Date(input.startedAt).getTime(),
  );
  const phases = new Map(input.plan.phases.map((phase) => [phase.name, phase]));
  const rel = join(".helix", "evidence", "pair-agent", `${stamp}-${safePlanId}.json`);
  const abs = join(process.cwd(), rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(
    abs,
    `${JSON.stringify(
      {
        schema_version: "pair-agent-run-evidence.v1",
        recorded_at: recordedAt,
        run_id: runId,
        mode: input.mode,
        execute: input.execute,
        trace: {
          plan_id: input.plan.planId,
          span_id: `${runId}:run`,
          tool_contract_id: "HC-P2.runPairAgentTddPlan",
          handoff_target:
            input.result.finalVerdict === "fail" ? "light_implementation" : "orchestrator",
          guardrail_decision: {
            guardrail: "frontier-approval",
            decision: input.execute && !input.plan.executionAuthorized ? "block" : "allow",
            human_signoff_required: input.execute && input.plan.frontierApprovalRequired,
          },
          eval_outcome: {
            ok: input.result.ok,
            status: input.result.status,
            final_verdict: input.result.finalVerdict,
          },
          loop_summary: pairAgentLoopSummary(input.result),
          started_at: input.startedAt,
          completed_at: input.completedAt,
          duration_ms: durationMs,
          cost_usd: null,
          phase_spans: input.result.steps.map((step, index) => {
            const phase = phases.get(step.phase);
            const transcriptEntry = input.result.transcript[index];
            return {
              span_id: `${runId}:phase:${index + 1}`,
              parent_span_id: `${runId}:run`,
              phase: step.phase,
              cycle: step.cycle,
              agent_key: step.agentKey,
              provider: step.provider,
              model: step.model,
              required_evidence: phase?.requiredEvidence ?? [],
              output_excerpt_digest: sha256Text(transcriptEntry?.outputExcerpt ?? ""),
              handoff_target:
                step.phase === "smart_review" && step.verdict === "fail"
                  ? "light_implementation"
                  : (phase?.onFail ?? null),
              eval_outcome: {
                status: step.status,
                verdict: step.verdict,
                exit_code: step.exitCode,
              },
            };
          }),
        },
        plan: input.plan,
        result: input.result,
      },
      null,
      2,
    )}\n`,
  );
  return rel.replaceAll("\\", "/");
}

function defaultPairAgentExecutor(): PairAgentPhaseExecutor {
  return async ({ agent, adapterPlan }) => {
    const invocation = buildProviderInvocation({
      provider: agent.provider,
      command: adapterPlan.command,
      args: adapterPlan.args,
    });
    const child = spawnSync(invocation.command, invocation.args, {
      encoding: "utf8",
      input: adapterPlan.stdin,
      env: adapterExecutionEnv(agent.provider, adapterPlan.env),
      shell: invocation.shell ?? false,
      windowsVerbatimArguments: invocation.windowsVerbatimArguments ?? false,
    });
    const normalized = normalizeInvokeResult(adapterPlan, {
      status: child.error ? 1 : (child.status ?? null),
      stdout: child.stdout ?? "",
      stderr: child.stderr ?? "",
      error: child.error,
    });
    return {
      status: normalized.status,
      stdout: normalized.output,
      stderr: normalized.error ?? normalized.stderr,
      errorClass: normalized.error_class,
    };
  };
}

function failPlanNotMatched(command: string, planId: string, json = false): void {
  process.exitCode = 1;
  const payload = { ok: false, reason: "plan_not_matched", command, planId };
  if (json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }
  process.stderr.write(`${command}: plan_not_matched plan=${planId}\n`);
}

function packetSummaryText(summary: {
  command: string;
  runnableCommand?: string;
  scopedCommand?: string;
  runnableScopedCommand?: string;
  schemaVersion: string;
  matrixField: string;
  expectedMatrixCount: number;
  requiredReviewFields: string[];
  requiredMatrixFields: string[];
  reviewRoute: string;
  reviewRouteJa?: string;
}): string {
  const reviewFields = summary.requiredReviewFields.join(",");
  const matrixFields = summary.requiredMatrixFields.join(",") || "none";
  const runnable = summary.runnableCommand ?? summary.command;
  const scoped = summary.scopedCommand ?? summary.command;
  const runnableScoped = summary.runnableScopedCommand ?? runnable;
  return `${summary.command} runnable=${runnable} scoped=${scoped} runnable-scoped=${runnableScoped} schema=${summary.schemaVersion} matrix=${summary.matrixField} count=${summary.expectedMatrixCount} reviewFields=${reviewFields} matrixFields=${matrixFields} review=${summary.reviewRouteJa ?? summary.reviewRoute} review-id=${summary.reviewRoute}`;
}

function semanticMeaningSummaryLine(
  outstanding: ReturnType<typeof computeOutstandingWork>,
): string {
  return [
    `semantic_frontier_records: ${outstanding.semanticFeatureFrontierRecords?.length ?? 0}`,
    `confirmed_current_meaning_records: ${outstanding.confirmedCurrentMeaningRecords?.length ?? 0}`,
  ].join("\n");
}

const program = new Command();
program
  .name("helix")
  .description("HELIX-HARNESS (TypeScript core, ADR-001)")
  .version(LOCAL_DISTRIBUTION_PACKAGE_VERSION);
program.hook("preAction", () => {
  recoverClosureAutoApprovalTransaction(process.cwd());
});

program
  .command("status")
  .description("実行モード検出 (standalone / claude-only / codex-only / hybrid)")
  .option("--json", "JSON で出力")
  .action((opts: { json?: boolean }) => {
    const d = detectMode();
    const nextAction = nextActionForMode(d.mode);
    const runtimeNextAction = nextAction;
    const judgmentReview = judgmentReviewPlanForMode(d.mode);
    // IMP-139: 未了の正の集計 (非終端 PLAN 層別 + open defer) を additive に surface し
    // 「doctor green = 完了」誤読を機械照合可能にする (gate ではない informational surface)。
    const outstanding = computeOutstandingWork(process.cwd());
    const workflowNextAction = workflowNextActionForOutstanding(outstanding);
    const completionNextAction = workflowNextAction;
    const workflowNextActions = workflowNextActionsForOutstanding(outstanding);
    const update =
      process.env[UPDATE_CHECK_DISABLE_ENV] === "1" || process.env.VITEST_WORKER_ID
        ? updateCheckDisabled(
            process.env.VITEST_WORKER_ID ? "VITEST_WORKER_ID" : UPDATE_CHECK_DISABLE_ENV,
          )
        : checkForUpdate(nodeUpdateCheckDeps());
    const completionDecisionPacket = completionDecisionPacketForOutstanding(outstanding, {
      sourceCommand: "helix status --json",
    });
    const completionReviewBundle = completionReviewBundleForOutstanding(outstanding);
    const objectiveProgress = loadObjectiveProgress(process.cwd(), outstanding);
    if (opts.json) {
      // 既存 6 フィールド (camelCase 公開契約) に nextAction + outstanding を additive に付加する
      // (A-138 ITEM-1、PLAN-L7-84、IMP-139、taxonomy=current)。判断ゲートの進め方 + 未了量を提示。
      process.stdout.write(
        `${JSON.stringify({ ...d, nextAction, runtimeNextAction, completionNextAction, judgmentReview, workflowNextAction, workflowNextActions, outstanding, completionDecisionPacket, completionReviewBundle, update, ...(objectiveProgress ? { objectiveProgress } : {}) }, null, 2)}\n`,
      );
    } else {
      process.stdout.write(
        `mode: ${d.mode}  (claude=${d.claude}, codex=${d.codex}, current=${d.currentRuntime ?? "-"})\n`,
      );
      process.stdout.write(`runtime-next: ${runtimeNextAction}\n`);
      process.stdout.write(`completion-next: ${completionNextAction}\n`);
      process.stdout.write(`judgment-review: ${judgmentReview.requiredAction}\n`);
      for (const [index, evidence] of judgmentReview.requiredEvidence.entries()) {
        process.stdout.write(
          `judgment-review-evidence: ${index + 1} evidence=${judgmentReview.requiredEvidenceJa[index] ?? evidence} evidence-id=${evidence}\n`,
        );
      }
      process.stdout.write(`workflow-next: ${workflowNextAction}\n`);
      if (workflowNextActions.length > 0) {
        process.stdout.write(`workflow-next-actions: ${workflowNextActions.length}\n`);
        for (const item of workflowNextActions) {
          process.stdout.write(
            `workflow-next-action: ${item.order} ${item.planId} reason=${item.reason} action=${item.requiredActionJa} action-id=${item.requiredAction} route=${item.nextWorkflowRouteJa} route-id=${item.nextWorkflowRoute} packet=${item.decisionPacketCommand} scoped=${item.scopedDecisionPacketCommand} supporting=${item.packetCommands.join(" | ")} scoped-supporting=${item.scopedPacketCommands.join(" | ")}\n`,
          );
          process.stdout.write(
            `runnable-workflow-next-action: ${item.order} ${item.planId} packet=${item.runnableDecisionPacketCommand} scoped=${item.runnableScopedDecisionPacketCommand} supporting=${item.runnablePacketCommands.join(" | ")} scoped-supporting=${item.runnableScopedPacketCommands.join(" | ")}\n`,
          );
          for (const [index, evidence] of item.requiredEvidence.entries()) {
            process.stdout.write(
              `workflow-required-evidence: ${item.order}.${index + 1} ${item.planId} evidence=${item.requiredEvidenceJa[index] ?? evidence} evidence-id=${evidence}\n`,
            );
          }
          for (const summary of item.supportingPacketSummaries) {
            process.stdout.write(`packet-summary: ${item.order} ${packetSummaryText(summary)}\n`);
          }
        }
      }
      process.stdout.write(`${outstandingSummaryLine(outstanding)}\n`);
      process.stdout.write(`${completionReadinessLine(outstanding)}\n`);
      process.stdout.write(`${semanticMeaningSummaryLine(outstanding)}\n`);
      process.stdout.write(`${renderUpdateLine(update)}\n`);
      if (objectiveProgress) {
        process.stdout.write(
          `objective-progress: ${objectiveProgress.percent}% (${objectiveProgress.completionStatus}; completion-claim-allowed=${objectiveProgress.completionClaimAllowed}; evidence=${objectiveProgress.progressEvidenceTrusted ? "trusted" : "invalid"}; audit-ok=${objectiveProgress.auditOk}; violations=${objectiveProgress.auditViolationCount})\n`,
        );
        if (!objectiveProgress.progressEvidenceTrusted) {
          process.stdout.write(
            `objective-progress-evidence: invalid audit-ok=${objectiveProgress.auditOk} violations=${objectiveProgress.auditViolationCount} reason=${objectiveProgress.evidenceTrustReason}\n`,
          );
        }
      }
      if (!completionDecisionPacket.ok) {
        const primaryPacket =
          workflowNextActions[0]?.decisionPacketCommand ??
          "helix completion decision-packet --json";
        const packetCommands = [
          ...new Set(workflowNextActions.flatMap((item) => item.packetCommands)),
        ];
        process.stdout.write(`decision-packet: ${primaryPacket}\n`);
        if (packetCommands.length > 1) {
          process.stdout.write(`supporting-decision-packets: ${packetCommands.join(" | ")}\n`);
          process.stdout.write(
            `runnable-supporting-decision-packets: ${workflowNextActions
              .flatMap((item) => item.runnablePacketCommands)
              .filter((value, index, array) => array.indexOf(value) === index)
              .join(" | ")}\n`,
          );
        }
        process.stdout.write(
          "completion-decision-packet: helix completion decision-packet --json\n",
        );
        process.stdout.write("completion-review-bundle: helix completion review-bundle --json\n");
        process.stdout.write(
          "runnable-completion-review-bundle: bun run helix completion review-bundle --json\n",
        );
        process.stdout.write(
          `completion-review-coverage: covered=${completionReviewBundle.reviewCoveredBlockers.join(",") || "none"} non-packet=${completionReviewBundle.nonPacketBlockers.join(",") || "none"} policy=review-packets-cover-decision-blockers-only\n`,
        );
      }
    }
  });

const completion = program.command("completion").description("whole-program completion readiness");
completion
  .command("decision-packet")
  .description("emit the decision packet required before whole-program completion can be claimed")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output")
  .action((opts: { json?: boolean; summaryJson?: boolean }) => {
    const repoRoot = process.cwd();
    const packet = completionDecisionPacketForOutstanding(computeOutstandingWork(repoRoot), {
      sourceCommand: "helix completion decision-packet --json",
    });
    const packetSummary = () => {
      const completionFrontier = buildCompletionFrontierSummary(
        repoRoot,
        packet.semanticMeaningSummary.completionClaimAllowed,
      );
      return {
        schema_version: "completion-decision-packet-summary.v1",
        status: packet.status,
        ok: packet.ok,
        completion_claim_allowed: packet.semanticMeaningSummary.completionClaimAllowed,
        human_decision_required: packet.humanDecisionRequired,
        next_authority: packet.nextAuthority,
        authority_boundary: packet.authorityBoundary,
        decision_count: packet.decisionCount,
        semantic_frontier_count: packet.semanticMeaningSummary.frontierRecordCount,
        confirmed_current_meaning_count:
          packet.semanticMeaningSummary.confirmedCurrentMeaningRecordCount,
        blockers: packet.blockers,
        human_decision_blockers: packet.humanDecisionBlockers,
        workflow_state_blockers: packet.workflowStateBlockers,
        autonomous_work_blockers: packet.autonomousWorkBlockers,
        freshness: {
          valid_for_minutes: packet.freshness.validForMinutes,
          stale: packet.freshness.stale,
          expires_at: packet.freshness.expiresAt,
          policy: packet.freshness.policy,
        },
        human_review_bundle: {
          schema_version: packet.humanReviewBundle.schemaVersion,
          status: packet.humanReviewBundle.status,
          decision_count: packet.humanReviewBundle.decisionCount,
          next_authority: packet.humanReviewBundle.nextAuthority,
          completion_claim_allowed: packet.humanReviewBundle.completionClaimAllowed,
        },
        completion_frontier: completionFrontier,
        decisions: packet.decisions.map((decision) => ({
          plan_id: decision.planId,
          decision_kind: decision.decisionKind,
          blocker_reason: decision.blockerReason,
          blockers: decision.blockers,
          required_records: decision.requiredRecords.map((record) => record.recordName),
          scoped_primary_packet_command: decision.scopedDecisionPacketCommand,
          runnable_scoped_primary_packet_command: decision.runnableScopedDecisionPacketCommand,
          scoped_supporting_packet_commands: decision.scopedPacketCommands,
          next_workflow_route: decision.nextWorkflowRoute,
          next_workflow_route_ja: decision.nextWorkflowRouteJa,
        })),
        review_bundle_command: "helix completion review-bundle --json",
        runnable_review_bundle_command: "bun run helix completion review-bundle --json",
        write_policy: "read-only",
        source_command: "helix completion decision-packet --summary-json",
        full_source_command: "helix completion decision-packet --json",
      };
    };
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
      return;
    }
    if (opts.summaryJson) {
      process.stdout.write(`${JSON.stringify(packetSummary(), null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `completion decision-packet: ${packet.status} decisions=${packet.decisions.length}\n`,
    );
    process.stdout.write(
      `semantic-summary: frontier=${packet.semanticMeaningSummary.frontierRecordCount} confirmed=${packet.semanticMeaningSummary.confirmedCurrentMeaningRecordCount} completion-claim-allowed=${packet.semanticMeaningSummary.completionClaimAllowed}\n`,
    );
    process.stdout.write(
      `authority-boundary: ${packet.authorityBoundary} next-authority=${packet.nextAuthority} human-decision-required=${packet.humanDecisionRequired}\n`,
    );
    process.stdout.write(
      `authority-blockers: human=${packet.humanDecisionBlockers.join(",") || "none"} workflow-state=${packet.workflowStateBlockers.join(",") || "none"} automation=${packet.autonomousWorkBlockers.join(",") || "none"}\n`,
    );
    process.stdout.write(
      `human-review-bundle: schema=${packet.humanReviewBundle.schemaVersion} decisions=${packet.humanReviewBundle.decisionCount} next-authority=${packet.humanReviewBundle.nextAuthority} completion-claim-allowed=${packet.humanReviewBundle.completionClaimAllowed}\n`,
    );
    for (const item of packet.humanReviewBundle.items) {
      process.stdout.write(
        `human-review-item: ${item.order} ${item.planId} kind=${item.decisionKind} primary=${item.scopedPrimaryPacketCommand} runnable=${item.runnableScopedPrimaryPacketCommand} supporting=${item.scopedSupportingPacketCommands.join(" | ") || "none"} records=${item.requiredRecords.join(",") || "none"} owner-fields=${item.ownerReviewFields.join(",") || "none"} timing-fields=${item.timingReviewFields.join(",") || "none"} freshness-fields=${item.freshnessReviewFields.join(",") || "none"} safety-fields=${item.safetyReviewFields.join(",") || "none"}\n`,
      );
    }
    process.stdout.write(packetFreshnessLine(packet));
    for (const decision of packet.decisions) {
      process.stdout.write(
        `  - ${decision.planId}: ${decision.decisionKind} (${decision.blockerReason})\n`,
      );
      process.stdout.write(
        `    packet-command: primary=${decision.decisionPacketCommand} scoped-primary=${decision.scopedDecisionPacketCommand} packets=${decision.packetCommands.join(" | ")} scoped-packets=${decision.scopedPacketCommands.join(" | ")}\n`,
      );
      process.stdout.write(
        `    runnable-packet-command: primary=${decision.runnableDecisionPacketCommand} scoped-primary=${decision.runnableScopedDecisionPacketCommand} packets=${decision.runnablePacketCommands.join(" | ")} scoped-packets=${decision.runnableScopedPacketCommands.join(" | ")}\n`,
      );
      for (const summary of decision.supportingPacketSummaries) {
        process.stdout.write(`    packet-summary: ${packetSummaryText(summary)}\n`);
      }
      process.stdout.write(`    action: ${decision.requiredActionJa}\n`);
      process.stdout.write(`    action-id: ${decision.requiredAction}\n`);
      for (const [index, action] of decision.requiredActions.entries()) {
        process.stdout.write(
          `    required-action: ${decision.requiredActionsJa[index] ?? action}\n`,
        );
        process.stdout.write(`    required-action-id: ${action}\n`);
      }
      for (const [index, evidence] of decision.requiredEvidence.entries()) {
        process.stdout.write(
          `    required-evidence: ${decision.requiredEvidenceJa[index] ?? evidence}\n`,
        );
        process.stdout.write(`    required-evidence-id: ${evidence}\n`);
      }
      process.stdout.write(`    route: ${decision.nextWorkflowRouteJa}\n`);
      process.stdout.write(`    route-id: ${decision.nextWorkflowRoute}\n`);
      process.stdout.write(`    outcomes: ${decision.allowedOutcomes.join(", ")}\n`);
      for (const record of decision.allowedOutcomesByRecord) {
        process.stdout.write(
          `    record-outcomes ${record.recordName}: ${record.allowedOutcomes.join(", ")}\n`,
        );
      }
      for (const record of decision.nextWorkflowRoutesByRecord) {
        process.stdout.write(
          `    record-route ${record.recordName}: ${record.nextWorkflowRoute}\n`,
        );
      }
      writeRecordTemplates(decision.recordTemplates);
    }
  });

completion
  .command("review-bundle")
  .description(
    "emit the non-destructive review bundle for all packets required before whole-program completion",
  )
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const bundle = completionReviewBundleForOutstanding(computeOutstandingWork(process.cwd()));
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `completion review-bundle: ${bundle.status} decisions=${bundle.decisionCount} reviewPackets=${bundle.reviewPacketCount} source=${bundle.sourceCommand} runnable=${bundle.runnableSourceCommand}\n`,
    );
    process.stdout.write(
      `safety: planOnly=${bundle.planOnly} mustNotDecide=${bundle.mustNotDecide} mustNotApply=${bundle.mustNotApply} completionClaimAllowed=${bundle.completionClaimAllowed} humanDecisionRequired=${bundle.humanDecisionRequired} nextAuthority=${bundle.nextAuthority}\n`,
    );
    process.stdout.write(`bundle-digest: ${bundle.bundleDigest}\n`);
    process.stdout.write(`semantic-bundle-digest: ${bundle.semanticBundleDigest}\n`);
    process.stdout.write(
      `completion-decision-packet: ${bundle.completionDecisionPacketCommand} runnable=${bundle.runnableCompletionDecisionPacketCommand} digest=${bundle.completionDecisionPacketDigest}\n`,
    );
    process.stdout.write(
      `review-digests: human=${bundle.humanReviewBundleDigest} packets=${bundle.reviewPacketsDigest}\n`,
    );
    process.stdout.write(
      `review-coverage: covered=${bundle.reviewCoveredBlockers.join(",") || "none"} non-packet=${bundle.nonPacketBlockers.join(",") || "none"} policy=review-packets-cover-decision-blockers-only\n`,
    );
    for (const packet of bundle.reviewPackets) {
      process.stdout.write(
        `review-packet: ${packet.planId} ${packet.command} scoped=${packet.scopedCommand} runnable=${packet.runnableScopedCommand} schema=${packet.schemaVersion} matrix=${packet.matrixField} count=${packet.expectedMatrixCount} writePolicy=${packet.writePolicy} safety=${packet.requiredSafetyFields.join(",") || "none"} reviewFieldCount=${packet.requiredReviewFields.length} reviewFields=${packet.requiredReviewFields.join(",") || "none"} route=${packet.reviewRouteJa} route-id=${packet.reviewRoute}\n`,
      );
    }
    process.stdout.write(`blocked-until: ${bundle.blockedUntil.join(",") || "none"}\n`);
    process.stdout.write(packetFreshnessLine(bundle));
  });

program
  .command("doctor")
  .description("統合検証 (doctor / gate / trace / drift / roadmap)")
  .option("--profile <name>", "doctor profile (consumer)")
  .option("--scope <scope>", "doctor scope: full or toolchain", "full")
  .option("--setup-smoke", "run the consumer setup smoke subset instead of full product doctor")
  .option("--timing", "include per-check timing in JSON and slow-check text summary")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .action(
    (opts: {
      profile?: string;
      scope?: string;
      setupSmoke?: boolean;
      timing?: boolean;
      json?: boolean;
      summaryJson?: boolean;
    }) => {
      const doctorSummary = (report: {
        ok?: boolean;
        messages?: string[];
        scope?: string;
        timings?: Array<Record<string, unknown>>;
      }) => {
        const messages = Array.isArray(report.messages) ? report.messages : [];
        const violations = messages.filter((message) => /violation|failed|error/i.test(message));
        return {
          schema_version: "doctor-summary.v1",
          ok: report.ok === true,
          profile: opts.profile ?? null,
          scope: report.scope ?? opts.scope ?? "full",
          setup_smoke: opts.setupSmoke === true,
          timing_enabled: opts.timing === true,
          message_count: messages.length,
          violation_count: violations.length,
          timing_count: Array.isArray(report.timings) ? report.timings.length : 0,
          slow_timings: Array.isArray(report.timings)
            ? report.timings
                .slice()
                .sort((a, b) => Number(b.duration_ms ?? 0) - Number(a.duration_ms ?? 0))
                .slice(0, 10)
                .map((timing) => ({
                  id: timing.id,
                  ok: timing.ok,
                  duration_ms: timing.duration_ms,
                  message_count: timing.message_count,
                }))
            : [],
          sample_messages: messages.slice(0, 20),
          violations: violations.slice(0, 20),
          write_policy: "read-only",
          source_command: "helix doctor --summary-json",
          full_source_command: "helix doctor --json",
        };
      };
      if (opts.scope !== undefined && opts.scope !== "full" && opts.scope !== "toolchain") {
        const r = {
          ok: false,
          messages: [`doctor: scope - violation unknown scope ${opts.scope}`],
        };
        if (opts.summaryJson) {
          process.stdout.write(`${JSON.stringify(doctorSummary(r), null, 2)}\n`);
        } else if (opts.json) {
          process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        } else {
          for (const m of r.messages) process.stdout.write(`${m}\n`);
        }
        process.exitCode = 1;
        return;
      }
      const r =
        opts.profile === "consumer"
          ? runConsumerDoctor()
          : opts.profile
            ? {
                ok: false,
                messages: [`doctor: profile - violation unknown profile ${opts.profile}`],
              }
            : runDoctor(undefined, {
                scope: opts.scope as "full" | "toolchain",
                setupSmoke: opts.setupSmoke === true,
                timing: opts.timing === true,
              });
      if (opts.summaryJson) {
        process.stdout.write(`${JSON.stringify(doctorSummary(r), null, 2)}\n`);
        process.exitCode = r.ok ? 0 : 1;
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        process.exitCode = r.ok ? 0 : 1;
        return;
      }
      for (const m of r.messages) process.stdout.write(`${m}\n`);
      if ("timings" in r && Array.isArray(r.timings) && r.timings.length > 0) {
        for (const timing of [...r.timings]
          .sort((a, b) => b.duration_ms - a.duration_ms)
          .slice(0, 5)) {
          process.stdout.write(
            `doctor timing: ${timing.id} duration_ms=${timing.duration_ms} ok=${timing.ok} messages=${timing.message_count}\n`,
          );
        }
      }
      process.exitCode = r.ok ? 0 : 1;
    },
  );

// `web` command は PLAN-L7-102 prototype (table-dumper) 破棄に伴い撤去 (2026-06-24)。
// component-derived な中央UI 再実装は PLAN-L7-141 で再配線する。

const mcp = program.command("mcp").description("MCP and external verification profile catalog");
const mcpProfile = mcp.command("profile").description("verification profile catalog");
mcpProfile
  .command("list")
  .description("list MCP / external verification profiles")
  .option("--all", "include builtin profiles")
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action((opts: { all?: boolean; json?: boolean; saveEvidence?: boolean }) => {
    const deps = nodeVerificationProbeDeps(process.cwd());
    const profiles = listVerificationProfiles().filter(
      (profile) => opts.all || profile.sourceType !== "builtin",
    );
    if (opts.saveEvidence) {
      saveVerificationEvidence({ kind: "profile-list", id: "catalog", payload: profiles }, deps);
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(profiles, null, 2)}\n`);
      return;
    }
    for (const profile of profiles) {
      const state = profile.defaultEnabled ? "enabled" : "disabled";
      process.stdout.write(
        `${profile.id}: ${profile.sourceType} ${state} risk=${profile.riskTier} command="${profile.command}"\n`,
      );
    }
  });

mcpProfile
  .command("probe <name>")
  .description("probe whether a verification profile is configured and runnable")
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action((name: string, opts: { json?: boolean; saveEvidence?: boolean }) => {
    const deps = nodeVerificationProbeDeps(process.cwd());
    const result = probeVerificationProfile(name, deps);
    if (!result) {
      process.stderr.write(`unknown profile: ${name}\n`);
      process.exitCode = 1;
      return;
    }
    if (opts.saveEvidence) {
      saveVerificationEvidence({ kind: "profile-probe", id: name, payload: result }, deps);
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `profile ${result.profile.id}: ${result.ready ? "ready" : "not-ready"} (${result.profile.label})\n`,
    );
    for (const check of result.checks) {
      process.stdout.write(`  - ${check.ok ? "ok" : "missing"} ${check.name}: ${check.message}\n`);
    }
    process.exitCode = result.ready ? 0 : 1;
  });

mcpProfile
  .command("safety <name>")
  .description("evaluate the mandatory verification-profile safety contract")
  .option("--allow-write-tools", "record explicit human approval for write-capable tools")
  .option("--docker-available", "record Docker availability")
  .option("--docker-controls", "record Docker control documentation")
  .option("--json", "JSON output")
  .action(
    (
      name: string,
      opts: {
        allowWriteTools?: boolean;
        dockerAvailable?: boolean;
        dockerControls?: boolean;
        json?: boolean;
      },
    ) => {
      const profile = listVerificationProfiles().find((candidate) => candidate.id === name);
      if (!profile) {
        process.stderr.write(`unknown profile: ${name}\n`);
        process.exitCode = 1;
        return;
      }
      const result = analyzeVerificationProfileSafety({
        profile,
        requiresHumanApproval: opts.allowWriteTools === true,
        dockerAvailable: opts.dockerAvailable === true,
        dockerControlsDocumented: opts.dockerControls === true,
      });
      process.stdout.write(
        opts.json
          ? `${JSON.stringify(result, null, 2)}\n`
          : `profile safety ${name}: ${result.ok ? "ok" : "blocked"}\n`,
      );
      process.exitCode = result.ok ? 0 : 1;
    },
  );

mcpProfile
  .command("config <name...>")
  .description("render a local generated MCP config after workspace-scope checks")
  .option("--target <path>", "suggested local target", ".helix/local/mcp.generated.json")
  .option("--json", "JSON output")
  .action((names: string[], opts: { target?: string; json?: boolean }) => {
    const result = renderGeneratedMcpConfig({
      repoRoot: process.cwd(),
      selectedProfileIds: names,
      targetPath: opts.target,
    });
    process.stdout.write(opts.json ? `${JSON.stringify(result, null, 2)}\n` : result.content);
    process.exitCode = result.ok ? 0 : 1;
  });

const memory = program.command("memory").description("shared harness/project memory");
memory
  .command("write <layer> <key> <body>")
  .description("write a shared memory entry")
  .option("--v2", "write the memory v2 event contract")
  .option("--legacy-v1", "write the deprecated memory v1 contract")
  .option("--operation-id <id>", "v2 idempotency key (auto-derived when omitted)")
  .option("--type <type>", "memory type (decision|constraint|feedback|state|reference)")
  .option("--plan-id <id>", "originating PLAN id")
  .option("--session-id <id>", "originating session id")
  .option("--runtime <runtime>", "origin runtime (claude|codex|human|system)", "system")
  .option("--origin <origin>", "origin label", "helix-memory-cli")
  .option("--expires-at <iso>", "ISO-8601 expiry (required for takeover)")
  .option("--link <layer:key>", "related memory key", collectCliValues, [])
  .option("--dry-run", "validate without persisting")
  .action(
    (
      ...args: [
        string,
        string,
        string,
        {
          v2?: boolean;
          legacyV1?: boolean;
          operationId?: string;
          type?: string;
          planId?: string;
          sessionId?: string;
          runtime?: string;
          origin?: string;
          expiresAt?: string;
          link?: string[];
          dryRun?: boolean;
        },
      ]
    ) => {
      const [layer, key, body, opts] = args;
      if (opts.v2 && opts.legacyV1) {
        process.stderr.write("rejected: --v2 and --legacy-v1 are mutually exclusive\n");
        process.exitCode = 1;
        return;
      }
      if (!opts.legacyV1) {
        const memoryLayer = parseMemoryLayerV2(layer);
        if (!memoryLayer) return;
        const memoryType = parseMemoryType(opts.type ?? "reference");
        const runtime = parseMemoryRuntime(opts.runtime ?? "system");
        if (!memoryType || !runtime) return;
        const root = process.cwd();
        const sessionDeps = nodeDeps(root, gitBranch, gitHead);
        const effectivePlanId = opts.planId ?? resolveActivePlan(sessionDeps);
        const effectiveSessionId = opts.sessionId ?? "cli-memory";
        const memoryDeps = nodeMemoryV2Deps({
          root,
          writeSessionEvent: (event) => {
            const logged = recordEventResult(
              {
                event_id: event.eventId,
                ts: new Date().toISOString(),
                session_id: effectiveSessionId,
                plan_id: effectivePlanId,
                event_type: "memory_write",
                target: `memory:${event.layer}:${event.memoryType}:${event.key}:${event.entryId}`,
                outcome: "ok",
              },
              sessionDeps,
            );
            if (!logged.ok) throw new Error(logged.reason);
          },
        });
        const intent = {
          operationId: "pending",
          layer: memoryLayer,
          key,
          body,
          type: memoryType,
          provenance: {
            planId: effectivePlanId,
            sessionId: effectiveSessionId,
            runtime,
            origin: opts.origin ?? "helix-memory-cli",
          },
          expiresAt: opts.expiresAt ?? null,
          links: opts.link ?? [],
          dryRun: opts.dryRun,
        };
        const activeForKey = resolveMemoryView(
          memoryDeps.readEvents(memoryLayer),
          memoryDeps.now(),
          memoryLayer,
        ).activeEntries.filter((entry) => entry.key === key);
        const activeMatch = activeForKey.find((entry) => sameWriteIntent(entry, intent));
        const predecessorId = activeForKey.at(-1)?.id ?? null;
        const operationId =
          opts.operationId ??
          (activeMatch
            ? activeMatch.id.slice(activeMatch.id.lastIndexOf(":op:") + 4)
            : `auto-${createHash("sha256")
                .update(JSON.stringify({ intent, predecessorId }))
                .digest("hex")
                .slice(0, 24)}`);
        const result = writeMemoryV2({ ...intent, operationId }, memoryDeps);
        if (!result.ok) {
          if (result.reason === "dry_run") {
            process.stdout.write(
              `${JSON.stringify({ ok: true, dryRun: true, persisted: false })}\n`,
            );
            return;
          }
          process.stderr.write(
            `rejected: ${result.reason}${result.field ? ` field=${result.field}` : ""}\n`,
          );
          process.exitCode = 1;
          return;
        }
        process.stdout.write(`${JSON.stringify(result)}\n`);
        return;
      }
      const memoryLayer = parseMemoryLayer(layer);
      if (!memoryLayer) return;
      const deps = fileMemoryDeps({ root: process.cwd() });
      try {
        const entry = writeMemory({ layer: memoryLayer, key, body }, deps);
        process.stdout.write(`${entry.id}\n`);
      } catch (error) {
        if (error instanceof Error && /secret policy/.test(error.message)) {
          process.stderr.write("rejected: secret detected\n");
          process.exitCode = 1;
          return;
        }
        throw error;
      }
    },
  );

function parseMemoryLayerV2(value: string): MemoryLayerV2 | null {
  if (value === "harness" || value === "project" || value === "takeover") return value;
  process.stderr.write(`invalid memory layer: ${value}\n`);
  process.exitCode = 1;
  return null;
}

function parseMemoryType(value: string): MemoryType | null {
  if (["decision", "constraint", "feedback", "state", "reference"].includes(value)) {
    return value as MemoryType;
  }
  process.stderr.write(`invalid memory type: ${value}\n`);
  process.exitCode = 1;
  return null;
}

function parseMemoryRuntime(value: string): MemoryRuntime | null {
  if (["claude", "codex", "human", "system"].includes(value)) return value as MemoryRuntime;
  process.stderr.write(`invalid memory runtime: ${value}\n`);
  process.exitCode = 1;
  return null;
}

memory
  .command("list <layer>")
  .description("list active shared memory entries")
  .option("--json", "JSON output")
  .action((layer: string, opts: { json?: boolean }) => {
    const memoryLayer = parseMemoryLayer(layer);
    if (!memoryLayer) return;
    const entries = listMemory(memoryLayer, fileMemoryDeps({ root: process.cwd() }));
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(entries, null, 2)}\n`);
      return;
    }
    for (const entry of entries) {
      process.stdout.write(`[${entry.id}] ${entry.key}: ${entry.body}\n`);
    }
  });

memory
  .command("compact")
  .description("compact shared memory jsonl")
  .option("--layer <layer>", "memory layer to compact (harness|project)", "harness")
  .option("--dry-run", "count removable entries without rewriting the memory file")
  .action((opts: { layer?: string; dryRun?: boolean }) => {
    const memoryLayer = parseMemoryLayer(opts.layer ?? "harness");
    if (!memoryLayer) return;
    const root = process.cwd();
    const result = compactMemory(
      { layer: memoryLayer, dryRun: opts.dryRun },
      {
        ...fileMemoryDeps({ root }),
        ...nodeMemoryCompactionDeps({ root }),
      },
    );
    process.stdout.write(
      `memory compact: layer=${result.layer} kept=${result.kept} removedSuperseded=${result.removedSuperseded} removedDamaged=${result.removedDamaged} applied=${result.applied} backup=${result.backupPath ?? "-"}\n`,
    );
  });

memory
  .command("compact-v2")
  .description("compact memory v2 JSONL with SQLite coordination and fencing")
  .option("--layer <layer>", "memory v2 layer (harness|project|takeover)", "harness")
  .action((opts: { layer?: string }) => {
    const layer = parseMemoryLayerV2(opts.layer ?? "harness");
    if (!layer) return;
    process.stdout.write(
      `${JSON.stringify(compactMemoryV2(layer, nodeMemoryV2Deps({ root: process.cwd() })))}\n`,
    );
  });

memory
  .command("surface-v2")
  .description("surface active memory v2 entries")
  .option("--layer <layer>", "repeatable memory v2 layer", collectCliValues, [])
  .option("--max-entries <n>", "entry budget", (value) => Number(value))
  .option("--max-chars <n>", "rendered code-point budget", (value) => Number(value))
  .option("--json", "JSON output")
  .action((opts: { layer?: string[]; maxEntries?: number; maxChars?: number; json?: boolean }) => {
    const layers = (opts.layer ?? []).map(parseMemoryLayerV2);
    if (layers.some((layer) => layer === null)) return;
    const result = surfaceMemoryV2(
      {
        layers: layers.length > 0 ? (layers as MemoryLayerV2[]) : undefined,
        maxEntries: opts.maxEntries,
        maxChars: opts.maxChars,
      },
      nodeMemoryV2Deps({ root: process.cwd() }),
    );
    if (opts.json) process.stdout.write(`${JSON.stringify(result)}\n`);
    else process.stdout.write(result.lines.length > 0 ? `${result.lines.join("\n")}\n` : "");
  });

memory
  .command("consume <ids...>")
  .description("consume active takeover memory entries")
  .requiredOption("--consumer <id>", "consumer identity")
  .action((ids: string[], opts: { consumer: string }) => {
    process.stdout.write(
      `${JSON.stringify(consumeTakeover(ids, opts.consumer, nodeMemoryV2Deps({ root: process.cwd() })))}\n`,
    );
  });

memory
  .command("deliver")
  .description("surface takeover memory and consume only after successful stdout write")
  .requiredOption("--consumer <id>", "consumer identity")
  .option("--max-entries <n>", "entry budget", (value) => Number(value))
  .action((opts: { consumer: string; maxEntries?: number }) => {
    const deps = nodeMemoryV2Deps({
      root: process.cwd(),
      writeOutput: (lines) => {
        if (lines.length > 0) process.stdout.write(`${lines.join("\n")}\n`);
      },
    });
    const result = deliverTakeover(
      { consumerId: opts.consumer, maxEntries: opts.maxEntries },
      deps,
    );
    process.stdout.write(`${JSON.stringify(result)}\n`);
  });

memory
  .command("show")
  .description("surface harness memory for session start")
  .action(() => {
    for (const line of surfaceMemory(fileMemoryDeps({ root: process.cwd() }))) {
      process.stdout.write(`${line}\n`);
    }
  });

function collectCliValues(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

function currentGitHeadShort(repoRoot: string): string {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() || "unknown" : "unknown";
}

function isEgressPolicy(value: string | undefined): value is EgressPolicy | undefined {
  return (
    value === undefined || value === "offline" || value === "allowlist" || value === "undefined"
  );
}

function isActivationKind(value: string | undefined): value is ActivationKind | undefined {
  return (
    value === undefined ||
    value === "none" ||
    value === "external_api" ||
    value === "auth" ||
    value === "infra"
  );
}

function isSpecStoreOperation(value: string | undefined): value is SpecStoreOperation | undefined {
  return (
    value === undefined ||
    value === "read" ||
    value === "write" ||
    value === "sync" ||
    value === "publish"
  );
}

function isChangePackageStatus(
  value: string | undefined,
): value is ChangePackageStatus | undefined {
  return (
    value === undefined ||
    value === "draft" ||
    value === "active" ||
    value === "confirmed" ||
    value === "accepted" ||
    value === "archived"
  );
}

function isTemplateSourceKind(value: string | undefined): value is TemplateSourceKind | undefined {
  return (
    value === undefined ||
    value === "core" ||
    value === "role" ||
    value === "preset" ||
    value === "project"
  );
}

function isArtifactType(value: string | undefined): value is ArtifactType | undefined {
  return (
    value === undefined ||
    value === "spec" ||
    value === "plan" ||
    value === "task" ||
    value === "code" ||
    value === "test" ||
    value === "design"
  );
}

function isEnforcementMode(value: string | undefined): value is EnforcementMode | undefined {
  return value === undefined || value === "hard" || value === "advisory" || value === "unsupported";
}

function isBundleCatalog(value: string | undefined): value is BundleCatalog | undefined {
  return value === undefined || value === "official" || value === "community" || value === "local";
}

function isBundleKind(value: string | undefined): value is BundleKind | undefined {
  return value === undefined || value === "extension" || value === "preset" || value === "bundle";
}

function parseTemplateEntrySpec(spec: string) {
  const [key = "", source = "", priority = "", content = "", overrideReason = ""] = spec.split(":");
  if (!isTemplateSourceKind(source)) {
    throw new Error(`invalid template source: ${source}`);
  }
  const parsedPriority = Number.parseInt(priority, 10);
  if (!Number.isFinite(parsedPriority)) {
    throw new Error(`invalid template priority: ${priority}`);
  }
  return {
    key,
    source: source ?? "core",
    priority: parsedPriority,
    content,
    override_reason: overrideReason || null,
  };
}

function parseConvergenceArtifactSpec(spec: string) {
  const [artifactId = "", type = "", path = "", digest = "", line = ""] = spec.split(":");
  if (!isArtifactType(type)) throw new Error(`invalid artifact type: ${type}`);
  const parsedLine = line ? Number.parseInt(line, 10) : null;
  if (line && !Number.isFinite(parsedLine)) {
    throw new Error(`invalid artifact line: ${line}`);
  }
  return {
    artifact_id: artifactId,
    type: type ?? "plan",
    path,
    digest,
    line: parsedLine,
  };
}

function parseExecutionTriples(value: string | undefined): ExecutionTriple[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("--triple-json must be an array");
  return parsed.map((entry) => entry as ExecutionTriple);
}

function parseJsonArrayOption<T>(value: string | undefined, optionName: string): T[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${optionName} must be an array`);
  return parsed.map((entry) => entry as T);
}

function parseAgentLockSpec(spec: string, now: string): AgentLockRecord {
  const [lockId = "", ownerSessionId = "", path = "", expiresAt = ""] = spec.split(":");
  return {
    lock_id: lockId || `lock:${ownerSessionId}:${path}`,
    owner_session_id: ownerSessionId || "unknown",
    plan_id: null,
    path: path || "unknown",
    symbol: null,
    acquired_at: now,
    expires_at: expiresAt || null,
    status: "active",
  };
}

function parseCandidateJson(value: string | undefined): CandidateVerifierInput[] {
  if (!value) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("--candidate-json must be an array");
  return parsed.map((item) => item as CandidateVerifierInput);
}

const sessions = program.command("sessions").description("agent session read-only surfaces");

sessions
  .command("board")
  .description("emit the agent session command-center board")
  .option("--json", "JSON output")
  .option("--stale-minutes <n>", "stale threshold in minutes", (value) =>
    Number.parseInt(value, 10),
  )
  .action((opts: { json?: boolean; staleMinutes?: number }) => {
    const report = buildAgentSessionBoardReport(process.cwd(), {
      staleMinutes: Number.isFinite(opts.staleMinutes) ? opts.staleMinutes : undefined,
    });
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `sessions board: rows=${report.rows.length} active=${report.counts.active} stale=${report.counts.stale} blocked=${report.counts.blocked}\n`,
    );
    for (const row of report.rows) {
      process.stdout.write(
        `  ${row.session_id}: state=${row.state} role=${row.role ?? "-"} plan=${row.plan_id ?? "-"} needs=${row.needs_you_reason} next=${row.next_action ?? "-"}\n`,
      );
    }
  });

const agent = program.command("agent").description("agent mailbox and lock read-only surfaces");

agent
  .command("locks")
  .description("emit agent file/symbol lock conflict report")
  .option("--json", "JSON output")
  .option("--lock <spec>", "lock_id:owner_session_id:path[:expires_at]", collectCliValues, [])
  .action((opts: { json?: boolean; lock?: string[] }) => {
    const now = new Date().toISOString();
    const locks = (opts.lock ?? []).map((spec) => parseAgentLockSpec(spec, now));
    const report = buildAgentLockReport(locks, { now });
    process.exitCode = report.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `agent locks: ${report.ok ? "ok" : "blocked"} locks=${report.locks.length} conflicts=${report.conflicts.length} stale=${report.stale_locks.length}\n`,
    );
    for (const finding of report.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

agent
  .command("message")
  .description("emit a dry-run mailbox message packet")
  .requiredOption("--dry-run", "do not write a mailbox message")
  .requiredOption("--from <session>", "sender session id")
  .requiredOption("--to <session>", "recipient session id")
  .requiredOption("--plan <id>", "PLAN id")
  .requiredOption("--task <text>", "task label")
  .requiredOption("--body <text>", "message body")
  .option("--json", "JSON output")
  .action(
    (opts: {
      dryRun: boolean;
      from: string;
      to: string;
      plan: string;
      task: string;
      body: string;
      json?: boolean;
    }) => {
      const packet = buildAgentMessageDryRun({
        fromSessionId: opts.from,
        toSessionId: opts.to,
        planId: opts.plan,
        task: opts.task,
        body: opts.body,
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `agent message: dry-run from=${packet.from_session_id} to=${packet.to_session_id} plan=${packet.plan_id}\n`,
      );
    },
  );

agent
  .command("ssot-project")
  .description("emit dry-run runtime-native projections from HELIX agent SSoT manifest")
  .requiredOption("--dry-run", "do not write runtime-native files")
  .option("--json", "JSON output")
  .option("--item-json <json>", "projection item array JSON")
  .action((opts: { dryRun: boolean; json?: boolean; itemJson?: string }) => {
    try {
      const items =
        parseJsonArrayOption<AgentSsotProjectionItem>(opts.itemJson, "--item-json").length > 0
          ? parseJsonArrayOption<AgentSsotProjectionItem>(opts.itemJson, "--item-json")
          : [
              {
                artifact_id: "agent:dry-run",
                kind: "agent" as const,
                runtime: "codex",
                source_path: "docs/agents/dry-run.md",
                source_content: "agent dry run",
                target_path: ".codex/agents/dry-run.md",
                generated_content: "agent dry run",
                cleanup_policy: "owned_generated" as const,
                required_capability: "hooks" as const,
              },
            ];
      const report = buildAgentSsotRuntimeProjectionReport(items, {
        sourceCommand: "helix agent ssot-project --dry-run --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `agent ssot-project: ${report.ok ? "ok" : "blocked"} files=${report.projected_files.length} drift=${report.drift_count} unsupported=${report.unsupported_count}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix agent ssot-project --dry-run --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const loop = program.command("loop").description("P2 orchestration loop runtime");
loop
  .command("run")
  .description("run a stored LoopState through the real runtime bridge")
  .requiredOption("--plan <id>", "PLAN id / loop state id")
  .option("--once", "run only one tick")
  .option("--dry-run", "print worker/verifier wiring without dispatching adapters")
  .action(async (opts: { plan: string; once?: boolean; dryRun?: boolean }) => {
    const repoRoot = process.cwd();
    const store = loopStoreForRoot(repoRoot);
    const state = store.read(opts.plan);
    if (!state) {
      process.stderr.write(`loop state not found or invalid: ${opts.plan}\n`);
      process.exitCode = 1;
      return;
    }
    const workerProvider = parseLoopProvider(state.workerProvider);
    if (!workerProvider) {
      process.stderr.write(`invalid loop worker provider: ${String(state.workerProvider)}\n`);
      process.exitCode = 1;
      return;
    }

    const mode = detectMode().mode;
    const verifier = selectVerifier(workerProvider, mode);
    const deps = nodeTickDeps({ mode, store });
    if (opts.dryRun) {
      process.stdout.write(
        [
          "loop dry-run:",
          `plan=${state.planId}`,
          `mode=${mode}`,
          `worker=${workerProvider} available=${deps.providerAvailable(workerProvider)}`,
          `verifier=${verifier.provider} available=${deps.providerAvailable(verifier.provider)} blockedReason=${verifier.blockedReason ?? "null"}`,
          "dispatch=false",
        ].join("\n"),
      );
      process.stdout.write("\n");
      return;
    }

    let current: LoopState = { ...state, workerProvider };
    let ticks = 0;
    try {
      while (canResume(current, deps.now())) {
        current = await tick(current, [], deps);
        store.write(current);
        ticks += 1;
        if (opts.once) break;
      }
    } catch (error) {
      process.stderr.write(
        `loop run failed: plan=${opts.plan} detail=${
          error instanceof Error ? error.message : String(error)
        }\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `loop run: plan=${current.planId} ticks=${ticks} status=${current.status} iteration=${current.iteration} verdict=${current.lastVerdict}\n`,
    );
  });

loop
  .command("receipt")
  .description("emit an autonomous loop run receipt")
  .requiredOption("--plan <id>", "PLAN id / loop state id")
  .option("--json", "JSON output")
  .action((opts: { plan: string; json?: boolean }) => {
    const receipt = buildAutonomousLoopRunReceipt(process.cwd(), opts.plan);
    process.exitCode = receipt.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `loop receipt: ${receipt.ok ? "ok" : "blocked"} plan=${receipt.plan_id} status=${receipt.status} iterations=${receipt.iteration_count} stop=${receipt.stop_kind} next=${receipt.restartable_next_action ?? "-"}\n`,
    );
    for (const finding of receipt.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

const candidate = program
  .command("candidate")
  .description("parallel candidate verification read-only surfaces");

candidate
  .command("council")
  .description("emit a verifier council decision packet without applying any candidate")
  .option("--json", "JSON output")
  .option("--candidate-json <json>", "JSON array of candidate verifier inputs")
  .action((opts: { json?: boolean; candidateJson?: string }) => {
    let candidates: CandidateVerifierInput[] = [];
    try {
      candidates = parseCandidateJson(opts.candidateJson);
    } catch (error) {
      process.exitCode = 1;
      const output = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        source_command: "helix candidate council --json",
      };
      if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      else process.stderr.write(`${output.error}\n`);
      return;
    }
    const report = buildCandidateCouncilReport(candidates);
    process.exitCode = report.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `candidate council: ${report.ok ? "ok" : "blocked"} candidates=${report.decisions.length} selected=${report.selected_candidate_id ?? "-"} merge=${report.merge_policy}\n`,
    );
    for (const finding of report.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

const pairAgent = program.command("pair-agent").description("P2/P3 TDD pair programming route");
pairAgent
  .command("plan")
  .description("plan smart-review-agent + lightweight-implementation-agent TDD pairing")
  .requiredOption("--plan-id <id>", "PLAN id")
  .option("--task <text>", "task text")
  .option("--task-file <path>", TASK_FILE_OPTION_DESCRIPTION)
  .option("--primary <provider>", "execution provider (claude|codex)")
  .option("--difficulty <level>", "task difficulty (trivial|simple|standard|complex|critical)")
  .option("--allow-frontier", "explicitly authorize T0 smart review agent execution")
  .option("--max-fix-cycles <n>", "maximum light implementation fix cycles")
  .option("--adapter-plans", "include provider adapter dry-run plans")
  .option("--execute", "mark adapter plans executable; still does not dispatch providers")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action(
    (opts: {
      planId: string;
      task?: string;
      taskFile?: string;
      primary?: string;
      difficulty?: string;
      allowFrontier?: boolean;
      maxFixCycles?: string;
      adapterPlans?: boolean;
      execute?: boolean;
      mode?: ReturnType<typeof detectMode>["mode"];
      json?: boolean;
      saveEvidence?: boolean;
    }) => {
      const taskText = resolveTaskText({
        task: opts.task,
        taskFile: opts.taskFile,
      });
      if (taskText === null || taskText.trim().length === 0) {
        process.stderr.write("pair-agent plan requires exactly one of --task or --task-file\n");
        process.exitCode = 1;
        return;
      }
      if (opts.primary && opts.primary !== "claude" && opts.primary !== "codex") {
        process.stderr.write("pair-agent plan --primary must be claude or codex\n");
        process.exitCode = 1;
        return;
      }
      const difficulty = parseTaskDifficulty(opts.difficulty);
      if (opts.difficulty && !difficulty) {
        process.stderr.write(
          `pair-agent plan --difficulty must be one of ${TASK_DIFFICULTIES.join(", ")}\n`,
        );
        process.exitCode = 1;
        return;
      }
      const maxFixCycles = parsePositiveIntegerOption(opts.maxFixCycles);
      if (maxFixCycles === null) {
        process.stderr.write("pair-agent plan --max-fix-cycles must be a positive integer\n");
        process.exitCode = 1;
        return;
      }
      const base = detectMode();
      const detection = opts.mode ? { ...base, mode: opts.mode } : base;
      const plan = buildPairAgentTddPlan({
        planId: opts.planId,
        task: taskText,
        detection,
        primary: opts.primary as Provider | undefined,
        allowFrontier: Boolean(opts.allowFrontier),
        difficulty,
        maxFixCycles,
      });
      const adapterPlans = opts.adapterPlans
        ? buildPairAgentAdapterPlans({
            plan,
            mode: detection.mode,
            execute: Boolean(opts.execute),
          })
        : [];
      const evidencePath = opts.saveEvidence
        ? savePairAgentPlanEvidence({
            plan,
            adapterPlans,
            mode: detection.mode,
            execute: Boolean(opts.execute),
            recordedAt: new Date().toISOString(),
          })
        : null;
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ plan, adapterPlans, evidence_path: evidencePath }, null, 2)}\n`,
        );
        return;
      }
      process.stdout.write(
        `pair-agent plan: status=${plan.status} review=${plan.reviewKind} execution=${plan.cross.execution}>${plan.cross.judgement} authorized=${plan.executionAuthorized}\n`,
      );
      for (const agent of plan.agents) {
        process.stdout.write(
          `  agent ${agent.key}: role=${agent.role} provider=${agent.provider} tier=${agent.tier} model=${agent.model} close=${agent.closingAuthority}\n`,
        );
      }
      for (const phase of plan.phases) {
        process.stdout.write(
          `  phase ${phase.index} ${phase.name}: agent=${phase.agentKey} evidence=${phase.requiredEvidence.join(",")}\n`,
        );
      }
      for (const finding of plan.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code} — ${finding.message}\n`);
      }
      if (opts.adapterPlans) {
        for (const adapterPlan of adapterPlans) {
          process.stdout.write(
            `  adapter: provider=${adapterPlan.provider} available=${adapterPlan.available} command=${adapterPlan.command} model=${adapterPlan.model ?? "-"} dryRun=${adapterPlan.dry_run}\n`,
          );
        }
      }
      if (evidencePath) process.stdout.write(`  evidence: ${evidencePath}\n`);
      if (!plan.ok) process.exitCode = 1;
    },
  );
pairAgent
  .command("run")
  .description("run the smart-review + lightweight-implementation TDD pair sequence")
  .requiredOption("--plan-id <id>", "PLAN id")
  .option("--task <text>", "task text")
  .option("--task-file <path>", TASK_FILE_OPTION_DESCRIPTION)
  .option("--primary <provider>", "execution provider (claude|codex)")
  .option("--difficulty <level>", "task difficulty (trivial|simple|standard|complex|critical)")
  .option("--allow-frontier", "explicitly authorize T0 smart review agent execution")
  .option("--max-fix-cycles <n>", "maximum light implementation fix cycles")
  .option("--execute", "dispatch provider adapters; omitted means dry-run only")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action(
    async (opts: {
      planId: string;
      task?: string;
      taskFile?: string;
      primary?: string;
      difficulty?: string;
      allowFrontier?: boolean;
      maxFixCycles?: string;
      execute?: boolean;
      mode?: ReturnType<typeof detectMode>["mode"];
      json?: boolean;
      saveEvidence?: boolean;
    }) => {
      const taskText = resolveTaskText({
        task: opts.task,
        taskFile: opts.taskFile,
      });
      if (taskText === null || taskText.trim().length === 0) {
        process.stderr.write("pair-agent run requires exactly one of --task or --task-file\n");
        process.exitCode = 1;
        return;
      }
      if (opts.primary && opts.primary !== "claude" && opts.primary !== "codex") {
        process.stderr.write("pair-agent run --primary must be claude or codex\n");
        process.exitCode = 1;
        return;
      }
      const difficulty = parseTaskDifficulty(opts.difficulty);
      if (opts.difficulty && !difficulty) {
        process.stderr.write(
          `pair-agent run --difficulty must be one of ${TASK_DIFFICULTIES.join(", ")}\n`,
        );
        process.exitCode = 1;
        return;
      }
      const maxFixCycles = parsePositiveIntegerOption(opts.maxFixCycles);
      if (maxFixCycles === null) {
        process.stderr.write("pair-agent run --max-fix-cycles must be a positive integer\n");
        process.exitCode = 1;
        return;
      }
      const base = detectMode();
      const detection = opts.mode ? { ...base, mode: opts.mode } : base;
      const plan = buildPairAgentTddPlan({
        planId: opts.planId,
        task: taskText,
        detection,
        primary: opts.primary as Provider | undefined,
        allowFrontier: Boolean(opts.allowFrontier),
        difficulty,
        maxFixCycles,
      });
      const startedAt = new Date().toISOString();
      const result = await runPairAgentTddPlan({
        plan,
        mode: detection.mode,
        execute: Boolean(opts.execute),
        executor: opts.execute ? defaultPairAgentExecutor() : undefined,
      });
      const completedAt = new Date().toISOString();
      const evidencePath = opts.saveEvidence
        ? savePairAgentRunEvidence({
            plan,
            result,
            mode: detection.mode,
            execute: Boolean(opts.execute),
            startedAt,
            completedAt,
          })
        : null;
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ plan, result, evidence_path: evidencePath }, null, 2)}\n`,
        );
      } else {
        process.stdout.write(
          `pair-agent run: status=${result.status} execute=${Boolean(opts.execute)} verdict=${result.finalVerdict ?? "null"} steps=${result.steps.length}\n`,
        );
        if (evidencePath) process.stdout.write(`  evidence: ${evidencePath}\n`);
        for (const step of result.steps) {
          process.stdout.write(
            `  step ${step.phase}: cycle=${step.cycle} agent=${step.agentKey} provider=${step.provider} status=${step.status} verdict=${step.verdict ?? "null"} exit=${step.exitCode ?? "null"}\n`,
          );
        }
        for (const finding of result.findings) {
          process.stdout.write(`  ${finding.severity}: ${finding.code} — ${finding.message}\n`);
        }
      }
      if (!result.ok) process.exitCode = 1;
    },
  );

registerRenameCommands(program);
const versionUp = program
  .command("version-up")
  .description("version-up parked work decision surfaces");

function versionUpTargetTagRef(targetVersion: string): string | null {
  const match = targetVersion
    .trim()
    .match(
      /^v?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$/,
    );
  return match ? `refs/tags/v${match[1]}` : null;
}

function gitRefExists(ref: string | null): boolean {
  if (!ref) return false;
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", ref], {
      encoding: "utf8",
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function gitRemoteRefExists(remoteUrl: string | undefined, ref: string | null): boolean {
  if (!remoteUrl || !ref) return false;
  try {
    const stdout = execFileSync("git", ["ls-remote", "--tags", remoteUrl, ref], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return stdout
      .split("\n")
      .some((line) => line.trim().endsWith(`\t${ref}`) || line.trim().endsWith(` ${ref}`));
  } catch {
    return false;
  }
}

versionUp
  .command("dry-run")
  .description("emit a non-destructive current->target version upgrade plan")
  .requiredOption("--current <version>", "current SemVer tag/version")
  .requiredOption("--target <version>", "target SemVer tag/version")
  .option("--release-trigger <trigger>", "release/tag trigger text")
  .option("--release-remote <url>", "remote repository URL used to verify the target release tag")
  .option("--json", "JSON output")
  .option("--fail-on-blocked", "exit non-zero when the dry-run plan is blocked")
  .action(
    (opts: {
      current: string;
      target: string;
      releaseTrigger?: string;
      releaseRemote?: string;
      json?: boolean;
      failOnBlocked?: boolean;
    }) => {
      const targetRef = versionUpTargetTagRef(opts.target);
      const releaseTagExists = opts.releaseRemote
        ? gitRemoteRefExists(opts.releaseRemote, targetRef)
        : gitRefExists(targetRef);
      const plan = buildVersionUpgradeDryRunPlan({
        currentVersion: opts.current,
        targetVersion: opts.target,
        releaseTagExists,
        ...(opts.releaseRemote ? { releaseRemoteUrl: opts.releaseRemote } : {}),
        ...(opts.releaseTrigger ? { releaseTrigger: opts.releaseTrigger } : {}),
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
        if (opts.failOnBlocked && !plan.ok) {
          process.exitCode = 1;
        }
        return;
      }
      process.stdout.write(
        `version-up dry-run: ${plan.currentVersion} -> ${plan.targetVersion} change=${plan.semverChange} ok=${plan.ok} releaseTriggerResolved=${plan.releaseTriggerResolved} planOnly=${plan.planOnly} applyCommandAvailable=${plan.applyCommandAvailable}\n`,
      );
      for (const reason of plan.blockedReasons) {
        process.stdout.write(`  blocked: ${reason}\n`);
      }
      process.stdout.write(
        `  migration=${plan.migrationPlan.length} rollback=${plan.rollbackPlan.length} idempotency=${plan.idempotencyChecks.length} release-gates=${plan.releaseGateChecks.length}\n`,
      );
      if (opts.failOnBlocked && !plan.ok) {
        process.exitCode = 1;
      }
    },
  );
versionUp
  .command("rehearsal")
  .description("emit a no-write external activation rehearsal packet for a parked version-up PLAN")
  .requiredOption("--plan <planId>", "parked PLAN id")
  .option("--no-write", "confirm this command must not mutate files or external state")
  .option("--json", "JSON output")
  .action((opts: { plan: string; write?: boolean; json?: boolean }) => {
    if (opts.write !== false) {
      process.stderr.write("version-up rehearsal requires --no-write\n");
      process.exitCode = 1;
      return;
    }
    const packets = buildVersionUpActivationPackets(loadVersionUpReadinessInput(process.cwd()));
    const activationPacket = packets.find((packet) => packet.planId === opts.plan);
    if (!activationPacket) {
      process.stderr.write(`version-up rehearsal: parked PLAN not found: ${opts.plan}\n`);
      process.exitCode = 1;
      return;
    }
    const packet = buildVersionUpActivationRehearsalPacket(activationPacket);
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `version-up rehearsal: ${packet.planId} planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy}\n`,
    );
    process.stdout.write(
      `  external=${packet.externalRehearsalPlan.length} cost=${packet.costGuardrails.length} provenance=${packet.provenanceRequirements.length} readiness=${packet.activationReadinessChecks.length}\n`,
    );
    for (const blocker of packet.blockedUntil) {
      process.stdout.write(`  blocked-until: ${blocker}\n`);
    }
  });
versionUp
  .command("security-checklist")
  .description("emit a no-write security checklist packet for a parked version-up activation")
  .requiredOption("--plan <planId>", "parked PLAN id")
  .option("--no-write", "confirm this command must not mutate files or external state")
  .option("--json", "JSON output")
  .action((opts: { plan: string; write?: boolean; json?: boolean }) => {
    if (opts.write !== false) {
      process.stderr.write("version-up security-checklist requires --no-write\n");
      process.exitCode = 1;
      return;
    }
    const packets = buildVersionUpActivationPackets(loadVersionUpReadinessInput(process.cwd()));
    const activationPacket = packets.find((packet) => packet.planId === opts.plan);
    if (!activationPacket) {
      process.stderr.write(`version-up security-checklist: parked PLAN not found: ${opts.plan}\n`);
      process.exitCode = 1;
      return;
    }
    const packet = buildVersionUpSecurityChecklistPacket(activationPacket);
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `version-up security-checklist: ${packet.planId} planOnly=${packet.planOnly} mustNotApply=${packet.mustNotApply} writePolicy=${packet.writePolicy} checks=${packet.securityChecks.length}\n`,
    );
    for (const check of packet.securityChecks) {
      process.stdout.write(
        `  security-check: ${check.check} status=${check.status} source=${check.sourceUrl}\n`,
      );
      process.stdout.write(`    evidence=${check.evidence}\n`);
      process.stdout.write(`    reason=${check.reason}\n`);
    }
    for (const blocker of packet.blockedUntil) {
      process.stdout.write(`  blocked-until: ${blocker}\n`);
    }
  });
versionUp
  .command("activation-bundle")
  .description("write local version-up activation review artifacts without external apply")
  .requiredOption("--plan <planId>", "parked PLAN id")
  .requiredOption("--out <dir>", "write review bundle files to a directory")
  .option("--json", "JSON output")
  .action((opts: { plan: string; out: string; json?: boolean }) => {
    const packets = buildVersionUpActivationPackets(loadVersionUpReadinessInput(process.cwd()));
    const activationPacket = packets.find((packet) => packet.planId === opts.plan);
    if (!activationPacket) {
      failPlanNotMatched("version-up activation-bundle", opts.plan, opts.json);
      return;
    }
    const bundle = buildVersionUpActivationReviewBundle(activationPacket);
    mkdirSync(opts.out, { recursive: true });
    for (const entry of bundle.files) {
      writeFileSync(join(opts.out, entry.path), entry.content);
    }
    const payload = {
      ok: true,
      output_dir: opts.out,
      schemaVersion: bundle.schemaVersion,
      planId: bundle.planId,
      planOnly: bundle.planOnly,
      mustNotApply: bundle.mustNotApply,
      activationAllowed: bundle.activationAllowed,
      applyCommandAvailable: bundle.applyCommandAvailable,
      writePolicy: bundle.writePolicy,
      activationSnapshotId: bundle.activationSnapshotId,
      files: bundle.files.map(({ content: _content, ...file }) => file),
      blockedUntil: bundle.blockedUntil,
    };
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `version-up activation-bundle: ${bundle.planId} planOnly=${bundle.planOnly} mustNotApply=${bundle.mustNotApply} activationAllowed=${bundle.activationAllowed} writePolicy=${bundle.writePolicy} output=${opts.out} files=${bundle.files.length}\n`,
    );
  });
versionUp
  .command("activation-packet")
  .description("emit non-destructive activation decision packets for version_target parked PLANs")
  .option("--json", "JSON output")
  .option("--plan <planId>", "filter by PLAN id")
  .action((opts: { json?: boolean; plan?: string }) => {
    const packets = buildVersionUpActivationPackets(loadVersionUpReadinessInput(process.cwd()));
    const filtered = opts.plan ? packets.filter((packet) => packet.planId === opts.plan) : packets;
    if (opts.plan && filtered.length === 0) {
      failPlanNotMatched("version-up activation-packet", opts.plan, opts.json);
      return;
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(filtered, null, 2)}\n`);
      return;
    }
    if (filtered.length === 0) {
      process.stdout.write("version-up activation-packet: no parked PLANs matched\n");
      return;
    }
    for (const packet of filtered) {
      process.stdout.write(
        `version-up activation-packet: ${packet.planId} status=${packet.status} planOnly=${packet.planOnly} activationAllowed=${packet.activationAllowed} applyCommandAvailable=${packet.applyCommandAvailable}\n`,
      );
      process.stdout.write(packetFreshnessLine(packet));
      process.stdout.write(
        `  activation-snapshot: snapshotId=${packet.activationSnapshot.snapshotId} headSha=${packet.activationSnapshot.headSha ?? "-"} sourceLedgerCheckedDate=${packet.activationSnapshot.sourceLedgerCheckedDate ?? "-"} sourceLedgerRowsDigest=${packet.activationSnapshot.sourceLedgerRowsDigest} approvalScopeDigest=${packet.activationSnapshot.approvalScopeDigest} versionDryRunDigest=${packet.activationSnapshot.versionDryRunDigest} evidenceDigest=${packet.activationSnapshot.evidenceDigest}\n`,
      );
      process.stdout.write(
        `  readiness: status=${packet.activationReadinessSummary.status} present=${packet.activationReadinessSummary.presentChecks} pending=${packet.activationReadinessSummary.pendingChecks} total=${packet.activationReadinessSummary.totalChecks} sourceLedgerFresh=${packet.activationReadinessSummary.sourceLedgerFresh}\n`,
      );
      process.stdout.write(
        `  verification-commands=${packet.activationVerificationCommandMatrix.length}\n`,
      );
      writeRecordTemplates(packet.recordTemplates, "  ");
      process.stdout.write(verificationSourceLines(packet.activationVerificationCommandMatrix));
      for (const checkName of packet.activationReadinessSummary.pendingCheckNames) {
        process.stdout.write(`  readiness-pending: ${checkName}\n`);
      }
      for (const reason of packet.blockedReasons) {
        process.stdout.write(`  blocked: ${reason}\n`);
      }
      for (const related of packet.relatedDecisionPackets) {
        process.stdout.write(
          `  related-packet: ${related.role} ${related.command} scoped=${related.scopedCommand ?? related.command} (${related.reason})\n`,
        );
      }
      for (const trigger of packet.reapprovalTriggers) {
        process.stdout.write(
          `  reapproval-trigger: ${trigger.trigger} -> ${trigger.requiredAction}\n`,
        );
      }
    }
  });

const s4 = program.command("s4").description("S4 PO decision planning surfaces");
s4.command("decision-packet")
  .description("emit non-destructive S4 decision packets for S3 pending PoC PLANs")
  .option("--json", "JSON output")
  .option("--plan <planId>", "filter by PLAN id")
  .action((opts: { json?: boolean; plan?: string }) => {
    const packets = buildS4DecisionPackets(loadS4DecisionReadinessInput(process.cwd()));
    const filtered = opts.plan ? packets.filter((packet) => packet.planId === opts.plan) : packets;
    if (opts.plan && filtered.length === 0) {
      failPlanNotMatched("s4 decision-packet", opts.plan, opts.json);
      return;
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(filtered, null, 2)}\n`);
      return;
    }
    if (filtered.length === 0) {
      process.stdout.write("s4 decision-packet: no S3 pending PoC PLANs matched\n");
      return;
    }
    for (const packet of filtered) {
      process.stdout.write(
        `s4 decision-packet: ${packet.planId} status=${packet.status} planOnly=${packet.planOnly} decisionAllowed=${packet.decisionAllowed} decisionCommandAvailable=${packet.decisionCommandAvailable}\n`,
      );
      process.stdout.write(packetFreshnessLine(packet));
      process.stdout.write(
        `  evidence-checks=${packet.decisionEvidenceChecklist.length} outcome-routes=${packet.outcomeRouteMatrix.length} verification-commands=${packet.decisionVerificationCommandMatrix.length}\n`,
      );
      writeRecordTemplates(packet.recordTemplates, "  ");
      process.stdout.write(verificationSourceLines(packet.decisionVerificationCommandMatrix));
      for (const reason of packet.blockedReasons) {
        process.stdout.write(`  blocked: ${reason}\n`);
      }
      for (const related of packet.relatedDecisionPackets) {
        process.stdout.write(
          `  related-packet: ${related.role} ${related.command} scoped=${related.scopedCommand ?? related.command} (${related.reason})\n`,
        );
      }
    }
  });

const actionBinding = program
  .command("action-binding")
  .description("human/action-binding approval planning surfaces");
actionBinding
  .command("approval-packet")
  .description("emit non-destructive approval packets for high-impact action-binding PLANs")
  .option("--json", "JSON output")
  .option("--plan <planId>", "filter by PLAN id")
  .action((opts: { json?: boolean; plan?: string }) => {
    const packets = buildActionBindingApprovalPackets(
      loadActionBindingApprovalReadinessInput(process.cwd()),
    );
    const filtered = opts.plan ? packets.filter((packet) => packet.planId === opts.plan) : packets;
    if (opts.plan && filtered.length === 0) {
      failPlanNotMatched("action-binding approval-packet", opts.plan, opts.json);
      return;
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(filtered, null, 2)}\n`);
      return;
    }
    if (filtered.length === 0) {
      process.stdout.write("action-binding approval-packet: no pending approval PLANs matched\n");
      return;
    }
    for (const packet of filtered) {
      process.stdout.write(
        `action-binding approval-packet: ${packet.planId} status=${packet.status} planOnly=${packet.planOnly} approvalAllowed=${packet.approvalAllowed} approvalCommandAvailable=${packet.approvalCommandAvailable}\n`,
      );
      process.stdout.write(packetFreshnessLine(packet));
      const checkCounts = packet.approvalBindingChecks.reduce(
        (counts, check) => {
          counts[check.status] += 1;
          return counts;
        },
        { concrete: 0, pending: 0, invalid: 0 },
      );
      process.stdout.write(
        `  binding-checks: concrete=${checkCounts.concrete} pending=${checkCounts.pending} invalid=${checkCounts.invalid} verification-commands=${packet.approvalVerificationCommandMatrix.length}\n`,
      );
      writeRecordTemplates(packet.recordTemplates, "  ");
      process.stdout.write(verificationSourceLines(packet.approvalVerificationCommandMatrix));
      for (const check of packet.approvalBindingChecks.filter(
        (approvalCheck) => approvalCheck.status !== "concrete",
      )) {
        process.stdout.write(
          `  binding-check: ${check.field} status=${check.status} reason=${check.reason}\n`,
        );
      }
      for (const reason of packet.blockedReasons) {
        process.stdout.write(`  blocked: ${reason}\n`);
      }
      for (const related of packet.relatedDecisionPackets) {
        process.stdout.write(
          `  related-packet: ${related.role} ${related.command} scoped=${related.scopedCommand ?? related.command} (${related.reason})\n`,
        );
      }
    }
  });

mcp
  .command("inspect <name>")
  .description("inspect an MCP profile through the MCP Inspector readiness gate")
  .option("--method <method>", "MCP method to inspect", "tools/list")
  .option("--allow-external", "allow disabled external MCP inspection after review")
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action(
    (
      name: string,
      opts: {
        method?: string;
        allowExternal?: boolean;
        json?: boolean;
        saveEvidence?: boolean;
      },
    ) => {
      const deps = nodeVerificationProbeDeps(process.cwd());
      const result = inspectMcpProfile(
        name,
        { method: opts.method, allowExternal: Boolean(opts.allowExternal) },
        deps,
      );
      if (!result) {
        process.stderr.write(`unknown MCP profile: ${name}\n`);
        process.exitCode = 1;
        return;
      }
      if (opts.saveEvidence) {
        saveVerificationEvidence({ kind: "mcp-inspect", id: name, payload: result }, deps);
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(`mcp inspect ${name}: ${result.status} method=${result.method}\n`);
        for (const message of result.messages) process.stdout.write(`  - ${message}\n`);
      }
      process.exitCode = result.status === "ready" ? 0 : 1;
    },
  );

const verify = program.command("verify").description("verification profile recommendation");
verify
  .command("recommend")
  .description("recommend verification profiles from changed files and emit an impact graph")
  .option("--changed <path...>", "changed path(s); defaults to git status --porcelain")
  .option("--format <format>", "text / json / mermaid", "text")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action(
    (opts: {
      changed?: string[];
      format?: "text" | "json" | "mermaid" | string;
      saveEvidence?: boolean;
    }) => {
      const deps = nodeVerificationProbeDeps(process.cwd());
      const changedFiles =
        opts.changed && opts.changed.length > 0 ? opts.changed : loadChangedFiles();
      const result = recommendVerificationProfiles(changedFiles);
      if (opts.saveEvidence) {
        saveVerificationEvidence(
          { kind: "verify-recommend", id: "changed-files", payload: result },
          deps,
        );
      }
      if (opts.format === "json") {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        return;
      }
      if (opts.format === "mermaid") {
        process.stdout.write(`${verificationRecommendationMermaid(result)}\n`);
        return;
      }
      process.stdout.write(
        `verify recommend: ${result.recommendations.length} profile(s), changed=${result.changedFiles.length}\n`,
      );
      for (const recommendation of result.recommendations) {
        const profile = recommendation.profile;
        const disabled = profile.defaultEnabled ? "" : " disabled-by-default";
        process.stdout.write(
          `  - ${profile.id}${disabled}: ${recommendation.signals.join(", ")} -> ${profile.command}\n`,
        );
      }
      if (result.missingProfiles.length > 0) {
        process.stdout.write(`missing/disabled profiles: ${result.missingProfiles.join(", ")}\n`);
      }
    },
  );

verify
  .command("run")
  .description("run an allow-listed verification profile")
  .requiredOption("--profile <id>", "profile id")
  .option("--dry-run", "print runnable command without executing")
  .option("--allow-external", "allow disabled-by-default external profile execution after review")
  .option("--json", "JSON output")
  .option("--save-evidence", SAVE_EVIDENCE_OPTION_DESCRIPTION)
  .action(
    (opts: {
      profile: string;
      dryRun?: boolean;
      allowExternal?: boolean;
      json?: boolean;
      saveEvidence?: boolean;
    }) => {
      const deps = nodeVerificationProbeDeps(process.cwd());
      const result = runVerificationProfile(
        opts.profile,
        {
          dryRun: Boolean(opts.dryRun),
          allowExternal: Boolean(opts.allowExternal),
        },
        deps,
      );
      if (!result) {
        process.stderr.write(`unknown profile: ${opts.profile}\n`);
        process.exitCode = 1;
        return;
      }
      if (opts.saveEvidence) {
        saveVerificationEvidence({ kind: "verify-run", id: opts.profile, payload: result }, deps);
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(
          `verify run ${result.profile.id}: ${result.status} command="${result.command}"\n`,
        );
        for (const message of result.messages) process.stdout.write(`  - ${message}\n`);
      }
      process.exitCode = result.status === "passed" || result.status === "dry-run" ? 0 : 1;
    },
  );

const runDebug = program.command("run-debug").description("L7.5 RUN & Debug evidence logging");
runDebug
  .command("log")
  .description("append a runtime verification log event for L7.5 RUN & Debug")
  .requiredOption("--plan <id>", "PLAN id")
  .requiredOption(
    "--claim <claim>",
    "runtime claim: fired|used|works|blocked|recovered|observed|executed",
  )
  .requiredOption("--session <id>", "runtime session_id")
  .requiredOption("--correlation <id>", "correlation id joining command/log/test evidence")
  .requiredOption("--evidence-path <path>", "repo-relative evidence path for the runtime proof")
  .option("--requirement <id>", "requirement id")
  .option("--oracle <id>", "test oracle id")
  .option(
    "--source <source>",
    "runtime-hook|adapter-command|run-debug|hosted-preflight",
    "run-debug",
  )
  .option(
    "--surface <surface>",
    "claude-hook|codex-hook|codex-hosted-api|helix-cli|external-api",
    "helix-cli",
  )
  .option(
    "--redaction <policy>",
    "secret-redacted|no-secret-material|blocked-sensitive",
    "no-secret-material",
  )
  .option("--occurred-at <iso>", "runtime occurrence timestamp (default: now)")
  .option(
    "--output <path>",
    "repo-relative append-only JSONL path",
    DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
  )
  .option("--json", "JSON output")
  .action(
    (opts: {
      plan: string;
      claim: string;
      session: string;
      correlation: string;
      evidencePath: string;
      requirement?: string;
      oracle?: string;
      source: string;
      surface: string;
      redaction: "secret-redacted" | "no-secret-material" | "blocked-sensitive" | string;
      occurredAt?: string;
      output: string;
      json?: boolean;
    }) => {
      try {
        const repoRoot = process.cwd();
        const written = appendRuntimeVerificationLogEvent(
          {
            plan_id: opts.plan,
            requirement_id: opts.requirement,
            test_oracle_id: opts.oracle,
            claim: opts.claim as RuntimeClaim,
            session_id: opts.session,
            source: opts.source as Exclude<RuntimeEvidenceSource, "projection">,
            runtime_surface: opts.surface as RuntimeSurface,
            correlation_id: opts.correlation,
            evidence_path: opts.evidencePath,
            occurred_at: opts.occurredAt ?? new Date().toISOString(),
            redaction_policy: opts.redaction as
              | "secret-redacted"
              | "no-secret-material"
              | "blocked-sensitive",
          },
          {
            repoRoot,
            appendText: (path, content) => {
              mkdirSync(dirname(path), { recursive: true });
              appendFileSync(path, content, "utf8");
            },
          },
          opts.output,
        );
        if (opts.json) process.stdout.write(`${JSON.stringify(written, null, 2)}\n`);
        else {
          process.stdout.write(
            `run-debug log: appended ${written.event.event_id} -> ${written.path}\n`,
          );
        }
      } catch (error) {
        process.stderr.write(`run-debug log failed: ${String(error)}\n`);
        process.exitCode = 1;
      }
    },
  );

// PLAN-L7-32 §9 discharge: cross-artifact relation graph CLI (ADR-002 A-124 surface)。
// 純関数 (collect/analyze/export) は src/lint/relation-graph.ts、repo→source set loader は
// src/graph/loader.ts。doc/source graph に集中し db-table node は projection-writer 経由で別供給。
const graph = program
  .command("graph")
  .description("cross-artifact relation graph (impact analysis / diagram export)");
graph
  .command("impact")
  .description("compute impact of changed files across the cross-artifact relation graph")
  .option("--changed <path...>", "changed path(s); defaults to git status --porcelain")
  .action((opts: { changed?: string[] }) => {
    const repoRoot = process.cwd();
    const changedFiles =
      opts.changed && opts.changed.length > 0 ? opts.changed : loadChangedFiles();
    const projection = collectRelationGraphProjection(loadRelationGraphSourceSet(repoRoot));
    const result = analyzeRelationImpact({
      changedPaths: changedFiles,
      projection,
    });
    process.stdout.write(
      `graph impact: changed=${result.changedNodes.length}, impacted=${result.impacted.length}, actions=${result.actions.length}\n`,
    );
    for (const n of result.changedNodes) process.stdout.write(`  changed: ${n.id}\n`);
    for (const n of result.impacted) process.stdout.write(`  impacted: ${n.id}\n`);
    for (const a of result.actions) {
      process.stdout.write(`  action: ${a.kind} -> ${a.nodeId} (${a.reason})\n`);
    }
    for (const f of result.findings) {
      process.stdout.write(`  [${f.severity}] ${f.code}: ${f.message}\n`);
    }
    process.exitCode = result.ok ? 0 : 1;
  });
graph
  .command("export")
  .description("export the relation graph as a diagram (mermaid|dot|d2)")
  .option("--format <format>", "mermaid | dot | d2", "mermaid")
  .option("--scope <scope>", "filter diagram to matching graph nodes plus adjacent edges")
  .action((opts: { format?: string; scope?: string }) => {
    const repoRoot = process.cwd();
    if (!isSafeRelationGraphScope(opts.scope)) {
      process.stderr.write(
        `[error] invalid-scope: graph export scope must be a repo-relative prefix (got ${opts.scope})\n`,
      );
      process.exitCode = 1;
      return;
    }
    const projection = filterRelationGraphProjectionByScope(
      collectRelationGraphProjection(loadRelationGraphSourceSet(repoRoot)),
      opts.scope,
    );
    const requestedFormat = opts.format ?? "mermaid";
    if (requestedFormat !== "mermaid" && requestedFormat !== "dot" && requestedFormat !== "d2") {
      process.stderr.write(
        `[error] invalid-format: graph export format must be mermaid, dot, or d2 (got ${requestedFormat})\n`,
      );
      process.exitCode = 1;
      return;
    }
    const format = requestedFormat;
    // dot/d2 はこの段階では純粋なテキスト表現を emit する。Graphviz / D2 CLI での
    // SVG/PDF/PNG rendering は後段 adapter の責務で、ここでは外部コマンドを起動しない。
    const availableAdapters: RelationDiagramAdapter[] = format === "mermaid" ? [] : [format];
    const artifact = exportRelationDiagram({
      snapshot: projection,
      format,
      availableAdapters,
    });
    if (opts.scope) process.stdout.write(`# scope=${opts.scope}\n`);
    if (!artifact.ok) {
      for (const f of artifact.findings) {
        process.stderr.write(`[${f.severity}] ${f.code}: ${f.message}\n`);
      }
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`${artifact.content}\n`);
  });

const session = program.command("session").description("session-log runtime events");
session
  .command("start")
  .description("record SessionStart through the shared session-log core")
  .option("--session <id>", SESSION_OPTION_DESCRIPTION)
  .action((opts: { session?: string }) => {
    const input = readHookInput(HOOK_EVENT_SESSION_START, opts.session);
    const repoRoot = process.cwd();
    const deps = nodeDeps(repoRoot, gitBranch, gitHead);
    runSessionStartSideEffects(repoRoot, input, deps);
    dispatch(input, deps, HOOK_EVENT_SESSION_START);
    // HELIX P7: surface harness-layer agent memory at SessionStart so the shared,
    // git-tracked SSoT (.helix/memory/harness.jsonl) is recalled instead of a
    // per-agent silo. surfaceMemory reads fail-soft (empty when absent).
    const memoryLines = surfaceMemory(fileMemoryDeps({ root: repoRoot }));
    if (memoryLines.length > 0) {
      process.stdout.write(`harness-memory (${memoryLines.length}):\n${memoryLines.join("\n")}\n`);
    }
    process.stdout.write(`session-log: start ${input.session_id ?? "helix-cli"}\n`);
  });

session
  .command("summary")
  .description("compress session events into PLAN digest and surface handover discipline warnings")
  .option("--session <id>", SESSION_OPTION_DESCRIPTION)
  .option(
    "--quiet",
    "suppress stdout (Codex 0.144+ は Stop hook の非 JSON stdout を Failed 扱いするため hook 配線で使う。warning は従来どおり stderr)",
  )
  .action((opts: { session?: string; quiet?: boolean }) => {
    const input = readHookInput("Stop", opts.session);
    dispatch(input, nodeDeps(process.cwd(), gitBranch, gitHead), "Stop");
    if (!opts.quiet) {
      process.stdout.write(`session-log: summary ${input.session_id ?? "helix-cli"}\n`);
    }
  });

const hook = program.command("hook").description("package-local hook entrypoints");
hook
  .command("agent-guard")
  .description("block unsafe Claude/Codex sub-agent dispatch before execution")
  .action(() => {
    const repoRoot = process.cwd();
    const input = readStrictHookInput();
    if (input === null) {
      process.stderr.write(
        "[helix-guard] BLOCK: hook stdin が空、または JSON 解析に失敗しました (fail-close)。\n",
      );
      process.exitCode = 2;
      return;
    }
    const decision = evaluateAgentGuard(input, {
      resolveAgentFamily: (subagentType) => resolveAgentFamilyFromRepo(repoRoot, subagentType),
      allowRaw: process.env.HELIX_ALLOW_RAW_AGENT === "1",
    });
    if (decision.message) process.stderr.write(`${decision.message}\n`);

    const passedKind = input.tool_input?.subagent_type ?? input.tool_input?.agent_type;
    if (decision.code === 0 && passedKind) {
      try {
        const { activeCount, exceeded } = recordGuardFire(
          { agentKind: passedKind },
          nodeAgentSlotsDeps(repoRoot),
        );
        if (exceeded) {
          process.stderr.write(
            `[helix-guard] WARN: concurrent sub-agents=${activeCount}, limit=${DEFAULT_MAX_PARALLEL}. Check serialization requirements.\n`,
          );
        }
      } catch {
        // Slot accounting is advisory; guard allow/block decision must not depend on log I/O.
      }
    }

    if (decision.code === 0) {
      process.stdout.write(
        `agent-guard: ${decision.bypassed ? "bypassed" : "pass"} ${
          passedKind ? `kind=${passedKind}` : "kind=none"
        }\n`,
      );
    }
    process.exitCode = decision.code;
  });

hook
  .command("git-command-guard")
  .description("block destructive git history/worktree operations before shell execution")
  .action(() => {
    const rawInput = process.stdin.isTTY ? "" : readStdin();
    if (!rawInput.trim()) {
      process.stderr.write(
        "[helix-git-command-guard] BLOCK: hook stdin が空、または JSON 解析に失敗しました (fail-close)。\n",
      );
      process.exitCode = 2;
      return;
    }
    const outcome = runGitCommandGuardHook({ repoRoot: process.cwd(), rawInput, env: process.env });
    if (outcome.message) process.stderr.write(`${outcome.message}\n`);
    if (outcome.exitCode === 0) {
      process.stdout.write(`git-command-guard: pass (${outcome.reason ?? "safe-git"})\n`);
    }
    process.exitCode = outcome.exitCode;
  });

hook
  .command("work-guard")
  .description("block edits to foreign uncommitted files (hybrid runtime collision guard)")
  .action(() => {
    // consumer 配布経路 (setup template の `helix hook work-guard`、PLAN-L7-433 C1)。
    // 実行本体はdev repo hook (.claude/hooks/work-guard.ts)と共有し、入力/transaction failureはfail-closeする。
    const raw = process.stdin.isTTY ? "" : readStdin();
    const outcome = runWorkGuardHook({
      repoRoot: process.cwd(),
      rawInput: raw,
      env: process.env,
    });
    if (outcome.message) process.stderr.write(`${outcome.message}\n`);
    if (outcome.exitCode === 0) {
      process.stdout.write("work-guard: pass\n");
    }
    process.exitCode = outcome.exitCode;
  });

hook
  .command("post-tool-use")
  .description("record PostToolUse through the shared session-log core")
  .option("--session <id>", SESSION_OPTION_DESCRIPTION)
  .option("--tool <name>", "tool_name override")
  .option("--path <path>", "file_path/path target hint")
  .option("--command <command>", "Bash command target hint")
  .option("--outcome <outcome>", "tool outcome: ok or error")
  .action(
    (opts: {
      session?: string;
      tool?: string;
      path?: string;
      command?: string;
      outcome?: "ok" | "error";
    }) => {
      const input = readHookInput("PostToolUse", opts.session);
      const toolInput: Record<string, unknown> = {
        ...(input.tool_input ?? {}),
        ...(opts.path ? { file_path: opts.path } : {}),
        ...(opts.command ? { command: opts.command } : {}),
      };
      dispatch(
        {
          ...input,
          hook_event_name: "PostToolUse",
          tool_name: opts.tool ?? input.tool_name ?? (opts.command ? "Bash" : "manual"),
          tool_input: toolInput,
          tool_response: opts.outcome
            ? {
                ...(typeof input.tool_response === "object" ? input.tool_response : {}),
                outcome: opts.outcome,
              }
            : input.tool_response,
        },
        nodeDeps(process.cwd(), gitBranch, gitHead),
        "PostToolUse",
      );
      process.stdout.write(`session-log: post-tool-use ${input.session_id ?? "helix-cli"}\n`);
    },
  );

hook
  .command("subagent-stop")
  .description(
    "SubagentStop: agent_guard slot を 1 件 (最古) release し active 数を実時間で正確化 (fail-open)",
  )
  .option(
    "--quiet",
    "suppress stdout (Codex 0.144+ は SubagentStop hook の非 JSON stdout を Failed 扱いするため hook 配線で使う)",
  )
  .action((opts: { quiet?: boolean }) => {
    // SubagentStop payload (session_id/transcript_path/stop_hook_active) は終了 subagent の
    // slot_id を含まず slot 個体相関に使えないため読まない (設計根拠 = agent-slots.md §2.4)。
    const released = releaseOldestGuardSlot(nodeAgentSlotsDeps(process.cwd()));
    if (!opts.quiet) {
      process.stdout.write(
        released
          ? `agent-slots: released ${released.slot_id} (${released.agent_kind})\n`
          : "agent-slots: no running guard slot to release\n",
      );
    }
  });

const guard = program.command("guard").description("manual guard checks for non-hooked runtimes");
guard
  .command("preflight")
  .description("run work-guard before hosted/API edits that cannot execute repo-local Codex hooks")
  .option("--target <path...>", "repo-relative or absolute target path(s) to edit")
  .option("--patch-file <path>", "patch file to scan for apply_patch headers")
  .option("--stdin", "read an apply_patch body from stdin")
  .option("--session <id>", "session_id used to load already-touched files")
  .option("--json", "JSON output")
  .option("--allow-foreign-edit", "intentional bypass; equivalent to an explicit guard override")
  .action(
    (opts: {
      target?: string[];
      patchFile?: string;
      stdin?: boolean;
      session?: string;
      json?: boolean;
      allowForeignEdit?: boolean;
    }) => {
      const repoRoot = process.cwd();
      const targetPaths = (opts.target ?? []).map((target) =>
        normalizeRepoRelative(target, repoRoot),
      );
      if (opts.patchFile) {
        targetPaths.push(
          ...guardTargetsFromPatchText(readFileSync(opts.patchFile, "utf8"), repoRoot),
        );
      }
      if (opts.stdin) {
        targetPaths.push(...guardTargetsFromPatchText(readStdin(), repoRoot));
      }
      const override = resolveForeignEditOverride({
        env: opts.allowForeignEdit ? "1" : process.env.HELIX_ALLOW_FOREIGN_EDIT,
      });
      const result = evaluateWorkGuardTargets({
        targetPaths,
        uncommittedFiles: loadChangedFiles(repoRoot),
        sessionTouchedFiles: sessionTouchedFilesForGuard(repoRoot, opts.session),
        bypass: override.bypass,
      });
      const adapterParity = validateAdapterParityMap({
        surface: "codex-hosted-api",
        toolName: opts.patchFile || opts.stdin ? "apply_patch" : "manual",
      });
      const hostedPreflight = requireHostedSurfacePreflight({
        surface: "codex-hosted-api",
        operation: targetPaths.length > 0 ? "edit" : "dry_run",
        hookNonEnforcementAcknowledged: true,
        gitStatusChecked: true,
        targetPaths,
        workGuardDecision: result,
        preflightCommand: "helix guard preflight",
        auditRecord: opts.session ?? "cli-stdout",
      });
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify(
            {
              ...result,
              override,
              adapterParity,
              hostedPreflight,
              apiToolPathEnforced: hostedPreflight.apiToolPathEnforced,
              note: "hosted/API tools do not execute .codex/hooks.json; guard preflight is the repo-side substitute",
            },
            null,
            2,
          )}\n`,
        );
      } else if (result.blocked) {
        process.stderr.write(`${result.blocked.message}\n`);
      } else if (hostedPreflight.kind === "deny") {
        process.stderr.write(`hosted preflight denied: ${hostedPreflight.reason}\n`);
      } else {
        process.stdout.write(
          `guard preflight: pass (${result.reason}, targets=${result.results.length})\n`,
        );
      }
      process.exitCode = result.decision === "block" || hostedPreflight.kind === "deny" ? 2 : 0;
    },
  );

guard
  .command("branch-kind")
  .description("check governed branch prefix, PLAN kind, and PR branch naming rules")
  .option("--branch <name>", "branch name to inspect (defaults to current git branch)")
  .option("--changed <path...>", "changed path(s) from PR or local diff")
  .option("--strict-unknown-prefix", "fail ungoverned branch prefixes such as unknown/foo")
  .option("--json", "JSON output")
  .action(
    (opts: {
      branch?: string;
      changed?: string[];
      strictUnknownPrefix?: boolean;
      json?: boolean;
    }) => {
      const input = loadBranchKindInputForGuard({
        branch: opts.branch,
        changed: opts.changed,
        strictUnknownPrefix: opts.strictUnknownPrefix,
      });
      const result = analyzeBranchKind(input);
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        for (const message of branchKindMessages(result)) process.stdout.write(`${message}\n`);
      }
      process.exitCode = result.ok ? 0 : 1;
    },
  );

guard
  .command("commitlint")
  .description("check git commit subjects against the HELIX GitHub operation rule")
  .option("--range <range>", "git revision range to inspect")
  .option("--subject <subject...>", "explicit commit subject(s) to inspect")
  .option("--json", "JSON output")
  .action((opts: { range?: string; subject?: string[]; json?: boolean }) => {
    if (!opts.range && (!opts.subject || opts.subject.length === 0)) {
      process.stderr.write("guard commitlint requires --range or --subject\n");
      process.exitCode = 1;
      return;
    }
    const subjects =
      opts.subject && opts.subject.length > 0
        ? opts.subject
        : gitCommitSubjectsForRange(opts.range as string);
    const result = analyzeCommitSubjects(subjects);
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      for (const message of commitlintMessages(result)) process.stdout.write(`${message}\n`);
    }
    process.exitCode = result.ok ? 0 : 1;
  });

guard
  .command("pr-context")
  .description("check PR-only GitHub operation rules such as poc and hotfix merge constraints")
  .option("--event-name <name>", "GitHub event name (defaults to GITHUB_EVENT_NAME)")
  .option("--head <branch>", "PR head branch (defaults to GITHUB_HEAD_REF)")
  .option("--base <branch>", "PR base branch (defaults to GITHUB_BASE_REF)")
  .option("--body <text>", "PR body text")
  .option("--body-file <path>", "file containing PR body text")
  .option("--json", "JSON output")
  .action(
    (opts: {
      eventName?: string;
      head?: string;
      base?: string;
      body?: string;
      bodyFile?: string;
      json?: boolean;
    }) => {
      let body = opts.body ?? process.env.PR_BODY ?? "";
      if (opts.bodyFile) {
        body = readFileSync(opts.bodyFile, "utf8");
      }
      const result = analyzePrContext({
        eventName: opts.eventName ?? process.env.GITHUB_EVENT_NAME,
        headBranch: opts.head ?? process.env.GITHUB_HEAD_REF,
        baseBranch: opts.base ?? process.env.GITHUB_BASE_REF,
        body,
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        for (const message of prContextGuardMessages(result)) process.stdout.write(`${message}\n`);
      }
      process.exitCode = result.ok ? 0 : 1;
    },
  );

const plan = program.command("plan").description("PLAN 操作");
plan
  .command("lint [path]")
  .description("PLAN lint")
  .option(
    "--gate <id>",
    "run a named PLAN gate lint (schedule, descent, entry-routing, governance/frontmatter, G1-trace, G3-trace)",
  )
  .option("--write-baseline", "write a machine-generated baseline for the selected gate")
  .action((path?: string, opts?: { gate?: string; writeBaseline?: boolean }) => {
    const r = lintPlanWithGateOptions({
      path,
      repoRoot: process.cwd(),
      gate: opts?.gate,
      writeBaseline: Boolean(opts?.writeBaseline),
    });
    for (const m of r.messages) process.stdout.write(`${m}\n`);
    process.exitCode = r.ok ? 0 : 1;
  });

plan
  .command("use [id]")
  .description(
    "active PLAN を .helix/state/current-plan に記録 (session-log digest を活性化)。--clear で解除",
  )
  .option("--clear", "current-plan を clear")
  .action((id: string | undefined, opts: { clear?: boolean }) => {
    if (!opts.clear && !id) {
      process.stderr.write("plan use <id> または --clear を指定してください\n");
      process.exitCode = 1;
      return;
    }
    if (opts.clear) {
      clearActivePlan(nodeDeps(process.cwd(), gitBranch, gitHead));
      process.stdout.write("current-plan: cleared\n");
      return;
    }
    const selection = activatePlan(id as string, nodeDeps(process.cwd(), gitBranch, gitHead));
    if (!selection.ok) {
      process.stderr.write(`plan use: unknown PLAN ID: ${id}\n`);
      if (selection.candidates.length > 0) {
        process.stderr.write(`candidates: ${selection.candidates.join(", ")}\n`);
      }
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`current-plan: ${selection.planId}\n`);
  });

plan
  .command("complete [id]")
  .description("PLAN 完了をevent-first continuationへ記録し、成功後にcurrent-planをclear")
  .action((id: string | undefined) => {
    const repoRoot = process.cwd();
    const sessionDeps = nodeDeps(repoRoot, gitBranch, gitHead);
    const planId = id ?? resolveActivePlan(sessionDeps);
    if (!planId) {
      process.stderr.write("plan complete requires <id> or active current-plan\n");
      process.exitCode = 1;
      return;
    }
    const head = gitHead() ?? "unknown";
    const operationId = `plan-complete:${createHash("sha256").update(`${planId}:${head}`).digest("hex")}`;
    const result = writePlanCompletionContinuation(
      {
        repoRoot,
        sessionId: `plan-${planId}`,
        operationId,
        completedPlanId: planId,
        nextAction: "helix status",
        memoryRef: null,
        recordedAt: new Date().toISOString(),
      },
      { clearActivePlan: () => clearActivePlan(sessionDeps) },
    );
    if (!result.ok || !result.published) {
      process.stderr.write(
        `plan complete failed: ${result.findings.join(",") || "continuation_not_published"}\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `plan complete: plan=${planId} event=${result.event.eventId} checkpoint=published current-plan=cleared\n`,
    );
  });

const provider = program.command("provider").description("provider evidence operations");
const providerHandover = provider.command("evidence").description("Claude/Codex provider evidence");
providerHandover
  .command("export")
  .description("write provider evidence package under .helix/handover/provider")
  .requiredOption("--from <runtime>", "claude or codex")
  .requiredOption("--to <runtime>", "claude or codex")
  .requiredOption("--summary <text>", "handover context summary")
  .option("--plan <id>", "active PLAN (defaults to current-plan/branch resolution)")
  .option("--budget <text>", "budget or constraint summary")
  .option("--next-action <text...>", "next actions")
  .option("--file <path...>", "relevant files")
  .option("--dry-run", "do not write files")
  .action(
    (
      opts: {
        from: ProviderRuntime;
        to: ProviderRuntime;
        summary: string;
        plan?: string;
        budget?: string;
        nextAction?: string[];
        file?: string[];
        dryRun?: boolean;
      },
      cmd: Command,
    ) => {
      const localOpts = cmd.opts() as typeof opts;
      const chainPlan = optionFromCommandChain<string>(cmd, "plan");
      const chainBudget = optionFromCommandChain<string>(cmd, "budget");
      const chainNextAction = optionFromCommandChain<string[]>(cmd, "nextAction");
      const chainFile = optionFromCommandChain<string[]>(cmd, "file");
      const chainDryRun = optionFromCommandChain<boolean>(cmd, "dryRun");
      const planId =
        localOpts.plan ??
        opts.plan ??
        chainPlan ??
        resolveActivePlan(nodeDeps(process.cwd(), gitBranch));
      if (!planId) {
        process.stderr.write("provider evidence requires --plan or active current-plan\n");
        process.exitCode = 1;
        return;
      }
      try {
        const result = runProviderHandover(
          {
            from: opts.from,
            to: opts.to,
            activePlan: planId,
            budget: localOpts.budget ?? opts.budget ?? chainBudget ?? null,
            summary: opts.summary,
            nextActions: localOpts.nextAction ?? opts.nextAction ?? chainNextAction ?? [],
            files: localOpts.file ?? opts.file ?? chainFile ?? [],
            dryRun: Boolean(localOpts.dryRun ?? opts.dryRun ?? chainDryRun),
          },
          nodeProviderHandoverDeps(process.cwd()),
        );
        process.stdout.write(`${JSON.stringify(result.package, null, 2)}\n`);
        for (const w of result.written) process.stdout.write(`  + ${w}\n`);
      } catch (e) {
        process.stderr.write(`${String(e)}\n`);
        process.exitCode = 1;
      }
    },
  );

providerHandover
  .command("status")
  .description("show latest provider evidence package")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const current = readProviderHandoverCurrent(nodeProviderHandoverDeps(process.cwd()));
    if (!current) {
      process.stderr.write("provider evidence: CURRENT.json not found\n");
      process.exitCode = 1;
      return;
    }
    if (opts.json) process.stdout.write(`${JSON.stringify(current, null, 2)}\n`);
    else {
      process.stdout.write(
        `provider evidence: ${current.handover_id} ${current.from}->${current.to} plan=${current.active_plan}\n`,
      );
    }
  });

const db = program
  .command("db")
  .description("harness.db projection state (PLAN-L7-44 工程表、span ① foundation)");
db.command("status")
  .description(
    "harness.db の schema version / table / 行数 / orphan を報告 (read-only、新規作成しない)",
  )
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const s = harnessDbStatus(process.cwd());
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(s, null, 2)}\n`);
      return;
    }
    if (!s.initialized) {
      process.stdout.write(
        `db status: not initialized (${s.path})\n  → 'helix db rebuild' で schema を作成\n`,
      );
      return;
    }
    const stale = s.schemaVersion !== s.expectedVersion ? ` (expected ${s.expectedVersion})` : "";
    process.stdout.write(
      `db status: schema v${s.schemaVersion}${stale}, tables ${s.tableCount}, rows ${s.totalRows}, orphan trace_edges ${s.orphanTraceEdges}\n`,
    );
    if (s.missingTables.length > 0) {
      process.stdout.write(`  ⚠ missing tables: ${s.missingTables.join(", ")}\n`);
    }
  });
db.command("rebuild")
  .description("harness.db schema と deterministic projection を再構築")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const r = rebuildHarnessDb({ repoRoot: process.cwd() });
    refreshPersistedDriveDbRegistrationStats(process.cwd());
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      return;
    }
    const totalRows = Object.values(r.rowCounts).reduce((sum, n) => sum + n, 0);
    process.stdout.write(
      `db rebuild: projection ${r.ok ? "ok" : "failed"}, rows ${totalRows} (${r.path})\n`,
    );
    process.stdout.write(
      "  note: plans / roadmap rollups / review evidence / optional Phase3 outputs を projection\n",
    );
  });
db.command("gc")
  .description("期限超過した .helix/tmp 生成物を明示的に掃除（audit evidence は対象外）")
  .option("--max-age-hours <hours>", "保持時間", "168")
  .option("--apply", "候補を削除（省略時 dry-run）")
  .option("--json", "JSON output")
  .action((opts: { maxAgeHours: string; apply?: boolean; json?: boolean }) => {
    const hours = Number(opts.maxAgeHours);
    if (!Number.isFinite(hours) || hours < 0) throw new Error("max-age-hours must be non-negative");
    const result = gcTmp({
      root: join(process.cwd(), ".helix", "tmp"),
      nowMs: Date.now(),
      maxAgeMs: hours * 3_600_000,
      apply: opts.apply === true,
    });
    process.stdout.write(
      opts.json
        ? `${JSON.stringify(result, null, 2)}\n`
        : `db gc: candidates=${result.candidates.length} removed=${result.removed} apply=${result.apply}\n`,
    );
  });
db.command("compact")
  .description("harness.db compact preflight（--execute 明示時のみ backup + exclusive VACUUM）")
  .option("--execute", "backup/preflight後に明示実行")
  .option("--json", "JSON output")
  .action((opts: { execute?: boolean; json?: boolean }) => {
    const result = compactHarnessDb({ repoRoot: process.cwd(), execute: opts.execute === true });
    process.stdout.write(
      opts.json
        ? `${JSON.stringify(result, null, 2)}\n`
        : `db compact: ok=${result.ok} executed=${result.executed} reason=${result.reason}\n`,
    );
    if (!result.ok) process.exitCode = 1;
  });
db.command("hygiene")
  .description("harness.db freelist 比を read-only 表示")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const handle = openHarnessDbReadOnly(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const result = databaseFreelist(handle);
      process.stdout.write(
        opts.json
          ? `${JSON.stringify(result, null, 2)}\n`
          : `db hygiene: pages=${result.pageCount} freelist=${result.freelistCount} ratio=${(result.ratio * 100).toFixed(1)}%\n`,
      );
    } finally {
      handle.close();
    }
  });

const lane = program.command("lane").description("multi-runtime git lane hygiene");
lane
  .command("status")
  .option("--base <ref>", "comparison base", "origin/main")
  .option("--json", "JSON output")
  .action((opts: { base: string; json?: boolean }) => {
    const result = inspectLane(process.cwd(), opts.base);
    if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else {
      process.stdout.write(
        `lane status: ${result.branch || "(detached)"} ${result.state} unique=${result.unique} equivalent=${result.equivalent}\n`,
      );
      for (const row of result.prunableWorktrees)
        process.stdout.write(
          `  warning: prunable worktree ${row.path} (${row.reason}) — run git worktree prune explicitly\n`,
        );
    }
  });

function summarizeRecoveryHandoffGateForCli(gate: VmodelFitReport["recovery_handoff_gate"] | null) {
  if (!gate) return null;
  return {
    status: gate.status,
    effective_phase: gate.effective_phase,
    command: summaryJsonCommand(gate.command),
    handoff_present: gate.handoff_present,
    handoff_missing: gate.handoff_missing,
    approval_status: gate.approval_status,
    scope_status: gate.scope_status,
    decision_id: gate.decision_id,
    approval_record_path: gate.approval_record_path,
    approval_scope_digest: gate.approval_scope_digest,
    expected_approval_scope_digest: gate.expected_approval_scope_digest,
    materialize_status: gate.materialize_status,
    valid_for_apply: gate.valid_for_apply,
    approval_state: gate.approval_state,
  };
}

function effectiveRecoveryReentryStatusForCli(
  rawStatus: string,
  gate: VmodelFitReport["recovery_handoff_gate"] | null,
): string {
  if (!gate || gate.status === "none") return rawStatus;
  if (gate.effective_phase === "approval") return gate.status;
  if (gate.status === "apply_dry_run") return "apply_ready";
  return rawStatus;
}

function projectRecoveryHandoffGate(
  snapshot: ProjectCurrentLocationSnapshot,
  repoRoot: string,
): VmodelFitReport["recovery_handoff_gate"] | null {
  if (!snapshot.recovery) return null;
  return buildVmodelFitReport(snapshot, analyzeVmodelZipManifest(repoRoot), {
    repoRoot,
  }).recovery_handoff_gate;
}

function summarizeProjectFunctionDesignPolicy(snapshot: ProjectCurrentLocationSnapshot) {
  const detailCoverage = snapshot.design_coverage_gate.items.find(
    (item) => item.coverageId === "L5-detailed-contract",
  );
  const tailoringDetail = snapshot.tailoring_gate.items.find(
    (item) => item.tailoringId === "HVM-TAILOR-DETAIL-CONTRACT",
  );
  const status =
    detailCoverage?.status === "covered" && tailoringDetail?.status === "declared"
      ? "pass"
      : "needs_absorption";

  return {
    status,
    independent_layer_policy: "abolished",
    detail_contract_coverage_status: detailCoverage?.status ?? "missing",
    tailoring_detail_contract_status: tailoringDetail?.status ?? "missing",
    accepted_layers: ["L5", "L7", "typed declaration", "runtime evidence"],
    absorbed_surfaces: [
      "L5 detailed design",
      "design_declarations",
      "L7 TDD closure",
      "test_runs",
      "gate_runs",
      "runtime_verification_events",
    ],
    command: "helix current-location --summary-json",
    required_action:
      "独立した重い機能設計層を要求せず、必要な契約を L5 詳細設計・typed declaration・L7 TDD closure・runtime evidence へ吸収する",
  };
}

function summarizeCurrentLocationFrontier(snapshot: ProjectCurrentLocationSnapshot) {
  const hasL14L7Contradiction = snapshot.findings.some(
    (finding) => finding.code === "l14_claim_with_l7_work",
  );
  const activeRecovery = snapshot.current.status === "needs_recovery";
  const recovery = snapshot.recovery;
  const nextRecoveryCommand =
    recovery?.reentry_forecast.next_command ??
    recovery?.automation_runway.next_machine_command ??
    "helix drive model --summary-json";

  return {
    schema_version: "current-location-frontier-summary.v1",
    frontier_type: activeRecovery ? "recovery_frontier" : "forward_frontier",
    status: activeRecovery ? "recovery_required" : "current",
    classification: hasL14L7Contradiction
      ? "l14_claim_with_l7_work"
      : activeRecovery
        ? "recovery_queue"
        : "no_current_location_contradiction",
    completion_boundary: snapshot.current.completion_boundary,
    selected_model: snapshot.drive_route.selectedModel,
    route_id: snapshot.drive_route.routeId,
    must_return_to_design: snapshot.drive_route.mustReturnToDesign,
    open_l7_count: snapshot.closure.l7_open_plan_ids.length,
    terminal_l14_claim_count: snapshot.closure.terminal_l14_plan_ids.length,
    sample_open_l7_plan_ids: snapshot.closure.l7_open_plan_ids.slice(
      0,
      CLOSURE_SUMMARY_SAMPLE_LIMIT,
    ),
    sample_terminal_l14_plan_ids: snapshot.closure.terminal_l14_plan_ids.slice(
      0,
      CLOSURE_SUMMARY_SAMPLE_LIMIT,
    ),
    finding_codes: snapshot.findings.map((finding) => finding.code),
    selected_closure_action: recovery?.selected_closure_action ?? null,
    queue_total: snapshot.closure.queue.total,
    route_counts: snapshot.closure.queue.route_counts,
    automation: recovery
      ? {
          status: recovery.automation_runway.status,
          machine_actionable_count: recovery.automation_runway.machine_actionable_count,
          human_approval_count: recovery.automation_runway.human_approval_count,
          design_reverse_count: recovery.automation_runway.design_reverse_count,
          remaining_after_machine_lanes: recovery.automation_runway.remaining_after_machine_lanes,
        }
      : null,
    reentry: recovery
      ? {
          status: recovery.reentry_forecast.status,
          next_gate: recovery.reentry_forecast.next_gate,
          next_phase_action: recovery.reentry_forecast.next_phase_action,
          next_command: summaryJsonCommand(nextRecoveryCommand),
          next_execution_command: summaryJsonCommand(
            recovery.reentry_forecast.next_execution_command,
          ),
        }
      : null,
    commands: {
      current_location: "helix current-location --summary-json",
      drive_model: "helix drive model --summary-json",
      recovery_plan: "helix recovery plan --summary-json",
      roadmap_current: "helix roadmap current --summary-json",
      vmodel_fit: "helix vmodel fit --summary-json",
      project_frontier: "helix progress frontier --summary-json",
    },
    required_action: hasL14L7Contradiction
      ? "L14 claim と open L7 を closure/recovery frontier として照合し、Recovery lane を消化してから completion claim を再評価する"
      : activeRecovery
        ? "Recovery lane を消化し、current-location / drive model / vmodel fit を再計算する"
        : "current-location frontier は現時点で contradiction を持たない",
  };
}

function summarizeProjectOperationScope(
  operationScope: ProjectCurrentLocationSnapshot["operation_scope"],
  sourceCommand: string,
) {
  return {
    designed: operationScope.designed,
    observed: operationScope.observed,
    observed_gap: operationScope.observed_gap,
    missing: operationScope.missing,
    reverify: operationScope.reverify,
    source_command: sourceCommand,
    items: operationScope.items.map((item) => ({
      scope: item.scope,
      label: item.label,
      coverage_id: item.coverageId,
      coverage_label: item.coverageLabel,
      status: item.status,
      design_count: item.designIds.length,
      observed_count: item.observedCount,
      observation_gap: item.status !== "missing" && item.observedCount === 0,
      sample_design_ids: item.designIds.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
      sample_observation_sources: item.observationSources.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
      evidence_tables: item.evidenceTables,
      reasons: item.reasons.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
    })),
  };
}

function summarizeProjectCurrentLocation(
  snapshot: ProjectCurrentLocationSnapshot,
  options: {
    recoveryHandoffGate?: VmodelFitReport["recovery_handoff_gate"] | null;
  } = {},
) {
  const closeReadyReviewBundle = buildProjectClosureReviewBundle(snapshot, {
    action: "close_ready",
    limit: 20,
    offset: 0,
  });
  const closeReadyDecisionDraftCommand = `helix closure decision-draft --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --summary-json`;
  const closeReadyDecisionRecordCommand = `helix closure decision-draft --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --out .helix/tmp/closure/close_ready-decision-draft-offset-${closeReadyReviewBundle.offset}.yml --summary-json`;
  const closeReadyCurrentWindowCommand = `helix closure review-bundle --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --summary-json`;
  const closeReadyTransitionWindowCommand = `helix closure transition-plan --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --summary-json`;
  const closeReadyNextWindowCommand =
    closeReadyReviewBundle.window.next_offset === null
      ? null
      : `helix closure review-bundle --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.window.next_offset} --summary-json`;
  return {
    schema_version: "project-current-location-summary.v1",
    source_clock: snapshot.source_clock,
    current: snapshot.current,
    counts: snapshot.counts,
    drive_recommendation: {
      model: snapshot.drive_recommendation.model,
      reason: snapshot.drive_recommendation.reason,
      reverse_targets: snapshot.drive_recommendation.reverseTargets,
    },
    drive_route: {
      route_id: snapshot.drive_route.routeId,
      status: snapshot.drive_route.status,
      selected_model: snapshot.drive_route.selectedModel,
      default_model: snapshot.drive_route.defaultModel,
      must_return_to_design: snapshot.drive_route.mustReturnToDesign,
      forward: {
        allowed: snapshot.drive_route.forward.allowed,
        roadmap_status: snapshot.drive_route.forward.roadmapStatus,
        frontier: snapshot.drive_route.forward.frontier,
        coverage_ids: snapshot.drive_route.forward.coverageIds,
      },
      reverse: {
        required: snapshot.drive_route.reverse.required,
        targets: snapshot.drive_route.reverse.targets,
        l12_layers: snapshot.drive_route.reverse.l12Layers,
        queue_actions: snapshot.drive_route.reverse.queueActions,
        ledger_count: snapshot.drive_route.reverse.ledgerIds.length,
      },
    },
    gates: {
      design_coverage: snapshot.design_coverage_gate.status,
      acceptance_traceability: snapshot.acceptance_traceability.status,
      zip_adoption: snapshot.zip_adoption.status,
      tailoring: snapshot.tailoring_gate.status,
      roadmap_position: snapshot.roadmap_position.status,
    },
    coverage: {
      done: snapshot.coverage.done,
      missing: snapshot.coverage.missing,
      reverify: snapshot.coverage.reverify,
    },
    operation_scope: summarizeProjectOperationScope(
      snapshot.operation_scope,
      "helix current-location --summary-json",
    ),
    current_location_frontier: summarizeCurrentLocationFrontier(snapshot),
    function_design_policy: summarizeProjectFunctionDesignPolicy(snapshot),
    scrum_operation: snapshot.scrum_operation
      ? {
          status: snapshot.scrum_operation.status,
          source_package: snapshot.scrum_operation.sourcePackage,
          source_binding_count: snapshot.scrum_operation.sourceBindings.length,
          source_bindings: snapshot.scrum_operation.sourceBindings,
          backlog_items: snapshot.scrum_operation.backlogItems,
          sprint_items: snapshot.scrum_operation.sprintItems,
          acceptance_items: snapshot.scrum_operation.acceptanceItems,
          planning_items: snapshot.scrum_operation.planningItems,
          ceremony_items: snapshot.scrum_operation.ceremonyItems,
          metric_items: snapshot.scrum_operation.metricItems,
          active_sprint_plans: snapshot.scrum_operation.activeSprintPlans,
          observed_count: snapshot.scrum_operation.items.filter(
            (item) => item.status === "observed",
          ).length,
          missing_count: snapshot.scrum_operation.items.filter((item) => item.status === "missing")
            .length,
          gap_items: snapshot.scrum_operation.items
            .filter((item) => item.status === "missing")
            .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
            .map((item) => ({
              operation_id: item.operationId,
              category: item.category,
              doc_dependencies: item.docDependencies,
              implementation_dependencies: item.implementationDependencies,
            })),
        }
      : null,
    artifact_remap: {
      done: snapshot.artifact_remap.done,
      missing: snapshot.artifact_remap.missing,
      reverify: snapshot.artifact_remap.reverify,
    },
    closure: {
      status: snapshot.closure.status,
      open_l7: snapshot.closure.l7_open_plan_ids.length,
      l14_claims: snapshot.closure.terminal_l14_plan_ids.length,
      closure_evidence: snapshot.closure.closure_evidence_ids.length,
      queue_total: snapshot.closure.queue.total,
      route_counts: snapshot.closure.queue.route_counts,
      ledger_status_counts: snapshot.closure.next_action_ledger.status_counts,
      packet_count: snapshot.closure.packets.total,
    },
    approval_review_gate: {
      status: closeReadyReviewBundle.total > 0 ? "approval_required" : "none",
      action: "close_ready",
      count: closeReadyReviewBundle.total,
      listed: closeReadyReviewBundle.listed,
      omitted: closeReadyReviewBundle.omitted,
      approval_window_count: closeReadyReviewBundle.window.page_count,
      current_window: {
        page_index: closeReadyReviewBundle.window.page_index,
        page_count: closeReadyReviewBundle.window.page_count,
        start: closeReadyReviewBundle.window.start,
        end: closeReadyReviewBundle.window.end,
        offset: closeReadyReviewBundle.offset,
        limit: closeReadyReviewBundle.limit,
      },
      approval_scope_digest: closeReadyReviewBundle.review_scope.approval_scope_digest,
      evidence_totals: closeReadyReviewBundle.review_scope.evidence_totals,
      sample_plan_ids: closeReadyReviewBundle.review_scope.plan_ids.slice(
        0,
        CLOSURE_SUMMARY_SAMPLE_LIMIT,
      ),
      current_window_command: closeReadyCurrentWindowCommand,
      next_window_command: closeReadyNextWindowCommand,
      transition_window_command: closeReadyTransitionWindowCommand,
      decision_draft_command: closeReadyDecisionDraftCommand,
      decision_draft_record_command: closeReadyDecisionRecordCommand,
      write_policy: "read-only",
    },
    recovery: snapshot.recovery
      ? {
          status: snapshot.recovery.status,
          selected_closure_action: snapshot.recovery.selected_closure_action,
          exit_status: snapshot.recovery.exit_forecast.status,
          remaining_queue_items: snapshot.recovery.exit_forecast.remaining_queue_items,
          automation_status: snapshot.recovery.automation_runway.status,
          machine_actionable_count: snapshot.recovery.automation_runway.machine_actionable_count,
          human_approval_count: snapshot.recovery.automation_runway.human_approval_count,
          design_reverse_count: snapshot.recovery.automation_runway.design_reverse_count,
          remaining_after_machine_lanes:
            snapshot.recovery.automation_runway.remaining_after_machine_lanes,
          next_machine_command: summaryJsonCommandOrNull(
            snapshot.recovery.automation_runway.next_machine_command,
          ),
          next_machine_probe_command: summaryJsonCommandOrNull(
            snapshot.recovery.automation_runway.next_machine_probe_command,
          ),
          next_machine_materialize_command: summaryJsonCommandOrNull(
            snapshot.recovery.automation_runway.next_machine_materialize_command,
          ),
          next_machine_approval_draft_command: summaryJsonCommandOrNull(
            snapshot.recovery.automation_runway.next_machine_approval_draft_command,
          ),
          reentry_status: snapshot.recovery.reentry_forecast.status,
          effective_reentry_status: effectiveRecoveryReentryStatusForCli(
            snapshot.recovery.reentry_forecast.status,
            options.recoveryHandoffGate ?? null,
          ),
          reentry_next_gate: snapshot.recovery.reentry_forecast.next_gate,
          local_handoff: summarizeRecoveryHandoffGateForCli(options.recoveryHandoffGate ?? null),
        }
      : null,
    skill_binding: snapshot.skill_binding
      ? {
          status: snapshot.skill_binding.status,
          selected_model: snapshot.skill_binding.selectedModel,
          workflow_modes: snapshot.skill_binding.workflowModes,
          l12_layers: snapshot.skill_binding.l12Layers,
          required_skills: snapshot.skill_binding.requiredSkills,
          recommended_skills: snapshot.skill_binding.recommendedSkills,
          optional_skills: snapshot.skill_binding.optionalSkills,
          source_command: "helix skill suggest --current-location --summary-json",
          full_inject_command: "helix skill suggest --current-location --inject --json",
          top_items: snapshot.skill_binding.items.slice(0, 5).map((item) => ({
            skill_id: item.skillId,
            skill_path: item.skillPath,
            tier: item.tier,
            inject_at: item.injectAt,
            rank: item.rank,
            score: item.score,
            matched_drive_models: item.matchedDriveModels,
            matched_layers: item.matchedLayers,
            sample_reasons: item.reasons.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
          })),
        }
      : null,
    finding_count: snapshot.findings.length,
    findings: snapshot.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
    write_policy: "read-only",
    commands: {
      current_location: "helix current-location --summary-json",
      drive_model: "helix drive model --summary-json",
      recovery_plan: "helix recovery plan --summary-json",
      closure_review_window: closeReadyCurrentWindowCommand,
      closure_transition_window: closeReadyTransitionWindowCommand,
      closure_decision_draft: closeReadyDecisionDraftCommand,
      closure_decision_draft_record: closeReadyDecisionRecordCommand,
      vmodel_fit: "helix vmodel fit --summary-json",
      project_frontier: "helix progress frontier --summary-json",
      skill_binding: "helix skill suggest --current-location --summary-json",
    },
    source_command: "helix current-location --summary-json",
    view_command: "helix progress tree-view --summary-json",
    full_view_command: "helix progress tree-view --json",
  };
}

function projectSkillBindingCliPayload(snapshot: ProjectCurrentLocationSnapshot) {
  const binding = snapshot.skill_binding;
  return {
    schema_version: "project-skill-binding.v1",
    source_clock: snapshot.source_clock,
    status: binding?.status ?? "missing",
    source_package: binding?.sourcePackage ?? "",
    selected_model: binding?.selectedModel ?? snapshot.drive_recommendation.model,
    workflow_modes: binding?.workflowModes ?? [],
    l12_layers: binding?.l12Layers ?? [],
    required_skills: binding?.requiredSkills ?? 0,
    recommended_skills: binding?.recommendedSkills ?? 0,
    optional_skills: binding?.optionalSkills ?? 0,
    source_bindings: binding?.sourceBindings ?? [],
    doc_dependencies: binding?.docDependencies ?? [],
    implementation_dependencies: binding?.implementationDependencies ?? [],
    reasons: binding?.reasons ?? ["skill binding projection is missing"],
    items:
      binding?.items.map((item) => ({
        skill_id: item.skillId,
        skill_path: item.skillPath,
        tier: item.tier,
        inject_at: item.injectAt,
        rank: item.rank,
        score: item.score,
        matched_drive_models: item.matchedDriveModels,
        matched_layers: item.matchedLayers,
        source_drive_models: item.sourceDriveModels,
        source_layers: item.sourceLayers,
        reasons: item.reasons,
      })) ?? [],
    source_command: "helix skill suggest --current-location --json",
    inject_command: "helix skill suggest --current-location --inject --json",
    view_command: "helix progress tree-view --json",
    write_policy: "read-only",
  };
}

function summarizeProjectSkillBinding(payload: ReturnType<typeof projectSkillBindingCliPayload>) {
  return {
    schema_version: "project-skill-binding-summary.v1",
    source_clock: payload.source_clock,
    status: payload.status,
    source_package: payload.source_package,
    selected_model: payload.selected_model,
    workflow_modes: payload.workflow_modes,
    l12_layers: payload.l12_layers,
    required_skills: payload.required_skills,
    recommended_skills: payload.recommended_skills,
    optional_skills: payload.optional_skills,
    source_bindings: payload.source_bindings,
    implementation_dependencies: payload.implementation_dependencies,
    item_count: payload.items.length,
    top_items: payload.items.slice(0, 8).map((item) => ({
      skill_id: item.skill_id,
      skill_path: item.skill_path,
      tier: item.tier,
      inject_at: item.inject_at,
      rank: item.rank,
      score: item.score,
      matched_drive_models: item.matched_drive_models,
      matched_layers: item.matched_layers,
      source_drive_models: item.source_drive_models,
      source_layers: item.source_layers,
      sample_reasons: item.reasons.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
    })),
    source_command: "helix skill suggest --current-location --summary-json",
    full_source_command: "helix skill suggest --current-location --json",
    full_inject_command: payload.inject_command,
    view_command: "helix progress tree-view --summary-json",
    full_view_command: payload.view_command,
    write_policy: payload.write_policy,
  };
}

program
  .command("current-location")
  .description("Project view current location and drive-model recommendation from DB projection")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and handoff surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const recoveryHandoffGate = projectRecoveryHandoffGate(snapshot, repoRoot);
      if (opts.summaryJson) {
        process.stdout.write(
          `${JSON.stringify(
            summarizeProjectCurrentLocation(snapshot, {
              recoveryHandoffGate,
            }),
            null,
            2,
          )}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
        return;
      }
      const current = snapshot.current;
      process.stdout.write(
        `current-location: layer=${current.layer ?? "unknown"} l12=${current.l12_layer ?? "unknown"} status=${current.status} boundary=${current.completion_boundary} drive=${snapshot.drive_recommendation.model} findings=${snapshot.findings.length}\n`,
      );
      process.stdout.write(
        `  drive-route: ${snapshot.drive_route.routeId} status=${snapshot.drive_route.status} model=${snapshot.drive_route.selectedModel} default=${snapshot.drive_route.defaultModel} return_to_design=${snapshot.drive_route.mustReturnToDesign} write=${snapshot.drive_route.writePolicy}\n`,
      );
      if (snapshot.drive_route.reverse.required) {
        process.stdout.write(
          `  drive-reverse-scope: targets=${snapshot.drive_route.reverse.targets.join(",") || "-"} l12=${snapshot.drive_route.reverse.l12Layers.join(",") || "-"} actions=${snapshot.drive_route.reverse.queueActions.join(",") || "-"} ledgers=${snapshot.drive_route.reverse.ledgerIds.length}\n`,
        );
      } else {
        process.stdout.write(
          `  drive-forward-scope: allowed=${snapshot.drive_route.forward.allowed} roadmap=${snapshot.drive_route.forward.roadmapStatus} frontier=${snapshot.drive_route.forward.frontier.join(",") || "-"}\n`,
        );
      }
      if (snapshot.recovery) {
        const effectiveReentryStatus = effectiveRecoveryReentryStatusForCli(
          snapshot.recovery.reentry_forecast.status,
          recoveryHandoffGate,
        );
        process.stdout.write(
          `  recovery-exit: status=${snapshot.recovery.exit_forecast.status} remaining=${snapshot.recovery.exit_forecast.remaining_queue_items} blockers=${snapshot.recovery.exit_forecast.blockers.length} next=${snapshot.recovery.exit_forecast.next_command}\n`,
        );
        process.stdout.write(
          `  recovery-runway: status=${snapshot.recovery.automation_runway.status} machine=${snapshot.recovery.automation_runway.machine_actionable_count} approval=${snapshot.recovery.automation_runway.human_approval_count} reverse=${snapshot.recovery.automation_runway.design_reverse_count} after_machine=${snapshot.recovery.automation_runway.remaining_after_machine_lanes} next=${snapshot.recovery.automation_runway.next_machine_command ?? "-"} next_probe=${snapshot.recovery.automation_runway.next_machine_probe_command ?? "-"} materialize=${snapshot.recovery.automation_runway.next_machine_materialize_command ?? "-"} approval_draft=${snapshot.recovery.automation_runway.next_machine_approval_draft_command ?? "-"} apply_dry_run=${snapshot.recovery.automation_runway.next_machine_apply_dry_run_command ?? "-"}\n`,
        );
        process.stdout.write(
          `  recovery-reentry: status=${snapshot.recovery.reentry_forecast.status} effective=${effectiveReentryStatus} blocking=${snapshot.recovery.reentry_forecast.current_blocking_count} after_machine=${snapshot.recovery.reentry_forecast.blocking_after_machine_lanes} phases=${snapshot.recovery.reentry_forecast.required_phase_count} next=${snapshot.recovery.reentry_forecast.next_phase_action ?? "-"} gate=${snapshot.recovery.reentry_forecast.next_gate} command=${snapshot.recovery.reentry_forecast.next_command} execute=${snapshot.recovery.reentry_forecast.next_execution_command}\n`,
        );
      }
      process.stdout.write(
        `  l12-coverage: done=${snapshot.coverage.done} missing=${snapshot.coverage.missing} reverify=${snapshot.coverage.reverify}\n`,
      );
      process.stdout.write(
        `  design-coverage-gate: status=${snapshot.design_coverage_gate.status} covered=${snapshot.design_coverage_gate.covered} missing=${snapshot.design_coverage_gate.missing} reverify=${snapshot.design_coverage_gate.reverify}\n`,
      );
      process.stdout.write(
        `  acceptance-traceability: status=${snapshot.acceptance_traceability.status} linked=${snapshot.acceptance_traceability.linked}/${snapshot.acceptance_traceability.total} declared=${snapshot.acceptance_traceability.declared} missing=${snapshot.acceptance_traceability.missing}\n`,
      );
      process.stdout.write(
        `  design-impact: declarations=${snapshot.counts.design_declarations} references=${snapshot.counts.design_references} impact=${snapshot.counts.design_impact} unresolved=${snapshot.counts.unresolved_design_references} drift=${snapshot.counts.design_declaration_drifts}\n`,
      );
      if (snapshot.design_coverage_gate.status !== "pass") {
        process.stdout.write(
          `  design-coverage-return: ${snapshot.design_coverage_gate.items
            .filter((item) => item.status !== "covered")
            .slice(0, 8)
            .map((item) => `${item.coverageId}->${item.returnRoute}@${item.l12Layer}`)
            .join(",")}\n`,
        );
      }
      process.stdout.write(
        `  roadmap-position: status=${snapshot.roadmap_position.status} bands=${snapshot.roadmap_position.rollup.covered_bands}/${snapshot.roadmap_position.rollup.total_bands} parked=${snapshot.roadmap_position.rollup.parked_bands} uncovered=${snapshot.roadmap_position.rollup.uncovered_bands} gates=${snapshot.roadmap_position.rollup.reached_gates}/${snapshot.roadmap_position.rollup.total_gates} spans=${snapshot.roadmap_position.rollup.confirmed_spans}/${snapshot.roadmap_position.rollup.total_spans}\n`,
      );
      if (
        snapshot.roadmap_position.current_band_ids.length > 0 ||
        snapshot.roadmap_position.current_gate_ids.length > 0
      ) {
        process.stdout.write(
          `  roadmap-current: bands=${snapshot.roadmap_position.current_band_ids.join(",") || "-"} gates=${snapshot.roadmap_position.current_gate_ids.slice(0, 5).join(",") || "-"}\n`,
        );
      }
      process.stdout.write(
        `  operation-scope: designed=${snapshot.operation_scope.designed} observed=${snapshot.operation_scope.observed} observed_gap=${snapshot.operation_scope.observed_gap} missing=${snapshot.operation_scope.missing} reverify=${snapshot.operation_scope.reverify}\n`,
      );
      process.stdout.write(
        `  artifact-remap: done=${snapshot.artifact_remap.done} missing=${snapshot.artifact_remap.missing} reverify=${snapshot.artifact_remap.reverify}\n`,
      );
      process.stdout.write(
        `  artifact-remap-layers: ${snapshot.artifact_remap.layers
          .map(
            (layer) =>
              `${layer.layer}=${layer.status}(d${layer.done}/m${layer.missing}/r${layer.reverify})`,
          )
          .join(" ")}\n`,
      );
      process.stdout.write(
        `  closure: status=${snapshot.closure.status} open_l7=${snapshot.closure.l7_open_plan_ids.length} l14_claims=${snapshot.closure.terminal_l14_plan_ids.length} evidence=${snapshot.closure.closure_evidence_ids.length}\n`,
      );
      process.stdout.write(
        `  closure-remediation: done=${snapshot.closure.remediation.done} missing=${snapshot.closure.remediation.missing} reverify=${snapshot.closure.remediation.reverify}\n`,
      );
      if (snapshot.closure.queue.total > 0) {
        const queueEvidence = snapshot.closure.queue.items.reduce(
          (acc, item) => {
            acc[item.evidence.status] += 1;
            return acc;
          },
          { missing: 0, partial: 0, ready: 0 },
        );
        process.stdout.write(
          `  closure-queue: total=${snapshot.closure.queue.total} head=${snapshot.closure.queue.items
            .slice(0, 3)
            .map((item) => item.planId)
            .join(",")}\n`,
        );
        process.stdout.write(
          `  closure-queue-evidence: ready=${queueEvidence.ready} partial=${queueEvidence.partial} missing=${queueEvidence.missing}\n`,
        );
        process.stdout.write(
          `  closure-queue-route: close=${snapshot.closure.queue.route_counts.close_ready} collect=${snapshot.closure.queue.route_counts.collect_evidence} repair=${snapshot.closure.queue.route_counts.repair_failed_evidence} reverse=${snapshot.closure.queue.route_counts.reverse_design}\n`,
        );
        if (snapshot.closure.queue.route_counts.close_ready > 0) {
          const closeReadyBundle = buildProjectClosureReviewBundle(snapshot, {
            action: "close_ready",
            limit: 20,
            offset: 0,
          });
          const closeReadyDecisionRecordCommand = `helix closure decision-draft --action close_ready --limit ${closeReadyBundle.limit} --offset ${closeReadyBundle.offset} --out .helix/tmp/closure/close_ready-decision-draft-offset-${closeReadyBundle.offset}.yml --summary-json`;
          const closeReadyCurrentWindowCommand = `helix closure review-bundle --action close_ready --limit ${closeReadyBundle.limit} --offset ${closeReadyBundle.offset} --summary-json`;
          const closeReadyNextWindowCommand =
            closeReadyBundle.window.next_offset === null
              ? "-"
              : `helix closure review-bundle --action close_ready --limit ${closeReadyBundle.limit} --offset ${closeReadyBundle.window.next_offset} --summary-json`;
          process.stdout.write(
            `  closure-approval-frontier: windows=${closeReadyBundle.window.page_count} current=${closeReadyBundle.window.page_index}/${closeReadyBundle.window.page_count} listed=${closeReadyBundle.listed} omitted=${closeReadyBundle.omitted} digest=${closeReadyBundle.review_scope.approval_scope_digest} decision_record=${closeReadyDecisionRecordCommand} review=${closeReadyCurrentWindowCommand} next=${closeReadyNextWindowCommand}\n`,
          );
        }
        process.stdout.write(
          `  closure-packets: total=${snapshot.closure.packets.total} ${snapshot.closure.packets.items
            .map((packet) => `${packet.nextAction}=${packet.count}`)
            .join(" ")}\n`,
        );
        const firstPacket = snapshot.closure.packets.items[0];
        if (firstPacket) {
          process.stdout.write(
            `  closure-automation: first=${firstPacket.automation.batchId} command=${firstPacket.automation.reviewCommand} filter=${firstPacket.automation.machineFilter} transition=${firstPacket.automation.expectedTransition}\n`,
          );
        }
        process.stdout.write(
          `  next-action-ledger: total=${snapshot.closure.next_action_ledger.total} ready=${snapshot.closure.next_action_ledger.status_counts.ready} evidence=${snapshot.closure.next_action_ledger.status_counts.needs_evidence} repair=${snapshot.closure.next_action_ledger.status_counts.needs_repair} reverse=${snapshot.closure.next_action_ledger.status_counts.needs_reverse} write=${snapshot.closure.next_action_ledger.write_policy}\n`,
        );
        for (const entry of snapshot.closure.next_action_ledger.entries) {
          process.stdout.write(
            `  next-action: ${entry.ledgerId} status=${entry.status} count=${entry.count} batch=${entry.automation.batchId} command=${entry.primaryCommand} view=${entry.reviewSurface}\n`,
          );
        }
      }
      if (current.roadmap_frontier.length > 0) {
        process.stdout.write(`  frontier=${current.roadmap_frontier.join(",")}\n`);
      }
      if (snapshot.drive_recommendation.reverseTargets.length > 0) {
        process.stdout.write(
          `  reverse-targets=${snapshot.drive_recommendation.reverseTargets.join(",")}\n`,
        );
      }
      for (const finding of snapshot.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code} - ${finding.detail}\n`);
      }
    } finally {
      db.close();
    }
  });

const drive = program.command("drive").description("Project drive-model read-only surfaces");

function summarizeProjectDriveModelReport(report: ProjectDriveModelReport) {
  return {
    schema_version: "project-drive-model-summary.v1",
    source_clock: report.source_clock,
    forward_spine_model: report.forward_spine_model,
    registered_entry_models: report.registered_entry_models,
    registered_entry_model_count: report.registered_entry_model_count,
    missing_registered_entry_models: report.missing_registered_entry_models,
    selected_model: report.selected_model,
    default_model: report.default_model,
    selection_status: report.selection_status,
    current: report.current,
    blocking_finding_codes: report.blocking_finding_codes,
    selected_candidate: {
      model: report.selected_candidate.model,
      rank: report.selected_candidate.rank,
      status: report.selected_candidate.status,
      route_id: report.selected_candidate.route_id,
      trigger: report.selected_candidate.trigger,
      required_action: report.selected_candidate.required_action,
      command: summaryJsonCommand(report.selected_candidate.command),
      coverage_ids: report.selected_candidate.coverage_ids,
      doc_dependency_count: report.selected_candidate.doc_dependencies.length,
      implementation_dependency_count: report.selected_candidate.implementation_dependencies.length,
      reason_count: report.selected_candidate.reasons.length,
    },
    blocked_models: report.blocked_models,
    available_models: report.available_models,
    candidate_count: report.candidates.length,
    candidates: report.candidates.map((candidate) => ({
      model: candidate.model,
      rank: candidate.rank,
      status: candidate.status,
      route_id: candidate.route_id,
      trigger: candidate.trigger,
      required_action: candidate.required_action,
      command: summaryJsonCommand(candidate.command),
      coverage_ids: candidate.coverage_ids,
      doc_dependency_count: candidate.doc_dependencies.length,
      implementation_dependency_count: candidate.implementation_dependencies.length,
      reason_count: candidate.reasons.length,
    })),
    postcheck_commands: report.postcheck_commands.map(summaryJsonCommand),
    write_policy: report.write_policy,
    source_command: "helix drive model --summary-json",
    full_source_command: report.source_command,
    view_command: summaryJsonCommand(report.view_command),
    full_view_command: report.view_command,
  };
}

drive
  .command("model")
  .description("emit selected drive model and candidate routes from current-location projection")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const report = buildProjectDriveModelReport(snapshot);
      if (opts.summaryJson) {
        process.stdout.write(
          `${JSON.stringify(summarizeProjectDriveModelReport(report), null, 2)}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `drive model: selected=${report.selected_model} status=${report.selection_status} default=${report.default_model} current=${report.current.layer ?? "unknown"}->${report.current.l12_layer ?? "unknown"} write=${report.write_policy}\n`,
      );
      process.stdout.write(
        `  selected-route=${report.selected_candidate.route_id} command=${report.selected_candidate.command}\n`,
      );
      process.stdout.write(
        `  selected-coverage=${report.selected_candidate.coverage_ids.join(",") || "-"}\n`,
      );
      process.stdout.write(
        `  available=${report.available_models.join(",") || "-"} blocked=${report.blocked_models.join(",") || "-"}\n`,
      );
      process.stdout.write(`  postcheck=${report.postcheck_commands.join(" && ")}\n`);
      for (const candidate of report.candidates) {
        process.stdout.write(
          `  candidate: ${candidate.rank}.${candidate.model} ${candidate.status} route=${candidate.route_id} coverage=${candidate.coverage_ids.join(",") || "-"} command=${candidate.command}\n`,
        );
        process.stdout.write(`    required=${candidate.required_action}\n`);
      }
    } finally {
      db.close();
    }
  });

const recovery = program.command("recovery").description("Project recovery read-only surfaces");

function summarizeProjectRecoveryPlan(
  plan: ProjectRecoveryPlan,
  options: {
    recoveryHandoffGate?: VmodelFitReport["recovery_handoff_gate"] | null;
  } = {},
) {
  return {
    schema_version: "project-recovery-plan-summary.v1",
    source_clock: plan.source_clock,
    status: plan.status,
    current: plan.current,
    drive_model: {
      selected_model: plan.drive_model.selected_model,
      selected_route_id: plan.drive_model.selected_candidate.route_id,
      default_model: plan.drive_model.default_model,
      candidate_count: plan.drive_model.candidates.length,
      blocked_models: plan.drive_model.blocked_models,
      available_models: plan.drive_model.available_models,
    },
    selected_closure_action: plan.selected_closure_action,
    recovery_handoff_gate: summarizeRecoveryHandoffGateForCli(options.recoveryHandoffGate ?? null),
    closure_evidence_plan: plan.closure_evidence_plan
      ? {
          selected_action: plan.closure_evidence_plan.selected_action,
          total: plan.closure_evidence_plan.total,
          listed: plan.closure_evidence_plan.listed,
          omitted: plan.closure_evidence_plan.omitted,
          limit: plan.closure_evidence_plan.limit,
          target_tables: plan.closure_evidence_plan.target_tables,
          evidence_gap_counts: plan.closure_evidence_plan.evidence_gap_counts,
          expected_transition: plan.closure_evidence_plan.expected_transition,
        }
      : null,
    action_lanes: plan.action_lanes.map((lane) => ({
      action: lane.action,
      rank: lane.rank,
      count: lane.count,
      listed: lane.listed,
      omitted: lane.omitted,
      selected: lane.selected,
      lane_type: lane.lane_type,
      status: lane.status,
      human_required: lane.human_required,
      primary_command: summaryJsonCommand(lane.primary_command),
      evidence_plan_command: summaryJsonCommand(lane.evidence_plan_command),
      batch_command: summaryJsonCommand(lane.batch_command),
      review_command: summaryJsonCommand(lane.review_command),
      evidence_probe_command: summaryJsonCommandOrNull(lane.evidence_probe_command),
      evidence_materialize_command: summaryJsonCommandOrNull(lane.evidence_materialize_command),
      evidence_approval_draft_command: summaryJsonCommandOrNull(
        lane.evidence_approval_draft_command,
      ),
      evidence_apply_dry_run_command: summaryJsonCommandOrNull(lane.evidence_apply_dry_run_command),
      target_tables: lane.target_tables,
      sample_plan_ids: lane.sample_plan_ids,
      expected_transition: lane.expected_transition,
    })),
    automation_boundaries: plan.automation_boundaries.map((boundary) => ({
      action: boundary.action,
      count: boundary.count,
      automation_class: boundary.automation_class,
      mutation_allowed: boundary.mutation_allowed,
      approval_required: boundary.approval_required,
      dry_run_command: summaryJsonCommand(boundary.dry_run_command),
      execute_command: summaryJsonCommandOrNull(boundary.execute_command),
      evidence_patch_command: summaryJsonCommandOrNull(boundary.evidence_patch_command),
      evidence_probe_command: summaryJsonCommandOrNull(boundary.evidence_probe_command),
      evidence_materialize_command: summaryJsonCommandOrNull(boundary.evidence_materialize_command),
      evidence_approval_draft_command: summaryJsonCommandOrNull(
        boundary.evidence_approval_draft_command,
      ),
      evidence_apply_dry_run_command: summaryJsonCommandOrNull(
        boundary.evidence_apply_dry_run_command,
      ),
      evidence_apply_execute_command: summaryJsonCommandOrNull(
        boundary.evidence_apply_execute_command,
      ),
      evidence_apply_write_policy: boundary.evidence_apply_write_policy,
      required_record: boundary.required_record,
    })),
    automation_runway: {
      status: plan.automation_runway.status,
      machine_actionable_count: plan.automation_runway.machine_actionable_count,
      human_approval_count: plan.automation_runway.human_approval_count,
      design_reverse_count: plan.automation_runway.design_reverse_count,
      remaining_after_machine_lanes: plan.automation_runway.remaining_after_machine_lanes,
      next_machine_action: plan.automation_runway.next_machine_action,
      next_machine_command: summaryJsonCommandOrNull(plan.automation_runway.next_machine_command),
      next_machine_probe_command: summaryJsonCommandOrNull(
        plan.automation_runway.next_machine_probe_command,
      ),
      next_machine_materialize_command: summaryJsonCommandOrNull(
        plan.automation_runway.next_machine_materialize_command,
      ),
      next_machine_approval_draft_command: summaryJsonCommandOrNull(
        plan.automation_runway.next_machine_approval_draft_command,
      ),
      next_machine_apply_dry_run_command: summaryJsonCommandOrNull(
        plan.automation_runway.next_machine_apply_dry_run_command,
      ),
      phases: plan.automation_runway.phases.map((phase) => ({
        sequence: phase.sequence,
        action: phase.action,
        phase_type: phase.phase_type,
        count: phase.count,
        selected: phase.selected,
        human_required: phase.human_required,
        remaining_after_phase: phase.remaining_after_phase,
        next_gate: phase.next_gate,
        command: summaryJsonCommand(phase.command),
        evidence_probe_command: summaryJsonCommandOrNull(phase.evidence_probe_command),
        evidence_materialize_command: summaryJsonCommandOrNull(phase.evidence_materialize_command),
        evidence_approval_draft_command: summaryJsonCommandOrNull(
          phase.evidence_approval_draft_command,
        ),
      })),
    },
    exit_forecast: {
      status: plan.exit_forecast.status,
      remaining_queue_items: plan.exit_forecast.remaining_queue_items,
      blocker_count: plan.exit_forecast.blockers.length,
      next_command: summaryJsonCommand(plan.exit_forecast.next_command),
    },
    reentry_forecast: {
      status: plan.reentry_forecast.status,
      effective_status: effectiveRecoveryReentryStatusForCli(
        plan.reentry_forecast.status,
        options.recoveryHandoffGate ?? null,
      ),
      current_blocking_count: plan.reentry_forecast.current_blocking_count,
      blocking_after_machine_lanes: plan.reentry_forecast.blocking_after_machine_lanes,
      required_phase_count: plan.reentry_forecast.required_phase_count,
      next_phase_action: plan.reentry_forecast.next_phase_action,
      next_phase_type: plan.reentry_forecast.next_phase_type,
      next_gate: plan.reentry_forecast.next_gate,
      next_command: summaryJsonCommand(plan.reentry_forecast.next_command),
      next_execution_command: summaryJsonCommand(plan.reentry_forecast.next_execution_command),
      recompute_commands: plan.reentry_forecast.recompute_commands.map(summaryJsonCommand),
    },
    steps: plan.steps.map((step) => ({
      step_id: step.step_id,
      sequence: step.sequence,
      status: step.status,
      command: summaryJsonCommand(step.command),
      required_action: step.required_action,
      expected_transition: step.expected_transition,
    })),
    exit_criteria: plan.exit_criteria,
    postcheck_commands: plan.postcheck_commands.map(summaryJsonCommand),
    write_policy: plan.write_policy,
    source_command: "helix recovery plan --summary-json",
    view_command: summaryJsonCommand(plan.view_command),
    full_view_command: plan.view_command,
  };
}

recovery
  .command("plan")
  .description("emit recovery plan from selected drive model and closure evidence queue")
  .option("--limit <n>", "maximum evidence-plan items to include", "20")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and handoff surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { limit?: string; json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const limit = Number.parseInt(opts.limit ?? "20", 10);
    if (!Number.isFinite(limit) || limit < 0) {
      process.stderr.write(`recovery plan: invalid limit=${opts.limit ?? ""}\n`);
      process.exitCode = 2;
      return;
    }

    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const plan = buildProjectRecoveryPlan(snapshot, { limit });
      const recoveryHandoffGate = projectRecoveryHandoffGate(snapshot, repoRoot);
      if (opts.summaryJson) {
        process.stdout.write(
          `${JSON.stringify(
            summarizeProjectRecoveryPlan(plan, {
              recoveryHandoffGate,
            }),
            null,
            2,
          )}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `recovery plan: status=${plan.status} selected=${plan.drive_model.selected_model} current=${plan.current.layer ?? "unknown"}->${plan.current.l12_layer ?? "unknown"} closure_action=${plan.selected_closure_action ?? "-"} write=${plan.write_policy}\n`,
      );
      process.stdout.write(
        `  exit-forecast: status=${plan.exit_forecast.status} remaining=${plan.exit_forecast.remaining_queue_items} blockers=${plan.exit_forecast.blockers.length} next=${plan.exit_forecast.next_command}\n`,
      );
      process.stdout.write(
        `  reentry-forecast: status=${plan.reentry_forecast.status} effective=${effectiveRecoveryReentryStatusForCli(plan.reentry_forecast.status, recoveryHandoffGate)} blocking=${plan.reentry_forecast.current_blocking_count} after_machine=${plan.reentry_forecast.blocking_after_machine_lanes} phases=${plan.reentry_forecast.required_phase_count} next=${plan.reentry_forecast.next_phase_action ?? "-"} gate=${plan.reentry_forecast.next_gate} command=${plan.reentry_forecast.next_command} execute=${plan.reentry_forecast.next_execution_command}\n`,
      );
      process.stdout.write(
        `  automation-runway: status=${plan.automation_runway.status} machine=${plan.automation_runway.machine_actionable_count} approval=${plan.automation_runway.human_approval_count} reverse=${plan.automation_runway.design_reverse_count} after_machine=${plan.automation_runway.remaining_after_machine_lanes} next=${plan.automation_runway.next_machine_command ?? "-"} next_probe=${plan.automation_runway.next_machine_probe_command ?? "-"} materialize=${plan.automation_runway.next_machine_materialize_command ?? "-"} approval_draft=${plan.automation_runway.next_machine_approval_draft_command ?? "-"} apply_dry_run=${plan.automation_runway.next_machine_apply_dry_run_command ?? "-"}\n`,
      );
      for (const phase of plan.automation_runway.phases) {
        process.stdout.write(
          `  runway-phase: ${phase.sequence}.${phase.action} ${phase.phase_type} count=${phase.count} selected=${phase.selected} human=${phase.human_required} remaining=${phase.remaining_after_phase} next_gate=${phase.next_gate} command=${phase.command} probe=${phase.evidence_probe_command ?? "-"} materialize=${phase.evidence_materialize_command ?? "-"} approval_draft=${phase.evidence_approval_draft_command ?? "-"} apply_dry_run=${phase.evidence_apply_dry_run_command ?? "-"}\n`,
        );
      }
      if (plan.closure_evidence_plan) {
        process.stdout.write(
          `  evidence-plan: action=${plan.closure_evidence_plan.selected_action ?? "-"} total=${plan.closure_evidence_plan.total} listed=${plan.closure_evidence_plan.listed} tables=${plan.closure_evidence_plan.target_tables.join(",") || "-"}\n`,
        );
        const repairTargets = plan.closure_evidence_plan.items.flatMap(
          (item) => item.repair_targets,
        );
        if (repairTargets.length > 0) {
          process.stdout.write(`  repair-targets=${formatRepairTargetsText(repairTargets)}\n`);
        }
      }
      for (const lane of plan.action_lanes) {
        if (lane.count === 0) continue;
        process.stdout.write(
          `  lane: ${lane.rank}.${lane.action} ${lane.status} count=${lane.count} listed=${lane.listed} omitted=${lane.omitted} type=${lane.lane_type} human=${lane.human_required} selected=${lane.selected} tables=${lane.target_tables.join(",") || "-"} command=${lane.primary_command}\n`,
        );
      }
      for (const boundary of plan.automation_boundaries) {
        if (boundary.count === 0) continue;
        process.stdout.write(
          `  automation: ${boundary.action} class=${boundary.automation_class} count=${boundary.count} mutation=${boundary.mutation_allowed} approval=${boundary.approval_required} dry_run=${boundary.dry_run_command} execute=${boundary.execute_command ?? "-"} probe=${boundary.evidence_probe_command ?? "-"} materialize=${boundary.evidence_materialize_command ?? "-"} approval_draft=${boundary.evidence_approval_draft_command ?? "-"} apply_dry_run=${boundary.evidence_apply_dry_run_command ?? "-"} apply_execute=${boundary.evidence_apply_execute_command ?? "-"} apply_write=${boundary.evidence_apply_write_policy ?? "-"}\n`,
        );
      }
      process.stdout.write(`  postcheck=${plan.postcheck_commands.join(" && ")}\n`);
      for (const step of plan.steps) {
        process.stdout.write(
          `  step: ${step.sequence}.${step.step_id} ${step.status} command=${step.command}\n`,
        );
        process.stdout.write(`    required=${step.required_action}\n`);
      }
    } finally {
      db.close();
    }
  });

function summarizeProjectRoadmapCurrentReport(report: ProjectRoadmapCurrentReport) {
  return {
    schema_version: "project-roadmap-current-summary.v1",
    source_clock: report.source_clock,
    status: report.status,
    current: report.current,
    drive_route: {
      route_id: report.drive_route.routeId,
      status: report.drive_route.status,
      selected_model: report.drive_route.selectedModel,
      must_return_to_design: report.drive_route.mustReturnToDesign,
      forward_current_bands: report.drive_route.forward.currentBandIds,
      reverse_l12_layers: report.drive_route.reverse.l12Layers,
    },
    roadmap_position: {
      status: report.roadmap_position.status,
      frontier: report.roadmap_position.frontier,
      current_band_ids: report.roadmap_position.current_band_ids,
      current_gate_ids: report.roadmap_position.current_gate_ids,
      rollup: report.roadmap_position.rollup,
      doc_dependency_count: report.roadmap_position.docDependencies.length,
      implementation_dependency_count: report.roadmap_position.implementationDependencies.length,
    },
    consistency: report.consistency,
    counts: report.counts,
    action_count: report.actions.length,
    sample_actions: report.actions.slice(0, 20).map((action) => ({
      action_id: action.action_id,
      category: action.category,
      status: action.status,
      automation_class: action.automation_class,
      phase_action: action.phase_action,
      l12_layers: action.l12_layers,
      coverage_ids: action.coverage_ids,
      command: summaryJsonCommand(action.command),
      batch_command: summaryJsonCommandOrNull(action.batch_command),
      review_command: summaryJsonCommandOrNull(action.review_command),
      evidence_patch_command: summaryJsonCommandOrNull(action.evidence_patch_command),
      evidence_probe_command: summaryJsonCommandOrNull(action.evidence_probe_command),
      evidence_materialize_command: summaryJsonCommandOrNull(action.evidence_materialize_command),
      evidence_approval_draft_command: summaryJsonCommandOrNull(
        action.evidence_approval_draft_command,
      ),
      evidence_apply_dry_run_command: summaryJsonCommandOrNull(
        action.evidence_apply_dry_run_command,
      ),
      evidence_apply_execute_command: summaryJsonCommandOrNull(
        action.evidence_apply_execute_command,
      ),
      evidence_apply_write_policy: action.evidence_apply_write_policy,
      required_action: action.required_action,
      doc_dependency_count: action.doc_dependencies.length,
      implementation_dependency_count: action.implementation_dependencies.length,
      reason_count: action.reasons.length,
    })),
    postcheck_commands: report.postcheck_commands.map(summaryJsonCommand),
    write_policy: report.write_policy,
    source_command: "helix roadmap current --summary-json",
    full_source_command: report.source_command,
    view_command: summaryJsonCommand(report.view_command),
    full_view_command: report.view_command,
  };
}

const roadmap = program.command("roadmap").description("Project roadmap read-only surfaces");

roadmap
  .command("current")
  .description("emit roadmap/current-location consistency from DB projection")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and handoff surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const report = buildProjectRoadmapCurrentReport(snapshot);
      if (opts.summaryJson) {
        process.stdout.write(
          `${JSON.stringify(summarizeProjectRoadmapCurrentReport(report), null, 2)}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `roadmap current: status=${report.status} aligned=${report.consistency.aligned} basis=${report.consistency.alignment_basis} db=${report.consistency.db_current_l12_layer ?? "-"} roadmap=${report.consistency.roadmap_current_l12_layers.join(",") || "-"} projected=${report.consistency.roadmap_projected_l12_layers.join(",") || "-"} terminal=${report.consistency.roadmap_terminal_l12_layers.join(",") || "-"} route=${report.drive_route.routeId} write=${report.write_policy}\n`,
      );
      process.stdout.write(
        `  counts: bands=${report.counts.current_bands} gates=${report.counts.current_gates} blockers=${report.counts.blockers} actions=${report.counts.actions}\n`,
      );
      process.stdout.write(`  postcheck=${report.postcheck_commands.join(" && ")}\n`);
      for (const action of report.actions.slice(0, 20)) {
        process.stdout.write(
          `  action: ${action.action_id} ${action.category}/${action.status} auto=${action.automation_class} phase=${action.phase_action ?? "-"} l12=${action.l12_layers.join(",") || "-"} command=${action.command}\n`,
        );
        if (
          action.evidence_patch_command ||
          action.evidence_probe_command ||
          action.evidence_materialize_command ||
          action.evidence_approval_draft_command ||
          action.evidence_apply_dry_run_command ||
          action.evidence_apply_execute_command ||
          action.review_command ||
          action.batch_command
        ) {
          process.stdout.write(
            `    surfaces=batch:${action.batch_command ?? "-"} review:${action.review_command ?? "-"} patch:${action.evidence_patch_command ?? "-"} probe:${action.evidence_probe_command ?? "-"} materialize:${action.evidence_materialize_command ?? "-"} approval_draft:${action.evidence_approval_draft_command ?? "-"} apply_dry_run:${action.evidence_apply_dry_run_command ?? "-"} apply_execute:${action.evidence_apply_execute_command ?? "-"} apply_write:${action.evidence_apply_write_policy ?? "-"}\n`,
          );
        }
        process.stdout.write(`    required=${action.required_action}\n`);
      }
    } finally {
      db.close();
    }
  });

const artifactRemap = program
  .command("artifact-remap")
  .description("Project artifact remap read-only automation surfaces");

function loadArtifactProgressRows(
  db: HarnessDb,
  color: string | null,
): Array<Record<string, unknown>> {
  return color != null && color.length > 0
    ? db
        .prepare(
          "SELECT artifact_path, artifact_type, state, color, linked_test_count, passed_test_run_count, dependency_checked, dependency_check_run_id, open_dependency_impacts, linked_test_paths, passed_test_run_ids, recovery_plan_ids, reason, indexed_at FROM artifact_progress WHERE color = ? ORDER BY artifact_path",
        )
        .all(color)
    : db
        .prepare(
          "SELECT artifact_path, artifact_type, state, color, linked_test_count, passed_test_run_count, dependency_checked, dependency_check_run_id, open_dependency_impacts, linked_test_paths, passed_test_run_ids, recovery_plan_ids, reason, indexed_at FROM artifact_progress ORDER BY CASE color WHEN 'red' THEN 0 WHEN 'yellow' THEN 1 ELSE 2 END, artifact_path",
        )
        .all();
}

function buildSummarySurfaceCommandAudit(
  repoRoot: string,
  snapshot: ProjectCurrentLocationSnapshot,
  db: HarnessDb,
) {
  const probeRecordOutput: ProbeRecordOutput = {
    requested: false,
    path: null,
    written: false,
    bytes: 0,
    sha256: null,
  };
  const nonAuthorizingRecordOutput = {
    requested: false,
    path: null,
    written: false,
    bytes: 0,
    sha256: null,
    non_authorizing: true as const,
  };
  const dryRunExecution = {
    executed: false,
    applied_artifacts: [],
  };
  const closureApplyDryRunExecution = {
    dryRun: true,
    executed: false,
    appliedPatches: [],
  };
  return buildSummarySurfaceCommandAuditFromPayloads([
    {
      surface: "current-location",
      payload: summarizeProjectCurrentLocation(snapshot),
    },
    {
      surface: "drive-model",
      payload: summarizeProjectDriveModelReport(buildProjectDriveModelReport(snapshot)),
    },
    {
      surface: "skill-binding",
      payload: summarizeProjectSkillBinding(projectSkillBindingCliPayload(snapshot)),
    },
    {
      surface: "recovery-plan",
      payload: summarizeProjectRecoveryPlan(buildProjectRecoveryPlan(snapshot, { limit: 1 })),
    },
    {
      surface: "roadmap-current",
      payload: summarizeProjectRoadmapCurrentReport(buildProjectRoadmapCurrentReport(snapshot)),
    },
    {
      surface: "artifact-remap-batch",
      payload: summarizeProjectArtifactRemapBatchReport(
        buildProjectArtifactRemapBatchReport(snapshot, { limit: 10 }),
      ),
    },
    {
      surface: "progress-artifacts",
      payload: summarizeArtifactProgressRows(loadArtifactProgressRows(db, null), null),
    },
    {
      surface: "closure-overview",
      payload: summarizeClosureOverview(buildProjectClosureOverview(snapshot, { limit: 1 })),
    },
    {
      surface: "closure-batch",
      payload: summarizeClosureBatchReport(buildProjectClosureBatchReport(snapshot, { limit: 1 })),
    },
    {
      surface: "closure-evidence-plan",
      payload: summarizeClosureEvidencePlan(
        buildProjectClosureEvidencePlan(snapshot, { limit: 1 }),
      ),
    },
    {
      surface: "closure-evidence-patch",
      payload: summarizeClosureEvidencePatchPacket(
        buildProjectClosureEvidencePatchPacket(snapshot, { limit: 1 }),
      ),
    },
    {
      surface: "closure-evidence-probe",
      payload: summarizeClosureEvidenceProbePacket(
        buildProjectClosureEvidenceProbePacket(snapshot, { limit: 1 }),
        probeRecordOutput,
      ),
    },
    {
      surface: "closure-evidence-materialize",
      payload: summarizeClosureMaterializePacket(
        buildProjectClosureEvidenceMaterializePacket(snapshot, { limit: 1 }),
      ),
    },
    {
      surface: "closure-evidence-approval-draft",
      payload: summarizeClosureApprovalDraftPacket(
        buildProjectClosureEvidenceApprovalDraftPacket(snapshot, { limit: 1 }),
        nonAuthorizingRecordOutput,
      ),
    },
    {
      surface: "closure-evidence-apply",
      payload: summarizeClosureEvidenceApplyPlan(
        buildProjectClosureEvidenceApplyPlan(snapshot, { limit: 1 }),
        dryRunExecution,
      ),
    },
    {
      surface: "closure-review-bundle",
      payload: summarizeClosureReviewBundle(
        buildProjectClosureReviewBundle(snapshot, {
          action: "close_ready",
          limit: 1,
        }),
      ),
    },
    {
      surface: "closure-transition-plan",
      payload: summarizeClosureTransitionPlan(
        buildProjectClosureTransitionPlan(snapshot, {
          action: "close_ready",
          decisionOutcome: "approve_closure_claim",
          limit: 1,
        }),
      ),
    },
    {
      surface: "closure-decision-draft",
      payload: summarizeClosureDecisionDraftPacket(
        buildProjectClosureDecisionDraftPacket(snapshot, {
          action: "close_ready",
          limit: 1,
        }),
        nonAuthorizingRecordOutput,
      ),
    },
    {
      surface: "closure-apply",
      payload: summarizeClosureApplyPlan(
        buildProjectClosureApplyPlan(snapshot, { limit: 1 }),
        closureApplyDryRunExecution,
      ),
    },
    {
      surface: "vmodel-fit",
      payload: summarizeVmodelFitReport(
        buildVmodelFitReport(snapshot, analyzeVmodelZipManifest(repoRoot), {
          repoRoot,
        }),
        summarizeCurrentLocationFrontier(snapshot),
      ),
    },
    {
      surface: "project-frontier",
      payload: buildProjectFrontierSummary(repoRoot, snapshot),
    },
    {
      surface: "completion-decision-packet",
      payload: {
        source_command: "helix completion decision-packet --summary-json",
        full_review_bundle_command: "helix completion review-bundle --json",
        full_source_command: "helix completion decision-packet --json",
        view_command: "helix progress tree-view --summary-json",
        full_view_command: "helix progress tree-view --json",
      },
    },
  ]);
}

function buildProjectFrontierSummary(repoRoot: string, snapshot: ProjectCurrentLocationSnapshot) {
  const driveModel = summarizeProjectDriveModelReport(buildProjectDriveModelReport(snapshot));
  const functionDesignPolicy = summarizeProjectFunctionDesignPolicy(snapshot);
  const closeReadyReview = summarizeClosureReviewBundle(
    buildProjectClosureReviewBundle(snapshot, {
      action: "close_ready",
      limit: 20,
    }),
  );
  const vmodelFit = summarizeVmodelFitReport(
    buildVmodelFitReport(snapshot, analyzeVmodelZipManifest(repoRoot), {
      repoRoot,
    }),
    summarizeCurrentLocationFrontier(snapshot),
  );
  const skillBinding = summarizeProjectSkillBinding(projectSkillBindingCliPayload(snapshot));

  return {
    schema_version: "project-frontier-summary.v1",
    source_clock: snapshot.source_clock,
    current: {
      layer: snapshot.current.layer,
      l12_layer: snapshot.current.l12_layer,
      status: snapshot.current.status,
      completion_boundary: snapshot.current.completion_boundary,
      roadmap_frontier: snapshot.current.roadmap_frontier,
    },
    current_location_frontier: summarizeCurrentLocationFrontier(snapshot),
    function_design_policy: functionDesignPolicy,
    operation_scope: summarizeProjectOperationScope(
      snapshot.operation_scope,
      "helix progress frontier --summary-json",
    ),
    scrum_operation: snapshot.scrum_operation
      ? {
          status: snapshot.scrum_operation.status,
          source_package: snapshot.scrum_operation.sourcePackage,
          source_binding_count: snapshot.scrum_operation.sourceBindings.length,
          source_bindings: snapshot.scrum_operation.sourceBindings,
          backlog_items: snapshot.scrum_operation.backlogItems,
          sprint_items: snapshot.scrum_operation.sprintItems,
          acceptance_items: snapshot.scrum_operation.acceptanceItems,
          planning_items: snapshot.scrum_operation.planningItems,
          ceremony_items: snapshot.scrum_operation.ceremonyItems,
          metric_items: snapshot.scrum_operation.metricItems,
          active_sprint_plans: snapshot.scrum_operation.activeSprintPlans,
          observed_count: snapshot.scrum_operation.items.filter(
            (item) => item.status === "observed",
          ).length,
          missing_count: snapshot.scrum_operation.items.filter((item) => item.status === "missing")
            .length,
        }
      : null,
    drive_model: {
      forward_spine_model: driveModel.forward_spine_model,
      registered_entry_models: driveModel.registered_entry_models,
      registered_entry_model_count: driveModel.registered_entry_model_count,
      missing_registered_entry_models: driveModel.missing_registered_entry_models,
      selected_model: driveModel.selected_model,
      selected_route_id: driveModel.selected_candidate.route_id,
      selection_status: driveModel.selection_status,
      default_model: driveModel.default_model,
      candidate_count: driveModel.candidate_count,
      candidate_models: driveModel.candidates.map((candidate) => candidate.model),
      available_models: driveModel.available_models,
      blocked_models: driveModel.blocked_models,
      must_return_to_design: snapshot.drive_route.mustReturnToDesign,
      selected_route_command: driveModel.selected_candidate.command,
      source_command: driveModel.source_command,
    },
    closure_frontier: {
      action: closeReadyReview.action,
      approval_required: closeReadyReview.approval_required,
      total: closeReadyReview.total,
      listed: closeReadyReview.listed,
      omitted: closeReadyReview.omitted,
      approval_window_count: closeReadyReview.approval_window_count,
      review_window_index: closeReadyReview.review_window_index,
      review_scope: closeReadyReview.review_scope,
      aggregate_review_scope: closeReadyReview.aggregate_review_scope,
      decision_id: closeReadyReview.decision.decision_id,
      current_window_command: closeReadyReview.current_window_command,
      previous_window_command: closeReadyReview.previous_window_command,
      next_window_command: closeReadyReview.next_window_command,
      transition_window_command: closeReadyReview.transition_window_command,
      decision_draft_command: closeReadyReview.decision_draft_command,
      decision_draft_record_command: closeReadyReview.decision_draft_record_command,
      approval_review_checklist: closeReadyReview.approval_review_checklist,
      source_command: closeReadyReview.source_command,
    },
    vmodel_fit: {
      status: vmodelFit.status,
      gates: vmodelFit.gates,
      current_location_gate: vmodelFit.current_location_gate,
      recovery_runway_gate: vmodelFit.recovery_runway_gate,
      recovery_handoff_gate: vmodelFit.recovery_handoff_gate,
      approval_review_gate: vmodelFit.approval_review_gate,
      regression_guards: vmodelFit.regression_guards,
      function_design_policy: functionDesignPolicy,
      source_command: vmodelFit.source_command,
    },
    skill_binding: {
      status: skillBinding.status,
      source_package: skillBinding.source_package,
      selected_model: skillBinding.selected_model,
      workflow_modes: skillBinding.workflow_modes,
      l12_layers: skillBinding.l12_layers,
      required_skills: skillBinding.required_skills,
      recommended_skills: skillBinding.recommended_skills,
      optional_skills: skillBinding.optional_skills,
      item_count: skillBinding.item_count,
      top_items: skillBinding.top_items,
      source_command: skillBinding.source_command,
    },
    commands: {
      project_frontier: "helix progress frontier --summary-json",
      current_location: "helix current-location --summary-json",
      drive_model: driveModel.source_command,
      closure_review_window: closeReadyReview.current_window_command,
      closure_transition_window: closeReadyReview.transition_window_command,
      closure_decision_draft: closeReadyReview.decision_draft_command,
      closure_decision_draft_record: closeReadyReview.decision_draft_record_command,
      vmodel_fit: vmodelFit.source_command,
      skill_binding: skillBinding.source_command,
    },
    write_policy: "read-only",
    source_command: "helix progress frontier --summary-json",
  };
}

function findTreeNodeById(
  nodes: ReturnType<typeof buildVisualizationTreeView>["roots"],
  id: string,
): ReturnType<typeof buildVisualizationTreeView>["roots"][number] | null {
  const queue = [...nodes];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;
    if (node.id === id) return node;
    queue.push(...node.children);
  }
  return null;
}

function buildProjectViewOutline(
  tree: ReturnType<typeof buildVisualizationTreeView>,
  projectFrontierSummary: ReturnType<typeof buildProjectFrontierSummary>,
) {
  const projectRoot = tree.roots.find((root) => root.id === "project") ?? null;
  const currentNode = findTreeNodeById(tree.roots, "project/current-location");
  const roadmapNode = findTreeNodeById(tree.roots, "project/current-location/roadmap-position");
  const driveNode = findTreeNodeById(tree.roots, "project/current-location/drive");
  const operationNode = findTreeNodeById(tree.roots, "project/current-location/operation-scope");
  const skillNode = findTreeNodeById(tree.roots, "project/current-location/skill-binding");
  const closureNode = findTreeNodeById(
    tree.roots,
    "project/current-location/closure/apply-readiness",
  );
  const topSkill = projectFrontierSummary.skill_binding.top_items[0] ?? null;
  const sections = [
    {
      id: "current-location",
      tree_node_id: currentNode?.id ?? "project/current-location",
      label: currentNode?.label ?? "Current location",
      status: projectFrontierSummary.current.status,
      description: currentNode?.description ?? "",
      command: "helix current-location --summary-json",
    },
    {
      id: "roadmap-position",
      tree_node_id: roadmapNode?.id ?? "project/current-location/roadmap-position",
      label: roadmapNode?.label ?? "Roadmap position",
      status: projectFrontierSummary.current.roadmap_frontier.length > 0 ? "frontier" : "current",
      description: roadmapNode?.description ?? "",
      command: "helix roadmap current --summary-json",
    },
    {
      id: "drive-model",
      tree_node_id: driveNode?.id ?? "project/current-location/drive",
      label: driveNode?.label ?? "Drive model",
      status: projectFrontierSummary.drive_model.selection_status,
      description: driveNode?.description ?? "",
      command: "helix drive model --summary-json",
    },
    {
      id: "scrum-operation",
      tree_node_id: "project/current-location/scrum-operation",
      label: "Scrum operation",
      status: projectFrontierSummary.scrum_operation?.status ?? "not_observed",
      description: projectFrontierSummary.scrum_operation
        ? `${projectFrontierSummary.scrum_operation.observed_count}/${projectFrontierSummary.scrum_operation.missing_count}`
        : "",
      command: "helix current-location --summary-json",
    },
    {
      id: "operation-scope",
      tree_node_id: operationNode?.id ?? "project/current-location/operation-scope",
      label: operationNode?.label ?? "Operation scope",
      status: projectFrontierSummary.operation_scope.missing > 0 ? "missing" : "observed",
      description: operationNode?.description ?? "",
      command: "helix current-location --summary-json",
    },
    {
      id: "skill-binding",
      tree_node_id: skillNode?.id ?? "project/current-location/skill-binding",
      label: skillNode?.label ?? "Skill binding",
      status: projectFrontierSummary.skill_binding.status,
      description: skillNode?.description ?? "",
      command: "helix skill suggest --current-location --summary-json",
    },
    {
      id: "closure-frontier",
      tree_node_id: closureNode?.id ?? "project/current-location/closure/apply-readiness",
      label: closureNode?.label ?? "Closure frontier",
      status: projectFrontierSummary.closure_frontier.approval_review_checklist.status,
      description: closureNode?.description ?? "",
      command: projectFrontierSummary.closure_frontier.current_window_command,
    },
    {
      id: "vmodel-fit",
      tree_node_id: "project/current-location/vmodel-fit",
      label: "V-model fit",
      status: projectFrontierSummary.vmodel_fit.status,
      description: projectFrontierSummary.vmodel_fit.current_location_gate.status,
      command: "helix vmodel fit --summary-json",
    },
  ];

  return {
    schema_version: "project-view-outline.v1",
    source_command: "helix progress tree-view --summary-json",
    full_source_command: "helix progress tree-view --json",
    root_id: projectRoot?.id ?? "project",
    root_label: projectRoot?.label ?? "Project",
    root_child_count: projectRoot?.children.length ?? 0,
    section_count: sections.length,
    sections,
    current_location: {
      layer: projectFrontierSummary.current.layer,
      l12_layer: projectFrontierSummary.current.l12_layer,
      status: projectFrontierSummary.current.status,
      completion_boundary: projectFrontierSummary.current.completion_boundary,
      frontier_type: projectFrontierSummary.current_location_frontier.frontier_type,
      classification: projectFrontierSummary.current_location_frontier.classification,
      command: "helix current-location --summary-json",
    },
    roadmap_position: {
      frontier_count: projectFrontierSummary.current.roadmap_frontier.length,
      frontier: projectFrontierSummary.current.roadmap_frontier,
      command: "helix roadmap current --summary-json",
    },
    roadmap: {
      frontier_count: projectFrontierSummary.current.roadmap_frontier.length,
      frontier: projectFrontierSummary.current.roadmap_frontier,
      command: "helix roadmap current --summary-json",
    },
    drive_model: {
      selected_model: projectFrontierSummary.drive_model.selected_model,
      selection_status: projectFrontierSummary.drive_model.selection_status,
      forward_spine_model: projectFrontierSummary.drive_model.forward_spine_model,
      registered_entry_model_count: projectFrontierSummary.drive_model.registered_entry_model_count,
      missing_registered_entry_models:
        projectFrontierSummary.drive_model.missing_registered_entry_models,
      candidate_count: projectFrontierSummary.drive_model.candidate_count,
      command: "helix drive model --summary-json",
    },
    scrum_operation: projectFrontierSummary.scrum_operation
      ? {
          status: projectFrontierSummary.scrum_operation.status,
          source_package: projectFrontierSummary.scrum_operation.source_package,
          observed_count: projectFrontierSummary.scrum_operation.observed_count,
          missing_count: projectFrontierSummary.scrum_operation.missing_count,
          command: "helix current-location --summary-json",
        }
      : null,
    operation_scope: {
      observed: projectFrontierSummary.operation_scope.observed,
      missing: projectFrontierSummary.operation_scope.missing,
      reverify: projectFrontierSummary.operation_scope.reverify,
      item_count: projectFrontierSummary.operation_scope.items.length,
      command: "helix current-location --summary-json",
    },
    skill_binding: {
      status: projectFrontierSummary.skill_binding.status,
      selected_model: projectFrontierSummary.skill_binding.selected_model,
      required_skills: projectFrontierSummary.skill_binding.required_skills,
      item_count: projectFrontierSummary.skill_binding.item_count,
      top_skill_path: topSkill?.skill_path ?? null,
      command: "helix skill suggest --current-location --summary-json",
    },
    closure_frontier: {
      action: projectFrontierSummary.closure_frontier.action,
      total: projectFrontierSummary.closure_frontier.total,
      approval_window_count: projectFrontierSummary.closure_frontier.approval_window_count,
      checklist_status: projectFrontierSummary.closure_frontier.approval_review_checklist.status,
      command: projectFrontierSummary.closure_frontier.current_window_command,
    },
    vmodel_fit: {
      status: projectFrontierSummary.vmodel_fit.status,
      current_location_status: projectFrontierSummary.vmodel_fit.current_location_gate.status,
      approval_review_status: projectFrontierSummary.vmodel_fit.approval_review_gate.status,
      attention_boundary: projectFrontierSummary.vmodel_fit.regression_guards.attention_boundary,
      command: "helix vmodel fit --summary-json",
    },
  };
}

function buildCompletionFrontierSummary(repoRoot: string, completionClaimAllowed: boolean) {
  const db = openHarnessDb(":memory:", { repoRoot });
  try {
    rebuildHarnessDb({ repoRoot, db });
    const projectFrontier = buildProjectFrontierSummary(
      repoRoot,
      buildProjectCurrentLocationSnapshot(db),
    );
    const recoveryRunway = projectFrontier.vmodel_fit.current_location_gate.recovery_runway;
    const reentryForecast = projectFrontier.vmodel_fit.current_location_gate.reentry_forecast;
    return {
      schema_version: "completion-frontier-summary.v1",
      completion_claim_allowed: completionClaimAllowed,
      status: projectFrontier.vmodel_fit.status,
      current: projectFrontier.current,
      current_location_frontier: projectFrontier.current_location_frontier,
      function_design_policy: projectFrontier.function_design_policy,
      drive_model: projectFrontier.drive_model,
      recovery_runway: {
        status: recoveryRunway.status,
        machine_actionable_count: recoveryRunway.machine_actionable_count,
        human_approval_count: recoveryRunway.human_approval_count,
        design_reverse_count: recoveryRunway.design_reverse_count,
        remaining_after_machine_lanes: recoveryRunway.remaining_after_machine_lanes,
        next_machine_command: recoveryRunway.next_machine_command,
      },
      reentry_forecast: {
        status: reentryForecast.status,
        effective_status: reentryForecast.effective_status,
        current_blocking_count: reentryForecast.current_blocking_count,
        blocking_after_machine_lanes: reentryForecast.blocking_after_machine_lanes,
        required_phase_count: reentryForecast.required_phase_count,
        next_phase_action: reentryForecast.next_phase_action,
        next_gate: reentryForecast.next_gate,
        next_command: reentryForecast.next_command,
        next_execution_command: reentryForecast.next_execution_command,
      },
      closure_frontier: projectFrontier.closure_frontier,
      commands: {
        project_frontier: projectFrontier.source_command,
        current_location: projectFrontier.commands.current_location,
        vmodel_fit: projectFrontier.commands.vmodel_fit,
        closure_review_window: projectFrontier.commands.closure_review_window,
        closure_transition_window: projectFrontier.commands.closure_transition_window,
        closure_decision_draft: projectFrontier.commands.closure_decision_draft,
        closure_decision_draft_record: projectFrontier.commands.closure_decision_draft_record,
      },
      write_policy: "read-only",
      source_command: "helix completion decision-packet --summary-json",
      project_frontier_source_command: projectFrontier.source_command,
    };
  } finally {
    db.close();
  }
}

type ProbeRecordOutput = {
  requested: boolean;
  path: string | null;
  written: boolean;
  bytes: number;
  sha256: string | null;
};

function summarizeProjectArtifactRemapBatchReport(report: ProjectArtifactRemapBatchReport) {
  return {
    schema_version: "project-artifact-remap-batch-summary.v1",
    source_clock: report.source_clock,
    selected_layer: report.selected_layer,
    selected_status: report.selected_status,
    current: report.current,
    drive_route: {
      route_id: report.drive_route.routeId,
      status: report.drive_route.status,
      selected_model: report.drive_route.selectedModel,
      must_return_to_design: report.drive_route.mustReturnToDesign,
    },
    layers: report.layers.map((layer) => ({
      layer: layer.layer,
      label: layer.label,
      status: layer.status,
      drive_model: layer.driveModel,
      total: layer.total,
      done: layer.done,
      missing: layer.missing,
      reverify: layer.reverify,
      command: summaryJsonCommand(layer.batchCommand),
    })),
    total: report.total,
    listed: report.listed,
    omitted: report.omitted,
    limit: report.limit,
    counts: report.counts,
    recommended_next_action: {
      model: report.recommended_next_action.model,
      command: summaryJsonCommand(report.recommended_next_action.command),
      human_required: report.recommended_next_action.human_required,
      reason: report.recommended_next_action.reason,
    },
    item_count: report.items.length,
    sample_item_count: Math.min(report.items.length, 10),
    sample_items: report.items.slice(0, 10).map((item) => ({
      kind: item.kind,
      artifact_id: item.artifactId,
      source_path: item.sourcePath,
      legacy_layer: item.legacyLayer,
      l12_layer: item.l12Layer,
      coverage_id: item.coverageId,
      status: item.status,
      drive_model: item.driveModel,
      required_action: item.requiredAction,
      zip_source_binding_ids: item.zipSourceBindingIds,
      tailoring_rule_ids: item.tailoringRuleIds,
      tailoring_detail_levels: item.tailoringDetailLevels,
      closure_link: item.closureLink
        ? {
            plan_id: item.closureLink.planId,
            next_action: item.closureLink.nextAction,
            evidence_status: item.closureLink.evidenceStatus,
            remediation_status: item.closureLink.remediationStatus,
            batch_command: summaryJsonCommand(item.closureLink.batchCommand),
            review_command: summaryJsonCommand(item.closureLink.reviewCommand),
            transition_command: summaryJsonCommand(item.closureLink.transitionCommand),
            priority: item.closureLink.priority,
          }
        : null,
      doc_dependency_count: item.docDependencies.length,
      implementation_dependency_count: item.implementationDependencies.length,
      reason_count: item.reasons.length,
    })),
    write_policy: report.write_policy,
    source_command: "helix artifact-remap batch --summary-json",
    full_source_command: report.source_command,
    view_command: summaryJsonCommand(report.view_command),
    full_view_command: report.view_command,
  };
}

artifactRemap
  .command("batch")
  .description("emit a machine-readable L12 artifact remap batch")
  .option("--layer <layer>", "L1..L12 canonical layer")
  .option("--status <status>", "done | missing | reverify")
  .option("--limit <n>", "maximum remap items to include", "20")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      layer?: string;
      status?: string;
      limit?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.status !== undefined && !isProjectArtifactRemapStatus(opts.status)) {
        process.stderr.write(
          `artifact-remap batch: invalid status=${opts.status} (expected done, missing, reverify)\n`,
        );
        process.exitCode = 2;
        return;
      }
      if (opts.layer !== undefined && !/^L(?:[1-9]|1[0-2])$/.test(opts.layer)) {
        process.stderr.write(
          `artifact-remap batch: invalid layer=${opts.layer} (expected L1..L12)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`artifact-remap batch: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const report = buildProjectArtifactRemapBatchReport(snapshot, {
          layer: opts.layer,
          status: opts.status,
          limit,
        });
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeProjectArtifactRemapBatchReport(report), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `artifact-remap batch: layer=${report.selected_layer ?? "all"} status=${report.selected_status ?? "all"} total=${report.total} listed=${report.listed} omitted=${report.omitted} done=${report.counts.done} missing=${report.counts.missing} reverify=${report.counts.reverify} model=${report.recommended_next_action.model} write=${report.write_policy}\n`,
        );
        process.stdout.write(
          `  recommended=${report.recommended_next_action.command} reason=${report.recommended_next_action.reason}\n`,
        );
        for (const item of report.items) {
          process.stdout.write(
            `  item: ${item.artifactId} ${item.kind} ${item.status} ${item.legacyLayer ?? "-"}->${item.l12Layer ?? "-"} model=${item.driveModel} action=${item.requiredAction}\n`,
          );
          process.stdout.write(
            `    coverage: ${item.coverageId ?? "-"} zip=${item.zipSourceBindingIds.join(",") || "-"} tailoring=${item.tailoringRuleIds.join(",") || "-"} detail=${item.tailoringDetailLevels.join(",") || "-"}\n`,
          );
          if (item.closureLink) {
            process.stdout.write(
              `    closure-link: next=${item.closureLink.nextAction} evidence=${item.closureLink.evidenceStatus} command=${item.closureLink.batchCommand}\n`,
            );
          }
        }
      } finally {
        db.close();
      }
    },
  );

const closure = program
  .command("closure")
  .description("Project closure read-only automation surfaces");

function closureAuthorityFailureExitCode(error: unknown): 1 | 2 {
  if (error instanceof Error && error.name === "ZodError") return 2;
  const code = (error as { code?: unknown } | null)?.code;
  if (code === "ENOENT" || code === "EEXIST") return 2;
  const message = error instanceof Error ? error.message : String(error);
  return /(?:invalid|missing|must|required|forbidden|self-approval|binding mismatch|TTL|digest mismatch|drift|CAS mismatch|replay|offset gap|outside repository|symlink|already exists|provenance mismatch|candidate order|cardinality)/i.test(
    message,
  )
    ? 2
    : 1;
}

function closureConvergenceTargetFromSnapshot(
  snapshot: ProjectCurrentLocationSnapshot,
  automatablePlanIds: string[],
  additionalNeeds: string[] = [],
) {
  const boundaries = snapshot.closure.terminal_boundaries.items.filter(
    (row) => row.whole_program_blocker,
  );
  const human = boundaries
    .filter((row) => row.classification === "human_only")
    .map((row) => row.plan_id)
    .sort();
  const invalid = boundaries
    .filter((row) => row.classification === "invalid_escalated")
    .map((row) => row.plan_id)
    .sort();
  const automatable = [...new Set(automatablePlanIds)].sort();
  const needs = [
    ...snapshot.closure.queue.items
      .filter((item) => item.nextAction !== "close_ready")
      .map((item) => item.planId),
    ...additionalNeeds,
  ]
    .filter((id) => !automatable.includes(id))
    .sort();
  const initial = [...new Set([...automatable, ...needs, ...human, ...invalid])].sort();
  return buildClosureConvergenceTargetSet({
    initialPlanIds: initial,
    eligiblePlanIds: automatable,
    needsPlanIds: needs,
    humanOnlyPlanIds: human,
    invalidEscalatedPlanIds: invalid,
    terminalBoundaryEventDigests: boundaries.map((row) => row.event_digest as `sha256:${string}`),
  });
}

function recordClosureWindowTerminalBoundaries(input: {
  repoRoot: string;
  run: ReturnType<typeof loadClosureAuthorityProposal>;
  offset: number;
  limit: number;
  cycleDigest: `sha256:${string}`;
  registryDigest: `sha256:${string}`;
}) {
  const windowLength = input.run.candidate_plan_ids.slice(
    input.offset,
    input.offset + input.limit,
  ).length;
  if (input.offset + windowLength !== input.run.candidate_plan_ids.length) return [];
  const selected = input.run.bundle.decisions;
  const initialSetDigest = `sha256:${createHash("sha256")
    .update(JSON.stringify(input.run.candidate_plan_ids))
    .digest("hex")}` as const;
  const recorded: string[] = [];
  for (const decision of selected) {
    if (decision.classification !== "human_only" && decision.classification !== "invalid") continue;
    appendClosureTerminalBoundaryEvent({
      repoRoot: input.repoRoot,
      path: "docs/governance/closure-terminal-boundaries.jsonl",
      event: {
        event_kind: "boundary_opened",
        authority_head: input.run.bundle.repository_head,
        initial_set_digest: initialSetDigest,
        cycle_digest: input.cycleDigest,
        registry_generation: input.registryDigest,
        plan_id: decision.plan_id,
        classification:
          decision.classification === "human_only" ? "human_only" : "invalid_escalated",
        reason: decision.reason,
        owner: decision.classification === "human_only" ? "PO" : "HELIX governance",
        next_decision_route: decision.required_action,
        automation_terminal: true,
        whole_program_blocker: true,
      },
    });
    recorded.push(decision.plan_id);
  }
  return recorded;
}

function updatePlanFrontmatterStatus(content: string, nextStatus: string): string {
  if (!content.startsWith("---\n")) {
    throw new Error("frontmatter が見つからないため status を更新できない");
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    throw new Error("frontmatter 終端が見つからないため status を更新できない");
  }
  const head = content.slice(0, end);
  const tail = content.slice(end);
  if (/^status:\s*.+$/m.test(head)) {
    return `${head.replace(/^status:\s*.+$/m, `status: ${nextStatus}`)}${tail}`;
  }
  return `${head}\nstatus: ${nextStatus}${tail}`;
}

function appendMaterializedFrontmatterBlock(content: string, lines: string[]): string {
  if (!content.startsWith("---\n")) {
    throw new Error("frontmatter が見つからないため materialized evidence を追記できない");
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    throw new Error("frontmatter 終端が見つからないため materialized evidence を追記できない");
  }
  const head = content.slice(0, end);
  if (/^review_evidence:\s*$/m.test(head)) {
    throw new Error("既存 review_evidence の merge は未対応のため evidence-apply を停止する");
  }
  const tail = content.slice(end);
  return `${head}\n${lines.join("\n")}${tail}`;
}

function summarizeClosureEvidenceProbePacket(
  packet: ProjectClosureEvidenceProbePacket,
  probeRecordOutput: ProbeRecordOutput,
) {
  return {
    schema_version: "project-closure-evidence-probe-summary.v1",
    source_clock: packet.source_clock,
    selected_action: packet.selected_action,
    dry_run: packet.dry_run,
    command: packet.command,
    can_execute: packet.can_execute,
    command_source: packet.command_source,
    confidence: packet.confidence,
    target_plan_ids: packet.target_plan_ids,
    projection_binding: packet.projection_binding
      ? {
          target_tables: packet.projection_binding.target_tables,
          source_surfaces: packet.projection_binding.source_surfaces,
          required_fields: packet.projection_binding.required_fields,
          postcheck_commands: packet.projection_binding.postcheck_commands.map(summaryJsonCommand),
        }
      : null,
    execution: packet.execution
      ? {
          command: packet.execution.command,
          session_id: packet.execution.session_id ?? null,
          correlation_id: packet.execution.correlation_id ?? null,
          completed_at: packet.execution.completed_at,
          exit_code: packet.execution.exit_code,
          status: packet.execution.status,
          output_digest: packet.execution.output_digest,
          stdout_bytes: packet.execution.stdout_bytes,
          stderr_bytes: packet.execution.stderr_bytes,
        }
      : null,
    probe_record_output: probeRecordOutput,
    placeholder_resolution: {
      fillable_count: packet.placeholder_resolution.fillable_placeholders.length,
      remaining_count: packet.placeholder_resolution.remaining_placeholders.length,
      required_action: packet.placeholder_resolution.required_action,
      fillable_placeholders: packet.placeholder_resolution.fillable_placeholders,
      remaining_placeholders: packet.placeholder_resolution.remaining_placeholders,
    },
    apply_readiness: packet.apply_readiness,
    postcheck_commands: packet.postcheck_commands.map(summaryJsonCommand),
    finding_count: packet.findings.length,
    sample_findings: packet.findings.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map((finding) => ({
      severity: finding.severity,
      code: finding.code,
      detail: finding.detail,
    })),
    write_policy: packet.write_policy,
    source_command: "helix closure evidence-probe --summary-json",
    full_source_command: packet.source_command,
    view_command: summaryJsonCommand(packet.view_command),
    full_view_command: packet.view_command,
  };
}

function summarizeClosureMaterializePacket(packet: ProjectClosureEvidenceMaterializePacket) {
  return {
    schema_version: "project-closure-evidence-materialize-summary.v1",
    source_clock: packet.source_clock,
    selected_action: packet.selected_action,
    probe_execution: packet.probe_execution
      ? {
          command: packet.probe_execution.command,
          session_id: packet.probe_execution.session_id ?? null,
          correlation_id: packet.probe_execution.correlation_id ?? null,
          completed_at: packet.probe_execution.completed_at,
          exit_code: packet.probe_execution.exit_code,
          status: packet.probe_execution.status,
          output_digest: packet.probe_execution.output_digest,
        }
      : null,
    queue_total: packet.queue_total,
    queue_listed: packet.queue_listed,
    queue_omitted: packet.queue_omitted,
    materialized_candidate_count: packet.materialized_candidate_count,
    materialize_readiness: packet.materialize_readiness,
    approval: packet.approval,
    sample_candidates: packet.materialized_candidates
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        plan_id: candidate.plan_id,
        artifact_path: candidate.artifact_path,
        operation: candidate.operation,
        materialized_preview_digest: candidate.materialized_preview_digest,
        remaining_placeholder_count: candidate.remaining_placeholder_count,
        ready_for_approval: candidate.ready_for_approval,
      })),
    postcheck_commands: packet.postcheck_commands.map(summaryJsonCommand),
    write_policy: packet.write_policy,
    source_command: "helix closure evidence-materialize --summary-json",
    view_command: summaryJsonCommand(packet.view_command),
    full_view_command: packet.view_command,
    findings: packet.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureEvidencePlan(plan: ProjectClosureEvidencePlan) {
  return {
    schema_version: "project-closure-evidence-plan-summary.v1",
    source_clock: plan.source_clock,
    selected_action: plan.selected_action,
    current: plan.current,
    total: plan.total,
    listed: plan.listed,
    omitted: plan.omitted,
    limit: plan.limit,
    evidence_gap_counts: plan.evidence_gap_counts,
    target_tables: plan.target_tables,
    item_count: plan.items.length,
    sample_items: plan.items.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map((item) => ({
      plan_id: item.plan_id,
      source_path: item.source_path,
      next_action: item.next_action,
      evidence_status: item.evidence_status,
      target_tables: item.target_tables,
      gap_count: item.evidence_gaps.length,
      repair_target_count: item.repair_targets.length,
      template_tables: item.evidence_templates.map((template) => template.table),
      expected_transition: item.expected_transition,
      required_action: item.required_action,
    })),
    acceptance_criteria: plan.acceptance_criteria,
    postcheck_commands: plan.postcheck_commands.map(summaryJsonCommand),
    expected_transition: plan.expected_transition,
    write_policy: plan.write_policy,
    source_command: "helix closure evidence-plan --summary-json",
    view_command: summaryJsonCommand(plan.view_command),
    full_view_command: plan.view_command,
    findings: plan.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureBatchReport(report: ProjectClosureBatchReport) {
  return {
    schema_version: "project-closure-batch-summary.v1",
    source_clock: report.source_clock,
    selected_action: report.selected_action,
    available_actions: report.available_actions,
    current: report.current,
    drive_route: {
      route_id: report.drive_route.routeId,
      status: report.drive_route.status,
      selected_model: report.drive_route.selectedModel,
      default_model: report.drive_route.defaultModel,
      must_return_to_design: report.drive_route.mustReturnToDesign,
    },
    packet: report.packet
      ? {
          packet_id: report.packet.packetId,
          next_action: report.packet.nextAction,
          count: report.packet.count,
          drive_model: report.packet.driveModel,
          l12_layer: report.packet.l12Layer,
          required_action: report.packet.requiredAction,
          expected_transition: report.packet.automation.expectedTransition,
          promotion_gate: report.packet.automation.promotionGate,
          review_command: `helix closure batch --action ${report.packet.nextAction} --summary-json`,
        }
      : null,
    ledger: report.ledger
      ? {
          ledger_id: report.ledger.ledgerId,
          status: report.ledger.status,
          human_required: report.ledger.humanRequired,
          evidence_policy: report.ledger.evidencePolicy,
          count: report.ledger.count,
        }
      : null,
    total: report.total,
    listed: report.listed,
    omitted: report.omitted,
    limit: report.limit,
    offset: report.offset,
    window: report.window,
    work_bucket_count: report.work_buckets.length,
    sample_work_buckets: report.work_buckets
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((bucket) => ({
        bucket_id: bucket.bucket_id,
        action: bucket.action,
        rank: bucket.rank,
        count: bucket.count,
        listed: bucket.listed,
        omitted: bucket.omitted,
        evidence_signature: bucket.evidence_signature,
        evidence_statuses: bucket.evidence_statuses,
        target_tables: bucket.target_tables,
        primary_command: summaryJsonCommand(bucket.primary_command),
        evidence_plan_command: summaryJsonCommand(bucket.evidence_plan_command),
        repair_plan: {
          status: bucket.repair_plan.status,
          failed_evidence_count: bucket.repair_plan.failed_evidence_count,
          latest_failed_at: bucket.repair_plan.latest_failed_at,
          automation_status: bucket.repair_plan.automation.status,
          runnable_command_count: bucket.repair_plan.automation.runnable_command_count,
          safe_resolution_command_count:
            bucket.repair_plan.automation.safe_resolution_command_count,
          projection_item_count: bucket.repair_plan.automation.projection_item_count,
          primary_next_command: summaryJsonCommandOrNull(
            bucket.repair_plan.automation.primary_next_command,
          ),
        },
        sample_plan_ids: bucket.sample_plan_ids,
        required_action: bucket.required_action,
        expected_transition: bucket.expected_transition,
      })),
    queue_item_count: report.queue_items.length,
    sample_queue_items: report.queue_items.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map((item) => ({
      plan_id: item.planId,
      source_path: item.sourcePath,
      next_action: item.nextAction,
      evidence_status: item.evidence.status,
      evidence_action: item.evidenceAction,
      evidence_gaps: item.evidenceGaps.map((gap) => ({
        component: gap.component,
        status: gap.status,
      })),
    })),
    write_policy: report.write_policy,
    source_command: "helix closure batch --summary-json",
    view_command: summaryJsonCommand(report.view_command),
    full_view_command: report.view_command,
    findings: report.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureEvidencePatchPacket(packet: ProjectClosureEvidencePatchPacket) {
  return {
    schema_version: "project-closure-evidence-patch-summary.v1",
    source_clock: packet.source_clock,
    selected_action: packet.selected_action,
    current: packet.current,
    drive_route: {
      route_id: packet.drive_route.routeId,
      status: packet.drive_route.status,
      selected_model: packet.drive_route.selectedModel,
      default_model: packet.drive_route.defaultModel,
      must_return_to_design: packet.drive_route.mustReturnToDesign,
    },
    queue_total: packet.queue_total,
    queue_listed: packet.queue_listed,
    queue_omitted: packet.queue_omitted,
    limit: packet.limit,
    patch_candidate_count: packet.patch_candidate_count,
    apply_readiness: packet.apply_readiness,
    approval: packet.approval,
    safety_policy: {
      ...packet.safety_policy,
      dry_run_command: summaryJsonCommand(packet.safety_policy.dry_run_command),
    },
    sample_patch_candidates: packet.patch_candidates
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        plan_id: candidate.plan_id,
        source_path: candidate.source_path,
        artifact_kind: candidate.artifact_kind,
        artifact_path: candidate.artifact_path,
        operation: candidate.operation,
        projection_target_tables: candidate.projection_target_tables,
        preview_digest: candidate.preview_digest,
        placeholder_count: candidate.placeholder_count,
        unresolved_placeholders: candidate.unresolved_placeholders,
        real_evidence_required: candidate.real_evidence_required,
        required_action: candidate.required_action,
      })),
    postcheck_commands: packet.postcheck_commands.map(summaryJsonCommand),
    write_policy: packet.write_policy,
    source_command: "helix closure evidence-patch --summary-json",
    view_command: summaryJsonCommand(packet.view_command),
    full_view_command: packet.view_command,
    findings: packet.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureOverview(overview: ProjectClosureOverview) {
  return {
    schema_version: "project-closure-overview-summary.v1",
    source_clock: overview.source_clock,
    current: overview.current,
    drive_route: {
      route_id: overview.drive_route.routeId,
      status: overview.drive_route.status,
      selected_model: overview.drive_route.selectedModel,
      default_model: overview.drive_route.defaultModel,
      must_return_to_design: overview.drive_route.mustReturnToDesign,
    },
    closure: {
      status: overview.closure.status,
      open_l7: overview.closure.open_l7,
      l14_claims: overview.closure.l14_claims,
      closure_evidence: overview.closure.closure_evidence,
      remediation: overview.closure.remediation,
      queue_total: overview.closure.queue_total,
      route_counts: overview.closure.route_counts,
      ledger_status_counts: overview.closure.ledger_status_counts,
      apply_readiness: {
        ...overview.closure.apply_readiness,
        dry_run_command: summaryJsonCommand(overview.closure.apply_readiness.dry_run_command),
        execute_command: summaryJsonCommand(overview.closure.apply_readiness.execute_command),
        review_bundle_command: summaryJsonCommand(
          overview.closure.apply_readiness.review_bundle_command,
        ),
        transition_plan_command: summaryJsonCommand(
          overview.closure.apply_readiness.transition_plan_command,
        ),
        review_window_command: summaryJsonCommand(
          overview.closure.apply_readiness.review_window_command,
        ),
        transition_window_command: summaryJsonCommand(
          overview.closure.apply_readiness.transition_window_command,
        ),
        decision_draft_command: summaryJsonCommand(
          overview.closure.apply_readiness.decision_draft_command,
        ),
      },
    },
    action_count: overview.actions.length,
    actions: overview.actions.map((action) => ({
      action: action.action,
      count: action.count,
      listed: action.listed,
      omitted: action.omitted,
      ledger_status: action.ledger_status,
      human_required: action.human_required,
      review_command: summaryJsonCommand(action.review_command),
      transition_command: summaryJsonCommand(action.transition_command),
      sample_plan_ids: action.sample_plan_ids,
      required_action: action.required_action,
      promotion_gate: action.promotion_gate,
    })),
    recommended_next_action: overview.recommended_next_action
      ? {
          ...overview.recommended_next_action,
          command: summaryJsonCommand(overview.recommended_next_action.command),
        }
      : null,
    finding_count: overview.findings.length,
    sample_findings: overview.findings.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
    write_policy: overview.write_policy,
    source_command: "helix closure overview --summary-json",
    view_command: summaryJsonCommand(overview.view_command),
    full_view_command: overview.view_command,
  };
}

function summarizeClosureApprovalDraftPacket(
  packet: ProjectClosureEvidenceApprovalDraftPacket,
  approvalRecordOutput: {
    requested: boolean;
    path: string | null;
    written: boolean;
    bytes: number;
    sha256: string | null;
    non_authorizing: true;
  },
) {
  return {
    schema_version: "project-closure-evidence-approval-draft-summary.v1",
    source_clock: packet.source_clock,
    selected_action: packet.selected_action,
    plan_only: packet.plan_only,
    must_not_apply: packet.must_not_apply,
    approval_allowed: packet.approval_allowed,
    apply_authorized: packet.apply_authorized,
    materialize_readiness: packet.materialize_readiness,
    materialized_candidate_count: packet.materialized_candidate_count,
    approval: packet.approval,
    candidate_digest_count: packet.candidate_digests.length,
    sample_candidate_digests: packet.candidate_digests
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        plan_id: candidate.plan_id,
        artifact_path: candidate.artifact_path,
        operation: candidate.operation,
        materialized_preview_digest: candidate.materialized_preview_digest,
        ready_for_approval: candidate.ready_for_approval,
      })),
    approval_record_template: packet.approval_record_template,
    approval_record_output: approvalRecordOutput,
    postcheck_commands: packet.postcheck_commands.map(summaryJsonCommand),
    write_policy: packet.write_policy,
    source_command: "helix closure evidence-approval-draft --summary-json",
    view_command: summaryJsonCommand(packet.view_command),
    full_view_command: packet.view_command,
    findings: packet.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureEvidenceApplyPlan(
  plan: ProjectClosureEvidenceApplyPlan,
  execution: {
    executed: boolean;
    applied_artifacts: Array<{
      candidate_id: string;
      artifact_path: string;
      operation: string;
    }>;
  },
) {
  return {
    schema_version: "project-closure-evidence-apply-summary.v1",
    source_clock: plan.source_clock,
    dry_run: plan.dry_run,
    selected_action: plan.selected_action,
    materialize_readiness: plan.materialize_readiness,
    approval: plan.approval,
    allowed_to_apply: plan.allowed_to_apply,
    blocked_reasons: plan.blocked_reasons,
    patch_candidate_count: plan.patch_candidates.length,
    sample_patch_candidates: plan.patch_candidates
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        plan_id: candidate.plan_id,
        artifact_path: candidate.artifact_path,
        operation: candidate.operation,
        materialized_preview_digest: candidate.materialized_preview_digest,
      })),
    executed: execution.executed,
    applied_artifacts: execution.applied_artifacts,
    postcheck_commands: plan.postcheck_commands.map(summaryJsonCommand),
    write_policy: plan.write_policy,
    source_command: "helix closure evidence-apply --summary-json",
    view_command: summaryJsonCommand(plan.view_command),
    full_view_command: plan.view_command,
  };
}

function summarizeClosureApprovalReviewChecklist(bundle: ProjectClosureReviewBundle) {
  const digestOk = /^sha256:[0-9a-f]{64}$/.test(bundle.review_scope.approval_scope_digest);
  const evidenceTotals = bundle.review_scope.evidence_totals;
  const hasReviewEvidence =
    evidenceTotals.evidence_paths > 0 ||
    evidenceTotals.test_runs_total > 0 ||
    evidenceTotals.gate_runs_total > 0 ||
    evidenceTotals.runtime_verification_total > 0;
  const blockedByFindings = Array.from(
    new Set([...bundle.review_scope.blocked_by_findings, ...bundle.decision.blocked_by_findings]),
  ).sort();
  const hasBlockingFindings = blockedByFindings.length > 0;
  const approvalAllowed =
    bundle.approval_required && bundle.listed > 0 && digestOk && !hasBlockingFindings;
  const approvalRoute =
    bundle.decision.outcome_routes.find((route) => route.outcome === "approve_closure_claim") ??
    null;
  const decisionDraftRecordCommand = `helix closure decision-draft --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --out .helix/tmp/closure/${bundle.action}-decision-draft-offset-${bundle.offset}.yml --summary-json`;

  return {
    schema_version: "project-closure-approval-review-checklist.v1",
    checklist_id: `closure-review:${bundle.action}:offset:${bundle.offset}`,
    scope: "current_window",
    status:
      bundle.listed === 0
        ? "empty_window"
        : hasBlockingFindings || !digestOk
          ? "blocked_by_findings"
          : "ready_for_human_review",
    non_authorizing: true,
    must_not_apply: true,
    approval_required: bundle.approval_required,
    approval_allowed: approvalAllowed,
    allowed_outcomes: bundle.decision.allowed_outcomes,
    required_checks: [
      {
        check_id: "window_candidate_scope",
        status: bundle.listed > 0 ? "pass" : "blocked",
        evidence_field: "listed",
        expected: bundle.listed,
      },
      {
        check_id: "approval_scope_digest",
        status: digestOk ? "pass" : "blocked",
        evidence_field: "review_scope.approval_scope_digest",
        expected: bundle.review_scope.approval_scope_digest,
      },
      {
        check_id: "window_evidence_totals",
        status: hasReviewEvidence ? "pass" : "review",
        evidence_field: "review_scope.evidence_totals",
        expected: evidenceTotals,
      },
      {
        check_id: "blocked_findings",
        status: hasBlockingFindings ? "blocked" : "pass",
        evidence_field: "decision.blocked_by_findings",
        expected: blockedByFindings,
      },
      {
        check_id: "decision_record_non_authorizing",
        status: "review",
        evidence_field: "decision_draft_record_command",
        expected: decisionDraftRecordCommand,
      },
    ],
    current_window_command: `helix closure review-bundle --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`,
    transition_window_command: `helix closure transition-plan --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`,
    decision_draft_command: `helix closure decision-draft --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`,
    decision_draft_record_command: decisionDraftRecordCommand,
    approval_route_command:
      approvalRoute === null ? null : summaryJsonCommand(approvalRoute.command),
    approval_route_postcheck_commands:
      approvalRoute === null ? [] : approvalRoute.postcheck_commands.map(summaryJsonCommand),
  };
}

function summarizeClosureReviewBundle(bundle: ProjectClosureReviewBundle) {
  const baseSummaryCommand = `helix closure review-bundle --action ${bundle.action} --summary-json`;
  const currentWindowCommand = `helix closure review-bundle --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`;
  const previousWindowCommand =
    bundle.window.previous_offset === null
      ? null
      : `helix closure review-bundle --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.window.previous_offset} --summary-json`;
  const nextWindowCommand =
    bundle.window.next_offset === null
      ? null
      : `helix closure review-bundle --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.window.next_offset} --summary-json`;
  const transitionWindowCommand = `helix closure transition-plan --action ${bundle.action} --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`;
  const decisionDraftCommand = (offset: number) =>
    `helix closure decision-draft --action ${bundle.action} --limit ${bundle.limit} --offset ${offset} --summary-json`;
  const decisionDraftRecordCommand = (offset: number) =>
    `helix closure decision-draft --action ${bundle.action} --limit ${bundle.limit} --offset ${offset} --out .helix/tmp/closure/${bundle.action}-decision-draft-offset-${offset}.yml --summary-json`;
  const reviewWindowIndex = bundle.review_window_index.map((window) => ({
    page_index: window.page_index,
    page_count: window.page_count,
    current: window.current,
    decision_id: bundle.decision.decision_id,
    allowed_outcomes: bundle.decision.allowed_outcomes,
    draft_outcome: "pending_human_review",
    non_authorizing: true,
    offset: window.offset,
    limit: window.limit,
    start: window.start,
    end: window.end,
    listed: window.listed,
    omitted_before: window.omitted_before,
    omitted_after: window.omitted_after,
    approval_scope_digest: window.review_scope.approval_scope_digest,
    review_scope: window.review_scope,
    decision_record_default_path: `.helix/tmp/closure/${bundle.action}-decision-draft-offset-${window.offset}.yml`,
    review_window_command: `helix closure review-bundle --action ${bundle.action} --limit ${bundle.limit} --offset ${window.offset} --summary-json`,
    transition_window_command: `helix closure transition-plan --action ${bundle.action} --limit ${bundle.limit} --offset ${window.offset} --summary-json`,
    decision_draft_command: decisionDraftCommand(window.offset),
    decision_draft_record_command: decisionDraftRecordCommand(window.offset),
  }));

  return {
    schema_version: "project-closure-review-bundle-summary.v1",
    source_clock: bundle.source_clock,
    action: bundle.action,
    approval_required: bundle.approval_required,
    current: bundle.current,
    total: bundle.total,
    listed: bundle.listed,
    omitted: bundle.omitted,
    limit: bundle.limit,
    offset: bundle.offset,
    window: bundle.window,
    approval_window_count: bundle.window.page_count,
    review_window_index: reviewWindowIndex,
    review_scope: bundle.review_scope,
    aggregate_review_scope: bundle.aggregate_review_scope,
    decision: {
      decision_id: bundle.decision.decision_id,
      allowed_outcomes: bundle.decision.allowed_outcomes,
      outcome_routes: bundle.decision.outcome_routes.map((route) => ({
        ...route,
        command: summaryJsonCommand(route.command),
        transition_command: summaryJsonCommand(route.transition_command),
        postcheck_commands: route.postcheck_commands.map(summaryJsonCommand),
      })),
      required_evidence: bundle.decision.required_evidence,
      blocked_by_findings: bundle.decision.blocked_by_findings,
    },
    current_window_command: currentWindowCommand,
    previous_window_command: previousWindowCommand,
    next_window_command: nextWindowCommand,
    transition_window_command: transitionWindowCommand,
    decision_draft_command: decisionDraftCommand(bundle.offset),
    decision_draft_record_command: decisionDraftRecordCommand(bundle.offset),
    approval_review_checklist: summarizeClosureApprovalReviewChecklist(bundle),
    candidate_count: bundle.candidates.length,
    sample_candidates: bundle.candidates
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        planId: candidate.planId,
        nextAction: candidate.nextAction,
        sourcePath: candidate.sourcePath,
        l12Layer: candidate.l12Layer,
        coverageId: candidate.coverageId,
        evidence_status: candidate.evidence.status,
        test_runs: candidate.evidence.testRuns,
        gate_runs: candidate.evidence.gateRuns,
        runtime_verification: candidate.evidence.runtimeVerification,
      })),
    safeguards: bundle.safeguards,
    write_policy: bundle.write_policy,
    source_command: baseSummaryCommand,
    full_source_command: bundle.source_command,
    view_command: summaryJsonCommand(bundle.view_command),
    full_view_command: bundle.view_command,
  };
}

function summarizeClosureTransitionPlan(plan: ProjectClosureTransitionPlan) {
  const baseSummaryCommand = `helix closure transition-plan --action ${plan.action} --decision ${plan.decision_outcome} --summary-json`;
  const currentWindowCommand = `helix closure transition-plan --action ${plan.action} --decision ${plan.decision_outcome} --limit ${plan.limit} --offset ${plan.offset} --summary-json`;
  const previousWindowCommand =
    plan.window.previous_offset === null
      ? null
      : `helix closure transition-plan --action ${plan.action} --decision ${plan.decision_outcome} --limit ${plan.limit} --offset ${plan.window.previous_offset} --summary-json`;
  const nextWindowCommand =
    plan.window.next_offset === null
      ? null
      : `helix closure transition-plan --action ${plan.action} --decision ${plan.decision_outcome} --limit ${plan.limit} --offset ${plan.window.next_offset} --summary-json`;
  const fullSourceCommand = `helix closure transition-plan --action ${plan.action} --decision ${plan.decision_outcome} --limit ${plan.limit} --offset ${plan.offset} --json`;

  return {
    schema_version: "project-closure-transition-plan-summary.v1",
    source_clock: plan.source_clock,
    action: plan.action,
    decision_outcome: plan.decision_outcome,
    dry_run: plan.dry_run,
    current: plan.current,
    total: plan.total,
    listed: plan.listed,
    omitted: plan.omitted,
    limit: plan.limit,
    offset: plan.offset,
    window: plan.window,
    approval_scope_digest: plan.approval_scope_digest,
    allowed_to_apply: plan.allowed_to_apply,
    blocked_reasons: plan.blocked_reasons,
    outcome_projection: {
      outcome: plan.outcome_projection.outcome,
      projection_type: plan.outcome_projection.projection_type,
      target_action: plan.outcome_projection.target_action,
      drive_model: plan.outcome_projection.drive_model,
      human_required: plan.outcome_projection.human_required,
      command: summaryJsonCommand(plan.outcome_projection.command),
      transition_command: summaryJsonCommand(plan.outcome_projection.transition_command),
      expected_transition: plan.outcome_projection.expected_transition,
      required_action: plan.outcome_projection.required_action,
    },
    planned_step_count: plan.planned_steps.length,
    sample_planned_steps: plan.planned_steps.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map((step) => ({
      step_id: step.step_id,
      target: step.target,
      operation: step.operation,
      expected_effect: step.expected_effect,
    })),
    postcheck_commands: plan.postcheck_commands.map(summaryJsonCommand),
    rollback_notes: plan.rollback_notes,
    current_window_command: currentWindowCommand,
    previous_window_command: previousWindowCommand,
    next_window_command: nextWindowCommand,
    write_policy: plan.write_policy,
    source_command: baseSummaryCommand,
    full_source_command: fullSourceCommand,
    view_command: summaryJsonCommand(plan.view_command),
    full_view_command: plan.view_command,
  };
}

function summarizeClosureDecisionDraftPacket(
  packet: ProjectClosureDecisionDraftPacket,
  decisionRecordOutput: {
    requested: boolean;
    path: string | null;
    written: boolean;
    bytes: number;
    sha256: string | null;
    non_authorizing: true;
  },
) {
  const currentWindowCommand = `helix closure decision-draft --action ${packet.action} --limit ${packet.review.limit} --offset ${packet.review.offset} --summary-json`;
  const decisionRecordDefaultPath = `.helix/tmp/closure/${packet.action}-decision-draft-offset-${packet.review.offset}.yml`;
  const decisionRecordPath = decisionRecordOutput.path ?? decisionRecordDefaultPath;
  const decisionRecordCommand = `helix closure decision-draft --action ${packet.action} --limit ${packet.review.limit} --offset ${packet.review.offset} --out ${decisionRecordPath} --summary-json`;
  return {
    schema_version: "project-closure-decision-draft-summary.v1",
    source_clock: packet.source_clock,
    action: packet.action,
    plan_only: packet.plan_only,
    must_not_apply: packet.must_not_apply,
    approval_allowed: packet.approval_allowed,
    apply_authorized: packet.apply_authorized,
    review: packet.review,
    decision: {
      decision_id: packet.decision.decision_id,
      approval_scope_digest: packet.decision.approval_scope_digest,
      draft_outcome: packet.decision.draft_outcome,
      allowed_outcomes: packet.decision.allowed_outcomes,
      outcome_routes: packet.decision.outcome_routes.map((route) => ({
        outcome: route.outcome,
        projection_type: route.projection_type,
        target_action: route.target_action,
        drive_model: route.drive_model,
        human_required: route.human_required,
        command: summaryJsonCommand(route.command),
        transition_command: summaryJsonCommand(route.transition_command),
      })),
      non_authorizing: packet.decision.non_authorizing,
      required_action: packet.decision.required_action,
    },
    candidate_digest_count: packet.candidate_digests.length,
    sample_candidate_digests: packet.candidate_digests
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((candidate) => ({
        plan_id: candidate.plan_id,
        source_path: candidate.source_path,
        l12_layer: candidate.l12_layer,
        coverage_id: candidate.coverage_id,
        evidence_status: candidate.evidence_status,
        ready_for_approval: candidate.ready_for_approval,
      })),
    approval_record_template: packet.approval_record_template,
    decision_record_output: decisionRecordOutput,
    postcheck_commands: packet.postcheck_commands.map(summaryJsonCommand),
    current_window_command: currentWindowCommand,
    decision_record_default_path: decisionRecordDefaultPath,
    decision_record_command: decisionRecordCommand,
    write_policy: packet.write_policy,
    source_command: "helix closure decision-draft --summary-json",
    view_command: summaryJsonCommand(packet.view_command),
    full_view_command: packet.view_command,
    findings: packet.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

function summarizeClosureApplyPlan(
  plan: ProjectClosureApplyPlan,
  input: {
    dryRun: boolean;
    executed: boolean;
    appliedPatches: Array<{
      plan_id: string;
      source_path: string;
      next_status: string;
    }>;
  },
) {
  return {
    schema_version: "project-closure-apply-plan-summary.v1",
    source_clock: plan.source_clock,
    dry_run: input.dryRun,
    executed: input.executed,
    action: plan.action,
    total: plan.total,
    listed: plan.listed,
    omitted: plan.omitted,
    limit: plan.limit,
    offset: plan.offset,
    window: plan.window,
    approval: {
      required: plan.approval.required,
      record_path: plan.approval.record_path,
      valid: plan.approval.valid,
      decision_id: plan.approval.decision_id,
      outcome: plan.approval.outcome,
      approval_scope_digest: plan.approval.approval_scope_digest,
      reason_count: plan.approval.reasons.length,
      reasons: plan.approval.reasons.slice(0, 20),
    },
    allowed_to_apply: plan.allowed_to_apply,
    blocked_reasons: plan.blocked_reasons,
    patch_candidate_count: plan.patch_candidates.length,
    patch_candidates: plan.patch_candidates.slice(0, 20).map((patch) => ({
      plan_id: patch.plan_id,
      source_path: patch.source_path,
      current_status: patch.current_status,
      next_status: patch.next_status,
      operation: patch.operation,
      artifact_count: patch.evidence_summary.artifact_paths.length,
      evidence_count: patch.evidence_summary.evidence_paths.length,
      test_runs: patch.evidence_summary.test_runs,
      gate_runs: patch.evidence_summary.gate_runs,
      runtime_verification: patch.evidence_summary.runtime_verification,
    })),
    applied_patch_count: input.appliedPatches.length,
    applied_patches: input.appliedPatches,
    postcheck_commands: plan.postcheck_commands.map(summaryJsonCommand),
    write_policy: plan.write_policy,
    source_command: "helix closure apply --dry-run --summary-json",
    full_source_command: plan.source_command,
    view_command: summaryJsonCommand(plan.view_command),
    full_view_command: plan.view_command,
  };
}

closure
  .command("overview")
  .description("emit a read-only overview of all current-location closure queues")
  .option("--limit <n>", "sample queue items per action", "5")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { limit?: string; json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const limit = Number.parseInt(opts.limit ?? "5", 10);
    if (!Number.isFinite(limit) || limit < 0) {
      process.stderr.write(`closure overview: invalid limit=${opts.limit ?? ""}\n`);
      process.exitCode = 2;
      return;
    }

    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    let db: HarnessDb;
    try {
      db = openHarnessDb(dbPath, { repoRoot });
    } catch (error) {
      process.stderr.write(`closure authority-review-record: ${String(error)}\n`);
      process.exitCode = 1;
      return;
    }
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const overview = buildProjectClosureOverview(snapshot, { limit });
      if (opts.summaryJson) {
        process.stdout.write(`${JSON.stringify(summarizeClosureOverview(overview), null, 2)}\n`);
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(overview, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `closure overview: status=${overview.closure.status} current=${overview.current.layer ?? "unknown"}->${overview.current.l12_layer ?? "unknown"} queue=${overview.closure.queue_total} close_ready=${overview.closure.route_counts.close_ready} collect=${overview.closure.route_counts.collect_evidence} repair=${overview.closure.route_counts.repair_failed_evidence} reverse=${overview.closure.route_counts.reverse_design} write=${overview.write_policy}\n`,
      );
      process.stdout.write(
        `  recommended=${overview.recommended_next_action.action ?? "none"} human_required=${overview.recommended_next_action.human_required} command=${overview.recommended_next_action.command}\n`,
      );
      process.stdout.write(
        `  apply-readiness=${overview.closure.apply_readiness.status} close_ready=${overview.closure.apply_readiness.close_ready_count} approval_required=${overview.closure.apply_readiness.approval_required}\n`,
      );
      for (const action of overview.actions) {
        process.stdout.write(
          `  action: ${action.action} count=${action.count} listed=${action.listed} omitted=${action.omitted} ledger=${action.ledger_status ?? "-"} human_required=${action.human_required} samples=${action.sample_plan_ids.join(",") || "-"}\n`,
        );
      }
    } finally {
      db.close();
    }
  });

closure
  .command("batch")
  .description("emit a machine-readable current-location closure batch")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum queue items to include", "20")
  .option("--offset <n>", "zero-based queue item offset", "0")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      offset?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure batch: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure batch: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const offset = Number.parseInt(opts.offset ?? "0", 10);
      if (!Number.isFinite(offset) || offset < 0) {
        process.stderr.write(`closure batch: invalid offset=${opts.offset ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const report = buildProjectClosureBatchReport(snapshot, {
          action: opts.action,
          limit,
          offset,
        });
        if (opts.summaryJson) {
          process.stdout.write(`${JSON.stringify(summarizeClosureBatchReport(report), null, 2)}\n`);
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
          return;
        }
        const packet = report.packet;
        const ledger = report.ledger;
        process.stdout.write(
          `closure batch: action=${report.selected_action ?? "none"} batch=${packet?.automation.batchId ?? "-"} status=${ledger?.status ?? "none"} count=${report.total} listed=${report.listed} omitted=${report.omitted} drive=${packet?.driveModel ?? snapshot.drive_recommendation.model} write=${report.write_policy}\n`,
        );
        process.stdout.write(
          `  window=${report.window.page_index}/${report.window.page_count} range=${report.window.start}-${report.window.end} offset=${report.offset} limit=${report.limit} prev=${report.window.previous_offset ?? "-"} next=${report.window.next_offset ?? "-"}\n`,
        );
        if (packet) {
          process.stdout.write(`  filter=${packet.automation.machineFilter}\n`);
          process.stdout.write(`  transition=${packet.automation.expectedTransition}\n`);
          process.stdout.write(`  promotion-gate=${packet.automation.promotionGate}\n`);
          process.stdout.write(`  required-action=${packet.requiredAction}\n`);
        }
        if (ledger) {
          process.stdout.write(
            `  ledger=${ledger.ledgerId} evidence-policy=${ledger.evidencePolicy} human_required=${ledger.humanRequired}\n`,
          );
        }
        for (const bucket of report.work_buckets) {
          process.stdout.write(
            `  work-bucket: ${bucket.rank}.${bucket.evidence_signature} count=${bucket.count} listed=${bucket.listed} omitted=${bucket.omitted} tables=${bucket.target_tables.join(",") || "-"} command=${bucket.primary_command}\n`,
          );
          process.stdout.write(
            `    repair-plan=${bucket.repair_plan.status} failed=${bucket.repair_plan.failed_evidence_count} latest=${bucket.repair_plan.latest_failed_at ?? "-"} green=${bucket.repair_plan.required_green_tables.join(",") || "-"}\n`,
          );
          process.stdout.write(
            `    repair-automation=${bucket.repair_plan.automation.status} runnable=${bucket.repair_plan.automation.runnable_command_count} label_only=${bucket.repair_plan.automation.label_only_command_count} resolution=${bucket.repair_plan.automation.resolution_candidate_count} safe_resolution=${bucket.repair_plan.automation.safe_resolution_command_count} projections=${bucket.repair_plan.automation.projection_item_count} next=${bucket.repair_plan.automation.primary_next_command ?? "-"} blockers=${bucket.repair_plan.automation.blockers.join(",") || "-"}\n`,
          );
          process.stdout.write(
            `    evidence-probe=helix closure evidence-probe --action ${bucket.action} --json\n`,
          );
          for (const candidate of bucket.repair_plan.command_candidates.slice(0, 3)) {
            process.stdout.write(
              `    repair-command: ${candidate.command_label} verb=${candidate.command_verb ?? "-"} count=${candidate.count} runnable=${candidate.runnable_command ?? "-"} latest=${candidate.latest_observed_at ?? "-"} plans=${candidate.sample_plan_ids.join(",") || "-"}\n`,
            );
            for (const resolution of candidate.resolution_candidates.slice(0, 3)) {
              process.stdout.write(
                `      repair-resolution: ${resolution.command} source=${resolution.source} confidence=${resolution.confidence} safe=${resolution.safe_to_run} project=${resolution.projection_binding.target_tables.join(",") || "-"} postcheck=${resolution.projection_binding.postcheck_commands.join(" && ")}\n`,
              );
            }
          }
          for (const template of bucket.repair_plan.projection_templates) {
            process.stdout.write(
              `    repair-template: ${template.table} status=${template.status_after_projection} fields=${template.required_fields.join(",")}\n`,
            );
          }
          for (const item of bucket.repair_plan.projection_items.slice(0, 5)) {
            process.stdout.write(
              `    projection-item: ${item.plan_id} failed=${item.failed_evidence_count} latest=${item.latest_failed_at ?? "-"} tables=${item.required_green_tables.join(",") || "-"} source=${item.source_path}\n`,
            );
            for (const template of item.evidence_artifact_templates.slice(0, 3)) {
              process.stdout.write(
                `      evidence-artifact: ${template.artifact_kind} path=${template.artifact_path} format=${template.template_format} projects=${template.projection_target_tables.join(",") || "-"} write=${template.write_policy}\n`,
              );
            }
            process.stdout.write(
              `      evidence-patch-plan: approval=${item.evidence_patch_plan.approval_required} write=${item.evidence_patch_plan.write_policy} candidates=${item.evidence_patch_plan.patch_candidates.length} dry_run=${item.evidence_patch_plan.dry_run_command} execute=${item.evidence_patch_plan.execute_command ?? "-"}\n`,
            );
            for (const candidate of item.evidence_patch_plan.patch_candidates.slice(0, 3)) {
              process.stdout.write(
                `        evidence-patch: ${candidate.operation} path=${candidate.artifact_path} digest=${candidate.preview_digest} placeholders=${candidate.placeholder_count} projects=${candidate.projection_target_tables.join(",") || "-"}\n`,
              );
              if (candidate.unresolved_placeholders.length > 0) {
                process.stdout.write(
                  `          placeholders=${candidate.unresolved_placeholders.join(",")}\n`,
                );
              }
            }
          }
          process.stdout.write(`    required=${bucket.required_action}\n`);
        }
        for (const item of report.queue_items) {
          process.stdout.write(
            `  item: ${item.planId} evidence=${item.evidence.status} tests=${item.evidence.testRuns.passed}/${item.evidence.testRuns.total} gates=${item.evidence.gateRuns.passed}/${item.evidence.gateRuns.total} runtime=${item.evidence.runtimeVerification.accepted}/${item.evidence.runtimeVerification.total} source=${item.sourcePath}\n`,
          );
          process.stdout.write(
            `    evidence-action=${item.evidenceAction} gaps=${item.evidenceGaps.map((gap) => `${gap.component}:${gap.status}`).join(",") || "-"}\n`,
          );
        }
      } finally {
        db.close();
      }
    },
  );

closure
  .command("evidence-plan")
  .description("emit a read-only evidence collection/repair plan for closure queues")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum plan items to include", "20")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-plan: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure evidence-plan: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const plan = buildProjectClosureEvidencePlan(snapshot, {
          action: opts.action,
          limit,
        });
        if (opts.summaryJson) {
          process.stdout.write(`${JSON.stringify(summarizeClosureEvidencePlan(plan), null, 2)}\n`);
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `closure evidence-plan: action=${plan.selected_action ?? "none"} total=${plan.total} listed=${plan.listed} omitted=${plan.omitted} tables=${plan.target_tables.join(",") || "-"} write=${plan.write_policy}\n`,
        );
        process.stdout.write(`  expected-transition=${plan.expected_transition ?? "-"}\n`);
        process.stdout.write(
          `  gaps=${plan.evidence_gap_counts.map((gap) => `${gap.component}:${gap.status}=${gap.count}`).join(",") || "-"}\n`,
        );
        process.stdout.write(`  postcheck=${plan.postcheck_commands.join(" && ")}\n`);
        for (const item of plan.items) {
          process.stdout.write(
            `  item: ${item.plan_id} evidence=${item.evidence_status} next=${item.next_action} tables=${item.target_tables.join(",") || "-"} source=${item.source_path}\n`,
          );
          process.stdout.write(
            `    evidence-action=${item.evidence_action} gaps=${item.evidence_gaps.map((gap) => `${gap.component}:${gap.status}`).join(",") || "-"}\n`,
          );
          if (item.repair_targets.length > 0) {
            process.stdout.write(
              `    repair-targets=${formatRepairTargetsText(item.repair_targets)}\n`,
            );
          }
          if (item.evidence_templates.length > 0) {
            process.stdout.write(
              `    templates=${item.evidence_templates.map((template) => `${template.table}:${template.example_row.status ?? template.example_row.accept_status ?? template.example_row.artifact_type ?? "row"}`).join(",")}\n`,
            );
          }
        }
      } finally {
        db.close();
      }
    },
  );
closure
  .command("evidence-patch")
  .description("emit a read-only approval packet for green evidence patch candidates")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum queue items to include", "20")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-patch: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure evidence-patch: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const packet = buildProjectClosureEvidencePatchPacket(snapshot, {
          action: opts.action,
          limit,
        });
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureEvidencePatchPacket(packet), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `closure evidence-patch: action=${packet.selected_action ?? "none"} queue=${packet.queue_total} listed=${packet.queue_listed} omitted=${packet.queue_omitted} candidates=${packet.patch_candidate_count} approval=${packet.approval.required} decision=${packet.approval.decision_id} write=${packet.write_policy}\n`,
        );
        process.stdout.write(
          `  approval-scope=${packet.approval.approval_scope_digest} patch-write=${packet.safety_policy.patch_write_policy} execute=${packet.safety_policy.execute_command ?? "-"}\n`,
        );
        process.stdout.write(
          `  apply-readiness=${packet.apply_readiness.status} allowed=${packet.apply_readiness.allowed_to_apply} placeholders=${packet.apply_readiness.placeholder_count} blocked_candidates=${packet.apply_readiness.blocked_candidate_count} execute=${packet.apply_readiness.execute_command ?? "-"}\n`,
        );
        for (const candidate of packet.patch_candidates) {
          process.stdout.write(
            `  candidate: ${candidate.plan_id} ${candidate.operation} path=${candidate.artifact_path} digest=${candidate.preview_digest} placeholders=${candidate.placeholder_count} tables=${candidate.projection_target_tables.join(",") || "-"}\n`,
          );
          if (candidate.unresolved_placeholders.length > 0) {
            process.stdout.write(
              `    placeholders=${candidate.unresolved_placeholders.join(",")}\n`,
            );
          }
          process.stdout.write(`    rollback=${candidate.rollback_note}\n`);
        }
        process.stdout.write(`  postcheck=${packet.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("evidence-probe")
  .description("probe a safe green evidence command without writing evidence files or DB rows")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum queue items to inspect", "20")
  .option("--execute", "execute the safe command and return digest-only probe evidence")
  .option("--out <path>", "write the executed probe JSON record to a new local file")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      execute?: boolean;
      out?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-probe: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure evidence-probe: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      if (opts.out !== undefined && opts.execute === true) {
        const outputPath = isAbsolute(opts.out) ? opts.out : join(repoRoot, opts.out);
        if (existsSync(outputPath)) {
          process.stderr.write(`closure evidence-probe: output already exists: ${opts.out}\n`);
          process.exitCode = 2;
          return;
        }
      }
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const initialProbeRecordOutput: ProbeRecordOutput = {
          requested: opts.out !== undefined,
          path: opts.out ?? null,
          written: false,
          bytes: 0,
          sha256: null,
        };
        const dryRunPacket = buildProjectClosureEvidenceProbePacket(snapshot, {
          action: opts.action,
          limit,
          dryRun: true,
        });
        if (opts.execute && (!dryRunPacket.can_execute || dryRunPacket.command === null)) {
          const blockedPacket = buildProjectClosureEvidenceProbePacket(snapshot, {
            action: opts.action,
            limit,
            dryRun: false,
          });
          if (opts.summaryJson) {
            process.stdout.write(
              `${JSON.stringify(summarizeClosureEvidenceProbePacket(blockedPacket, initialProbeRecordOutput), null, 2)}\n`,
            );
          } else if (opts.json) {
            process.stdout.write(`${JSON.stringify(blockedPacket, null, 2)}\n`);
          } else {
            process.stdout.write(
              `closure evidence-probe: action=${blockedPacket.selected_action ?? "none"} dry_run=false can_execute=false command=${blockedPacket.command ?? "-"} status=${blockedPacket.apply_readiness.status} write=${blockedPacket.write_policy}\n`,
            );
          }
          process.exitCode = 2;
          return;
        }
        const execution =
          opts.execute && dryRunPacket.command
            ? runClosureEvidenceProbeCommand(repoRoot, dryRunPacket.command)
            : null;
        const packet = buildProjectClosureEvidenceProbePacket(snapshot, {
          action: opts.action,
          limit,
          dryRun: opts.execute !== true,
          execution,
        });
        let probeRecordOutput = initialProbeRecordOutput;
        if (opts.out !== undefined) {
          if (opts.execute !== true || packet.execution === null) {
            process.stderr.write(
              "closure evidence-probe: --out requires --execute with probe execution\n",
            );
            process.exitCode = 2;
            return;
          }
          const outputPath = isAbsolute(opts.out) ? opts.out : join(repoRoot, opts.out);
          const content = `${JSON.stringify(packet, null, 2)}\n`;
          mkdirSync(dirname(outputPath), { recursive: true });
          writeFileSync(outputPath, content, "utf8");
          probeRecordOutput = {
            requested: true,
            path: opts.out,
            written: true,
            bytes: Buffer.byteLength(content, "utf8"),
            sha256: `sha256:${createHash("sha256").update(content).digest("hex")}`,
          };
        }
        if (opts.json) {
          process.stdout.write(
            `${JSON.stringify({ ...packet, probe_record_output: probeRecordOutput }, null, 2)}\n`,
          );
          return;
        }
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureEvidenceProbePacket(packet, probeRecordOutput), null, 2)}\n`,
          );
          return;
        }
        process.stdout.write(
          `closure evidence-probe: action=${packet.selected_action ?? "none"} dry_run=${packet.dry_run} can_execute=${packet.can_execute} command=${packet.command ?? "-"} status=${packet.apply_readiness.status} write=${packet.write_policy}\n`,
        );
        if (probeRecordOutput.written) {
          process.stdout.write(
            `  output=${probeRecordOutput.path} bytes=${probeRecordOutput.bytes} sha256=${probeRecordOutput.sha256}\n`,
          );
        }
        if (packet.execution) {
          process.stdout.write(
            `  execution=${packet.execution.status} exit=${packet.execution.exit_code ?? "-"} digest=${packet.execution.output_digest} stdout=${packet.execution.stdout_bytes} stderr=${packet.execution.stderr_bytes}\n`,
          );
          if (packet.execution.status !== "passed" && packet.execution.output_excerpt) {
            const stderrTail = packet.execution.output_excerpt.stderr_tail.trim();
            const stdoutTail = packet.execution.output_excerpt.stdout_tail.trim();
            process.stdout.write(
              `  output-excerpt=${truncateCliText(stderrTail || stdoutTail || "-", 300)}\n`,
            );
          }
          process.stdout.write(
            `  provenance=session:${packet.execution.session_id ?? "-"} correlation:${packet.execution.correlation_id ?? "-"}\n`,
          );
        }
        process.stdout.write(
          `  placeholders: fillable=${packet.placeholder_resolution.fillable_placeholders.join(",") || "-"} remaining=${packet.placeholder_resolution.remaining_placeholders.join(",") || "-"}\n`,
        );
        process.stdout.write(`  targets=${packet.target_plan_ids.join(",") || "-"}\n`);
        process.stdout.write(`  postcheck=${packet.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("evidence-materialize")
  .description("materialize evidence patch previews from a probe record without writing files")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum queue items to inspect", "20")
  .option("--probe-record <path>", "JSON output from closure evidence-probe --execute --json")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      probeRecord?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-materialize: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure evidence-materialize: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      let probeExecution = null;
      try {
        probeExecution = readClosureEvidenceProbeExecution(opts.probeRecord);
      } catch (error) {
        process.stderr.write(`closure evidence-materialize: ${String(error)}\n`);
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
          action: opts.action,
          limit,
          probeExecution,
        });
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureMaterializePacket(packet), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `closure evidence-materialize: action=${packet.selected_action ?? "none"} status=${packet.materialize_readiness.status} candidates=${packet.materialized_candidate_count} remaining=${packet.materialize_readiness.remaining_placeholder_count} blocked=${packet.materialize_readiness.blocked_candidate_count} write=${packet.write_policy}\n`,
        );
        process.stdout.write(
          `  approval-scope=${packet.approval.approval_scope_digest} execute=${packet.materialize_readiness.execute_command ?? "-"}\n`,
        );
        for (const candidate of packet.materialized_candidates) {
          process.stdout.write(
            `  candidate: ${candidate.plan_id} ${candidate.operation} path=${candidate.artifact_path} digest=${candidate.materialized_preview_digest} filled=${candidate.filled_placeholders.join(",") || "-"} remaining=${candidate.remaining_placeholders.join(",") || "-"}\n`,
          );
        }
        process.stdout.write(`  postcheck=${packet.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("historical-vpair-migration")
  .description("verify historical V-pair migration authority without product-state mutation")
  .requiredOption("--run <path>")
  .requiredOption("--review <path>")
  .requiredOption("--expected-head <sha>")
  .option("--dry-run")
  .option("--from-db")
  .option("--json")
  .action(
    (opts: {
      run: string;
      review: string;
      expectedHead: string;
      dryRun?: boolean;
      fromDb?: boolean;
      json?: boolean;
    }) => {
      if (!opts.dryRun || !opts.fromDb || !opts.json) {
        process.stderr.write(
          "closure historical-vpair-migration: --dry-run --from-db --json are required\n",
        );
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const dbPath = defaultHarnessDbPath(repoRoot);
      if (!existsSync(dbPath)) {
        process.stderr.write(
          "closure historical-vpair-migration: persistent harness.db does not exist\n",
        );
        process.exitCode = 2;
        return;
      }
      const db = openHarnessDbReadOnly(dbPath, { repoRoot });
      try {
        process.stdout.write(
          `${JSON.stringify(runHistoricalVpairMigrationDryRun({ repoRoot, db, expectedRepositoryHead: opts.expectedHead, runPath: opts.run, reviewPath: opts.review, now: new Date().toISOString() }))}\n`,
        );
      } catch (error) {
        process.stderr.write(`closure historical-vpair-migration: ${String(error)}\n`);
        process.exitCode = 2;
      } finally {
        db.close();
      }
    },
  );
closure
  .command("authority-backfill")
  .description("build the current-main closure authority proposal bundle without mutation")
  .option("--dry-run", "required read-only mode")
  .option("--from-db", "read persistent harness.db (required)")
  .option("--expected-head <sha>", "expected current local origin/main SHA")
  .option("--out <path>", "atomically persist the proposal at a new repository-relative path")
  .option("--json", "emit one JSON document")
  .action(
    (opts: {
      dryRun?: boolean;
      fromDb?: boolean;
      expectedHead?: string;
      out?: string;
      json?: boolean;
    }) => {
      if (!opts.dryRun || !opts.fromDb || !opts.expectedHead || !opts.json) {
        process.stderr.write(
          "closure authority-backfill: --dry-run --from-db --expected-head <sha> --json are required\n",
        );
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const dbPath = defaultHarnessDbPath(repoRoot);
      if (!existsSync(dbPath)) {
        process.stderr.write("closure authority-backfill: persistent harness.db does not exist\n");
        process.exitCode = 2;
        return;
      }
      let db: HarnessDb;
      try {
        db = openHarnessDbReadOnly(dbPath, { repoRoot });
      } catch (error) {
        process.stderr.write(
          `closure authority-backfill: internal DB open failure: ${String(error)}\n`,
        );
        process.exitCode = 1;
        return;
      }
      try {
        for (const table of ["plan_registry", "closure_process_receipts"]) {
          if (
            !db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)
          ) {
            process.stderr.write(
              `closure authority-backfill: persistent DB schema missing ${table}\n`,
            );
            process.exitCode = 2;
            return;
          }
        }
        const run = buildCurrentClosureAuthorityBackfillRun(
          loadCurrentClosureAuthorityBackfillInput({
            repoRoot,
            db,
            expected_head_sha: opts.expectedHead,
            now: new Date().toISOString(),
          }),
        );
        const output = opts.out
          ? {
              schema_version: "closure-authority-backfill-persist-result.v1",
              run,
              persisted: persistClosureAuthorityProposal({ repoRoot, outPath: opts.out, run }),
            }
          : run;
        process.stdout.write(`${JSON.stringify(output)}\n`);
      } catch (error) {
        process.stderr.write(`closure authority-backfill: ${String(error)}\n`);
        process.exitCode = error instanceof ClosureAuthorityBackfillInputError ? 2 : 1;
      } finally {
        db.close();
      }
    },
  );
closure
  .command("authority-review-draft")
  .description("create a non-authorizing independent review task draft")
  .requiredOption("--proposal <path>", "persisted closure authority proposal")
  .requiredOption("--out <path>", "new repository-relative draft path")
  .option("--worker-identity <id>", "worker identity", `worker-${process.pid}`)
  .option("--task-identity <id>", "review task identity", `review-task-${process.pid}`)
  .option("--json", "emit one JSON document")
  .action(
    (opts: {
      proposal: string;
      out: string;
      workerIdentity: string;
      taskIdentity: string;
      json?: boolean;
    }) => {
      if (!opts.json) {
        process.stderr.write("closure authority-review-draft: --json is required\n");
        process.exitCode = 2;
        return;
      }
      try {
        const result = createClosureAuthorityReviewDraft({
          repoRoot: process.cwd(),
          outPath: opts.out,
          proposalPath: opts.proposal,
          workerIdentity: opts.workerIdentity,
          taskIdentity: opts.taskIdentity,
          now: new Date().toISOString(),
        });
        process.stdout.write(`${JSON.stringify(result)}\n`);
      } catch (error) {
        process.stderr.write(`closure authority-review-draft: ${String(error)}\n`);
        process.exitCode = closureAuthorityFailureExitCode(error);
      }
    },
  );
closure
  .command("authority-review-record")
  .description("record independent task evidence as an authority review receipt")
  .requiredOption("--draft <path>", "non-authorizing review draft")
  .requiredOption("--review-evidence <path>", "independent task completion artifact")
  .requiredOption("--out <path>", "new repository-relative receipt path")
  .option("--json", "emit one JSON document")
  .action((opts: { draft: string; reviewEvidence: string; out: string; json?: boolean }) => {
    if (!opts.json) {
      process.stderr.write("closure authority-review-record: --json is required\n");
      process.exitCode = 2;
      return;
    }
    const repoRoot = process.cwd();
    const dbPath = defaultHarnessDbPath(repoRoot);
    if (!existsSync(dbPath)) {
      process.stderr.write(
        "closure authority-review-record: persistent harness.db does not exist\n",
      );
      process.exitCode = 2;
      return;
    }
    let db: HarnessDb;
    try {
      db = openHarnessDb(dbPath, { repoRoot });
    } catch (error) {
      process.stderr.write(`closure authority-review-record: ${String(error)}\n`);
      process.exitCode = 1;
      return;
    }
    try {
      const result = recordClosureAuthorityReview({
        repoRoot,
        outPath: opts.out,
        draft: loadClosureAuthorityReviewDraft(repoRoot, opts.draft),
        taskEvidence: loadClosureAuthorityReviewTaskEvidence(repoRoot, opts.reviewEvidence),
        now: new Date().toISOString(),
        db,
      });
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch (error) {
      process.stderr.write(`closure authority-review-record: ${String(error)}\n`);
      process.exitCode = closureAuthorityFailureExitCode(error);
    } finally {
      db.close();
    }
  });
closure
  .command("authority-backfill-apply")
  .description("apply one independently reviewed authority backfill window")
  .option("--execute", "execute the reviewed mutation")
  .option("--from-db", "use persistent harness.db")
  .requiredOption("--proposal <path>", "persisted full proposal run")
  .requiredOption("--review-receipt <path>", "independent review receipt")
  .requiredOption("--expected-head <sha>", "expected repository HEAD")
  .requiredOption("--offset <n>", "ledger-derived window offset")
  .requiredOption("--limit <n>", "window size (1..100)")
  .option("--resume", "resume an exactly matching committed window")
  .option("--failpoint <name>", "test-only crash injection")
  .option("--json", "emit one JSON document")
  .action(
    (opts: {
      execute?: boolean;
      fromDb?: boolean;
      proposal: string;
      reviewReceipt: string;
      expectedHead: string;
      offset: string;
      limit: string;
      resume?: boolean;
      failpoint?: string;
      json?: boolean;
    }) => {
      const offset = /^(?:0|[1-9][0-9]*)$/.test(opts.offset) ? Number(opts.offset) : -1;
      const limit = /^[1-9][0-9]*$/.test(opts.limit) ? Number(opts.limit) : -1;
      const failpoints = [
        "after-journal",
        "after-rename",
        "after-postverify",
        "before-marker",
        "after-marker",
        "before-ledger",
        "partial-ledger",
      ] as const;
      if (
        !opts.execute ||
        !opts.fromDb ||
        !opts.json ||
        !Number.isSafeInteger(offset) ||
        offset < 0 ||
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > 100 ||
        (opts.failpoint !== undefined &&
          !failpoints.includes(opts.failpoint as (typeof failpoints)[number]))
      ) {
        process.stderr.write(
          "closure authority-backfill-apply: --execute --from-db --json, offset >= 0, limit 1..100, and a known failpoint are required\n",
        );
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const dbPath = defaultHarnessDbPath(repoRoot);
      if (!existsSync(dbPath)) {
        process.stderr.write(
          "closure authority-backfill-apply: persistent harness.db does not exist\n",
        );
        process.exitCode = 2;
        return;
      }
      let db: HarnessDb;
      try {
        db = openHarnessDb(dbPath, { repoRoot });
      } catch (error) {
        process.stderr.write(`closure authority-backfill-apply: ${String(error)}\n`);
        process.exitCode = 1;
        return;
      }
      try {
        const run = loadClosureAuthorityProposal(repoRoot, opts.proposal);
        const head = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: repoRoot,
          encoding: "utf8",
        }).trim();
        if (head !== opts.expectedHead || run.bundle.repository_head !== head)
          throw new Error("expected HEAD/proposal provenance mismatch");
        if (opts.resume) {
          recoverClosureAuthorityBackfill(repoRoot);
          const completed = readCompletedClosureAuthorityBackfillWindow({
            repoRoot,
            bundle: run.bundle,
            offset,
            limit,
          });
          if (completed) {
            const terminalBoundaries = recordClosureWindowTerminalBoundaries({
              repoRoot,
              run,
              offset,
              limit,
              cycleDigest: completed.cycle_digest,
              registryDigest: completed.registry_digest,
            });
            process.stdout.write(
              `${JSON.stringify({ ...completed, resumed: true, terminal_boundary_plan_ids: terminalBoundaries })}\n`,
            );
            return;
          }
        }
        const window = buildClosureAuthorityBackfillWindow({
          repoRoot,
          registryPath: "docs/governance/closure-authority-registry.yaml",
          bundle: run.bundle,
          offset,
          limit,
        });
        const result = applyClosureAuthorityConvergenceWindow({
          repoRoot,
          db,
          bundle: run.bundle,
          receipt: loadClosureAuthorityReviewReceipt(repoRoot, opts.reviewReceipt),
          now: new Date().toISOString(),
          cycleId: `authority-window-${offset}`,
          failpoint: opts.failpoint as (typeof failpoints)[number] | undefined,
          window,
        });
        const terminalBoundaries = recordClosureWindowTerminalBoundaries({
          repoRoot,
          run,
          offset,
          limit,
          cycleDigest: result.cycle_digest,
          registryDigest: result.registry_digest,
        });
        process.stdout.write(
          `${JSON.stringify({ ...result, resumed: false, terminal_boundary_plan_ids: terminalBoundaries })}\n`,
        );
      } catch (error) {
        process.stderr.write(`closure authority-backfill-apply: ${String(error)}\n`);
        process.exitCode = closureAuthorityFailureExitCode(error);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("convergence-targets")
  .description("derive the exact automatable/H/X closure target partition from persistent state")
  .option("--from-db", "read persistent harness.db")
  .option("--json", "emit one JSON document")
  .action((opts: { fromDb?: boolean; json?: boolean }) => {
    if (!opts.fromDb || !opts.json) {
      process.stderr.write("closure convergence-targets: --from-db --json are required\n");
      process.exitCode = 2;
      return;
    }
    const repoRoot = process.cwd();
    const dbPath = defaultHarnessDbPath(repoRoot);
    if (!existsSync(dbPath)) {
      process.stderr.write("closure convergence-targets: persistent harness.db does not exist\n");
      process.exitCode = 2;
      return;
    }
    let db: HarnessDb;
    try {
      db = openHarnessDbReadOnly(dbPath, { repoRoot });
    } catch (error) {
      process.stderr.write(`closure convergence-targets: ${String(error)}\n`);
      process.exitCode = 1;
      return;
    }
    try {
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const automatable = snapshot.closure.queue.items
        .filter((item) => item.nextAction === "close_ready")
        .map((item) => item.planId);
      const target = closureConvergenceTargetFromSnapshot(snapshot, automatable);
      process.stdout.write(`${JSON.stringify(target)}\n`);
    } catch (error) {
      process.stderr.write(`closure convergence-targets: ${String(error)}\n`);
      process.exitCode = closureAuthorityFailureExitCode(error);
    } finally {
      db.close();
    }
  });
closure
  .command("authority-materialize")
  .description("classify or materialize current-main close_ready evidence from repo authority")
  .option("--dry-run", "classify only; never start a runner or persist evidence")
  .option("--execute", "materialize only when every candidate is eligible")
  .option("--from-db", "read the persistent harness.db (required)")
  .option(
    "--authority-registry <path>",
    "canonical repo-owned authority registry",
    "docs/governance/closure-authority-registry.yaml",
  )
  .option("--batch-size <n>", "bounded materialization window (1..100)", "100")
  .option("--concurrency <n>", "typed runner concurrency (1..4)", "1")
  .option("--json", "JSON output")
  .action(
    async (opts: {
      dryRun?: boolean;
      execute?: boolean;
      fromDb?: boolean;
      authorityRegistry: string;
      batchSize: string;
      concurrency: string;
      json?: boolean;
    }) => {
      const canonicalRegistry = "docs/governance/closure-authority-registry.yaml";
      const parseBoundedInteger = (value: string, maximum: number): number | null =>
        /^(?:0|[1-9][0-9]*)$/.test(value) &&
        Number.isSafeInteger(Number(value)) &&
        Number(value) >= 1 &&
        Number(value) <= maximum
          ? Number(value)
          : null;
      if (opts.dryRun === opts.execute) {
        process.stderr.write(
          "closure authority-materialize: exactly one of --dry-run or --execute is required\n",
        );
        process.exitCode = 2;
        return;
      }
      if (!opts.fromDb) {
        process.stderr.write("closure authority-materialize: --from-db is required\n");
        process.exitCode = 2;
        return;
      }
      if (opts.authorityRegistry !== canonicalRegistry) {
        process.stderr.write(
          `closure authority-materialize: --authority-registry must be ${canonicalRegistry}\n`,
        );
        process.exitCode = 2;
        return;
      }
      const batchSize = parseBoundedInteger(opts.batchSize, 100);
      const concurrency = parseBoundedInteger(opts.concurrency, 4);
      if (batchSize === null || concurrency === null) {
        process.stderr.write(
          "closure authority-materialize: --batch-size must be 1..100 and --concurrency must be 1..4\n",
        );
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const git = (...args: string[]) =>
        execFileSync("git", args, {
          cwd: repoRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }).trim();
      const dbPath = defaultHarnessDbPath(repoRoot);
      if (!existsSync(dbPath)) throw new Error("persistent harness.db does not exist");
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        const repositoryHead = git("rev-parse", "HEAD");
        const originMainHead = git("rev-parse", "origin/main");
        const clean = git("status", "--porcelain=v1", "--untracked-files=normal") === "";
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const bundle = buildProjectClosureReviewBundle(snapshot, {
          action: "close_ready",
          limit: Math.max(1, snapshot.closure.queue.route_counts.close_ready),
          offset: 0,
        });
        const candidates = bundle.candidates.map((candidate) => ({
          plan_id: candidate.planId,
          source_path: candidate.sourcePath,
        }));
        const registry = loadClosureAuthorityRegistry({
          repositoryRoot: repoRoot,
          registryPath: canonicalRegistry,
        });
        const classifications = classifyClosureAuthorities({
          candidatePlanIds: candidates.map((candidate) => candidate.plan_id),
          registry,
          drifts: analyzeClosureAuthorityDrift({ repositoryRoot: repoRoot, registry }),
        });
        const eligiblePlanIds = classifications
          .filter((row) => row.classification === "eligible")
          .map((row) => row.plan_id);
        const terminalByPlanId = new Map(
          snapshot.closure.terminal_boundaries.items
            .filter((row) => row.whole_program_blocker)
            .map((row) => [row.plan_id, row.classification] as const),
        );
        const noneligiblePlanIds = classifications
          .filter((row) => {
            if (row.classification === "eligible") return false;
            const boundary = terminalByPlanId.get(row.plan_id);
            const expectedBoundary = terminalBoundaryClassificationForAuthority(row.classification);
            return expectedBoundary === null || boundary !== expectedBoundary;
          })
          .map((row) => row.plan_id);
        let targetSet: ReturnType<typeof buildClosureConvergenceTargetSet> | null = null;
        try {
          targetSet = closureConvergenceTargetFromSnapshot(
            snapshot,
            eligiblePlanIds,
            noneligiblePlanIds,
          );
        } catch (error) {
          const payload = {
            status: "target_blocked",
            executed: false,
            classifications,
            blocker: error instanceof Error ? error.message : String(error),
          };
          process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
          process.exitCode = 2;
          return;
        }
        if (repositoryHead !== originMainHead || !clean)
          throw new Error("current HEAD must equal origin/main and working tree must be clean");
        const allEligible =
          classifications.length > 0 &&
          classifications.every((row) => row.classification === "eligible");
        if (opts.execute && !allEligible) {
          const payload = {
            status: "classified",
            executed: false,
            classifications,
            target_set_digest: targetSet.target_set_digest,
          };
          process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
          process.exitCode = 2;
          return;
        }
        if (opts.dryRun) {
          const payload = {
            status: "classified",
            executed: false,
            classifications,
            target_set_digest: targetSet.target_set_digest,
          };
          process.stdout.write(
            opts.json
              ? `${JSON.stringify(payload, null, 2)}\n`
              : `closure authority-materialize: status=classified candidates=${classifications.length} eligible=${classifications.filter((row) => row.classification === "eligible").length} executed=false\n`,
          );
          return;
        }
        migrate(db);
        const gateCommands: Readonly<Record<string, string>> = {
          "harness-check": "bun src/cli.ts gate harness-check",
        };
        const gateAllowlist: Readonly<Record<string, ClosureGateAllowlistEntry>> = {
          "harness-check": {
            command: gateCommands["harness-check"] ?? "",
            executable: "bun",
            argv: ["src/cli.ts", "gate", "harness-check"],
          },
        };
        migrate(db);
        const result = await materializeClosureEvidence({
          repoRoot,
          db,
          repositoryHead,
          originMainHead,
          clean,
          candidates,
          reviewBundlePlanIds: bundle.review_scope.plan_ids,
          registry,
          runner: new ClosureEvidenceRunner({ repoRoot, repositoryHead, gateAllowlist }),
          gateCommands,
          windowSize: batchSize,
          concurrency,
          convergenceTarget: targetSet,
        });
        process.stdout.write(
          opts.json
            ? `${JSON.stringify({ ...result, executed: result.status === "published", target_set_digest: targetSet.target_set_digest }, null, 2)}\n`
            : `closure authority-materialize: status=${result.status} candidates=${result.classifications.length} runs=${result.run_count} manifest=${result.manifest_path ?? "-"}\n`,
        );
      } finally {
        db.close();
      }
    },
  );
closure
  .command("evidence-approval-draft")
  .description("emit a non-authorizing materialized evidence approval record draft")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum queue items to inspect", "20")
  .option("--probe-record <path>", "JSON output from closure evidence-probe --execute --json")
  .option("--out <path>", "write the non-authorizing pending approval draft to a new local file")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      probeRecord?: string;
      out?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-approval-draft: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(
          `closure evidence-approval-draft: invalid limit=${opts.limit ?? ""}\n`,
        );
        process.exitCode = 2;
        return;
      }
      let probeExecution = null;
      try {
        probeExecution = readClosureEvidenceProbeExecution(opts.probeRecord);
      } catch (error) {
        process.stderr.write(`closure evidence-approval-draft: ${String(error)}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const packet = buildProjectClosureEvidenceApprovalDraftPacket(snapshot, {
          action: opts.action,
          limit,
          probeExecution,
        });
        let approvalRecordOutput: {
          requested: boolean;
          path: string | null;
          written: boolean;
          bytes: number;
          sha256: string | null;
          non_authorizing: true;
        } = {
          requested: opts.out !== undefined,
          path: opts.out ?? null,
          written: false,
          bytes: 0,
          sha256: null,
          non_authorizing: true,
        };
        if (opts.out !== undefined) {
          if (packet.materialize_readiness.status !== "ready_for_approval") {
            process.stderr.write(
              `closure evidence-approval-draft: cannot write --out while materialize=${packet.materialize_readiness.status}\n`,
            );
            process.exitCode = 2;
            return;
          }
          const outputPath = isAbsolute(opts.out) ? opts.out : join(repoRoot, opts.out);
          if (existsSync(outputPath)) {
            process.stderr.write(
              `closure evidence-approval-draft: output already exists: ${opts.out}\n`,
            );
            process.exitCode = 2;
            return;
          }
          const content = `${packet.approval_record_text}\n`;
          mkdirSync(dirname(outputPath), { recursive: true });
          writeFileSync(outputPath, content, "utf8");
          approvalRecordOutput = {
            requested: true,
            path: opts.out,
            written: true,
            bytes: Buffer.byteLength(content, "utf8"),
            sha256: `sha256:${createHash("sha256").update(content).digest("hex")}`,
            non_authorizing: true,
          };
        }
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureApprovalDraftPacket(packet, approvalRecordOutput), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(
            `${JSON.stringify({ ...packet, approval_record_output: approvalRecordOutput }, null, 2)}\n`,
          );
          return;
        }
        process.stdout.write(
          `closure evidence-approval-draft: action=${packet.selected_action ?? "none"} materialize=${packet.materialize_readiness.status} candidates=${packet.materialized_candidate_count} outcome=${packet.approval.draft_outcome} non_authorizing=${packet.approval.non_authorizing} must_not_apply=${packet.must_not_apply} apply_authorized=${packet.apply_authorized} write=${packet.write_policy}\n`,
        );
        if (approvalRecordOutput.written) {
          process.stdout.write(
            `  output=${approvalRecordOutput.path} bytes=${approvalRecordOutput.bytes} sha256=${approvalRecordOutput.sha256}\n`,
          );
        }
        process.stdout.write(`  decision=${packet.approval.decision_id}\n`);
        process.stdout.write(`  approval-scope=${packet.approval.approval_scope_digest}\n`);
        process.stdout.write(`  required-action=${packet.approval.required_action}\n`);
        process.stdout.write("  record-template:\n");
        for (const line of packet.approval_record_template) {
          process.stdout.write(`    ${line}\n`);
        }
      } finally {
        db.close();
      }
    },
  );
closure
  .command("evidence-apply")
  .description("apply approved materialized evidence previews to files")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--dry-run", "preview without mutating files or DB")
  .option("--execute", "apply approved materialized evidence")
  .option("--limit <n>", "maximum queue items to inspect", "20")
  .option("--probe-record <path>", "JSON output from closure evidence-probe --execute --json")
  .option("--approval-record <path>", "approval record containing materialize decision")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      dryRun?: boolean;
      execute?: boolean;
      limit?: string;
      probeRecord?: string;
      approvalRecord?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.dryRun === opts.execute) {
        process.stderr.write(
          "closure evidence-apply: exactly one of --dry-run or --execute is required\n",
        );
        process.exitCode = 2;
        return;
      }
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure evidence-apply: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure evidence-apply: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      let probeExecution = null;
      try {
        probeExecution = readClosureEvidenceProbeExecution(opts.probeRecord);
      } catch (error) {
        process.stderr.write(`closure evidence-apply: ${String(error)}\n`);
        process.exitCode = 2;
        return;
      }
      const approvalRecordText =
        opts.approvalRecord && existsSync(opts.approvalRecord)
          ? readFileSync(opts.approvalRecord, "utf8")
          : null;
      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const plan = buildProjectClosureEvidenceApplyPlan(snapshot, {
          action: opts.action,
          limit,
          probeExecution,
          approvalRecordPath: opts.approvalRecord ?? null,
          approvalRecordText,
        });
        const appliedArtifacts: Array<{
          candidate_id: string;
          artifact_path: string;
          operation: string;
        }> = [];
        if (opts.execute) {
          if (!plan.allowed_to_apply) {
            if (opts.summaryJson) {
              process.stdout.write(
                `${JSON.stringify(
                  summarizeClosureEvidenceApplyPlan(plan, {
                    executed: false,
                    applied_artifacts: [],
                  }),
                  null,
                  2,
                )}\n`,
              );
            } else if (opts.json) {
              process.stdout.write(
                `${JSON.stringify({ ...plan, executed: false, applied_artifacts: [] }, null, 2)}\n`,
              );
            } else {
              process.stdout.write(
                `closure evidence-apply: executed=false allowed=false blockers=${plan.blocked_reasons.join(",") || "-"}\n`,
              );
            }
            process.exitCode = 2;
            return;
          }
          for (const candidate of plan.patch_candidates) {
            const path = join(repoRoot, candidate.artifact_path);
            if (candidate.operation === "append_yaml_frontmatter") {
              const next = appendMaterializedFrontmatterBlock(
                readFileSync(path, "utf8"),
                candidate.materialized_preview_lines,
              );
              writeFileSync(path, next, "utf8");
            } else {
              if (existsSync(path)) {
                throw new Error(`evidence artifact already exists: ${candidate.artifact_path}`);
              }
              mkdirSync(dirname(path), { recursive: true });
              writeFileSync(path, `${candidate.materialized_preview_lines.join("\n")}\n`, "utf8");
            }
            appliedArtifacts.push({
              candidate_id: candidate.candidate_id,
              artifact_path: candidate.artifact_path,
              operation: candidate.operation,
            });
          }
        }
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(
              summarizeClosureEvidenceApplyPlan(plan, {
                executed: opts.execute === true,
                applied_artifacts: appliedArtifacts,
              }),
              null,
              2,
            )}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(
            `${JSON.stringify(
              {
                ...plan,
                executed: opts.execute === true,
                applied_artifacts: appliedArtifacts,
              },
              null,
              2,
            )}\n`,
          );
          return;
        }
        process.stdout.write(
          `closure evidence-apply: dry_run=${opts.dryRun === true} executed=${opts.execute === true} allowed=${plan.allowed_to_apply} approval_valid=${plan.approval.valid} candidates=${plan.patch_candidates.length} applied=${appliedArtifacts.length} write=${plan.write_policy}\n`,
        );
        process.stdout.write(`  blockers=${plan.blocked_reasons.join(",") || "-"}\n`);
        process.stdout.write(`  postcheck=${plan.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("review-bundle")
  .description("emit a read-only approval bundle for closure candidates")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum candidate items to include", "20")
  .option("--offset <n>", "zero-based candidate offset", "0")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      offset?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure review-bundle: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure review-bundle: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const offset = Number.parseInt(opts.offset ?? "0", 10);
      if (!Number.isFinite(offset) || offset < 0) {
        process.stderr.write(`closure review-bundle: invalid offset=${opts.offset ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const bundle = buildProjectClosureReviewBundle(snapshot, {
          action: opts.action,
          limit,
          offset,
        });
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureReviewBundle(bundle), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(bundle, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `closure review-bundle: action=${bundle.action} approval_required=${bundle.approval_required} count=${bundle.total} listed=${bundle.listed} omitted=${bundle.omitted} decision=${bundle.decision.decision_id} write=${bundle.write_policy}\n`,
        );
        process.stdout.write(
          `  window=${bundle.window.page_index}/${bundle.window.page_count} range=${bundle.window.start}-${bundle.window.end} offset=${bundle.offset} limit=${bundle.limit} prev=${bundle.window.previous_offset ?? "-"} next=${bundle.window.next_offset ?? "-"}\n`,
        );
        process.stdout.write(
          `  outcomes=${bundle.decision.allowed_outcomes.join(",")} blockers=${bundle.decision.blocked_by_findings.join(",") || "-"}\n`,
        );
        process.stdout.write(
          `  outcome-routes=${bundle.decision.outcome_routes.map((route) => `${route.outcome}->${route.target_action ?? "-"}:${route.drive_model}`).join(",") || "-"}\n`,
        );
        process.stdout.write(
          `  review-scope: digest=${bundle.review_scope.approval_scope_digest} plans=${bundle.review_scope.plan_ids.join(",") || "-"} evidence_paths=${bundle.review_scope.evidence_totals.evidence_paths} tests=${bundle.review_scope.evidence_totals.test_runs_passed}/${bundle.review_scope.evidence_totals.test_runs_total} gates=${bundle.review_scope.evidence_totals.gate_runs_passed}/${bundle.review_scope.evidence_totals.gate_runs_total} runtime=${bundle.review_scope.evidence_totals.runtime_verification_accepted}/${bundle.review_scope.evidence_totals.runtime_verification_total}\n`,
        );
        process.stdout.write(
          `  coverage: ids=${bundle.review_scope.coverage_ids.join(",") || "-"} l12=${bundle.review_scope.l12_layers.join(",") || "-"}\n`,
        );
        process.stdout.write(
          `  required-evidence=${bundle.decision.required_evidence.join(" | ")}\n`,
        );
        for (const candidate of bundle.candidates) {
          process.stdout.write(
            `  candidate: ${candidate.planId} coverage=${candidate.coverageId ?? "-"} l12=${candidate.l12Layer} evidence=${candidate.evidence.status} tests=${candidate.evidence.testRuns.passed}/${candidate.evidence.testRuns.total} gates=${candidate.evidence.gateRuns.passed}/${candidate.evidence.gateRuns.total} runtime=${candidate.evidence.runtimeVerification.accepted}/${candidate.evidence.runtimeVerification.total} source=${candidate.sourcePath}\n`,
          );
        }
      } finally {
        db.close();
      }
    },
  );
closure
  .command("decision-draft")
  .description("emit a non-authorizing closure review decision record draft")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--limit <n>", "maximum candidate items to include", "20")
  .option("--offset <n>", "zero-based candidate offset", "0")
  .option("--out <path>", "write the non-authorizing pending decision draft to a new local file")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      limit?: string;
      offset?: string;
      out?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure decision-draft: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure decision-draft: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const offset = Number.parseInt(opts.offset ?? "0", 10);
      if (!Number.isFinite(offset) || offset < 0) {
        process.stderr.write(`closure decision-draft: invalid offset=${opts.offset ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const packet = buildProjectClosureDecisionDraftPacket(snapshot, {
          action: opts.action,
          limit,
          offset,
        });
        let decisionRecordOutput: {
          requested: boolean;
          path: string | null;
          written: boolean;
          bytes: number;
          sha256: string | null;
          non_authorizing: true;
        } = {
          requested: opts.out !== undefined,
          path: opts.out ?? null,
          written: false,
          bytes: 0,
          sha256: null,
          non_authorizing: true,
        };
        if (opts.out !== undefined) {
          const outputPath = isAbsolute(opts.out) ? opts.out : join(repoRoot, opts.out);
          if (existsSync(outputPath)) {
            process.stderr.write(`closure decision-draft: output already exists: ${opts.out}\n`);
            process.exitCode = 2;
            return;
          }
          const content = `${packet.approval_record_text}\n`;
          mkdirSync(dirname(outputPath), { recursive: true });
          writeFileSync(outputPath, content, "utf8");
          decisionRecordOutput = {
            requested: true,
            path: opts.out,
            written: true,
            bytes: Buffer.byteLength(content, "utf8"),
            sha256: `sha256:${createHash("sha256").update(content).digest("hex")}`,
            non_authorizing: true,
          };
        }
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureDecisionDraftPacket(packet, decisionRecordOutput), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(
            `${JSON.stringify({ ...packet, decision_record_output: decisionRecordOutput }, null, 2)}\n`,
          );
          return;
        }
        process.stdout.write(
          `closure decision-draft: action=${packet.action} count=${packet.review.total} listed=${packet.review.listed} outcome=${packet.decision.draft_outcome} non_authorizing=${packet.decision.non_authorizing} must_not_apply=${packet.must_not_apply} apply_authorized=${packet.apply_authorized} write=${packet.write_policy}\n`,
        );
        if (decisionRecordOutput.written) {
          process.stdout.write(
            `  output=${decisionRecordOutput.path} bytes=${decisionRecordOutput.bytes} sha256=${decisionRecordOutput.sha256}\n`,
          );
        }
        process.stdout.write(`  decision=${packet.decision.decision_id}\n`);
        process.stdout.write(`  approval-scope=${packet.decision.approval_scope_digest}\n`);
        process.stdout.write(
          `  coverage=${
            packet.candidate_digests
              .map((candidate) => candidate.coverage_id ?? "-")
              .filter((coverageId, index, values) => values.indexOf(coverageId) === index)
              .join(",") || "-"
          }\n`,
        );
        process.stdout.write(
          `  routes=${packet.decision.outcome_routes.map((route) => `${route.outcome}->${route.target_action ?? "-"}:${route.drive_model}`).join(",") || "-"}\n`,
        );
        process.stdout.write("  record-template:\n");
        for (const line of packet.approval_record_template) {
          process.stdout.write(`    ${line}\n`);
        }
      } finally {
        db.close();
      }
    },
  );
closure
  .command("transition-plan")
  .description("emit a read-only dry-run plan for approved closure candidates")
  .option(
    "--action <action>",
    "close_ready | collect_evidence | repair_failed_evidence | reverse_design",
  )
  .option("--decision <outcome>", "decision outcome", "approve_closure_claim")
  .option("--limit <n>", "maximum target items to include", "20")
  .option("--offset <n>", "zero-based target offset", "0")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      action?: string;
      decision?: string;
      limit?: string;
      offset?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.action !== undefined && !isProjectClosureQueueNextAction(opts.action)) {
        process.stderr.write(
          `closure transition-plan: invalid action=${opts.action} (expected close_ready, collect_evidence, repair_failed_evidence, reverse_design)\n`,
        );
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure transition-plan: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const offset = Number.parseInt(opts.offset ?? "0", 10);
      if (!Number.isFinite(offset) || offset < 0) {
        process.stderr.write(`closure transition-plan: invalid offset=${opts.offset ?? ""}\n`);
        process.exitCode = 2;
        return;
      }

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const plan = buildProjectClosureTransitionPlan(snapshot, {
          action: opts.action,
          decisionOutcome: opts.decision,
          limit,
          offset,
        });
        if (opts.summaryJson) {
          process.stdout.write(
            `${JSON.stringify(summarizeClosureTransitionPlan(plan), null, 2)}\n`,
          );
          return;
        }
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
          return;
        }
        process.stdout.write(
          `closure transition-plan: action=${plan.action} decision=${plan.decision_outcome} dry_run=${plan.dry_run} allowed=${plan.allowed_to_apply} targets=${plan.total} listed=${plan.listed} omitted=${plan.omitted} write=${plan.write_policy}\n`,
        );
        process.stdout.write(
          `  window=${plan.window.page_index}/${plan.window.page_count} range=${plan.window.start}-${plan.window.end} offset=${plan.offset} limit=${plan.limit} prev=${plan.window.previous_offset ?? "-"} next=${plan.window.next_offset ?? "-"}\n`,
        );
        process.stdout.write(
          `  outcome-projection: type=${plan.outcome_projection.projection_type} target=${plan.outcome_projection.target_action ?? "-"} drive=${plan.outcome_projection.drive_model} human=${plan.outcome_projection.human_required} command=${plan.outcome_projection.command}\n`,
        );
        process.stdout.write(`  blockers=${plan.blocked_reasons.join(",") || "-"}\n`);
        for (const step of plan.planned_steps) {
          process.stdout.write(
            `  step: ${step.step_id} target=${step.target} operation=${step.operation}\n`,
          );
        }
        process.stdout.write(`  postcheck=${plan.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );
closure
  .command("apply")
  .description("fail-close apply surface for approved close_ready closure application")
  .option("--dry-run", "preview without mutating files or DB")
  .option("--execute", "apply approved status patches")
  .option("--approval-record <path>", "approval record containing decision_id/outcome")
  .option("--limit <n>", "maximum patch candidates to include", "20")
  .option("--offset <n>", "zero-based patch candidate offset", "0")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for approval and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      dryRun?: boolean;
      execute?: boolean;
      approvalRecord?: string;
      limit?: string;
      offset?: string;
      json?: boolean;
      summaryJson?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.dryRun === opts.execute) {
        process.stderr.write("closure apply: exactly one of --dry-run or --execute is required\n");
        process.exitCode = 2;
        return;
      }
      const limit = Number.parseInt(opts.limit ?? "20", 10);
      if (!Number.isFinite(limit) || limit < 0) {
        process.stderr.write(`closure apply: invalid limit=${opts.limit ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const offset = Number.parseInt(opts.offset ?? "0", 10);
      if (!Number.isFinite(offset) || offset < 0) {
        process.stderr.write(`closure apply: invalid offset=${opts.offset ?? ""}\n`);
        process.exitCode = 2;
        return;
      }
      const approvalRecordText =
        opts.approvalRecord && existsSync(opts.approvalRecord)
          ? readFileSync(opts.approvalRecord, "utf8")
          : null;

      const repoRoot = process.cwd();
      const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
      const db = openHarnessDb(dbPath, { repoRoot });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const plan = buildProjectClosureApplyPlan(snapshot, {
          approvalRecordPath: opts.approvalRecord ?? null,
          approvalRecordText,
          limit,
          offset,
        });
        const summarizeApplyPlan = (
          appliedPatches: Array<{
            plan_id: string;
            source_path: string;
            next_status: string;
          }>,
        ) =>
          summarizeClosureApplyPlan(plan, {
            dryRun: opts.dryRun === true,
            executed: opts.execute === true,
            appliedPatches,
          });
        const appliedPatches: Array<{
          plan_id: string;
          source_path: string;
          next_status: string;
        }> = [];
        if (opts.execute) {
          if (!plan.allowed_to_apply) {
            if (opts.summaryJson) {
              process.stdout.write(`${JSON.stringify(summarizeApplyPlan([]), null, 2)}\n`);
            } else if (opts.json) {
              process.stdout.write(
                `${JSON.stringify({ ...plan, executed: false, applied_patches: [] }, null, 2)}\n`,
              );
            } else {
              process.stdout.write(
                `closure apply: executed=false allowed=false blockers=${plan.blocked_reasons.join(",") || "-"}\n`,
              );
            }
            process.exitCode = 2;
            return;
          }
          for (const patch of plan.patch_candidates) {
            const path = join(repoRoot, patch.source_path);
            const next = updatePlanFrontmatterStatus(readFileSync(path, "utf8"), patch.next_status);
            writeFileSync(path, next, "utf8");
            appliedPatches.push({
              plan_id: patch.plan_id,
              source_path: patch.source_path,
              next_status: patch.next_status,
            });
          }
        }
        if (opts.summaryJson) {
          process.stdout.write(`${JSON.stringify(summarizeApplyPlan(appliedPatches), null, 2)}\n`);
          return;
        }
        if (opts.json) {
          process.stdout.write(
            `${JSON.stringify(
              {
                ...plan,
                executed: opts.execute === true,
                applied_patches: appliedPatches,
              },
              null,
              2,
            )}\n`,
          );
          return;
        }
        process.stdout.write(
          `closure apply: dry_run=${opts.dryRun === true} executed=${opts.execute === true} allowed=${plan.allowed_to_apply} approval_valid=${plan.approval.valid} patches=${plan.patch_candidates.length} applied=${appliedPatches.length} write=${plan.write_policy}\n`,
        );
        process.stdout.write(`  blockers=${plan.blocked_reasons.join(",") || "-"}\n`);
        for (const patch of plan.patch_candidates) {
          process.stdout.write(
            `  patch: ${patch.plan_id} ${patch.current_status}->${patch.next_status} path=${patch.source_path}\n`,
          );
        }
        process.stdout.write(`  postcheck=${plan.postcheck_commands.join(" && ")}\n`);
      } finally {
        db.close();
      }
    },
  );

closure
  .command("auto-approve")
  .description("typed-evidence closure approval with CAS and atomic rollback")
  .option("--dry-run", "validate all selected batches without mutating PLAN files")
  .option("--execute", "apply status patches only after every selected batch passes preflight")
  .requiredOption("--evidence-manifest <path>", "typed evidence authority manifest JSON")
  .option("--batch-size <n>", "maximum close_ready candidates per batch", "50")
  .option("--offset <n>", "zero-based starting offset", "0")
  .option("--all", "process every close_ready candidate from offset")
  .option("--json", "JSON output")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action(
    (opts: {
      dryRun?: boolean;
      execute?: boolean;
      evidenceManifest: string;
      batchSize?: string;
      offset?: string;
      all?: boolean;
      json?: boolean;
      fromDb?: boolean;
    }) => {
      if (opts.dryRun === opts.execute) {
        process.stderr.write(
          "closure auto-approve: exactly one of --dry-run or --execute is required\n",
        );
        process.exitCode = 2;
        return;
      }
      const batchSize = parseClosureBatchInteger(opts.batchSize ?? "", { min: 1, max: 100 });
      if (batchSize === null) {
        process.stderr.write("closure auto-approve: batch-size must be between 1 and 100\n");
        process.exitCode = 2;
        return;
      }
      const initialOffset = parseClosureBatchInteger(opts.offset ?? "", { min: 0 });
      if (initialOffset === null) {
        process.stderr.write("closure auto-approve: offset must be zero or greater\n");
        process.exitCode = 2;
        return;
      }
      const repoRoot = process.cwd();
      const db = openHarnessDb(opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:", {
        repoRoot,
      });
      try {
        if (opts.fromDb) migrate(db);
        else rebuildHarnessDb({ repoRoot, db });
        const snapshot = buildProjectCurrentLocationSnapshot(db);
        const manifest = parseClosureAutoApprovalManifest(
          JSON.parse(readFileSync(join(repoRoot, opts.evidenceManifest), "utf8")),
        );
        const automatablePlanIds = snapshot.closure.queue.items
          .filter((item) => item.nextAction === "close_ready")
          .map((item) => item.planId)
          .sort();
        let targetSet: ReturnType<typeof buildClosureConvergenceTargetSet>;
        try {
          targetSet = closureConvergenceTargetFromSnapshot(snapshot, automatablePlanIds);
        } catch (error) {
          process.stderr.write(
            `closure auto-approve: convergence target blocked: ${String(error)}\n`,
          );
          process.exitCode = 2;
          return;
        }
        const manifestIds = manifest.candidates.map((row) => row.plan_id).sort();
        if (
          !manifest.target_set_digest ||
          manifest.target_set_digest !== targetSet.target_set_digest ||
          manifest.initial_set_digest !== targetSet.initial_set_digest ||
          manifest.terminal_boundary_digest !== targetSet.terminal_boundary_digest ||
          JSON.stringify(manifest.initial_plan_ids) !==
            JSON.stringify(targetSet.initial_plan_ids) ||
          JSON.stringify(manifest.automatable_plan_ids) !==
            JSON.stringify(targetSet.automatable_plan_ids) ||
          JSON.stringify(manifest.human_only_plan_ids) !==
            JSON.stringify(targetSet.human_only_plan_ids) ||
          JSON.stringify(manifest.invalid_escalated_plan_ids) !==
            JSON.stringify(targetSet.invalid_escalated_plan_ids)
        ) {
          process.stderr.write("closure auto-approve: sealed convergence target drift\n");
          process.exitCode = 2;
          return;
        }
        if (JSON.stringify(manifestIds) !== JSON.stringify(targetSet.automatable_plan_ids)) {
          process.stderr.write(
            "closure auto-approve: manifest/convergence target exact-set drift\n",
          );
          process.exitCode = 2;
          return;
        }
        const authorityRegistry = loadClosureAuthorityRegistry({
          repositoryRoot: repoRoot,
          registryPath: "docs/governance/closure-authority-registry.yaml",
        });
        const total = snapshot.closure.queue.route_counts.close_ready;
        const windows = closureAutoApprovalWindows({
          total,
          batchSize,
          offset: initialOffset,
          all: opts.all === true,
        });
        const end = windows.at(-1)
          ? (windows.at(-1)?.offset ?? 0) + (windows.at(-1)?.limit ?? 0)
          : initialOffset;
        const batches: ClosureAutoApprovalEvaluation[] = [];
        for (const window of windows) {
          batches.push(
            evaluateClosureAutoApproval({
              repoRoot,
              db,
              snapshot,
              manifest: {
                ...manifest,
                candidates: manifest.candidates.slice(window.offset, window.offset + window.limit),
              },
              limit: window.limit,
              offset: window.offset,
              authorityRegistry,
            }),
          );
        }
        const allowed = batches.length > 0 && batches.every((batch) => batch.allowed);
        const applied: string[] = [];
        if (opts.execute && allowed) {
          const first = batches[0] as ClosureAutoApprovalEvaluation;
          const selectedManifest: ClosureAutoApprovalManifest = {
            ...manifest,
            candidates: manifest.candidates.slice(initialOffset, end),
          };
          const transactionEvaluation: ClosureAutoApprovalEvaluation = {
            ...first,
            allowed,
            authority_digest: canonicalClosureAuthorityDigest(repoRoot, selectedManifest, db),
            target_plan_ids: batches.flatMap((batch) => batch.target_plan_ids),
            blockers: batches.flatMap((batch) => batch.blockers),
            rendered_patches: batches.flatMap((batch) => batch.rendered_patches),
          };
          const githubReceipt = loadGithubRequiredCheckReceipt(repoRoot);
          const result = applyClosureAutoApprovalAtomic({
            repoRoot,
            evaluation: transactionEvaluation,
            manifest: selectedManifest,
            db,
            githubReceipt,
            githubReceiptRefetch: () => refetchGithubRequiredCheckReceipt(repoRoot, githubReceipt),
            expectedConvergenceTargetDigest: closureConvergenceTargetFromSnapshot(
              buildProjectCurrentLocationSnapshot(db),
              automatablePlanIds,
            ).target_set_digest,
          });
          applied.push(...result.applied);
        }
        const output = {
          schema_version: "project-closure-auto-approval-run.v1",
          dry_run: opts.dryRun === true,
          executed: opts.execute === true && allowed,
          atomic_preflight_passed: allowed,
          total_close_ready: total,
          selected: batches.reduce((sum, batch) => sum + batch.target_plan_ids.length, 0),
          batch_size: batchSize,
          batch_count: batches.length,
          batches,
          applied_patches: applied,
          authority_digests: batches.map((batch) => batch.authority_digest),
          target_set_digest: targetSet.target_set_digest,
        };
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else
          process.stdout.write(
            `closure auto-approve: dry_run=${output.dry_run} executed=${output.executed} preflight=${allowed} selected=${output.selected} batches=${output.batch_count} applied=${applied.length}\n`,
          );
        if (!allowed) process.exitCode = 2;
      } finally {
        db.close();
      }
    },
  );

const progress = program.command("progress").description("artifact progress read model");

function summarizeArtifactProgressRows(rows: Array<Record<string, unknown>>, color: string | null) {
  const countBy = (key: string) =>
    rows.reduce<Record<string, number>>((acc, row) => {
      const value = typeof row[key] === "string" && row[key].length > 0 ? row[key] : "unknown";
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {});
  return {
    schema_version: "progress-artifacts-summary.v1",
    selected_color: color,
    total: rows.length,
    counts: {
      by_color: countBy("color"),
      by_type: countBy("artifact_type"),
      by_state: countBy("state"),
    },
    sample_count: Math.min(rows.length, 20),
    sample_items: rows.slice(0, 20).map((row) => ({
      artifact_path: row.artifact_path,
      artifact_type: row.artifact_type,
      state: row.state,
      color: row.color,
      linked_test_count: row.linked_test_count,
      passed_test_run_count: row.passed_test_run_count,
      dependency_checked: row.dependency_checked,
      open_dependency_impacts: row.open_dependency_impacts,
      reason: row.reason,
    })),
    write_policy: "read-only",
    source_command: "helix progress artifacts --summary-json",
    full_source_command: "helix progress artifacts --json",
  };
}

progress
  .command("artifacts")
  .description("list DB-backed artifact progress colors")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .option("--color <color>", "filter by color: red, yellow, or green")
  .action((opts: { json?: boolean; summaryJson?: boolean; color?: string }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      migrate(db);
      const color = opts.color?.trim().toLowerCase();
      const rows = loadArtifactProgressRows(db, color ?? null);
      if (opts.summaryJson) {
        process.stdout.write(
          `${JSON.stringify(summarizeArtifactProgressRows(rows as Array<Record<string, unknown>>, color ?? null), null, 2)}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
        return;
      }
      if (rows.length === 0) {
        process.stdout.write("artifact progress: no rows (run `helix db rebuild` first)\n");
        return;
      }
      for (const row of rows as Array<Record<string, unknown>>) {
        process.stdout.write(
          `${row.color} ${row.artifact_path} ${row.state} tests=${row.linked_test_count} passed_runs=${row.passed_test_run_count} deps=${row.dependency_checked} check=${row.dependency_check_run_id} impacts=${row.open_dependency_impacts} recovery=${row.recovery_plan_ids} - ${row.reason}\n`,
        );
      }
    } finally {
      db.close();
    }
  });
progress
  .command("snapshot")
  .description("emit deterministic visualization snapshot from harness.db")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      migrate(db);
      const snapshot = buildVisualizationSnapshot(db, {
        repoRoot: process.cwd(),
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `progress snapshot: artifacts red/yellow/green=${snapshot.progress.artifacts.red}/${snapshot.progress.artifacts.yellow}/${snapshot.progress.artifacts.green}, graph nodes/edges=${snapshot.graph.nodes}/${snapshot.graph.edges}, runtime accepted/blocked=${snapshot.evidence.runtime_verification.accepted}/${snapshot.evidence.runtime_verification.blocked}\n`,
      );
      for (const warning of snapshot.warnings) process.stdout.write(`  warning: ${warning}\n`);
    } finally {
      db.close();
    }
  });
progress
  .command("view-model")
  .description("emit Project/HARNESS visualization view-model with machine-detectable boundaries")
  .option("--json", "JSON output")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildVisualizationSnapshot(db, { repoRoot });
      const viewModel = buildVisualizationViewModel(snapshot);
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(viewModel, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `progress view-model: project=${viewModel.view_boundaries.project.owned_views.join(",")} harness=${viewModel.view_boundaries.harness.owned_views.join(",")} current=${viewModel.project.current_location.layer ?? "unknown"}->${viewModel.project.current_location.l12_layer ?? "unknown"} status=${viewModel.project.current_location.status} warnings=${viewModel.shared_warnings.length}\n`,
      );
    } finally {
      db.close();
    }
  });
progress
  .command("frontier")
  .description(
    "emit Project frontier summary from current-location, drive model, closure, V-model fit, and skill binding",
  )
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const summary = buildProjectFrontierSummary(
        repoRoot,
        buildProjectCurrentLocationSnapshot(db),
      );
      if (opts.summaryJson || opts.json) {
        process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `progress frontier: current=${summary.current.layer}->${summary.current.l12_layer} status=${summary.current.status} model=${summary.drive_model.selected_model} closure=${summary.closure_frontier.action}:${summary.closure_frontier.total} skill=${summary.skill_binding.status} function_policy=${summary.function_design_policy.independent_layer_policy}\n`,
      );
    } finally {
      db.close();
    }
  });
progress
  .command("tree-view")
  .description("emit VSCode Tree View model from visualization read model")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and view surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildVisualizationSnapshot(db, { repoRoot });
      const viewModel = buildVisualizationViewModel(snapshot);
      const tree = buildVisualizationTreeView(viewModel);
      if (opts.summaryJson) {
        const contexts: Record<string, number> = {};
        const commandCounts: Record<string, number> = {};
        const fullJsonPointerCounts: Record<string, number> = {};
        let nodeCount = 0;
        let commandCount = 0;
        const visit = (node: (typeof tree.roots)[number]) => {
          nodeCount += 1;
          contexts[node.contextValue] = (contexts[node.contextValue] ?? 0) + 1;
          const command = node.command?.arguments[0];
          if (command) {
            commandCount += 1;
            commandCounts[command] = (commandCounts[command] ?? 0) + 1;
            if (command.includes(" --json") && !command.includes(" --summary-json")) {
              fullJsonPointerCounts[command] = (fullJsonPointerCounts[command] ?? 0) + 1;
            }
          }
          for (const child of node.children) visit(child);
        };
        for (const root of tree.roots) visit(root);
        const fullJsonPointers = Object.entries(fullJsonPointerCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([command, count]) => ({
            command,
            count,
            allowed: false,
            reason: "view pointer should use an available --summary-json surface",
          }));
        const unexpectedFullJsonPointers = fullJsonPointers.filter((pointer) => !pointer.allowed);
        const currentLocationSnapshot = buildProjectCurrentLocationSnapshot(db);
        const summarySurfaceCommandAudit = buildSummarySurfaceCommandAudit(
          repoRoot,
          currentLocationSnapshot,
          db,
        );
        const projectFrontierSummary = buildProjectFrontierSummary(
          repoRoot,
          currentLocationSnapshot,
        );
        process.stdout.write(
          `${JSON.stringify(
            {
              schema_version: "visualization-tree-view-summary.v1",
              source_clock: tree.source_clock,
              root_count: tree.roots.length,
              roots: tree.roots.map((root) => ({
                id: root.id,
                label: root.label,
                description: root.description,
                child_count: root.children.length,
              })),
              node_count: nodeCount,
              command_count: commandCount,
              warning_count: tree.warnings.length,
              warnings: tree.warnings.slice(0, 20),
              top_contexts: Object.entries(contexts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([context_value, count]) => ({ context_value, count })),
              top_commands: Object.entries(commandCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([command, count]) => ({ command, count })),
              full_json_pointer_audit: {
                status: unexpectedFullJsonPointers.length === 0 ? "pass" : "unexpected_full_json",
                total_count: fullJsonPointers.reduce((sum, pointer) => sum + pointer.count, 0),
                allowed_count: fullJsonPointers
                  .filter((pointer) => pointer.allowed)
                  .reduce((sum, pointer) => sum + pointer.count, 0),
                unexpected_count: unexpectedFullJsonPointers.reduce(
                  (sum, pointer) => sum + pointer.count,
                  0,
                ),
                allowed_patterns: [],
                pointers: fullJsonPointers,
                unexpected_pointers: unexpectedFullJsonPointers,
              },
              project_outline: buildProjectViewOutline(tree, projectFrontierSummary),
              project_frontier_summary: projectFrontierSummary,
              summary_surface_command_audit: summarySurfaceCommandAudit,
              write_policy: "read-only",
              source_command: "helix progress tree-view --summary-json",
              full_source_command: "helix progress tree-view --json",
            },
            null,
            2,
          )}\n`,
        );
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(tree, null, 2)}\n`);
        return;
      }
      const rootLabels = tree.roots.map((root) => root.label).join("/");
      const projectCurrent = tree.roots
        .find((root) => root.id === "project")
        ?.children.find((child) => child.id === "project/current-location");
      process.stdout.write(
        `progress tree-view: roots=${rootLabels} current=${projectCurrent?.description ?? "unknown"} warnings=${tree.warnings.length}\n`,
      );
    } finally {
      db.close();
    }
  });

const vscode = program.command("vscode").description("VSCode extension read-only surfaces");
vscode
  .command("manifest")
  .description("emit VSCode extension package manifest for HELIX visualization")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const manifest = helixVscodePackageManifest();
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
      return;
    }
    const viewIds = Object.values(manifest.contributes.views)
      .flat()
      .map((view) => view.id)
      .join(",");
    const commandIds = manifest.contributes.commands.map((command) => command.command).join(",");
    process.stdout.write(
      `vscode manifest: name=${manifest.name} main=${manifest.main} views=${viewIds} commands=${commandIds}\n`,
    );
  });

program
  .command("find <query>")
  .description("search harness.db reference index")
  .option("--json", "JSON output")
  .action((query: string, opts: { json?: boolean }) => {
    const dbPath = defaultHarnessDbPath(process.cwd());
    const db = openHarnessDb(dbPath, { repoRoot: process.cwd() });
    try {
      const rows = findReference(db, query);
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
        return;
      }
      for (const row of rows) {
        process.stdout.write(
          `${row.subject_type} ${row.subject_id} ${row.path} (${row.reason}, score=${row.score})\n`,
        );
      }
    } finally {
      db.close();
    }
  });

const metrics = program.command("metrics").description("harness.db quality metrics");
metrics
  .command("skill")
  .description("compute skill firing and acceptance metrics")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = computeSkillMetrics(db);
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.plan_id} ${row.skill_id}: firing=${row.firing_rate} acceptance=${row.acceptance_rate}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

const telemetry = program
  .command("telemetry")
  .description("cross-runtime token/cost telemetry (FR-L1-38、PLAN-L7-57/58)");
telemetry
  .command("scan")
  .description(
    "両 runtime の session JSONL を走査し token/cost を harness.db (model_runs) へ ingest (CLI 非起動)",
  )
  .option(
    "--claude-dir <dir>",
    "Claude transcript dir (default: $HELIX_CLAUDE_SESSIONS_DIR or ~/.claude/projects)",
  )
  .option(
    "--codex-dir <dir>",
    "Codex session dir (default: $HELIX_CODEX_SESSIONS_DIR or ~/.codex/sessions)",
  )
  .option("--json", "JSON output")
  .action((opts: { claudeDir?: string; codexDir?: string; json?: boolean }) => {
    const repoRoot = process.cwd();
    // env-specific session-dir 解決: 明示 option > 環境変数 > OS default。CLI は一切起動せず
    // 既存ログを読むだけ (8009001d 無関係、OS 非依存)。不在ディレクトリは cold-start 安全 (空)。
    const claudeDir =
      opts.claudeDir ??
      process.env.HELIX_CLAUDE_SESSIONS_DIR ??
      join(homedir(), ".claude", "projects");
    const codexDir =
      opts.codexDir ??
      process.env.HELIX_CODEX_SESSIONS_DIR ??
      join(homedir(), ".codex", "sessions");
    const usages = loadRuntimeSessionUsage({
      claudeDirs: [claudeDir],
      codexDirs: [codexDir],
    });
    const summary = summarizeRunUsage(usages);
    const db = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
    try {
      // 既存 on-disk db が古い schema (token 列なし) でも壊れないよう migrate (冪等 ADD COLUMN)。
      migrate(db);
      projectTokenUsage(db, usages);
      // model_evaluations を再集計 (opt-in gate 無効なら no-op、cold-start 安全)。
      projectModelEvaluations(db, repoRoot);
    } finally {
      db.close();
    }
    if (opts.json) {
      process.stdout.write(`${JSON.stringify({ claudeDir, codexDir, ...summary }, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `telemetry scan: ${summary.totalRuns} runs ingested (claude=${summary.claudeRuns}, codex=${summary.codexRuns})\n` +
        `  tokens: input ${summary.inputTokens}, output ${summary.outputTokens}\n` +
        `  cost: $${summary.knownCostUsd} known, ${summary.runsWithoutCost} runs without published pricing (cost=null)\n` +
        `  sources: claude=${claudeDir}, codex=${codexDir}\n`,
    );
  });
telemetry
  .command("sessions")
  .description("emit read-only transcript index, command digests, cost, and diff provenance hints")
  .option(
    "--claude-dir <dir>",
    "Claude transcript dir (default: $HELIX_CLAUDE_SESSIONS_DIR or ~/.claude/projects)",
  )
  .option(
    "--codex-dir <dir>",
    "Codex session dir (default: $HELIX_CODEX_SESSIONS_DIR or ~/.codex/sessions)",
  )
  .option("--json", "JSON output")
  .action((opts: { claudeDir?: string; codexDir?: string; json?: boolean }) => {
    const repoRoot = process.cwd();
    const claudeDir =
      opts.claudeDir ??
      process.env.HELIX_CLAUDE_SESSIONS_DIR ??
      join(homedir(), ".claude", "projects");
    const codexDir =
      opts.codexDir ??
      process.env.HELIX_CODEX_SESSIONS_DIR ??
      join(homedir(), ".codex", "sessions");
    const report = buildAgentObservabilityProvenanceReport({
      repoRoot,
      claudeDirs: [claudeDir],
      codexDirs: [codexDir],
      commitHash: currentGitHeadShort(repoRoot),
      sourceCommand: "helix telemetry sessions --json",
    });
    process.exitCode = report.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `telemetry sessions: ${report.ok ? "ok" : "blocked"} transcripts=${report.transcript_index.length} commands=${report.command_digests.length} runs=${report.usage_summary.totalRuns}\n`,
    );
    for (const finding of report.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

const skill = program.command("skill").description("skill recommendation and invocation telemetry");
skill
  .command("create")
  .description("create a skill.v1 scaffold from assignment metadata")
  .requiredOption("--name <name>", "skill display name")
  .requiredOption("--category <category>", "skill_type value")
  .requiredOption("--layers <list>", "comma-separated L layer list")
  .requiredOption("--drive-models <list>", "comma-separated drive model list")
  .option("--domain-tags <list>", "comma-separated domain tags")
  .option("--description <text>", "initial Japanese skill description")
  .option("--write", "write the scaffold file under docs/skills")
  .option("--force", "overwrite an existing skill file when --write is set")
  .option("--json", "JSON output")
  .action(
    (opts: {
      name: string;
      category: string;
      layers: string;
      driveModels: string;
      domainTags?: string;
      description?: string;
      write?: boolean;
      force?: boolean;
      json?: boolean;
    }) => {
      const split = (value: string | undefined) =>
        (value ?? "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
      const skillDir = join(process.cwd(), "docs", "skills");
      const existingSlugs = existsSync(skillDir)
        ? readdirSync(skillDir)
            .filter((entry) => entry.endsWith(".md") && entry !== "SKILL_MAP.md")
            .map((entry) => entry.replace(/\.md$/, ""))
        : [];
      const result = scaffoldSkill({
        name: opts.name,
        category: opts.category,
        layers: split(opts.layers),
        driveModels: split(opts.driveModels),
        domainTags: split(opts.domainTags),
        description: opts.description,
        existingSlugs,
      });
      const nextActions = [
        "SKILL_MAP trigger table に生成した pack の行を追加する",
        "全ての <!-- 記入: ... --> marker を埋めるまで helix doctor は red のままにする",
      ];
      let written = false;
      if (result.ok && opts.write) {
        if (existsSync(result.path) && !opts.force) {
          const message = `skill create refused to overwrite existing file: ${result.path}\n`;
          if (opts.json) {
            process.stdout.write(
              `${JSON.stringify({ ...result, ok: false, written, nextActions, error: message.trim() }, null, 2)}\n`,
            );
          } else process.stderr.write(message);
          process.exitCode = 1;
          return;
        }
        mkdirSync(dirname(result.path), { recursive: true });
        writeFileSync(result.path, result.content, "utf8");
        written = true;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({ ...result, written, nextActions }, null, 2)}\n`);
      } else {
        process.stdout.write(
          `${result.ok ? "skill create" : "skill create rejected"}: ${result.path}\n`,
        );
        for (const finding of result.findings) {
          process.stdout.write(`  ${finding.field}: ${finding.message}\n`);
        }
        for (const action of nextActions) process.stdout.write(`  next: ${action}\n`);
        if (written) process.stdout.write("  written=true\n");
        else process.stdout.write("  written=false\n");
      }
      if (!result.ok) process.exitCode = 1;
    },
  );
skill
  .command("hygiene")
  .description("emit dry-run skill quarantine and memory retention hygiene report")
  .requiredOption("--dry-run", "do not quarantine, delete, compact, or rewrite skills/memory")
  .option("--json", "JSON output")
  .action((opts: { dryRun: boolean; json?: boolean }) => {
    const repoRoot = process.cwd();
    const db = openHarnessDb(":memory:", { repoRoot });
    try {
      rebuildHarnessDb({ repoRoot, db });
      const report = buildSkillMemoryHygieneReport(loadSkillHygieneTelemetryFromDb(db), {
        sourceCommand: "helix skill hygiene --dry-run --json",
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `skill hygiene: dry-run=${report.dry_run} quarantine=${report.quarantine_plan.length} improvements=${report.improvement_candidates.length}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } finally {
      db.close();
    }
  });

skill
  .command("efficacy")
  .description("emit dry-run with/without skill efficacy evaluation report")
  .requiredOption("--dry-run", "do not promote, quarantine, or rewrite skills")
  .option("--json", "JSON output")
  .option("--eval-json <json>", "skill efficacy evaluation array JSON")
  .action((opts: { dryRun: boolean; json?: boolean; evalJson?: string }) => {
    try {
      const parsed = parseJsonArrayOption<SkillEfficacyEvalInput>(opts.evalJson, "--eval-json");
      const evaluations =
        parsed.length > 0
          ? parsed
          : [
              {
                skill_id: "skill:dry-run",
                eval_id: "eval:dry-run",
                with_skill: {
                  artifact_path: "tests/fixtures/with-skill.md",
                  command_digest: "sha256:0123456789abcdef",
                  reproducible: true,
                  grade: 0.9,
                },
                without_skill: {
                  artifact_path: "tests/fixtures/without-skill.md",
                  command_digest: "sha256:fedcba9876543210",
                  reproducible: true,
                  grade: 0.5,
                },
              },
            ];
      const report = buildSkillEfficacyEvaluationReport(evaluations, {
        sourceCommand: "helix skill efficacy --dry-run --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `skill efficacy: ${report.ok ? "ok" : "blocked"} evaluations=${report.evaluations.length} promotion=${report.promotion_allowed_count} quarantine=${report.quarantine_candidates.length}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix skill efficacy --dry-run --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });
skill
  .command("suggest")
  .description("suggest skills for a PLAN id or a free-text task from harness.db context")
  .option("--plan <id>", "PLAN id (harness.db plan/layer/drive context)")
  .option("--text <task>", "free-text task (classify → context; mutually exclusive with --plan)")
  .option(
    "--current-location",
    "derive skill binding from Project current-location and drive model",
  )
  .option("--record", "write recommendations to harness.db (--plan only)")
  .option("--buckets", "group ranked rows into required/recommended/optional (additive view)")
  .option("--inject", "emit provider context injection manifest (skill paths only)")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for view and handoff surfaces")
  .action(
    (opts: {
      plan?: string;
      text?: string;
      currentLocation?: boolean;
      record?: boolean;
      buckets?: boolean;
      inject?: boolean;
      json?: boolean;
      summaryJson?: boolean;
    }) => {
      // A-138 ITEM-2 + L12 current-location: 入力 source はちょうど 1 つだけ許可する。
      const inputCount = [opts.plan, opts.text, opts.currentLocation].filter(Boolean).length;
      if (inputCount !== 1) {
        process.stderr.write(
          "skill suggest requires exactly one of --plan, --text, or --current-location\n",
        );
        process.exitCode = 1;
        return;
      }
      // 自由文は登録 PLAN でないので DB record 不可 (--record は --plan 専用)。
      if ((opts.text || opts.currentLocation) && opts.record) {
        process.stderr.write(
          "--record requires --plan (free-text/current-location task is not a registered PLAN)\n",
        );
        process.exitCode = 1;
        return;
      }
      const repoRoot = process.cwd();
      if (opts.currentLocation) {
        const db = openHarnessDb(":memory:", { repoRoot });
        try {
          rebuildHarnessDb({ repoRoot, db });
          const snapshot = buildProjectCurrentLocationSnapshot(db);
          const payload = projectSkillBindingCliPayload(snapshot);
          if (opts.inject) {
            const entries = payload.items
              .filter((item) => item.skill_path.length > 0)
              .map((item) => ({
                skill_id: item.skill_id,
                skill_path: item.skill_path,
                tier: item.tier,
                inject_at: item.inject_at,
                reason: item.reasons.join("; ") || `selected_model=${payload.selected_model}`,
                rank: item.rank,
                score: item.score,
              }));
            const injection = {
              plan_id: "project-current-location",
              generated_at: payload.source_clock ?? "",
              entries,
              required_paths: entries
                .filter((entry) => entry.inject_at === "before_work")
                .map((entry) => entry.skill_path),
              optional_paths: entries
                .filter((entry) => entry.inject_at === "on_demand")
                .map((entry) => entry.skill_path),
              missing_skill_ids: payload.items
                .filter((item) => item.skill_path.length === 0)
                .map((item) => item.skill_id),
              source_command: "helix skill suggest --current-location --inject --json",
              write_policy: "read-only",
            };
            if (opts.json) process.stdout.write(`${JSON.stringify(injection, null, 2)}\n`);
            else {
              process.stdout.write("project-current-location skill injection\n");
              for (const entry of injection.entries) {
                process.stdout.write(
                  `  ${entry.tier} ${entry.inject_at} ${entry.skill_id} -> ${entry.skill_path} reason=${entry.reason}\n`,
                );
              }
            }
            return;
          }
          if (opts.buckets) {
            const buckets = {
              required: payload.items.filter((item) => item.tier === "required"),
              recommended: payload.items.filter((item) => item.tier === "recommended"),
              optional: payload.items.filter((item) => item.tier === "optional"),
            };
            if (opts.json) process.stdout.write(`${JSON.stringify(buckets, null, 2)}\n`);
            else {
              for (const tier of ["required", "recommended", "optional"] as const) {
                process.stdout.write(`# ${tier}\n`);
                for (const item of buckets[tier]) {
                  process.stdout.write(
                    `  ${item.skill_id}: score=${item.score} drive=${item.matched_drive_models.join(",") || "-"} layers=${item.matched_layers.join(",") || "-"}\n`,
                  );
                }
              }
            }
            return;
          }
          if (opts.summaryJson) {
            process.stdout.write(
              `${JSON.stringify(summarizeProjectSkillBinding(payload), null, 2)}\n`,
            );
            return;
          }
          if (opts.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
          else {
            process.stdout.write(
              `skill binding: status=${payload.status} selected=${payload.selected_model} workflow=${payload.workflow_modes.join(",") || "-"} required=${payload.required_skills} recommended=${payload.recommended_skills} optional=${payload.optional_skills}\n`,
            );
            for (const item of payload.items) {
              process.stdout.write(
                `  ${item.rank}. ${item.skill_id}: ${item.tier} score=${item.score} inject=${item.inject_at} drive=${item.matched_drive_models.join(",") || "-"} layers=${item.matched_layers.join(",") || "-"}\n`,
              );
            }
          }
        } finally {
          db.close();
        }
        return;
      }
      const { db } = openSkillSuggestDb(repoRoot, Boolean(opts.record));
      try {
        const rows = opts.plan
          ? recommendSkillsForPlan(db, opts.plan)
          : recommendSkillsForText(db, opts.text ?? "");
        if (opts.record) recordSkillRecommendations(db, rows);
        if (opts.inject) {
          const injection = buildSkillInjectionSet(db, rows);
          if (opts.json) process.stdout.write(`${JSON.stringify(injection, null, 2)}\n`);
          else {
            process.stdout.write(`${injection.plan_id} skill injection\n`);
            for (const entry of injection.entries) {
              process.stdout.write(
                `  ${entry.tier} ${entry.inject_at} ${entry.skill_id} -> ${entry.skill_path} reason=${entry.reason}\n`,
              );
            }
            for (const skillId of injection.missing_skill_ids) {
              process.stdout.write(`  missing ${skillId}\n`);
            }
          }
          return;
        }
        // A-138 ITEM-2 PO 残課題: --buckets で required/recommended/optional に再編成 (additive、flat は既定)。
        if (opts.buckets) {
          const buckets = bucketRecommendations(rows);
          if (opts.json) process.stdout.write(`${JSON.stringify(buckets, null, 2)}\n`);
          else {
            for (const tier of ["required", "recommended", "optional"] as const) {
              process.stdout.write(`# ${tier}\n`);
              for (const row of buckets[tier]) {
                process.stdout.write(
                  `  ${row.skill_id}: score=${row.score} reason=${row.reason}\n`,
                );
              }
            }
          }
        } else if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
        else {
          for (const row of rows) {
            process.stdout.write(
              `${row.plan_id} ${row.skill_id}: rank=${row.rank} score=${row.score} reason=${row.reason}\n`,
            );
          }
        }
      } finally {
        db.close();
      }
    },
  );

const web = program.command("web").description("component-derived read-only web UI");
web
  .command("render")
  .description("render the component-derived read-only UI as static HTML")
  .option("--out <path>", "write HTML to a file instead of stdout")
  .option("--json", "JSON output with coverage summary")
  .action(async (opts: { out?: string; json?: boolean }) => {
    try {
      const { componentCoverageSummary, loadUiTokens, renderAppShell } = await loadOptionalWebUi();
      const tokens = loadUiTokens(defaultTokenPathFromCwd());
      const html = renderAppShell(tokens);
      const summary = componentCoverageSummary();
      if (opts.out) {
        mkdirSync(dirname(opts.out), { recursive: true });
        writeFileSync(opts.out, html);
      } else if (!opts.json) {
        process.stdout.write(html);
      }
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: true, output_path: opts.out ?? null, ...summary }, null, 2)}\n`,
        );
      }
    } catch (e) {
      process.stderr.write(`web render failed: ${String(e)}\n`);
      process.exitCode = 1;
    }
  });

web
  .command("share-bundle")
  .description("write a non-deploying read-only share bundle for activation review")
  .requiredOption("--out <dir>", "write bundle files to a directory")
  .option("--json", "JSON output with manifest summary")
  .action(async (opts: { out: string; json?: boolean }) => {
    try {
      const { buildReadOnlyShareBundle, componentCoverageSummary, loadUiTokens, renderAppShell } =
        await loadOptionalWebUi();
      const tokens = loadUiTokens(defaultTokenPathFromCwd());
      const html = renderAppShell(tokens);
      const summary = componentCoverageSummary();
      const bundle = buildReadOnlyShareBundle({
        html,
        generatedAt: new Date().toISOString(),
        pollIntervalSec:
          typeof tokens === "object" && tokens !== null && "motion" in tokens
            ? (tokens as { motion: { pollIntervalSec: number } }).motion.pollIntervalSec
            : 30,
        screenCount: Number(summary.screenCount),
        commonCount: Number(summary.commonCount),
        specificCount: Number(summary.specificCount),
        readOnly: summary.readOnly === true,
      });
      mkdirSync(opts.out, { recursive: true });
      for (const entry of bundle.files) {
        writeFileSync(join(opts.out, entry.path), entry.content);
      }
      const payload = {
        ok: true,
        output_dir: opts.out,
        planOnly: bundle.manifest.planOnly,
        mustNotDeploy: bundle.manifest.mustNotDeploy,
        readOnly: bundle.manifest.readOnly,
        hmacRequired: bundle.manifest.hmacRequired,
        accessControlRequired: bundle.manifest.accessControlRequired,
        noSecretOrPiiProjection: bundle.manifest.noSecretOrPiiProjection,
        noProdWrite: bundle.manifest.noProdWrite,
        screenCount: bundle.manifest.screenCount,
        files: bundle.files.map(({ content: _content, ...entry }) => entry),
      };
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      } else {
        process.stdout.write(
          `web share-bundle: planOnly=true mustNotDeploy=true output=${opts.out} files=${bundle.files.length}\n`,
        );
      }
    } catch (e) {
      process.stderr.write(`web share-bundle failed: ${String(e)}\n`);
      process.exitCode = 1;
    }
  });

async function loadOptionalWebUi(): Promise<{
  buildReadOnlyShareBundle: (input: {
    html: string;
    generatedAt?: string;
    pollIntervalSec: number;
    screenCount: number;
    commonCount: number;
    specificCount: number;
    readOnly: boolean;
  }) => {
    manifest: {
      planOnly: true;
      mustNotDeploy: true;
      readOnly: true;
      hmacRequired: true;
      accessControlRequired: true;
      noSecretOrPiiProjection: true;
      noProdWrite: true;
      screenCount: number;
    };
    files: Array<{
      path: string;
      mediaType: string;
      bytes: number;
      sha256: string;
      content: string;
    }>;
  };
  componentCoverageSummary: () => Record<string, unknown>;
  loadUiTokens: (path: string) => unknown;
  renderAppShell: (tokens: unknown) => string;
}> {
  const moduleUrl = new URL("./web/index.ts", import.meta.url).href;
  const load = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<{
    buildReadOnlyShareBundle: (input: {
      html: string;
      generatedAt?: string;
      pollIntervalSec: number;
      screenCount: number;
      commonCount: number;
      specificCount: number;
      readOnly: boolean;
    }) => {
      manifest: {
        planOnly: true;
        mustNotDeploy: true;
        readOnly: true;
        hmacRequired: true;
        accessControlRequired: true;
        noSecretOrPiiProjection: true;
        noProdWrite: true;
        screenCount: number;
      };
      files: Array<{
        path: string;
        mediaType: string;
        bytes: number;
        sha256: string;
        content: string;
      }>;
    };
    componentCoverageSummary: () => Record<string, unknown>;
    loadUiTokens: (path: string) => unknown;
    renderAppShell: (tokens: unknown) => string;
  }>;
  return await load(moduleUrl);
}

function defaultTokenPathFromCwd(): string {
  return join(process.cwd(), "docs", "design", "harness", "L4-basic-design", "tokens.yaml");
}

program
  .command("review")
  .description("prepare a deterministic review packet for the current worktree")
  .option("--uncommitted", "review uncommitted git changes")
  .option("--staged", "confirm the staged set before commit (IMP-137 staged-diff gate)")
  .option("--json", "JSON output")
  .action((opts: { uncommitted?: boolean; staged?: boolean; json?: boolean }) => {
    if (opts.staged) {
      // commit 前 staged-diff 確認の機械化 (IMP-137): staged 集合を surface し doctor を回す。
      // 意図しない混入を staged 段階で弾く (doctor 失敗 / suspect 検出で fail-close)。
      const staged = loadStagedFiles(process.cwd());
      const summary = summarizeStagedReview(staged);
      const doctor = runDoctor();
      const ok = doctor.ok && summary.ok;
      const stagedOutput = {
        scope: "staged",
        ok,
        staged: summary.staged,
        suspect: summary.suspect,
        doctorOk: doctor.ok,
        doctorMessages: doctor.messages,
      };
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(stagedOutput, null, 2)}\n`);
      } else {
        process.stdout.write(
          `review staged: ${ok ? "ok" : "failed"} staged=${summary.staged.length} doctor=${doctor.ok ? "ok" : "failed"}\n`,
        );
        for (const path of summary.staged) process.stdout.write(`  + ${path}\n`);
      }
      process.exitCode = ok ? 0 : 1;
      return;
    }
    if (!opts.uncommitted) {
      process.stderr.write(
        "review requires --uncommitted or --staged for the current implementation surface\n",
      );
      process.exitCode = 1;
      return;
    }
    const changedFiles = loadChangedFiles(process.cwd());
    const doctor = runDoctor();
    const verification = recommendVerificationProfiles(changedFiles);
    const output = {
      scope: "uncommitted",
      ok: doctor.ok,
      changedFiles,
      verificationRecommendations: verification.recommendations.map((r) => ({
        profile: r.profile.id,
        signals: r.signals,
        command: r.profile.command,
        defaultEnabled: r.profile.defaultEnabled,
      })),
      missingProfiles: verification.missingProfiles,
      doctorMessages: doctor.messages,
    };
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    } else {
      process.stdout.write(
        `review uncommitted: ${doctor.ok ? "ok" : "failed"} changed=${changedFiles.length} recommendations=${output.verificationRecommendations.length}\n`,
      );
      for (const rec of output.verificationRecommendations) {
        process.stdout.write(`  - ${rec.profile}: ${rec.signals.join(", ")} -> ${rec.command}\n`);
      }
      if (verification.missingProfiles.length > 0) {
        process.stdout.write(
          `missing/disabled profiles: ${verification.missingProfiles.join(", ")}\n`,
        );
      }
    }
    process.exitCode = doctor.ok ? 0 : 1;
  });

program
  .command("cutover")
  .description("prepare a non-destructive cutover / rollback plan")
  .requiredOption("--to <target>", "target ref, environment, or release label")
  .option("--from <source>", "source ref; defaults to current git HEAD when available")
  .option("--dry-run", "emit plan only; required for current implementation surface")
  .option("--json", "JSON output")
  .action((opts: { to: string; from?: string; dryRun?: boolean; json?: boolean }) => {
    const from = opts.from ?? gitHead() ?? "unknown";
    const output = {
      ok: Boolean(opts.dryRun),
      mode: opts.dryRun ? "dry-run" : "requires-human-approval",
      from,
      to: opts.to,
      checks: ["bun run src/cli.ts doctor", "bun run src/cli.ts db status --json"],
      rollback:
        from === "unknown"
          ? "record source ref before applying cutover"
          : `git switch ${shellQuote(from)}`,
      humanApprovalRequired: true,
    };
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    } else {
      process.stdout.write(
        `cutover ${from} -> ${opts.to}: ${output.mode} humanApprovalRequired=${output.humanApprovalRequired}\n`,
      );
      for (const check of output.checks) process.stdout.write(`  - check: ${check}\n`);
      process.stdout.write(`  - rollback: ${output.rollback}\n`);
    }
    if (!opts.dryRun) {
      process.stderr.write(
        "cutover apply is not implemented without explicit human-approved runbook\n",
      );
      process.exitCode = 1;
    }
  });

const automation = program.command("automation").description("workflow automation readiness");
automation
  .command("readiness")
  .description("evaluate automation readiness from harness.db projections")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = evaluateAutomationReadiness(db);
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.plan_id} ${row.workflow}/${row.phase}: ${row.ready_status} ${row.blocked_reason}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

const guardrail = program.command("guardrail").description("guardrail decision ledger");
guardrail
  .command("status")
  .description("list guardrail decisions from harness.db")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = db.prepare("SELECT * FROM guardrail_decisions ORDER BY decided_at").all();
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.plan_id ?? ""} ${row.guardrail ?? ""}: ${row.decision ?? ""} evidence=${row.evidence_path ?? ""}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

const issue = program.command("issue").description("external issue dry-run queue");
issue
  .command("queue")
  .description("list GitHub issue dry-run queue entries")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = db
        .prepare("SELECT * FROM issue_queue ORDER BY created_at, issue_queue_id")
        .all();
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.issue_queue_id ?? ""} ${row.status ?? ""}: ${row.title ?? ""} approval=${row.human_approval_required ?? ""}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

issue
  .command("mark-created")
  .description("record externally created GitHub issue back-reference for a queued dry-run item")
  .requiredOption("--queue-id <id>", "issue_queue_id")
  .requiredOption("--issue-url <url>", "created GitHub issue URL")
  .option("--issue-id <id>", "GitHub issue number or node id")
  .option("--approved-by <name>", "human approver")
  .action((opts: { queueId: string; issueUrl: string; issueId?: string; approvedBy?: string }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const existing = db
        .prepare("SELECT * FROM issue_queue WHERE issue_queue_id = ?")
        .get(opts.queueId);
      if (!existing) {
        process.stderr.write(`issue queue entry not found: ${opts.queueId}\n`);
        process.exitCode = 1;
        return;
      }
      db.prepare(
        `UPDATE issue_queue
           SET status = ?,
               human_approval_required = 0,
               approved_by = ?,
               approved_at = ?,
               external_issue_id = ?,
               external_issue_url = ?
           WHERE issue_queue_id = ?`,
      ).run(
        "created",
        opts.approvedBy ?? "",
        new Date().toISOString(),
        opts.issueId ?? "",
        opts.issueUrl,
        opts.queueId,
      );
      process.stdout.write(`issue queue updated: ${opts.queueId} -> ${opts.issueUrl}\n`);
    } finally {
      db.close();
    }
  });

const trouble = program.command("trouble").description("trouble taxonomy events");
trouble
  .command("list")
  .description("list projected trouble events")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = db
        .prepare("SELECT * FROM trouble_events ORDER BY created_at, trouble_event_id")
        .all();
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.trouble_event_id ?? ""} ${row.category ?? ""}: ${row.summary ?? ""}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

const improvement = program.command("improvement").description("self-improvement log");
improvement
  .command("log")
  .description("list projected self-improvement log entries")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const rows = db
        .prepare("SELECT * FROM improvement_log ORDER BY created_at, improvement_log_id")
        .all();
      if (opts.json) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      else {
        for (const row of rows) {
          process.stdout.write(
            `${row.improvement_log_id ?? ""} ${row.category ?? ""}: ${row.next_action ?? ""}\n`,
          );
        }
      }
    } finally {
      db.close();
    }
  });

const asset = program.command("asset").description("automation asset catalog");
asset
  .command("catalog")
  .description("catalog skill/roster/command docs into harness.db")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      const result = catalogAutomationAssets({ repoRoot: process.cwd(), db });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else {
        process.stdout.write(
          `asset catalog: ${result.assets.length} assets, findings=${result.findings.length}\n`,
        );
        for (const id of result.assets) process.stdout.write(`  - ${id}\n`);
      }
      process.exitCode = result.ok ? 0 : 1;
    } finally {
      db.close();
    }
  });

const builder = program.command("builder").description("command and workflow builder catalog");
builder
  .command("catalog")
  .description("emit the implemented command-builder surface without mutating state")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const commandDocs = [
      {
        path: "src/cli.ts",
        command: "helix skill suggest",
        description: "skill recommendation",
      },
      {
        path: "src/cli.ts",
        command: "helix review --uncommitted",
        description: "review packet",
      },
      {
        path: "src/cli.ts",
        command: "helix cutover --to",
        description: "cutover dry-run",
      },
      {
        path: "src/cli.ts",
        command: "helix progress artifacts",
        description: "artifact progress read model",
      },
      {
        path: "src/cli.ts",
        command: "helix progress snapshot",
        description: "visualization snapshot read model",
      },
      {
        path: "src/cli.ts",
        command: "helix progress view-model",
        description: "Project/HARNESS visualization boundary view-model",
      },
      {
        path: "src/cli.ts",
        command: "helix graph export",
        description: "relation graph export",
      },
      {
        path: "src/cli.ts",
        command: "helix asset catalog",
        description: "asset catalog",
      },
      {
        path: "src/cli.ts",
        command: "helix builder catalog",
        description: "builder catalog",
      },
    ];
    const surface = commandDocs.map((doc) => doc.command);
    const result = buildCommandCatalog({
      command_docs: commandDocs,
      cli_surface: surface,
    });
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stdout.write(`builder catalog: ${result.commands.length} commands\n`);
      for (const row of result.commands) process.stdout.write(`  - ${row.command}\n`);
    }
    process.exitCode = result.ok ? 0 : 1;
  });

const vmodel = program.command("vmodel").description("V-model trace");

function summarizeVmodelFitReport(
  payload: VmodelFitReport,
  currentLocationFrontier: ReturnType<typeof summarizeCurrentLocationFrontier> | null = null,
) {
  const summarizeGuard = (guard: VmodelFitReport["regression_guards"]["guards"][number]) => ({
    guard_id: guard.guard_id,
    status: guard.status,
    scope: guard.scope,
    command: summaryJsonCommand(guard.command),
    count: guard.count,
  });
  const prioritizedGuards = [...payload.regression_guards.guards].sort((left, right) => {
    const priority = { fail: 0, watch: 1, pass: 2 } as const;
    const leftPriority = priority[left.status];
    const rightPriority = priority[right.status];
    return leftPriority === rightPriority ? 0 : leftPriority - rightPriority;
  });
  const attentionGuards = payload.regression_guards.guards.filter(
    (guard) => guard.status !== "pass",
  );
  const humanApprovalBoundaryActive =
    payload.regression_guards.fail === 0 &&
    payload.regression_guards.watch > 0 &&
    payload.recovery_runway_gate.machine_actionable_count === 0 &&
    payload.recovery_runway_gate.human_approval_count > 0 &&
    (payload.recovery_handoff_gate.effective_phase === "approval" ||
      payload.approval_review_gate.status === "approval_required");
  const attentionBoundary =
    payload.regression_guards.status === "pass"
      ? "none"
      : humanApprovalBoundaryActive
        ? "human_approval"
        : payload.regression_guards.fail > 0
          ? "design_or_runtime_regression"
          : "machine_reentry";
  const attentionBoundaryCommand =
    attentionBoundary === "human_approval"
      ? payload.approval_review_gate.current_window_command
      : payload.recovery_runway_gate.next_execution_command || payload.synthesis.next_command;

  return {
    schema_version: "vmodel-fit-summary.v1",
    status: payload.status,
    source_clock: payload.source_clock,
    current: payload.current,
    gates: {
      design_coverage: payload.design_coverage_gate.status,
      acceptance_traceability: payload.acceptance_traceability_gate.status,
      zip_adoption: payload.zip_adoption.status,
      zip_manifest: payload.zip_manifest.status,
      zip_source_bindings: payload.zip_source_bindings.status,
      tailoring: payload.tailoring_gate.status,
      function_design_absorption: payload.function_design_absorption.status,
      roadmap_current: payload.roadmap_current_gate.status,
      drive_model: payload.drive_model_gate.status,
      current_location: payload.current_location_gate.status,
      recovery_runway: payload.recovery_runway_gate.status,
      recovery_handoff: payload.recovery_handoff_gate.status,
      approval_review: payload.approval_review_gate.status,
      regression_guards: payload.regression_guards.status,
    },
    synthesis: {
      status: payload.synthesis.status,
      source_package: payload.synthesis.source_package,
      source_document: payload.synthesis.source_document,
      common_adopted: payload.synthesis.common_adopted,
      helix_complemented: payload.synthesis.helix_complemented,
      rejected: payload.synthesis.rejected,
      missing_decisions: payload.synthesis.missing_decisions,
      tailoring_status: payload.synthesis.tailoring_status,
      function_design_policy: payload.synthesis.function_design_policy,
      current_reentry_status: payload.synthesis.current_reentry_status,
      effective_reentry_status: payload.synthesis.effective_reentry_status,
      next_command: payload.synthesis.next_command,
    },
    zip_manifest: {
      present: payload.zip_manifest.present,
      root_prefix: payload.zip_manifest.root_prefix,
      entries_total: payload.zip_manifest.entries_total,
      required_present: payload.zip_manifest.required_present,
      required_total: payload.zip_manifest.required_total,
      inventory_signature_status: payload.zip_manifest.inventory_signature.status,
      inventory_mismatch_count: payload.zip_manifest.inventory_signature.mismatches.length,
    },
    drive_model_gate: {
      status: payload.drive_model_gate.status,
      selected_model: payload.drive_model_gate.selected_model,
      selected_route_id: payload.drive_model_gate.selected_route_id,
      default_model: payload.drive_model_gate.default_model,
      candidate_count: payload.drive_model_gate.candidate_count,
      blocked_models: payload.drive_model_gate.blocked_models,
      available_models: payload.drive_model_gate.available_models,
    },
    current_location_gate: {
      status: payload.current_location_gate.status,
      current_status: payload.current_location_gate.current_status,
      completion_boundary: payload.current_location_gate.completion_boundary,
      route_id: payload.current_location_gate.route_id,
      recommended_model: payload.current_location_gate.recommended_model,
      recovery_runway: {
        status: payload.current_location_gate.recovery_runway.status,
        machine_actionable_count:
          payload.current_location_gate.recovery_runway.machine_actionable_count,
        human_approval_count: payload.current_location_gate.recovery_runway.human_approval_count,
        design_reverse_count: payload.current_location_gate.recovery_runway.design_reverse_count,
        remaining_after_machine_lanes:
          payload.current_location_gate.recovery_runway.remaining_after_machine_lanes,
        next_machine_action: payload.current_location_gate.recovery_runway.next_machine_action,
        next_machine_command: summaryJsonCommandOrNull(
          payload.current_location_gate.recovery_runway.next_machine_command,
        ),
        next_machine_probe_command: summaryJsonCommandOrNull(
          payload.current_location_gate.recovery_runway.next_machine_probe_command,
        ),
        next_machine_materialize_command: summaryJsonCommandOrNull(
          payload.current_location_gate.recovery_runway.next_machine_materialize_command,
        ),
        next_machine_approval_draft_command: summaryJsonCommandOrNull(
          payload.current_location_gate.recovery_runway.next_machine_approval_draft_command,
        ),
      },
      reentry_forecast: {
        status: payload.current_location_gate.reentry_forecast.status,
        effective_status: effectiveRecoveryReentryStatusForCli(
          payload.current_location_gate.reentry_forecast.status,
          payload.recovery_handoff_gate,
        ),
        current_blocking_count:
          payload.current_location_gate.reentry_forecast.current_blocking_count,
        blocking_after_machine_lanes:
          payload.current_location_gate.reentry_forecast.blocking_after_machine_lanes,
        required_phase_count: payload.current_location_gate.reentry_forecast.required_phase_count,
        next_phase_action: payload.current_location_gate.reentry_forecast.next_phase_action,
        next_gate: payload.current_location_gate.reentry_forecast.next_gate,
        next_command: summaryJsonCommand(
          payload.current_location_gate.reentry_forecast.next_command,
        ),
        next_execution_command: summaryJsonCommand(
          payload.current_location_gate.reentry_forecast.next_execution_command,
        ),
      },
    },
    current_location_frontier: currentLocationFrontier,
    recovery_runway_gate: {
      status: payload.recovery_runway_gate.status,
      current_blocking_count: payload.recovery_runway_gate.current_blocking_count,
      machine_actionable_count: payload.recovery_runway_gate.machine_actionable_count,
      human_approval_count: payload.recovery_runway_gate.human_approval_count,
      design_reverse_count: payload.recovery_runway_gate.design_reverse_count,
      remaining_after_machine_lanes: payload.recovery_runway_gate.remaining_after_machine_lanes,
      required_phase_count: payload.recovery_runway_gate.required_phase_count,
      next_phase_action: payload.recovery_runway_gate.next_phase_action,
      next_phase_type: payload.recovery_runway_gate.next_phase_type,
      next_gate: payload.recovery_runway_gate.next_gate,
      next_command: summaryJsonCommand(payload.recovery_runway_gate.next_command),
      next_execution_command: summaryJsonCommand(
        payload.recovery_runway_gate.next_execution_command,
      ),
      phases: payload.recovery_runway_gate.phases.map((phase) => ({
        sequence: phase.sequence,
        action: phase.action,
        phase_type: phase.phase_type,
        count: phase.count,
        listed: phase.listed,
        omitted: phase.omitted,
        selected: phase.selected,
        human_required: phase.human_required,
        evidence_signature: phase.evidence_signature,
        sample_plan_ids: phase.sample_plan_ids,
        remaining_after_phase: phase.remaining_after_phase,
        next_gate: phase.next_gate,
        command: summaryJsonCommand(phase.command),
        evidence_probe_command: summaryJsonCommandOrNull(phase.evidence_probe_command),
        evidence_materialize_command: summaryJsonCommandOrNull(phase.evidence_materialize_command),
        evidence_approval_draft_command: summaryJsonCommandOrNull(
          phase.evidence_approval_draft_command,
        ),
      })),
    },
    recovery_handoff_gate: {
      status: payload.recovery_handoff_gate.status,
      effective_phase: payload.recovery_handoff_gate.effective_phase,
      action_id: payload.recovery_handoff_gate.action_id,
      blocker_code: payload.recovery_handoff_gate.blocker_code,
      command: summaryJsonCommand(payload.recovery_handoff_gate.command),
      handoff_present: payload.recovery_handoff_gate.handoff_present,
      handoff_missing: payload.recovery_handoff_gate.handoff_missing,
      approval_status: payload.recovery_handoff_gate.approval_status,
      scope_status: payload.recovery_handoff_gate.scope_status,
      decision_id: payload.recovery_handoff_gate.decision_id,
      approval_record_path: payload.recovery_handoff_gate.approval_record_path,
      approval_scope_digest: payload.recovery_handoff_gate.approval_scope_digest,
      expected_approval_scope_digest: payload.recovery_handoff_gate.expected_approval_scope_digest,
      materialize_status: payload.recovery_handoff_gate.materialize_status,
      valid_for_apply: payload.recovery_handoff_gate.valid_for_apply,
      approval_state: payload.recovery_handoff_gate.approval_state,
    },
    approval_review_gate: {
      status: payload.approval_review_gate.status,
      action: payload.approval_review_gate.action,
      count: payload.approval_review_gate.count,
      listed: payload.approval_review_gate.listed,
      omitted: payload.approval_review_gate.omitted,
      window: payload.approval_review_gate.window,
      decision_id: payload.approval_review_gate.decision_id,
      approval_scope_digest: payload.approval_review_gate.approval_scope_digest,
      sample_plan_ids: payload.approval_review_gate.sample_plan_ids,
      evidence_totals: payload.approval_review_gate.evidence_totals,
      blocked_by_findings: payload.approval_review_gate.blocked_by_findings,
      current_window_command: summaryJsonCommand(
        payload.approval_review_gate.current_window_command,
      ),
      next_window_command: summaryJsonCommandOrNull(
        payload.approval_review_gate.next_window_command,
      ),
      transition_window_command: summaryJsonCommand(
        payload.approval_review_gate.transition_window_command,
      ),
    },
    regression_guards: {
      status: payload.regression_guards.status,
      pass: payload.regression_guards.pass,
      watch: payload.regression_guards.watch,
      fail: payload.regression_guards.fail,
      attention_boundary: {
        status: attentionBoundary,
        completion_claim_blocked_by:
          attentionBoundary === "none"
            ? "none"
            : attentionBoundary === "human_approval"
              ? "human_approval"
              : "machine_or_design_work",
        machine_guard_count: humanApprovalBoundaryActive ? 0 : attentionGuards.length,
        human_approval_guard_count: humanApprovalBoundaryActive ? attentionGuards.length : 0,
        machine_actionable_count: payload.recovery_runway_gate.machine_actionable_count,
        human_approval_count: payload.recovery_runway_gate.human_approval_count,
        design_reverse_count: payload.recovery_runway_gate.design_reverse_count,
        blocked_by_findings_count: payload.approval_review_gate.blocked_by_findings.length,
        next_command: summaryJsonCommand(attentionBoundaryCommand),
      },
      attention_guards: attentionGuards.map(summarizeGuard),
      sample_guards: prioritizedGuards.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT).map(summarizeGuard),
    },
    next_action_count: payload.next_actions.length,
    sample_next_actions: payload.next_actions
      .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
      .map((action) => ({
        priority: action.priority,
        action_id: action.action_id,
        blocker_code: action.blocker_code,
        status: action.status,
        automation_class: action.automation_class,
        count: action.count,
        gate: action.gate,
        command: summaryJsonCommand(action.command),
        work_bucket: action.work_bucket
          ? {
              bucket_id: action.work_bucket.bucket_id,
              action: action.work_bucket.action,
              evidence_signature: action.work_bucket.evidence_signature,
              count: action.work_bucket.count,
              failed_evidence_count: action.work_bucket.failed_evidence_count,
              projection_item_count: action.work_bucket.projection_item_count,
              repair_automation_status: action.work_bucket.repair_automation_status,
              repair_primary_next_command: summaryJsonCommandOrNull(
                action.work_bucket.repair_primary_next_command,
              ),
              evidence_patch_candidate_count: action.work_bucket.evidence_patch_candidate_count,
              evidence_handoff_next_status:
                action.work_bucket.evidence_handoff_next?.status ?? null,
              evidence_handoff_next_command: summaryJsonCommandOrNull(
                action.work_bucket.evidence_handoff_next?.command ?? null,
              ),
              evidence_approval_draft_command: summaryJsonCommand(
                action.work_bucket.evidence_approval_draft_command,
              ),
            }
          : null,
      })),
    blocker_count: payload.blockers.length,
    blockers: payload.blockers.map((blocker) => ({
      code: blocker.code,
      status: blocker.status,
      count: blocker.count,
      command: summaryJsonCommand(blocker.command),
      required_action: blocker.required_action,
      boundary:
        blocker.code === "current_location"
          ? {
              status: attentionBoundary,
              completion_claim_blocked_by:
                attentionBoundary === "human_approval"
                  ? "human_approval"
                  : attentionBoundary === "none"
                    ? "none"
                    : "machine_or_design_work",
              automation_class:
                attentionBoundary === "human_approval"
                  ? "approval"
                  : attentionBoundary === "none"
                    ? "none"
                    : "machine",
              machine_actionable_count: payload.recovery_runway_gate.machine_actionable_count,
              human_approval_count: payload.recovery_runway_gate.human_approval_count,
              design_reverse_count: payload.recovery_runway_gate.design_reverse_count,
              next_command: summaryJsonCommand(attentionBoundaryCommand),
            }
          : {
              status: "machine_or_design_work",
              completion_claim_blocked_by: "machine_or_design_work",
              automation_class: "machine",
              machine_actionable_count: blocker.count,
              human_approval_count: 0,
              design_reverse_count: 0,
              next_command: summaryJsonCommand(blocker.command),
            },
    })),
    design_integrity: payload.design_integrity,
    operation_scope: summarizeProjectOperationScope(
      payload.operation_scope,
      "helix vmodel fit --summary-json",
    ),
    scrum_operation: payload.scrum_operation
      ? {
          status: payload.scrum_operation.status,
          source_package: payload.scrum_operation.sourcePackage,
          source_binding_count: payload.scrum_operation.sourceBindings.length,
          backlog_items: payload.scrum_operation.backlogItems,
          sprint_items: payload.scrum_operation.sprintItems,
          acceptance_items: payload.scrum_operation.acceptanceItems,
          planning_items: payload.scrum_operation.planningItems,
          ceremony_items: payload.scrum_operation.ceremonyItems,
          metric_items: payload.scrum_operation.metricItems,
          active_sprint_plans: payload.scrum_operation.activeSprintPlans,
          observed_count: payload.scrum_operation.items.filter((item) => item.status === "observed")
            .length,
          missing_count: payload.scrum_operation.items.filter((item) => item.status === "missing")
            .length,
          source_command: "helix current-location --summary-json",
        }
      : null,
    skill_binding: payload.skill_binding
      ? {
          status: payload.skill_binding.status,
          selected_model: payload.skill_binding.selectedModel,
          workflow_modes: payload.skill_binding.workflowModes,
          l12_layers: payload.skill_binding.l12Layers,
          required_skills: payload.skill_binding.requiredSkills,
          recommended_skills: payload.skill_binding.recommendedSkills,
          optional_skills: payload.skill_binding.optionalSkills,
          item_count: payload.skill_binding.items.length,
          top_items: payload.skill_binding.items
            .slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT)
            .map((item) => ({
              skill_id: item.skillId,
              skill_path: item.skillPath,
              tier: item.tier,
              inject_at: item.injectAt,
              rank: item.rank,
              score: item.score,
              matched_drive_models: item.matchedDriveModels,
              matched_layers: item.matchedLayers,
              sample_reasons: item.reasons.slice(0, CLOSURE_SUMMARY_SAMPLE_LIMIT),
            })),
          source_command: "helix skill suggest --current-location --summary-json",
          full_source_command: "helix skill suggest --current-location --json",
          full_inject_command: "helix skill suggest --current-location --inject --json",
        }
      : null,
    write_policy: payload.write_policy,
    source_command: "helix vmodel fit --summary-json",
    current_location_command: "helix current-location --summary-json",
    view_command: summaryJsonCommand(payload.view_command),
    full_view_command: payload.view_command,
  };
}

vmodel
  .command("fit")
  .description("ZIP-based L12 V-model fit gate from current-location projection")
  .option("--json", "JSON output")
  .option("--summary-json", "compact JSON output for review and handoff surfaces")
  .option("--from-db", "read persisted harness.db instead of rebuilding an in-memory projection")
  .action((opts: { json?: boolean; summaryJson?: boolean; fromDb?: boolean }) => {
    const repoRoot = process.cwd();
    const dbPath = opts.fromDb ? defaultHarnessDbPath(repoRoot) : ":memory:";
    const db = openHarnessDb(dbPath, { repoRoot });
    try {
      if (opts.fromDb) migrate(db);
      else rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const payload = buildVmodelFitReport(snapshot, zipManifest, {
        repoRoot,
      });
      const summary = summarizeVmodelFitReport(payload, summarizeCurrentLocationFrontier(snapshot));
      if (opts.summaryJson) {
        process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
        return;
      }
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `vmodel fit: status=${payload.status} design=${payload.design_coverage_gate.status} ac=${payload.acceptance_traceability_gate.status} zip=${payload.zip_adoption.status} manifest=${payload.zip_manifest.status} tailoring=${payload.tailoring_gate.status} function_design=${payload.function_design_absorption.status} roadmap=${payload.roadmap_current_gate.status} drive=${payload.drive_model_gate.selected_model}/${payload.drive_model_gate.status} operation=${payload.operation_scope.designed}/${payload.operation_scope.observed}/${payload.operation_scope.missing}/${payload.operation_scope.reverify} current=${payload.current_location_gate.status} unresolved=${payload.design_integrity.unresolved_references} drift=${payload.design_integrity.declaration_drifts}\n`,
      );
      process.stdout.write(
        `  blockers=${payload.blockers.map((blocker) => `${blocker.code}:${blocker.count}`).join(",") || "-"}\n`,
      );
      process.stdout.write(
        `  synthesis: status=${payload.synthesis.status} common=${payload.synthesis.common_adopted} complement=${payload.synthesis.helix_complemented} reject=${payload.synthesis.rejected} missing=${payload.synthesis.missing_decisions} tailoring=${payload.synthesis.tailoring_status} function_policy=${payload.synthesis.function_design_policy} reentry=${payload.synthesis.current_reentry_status} effective=${payload.synthesis.effective_reentry_status} next=${payload.synthesis.next_command}\n`,
      );
      process.stdout.write(
        `  regression-guards: status=${payload.regression_guards.status} attention=${summary.regression_guards.attention_boundary.status} blocked_by=${summary.regression_guards.attention_boundary.completion_claim_blocked_by} machine_guards=${summary.regression_guards.attention_boundary.machine_guard_count} human_guards=${summary.regression_guards.attention_boundary.human_approval_guard_count} machine=${summary.regression_guards.attention_boundary.machine_actionable_count} approval=${summary.regression_guards.attention_boundary.human_approval_count} reverse=${summary.regression_guards.attention_boundary.design_reverse_count} findings=${summary.regression_guards.attention_boundary.blocked_by_findings_count} next=${summary.regression_guards.attention_boundary.next_command} pass=${payload.regression_guards.pass} watch=${payload.regression_guards.watch} fail=${payload.regression_guards.fail}\n`,
      );
      process.stdout.write(
        `  recovery-runway-gate: status=${payload.recovery_runway_gate.status} blocking=${payload.recovery_runway_gate.current_blocking_count} machine=${payload.recovery_runway_gate.machine_actionable_count} approval=${payload.recovery_runway_gate.human_approval_count} reverse=${payload.recovery_runway_gate.design_reverse_count} after_machine=${payload.recovery_runway_gate.remaining_after_machine_lanes} phases=${payload.recovery_runway_gate.required_phase_count} next=${payload.recovery_runway_gate.next_phase_action ?? "-"} phase=${payload.recovery_runway_gate.next_phase_type ?? "-"} gate=${payload.recovery_runway_gate.next_gate} command=${payload.recovery_runway_gate.next_command} execute=${payload.recovery_runway_gate.next_execution_command}\n`,
      );
      process.stdout.write(
        `  recovery-runway-phases: ${payload.recovery_runway_gate.phases.map((phase) => `${phase.sequence}:${phase.action}:${phase.phase_type}:count=${phase.count}:listed=${phase.listed}:remaining=${phase.remaining_after_phase}:gate=${phase.next_gate}:signature=${phase.evidence_signature ?? "-"}:plans=${phase.sample_plan_ids.join(",") || "-"}`).join(" | ") || "-"}\n`,
      );
      process.stdout.write(
        `  recovery-handoff-gate: status=${payload.recovery_handoff_gate.status} phase=${payload.recovery_handoff_gate.effective_phase} approval=${payload.recovery_handoff_gate.approval_status ?? "-"} scope=${payload.recovery_handoff_gate.scope_status ?? "-"} decision=${payload.recovery_handoff_gate.decision_id ?? "-"} approval_record=${payload.recovery_handoff_gate.approval_record_path ?? "-"} digest=${payload.recovery_handoff_gate.approval_scope_digest ?? "-"} expected=${payload.recovery_handoff_gate.expected_approval_scope_digest ?? "-"} materialize=${payload.recovery_handoff_gate.materialize_status ?? "-"} valid=${payload.recovery_handoff_gate.valid_for_apply} present=${payload.recovery_handoff_gate.handoff_present} missing=${payload.recovery_handoff_gate.handoff_missing} command=${payload.recovery_handoff_gate.command}\n`,
      );
      process.stdout.write(
        `  approval-review-gate: status=${payload.approval_review_gate.status} action=${payload.approval_review_gate.action} count=${payload.approval_review_gate.count} listed=${payload.approval_review_gate.listed} omitted=${payload.approval_review_gate.omitted} window=${payload.approval_review_gate.window.page_index}/${payload.approval_review_gate.window.page_count} range=${payload.approval_review_gate.window.start}-${payload.approval_review_gate.window.end} next=${payload.approval_review_gate.next_window_command ?? "-"} decision=${payload.approval_review_gate.decision_id} digest=${payload.approval_review_gate.approval_scope_digest} tests=${payload.approval_review_gate.evidence_totals.test_runs_passed}/${payload.approval_review_gate.evidence_totals.test_runs_total} gates=${payload.approval_review_gate.evidence_totals.gate_runs_passed}/${payload.approval_review_gate.evidence_totals.gate_runs_total} runtime=${payload.approval_review_gate.evidence_totals.runtime_verification_accepted}/${payload.approval_review_gate.evidence_totals.runtime_verification_total} blocked=${payload.approval_review_gate.blocked_by_findings.length} plans=${payload.approval_review_gate.sample_plan_ids.join(",") || "-"} command=${payload.approval_review_gate.current_window_command}\n`,
      );
      for (const guard of payload.regression_guards.guards) {
        process.stdout.write(
          `  regression-guard: ${guard.guard_id} ${guard.status} count=${guard.count} command=${guard.command}\n`,
        );
      }
      for (const action of payload.next_actions.slice(0, 5)) {
        process.stdout.write(
          `  next-action: ${action.priority}.${action.blocker_code} ${action.automation_class} count=${action.count} gate=${action.gate} command=${action.command}\n`,
        );
        if (action.work_bucket) {
          process.stdout.write(
            `  next-work-bucket: ${action.priority}.${action.blocker_code} ${action.work_bucket.evidence_signature} count=${action.work_bucket.count} failed=${action.work_bucket.failed_evidence_count} projections=${action.work_bucket.projection_item_count} automation=${action.work_bucket.repair_automation_status} next=${action.work_bucket.repair_primary_next_command ?? "-"} handoff=${action.work_bucket.evidence_handoff_next?.status ?? "none"} handoff_command=${action.work_bucket.evidence_handoff_next?.command ?? "-"} handoff_present=${action.work_bucket.evidence_handoff_status?.present ?? 0} handoff_missing=${action.work_bucket.evidence_handoff_status?.missing ?? 0} handoff_unchecked=${action.work_bucket.evidence_handoff_status?.unchecked ?? 0} approval=${action.work_bucket.evidence_handoff_status?.approval_record?.status ?? "-"} scope=${action.work_bucket.evidence_handoff_status?.approval_record?.scope_status ?? "-"} tables=${action.work_bucket.target_tables.join(",") || "-"} command=${action.work_bucket.primary_command} patch=${action.work_bucket.evidence_patch_command} patch_candidates=${action.work_bucket.evidence_patch_candidate_count} patch_write=${action.work_bucket.evidence_patch_write_policy} probe=${action.work_bucket.evidence_probe_command} materialize=${action.work_bucket.evidence_materialize_command} approval_draft=${action.work_bucket.evidence_approval_draft_command} apply_dry_run=${action.work_bucket.evidence_apply_dry_run_command} apply_execute=${action.work_bucket.evidence_apply_execute_command} apply_write=${action.work_bucket.evidence_apply_write_policy}\n`,
          );
        }
      }
      process.stdout.write(
        `  zip-adoption: adopt=${payload.zip_adoption.adopted} complement=${payload.zip_adoption.complemented} reject=${payload.zip_adoption.rejected} missing=${payload.zip_adoption.missing}\n`,
      );
      process.stdout.write(
        `  zip-manifest: present=${payload.zip_manifest.present} root=${payload.zip_manifest.root_prefix ?? "-"} entries=${payload.zip_manifest.entries_total} required=${payload.zip_manifest.required_present}/${payload.zip_manifest.required_total}\n`,
      );
      process.stdout.write(
        `  zip-inventory-signature: status=${payload.zip_manifest.inventory_signature.status} entries=${payload.zip_manifest.inventory_signature.actual_entries_total}/${payload.zip_manifest.inventory_signature.expected_entries_total} root=${payload.zip_manifest.inventory_signature.actual_root_prefix ?? "-"}/${payload.zip_manifest.inventory_signature.expected_root_prefix} mismatches=${payload.zip_manifest.inventory_signature.mismatches.length}\n`,
      );
      process.stdout.write(
        `  zip-source-bindings: status=${payload.zip_source_bindings.status} bound=${payload.zip_source_bindings.bound} missing=${payload.zip_source_bindings.missing} advisory=${payload.zip_source_bindings.advisory} tables=${payload.zip_source_bindings.evidence_tables.join(",") || "-"}\n`,
      );
      process.stdout.write(
        `  tailoring-gate: profile=${payload.tailoring_gate.profile} required=${payload.tailoring_gate.required} optional=${payload.tailoring_gate.optional} na=${payload.tailoring_gate.excluded} missing=${payload.tailoring_gate.missing_required}\n`,
      );
      process.stdout.write(
        `  acceptance-traceability: status=${payload.acceptance_traceability_gate.status} linked=${payload.acceptance_traceability_gate.linked}/${payload.acceptance_traceability_gate.total} declared=${payload.acceptance_traceability_gate.declared} missing=${payload.acceptance_traceability_gate.missing}\n`,
      );
      process.stdout.write(
        `  function-design-absorption: status=${payload.function_design_absorption.status} policy=${payload.function_design_absorption.independent_layer_policy} detail=${payload.function_design_absorption.detail_contract_coverage_status} tailoring=${payload.function_design_absorption.tailoring_detail_contract_status}\n`,
      );
      process.stdout.write(
        `  roadmap-current-gate: status=${payload.roadmap_current_gate.status} roadmap=${payload.roadmap_current_gate.roadmap_status} aligned=${payload.roadmap_current_gate.aligned} basis=${payload.roadmap_current_gate.alignment_basis} db=${payload.roadmap_current_gate.db_current_l12_layer ?? "-"} roadmap_layers=${payload.roadmap_current_gate.roadmap_current_l12_layers.join(",") || "-"} projected=${payload.roadmap_current_gate.roadmap_projected_l12_layers.join(",") || "-"} terminal=${payload.roadmap_current_gate.roadmap_terminal_l12_layers.join(",") || "-"} blockers=${payload.roadmap_current_gate.blocker_count}\n`,
      );
      process.stdout.write(
        `  drive-model-gate: status=${payload.drive_model_gate.status} selected=${payload.drive_model_gate.selected_model} route=${payload.drive_model_gate.selected_route_id} coverage=${payload.drive_model_gate.selected_coverage_ids.join(",") || "-"} default=${payload.drive_model_gate.default_model} candidates=${payload.drive_model_gate.candidate_count} blocked=${payload.drive_model_gate.blocked_models.join(",") || "-"} available=${payload.drive_model_gate.available_models.join(",") || "-"}\n`,
      );
      process.stdout.write(
        `  operation-scope: designed=${payload.operation_scope.designed} observed=${payload.operation_scope.observed} observed_gap=${payload.operation_scope.observed_gap} missing=${payload.operation_scope.missing} reverify=${payload.operation_scope.reverify}\n`,
      );
      process.stdout.write(
        `  current-location-gate: status=${payload.current_location_gate.status} current=${payload.current_location_gate.current_status}/${payload.current_location_gate.completion_boundary} route=${payload.current_location_gate.route_id}\n`,
      );
      process.stdout.write(
        `  recovery-runway: status=${payload.current_location_gate.recovery_runway.status} machine=${payload.current_location_gate.recovery_runway.machine_actionable_count} approval=${payload.current_location_gate.recovery_runway.human_approval_count} reverse=${payload.current_location_gate.recovery_runway.design_reverse_count} after_machine=${payload.current_location_gate.recovery_runway.remaining_after_machine_lanes} next=${payload.current_location_gate.recovery_runway.next_machine_command ?? "-"} next_probe=${payload.current_location_gate.recovery_runway.next_machine_probe_command ?? "-"} materialize=${payload.current_location_gate.recovery_runway.next_machine_materialize_command ?? "-"} approval_draft=${payload.current_location_gate.recovery_runway.next_machine_approval_draft_command ?? "-"} apply_dry_run=${payload.current_location_gate.recovery_runway.next_machine_apply_dry_run_command ?? "-"}\n`,
      );
      process.stdout.write(
        `  recovery-reentry: status=${payload.current_location_gate.reentry_forecast.status} effective=${payload.synthesis.effective_reentry_status} blocking=${payload.current_location_gate.reentry_forecast.current_blocking_count} after_machine=${payload.current_location_gate.reentry_forecast.blocking_after_machine_lanes} phases=${payload.current_location_gate.reentry_forecast.required_phase_count} next=${payload.current_location_gate.reentry_forecast.next_phase_action ?? "-"} gate=${payload.current_location_gate.reentry_forecast.next_gate} command=${payload.current_location_gate.reentry_forecast.next_command} execute=${payload.current_location_gate.reentry_forecast.next_execution_command}\n`,
      );
      process.stdout.write(
        `  design-integrity: declarations=${payload.design_integrity.declarations} references=${payload.design_integrity.references} impact=${payload.design_integrity.impact}\n`,
      );
      process.stdout.write(
        `  current-location: layer=${payload.current.layer ?? "unknown"} l12=${payload.current.l12_layer ?? "unknown"} status=${payload.current.status} route=${payload.drive_route.routeId}\n`,
      );
    } finally {
      db.close();
    }
  });
vmodel
  .command("lint [path]")
  .description("V-model 4 artifact trace lint")
  .action((path?: string) => {
    const r = lintVmodel(path);
    for (const m of r.messages) process.stdout.write(`${m}\n`);
    process.exitCode = r.ok ? 0 : 1;
  });
vmodel
  .command("show <drive> <layer>")
  .description("show drive x layer V-model context")
  .option("--injection", "show layer-context injection")
  .option("--json", "JSON output")
  .option("--mode <mode>", "override execution mode for degradation checks")
  .action(
    (
      drive: string,
      layer: string,
      opts: {
        injection?: boolean;
        json?: boolean;
        mode?: ReturnType<typeof detectMode>["mode"];
      },
    ) => {
      if (!opts.injection) {
        process.stderr.write("vmodel show currently requires --injection\n");
        process.exitCode = 1;
        return;
      }
      try {
        const executionMode = opts.mode ?? detectMode().mode;
        const injection = resolveVmodelInjection(drive, layer, {
          executionMode,
        });
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(injection, null, 2)}\n`);
          return;
        }
        for (const line of formatVmodelInjection(injection)) process.stdout.write(`${line}\n`);
      } catch (e) {
        process.stderr.write(`invalid vmodel injection input: ${String(e)}\n`);
        process.exitCode = 1;
      }
    },
  );

registerRouteCommands(program);
function runtimeCommand(provider: AdapterProvider): Command {
  return program
    .command(provider)
    .description(`${provider} runtime adapter command`)
    .requiredOption("--role <role>", "delegation role")
    .option("--task <text>", "task text")
    .option("--task-file <path>", TASK_FILE_OPTION_DESCRIPTION)
    .option("--plan <id>", "PLAN id")
    .option("--execute", "execute provider CLI instead of dry-run")
    .option("--json", "JSON output")
    .action(
      (opts: {
        role: string;
        task?: string;
        taskFile?: string;
        plan?: string;
        execute?: boolean;
        json?: boolean;
      }) => {
        const task = resolveTaskText(opts);
        if (!task) {
          process.stderr.write("adapter requires exactly one of --task or --task-file\n");
          process.exitCode = 1;
          return;
        }
        const mode = detectMode().mode;
        const contextInjection = resolveSkillContextInjection(opts.plan, "delegation");
        const plan = buildAdapterPlan(
          {
            provider,
            role: opts.role,
            task,
            planId: opts.plan,
            execute: Boolean(opts.execute),
            contextInjection,
          },
          mode,
        );
        if (!plan.available) {
          process.stderr.write(`${plan.messages.join("\n")}\n`);
          process.exitCode = 1;
          return;
        }
        // dry-run (非 execute) は plan JSON を出して終了。plan.dry_run は execute=false ゆえ true。
        // --json は出力形式であって実行抑止ではない (team run と同契約)。--execute --json は
        // 実行まで進み、末尾で実行結果 JSON (dry_run=false, exit_code) を返す。
        if (!opts.execute) {
          process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
          return;
        }
        const jsonOut = Boolean(opts.json);
        const sessionId = `${provider}-${Date.now()}`;
        const repoRoot = process.cwd();
        const deps = nodeDeps(repoRoot, gitBranch, gitHead);
        const startInput: SessionHookInput = {
          hook_event_name: HOOK_EVENT_SESSION_START,
          session_id: sessionId,
          ...(opts.plan ? { plan_id: opts.plan } : {}),
        };
        runSessionStartSideEffects(repoRoot, startInput, deps);
        dispatch(startInput, deps, HOOK_EVENT_SESSION_START);
        // review-guard (IMP-137): read-only (相談/検証) ロールの委譲 session が working tree を
        // 変更したら検知するため、spawn 前の変更パスを snapshot する。
        const guardActive = isReadOnlyDelegationRole(opts.role);
        const treeBefore = guardActive ? safeLoadChangedFiles(repoRoot) : [];
        const invocation = buildProviderInvocation({
          provider,
          command: plan.command,
          args: plan.args,
        });
        const child = spawnSync(invocation.command, invocation.args, {
          // Provider prompts are passed through stdin; argv carries only fixed
          // command flags so shell metacharacters and tool markup stay inert.
          // codex はプロンプトを stdin で受ける (plan.stdin)。cmd.exe shell-wrap が
          // 引数の改行/メタ文字を切り詰めるのを回避する (PLAN-L7-77)。
          input: plan.stdin,
          // json 時は provider の stdout を fd 2 (stderr) へ逃がし、parent stdout を実行結果 JSON
          // 専用に保つ (機械パース可能性を守る)。非 json は従来どおり stdout を inherit。
          stdio:
            plan.stdin === undefined
              ? ["inherit", jsonOut ? 2 : "inherit", "inherit"]
              : ["pipe", jsonOut ? 2 : "inherit", "inherit"],
          env: adapterExecutionEnv(provider, plan.env),
          shell: invocation.shell ?? false,
          windowsVerbatimArguments: invocation.windowsVerbatimArguments ?? false,
        });
        if (child.error) {
          // spawn 自体の失敗 (ENOENT 等) は status=null のまま沈黙するため理由を surface する (A-128 F-5 / IMP-130(d))。
          process.stderr.write(`${provider}: failed to launch (${String(child.error)})\n`);
        }
        if (guardActive) {
          // read-only 委譲が tree を変更したら warning で surface する (検知/隔離、IMP-137)。
          // exit code は変えない (レビュー成果は有効でも、混入を staged 前に弾く規律へ繋ぐ)。
          const assessment = assessReviewSession({
            role: opts.role,
            before: treeBefore,
            after: safeLoadChangedFiles(repoRoot),
          });
          for (const m of reviewGuardMessages(assessment)) process.stderr.write(`${m}\n`);
        }
        dispatch(
          {
            hook_event_name: "PostToolUse",
            session_id: sessionId,
            ...(opts.plan ? { plan_id: opts.plan } : {}),
            tool_name: provider,
            tool_input: { command: `${plan.command} ${plan.args.join(" ")}` },
            tool_response: { outcome: child.status === 0 ? "ok" : "error" },
          },
          deps,
          "PostToolUse",
        );
        dispatch(
          {
            hook_event_name: "Stop",
            session_id: sessionId,
            ...(opts.plan ? { plan_id: opts.plan } : {}),
          },
          deps,
          "Stop",
        );
        if (jsonOut) {
          // 実行が起きたことを正直に反映する実行結果 JSON。plan.dry_run は execute=true ゆえ false。
          // signal 終了時は exit_code=null になるため signal も併記する (機械判定が exit/signal を区別できる)。
          process.stdout.write(
            `${JSON.stringify(
              {
                ...plan,
                executed: true,
                exit_code: child.status ?? null,
                signal: child.signal ?? null,
              },
              null,
              2,
            )}\n`,
          );
        }
        process.exitCode = child.status ?? 1;
      },
    );
}

runtimeCommand("codex");
runtimeCommand("claude");

program
  .command("gate <id>")
  .description("mode-aware gate review-tier and deterministic static checks")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option("--review-kind <kind>", "cross_agent / intra_runtime_subagent / human")
  .option("--worker-model <model>", "worker provider/model id")
  .option("--reviewer-model <model>", "reviewer provider/model id")
  .option("--checklist <path>", "YAML checklist evidence for single-runtime review")
  .option("--coverage-summary <path>", "coverage/coverage-summary.json evidence for G7")
  .option("--human-approved", "standalone human approval evidence")
  .option("--json", "JSON output")
  .action(
    (
      id: string,
      opts: {
        mode?: ReturnType<typeof detectMode>["mode"];
        reviewKind?: "cross_agent" | "intra_runtime_subagent" | "human";
        workerModel?: string;
        reviewerModel?: string;
        checklist?: string;
        coverageSummary?: string;
        humanApproved?: boolean;
        json?: boolean;
      },
    ) => {
      const mode = opts.mode ?? detectMode().mode;
      let checklist = null;
      const checklistMessages: string[] = [];
      try {
        checklist = loadReviewChecklistIfPresent(opts.checklist);
      } catch (e) {
        checklistMessages.push(
          `review checklist - violation: could not load checklist (${String(e)})`,
        );
      }
      const review = evaluateGateReview({
        gate: id,
        mode,
        reviewKind: opts.reviewKind,
        workerModel: opts.workerModel,
        reviewerModel: opts.reviewerModel,
        checklist,
        humanApproved: Boolean(opts.humanApproved),
      });
      if (checklistMessages.length > 0) {
        review.passed = false;
        review.messages.push(...checklistMessages);
      }
      const staticGate = evaluateStaticGate({
        gate: id,
        repoRoot: process.cwd(),
        coverageSummaryPath: opts.coverageSummary,
      });
      const result = {
        ...review,
        passed: review.passed && staticGate.passed,
        review,
        static_gate: staticGate,
        messages: [...review.messages, ...staticGate.messages],
      };
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else {
        process.stdout.write(
          `gate ${id}: ${result.passed ? "passed" : "failed"} mode=${result.mode} review=${result.review_kind ?? "-"} cross_agent_review=${result.cross_agent_review} static=${staticGate.applicable ? (staticGate.passed ? "passed" : "failed") : "n-a"}\n`,
        );
        for (const m of result.messages) process.stdout.write(`  - ${m}\n`);
      }
      process.exitCode = result.passed ? 0 : 1;
    },
  );

const task = program
  .command("task")
  .description("task classification (FR-L1-39: kind/drive/size/complexity/risk)");
task
  .command("classify")
  .description("classify a task into kind / drive / size / complexity / difficulty / risk")
  .option("--text <text>", "task text")
  .option("--text-file <path>", TASK_FILE_OPTION_DESCRIPTION)
  .option("--plan <path>", "read task text from a PLAN file")
  .option("--files <list>", "comma-separated affected file paths")
  .option("--design-docs", "derive required design/test documents from proposal text")
  .option("--json", "JSON output")
  .action(
    (opts: {
      text?: string;
      textFile?: string;
      plan?: string;
      files?: string;
      designDocs?: boolean;
      json?: boolean;
    }) => {
      const text = resolveTaskText({
        task: opts.text,
        taskFile: opts.textFile ?? opts.plan,
      });
      if (text === null || text.trim().length === 0) {
        process.stderr.write(
          "task classify requires exactly one of --text, --text-file, or --plan\n",
        );
        process.exitCode = 1;
        return;
      }
      const affected_files = opts.files
        ? opts.files
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : undefined;
      if (opts.designDocs) {
        const result = {
          task: classifyTask({ text, affected_files }),
          document_coverage: classifyProposalDocumentCoverage({
            text,
            affected_files,
          }),
        };
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
          return;
        }
        const coverage = result.document_coverage;
        process.stdout.write(
          `task design-docs: granularity=${coverage.granularity} patterns=[${coverage.patterns.join(",")}] escalators=[${coverage.escalators.join(",")}]\n`,
        );
        process.stdout.write("  design docs:\n");
        for (const d of coverage.required_design_docs) {
          process.stdout.write(`    - ${d.id}: ${d.path}\n`);
        }
        process.stdout.write("  test docs:\n");
        for (const d of coverage.required_test_docs) {
          process.stdout.write(`    - ${d.id}: ${d.path}\n`);
        }
        process.stdout.write("  research adoption:\n");
        for (const r of coverage.research_adoption) {
          process.stdout.write(`    - ${r.pattern}: ${r.disposition} (${r.reason})\n`);
        }
        for (const r of coverage.research_rejections) {
          process.stdout.write(`    - ${r.pattern}: ${r.disposition} (${r.reason})\n`);
        }
        process.stdout.write("  recommended subagents:\n");
        for (const a of coverage.recommended_subagents) {
          process.stdout.write(
            `    - ${a.role}: ${a.tier} ${a.model} slots=${a.parallel_slots} closing=${a.closing_authority} ownership=${a.ownership} (${a.purpose}; guard=${a.guard})\n`,
          );
        }
        for (const f of coverage.findings) {
          process.stdout.write(`  - ${f.severity}: ${f.code} ${f.message}\n`);
        }
        return;
      }
      const result = classifyTask({ text, affected_files });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `task classify: kind=${result.kind} drive=${result.drive}(${result.drive_confidence}) size=${result.size} complexity=${result.complexity_score} difficulty=${result.difficulty} risk=[${result.risk_flags.join(",")}]\n`,
      );
      for (const f of result.findings) {
        process.stdout.write(`  - ${f.severity}: ${f.code} ${f.message}\n`);
      }
    },
  );

const ROUTER_ROLES: readonly RouterRole[] = ["tl", "qa", "uiux", "se", "docs"];

task
  .command("route")
  .description(
    "route a task to a role tier/provider (難易度ルーター: archetype × difficulty × 主 provider)",
  )
  .requiredOption("--role <role>", `router role: ${ROUTER_ROLES.join("|")}`)
  .option("--text <text>", "task text")
  .option("--text-file <path>", TASK_FILE_OPTION_DESCRIPTION)
  .option("--plan <path>", "read task text from a PLAN file")
  .option("--files <list>", "comma-separated affected file paths")
  .option("--primary <provider>", "override primary provider (claude|codex)")
  .option(
    "--allow-frontier",
    `explicitly authorize T0 (${MODEL_IDS.claude.opus}/${MODEL_IDS.codex.frontier})`,
  )
  .option("--execute", "bridge the decision to the provider adapter plan (dry-run command)")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option("--json", "JSON output")
  .action(
    (opts: {
      role: string;
      text?: string;
      textFile?: string;
      plan?: string;
      files?: string;
      primary?: string;
      allowFrontier?: boolean;
      execute?: boolean;
      mode?: ReturnType<typeof detectMode>["mode"];
      json?: boolean;
    }) => {
      if (!ROUTER_ROLES.includes(opts.role as RouterRole)) {
        process.stderr.write(`task route requires --role in ${ROUTER_ROLES.join("|")}\n`);
        process.exitCode = 1;
        return;
      }
      const text = resolveTaskText({
        task: opts.text,
        taskFile: opts.textFile ?? opts.plan,
      });
      if (text === null || text.trim().length === 0) {
        process.stderr.write("task route requires exactly one of --text, --text-file, or --plan\n");
        process.exitCode = 1;
        return;
      }
      if (opts.primary && opts.primary !== "claude" && opts.primary !== "codex") {
        process.stderr.write("task route --primary must be claude or codex\n");
        process.exitCode = 1;
        return;
      }
      const affected_files = opts.files
        ? opts.files
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : undefined;
      const base = detectMode();
      const detection = opts.mode ? { ...base, mode: opts.mode } : base;
      const decision = route(
        { role: opts.role as RouterRole, task: { text, affected_files } },
        detection,
        {
          primary: opts.primary as Provider | undefined,
          auth: { explicit: Boolean(opts.allowFrontier) },
        },
      );
      const adapterPlan = opts.execute
        ? routeToAdapterPlan(decision, text, {
            mode: detection.mode,
            contextInjection: resolveSkillContextInjection(planIdFromPath(opts.plan), "task_route"),
          })
        : null;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify({ decision, adapterPlan }, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `task route: role=${decision.role} archetype=${decision.archetype} tier=${decision.tier} provider=${decision.provider} model=${decision.model ?? "(blocked)"} status=${decision.status} review=${decision.reviewEntry} gate=${decision.gate} crossReview=${decision.crossReview} switch=${decision.cross.execution}>${decision.cross.judgement}(${decision.cross.review_kind}) difficulty=${decision.difficulty} risk=[${decision.riskFlags.join(",")}]\n`,
      );
      if (decision.reason) process.stdout.write(`  - ${decision.reason}\n`);
      if (opts.execute) {
        if (adapterPlan) {
          process.stdout.write(
            `  dispatch: provider=${adapterPlan.provider} available=${adapterPlan.available} command=${adapterPlan.command} args=[${adapterPlan.args.join(" ")}]\n`,
          );
        } else {
          process.stdout.write("  dispatch: not executable (T0 explicit-permission gate)\n");
          process.exitCode = 1;
        }
      }
    },
  );

task
  .command("roster")
  .description("list the symmetric dual-provider role roster (10 bindings)")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const bindings = roster();
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(bindings, null, 2)}\n`);
      return;
    }
    for (const b of bindings) {
      process.stdout.write(
        `roster: role=${b.role} archetype=${b.archetype} claude=${b.claude} codex=${b.codex}\n`,
      );
    }
  });

const team = program.command("team").description("team orchestration");
team
  .command("suggest")
  .description("recommend whether a task should launch a Claude/Codex team")
  .requiredOption("--task <text>", "task text to classify")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option(
    "--design-docs",
    "derive a parallel proposal-document coverage team from design-doc lanes",
  )
  .option("--json", "JSON output")
  .action(
    (opts: {
      task: string;
      mode?: ReturnType<typeof detectMode>["mode"];
      designDocs?: boolean;
      json?: boolean;
    }) => {
      const mode = opts.mode ?? detectMode().mode;
      const coverage = opts.designDocs
        ? classifyProposalDocumentCoverage({ text: opts.task })
        : undefined;
      const result = recommendTeamLaunch({
        task: opts.task,
        mode,
        proposalSubagents: coverage?.recommended_subagents,
      });
      const output = coverage ? { ...result, document_coverage: coverage } : result;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      } else {
        process.stdout.write(
          `team suggest: ${result.should_launch ? "launch" : "single-agent"} mode=${result.mode} difficulty=${result.difficulty} trigger=${result.trigger}\n`,
        );
        process.stdout.write(`  - ${result.reason}\n`);
        if (result.definition) {
          process.stdout.write(
            `  - definition=${result.definition.name} members=${result.definition.members.length}\n`,
          );
        }
      }
    },
  );
team
  .command("run")
  .description("validate, plan, and optionally execute a hybrid team run")
  .requiredOption("--definition <path>", "team definition YAML")
  .option("--mode <mode>", MODE_OVERRIDE_OPTION_DESCRIPTION)
  .option("--plan <id>", "PLAN id to attach to provider adapter metadata")
  .option("--execute", "execute provider adapters; default is dry-run planning only")
  .option(
    "--route",
    "tier-router でクロス配置 (ワーカー=主 / 相談・検証=相手) と原則安く tier モデルを導出",
  )
  .option("--primary <provider>", "クロス分岐の主 provider (claude/codex)。--route 時に使用")
  .option(
    "--allow-frontier",
    `T0 (${MODEL_IDS.claude.opus}/${MODEL_IDS.codex.frontier}) の相談・検証 member を明示許可 (--route 時)`,
  )
  .option("--json", "JSON output")
  .action(
    async (opts: {
      definition: string;
      mode?: ReturnType<typeof detectMode>["mode"];
      plan?: string;
      execute?: boolean;
      route?: boolean;
      primary?: Provider;
      allowFrontier?: boolean;
      json?: boolean;
    }) => {
      try {
        const mode = opts.mode ?? detectMode().mode;
        const definition = loadTeamDefinition(opts.definition);
        let placements: (MemberPlacement | null)[] | undefined;
        if (opts.route) {
          const base = detectMode();
          const detection: RuntimeDetection = { ...base, mode };
          const primary = opts.primary ?? base.currentRuntime ?? "claude";
          const auth = opts.allowFrontier ? { explicit: true } : undefined;
          const routings = routeTeamMembers(
            definition.members.map((m) => ({ role: m.role, task: m.task })),
            detection,
            { primary, auth },
          );
          placements = routings.map((r): MemberPlacement | null => {
            if (!r.routed || !r.decision) return null;
            const d = r.decision;
            if (d.status !== "ready" || !d.model) {
              return {
                provider: d.provider,
                model: "",
                blockedReason: d.reason ?? "blocked",
              };
            }
            return { provider: d.provider, model: d.model };
          });
        }
        const result = buildTeamRunPlan(definition, mode, {
          execute: Boolean(opts.execute),
          planId: opts.plan,
          placements,
          contextInjection: resolveSkillContextInjection(opts.plan, "team_run"),
        });
        if (!opts.execute) {
          if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
          else {
            process.stdout.write(
              `team ${definition.name}: ${result.ok ? "ok" : "failed"} mode=${mode} strategy=${result.strategy}${opts.route ? " routed" : ""} dry-run\n`,
            );
            for (const member of result.members) {
              process.stdout.write(
                `  - ${member.role}:${member.engine} provider=${member.provider} model=${member.model_selection.model}${member.adapter ? ` command=${member.adapter.command}` : ""}\n`,
              );
            }
            for (const m of result.messages) process.stdout.write(`  - ${m}\n`);
          }
          process.exitCode = result.ok ? 0 : 1;
          return;
        }
        let teamSessionSeq = 0;
        const repoRoot = process.cwd();
        const sessionDeps = nodeDeps(repoRoot, gitBranch, gitHead);
        const execution = await executeTeamRunPlan(result, {
          slots: nodeAgentSlotsDeps(repoRoot),
          runCommand: ({ command, args, provider, env, stdin }) =>
            new Promise((resolve) => {
              const sessionId = `${provider}-team-${Date.now()}-${teamSessionSeq++}`;
              const startInput: SessionHookInput = {
                hook_event_name: HOOK_EVENT_SESSION_START,
                session_id: sessionId,
                ...(opts.plan ? { plan_id: opts.plan } : {}),
              };
              runSessionStartSideEffects(repoRoot, startInput, sessionDeps);
              dispatch(startInput, sessionDeps, HOOK_EVENT_SESSION_START);
              const invocation = buildProviderInvocation({
                provider,
                command,
                args,
              });
              const captureLimitBytes = 1024 * 1024;
              let captured = Buffer.alloc(0);
              let observedBytes = 0;
              let outputTruncated = false;
              const capture = (chunk: Buffer, destination: NodeJS.WriteStream) => {
                observedBytes += chunk.length;
                if (!opts.json) destination.write(chunk);
                const remaining = captureLimitBytes - captured.length;
                if (remaining > 0)
                  captured = Buffer.concat([captured, chunk.subarray(0, remaining)]);
                if (chunk.length > remaining) outputTruncated = true;
              };
              const child = spawn(invocation.command, invocation.args, {
                cwd: repoRoot,
                env: adapterExecutionEnv(provider, env),
                // Provider prompts are passed through stdin; argv carries only fixed
                // command flags so shell metacharacters and tool markup stay inert.
                // codex はプロンプトを stdin で受ける (cmd.exe shell-wrap 回避、PLAN-L7-77)。
                stdio: stdin === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
                shell: invocation.shell ?? false,
                windowsVerbatimArguments: invocation.windowsVerbatimArguments ?? false,
              });
              if (stdin !== undefined) {
                child.stdin?.write(stdin);
                child.stdin?.end();
              }
              child.stdout?.on("data", (chunk: Buffer) => capture(chunk, process.stdout));
              child.stderr?.on("data", (chunk: Buffer) => capture(chunk, process.stderr));
              let finalized = false;
              const finish = (exitCode: number | null) => {
                if (finalized) return;
                finalized = true;
                dispatch(
                  {
                    hook_event_name: "PostToolUse",
                    session_id: sessionId,
                    ...(opts.plan ? { plan_id: opts.plan } : {}),
                    tool_name: provider,
                    tool_input: { command: `${command} ${args.join(" ")}` },
                    tool_response: { outcome: exitCode === 0 ? "ok" : "error" },
                  },
                  sessionDeps,
                  "PostToolUse",
                );
                dispatch(
                  {
                    hook_event_name: "Stop",
                    session_id: sessionId,
                    ...(opts.plan ? { plan_id: opts.plan } : {}),
                  },
                  sessionDeps,
                  "Stop",
                );
                resolve({
                  exitCode,
                  output: captured.toString("utf8"),
                  outputBytes: observedBytes,
                  outputTruncated,
                });
              };
              child.on("error", () => finish(null));
              child.on("close", (code) => finish(code));
            }),
        });
        const receiptDb = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
        try {
          migrate(receiptDb);
          receiptDb.exec("BEGIN IMMEDIATE");
          const insertReceipt = receiptDb.prepare(`INSERT INTO team_member_run_receipts
            (receipt_id, team_run_id, plan_id, team, member_index, role, engine, provider, model,
             repository_head, slot_id, exit_code, status, verdict, verdict_status, output_digest,
             output_bytes, output_truncated, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          const completedAt = new Date().toISOString();
          for (const member of execution.executions) {
            const launch = result.members.find((candidate) => candidate.index === member.index);
            insertReceipt.run(
              `${execution.team_run_id}:${member.index}`,
              execution.team_run_id,
              opts.plan ?? null,
              execution.team,
              member.index,
              member.role,
              member.engine,
              member.provider,
              launch?.model_selection.model ?? null,
              gitHead(),
              member.slot_id,
              member.exit_code,
              member.status,
              member.evidence.verdict,
              member.evidence.verdict_status,
              member.evidence.output_digest,
              member.evidence.output_bytes,
              member.evidence.output_truncated ? 1 : 0,
              completedAt,
            );
          }
          receiptDb.exec("COMMIT");
        } catch (error) {
          try {
            receiptDb.exec("ROLLBACK");
          } catch {
            // fail-close: preserve the persistence error; rollback is best-effort cleanup.
          }
          throw new Error(`team review evidence persistence failed: ${String(error)}`);
        } finally {
          receiptDb.close();
        }
        if (opts.json) process.stdout.write(`${JSON.stringify(execution, null, 2)}\n`);
        else {
          process.stdout.write(
            `team ${definition.name}: ${execution.ok ? "completed" : "failed"} strategy=${execution.strategy}\n`,
          );
          for (const member of execution.executions) {
            process.stdout.write(
              `  - ${member.role}:${member.engine} status=${member.status} exit=${member.exit_code ?? "null"} slot=${member.slot_id ?? "-"}\n`,
            );
          }
          for (const m of execution.messages) process.stdout.write(`  - ${m}\n`);
        }
        process.exitCode = execution.ok ? 0 : 1;
      } catch (e) {
        process.stderr.write(`${String(e)}\n`);
        process.exitCode = 1;
      }
    },
  );

function loadObjectiveExternalObserved(): {
  ok: boolean;
  externalObserved: Record<string, string>;
  messages: string[];
} {
  const externalObserved: Record<string, string> = {};
  const messages: string[] = [];
  const readRemote = (
    source: string,
    args: string[],
    parser: (stdout: string) => string | null,
  ) => {
    try {
      const stdout = execFileSync("git", ["-c", "credential.helper=", "ls-remote", ...args], {
        encoding: "utf8",
        env: {
          ...process.env,
          GCM_INTERACTIVE: "Never",
          GIT_ASKPASS: "",
          GIT_TERMINAL_PROMPT: "0",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      const observed = parser(stdout);
      if (!observed) {
        messages.push(`${source}: git ls-remote output did not contain the expected ref`);
        return;
      }
      externalObserved[source] = observed;
      messages.push(`${source}: ${observed}`);
    } catch (error) {
      messages.push(`${source}: git ls-remote failed: ${String(error)}`);
    }
  };
  const firstSha = (stdout: string) => stdout.trim().split(/\s+/)[0] || "unpublished";
  const latestSemverTag = (stdout: string) => {
    const tags = new Set<string>();
    for (const line of stdout.split("\n")) {
      const match = line.trim().match(/\srefs\/tags\/(v\d+\.\d+\.\d+)(?:\^\{\})?$/);
      if (match?.[1]) tags.add(match[1]);
    }
    return (
      [...tags]
        .sort((left, right) => {
          const leftParts = left.slice(1).split(".").map(Number);
          const rightParts = right.slice(1).split(".").map(Number);
          for (let i = 0; i < 3; i += 1) {
            const delta = (leftParts[i] ?? 0) - (rightParts[i] ?? 0);
            if (delta !== 0) return delta;
          }
          return left.localeCompare(right);
        })
        .at(-1) ?? "unpublished"
    );
  };
  const distributionRepoUrl = "https://github.com/RetryYN/HELIX-HARNESS-OS.git";
  readRemote(
    "development_repo",
    ["https://github.com/RetryYN/HELIX-HARNESS.git", "refs/heads/main"],
    firstSha,
  );
  readRemote("distribution_repo", [distributionRepoUrl, "refs/heads/main"], firstSha);
  readRemote("distribution_latest_tag", ["--tags", distributionRepoUrl], latestSemverTag);
  return {
    ok:
      externalObserved.development_repo !== undefined &&
      externalObserved.distribution_repo !== undefined &&
      externalObserved.distribution_latest_tag !== undefined,
    externalObserved,
    messages,
  };
}

const audit = program.command("audit").description("read-only repository audits");

audit
  .command("quality")
  .description("detect hardcoded values, security risks, and technical debt markers")
  .option("--json", "JSON output")
  .option("--include-docs", "include non-archive docs in the scan")
  .option("--include-tests", "include tests in the scan")
  .option("--limit <n>", "maximum findings in text output", (value) => Number.parseInt(value, 10))
  .action(
    (opts: { json?: boolean; includeDocs?: boolean; includeTests?: boolean; limit?: number }) => {
      const result = runQualityAudit(process.cwd(), {
        includeDocs: Boolean(opts.includeDocs),
        includeTests: Boolean(opts.includeTests),
        limit: Number.isFinite(opts.limit) ? opts.limit : undefined,
      });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(renderQualityAudit(result));
      process.exitCode = result.ok ? 0 : 1;
    },
  );

audit
  .command("objective-external")
  .description("verify objective evidence external source ledger against git ls-remote")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const observedResult = loadObjectiveExternalObserved();
    const input = loadObjectiveEvidenceAuditInput(process.cwd());
    const result =
      observedResult.ok === true
        ? analyzeObjectiveEvidenceAudit({
            ...input,
            externalObserved: observedResult.externalObserved,
          })
        : analyzeObjectiveEvidenceAudit(input);
    const output = {
      ok: observedResult.ok === true && result.ok,
      externalObserved: observedResult.externalObserved,
      externalCheck: {
        ok: observedResult.ok,
        messages: observedResult.messages,
      },
      audit: result,
    };
    process.exitCode = output.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `objective-external: ${output.ok ? "ok" : "blocked"} observed=${observedResult.ok ? "ok" : "failed"} audit=${result.ok ? "ok" : "failed"}\n`,
    );
    for (const message of observedResult.messages) process.stdout.write(`  - ${message}\n`);
    for (const message of objectiveEvidenceAuditMessages(result)) {
      process.stdout.write(`  - ${message}\n`);
    }
  });

audit
  .command("agent-catalog")
  .description("summarize the external agent catalog inventory as HELIX capability families")
  .option("--json", "JSON output")
  .option("--limit <n>", "maximum candidate rows in text output", (value) =>
    Number.parseInt(value, 10),
  )
  .action((opts: { json?: boolean; limit?: number }) => {
    const report = buildAgentCatalogWatchReport(process.cwd());
    process.exitCode = report.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `agent-catalog: ${report.ok ? "ok" : "blocked"} count=${report.inventory_count} sha256=${report.inventory_sha256} unclassified=${report.unclassified_count} rejected=${report.rejected_count}\n`,
    );
    for (const [family, count] of Object.entries(report.capability_family_counts)) {
      process.stdout.write(`  family ${family}: ${count}\n`);
    }
    const limit = Number.isFinite(opts.limit) ? Math.max(0, opts.limit ?? 0) : 10;
    for (const candidate of report.candidates.slice(0, limit)) {
      process.stdout.write(
        `  candidate family=${candidate.capability_family} status=${candidate.adoption_status} name=${candidate.name}\n`,
      );
    }
    for (const finding of report.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

audit
  .command("taxonomy")
  .description("emit harness taxonomy curation policy and source verification report")
  .option("--json", "JSON output")
  .option("--source-json <json>", "taxonomy source array JSON")
  .action((opts: { json?: boolean; sourceJson?: string }) => {
    try {
      const parsed = parseJsonArrayOption<HarnessTaxonomySource>(opts.sourceJson, "--source-json");
      const sources =
        parsed.length > 0
          ? parsed
          : [
              {
                source_id: "source:dry-run",
                source_url: "https://github.com/example/agent-harness",
                taxonomy_family: "runtime_orchestration" as const,
                source_verified: true,
                license_risk: "low" as const,
                activity_freshness_days: 14,
                scope_fit: "fit" as const,
                topic_result_digest: "sha256:0123456789abcdef",
                previous_topic_result_digest: "sha256:0123456789abcdef",
                star_count: 9999,
              },
            ];
      const report = buildHarnessTaxonomyCurationReport(sources, {
        sourceCommand: "helix audit taxonomy --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `taxonomy: ${report.ok ? "ok" : "blocked"} sources=${report.source_count} changed=${report.changed_sources.length}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix audit taxonomy --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const runtime = program.command("runtime").description("runtime capability read-only surfaces");

runtime
  .command("capabilities")
  .description("emit runtime capability matrix and optional route decision")
  .option("--json", "JSON output")
  .option("--runtime <runtime>", "runtime id to evaluate")
  .option("--requires <capability...>", "required capability names")
  .action((opts: { json?: boolean; runtime?: string; requires?: string[] }) => {
    const rawRequired = opts.requires ?? [];
    const invalid = rawRequired.filter((capability) => !isRuntimeCapability(capability));
    if (invalid.length > 0) {
      process.exitCode = 1;
      const output = {
        ok: false,
        error: "invalid_runtime_capability",
        invalid,
        source_command: "helix runtime capabilities --json",
      };
      if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      else process.stderr.write(`invalid runtime capability: ${invalid.join(",")}\n`);
      return;
    }
    const report = buildRuntimeCapabilityMatrixReport({
      runtime: opts.runtime,
      required: rawRequired as RuntimeCapability[],
    });
    process.exitCode = report.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `runtime-capabilities: ${report.ok ? "ok" : "blocked"} runtimes=${report.runtimes.length}\n`,
    );
    if (report.route_decision) {
      process.stdout.write(
        `  route runtime=${report.route_decision.runtime} status=${report.route_decision.status} missing=${report.route_decision.missing.join(",") || "-"} fallback=${report.route_decision.fallback}\n`,
      );
    }
    for (const record of report.runtimes) {
      const supportedCount = Object.values(record.capabilities).filter(
        (entry) => entry.status === "supported",
      ).length;
      process.stdout.write(`  ${record.runtime}: supported=${supportedCount}\n`);
    }
  });

const security = program.command("security").description("security policy dry-run checks");

security
  .command("egress-check")
  .description("emit credential and egress guard dry-run report")
  .requiredOption("--dry-run", "do not activate credentials, auth, infra, or network egress")
  .option("--json", "JSON output")
  .option("--tool <name>", "tool name", "tool")
  .option("--external", "mark the tool as external/network-capable")
  .option("--egress-policy <policy>", "offline, allowlist, or undefined")
  .option("--allowed-host <host>", "allowed host for allowlist policy", collectCliValues, [])
  .option("--arg <value>", "tool argument to scan", collectCliValues, [])
  .option("--activation-kind <kind>", "none, external_api, auth, or infra")
  .option("--approval-present", "action-binding approval is present")
  .action(
    (opts: {
      dryRun: boolean;
      json?: boolean;
      tool?: string;
      external?: boolean;
      egressPolicy?: string;
      allowedHost?: string[];
      arg?: string[];
      activationKind?: string;
      approvalPresent?: boolean;
    }) => {
      if (!isEgressPolicy(opts.egressPolicy) || !isActivationKind(opts.activationKind)) {
        const output = {
          ok: false,
          error: "invalid_security_egress_option",
          egress_policy: opts.egressPolicy ?? null,
          activation_kind: opts.activationKind ?? null,
          source_command: "helix security egress-check --dry-run --json",
        };
        process.exitCode = 1;
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write("invalid security egress option\n");
        return;
      }
      const report = buildSecurityCredentialEgressGuardReport(
        {
          tool_name: opts.tool ?? "tool",
          external: Boolean(opts.external),
          egress_policy: opts.egressPolicy,
          allowed_hosts: opts.allowedHost ?? [],
          args: opts.arg ?? [],
          activation_kind: opts.activationKind,
          action_binding_approval_present: Boolean(opts.approvalPresent),
        },
        { sourceCommand: "helix security egress-check --dry-run --json" },
      );
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `security egress-check: ${report.ok ? "ok" : "blocked"} tool=${report.tool_policy.tool_name} policy=${report.tool_policy.egress_policy}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    },
  );

const tools = program.command("tools").description("tool augmentation read-only surfaces");

tools
  .command("registry")
  .description("emit task-lens tool augmentation registry and non-executable suggestions")
  .option("--task <text>", "task text used for task-lens selection")
  .option("--json", "JSON output")
  .action((opts: { task?: string; json?: boolean }) => {
    const report = buildToolAugmentationRegistryReport({
      task: opts.task,
      sourceCommand: "helix tools registry --json",
    });
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `tools registry: entries=${report.registry.length} suggestions=${report.suggestions.length} blocked=${report.blocked_tools.length} read=${report.read_only}\n`,
    );
    for (const finding of report.findings) {
      process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
    }
  });

const change = program.command("change").description("change package validation surfaces");

change
  .command("package")
  .description("emit a dry-run change package delta/archive validation packet")
  .requiredOption("--dry-run", "do not archive or mutate PLAN state")
  .option("--json", "JSON output")
  .option("--package-id <id>", "change package id", "change:dry-run")
  .option("--plan <id>", "PLAN id", "PLAN-UNKNOWN")
  .option("--status <status>", "draft, active, confirmed, accepted, or archived", "draft")
  .option("--archive-requested", "validate archive request rules")
  .option("--design <path>", "related design path", collectCliValues, [])
  .option("--test-design <path>", "related test-design path", collectCliValues, [])
  .option("--evidence <path>", "acceptance evidence path", collectCliValues, [])
  .option("--layer <layer>", "delta L-layer", collectCliValues, [])
  .option("--rollback-path <path>", "archive rollback path")
  .option("--evidence-digest <digest>", "archive evidence digest")
  .action(
    (opts: {
      dryRun: boolean;
      json?: boolean;
      packageId?: string;
      plan?: string;
      status?: string;
      archiveRequested?: boolean;
      design?: string[];
      testDesign?: string[];
      evidence?: string[];
      layer?: string[];
      rollbackPath?: string;
      evidenceDigest?: string;
    }) => {
      if (!isChangePackageStatus(opts.status)) {
        const output = {
          ok: false,
          error: "invalid_change_package_status",
          status: opts.status ?? null,
          source_command: "helix change package --dry-run --json",
        };
        process.exitCode = 1;
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write("invalid change package status\n");
        return;
      }
      const report = buildChangePackageDeltaArchiveReport(
        {
          package_id: opts.packageId ?? "change:dry-run",
          plan_id: opts.plan ?? "PLAN-UNKNOWN",
          plan_status: opts.status ?? "draft",
          archive_requested: Boolean(opts.archiveRequested),
          design_paths: opts.design ?? [],
          test_design_paths: opts.testDesign ?? [],
          acceptance_evidence_paths: opts.evidence ?? [],
          delta_layers: opts.layer ?? [],
          archive_decision:
            opts.rollbackPath || opts.evidenceDigest
              ? {
                  rollback_path: opts.rollbackPath ?? null,
                  evidence_digest: opts.evidenceDigest ?? null,
                }
              : null,
        },
        { sourceCommand: "helix change package --dry-run --json" },
      );
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `change package: ${report.ok ? "ok" : "blocked"} package=${report.package_id} archive_allowed=${report.archive_allowed}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    },
  );

const specStore = program.command("spec-store").description("cross-repo spec store dry-run checks");

specStore
  .command("check")
  .description("emit read-only cross-repo spec store validation packet")
  .requiredOption("--dry-run", "do not write, sync, publish, or access credentials")
  .option("--json", "JSON output")
  .option("--store <id>", "store id", "store:dry-run")
  .option("--source <source>", "store source repo or path", "local")
  .option("--ref <ref>", "pinned commit sha or refs/tags/*", "HEAD")
  .option("--operation <operation>", "read, write, sync, or publish", "read")
  .option("--read-only", "mark store operation as read-only")
  .option("--plan <id>", "consuming PLAN id")
  .option("--digest <digest>", "trusted artifact digest")
  .option("--approval-present", "action-binding approval is present")
  .action(
    (opts: {
      dryRun: boolean;
      json?: boolean;
      store?: string;
      source?: string;
      ref?: string;
      operation?: string;
      readOnly?: boolean;
      plan?: string;
      digest?: string;
      approvalPresent?: boolean;
    }) => {
      if (!isSpecStoreOperation(opts.operation)) {
        const output = {
          ok: false,
          error: "invalid_spec_store_operation",
          operation: opts.operation ?? null,
          source_command: "helix spec-store check --dry-run --json",
        };
        process.exitCode = 1;
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write("invalid spec-store operation\n");
        return;
      }
      const report = buildCrossRepoSpecStoreReport(
        {
          store_id: opts.store ?? "store:dry-run",
          source: opts.source ?? "local",
          ref: opts.ref ?? "HEAD",
          operation: opts.operation ?? "read",
          read_only: Boolean(opts.readOnly),
          consuming_plan_id: opts.plan ?? null,
          artifact_digest: opts.digest ?? null,
          action_binding_approval_present: Boolean(opts.approvalPresent),
        },
        { sourceCommand: "helix spec-store check --dry-run --json" },
      );
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `spec-store check: ${report.ok ? "ok" : "blocked"} store=${report.store_id} op=${report.operation} trusted=${report.trusted_artifact}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    },
  );

const constitution = program
  .command("constitution")
  .description("constitution and template stack read-only checks");

constitution
  .command("check")
  .description("emit deterministic template stack resolution and constitution findings")
  .option("--json", "JSON output")
  .option(
    "--entry <spec>",
    "template entry key:source:priority:content[:override_reason]",
    collectCliValues,
    [],
  )
  .action((opts: { json?: boolean; entry?: string[] }) => {
    try {
      const entries =
        (opts.entry ?? []).length > 0
          ? (opts.entry ?? []).map(parseTemplateEntrySpec)
          : [
              {
                key: "plan-scaffold",
                source: "core" as const,
                priority: 10,
                content: "core",
              },
            ];
      const report = buildConstitutionTemplateStackReport(entries, {
        sourceCommand: "helix constitution check --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `constitution check: ${report.ok ? "ok" : "blocked"} resolved=${report.resolved_artifacts.length} findings=${report.findings.length}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix constitution check --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const artifacts = program.command("artifacts").description("cross-artifact analysis surfaces");

artifacts
  .command("converge")
  .description("emit read-only artifact convergence analysis")
  .option("--json", "JSON output")
  .option("--artifact <spec>", "artifact id:type:path:digest[:line]", collectCliValues, [])
  .option(
    "--existing-plan <id>",
    "existing PLAN/task id for duplicate detection",
    collectCliValues,
    [],
  )
  .action((opts: { json?: boolean; artifact?: string[]; existingPlan?: string[] }) => {
    try {
      const inputArtifacts =
        (opts.artifact ?? []).length > 0
          ? (opts.artifact ?? []).map(parseConvergenceArtifactSpec)
          : [
              {
                artifact_id: "plan:dry-run",
                type: "plan" as const,
                path: "docs/plans/PLAN-DRY-RUN.md",
                digest: "sha256:dry-run",
                line: null,
              },
            ];
      const report = buildArtifactConvergenceReport(inputArtifacts, {
        existingPlanIds: opts.existingPlan ?? [],
        sourceCommand: "helix artifacts converge --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `artifacts converge: ${report.ok ? "ok" : "blocked"} findings=${report.findings.length} completion=${report.completion_claim_allowed}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(
          `  ${finding.severity}: ${finding.kind}: ${finding.source_artifact.path}:${finding.source_artifact.line ?? "-"} ${finding.actionable_task}\n`,
        );
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix artifacts converge --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const stateMachine = program
  .command("state-machine")
  .description("state-machine planning surfaces");

stateMachine
  .command("policy")
  .description("emit state policy enforcement and tool escalation report")
  .option("--json", "JSON output")
  .option("--missing-policy", "simulate missing state policy fail-close")
  .option("--state <id>", "state id", "state:dry-run")
  .option("--enforcement <mode>", "hard, advisory, or unsupported", "advisory")
  .option("--allowed-tool <tool>", "allowed tool id", collectCliValues, [])
  .option("--requested-tool <tool>", "requested tool id", collectCliValues, [])
  .option("--approval-tool <tool>", "approval-required tool id", collectCliValues, [])
  .option("--transition <state>", "allowed transition", collectCliValues, [])
  .option("--exit-criteria <text>", "exit criteria", collectCliValues, [])
  .action(
    (opts: {
      json?: boolean;
      missingPolicy?: boolean;
      state?: string;
      enforcement?: string;
      allowedTool?: string[];
      requestedTool?: string[];
      approvalTool?: string[];
      transition?: string[];
      exitCriteria?: string[];
    }) => {
      if (!isEnforcementMode(opts.enforcement)) {
        process.exitCode = 1;
        const output = {
          ok: false,
          error: "invalid_enforcement_mode",
          source_command: "helix state-machine policy --json",
        };
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write("invalid enforcement mode\n");
        return;
      }
      const policy = opts.missingPolicy
        ? null
        : {
            state_id: opts.state ?? "state:dry-run",
            allowed_tools: opts.allowedTool ?? [],
            transitions: opts.transition ?? [],
            exit_criteria: opts.exitCriteria ?? [],
            enforcement: opts.enforcement ?? "advisory",
            approval_required_tools: opts.approvalTool ?? [],
          };
      const report = buildStateMachineToolPolicyReport({
        policy,
        requested_tools: opts.requestedTool ?? [],
        sourceCommand: "helix state-machine policy --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `state-machine policy: ${report.ok ? "ok" : "blocked"} state=${report.state_id ?? "-"} run=${report.run_allowed}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    },
  );

stateMachine
  .command("template")
  .description("emit workflow state-machine template selection and validation")
  .option("--task <text>", "task text for task-lens template selection")
  .option("--triple-json <json>", "execution triple array JSON")
  .option("--json", "JSON output")
  .action((opts: { task?: string; tripleJson?: string; json?: boolean }) => {
    try {
      const report = buildStateMachineTemplatePlan({
        task: opts.task,
        triples: parseExecutionTriples(opts.tripleJson),
        sourceCommand: "helix state-machine template --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `state-machine template: ${report.ok ? "ok" : "blocked"} selected=${report.selected_template_id ?? "-"} executable=${report.executable}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix state-machine template --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const extensions = program
  .command("extensions")
  .description("extension/preset/bundle dry-run surfaces");

extensions
  .command("registry")
  .description("emit extension preset bundle registry dry-run plan")
  .requiredOption("--dry-run", "do not install, remove, or fetch extension bundles")
  .option("--json", "JSON output")
  .option("--manifest <id>", "manifest id", "bundle:dry-run")
  .option("--kind <kind>", "extension, preset, or bundle", "bundle")
  .option("--catalog <catalog>", "official, community, or local", "community")
  .option("--role <role>", "role-oriented setup target", "se")
  .option("--install-allowed", "mark install allowed")
  .option("--secret-config", "simulate secret config material")
  .option("--component <spec>", "path:content[:owned][:modified]", collectCliValues, [])
  .action(
    (opts: {
      dryRun: boolean;
      json?: boolean;
      manifest?: string;
      kind?: string;
      catalog?: string;
      role?: string;
      installAllowed?: boolean;
      secretConfig?: boolean;
      component?: string[];
    }) => {
      if (!isBundleKind(opts.kind) || !isBundleCatalog(opts.catalog)) {
        const output = {
          ok: false,
          error: "invalid_extension_bundle_option",
          source_command: "helix extensions registry --dry-run --json",
        };
        process.exitCode = 1;
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write("invalid extension bundle option\n");
        return;
      }
      const components = (opts.component ?? ["docs/skills/example.md:example:true:false"]).map(
        (spec) => {
          const [path = "", content = "", owned = "", modified = ""] = spec.split(":");
          return {
            path,
            content,
            owned_by_registry: owned === "true",
            user_modified: modified === "true",
          };
        },
      );
      const report = buildExtensionPresetBundleRegistryReport(
        {
          manifest_id: opts.manifest ?? "bundle:dry-run",
          kind: opts.kind ?? "bundle",
          catalog: opts.catalog ?? "community",
          role: opts.role ?? "se",
          install_allowed: Boolean(opts.installAllowed),
          contains_secret_config: Boolean(opts.secretConfig),
          components,
        },
        { sourceCommand: "helix extensions registry --dry-run --json" },
      );
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `extensions registry: ${report.ok ? "ok" : "blocked"} manifest=${report.manifest_id} policy=${report.catalog_policy}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    },
  );

const source = program.command("source").description("external source read-only audit surfaces");

source
  .command("mirror-check")
  .description("emit source content mirror completeness and retry ledger report")
  .option("--json", "JSON output")
  .option("--repo-json <json>", "source mirror repository record array JSON")
  .action((opts: { json?: boolean; repoJson?: string }) => {
    try {
      const parsed = parseJsonArrayOption<SourceMirrorRepoRecord>(opts.repoJson, "--repo-json");
      const repos =
        parsed.length > 0
          ? parsed
          : [
              {
                repo: "RetryYN/HELIX-HARNESS",
                refs_digest: "sha256:0123456789abcdef",
                default_tree_digest: "sha256:fedcba9876543210",
                default_branch_content_digest: "sha256:0011223344556677",
                all_ref_content_status: "complete" as const,
                retry_status: "none" as const,
                chunks: [
                  {
                    chunk_id: "0001",
                    status: "ok" as const,
                    object_ids: ["blob:a", "blob:a", "blob:b"],
                    size_bytes: 42,
                    reused_digest: true,
                  },
                ],
              },
            ];
      const report = buildSourceContentMirrorCompletenessReport(repos, {
        sourceCommand: "helix source mirror-check --json",
      });
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `source mirror-check: ${report.ok ? "ok" : "blocked"} repos=${report.repo_count} complete=${report.complete_count} retry=${report.retry_ledger.length}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix source mirror-check --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

const run = program.command("run").description("agent run planning surfaces");

run
  .command("isolate")
  .description("emit a dry-run isolated worktree run packet")
  .requiredOption("--dry-run", "emit the run packet without creating or deleting a worktree")
  .option("--json", "JSON output")
  .option("--base-ref <ref>", "base ref for the isolated run")
  .option("--worktree-path <path>", "explicit worktree path")
  .option("--allow-path <path...>", "allowed path prefixes")
  .option("--network-policy <policy>", "disabled, limited, or approval_required")
  .option("--allow-dirty", "permit a dirty main worktree while recording a warning")
  .action(
    (opts: {
      dryRun: boolean;
      json?: boolean;
      baseRef?: string;
      worktreePath?: string;
      allowPath?: string[];
      networkPolicy?: "disabled" | "limited" | "approval_required";
      allowDirty?: boolean;
    }) => {
      const allowedNetworkPolicies = new Set(["disabled", "limited", "approval_required"]);
      if (opts.networkPolicy && !allowedNetworkPolicies.has(opts.networkPolicy)) {
        process.exitCode = 1;
        const output = {
          ok: false,
          error: "invalid_network_policy",
          invalid: opts.networkPolicy,
          source_command: "helix run isolate --dry-run --json",
        };
        if (opts.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        else process.stderr.write(`invalid network policy: ${opts.networkPolicy}\n`);
        return;
      }
      const plan = buildIsolatedWorktreePlan({
        repoRoot: process.cwd(),
        baseRef: opts.baseRef,
        worktreePath: opts.worktreePath,
        allowedPaths: opts.allowPath,
        networkPolicy: opts.networkPolicy,
        allowDirty: opts.allowDirty,
      });
      process.exitCode = plan.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `run-isolate: ${plan.ok ? "ok" : "blocked"} mode=${plan.mode} base=${plan.base_ref} worktree=${plan.worktree_path} dirty=${plan.dirty_worktree.status} network=${plan.network_policy}\n`,
      );
      for (const warning of plan.warnings) process.stdout.write(`  warning: ${warning}\n`);
    },
  );

const l1l2 = program.command("l1-l2").description("L1/L2 elicitation read-only helpers");

l1l2
  .command("gap-check")
  .description("emit the read-only L1/L2 gap-check packet")
  .option("--json", "JSON output")
  .action((opts: { json?: boolean }) => {
    const packet = loadL1L2GapCheckPacket(process.cwd());
    process.exitCode = packet.consistency.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
      return;
    }
    for (const message of l1L2GapCheckMessages(packet)) process.stdout.write(`${message}\n`);
  });

const branch = program.command("branch").description("read-only branch maintenance helpers");

branch
  .command("audit")
  .description("classify local branches before manual cleanup")
  .option("--json", "JSON output")
  .option("--stale-days <n>", "age threshold for stale review candidates", (value) =>
    Number.parseInt(value, 10),
  )
  .option("--limit <n>", "maximum rows in text output", (value) => Number.parseInt(value, 10))
  .action((opts: { json?: boolean; staleDays?: number; limit?: number }) => {
    try {
      const result = loadBranchAudit(process.cwd(), {
        staleDays: Number.isFinite(opts.staleDays) ? opts.staleDays : undefined,
      });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else {
        process.stdout.write(
          renderBranchAudit(result, Number.isFinite(opts.limit) ? opts.limit : undefined),
        );
      }
    } catch (error) {
      process.stderr.write(`branch audit failed: ${String(error)}\n`);
      process.exitCode = 1;
    }
  });

const github = program
  .command("github")
  .description("GitHub operation readiness and PR automation");

github
  .command("review-route")
  .description("fail-close PR cross-review route decision")
  .requiredOption("--input-json <json>", "PrReviewRouteInput JSON")
  .action((opts: { inputJson: string }) => {
    const result = validatePrReviewRoute(
      prReviewRouteInputSchema.parse(JSON.parse(opts.inputJson)),
    );
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.ok ? 0 : 1;
  });

github
  .command("ci-auto-fix-gate")
  .description("evaluate confidence and attempt circuit breakers before CI repush")
  .requiredOption("--input-json <json>", "CiAutoFixGateInput JSON")
  .action((opts: { inputJson: string }) => {
    const supplied = ciAutoFixGateInputSchema.parse(JSON.parse(opts.inputJson));
    // CLI callerはpolicy authorityではない。canonical policyを常に適用し、閾値/cap/kindを上書きさせない。
    const result = gateCiAutoFixRepush({ ...supplied, policy: undefined });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.allowRepush ? 0 : 1;
  });

github
  .command("release-automation-decision")
  .description("emit the plan-only release automation decision")
  .requiredOption("--input-json <json>", "ReleaseAutomationDecisionInput JSON")
  .action((opts: { inputJson: string }) => {
    const result = planReleaseAutomationDecision(
      releaseAutomationDecisionInputSchema.parse(JSON.parse(opts.inputJson)),
    );
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.ok ? 0 : 1;
  });

github
  .command("guard")
  .description("evaluate branch-type and commit subject guards without GitHub writes")
  .requiredOption("--head <ref>", "head branch/ref")
  .option("--base <ref>", "base branch/ref", "main")
  .option("--title <title>", "PR title used for hotfix postmortem detection")
  .option("--body <body>", "PR body used for hotfix postmortem detection")
  .option("--commit-subject <subject...>", "commit subject(s) to validate")
  .option("--json", "JSON output")
  .action(
    (opts: {
      head: string;
      base?: string;
      title?: string;
      body?: string;
      commitSubject?: string[];
      json?: boolean;
    }) => {
      const result = evaluateGithubOpsGuard({
        headRef: opts.head,
        baseRef: opts.base ?? "main",
        prTitle: opts.title,
        prBody: opts.body,
        commitSubjects: opts.commitSubject,
      });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(renderGithubOpsGuard(result));
      process.exitCode = result.ok ? 0 : 1;
    },
  );

github
  .command("release-plan")
  .description("emit a dry-run GitHub Release publication plan without creating tags or releases")
  .requiredOption("--tag <tag>", "release tag, e.g. v0.1.0")
  .requiredOption("--repo <owner/repo>", "GitHub repository")
  .option("--apply", "mark dryRun=false in the packet; does not execute commands")
  .option("--decision-input-json <json>", "required release decision evidence for --apply")
  .option("--json", "JSON output")
  .action(
    (opts: {
      tag: string;
      repo: string;
      apply?: boolean;
      decisionInputJson?: string;
      json?: boolean;
    }) => {
      if (opts.apply) {
        const decision = opts.decisionInputJson
          ? planReleaseAutomationDecision(
              releaseAutomationDecisionInputSchema.parse(JSON.parse(opts.decisionInputJson)),
            )
          : null;
        if (!decision?.ok) {
          process.stderr.write(
            "release-plan --apply rejected: accepted release automation decision evidence is required\n",
          );
          process.exitCode = 1;
          return;
        }
      }
      const result = buildReleasePublicationPlan({
        tag: opts.tag,
        repo: opts.repo,
        dryRun: opts.apply !== true,
      });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(renderReleasePublicationPlan(result));
      process.exitCode = result.ok ? 0 : 1;
    },
  );

github
  .command("merge-readiness")
  .description("emit a local main-merge readiness packet without requiring GitHub write permission")
  .option("--base <branch>", "base branch for the pull request", "main")
  .option("--json", "JSON output")
  .action((opts: { base?: string; json?: boolean }) => {
    const result = loadGithubMergeReadiness(process.cwd(), {
      baseBranch: opts.base ?? "main",
    });
    if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(renderGithubMergeReadiness(result));
    process.exitCode = result.localReady ? 0 : 1;
  });

github
  .command("pr-body")
  .description("draft a pull request body from the local branch without GitHub write access")
  .option("--base <branch>", "base branch for the pull request", "main")
  .option("--title <title>", "PR title override")
  .option("--json", "JSON output")
  .option("--markdown", "Markdown body output")
  .action((opts: { base?: string; title?: string; json?: boolean; markdown?: boolean }) => {
    const result = loadGithubPrBodyDraft(process.cwd(), {
      baseBranch: opts.base ?? "main",
      title: opts.title,
    });
    if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else if (opts.markdown) process.stdout.write(`${result.markdown}\n`);
    else {
      process.stdout.write(`github pr-body: title=${result.title}\n`);
      process.stdout.write(`  - body-lines=${result.markdown.split(/\r?\n/).length}\n`);
      process.stdout.write(`  - command=${result.commands.createDraftPullRequest}\n`);
    }
  });

github
  .command("ci-status")
  .description("emit a read-only GitHub Actions status packet for a branch/ref")
  .option("--ref <ref>", "branch or ref to inspect (defaults to current branch)")
  .option("--json", "JSON output")
  .action((opts: { ref?: string; json?: boolean }) => {
    const result = loadGithubCiStatus(process.cwd(), { ref: opts.ref });
    if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(renderGithubCiStatus(result));
    process.exitCode = result.status === "red" ? 1 : 0;
  });

github
  .command("pr-create")
  .description("create a draft pull request through delegated gh authentication")
  .option("--base <branch>", "base branch for the pull request", "main")
  .option("--title <title>", "PR title override")
  .option("--apply", "execute gh pr create; default is dry-run")
  .option("--review-input-json <json>", "required cross-review evidence for --apply")
  .option("--json", "JSON output")
  .action(
    (opts: {
      base?: string;
      title?: string;
      apply?: boolean;
      reviewInputJson?: string;
      json?: boolean;
    }) => {
      if (opts.apply) {
        const review = opts.reviewInputJson
          ? validatePrReviewRoute(prReviewRouteInputSchema.parse(JSON.parse(opts.reviewInputJson)))
          : null;
        if (!review?.ok) {
          process.stderr.write(
            "github pr-create --apply rejected: valid cross-review evidence is required\n",
          );
          process.exitCode = 1;
          return;
        }
      }
      const result = runGithubPrCreate(process.cwd(), {
        baseBranch: opts.base ?? "main",
        title: opts.title,
        dryRun: opts.apply !== true,
      });
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(
          `github pr-create: ${result.dryRun ? "dry-run" : result.ok ? "created" : "failed"} head=${result.headBranch} base=${result.baseBranch}\n`,
        );
        process.stdout.write(
          `  - access=${result.githubAccessState} readyToApply=${result.readyToApply} delegatedAuthRequired=${result.delegatedAuthRequired}\n`,
        );
        process.stdout.write(`  - command=${result.command}\n`);
        if (result.pullRequestUrl) process.stdout.write(`  - url=${result.pullRequestUrl}\n`);
        if (result.stderr) process.stdout.write(`  - stderr=${result.stderr}\n`);
      }
      process.exitCode = result.ok ? 0 : 1;
    },
  );

const feedback = program
  .command("feedback")
  .description("強制停止フィードバック (forced-stop-feedback, PLAN-L7-02)");

feedback
  .command("reverse-candidates")
  .description("DB の赤/warn から Reverse 起票候補を導出 (未対応の red artifact / warn finding)")
  .option("--json", "JSON で出力")
  .action((opts: { json?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()));
    const candidates = collectReverseCandidates(db);
    if (opts.json) {
      process.stdout.write(
        `${JSON.stringify({ count: candidates.length, candidates }, null, 2)}\n`,
      );
      return;
    }
    if (candidates.length === 0) {
      process.stdout.write(
        "Reverse 起票候補なし (red artifact / warn finding は全て対応 PLAN 紐付き済み)\n",
      );
      return;
    }
    for (const c of candidates) {
      process.stdout.write(
        `[${c.source}] ${c.subject} reverse=${c.reverseType} — ${c.reason}\n  → ${c.suggestedRoute}\n`,
      );
    }
  });

feedback
  .command("list")
  .description("emit/list harness.db feedback events")
  .option("--json", "JSON output")
  .option(
    "--emit",
    "compute feedback events from current findings and quality signals before listing",
  )
  .action((opts: { json?: boolean; emit?: boolean }) => {
    const db = openHarnessDb(defaultHarnessDbPath(process.cwd()), {
      repoRoot: process.cwd(),
    });
    try {
      if (opts.emit) emitFeedbackEvents(db);
      maintainFeedbackLifecycle(process.cwd(), db, "feedback-list");
      const result = selectTakeoverFeedback(db, { limit: 20 });
      if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(renderTakeoverFeedback(result));
    } finally {
      db.close();
    }
  });

feedback
  .command("ack <source-table> <source-id> <generation>")
  .description("acknowledge one active feedback lifecycle generation")
  .requiredOption("--reason <text>", "human acknowledgement reason")
  .option("--operation-id <id>", "idempotency key")
  .action((...args: [string, string, string, { reason: string; operationId?: string }]) => {
    const [sourceTable, sourceId, generation, opts] = args;
    if (!(["findings", "quality_signals", "feedback_events"] as string[]).includes(sourceTable)) {
      process.stderr.write("invalid feedback source table\n");
      process.exitCode = 1;
      return;
    }
    const repoRoot = process.cwd();
    const deps = nodeFeedbackLifecycleDeps(repoRoot);
    const operationId =
      opts.operationId ??
      `ack:${createHash("sha256")
        .update(`${sourceTable}:${sourceId}:${generation}:${opts.reason}`)
        .digest("hex")}`;
    const result = ackFeedback(
      {
        sourceTable: sourceTable as "findings" | "quality_signals" | "feedback_events",
        sourceId,
        sourceGeneration: generation,
        operationId,
        actor: "human",
        reason: opts.reason,
      },
      deps,
    );
    if (!result.ok) {
      process.stderr.write(`feedback ack rejected: ${result.reason ?? "unknown"}\n`);
      process.exitCode = 1;
      return;
    }
    const db = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
    try {
      migrate(db);
      projectFeedbackLifecycle(repoRoot, db);
    } finally {
      db.close();
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  });

feedback
  .command("intake")
  .description("emit read-only review/CI/conflict feedback intake routing report")
  .option("--json", "JSON output")
  .option("--event-json <json>", "review feedback event array JSON")
  .option("--session-json <json>", "known session array JSON")
  .action((opts: { json?: boolean; eventJson?: string; sessionJson?: string }) => {
    try {
      const events = parseJsonArrayOption<ReviewFeedbackEventInput>(opts.eventJson, "--event-json");
      const sessions = parseJsonArrayOption<ReviewFeedbackSessionRow>(
        opts.sessionJson,
        "--session-json",
      );
      const report = buildReviewFeedbackSessionIntakeReport(
        events.length > 0
          ? events
          : [
              {
                feedback_key: "ci:dry-run",
                kind: "ci_failure",
                source_url: "https://github.com/RetryYN/HELIX-HARNESS/actions/runs/dry-run",
                source_ref: "refs/heads/codex/helix-l3-pillar-descent",
                target_session_id: "session:dry-run",
                plan_id: "PLAN-L7-380-review-feedback-session-intake",
              },
            ],
        sessions.length > 0
          ? sessions
          : [
              {
                session_id: "session:dry-run",
                plan_id: "PLAN-L7-380-review-feedback-session-intake",
              },
            ],
        { sourceCommand: "helix feedback intake --json" },
      );
      process.exitCode = report.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `feedback intake: ${report.ok ? "ok" : "blocked"} routed=${report.routed_events.length} orphan=${report.orphan_count} duplicate=${report.duplicate_intake_count}\n`,
      );
      for (const finding of report.findings) {
        process.stdout.write(`  ${finding.severity}: ${finding.code}: ${finding.detail}\n`);
      }
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      if (opts.json) {
        process.stdout.write(
          `${JSON.stringify({ ok: false, error: message, source_command: "helix feedback intake --json" }, null, 2)}\n`,
        );
      } else process.stderr.write(`${message}\n`);
    }
  });

feedback
  .command("classify")
  .description(
    "停止後メッセージを分類。既定=managed pmo-haiku への分類リクエスト emit / --apply で結果記録",
  )
  .option("--text <text>", "対象テキスト (省略時 stdin)")
  .option("--session <id>", "session_id")
  .option("--plan <id>", "plan_id (省略時 branch/state から解決)")
  .option("--apply <json>", "ClassifyResult JSON を渡して recordFeedback (是正のみ記録)")
  .action((opts: { text?: string; session?: string; plan?: string; apply?: string }) => {
    const text = opts.text ?? readStdin();
    if (!opts.apply) {
      // 既定: 分類リクエストを emit (raw API なし、agent が pmo-haiku に渡す)
      process.stdout.write(`${emitClassifyRequest(text)}\n`);
      return;
    }
    let result: ClassifyResult;
    try {
      result = JSON.parse(opts.apply) as ClassifyResult;
    } catch {
      process.stderr.write("--apply は ClassifyResult JSON である必要があります\n");
      process.exitCode = 1;
      return;
    }
    const deps = nodeDeps(process.cwd(), gitBranch);
    const ctx: FeedbackCtx = {
      session_id: opts.session ?? "unknown",
      plan_id: opts.plan ?? resolveActivePlan(deps), // 省略時 state/branch から解決
      summary: text,
    };
    recordFeedback(result, ctx, deps);
    process.stdout.write(
      result.category === "feedback" && ctx.plan_id
        ? `recorded: feedback (attention=${result.attention})\n`
        : "skipped (mistake or plan_id 未解決)\n",
    );
  });

feedback
  .command("pending")
  .description("Recovery 起票候補 (recovery_proposed && 未対応) を出力。agent 起動時に参照")
  .option("--json", "JSON で出力")
  .action((opts: { json?: boolean }) => {
    const deps = nodeDeps(process.cwd(), gitBranch);
    const pending = pendingRecoveryProposals(deps);
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(pending, null, 2)}\n`);
      return;
    }
    if (pending.length === 0) {
      process.stdout.write("Recovery 起票候補なし\n");
      return;
    }
    for (const p of pending) {
      process.stdout.write(`[${p.attention}] ${p.plan_id} ${p.ts} — ${p.summary}\n`);
    }
  });

const setupCommand = program
  .command("setup")
  .description(
    "solo/team を検出・提案・確認して GitHub 設定を出し分け生成 (Phase 0-A/0-B、要件 §6.5)",
  )
  .option("--solo", "Phase 0-A (solo) を強制 (自動提案の上書き)")
  .option("--team", "Phase 0-B (team) を強制 (自動提案の上書き)")
  .option("--dry-run", "生成物一覧のみ表示 (書き込まない)")
  .option("--apply-branch-protection", "gh 認証/admin 権限を確認して branch protection を適用する")
  .option("--tl-team <slug>", "CODEOWNERS の TL team slug")
  .option("--qa-team <slug>", "CODEOWNERS の QA team slug")
  .option("--po-team <slug>", "CODEOWNERS の PO team slug");

type SetupCliOptions = {
  solo?: boolean;
  team?: boolean;
  dryRun?: boolean;
  applyBranchProtection?: boolean;
  packageRoot?: string;
  tlTeam?: string;
  qaTeam?: string;
  poTeam?: string;
  json?: boolean;
};

function setupArgsFromOptions(opts: SetupCliOptions): SetupArgs | null {
  if (opts.solo && opts.team) {
    process.stderr.write("--solo と --team は同時指定できません (どちらか一方)\n");
    process.exitCode = 1;
    return null;
  }
  const teamCount = [opts.tlTeam, opts.qaTeam, opts.poTeam].filter(Boolean).length;
  if (teamCount > 0 && teamCount < 3) {
    process.stderr.write(
      "--tl-team / --qa-team / --po-team は 3 つとも指定してください (CODEOWNERS の @TODO 混入防止)\n",
    );
    process.exitCode = 1;
    return null;
  }
  const phase = opts.solo ? "0-A" : opts.team ? "0-B" : undefined;
  const teams =
    teamCount === 3
      ? {
          tl: opts.tlTeam as string,
          qa: opts.qaTeam as string,
          po: opts.poTeam as string,
        }
      : undefined;
  return {
    ...(phase ? { phase } : {}),
    dryRun: Boolean(opts.dryRun),
    applyBranchProtection: Boolean(opts.applyBranchProtection),
    ...(teams ? { teams } : {}),
  };
}

setupCommand.action((opts: SetupCliOptions) => {
  const args = setupArgsFromOptions(opts);
  if (!args) return;
  const deps = nodeSetupDeps(process.cwd());
  const r = runSetup(args, deps);
  process.stdout.write(`phase: ${r.phase}${args.dryRun ? " (dry-run)" : ""}\n`);
  for (const w of r.written) process.stdout.write(`  ${args.dryRun ? "·" : "+"} ${w}\n`);
  process.stdout.write(
    `branch-protection: ${
      r.branchProtection.applied ? "applied" : `skipped (${r.branchProtection.reason})`
    }\n`,
  );
  process.stdout.write(
    "setup-scope: legacy solo/team adapter setup; HELIX project bootstrap は `helix setup project` を使用してください\n",
  );
  process.stdout.write(
    "completion-boundary: VSCode tasks / .helix project baseline / rename packet を生成しないため L14 completion evidence ではありません\n",
  );
  if (r.phase === "0-B" && r.branchProtection.reason === "emit-only") {
    process.stdout.write(
      "  → scripts/setup-branch-protection.sh は gh auth/admin preflight 後に remote apply できます。`--apply-branch-protection` は認証・権限不足なら理由付きで停止します\n",
    );
  }
});

setupCommand
  .command("project")
  .description("bootstrap a HELIX-ready VSCode project with adapters, local state, and tasks")
  .option("--solo", "Phase 0-A (solo) を強制")
  .option("--team", "Phase 0-B (team) を強制")
  .option("--dry-run", "生成物一覧のみ表示 (書き込まない)")
  .option("--apply-branch-protection", "gh 認証/admin 権限を確認して branch protection を適用する")
  .option("--package-root <path>", "consumer package root; defaults to repo root")
  .option("--tl-team <slug>", "CODEOWNERS の TL team slug")
  .option("--qa-team <slug>", "CODEOWNERS の QA team slug")
  .option("--po-team <slug>", "CODEOWNERS の PO team slug")
  .option("--json", "JSON output")
  .action((opts: SetupCliOptions) => {
    const inherited = setupCommand.opts<SetupCliOptions>();
    const merged = { ...inherited, ...opts };
    const args = setupArgsFromOptions(merged);
    if (!args) return;
    const repoRoot = process.cwd();
    const deps = nodeSetupDeps(
      repoRoot,
      merged.packageRoot ? join(repoRoot, merged.packageRoot) : undefined,
    );
    const r = runHelixProjectSetup(args, deps);
    if (merged.json) {
      process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `helix project setup: phase=${r.phase}${args.dryRun ? " dry-run=true" : ""}\n`,
    );
    for (const w of r.written) process.stdout.write(`  ${args.dryRun ? "·" : "+"} ${w}\n`);
    process.stdout.write(
      `import-report: ${
        r.importReport.requiresReview ? "review_required" : "ready"
      } (${r.importReport.nextRoute}) skipSubDocs=${r.importReport.skipSubDocs.length}\n`,
    );
    for (const record of r.importReport.skipSubDocs) {
      process.stdout.write(
        `skip-sub-doc: ${record.path} marker=${record.marker} route=${record.nextRoute} reason=${record.reason} gate=${record.followUpGate}\n`,
      );
    }
    const cliCheck = r.consumerReadiness.checks.find((check) => check.name === "helix-cli");
    process.stdout.write(
      `consumer-readiness: ok=${r.consumerReadiness.ok} mode=${r.consumerReadiness.mode} helix-cli=${cliCheck?.ok ?? false}\n`,
    );
    process.stdout.write(
      `post-setup-workflow: ${r.postSetupWorkflow.nextRoute} readiness=${r.postSetupWorkflow.readinessOk} gates=${r.postSetupWorkflow.unmetGates.length}\n`,
    );
    process.stdout.write(`verification-matrix: ${r.postSetupWorkflow.verificationMatrix.length}\n`);
    for (const action of r.postSetupWorkflow.nextActions) {
      process.stdout.write(`post-setup-next-action: ${action}\n`);
    }
    for (const blocker of r.postSetupWorkflow.blockedUntil) {
      process.stdout.write(`blocked-until: ${blocker}\n`);
    }
    for (const command of r.postSetupWorkflow.verificationCommands) {
      process.stdout.write(`verification-command: ${command}\n`);
    }
    for (const command of r.postSetupWorkflow.manualVerificationCommands) {
      process.stdout.write(`manual-verification-command: ${command}\n`);
    }
    for (const row of r.postSetupWorkflow.verificationMatrix) {
      process.stdout.write(
        `verification-check: ${row.phase} availability=${row.availability ?? "-"} requiresMaterializedPaths=${(row.requiresMaterializedPaths ?? []).join(",") || "-"} writePolicy=${row.writePolicy} command=${row.command} expected=${row.expected} evidence=${row.evidence}\n`,
      );
    }
    process.stdout.write(verificationSourceLines(r.postSetupWorkflow.verificationMatrix));
    process.stdout.write(
      `github-plan: ${r.githubPlan.schemaVersion} planOnly=${r.githubPlan.planOnly} requiredChecks=${r.githubPlan.requiredChecks.join(",")}\n`,
    );
    process.stdout.write(
      `github-pr: status=${r.githubPlan.pullRequestCreation.status} preferred=${r.githubPlan.pullRequestCreation.preferredSurface} connector=${r.githubPlan.pullRequestCreation.connectorFallback} failure=${r.githubPlan.pullRequestCreation.failureMode} command="${r.githubPlan.pullRequestCreation.draftPrCommandTemplate}"\n`,
    );
    process.stdout.write(
      `doctor-baseline: ${r.doctorBaseline.schemaVersion} completionClaimAllowed=${r.doctorBaseline.completionClaimAllowed} commands=${r.doctorBaseline.baselineCommands.length}\n`,
    );
    process.stdout.write(
      `vscode-task: ${r.vscode.tasksPath} (${r.vscode.doctorTask}, ${r.vscode.continuationTask})\n`,
    );
    process.stdout.write(
      `vscode-profile: ${r.vscode.profileName} command=${r.vscode.profileOpenCommand} source=${r.vscode.profileSourceUrl} checked=${r.vscode.profileSourceCheckedAt}\n`,
    );
    process.stdout.write(
      `identifier-transition: ${r.identifierTransition.currentCli}/${r.identifierTransition.currentStateDir}/${r.identifierTransition.currentArea} ${r.identifierTransition.status} remaining=${r.identifierTransition.remainingApprovalSurface} (${r.identifierTransition.cutoverPlanCommand})\n`,
    );
    process.stdout.write(
      `command-availability: ${r.commandAvailability.canonicalCommand} available=${r.commandAvailability.canonicalCommandAvailable} status=${r.commandAvailability.enablementStatus} (${r.commandAvailability.enablementPacketCommand})\n`,
    );
    process.stdout.write(
      `branch-protection: ${
        r.branchProtection.applied ? "applied" : `skipped (${r.branchProtection.reason})`
      }\n`,
    );
  });

const distribution = program.command("distribution").description("clean distribution planning");
distribution
  .command("plan")
  .description("emit the clean export, preflight, rollback, and contract plan")
  .option("--tag <tag>", "source/release tag", gitHead() ?? "unreleased")
  .option("--clean-repo <name>", "clean distribution repository", "RetryYN/HELIX-HARNESS-OS")
  .option("--package-root <path>", "consumer package root; defaults to repo root")
  .option("--json", "JSON output")
  .action((opts: { tag?: string; cleanRepo?: string; packageRoot?: string; json?: boolean }) => {
    const repoRoot = process.cwd();
    const detection = detectMode();
    let bunVersion: string | null = null;
    try {
      bunVersion = execFileSync("bun", ["--version"], {
        encoding: "utf8",
      }).trim();
    } catch {
      bunVersion = null;
    }
    const hasGit = spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;
    const hasGh = spawnSync("gh", ["--version"], { stdio: "ignore" }).status === 0;
    const hasHelixCli = spawnSync("helix", ["--version"], { stdio: "ignore" }).status === 0;
    const exportPlan = buildCleanDistributionPlan({
      paths: collectDistributionCandidatePaths(repoRoot),
      sourceTag: opts.tag,
      cleanRepo: opts.cleanRepo,
    });
    const packageRoot = opts.packageRoot ? join(repoRoot, opts.packageRoot) : repoRoot;
    const packageJsonText = existsSync(join(packageRoot, "package.json"))
      ? readFileSync(join(packageRoot, "package.json"), "utf8")
      : null;
    const previousProbe = process.env.HELIX_SETUP_SURFACE_PROBE;
    process.env.HELIX_SETUP_SURFACE_PROBE = "1";
    const packageSurfaceProbe = spawnSync("bun", ["run", "helix", "setup", "project", "--help"], {
      cwd: packageRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30_000,
    });
    if (previousProbe === undefined) delete process.env.HELIX_SETUP_SURFACE_PROBE;
    else process.env.HELIX_SETUP_SURFACE_PROBE = previousProbe;
    const packageSurfaceOutput =
      `${packageSurfaceProbe.stdout ?? ""}\n${packageSurfaceProbe.stderr ?? ""}`.trim();
    const packageSurfaceOk =
      packageSurfaceProbe.status === 0 &&
      packageSurfaceOutput.includes("--json") &&
      packageSurfaceOutput.includes("--dry-run");
    const readiness = buildConsumerReadinessPlan({
      bunVersion,
      hasGit,
      hasGh,
      hasHelixCli,
      hasHelixPackageScript: packageJsonDeclaresHelixScript(packageJsonText),
      hasTypecheckPackageScript: packageJsonDeclaresScript(packageJsonText, "typecheck"),
      hasTestPackageScript: packageJsonDeclaresScript(packageJsonText, "test"),
      hasBunLockfile:
        existsSync(join(packageRoot, "bun.lock")) || existsSync(join(packageRoot, "bun.lockb")),
      hasClaude: detection.claude,
      hasCodex: detection.codex,
      repoRoot,
      packageRoot,
      tag: opts.tag,
      distributionPackageSurface: {
        checked: true,
        ok: packageSurfaceOk,
        source: "package-script-probe",
        tag: opts.tag,
        evidence: packageSurfaceOk
          ? "`bun run helix setup project --help` exposed --dry-run and --json from distribution packageRoot"
          : `\`bun run helix setup project --help\` did not expose required setup surface (status ${packageSurfaceProbe.status ?? 1}): ${packageSurfaceOutput.slice(0, 240)}`,
        latestObservedStatus: packageSurfaceOk
          ? "distribution packageRoot generated CI setup command exposes dry-run JSON surface"
          : "distribution packageRoot generated CI setup command surface failed",
      },
    });
    const output = {
      ok: exportPlan.ok && readiness.ok,
      export: exportPlan,
      readiness,
      actualCutRequiresPoApproval: true,
    };
    process.exitCode = output.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `distribution plan: ${output.ok ? "ok" : "blocked"} channel=${exportPlan.channel} tag=${exportPlan.sourceTag}\n`,
    );
    process.stdout.write(`  clean-repo: ${exportPlan.cleanRepo}\n`);
    process.stdout.write(`  artifact-paths: ${exportPlan.artifactPaths.length}\n`);
    process.stdout.write(`  excluded-paths: ${exportPlan.excludedPaths.length}\n`);
    process.stdout.write(
      `  readiness: ${readiness.ok ? "ok" : "blocked"} mode=${readiness.mode}\n`,
    );
    process.stdout.write("  actual-cut: requires PO approval\n");
  });

distribution
  .command("sync-plan")
  .description("emit a non-destructive clean distribution repository sync plan")
  .option("--tag <tag>", "source/release tag", gitHead() ?? "unreleased")
  .option("--clean-repo <name>", "clean distribution repository", "RetryYN/HELIX-HARNESS-OS")
  .option("--branch <name>", "distribution repository target branch", "main")
  .option("--staging-dir <path>", "local distribution staging clone path")
  .option("--json", "JSON output")
  .action(
    (opts: {
      tag?: string;
      cleanRepo?: string;
      branch?: string;
      stagingDir?: string;
      json?: boolean;
    }) => {
      const repoRoot = process.cwd();
      const sourcePaths = collectDistributionCandidatePaths(repoRoot);
      const exportPlan = buildCleanDistributionPlan({
        paths: sourcePaths,
        sourceTag: opts.tag,
        cleanRepo: opts.cleanRepo,
      });
      const stagingDir = opts.stagingDir
        ? isAbsolute(opts.stagingDir)
          ? opts.stagingDir
          : join(repoRoot, opts.stagingDir)
        : join(repoRoot, ".helix", "pack-sync", exportPlan.sourceTag);
      const sync = buildPackSyncPlan({
        exportPlan,
        sourcePaths,
        stagingDir,
        branch: opts.branch,
      });
      const output = {
        ok: sync.ok,
        export: exportPlan,
        sync,
        actualRemoteMutationRequiresPoApproval: true,
      };
      process.exitCode = sync.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `distribution sync-plan: ${sync.ok ? "ok" : "blocked"} tag=${sync.sourceTag}\n`,
      );
      process.stdout.write(`  clean-repo: ${sync.cleanRepo}\n`);
      process.stdout.write(`  staging-dir: ${sync.stagingDir}\n`);
      process.stdout.write(`  copy-plan: ${sync.copyPlan.length} files\n`);
      process.stdout.write("  remote mutation: requires PO approval; commands were not executed\n");
    },
  );

distribution
  .command("sync-stage")
  .description("materialize clean distribution artifacts into a local staging directory")
  .option("--tag <tag>", "source/release tag", gitHead() ?? "unreleased")
  .option("--clean-repo <name>", "clean distribution repository", "RetryYN/HELIX-HARNESS-OS")
  .option("--branch <name>", "distribution repository target branch", "main")
  .option("--out <dir>", "local staging directory", ".helix/pack-stage")
  .option("--json", "JSON output")
  .action(
    (opts: { tag?: string; cleanRepo?: string; branch?: string; out?: string; json?: boolean }) => {
      const repoRoot = process.cwd();
      const sourcePaths = collectDistributionCandidatePaths(repoRoot);
      const exportPlan = buildCleanDistributionPlan({
        paths: sourcePaths,
        sourceTag: opts.tag,
        cleanRepo: opts.cleanRepo,
      });
      const outDir = opts.out
        ? isAbsolute(opts.out)
          ? opts.out
          : join(repoRoot, opts.out)
        : join(repoRoot, ".helix", "pack-stage");
      const sync = buildPackSyncPlan({
        exportPlan,
        sourcePaths,
        stagingDir: outDir,
        branch: opts.branch,
      });
      mkdirSync(outDir, { recursive: true });
      const plannedArtifacts = new Set(exportPlan.artifactPaths);
      const unmanagedExistingPaths = collectDistributionCandidatePaths(outDir).filter(
        (path) => !plannedArtifacts.has(path) && !path.startsWith(".git/"),
      );
      let copyError: string | null = null;
      if (exportPlan.ok) {
        try {
          for (const rel of exportPlan.artifactPaths) {
            const sourceRel = cleanDistributionSourcePath(rel, sourcePaths);
            copyCleanDistributionArtifact({
              sourceRoot: repoRoot,
              sourcePath: sourceRel,
              targetRoot: outDir,
              artifactPath: rel,
            });
          }
        } catch (error) {
          copyError = error instanceof Error ? error.message : String(error);
        }
      }
      const manifest = join(outDir, ".helix-pack-sync-manifest.json");
      const output = {
        ok: exportPlan.ok && copyError === null && unmanagedExistingPaths.length === 0,
        export: exportPlan,
        sync,
        stage: {
          outDir,
          manifest,
          copiedArtifacts:
            copyError === null && exportPlan.ok ? exportPlan.artifactPaths.length : 0,
          unmanagedExistingPaths,
          copyError,
          destructiveRemoteMutation: false,
          actualRemoteMutationRequiresPoApproval: true,
        },
      };
      writeFileSync(manifest, `${JSON.stringify(output, null, 2)}\n`, "utf8");
      process.exitCode = output.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `distribution sync-stage: ${output.ok ? "ok" : "blocked"} tag=${exportPlan.sourceTag}\n`,
      );
      process.stdout.write(`  out: ${outDir}\n`);
      process.stdout.write(`  copied-artifacts: ${output.stage.copiedArtifacts}\n`);
      process.stdout.write(`  unmanaged-existing: ${unmanagedExistingPaths.length}\n`);
      process.stdout.write(
        "  remote mutation: requires PO approval; no push/release was executed\n",
      );
    },
  );

distribution
  .command("sync-pack")
  .description("update a local distribution checkout with clean artifacts; never commits or pushes")
  .option("--tag <tag>", "source/release tag", gitHead() ?? "unreleased")
  .option("--clean-repo <name>", "clean distribution repository", "RetryYN/HELIX-HARNESS-OS")
  .option("--branch <name>", "distribution repository target branch", "main")
  .requiredOption("--repo-dir <dir>", "local distribution repository checkout to update")
  .option("--prune-local", "remove local files in repo-dir that are not part of the clean set")
  .option("--json", "JSON output")
  .action(
    (opts: {
      tag?: string;
      cleanRepo?: string;
      branch?: string;
      repoDir: string;
      pruneLocal?: boolean;
      json?: boolean;
    }) => {
      const repoRoot = process.cwd();
      const repoDir = isAbsolute(opts.repoDir) ? opts.repoDir : join(repoRoot, opts.repoDir);
      const repoExists = existsSync(repoDir);
      const sourcePaths = collectDistributionCandidatePaths(repoRoot);
      const exportPlan = buildCleanDistributionPlan({
        paths: sourcePaths,
        sourceTag: opts.tag,
        cleanRepo: opts.cleanRepo,
      });
      const sync = buildPackSyncPlan({
        exportPlan,
        sourcePaths,
        stagingDir: repoDir,
        branch: opts.branch,
      });
      const plannedArtifacts = new Set(exportPlan.artifactPaths);
      const existingBefore = repoExists
        ? collectDistributionCandidatePaths(repoDir).filter((path) => !plannedArtifacts.has(path))
        : [];
      const prunedPaths: string[] = [];
      let copyError: string | null = null;
      let pruneError: string | null = null;

      if (repoExists && opts.pruneLocal) {
        try {
          for (const rel of existingBefore) {
            rmSync(join(repoDir, ...rel.split("/")), { force: true });
            prunedPaths.push(rel);
          }
        } catch (error) {
          pruneError = error instanceof Error ? error.message : String(error);
        }
      }

      if (repoExists && exportPlan.ok && pruneError === null) {
        try {
          for (const rel of exportPlan.artifactPaths) {
            const sourceRel = cleanDistributionSourcePath(rel, sourcePaths);
            copyCleanDistributionArtifact({
              sourceRoot: repoRoot,
              sourcePath: sourceRel,
              targetRoot: repoDir,
              artifactPath: rel,
            });
          }
        } catch (error) {
          copyError = error instanceof Error ? error.message : String(error);
        }
      }

      const unmanagedExistingPaths =
        repoExists && pruneError === null
          ? collectDistributionCandidatePaths(repoDir).filter((path) => !plannedArtifacts.has(path))
          : existingBefore;
      const manifestDir = join(repoRoot, ".helix", "pack-sync");
      mkdirSync(manifestDir, { recursive: true });
      const manifest = join(
        manifestDir,
        `${exportPlan.sourceTag.replace(/[^A-Za-z0-9._-]+/g, "-")}.sync-pack.json`,
      );
      const output = {
        ok:
          repoExists &&
          exportPlan.ok &&
          pruneError === null &&
          copyError === null &&
          unmanagedExistingPaths.length === 0,
        export: exportPlan,
        sync,
        pack: {
          repoDir,
          repoExists,
          manifest,
          copiedArtifacts:
            repoExists && exportPlan.ok && pruneError === null && copyError === null
              ? exportPlan.artifactPaths.length
              : 0,
          pruneLocal: Boolean(opts.pruneLocal),
          prunedPaths,
          unmanagedExistingPaths,
          pruneError,
          copyError,
          localGitMutationExecuted: false,
          destructiveRemoteMutation: false,
          actualRemoteMutationRequiresPoApproval: true,
          nextCommands: [
            `git -C ${repoDir} status --short`,
            ...gitAddPathspecCommands(repoDir, exportPlan.artifactPaths),
            `git -C ${repoDir} commit -m "chore: sync clean distribution ${exportPlan.sourceTag}"`,
            `git -C ${repoDir} push origin ${opts.branch ?? "main"}`,
          ],
        },
      };
      writeFileSync(manifest, `${JSON.stringify(output, null, 2)}\n`, "utf8");
      process.exitCode = output.ok ? 0 : 1;
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
        return;
      }
      process.stdout.write(
        `distribution sync-pack: ${output.ok ? "ok" : "blocked"} tag=${exportPlan.sourceTag}\n`,
      );
      process.stdout.write(`  repo-dir: ${repoDir}\n`);
      process.stdout.write(`  copied-artifacts: ${output.pack.copiedArtifacts}\n`);
      process.stdout.write(`  unmanaged-existing: ${unmanagedExistingPaths.length}\n`);
      process.stdout.write(`  pruned-local: ${prunedPaths.length}\n`);
      process.stdout.write(
        "  git commit/push: requires explicit human approval; commands were not executed\n",
      );
    },
  );

distribution
  .command("release-plan")
  .description("emit non-destructive git tag and gh release commands for approved publishing")
  .requiredOption("--tag <tag>", "release tag, e.g. v0.1.0")
  .option("--repo <name>", "GitHub repository for release publication", "RetryYN/HELIX-HARNESS-OS")
  .option("--json", "JSON output")
  .action((opts: { tag: string; repo?: string; json?: boolean }) => {
    const plan = buildReleasePublicationPlan({
      tag: opts.tag,
      repo: opts.repo ?? "RetryYN/HELIX-HARNESS-OS",
      dryRun: true,
    });
    process.exitCode = plan.ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `distribution release-plan: ${plan.ok ? "ok" : "blocked"} tag=${plan.tag} repo=${plan.repo}\n`,
    );
    for (const command of plan.commands) process.stdout.write(`  ${command}\n`);
    process.stdout.write("  publish: requires PO approval; commands were not executed\n");
  });

distribution
  .command("package")
  .description("create a local clean tarball and sha256 checksum without publishing")
  .option("--tag <tag>", "source/release tag", gitHead() ?? "unreleased")
  .option("--clean-repo <name>", "clean distribution repository", "RetryYN/HELIX-HARNESS-OS")
  .option("--out <dir>", "output directory for local release artifacts", ".helix/release")
  .option("--json", "JSON output")
  .action((opts: { tag?: string; cleanRepo?: string; out?: string; json?: boolean }) => {
    const repoRoot = process.cwd();
    const exportPlan = buildCleanDistributionPlan({
      paths: collectDistributionCandidatePaths(repoRoot),
      sourceTag: opts.tag,
      cleanRepo: opts.cleanRepo,
    });
    const outDir = opts.out
      ? isAbsolute(opts.out)
        ? opts.out
        : join(repoRoot, opts.out)
      : join(repoRoot, ".helix", "release");
    const artifactStem = exportPlan.sourceTag.replace(/[^A-Za-z0-9._-]+/g, "-");
    const tarball = join(outDir, `${artifactStem}.tar.gz`);
    const checksum = `${tarball}.sha256`;
    const manifest = join(outDir, `${artifactStem}.manifest.json`);
    const signature = `${tarball}.sig`;
    const stage = mkdtempSync(join(tmpdir(), "helix-clean-package-"));
    let tarResult: ReturnType<typeof spawnSync> | null = null;
    try {
      mkdirSync(outDir, { recursive: true });
      const sourcePaths = collectDistributionCandidatePaths(repoRoot);
      for (const rel of exportPlan.artifactPaths) {
        const sourceRel = cleanDistributionSourcePath(rel, sourcePaths);
        copyCleanDistributionArtifact({
          sourceRoot: repoRoot,
          sourcePath: sourceRel,
          targetRoot: stage,
          artifactPath: rel,
        });
      }
      tarResult = spawnSync("tar", ["-czf", basename(tarball), "-C", stage, "."], {
        cwd: outDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      if (tarResult.status === 0) {
        const digest = createHash("sha256").update(readFileSync(tarball)).digest("hex");
        writeFileSync(checksum, `${digest}  ${basename(tarball)}\n`, "utf8");
        writeFileSync(
          manifest,
          `${JSON.stringify(
            {
              ok: exportPlan.ok,
              sourceTag: exportPlan.sourceTag,
              cleanRepo: exportPlan.cleanRepo,
              tarball,
              checksum,
              signature,
              signatureRequired: true,
              signatureCreated: false,
              artifactCount: exportPlan.artifactPaths.length,
              missingRequired: exportPlan.missingRequired,
              denylistViolations: exportPlan.denylistViolations,
            },
            null,
            2,
          )}\n`,
          "utf8",
        );
      }
    } finally {
      rmSync(stage, { recursive: true, force: true });
    }
    const ok =
      exportPlan.ok && tarResult?.status === 0 && existsSync(tarball) && existsSync(checksum);
    const output = {
      ok,
      export: exportPlan,
      artifacts: {
        tarball,
        checksum,
        manifest,
        signature,
        signatureRequired: true,
        signatureCreated: false,
      },
      tar: {
        exitCode: tarResult?.status ?? null,
        stderr: tarResult?.stderr ?? "",
      },
      actualPublishRequiresPoApproval: true,
    };
    process.exitCode = ok ? 0 : 1;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `distribution package: ${ok ? "ok" : "blocked"} tag=${exportPlan.sourceTag}\n`,
    );
    if (!ok && tarResult !== null && tarResult.status !== 0) {
      const stderrHead = String(tarResult.stderr ?? "")
        .split(/\r?\n/, 1)[0]
        .trim();
      process.stdout.write(
        `  tar: error exit=${tarResult.status ?? "null"}${stderrHead ? ` (${stderrHead})` : ""} - artifacts not created\n`,
      );
    }
    process.stdout.write(`  tarball: ${tarball}\n`);
    process.stdout.write(`  checksum: ${checksum}\n`);
    process.stdout.write("  signature: required but not created (external signing boundary)\n");
    process.stdout.write("  publish: requires PO approval\n");
  });

program.parseAsync(process.argv).catch((e: unknown) => {
  process.stderr.write(`${String(e)}\n`);
  process.exitCode = 1;
});
