/**
 * 統合検証 doctor (requirements_v1.2 §7 / §7.8.5)。
 * 多数の検出器 (back-fill / review-evidence / asset-drift / cycle-p4-verification / roadmap 等) を集約し、
 * gate 判定群を runDoctor.ok に連動させて fail-close する。handover / agent-slots は warning surface。
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  checkHandoverBypass,
  checkHandoverCompletionDecisionPacket,
  checkHandoverCompletionWording,
  checkHandoverDiscipline,
  checkHandoverNextActionAnchor,
  checkHandoverOutstandingAnchor,
  type HandoverDeps,
  type HandoverPointer,
  handoverStale,
} from "../handover/index";
import {
  actionBindingApprovalReadinessMessages,
  actionBindingApprovalVerificationCommandViolations,
  analyzeActionBindingApprovalReadiness,
  buildActionBindingApprovalPackets,
  loadActionBindingApprovalReadinessInput,
} from "../lint/action-binding-approval-readiness";
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
  analyzeCodexHookAdapter,
  codexHookAdapterMessages,
  loadCodexHookAdapterInput,
} from "../lint/codex-hook-adapter";
import {
  analyzeCodingRules,
  codingRulesMessages,
  loadCodingRuleDocs,
  loadCodingRulePolicy,
  loadCodingWorkflowDocs,
} from "../lint/coding-rules";
import {
  analyzeCompletionDecisionPacket,
  completionDecisionPacketMessages,
  loadCompletionDecisionPacketInput,
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
  analyzeDesignLanguage,
  designLanguageMessages,
  loadDesignLanguageDocs,
} from "../lint/design-language";
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
import { analyzeGateConfirm, gateConfirmMessages, loadGateConfirmDocs } from "../lint/gate-confirm";
import { checkGreenCommandDigests } from "../lint/green-command-digest";
import {
  buildIdentifierRenameCutoverPlan,
  identifierRenameRunbookCommandViolations,
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
import { analyzePlanDod, loadPlanDodDocs, planDodMessages } from "../lint/plan-dod";
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
import { analyzeScrumReverse, loadSrPlans, scrumReverseMessages } from "../lint/scrum-reverse";
import {
  analyzeSemanticFrontierConsistency,
  loadSemanticFrontierConsistencyInput,
  semanticFrontierConsistencyMessages,
} from "../lint/semantic-frontier-consistency";
import { fmValue } from "../lint/shared";
import {
  analyzeSkillAssignments,
  loadSkillAssignmentDocs,
  skillAssignmentMessages,
} from "../lint/skill-assignment";
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
  analyzeTrackedCanonical,
  loadTrackedCanonicalInput,
  trackedCanonicalMessages,
} from "../lint/tracked-canonical";
import {
  analyzeVerificationProfileGate,
  loadVerificationRecommendation,
  verificationProfileGateMessages,
} from "../lint/verification-profile";
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
import { teamDefinitionSchema } from "../schema/team";
import {
  CONSUMER_CLAUDE_AGENT_NAMES,
  CONSUMER_CLAUDE_COMMAND_NAMES,
  CONSUMER_TEAM_DEFINITION_PATH,
} from "../setup/templates";
import { loadOrBuildDriveDbRegistrationStats } from "../state-db/drive-registration";
import {
  type GuardrailDecisionInput,
  inspectGuardrailInvariants,
} from "../state-db/guardrail-invariants";
import { openHarnessDb } from "../state-db/index";
import { rebuildHarnessDb } from "../state-db/projection-writer";
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

/** I/O・clock 注入 (test 可能、handover staleness 検査用)。 */
export interface DoctorDeps {
  repoRoot: string;
  now: string;
  readText: (path: string) => string | null;
  listDir: (dir: string) => string[];
}

function handoverDeps(deps: DoctorDeps): HandoverDeps {
  return {
    repoRoot: deps.repoRoot,
    now: () => deps.now,
    readText: deps.readText,
    listDir: deps.listDir,
    writeText: () => {
      throw new Error("doctor is read-only and must not write handover state");
    },
  };
}

export function checkHandoverDisciplineMessages(deps: DoctorDeps): string[] {
  const hd = handoverDeps(deps);
  return [
    ...checkHandoverDiscipline(hd),
    ...checkHandoverBypass(hd),
    ...checkHandoverCompletionWording(hd),
  ];
}

/**
 * handover 機械ポインタ (CURRENT.json) の鮮度を surface (§5.3 / §6.8.5、warning レベル)。
 * 不在・stale・壊れは message で示すのみ (doctor.ok は落とさない = §5.3 exit 0 warning)。
 */
export function checkHandover(deps: DoctorDeps): string {
  const raw = deps.readText(join(deps.repoRoot, ".ut-tdd", "handover", "CURRENT.json"));
  if (!raw) return "doctor: handover — CURRENT.json なし (ut-tdd handover で生成、§6.8.5)";
  let p: HandoverPointer;
  try {
    p = JSON.parse(raw) as HandoverPointer;
  } catch {
    return "doctor: handover — ⚠ CURRENT.json が壊れています (ut-tdd handover で再生成)";
  }
  return handoverStale(p.updated_at, deps.now)
    ? `doctor: handover — ⚠ stale (updated_at=${p.updated_at}、24h 超。ut-tdd handover で更新)`
    : `doctor: handover — OK (active=${p.active_plan ?? "-"}, updated_at=${p.updated_at})`;
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
export function checkBackfillResult(repoRoot: string): { messages: string[]; ok: boolean } {
  try {
    const docs = loadBackfillDocs(repoRoot);
    const r = analyzeBackfill(docs.plans, docs.glossaryText, docs.auditedLegacyIds);
    return { messages: backfillMessages(r), ok: r.ok };
  } catch {
    return { messages: ["backfill - violation: PLAN/glossary could not be read"], ok: false };
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
export function checkScrumReverse(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["scrum-reverse - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzeScrumReverse(loadSrPlans(repoRoot));
    return { messages: scrumReverseMessages(r), ok: r.ok };
  } catch {
    return { messages: ["scrum-reverse - violation: PLAN could not be read"], ok: false };
  }
}

/**
 * PLAN errata の双方向整合を surface (PLAN-L7-89、hard fail)。`supersedes` 宣言の先が実在しない /
 * 原 PLAN に訂正 back-reference が無い → ok=false。I/O 失敗も violation にして fail-close する。
 */
export function checkPlanSupersession(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["plan-supersession - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzePlanSupersession(loadSupersedePlans(repoRoot));
    return { messages: planSupersessionMessages(r), ok: r.ok };
  } catch {
    return { messages: ["plan-supersession - violation: PLAN could not be read"], ok: false };
  }
}

/**
 * PLAN 本文 substance を surface (PLAN-L7-92、hard fail)。frontmatter + タイトルのみで本文実体行 0 の
 * declare-only hollow PLAN (concept AP-13 無効) → ok=false。I/O 失敗も violation にして fail-close する。
 */
export function checkPlanBodySubstance(repoRoot: string): { messages: string[]; ok: boolean } {
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
    return { messages: ["plan-body-substance - violation: PLAN could not be read"], ok: false };
  }
}

/**
 * DoD 全消化済なのに status 非終端の PLAN を surface (PLAN-L7-93、hard fail)。完了 bookkeeping drift
 * (作業完了 + gated downstream confirmed なのに recovery/poc PLAN 自身が draft 放置) → ok=false。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkPlanCompletionDrift(repoRoot: string): { messages: string[]; ok: boolean } {
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
    return { messages: ["plan-completion-drift - violation: PLAN could not be read"], ok: false };
  }
}

/**
 * concept §2.6 ⇔ requirements §7.8.1 の signal 語彙伝播を surface (IMP-065、hard fail)。
 * 上位正本 (concept) と機械 routing SSoT (requirements) の signal 集合が乖離 → ok=false。
 * I/O 失敗も violation にして fail-close する。
 */
export function checkPropagation(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["propagation - violation: repo root could not be read"], ok: false };
  }
  try {
    const d = loadPropagationDocs(repoRoot);
    const r = analyzePropagation(d.conceptText, d.requirementsText);
    return { messages: propagationMessages(r), ok: r.ok };
  } catch {
    return { messages: ["propagation - violation: governance docs could not be read"], ok: false };
  }
}

/**
 * 設計層 pair freeze (design⇔test-design の pair_artifact 双方向・孤児0) を検査 (IMP-067、hard)。
 * 孤児 (pair-missing/ref-unresolved/trace-orphan) を violation にして doctor.ok に連動する。
 */
export function checkPairFreeze(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["pair-freeze - violation: repo root could not be read"], ok: false };
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
export function checkReviewEvidence(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["review-evidence - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzeReviewEvidence(loadReviewPlans(repoRoot));
    return { messages: reviewEvidenceMessages(r), ok: r.ok };
  } catch {
    return { messages: ["review-evidence - violation: PLAN could not be read"], ok: false };
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
export function checkGuardrailInvariants(repoRoot: string): { messages: string[]; ok: boolean } {
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
export function checkMergedPlanStatus(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["merged-plan-status - violation: repo root could not be read"], ok: false };
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
export function checkPlanArtifactExistence(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkModuleDrift(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["module-drift - violation: repo root could not be read"], ok: false };
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

export function checkAssetDrift(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["asset-drift - violation: repo root could not be read"], ok: false };
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

export function checkSkillAssignment(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["skill-assignment - violation: repo root could not be read"], ok: false };
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

export function checkDescentObligation(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["descent-obligation - violation: repo root could not be read"], ok: false };
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

export function checkChangeImpact(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["change-impact - violation: repo root could not be read"], ok: false };
  }
  // 非 git (ZIP 展開のみ) では change-impact は適用不能 → skip (ok)。git は在るが status が
  // 壊れる実エラーは下の catch で fail-close を維持する。CI は常に git repo なので影響なし。
  if (!isGitRepository(repoRoot)) {
    return { messages: ["change-impact — skipped (not a git repository)"], ok: true };
  }
  try {
    const r = analyzeChangeImpact({ changedFiles: loadChangedFiles(repoRoot) });
    return { messages: changeImpactMessages(r), ok: r.ok };
  } catch {
    return { messages: ["change-impact - violation: git status could not be read"], ok: false };
  }
}

export function checkChangeSetIntegrity(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["change-set-integrity - violation: repo root could not be read"],
      ok: false,
    };
  }
  // 非 git では変更集合を確定できない → skip (change-impact と同じ非 git fail-open 方針)。
  if (!isGitRepository(repoRoot)) {
    return { messages: ["change-set-integrity — skipped (not a git repository)"], ok: true };
  }
  try {
    const dependencyDrift = analyzeDependencyDrift(loadDependencyDriftInput(repoRoot));
    const result = analyzeChangeSetIntegrity({
      changedFiles: loadChangedFiles(repoRoot),
      dependencyDrift,
    });
    return { messages: changeSetIntegrityMessages(result), ok: result.ok };
  } catch {
    return {
      messages: ["change-set-integrity - violation: change/dependency graph could not be read"],
      ok: false,
    };
  }
}

function loadChangedFilesForDoctor(repoRoot: string): string[] {
  try {
    return loadChangedFiles(repoRoot);
  } catch {
    return [];
  }
}

export function checkVerificationProfile(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkBranchKind(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["branch-kind-check - violation: repo root could not be read"], ok: false };
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

export function checkCodingRules(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["coding-rules - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzeCodingRules(
      loadCodingRuleDocs(repoRoot),
      loadCodingRulePolicy(repoRoot),
      loadCodingWorkflowDocs(repoRoot),
    );
    return { messages: codingRulesMessages(r), ok: r.ok };
  } catch {
    return { messages: ["coding-rules — violation: TS coding rule lint could not run"], ok: false };
  }
}

export function checkDddTddRules(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["ddd-tdd-rules - violation: repo root could not be read"], ok: false };
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

export function checkDesignLanguage(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["design-language - violation: repo root could not be read"], ok: false };
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

export function checkDbProjectionCoverage(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkDbProjectionIngestion(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["db-projection-ingestion - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const db = openHarnessDb(":memory:", { repoRoot });
    try {
      const rebuilt = rebuildHarnessDb({ repoRoot, db });
      const result = analyzeDbProjectionIngestion(rebuilt.rowCounts);
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
      db.close();
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

export function checkRuleDrift(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["rule-drift - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzeRuleDrift(loadRuleAdapterDocs(repoRoot));
    return { messages: ruleDriftMessages(r), ok: r.ok };
  } catch {
    return { messages: ["rule-drift - violation: adapter rule docs could not be read"], ok: false };
  }
}

export function checkRuntimePortability(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkGateConfirm(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["gate-confirm - violation: repo root could not be read"], ok: false };
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

export function checkPlanSchedule(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["plan-schedule - violation: repo root could not be read"], ok: false };
  }
  try {
    return lintPlan(undefined, repoRoot);
  } catch {
    return { messages: ["plan-schedule - violation: PLAN schedule lint could not run"], ok: false };
  }
}

export function checkPlanGovernance(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["plan-governance - violation: repo root could not be read"], ok: false };
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

export function checkPlanDod(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["plan-dod - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzePlanDod(loadPlanDodDocs(repoRoot));
    return { messages: planDodMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return { messages: ["plan-dod - violation: L7 PLAN DoD could not be read"], ok: false };
  }
}

export function checkPlaceholderDeps(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["placeholder-deps - violation: repo root could not be read"], ok: false };
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
    return { messages: [`${gate.toLowerCase()} - violation: trace gate could not run`], ok: false };
  }
}

export function checkRuleAutomationClosure(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["rule-automation-closure - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeRuleAutomationClosure(loadRuleAutomationClosureDocs(repoRoot));
    return { messages: ruleAutomationClosureMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["rule-automation-closure - violation: closure table could not be read"],
      ok: false,
    };
  }
}

export function checkDriveModelPassage(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["drive-model-passage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDriveModelPassage(loadDriveModelPassageDocs(repoRoot));
    return { messages: driveModelPassageMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["drive-model-passage - violation: passage certificate table could not be read"],
      ok: false,
    };
  }
}

export function checkDriveDbRegistration(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["drive-db-registration - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeDriveDbRegistration(loadOrBuildDriveDbRegistrationStats(repoRoot));
    return { messages: driveDbRegistrationMessages(r), ok: r.ok };
  } catch {
    return {
      messages: ["drive-db-registration - violation: harness.db registration could not be read"],
      ok: false,
    };
  }
}

export function checkFrRoadmapCoverage(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["fr-roadmap-coverage - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeFrRoadmapCoverageWithRoot(loadFrRoadmapCoverageDocs(repoRoot), repoRoot);
    return { messages: frRoadmapCoverageMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["fr-roadmap-coverage - violation: residual bucket table could not be read"],
      ok: false,
    };
  }
}

export function checkTelemetryClosure(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["telemetry-closure - violation: repo root could not be read"], ok: false };
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

export function checkCycleP4Verification(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return {
      messages: ["cycle-p4-verification - violation: repo root could not be read"],
      ok: false,
    };
  }
  try {
    const r = analyzeCycleP4Verification(loadCycleP4VerificationDocs(repoRoot), repoRoot);
    return { messages: cycleP4VerificationMessages(r), ok: r.checked > 0 && r.ok };
  } catch {
    return {
      messages: ["cycle-p4-verification - violation: Cycle P4 closure audit could not be read"],
      ok: false,
    };
  }
}

export function checkProjectHooks(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["project-hook - violation: repo root could not be read"], ok: false };
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

export function checkCodexHookAdapter(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["codex-hook-adapter - violation: repo root could not be read"], ok: false };
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

export function checkToolContractRegistry(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkCodexWrapperParity(deps: DoctorDeps): { messages: string[]; ok: boolean } {
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
    "ut-tdd codex --execute records the same session lifecycle through the adapter wrapper",
    "ut-tdd codex --task-file feeds file content through the same adapter wrapper",
    "ut-tdd codex --plan records wrapper lifecycle without forwarding plan flags to Codex",
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
      "codex-wrapper-parity - OK (claude_hooks=project-settings, codex=ut-tdd-wrapper-lifecycle, adapter=stdin)",
    ],
    ok: true,
  };
}

export function checkL6FrCoverage(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["l6-fr-coverage - violation: repo root could not be read"], ok: false };
  }
  try {
    const r = analyzeL6FrCoverage(loadL6FrCoverageDocs(repoRoot));
    return { messages: l6FrCoverageMessages(r), ok: r.ok };
  } catch {
    return { messages: ["l6-fr-coverage — ⚠ L6 FR coverage matrix を読めない"], ok: false };
  }
}

export function checkReadability(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["readability - violation: repo root could not be read"], ok: false };
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
 * (PLAN-L7-69): .ut-tdd/audit/** markdown and .ut-tdd/handover/** JSON
 * (cross-agent provider payloads included). Fail-open on absence — a fresh
 * repo with no runtime artifacts has nothing to corrupt — and fail-close on
 * any mojibake marker so a corrupted handover/audit/provider-JSON cannot pass
 * silently. repo root unreadable is fail-close.
 */
export function checkRuntimeReadability(repoRoot: string): { messages: string[]; ok: boolean } {
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
    return { messages: ["runtime-readability — ⚠ .ut-tdd artifacts を読めない"], ok: false };
  }
}

/**
 * feedback-log のドメスティック化規律を hard gate 検査 (IMP-085、A-138 ITEM-3)。
 * docs/feedback-log.md 不在は fail-open (任意ドキュメント)、repo root 不在は fail-close。
 */
export function checkFeedbackLog(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["feedback-log - violation: repo root could not be read"], ok: false };
  }
  if (!existsSync(join(repoRoot, "docs/feedback-log.md"))) {
    return { messages: ["feedback-log — OK (docs/feedback-log.md 不在 = 適用なし)"], ok: true };
  }
  try {
    const r = analyzeFeedbackLog(loadFeedbackLogInput(repoRoot));
    return { messages: feedbackLogMessages(r), ok: r.ok };
  } catch {
    return { messages: ["feedback-log — ⚠ docs/feedback-log.md を読めない"], ok: false };
  }
}

/** V-model 層群の Forward freeze 完了 (検証サイクル発火タイミング) を hard gate として検査する。 */
export function checkL6Completion(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkL7Completion(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["l7-completion - violation: repo root could not be read"], ok: false };
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
export function checkImplPlanTrace(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["impl-plan-trace - violation: repo root could not be read"], ok: false };
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
export function checkSubDocCatalogDrift(repoRoot: string): { messages: string[]; ok: boolean } {
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
export function checkScreenImplPairFreeze(repoRoot: string): { messages: string[]; ok: boolean } {
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

/** git tracked top-level ⊆ repository-structure.md canonical の突合を hard gate として検査する。 */
export function checkTrackedCanonical(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["tracked-canonical - violation: repo root could not be read"], ok: false };
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
export function checkOracleTestTrace(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["oracle-test-trace - violation: repo root could not be read"], ok: false };
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
export function checkRoadmap(repoRoot: string): { messages: string[]; ok: boolean } {
  if (!existsSync(repoRoot)) {
    return { messages: ["roadmap - violation: repo root could not be read"], ok: false };
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
    return { messages, ok: issueCount === 0 && coverageOk && featurePackCoverage.ok };
  } catch {
    return { messages: ["roadmap - violation: 工程表を読めず検査できない"], ok: false };
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
    return { messages: verificationGroupMessages(groups), ok: verificationGroupsOk(groups) };
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

function markdownFrontmatter(text: string): Record<string, unknown> | null {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  try {
    return recordValue(parseYaml(text.slice(4, end)));
  } catch {
    return null;
  }
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
    ".github/ISSUE_TEMPLATE/recovery.md",
    ".github/ISSUE_TEMPLATE/add-feature.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ...expectedClaudeAgentPaths,
    ...expectedClaudeCommandPaths,
    CONSUMER_TEAM_DEFINITION_PATH,
    ".ut-tdd/memory/.gitkeep",
    ".ut-tdd/handover/.gitkeep",
    ".ut-tdd/evidence/.gitkeep",
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
    text.includes("ut-tdd completion decision-packet --json") &&
    text.includes("ut-tdd doctor --profile consumer");
  const docsOk =
    agents.includes("HELIX アダプター") &&
    agents.includes("UT-TDD:managed:start") &&
    adapterDocHasConsumerPolicy(agents) &&
    claude.includes("HELIX 共有コンテキスト") &&
    claude.includes("UT-TDD:managed:start") &&
    adapterDocHasConsumerPolicy(claude) &&
    claudeRuntime.includes("Claude runtime アダプター") &&
    claudeRuntime.includes("UT-TDD:managed:start") &&
    adapterDocHasConsumerPolicy(claudeRuntime);
  messages.push(
    docsOk
      ? "doctor: consumer-adapter-docs - OK (managed blocks, Japanese rule, consumer profile, cutover boundary present)"
      : "doctor: consumer-adapter-docs - violation: adapter docs missing managed/Japanese/consumer-profile/cutover markers",
  );
  const futureStateDir = [".", "helix"].join("");
  const prematureHelixState = consumerPathsUnder(deps, futureStateDir);
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
  const helixCommandPattern = /\bhelix(?:\s+(?:--[a-z0-9-]+|[a-z][a-z0-9-]*))?(?=\s|$)/;
  const prematureHelixAlias = [
    ...(packageBin && Object.hasOwn(packageBin, "helix") ? ["package.json:bin.helix"] : []),
    ...(typeof packageBinRaw === "string" && /(?:^|\/)helix$/.test(packageName)
      ? ["package.json:bin"]
      : []),
    ...Object.entries(packageScripts ?? {})
      .filter(([, value]) => typeof value === "string" && helixCommandPattern.test(value))
      .map(([name]) => `package.json:scripts.${name}`),
    ...executableSurfacePaths.filter((path) =>
      helixCommandPattern.test(consumerFile(deps, path) ?? ""),
    ),
  ];
  messages.push(
    prematureHelixState.length === 0 && prematureHelixAlias.length === 0
      ? `doctor: consumer-identifier-transition - OK (${futureStateDir} state and helix package/bin alias not generated before PLAN-M-02 cutover)`
      : `doctor: consumer-identifier-transition - violation premature_future_state=${prematureHelixState.join(",")} premature_alias=${prematureHelixAlias.join(",")}`,
  );

  const claudeSettings = consumerFile(deps, ".claude/settings.json") ?? "";
  const claudeOk =
    claudeSettings.includes("ut-tdd hook agent-guard") &&
    claudeSettings.includes("ut-tdd hook work-guard") &&
    claudeSettings.includes("ut-tdd session start");
  messages.push(
    claudeOk
      ? "doctor: consumer-claude-adapter - OK (work/agent guard and session hook present)"
      : "doctor: consumer-claude-adapter - violation: Claude hooks baseline incomplete",
  );

  const codexHooks = consumerFile(deps, ".codex/hooks.json") ?? "";
  const codexConfig = consumerFile(deps, ".codex/config.toml") ?? "";
  const codexOk =
    codexConfig.includes("[features]") &&
    codexConfig.includes("hooks = true") &&
    codexHooks.includes("ut-tdd hook work-guard") &&
    codexHooks.includes("ut-tdd hook agent-guard");
  messages.push(
    codexOk
      ? "doctor: consumer-codex-adapter - OK (hooks enabled; work/agent guard present)"
      : "doctor: consumer-codex-adapter - violation: Codex hooks/config baseline incomplete",
  );

  const invalidAgentTemplates = expectedClaudeAgentPaths.filter((path) => {
    const text = consumerFile(deps, path) ?? "";
    const fm = markdownFrontmatter(text);
    const expectedName = basename(path, ".md");
    return !(
      fm?.name === expectedName &&
      typeof fm.description === "string" &&
      fm.description.trim().length > 0 &&
      typeof fm.tools === "string" &&
      fm.tools.trim().length > 0 &&
      text.includes("consumer-safe な HELIX subagent") &&
      text.includes("ut-tdd status") &&
      text.includes("ut-tdd completion decision-packet --json") &&
      text.includes("ut-tdd doctor --profile consumer") &&
      text.includes("secret、credential、PII") &&
      text.includes("findings") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const invalidCommandTemplates = expectedClaudeCommandPaths.filter((path) => {
    const text = consumerFile(deps, path) ?? "";
    const fm = markdownFrontmatter(text);
    return !(
      typeof fm?.description === "string" &&
      fm.description.trim().length > 0 &&
      text.includes("HELIX") &&
      text.includes("ut-tdd status --json") &&
      text.includes("ut-tdd completion decision-packet --json") &&
      text.includes("ut-tdd doctor --profile consumer") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const claudeSurfaceOk =
    invalidAgentTemplates.length === 0 && invalidCommandTemplates.length === 0;
  messages.push(
    claudeSurfaceOk
      ? `doctor: consumer-claude-surface - OK (agents=${expectedClaudeAgentPaths.length}, commands=${expectedClaudeCommandPaths.length}, Japanese+completion-packet+consumer-doctor baseline)`
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
  const expectedTasks = new Map([
    ["HELIX: status", "bun run ut-tdd status"],
    ["HELIX: doctor", "bun run ut-tdd doctor --profile consumer"],
    ["HELIX: completion decision-packet", "bun run ut-tdd completion decision-packet --json"],
    ["HELIX: rename plan", "bun run ut-tdd rename plan --json"],
    ["HELIX: handover status", "bun run ut-tdd handover status --json"],
    ["HELIX: setup dry-run", "bun run ut-tdd setup project --dry-run"],
    [
      "HELIX: team run dry-run",
      `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
    ],
  ]);
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
  const workflow = recordValue(consumerYaml(deps, ".github/workflows/harness-check.yml"));
  const workflowOn = recordValue(workflow?.on);
  const push = recordValue(workflowOn?.push);
  const pullRequest = recordValue(workflowOn?.pull_request);
  const pushMain = stringList(push?.branches).includes("main");
  const pullRequestMain = stringList(pullRequest?.branches).includes("main");
  const noPullRequestTarget = workflowOn
    ? !Object.hasOwn(workflowOn, "pull_request_target")
    : false;
  const permissions = recordValue(workflow?.permissions);
  const permissionsRead = permissions?.contents === "read";
  const tokenWrite = permissions
    ? Object.values(permissions).some((value) => value === "write")
    : false;
  const jobs = recordValue(workflow?.jobs);
  const harnessJob = recordValue(jobs?.["harness-check"]);
  const steps = Array.isArray(harnessJob?.steps) ? harnessJob.steps : [];
  const stepRecords = steps
    .map(recordValue)
    .filter((step): step is Record<string, unknown> => Boolean(step));
  const requiredUses = ["actions/checkout@v4", "oven-sh/setup-bun@v2"];
  const requiredRuns = [
    "bun install --frozen-lockfile",
    "bun run ut-tdd --version",
    "bun run ut-tdd setup project --dry-run --json",
    "bun run ut-tdd status --json",
    "bun run ut-tdd completion decision-packet --json",
    "bun run ut-tdd doctor --profile consumer --json",
    "bun run ut-tdd rename plan --json",
    "bun run ut-tdd handover status --json",
    `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
    "bun run typecheck",
    "bun run test",
  ];
  const missingUses = requiredUses.filter((use) => !stepRecords.some((step) => step.uses === use));
  const missingRuns = requiredRuns.filter((run) => !stepRecords.some((step) => step.run === run));
  const ciOk =
    workflow?.name === "harness-check" &&
    pushMain &&
    pullRequestMain &&
    noPullRequestTarget &&
    permissionsRead &&
    !tokenWrite &&
    harnessJob?.["runs-on"] === "ubuntu-latest" &&
    missingUses.length === 0 &&
    missingRuns.length === 0 &&
    !workflowRaw.includes("secrets.");
  messages.push(
    ciOk
      ? `doctor: consumer-ci-workflow - OK (workflow=harness-check, permissions=contents:read, triggers=push/pull_request:main, commands=${requiredUses.length + requiredRuns.length}, secrets=not-required)`
      : `doctor: consumer-ci-workflow - violation name=${workflow?.name === "harness-check"} pushMain=${pushMain} pullRequestMain=${pullRequestMain} noPullRequestTarget=${noPullRequestTarget} permissionsRead=${permissionsRead} tokenWrite=${tokenWrite} job=${harnessJob?.["runs-on"] === "ubuntu-latest"} missingUses=${missingUses.join(",")} missingRuns=${missingRuns.join(",")} secrets=${workflowRaw.includes("secrets.")}`,
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
    prematureHelixState.length === 0 &&
    prematureHelixAlias.length === 0 &&
    claudeOk &&
    codexOk &&
    claudeSurfaceOk &&
    teamSurfaceOk &&
    taskSafetyOk &&
    ciOk &&
    policyTemplatesOk;
  return { ok, messages };
}

/**
 * doc-consistency lint を hard gate 検査 (PLAN-L7-95、要件 §G.11 の「自動検証」配線)。
 * carry 整合 / screen-id 妥当性 / NFR 件数宣言-実数を fail-close。I/O 失敗も violation。
 */
export function checkDocConsistency(repoRoot: string): { messages: string[]; ok: boolean } {
  try {
    const r = analyzeDocConsistency(loadDocConsistencyDocs(repoRoot));
    const bad = r.carryOrphans.length + r.screenIdOrphans.length + (r.nfrCount.mismatch ? 1 : 0);
    if (bad === 0) {
      return {
        messages: [
          `doc-consistency — OK (carry/screen-id/NFR 整合, screens=${r.definedScreenCount}, NFR=${r.nfrCount.actual})`,
        ],
        ok: true,
      };
    }
    return {
      messages: [
        `doc-consistency — violation: carryOrphans=${r.carryOrphans.length}, screenIdOrphans=${r.screenIdOrphans.length}, nfrMismatch=${r.nfrCount.mismatch} (declared=${r.nfrCount.declared}/actual=${r.nfrCount.actual})`,
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
export function checkEntityCoverage(repoRoot: string): { messages: string[]; ok: boolean } {
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
    return { messages: ["entity-coverage — violation: business doc could not be read"], ok: false };
  }
}

/**
 * fr-registry-audit lint を hard gate 検査 (PLAN-L7-95、要件 §1.10.G.10 の「漏れ監査自動化」配線)。
 * FR-L1 registry の 5 型漏れ (登録/欠番/属性/件数/画面被覆) を fail-close。I/O 失敗も violation。
 */
export function checkFrRegistryAudit(repoRoot: string): { messages: string[]; ok: boolean } {
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
export function checkImprovementBacklog(repoRoot: string): { messages: string[]; ok: boolean } {
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
export function checkRightArmGatePlanning(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkLintWiring(repoRoot: string): { messages: string[]; ok: boolean } {
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

/**
 * forward-convergence (fail-close, PLAN-DISCOVERY-08 Step5): spine-外 kind=impl の NEW 未集約 landed を
 * gate する。legacy debt allowlist は grandfather (ok を落とさず surface)。例外時は fail-close。
 */
export function checkForwardConvergence(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkVersionUpReadiness(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkS4DecisionReadiness(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function checkCutoverReadiness(repoRoot: string): { messages: string[]; ok: boolean } {
  try {
    const r = analyzeCutoverReadiness(loadCutoverReadinessInput(repoRoot));
    const renamePlan = buildIdentifierRenameCutoverPlan(repoRoot);
    const templateViolations = recordTemplateContractViolations({
      subject: "ut-tdd rename plan",
      requiredRecords: requiredRecordsForBlockers([
        "irreversible_migration_pending",
        "human_approval_pending",
      ]),
      recordTemplates: renamePlan.recordTemplates,
    });
    const runbookCommandViolations = identifierRenameRunbookCommandViolations(renamePlan);
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
        ...verificationCommandViolations.map(
          (violation) => `cutover-readiness - violation: ${violation.subject}: ${violation.reason}`,
        ),
      ],
      ok:
        r.ok &&
        templateViolations.length === 0 &&
        runbookCommandViolations.length === 0 &&
        verificationCommandViolations.length === 0,
    };
  } catch {
    return {
      messages: ["cutover-readiness - violation: irreversible cutover docs could not be read"],
      ok: false,
    };
  }
}

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

export function completionDedicatedPacketBridgeViolations(
  repoRoot: string,
  packet: ReturnType<typeof loadCompletionDecisionPacketInput>,
  deps: {
    s4Packets?: ReturnType<typeof buildS4DecisionPackets>;
    versionPackets?: ReturnType<typeof buildVersionUpActivationPackets>;
    renamePlan?: ReturnType<typeof buildIdentifierRenameCutoverPlan>;
    approvalPackets?: ReturnType<typeof buildActionBindingApprovalPackets>;
  } = {},
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

export function checkObjectiveEvidenceAudit(repoRoot: string): { messages: string[]; ok: boolean } {
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

export function runDoctor(deps: DoctorDeps = nodeDoctorDeps(process.cwd())): LintResult {
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
  const skillAssignment = checkSkillAssignment(deps.repoRoot);
  const descentObligation = checkDescentObligation(deps.repoRoot);
  const changeImpact = checkChangeImpact(deps.repoRoot);
  const changeSetIntegrity = checkChangeSetIntegrity(deps.repoRoot);
  const verificationProfile = checkVerificationProfile(deps.repoRoot);
  const branchKind = checkBranchKind(deps.repoRoot);
  const codingRules = checkCodingRules(deps.repoRoot);
  const dddTddRules = checkDddTddRules(deps.repoRoot);
  const designLanguage = checkDesignLanguage(deps.repoRoot);
  const runtimePortability = checkRuntimePortability(deps.repoRoot);
  const ruleDrift = checkRuleDrift(deps.repoRoot);
  const gateConfirm = checkGateConfirm(deps.repoRoot);
  const planSchedule = checkPlanSchedule(deps.repoRoot);
  const planGovernance = checkPlanGovernance(deps.repoRoot);
  const planDod = checkPlanDod(deps.repoRoot);
  const placeholderDeps = checkPlaceholderDeps(deps.repoRoot);
  const g1Trace = checkPlanTraceGate(deps.repoRoot, "G1-trace");
  const g3Trace = checkPlanTraceGate(deps.repoRoot, "G3-trace");
  const ruleAutomationClosure = checkRuleAutomationClosure(deps.repoRoot);
  const driveModelPassage = checkDriveModelPassage(deps.repoRoot);
  const driveDbRegistration = checkDriveDbRegistration(deps.repoRoot);
  const frRoadmapCoverage = checkFrRoadmapCoverage(deps.repoRoot);
  const telemetryClosure = checkTelemetryClosure(deps.repoRoot);
  const cycleP4Verification = checkCycleP4Verification(deps.repoRoot);
  const projectHooks = checkProjectHooks(deps.repoRoot);
  const codexHookAdapter = checkCodexHookAdapter(deps.repoRoot);
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
  const verificationGroups = checkVerificationGroupsResult(deps.repoRoot);
  const dependencyDrift = checkDependencyDrift(deps.repoRoot);
  const regressionExpansion = checkRegressionExpansion(deps.repoRoot, dependencyDrift.result);
  const guardrailInvariants = checkGuardrailInvariants(deps.repoRoot);
  const dbProjectionCoverage = checkDbProjectionCoverage(deps.repoRoot);
  const dbProjectionIngestion = checkDbProjectionIngestion(deps.repoRoot);
  const docConsistency = checkDocConsistency(deps.repoRoot);
  const entityCoverage = checkEntityCoverage(deps.repoRoot);
  const frRegistryAudit = checkFrRegistryAudit(deps.repoRoot);
  const improvementBacklog = checkImprovementBacklog(deps.repoRoot);
  const rightArmGatePlanning = checkRightArmGatePlanning(deps.repoRoot);
  const rightArmVerificationStrategy = checkRightArmVerificationStrategy(deps.repoRoot);
  const g8IntegrationWorkflow = checkG8IntegrationWorkflow(deps.repoRoot);
  const lintWiring = checkLintWiring(deps.repoRoot);
  const proposalDocumentCoverage = checkProposalDocumentCoverage(deps.repoRoot);
  const frontendDesignCoverage = checkFrontendDesignCoverage(deps.repoRoot);
  const handoverNextAction = checkHandoverNextActionAnchor(handoverDeps(deps));
  const handoverOutstanding = checkHandoverOutstandingAnchor(handoverDeps(deps));
  const handoverDecisionPacket = checkHandoverCompletionDecisionPacket(handoverDeps(deps));
  // fail-close: green_command digest が evidence_path 実 hash と一致するか (fake substance 防止、PLAN-L7-132)。
  const greenCommandDigest = checkGreenCommandDigests(deps.repoRoot);
  // fail-close: spine-外 kind=impl の NEW 未集約 landed を gate (PLAN-DISCOVERY-08 Step5)。legacy は grandfather。
  const forwardConvergence = checkForwardConvergence(deps.repoRoot);
  const versionUpReadiness = checkVersionUpReadiness(deps.repoRoot);
  const actionBindingApprovalReadiness = checkActionBindingApprovalReadiness(deps.repoRoot);
  const s4DecisionReadiness = checkS4DecisionReadiness(deps.repoRoot);
  const cutoverReadiness = checkCutoverReadiness(deps.repoRoot);
  const completionDecisionPacket = checkCompletionDecisionPacket(deps.repoRoot);
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
      skillAssignment.ok &&
      descentObligation.ok &&
      changeImpact.ok &&
      changeSetIntegrity.ok &&
      verificationProfile.ok &&
      branchKind.ok &&
      codingRules.ok &&
      dddTddRules.ok &&
      designLanguage.ok &&
      runtimePortability.ok &&
      ruleDrift.ok &&
      gateConfirm.ok &&
      planSchedule.ok &&
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
      dependencyDrift.ok &&
      regressionExpansion.ok &&
      dbProjectionCoverage.ok &&
      dbProjectionIngestion.ok &&
      docConsistency.ok &&
      entityCoverage.ok &&
      frRegistryAudit.ok &&
      improvementBacklog.ok &&
      rightArmGatePlanning.ok &&
      rightArmVerificationStrategy.ok &&
      g8IntegrationWorkflow.ok &&
      lintWiring.ok &&
      proposalDocumentCoverage.ok &&
      frontendDesignCoverage.ok &&
      greenCommandDigest.ok &&
      forwardConvergence.ok &&
      versionUpReadiness.ok &&
      actionBindingApprovalReadiness.ok &&
      s4DecisionReadiness.ok &&
      cutoverReadiness.ok &&
      completionDecisionPacket.ok &&
      objectiveEvidenceAudit.ok &&
      semanticFrontierConsistency.ok &&
      forwardConvergenceAudit.ok &&
      handoverNextAction.ok &&
      handoverOutstanding.ok &&
      handoverDecisionPacket.ok,
    messages: [
      `doctor: mode=${d.mode} (claude=${d.claude}, codex=${d.codex})`,
      checkHandover(deps),
      ...checkHandoverDisciplineMessages(deps).map((m) => `doctor: handover-discipline — ${m}`),
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
      ...skillAssignment.messages.map((m) => `doctor: ${m}`),
      ...descentObligation.messages.map((m) => `doctor: ${m}`),
      ...changeImpact.messages.map((m) => `doctor: ${m}`),
      ...changeSetIntegrity.messages.map((m) => `doctor: ${m}`),
      ...verificationProfile.messages.map((m) => `doctor: ${m}`),
      ...branchKind.messages.map((m) => `doctor: ${m}`),
      ...codingRules.messages.map((m) => `doctor: ${m}`),
      ...dddTddRules.messages.map((m) => `doctor: ${m}`),
      ...designLanguage.messages.map((m) => `doctor: ${m}`),
      ...runtimePortability.messages.map((m) => `doctor: ${m}`),
      ...ruleDrift.messages.map((m) => `doctor: ${m}`),
      ...gateConfirm.messages.map((m) => `doctor: ${m}`),
      ...planSchedule.messages.map((m) => `doctor: ${m}`),
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
      ...dependencyDrift.messages.map((m) => `doctor: ${m}`),
      ...regressionExpansion.messages.map((m) => `doctor: ${m}`),
      ...dbProjectionCoverage.messages.map((m) => `doctor: ${m}`),
      ...dbProjectionIngestion.messages.map((m) => `doctor: ${m}`),
      ...docConsistency.messages.map((m) => `doctor: ${m}`),
      ...entityCoverage.messages.map((m) => `doctor: ${m}`),
      ...frRegistryAudit.messages.map((m) => `doctor: ${m}`),
      ...improvementBacklog.messages.map((m) => `doctor: ${m}`),
      ...rightArmGatePlanning.messages.map((m) => `doctor: ${m}`),
      ...rightArmVerificationStrategy.messages.map((m) => `doctor: ${m}`),
      ...g8IntegrationWorkflow.messages.map((m) => `doctor: ${m}`),
      ...lintWiring.messages.map((m) => `doctor: ${m}`),
      ...proposalDocumentCoverage.messages.map((m) => `doctor: ${m}`),
      ...frontendDesignCoverage.messages.map((m) => `doctor: ${m}`),
      ...handoverNextAction.messages.map((m) => `doctor: ${m}`),
      ...handoverOutstanding.messages.map((m) => `doctor: ${m}`),
      ...handoverDecisionPacket.messages.map((m) => `doctor: ${m}`),
      ...greenCommandDigest.messages.map((m) => `doctor: ${m}`),
      ...forwardConvergence.messages.map((m) => `doctor: ${m}`),
      ...versionUpReadiness.messages.map((m) => `doctor: ${m}`),
      ...actionBindingApprovalReadiness.messages.map((m) => `doctor: ${m}`),
      ...s4DecisionReadiness.messages.map((m) => `doctor: ${m}`),
      ...cutoverReadiness.messages.map((m) => `doctor: ${m}`),
      ...completionDecisionPacket.messages.map((m) => `doctor: ${m}`),
      ...objectiveEvidenceAudit.messages.map((m) => `doctor: ${m}`),
      ...semanticFrontierConsistency.messages.map((m) => `doctor: ${m}`),
      ...forwardConvergenceAudit.messages.map((m) => `doctor: ${m}`),
    ],
  };
}
