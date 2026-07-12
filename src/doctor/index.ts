/**
 * 統合検証 doctor (requirements_v1.2 §7 / §7.8.5)。
 * 多数の検出器 (back-fill / review-evidence / asset-drift / cycle-p4-verification / roadmap 等) を集約し、
 * gate 判定群を runDoctor.ok に連動させて fail-close する。agent-slots は warning surface。
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, isAbsolute, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { analyzeHandoverResurrectionShadowRepo } from "../audit/handover-resurrection-source";
import { loadRequirementsBindingConfig } from "../config/requirements-binding";
import {
  actionBindingApprovalReadinessMessages,
  actionBindingApprovalVerificationCommandViolations,
  analyzeActionBindingApprovalReadiness,
  buildActionBindingApprovalPackets,
  loadActionBindingApprovalReadinessInput,
} from "../lint/action-binding-approval-readiness";
import {
  agentModelSsotMessages,
  analyzeAgentModelSsot,
  loadAgentModelEntries,
  loadCanonicalModelIds,
} from "../lint/agent-model-ssot";
import {
  allowlistSyncMessages,
  analyzeAllowlistSync,
  loadAllowlistSyncInput,
} from "../lint/allowlist-sync";
import { analyzeAssetDrift, assetDriftMessages, loadAssetDriftInput } from "../lint/asset-drift";
import { analyzeBackfill, backfillMessages, loadBackfillDocs } from "../lint/backfill-pairing";
import { analyzeBranchKind, branchKindMessages, loadBranchKindInput } from "../lint/branch-kind";
import {
  analyzeChangeImpact,
  analyzeChangeSetIntegrity,
  changeImpactMessages,
  changeSetIntegrityMessages,
  isGitRepository,
  loadChangedFiles,
} from "../lint/change-impact";
import {
  analyzeClosureAuthorityRegistry,
  closureAuthorityRegistryMessages,
  loadClosureAuthorityRegistryLintInput,
} from "../lint/closure-authority-registry";
import {
  analyzeCodexHookAdapter,
  codexHookAdapterMessages,
  loadCodexHookAdapterInput,
} from "../lint/codex-hook-adapter";
import { codexHookTrustMessages, loadCodexHookTrust } from "../lint/codex-hook-trust";
import {
  analyzeCodingRules,
  codingRulesMessages,
  loadCodingRuleDocs,
  loadCodingRulePolicy,
  loadCodingWorkflowDocs,
} from "../lint/coding-rules";
import {
  analyzeCompletionDecisionPacket,
  analyzeCompletionReviewBundle,
  completionDecisionPacketMessages,
  completionReviewBundleMessages,
  loadCompletionDecisionPacketInput,
  loadCompletionReviewBundleInput,
  recordTemplateContractViolations,
} from "../lint/completion-decision-packet";
import {
  analyzeCutoverReadiness,
  cutoverReadinessMessages,
  loadCutoverReadinessInput,
} from "../lint/cutover-readiness";
import {
  analyzeCycleP4Verification,
  cycleP4VerificationMessages,
  loadCycleP4VerificationDocs,
} from "../lint/cycle-p4-verification";
import {
  analyzeDbProjectionCoverage,
  dbProjectionCoverageMessages,
  loadDbProjectionRequirements,
} from "../lint/db-projection-coverage";
import {
  analyzeDbProjectionIngestion,
  dbProjectionIngestionMessages,
} from "../lint/db-projection-ingestion";
import { analyzeDddTddRules, dddTddRulesMessages, loadDddTddInputs } from "../lint/ddd-tdd-rules";
import {
  analyzeDependencyDrift,
  type DependencyDriftResult,
  dependencyDriftMessages,
  expandRegressionScope,
  loadDependencyDriftInput,
  regressionExpansionMessages,
} from "../lint/dependency-drift";
import {
  analyzeDescentObligations,
  descentObligationMessages,
  filterSubstanceVerifiedAdvisories,
  loadDeferLedger,
  loadDescentAdjacency,
  loadFrUnitCoverageOracles,
  loadTraceKeyedArtifacts,
} from "../lint/descent-obligation";
import {
  analyzeDesignCoverage,
  designCoverageMessages,
  loadDesignCoverageInput,
} from "../lint/design-coverage";
import {
  analyzeDesignLanguage,
  designLanguageMessages,
  loadDesignLanguageDocs,
} from "../lint/design-language";
import { scanDigestInventory } from "../lint/digest-inventory";
import { analyzeDocConsistency, loadDocConsistencyDocs } from "../lint/doc-consistency";
import {
  analyzeDriveDbRegistration,
  driveDbRegistrationMessages,
} from "../lint/drive-db-registration";
import {
  analyzeDriveModelPassage,
  driveModelPassageMessages,
  loadDriveModelPassageDocs,
} from "../lint/drive-model-passage";
import { analyzeEntityCoverage, loadBusiness as loadEntityBusiness } from "../lint/entity-coverage";
import {
  analyzeFeedbackLog,
  feedbackLogMessages,
  loadFeedbackLogInput,
} from "../lint/feedback-log";
import {
  analyzeForwardConvergence,
  forwardConvergenceMessages,
  legacyAuditDriftMessages,
  loadConvergenceDocs,
  loadLegacyAuditDrift,
} from "../lint/forward-convergence";
import { analyzeFrRegistry, loadFrDocs as loadFrRegistryDocs } from "../lint/fr-registry-audit";
import {
  analyzeFrRoadmapCoverageWithRoot,
  frRoadmapCoverageMessages,
  loadFrRoadmapCoverageDocs,
} from "../lint/fr-roadmap-coverage";
import {
  analyzeFrontendDesignCoverage,
  frontendDesignCoverageMessages,
  loadFrontendDesignCoverageInput,
} from "../lint/frontend-design-coverage";
import {
  analyzeG8IntegrationWorkflow,
  canLoadG8IntegrationWorkflowInput,
  g8IntegrationWorkflowMessages,
  loadG8IntegrationWorkflowInput,
} from "../lint/g8-integration-workflow";
import {
  analyzeG9SystemWorkflow,
  canLoadG9SystemWorkflowInput,
  g9SystemWorkflowMessages,
  loadG9SystemWorkflowInput,
} from "../lint/g9-system-workflow";
import {
  analyzeG10UxWorkflow,
  canLoadG10UxWorkflowInput,
  g10UxWorkflowMessages,
  loadG10UxWorkflowInput,
} from "../lint/g10-ux-workflow";
import { analyzeGateConfirm, gateConfirmMessages, loadGateConfirmDocs } from "../lint/gate-confirm";
import { checkGreenCommandDigests } from "../lint/green-command-digest";
import { resurrectionMessages } from "../lint/handover-resurrection";
import {
  analyzeHandoverRetirementInventory,
  handoverRetirementInventoryMessages,
} from "../lint/handover-retirement";
import {
  buildIdentifierRenameCutoverPlan,
  identifierRenameRunbookCommandViolations,
  identifierRenameStateBackupManifestViolations,
  identifierRenameVerificationCommandViolations,
} from "../lint/identifier-rename";
import {
  analyzeImplPlanTrace,
  implPlanTraceMessages,
  loadImplPlanTraceInput,
} from "../lint/impl-plan-trace";
import {
  analyzeImprovementBacklog,
  loadBacklog as loadImprovementBacklog,
} from "../lint/improvement-backlog";
import {
  analyzeJudgmentCoreCoverage,
  judgmentCoreCoverageMessages,
  loadJudgmentCoreCoverageInput,
} from "../lint/judgment-core-coverage";
import {
  analyzeL1L2Consistency,
  l1L2ConsistencyMessages,
  loadL1L2ConsistencyInput,
} from "../lint/l1-l2-consistency";
import {
  analyzeL6Completion,
  canLoadL6CompletionInputs,
  l6CompletionMessages,
  loadL6CompletionInputs,
} from "../lint/l6-completion";
import {
  analyzeL6FrCoverage,
  l6FrCoverageMessages,
  loadL6FrCoverageDocs,
} from "../lint/l6-fr-coverage";
import {
  analyzeL7Completion,
  l7CompletionMessages,
  loadL7CompletionDocs,
} from "../lint/l7-completion";
import {
  analyzeL14CloseAudit,
  l14CloseAuditMessages,
  loadL14CloseAuditInput,
} from "../lint/l14-close-audit";
import {
  analyzeLeftArmCarryLog,
  leftArmCarryLogMessages,
  loadLeftArmCarryLogInput,
} from "../lint/left-arm-carry-log";
import { analyzeLintWiring, lintWiringMessages, loadLintWiringInput } from "../lint/lint-wiring";
import {
  analyzeMergedPlanStatus,
  loadMergedPlanStatusInput,
  mergedPlanStatusMessages,
} from "../lint/merged-plan-status";
import { analyzeModuleDrift, loadModuleDocs, moduleDriftMessages } from "../lint/module-drift";
import {
  analyzeObjectiveEvidenceAudit,
  loadObjectiveEvidenceAuditInput,
  objectiveEvidenceAuditMessages,
} from "../lint/objective-evidence-audit";
import {
  analyzeOracleTestTrace,
  loadOracleTestTraceInput,
  oracleTestTraceMessages,
} from "../lint/oracle-test-trace";
import { requiredRecordsForBlockers } from "../lint/outstanding";
import {
  analyzePlaceholderDeps,
  loadPlaceholderDepsDocs,
  placeholderDepsMessages,
} from "../lint/placeholder-deps";
import {
  analyzePlanArtifactExistence,
  loadPlanArtifactExistenceInput,
  planArtifactExistenceMessages,
} from "../lint/plan-artifact-existence";
import {
  analyzePlanBodySubstance,
  loadPlanBodySubstanceInput,
  planBodySubstanceMessages,
} from "../lint/plan-body-substance";
import {
  analyzePlanCompletionDrift,
  loadPlanCompletionDriftInput,
  planCompletionDriftMessages,
} from "../lint/plan-completion-drift";
import {
  analyzePlanDescent,
  loadPlanDescentBaseline,
  loadPlanDescentDocs,
  planDescentMessages,
} from "../lint/plan-descent";
import { analyzePlanDod, loadPlanDodDocs, planDodMessages } from "../lint/plan-dod";
import {
  analyzePlanEntryRouting,
  loadPlanEntryRoutingBaseline,
  planEntryRoutingMessages,
} from "../lint/plan-entry-routing";
import { checkPlanSpecificVpairBindings } from "../lint/plan-specific-vpair-binding";
import {
  analyzePlanSupersession,
  loadSupersedePlans,
  planSupersessionMessages,
} from "../lint/plan-supersession";
import {
  analyzeProjectHooks,
  loadProjectHookDocs,
  projectHookMessages,
} from "../lint/project-hook";
import { analyzePropagation, loadPropagationDocs, propagationMessages } from "../lint/propagation";
import {
  analyzeProposalDocumentCoverage,
  loadProposalDocumentCoverageLintInput,
  proposalDocumentCoverageMessages,
} from "../lint/proposal-document-coverage";
import {
  analyzeReadability,
  loadRuntimeArtifactReadabilityDocs,
  loadSystemReadabilityDocs,
  readabilityMessages,
  runtimeReadabilityMessages,
} from "../lint/readability";
import {
  analyzeRepositoryNamePaths,
  loadRepositoryNamePathsInput,
  repositoryNamePathsMessages,
} from "../lint/repository-name-paths";
import {
  analyzeReviewEvidence,
  loadReviewPlans,
  reviewEvidenceMessages,
} from "../lint/review-evidence";
import {
  analyzeRightArmGatePlanning,
  loadRightArmGatePlanningInput,
  rightArmGatePlanningMessages,
} from "../lint/right-arm-gate-planning";
import {
  analyzeRightArmVerificationStrategy,
  loadRightArmVerificationStrategyInput,
  rightArmVerificationStrategyMessages,
} from "../lint/right-arm-verification-strategy";
import {
  analyzeL7FeaturePackCoverage,
  analyzeProgramCoverage,
  checkSpanExistence,
  computeGateProgress,
  computeProgramRollup,
  l7FeaturePackCoverageMessages,
  loadRoadmaps,
  PARKED_BANDS,
  programCoverageMessages,
} from "../lint/roadmap-registry";
import {
  analyzeRuleAutomationClosure,
  loadRuleAutomationClosureDocs,
  ruleAutomationClosureMessages,
} from "../lint/rule-automation-closure";
import { analyzeRuleDrift, loadRuleAdapterDocs, ruleDriftMessages } from "../lint/rule-drift";
import {
  analyzeRuntimePortability,
  loadRuntimePortabilityDocs,
  runtimePortabilityMessages,
} from "../lint/runtime-portability";
import {
  analyzeS4DecisionReadiness,
  buildS4DecisionPackets,
  loadS4DecisionReadinessInput,
  s4DecisionReadinessMessages,
  s4DecisionVerificationCommandViolations,
} from "../lint/s4-decision-readiness";
import {
  analyzeScreenImplPairFreeze,
  loadScreenImplPairFreezeInput,
  screenImplPairFreezeMessages,
} from "../lint/screen-impl-pair-freeze";
import {
  analyzeScrumReverse,
  loadReverseSeedMarkers,
  loadSrPlans,
  scrumReverseMessages,
} from "../lint/scrum-reverse";
import {
  analyzeSecretScan,
  loadSecretScanArtifacts,
  secretScanMessages,
} from "../lint/secret-scan";
import {
  analyzeSemanticFrontierConsistency,
  loadSemanticFrontierConsistencyInput,
  semanticFrontierConsistencyMessages,
} from "../lint/semantic-frontier-consistency";
import { fmValue, parseMarkdownFrontmatter } from "../lint/shared";
import {
  analyzeSkillAssignments,
  loadSkillAssignmentDocs,
  skillAssignmentMessages,
} from "../lint/skill-assignment";
import {
  analyzeSkillQuality,
  loadSkillQualityInput,
  skillQualityMessages,
} from "../lint/skill-quality";
import {
  analyzeSubDocCatalogDrift,
  loadSubDocCatalogDriftInput,
  subDocCatalogDriftMessages,
} from "../lint/sub-doc-catalog-drift";
import {
  analyzeSubDocSectionStructure,
  loadSubDocSectionStructureInput,
  subDocSectionStructureMessages,
} from "../lint/sub-doc-section-structure";
import {
  analyzeTelemetryClosure,
  loadTelemetryClosureDocs,
  telemetryClosureMessages,
} from "../lint/telemetry-closure";
import {
  analyzeToolchainPin,
  loadToolchainPinInput,
  toolchainPinMessages,
} from "../lint/toolchain-pin";
import {
  analyzeTrackedCanonical,
  loadTrackedCanonicalInput,
  trackedCanonicalMessages,
} from "../lint/tracked-canonical";
import {
  analyzeTriageDecisionIntegrity,
  loadTriageDecisionIntegrityInput,
  triageDecisionIntegrityMessages,
} from "../lint/triage-decision-integrity";
import {
  analyzeVerificationProfileGate,
  loadVerificationRecommendation,
  verificationProfileGateMessages,
} from "../lint/verification-profile";
import {
  analyzeVerifierProviderMismatch,
  loadLoopIterationFiles,
  verifierProviderMismatchMessages,
} from "../lint/verifier-provider-mismatch";
import {
  analyzeVersionUpReadiness,
  buildVersionUpActivationPackets,
  loadVersionUpReadinessInput,
  versionUpActivationVerificationCommandViolations,
  versionUpReadinessMessages,
} from "../lint/version-up-readiness";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  RENAME_PLAN_PACKET_COMMAND,
  S4_DECISION_PACKET_COMMAND,
  VERSION_UP_ACTIVATION_PACKET_COMMAND,
} from "../lint/workflow-decision-packets";
import {
  auditToolContractRegistry,
  toolContractRegistryMessages,
} from "../orchestration/tool-contract";
import type { LintResult } from "../plan/lint";
import { lintPlan, lintPlanWithGate } from "../plan/lint";
import { SUBAGENT_ALLOWLIST } from "../runtime/agent-guard";
import {
  type AgentSlotsDeps,
  DEFAULT_STALE_MINUTES,
  listActiveSlots,
  listStaleSlots,
  loadSlots,
  peakParallel,
} from "../runtime/agent-slots";
import { detectMode } from "../runtime/detect";
import { inspectMemoryCommitHygiene } from "../runtime/memory-commit-hygiene";
import {
  buildSummarySurfaceCommandAudit,
  buildSummarySurfaceContractPayloads,
} from "../runtime/summary-surface-audit";
import { teamDefinitionSchema } from "../schema/team";
import {
  analyzeConsumerCiWorkflowContract,
  analyzeConsumerEscalationWorkflowContract,
  branchProtectionScriptIsApplyCapable,
  CONSUMER_CI_RUN_COMMANDS,
  CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS,
  CONSUMER_VSCODE_TASK_COMMANDS,
  consumerClaudeHookSettingsMatchContract,
  consumerCodexConfigEnablesHooks,
  consumerCodexHookSettingsMatchContract,
} from "../setup/index";
import {
  CONSUMER_CLAUDE_AGENT_NAMES,
  CONSUMER_CLAUDE_COMMAND_NAMES,
  CONSUMER_TEAM_DEFINITION_PATH,
} from "../setup/templates";
import {
  buildProjectClosureApplyPlan,
  buildProjectClosureEvidencePlan,
  buildProjectClosureOverview,
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
  buildProjectDriveModelReport,
  buildProjectRecoveryPlan,
  buildProjectRoadmapCurrentReport,
} from "../state-db/current-location";
import { loadOrBuildDriveDbRegistrationStats } from "../state-db/drive-registration";
import {
  type GuardrailDecisionInput,
  inspectGuardrailInvariants,
} from "../state-db/guardrail-invariants";
import {
  defaultHarnessDbPath,
  type HarnessDb,
  openHarnessDb,
  openHarnessDbReadOnly,
} from "../state-db/index";
import { rowCounts } from "../state-db/migration";
import { loadPlanEntryRoutingDocsFromDb } from "../state-db/plan-entry-routing-input";
import { projectTokenUsage, rebuildHarnessDb } from "../state-db/projection-writer";
import {
  analyzeRefactorCandidates,
  candidateRank,
  loadRefactorCandidateInputs,
} from "../state-db/refactor-candidates";
import { loadRuntimeSessionUsage } from "../state-db/token-tracker";
import { buildVisualizationSnapshot } from "../state-db/visualization-read-model";
import { buildVisualizationViewModel } from "../state-db/visualization-view-model";
import { buildVmodelFitReport } from "../state-db/vmodel-fit";
import { classifyProposalDocumentCoverage } from "../task/classify";
import { buildTeamRunPlan } from "../team/run";
import {
  analyzePairFreeze,
  analyzeVerificationGroups,
  loadPairDocs,
  loadVerificationPlanEvidence,
  pairFreezeMessages,
  verificationGroupMessages,
  verificationGroupsOk,
} from "../vmodel/lint";
import {
  analyzeVmodelZipManifest,
  VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE,
  VMODEL_ZIP_REQUIRED_PATHS,
  VMODEL_ZIP_SOURCE_BINDINGS,
  vmodelZipManifestMessages,
  vmodelZipSourceBindingDefinitionViolations,
} from "../vmodel/zip-manifest";
import { validateVisualizationTreeViewModel } from "../vscode/extension-adapter";
import {
  HELIX_COPY_POINTER_COMMAND,
  HELIX_HARNESS_VIEW_ID,
  HELIX_PROJECT_VIEW_ID,
  HELIX_REFRESH_VISUALIZATION_COMMAND,
  helixVscodeContributionManifest,
} from "../vscode/extension-manifest";
import { buildVisualizationTreeView, type TreeViewNode } from "../vscode/tree-view-provider";
import { collectDoctorCheckRun } from "./check-registry";
import type { DoctorOptions, DoctorResult } from "./result";

/** I/O・clock 注入 (test 可能)。 */
export interface DoctorDeps {
  repoRoot: string;
  now: string;
  readText: (path: string) => string | null;
  listDir: (dir: string) => string[];
}

/**
 * agent-slots (Layer-2 オーケストレーション) の stale slot / peak 並列を surface (IMP-050、warning レベル)。
 * stale (5 分超 released なし) があれば warn、無ければ active/peak を表示 (doctor.ok は落とさない)。
 */
export function checkAgentSlots(deps: AgentSlotsDeps): string {
  const all = loadSlots(deps);
  if (all.length === 0) return "doctor: agent-slots — 記録なし";
  const stale = listStaleSlots(deps, DEFAULT_STALE_MINUTES);
  const active = listActiveSlots(deps).length;
  const peak = peakParallel(all);
  if (stale.length > 0) {
    const ids = stale.map((s) => s.slot_id).join(", ");
    return `doctor: agent-slots — ⚠ stale ${stale.length} 件 (${DEFAULT_STALE_MINUTES}分超 release なし: ${ids}。release 漏れを確認)`;
  }
  return `doctor: agent-slots — OK (active=${active}, peak_parallel=${peak})`;
}

/**
 * 駆動モデルの back-fill 完全性 (impl⇔Reverse / impl⇔glossary) を検査 (IMP-051、hard)。
 * Reverse 無き impl / §6 用語の glossary 未 merge を violation にして doctor.ok に連動する。
 */
export function checkBackfillResult(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const docs = loadBackfillDocs(repoRoot);
    const r = analyzeBackfill(docs.plans, docs.glossaryText, docs.auditedLegacyIds);
    return { messages: backfillMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["backfill - violation: PLAN/glossary could not be read"],
      ok: false,
    };
  }
}

/** 後方互換: messages のみ返す薄いラッパ。 */
export function checkBackfill(repoRoot: string): string[] {
  return checkBackfillResult(repoRoot).messages;
}

/**
 * PoC confirmed ⇔ Reverse 合流の整合を surface (IMP-064、hard fail)。
 * confirmed poc (redesign 除く) の Reverse 孤児 / reverse が confirmed でない poc を参照 → ok=false。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkScrumReverse(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["scrum-reverse - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeScrumReverse(loadSrPlans(repoRoot), loadReverseSeedMarkers(repoRoot));
    return { messages: scrumReverseMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["scrum-reverse - violation: PLAN could not be read"],
      ok: false,
    };
  }
}

/**
 * PLAN errata の双方向整合を surface (PLAN-L7-89、hard fail)。`supersedes` 宣言の先が実在しない /
 * 原 PLAN に訂正 back-reference が無い → ok=false。I/O 失敗も violation にして fail-close する。
 */
export function checkPlanSupersession(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-supersession - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlanSupersession(loadSupersedePlans(repoRoot));
    return { messages: planSupersessionMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["plan-supersession - violation: PLAN could not be read"],
      ok: false,
    };
  }
}

/**
 * PLAN 本文 substance を surface (PLAN-L7-92、hard fail)。frontmatter + タイトルのみで本文実体行 0 の
 * declare-only hollow PLAN (concept AP-13 無効) → ok=false。I/O 失敗も violation にして fail-close する。
 */
export function checkPlanBodySubstance(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-body-substance - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlanBodySubstance(loadPlanBodySubstanceInput(repoRoot));
    return { messages: planBodySubstanceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["plan-body-substance - violation: PLAN could not be read"],
      ok: false,
    };
  }
}

/**
 * DoD 全消化済なのに status 非終端の PLAN を surface (PLAN-L7-93、hard fail)。完了 bookkeeping drift
 * (作業完了 + gated downstream confirmed なのに recovery/poc PLAN 自身が draft 放置) → ok=false。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkPlanCompletionDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-completion-drift - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlanCompletionDrift(loadPlanCompletionDriftInput(repoRoot));
    return { messages: planCompletionDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["plan-completion-drift - violation: PLAN could not be read"],
      ok: false,
    };
  }
}

/**
 * concept §2.6 ⇔ requirements §7.8.1 の signal 語彙伝播を surface (IMP-065、hard fail)。
 * 上位正本 (concept) と機械 routing SSoT (requirements) の signal 集合が乖離 → ok=false。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkPropagation(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["propagation - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const d = loadPropagationDocs(repoRoot);
    const r = analyzePropagation(d.conceptText, d.requirementsText);
    return { messages: propagationMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["propagation - violation: governance docs could not be read"],
      ok: false,
    };
  }
}

/**
 * 設計層 pair freeze (design⇔test-design の pair_artifact 双方向・孤児0) を検査 (IMP-067、hard)。
 * 孤児 (pair-missing/ref-unresolved/trace-orphan) を violation にして doctor.ok に連動する。
 */
export function checkPairFreeze(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["pair-freeze - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePairFreeze(loadPairDocs(repoRoot));
    return { messages: pairFreezeMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["pair-freeze - violation: design/test-design docs could not be read"],
      ok: false,
    };
  }
}

/**
 * review 前置証跡 (review_evidence) の完全性を検査 (IMP-071、hard 判定)。
 * confirmed/completed の design/impl/add-* PLAN が review_evidence を持たない (review 前置スキップ) を検知する。
 * **hard 判定** (ok=false → runDoctor.ok 連動で fail-close、IMP-071 hard 化 2026-06-05)。実 repo 履歴 15 件の
 * back-fill 完了 (missing 0 安定) を確認してから hard へ昇格した。review-skip の silent 化を機械で塞ぐ。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkReviewEvidence(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["review-evidence - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeReviewEvidence(loadReviewPlans(repoRoot));
    return { messages: reviewEvidenceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["review-evidence - violation: PLAN could not be read"],
      ok: false,
    };
  }
}

/**
 * guardrail 不変条件の hard doctor gate (PLAN-L7-52 C-1 option A、warn-first Phase 0 →
 * hard Phase 2 昇格。PO /goal 承認 2026-06-15)。これまで projectGuardrailInvariantAdvisories
 * が severity=warn の非ブロック advisory として surface するだけだった同一ロジックを、ok=false の
 * fail-close gate に昇格する。
 * harness.db に依存せず、committed の PLAN frontmatter review_evidence から再計算する。
 * 各 entry に inspectGuardrailInvariants (state-db guardrail-invariants SSoT) を適用し、
 * violation (secret-evidence / same-model-self-review / human-required-without-evidence) が
 * あれば ok=false。空文字列の reviewer_model / worker_model は undefined に正規化して
 * same-model 誤検知を防ぐ (= 両 model が明示・同一のときだけ発火)。
 *
 * **review_kind scoping (concept §2.1.2.1)**: same-model-self-review は
 * `review_kind=cross_agent` (別 runtime/別モデルの独立性を僭称するレビュー) のみ hard-block する。
 * intra_runtime_subagent は単体 runtime (claude-only/codex-only) の正規 review tier で同一モデルが
 * 設計上許容される (cross-provider 要件に数えないだけ) ため block しない。secret-evidence /
 * human-required-without-evidence は review_kind 非依存で常に適用。
 *
 * checkReviewEvidence との関係: checkReviewEvidence も cross_agent entry の same-model/欠落を
 * crossReviewViolations で hard 判定する。本 gate は同じ cross_agent same-model を
 * guardrail-invariants SSoT 経由で defense-in-depth に再担保しつつ、SSoT が持つ secret-evidence /
 * human-required-without-evidence 不変条件 (recordGuardrailDecision 書込経路と共有) も review_evidence
 * 面で hard 化する。runtime guardrail decision (recordGuardrailDecision) 経路の本番配線は C-1 carry。
 */
export function checkGuardrailInvariants(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["guardrail-invariants - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const plans = loadReviewPlans(repoRoot);
    const violations: {
      rule: string;
      planId: string;
      reviewerModel?: string;
      workerModel?: string;
    }[] = [];
    for (const plan of plans) {
      if (plan.status === "archived") continue;
      // plan.crossEntries は parseReviewPlan → extractReviewEntries で既に populate 済み。
      // re-read せず直接使う (loader 再利用方針、重複 I/O 回避)。
      for (const entry of plan.crossEntries) {
        const reviewerModel = entry.reviewer_model?.trim() || undefined;
        const workerModel = entry.worker_model?.trim() || undefined;
        const input: GuardrailDecisionInput = {
          plan_id: plan.plan_id,
          session_id: "",
          guardrail: "review-evidence",
          decision: "allow",
          mode: "review",
          evidence_path: plan.file,
          reviewer_model: reviewerModel,
          worker_model: workerModel,
        };
        const inspection = inspectGuardrailInvariants(input);
        for (const v of inspection.violations) {
          // same_model_approval: forbidden は concept §2.1.2.1 (line 181/1224) より
          // **review_kind=cross_agent (独立性を僭称するレビュー) のみ**に適用する。
          // intra_runtime_subagent は単体 runtime (claude-only / codex-only) の正規 fallback で
          // 「同一モデルである事実を記録し cross-provider 要件に数えない」設計 (line 188 = codex-only は
          // intra_runtime_subagent を hard 必須)。ここを全 review_kind に hard-block すると codex-only
          // mode が永久に doctor を通れなくなる。cross_agent 限定は checkReviewEvidence の
          // crossReviewViolations scoping とも一致 (核心ルール 1 の静的担保)。
          // secret-evidence / human-required-without-evidence は review_kind 非依存で評価される
          // (この review_evidence 経路では evidence_path=plan.file(非 secret) / decision=allow 固定の
          //  ため発火条件を満たさないが、SSoT のロジック自体は適用されている)。
          if (
            (v.rule === "same-model-self-review" || v.rule === "same-provider-cross-review") &&
            entry.review_kind !== "cross_agent"
          ) {
            continue;
          }
          violations.push({
            rule: v.rule,
            planId: plan.plan_id,
            reviewerModel,
            workerModel,
          });
        }
      }
    }
    if (violations.length === 0) {
      return {
        messages: ["guardrail-invariants — OK (review_evidence 全 entry でインバリアント違反なし)"],
        ok: true,
      };
    }
    return {
      messages: violations.map(
        (v) =>
          `guardrail-invariants - violation: rule=${v.rule} plan_id=${v.planId} reviewer=${v.reviewerModel ?? "(none)"} worker=${v.workerModel ?? "(none)"}`,
      ),
      ok: false,
    };
  } catch {
    return {
      messages: ["guardrail-invariants - violation: PLAN review_evidence could not be read"],
      ok: false,
    };
  }
}

/**
 * architecture §3.1 設計 module 集合 ⊇ src/ 実在 module を検査 (IMP-075、hard)。
 * 実在するが設計 doc 未列挙 (= impl→design back-fill 漏れ) を violation にして doctor.ok に連動する。
 */
/**
 * merged-plan-status hard gate (PO 指摘 2026-06-15): generated src が merge 済みなのに owning PLAN が
 * draft / 未 confirm のまま放置される V-model state 不整合を fail-close 検出する。review-evidence gate が
 * confirmed PLAN にのみ証跡を要求し draft を素通りさせる absence-blindness を補完する (柱3 = state DB が
 * フィードバック機構)。
 */
export function checkMergedPlanStatus(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["merged-plan-status - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeMergedPlanStatus(loadMergedPlanStatusInput(repoRoot));
    return { messages: mergedPlanStatusMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["merged-plan-status - violation: PLAN generates could not be read"],
      ok: false,
    };
  }
}

/**
 * plan-artifact-existence hard gate (PO /goal 2026-06-15): PLAN が confirmed/completed/accepted (完了宣言)
 * なのに generates artifact が不在 (phantom / false-completion) を fail-close 検出する。merged-plan-status
 * の鏡像で、PLAN↕artifact 実在マトリクスを 2 gate で完結させる。impl-plan-trace (src→PLAN) も
 * review-evidence (証跡有無) も artifact 実在を見ない absence-blindness を塞ぐ (柱3 / 柱6)。
 */
export function checkPlanArtifactExistence(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-artifact-existence - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlanArtifactExistence(loadPlanArtifactExistenceInput(repoRoot));
    return { messages: planArtifactExistenceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["plan-artifact-existence - violation: PLAN generates could not be read"],
      ok: false,
    };
  }
}

export function checkModuleDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["module-drift - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeModuleDrift(loadModuleDocs(repoRoot));
    return { messages: moduleDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["module-drift - violation: architecture/src modules could not be read"],
      ok: false,
    };
  }
}

export function checkAssetDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["asset-drift - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const input = loadAssetDriftInput(repoRoot);
    input.allowlist = [...SUBAGENT_ALLOWLIST].sort();
    const r = analyzeAssetDrift(input);
    return { messages: assetDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["asset-drift — violation: internal asset drift lint could not run"],
      ok: false,
    };
  }
}

export function checkAllowlistSync(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const result = analyzeAllowlistSync(loadAllowlistSyncInput(repoRoot));
    return { messages: allowlistSyncMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["allowlist-sync - violation: allowlist sync input could not be read"],
      ok: false,
    };
  }
}

export function checkJudgmentCoreCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const result = analyzeJudgmentCoreCoverage(loadJudgmentCoreCoverageInput(repoRoot));
    return { messages: judgmentCoreCoverageMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["judgment-core-coverage - violation: judgment core docs could not be read"],
      ok: false,
    };
  }
}

export function checkSkillAssignment(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["skill-assignment - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeSkillAssignments(loadSkillAssignmentDocs(repoRoot));
    return { messages: skillAssignmentMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["skill-assignment - violation: skill assignment metadata could not be read"],
      ok: false,
    };
  }
}

export function checkSkillQuality(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["skill-quality - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeSkillQuality(loadSkillQualityInput(repoRoot));
    return { messages: skillQualityMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["skill-quality - violation: skill catalog could not be read"],
      ok: false,
    };
  }
}

export function checkDescentObligation(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["descent-obligation - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = filterSubstanceVerifiedAdvisories(
      analyzeDescentObligations(
        loadTraceKeyedArtifacts(repoRoot),
        loadDescentAdjacency(repoRoot),
        loadDeferLedger(repoRoot),
      ),
      loadFrUnitCoverageOracles(repoRoot),
    );
    return { messages: descentObligationMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["descent-obligation - violation: descent obligation ledger could not be read"],
      ok: false,
    };
  }
}

export function checkChangeImpact(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["change-impact - violation: repo root could not be read"],
      ok: false,
    };
  }
  // 非 git (ZIP 展開のみ) では change-impact は適用不能 → skip (ok)。git は在るが status が
  // 壊れる実エラーは下の catch で fail-close を維持する。CI は常に git repo なので影響なし。
  if (!isGitRepository(repoRoot)) {
    return {
      messages: ["change-impact — skipped (not a git repository)"],
      ok: true,
    };
  }
  try {
    const r = analyzeChangeImpact({ changedFiles: loadChangedFiles(repoRoot) });
    return { messages: changeImpactMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["change-impact - violation: git status could not be read"],
      ok: false,
    };
  }
}

export function checkChangeSetIntegrity(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["change-set-integrity - violation: repo root could not be read"],
      ok: false,
    };
  }
  // 非 git では変更集合を確定できない → skip (change-impact と同じ非 git fail-open 方針)。
  if (!isGitRepository(repoRoot)) {
    return {
      messages: ["change-set-integrity — skipped (not a git repository)"],
      ok: true,
    };
  }
  try {
    const dependencyDrift = analyzeDependencyDrift(loadDependencyDriftInput(repoRoot));
    const changedFiles = loadChangedFiles(repoRoot);
    const result = analyzeChangeSetIntegrity({
      changedFiles,
      dependencyDrift,
      planDocs: loadChangedPlanDocs(repoRoot, changedFiles),
    });
    return { messages: changeSetIntegrityMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["change-set-integrity - violation: change/dependency graph could not be read"],
      ok: false,
    };
  }
}

function loadChangedPlanDocs(
  repoRoot: string,
  changedFiles: string[],
): { path: string; text: string }[] {
  return changedFiles
    .filter((path) => /^docs\/plans\/PLAN-.+\.md$/.test(path.replaceAll("\\", "/")))
    .map((path) => {
      const normalized = path.replaceAll("\\", "/");
      return {
        path: normalized,
        text: readFileSync(join(repoRoot, ...normalized.split("/")), "utf8"),
      };
    });
}

function loadChangedFilesForDoctor(repoRoot: string): string[] {
  try {
    return loadChangedFiles(repoRoot);
  } catch {
    return [];
  }
}

export function checkVerificationProfile(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["verification-profile - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeVerificationProfileGate(loadVerificationRecommendation(repoRoot));
    return {
      messages: verificationProfileGateMessages(r),
      ok: r.ok,
    };
  } catch {
    return {
      messages: ["verification-profile - violation: changed file graph could not be read"],
      ok: false,
    };
  }
}

export function checkBranchKind(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["branch-kind-check - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeBranchKind(loadBranchKindInput(repoRoot));
    return { messages: branchKindMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["branch-kind-check - violation: branch/check input could not be read"],
      ok: false,
    };
  }
}

export function checkCodingRules(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["coding-rules - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeCodingRules(
      loadCodingRuleDocs(repoRoot),
      loadCodingRulePolicy(repoRoot),
      loadCodingWorkflowDocs(repoRoot),
    );
    return { messages: codingRulesMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["coding-rules — violation: TS coding rule lint could not run"],
      ok: false,
    };
  }
}

/**
 * PLAN-L7-421: ZIP 文書種 catalog と実在 artifact の coverage を doctor hard gate に接続する。
 * catalog 不在・parse 不能・走査不能はいずれも設計採否を証明できないため fail-close とする。
 */
export function checkDesignCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["design-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDesignCoverage(loadDesignCoverageInput(repoRoot));
    return { messages: designCoverageMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["design-coverage - violation: design catalog coverage lint could not run"],
      ok: false,
    };
  }
}

/** PLAN-L7-430: L7左腕差し戻しをresolution V-pairとgate再通過証拠までhard gateする。 */
export function checkLeftArmCarryLog(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["left-arm-carry-log — violation: repo root could not be read"], ok: false };
  }
  try {
    const result = analyzeLeftArmCarryLog(loadLeftArmCarryLogInput(repoRoot));
    return { messages: leftArmCarryLogMessages(result), ok: result.ok };
  } catch {
    return { messages: ["left-arm-carry-log — violation: check could not run"], ok: false };
  }
}

/** PLAN-L7-428: system reviewのtriage判断と実sourceの同時縮退を独立pinでfail-closeする。 */
export function checkTriageDecisionIntegrity(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["triage-decision-integrity - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeTriageDecisionIntegrity(loadTriageDecisionIntegrityInput(repoRoot));
    return { messages: triageDecisionIntegrityMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["triage-decision-integrity - violation: check could not run"],
      ok: false,
    };
  }
}

export function checkDddTddRules(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["ddd-tdd-rules - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDddTddRules(loadDddTddInputs(repoRoot));
    return { messages: dddTddRulesMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["ddd-tdd-rules - violation: DDD/TDD strictness lint could not run"],
      ok: false,
    };
  }
}

export function checkDesignLanguage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["design-language - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDesignLanguage(loadDesignLanguageDocs(repoRoot));
    return { messages: designLanguageMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["design-language - violation: design/governance/ADR docs could not be read"],
      ok: false,
    };
  }
}

export function checkHandoverRetirementInventory(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["handover-retirement-inventory - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeHandoverRetirementInventory(repoRoot);
    return { messages: handoverRetirementInventoryMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["handover-retirement-inventory - violation: live surface scan could not run"],
      ok: false,
    };
  }
}

export function checkHandoverResurrection(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["handover-resurrection - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeHandoverResurrectionShadowRepo(repoRoot);
    return { messages: resurrectionMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["handover-resurrection - violation: detector or baseline could not be read"],
      ok: false,
    };
  }
}

export function checkSecretScan(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["secret-scan - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeSecretScan(loadSecretScanArtifacts(repoRoot));
    return { messages: secretScanMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["secret-scan - violation: docs / runtime state artifacts could not be read"],
      ok: false,
    };
  }
}

export function checkDigestInventory(repoRoot: string): { messages: string[]; ok: boolean } {
  try {
    const expected = JSON.parse(
      readFileSync(join(repoRoot, "config", "digest-canonicalization-inventory.json"), "utf8"),
    ) as { rows?: unknown[] };
    const actual = scanDigestInventory(repoRoot);
    const ok = JSON.stringify(expected.rows ?? []) === JSON.stringify(actual);
    return {
      ok,
      messages: [
        ok
          ? `digest-inventory - OK (hits=${actual.length})`
          : "digest-inventory - violation: generated inventory differs from production AST scan",
      ],
    };
  } catch (error) {
    return {
      ok: false,
      messages: [`digest-inventory - violation: ${String(error)}`],
    };
  }
}

export function checkDbProjectionCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["db-projection-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeDbProjectionCoverage(loadDbProjectionRequirements(repoRoot));
    return { messages: dbProjectionCoverageMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["db-projection-coverage - violation: physical-data/schema coverage could not run"],
      ok: false,
    };
  }
}

export function checkAgentModelSsot(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["agent-model-ssot - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeAgentModelSsot(
      loadAgentModelEntries(repoRoot),
      loadCanonicalModelIds(repoRoot),
    );
    return { messages: agentModelSsotMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["agent-model-ssot - violation: agent frontmatter could not be read"],
      ok: false,
    };
  }
}

export function checkVerifierProviderMismatch(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["verifier-provider-mismatch - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzeVerifierProviderMismatch(loadLoopIterationFiles(repoRoot));
    return {
      messages: verifierProviderMismatchMessages(result),
      ok: result.ok,
    };
  } catch {
    return {
      messages: [
        "verifier-provider-mismatch - violation: loop iteration evidence could not be read",
      ],
      ok: false,
    };
  }
}

export function checkTeamReviewReceipts(repoRoot: string): { messages: string[]; ok: boolean } {
  let db: HarnessDb | undefined;
  try {
    db = openHarnessDbReadOnly(defaultHarnessDbPath(repoRoot), { repoRoot });
    const invalidCompleted = db
      .prepare(`SELECT COUNT(*) AS n FROM team_member_run_receipts
        WHERE role IN ('tl','qa','uiux') AND status='completed'
          AND NOT (exit_code=0 AND verdict='pass' AND verdict_status='accepted')`)
      .get()?.n as number | undefined;
    const missingCrossWorker = db
      .prepare(`SELECT COUNT(*) AS n FROM team_member_run_receipts reviewer
        WHERE reviewer.role IN ('tl','qa','uiux') AND reviewer.status='completed'
          AND NOT EXISTS (
            SELECT 1 FROM team_member_run_receipts worker
            WHERE worker.team_run_id=reviewer.team_run_id
              AND worker.role NOT IN ('tl','qa','uiux')
              AND worker.status='completed'
              AND worker.provider<>reviewer.provider
              AND worker.repository_head=reviewer.repository_head
              AND reviewer.repository_head IS NOT NULL
          )`)
      .get()?.n as number | undefined;
    const violations = (invalidCompleted ?? 0) + (missingCrossWorker ?? 0);
    return {
      ok: violations === 0,
      messages: [
        violations === 0
          ? "team-review-receipts - OK (completed reviewer receipts are explicit PASS and cross-provider bound)"
          : `team-review-receipts - violation: invalid_completed=${invalidCompleted ?? 0} missing_cross_worker=${missingCrossWorker ?? 0}`,
      ],
    };
  } catch {
    return {
      ok: false,
      messages: ["team-review-receipts - violation: canonical receipt table could not be read"],
    };
  } finally {
    try {
      db?.close();
    } catch {
      // fail-open: closing a read-only diagnostic handle cannot change the completed check result.
    }
  }
}

function runtimeSessionDirsForDoctor(): {
  claudeDir: string;
  codexDir: string;
} {
  return {
    claudeDir: process.env.HELIX_CLAUDE_SESSIONS_DIR ?? join(homedir(), ".claude", "projects"),
    codexDir: process.env.HELIX_CODEX_SESSIONS_DIR ?? join(homedir(), ".codex", "sessions"),
  };
}

export function projectRuntimeModelTelemetryForDoctor(_repoRoot: string, db: HarnessDb): void {
  const { claudeDir, codexDir } = runtimeSessionDirsForDoctor();
  const usages = loadRuntimeSessionUsage({
    claudeDirs: [claudeDir],
    codexDirs: [codexDir],
  });
  projectTokenUsage(db, usages);
}

export function checkDbProjectionIngestion(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["db-projection-ingestion - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    // prebuiltDb = runDoctor が 1 回だけ rebuild した共有 in-memory projection (PLAN-L7-348)。
    // 共有時も telemetry projection と検査内容は単体実行と同一で、lifecycle は呼び出し側が持つ。
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      projectRuntimeModelTelemetryForDoctor(repoRoot, db);
      const result = analyzeDbProjectionIngestion(rowCounts(db));
      const pairAgentBlockedGate = db
        .prepare(
          "SELECT gate_id, status, evidence_path FROM gate_runs WHERE gate_id = ? AND status IN ('blocked', 'error', 'failed') ORDER BY checked_at DESC LIMIT 1",
        )
        .get("pair-agent-run-evidence") as
        | { gate_id: string; status: string; evidence_path: string }
        | undefined;
      const pairAgentFinding = db
        .prepare(
          "SELECT kind, severity, evidence_path FROM findings WHERE source = ? AND status = ? AND severity = ? ORDER BY kind LIMIT 1",
        )
        .get("pair-agent-evidence", "open", "error") as
        | { kind: string; severity: string; evidence_path: string }
        | undefined;
      const messages = dbProjectionIngestionMessages(result);
      if (pairAgentBlockedGate) {
        messages.push(
          `db-projection-ingestion - violation: pair-agent-run-evidence gate ${pairAgentBlockedGate.status} (${pairAgentBlockedGate.evidence_path})`,
        );
      }
      if (pairAgentFinding) {
        messages.push(
          `db-projection-ingestion - violation: open pair-agent evidence finding ${pairAgentFinding.kind} (${pairAgentFinding.evidence_path})`,
        );
      }
      return {
        messages,
        ok: result.ok && !pairAgentBlockedGate && !pairAgentFinding,
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "db-projection-ingestion - violation: automatic projection ingestion could not run",
      ],
      ok: false,
    };
  }
}

export function checkProjectCurrentLocation(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["project-current-location - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const closureOverview = buildProjectClosureOverview(snapshot, {
        limit: 0,
      });
      const closeReadyReviewBundle = buildProjectClosureReviewBundle(snapshot, {
        action: "close_ready",
        limit: 20,
        offset: 0,
      });
      const collectEvidencePlan = buildProjectClosureEvidencePlan(snapshot, {
        action: "collect_evidence",
        limit: 0,
      });
      const repairEvidencePlan = buildProjectClosureEvidencePlan(snapshot, {
        action: "repair_failed_evidence",
        limit: 0,
      });
      const roadmapCurrent = buildProjectRoadmapCurrentReport(snapshot);
      const driveModel = buildProjectDriveModelReport(snapshot);
      const recoveryPlan = buildProjectRecoveryPlan(snapshot, { limit: 0 });
      const fit = buildVmodelFitReport(snapshot, analyzeVmodelZipManifest(repoRoot), { repoRoot });
      const recoveryAutomation = recoveryPlan.automation_boundaries
        .filter((boundary) => boundary.count > 0)
        .map(
          (boundary) =>
            `${boundary.automation_class}:${boundary.action}:${boundary.count}:approval=${boundary.approval_required}`,
        )
        .join(",");
      const recoveryRunwayPhases = recoveryPlan.automation_runway.phases
        .map(
          (phase) =>
            `${phase.sequence}:${phase.phase_type}:${phase.action}:${phase.count}:remaining=${phase.remaining_after_phase}:next=${phase.next_gate}`,
        )
        .join(",");
      const current = snapshot.current;
      const route = snapshot.drive_route;
      const hasL14L7Contradiction = snapshot.findings.some(
        (finding) => finding.code === "l14_claim_with_l7_work",
      );
      const currentLocationFrontierType =
        current.status === "needs_recovery" ? "recovery_frontier" : "forward_frontier";
      const currentLocationFrontierClassification = hasL14L7Contradiction
        ? "l14_claim_with_l7_work"
        : current.status === "needs_recovery"
          ? "recovery_queue"
          : "no_current_location_contradiction";
      const closeReadyDecisionRecordCommand = `helix closure decision-draft --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --out .helix/tmp/closure/close_ready-decision-draft-offset-${closeReadyReviewBundle.offset}.yml --summary-json`;
      const closeReadyCurrentWindowCommand = `helix closure review-bundle --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.offset} --summary-json`;
      const closeReadyNextWindowCommand =
        closeReadyReviewBundle.window.next_offset === null
          ? "-"
          : `helix closure review-bundle --action close_ready --limit ${closeReadyReviewBundle.limit} --offset ${closeReadyReviewBundle.window.next_offset} --summary-json`;
      const prefix =
        current.status === "forward"
          ? "project-current-location - OK"
          : "project-current-location - advisory";
      const messages = [
        `${prefix} (layer=${current.layer ?? "unknown"}, l12=${current.l12_layer ?? "unknown"}, status=${current.status}, boundary=${current.completion_boundary}, drive=${snapshot.drive_recommendation.model}, route=${route.routeId}, route_status=${route.status}, coverage done/missing/reverify=${snapshot.coverage.done}/${snapshot.coverage.missing}/${snapshot.coverage.reverify}, findings=${snapshot.findings.length})`,
        `project-current-location - frontier: type=${currentLocationFrontierType} classification=${currentLocationFrontierClassification} open_l7=${snapshot.closure.l7_open_plan_ids.length} terminal_l14=${snapshot.closure.terminal_l14_plan_ids.length} queue=${snapshot.closure.queue.total} action=${recoveryPlan.selected_closure_action ?? "-"} next=${recoveryPlan.reentry_forecast.next_command} command=helix progress frontier --summary-json`,
        `project-current-location - drive-model: selected=${driveModel.selected_model} status=${driveModel.selection_status} available=${driveModel.available_models.join(",") || "-"} blocked=${driveModel.blocked_models.join(",") || "-"} command=helix drive model --json`,
        `project-current-location - recovery-plan: status=${recoveryPlan.status} action=${recoveryPlan.selected_closure_action ?? "-"} exit=${recoveryPlan.exit_forecast.status} remaining=${recoveryPlan.exit_forecast.remaining_queue_items} blockers=${recoveryPlan.exit_forecast.blockers.length} steps=${recoveryPlan.steps.length} command=helix recovery plan --json`,
        `project-current-location - recovery-reentry: status=${recoveryPlan.reentry_forecast.status} effective=${fit.synthesis.effective_reentry_status} blocking=${recoveryPlan.reentry_forecast.current_blocking_count} after_machine=${recoveryPlan.reentry_forecast.blocking_after_machine_lanes} phases=${recoveryPlan.reentry_forecast.required_phase_count} next=${recoveryPlan.reentry_forecast.next_phase_action ?? "-"} gate=${recoveryPlan.reentry_forecast.next_gate} command=helix recovery plan --json`,
        `project-current-location - recovery-runway: status=${recoveryPlan.automation_runway.status} machine=${recoveryPlan.automation_runway.machine_actionable_count} approval=${recoveryPlan.automation_runway.human_approval_count} reverse=${recoveryPlan.automation_runway.design_reverse_count} after_machine=${recoveryPlan.automation_runway.remaining_after_machine_lanes} next=${recoveryPlan.automation_runway.next_machine_action ?? "-"} command=helix recovery plan --json`,
        `project-current-location - recovery-runway-phases: ${recoveryRunwayPhases || "none"} command=helix recovery plan --json`,
        `project-current-location - recovery-automation: ${recoveryAutomation || "none"} mutation=false command=helix recovery plan --json`,
        `project-current-location - drive-route: ${route.routeId} status=${route.status} model=${route.selectedModel} default=${route.defaultModel} return_to_design=${route.mustReturnToDesign} write=${route.writePolicy}`,
        route.reverse.required
          ? `project-current-location - reverse-scope: targets=${route.reverse.targets.join(",") || "-"} l12=${route.reverse.l12Layers.join(",") || "-"} actions=${route.reverse.queueActions.join(",") || "-"} ledgers=${route.reverse.ledgerIds.length} docs=${route.reverse.docDependencies.length} impl=${route.reverse.implementationDependencies.length}`
          : `project-current-location - forward-scope: allowed=${route.forward.allowed} roadmap=${route.forward.roadmapStatus} frontier=${route.forward.frontier.join(",") || "-"}`,
        `project-current-location - design-coverage-gate: status=${snapshot.design_coverage_gate.status} covered=${snapshot.design_coverage_gate.covered} missing=${snapshot.design_coverage_gate.missing} reverify=${snapshot.design_coverage_gate.reverify}`,
        `project-current-location - zip-adoption: status=${snapshot.zip_adoption.status} adopt=${snapshot.zip_adoption.adopted} complement=${snapshot.zip_adoption.complemented} reject=${snapshot.zip_adoption.rejected} missing=${snapshot.zip_adoption.missing}`,
        `project-current-location - tailoring-gate: status=${snapshot.tailoring_gate.status} profile=${snapshot.tailoring_gate.profile} required=${snapshot.tailoring_gate.required} optional=${snapshot.tailoring_gate.optional} na=${snapshot.tailoring_gate.excluded} missing=${snapshot.tailoring_gate.missing_required}`,
        `project-current-location - design-impact: declarations=${snapshot.counts.design_declarations} references=${snapshot.counts.design_references} impact=${snapshot.counts.design_impact} unresolved=${snapshot.counts.unresolved_design_references} drift=${snapshot.counts.design_declaration_drifts}`,
        `project-current-location - artifact-remap: done=${snapshot.artifact_remap.done} missing=${snapshot.artifact_remap.missing} reverify=${snapshot.artifact_remap.reverify} layers=${snapshot.artifact_remap.layers.map((layer) => `${layer.layer}:${layer.status}`).join(",")}`,
        `project-current-location - artifact-remap-batch: reverify=helix artifact-remap batch --status reverify --json missing=helix artifact-remap batch --status missing --json`,
        `project-current-location - roadmap-position: status=${snapshot.roadmap_position.status} bands=${snapshot.roadmap_position.rollup.covered_bands}/${snapshot.roadmap_position.rollup.total_bands} gates=${snapshot.roadmap_position.rollup.reached_gates}/${snapshot.roadmap_position.rollup.total_gates}`,
        `project-current-location - roadmap-current: status=${roadmapCurrent.status} aligned=${roadmapCurrent.consistency.aligned} basis=${roadmapCurrent.consistency.alignment_basis} db=${roadmapCurrent.consistency.db_current_l12_layer ?? "-"} roadmap=${roadmapCurrent.consistency.roadmap_current_l12_layers.join(",") || "-"} projected=${roadmapCurrent.consistency.roadmap_projected_l12_layers.join(",") || "-"} terminal=${roadmapCurrent.consistency.roadmap_terminal_l12_layers.join(",") || "-"} blockers=${roadmapCurrent.counts.blockers} command=helix roadmap current --json`,
        `project-current-location - closure-overview: status=${closureOverview.closure.status} queue=${closureOverview.closure.queue_total} close=${closureOverview.closure.route_counts.close_ready} collect=${closureOverview.closure.route_counts.collect_evidence} repair=${closureOverview.closure.route_counts.repair_failed_evidence} reverse=${closureOverview.closure.route_counts.reverse_design} apply=${closureOverview.closure.apply_readiness.status} recommended=${closureOverview.recommended_next_action.action ?? "none"} human=${closureOverview.recommended_next_action.human_required} command=${closureOverview.recommended_next_action.command}`,
        `project-current-location - closure-approval-frontier: windows=${closeReadyReviewBundle.window.page_count} current=${closeReadyReviewBundle.window.page_index}/${closeReadyReviewBundle.window.page_count} listed=${closeReadyReviewBundle.listed} omitted=${closeReadyReviewBundle.omitted} digest=${closeReadyReviewBundle.review_scope.approval_scope_digest} decision_record=${closeReadyDecisionRecordCommand} review=${closeReadyCurrentWindowCommand} next=${closeReadyNextWindowCommand} command=helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json`,
        `project-current-location - closure-evidence-plan: collect=${collectEvidencePlan.total} tables=${collectEvidencePlan.target_tables.join(",") || "-"} command=helix closure evidence-plan --action collect_evidence --json repair=${repairEvidencePlan.total} repair_tables=${repairEvidencePlan.target_tables.join(",") || "-"} repair_command=helix closure evidence-plan --action repair_failed_evidence --json`,
        `project-current-location - next-action-ledger: total=${snapshot.closure.next_action_ledger.total} ready=${snapshot.closure.next_action_ledger.status_counts.ready} evidence=${snapshot.closure.next_action_ledger.status_counts.needs_evidence} repair=${snapshot.closure.next_action_ledger.status_counts.needs_repair} reverse=${snapshot.closure.next_action_ledger.status_counts.needs_reverse}`,
      ];
      const firstPacket = snapshot.closure.packets.items[0];
      if (firstPacket) {
        messages.push(
          `project-current-location - closure-automation: first=${firstPacket.automation.batchId} command=${firstPacket.automation.reviewCommand} filter=${firstPacket.automation.machineFilter} transition=${firstPacket.automation.expectedTransition}`,
        );
      }
      for (const finding of snapshot.findings) {
        messages.push(
          `project-current-location - ${finding.severity}: ${finding.code} (${finding.detail})`,
        );
      }
      return { messages, ok: true };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["project-current-location - violation: current location projection could not run"],
      ok: false,
    };
  }
}

export function checkVisualizationViewModelBoundary(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["visualization-view-model-boundary - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildVisualizationSnapshot(db, { repoRoot });
      const viewModel = buildVisualizationViewModel(snapshot);
      const project = viewModel.view_boundaries.project;
      const harness = viewModel.view_boundaries.harness;
      const compatibility = viewModel.project.current_location.l12_compatibility;
      const violations: string[] = [];
      const requireIncludes = (label: string, values: string[], required: string[]) => {
        for (const value of required) {
          if (!values.includes(value)) violations.push(`${label} missing ${value}`);
        }
      };
      requireIncludes("project.owned_views", project.owned_views, [
        "current_location",
        "layer_progress",
        "runtime_evidence",
      ]);
      requireIncludes("project.source_fields", project.source_fields, [
        "project_current_location",
        "vmodel_zip_manifest",
        "vmodel_zip_source_bindings",
        "project_zip_adoption_decisions",
        "project_tailoring_decisions",
        "project_vmodel_regression_guards",
        "project_vmodel_fit_blockers",
        "project_vmodel_handoff_summary",
      ]);
      requireIncludes("project.excluded_fields", project.excluded_fields, [
        "evidence.skill_invocations",
        "evidence.model_runs",
      ]);
      requireIncludes("harness.owned_views", harness.owned_views, [
        "harness_growth",
        "skill_agent_telemetry",
      ]);
      requireIncludes("harness.source_fields", harness.source_fields, [
        "evidence.skill_invocations",
        "evidence.model_runs",
      ]);
      requireIncludes("harness.excluded_fields", harness.excluded_fields, [
        "project_current_location.vmodel_fit",
        "project_current_location.drive_route",
        "project_current_location.closure",
        "vmodel_zip_manifest",
        "vmodel_zip_source_bindings",
        "project_zip_adoption_decisions",
        "project_tailoring_decisions",
        "project_vmodel_regression_guards",
        "project_vmodel_fit_blockers",
        "project_vmodel_handoff_summary",
      ]);
      if (
        project.view_command !== "helix progress tree-view --json" ||
        harness.view_command !== "helix progress tree-view --json"
      ) {
        violations.push("view_command must be helix progress tree-view --json");
      }
      const requiredCompatibilityPairs = [
        "l0_slide",
        "function_design",
        "implementation",
        "acceptance",
        "operation",
        "recovery",
      ];
      const compatibilityPairLabels = compatibility.pairs.map((pair) => pair.label);
      for (const pair of requiredCompatibilityPairs) {
        if (!compatibilityPairLabels.includes(pair)) {
          violations.push(`l12_compatibility.missing_pair=${pair}`);
        }
      }
      if (compatibility.status === "violation") {
        violations.push("l12_compatibility.status=violation");
      }
      if (compatibility.command !== "helix current-location --json") {
        violations.push(`l12_compatibility.command=${compatibility.command}`);
      }
      const prefix =
        violations.length === 0
          ? "visualization-view-model-boundary - OK"
          : "visualization-view-model-boundary - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: project=${project.owned_views.join(",")} harness=${harness.owned_views.join(",")} current=${viewModel.project.current_location.layer ?? "unknown"}->${viewModel.project.current_location.l12_layer ?? "unknown"} status=${viewModel.project.current_location.status} command=helix progress view-model --json`,
          `visualization-view-model-boundary - l12-compatibility=${compatibility.status} layers=${compatibility.layers}/${compatibility.expected_layers} pairs=${compatibility.pairs.map((pair) => `${pair.label}:${pair.status}:${pair.legacy_layer}->${pair.l12_layer}`).join(",")}`,
          `visualization-view-model-boundary - project-source=${project.source_fields.join(",")} project-excluded=${project.excluded_fields.join(",") || "-"}`,
          `visualization-view-model-boundary - harness-source=${harness.source_fields.join(",")} harness-excluded=${harness.excluded_fields.join(",") || "-"}`,
          ...violations.map(
            (violation) => `visualization-view-model-boundary - violation: ${violation}`,
          ),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "visualization-view-model-boundary - violation: view-model boundary projection could not run",
      ],
      ok: false,
    };
  }
}

export function checkVisualizationTreeViewBoundary(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["visualization-tree-view-boundary - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildVisualizationSnapshot(db, { repoRoot });
      const viewModel = buildVisualizationViewModel(snapshot);
      const tree = buildVisualizationTreeView(viewModel);
      const roots = tree.roots.map((root) => root.id);
      const project = tree.roots.find((root) => root.id === "project");
      const harness = tree.roots.find((root) => root.id === "harness");
      const violations: string[] = [];
      const collectIds = (root: TreeViewNode): string[] => {
        const ids: string[] = [];
        const queue: TreeViewNode[] = [root];
        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) continue;
          ids.push(current.id);
          queue.push(...current.children);
        }
        return ids;
      };
      const collectCommands = (root: TreeViewNode): string[] => {
        const commands: string[] = [];
        const queue: TreeViewNode[] = [root];
        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) continue;
          const command = current.command?.arguments[0];
          if (command) commands.push(command);
          queue.push(...current.children);
        }
        return commands;
      };
      if (tree.schema_version !== "visualization-tree-view.v1") {
        violations.push(`schema_version=${tree.schema_version}`);
      }
      if (roots.join(",") !== "project,harness") {
        violations.push(`roots=${roots.join(",") || "-"}`);
      }
      if (!project) {
        violations.push("project root missing");
      }
      if (!harness) {
        violations.push("harness root missing");
      }
      const projectIds = project ? collectIds(project) : [];
      const harnessIds = harness ? collectIds(harness) : [];
      const requiredProjectIds = [
        "project/view-boundary",
        "project/current-location",
        "project/current-location/l12-compatibility",
        "project/current-location/l12-compatibility/l0_slide",
        "project/current-location/vmodel-fit",
        "project/current-location/operation-scope",
        "project/current-location/operation-scope/incident_recovery_route",
        "project/current-location/operation-scope/incident_recovery_route/observation-gap",
      ];
      const requiredHarnessIds = [
        "harness/view-boundary",
        "harness/growth",
        "harness/skill-agent-telemetry",
      ];
      for (const id of requiredProjectIds) {
        if (!projectIds.includes(id)) violations.push(`project.missing=${id}`);
      }
      for (const id of requiredHarnessIds) {
        if (!harnessIds.includes(id)) violations.push(`harness.missing=${id}`);
      }
      const harnessProjectLeaks = harnessIds.filter(
        (id) => id.startsWith("project/") || id.includes("current-location"),
      );
      const projectHarnessLeaks = projectIds.filter(
        (id) => id.startsWith("harness/") || id.includes("skill-agent-telemetry"),
      );
      if (harnessProjectLeaks.length > 0) {
        violations.push(`harness.project_leak=${harnessProjectLeaks.slice(0, 3).join(",")}`);
      }
      if (projectHarnessLeaks.length > 0) {
        violations.push(`project.harness_leak=${projectHarnessLeaks.slice(0, 3).join(",")}`);
      }
      const projectBoundary = project?.children.find(
        (child) => child.id === "project/view-boundary",
      );
      const harnessBoundary = harness?.children.find(
        (child) => child.id === "harness/view-boundary",
      );
      if (projectBoundary?.command?.arguments[0] !== "helix progress tree-view --summary-json") {
        violations.push(
          "project.view_boundary.command must be helix progress tree-view --summary-json",
        );
      }
      if (harnessBoundary?.command?.arguments[0] !== "helix progress tree-view --summary-json") {
        violations.push(
          "harness.view_boundary.command must be helix progress tree-view --summary-json",
        );
      }
      const allCommands = [
        ...(project ? collectCommands(project) : []),
        ...(harness ? collectCommands(harness) : []),
      ];
      const fullJsonCommands = allCommands.filter(
        (command) => command.includes(" --json") && !command.includes(" --summary-json"),
      );
      const allowedFullJsonCommands: string[] = [];
      const unexpectedFullJsonCommands = fullJsonCommands.filter(
        (command) => !allowedFullJsonCommands.includes(command),
      );
      if (unexpectedFullJsonCommands.length > 0) {
        violations.push(
          `unexpected_full_json=${[...new Set(unexpectedFullJsonCommands)].slice(0, 5).join("|")}`,
        );
      }
      const prefix =
        violations.length === 0
          ? "visualization-tree-view-boundary - OK"
          : "visualization-tree-view-boundary - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: roots=${roots.join(",") || "-"} project_nodes=${projectIds.length} harness_nodes=${harnessIds.length} policy=project-view-current-location harness-view-telemetry command=helix progress tree-view --summary-json full=helix progress tree-view --json`,
          `visualization-tree-view-boundary - full-json-audit total=${fullJsonCommands.length} unexpected=${unexpectedFullJsonCommands.length} allowed=${allowedFullJsonCommands.join("|") || "none"}`,
          `visualization-tree-view-boundary - project-required=${requiredProjectIds.join(",")}`,
          `visualization-tree-view-boundary - harness-required=${requiredHarnessIds.join(",")}`,
          ...violations.map(
            (violation) => `visualization-tree-view-boundary - violation: ${violation}`,
          ),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "visualization-tree-view-boundary - violation: tree-view boundary projection could not run",
      ],
      ok: false,
    };
  }
}

export function checkVisualizationTreeViewSummarySurface(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: [
        "visualization-tree-view-summary-surface - violation: repo root could not be read",
      ],
      ok: false,
    };
  }
  const audit = buildSummarySurfaceCommandAudit(buildSummarySurfaceContractPayloads());
  const prefix =
    audit.status === "pass"
      ? "visualization-tree-view-summary-surface - OK"
      : "visualization-tree-view-summary-surface - violation";
  return {
    ok: audit.status === "pass",
    messages: [
      `${prefix}: status=${audit.status} checked=${audit.checked_surface_count} excluded=${audit.excluded_surface_count} unexpected=${audit.unexpected_count} source=helix progress tree-view --summary-json`,
      `visualization-tree-view-summary-surface - allowed-fields=${audit.allowed_fields.join(",")} excluded=${audit.excluded_surfaces.map((surface) => surface.surface).join(",")}`,
      `visualization-tree-view-summary-surface - catalog=${audit.catalog_status} expected=${audit.expected_surfaces.length} missing=${audit.missing_surfaces.length} unexpected_surfaces=${audit.unexpected_surfaces.length} source_mismatches=${audit.source_command_mismatches.length}`,
      `visualization-tree-view-summary-surface - surfaces=${audit.surfaces.map((surface) => `${surface.surface}:${surface.source_command ?? "-"}`).join(",")}`,
      ...audit.missing_surfaces.map(
        (surface) =>
          `visualization-tree-view-summary-surface - violation: missing_surface=${surface}`,
      ),
      ...audit.unexpected_surfaces.map(
        (surface) =>
          `visualization-tree-view-summary-surface - violation: unexpected_surface=${surface}`,
      ),
      ...audit.source_command_mismatches.map(
        (mismatch) =>
          `visualization-tree-view-summary-surface - violation: source_command_mismatch=${mismatch.surface}:expected=${mismatch.expected}:actual=${mismatch.actual ?? "-"}`,
      ),
      ...audit.unexpected_commands.map(
        (hit) =>
          `visualization-tree-view-summary-surface - violation: ${hit.surface}.${hit.path}=${hit.command}`,
      ),
    ],
  };
}

export function checkVscodeExtensionDynamicBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["vscode-extension-dynamic-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const tree = buildVisualizationTreeView(
        buildVisualizationViewModel(buildVisualizationSnapshot(db, { repoRoot })),
      );
      const validated = validateVisualizationTreeViewModel(tree);
      const manifest = helixVscodeContributionManifest();
      const viewIds = manifest.contributes.views.helix.map((view) => view.id);
      const commandIds = manifest.contributes.commands.map((command) => command.command);
      const violations: string[] = [];
      if (validated.roots.map((root) => root.id).join(",") !== "project,harness") {
        violations.push(`roots=${validated.roots.map((root) => root.id).join(",") || "-"}`);
      }
      for (const event of [`onView:${HELIX_PROJECT_VIEW_ID}`, `onView:${HELIX_HARNESS_VIEW_ID}`]) {
        if (!manifest.activationEvents.includes(event)) {
          violations.push(`activation.missing=${event}`);
        }
      }
      for (const viewId of [HELIX_PROJECT_VIEW_ID, HELIX_HARNESS_VIEW_ID]) {
        if (!viewIds.includes(viewId)) violations.push(`view.missing=${viewId}`);
      }
      for (const command of [HELIX_REFRESH_VISUALIZATION_COMMAND, HELIX_COPY_POINTER_COMMAND]) {
        if (!commandIds.includes(command)) violations.push(`command.missing=${command}`);
        if (!manifest.readOnlyCommands.includes(command)) {
          violations.push(`read_only_command.missing=${command}`);
        }
      }
      const extraCommands = commandIds.filter(
        (command) =>
          command !== HELIX_REFRESH_VISUALIZATION_COMMAND && command !== HELIX_COPY_POINTER_COMMAND,
      );
      if (extraCommands.length > 0) {
        violations.push(`command.extra=${extraCommands.join(",")}`);
      }
      const prefix =
        violations.length === 0
          ? "vscode-extension-dynamic-binding - OK"
          : "vscode-extension-dynamic-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: roots=${validated.roots.map((root) => root.id).join(",")} views=${viewIds.join(",")} commands=${commandIds.join(",")} read_only=${manifest.readOnlyCommands.join(",")} source=helix progress tree-view --json`,
          ...violations.map(
            (violation) => `vscode-extension-dynamic-binding - violation: ${violation}`,
          ),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch (error) {
    return {
      messages: [
        `vscode-extension-dynamic-binding - violation: VSCode dynamic tree binding could not run (${String(error)})`,
      ],
      ok: false,
    };
  }
}

export function checkL12CompatibilityBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["l12-compatibility-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const layers = snapshot.coverage.l12_layers;
      const byLayer = new Map(layers.map((layer) => [layer.layer, layer]));
      const requiredLayers = Array.from({ length: 12 }, (_, index) => `L${index + 1}`);
      const requiredProjectionPairs = [
        { label: "l0_slide", legacyLayer: "L0", l12Layer: "L1" },
        { label: "function_design", legacyLayer: "L6", l12Layer: "L5" },
        { label: "implementation", legacyLayer: "L7", l12Layer: "L6" },
        { label: "acceptance", legacyLayer: "L12", l12Layer: "L11" },
        { label: "operation", legacyLayer: "L14", l12Layer: "L12" },
        { label: "recovery", legacyLayer: "cross", l12Layer: "L12" },
      ] as const;
      const violations: string[] = [];
      for (const layer of requiredLayers) {
        if (!byLayer.has(layer)) violations.push(`missing_l12_layer=${layer}`);
      }
      const zipBindingIds = new Set(VMODEL_ZIP_SOURCE_BINDINGS.map((binding) => binding.bindingId));
      const expectedZipBindingsForLayer = (layer: string): string[] =>
        VMODEL_ZIP_SOURCE_BINDINGS.filter((binding) => binding.l12Layers.includes(layer)).map(
          (binding) => binding.bindingId,
        );
      const expectedTailoringForLayer = (layer: string): string[] => {
        if (["L1", "L2", "L3", "L4"].includes(layer)) return ["HVM-TAILOR-CORE-DESIGN"];
        if (["L5", "L6"].includes(layer)) return ["HVM-TAILOR-DETAIL-CONTRACT"];
        if (["L7", "L8", "L9", "L10", "L11"].includes(layer)) return ["HVM-TAILOR-TEST-ORACLE"];
        if (layer === "L12") return ["HVM-TAILOR-OPERATION"];
        return [];
      };
      const unexpectedLayers = layers
        .map((layer) => layer.layer)
        .filter((layer) => !requiredLayers.includes(layer));
      if (unexpectedLayers.length > 0) {
        violations.push(`unexpected_l12_layers=${unexpectedLayers.join(",")}`);
      }
      if (layers.length !== requiredLayers.length) {
        violations.push(`layer_count=${layers.length}/${requiredLayers.length}`);
      }
      const projectionStatus = (legacyLayer: string, l12Layer: string) => {
        const items = snapshot.artifact_remap.items.filter(
          (item) => item.legacyLayer === legacyLayer,
        );
        if (items.length === 0) return "not_observed";
        const matched = items.filter((item) => item.l12Layer === l12Layer);
        return matched.length > 0 ? l12Layer : `mismatch:0/${items.length}`;
      };
      const projectionSummary = requiredProjectionPairs
        .map((pair) => `${pair.label}=${projectionStatus(pair.legacyLayer, pair.l12Layer)}`)
        .join(" ");
      const l0SlideDeclaration = db
        .prepare(
          `SELECT defined_id, declaration_kind, title, layer, source_path
           FROM design_declarations
           WHERE defined_id = ?`,
        )
        .get("HVC-L1-PLANNING-INTENT") as
        | {
            defined_id: string;
            declaration_kind: string;
            title: string;
            layer: string;
            source_path: string;
          }
        | undefined;
      for (const pair of requiredProjectionPairs) {
        const status = projectionStatus(pair.legacyLayer, pair.l12Layer);
        if (status.startsWith("mismatch:")) {
          violations.push(`${pair.label}=${pair.legacyLayer}->${pair.l12Layer}:${status}`);
        }
      }
      if (!l0SlideDeclaration) {
        violations.push("l0_slide.declaration=HVC-L1-PLANNING-INTENT:missing");
      } else {
        if (l0SlideDeclaration.layer !== "L1") {
          violations.push(`l0_slide.declaration_layer=${l0SlideDeclaration.layer}`);
        }
        if (
          l0SlideDeclaration.source_path !== "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md"
        ) {
          violations.push(`l0_slide.declaration_source=${l0SlideDeclaration.source_path}`);
        }
        const declarationText = [
          l0SlideDeclaration.declaration_kind,
          l0SlideDeclaration.title,
          l0SlideDeclaration.source_path,
        ]
          .join(" ")
          .toLowerCase();
        if (!declarationText.includes("企画") && !declarationText.includes("planning")) {
          violations.push("l0_slide.declaration_intent=planning:missing");
        }
      }
      if (snapshot.current.layer === "L0" && snapshot.current.l12_layer !== "L1") {
        violations.push(`current_l0_projection=${snapshot.current.l12_layer ?? "-"}`);
      }
      if (snapshot.current.layer === "L14" && snapshot.current.l12_layer !== "L12") {
        violations.push(`current_l14_projection=${snapshot.current.l12_layer ?? "-"}`);
      }
      if (snapshot.artifact_remap.layers.length !== requiredLayers.length) {
        violations.push(
          `artifact_remap_layers=${snapshot.artifact_remap.layers.length}/${requiredLayers.length}`,
        );
      }
      const unmapped = snapshot.findings.filter(
        (finding) => finding.code === "artifact_remap_unmapped",
      );
      if (unmapped.length > 0) violations.push(`artifact_remap_unmapped=${unmapped.length}`);
      const missingRemapLayers = requiredLayers.filter(
        (layer) => !snapshot.artifact_remap.layers.some((item) => item.layer === layer),
      );
      if (missingRemapLayers.length > 0) {
        violations.push(`artifact_remap_missing_layers=${missingRemapLayers.join(",")}`);
      }
      const metadataLayerViolations: string[] = [];
      for (const layer of layers) {
        const expectedZipBindings = expectedZipBindingsForLayer(layer.layer);
        const expectedTailoring = expectedTailoringForLayer(layer.layer);
        const actualZipBindings = layer.zipSourceBindingIds ?? [];
        const actualTailoring = layer.tailoringRuleIds ?? [];
        const actualDetails = layer.tailoringDetailLevels ?? [];
        const missingZipBindings = expectedZipBindings.filter(
          (id) => !actualZipBindings.includes(id),
        );
        const unknownZipBindings = actualZipBindings.filter((id) => !zipBindingIds.has(id));
        const missingTailoring = expectedTailoring.filter((id) => !actualTailoring.includes(id));
        if (missingZipBindings.length > 0) {
          metadataLayerViolations.push(`${layer.layer}.zip=${missingZipBindings.join("+")}`);
        }
        if (unknownZipBindings.length > 0) {
          metadataLayerViolations.push(
            `${layer.layer}.zip_unknown=${unknownZipBindings.join("+")}`,
          );
        }
        if (missingTailoring.length > 0) {
          metadataLayerViolations.push(`${layer.layer}.tailoring=${missingTailoring.join("+")}`);
        }
        if (actualDetails.length === 0) {
          metadataLayerViolations.push(`${layer.layer}.detail=missing`);
        }
      }
      if (metadataLayerViolations.length > 0) {
        violations.push(`coverage_metadata=${metadataLayerViolations.join(",")}`);
      }
      const remapWithLayer = snapshot.artifact_remap.items.filter((item) => item.l12Layer !== null);
      const remapMissingZipMetadata = remapWithLayer.filter(
        (item) => (item.zipSourceBindingIds ?? []).length === 0,
      );
      const remapMissingTailoringMetadata = remapWithLayer.filter(
        (item) =>
          (item.tailoringRuleIds ?? []).length === 0 ||
          (item.tailoringDetailLevels ?? []).length === 0,
      );
      const remapUnknownZipMetadata = remapWithLayer.filter((item) =>
        (item.zipSourceBindingIds ?? []).some((id) => !zipBindingIds.has(id)),
      );
      if (remapMissingZipMetadata.length > 0) {
        violations.push(`artifact_remap_zip_metadata_missing=${remapMissingZipMetadata.length}`);
      }
      if (remapMissingTailoringMetadata.length > 0) {
        violations.push(
          `artifact_remap_tailoring_metadata_missing=${remapMissingTailoringMetadata.length}`,
        );
      }
      if (remapUnknownZipMetadata.length > 0) {
        violations.push(`artifact_remap_zip_metadata_unknown=${remapUnknownZipMetadata.length}`);
      }
      const legacySummary = requiredLayers
        .map((layer) => `${layer}=${byLayer.get(layer)?.legacyLayers.join("+") ?? "-"}`)
        .join(" ");
      const artifactSummary = snapshot.artifact_remap.layers
        .map(
          (layer) =>
            `${layer.layer}:${layer.status}:${layer.done}/${layer.missing}/${layer.reverify}:${layer.driveModel}`,
        )
        .join(",");
      const metadataSummary = requiredLayers
        .map((layer) => {
          const coverage = byLayer.get(layer);
          return `${layer}:zip=${coverage?.zipSourceBindingIds?.length ?? 0}:tailoring=${coverage?.tailoringRuleIds?.join("+") || "-"}`;
        })
        .join(" ");
      const prefix =
        violations.length === 0
          ? "l12-compatibility-binding - OK"
          : "l12-compatibility-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: layers=${layers.length} current=${snapshot.current.layer ?? "-"}->${snapshot.current.l12_layer ?? "-"} ${projectionSummary} remap=${snapshot.artifact_remap.done}/${snapshot.artifact_remap.missing}/${snapshot.artifact_remap.reverify} command=helix current-location --json`,
          `l12-compatibility-binding - l0-slide: declaration=${l0SlideDeclaration?.defined_id ?? "-"} layer=${l0SlideDeclaration?.layer ?? "-"} source=${l0SlideDeclaration?.source_path ?? "-"}`,
          `l12-compatibility-binding - legacy-map: ${legacySummary}`,
          `l12-compatibility-binding - artifact-remap: ${artifactSummary || "-"}`,
          `l12-compatibility-binding - coverage-metadata: ${metadataSummary} remap_zip=${remapWithLayer.length - remapMissingZipMetadata.length}/${remapWithLayer.length} remap_tailoring=${remapWithLayer.length - remapMissingTailoringMetadata.length}/${remapWithLayer.length}`,
          ...violations.map((violation) => `l12-compatibility-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "l12-compatibility-binding - violation: L12 compatibility projection could not run",
      ],
      ok: false,
    };
  }
}

export function checkRoadmapCurrentBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["roadmap-current-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const report = buildProjectRoadmapCurrentReport(snapshot);
      const violations: string[] = [];
      if (report.schema_version !== "project-roadmap-current.v1") {
        violations.push(`schema_version=${report.schema_version}`);
      }
      if (report.source_command !== "helix roadmap current --json") {
        violations.push(`source_command=${report.source_command}`);
      }
      if (report.view_command !== "helix progress tree-view --json") {
        violations.push(`view_command=${report.view_command}`);
      }
      const driveRouteAction = report.actions.find((action) => action.category === "drive_route");
      const currentBindingLayers =
        report.consistency.roadmap_projected_l12_layers.length > 0
          ? report.consistency.roadmap_projected_l12_layers
          : (driveRouteAction?.l12_layers ?? []);
      const expectedL12Layers = Array.from({ length: 12 }, (_, index) => `L${index + 1}`);
      const roadmapCoverageLayerSet = new Set(
        report.roadmap_position.bands.flatMap((band) => band.l12Layers),
      );
      const roadmapCoverageLayers = expectedL12Layers.filter((layer) =>
        roadmapCoverageLayerSet.has(layer),
      );
      const missingRoadmapCoverageLayers = expectedL12Layers.filter(
        (layer) => !roadmapCoverageLayers.includes(layer),
      );
      if (report.roadmap_position.bands.length !== report.roadmap_position.rollup.total_bands) {
        violations.push(
          `roadmap_band_count=${report.roadmap_position.bands.length}/${report.roadmap_position.rollup.total_bands}`,
        );
      }
      if (missingRoadmapCoverageLayers.length > 0) {
        violations.push(`roadmap_l12_coverage_missing=${missingRoadmapCoverageLayers.join(",")}`);
      }
      if (
        !report.roadmap_position.implementationDependencies.includes("roadmap_rollups") ||
        !report.roadmap_position.implementationDependencies.includes("roadmap_band_coverage")
      ) {
        violations.push("roadmap_l12_coverage_tables=missing");
      }
      if (!report.consistency.db_current_l12_layer) {
        violations.push("db_current_l12_layer=missing");
      }
      if (
        report.consistency.db_current_l12_layer &&
        !/^L\d+$/.test(report.consistency.db_current_l12_layer)
      ) {
        violations.push(
          `db_current_l12_layer_not_canonical=${report.consistency.db_current_l12_layer}`,
        );
      }
      if (currentBindingLayers.length === 0) {
        violations.push("current_binding_l12_layers=empty");
      }
      if (
        report.consistency.db_current_l12_layer &&
        currentBindingLayers.length > 0 &&
        !currentBindingLayers.includes(report.consistency.db_current_l12_layer)
      ) {
        violations.push(
          `db_current_l12_layer=${report.consistency.db_current_l12_layer} not in current_binding_l12_layers`,
        );
      }
      if (!driveRouteAction) {
        violations.push("drive_route_action=missing");
      } else {
        if (driveRouteAction.action_id !== report.drive_route.routeId) {
          violations.push(
            `drive_route_action=${driveRouteAction.action_id} route=${report.drive_route.routeId}`,
          );
        }
        if (driveRouteAction.l12_layers.length === 0) {
          violations.push("drive_route_action.l12_layers=empty");
        }
        if (report.drive_route.mustReturnToDesign) {
          if (driveRouteAction.doc_dependencies.length === 0) {
            violations.push("drive_route_action.doc_dependencies=empty");
          }
          if (driveRouteAction.implementation_dependencies.length === 0) {
            violations.push("drive_route_action.implementation_dependencies=empty");
          }
          if (
            !driveRouteAction.doc_dependencies.includes("docs/design/**") ||
            !driveRouteAction.doc_dependencies.includes("docs/test-design/**")
          ) {
            violations.push("drive_route_action.doc_dependencies missing design/test-design");
          }
        }
      }
      if (report.counts.actions !== report.actions.length) {
        violations.push(`actions_count=${report.counts.actions}/${report.actions.length}`);
      }
      for (const command of [
        "helix db rebuild",
        "helix roadmap current --json",
        "helix current-location --json",
        "helix vmodel fit",
      ]) {
        if (!report.postcheck_commands.includes(command)) {
          violations.push(`missing_postcheck=${command}`);
        }
      }
      const prefix =
        violations.length > 0
          ? "roadmap-current-binding - violation"
          : report.consistency.aligned
            ? "roadmap-current-binding - OK"
            : "roadmap-current-binding - advisory";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${report.status} aligned=${report.consistency.aligned} basis=${report.consistency.alignment_basis} db=${report.consistency.db_current_l12_layer ?? "-"} roadmap=${report.consistency.roadmap_current_l12_layers.join(",") || "-"} projected=${report.consistency.roadmap_projected_l12_layers.join(",") || "-"} terminal=${report.consistency.roadmap_terminal_l12_layers.join(",") || "-"} route=${report.drive_route.routeId} blockers=${report.counts.blockers} actions=${report.counts.actions} command=${report.source_command}`,
          `roadmap-current-binding - current-link: current=${report.current.layer ?? "-"}->${report.current.l12_layer ?? "-"} status=${report.current.status} effective=${currentBindingLayers.join(",") || "-"} drive_action=${driveRouteAction?.action_id ?? "-"} drive_layers=${driveRouteAction?.l12_layers.join(",") || "-"} drive_doc=${driveRouteAction?.doc_dependencies.length ?? 0} drive_impl=${driveRouteAction?.implementation_dependencies.length ?? 0}`,
          `roadmap-current-binding - l12-coverage: bands=${report.roadmap_position.bands.length}/${report.roadmap_position.rollup.total_bands} layers=${roadmapCoverageLayers.join(",") || "-"} tables=${report.roadmap_position.implementationDependencies.join(",") || "-"}`,
          `roadmap-current-binding - postcheck=${report.postcheck_commands.join(" && ")} view=${report.view_command} write=${report.write_policy}`,
          `roadmap-current-binding - blocking-findings=${report.consistency.blocking_findings.join(",") || "-"} reasons=${report.consistency.reasons.join(" | ")}`,
          ...violations.map((violation) => `roadmap-current-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "roadmap-current-binding - violation: roadmap current binding projection could not run",
      ],
      ok: false,
    };
  }
}

export function checkDriveModelBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["drive-model-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const report = buildProjectDriveModelReport(snapshot);
      const violations: string[] = [];
      const expectedModels = [
        "Forward",
        "Discovery",
        "Scrum",
        "Reverse",
        "Recovery",
        "Incident",
        "Refactor",
        "Retrofit",
        "Add-feature",
        "version-up",
        "Research",
        "OperationVerification",
      ];
      const candidateModels = report.candidates.map((candidate) => candidate.model);
      for (const model of expectedModels) {
        if (!candidateModels.includes(model as (typeof candidateModels)[number])) {
          violations.push(`missing_candidate=${model}`);
        }
      }
      if (report.schema_version !== "project-drive-model.v1") {
        violations.push(`schema_version=${report.schema_version}`);
      }
      if (report.source_command !== "helix drive model --json") {
        violations.push(`source_command=${report.source_command}`);
      }
      if (report.view_command !== "helix progress tree-view --json") {
        violations.push(`view_command=${report.view_command}`);
      }
      if (report.selected_candidate.model !== report.selected_model) {
        violations.push(
          `selected_candidate=${report.selected_candidate.model} selected=${report.selected_model}`,
        );
      }
      if (report.selected_candidate.status !== "selected") {
        violations.push(`selected_status=${report.selected_candidate.status}`);
      }
      if (report.registered_entry_model_count !== 10) {
        violations.push(`registered_entry_model_count=${report.registered_entry_model_count}`);
      }
      if (report.missing_registered_entry_models.length > 0) {
        violations.push(
          `missing_registered_entry_models=${report.missing_registered_entry_models.join(",")}`,
        );
      }
      const selectedDeps = {
        doc: report.selected_candidate.doc_dependencies,
        impl: report.selected_candidate.implementation_dependencies,
      };
      if (selectedDeps.doc.length === 0) {
        violations.push(`selected_doc_dependencies=empty:${report.selected_candidate.model}`);
      }
      if (selectedDeps.impl.length === 0) {
        violations.push(
          `selected_implementation_dependencies=empty:${report.selected_candidate.model}`,
        );
      }
      const reverseCandidate = report.candidates.find((candidate) => candidate.model === "Reverse");
      const recoveryCandidate = report.candidates.find(
        (candidate) => candidate.model === "Recovery",
      );
      const forwardCandidate = report.candidates.find((candidate) => candidate.model === "Forward");
      const operationCandidate = report.candidates.find(
        (candidate) => candidate.model === "OperationVerification",
      );
      if (report.selected_candidate.trigger.length === 0) {
        violations.push("selected_candidate.trigger=empty");
      }
      if (report.selected_candidate.required_action.length === 0) {
        violations.push("selected_candidate.required_action=empty");
      }
      if (report.selected_model !== "Forward" && forwardCandidate?.status !== "blocked") {
        violations.push(
          `Forward.status=${forwardCandidate?.status ?? "missing"} while selected=${report.selected_model}`,
        );
      }
      for (const candidate of [reverseCandidate, recoveryCandidate]) {
        if (!candidate) continue;
        if (candidate.doc_dependencies.length === 0) {
          violations.push(`${candidate.model}.doc_dependencies=empty`);
        }
        if (candidate.implementation_dependencies.length === 0) {
          violations.push(`${candidate.model}.implementation_dependencies=empty`);
        }
        if (
          !candidate.doc_dependencies.includes("docs/design/**") ||
          !candidate.doc_dependencies.includes("docs/test-design/**")
        ) {
          violations.push(`${candidate.model}.doc_dependencies missing design/test-design`);
        }
        if (snapshot.drive_route.mustReturnToDesign) {
          for (const dependency of snapshot.drive_route.reverse.docDependencies) {
            if (!candidate.doc_dependencies.includes(dependency)) {
              violations.push(`${candidate.model}.doc_dependencies missing reverse ${dependency}`);
            }
          }
          for (const dependency of snapshot.drive_route.reverse.implementationDependencies) {
            if (!candidate.implementation_dependencies.includes(dependency)) {
              violations.push(
                `${candidate.model}.implementation_dependencies missing reverse ${dependency}`,
              );
            }
          }
        }
      }
      if (!operationCandidate) {
        violations.push("OperationVerification.candidate=missing");
      } else {
        if (!operationCandidate.coverage_ids.includes("L12-operation-observability")) {
          violations.push("OperationVerification.coverage=L12-operation-observability:missing");
        }
        if (
          !operationCandidate.doc_dependencies.includes("docs/design/**") ||
          !operationCandidate.doc_dependencies.includes("docs/test-design/**")
        ) {
          violations.push("OperationVerification.doc_dependencies missing design/test-design");
        }
        for (const dependency of [
          "design_declarations",
          "runtime_verification_events",
          "closure_next_action_ledger",
        ]) {
          if (!operationCandidate.implementation_dependencies.includes(dependency)) {
            violations.push(
              `OperationVerification.implementation_dependencies missing ${dependency}`,
            );
          }
        }
      }
      if (snapshot.drive_route.mustReturnToDesign) {
        if (!snapshot.drive_route.reverse.required) {
          violations.push("drive_route.mustReturnToDesign without reverse.required");
        }
        if (snapshot.drive_route.reverse.docDependencies.length === 0) {
          violations.push("drive_route.reverse.docDependencies=empty");
        }
        if (snapshot.drive_route.reverse.implementationDependencies.length === 0) {
          violations.push("drive_route.reverse.implementationDependencies=empty");
        }
        if (snapshot.drive_route.reverse.coverageIds.length === 0) {
          violations.push("drive_route.reverse.coverageIds=empty");
        }
      }
      const summarizeDependencies = (values: readonly string[], separator = ","): string => {
        const uniqueValues = [...new Set(values)];
        const priority = [
          "docs/design/**",
          "docs/test-design/**",
          "docs/design",
          "docs/test-design",
        ].filter((value) => uniqueValues.includes(value));
        const shown = [
          ...priority,
          ...uniqueValues.filter((value) => !priority.includes(value)).slice(0, 6),
        ].slice(0, 8);
        const suffix =
          uniqueValues.length > shown.length ? ` (+${uniqueValues.length - shown.length})` : "";
        return `${shown.join(separator) || "-"}${suffix}`;
      };
      for (const command of [
        "helix drive model --json",
        "helix current-location --json",
        "helix roadmap current --json",
        "helix vmodel fit",
      ]) {
        if (!report.postcheck_commands.includes(command)) {
          violations.push(`missing_postcheck=${command}`);
        }
      }
      const prefix =
        violations.length === 0 ? "drive-model-binding - OK" : "drive-model-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: selected=${report.selected_model} status=${report.selection_status} route=${report.selected_candidate.route_id} coverage=${report.selected_candidate.coverage_ids.join(",") || "-"} available=${report.available_models.join(",") || "-"} blocked=${report.blocked_models.join(",") || "-"} command=${report.source_command}`,
          `drive-model-binding - selection-rationale: selected=${report.selected_model} default=${report.default_model} trigger=${report.selected_candidate.trigger} action=${report.selected_candidate.required_action} reasons=${report.selected_candidate.reasons.join(" | ") || "-"}`,
          `drive-model-binding - forward-gate: status=${forwardCandidate?.status ?? "-"} trigger=${forwardCandidate?.trigger ?? "-"} action=${forwardCandidate?.required_action ?? "-"} reasons=${forwardCandidate?.reasons.join(" | ") || "-"}`,
          `drive-model-binding - dependency-closure: selected_doc=${selectedDeps.doc.length} selected_impl=${selectedDeps.impl.length} reverse_doc=${snapshot.drive_route.reverse.docDependencies.length} reverse_impl=${snapshot.drive_route.reverse.implementationDependencies.length} reverse_targets=${snapshot.drive_route.reverse.targets.join(",") || "-"} must_return=${snapshot.drive_route.mustReturnToDesign}`,
          `drive-model-binding - reverse-dependency-closure: coverage=${snapshot.drive_route.reverse.coverageIds.join(",") || "-"} docs=${summarizeDependencies(snapshot.drive_route.reverse.docDependencies)} impl=${summarizeDependencies(snapshot.drive_route.reverse.implementationDependencies)} actions=${snapshot.drive_route.reverse.queueActions.join(",") || "-"} ledgers=${snapshot.drive_route.reverse.ledgerIds.join(",") || "-"}`,
          `drive-model-binding - candidate-dependency-closure: ${
            [recoveryCandidate, reverseCandidate]
              .filter(
                (candidate): candidate is NonNullable<typeof candidate> => candidate !== undefined,
              )
              .map(
                (candidate) =>
                  `${candidate.model}:docs=${summarizeDependencies(candidate.doc_dependencies, "+")}:impl=${summarizeDependencies(candidate.implementation_dependencies, "+")}`,
              )
              .join(" | ") || "-"
          }`,
          `drive-model-binding - operation-verification: coverage=${operationCandidate?.coverage_ids.join(",") || "-"} doc=${operationCandidate?.doc_dependencies.join(",") || "-"} impl=${operationCandidate?.implementation_dependencies.join(",") || "-"}`,
          `drive-model-binding - candidates=${report.candidates.map((candidate) => `${candidate.rank}:${candidate.model}:${candidate.status}:${candidate.coverage_ids.join("+") || "-"}`).join(" | ")}`,
          `drive-model-binding - postcheck=${report.postcheck_commands.join(" && ")} view=${report.view_command} write=${report.write_policy}`,
          ...violations.map((violation) => `drive-model-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["drive-model-binding - violation: drive model binding projection could not run"],
      ok: false,
    };
  }
}

export function checkProjectSkillBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["project-skill-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const report = buildProjectDriveModelReport(snapshot);
      const binding = snapshot.skill_binding;
      const violations: string[] = [];
      if (!binding) {
        violations.push("skill_binding=missing");
      } else {
        if (binding.status !== "ready") {
          violations.push(`status=${binding.status}`);
        }
        if (binding.sourcePackage !== "ハイブリッド設計ドキュメントv1-fixed.zip") {
          violations.push(`source_package=${binding.sourcePackage}`);
        }
        if (binding.command !== "helix skill suggest --current-location --summary-json") {
          violations.push(`command=${binding.command}`);
        }
        if (binding.selectedModel !== report.selected_model) {
          violations.push(
            `selected_model=${binding.selectedModel} drive_model=${report.selected_model}`,
          );
        }
        if (!binding.workflowModes.includes(report.selected_model)) {
          violations.push(`workflow_modes missing selected_model=${report.selected_model}`);
        }
        if (
          (snapshot.scrum_operation?.status === "active" ||
            snapshot.scrum_operation?.status === "planned") &&
          !binding.workflowModes.includes("Scrum")
        ) {
          violations.push("workflow_modes missing Scrum while scrum operation is active/planned");
        }
        if (
          (snapshot.current.l12_layer ?? "").length > 0 &&
          !binding.l12Layers.includes(snapshot.current.l12_layer ?? "")
        ) {
          violations.push(`l12_layers missing current=${snapshot.current.l12_layer}`);
        }
        for (const dependency of ["docs/skills/SKILL_MAP.md"]) {
          if (!binding.docDependencies.includes(dependency)) {
            violations.push(`doc_dependencies missing ${dependency}`);
          }
        }
        for (const dependency of ["automation_assets", "skill_recommendations"]) {
          if (!binding.implementationDependencies.includes(dependency)) {
            violations.push(`implementation_dependencies missing ${dependency}`);
          }
        }
        for (const sourceBinding of snapshot.scrum_operation?.sourceBindings ?? []) {
          if (!binding.sourceBindings.includes(sourceBinding)) {
            violations.push(`source_bindings missing ${sourceBinding}`);
          }
        }
        if (binding.items.length === 0) {
          violations.push("items=empty");
        }
        if (binding.requiredSkills === 0) {
          violations.push("required_skills=0");
        }
        const rankIssues = binding.items.filter((item, index) => item.rank !== index + 1);
        if (rankIssues.length > 0) {
          violations.push(`rank_sequence=${rankIssues.map((item) => item.skillId).join(",")}`);
        }
        const missingBeforeWork = binding.items.filter(
          (item) => item.tier === "required" && item.injectAt !== "before_work",
        );
        if (missingBeforeWork.length > 0) {
          violations.push(
            `required_inject_at=${missingBeforeWork.map((item) => `${item.skillId}:${item.injectAt}`).join(",")}`,
          );
        }
        const unmatchedItems = binding.items.filter(
          (item) => item.matchedDriveModels.length === 0 && item.matchedLayers.length === 0,
        );
        if (unmatchedItems.length > 0) {
          violations.push(
            `unmatched_items=${unmatchedItems.map((item) => item.skillId).join(",")}`,
          );
        }
        const missingSkillPaths = binding.items.filter((item) => item.skillPath.length === 0);
        if (missingSkillPaths.length > 0) {
          violations.push(
            `skill_path_missing=${missingSkillPaths.map((item) => item.skillId).join(",")}`,
          );
        }
      }
      const prefix =
        violations.length === 0
          ? "project-skill-binding - OK"
          : "project-skill-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${binding?.status ?? "missing"} selected=${binding?.selectedModel ?? "-"} workflow=${binding?.workflowModes.join(",") || "-"} layers=${binding?.l12Layers.join(",") || "-"} required=${binding?.requiredSkills ?? 0} recommended=${binding?.recommendedSkills ?? 0} optional=${binding?.optionalSkills ?? 0} command=${binding?.command ?? "-"}`,
          `project-skill-binding - source=${binding?.sourcePackage ?? "-"} bindings=${binding?.sourceBindings.join(",") || "-"} doc=${binding?.docDependencies.join(",") || "-"} impl=${binding?.implementationDependencies.join(",") || "-"}`,
          `project-skill-binding - items=${binding?.items.map((item) => `${item.rank}:${item.skillId}:${item.tier}:${item.score}:${item.injectAt}:drive=${item.matchedDriveModels.join("+") || "-"}:layers=${item.matchedLayers.join("+") || "-"}`).join(" | ") || "-"}`,
          ...violations.map((violation) => `project-skill-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["project-skill-binding - violation: skill binding projection could not run"],
      ok: false,
    };
  }
}

export function checkRecoveryRunwayBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["recovery-runway-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const runway = fit.recovery_runway_gate;
      const violations: string[] = [];
      const blocking = runway.current_blocking_count;
      const phaseSequences = runway.phases.map((phase) => phase.sequence);
      if (blocking > 0 && runway.phases.length === 0) {
        violations.push("phases=empty");
      }
      if (runway.required_phase_count !== runway.phases.length) {
        violations.push(
          `required_phase_count=${runway.required_phase_count}/${runway.phases.length}`,
        );
      }
      if (blocking > 0 && !runway.next_phase_action) {
        violations.push("next_phase_action=missing");
      }
      if (blocking > 0 && runway.next_command.length === 0) {
        violations.push("next_command=missing");
      }
      if (blocking > 0 && runway.next_execution_command.length === 0) {
        violations.push("next_execution_command=missing");
      }
      if (
        runway.machine_actionable_count > 0 &&
        (!runway.next_machine_command ||
          !runway.next_machine_probe_command ||
          !runway.next_machine_materialize_command)
      ) {
        violations.push("machine_lane_commands=missing");
      }
      for (const [index, sequence] of phaseSequences.entries()) {
        if (sequence !== index + 1) violations.push(`phase_sequence=${phaseSequences.join(",")}`);
      }
      for (const phase of runway.phases) {
        if (phase.count <= 0)
          violations.push(`${phase.sequence}.${phase.action}.count=${phase.count}`);
        if (phase.remaining_after_phase < 0) {
          violations.push(
            `${phase.sequence}.${phase.action}.remaining=${phase.remaining_after_phase}`,
          );
        }
        if (phase.command.length === 0) {
          violations.push(`${phase.sequence}.${phase.action}.command=missing`);
        }
        if (phase.postcheck_commands.length === 0) {
          violations.push(`${phase.sequence}.${phase.action}.postcheck=missing`);
        }
        if (
          phase.phase_type === "machine" &&
          (!phase.evidence_probe_command ||
            !phase.evidence_materialize_command ||
            !phase.evidence_approval_draft_command ||
            !phase.evidence_apply_dry_run_command)
        ) {
          violations.push(`${phase.sequence}.${phase.action}.machine_evidence_commands=missing`);
        }
        if (phase.phase_type === "approval" && !phase.human_required) {
          violations.push(`${phase.sequence}.${phase.action}.approval_human_required=false`);
        }
        if (phase.phase_type === "design" && phase.human_required) {
          violations.push(`${phase.sequence}.${phase.action}.design_human_required=true`);
        }
      }
      const phaseSummary = runway.phases
        .map(
          (phase) =>
            `${phase.sequence}:${phase.phase_type}:${phase.action}:${phase.count}:remaining=${phase.remaining_after_phase}:next=${phase.next_gate}`,
        )
        .join(",");
      const commandSummary = [
        `next=${runway.next_command}`,
        `execute=${runway.next_execution_command}`,
        `machine=${runway.next_machine_command ?? "-"}`,
        `probe=${runway.next_machine_probe_command ?? "-"}`,
        `materialize=${runway.next_machine_materialize_command ?? "-"}`,
        `approval_draft=${runway.next_machine_approval_draft_command ?? "-"}`,
        `apply_dry_run=${runway.next_machine_apply_dry_run_command ?? "-"}`,
      ].join(" ");
      const prefix =
        violations.length === 0
          ? "recovery-runway-binding - OK"
          : "recovery-runway-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${runway.status} blocking=${runway.current_blocking_count} machine=${runway.machine_actionable_count} approval=${runway.human_approval_count} reverse=${runway.design_reverse_count} after_machine=${runway.remaining_after_machine_lanes} phases=${runway.required_phase_count} next=${runway.next_phase_action ?? "-"} phase=${runway.next_phase_type ?? "-"} gate=${runway.next_gate} command=${runway.command}`,
          `recovery-runway-binding - commands: ${commandSummary}`,
          `recovery-runway-binding - phases: ${phaseSummary || "none"}`,
          ...violations.map((violation) => `recovery-runway-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["recovery-runway-binding - violation: recovery runway projection could not run"],
      ok: false,
    };
  }
}

/**
 * approval invariant は decision draft が公開され、review対象が固定された後だけ適用する。
 * fresh clone の draft 未生成状態は machine action を案内する正常な approval-required frontier。
 */
export function requiresPublishedApprovalHandoff(input: {
  effective_phase: string;
  reason_codes: readonly string[];
}): boolean {
  return (
    input.effective_phase === "approval" &&
    !input.reason_codes.includes("handoff.decision_draft.missing")
  );
}

export interface MissingDraftApprovalHandoff {
  effective_phase: string;
  reason_codes: readonly string[];
  status: string;
  handoff_missing: number;
  handoff_present: number;
  approval_state: string;
  approval_status: string | null;
  scope_status: string | null;
  approval_scope_digest: string | null;
  expected_approval_scope_digest: string | null;
  decision_id: string | null;
  reviewed_candidate_count: number | null;
  valid_for_apply: boolean;
  command: string;
}

/** decision draft未生成frontierにも、公開済みapprovalとは別のfail-close不変条件を課す。 */
export function missingDraftApprovalHandoffViolations(
  input: MissingDraftApprovalHandoff,
): string[] {
  const isMissingDraftFrontier =
    input.effective_phase === "approval" &&
    input.reason_codes.includes("handoff.decision_draft.missing");
  if (!isMissingDraftFrontier) return [];

  const violations: string[] = [];
  if (input.status !== "approval_required") violations.push(`missing_draft.status=${input.status}`);
  if (input.handoff_missing < 1)
    violations.push(`missing_draft.handoff_missing=${input.handoff_missing}`);
  if (input.handoff_present !== 0)
    violations.push(`missing_draft.handoff_present=${input.handoff_present}`);
  if (input.reason_codes.includes("handoff.decision_draft.present"))
    violations.push("missing_draft.present_reason=true");
  if (input.approval_state !== "missing")
    violations.push(`missing_draft.approval_state=${input.approval_state}`);
  if (input.approval_status !== "missing")
    violations.push(`missing_draft.approval_status=${input.approval_status ?? "-"}`);
  if (input.scope_status !== "not_checked")
    violations.push(`missing_draft.scope_status=${input.scope_status ?? "-"}`);
  if (input.approval_scope_digest !== null)
    violations.push(`missing_draft.approval_scope_digest=${input.approval_scope_digest}`);
  if (input.expected_approval_scope_digest !== null)
    violations.push(
      `missing_draft.expected_approval_scope_digest=${input.expected_approval_scope_digest}`,
    );
  if (input.decision_id !== null) violations.push(`missing_draft.decision_id=${input.decision_id}`);
  if ((input.reviewed_candidate_count ?? 0) !== 0)
    violations.push(`missing_draft.reviewed_candidate_count=${input.reviewed_candidate_count}`);
  if (input.valid_for_apply) violations.push("missing_draft.valid_for_apply=true");
  if (!input.command.includes("closure decision-draft --action close_ready"))
    violations.push(`missing_draft.command=${input.command}`);
  return violations;
}

export function checkRecoveryHandoffBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["recovery-handoff-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const handoff = fit.recovery_handoff_gate;
      const runway = fit.recovery_runway_gate;
      const handoffDbRow = db
        .prepare(
          `SELECT status, handoff_total, approval_pending, scope_mismatch, recovery_gate_status,
                  effective_phase, approval_state, approval_status, scope_status, valid_for_apply,
                  reason_codes
           FROM project_vmodel_handoff_summary
           WHERE summary_id = ?`,
        )
        .get("recovery_handoff") as
        | {
            status: string;
            handoff_total: number;
            approval_pending: number;
            scope_mismatch: number;
            recovery_gate_status: string;
            effective_phase: string;
            approval_state: string;
            approval_status: string | null;
            scope_status: string | null;
            valid_for_apply: number;
            reason_codes: string;
          }
        | undefined;
      const violations: string[] = [];
      const approvalPhase = requiresPublishedApprovalHandoff(handoff);
      violations.push(...missingDraftApprovalHandoffViolations(handoff));
      if (!handoffDbRow) {
        violations.push("db_row=missing");
      } else {
        if (handoffDbRow.recovery_gate_status !== handoff.status) {
          violations.push(`db.recovery_gate_status=${handoffDbRow.recovery_gate_status}`);
        }
        if (handoffDbRow.effective_phase !== handoff.effective_phase) {
          violations.push(`db.effective_phase=${handoffDbRow.effective_phase}`);
        }
        if (handoffDbRow.approval_state !== handoff.approval_state) {
          violations.push(`db.approval_state=${handoffDbRow.approval_state}`);
        }
        if ((handoffDbRow.approval_status ?? null) !== (handoff.approval_status ?? null)) {
          violations.push(`db.approval_status=${handoffDbRow.approval_status ?? "-"}`);
        }
        if ((handoffDbRow.scope_status ?? null) !== (handoff.scope_status ?? null)) {
          violations.push(`db.scope_status=${handoffDbRow.scope_status ?? "-"}`);
        }
        if (Boolean(handoffDbRow.valid_for_apply) !== handoff.valid_for_apply) {
          violations.push(`db.valid_for_apply=${handoffDbRow.valid_for_apply}`);
        }
        for (const code of handoff.reason_codes) {
          if (!handoffDbRow.reason_codes.split(",").includes(code)) {
            violations.push(`db.reason_code_missing=${code}`);
          }
        }
      }
      if (runway.machine_actionable_count > 0 && handoff.status === "none") {
        violations.push("handoff_status=none");
      }
      const closeReadyDecisionDraft =
        handoff.decision_id === "closure-review:close_ready" ||
        handoff.reason_codes.includes("handoff.decision_draft.present") ||
        handoff.reason_codes.includes("handoff.decision_draft.missing");
      if (approvalPhase && handoff.handoff_missing > 0) {
        violations.push(`handoff_missing=${handoff.handoff_missing}`);
      }
      if (approvalPhase && closeReadyDecisionDraft && handoff.handoff_present < 1) {
        violations.push(`handoff_present=${handoff.handoff_present}`);
      }
      if (approvalPhase && !closeReadyDecisionDraft && handoff.handoff_present < 2) {
        violations.push(`handoff_present=${handoff.handoff_present}`);
      }
      if (
        approvalPhase &&
        handoff.approval_status !== "pending_human_review" &&
        handoff.approval_status !== "approved" &&
        handoff.approval_status !== "rejected"
      ) {
        violations.push(`approval_status=${handoff.approval_status ?? "-"}`);
      }
      if (approvalPhase && handoff.scope_status !== "match") {
        violations.push(`scope_status=${handoff.scope_status ?? "-"}`);
      }
      if (approvalPhase && !handoff.approval_scope_digest?.startsWith("sha256:")) {
        violations.push(`approval_scope_digest=${handoff.approval_scope_digest ?? "-"}`);
      }
      if (
        approvalPhase &&
        handoff.approval_scope_digest !== handoff.expected_approval_scope_digest
      ) {
        violations.push(
          `digest_mismatch=${handoff.approval_scope_digest ?? "-"}/${handoff.expected_approval_scope_digest ?? "-"}`,
        );
      }
      if (
        approvalPhase &&
        !closeReadyDecisionDraft &&
        handoff.materialize_status !== "ready_for_approval"
      ) {
        violations.push(`materialize_status=${handoff.materialize_status ?? "-"}`);
      }
      if (approvalPhase && (handoff.reviewed_candidate_count ?? 0) <= 0) {
        violations.push(`reviewed_candidate_count=${handoff.reviewed_candidate_count ?? 0}`);
      }
      if (handoff.approval_status === "pending_human_review" && handoff.valid_for_apply) {
        violations.push("valid_for_apply=true_while_pending");
      }
      if (
        approvalPhase &&
        closeReadyDecisionDraft &&
        !handoff.command.includes("closure review-bundle --action close_ready")
      ) {
        violations.push(`command=${handoff.command}`);
      }
      if (
        approvalPhase &&
        !closeReadyDecisionDraft &&
        !handoff.command.includes("closure evidence-materialize")
      ) {
        violations.push(`command=${handoff.command}`);
      }
      const prefix =
        violations.length === 0
          ? "recovery-handoff-binding - OK"
          : "recovery-handoff-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${handoff.status} phase=${handoff.effective_phase} approval=${handoff.approval_status ?? "-"} scope=${handoff.scope_status ?? "-"} materialize=${handoff.materialize_status ?? "-"} valid=${handoff.valid_for_apply} present=${handoff.handoff_present} missing=${handoff.handoff_missing} reviewed=${handoff.reviewed_candidate_count ?? "-"} command=${handoff.command}`,
          `recovery-handoff-binding - db: status=${handoffDbRow?.status ?? "-"} total=${handoffDbRow?.handoff_total ?? "-"} approval_pending=${handoffDbRow?.approval_pending ?? "-"} mismatch=${handoffDbRow?.scope_mismatch ?? "-"} gate=${handoffDbRow?.recovery_gate_status ?? "-"} phase=${handoffDbRow?.effective_phase ?? "-"} approval_state=${handoffDbRow?.approval_state ?? "-"} scope=${handoffDbRow?.scope_status ?? "-"}`,
          `recovery-handoff-binding - digest=${handoff.approval_scope_digest ?? "-"} expected=${handoff.expected_approval_scope_digest ?? "-"} decision=${handoff.decision_id ?? "-"} outcome=${handoff.outcome ?? "-"}`,
          `recovery-handoff-binding - reason-codes=${handoff.reason_codes.join(",") || "-"}`,
          `recovery-handoff-binding - reasons=${handoff.reasons.join(" | ") || "-"}`,
          ...violations.map((violation) => `recovery-handoff-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["recovery-handoff-binding - violation: recovery handoff projection could not run"],
      ok: false,
    };
  }
}

export function checkRecoveryExitBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["recovery-exit-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const recoveryPlan = buildProjectRecoveryPlan(snapshot, { limit: 0 });
      const exit = recoveryPlan.exit_forecast;
      const reentry = recoveryPlan.reentry_forecast;
      const violations: string[] = [];
      const laneTotal = exit.lanes
        .filter((lane) => lane.blocking)
        .reduce((sum, lane) => sum + lane.count, 0);
      if (exit.remaining_queue_items !== laneTotal) {
        violations.push(`remaining_queue_items=${exit.remaining_queue_items}/${laneTotal}`);
      }
      if (exit.remaining_queue_items > 0 && exit.blocking_lanes.length === 0) {
        violations.push("blocking_lanes=empty");
      }
      if (exit.remaining_queue_items > 0 && exit.next_command.length === 0) {
        violations.push("next_command=missing");
      }
      if (recoveryPlan.status === "active" && !recoveryPlan.selected_closure_action) {
        violations.push("selected_closure_action=missing");
      }
      const selectedLane = exit.lanes.find(
        (lane) => lane.action === recoveryPlan.selected_closure_action,
      );
      if (recoveryPlan.selected_closure_action && !selectedLane) {
        violations.push(`selected_lane=${recoveryPlan.selected_closure_action}:missing`);
      }
      if (selectedLane && exit.next_command !== selectedLane.command) {
        violations.push(`next_command=${exit.next_command}/${selectedLane.command}`);
      }
      for (const lane of exit.lanes) {
        if (lane.blocking && lane.count <= 0) {
          violations.push(`${lane.action}.count=${lane.count}`);
        }
        if (lane.blocking && lane.command.length === 0) {
          violations.push(`${lane.action}.command=missing`);
        }
        if (lane.blocking && lane.required_action.length === 0) {
          violations.push(`${lane.action}.required_action=missing`);
        }
        if (lane.action === "close_ready" && lane.count > 0 && !lane.human_required) {
          violations.push("close_ready.human_required=false");
        }
        if (
          (lane.action === "collect_evidence" || lane.action === "repair_failed_evidence") &&
          lane.human_required
        ) {
          violations.push(`${lane.action}.human_required=true`);
        }
      }
      const requiredRecomputeCommands = [
        "helix current-location --json",
        "helix drive model --json",
        "helix roadmap current --json",
        "helix vmodel fit",
      ];
      for (const command of requiredRecomputeCommands) {
        if (!reentry.recompute_commands.includes(command)) {
          violations.push(`missing_recompute=${command}`);
        }
      }
      if (reentry.current_blocking_count !== exit.remaining_queue_items) {
        violations.push(
          `reentry_blocking=${reentry.current_blocking_count}/${exit.remaining_queue_items}`,
        );
      }
      const laneSummary = exit.lanes
        .map(
          (lane) =>
            `${lane.action}:${lane.count}:blocking=${lane.blocking}:human=${lane.human_required}`,
        )
        .join(",");
      const prefix =
        violations.length === 0
          ? "recovery-exit-binding - OK"
          : "recovery-exit-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${exit.status} remaining=${exit.remaining_queue_items} selected=${recoveryPlan.selected_closure_action ?? "-"} next=${exit.next_command} reentry=${reentry.status} after_machine=${reentry.blocking_after_machine_lanes} phases=${reentry.required_phase_count}`,
          `recovery-exit-binding - lanes=${laneSummary || "none"}`,
          `recovery-exit-binding - recompute=${reentry.recompute_commands.join(" && ") || "-"}`,
          ...violations.map((violation) => `recovery-exit-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["recovery-exit-binding - violation: recovery exit projection could not run"],
      ok: false,
    };
  }
}

export function checkApprovalReviewBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["approval-review-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const approval = fit.approval_review_gate;
      const violations: string[] = [];
      if (approval.action !== "close_ready") {
        violations.push(`action=${approval.action}`);
      }
      if (approval.count > 0 && approval.status !== "approval_required") {
        violations.push(`status=${approval.status}`);
      }
      if (approval.count > 0 && !approval.approval_required) {
        violations.push("approval_required=false");
      }
      if (approval.count > 0 && !approval.approval_scope_digest.startsWith("sha256:")) {
        violations.push(`approval_scope_digest=${approval.approval_scope_digest}`);
      }
      if (approval.count > 0 && approval.decision_id !== "closure-review:close_ready") {
        violations.push(`decision_id=${approval.decision_id}`);
      }
      if (approval.count > 0 && approval.current_window_command.length === 0) {
        violations.push("current_window_command=missing");
      }
      if (approval.count > 0 && approval.transition_window_command.length === 0) {
        violations.push("transition_window_command=missing");
      }
      if (approval.count > 0 && approval.blocked_by_findings.length > 0) {
        violations.push(`blocked_by_findings=${approval.blocked_by_findings.length}`);
      }
      if (approval.count > 0 && approval.window.page_count < 1) {
        violations.push(`page_count=${approval.window.page_count}`);
      }
      if (approval.count > 0 && approval.listed > approval.limit) {
        violations.push(`listed_gt_limit=${approval.listed}/${approval.limit}`);
      }
      if (approval.count !== approval.listed + approval.omitted) {
        violations.push(`count_window=${approval.count}/${approval.listed}+${approval.omitted}`);
      }
      const requiredOutcomes = [
        "approve_closure_claim",
        "reject_to_collect_evidence",
        "reject_to_repair_failed_evidence",
        "reject_to_reverse_design",
      ];
      const outcomeIds = approval.outcome_routes.map((route) => route.outcome);
      for (const outcome of requiredOutcomes) {
        if (approval.count > 0 && !outcomeIds.includes(outcome)) {
          violations.push(`missing_outcome=${outcome}`);
        }
      }
      const approveRoute = approval.outcome_routes.find(
        (route) => route.outcome === "approve_closure_claim",
      );
      if (approval.count > 0 && approveRoute) {
        if (approveRoute.projection_type !== "apply_closure") {
          violations.push(`approve.projection_type=${approveRoute.projection_type}`);
        }
        if (!approveRoute.command.includes("closure apply --dry-run")) {
          violations.push(`approve.command=${approveRoute.command}`);
        }
        if (!approveRoute.transition_command.includes("closure apply --execute")) {
          violations.push(`approve.transition=${approveRoute.transition_command}`);
        }
        if (!approveRoute.human_required) {
          violations.push("approve.human_required=false");
        }
      }
      for (const route of approval.outcome_routes.filter((route) =>
        route.outcome.startsWith("reject_to_"),
      )) {
        if (route.projection_type !== "reroute_closure_lane") {
          violations.push(`${route.outcome}.projection_type=${route.projection_type}`);
        }
        if (!route.human_required) {
          violations.push(`${route.outcome}.human_required=false`);
        }
        if (route.postcheck_commands.length === 0) {
          violations.push(`${route.outcome}.postcheck=missing`);
        }
      }
      const prefix =
        violations.length === 0
          ? "approval-review-binding - OK"
          : "approval-review-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${approval.status} action=${approval.action} count=${approval.count} listed=${approval.listed} omitted=${approval.omitted} window=${approval.window.page_index}/${approval.window.page_count} digest=${approval.approval_scope_digest} blocked=${approval.blocked_by_findings.length}`,
          `approval-review-binding - commands: review=${approval.current_window_command} transition=${approval.transition_window_command} next=${approval.next_window_command ?? "-"}`,
          `approval-review-binding - outcomes=${approval.outcome_routes.map((route) => `${route.outcome}:${route.projection_type}:${route.command}->${route.transition_command}`).join(" | ") || "-"}`,
          ...violations.map((violation) => `approval-review-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["approval-review-binding - violation: approval review projection could not run"],
      ok: false,
    };
  }
}

export function checkClosureApplyBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["closure-apply-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const applyLimit = 20;
      const overview = buildProjectClosureOverview(snapshot, {
        limit: applyLimit,
      });
      const apply = buildProjectClosureApplyPlan(snapshot, {
        limit: applyLimit,
      });
      const violations: string[] = [];
      const closeReadyCount = snapshot.closure.queue.route_counts.close_ready;
      if (apply.schema_version !== "project-closure-apply-plan.v1") {
        violations.push(`schema_version=${apply.schema_version}`);
      }
      if (apply.action !== "close_ready") {
        violations.push(`action=${apply.action}`);
      }
      if (!apply.dry_run) {
        violations.push("dry_run=false");
      }
      if (!apply.approval.required) {
        violations.push("approval.required=false");
      }
      if (apply.approval.record_path !== null) {
        violations.push(`approval.record_path=${apply.approval.record_path}`);
      }
      if (apply.approval.valid) {
        violations.push("approval.valid=true_without_record");
      }
      if (apply.allowed_to_apply) {
        violations.push("allowed_to_apply=true_without_record");
      }
      if (!apply.blocked_reasons.includes("approval record が指定されていない")) {
        violations.push("missing_blocked_reason=approval_record");
      }
      if (apply.write_policy !== "read-only") {
        violations.push(`write_policy=${apply.write_policy}`);
      }
      if (
        apply.source_command !==
        `helix closure apply --dry-run --limit ${applyLimit} --offset 0 --json`
      ) {
        violations.push(`source_command=${apply.source_command}`);
      }
      if (apply.view_command !== "helix progress tree-view --json") {
        violations.push(`view_command=${apply.view_command}`);
      }
      const expectedPatchCount = Math.min(closeReadyCount, 20);
      if (apply.patch_candidates.length !== expectedPatchCount) {
        violations.push(`patch_candidates=${apply.patch_candidates.length}/${expectedPatchCount}`);
      }
      for (const candidate of apply.patch_candidates) {
        if (candidate.next_status !== "accepted") {
          violations.push(`${candidate.plan_id}.next_status=${candidate.next_status}`);
        }
        if (candidate.operation !== "frontmatter_status_update") {
          violations.push(`${candidate.plan_id}.operation=${candidate.operation}`);
        }
      }
      for (const command of [
        "helix db rebuild",
        "helix current-location",
        "helix closure batch --action close_ready --json",
        "helix doctor",
      ]) {
        if (!apply.postcheck_commands.includes(command)) {
          violations.push(`missing_postcheck=${command}`);
        }
      }
      const applyReadiness = overview.closure.apply_readiness;
      if (closeReadyCount > 0 && applyReadiness.status !== "approval_required") {
        violations.push(`apply_readiness=${applyReadiness.status}`);
      }
      if (
        applyReadiness.dry_run_command !==
        `helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit ${applyLimit} --offset 0 --json`
      ) {
        violations.push(`dry_run_command=${applyReadiness.dry_run_command}`);
      }
      if (
        applyReadiness.execute_command !==
        `helix closure apply --execute --approval-record <approved-approval-record-path> --limit ${applyLimit} --offset 0 --json`
      ) {
        violations.push(`execute_command=${applyReadiness.execute_command}`);
      }
      const prefix =
        violations.length === 0
          ? "closure-apply-binding - OK"
          : "closure-apply-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: readiness=${applyReadiness.status} close_ready=${closeReadyCount} allowed=${apply.allowed_to_apply} approval_valid=${apply.approval.valid} patches=${apply.patch_candidates.length}/${expectedPatchCount} write=${apply.write_policy}`,
          `closure-apply-binding - commands: dry_run=${applyReadiness.dry_run_command} execute=${applyReadiness.execute_command} decision=${applyReadiness.decision_draft_command}`,
          `closure-apply-binding - postcheck=${apply.postcheck_commands.join(" && ")}`,
          ...violations.map((violation) => `closure-apply-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["closure-apply-binding - violation: closure apply projection could not run"],
      ok: false,
    };
  }
}

export function checkOperationScopeBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["operation-scope-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const scope = snapshot.operation_scope;
      const violations: string[] = [];
      const requiredScopes = [
        "log_design",
        "kpi_metric",
        "runtime_verification",
        "operation_test",
        "class_method_contract",
        "incident_recovery_route",
      ];
      const requiredDesignIdsByScope: Record<string, string[]> = {
        log_design: ["HR-FR-VMFIT-07", "HAT-VMFIT-07"],
        kpi_metric: ["HR-FR-VMFIT-07", "HAT-VMFIT-07"],
        runtime_verification: ["HR-FR-VMFIT-07", "HAT-VMFIT-07"],
        operation_test: ["HOPS-VMFIT-OPTEST-01"],
        class_method_contract: [
          "HOPS-VMFIT-CONTRACT-01",
          "HVC-L6-IMPLEMENTATION-BINDING",
          "HVM-TAILOR-DETAIL-CONTRACT",
        ],
        incident_recovery_route: ["HOPS-VMFIT-INCIDENT-ROUTE-01"],
      };
      const requiredEvidenceTablesByScope: Record<string, string[]> = {
        log_design: ["design_declarations", "runtime_verification_events"],
        kpi_metric: ["design_declarations", "runtime_verification_events"],
        runtime_verification: ["design_declarations", "runtime_verification_events"],
        operation_test: [
          "design_declarations",
          "test_runs",
          "gate_runs",
          "runtime_verification_events",
        ],
        class_method_contract: ["design_declarations", "runtime_verification_events"],
        incident_recovery_route: [
          "design_declarations",
          "closure_next_action_ledger",
          "runtime_verification_events",
        ],
      };
      const actualScopes = scope.items.map((item) => item.scope);
      for (const required of requiredScopes) {
        if (!actualScopes.includes(required)) violations.push(`missing_scope=${required}`);
      }
      const tree = buildVisualizationTreeView(
        buildVisualizationViewModel(buildVisualizationSnapshot(db, { repoRoot })),
      );
      const projectRoot = tree.roots.find((root) => root.id === "project");
      const collectIds = (root: TreeViewNode): string[] => {
        const ids: string[] = [];
        const queue: TreeViewNode[] = [root];
        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) continue;
          ids.push(current.id);
          queue.push(...current.children);
        }
        return ids;
      };
      const projectTreeIds = projectRoot ? collectIds(projectRoot) : [];
      const requiredObservationGapNodeIds = requiredScopes.map(
        (scopeId) => `project/current-location/operation-scope/${scopeId}/observation-gap`,
      );
      for (const requiredNodeId of requiredObservationGapNodeIds) {
        if (!projectTreeIds.includes(requiredNodeId)) {
          violations.push(`view_missing=${requiredNodeId}`);
        }
      }
      for (const item of scope.items) {
        if (item.coverageId !== "L12-operation-observability") {
          violations.push(`${item.scope}.coverage=${item.coverageId}`);
        }
        if (!item.evidenceTables.includes("design_declarations")) {
          violations.push(`${item.scope}.missing_table=design_declarations`);
        }
        for (const requiredTable of requiredEvidenceTablesByScope[item.scope] ?? []) {
          if (!item.evidenceTables.includes(requiredTable)) {
            violations.push(`${item.scope}.missing_table=${requiredTable}`);
          }
        }
        if (item.status === "observed" && item.observationSources.length === 0) {
          violations.push(`${item.scope}.observed_without_source`);
        }
        if (item.status !== "missing") {
          for (const requiredId of requiredDesignIdsByScope[item.scope] ?? []) {
            if (!item.designIds.includes(requiredId)) {
              violations.push(`${item.scope}.missing_design_id=${requiredId}`);
            }
          }
        }
      }
      const runtimeVerification = scope.items.find((item) => item.scope === "runtime_verification");
      if (
        runtimeVerification &&
        !runtimeVerification.evidenceTables.includes("runtime_verification_events")
      ) {
        violations.push("runtime_verification.missing_table=runtime_verification_events");
      }
      const incidentRoute = scope.items.find((item) => item.scope === "incident_recovery_route");
      if (incidentRoute && !incidentRoute.evidenceTables.includes("closure_next_action_ledger")) {
        violations.push("incident_recovery_route.missing_table=closure_next_action_ledger");
      }
      if (incidentRoute && !incidentRoute.evidenceTables.includes("runtime_verification_events")) {
        violations.push("incident_recovery_route.missing_table=runtime_verification_events");
      }
      const operationTraceRows = db
        .prepare(
          `SELECT from_id, to_id, reference_kind, status, source_path
           FROM design_references
           WHERE from_id = ?
           ORDER BY to_id`,
        )
        .all("HAT-VMFIT-07") as Array<{
        from_id: string;
        to_id: string;
        reference_kind: string;
        status: string;
        source_path: string;
      }>;
      const requiredOperationTraceTargets = [
        "HR-FR-VMFIT-07",
        "HOPS-VMFIT-OPTEST-01",
        "HOPS-VMFIT-CONTRACT-01",
        "HOPS-VMFIT-INCIDENT-ROUTE-01",
      ];
      if (incidentRoute && incidentRoute.status !== "missing") {
        for (const target of requiredOperationTraceTargets) {
          const resolved = operationTraceRows.some(
            (row) =>
              row.to_id === target &&
              row.reference_kind === "accepts" &&
              row.status === "resolved" &&
              row.source_path === "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
          );
          if (!resolved) {
            violations.push(`operation_trace.missing=HAT-VMFIT-07->${target}`);
          }
        }
      }
      const prefix =
        violations.length > 0
          ? "operation-scope-binding - violation"
          : scope.missing === 0 && scope.reverify === 0
            ? "operation-scope-binding - OK"
            : "operation-scope-binding - advisory";
      const observedGapScopes = scope.items
        .filter((item) => item.status !== "missing" && item.observedCount === 0)
        .map((item) => `${item.scope}:${item.status}`);
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: designed=${scope.designed} observed=${scope.observed} observed_gap=${scope.observed_gap} missing=${scope.missing} reverify=${scope.reverify} coverage=L12-operation-observability command=helix current-location --json`,
          `operation-scope-binding - scopes=${scope.items.map((item) => `${item.scope}:${item.status}:${item.observedCount}:tables=${item.evidenceTables.join("+")}`).join(" | ")}`,
          `operation-scope-binding - observation-sources=${scope.items.map((item) => `${item.scope}:${item.observationSources.join("+") || "-"}`).join(" | ")}`,
          `operation-scope-binding - observed-gap: status=${observedGapScopes.length > 0 ? "watch" : "clear"} scopes=${observedGapScopes.join(",") || "-"} action=accepted runtime evidence を運用時 view へ投影し、設計済み scope を observed に昇格する`,
          `operation-scope-binding - design=${scope.items.map((item) => `${item.scope}:${item.designIds.join("+") || "-"}`).join(" | ")}`,
          `operation-scope-binding - traces=HAT-VMFIT-07:${operationTraceRows.filter((row) => row.reference_kind === "accepts" && row.status === "resolved").length}/${requiredOperationTraceTargets.length}`,
          `operation-scope-binding - view-nodes=observation-gap:${requiredObservationGapNodeIds.filter((id) => projectTreeIds.includes(id)).length}/${requiredObservationGapNodeIds.length}`,
          `operation-scope-binding - required=log_design,kpi_metric,runtime_verification,operation_test,class_method_contract,incident_recovery_route view=helix progress tree-view --json`,
          ...violations.map((violation) => `operation-scope-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["operation-scope-binding - violation: operation scope projection could not run"],
      ok: false,
    };
  }
}

export function checkZipAdoptionBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["zip-adoption-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const adoption = snapshot.zip_adoption;
      const violations: string[] = [];
      const requiredAdopt = [
        "HVM-ADOPT-01",
        "HVM-ADOPT-02",
        "HVM-ADOPT-03",
        "HVM-ADOPT-04",
        "HVM-ADOPT-05",
      ];
      const requiredComplement = ["HVM-COMP-01", "HVM-COMP-02", "HVM-COMP-03"];
      const requiredReject = ["HVM-REJECT-01", "HVM-REJECT-02", "HVM-REJECT-03"];
      const expectedReceivers: Record<string, string[]> = {
        "HVM-ADOPT-01": ["design_declarations", "design_references", "vmodel_zip_source_bindings"],
        "HVM-ADOPT-02": ["artifact_registry", "design_coverage_gate"],
        "HVM-ADOPT-03": ["design_impact", "relation_graph"],
        "HVM-ADOPT-04": ["roadmap_rollups", "roadmap_band_coverage"],
        "HVM-ADOPT-05": ["runtime_verification_events", "closure_next_action_ledger"],
        "HVM-COMP-01": ["test_runs", "gate_runs", "runtime_verification_events"],
        "HVM-COMP-02": [
          "project_current_location",
          "visualization_view_model",
          "visualization_tree_view",
          "vmodel_zip_source_bindings",
        ],
        "HVM-COMP-03": ["closure_next_action_ledger", "approval_review_gate"],
        "HVM-REJECT-01": ["zip-reference-runtime-boundary", "vmodel_zip_manifest"],
        "HVM-REJECT-02": ["artifact_registry", "design_coverage_gate", "tailoring_profile"],
        "HVM-REJECT-03": ["design_declarations", "harness.db", "runtime_verification_events"],
      };
      const idsByCategory = (category: "adopt" | "complement" | "reject") =>
        adoption.items
          .filter((item) => item.category === category && item.status === "declared")
          .map((item) => item.adoptionId);
      const adoptedIds = idsByCategory("adopt");
      const complementedIds = idsByCategory("complement");
      const rejectedIds = idsByCategory("reject");
      const adoptionReferences = db
        .prepare(
          `SELECT from_id, to_id, reference_kind, status, source_path
           FROM design_references
           WHERE from_id LIKE 'HVM-ADOPT-%'
              OR from_id LIKE 'HVM-COMP-%'
              OR from_id LIKE 'HVM-REJECT-%'
           ORDER BY from_id, to_id`,
        )
        .all() as Array<{
        from_id: string;
        to_id: string;
        reference_kind: string;
        status: string;
        source_path: string;
      }>;
      const referencesByFrom = new Map<string, typeof adoptionReferences>();
      for (const reference of adoptionReferences) {
        const list = referencesByFrom.get(reference.from_id) ?? [];
        list.push(reference);
        referencesByFrom.set(reference.from_id, list);
      }
      const adoptionDecisionRows = db
        .prepare(
          `SELECT adoption_id, category, status, implementation_dependencies
           FROM project_zip_adoption_decisions
           ORDER BY adoption_id`,
        )
        .all() as Array<{
        adoption_id: string;
        category: string;
        status: string;
        implementation_dependencies: string;
      }>;
      const decisionRowsById = new Map(adoptionDecisionRows.map((row) => [row.adoption_id, row]));
      const adoptionMatrixPath = join(repoRoot, adoption.sourceDocument);
      const adoptionMatrixText = existsSync(adoptionMatrixPath)
        ? readFileSync(adoptionMatrixPath, "utf8")
        : "";
      const requireIds = (label: string, actual: string[], required: string[]) => {
        for (const id of required) {
          if (!actual.includes(id)) violations.push(`${label}.missing=${id}`);
        }
      };
      requireIds("adopt", adoptedIds, requiredAdopt);
      requireIds("complement", complementedIds, requiredComplement);
      requireIds("reject", rejectedIds, requiredReject);
      if (
        adoption.sourceDocument !== "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"
      ) {
        violations.push(`source_document=${adoption.sourceDocument}`);
      }
      if (adoptionMatrixText.length === 0) {
        violations.push("adoption_matrix_text=missing");
      }
      for (const marker of [
        "## §2 共通点",
        "## §3 差異",
        "## §4 採用するもの",
        "## §5 HELIX が補うもの",
        "## §6 採用しないもの",
      ]) {
        if (!adoptionMatrixText.includes(marker)) {
          violations.push(`adoption_matrix_marker_missing=${marker}`);
        }
      }
      const expectedSignature = VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE;
      const signatureMarkers = [
        `${expectedSignature.entriesTotal} entries`,
        `\`.yaml\` ${expectedSignature.byExtension.yaml}`,
        `\`.md\` ${expectedSignature.byExtension.md}`,
        `\`.xlsx\` ${expectedSignature.byExtension.xlsx}`,
        `\`.png\` ${expectedSignature.byExtension.png}`,
        `\`.py\` ${expectedSignature.byExtension.py}`,
        `\`.json\` ${expectedSignature.byExtension.json}`,
        `\`.feature\` ${expectedSignature.byExtension.feature}`,
        `${expectedSignature.rootPrefix}/`,
      ];
      for (const marker of signatureMarkers) {
        if (!adoptionMatrixText.includes(marker)) {
          violations.push(`adoption_matrix_signature_missing=${marker}`);
        }
      }
      for (const sourcePath of VMODEL_ZIP_REQUIRED_PATHS) {
        if (!adoptionMatrixText.includes(sourcePath)) {
          violations.push(`adoption_matrix_source_missing=${sourcePath}`);
        }
      }
      for (const dependency of [
        "design_declarations",
        "design_references",
        "vmodel_zip_source_bindings",
      ]) {
        if (!adoption.implementationDependencies.includes(dependency)) {
          violations.push(`missing_implementation_dependency=${dependency}`);
        }
      }
      for (const [id, dependencies] of Object.entries(expectedReceivers)) {
        const item = adoption.items.find((candidate) => candidate.adoptionId === id);
        if (!item) {
          violations.push(`${id}.receiver=item_missing`);
          continue;
        }
        const decisionRow = decisionRowsById.get(id);
        if (!decisionRow) {
          violations.push(`${id}.decision_row=missing`);
        } else if (decisionRow.category !== item.category || decisionRow.status !== item.status) {
          violations.push(`${id}.decision_row=${decisionRow.category}/${decisionRow.status}`);
        }
        for (const dependency of dependencies) {
          if (!item.implementationDependencies.includes(dependency)) {
            violations.push(`${id}.receiver_missing=${dependency}`);
          }
          if (decisionRow && !decisionRow.implementation_dependencies.includes(dependency)) {
            violations.push(`${id}.decision_row_receiver_missing=${dependency}`);
          }
        }
      }
      const expectedReferenceKind = (id: string): string =>
        id.startsWith("HVM-ADOPT-")
          ? "supports"
          : id.startsWith("HVM-COMP-")
            ? "complements"
            : "constrains";
      for (const id of [...requiredAdopt, ...requiredComplement, ...requiredReject]) {
        const references = referencesByFrom.get(id) ?? [];
        const expectedKind = expectedReferenceKind(id);
        const resolved = references.filter(
          (reference) =>
            reference.status === "resolved" &&
            reference.reference_kind === expectedKind &&
            reference.source_path === adoption.sourceDocument,
        );
        if (resolved.length === 0) {
          violations.push(`${id}.resolved_reference=${expectedKind}:missing`);
        }
      }
      if (adoption.missing > 0) violations.push(`missing_decisions=${adoption.missing}`);
      const prefix =
        violations.length === 0 ? "zip-adoption-binding - OK" : "zip-adoption-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${adoption.status} adopt=${adoption.adopted} complement=${adoption.complemented} reject=${adoption.rejected} missing=${adoption.missing} source=${adoption.sourceDocument} command=helix vmodel fit --json`,
          `zip-adoption-binding - adopted=${adoptedIds.join(",") || "-"} complemented=${complementedIds.join(",") || "-"} rejected=${rejectedIds.join(",") || "-"}`,
          `zip-adoption-binding - decision-db: rows=${adoptionDecisionRows.length}/${requiredAdopt.length + requiredComplement.length + requiredReject.length} table=project_zip_adoption_decisions categories=adopt:${adoptedIds.length},complement:${complementedIds.length},reject:${rejectedIds.length}`,
          `zip-adoption-binding - references=${adoptionReferences.filter((reference) => reference.status === "resolved").length}/${requiredAdopt.length + requiredComplement.length + requiredReject.length} kinds=${[...new Set(adoptionReferences.map((reference) => reference.reference_kind))].join(",") || "-"}`,
          `zip-adoption-binding - receivers=${Object.entries(expectedReceivers)
            .map(([id, dependencies]) => `${id}:${dependencies.join("+")}`)
            .join(" | ")}`,
          `zip-adoption-binding - matrix-signature: entries=${expectedSignature.entriesTotal} extensions=${Object.entries(
            expectedSignature.byExtension,
          )
            .map(([extension, count]) => `${extension}:${count}`)
            .join(
              ",",
            )} required_sources=${VMODEL_ZIP_REQUIRED_PATHS.length}/${VMODEL_ZIP_REQUIRED_PATHS.length}`,
          `zip-adoption-binding - deps=${adoption.implementationDependencies.join(",") || "-"} doc=${adoption.docDependencies.join(",") || "-"}`,
          ...violations.map((violation) => `zip-adoption-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["zip-adoption-binding - violation: ZIP adoption projection could not run"],
      ok: false,
    };
  }
}

export function checkZipSourceBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["zip-source-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const sourceBindings = fit.zip_source_bindings;
      const violations: string[] = [];
      const requiredBindingIds = VMODEL_ZIP_SOURCE_BINDINGS.map((binding) => binding.bindingId);
      const requiredEvidenceTables = [
        ...new Set(VMODEL_ZIP_SOURCE_BINDINGS.flatMap((binding) => binding.evidenceTables)),
      ];
      violations.push(...vmodelZipSourceBindingDefinitionViolations());
      const bindingIds = sourceBindings.bindings.map((binding) => binding.binding_id);
      for (const id of requiredBindingIds) {
        if (!bindingIds.includes(id)) violations.push(`missing_binding=${id}`);
      }
      for (const table of requiredEvidenceTables) {
        if (!sourceBindings.evidence_tables.includes(table)) {
          violations.push(`missing_evidence_table=${table}`);
        }
      }
      for (const binding of sourceBindings.bindings) {
        if (binding.status === "missing") {
          violations.push(`${binding.binding_id}.status=missing`);
        }
        if (binding.source_present && !binding.actual_path) {
          violations.push(`${binding.binding_id}.actual_path=missing`);
        }
        if (binding.helix_surfaces.length === 0) {
          violations.push(`${binding.binding_id}.helix_surfaces=empty`);
        }
        if (binding.evidence_tables.length === 0) {
          violations.push(`${binding.binding_id}.evidence_tables=empty`);
        }
      }
      const prefix =
        violations.length > 0
          ? "zip-source-binding - violation"
          : sourceBindings.advisory > 0
            ? "zip-source-binding - advisory"
            : "zip-source-binding - OK";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${sourceBindings.status} bound=${sourceBindings.bound} missing=${sourceBindings.missing} advisory=${sourceBindings.advisory} bindings=${sourceBindings.bindings.length}/${requiredBindingIds.length} tables=${sourceBindings.evidence_tables.join(",") || "-"}`,
          `zip-source-binding - sources=${sourceBindings.bindings.map((binding) => `${binding.binding_id}:${binding.status}:${binding.source_category}:${binding.source_path}->${binding.evidence_tables.join("+")}`).join(" | ")}`,
          `zip-source-binding - surfaces=${sourceBindings.bindings.map((binding) => `${binding.binding_id}:${binding.helix_surfaces.join("+")}`).join(" | ")}`,
          ...violations.map((violation) => `zip-source-binding - violation: ${violation}`),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["zip-source-binding - violation: ZIP source binding projection could not run"],
      ok: false,
    };
  }
}

export function checkZipReferenceRuntimeBoundary(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["zip-reference-runtime-boundary - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const scanRoots = ["src", "scripts", ".github", "package.json"].map((entry) =>
      join(repoRoot, entry),
    );
    const allowedReferenceFiles = new Set(
      [
        "src/vmodel/zip-manifest.ts",
        "src/vmodel/fit.ts",
        "src/vscode/tree-view-provider.ts",
        "src/doctor/index.ts",
      ].map((entry) => join(repoRoot, ...entry.split("/"))),
    );
    const files: string[] = [];
    const collect = (path: string) => {
      if (!existsSync(path)) return;
      const stat = statSync(path);
      if (stat.isFile()) {
        files.push(path);
        return;
      }
      if (!stat.isDirectory()) return;
      for (const child of readdirSync(path)) {
        if (child === "node_modules" || child === "dist" || child === ".git") continue;
        collect(join(path, child));
      }
    };
    for (const root of scanRoots) collect(root);
    const textFiles = files.filter((path) => /\.(ts|tsx|js|mjs|cjs|json|ya?ml|sh|ps1)$/.test(path));
    const violations: string[] = [];
    const referenceToolPattern =
      /tools\/(?:build|spec_check|spec_types|assign|schedule)\.py|hybrid-docgen\/tools\/(?:build|spec_check|spec_types|assign|schedule)\.py/g;
    const xlsxPattern = /\.xlsx\b/g;
    const externalExecutionPattern =
      /\bBun\.(?:spawn|spawnSync)\b|\b(?:node:)?child_process\b|\bpython(?:3)?\b|(?:^|[^\w.])(?:spawn|spawnSync|exec|execSync|execFile|execFileSync)\s*\(/g;
    let referenceMentions = 0;
    let xlsxMentions = 0;
    for (const path of textFiles) {
      const text = readFileSync(path, "utf8");
      const relative = path.replace(`${repoRoot}/`, "");
      const toolMentions = [...text.matchAll(referenceToolPattern)];
      const xlsxMatches = [...text.matchAll(xlsxPattern)];
      referenceMentions += toolMentions.length;
      xlsxMentions += xlsxMatches.length;
      if (allowedReferenceFiles.has(path)) continue;
      const executionMatches = [...text.matchAll(externalExecutionPattern)];
      if (toolMentions.length > 0 && executionMatches.length > 0) {
        violations.push(
          `${relative}.zip_tool_runtime_execution=${toolMentions.length}/${executionMatches.length}`,
        );
      }
      if (xlsxMatches.length > 0 && executionMatches.length > 0) {
        violations.push(
          `${relative}.xlsx_runtime_execution=${xlsxMatches.length}/${executionMatches.length}`,
        );
      }
    }
    const prefix =
      violations.length === 0
        ? "zip-reference-runtime-boundary - OK"
        : "zip-reference-runtime-boundary - violation";
    return {
      ok: violations.length === 0,
      messages: [
        `${prefix}: scanned=${textFiles.length} references=${referenceMentions} xlsx=${xlsxMentions} policy=reference-only command=helix doctor`,
        "zip-reference-runtime-boundary - allowed=src/vmodel/zip-manifest.ts,src/vmodel/fit.ts,src/vscode/tree-view-provider.ts,src/doctor/index.ts",
        "zip-reference-runtime-boundary - forbidden=runtime execution/import of tools/build.py,tools/spec_check.py,tools/spec_types.py or xlsx builder output",
        ...violations.map(
          (violation) => `zip-reference-runtime-boundary - violation: ${violation}`,
        ),
      ],
    };
  } catch {
    return {
      messages: [
        "zip-reference-runtime-boundary - violation: ZIP reference-only runtime boundary scan could not run",
      ],
      ok: false,
    };
  }
}

export function checkFunctionDesignAbsorptionBinding(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["function-design-absorption-binding - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const absorption = fit.function_design_absorption;
      const detailCoverage = snapshot.design_coverage_gate.items.find(
        (item) => item.coverageId === "L5-detailed-contract",
      );
      const tailoringDetail = snapshot.tailoring_gate.items.find(
        (item) => item.tailoringId === "HVM-TAILOR-DETAIL-CONTRACT",
      );
      const tailoringDecisionRow = db
        .prepare(
          `SELECT tailoring_id, category, detail_level, status, source_document, implementation_dependencies
           FROM project_tailoring_decisions
           WHERE tailoring_id = ?`,
        )
        .get("HVM-TAILOR-DETAIL-CONTRACT") as
        | {
            tailoring_id: string;
            category: string;
            detail_level: string;
            status: string;
            source_document: string;
            implementation_dependencies: string;
          }
        | undefined;
      const violations: string[] = [];
      const requiredAcceptedLayers = ["L5", "L7", "typed declaration", "runtime evidence"];
      const requiredAbsorbedSurfaces = [
        "L5 detailed design",
        "design_declarations",
        "L7 TDD closure",
        "test_runs",
        "gate_runs",
        "runtime_verification_events",
      ];
      const requiredDetailDeclarationIds = ["HOPS-VMFIT-CONTRACT-01", "HVM-TAILOR-DETAIL-CONTRACT"];
      if (absorption.independent_layer_policy !== "abolished") {
        violations.push(`policy=${absorption.independent_layer_policy}`);
      }
      if (absorption.detail_contract_coverage_status !== "covered") {
        violations.push(`detail=${absorption.detail_contract_coverage_status}`);
      }
      if (absorption.tailoring_detail_contract_status !== "declared") {
        violations.push(`tailoring=${absorption.tailoring_detail_contract_status}`);
      }
      if (absorption.command !== "helix current-location --json") {
        violations.push(`command=${absorption.command}`);
      }
      if (!detailCoverage) {
        violations.push("detail_coverage=missing");
      } else {
        for (const id of requiredDetailDeclarationIds) {
          if (!detailCoverage.declarationIds.includes(id)) {
            violations.push(`missing_detail_declaration=${id}`);
          }
        }
        if (detailCoverage.sourcePaths.length === 0) {
          violations.push("detail_coverage.sourcePaths=empty");
        }
        const legacyFunctionDesignSources = detailCoverage.sourcePaths.filter((sourcePath) =>
          sourcePath.startsWith("docs/design/helix/L6-function-design/"),
        );
        if (legacyFunctionDesignSources.length > 0) {
          violations.push(
            `detail_coverage.legacy_function_design_source=${legacyFunctionDesignSources.join(",")}`,
          );
        }
      }
      if (!tailoringDetail?.declarationIds.includes("HVM-TAILOR-DETAIL-CONTRACT")) {
        violations.push("tailoring_detail_declaration=missing");
      }
      if (!tailoringDecisionRow) {
        violations.push("tailoring_decision_row=missing");
      } else {
        if (
          tailoringDecisionRow.category !== "required" ||
          tailoringDecisionRow.detail_level !== "詳細" ||
          tailoringDecisionRow.status !== "declared"
        ) {
          violations.push(
            `tailoring_decision_row=${tailoringDecisionRow.category}/${tailoringDecisionRow.detail_level}/${tailoringDecisionRow.status}`,
          );
        }
        if (
          tailoringDecisionRow.source_document !==
          "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"
        ) {
          violations.push(`tailoring_decision_source=${tailoringDecisionRow.source_document}`);
        }
      }
      for (const layer of requiredAcceptedLayers) {
        if (!absorption.accepted_layers.includes(layer)) {
          violations.push(`missing_accepted_layer=${layer}`);
        }
      }
      for (const surface of requiredAbsorbedSurfaces) {
        if (!absorption.absorbed_surfaces.includes(surface)) {
          violations.push(`missing_absorbed_surface=${surface}`);
        }
      }
      const prefix =
        violations.length === 0
          ? "function-design-absorption-binding - OK"
          : "function-design-absorption-binding - violation";
      return {
        ok: violations.length === 0,
        messages: [
          `${prefix}: status=${absorption.status} policy=${absorption.independent_layer_policy} detail=${absorption.detail_contract_coverage_status} tailoring=${absorption.tailoring_detail_contract_status} command=${absorption.command}`,
          `function-design-absorption-binding - declarations=detail:${detailCoverage?.declarationIds.join("+") || "-"} tailoring:${tailoringDetail?.declarationIds.join("+") || "-"} sources=${detailCoverage?.sourcePaths.join(",") || "-"}`,
          `function-design-absorption-binding - tailoring-db: table=project_tailoring_decisions detail=${tailoringDecisionRow ? `${tailoringDecisionRow.category}/${tailoringDecisionRow.detail_level}/${tailoringDecisionRow.status}` : "missing"} impl=${tailoringDecisionRow?.implementation_dependencies ?? "-"}`,
          `function-design-absorption-binding - canonical-sources=${detailCoverage?.sourcePaths.filter((sourcePath) => !sourcePath.startsWith("docs/design/helix/L6-function-design/")).join(",") || "-"}`,
          `function-design-absorption-binding - accepted=${absorption.accepted_layers.join(",") || "-"} absorbed=${absorption.absorbed_surfaces.join(",") || "-"}`,
          `function-design-absorption-binding - action=${absorption.required_action}`,
          ...violations.map(
            (violation) => `function-design-absorption-binding - violation: ${violation}`,
          ),
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: [
        "function-design-absorption-binding - violation: function design absorption projection could not run",
      ],
      ok: false,
    };
  }
}

export function checkVmodelZipManifest(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["vmodel-zip-manifest - violation: repo root could not be read"],
      ok: false,
    };
  }
  const result = analyzeVmodelZipManifest(repoRoot);
  return {
    messages: vmodelZipManifestMessages(result),
    ok: result.ok,
  };
}

export function checkVmodelFit(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["vmodel-fit - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = prebuiltDb ?? openHarnessDb(":memory:", { repoRoot });
    try {
      if (!prebuiltDb) rebuildHarnessDb({ repoRoot, db });
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const zipManifest = analyzeVmodelZipManifest(repoRoot);
      const fit = buildVmodelFitReport(snapshot, zipManifest, { repoRoot });
      const fitNextActions = fit.next_actions
        .slice(0, 5)
        .map(
          (action) =>
            `${action.priority}:${action.blocker_code}:${action.automation_class}:${action.count}:${action.command}`,
        )
        .join(" | ");
      const fitNextWorkBuckets = fit.next_actions
        .filter((action) => action.work_bucket !== null)
        .slice(0, 5)
        .map((action) => {
          const bucket = action.work_bucket;
          return bucket
            ? `${action.blocker_code}:${bucket.evidence_signature}:${bucket.count}:failed=${bucket.failed_evidence_count}:projections=${bucket.projection_item_count}:automation=${bucket.repair_automation_status}:next=${bucket.repair_primary_next_command ?? "-"}:handoff=${bucket.evidence_handoff_next?.status ?? "none"}:approval=${bucket.evidence_handoff_status?.approval_record?.status ?? "-"}:scope=${bucket.evidence_handoff_status?.approval_record?.scope_status ?? "-"}:${bucket.primary_command}:patch=${bucket.evidence_patch_command}:patch_candidates=${bucket.evidence_patch_candidate_count}:patch_write=${bucket.evidence_patch_write_policy}`
            : "";
        })
        .filter((item) => item.length > 0)
        .join(" | ");
      const fitRegressionGuards = fit.regression_guards.guards
        .map((guard) => `${guard.guard_id}:${guard.status}:${guard.count}:${guard.command}`)
        .join(" | ");
      const fitRecoveryRunwayPhases = fit.recovery_runway_gate.phases
        .map(
          (phase) =>
            `${phase.sequence}:${phase.action}:${phase.phase_type}:count=${phase.count}:listed=${phase.listed}:remaining=${phase.remaining_after_phase}:gate=${phase.next_gate}:signature=${phase.evidence_signature ?? "-"}:plans=${phase.sample_plan_ids.join(",") || "-"}`,
        )
        .join(" | ");
      return {
        ok: true,
        messages: [
          `vmodel-fit - ${fit.status === "pass" ? "OK" : "advisory"}: status=${fit.status} design=${fit.design_coverage_gate.status} ac=${fit.acceptance_traceability_gate.status} zip=${fit.zip_adoption.status} manifest=${fit.zip_manifest.status} tailoring=${fit.tailoring_gate.status} function_design=${fit.function_design_absorption.status} roadmap=${fit.roadmap_current_gate.status} drive=${fit.drive_model_gate.selected_model}/${fit.drive_model_gate.status} operation=${fit.operation_scope.designed}/${fit.operation_scope.observed}/${fit.operation_scope.missing}/${fit.operation_scope.reverify} current=${fit.current_location_gate.status} route=${fit.current_location_gate.route_id}`,
          `vmodel-fit - blockers: ${fit.blockers.map((blocker) => `${blocker.code}:${blocker.count}:${blocker.command}`).join(" | ") || "-"}`,
          `vmodel-fit - synthesis: status=${fit.synthesis.status} common=${fit.synthesis.common_adopted} complement=${fit.synthesis.helix_complemented} reject=${fit.synthesis.rejected} missing=${fit.synthesis.missing_decisions} tailoring=${fit.synthesis.tailoring_status} function_policy=${fit.synthesis.function_design_policy} reentry=${fit.synthesis.current_reentry_status} effective=${fit.synthesis.effective_reentry_status} next=${fit.synthesis.next_command}`,
          `vmodel-fit - regression-guards: status=${fit.regression_guards.status} pass=${fit.regression_guards.pass} watch=${fit.regression_guards.watch} fail=${fit.regression_guards.fail} guards=${fitRegressionGuards || "-"}`,
          `vmodel-fit - recovery-runway-gate: status=${fit.recovery_runway_gate.status} blocking=${fit.recovery_runway_gate.current_blocking_count} machine=${fit.recovery_runway_gate.machine_actionable_count} approval=${fit.recovery_runway_gate.human_approval_count} reverse=${fit.recovery_runway_gate.design_reverse_count} after_machine=${fit.recovery_runway_gate.remaining_after_machine_lanes} phases=${fit.recovery_runway_gate.required_phase_count} next=${fit.recovery_runway_gate.next_phase_action ?? "-"} phase=${fit.recovery_runway_gate.next_phase_type ?? "-"} gate=${fit.recovery_runway_gate.next_gate} command=${fit.recovery_runway_gate.next_command} execute=${fit.recovery_runway_gate.next_execution_command}`,
          `vmodel-fit - recovery-runway-phases: ${fitRecoveryRunwayPhases || "-"}`,
          `vmodel-fit - recovery-handoff-gate: status=${fit.recovery_handoff_gate.status} phase=${fit.recovery_handoff_gate.effective_phase} approval=${fit.recovery_handoff_gate.approval_status ?? "-"} scope=${fit.recovery_handoff_gate.scope_status ?? "-"} decision=${fit.recovery_handoff_gate.decision_id ?? "-"} approval_record=${fit.recovery_handoff_gate.approval_record_path ?? "-"} digest=${fit.recovery_handoff_gate.approval_scope_digest ?? "-"} expected=${fit.recovery_handoff_gate.expected_approval_scope_digest ?? "-"} materialize=${fit.recovery_handoff_gate.materialize_status ?? "-"} valid=${fit.recovery_handoff_gate.valid_for_apply} present=${fit.recovery_handoff_gate.handoff_present} missing=${fit.recovery_handoff_gate.handoff_missing} command=${fit.recovery_handoff_gate.command}`,
          `vmodel-fit - approval-review-gate: status=${fit.approval_review_gate.status} action=${fit.approval_review_gate.action} count=${fit.approval_review_gate.count} listed=${fit.approval_review_gate.listed} omitted=${fit.approval_review_gate.omitted} window=${fit.approval_review_gate.window.page_index}/${fit.approval_review_gate.window.page_count} range=${fit.approval_review_gate.window.start}-${fit.approval_review_gate.window.end} next=${fit.approval_review_gate.next_window_command ?? "-"} decision=${fit.approval_review_gate.decision_id} digest=${fit.approval_review_gate.approval_scope_digest} tests=${fit.approval_review_gate.evidence_totals.test_runs_passed}/${fit.approval_review_gate.evidence_totals.test_runs_total} gates=${fit.approval_review_gate.evidence_totals.gate_runs_passed}/${fit.approval_review_gate.evidence_totals.gate_runs_total} runtime=${fit.approval_review_gate.evidence_totals.runtime_verification_accepted}/${fit.approval_review_gate.evidence_totals.runtime_verification_total} blocked=${fit.approval_review_gate.blocked_by_findings.length} plans=${fit.approval_review_gate.sample_plan_ids.join(",") || "-"} command=${fit.approval_review_gate.current_window_command}`,
          `vmodel-fit - next-actions: ${fitNextActions || "-"}`,
          `vmodel-fit - next-work-buckets: ${fitNextWorkBuckets || "-"}`,
          `vmodel-fit - zip-inventory-signature: status=${fit.zip_manifest.inventory_signature.status} entries=${fit.zip_manifest.inventory_signature.actual_entries_total}/${fit.zip_manifest.inventory_signature.expected_entries_total} root=${fit.zip_manifest.inventory_signature.actual_root_prefix ?? "-"}/${fit.zip_manifest.inventory_signature.expected_root_prefix} mismatches=${fit.zip_manifest.inventory_signature.mismatches.length}`,
          `vmodel-fit - zip-source-bindings: status=${fit.zip_source_bindings.status} bound=${fit.zip_source_bindings.bound} missing=${fit.zip_source_bindings.missing} advisory=${fit.zip_source_bindings.advisory} tables=${fit.zip_source_bindings.evidence_tables.join(",") || "-"}`,
          `vmodel-fit - acceptance-traceability: status=${fit.acceptance_traceability_gate.status} linked=${fit.acceptance_traceability_gate.linked}/${fit.acceptance_traceability_gate.total} declared=${fit.acceptance_traceability_gate.declared} missing=${fit.acceptance_traceability_gate.missing}`,
          `vmodel-fit - function-design-absorption: status=${fit.function_design_absorption.status} policy=${fit.function_design_absorption.independent_layer_policy} detail=${fit.function_design_absorption.detail_contract_coverage_status} tailoring=${fit.function_design_absorption.tailoring_detail_contract_status}`,
          `vmodel-fit - roadmap-current-gate: status=${fit.roadmap_current_gate.status} roadmap=${fit.roadmap_current_gate.roadmap_status} aligned=${fit.roadmap_current_gate.aligned} correlation=${fit.roadmap_current_gate.recovery_correlation} basis=${fit.roadmap_current_gate.alignment_basis} db=${fit.roadmap_current_gate.db_current_l12_layer ?? "-"} roadmap=${fit.roadmap_current_gate.roadmap_current_l12_layers.join(",") || "-"} projected=${fit.roadmap_current_gate.roadmap_projected_l12_layers.join(",") || "-"} terminal=${fit.roadmap_current_gate.roadmap_terminal_l12_layers.join(",") || "-"} blockers=${fit.roadmap_current_gate.blocker_count}`,
          `vmodel-fit - drive-model-gate: status=${fit.drive_model_gate.status} selected=${fit.drive_model_gate.selected_model} route=${fit.drive_model_gate.selected_route_id} default=${fit.drive_model_gate.default_model} blocked=${fit.drive_model_gate.blocked_models.join(",") || "-"} available=${fit.drive_model_gate.available_models.join(",") || "-"}`,
          `vmodel-fit - skill-binding: status=${fit.skill_binding?.status ?? "-"} selected=${fit.skill_binding?.selectedModel ?? "-"} workflow=${fit.skill_binding?.workflowModes.join(",") || "-"} required=${fit.skill_binding?.requiredSkills ?? 0} recommended=${fit.skill_binding?.recommendedSkills ?? 0} optional=${fit.skill_binding?.optionalSkills ?? 0}`,
          `vmodel-fit - operation-scope: designed=${fit.operation_scope.designed} observed=${fit.operation_scope.observed} observed_gap=${fit.operation_scope.observed_gap} missing=${fit.operation_scope.missing} reverify=${fit.operation_scope.reverify}`,
          `vmodel-fit - current-location-gate: status=${fit.current_location_gate.status} current=${fit.current_location_gate.current_status}/${fit.current_location_gate.completion_boundary} route_status=${fit.current_location_gate.drive_route_status} model=${fit.current_location_gate.recommended_model}`,
          `vmodel-fit - recovery-runway: status=${fit.current_location_gate.recovery_runway.status} machine=${fit.current_location_gate.recovery_runway.machine_actionable_count} approval=${fit.current_location_gate.recovery_runway.human_approval_count} reverse=${fit.current_location_gate.recovery_runway.design_reverse_count} after_machine=${fit.current_location_gate.recovery_runway.remaining_after_machine_lanes} next=${fit.current_location_gate.recovery_runway.next_machine_action ?? "-"}`,
          `vmodel-fit - recovery-reentry: status=${fit.current_location_gate.reentry_forecast.status} effective=${fit.synthesis.effective_reentry_status} blocking=${fit.current_location_gate.reentry_forecast.current_blocking_count} after_machine=${fit.current_location_gate.reentry_forecast.blocking_after_machine_lanes} phases=${fit.current_location_gate.reentry_forecast.required_phase_count} next=${fit.current_location_gate.reentry_forecast.next_phase_action ?? "-"} gate=${fit.current_location_gate.reentry_forecast.next_gate}`,
          `vmodel-fit - design-integrity: declarations=${fit.design_integrity.declarations} references=${fit.design_integrity.references} impact=${fit.design_integrity.impact} unresolved=${fit.design_integrity.unresolved_references} drift=${fit.design_integrity.declaration_drifts}`,
        ],
      };
    } finally {
      if (!prebuiltDb) db.close();
    }
  } catch {
    return {
      messages: ["vmodel-fit - violation: V-model fit projection could not run"],
      ok: false,
    };
  }
}

export function checkRuleDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["rule-drift - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeRuleDrift(loadRuleAdapterDocs(repoRoot));
    return { messages: ruleDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["rule-drift - violation: adapter rule docs could not be read"],
      ok: false,
    };
  }
}

export function checkRuntimePortability(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["runtime-portability - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeRuntimePortability(loadRuntimePortabilityDocs(repoRoot));
    return { messages: runtimePortabilityMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["runtime-portability - violation: TS/Bun/Node portability lint could not run"],
      ok: false,
    };
  }
}

export function checkGateConfirm(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["gate-confirm - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeGateConfirm(loadGateConfirmDocs(repoRoot));
    return { messages: gateConfirmMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["gate-confirm - violation: gate-design/doc frontmatter could not be read"],
      ok: false,
    };
  }
}

export function checkPlanSchedule(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-schedule - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    return lintPlan(undefined, repoRoot);
  } catch {
    return {
      messages: ["plan-schedule - violation: PLAN schedule lint could not run"],
      ok: false,
    };
  }
}

export function checkPlanDescent(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-descent - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzePlanDescent(
      loadPlanDescentDocs(repoRoot),
      loadPlanDescentBaseline(repoRoot),
    );
    return { messages: planDescentMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["plan-descent - violation: plan descent lint could not run"],
      ok: false,
    };
  }
}

export function checkPlanEntryRouting(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-entry-routing - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const result = analyzePlanEntryRouting(
      loadPlanEntryRoutingDocsFromDb(repoRoot),
      loadPlanEntryRoutingBaseline(repoRoot),
    );
    return { messages: planEntryRoutingMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["plan-entry-routing - violation: plan entry routing lint could not run"],
      ok: false,
    };
  }
}

export function checkPlanGovernance(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-governance - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    return lintPlanWithGate(undefined, repoRoot, "governance");
  } catch {
    return {
      messages: ["plan-governance - violation: PLAN governance lint could not run"],
      ok: false,
    };
  }
}

export function checkPlanDod(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["plan-dod - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlanDod(loadPlanDodDocs(repoRoot));
    return { messages: planDodMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["plan-dod - violation: L7 PLAN DoD could not be read"],
      ok: false,
    };
  }
}

export function checkPlaceholderDeps(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["placeholder-deps - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzePlaceholderDeps(loadPlaceholderDepsDocs(repoRoot));
    return { messages: placeholderDepsMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["placeholder-deps - violation: design/test-design docs could not be read"],
      ok: false,
    };
  }
}

export function checkPlanTraceGate(
  repoRoot: string,
  gate: "G1-trace" | "G3-trace",
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: [`${gate.toLowerCase()} - violation: repo root could not be read`],
      ok: false,
    };
  }
  try {
    return lintPlanWithGate(undefined, repoRoot, gate);
  } catch {
    return {
      messages: [`${gate.toLowerCase()} - violation: trace gate could not run`],
      ok: false,
    };
  }
}

export function checkRuleAutomationClosure(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["rule-automation-closure - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeRuleAutomationClosure(loadRuleAutomationClosureDocs(repoRoot));
    return {
      messages: ruleAutomationClosureMessages(r),
      ok: r.checked > 0 && r.ok,
    };
  } catch {
    return {
      messages: ["rule-automation-closure - violation: closure table could not be read"],
      ok: false,
    };
  }
}

export function checkDriveModelPassage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["drive-model-passage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDriveModelPassage(loadDriveModelPassageDocs(repoRoot));
    return {
      messages: driveModelPassageMessages(r),
      ok: r.checked > 0 && r.ok,
    };
  } catch {
    return {
      messages: ["drive-model-passage - violation: passage certificate table could not be read"],
      ok: false,
    };
  }
}

export function checkDriveDbRegistration(
  repoRoot: string,
  prebuiltDb?: HarnessDb,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["drive-db-registration - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDriveDbRegistration(loadOrBuildDriveDbRegistrationStats(repoRoot, prebuiltDb));
    return { messages: driveDbRegistrationMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["drive-db-registration - violation: harness.db registration could not be read"],
      ok: false,
    };
  }
}

export function checkFrRoadmapCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["fr-roadmap-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeFrRoadmapCoverageWithRoot(loadFrRoadmapCoverageDocs(repoRoot), repoRoot);
    return {
      messages: frRoadmapCoverageMessages(r),
      ok: r.checked > 0 && r.ok,
    };
  } catch {
    return {
      messages: ["fr-roadmap-coverage - violation: residual bucket table could not be read"],
      ok: false,
    };
  }
}

export function checkTelemetryClosure(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["telemetry-closure - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeTelemetryClosure(loadTelemetryClosureDocs(repoRoot));
    return { messages: telemetryClosureMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["telemetry-closure - violation: telemetry closure matrix could not be read"],
      ok: false,
    };
  }
}

export function checkCycleP4Verification(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["cycle-p4-verification - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeCycleP4Verification(loadCycleP4VerificationDocs(repoRoot), repoRoot);
    return {
      messages: cycleP4VerificationMessages(r),
      ok: r.checked > 0 && r.ok,
    };
  } catch {
    return {
      messages: ["cycle-p4-verification - violation: Cycle P4 closure audit could not be read"],
      ok: false,
    };
  }
}

export function checkProjectHooks(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["project-hook - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeProjectHooks(loadProjectHookDocs(repoRoot));
    return { messages: projectHookMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["project-hook - violation: project hook settings could not be read"],
      ok: false,
    };
  }
}

export function checkCodexHookAdapter(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["codex-hook-adapter - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeCodexHookAdapter(loadCodexHookAdapterInput(repoRoot));
    return { messages: codexHookAdapterMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["codex-hook-adapter - violation: Codex hooks.json could not be read"],
      ok: false,
    };
  }
}

export function checkCodexHookTrust(repoRoot: string): { messages: string[]; ok: boolean } {
  const result = loadCodexHookTrust(repoRoot);
  return { messages: codexHookTrustMessages(result), ok: result.ok };
}

export function checkMemoryCommitHygiene(repoRoot: string): { messages: string[]; ok: true } {
  const result = inspectMemoryCommitHygiene(repoRoot);
  return {
    ok: true,
    messages: result.warning
      ? [
          `memory-commit-hygiene - warning: ${result.path} is uncommitted for ${Math.floor(result.ageMs / 3_600_000)}h; include it in the lane terminal commit`,
        ]
      : ["memory-commit-hygiene - OK"],
  };
}

export function checkToolContractRegistry(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["tool-contract-registry - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = auditToolContractRegistry();
    return { messages: toolContractRegistryMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["tool-contract-registry - violation: registry audit could not run"],
      ok: false,
    };
  }
}

export function checkCodexWrapperParity(deps: DoctorDeps): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(deps.repoRoot)) {
    return {
      messages: ["codex-wrapper-parity - violation: repo root could not be read"],
      ok: false,
    };
  }

  const requiredFiles = [
    join(deps.repoRoot, ".claude", "settings.json"),
    join(deps.repoRoot, "src", "runtime", "adapter.ts"),
    join(deps.repoRoot, "src", "runtime", "adapter-policy.ts"),
    join(deps.repoRoot, "tests", "runtime-hook-entrypoints.test.ts"),
    join(deps.repoRoot, "tests", "runtime-adapter.test.ts"),
    join(deps.repoRoot, "docs", "test-design", "harness", "L7-unit-test-design.md"),
  ];
  const reads = new Map(requiredFiles.map((path) => [path, deps.readText(path)]));
  const missing = requiredFiles.filter((path) => reads.get(path) === null);
  if (missing.length > 0) {
    return {
      messages: [
        `codex-wrapper-parity - violation: parity evidence could not be read (${missing
          .map((path) => path.replace(`${deps.repoRoot}\\`, "").replace(`${deps.repoRoot}/`, ""))
          .join(", ")})`,
      ],
      ok: false,
    };
  }

  const settings = reads.get(requiredFiles[0]) ?? "";
  const adapter = reads.get(requiredFiles[1]) ?? "";
  const adapterPolicy = reads.get(requiredFiles[2]) ?? "";
  const hookTests = reads.get(requiredFiles[3]) ?? "";
  const adapterTests = reads.get(requiredFiles[4]) ?? "";
  const testDesign = reads.get(requiredFiles[5]) ?? "";
  const violations: string[] = [];
  const settingStrings: string[] = [];
  try {
    const walk = (value: unknown): void => {
      if (typeof value === "string") {
        settingStrings.push(value);
        return;
      }
      if (Array.isArray(value)) {
        for (const item of value) walk(item);
        return;
      }
      if (value && typeof value === "object") {
        for (const item of Object.values(value)) walk(item);
      }
    };
    walk(JSON.parse(settings));
  } catch {
    violations.push(".claude/settings.json must be valid JSON");
  }

  const claudeHookCommands = [
    'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session start',
    'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" hook post-tool-use',
    'bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session summary',
  ];
  for (const command of claudeHookCommands) {
    if (!settingStrings.includes(command)) {
      violations.push(`Claude project hook command missing: ${command}`);
    }
  }

  const adapterUsesCodexPolicy =
    adapter.includes("CODEX_STDIN_ARGS") &&
    adapterPolicy.includes('CODEX_STDIN_ARGS = ["exec", "-"]');
  if (!/\?\s*\[\s*"exec"[\s\S]*"-"\s*\]/.test(adapter) && !adapterUsesCodexPolicy) {
    violations.push("Codex adapter args must use fixed `exec -` stdin sentinel");
  }
  if (!/stdin:\s*(intent\.task|formatAdapterPrompt\(intent\.task,)/.test(adapter)) {
    violations.push("Codex/Claude adapter task text must be carried by stdin");
  }
  if (!/plan_id:\s*intent\.planId/.test(adapter)) {
    violations.push("adapter plan id must remain harness metadata");
  }

  const codexWrapperTests = [
    "helix codex --execute records the same session lifecycle through the adapter wrapper",
    "helix codex --task-file feeds file content through the same adapter wrapper",
    "helix codex --plan records wrapper lifecycle without forwarding plan flags to Codex",
  ];
  for (const testName of codexWrapperTests) {
    if (!hookTests.includes(testName)) {
      violations.push(`Codex wrapper lifecycle test missing: ${testName}`);
    }
  }

  if (!adapterTests.includes("U-ADAPTER-007") || !adapterTests.includes("U-ADAPTER-008")) {
    violations.push("runtime adapter stdin oracles U-ADAPTER-007/U-ADAPTER-008 must be cited");
  }
  if (!testDesign.includes("U-ADAPTER-009")) {
    violations.push("U-ADAPTER-009 codex-wrapper-parity oracle must be documented");
  }

  if (violations.length > 0) {
    return {
      messages: violations.map((violation) => `codex-wrapper-parity - violation: ${violation}`),
      ok: false,
    };
  }

  return {
    messages: [
      "codex-wrapper-parity - OK (claude_hooks=project-settings, codex=helix-wrapper-lifecycle, adapter=stdin)",
    ],
    ok: true,
  };
}

export function checkL6FrCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["l6-fr-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeL6FrCoverage(loadL6FrCoverageDocs(repoRoot));
    return { messages: l6FrCoverageMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["l6-fr-coverage — ⚠ L6 FR coverage matrix を読めない"],
      ok: false,
    };
  }
}

export function checkReadability(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["readability - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeReadability(loadSystemReadabilityDocs(repoRoot));
    return { messages: readabilityMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return { messages: ["readability — ⚠ prose docs を読めない"], ok: false };
  }
}

/**
 * Expanded mojibake guard for generated runtime artifacts outside docs/
 * (PLAN-L7-69): .helix/audit/** markdown and .helix/handover/** JSON
 * (cross-agent provider payloads included). Fail-open on absence — a fresh
 * repo with no runtime artifacts has nothing to corrupt — and fail-close on
 * any mojibake marker so a corrupted handover/audit/provider-JSON cannot pass
 * silently. repo root unreadable is fail-close.
 */
export function checkRuntimeReadability(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["runtime-readability - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeReadability(loadRuntimeArtifactReadabilityDocs(repoRoot));
    return { messages: runtimeReadabilityMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["runtime-readability — ⚠ .helix artifacts を読めない"],
      ok: false,
    };
  }
}

/**
 * feedback-log のドメスティック化規律を hard gate 検査 (IMP-085、A-138 ITEM-3)。
 * docs/feedback-log.md 不在は fail-open (任意ドキュメント)、repo root 不在は fail-close。
 */
export function checkFeedbackLog(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["feedback-log - violation: repo root could not be read"],
      ok: false,
    };
  }
  if (!existsSync(join(repoRoot, "docs/feedback-log.md"))) {
    return {
      messages: ["feedback-log — OK (docs/feedback-log.md 不在 = 適用なし)"],
      ok: true,
    };
  }
  try {
    const r = analyzeFeedbackLog(loadFeedbackLogInput(repoRoot));
    return { messages: feedbackLogMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["feedback-log — ⚠ docs/feedback-log.md を読めない"],
      ok: false,
    };
  }
}

/** V-model 層群の Forward freeze 完了 (検証サイクル発火タイミング) を hard gate として検査する。 */
export function checkL6Completion(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!canLoadL6CompletionInputs(repoRoot)) {
    return {
      messages: ["l6-completion - violation: L6 completion inputs could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeL6Completion(loadL6CompletionInputs(repoRoot));
    return { messages: l6CompletionMessages(r), ok: r.ready };
  } catch {
    return {
      messages: ["l6-completion - violation: L6 completion readiness could not be read"],
      ok: false,
    };
  }
}

export function checkL7Completion(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["l7-completion - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeL7Completion(loadL7CompletionDocs(repoRoot));
    return { messages: l7CompletionMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["l7-completion - violation: active L4-L6 design docs could not be read"],
      ok: false,
    };
  }
}

/** impl→PLAN トレーサビリティ (src ⊆ PLAN generates ∪ baseline) を hard gate として検査する。 */
export function checkImplPlanTrace(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["impl-plan-trace - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeImplPlanTrace(loadImplPlanTraceInput(repoRoot));
    return { messages: implPlanTraceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["impl-plan-trace - violation: src/PLAN trace could not be read"],
      ok: false,
    };
  }
}

/** 要件 §G.1 sub-doc 表 ⊆⊇ schema VALID_SUB_DOCS の正本同期を hard gate として検査する (IMP-141)。 */
export function checkSubDocCatalogDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["sub-doc-catalog-drift - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeSubDocCatalogDrift(loadSubDocCatalogDriftInput(repoRoot));
    return { messages: subDocCatalogDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["sub-doc-catalog-drift - violation: requirements doc could not be read"],
      ok: false,
    };
  }
}

/** L4 標準成果物 (report/batch/notification/code-value) の必須 § 構造を hard gate として検査する (§G.6.1)。 */
export function checkSubDocSectionStructure(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["sub-doc-section-structure - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeSubDocSectionStructure(loadSubDocSectionStructureInput(repoRoot));
    return { messages: subDocSectionStructureMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["sub-doc-section-structure - violation: docs/plans could not be read"],
      ok: false,
    };
  }
}

/** 画面実装宣言 (implemented_screens) が検証ペア (next_pair_freeze) の段階順を破っていないか hard gate。 */
export function checkScreenImplPairFreeze(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["screen-impl-pair-freeze - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeScreenImplPairFreeze(loadScreenImplPairFreezeInput(repoRoot));
    return { messages: screenImplPairFreezeMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["screen-impl-pair-freeze - violation: screen-list.md could not be read"],
      ok: false,
    };
  }
}

/** L1 画面要求 ⇔ L2 画面設計の双方向 ID 被覆を hard gate として検査する (PLAN-DISCOVERY-11 収束機械判定)。 */
export function checkL1L2Consistency(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["l1-l2-consistency - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeL1L2Consistency(loadL1L2ConsistencyInput(repoRoot));
    return { messages: l1L2ConsistencyMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["l1-l2-consistency - violation: screen design docs could not be read"],
      ok: false,
    };
  }
}

/** HELIX 要件拘束の閾値 config が存在し、schema に適合することを hard gate として検査する。 */
export function checkRequirementsBindingConfig(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  const result = loadRequirementsBindingConfig(repoRoot, { requireFile: true });
  return { messages: result.messages, ok: result.ok };
}

/** high-confidence refactor candidate を放置せず triage 対象として doctor に surface する。 */
export function checkRefactorCandidateTriage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const configResult = loadRequirementsBindingConfig(repoRoot);
    if (!configResult.ok) {
      return {
        messages: ["refactor-candidate-triage - skipped (requirements-binding config invalid)"],
        ok: true,
      };
    }
    const policy = configResult.config.refactorCandidates;
    const highCandidates = analyzeRefactorCandidates(
      loadRefactorCandidateInputs(repoRoot, policy.scanRoots),
      policy,
    )
      .filter((candidate) => candidate.confidence === "high")
      .sort((a, b) => candidateRank(b) - candidateRank(a));
    if (highCandidates.length === 0) {
      return {
        messages: ["refactor-candidate-triage - OK (high=0)"],
        ok: true,
      };
    }
    const top = highCandidates
      .slice(0, 5)
      .map((candidate) => `${candidate.kind}:${candidate.subject}`)
      .join(", ");
    return {
      messages: [
        `refactor-candidate-triage - actionable (high=${highCandidates.length}, top=${top}; next=attach/create refactor PLAN or record accepted debt)`,
      ],
      ok: true,
    };
  } catch {
    return {
      messages: ["refactor-candidate-triage - warning: candidate scan could not run"],
      ok: true,
    };
  }
}

/** git tracked top-level ⊆ repository-structure.md canonical の突合を hard gate として検査する。 */
export function checkTrackedCanonical(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["tracked-canonical - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeTrackedCanonical(loadTrackedCanonicalInput(repoRoot));
    return { messages: trackedCanonicalMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["tracked-canonical - violation: git/repository-structure could not be read"],
      ok: false,
    };
  }
}

/** oracle 宣言 ⇔ 実テスト citation の突合を hard gate として検査する。 */
export function checkOracleTestTrace(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["oracle-test-trace - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeOracleTestTrace(loadOracleTestTraceInput(repoRoot));
    return { messages: oracleTestTraceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["oracle-test-trace - violation: test-design/tests could not be read"],
      ok: false,
    };
  }
}

/** 工程表 (登録 roadmap) の span 実在 + 層内ゲート進捗を hard gate として検査する。 */
export function checkRoadmap(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["roadmap - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const records = loadRoadmaps(repoRoot);
    // 全プログラム被覆 (program coverage): 登録工程表が forward 全バンドを被覆するか。
    // PLAN-RECOVERY-04 工程表定義 = 人間向け全プログラム台帳。登録 0 は hard violation。
    const coverageMessages = programCoverageMessages(
      analyzeProgramCoverage(records, new Set(PARKED_BANDS.keys())),
    );
    const featurePackCoverage = analyzeL7FeaturePackCoverage(records);
    const featurePackMessages = l7FeaturePackCoverageMessages(featurePackCoverage);
    if (records.length === 0) {
      return {
        messages: [
          "roadmap - violation: 登録工程表なし (master-hub roadmap block 未使用)",
          ...coverageMessages,
          ...featurePackMessages,
        ],
        ok: false,
      };
    }
    // I-1: 各 PLAN を 1 回だけ読み id→status を構築 (二重 readFile 解消)。
    const dir = join(repoRoot, "docs", "plans");
    const known = new Set<string>();
    const statusMap = new Map<string, string>();
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
      const content = readFileSync(join(dir, f), "utf8");
      const id = fmValue(content, "plan_id");
      if (id) {
        known.add(id);
        statusMap.set(id, fmValue(content, "status") ?? "draft");
      }
    }
    const messages: string[] = [];
    let issueCount = 0;
    for (const rec of records) {
      const spanIssues = checkSpanExistence(rec.roadmap, known);
      issueCount += spanIssues.length + rec.errors.length;
      const progress = computeGateProgress(rec.roadmap, (id) => statusMap.get(id) ?? null);
      const reached = progress.filter((g) => g.reached).length;
      messages.push(
        `roadmap — ${rec.planId} [${rec.roadmap.layer}]: gates ${reached}/${progress.length} 到達, spans ${rec.roadmap.spans.length}, 孤児 span ${spanIssues.length}, 構造 issue ${rec.errors.length}`,
      );
      for (const gi of progress) {
        messages.push(
          `  ${gi.gateId}: ${gi.reached ? "✅ reached" : "pending"} (${gi.confirmedSpans}/${gi.totalSpans} span reached: confirmed/completed)`,
        );
      }
      for (const si of spanIssues) messages.push(`  ⚠ ${si}`);
      for (const e of rec.errors) messages.push(`  ⚠ 構造: ${e}`);
    }
    const rollup = computeProgramRollup(
      records,
      (id) => statusMap.get(id) ?? null,
      new Set(PARKED_BANDS.keys()),
    );
    messages.push(
      `roadmap-rollup — bands ${rollup.coveredBands}/${rollup.totalBands} covered (park ${rollup.parkedBands}, uncovered ${rollup.uncoveredBands}) / gates ${rollup.reachedGates}/${rollup.totalGates} reached / spans ${rollup.confirmedSpans}/${rollup.totalSpans} / frontier: ${rollup.frontier.length ? rollup.frontier.join(", ") : "なし"}`,
    );
    messages.push(...coverageMessages);
    messages.push(...featurePackMessages);
    const coverageOk =
      analyzeProgramCoverage(records, new Set(PARKED_BANDS.keys())).uncovered.length === 0;
    return {
      messages,
      ok: issueCount === 0 && coverageOk && featurePackCoverage.ok,
    };
  } catch {
    return {
      messages: ["roadmap - violation: 工程表を読めず検査できない"],
      ok: false,
    };
  }
}

export function checkDependencyDrift(repoRoot: string): {
  messages: string[];
  ok: boolean;
  result: DependencyDriftResult | null;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["dependency-drift - violation: repo root could not be read"],
      ok: false,
      result: null,
    };
  }
  try {
    const result = analyzeDependencyDrift(loadDependencyDriftInput(repoRoot));
    return { messages: dependencyDriftMessages(result), ok: result.ok, result };
  } catch {
    return {
      messages: ["dependency-drift - violation: dependency graph could not be read"],
      ok: false,
      result: null,
    };
  }
}

export function checkRegressionExpansion(
  repoRoot: string,
  drift: DependencyDriftResult | null,
): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["regression-expansion - violation: repo root could not be read"],
      ok: false,
    };
  }
  if (drift == null) {
    return {
      messages: ["regression-expansion - violation: dependency drift result is unavailable"],
      ok: false,
    };
  }
  try {
    const result = expandRegressionScope(drift, loadChangedFilesForDoctor(repoRoot));
    return { messages: regressionExpansionMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["regression-expansion - violation: regression scope could not be expanded"],
      ok: false,
    };
  }
}

export function checkVerificationGroupsResult(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const docs = loadPairDocs(repoRoot);
    const { orphans } = analyzePairFreeze(docs);
    const groups = analyzeVerificationGroups(docs, orphans, loadVerificationPlanEvidence(repoRoot));
    return {
      messages: verificationGroupMessages(groups),
      ok: verificationGroupsOk(groups),
    };
  } catch {
    return {
      messages: ["verification — violation: verification group lint could not run"],
      ok: false,
    };
  }
}

export function checkVerificationGroups(repoRoot: string): string[] {
  return checkVerificationGroupsResult(repoRoot).messages;
}

/** doctor 用に agent-slots deps を node I/O で構築 (now 固定は test 注入)。 */
function doctorSlotsDeps(deps: DoctorDeps): AgentSlotsDeps {
  return {
    repoRoot: deps.repoRoot,
    now: () => deps.now,
    readText: deps.readText,
    writeText: () => {}, // doctor は read-only
    newId: () => "doctor-readonly",
  };
}

export function nodeDoctorDeps(repoRoot: string): DoctorDeps {
  return {
    repoRoot,
    now: new Date().toISOString(),
    readText: (path) => {
      try {
        return existsSync(path) && statSync(path).isFile() ? readFileSync(path, "utf8") : null;
      } catch {
        return null;
      }
    },
    listDir: (dir) => {
      try {
        return existsSync(dir) && statSync(dir).isDirectory() ? readdirSync(dir) : [];
      } catch {
        return [];
      }
    },
  };
}

function consumerFile(deps: DoctorDeps, relativePath: string): string | null {
  return deps.readText(join(deps.repoRoot, ...relativePath.split("/")));
}

function consumerPackageFile(
  deps: DoctorDeps,
  packageRoot: string | undefined,
  relativePath: string,
): string | null {
  const root = packageRoot && packageRoot.trim().length > 0 ? packageRoot : deps.repoRoot;
  const absoluteRoot = isAbsolute(root) ? root : join(deps.repoRoot, ...root.split("/"));
  return deps.readText(join(absoluteRoot, ...relativePath.split("/")));
}

function consumerHasFile(deps: DoctorDeps, relativePath: string): boolean {
  return consumerFile(deps, relativePath) !== null;
}

function consumerPathsUnder(deps: DoctorDeps, relativeDir: string, maxDepth = 8): string[] {
  if (maxDepth < 0) return [];
  const absoluteDir = join(deps.repoRoot, ...relativeDir.split("/").filter(Boolean));
  return deps
    .listDir(absoluteDir)
    .flatMap((entry) => {
      const child = relativeDir ? `${relativeDir}/${entry}` : entry;
      const normalized = child.replace(/\\/g, "/");
      if (consumerHasFile(deps, normalized)) return [normalized];
      return consumerPathsUnder(deps, normalized, maxDepth - 1);
    })
    .sort();
}

function prematureHelixRuntimePaths(deps: DoctorDeps): string[] {
  const runtimeLikeRoots = new Set([
    "adapters",
    "audit",
    "cache",
    "evidence",
    "handover",
    "logs",
    "memory",
    "review",
    "state",
    "teams",
  ]);
  const runtimeLikeRootFiles = new Set(["harness.db"]);
  return consumerPathsUnder(deps, "helix").filter((path) => {
    const [, firstSegment] = path.split("/");
    if (!firstSegment) return false;
    return runtimeLikeRoots.has(firstSegment) || runtimeLikeRootFiles.has(firstSegment);
  });
}

function consumerJson(deps: DoctorDeps, relativePath: string): unknown | null {
  const raw = consumerFile(deps, relativePath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function consumerYaml(deps: DoctorDeps, relativePath: string): unknown | null {
  const raw = consumerFile(deps, relativePath);
  if (raw === null) return null;
  try {
    return parseYaml(raw) as unknown;
  } catch {
    return null;
  }
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function runConsumerDoctor(deps: DoctorDeps = nodeDoctorDeps(process.cwd())): LintResult {
  const messages: string[] = ["doctor: profile=consumer"];
  const expectedClaudeAgentPaths = CONSUMER_CLAUDE_AGENT_NAMES.map(
    (name) => `.claude/agents/${name}.md`,
  );
  const expectedClaudeCommandPaths = CONSUMER_CLAUDE_COMMAND_NAMES.map(
    (name) => `.claude/commands/${name}.md`,
  );
  const requiredFiles = [
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/CLAUDE.md",
    ".claude/settings.json",
    ".codex/config.toml",
    ".codex/hooks.json",
    ".vscode/tasks.json",
    ".vscode/settings.json",
    ".github/workflows/harness-check.yml",
    ".github/workflows/escalation-stale.yml",
    ".github/ISSUE_TEMPLATE/recovery.md",
    ".github/ISSUE_TEMPLATE/add-feature.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    "scripts/setup-branch-protection.sh",
    ...expectedClaudeAgentPaths,
    ...expectedClaudeCommandPaths,
    CONSUMER_TEAM_DEFINITION_PATH,
    ".helix/memory/.gitkeep",
    ".helix/evidence/.gitkeep",
    ".helix/state/project-setup.json",
  ];
  const missing = requiredFiles.filter((path) => !consumerHasFile(deps, path));
  messages.push(
    missing.length === 0
      ? `doctor: consumer-files - OK (checked=${requiredFiles.length})`
      : `doctor: consumer-files - violation missing=${missing.join(",")}`,
  );

  const agents = consumerFile(deps, "AGENTS.md") ?? "";
  const claude = consumerFile(deps, "CLAUDE.md") ?? "";
  const claudeRuntime = consumerFile(deps, ".claude/CLAUDE.md") ?? "";
  const adapterDocHasConsumerPolicy = (text: string) =>
    text.includes("日本語を既定") &&
    text.includes("docs / handover / adapter prose も日本語") &&
    text.includes("PLAN-M-02") &&
    text.includes("helix completion decision-packet --json") &&
    text.includes("helix completion review-bundle --json") &&
    text.includes("semantic digest") &&
    text.includes(
      "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
    ) &&
    text.includes("helix doctor --profile consumer");
  const docsOk =
    agents.includes("HELIX アダプター") &&
    agents.includes("HELIX:managed:start") &&
    adapterDocHasConsumerPolicy(agents) &&
    claude.includes("HELIX 共有コンテキスト") &&
    claude.includes("HELIX:managed:start") &&
    adapterDocHasConsumerPolicy(claude) &&
    claudeRuntime.includes("Claude runtime アダプター") &&
    claudeRuntime.includes("HELIX:managed:start") &&
    adapterDocHasConsumerPolicy(claudeRuntime);
  messages.push(
    docsOk
      ? "doctor: consumer-adapter-docs - OK (managed blocks, Japanese rule, consumer profile, cutover boundary present)"
      : "doctor: consumer-adapter-docs - violation: adapter docs missing managed/Japanese/consumer-profile/cutover markers",
  );
  const legacyCliName = ["ut", "tdd"].join("-");
  const legacyStateDir = `.${legacyCliName}`;
  const legacyState = [
    ...consumerPathsUnder(deps, legacyStateDir),
    ...prematureHelixRuntimePaths(deps),
  ].sort();
  const packageJson = recordValue(consumerJson(deps, "package.json"));
  const packageName = typeof packageJson?.name === "string" ? packageJson.name : "";
  const packageBinRaw = packageJson?.bin;
  const packageBin = recordValue(packageJson?.bin);
  const packageScripts = recordValue(packageJson?.scripts);
  const executableSurfacePaths = [
    ".vscode/tasks.json",
    ".github/workflows/harness-check.yml",
    ".claude/settings.json",
    ".codex/hooks.json",
    ...expectedClaudeAgentPaths,
    ...expectedClaudeCommandPaths,
  ];
  const legacyCommandPattern = new RegExp(
    String.raw`\b${legacyCliName}(?:\s+(?:--[a-z0-9-]+|[a-z][a-z0-9-]*))?(?=\s|$)`,
  );
  const legacyAlias = [
    ...(packageBin && Object.hasOwn(packageBin, legacyCliName)
      ? [`package.json:bin.${legacyCliName}`]
      : []),
    ...(typeof packageBinRaw === "string" &&
    new RegExp(`(?:^|/)${legacyCliName}$`).test(packageName)
      ? ["package.json:bin"]
      : []),
    ...Object.entries(packageScripts ?? {})
      .filter(([, value]) => typeof value === "string" && legacyCommandPattern.test(value))
      .map(([name]) => `package.json:scripts.${name}`),
    ...executableSurfacePaths.filter((path) =>
      legacyCommandPattern.test(consumerFile(deps, path) ?? ""),
    ),
  ];
  messages.push(
    legacyState.length === 0 && legacyAlias.length === 0
      ? "doctor: consumer-identifier-transition - OK (.helix state and helix package/bin are canonical; legacy state/CLI absent)"
      : `doctor: consumer-identifier-transition - violation legacy_state=${legacyState.join(",")} legacy_alias=${legacyAlias.join(",")}`,
  );

  const projectSetupState = recordValue(consumerJson(deps, ".helix/state/project-setup.json"));
  const projectSetupWorkspace = recordValue(projectSetupState?.workspace);
  const projectSetupPackageRoot =
    typeof projectSetupWorkspace?.packageRoot === "string"
      ? projectSetupWorkspace.packageRoot
      : deps.repoRoot;
  const projectSetupObjectiveBoundary = recordValue(projectSetupState?.objectiveBoundary);
  const projectSetupPostWorkflow = recordValue(projectSetupState?.postSetupWorkflow);
  const projectSetupVerificationCommands = stringList(
    projectSetupPostWorkflow?.verificationCommands,
  );
  const projectSetupVerificationMatrix = Array.isArray(projectSetupPostWorkflow?.verificationMatrix)
    ? projectSetupPostWorkflow.verificationMatrix.map(recordValue)
    : [];
  const projectSetupMatrixCommands = projectSetupVerificationMatrix
    .map((row) => (typeof row?.command === "string" ? row.command : ""))
    .filter(Boolean);
  const projectSetupMatrixPhases = projectSetupVerificationMatrix
    .map((row) => (typeof row?.phase === "string" ? row.phase : ""))
    .filter(Boolean);
  const expectedFirstRunRows = [
    { phase: "setup-dry-run", command: "helix setup project --dry-run" },
    { phase: "vscode-profile-open", command: "code --profile HELIX ." },
    { phase: "status-frontier", command: "helix status --json" },
    {
      phase: "github-ci-safety",
      command: "helix setup project --dry-run --json",
    },
    {
      phase: "completion-decision-packet",
      command: "helix completion decision-packet --json",
    },
    {
      phase: "completion-review-bundle",
      command: "helix completion review-bundle --json",
    },
    {
      phase: "version-up-dry-run",
      command:
        "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
    },
    { phase: "consumer-doctor", command: "helix doctor --profile consumer" },
    { phase: "identifier-cutover-packet", command: "helix rename plan --json" },
    { phase: "continuation-status", command: "helix status --json" },
    {
      phase: "team-run-dry-run",
      command: `helix team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
    },
  ];
  const expectedFirstRunCommands = [
    ...new Set(
      expectedFirstRunRows
        .filter((row) => row.phase !== "vscode-profile-open")
        .map((row) => row.command),
    ),
  ];
  const completionReviewMatrixRow = projectSetupVerificationMatrix.find(
    (row) => row?.phase === "completion-review-bundle",
  );
  const completionReviewSemanticDigestOk =
    typeof completionReviewMatrixRow?.expected === "string" &&
    completionReviewMatrixRow.expected.includes("bundleDigest") &&
    completionReviewMatrixRow.expected.includes("semanticBundleDigest") &&
    typeof completionReviewMatrixRow?.adoptionDecision === "string" &&
    completionReviewMatrixRow.adoptionDecision.includes("semantic digest");
  const projectSetupMatrixOk =
    projectSetupVerificationMatrix.length === expectedFirstRunRows.length &&
    projectSetupVerificationCommands.length === expectedFirstRunCommands.length &&
    expectedFirstRunCommands.every(
      (command, index) => projectSetupVerificationCommands[index] === command,
    ) &&
    expectedFirstRunRows.every((expected, index) => {
      const row = projectSetupVerificationMatrix[index];
      return row?.phase === expected.phase && row.command === expected.command;
    }) &&
    projectSetupVerificationMatrix.every((row) => {
      if (!row) return false;
      return (
        typeof row.phase === "string" &&
        typeof row.command === "string" &&
        row.writePolicy === "no-write" &&
        Array.isArray(row.requiresMaterializedPaths) &&
        typeof row.expected === "string" &&
        row.expected.trim().length > 0 &&
        typeof row.evidence === "string" &&
        row.evidence.trim().length > 0
      );
    }) &&
    completionReviewSemanticDigestOk;
  const projectSetupStateOk =
    projectSetupState?.schemaVersion === "helix-project-setup-state.v1" &&
    projectSetupState?.setupCommand === "helix setup project" &&
    projectSetupObjectiveBoundary?.scope ===
      "consumer_setup_readiness_not_whole_program_completion" &&
    projectSetupObjectiveBoundary?.completionClaimAllowed === false &&
    projectSetupObjectiveBoundary?.completionPacketCommand ===
      "helix completion decision-packet --json" &&
    projectSetupObjectiveBoundary?.completionReviewBundleCommand ===
      "helix completion review-bundle --json" &&
    projectSetupPostWorkflow?.readinessOk === true &&
    projectSetupPostWorkflow?.nextRoute === "ready" &&
    projectSetupVerificationCommands.includes("helix completion decision-packet --json") &&
    projectSetupVerificationCommands.includes("helix completion review-bundle --json") &&
    projectSetupVerificationCommands.includes("helix doctor --profile consumer") &&
    projectSetupMatrixOk;
  messages.push(
    projectSetupStateOk
      ? "doctor: consumer-project-setup-state - OK (completion boundary persisted; completionClaimAllowed=false; first-run matrix persisted)"
      : `doctor: consumer-project-setup-state - violation schema=${projectSetupState?.schemaVersion === "helix-project-setup-state.v1"} setupCommand=${projectSetupState?.setupCommand === "helix setup project"} scope=${projectSetupObjectiveBoundary?.scope === "consumer_setup_readiness_not_whole_program_completion"} completionClaimAllowed=${projectSetupObjectiveBoundary?.completionClaimAllowed === false} completionPacket=${projectSetupObjectiveBoundary?.completionPacketCommand === "helix completion decision-packet --json"} completionReviewBundle=${projectSetupObjectiveBoundary?.completionReviewBundleCommand === "helix completion review-bundle --json"} completionReviewSemanticDigest=${completionReviewSemanticDigestOk} readinessOk=${String(projectSetupPostWorkflow?.readinessOk ?? "")} nextRoute=${String(projectSetupPostWorkflow?.nextRoute ?? "")} verificationCommands=${projectSetupVerificationCommands.join(",")} verificationMatrix=${projectSetupMatrixOk} matrixPhases=${projectSetupMatrixPhases.join(",")} matrixCommands=${projectSetupMatrixCommands.join(",")}`,
  );

  const consumerPackageJson = recordValue(
    (() => {
      const raw = consumerPackageFile(deps, projectSetupPackageRoot, "package.json");
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return null;
      }
    })(),
  );
  const consumerPackageScripts = recordValue(consumerPackageJson?.scripts);
  const missingPackageReadiness = [
    ...(consumerPackageJson ? [] : ["consumer_readiness:package-json"]),
    ...[
      ["helix", "consumer_readiness:helix-package-script"],
      ["typecheck", "consumer_readiness:typecheck-package-script"],
      ["test", "consumer_readiness:test-package-script"],
    ]
      .filter(([script]) => {
        const value = consumerPackageScripts?.[script];
        return typeof value !== "string" || value.trim().length === 0;
      })
      .map(([, violation]) => violation),
    ...(consumerPackageFile(deps, projectSetupPackageRoot, "bun.lock") !== null ||
    consumerPackageFile(deps, projectSetupPackageRoot, "bun.lockb") !== null
      ? []
      : ["consumer_readiness:bun-lockfile"]),
  ];
  const consumerPackagePreflightOk = missingPackageReadiness.length === 0;
  messages.push(
    consumerPackagePreflightOk
      ? `doctor: consumer-package-preflight - OK (packageRoot=${projectSetupPackageRoot}, scripts=helix,typecheck,test, lockfile=bun.lock|bun.lockb)`
      : `doctor: consumer-package-preflight - violation packageRoot=${projectSetupPackageRoot} missing=${missingPackageReadiness.join(",")}`,
  );

  const claudeSettings = consumerFile(deps, ".claude/settings.json") ?? "";
  const claudeOk = consumerClaudeHookSettingsMatchContract(claudeSettings);
  messages.push(
    claudeOk
      ? "doctor: consumer-claude-adapter - OK (structured work/agent/git guard, session hooks, and blockOnFailure contract present)"
      : "doctor: consumer-claude-adapter - violation: Claude hooks JSON/schema baseline incomplete",
  );

  const codexHooks = consumerFile(deps, ".codex/hooks.json") ?? "";
  const codexConfig = consumerFile(deps, ".codex/config.toml") ?? "";
  const codexOk =
    consumerCodexConfigEnablesHooks(codexConfig) &&
    consumerCodexHookSettingsMatchContract(codexHooks);
  messages.push(
    codexOk
      ? "doctor: consumer-codex-adapter - OK (hooks enabled; structured work/agent/git guard, session hooks, and blockOnFailure contract present)"
      : "doctor: consumer-codex-adapter - violation: Codex hooks/config JSON/schema baseline incomplete",
  );

  const invalidAgentTemplates = expectedClaudeAgentPaths.filter((path) => {
    const text = consumerFile(deps, path) ?? "";
    const fm = parseMarkdownFrontmatter(text);
    const expectedName = basename(path, ".md");
    return !(
      fm?.name === expectedName &&
      typeof fm.description === "string" &&
      fm.description.trim().length > 0 &&
      typeof fm.tools === "string" &&
      fm.tools.trim().length > 0 &&
      text.includes("consumer-safe な HELIX subagent") &&
      text.includes("helix status") &&
      text.includes("helix completion decision-packet --json") &&
      text.includes("helix completion review-bundle --json") &&
      text.includes(
        "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      ) &&
      text.includes("helix doctor --profile consumer") &&
      text.includes("secret、credential、PII") &&
      text.includes("findings") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const invalidCommandTemplates = expectedClaudeCommandPaths.filter((path) => {
    const text = consumerFile(deps, path) ?? "";
    const fm = parseMarkdownFrontmatter(text);
    return !(
      typeof fm?.description === "string" &&
      fm.description.trim().length > 0 &&
      text.includes("HELIX") &&
      text.includes("helix status --json") &&
      text.includes("helix completion decision-packet --json") &&
      text.includes("helix completion review-bundle --json") &&
      text.includes(
        "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      ) &&
      text.includes("helix doctor --profile consumer") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const claudeSurfaceOk =
    invalidAgentTemplates.length === 0 && invalidCommandTemplates.length === 0;
  messages.push(
    claudeSurfaceOk
      ? `doctor: consumer-claude-surface - OK (agents=${expectedClaudeAgentPaths.length}, commands=${expectedClaudeCommandPaths.length}, Japanese+completion-packet+version-up+consumer-doctor baseline)`
      : `doctor: consumer-claude-surface - violation invalidAgents=${invalidAgentTemplates.join(",")} invalidCommands=${invalidCommandTemplates.join(",")}`,
  );

  const teamDefinition = teamDefinitionSchema.safeParse(
    consumerYaml(deps, CONSUMER_TEAM_DEFINITION_PATH),
  );
  const teamRunPlan = teamDefinition.success
    ? buildTeamRunPlan(teamDefinition.data, "hybrid")
    : null;
  const teamSurfaceOk =
    teamDefinition.success &&
    teamDefinition.data.name === "default-hybrid" &&
    teamDefinition.data.members.some(
      (member) => member.role === "se" && member.engine.startsWith("codex"),
    ) &&
    teamDefinition.data.members.some(
      (member) =>
        (member.role === "tl" || member.role === "qa") &&
        (member.engine.startsWith("pmo-") || member.engine.startsWith("claude")),
    ) &&
    teamRunPlan?.ok === true &&
    teamRunPlan.dry_run === true &&
    teamRunPlan.members.some((member) => member.provider === "codex") &&
    teamRunPlan.members.some((member) => member.provider === "claude");
  messages.push(
    teamSurfaceOk
      ? `doctor: consumer-team-run-surface - OK (${CONSUMER_TEAM_DEFINITION_PATH}, members=${teamRunPlan?.members.length ?? 0}, dry-run=hybrid)`
      : `doctor: consumer-team-run-surface - violation path=${CONSUMER_TEAM_DEFINITION_PATH} schema=${teamDefinition.success} messages=${teamRunPlan?.messages.join("|") ?? "schema-invalid"}`,
  );

  const tasks = consumerJson(deps, ".vscode/tasks.json") as {
    version?: unknown;
    tasks?: {
      label?: string;
      command?: string;
      type?: string;
      problemMatcher?: unknown;
      runOptions?: { runOn?: string };
      options?: unknown;
    }[];
  } | null;
  const tasksVersionOk = tasks?.version === "2.0.0";
  const tasksArrayOk = Array.isArray(tasks?.tasks);
  const taskList = tasksArrayOk ? (tasks.tasks ?? []) : [];
  const tasksByLabel = new Map(taskList.map((task) => [task.label ?? "", task]));
  const expectedTasks = new Map(CONSUMER_VSCODE_TASK_COMMANDS);
  const missingTasks = [...expectedTasks.entries()].filter(
    ([label, command]) => tasksByLabel.get(label)?.command !== command,
  );
  const unsafeTasks = [...expectedTasks.keys()].filter((label) => {
    const task = tasksByLabel.get(label);
    if (!task) return false;
    if (task.type !== "shell") return true;
    if (!Array.isArray(task.problemMatcher) || task.problemMatcher.length !== 0) return true;
    if (task.runOptions?.runOn && task.runOptions.runOn !== "default") return true;
    return task.options !== undefined;
  });
  const autoRunTasks = taskList
    .filter((task) => task.runOptions?.runOn && task.runOptions.runOn !== "default")
    .map((task) => task.label ?? "<unlabeled>");
  const vscodeSettings = consumerJson(deps, ".vscode/settings.json") as Record<
    string,
    unknown
  > | null;
  const automaticTasksOff = vscodeSettings?.["task.allowAutomaticTasks"] === "off";
  const taskSafetyOk =
    tasksVersionOk &&
    tasksArrayOk &&
    missingTasks.length === 0 &&
    unsafeTasks.length === 0 &&
    autoRunTasks.length === 0 &&
    automaticTasksOff;
  messages.push(
    taskSafetyOk
      ? `doctor: consumer-vscode-tasks - OK (version=2.0.0, tasks=${expectedTasks.size}, safety=automatic-off,no-runOn,problemMatcher-empty)`
      : `doctor: consumer-vscode-tasks - violation version=${tasksVersionOk} tasksArray=${tasksArrayOk} missing_or_wrong=${missingTasks
          .map(([label]) => label)
          .join(
            ",",
          )} unsafe=${unsafeTasks.join(",")} autoRun=${autoRunTasks.join(",")} automaticTasksOff=${automaticTasksOff}`,
  );

  const workflowRaw = consumerFile(deps, ".github/workflows/harness-check.yml") ?? "";
  const ciContract = analyzeConsumerCiWorkflowContract(workflowRaw);
  messages.push(
    ciContract.ok
      ? `doctor: consumer-ci-workflow - OK (workflow=harness-check, permissions=contents:read, triggers=push/pull_request:main, commands=${2 + CONSUMER_CI_RUN_COMMANDS.length}, secrets=not-required)`
      : `doctor: consumer-ci-workflow - violation name=${ciContract.nameOk} pushMain=${ciContract.pushMain} pullRequestMain=${ciContract.pullRequestMain} unexpectedTriggers=${ciContract.unexpectedTriggers.join(",")} noPullRequestTarget=${ciContract.noPullRequestTarget} permissionsRead=${ciContract.permissionsRead} tokenWrite=${ciContract.tokenWrite} job=${ciContract.jobOk} checkoutPersistCredentialsFalse=${ciContract.checkoutPersistCredentialsFalse} checkoutInputsExact=${ciContract.checkoutInputsExact} setupBunInputsEmpty=${ciContract.setupBunInputsEmpty} customEnvFree=${ciContract.customEnvFree} skipOrSoftFailFree=${ciContract.skipOrSoftFailFree} jobPermissionsFixed=${ciContract.jobPermissionsFixed} executionSurfaceFixed=${ciContract.executionSurfaceFixed} missingUses=${ciContract.missingUses.join(",")} unexpectedUses=${ciContract.unexpectedUses.join(",")} missingRuns=${ciContract.missingRuns.join(",")} exactSteps=${ciContract.exactSteps} exactRuns=${ciContract.exactRuns} secrets=${!ciContract.secretsFree}`,
  );

  const escalationWorkflowRaw = consumerFile(deps, ".github/workflows/escalation-stale.yml") ?? "";
  const escalationContract = analyzeConsumerEscalationWorkflowContract(escalationWorkflowRaw);
  messages.push(
    escalationContract.ok
      ? `doctor: consumer-escalation-workflow - OK (workflow=escalation-stale, permissions=contents:read, schedule=weekly, commands=${2 + CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS.length}, placeholder-free)`
      : `doctor: consumer-escalation-workflow - violation name=${escalationContract.nameOk} schedule=${escalationContract.scheduleOk} unexpectedTriggers=${escalationContract.unexpectedTriggers.join(",")} noPullRequestTarget=${escalationContract.noPullRequestTarget} permissionsRead=${escalationContract.permissionsRead} tokenWrite=${escalationContract.tokenWrite} job=${escalationContract.jobOk} checkoutPersistCredentialsFalse=${escalationContract.checkoutPersistCredentialsFalse} checkoutInputsExact=${escalationContract.checkoutInputsExact} setupBunInputsEmpty=${escalationContract.setupBunInputsEmpty} customEnvFree=${escalationContract.customEnvFree} skipOrSoftFailFree=${escalationContract.skipOrSoftFailFree} jobPermissionsFixed=${escalationContract.jobPermissionsFixed} executionSurfaceFixed=${escalationContract.executionSurfaceFixed} missingUses=${escalationContract.missingUses.join(",")} unexpectedUses=${escalationContract.unexpectedUses.join(",")} missingRuns=${escalationContract.missingRuns.join(",")} exactSteps=${escalationContract.exactSteps} exactRuns=${escalationContract.exactRuns} secrets=${!escalationContract.secretsFree} placeholderFree=${escalationContract.placeholderFree}`,
  );

  const branchProtectionScript = consumerFile(deps, "scripts/setup-branch-protection.sh") ?? "";
  const branchProtectionScriptOk = branchProtectionScriptIsApplyCapable(branchProtectionScript);
  messages.push(
    branchProtectionScriptOk
      ? "doctor: consumer-branch-protection-script - OK (gh auth/admin preflight, apply-capable, token-free)"
      : "doctor: consumer-branch-protection-script - violation: script must contain gh auth status, admin permission check, gh api -X PUT branch protection apply, harness-check context, and no token/secrets persistence",
  );

  const recoveryTemplate = consumerFile(deps, ".github/ISSUE_TEMPLATE/recovery.md") ?? "";
  const addFeatureTemplate = consumerFile(deps, ".github/ISSUE_TEMPLATE/add-feature.md") ?? "";
  const pullRequestTemplate = consumerFile(deps, ".github/PULL_REQUEST_TEMPLATE.md") ?? "";
  const recoveryOk =
    recoveryTemplate.includes("name: Recovery") &&
    recoveryTemplate.includes("labels: recovery") &&
    recoveryTemplate.includes("## 発生事象") &&
    recoveryTemplate.includes("## 復旧手順") &&
    recoveryTemplate.includes("## 再発防止") &&
    recoveryTemplate.includes("## L14 route");
  const addFeatureOk =
    addFeatureTemplate.includes("name: Add-feature") &&
    addFeatureTemplate.includes("labels: add-feature") &&
    addFeatureTemplate.includes("## 追加する機能") &&
    addFeatureTemplate.includes("## drive") &&
    addFeatureTemplate.includes("## 受け入れ条件") &&
    addFeatureTemplate.includes("## 上位整合");
  const pullRequestOk =
    pullRequestTemplate.includes("## 概要") &&
    pullRequestTemplate.includes("## 関連 PLAN / Issue") &&
    pullRequestTemplate.includes("Closes #") &&
    pullRequestTemplate.includes("## V-model artifact") &&
    pullRequestTemplate.includes("docs/design/") &&
    pullRequestTemplate.includes("src/") &&
    pullRequestTemplate.includes("docs/test-design/") &&
    pullRequestTemplate.includes("tests/") &&
    pullRequestTemplate.includes("## 検証") &&
    pullRequestTemplate.includes("typecheck pass") &&
    pullRequestTemplate.includes("全回帰 pass");
  const policyTemplatesOk = recoveryOk && addFeatureOk && pullRequestOk;
  messages.push(
    policyTemplatesOk
      ? "doctor: consumer-policy-templates - OK (issue=recovery/add-feature, pr=vmodel-artifacts+verification)"
      : `doctor: consumer-policy-templates - violation recovery=${recoveryOk} addFeature=${addFeatureOk} pullRequest=${pullRequestOk}`,
  );

  const ok =
    missing.length === 0 &&
    docsOk &&
    legacyState.length === 0 &&
    legacyAlias.length === 0 &&
    projectSetupStateOk &&
    consumerPackagePreflightOk &&
    claudeOk &&
    codexOk &&
    claudeSurfaceOk &&
    teamSurfaceOk &&
    taskSafetyOk &&
    ciContract.ok &&
    escalationContract.ok &&
    branchProtectionScriptOk &&
    policyTemplatesOk;
  return { ok, messages };
}

/**
 * doc-consistency lint を hard gate 検査 (PLAN-L7-95、要件 §G.11 の「自動検証」配線)。
 * carry 整合 / screen-id 妥当性 / NFR 件数宣言-実数を fail-close。I/O 失敗も violation。
 */
export function checkDocConsistency(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeDocConsistency(loadDocConsistencyDocs(repoRoot));
    const bad =
      r.carryOrphans.length +
      r.screenIdOrphans.length +
      (r.nfrCount.mismatch ? 1 : 0) +
      r.helixSetupReviewBundleMissing.length +
      r.helixSetupVersionUpTargetMissing.length;
    if (bad === 0) {
      return {
        messages: [
          `doc-consistency — OK (carry/screen-id/NFR/setup 整合, screens=${r.definedScreenCount}, NFR=${r.nfrCount.actual})`,
        ],
        ok: true,
      };
    }
    return {
      messages: [
        `doc-consistency — violation: carryOrphans=${r.carryOrphans.length}, screenIdOrphans=${r.screenIdOrphans.length}, nfrMismatch=${r.nfrCount.mismatch} (declared=${r.nfrCount.declared}/actual=${r.nfrCount.actual}), helixSetupReviewBundleMissing=${r.helixSetupReviewBundleMissing.length}, helixSetupVersionUpTargetMissing=${r.helixSetupVersionUpTargetMissing.length}`,
      ],
      ok: false,
    };
  } catch {
    return {
      messages: ["doc-consistency — violation: L1/L3/screen docs could not be read"],
      ok: false,
    };
  }
}

/**
 * entity-coverage lint を hard gate 検査 (PLAN-L7-95)。business §10.1 primary entity と
 * L3 派生 entity の重複 0 を fail-close。I/O 失敗も violation。
 */
export function checkEntityCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeEntityCoverage(loadEntityBusiness(repoRoot));
    if (r.duplicates.length === 0) {
      return {
        messages: [
          `entity-coverage — OK (primary/L3-derived entity 整合, total=${r.totalCount}, dup 0)`,
        ],
        ok: true,
      };
    }
    return {
      messages: [
        `entity-coverage — violation: duplicate entity=${r.duplicates.length} (${r.duplicates.join(", ")})`,
      ],
      ok: false,
    };
  } catch {
    return {
      messages: ["entity-coverage — violation: business doc could not be read"],
      ok: false,
    };
  }
}

/**
 * fr-registry-audit lint を hard gate 検査 (PLAN-L7-95、要件 §1.10.G.10 の「漏れ監査自動化」配線)。
 * FR-L1 registry の 5 型漏れ (登録/欠番/属性/件数/画面被覆) を fail-close。I/O 失敗も violation。
 */
export function checkFrRegistryAudit(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeFrRegistry(loadFrRegistryDocs(repoRoot));
    const bad =
      r.unregistered.length +
      r.unexplainedGaps.length +
      r.attributeOrphans.length +
      r.countMismatches.length +
      r.screenCoverageOrphans.length;
    if (bad === 0) {
      return {
        messages: [
          `fr-registry-audit — OK (FR-L1 registry 5 型漏れ 0, registered=${r.totals.registered})`,
        ],
        ok: true,
      };
    }
    return {
      messages: [
        `fr-registry-audit — violation: unregistered=${r.unregistered.length}, gaps=${r.unexplainedGaps.length}, attr=${r.attributeOrphans.length}, count=${r.countMismatches.length}, screen=${r.screenCoverageOrphans.length}`,
      ],
      ok: false,
    };
  } catch {
    return {
      messages: ["fr-registry-audit — violation: L1/L3/screen docs could not be read"],
      ok: false,
    };
  }
}

/**
 * improvement-backlog lint を hard gate 検査 (PLAN-L7-95、要件 §1.10.G.12 の「構造健全性検証」配線)。
 * IMP 行の malformed/dup/invalid status・candidate/incomplete/unparseable と
 * lower-layer backprop 分類欠落を fail-close。
 */
export function checkImprovementBacklog(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeImprovementBacklog(loadImprovementBacklog(repoRoot));
    const bad =
      r.malformedIds.length +
      r.duplicateIds.length +
      r.invalidStatus.length +
      r.invalidCandidate.length +
      r.incompleteRows.length +
      r.unparseableRows.length +
      r.missingBackpropClassification.length;
    if (bad === 0) {
      return {
        messages: [
          `improvement-backlog — OK (backlog 書式健全, entries=${r.total}, open=${r.openCount}, 死蔵行 0, backprop分類欠落 0)`,
        ],
        ok: true,
      };
    }
    return {
      messages: [
        `improvement-backlog — violation: malformed=${r.malformedIds.length}, dup=${r.duplicateIds.length}, invalidStatus=${r.invalidStatus.length}, invalidCandidate=${r.invalidCandidate.length}, incomplete=${r.incompleteRows.length}, unparseable=${r.unparseableRows.length}, missingBackpropClassification=${r.missingBackpropClassification.length}`,
      ],
      ok: false,
    };
  } catch {
    return {
      messages: ["improvement-backlog — violation: docs/improvement-backlog.md could not be read"],
      ok: false,
    };
  }
}

/**
 * lint-wiring meta-gate を hard gate 検査 (PLAN-L7-95、IMP-006)。
 * すべての src/lint module が runtime 経路から到達可能 or DEFERRED 登録済みを fail-close。
 */
export function checkRightArmGatePlanning(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeRightArmGatePlanning(loadRightArmGatePlanningInput(repoRoot));
    return { messages: rightArmGatePlanningMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["right-arm-gate-planning - violation: G8-G14 carry docs could not be read"],
      ok: false,
    };
  }
}

export function checkRightArmVerificationStrategy(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeRightArmVerificationStrategy(loadRightArmVerificationStrategyInput(repoRoot));
    return { messages: rightArmVerificationStrategyMessages(r), ok: r.ok };
  } catch {
    return {
      messages: [
        "right-arm-verification-strategy - violation: right-arm verification docs could not be read",
      ],
      ok: false,
    };
  }
}

export function checkL14CloseAudit(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeL14CloseAudit(loadL14CloseAuditInput(repoRoot));
    return { messages: l14CloseAuditMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["l14-close-audit - violation: L14 close audit matrix could not be read"],
      ok: false,
    };
  }
}

export function checkLintWiring(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeLintWiring(loadLintWiringInput(repoRoot));
    return { messages: lintWiringMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["lint-wiring — violation: src/lint modules could not be scanned"],
      ok: false,
    };
  }
}

/** PLAN-L6-72: repo-owned closure authority registryのschema/source drift hard gate。 */
export function checkClosureAuthorityRegistry(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const result = analyzeClosureAuthorityRegistry(loadClosureAuthorityRegistryLintInput(repoRoot));
    return { messages: closureAuthorityRegistryMessages(result), ok: result.ok };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown registry error";
    return {
      messages: [`closure-authority-registry - violation: strict registry load failed: ${detail}`],
      ok: false,
    };
  }
}

export function checkToolchainPin(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeToolchainPin(loadToolchainPinInput(repoRoot));
    return { messages: toolchainPinMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["toolchain-pin - violation: package/toolchain files could not be scanned"],
      ok: false,
    };
  }
}

export function checkRepositoryNamePaths(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeRepositoryNamePaths(loadRepositoryNamePathsInput(repoRoot));
    return { messages: repositoryNamePathsMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["repository-name-paths - violation: repository paths could not be scanned"],
      ok: false,
    };
  }
}

/**
 * forward-convergence (fail-close, PLAN-DISCOVERY-08 Step5): spine-外 kind=impl の NEW 未集約 landed を
 * gate する。legacy debt allowlist は grandfather (ok を落とさず surface)。例外時は fail-close。
 */
export function checkForwardConvergence(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const docs = loadConvergenceDocs(repoRoot);
    const r = analyzeForwardConvergence(docs.plans, docs.roadmapSpanIds, docs.reverseReferencedIds);
    return { messages: forwardConvergenceMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["forward-convergence — violation: PLAN を読めず spine-外集約を検査できない"],
      ok: false,
    };
  }
}

export function checkVersionUpReadiness(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const input = loadVersionUpReadinessInput(repoRoot);
    const r = analyzeVersionUpReadiness(input);
    const commandViolations = buildVersionUpActivationPackets(input).flatMap((packet) =>
      versionUpActivationVerificationCommandViolations(packet),
    );
    return {
      messages: [
        ...versionUpReadinessMessages(r),
        ...commandViolations.map(
          (violation) =>
            `version-up-readiness - violation: ${violation.subject}: ${violation.reason}`,
        ),
      ],
      ok: r.ok && commandViolations.length === 0,
    };
  } catch {
    return {
      messages: ["version-up-readiness - violation: version-up docs could not be read"],
      ok: false,
    };
  }
}

export function checkActionBindingApprovalReadiness(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeActionBindingApprovalReadiness(
      loadActionBindingApprovalReadinessInput(repoRoot),
    );
    return { messages: actionBindingApprovalReadinessMessages(r), ok: r.ok };
  } catch {
    return {
      messages: [
        "action-binding-approval-readiness - violation: action-binding approval docs could not be read",
      ],
      ok: false,
    };
  }
}

export function checkS4DecisionReadiness(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeS4DecisionReadiness(loadS4DecisionReadinessInput(repoRoot));
    return { messages: s4DecisionReadinessMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["s4-decision-readiness - violation: S3/S4 decision docs could not be read"],
      ok: false,
    };
  }
}

export function checkCutoverReadiness(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeCutoverReadiness(loadCutoverReadinessInput(repoRoot));
    const renamePlan = buildIdentifierRenameCutoverPlan(repoRoot);
    const templateViolations = recordTemplateContractViolations({
      subject: "helix rename plan",
      requiredRecords: requiredRecordsForBlockers([
        "irreversible_migration_pending",
        "human_approval_pending",
      ]),
      recordTemplates: renamePlan.recordTemplates,
    });
    const runbookCommandViolations = identifierRenameRunbookCommandViolations(renamePlan);
    const stateBackupManifestViolations = identifierRenameStateBackupManifestViolations(renamePlan);
    const verificationCommandViolations = identifierRenameVerificationCommandViolations(renamePlan);
    return {
      messages: [
        ...cutoverReadinessMessages(r),
        ...templateViolations.map(
          (violation) => `cutover-readiness - violation: ${violation.reason}`,
        ),
        ...runbookCommandViolations.map(
          (violation) => `cutover-readiness - violation: ${violation.subject}: ${violation.reason}`,
        ),
        ...stateBackupManifestViolations.map(
          (violation) => `cutover-readiness - violation: ${violation.subject}: ${violation.reason}`,
        ),
        ...verificationCommandViolations.map(
          (violation) => `cutover-readiness - violation: ${violation.subject}: ${violation.reason}`,
        ),
      ],
      ok:
        r.ok &&
        templateViolations.length === 0 &&
        runbookCommandViolations.length === 0 &&
        stateBackupManifestViolations.length === 0 &&
        verificationCommandViolations.length === 0,
    };
  } catch {
    return {
      messages: ["cutover-readiness - violation: irreversible cutover docs could not be read"],
      ok: false,
    };
  }
}

type CompletionDedicatedPacketBridgeDeps = {
  s4Packets?: ReturnType<typeof buildS4DecisionPackets>;
  versionPackets?: ReturnType<typeof buildVersionUpActivationPackets>;
  renamePlan?: ReturnType<typeof buildIdentifierRenameCutoverPlan>;
  approvalPackets?: ReturnType<typeof buildActionBindingApprovalPackets>;
};

export function checkCompletionDecisionPacket(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["completion-decision-packet - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const now = new Date().toISOString();
    const packet = loadCompletionDecisionPacketInput(repoRoot, now);
    const r = analyzeCompletionDecisionPacket(packet, now, {
      sourcePathExists: (sourcePath) => existsSync(join(repoRoot, sourcePath)),
      sourceText: (sourcePath) => {
        const path = join(repoRoot, sourcePath);
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      },
    });
    const dedicatedViolations = completionDedicatedPacketBridgeViolations(repoRoot, packet);
    return {
      messages: [
        ...completionDecisionPacketMessages(r),
        ...dedicatedViolations.map(
          (violation) => `completion-decision-packet - violation: ${violation}`,
        ),
      ],
      ok: r.ok && dedicatedViolations.length === 0,
    };
  } catch {
    return {
      messages: ["completion-decision-packet - violation: decision packet check could not run"],
      ok: false,
    };
  }
}

export function checkCompletionReviewBundle(repoRoot: string): {
  messages: string[];
  ok: boolean;
};
export function checkCompletionReviewBundle(
  repoRoot: string,
  bridgeDeps: CompletionDedicatedPacketBridgeDeps,
): {
  messages: string[];
  ok: boolean;
};
export function checkCompletionReviewBundle(
  repoRoot: string,
  bridgeDeps: CompletionDedicatedPacketBridgeDeps = {},
): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["completion-review-bundle - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const now = new Date().toISOString();
    const bundle = loadCompletionReviewBundleInput(repoRoot, now);
    const decisionPacket = loadCompletionDecisionPacketInput(repoRoot, bundle.generatedAt);
    const r = analyzeCompletionReviewBundle(bundle, decisionPacket, now);
    const dedicatedViolations = completionDedicatedPacketBridgeViolations(
      repoRoot,
      decisionPacket,
      bridgeDeps,
    );
    return {
      messages: [
        ...completionReviewBundleMessages(r),
        ...dedicatedViolations.map(
          (violation) => `completion-review-bundle - violation: ${violation}`,
        ),
      ],
      ok: r.ok && dedicatedViolations.length === 0,
    };
  } catch {
    return {
      messages: ["completion-review-bundle - violation: review bundle check could not run"],
      ok: false,
    };
  }
}

export function completionDedicatedPacketBridgeViolations(
  repoRoot: string,
  packet: ReturnType<typeof loadCompletionDecisionPacketInput>,
  deps: CompletionDedicatedPacketBridgeDeps = {},
): string[] {
  const violations: string[] = [];
  const decisionPlanIdsByCommand = new Map<string, Set<string>>();
  for (const decision of packet.decisions) {
    for (const command of decision.packetCommands ?? []) {
      if (!decisionPlanIdsByCommand.has(command)) {
        decisionPlanIdsByCommand.set(command, new Set());
      }
      decisionPlanIdsByCommand.get(command)?.add(decision.planId);
    }
  }

  const hasCommand = (command: string): boolean => decisionPlanIdsByCommand.has(command);
  const planIdsFor = (command: string): string[] => [
    ...(decisionPlanIdsByCommand.get(command) ?? new Set<string>()),
  ];

  if (hasCommand(S4_DECISION_PACKET_COMMAND)) {
    const s4Packets =
      deps.s4Packets ?? buildS4DecisionPackets(loadS4DecisionReadinessInput(repoRoot));
    const s4ByPlan = new Map(s4Packets.map((candidate) => [candidate.planId, candidate]));
    for (const planId of planIdsFor(S4_DECISION_PACKET_COMMAND)) {
      const dedicatedPacket = s4ByPlan.get(planId);
      if (!dedicatedPacket) {
        violations.push(`missing live S4 decision packet for ${planId}`);
        continue;
      }
      violations.push(
        ...relatedDecisionPacketScopedCommandViolations(
          `S4 ${planId}`,
          planId,
          dedicatedPacket.relatedDecisionPackets,
        ),
        ...s4DecisionVerificationCommandViolations(dedicatedPacket).map(
          (violation) => `S4 ${violation.subject}: ${violation.reason}`,
        ),
      );
    }
  }

  if (hasCommand(VERSION_UP_ACTIVATION_PACKET_COMMAND)) {
    const versionPackets =
      deps.versionPackets ?? buildVersionUpActivationPackets(loadVersionUpReadinessInput(repoRoot));
    const versionByPlan = new Map(versionPackets.map((candidate) => [candidate.planId, candidate]));
    for (const planId of planIdsFor(VERSION_UP_ACTIVATION_PACKET_COMMAND)) {
      const dedicatedPacket = versionByPlan.get(planId);
      if (!dedicatedPacket) {
        violations.push(`missing live version-up activation packet for ${planId}`);
        continue;
      }
      violations.push(
        ...relatedDecisionPacketScopedCommandViolations(
          `version-up ${planId}`,
          planId,
          dedicatedPacket.relatedDecisionPackets,
        ),
        ...versionUpActivationVerificationCommandViolations(dedicatedPacket).map(
          (violation) => `version-up ${violation.subject}: ${violation.reason}`,
        ),
      );
    }
  }

  if (hasCommand(RENAME_PLAN_PACKET_COMMAND)) {
    const renamePlan = deps.renamePlan ?? buildIdentifierRenameCutoverPlan(repoRoot);
    violations.push(
      ...relatedDecisionPacketScopedCommandViolations(
        "rename PLAN-M-02-helix-identifier-rename",
        "PLAN-M-02-helix-identifier-rename",
        renamePlan.relatedDecisionPackets,
      ),
      ...identifierRenameRunbookCommandViolations(renamePlan).map(
        (violation) => `rename ${violation.subject}: ${violation.reason}`,
      ),
      ...identifierRenameStateBackupManifestViolations(renamePlan).map(
        (violation) => `rename ${violation.subject}: ${violation.reason}`,
      ),
      ...identifierRenameVerificationCommandViolations(renamePlan).map(
        (violation) => `rename ${violation.subject}: ${violation.reason}`,
      ),
    );
  }

  if (hasCommand(ACTION_BINDING_APPROVAL_PACKET_COMMAND)) {
    const approvalPackets =
      deps.approvalPackets ??
      buildActionBindingApprovalPackets(loadActionBindingApprovalReadinessInput(repoRoot));
    const approvalByPlan = new Map(
      approvalPackets.map((candidate) => [candidate.planId, candidate]),
    );
    for (const planId of planIdsFor(ACTION_BINDING_APPROVAL_PACKET_COMMAND)) {
      const dedicatedPacket = approvalByPlan.get(planId);
      if (!dedicatedPacket) {
        violations.push(`missing live action-binding approval packet for ${planId}`);
        continue;
      }
      violations.push(
        ...relatedDecisionPacketScopedCommandViolations(
          `action-binding ${planId}`,
          planId,
          dedicatedPacket.relatedDecisionPackets,
        ),
        ...actionBindingApprovalVerificationCommandViolations(dedicatedPacket).map(
          (violation) => `action-binding ${violation.subject}: ${violation.reason}`,
        ),
      );
    }
  }

  return violations;
}

function relatedDecisionPacketScopedCommandViolations(
  subject: string,
  planId: string,
  relatedDecisionPackets: Array<{
    command: string;
    role: string;
    scopedCommand?: string;
  }>,
): string[] {
  return relatedDecisionPackets.flatMap((packet) => {
    const expectedScopedCommand = scopedRelatedDecisionPacketCommand(planId, packet.command);
    if (!packet.scopedCommand) {
      return [
        `${subject} relatedDecisionPackets ${packet.role} ${packet.command} missing scopedCommand`,
      ];
    }
    if (packet.scopedCommand !== expectedScopedCommand) {
      return [
        `${subject} relatedDecisionPackets ${packet.role} ${packet.command} scopedCommand mismatch expected=${expectedScopedCommand} actual=${packet.scopedCommand}`,
      ];
    }
    return [];
  });
}

function scopedRelatedDecisionPacketCommand(planId: string, command: string): string {
  switch (command) {
    case S4_DECISION_PACKET_COMMAND:
    case VERSION_UP_ACTIVATION_PACKET_COMMAND:
    case ACTION_BINDING_APPROVAL_PACKET_COMMAND:
      return `${command} --plan ${planId}`;
    default:
      return command;
  }
}

export function checkObjectiveEvidenceAudit(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeObjectiveEvidenceAudit(loadObjectiveEvidenceAuditInput(repoRoot));
    return { messages: objectiveEvidenceAuditMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["objective-evidence-audit - violation: objective audit docs could not be read"],
      ok: false,
    };
  }
}

export function checkSemanticFrontierConsistency(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = analyzeSemanticFrontierConsistency(loadSemanticFrontierConsistencyInput(repoRoot));
    return { messages: semanticFrontierConsistencyMessages(r), ok: r.ok };
  } catch {
    return {
      messages: [
        "semantic-frontier-consistency - violation: semantic frontier docs or outstanding state could not be read",
      ],
      ok: false,
    };
  }
}

/** legacy debt allowlist ↔ audit doc の双方向一致 hard check (Codex Critical B)。 */
export function checkForwardConvergenceAudit(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  try {
    const r = loadLegacyAuditDrift(repoRoot);
    return { messages: legacyAuditDriftMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["forward-convergence-audit — violation: legacy debt audit を検査できない"],
      ok: false,
    };
  }
}

export function checkFrontendDesignCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["frontend-design-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeFrontendDesignCoverage(loadFrontendDesignCoverageInput(repoRoot));
    return { messages: frontendDesignCoverageMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["frontend-design-coverage - violation: FE design coverage check could not run"],
      ok: false,
    };
  }
}

export function checkProposalDocumentCoverage(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["proposal-document-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeProposalDocumentCoverage(
      loadProposalDocumentCoverageLintInput(repoRoot, classifyProposalDocumentCoverage),
    );
    return { messages: proposalDocumentCoverageMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["proposal-document-coverage - violation: document coverage routing could not run"],
      ok: false,
    };
  }
}

// CLI entrypoint は process.cwd() = repoRoot を想定 (deps 未指定時)。test は deps 注入で固定。
export function checkG8IntegrationWorkflow(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!canLoadG8IntegrationWorkflowInput(repoRoot)) {
    return {
      messages: [
        "g8-integration-workflow - violation: L8 test design or gates.md could not be read",
      ],
      ok: false,
    };
  }
  try {
    const r = analyzeG8IntegrationWorkflow(loadG8IntegrationWorkflowInput(repoRoot));
    return { messages: g8IntegrationWorkflowMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["g8-integration-workflow - violation: G8 workflow check could not run"],
      ok: false,
    };
  }
}

export function checkG9SystemWorkflow(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!canLoadG9SystemWorkflowInput(repoRoot)) {
    return {
      messages: [
        "g9-system-workflow - violation: L9 test design, L9 boundary, or gates.md could not be read",
      ],
      ok: false,
    };
  }
  try {
    const r = analyzeG9SystemWorkflow(loadG9SystemWorkflowInput(repoRoot));
    return { messages: g9SystemWorkflowMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["g9-system-workflow - violation: G9 workflow check could not run"],
      ok: false,
    };
  }
}

export function checkG10UxWorkflow(repoRoot: string): {
  messages: string[];
  ok: boolean;
} {
  if (!canLoadG10UxWorkflowInput(repoRoot)) {
    return {
      messages: ["g10-ux-workflow - violation: L10 visual design or gates.md could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeG10UxWorkflow(loadG10UxWorkflowInput(repoRoot));
    return { messages: g10UxWorkflowMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["g10-ux-workflow - violation: G10 workflow check could not run"],
      ok: false,
    };
  }
}

function runFullDoctor(deps: DoctorDeps = nodeDoctorDeps(process.cwd())): LintResult {
  const d = detectMode();
  // handover / agent-slots are warning surfaces. Verification profile is a hard gate.
  const backfill = checkBackfillResult(deps.repoRoot);
  const scrumRev = checkScrumReverse(deps.repoRoot);
  const planSupersession = checkPlanSupersession(deps.repoRoot);
  const planBodySubstance = checkPlanBodySubstance(deps.repoRoot);
  const planCompletionDrift = checkPlanCompletionDrift(deps.repoRoot);
  const propagation = checkPropagation(deps.repoRoot);
  const reviewEvidence = checkReviewEvidence(deps.repoRoot);
  const pairFreeze = checkPairFreeze(deps.repoRoot);
  const moduleDrift = checkModuleDrift(deps.repoRoot);
  const mergedPlanStatus = checkMergedPlanStatus(deps.repoRoot);
  const planArtifactExistence = checkPlanArtifactExistence(deps.repoRoot);
  const assetDrift = checkAssetDrift(deps.repoRoot);
  const allowlistSync = checkAllowlistSync(deps.repoRoot);
  const judgmentCoreCoverage = checkJudgmentCoreCoverage(deps.repoRoot);
  const skillAssignment = checkSkillAssignment(deps.repoRoot);
  const skillQuality = checkSkillQuality(deps.repoRoot);
  const descentObligation = checkDescentObligation(deps.repoRoot);
  const changeImpact = checkChangeImpact(deps.repoRoot);
  const changeSetIntegrity = checkChangeSetIntegrity(deps.repoRoot);
  const verificationProfile = checkVerificationProfile(deps.repoRoot);
  const branchKind = checkBranchKind(deps.repoRoot);
  const codingRules = checkCodingRules(deps.repoRoot);
  const designCoverage = checkDesignCoverage(deps.repoRoot);
  const leftArmCarryLog = checkLeftArmCarryLog(deps.repoRoot);
  const triageDecisionIntegrity = checkTriageDecisionIntegrity(deps.repoRoot);
  const dddTddRules = checkDddTddRules(deps.repoRoot);
  const designLanguage = checkDesignLanguage(deps.repoRoot);
  const handoverRetirementInventory = checkHandoverRetirementInventory(deps.repoRoot);
  const handoverResurrection = checkHandoverResurrection(deps.repoRoot);
  const secretScan = checkSecretScan(deps.repoRoot);
  const digestInventory = checkDigestInventory(deps.repoRoot);
  const runtimePortability = checkRuntimePortability(deps.repoRoot);
  const ruleDrift = checkRuleDrift(deps.repoRoot);
  const gateConfirm = checkGateConfirm(deps.repoRoot);
  const planSchedule = checkPlanSchedule(deps.repoRoot);
  const planDescent = checkPlanDescent(deps.repoRoot);
  const planSpecificVpairBinding = checkPlanSpecificVpairBindings(deps.repoRoot);
  const planEntryRouting = checkPlanEntryRouting(deps.repoRoot);
  const planGovernance = checkPlanGovernance(deps.repoRoot);
  const planDod = checkPlanDod(deps.repoRoot);
  const placeholderDeps = checkPlaceholderDeps(deps.repoRoot);
  const g1Trace = checkPlanTraceGate(deps.repoRoot, "G1-trace");
  const g3Trace = checkPlanTraceGate(deps.repoRoot, "G3-trace");
  const ruleAutomationClosure = checkRuleAutomationClosure(deps.repoRoot);
  const driveModelPassage = checkDriveModelPassage(deps.repoRoot);
  // PLAN-L7-348: 重量 2 gate (drive-db-registration / db-projection-ingestion) は同一入力から
  // 同じ in-memory projection を独立に rebuild していた (各 15-25 秒)。ここで 1 回だけ rebuild
  // して共有する。drive 側は read-only、ingestion 側の telemetry projection 書込みは drive 読取り
  // 後に走るため、検査結果は単体実行と同一。build 失敗時は undefined のまま各 check の自前
  // rebuild 経路へ fallback する (fail 挙動不変)。
  let sharedProjectionDb: HarnessDb | undefined;
  try {
    sharedProjectionDb = openHarnessDb(":memory:", { repoRoot: deps.repoRoot });
    rebuildHarnessDb({ repoRoot: deps.repoRoot, db: sharedProjectionDb });
  } catch {
    try {
      sharedProjectionDb?.close();
    } catch {
      // fail-open: 共有 projection の close 失敗は無視し、各 check の自前 rebuild 経路へ委ねる
    }
    sharedProjectionDb = undefined;
  }
  const driveDbRegistration = checkDriveDbRegistration(deps.repoRoot, sharedProjectionDb);
  const frRoadmapCoverage = checkFrRoadmapCoverage(deps.repoRoot);
  const telemetryClosure = checkTelemetryClosure(deps.repoRoot);
  const cycleP4Verification = checkCycleP4Verification(deps.repoRoot);
  const projectHooks = checkProjectHooks(deps.repoRoot);
  const codexHookAdapter = checkCodexHookAdapter(deps.repoRoot);
  const codexHookTrust = checkCodexHookTrust(deps.repoRoot);
  const memoryCommitHygiene = checkMemoryCommitHygiene(deps.repoRoot);
  const toolContractRegistry = checkToolContractRegistry(deps.repoRoot);
  const codexWrapperParity = checkCodexWrapperParity(deps);
  const l6FrCoverage = checkL6FrCoverage(deps.repoRoot);
  const readability = checkReadability(deps.repoRoot);
  const runtimeReadability = checkRuntimeReadability(deps.repoRoot);
  const feedbackLog = checkFeedbackLog(deps.repoRoot);
  const l6Completion = checkL6Completion(deps.repoRoot);
  const l7Completion = checkL7Completion(deps.repoRoot);
  const roadmap = checkRoadmap(deps.repoRoot);
  const implPlanTrace = checkImplPlanTrace(deps.repoRoot);
  const oracleTestTrace = checkOracleTestTrace(deps.repoRoot);
  const trackedCanonical = checkTrackedCanonical(deps.repoRoot);
  const subDocCatalogDrift = checkSubDocCatalogDrift(deps.repoRoot);
  const subDocSectionStructure = checkSubDocSectionStructure(deps.repoRoot);
  const screenImplPairFreeze = checkScreenImplPairFreeze(deps.repoRoot);
  const l1L2Consistency = checkL1L2Consistency(deps.repoRoot);
  const requirementsBindingConfig = checkRequirementsBindingConfig(deps.repoRoot);
  const refactorCandidateTriage = checkRefactorCandidateTriage(deps.repoRoot);
  const verificationGroups = checkVerificationGroupsResult(deps.repoRoot);
  const dependencyDrift = checkDependencyDrift(deps.repoRoot);
  const regressionExpansion = checkRegressionExpansion(deps.repoRoot, dependencyDrift.result);
  const guardrailInvariants = checkGuardrailInvariants(deps.repoRoot);
  const dbProjectionCoverage = checkDbProjectionCoverage(deps.repoRoot);
  const dbProjectionIngestion = checkDbProjectionIngestion(deps.repoRoot, sharedProjectionDb);
  const projectCurrentLocation = checkProjectCurrentLocation(deps.repoRoot, sharedProjectionDb);
  const visualizationViewModelBoundary = checkVisualizationViewModelBoundary(
    deps.repoRoot,
    sharedProjectionDb,
  );
  const visualizationTreeViewBoundary = checkVisualizationTreeViewBoundary(
    deps.repoRoot,
    sharedProjectionDb,
  );
  const visualizationTreeViewSummarySurface = checkVisualizationTreeViewSummarySurface(
    deps.repoRoot,
  );
  const vscodeExtensionDynamicBinding = checkVscodeExtensionDynamicBinding(
    deps.repoRoot,
    sharedProjectionDb,
  );
  const l12CompatibilityBinding = checkL12CompatibilityBinding(deps.repoRoot, sharedProjectionDb);
  const roadmapCurrentBinding = checkRoadmapCurrentBinding(deps.repoRoot, sharedProjectionDb);
  const driveModelBinding = checkDriveModelBinding(deps.repoRoot, sharedProjectionDb);
  const projectSkillBinding = checkProjectSkillBinding(deps.repoRoot, sharedProjectionDb);
  const recoveryRunwayBinding = checkRecoveryRunwayBinding(deps.repoRoot, sharedProjectionDb);
  const recoveryHandoffBinding = checkRecoveryHandoffBinding(deps.repoRoot, sharedProjectionDb);
  const recoveryExitBinding = checkRecoveryExitBinding(deps.repoRoot, sharedProjectionDb);
  const approvalReviewBinding = checkApprovalReviewBinding(deps.repoRoot, sharedProjectionDb);
  const closureApplyBinding = checkClosureApplyBinding(deps.repoRoot, sharedProjectionDb);
  const operationScopeBinding = checkOperationScopeBinding(deps.repoRoot, sharedProjectionDb);
  const zipAdoptionBinding = checkZipAdoptionBinding(deps.repoRoot, sharedProjectionDb);
  const zipSourceBinding = checkZipSourceBinding(deps.repoRoot, sharedProjectionDb);
  const zipReferenceRuntimeBoundary = checkZipReferenceRuntimeBoundary(deps.repoRoot);
  const functionDesignAbsorptionBinding = checkFunctionDesignAbsorptionBinding(
    deps.repoRoot,
    sharedProjectionDb,
  );
  const vmodelZipManifest = checkVmodelZipManifest(deps.repoRoot);
  const vmodelFit = checkVmodelFit(deps.repoRoot, sharedProjectionDb);
  try {
    sharedProjectionDb?.close();
  } catch {
    // fail-open: in-memory 共有 projection の close 失敗は検査結果へ影響しないため無視する
  }
  const verifierProviderMismatch = checkVerifierProviderMismatch(deps.repoRoot);
  const teamReviewReceipts = checkTeamReviewReceipts(deps.repoRoot);
  const agentModelSsot = checkAgentModelSsot(deps.repoRoot);
  const docConsistency = checkDocConsistency(deps.repoRoot);
  const entityCoverage = checkEntityCoverage(deps.repoRoot);
  const frRegistryAudit = checkFrRegistryAudit(deps.repoRoot);
  const improvementBacklog = checkImprovementBacklog(deps.repoRoot);
  const rightArmGatePlanning = checkRightArmGatePlanning(deps.repoRoot);
  const rightArmVerificationStrategy = checkRightArmVerificationStrategy(deps.repoRoot);
  const g8IntegrationWorkflow = checkG8IntegrationWorkflow(deps.repoRoot);
  const g9SystemWorkflow = checkG9SystemWorkflow(deps.repoRoot);
  const g10UxWorkflow = checkG10UxWorkflow(deps.repoRoot);
  const l14CloseAudit = checkL14CloseAudit(deps.repoRoot);
  const closureAuthorityRegistry = checkClosureAuthorityRegistry(deps.repoRoot);
  const lintWiring = checkLintWiring(deps.repoRoot);
  const toolchainPin = checkToolchainPin(deps.repoRoot);
  const repositoryNamePaths = checkRepositoryNamePaths(deps.repoRoot);
  const proposalDocumentCoverage = checkProposalDocumentCoverage(deps.repoRoot);
  const frontendDesignCoverage = checkFrontendDesignCoverage(deps.repoRoot);
  // fail-close: green_command digest が evidence_path 実 hash と一致するか (fake substance 防止、PLAN-L7-132)。
  const greenCommandDigest = checkGreenCommandDigests(deps.repoRoot);
  // fail-close: spine-外 kind=impl の NEW 未集約 landed を gate (PLAN-DISCOVERY-08 Step5)。legacy は grandfather。
  const forwardConvergence = checkForwardConvergence(deps.repoRoot);
  const versionUpReadiness = checkVersionUpReadiness(deps.repoRoot);
  const actionBindingApprovalReadiness = checkActionBindingApprovalReadiness(deps.repoRoot);
  const s4DecisionReadiness = checkS4DecisionReadiness(deps.repoRoot);
  const cutoverReadiness = checkCutoverReadiness(deps.repoRoot);
  const completionDecisionPacket = checkCompletionDecisionPacket(deps.repoRoot);
  const completionReviewBundle = checkCompletionReviewBundle(deps.repoRoot);
  const objectiveEvidenceAudit = checkObjectiveEvidenceAudit(deps.repoRoot);
  const semanticFrontierConsistency = checkSemanticFrontierConsistency(deps.repoRoot);
  const forwardConvergenceAudit = checkForwardConvergenceAudit(deps.repoRoot);
  return {
    ok:
      backfill.ok &&
      scrumRev.ok &&
      planSupersession.ok &&
      planBodySubstance.ok &&
      planCompletionDrift.ok &&
      propagation.ok &&
      reviewEvidence.ok &&
      guardrailInvariants.ok &&
      pairFreeze.ok &&
      moduleDrift.ok &&
      mergedPlanStatus.ok &&
      planArtifactExistence.ok &&
      assetDrift.ok &&
      allowlistSync.ok &&
      judgmentCoreCoverage.ok &&
      skillAssignment.ok &&
      skillQuality.ok &&
      descentObligation.ok &&
      changeImpact.ok &&
      changeSetIntegrity.ok &&
      verificationProfile.ok &&
      branchKind.ok &&
      codingRules.ok &&
      designCoverage.ok &&
      leftArmCarryLog.ok &&
      triageDecisionIntegrity.ok &&
      dddTddRules.ok &&
      designLanguage.ok &&
      handoverRetirementInventory.ok &&
      handoverResurrection.ok &&
      secretScan.ok &&
      digestInventory.ok &&
      runtimePortability.ok &&
      ruleDrift.ok &&
      gateConfirm.ok &&
      planSchedule.ok &&
      planDescent.ok &&
      planSpecificVpairBinding.ok &&
      planEntryRouting.ok &&
      planGovernance.ok &&
      planDod.ok &&
      placeholderDeps.ok &&
      g1Trace.ok &&
      g3Trace.ok &&
      ruleAutomationClosure.ok &&
      driveModelPassage.ok &&
      driveDbRegistration.ok &&
      frRoadmapCoverage.ok &&
      telemetryClosure.ok &&
      cycleP4Verification.ok &&
      l6FrCoverage.ok &&
      readability.ok &&
      runtimeReadability.ok &&
      feedbackLog.ok &&
      projectHooks.ok &&
      codexHookAdapter.ok &&
      codexHookTrust.ok &&
      toolContractRegistry.ok &&
      codexWrapperParity.ok &&
      l6Completion.ok &&
      l7Completion.ok &&
      verificationGroups.ok &&
      roadmap.ok &&
      implPlanTrace.ok &&
      oracleTestTrace.ok &&
      trackedCanonical.ok &&
      subDocCatalogDrift.ok &&
      subDocSectionStructure.ok &&
      screenImplPairFreeze.ok &&
      l1L2Consistency.ok &&
      requirementsBindingConfig.ok &&
      dependencyDrift.ok &&
      regressionExpansion.ok &&
      dbProjectionCoverage.ok &&
      dbProjectionIngestion.ok &&
      projectCurrentLocation.ok &&
      visualizationViewModelBoundary.ok &&
      visualizationTreeViewBoundary.ok &&
      visualizationTreeViewSummarySurface.ok &&
      vscodeExtensionDynamicBinding.ok &&
      l12CompatibilityBinding.ok &&
      roadmapCurrentBinding.ok &&
      driveModelBinding.ok &&
      projectSkillBinding.ok &&
      recoveryRunwayBinding.ok &&
      recoveryHandoffBinding.ok &&
      recoveryExitBinding.ok &&
      approvalReviewBinding.ok &&
      closureApplyBinding.ok &&
      operationScopeBinding.ok &&
      zipAdoptionBinding.ok &&
      zipSourceBinding.ok &&
      zipReferenceRuntimeBoundary.ok &&
      functionDesignAbsorptionBinding.ok &&
      vmodelZipManifest.ok &&
      vmodelFit.ok &&
      verifierProviderMismatch.ok &&
      teamReviewReceipts.ok &&
      agentModelSsot.ok &&
      docConsistency.ok &&
      entityCoverage.ok &&
      frRegistryAudit.ok &&
      improvementBacklog.ok &&
      rightArmGatePlanning.ok &&
      rightArmVerificationStrategy.ok &&
      g8IntegrationWorkflow.ok &&
      g9SystemWorkflow.ok &&
      g10UxWorkflow.ok &&
      l14CloseAudit.ok &&
      closureAuthorityRegistry.ok &&
      lintWiring.ok &&
      toolchainPin.ok &&
      repositoryNamePaths.ok &&
      proposalDocumentCoverage.ok &&
      frontendDesignCoverage.ok &&
      greenCommandDigest.ok &&
      forwardConvergence.ok &&
      versionUpReadiness.ok &&
      actionBindingApprovalReadiness.ok &&
      s4DecisionReadiness.ok &&
      cutoverReadiness.ok &&
      completionDecisionPacket.ok &&
      completionReviewBundle.ok &&
      objectiveEvidenceAudit.ok &&
      semanticFrontierConsistency.ok &&
      forwardConvergenceAudit.ok,
    messages: [
      `doctor: mode=${d.mode} (claude=${d.claude}, codex=${d.codex})`,
      checkAgentSlots(doctorSlotsDeps(deps)),
      ...backfill.messages.map((m) => `doctor: ${m}`),
      ...scrumRev.messages.map((m) => `doctor: ${m}`),
      ...planSupersession.messages.map((m) => `doctor: ${m}`),
      ...planBodySubstance.messages.map((m) => `doctor: ${m}`),
      ...planCompletionDrift.messages.map((m) => `doctor: ${m}`),
      ...propagation.messages.map((m) => `doctor: ${m}`),
      ...pairFreeze.messages.map((m) => `doctor: ${m}`),
      ...moduleDrift.messages.map((m) => `doctor: ${m}`),
      ...mergedPlanStatus.messages.map((m) => `doctor: ${m}`),
      ...planArtifactExistence.messages.map((m) => `doctor: ${m}`),
      ...assetDrift.messages.map((m) => `doctor: ${m}`),
      ...allowlistSync.messages.map((m) => `doctor: ${m}`),
      ...judgmentCoreCoverage.messages.map((m) => `doctor: ${m}`),
      ...skillAssignment.messages.map((m) => `doctor: ${m}`),
      ...skillQuality.messages.map((m) => `doctor: ${m}`),
      ...descentObligation.messages.map((m) => `doctor: ${m}`),
      ...changeImpact.messages.map((m) => `doctor: ${m}`),
      ...changeSetIntegrity.messages.map((m) => `doctor: ${m}`),
      ...verificationProfile.messages.map((m) => `doctor: ${m}`),
      ...branchKind.messages.map((m) => `doctor: ${m}`),
      ...codingRules.messages.map((m) => `doctor: ${m}`),
      ...designCoverage.messages.map((m) => `doctor: ${m}`),
      ...leftArmCarryLog.messages.map((m) => `doctor: ${m}`),
      ...triageDecisionIntegrity.messages.map((m) => `doctor: ${m}`),
      ...dddTddRules.messages.map((m) => `doctor: ${m}`),
      ...designLanguage.messages.map((m) => `doctor: ${m}`),
      ...handoverRetirementInventory.messages.map((m) => `doctor: ${m}`),
      ...handoverResurrection.messages.map((m) => `doctor: ${m}`),
      ...secretScan.messages.map((m) => `doctor: ${m}`),
      ...digestInventory.messages.map((m) => `doctor: ${m}`),
      ...runtimePortability.messages.map((m) => `doctor: ${m}`),
      ...ruleDrift.messages.map((m) => `doctor: ${m}`),
      ...gateConfirm.messages.map((m) => `doctor: ${m}`),
      ...planSchedule.messages.map((m) => `doctor: ${m}`),
      ...planDescent.messages.map((m) => `doctor: ${m}`),
      ...planSpecificVpairBinding.messages.map((m) => `doctor: ${m}`),
      ...planEntryRouting.messages.map((m) => `doctor: ${m}`),
      ...planGovernance.messages.map((m) => `doctor: ${m}`),
      ...planDod.messages.map((m) => `doctor: ${m}`),
      ...placeholderDeps.messages.map((m) => `doctor: ${m}`),
      ...g1Trace.messages.map((m) => `doctor: ${m}`),
      ...g3Trace.messages.map((m) => `doctor: ${m}`),
      ...ruleAutomationClosure.messages.map((m) => `doctor: ${m}`),
      ...driveModelPassage.messages.map((m) => `doctor: ${m}`),
      ...driveDbRegistration.messages.map((m) => `doctor: ${m}`),
      ...frRoadmapCoverage.messages.map((m) => `doctor: ${m}`),
      ...telemetryClosure.messages.map((m) => `doctor: ${m}`),
      ...cycleP4Verification.messages.map((m) => `doctor: ${m}`),
      ...projectHooks.messages.map((m) => `doctor: ${m}`),
      ...codexHookAdapter.messages.map((m) => `doctor: ${m}`),
      ...codexHookTrust.messages.map((m) => `doctor: ${m}`),
      ...memoryCommitHygiene.messages.map((m) => `doctor: ${m}`),
      ...toolContractRegistry.messages.map((m) => `doctor: ${m}`),
      ...codexWrapperParity.messages.map((m) => `doctor: ${m}`),
      ...l6FrCoverage.messages.map((m) => `doctor: ${m}`),
      ...readability.messages.map((m) => `doctor: ${m}`),
      ...runtimeReadability.messages.map((m) => `doctor: ${m}`),
      ...feedbackLog.messages.map((m) => `doctor: ${m}`),
      ...l6Completion.messages.map((m) => `doctor: ${m}`),
      ...l7Completion.messages.map((m) => `doctor: ${m}`),
      ...reviewEvidence.messages.map((m) => `doctor: ${m}`),
      ...guardrailInvariants.messages.map((m) => `doctor: ${m}`),
      ...verificationGroups.messages.map((m) => `doctor: ${m}`),
      ...roadmap.messages.map((m) => `doctor: ${m}`),
      ...implPlanTrace.messages.map((m) => `doctor: ${m}`),
      ...oracleTestTrace.messages.map((m) => `doctor: ${m}`),
      ...trackedCanonical.messages.map((m) => `doctor: ${m}`),
      ...subDocCatalogDrift.messages.map((m) => `doctor: ${m}`),
      ...subDocSectionStructure.messages.map((m) => `doctor: ${m}`),
      ...screenImplPairFreeze.messages.map((m) => `doctor: ${m}`),
      ...l1L2Consistency.messages.map((m) => `doctor: ${m}`),
      ...requirementsBindingConfig.messages.map((m) => `doctor: ${m}`),
      ...refactorCandidateTriage.messages.map((m) => `doctor: ${m}`),
      ...dependencyDrift.messages.map((m) => `doctor: ${m}`),
      ...regressionExpansion.messages.map((m) => `doctor: ${m}`),
      ...dbProjectionCoverage.messages.map((m) => `doctor: ${m}`),
      ...dbProjectionIngestion.messages.map((m) => `doctor: ${m}`),
      ...projectCurrentLocation.messages.map((m) => `doctor: ${m}`),
      ...visualizationViewModelBoundary.messages.map((m) => `doctor: ${m}`),
      ...visualizationTreeViewBoundary.messages.map((m) => `doctor: ${m}`),
      ...visualizationTreeViewSummarySurface.messages.map((m) => `doctor: ${m}`),
      ...vscodeExtensionDynamicBinding.messages.map((m) => `doctor: ${m}`),
      ...l12CompatibilityBinding.messages.map((m) => `doctor: ${m}`),
      ...roadmapCurrentBinding.messages.map((m) => `doctor: ${m}`),
      ...driveModelBinding.messages.map((m) => `doctor: ${m}`),
      ...projectSkillBinding.messages.map((m) => `doctor: ${m}`),
      ...recoveryRunwayBinding.messages.map((m) => `doctor: ${m}`),
      ...recoveryHandoffBinding.messages.map((m) => `doctor: ${m}`),
      ...recoveryExitBinding.messages.map((m) => `doctor: ${m}`),
      ...approvalReviewBinding.messages.map((m) => `doctor: ${m}`),
      ...closureApplyBinding.messages.map((m) => `doctor: ${m}`),
      ...operationScopeBinding.messages.map((m) => `doctor: ${m}`),
      ...zipAdoptionBinding.messages.map((m) => `doctor: ${m}`),
      ...zipSourceBinding.messages.map((m) => `doctor: ${m}`),
      ...zipReferenceRuntimeBoundary.messages.map((m) => `doctor: ${m}`),
      ...functionDesignAbsorptionBinding.messages.map((m) => `doctor: ${m}`),
      ...vmodelZipManifest.messages.map((m) => `doctor: ${m}`),
      ...vmodelFit.messages.map((m) => `doctor: ${m}`),
      ...verifierProviderMismatch.messages.map((m) => `doctor: ${m}`),
      ...teamReviewReceipts.messages.map((m) => `doctor: ${m}`),
      ...agentModelSsot.messages.map((m) => `doctor: ${m}`),
      ...docConsistency.messages.map((m) => `doctor: ${m}`),
      ...entityCoverage.messages.map((m) => `doctor: ${m}`),
      ...frRegistryAudit.messages.map((m) => `doctor: ${m}`),
      ...improvementBacklog.messages.map((m) => `doctor: ${m}`),
      ...rightArmGatePlanning.messages.map((m) => `doctor: ${m}`),
      ...rightArmVerificationStrategy.messages.map((m) => `doctor: ${m}`),
      ...g8IntegrationWorkflow.messages.map((m) => `doctor: ${m}`),
      ...g9SystemWorkflow.messages.map((m) => `doctor: ${m}`),
      ...g10UxWorkflow.messages.map((m) => `doctor: ${m}`),
      ...l14CloseAudit.messages.map((m) => `doctor: ${m}`),
      ...closureAuthorityRegistry.messages.map((m) => `doctor: ${m}`),
      ...lintWiring.messages.map((m) => `doctor: ${m}`),
      ...toolchainPin.messages.map((m) => `doctor: ${m}`),
      ...repositoryNamePaths.messages.map((m) => `doctor: ${m}`),
      ...proposalDocumentCoverage.messages.map((m) => `doctor: ${m}`),
      ...frontendDesignCoverage.messages.map((m) => `doctor: ${m}`),
      ...greenCommandDigest.messages.map((m) => `doctor: ${m}`),
      ...forwardConvergence.messages.map((m) => `doctor: ${m}`),
      ...versionUpReadiness.messages.map((m) => `doctor: ${m}`),
      ...actionBindingApprovalReadiness.messages.map((m) => `doctor: ${m}`),
      ...s4DecisionReadiness.messages.map((m) => `doctor: ${m}`),
      ...cutoverReadiness.messages.map((m) => `doctor: ${m}`),
      ...completionDecisionPacket.messages.map((m) => `doctor: ${m}`),
      ...completionReviewBundle.messages.map((m) => `doctor: ${m}`),
      ...objectiveEvidenceAudit.messages.map((m) => `doctor: ${m}`),
      ...semanticFrontierConsistency.messages.map((m) => `doctor: ${m}`),
      ...forwardConvergenceAudit.messages.map((m) => `doctor: ${m}`),
    ],
  };
}

export function runDoctor(
  deps: DoctorDeps = nodeDoctorDeps(process.cwd()),
  options: DoctorOptions = {},
): DoctorResult {
  const run = collectDoctorCheckRun(
    {
      deps,
      fullDoctor: () => runFullDoctor(deps),
      toolchain: () => checkToolchainPin(deps.repoRoot),
      setupSmoke: () => runConsumerDoctor(deps),
    },
    options,
  );
  const messages = run.checks.flatMap(({ result }) =>
    result.messages.map((message) =>
      message.startsWith("doctor:") ? message : `doctor: ${message}`,
    ),
  );
  const result: DoctorResult = {
    ok: run.checks.every(({ result }) => result.ok),
    messages,
  };
  if (options.scope || options.setupSmoke === true) result.scope = run.scope;
  if (options.setupSmoke === true) result.setupSmoke = true;
  if (options.timing === true) result.timings = run.timings;
  return result;
}
