---
title: "HELIX L6 機能設計 — 旧 HELIX 拡張採用"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l5: docs/design/helix/L5-detail/legacy-helix-extension.md
---

# HELIX L6 機能設計 — 旧 HELIX 拡張採用

旧 HELIX 由来の採用候補を、TS/Bun 実装可能な function contract へ降ろす。

## §1 function 契約

| L5 契約 | function | signature | DbC | oracle |
|-------------|----------|-----------|-----|--------|
| HLX-C01 | `buildWorkPreflightDecision` | `(input: WorkPreflightInput) => WorkPreflightDecision` | objective、workflow/layer、Forward return、acceptance/verification、work source、allowed scope を必須にする。handover/PLAN と矛盾する scope は `blocker` | U-HLX-001 |
| HLX-C02 | `classifyTechnicalQuestion` | `(input: QuestionGateInput) => TechnicalQuestionDecision` | design/contract/structure/placement/migration/security を technical question と分類し、recent TL advisor evidence が無ければ `deny`。preference-only は reason 付き `bypass_allowed` | U-HLX-002 |
| HLX-C03 | `registerDetectorAxis` | `(descriptor: DetectorAxisDescriptor) => DetectorAxisRegistration` | axis id、phase gate、kind、severity、workflow route を必須にし、unknown axis は auto route しない | U-HLX-003 |
| HLX-C03 | `routeDetectorFinding` | `(finding: DetectorFinding, registry: DetectorAxisRegistry) => DetectorRouteDecision` | stub/advisory/fail-close を区別し、stub/advisory を hard gate proof に使わない | U-HLX-004 |
| HLX-C04 | `buildRecommendationDecision` | `(input: RecommendationInput) => RecommendationDecision` | skill/code/command candidate は score/reason/references/recommended role を持つ。legacy runtime path は `harden_required` または `defer` | U-HLX-005 |
| HLX-C05 | `analyzeRunDebugTrace` | `(input: RunDebugTraceInput) => RunDebugTraceDecision` | expected action、observed evidence、missing action、runtime surface、correlation id、evidence path を返す。missing action がある場合は acceptance source にしない | U-HLX-006 |
| HLX-C06 | `buildCoreInjectionContract` | `(input: CoreInjectionInput) => CoreInjectionDecision` | repo-local source、generated target、consumer mode、required marker、provenance を必須にし、personal absolute path と global-file-only reference を `reject` | U-HLX-007 |
| HLX-C07 | `classifyLegacyHookSurface` | `(input: LegacyHookSurfaceInput) => GuardSurfaceDisposition` | hook source、runtime surface、tool matcher、guard intent、parity target、test oracle を分類し、unsupported/unwired を `deferred` または `rejected` にする | U-HLX-008 |
| HLX-C08 | `buildAgentRolePolicyDecision` | `(input: AgentRolePolicyInput) => AgentRolePolicyDecision` | role kind、model family、slot、delegation boundary、review substitute を必須にし、self-review / overpowered / unbounded delegation を deny/escalate | U-HLX-009 |
| HLX-C09 | `mapWorkflowInventoryToPillar` | `(input: WorkflowInventoryInput) => WorkflowMappingDecision` | workflow doc を pillar、workflow mode、gate、current disposition に接続し、unknown workflow は `new_plan_required` | U-HLX-010 |
| HLX-C10 | `classifyLegacyDbSurface` | `(input: LegacyDataSurfaceInput) => DataSurfaceDecision` | legacy DB/registry/API を state kind、harness.db target、read model、API boundary、provenance に分類し、raw state import を reject | U-HLX-011 |
| HLX-C11 | `buildContinuousRunControlDecision` | `(input: ContinuousRunInput) => ContinuousRunDecision` | trigger、queue lock、timebox、budget profile、stop condition、verification evidence を必須にし、stop condition なしの auto-run を deny | U-HLX-012 |
| HLX-C12 | `buildLearningFeedbackDecision` | `(input: LearningFeedbackInput) => LearningFeedbackDecision` | feedback event、recipe source、learning result、target backlog、evidence link、review state を必須にし、learning-only acceptance close を reject | U-HLX-013 |

## §2 type 概略

```ts
type WorkPreflightKind = "allow" | "blocker" | "escalate" | "new_plan_required";
type TechnicalQuestionKind = "allow" | "deny" | "bypass_allowed";
type DetectorResultKind = "stub" | "advisory" | "fail_close";
type RecommendationKind = "adopt_candidate" | "harden_required" | "defer" | "reject";
type RunDebugTraceKind = "complete" | "incomplete" | "blocked";
type AdoptionDisposition = "existing_pillar_covered" | "adopt" | "harden_required" | "defer" | "reject" | "new_plan_required";
type GuardSurfaceState = "wired" | "deferred" | "rejected";
type PolicyDecisionKind = "allow" | "deny" | "escalate";
type RuntimeSurface = "claude-hook" | "codex-hook" | "codex-hosted-api" | "ut-tdd-cli" | "external-api";

interface RunDebugTraceDecision {
  kind: RunDebugTraceKind;
  matched_actions: string[];
  missing_actions: string[];
  runtime_surface: RuntimeSurface | "";
  correlation_id: string;
  evidence_path: string;
}

interface CoreInjectionDecision {
  disposition: AdoptionDisposition;
  repo_local_source: string;
  generated_target: string;
  consumer_mode: string;
  required_marker: string;
  provenance: string;
  rejected_assumption?: string;
}

interface GuardSurfaceDisposition {
  state: GuardSurfaceState;
  runtime_surface: RuntimeSurface;
  guard_intent: string;
  reason: string;
  oracle: string;
}
```

## §3 L3 -> L6 trace

| L3 ID | L5 | L6 function | oracle |
|-------|----|-------------|--------|
| HLX-FR-01 | HLX-C01 | `buildWorkPreflightDecision` | U-HLX-001 |
| HLX-FR-02 | HLX-C02 | `classifyTechnicalQuestion` | U-HLX-002 |
| HLX-FR-03 | HLX-C03 | 検出器軸登録 `registerDetectorAxis` / finding 経路判定 `routeDetectorFinding` | U-HLX-003 / U-HLX-004 |
| HLX-FR-04 | HLX-C04 | `buildRecommendationDecision` | U-HLX-005 |
| HLX-FR-05 | HLX-C05 | `analyzeRunDebugTrace` | U-HLX-006 |
| HLX-FR-06 | HLX-C06 | `buildCoreInjectionContract` | U-HLX-007 |
| HLX-FR-07 | HLX-C07 | `classifyLegacyHookSurface` | U-HLX-008 |
| HLX-FR-08 | HLX-C08 | `buildAgentRolePolicyDecision` | U-HLX-009 |
| HLX-FR-09 | HLX-C09 | `mapWorkflowInventoryToPillar` | U-HLX-010 |
| HLX-FR-10 | HLX-C10 | `classifyLegacyDbSurface` | U-HLX-011 |
| HLX-FR-11 | HLX-C11 | `buildContinuousRunControlDecision` | U-HLX-012 |
| HLX-FR-12 | HLX-C12 | `buildLearningFeedbackDecision` | U-HLX-013 |

## §4 source 対応

| Legacy source | L6 adoption |
|---------------|-------------|
| `helix/HELIX_RUNTIME_RULES.md` | `buildWorkPreflightDecision` の required fields と blocker 条件 |
| `helix/CLAUDE_RUNTIME_ADAPTER.md` / `pretooluse-askuserquestion.sh` | `classifyTechnicalQuestion` の TL advisor evidence rule |
| `cli/lib/detectors/registry.py` / `axis_*.py` | `DetectorAxisDescriptor` と `DetectorRouteDecision` |
| `cli/lib/skill_recommender.py` / `code_recommender.py` / `command_catalog.py` | `RecommendationDecision` の traceable candidate contract |
| `cli/helix-debug` / `cli/helix-test-debug` | `RunDebugTraceDecision` と L7.5 RUN & Debug evidence |
| `helix/core-manifest.tsv` / `helix/HELIX_CORE.md` / `helix/CLAUDE_RUNTIME_ADAPTER.md` / `helix/CODEX_RUNTIME_ADAPTER.md` | `CoreInjectionDecision` の distribution/provenance boundary |
| `.claude/settings.json` / `.claude/hooks/*` | `GuardSurfaceDisposition` の hook/guard surface inventory |
| `.claude/agents/*.md` / `cli/roles/*.conf` / `cli/lib/agent_slots.py` / `cli/lib/agent_policy_guard.py` | `AgentRolePolicyDecision` の role/model/slot boundary |
| `HELIX-workflows/helix-process/*.md` | `WorkflowMappingDecision` の pillar/workflow/gate map |
| `cli/lib/helix_db.py` / `cli/lib/plan_registry.py` / `cli/lib/command_catalog.py` / `cli/lib/skill_catalog.py` / `cli/lib/http_api/routes/*.py` | `DataSurfaceDecision` の harness.db/read-model/API boundary |
| `cli/helix-auto-run` / `cli/helix-heartbeat-scheduler` / `cli/lib/job_queue_helper.py` / `cli/lib/scheduler_helper.py` / `cli/lib/budget*.py` | `ContinuousRunDecision` の loop/job/budget control |
| `cli/lib/learning_engine.py` / `cli/lib/feedback_hook.py` / `HELIX-workflows/helix-process/learning-engine.md` | `LearningFeedbackDecision` の improvement/recipe boundary |

## §5 carry

- L7: 旧 Python/Bash を移植せず、TS/Bun module と既存 harness DB projection へ接続する。
- L7.5: `analyzeRunDebugTrace` は `RuntimeVerificationLogEvent` の `correlation_id` と結合する。
- Rename: `helix` CLI / `.helix` state の機械改名は `PLAN-M-02` まで defer。prose だけを先行して HELIX へ寄せる。
