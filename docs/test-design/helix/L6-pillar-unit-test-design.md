---
title: "HELIX L7 単体テスト設計 — pillar HC function contracts"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: QA + AIM
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/design/helix/L6-function-design/pillar-function-design.md
related_l6: docs/design/helix/L6-function-design/pillar-function-design.md
next_pair_freeze: L6
---

# HELIX L7 単体テスト設計 — pillar HC function contracts

本書は `pillar-function-design.md` の pair test-design である。L5 `HC-*` contract を L6 function contract
として実装する際、各 `HU-PILLAR-*` が Red/Green の単体 oracle になる。

## §0 量閉じ

- 対象 L6 function family: 10 件。
- 対象 L3 要件: 43 件。
- L7 unit oracle: `HU-PILLAR-*` 43 件。
- 孤児: 0。詳細は §1 trace。

## §1 unit oracle trace

| Oracle | L3 | HC | Target function | Expected behavior |
|--------|----|----|-----------------|-------------------|
| HU-PILLAR-P0-01 | HR-FR-P0-01 | HC-P0 | `decideForwardReturn` | return/gap/version target のいずれも無い completion claim を reject |
| HU-PILLAR-P0-02 | HR-FR-P0-02 | HC-P0 | `recordStopReasonEvidence` | cap/lock/Recovery stop reason を evidence に残し、空 reason を blocker 化 |
| HU-PILLAR-P1-01 | HR-FR-P1-01 | HC-P1 | `evaluateAutonomyResume` | resume 3 条件、job availability、budget、handover next_action が揃う時だけ dispatch |
| HU-PILLAR-P1-02 | HR-FR-P1-02 | HC-P1 | `planVersionUpgradeDryRun` | migration/rollback/idempotency 欠落を dry-run fail にする |
| HU-PILLAR-P1-03 | HR-FR-P1-03 | HC-P1 | `evaluateAutonomyResume` | large request slice が Forward return、budget、acceptance を持たなければ dispatch しない |
| HU-PILLAR-P1-04 | HR-FR-P1-04 | HC-P1 | `selectL2TemplatePack` | L2 skip 時も template pack と defer/back-propagation record を返す |
| HU-PILLAR-P2-01 | HR-FR-P2-01 | HC-P2 | `validateToolContractSurface` | registered schema は allow、unknown surface は deny/defer |
| HU-PILLAR-P2-02 | HR-FR-P2-02 | HC-P2 | `tickLoopEffortBudget` | over-budget loop が same worker continue/pass を返さない |
| HU-PILLAR-P2-03 | HR-FR-P2-03 | HC-AC | `validateAdapterParityMap` / `requireHostedSurfacePreflight` | hook-covered surface と hosted preflight-only surface を分離 |
| HU-PILLAR-P2-04 | HR-FR-P2-04 | HC-P2 | `writeLoopTraceSpan` / `selectWorkflowComplexity` | PLAN/tool/handoff/guardrail/eval span を残し、simple workflow を既定にする |
| HU-PILLAR-P3-01 | HR-FR-P3-01 | HC-P3 | `validatePairClosure` | pair 欠落と coverage-only pass を reject |
| HU-PILLAR-P3-02 | HR-FR-P3-02 | HC-P3 | `validateExternalGrounding` | URL/version/span と separate verifier evidence 欠落を reject |
| HU-PILLAR-P4-01 | HR-FR-P4-01 | HC-P4 | `routeRepairFinding` | repair candidate に owner/route/rollback/risk を必須にする |
| HU-PILLAR-P4-02 | HR-FR-P4-02 | HC-P4 | `promoteRepairRecipe` | successful repair を memory/backlog candidate に変換 |
| HU-PILLAR-P4-03 | HR-FR-P4-03 | HC-P4 | `projectMetricImprovementSignal` | review/rework/test duration/flake/regression metric を improvement signal にする |
| HU-PILLAR-P6-01 | HR-FR-P6-01 | HC-P6 | `buildDistributionPlan` | rulesets/checks/merge queue/bypass audit を dry-run plan に出す |
| HU-PILLAR-P6-02 | HR-FR-P6-02 | HC-P6 | `validatePrReviewRoute` / `gateCiAutoFixRepush` | worker!=verifier と confidence/iteration cap を強制 |
| HU-PILLAR-P6-03 | HR-FR-P6-03 | HC-P6 | `buildDistributionPlan` | fresh/brownfield setup は managed diff/import report を出し既存を壊さない |
| HU-PILLAR-P6-04 | HR-FR-P6-04 | HC-P6 | `planVersionUpgradeDryRun` | tag bump に rollback/destructive block/idempotency evidence を要求 |
| HU-PILLAR-P6-05 | HR-FR-P6-05 | HC-P6 | `planReleaseAutomationDecision` / `gateCiAutoFixRepush` | release ADR 欠落と confidence<0.75 repush を reject |
| HU-PILLAR-P7-01 | HR-FR-P7-01 | HC-P7 | `buildBoundedRecallPacket` | Claude/Codex が shared provider memory から bounded recall する |
| HU-PILLAR-P7-02 | HR-FR-P7-02 | HC-P7 | `detectGlossaryDrift` | rename/synonym drift に old/new/supersedes/context を要求 |
| HU-PILLAR-P7-03 | HR-FR-P7-03 | HC-P7 | `validateContextMapBoundary` | context-crossing call は anti-corruption boundary または translation rule を要求 |
| HU-PILLAR-P8-01 | HR-FR-P8-01 | HC-P8 | `validateSourceAttribution` | source URL/version/span 欠落を unverified にする |
| HU-PILLAR-P8-02 | HR-FR-P8-02 | HC-P8 | `validateSourceAttribution` | skillify candidate は license/safety/scope review 欠落で registry reject |
| HU-PILLAR-P8-03 | HR-FR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | external action に sandbox/token/approval を要求 |
| HU-PILLAR-P8-04 | HR-FR-P8-04 | HC-P8 | `parseExternalSecurityFilter` | raw/metadata/trusted extraction/instruction を分離 |
| HU-PILLAR-P9-01 | HR-FR-P9-01 | HC-P9 | `checkProjectionConvergence` | projection 未収束 artifact を complete 扱いにしない |
| HU-PILLAR-P9-02 | HR-FR-P9-02 | HC-P9 | `classifyContractChange` | relation graph/contract ledger に breaking/compatible/migration-needed を要求 |
| HU-PILLAR-P9-03 | HR-FR-P9-03 | HC-P9 | `queryLayerRegressionImpact` | layer baseline/gate/metric/owner 欠落を blocker にする |
| HU-PILLAR-N3-01 | HR-NFR-P3-01 | HC-P3 | `classifyVerificationEvidenceProfile` | green command/review tier/external grounding を区別 |
| HU-PILLAR-N3-02 | HR-NFR-P3-02 | HC-P3 | `classifyVerificationEvidenceProfile` | design/AC/code/test/review finding の対応欠落を reject |
| HU-PILLAR-N3-03 | HR-NFR-P3-03 | HC-P9 | `queryLayerRegressionImpact` | affected layer の gate/test/doctor 未実行を blocker にする |
| HU-PILLAR-N3-04 | HR-NFR-P3-04 | HC-P3 | `validateTddOracle` | Red/oracle/Green/refactor または substitute oracle を要求 |
| HU-PILLAR-N5-01 | HR-NFR-P5-01 | HC-P1 | `mergeAnchoredHandover` | verbatim/summary/stable constraints と raw evidence pointer を分離 |
| HU-PILLAR-N5-02 | HR-NFR-P5-02 | HC-P1 | `mergeAnchoredHandover` | fixed section merge が Next Action/artifact trail を落とさない |
| HU-PILLAR-N5-03 | HR-NFR-P5-03 | HC-P3 | `selectVerificationProfile` | fast<=120s/default<=600s/full<=1800s、timeout、p95 duration budget、worker count を持つ |
| HU-PILLAR-N8-01 | HR-NFR-P8-01 | HC-P8 | `requireActionBindingApproval` | high-impact action は matching approval 無しに deny |
| HU-PILLAR-N8-02 | HR-NFR-P8-02 | HC-P8 | `parseExternalSecurityFilter` | prompt/tool injection と exfiltration を classify し deny/review/redaction へ送る |
| HU-PILLAR-N8-03 | HR-NFR-P8-03 | HC-P8 | `selectSandboxTokenPolicy` / `requireActionBindingApproval` | agentic AI escalation に least privilege/rollback/monitoring/risk owner を要求 |
| HU-PILLAR-NAC-01 | HR-NFR-AC-01 | HC-AC | `validateAdapterParityMap` | adapter/template/skill/runtime rule drift を drift として返す |
| HU-PILLAR-NAC-02 | HR-NFR-AC-02 | HC-AC | `requireHostedSurfacePreflight` | hosted/API edit は hook non-enforcement、git status、target path evidence 欠落で reject |
| HU-PILLAR-NAC-03 | HR-NFR-AC-03 | HC-AC | `registerDeferredSurface` / `validateAdapterParityMap` | PLAN/CLI/harness DB/dry-run path を SSoT にし、provider API direct path を required にしない |

## §1.1 upstream hardening and provenance oracles

| Oracle | Upstream | HC | Target function | Expected behavior |
|--------|----------|----|-----------------|-------------------|
| HU-PILLAR-DIST-01 | PLAN-L7-190 | HC-P6 | `projectRuntimeAdapterAssets` | consumer package includes `.claude/agents`, `.claude/commands`, `.codex/hooks.json`, `.codex/config.toml`; excludes dogfood `.claude/`, `.codex/`, `.ut-tdd/`, design, plan, and web runtime state; rollback metadata lists managed runtime assets |
| HU-PILLAR-CONFIG-01 | PLAN-L7-196 | HC-AC | `validateRuntimeConfigHardening` | `max_parallel===MAX_TEAM_PARALLEL` is accepted, `max_parallel>MAX_TEAM_PARALLEL` is rejected, consumer matcher matrix covers standard `Task` and environment-specific `Agent` without changing dogfood matcher |
| HU-PILLAR-PROV-01 | PLAN-L7-193 | HC-P3 | `classifyVerificationEvidenceProfile` | `test_runs` runtime evidence must come from sanitized session-log verification Bash events with non-empty `session_id`; generic Bash and review projection do not close works/fired/used |
| HU-PILLAR-PROV-02 | PLAN-L7-199 | HC-P3 | `classifyVerificationEvidenceProfile` | `model_runs` runtime provenance requires Claude/Codex JSONL token telemetry; deterministic rebuild projection is trace-support only |
| HU-PILLAR-PROV-03 | PLAN-L7-200 | HC-P3 | `classifyVerificationEvidenceProfile` | `guardrail_decisions` runtime provenance requires `forced_stop` session events with `guardrail=forced-stop` and non-empty `session_id`; ordinary tool_use does not fabricate guardrail evidence |
| HU-PILLAR-PROV-04 | PLAN-L7-201 | HC-P3 | `classifyVerificationEvidenceProfile` | `skill_invocations` runtime provenance requires durable `Bash (skill)` session events with `source=runtime-hook:skill-suggest`; prose mention or generic Bash is rejected |

## §2 family-level negative tests

| Family | Negative oracle |
|--------|-----------------|
| HC-P0 | completion claim without Forward return, gap-only, or version target returns `blocker` |
| HC-P1 | stale lock, missing next_action, or budget overrun returns `idle` / `handover` / `blocker`, never `dispatch` |
| HC-P2 | unknown surface and over-budget loop cannot produce pass evidence |
| HC-P3 | projection-only telemetry cannot close `works` / `fired` / `used` claims |
| HC-P4 | destructive repair without approval returns `human_required` |
| HC-P6 | GitHub rules/apply plan is emit-only unless approval evidence is action-bound |
| HC-P7 | per-agent memory silo is not accepted as shared SSoT |
| HC-P8 | untrusted external text is never copied into executable instruction fields |
| HC-P9 | stale projection or missing layer gate keeps `ConvergenceStatus` non-green |
| HC-AC | Codex hosted/API surface cannot be classified as hook-covered without preflight evidence |

## §3 verification strategy

Unit tests prove function-level DbC. Runtime behavior claims still require L7.5 RUN & Debug evidence:

- `HU-PILLAR-P2-*`, `HU-PILLAR-P6-*`, `HU-PILLAR-P7-*`, `HU-PILLAR-P8-*`, `HU-PILLAR-P9-*`, and `HU-PILLAR-NAC-*`
  must attach runtime/projection/review evidence refs according to the function output.
- `works` / `used` / `fired` acceptance requires real `session_id`, `source`, runtime surface, timestamp,
  correlation id, and evidence path.
- projection-only rows remain trace-support evidence and cannot close runtime acceptance by themselves.
