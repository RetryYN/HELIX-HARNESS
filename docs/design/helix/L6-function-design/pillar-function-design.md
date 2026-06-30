---
title: "HELIX L6 機能設計 — pillar HC contract function descent"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/L6-pillar-unit-test-design.md
related_l5: docs/design/helix/L5-detail/pillar-detail-design.md
---

# HELIX L6 機能設計 — pillar HC contract function descent

本書は `docs/design/helix/L5-detail/pillar-detail-design.md` の `HC-*` 10 contract を、L7 で実装可能な
function contract へ降ろす。既存 `orchestration-memory.md` は Route-B P2/P7 の深掘りであり、本書は
pillar 43 要件全体の L6 横断設計を受け持つ。

## §0 量閉じ

- 入力 L5: `HC-P0` / `HC-P1` / `HC-P2` / `HC-P3` / `HC-P4` / `HC-P6` / `HC-P7` / `HC-P8` / `HC-P9` / `HC-AC` = 10 contract。
- 入力 L3: `HR-FR-*` 30 件 + `HR-NFR-*` 13 件 = 43 件。
- L6 function family: 10 family / 30 function contract。
- L7 unit oracle: `HU-PILLAR-*` 43 件。
- Route-B back-fill 8 件は `orchestration-memory.md` で 11 契約へ降下済み。本書では `HC-P1` / `HC-P2` / `HC-P3` / `HC-P7` / `HC-AC` の横断 family へ接続し、二重採番しない。
- L1 §2.8 asset/progress visualization amendment は S4 decision 待ちであり、本 L6 30 function contract
  へ含めない。S4 confirmed 後に layer tree / graph IR / evidence timeline / drill-down pointer の
  view-model function を別 family または HC-P9/HB-P9 extension として降下する。

## §1 function family

| HC | function family | 主な signature | DbC / fail-close | log / evidence | oracle |
|----|-----------------|----------------|------------------|----------------|--------|
| HC-P0 | forward-return | `normalizeForwardReturnInput(input) => ForwardReturnInput` / `decideForwardReturn(input) => ForwardReturnDecision` / `recordStopReasonEvidence(decision, sink) => EvidenceRef` | `return_to` / `gap_only` / `version_target` のいずれも無い完了 claim は reject。stop reason が空なら `blocked_reason="missing_stop_reason"` | `workflow_runs` / `gate_runs` / handover stop reason | HU-PILLAR-P0-01..02 |
| HC-P1 | autonomous-work | `evaluateAutonomyResume(input) => AutonomyResumeDecision` / `planVersionUpgradeDryRun(input) => VersionUpgradePlan` / `selectL2TemplatePack(input) => L2TemplateDecision` / `mergeAnchoredHandover(input) => HandoverMergeResult` | resume 3 条件、job availability、budget、handover next_action が揃わない場合は dispatch しない。version-up は migration/rollback/idempotency 欠落で dry-run fail | `jobs` / `budget_events` / `version_target` ledger / handover provider package | HU-PILLAR-P1-01..04 / HU-PILLAR-N5-01..02 |
| HC-P2 | agent-loop | `validateToolContractSurface(input) => ToolSurfaceDecision` / `tickLoopEffortBudget(input) => LoopBudgetDecision` / `writeLoopTraceSpan(input) => TraceSpanWriteResult` / `selectWorkflowComplexity(input) => WorkflowComplexityDecision` / `buildPairAgentTddPlan(input) => PairAgentTddPlan` / `runPairAgentTddPlan(input) => PairAgentRunResult` | 未登録 surface は fail-close または explicit defer。budget 超過時は同 worker が pass/continue を出せない。provider API/SDK daemon を required path にしない。TDD pair route は smart review agent の test/oracle 作成を light implementation より前に置き、light agent に closing authority を与えない。smart review の fail 指示は bounded transcript として次の light implementation prompt に渡す。`--save-evidence` は plan/run/transcript と run/span/tool/handoff/guardrail/eval/duration/cost を `.ut-tdd/evidence/pair-agent/` に保存する | `model_runs` / `guardrail_decisions` / trace span / tool contract registry / pair-agent plan/run JSON / bounded pair transcript / pair-agent evidence JSON | HU-PILLAR-P2-01..04 |
| HC-P3 | verification | `validatePairClosure(input) => PairClosureDecision` / `classifyVerificationEvidenceProfile(input) => VerificationEvidenceProfile` / `validateExternalGrounding(input) => GroundingDecision` / `validateTddOracle(input) => TddOracleDecision` / `selectVerificationProfile(input) => VerificationProfileDecision` | pair 欠落、coverage-only pass、self-review cross-agent 僭称、stale digest、external span 欠落、Red/oracle 欠落を accept しない。profile は timeout / p95 duration budget / worker count を必須にする | `trace_edges` / `test_runs` / `review_evidence` / runtime verification log | HU-PILLAR-P3-01..02 / HU-PILLAR-N3-01..04 / HU-PILLAR-N5-03 |
| HC-P4 | repair-feedback | `routeRepairFinding(input) => RepairCandidate` / `promoteRepairRecipe(input) => RepairRecipeDecision` / `projectMetricImprovementSignal(input) => MetricImprovementSignal` | detector finding は owner/route/rollback 無しに close しない。auth/PII/license/destructive repair は approval 無しで apply しない | `findings` / `quality_signals` / `feedback_events` / improvement backlog | HU-PILLAR-P4-01..03 |
| HC-P6 | distribution | `buildDistributionPlan(input) => DistributionPlan` / `projectRuntimeAdapterAssets(input) => RuntimeAssetProjectionPlan` / `validatePrReviewRoute(input) => ReviewRouteDecision` / `planReleaseAutomationDecision(input) => ReleaseAutomationDecision` / `gateCiAutoFixRepush(input) => CiAutoFixDecision` / `auditIdentifierRenameBlastRadius(input) => IdentifierRenameAudit` | raw push path、ruleset apply、branch protection apply、destructive setup overwrite、confidence<0.75 repush、release ADR 欠落を reject。consumer runtime asset は `.claude/agents` / `.claude/commands` / `.codex/hooks.json` / `.codex/config.toml` を明示投影し、dogfood `.claude/` / `.codex/` / `.ut-tdd/` runtime state は clean channel から除外する。PLAN-M-02 cutover は `.ut-tdd` / `ut-tdd` / `area=harness` blast radius audit と cutover approval record が揃うまで apply しない | setup baseline / release ledger / GitHub dry-run plan / import report / runtime asset manifest / rename audit JSON | HU-PILLAR-P6-01..05 / HU-PILLAR-DIST-01 |
| HC-P7 | knowledge | `buildBoundedRecallPacket(input) => BoundedRecallPacket` / `detectGlossaryDrift(input) => GlossaryDriftFinding[]` / `validateContextMapBoundary(input) => ContextBoundaryDecision` | per-agent silo を SSoT にしない。rename は supersedes 無しに close しない。context-crossing は anti-corruption boundary 無しなら drift | `.ut-tdd/memory` / provider handover / glossary / context-map / relation graph | HU-PILLAR-P7-01..03 |
| HC-P8 | security-boundary | `validateSourceAttribution(input) => SourceAttributionDecision` / `parseExternalSecurityFilter(input) => SecurityFilterDecision` / `selectSandboxTokenPolicy(input) => SandboxTokenDecision` / `requireActionBindingApproval(input) => ApprovalDecision` | raw external text を instruction に昇格しない。external action は sandbox/token scope/approval を欠けば deny。secret-like 値は evidence に保存しない | research artifact / security event / token policy / approval audit | HU-PILLAR-P8-01..04 / HU-PILLAR-N8-01..03 |
| HC-P9 | convergence-db | `checkProjectionConvergence(input) => ConvergenceStatus` / `classifyContractChange(input) => ContractChangeClass` / `queryLayerRegressionImpact(input) => RegressionImpactResult` | projection 未収束、contract change 未分類、影響 layer gate/test/doctor 未実行を green にしない | harness.db projection / relation graph / contract ledger / layer baseline snapshot | HU-PILLAR-P9-01..03 / HU-PILLAR-N3-03 |
| HC-AC | adapter-consistency | `validateAdapterParityMap(input) => AdapterParityDecision` / `requireHostedSurfacePreflight(input) => PreflightDecision` / `registerDeferredSurface(input) => DeferredSurfaceRegistration` / `validateRuntimeConfigHardening(input) => RuntimeConfigHardeningDecision` | hosted/API edit は hook-covered と主張できない。preflight 欠落、新 surface の registry/defer 欠落、adapter rule drift は reject。`max_parallel` は `MAX_TEAM_PARALLEL=8` を上限にし、consumer Claude matcher は standard `Task` と environment-specific `Agent` の差を template/doc で吸収する | rule-drift result / preflight audit / adapter dry-run plan / runtime config matrix | HU-PILLAR-NAC-01..03 / HU-PILLAR-P2-03 / HU-PILLAR-CONFIG-01 |

## §2 type sketch

```ts
type ContractDecisionKind = "allow" | "deny" | "defer" | "blocker" | "human_required";
type EvidenceRef = { path: string; kind: "runtime" | "projection" | "review" | "handover" };

interface ForwardReturnDecision {
  kind: "return_to_forward" | "gap_only" | "defer_to_version" | "blocker";
  target: string | null;
  blocked_reason: string | null;
}

interface VerificationProfileDecision {
  profile: "fast" | "default" | "full";
  timeout_seconds: number;
  p95_duration_budget_seconds: number;
  worker_count: number;
  selected_reason: string;
  overrun_policy: "blocker" | "continuation" | "improvement_task";
}

interface AdapterParityDecision {
  kind: "covered_by_hook" | "preflight_required" | "deferred_guard" | "drift";
  surface: string;
  evidence: EvidenceRef | null;
}

interface PairAgentTddPlan {
  status: "ready" | "blocked";
  reviewKind: "cross_agent" | "intra_runtime_subagent";
  agents: Array<{
    key: "smart-review-agent" | "light-implementation-agent";
    tier: "T0" | "T2";
    closingAuthority: boolean;
  }>;
  phases: Array<"smart_test_author" | "light_implementation" | "smart_review">;
  executionAuthorized: boolean;
}

interface RuntimeAssetProjectionPlan {
  consumer_assets: string[];
  excluded_dogfood_state: string[];
  rollback_managed_paths: string[];
}

interface RuntimeConfigHardeningDecision {
  max_parallel_limit: 8;
  accepted_matchers: Array<"Task" | "Agent">;
  dogfood_matcher_unchanged: boolean;
}
```

## §3 L3 -> L5 -> L6 trace

| L3 ID | L5 | L6 function | L7 oracle |
|-------|----|-------------|-----------|
| HR-FR-P0-01 | HC-P0 | `decideForwardReturn` | HU-PILLAR-P0-01 |
| HR-FR-P0-02 | HC-P0 | `recordStopReasonEvidence` | HU-PILLAR-P0-02 |
| HR-FR-P1-01 | HC-P1 | `evaluateAutonomyResume` | HU-PILLAR-P1-01 |
| HR-FR-P1-02 | HC-P1 | `planVersionUpgradeDryRun` | HU-PILLAR-P1-02 |
| HR-FR-P1-03 | HC-P1 | `evaluateAutonomyResume` | HU-PILLAR-P1-03 |
| HR-FR-P1-04 | HC-P1 | `selectL2TemplatePack` | HU-PILLAR-P1-04 |
| HR-FR-P2-01 | HC-P2 | `validateToolContractSurface` | HU-PILLAR-P2-01 |
| HR-FR-P2-02 | HC-P2 | `tickLoopEffortBudget` | HU-PILLAR-P2-02 |
| HR-FR-P2-03 | HC-AC | `validateAdapterParityMap` / `requireHostedSurfacePreflight` | HU-PILLAR-P2-03 |
| HR-FR-P2-04 | HC-P2 | `writeLoopTraceSpan` / `selectWorkflowComplexity` / `buildPairAgentTddPlan` / `runPairAgentTddPlan` | HU-PILLAR-P2-04 |
| HR-FR-P3-01 | HC-P3 | `validatePairClosure` | HU-PILLAR-P3-01 |
| HR-FR-P3-02 | HC-P3 | `validateExternalGrounding` | HU-PILLAR-P3-02 |
| HR-FR-P4-01 | HC-P4 | `routeRepairFinding` | HU-PILLAR-P4-01 |
| HR-FR-P4-02 | HC-P4 | `promoteRepairRecipe` | HU-PILLAR-P4-02 |
| HR-FR-P4-03 | HC-P4 | `projectMetricImprovementSignal` | HU-PILLAR-P4-03 |
| HR-FR-P6-01 | HC-P6 | `buildDistributionPlan` | HU-PILLAR-P6-01 |
| HR-FR-P6-02 | HC-P6 | `validatePrReviewRoute` / `gateCiAutoFixRepush` | HU-PILLAR-P6-02 |
| HR-FR-P6-03 | HC-P6 | `buildDistributionPlan` | HU-PILLAR-P6-03 |
| HR-FR-P6-04 | HC-P6 | `planVersionUpgradeDryRun` / `auditIdentifierRenameBlastRadius` | HU-PILLAR-P6-04 |
| HR-FR-P6-05 | HC-P6 | `planReleaseAutomationDecision` / `gateCiAutoFixRepush` | HU-PILLAR-P6-05 |
| HR-FR-P7-01 | HC-P7 | `buildBoundedRecallPacket` | HU-PILLAR-P7-01 |
| HR-FR-P7-02 | HC-P7 | `detectGlossaryDrift` | HU-PILLAR-P7-02 |
| HR-FR-P7-03 | HC-P7 | `validateContextMapBoundary` | HU-PILLAR-P7-03 |
| HR-FR-P8-01 | HC-P8 | `validateSourceAttribution` | HU-PILLAR-P8-01 |
| HR-FR-P8-02 | HC-P8 | `validateSourceAttribution` | HU-PILLAR-P8-02 |
| HR-FR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | HU-PILLAR-P8-03 |
| HR-FR-P8-04 | HC-P8 | `parseExternalSecurityFilter` | HU-PILLAR-P8-04 |
| HR-FR-P9-01 | HC-P9 | `checkProjectionConvergence` | HU-PILLAR-P9-01 |
| HR-FR-P9-02 | HC-P9 | `classifyContractChange` | HU-PILLAR-P9-02 |
| HR-FR-P9-03 | HC-P9 | `queryLayerRegressionImpact` | HU-PILLAR-P9-03 |
| HR-NFR-P3-01 | HC-P3 | `classifyVerificationEvidenceProfile` | HU-PILLAR-N3-01 |
| HR-NFR-P3-02 | HC-P3 | `classifyVerificationEvidenceProfile` | HU-PILLAR-N3-02 |
| HR-NFR-P3-03 | HC-P9 | `queryLayerRegressionImpact` | HU-PILLAR-N3-03 |
| HR-NFR-P3-04 | HC-P3 | `validateTddOracle` | HU-PILLAR-N3-04 |
| HR-NFR-P5-01 | HC-P1 | `mergeAnchoredHandover` | HU-PILLAR-N5-01 |
| HR-NFR-P5-02 | HC-P1 | `mergeAnchoredHandover` | HU-PILLAR-N5-02 |
| HR-NFR-P5-03 | HC-P3 | `selectVerificationProfile` | HU-PILLAR-N5-03 |
| HR-NFR-P8-01 | HC-P8 | `requireActionBindingApproval` | HU-PILLAR-N8-01 |
| HR-NFR-P8-02 | HC-P8 | `parseExternalSecurityFilter` | HU-PILLAR-N8-02 |
| HR-NFR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | HU-PILLAR-N8-03 |
| HR-NFR-AC-01 | HC-AC | `validateAdapterParityMap` | HU-PILLAR-NAC-01 |
| HR-NFR-AC-02 | HC-AC | `requireHostedSurfacePreflight` | HU-PILLAR-NAC-02 |
| HR-NFR-AC-03 | HC-AC | `registerDeferredSurface` / `validateAdapterParityMap` | HU-PILLAR-NAC-03 |

## §3.1 upstream runtime-hardening adoption

上流 `PLAN-L7-190` / `PLAN-L7-196` の具体化は、HELIX では以下の L6 contract として扱う。

| Upstream | HELIX L6 contract | Required behavior | Oracle |
|----------|-------------------|-------------------|--------|
| PLAN-L7-190 | `projectRuntimeAdapterAssets` | consumer clean distribution に Claude subagent roster、Claude slash commands、Codex hook/config template を含め、dogfood `.claude/` / `.codex/` / `.ut-tdd/` state、design/plans/web assets を除外する。rollback/readiness metadata は expanded managed path set を返す | HU-PILLAR-DIST-01 |
| PLAN-L7-196 SEC-3 | `validateRuntimeConfigHardening` | `max_parallel` は default 8 互換を保ちつつ `MAX_TEAM_PARALLEL=8` 超過を reject する。過大並列は resource exhaustion risk として fail-close | HU-PILLAR-CONFIG-01 |
| PLAN-L7-196 SEC-4 | `validateRuntimeConfigHardening` | consumer template は standard Claude Code `Task` matcher と環境差 `Agent` を区別して guard 発火を証明する。dogfood matcher は現行互換のため無理に変更しない | HU-PILLAR-CONFIG-01 |

## §4 logging and maintainability

L6 function は pass/fail の boolean だけを返さない。保守時に原因を追えるよう、各 family は以下を返す:

- normalized input summary: secret/body を含まない contract input の要約。
- decision kind: `allow` / `deny` / `defer` / `blocker` / `human_required`。
- failing invariant: `missing_forward_return`、`coverage_only_pass`、`projection_unconverged` など stable code。
- evidence refs: runtime log、projection row、review evidence、handover note の path/key。

Runtime behavior を主張する function は `upstream-substance-gap.md` §5 の `RuntimeVerificationLogEvent` と結合できる
`correlation_id` を持つ。projection は補助であり、acceptance source of truth は runtime log event または
review evidence に残す。

### §4.0 pair-agent TDD verification basis

`buildPairAgentTddPlan` は pair programming を「2 agent が同時に触る」ではなく、TDD の順序契約として扱う。
smart review agent は test/oracle を先に作り、light implementation agent はその Red evidence を満たす最小実装だけを行い、
smart review agent が test/review/verdict を閉じる。根拠は以下の外部確認済み方針に合わせる。

- TDD は test case list から Red / Green / Refactor を反復し、実装前に失敗する test/oracle を置く。
  Source: Martin Fowler, "Test Driven Development" (https://martinfowler.com/bliki/TestDrivenDevelopment.html), checked 2026-07-01.
- secure development は code review / analysis / testing の issue と remediation を workflow へ記録する。
  Source: NIST SP 800-218 SSDF v1.1 (https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf), checked 2026-07-01.
- merge/push 側の最終 gate は required checks を待つため、pair-agent の local verdict は CI/merge queue の代替ではなく事前証跡である。
  Source: GitHub Docs, "Managing a merge queue" (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), checked 2026-07-01.

## §4.1 telemetry provenance source map

上流 `PLAN-L7-192` / `193` / `199` / `200` / `201` は、projection-only telemetry を拒否するだけでなく、
どの runtime source がどの DB table の evidence になれるかを固定している。HELIX では以下を L6 contract とする。

| Projection table | Runtime source accepted as provenance | Rejected as runtime evidence | L6 function / oracle |
|------------------|---------------------------------------|------------------------------|----------------------|
| `test_runs` | `.ut-tdd/logs/session/*.jsonl` の sanitized verification `tool_use` (`Bash (vitest)` / `Bash (test)` / `Bash (tsc)` / `Bash (doctor)` / `Bash (lint)` / `Bash (eslint)`)。非空 `session_id`、`runtime=hook-session-log`、`scope=runtime-hook` を持つ | review-evidence projection only、generic Bash、hash restamp only | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-01 |
| `model_runs` | Claude/Codex runtime JSONL token telemetry を `loadRuntimeSessionUsage` / token projection で読んだ non-empty token/cost row | deterministic rebuild projection only、provider launch claim without JSONL evidence | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-02 |
| `guardrail_decisions` | session-log `forced_stop` event。`guardrail=forced-stop`、`decision=block`、`mode=runtime-hook`、非空 `session_id` | ordinary tool_use、issue approval projection only | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-03 |
| `skill_invocations` | durable `Bash (skill)` session event、特に skill suggestion command。`source=runtime-hook:skill-suggest` と非空 `session_id` を持つ | generic Bash、review-evidence projection only、skill mention in prose | `classifyVerificationEvidenceProfile` / HU-PILLAR-PROV-04 |

Enforcement rule: `fired` / `used` / `works` / `executed` claim は、上表の source に一致しない telemetry row では
close できない。projection-only row は relation/impact の補助には使えるが、acceptance source にはならない。

## §5 carry

- L7: 本書の 30 function contract を TS/Bun 実装へ分割する。既存 Route-B 実装がある P2/P7 は再実装ではなく adapter/family へ接続する。
- L7.5: `works` / `used` / `fired` claim を持つ P2/P3/P6/P7/P8/P9/AC は RUN & Debug evidence を要求する。
- L8/L9/L12: 本書の `HU-PILLAR-*` は L5/L4/L3 test-design の `LIT-*` / `HST-*` / `HAT-*` に逆参照される。
