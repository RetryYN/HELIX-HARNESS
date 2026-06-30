---
title: "HELIX L5 詳細設計 — pillar FR/NFR detail design"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-28
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/L5-pillar-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
next_pair_freeze: L8
---

# HELIX L5 詳細設計 — pillar FR/NFR detail design

> 本書は L4 `pillar-basic-design.md` の 10 block / 43 要件を L5 詳細設計へ降下する add-design 正本である。
> 既存 harness L5 4 sub-doc は置換せず、HELIX 名前空間の contract / projection / adapter 境界を追加する。

## §0 量閉じ

- 入力 L4: `HB-*` 10 block、`HR-FR` 30 件 + `HR-NFR` 13 件 = 43 件。
- L5 detailed contract: 10 件 (`HC-P0` / `HC-P1` / `HC-P2` / `HC-P3` / `HC-P4` / `HC-P6` / `HC-P7` / `HC-P8` / `HC-P9` / `HC-AC`)。
- L8 integration test design: `LIT-*` 43 件。
- Route-B back-fill L3 要件 8 件は本 pillar detail の 43 件へ二重計上しない。該当契約は L6 `orchestration-memory.md` と Reverse back-fill 側で関数境界へ降下し、本書では HC-P1 / HC-P2 / HC-P3 / HC-P7 / HC-AC の contract matrix に取り込む。
- 孤児: 0。詳細は §2 trace。
- L1 §2.8 asset/progress visualization amendment は `PLAN-DISCOVERY-10` S4 decision 待ちである。
  `PLAN-L7-206` の `VisualizationSnapshot` は先行 read-model response であり、本 L5 10 contract / 43
  `LIT-*` の完了範囲に VSCode View/Webview contract を追加した扱いにはしない。

## §1 L5 detailed contract

| Contract | 対応 L4 block | L5 詳細境界 | Integration boundary |
|----------|---------------|-------------|----------------------|
| HC-P0 forward-return-contract | HB-P0 | workflow PLAN / gate result / stop reason を Forward 返却契約として正規化する | planner -> gate -> handover |
| HC-P1 autonomous-work-contract | HB-P1 | scheduler / job / budget / version target / L2 template pack の詳細 contract を定義する | scheduler -> job queue -> handover |
| HC-P2 agent-loop-contract | HB-P2 | tool registry / effort budget / provider route / trace span の D-CONTRACT を定義する | runtime adapter -> trace DB |
| HC-P3 verification-contract | HB-P3 | pair closure / external grounding / evidence profile / TDD oracle の gate contract を定義する | design/test docs -> review evidence |
| HC-P4 repair-feedback-contract | HB-P4 | detector event を repair candidate / recipe / metric event へ変換する projection contract を定義する | findings -> feedback events |
| HC-P6 distribution-contract | HB-P6 | GitHub rules / PR review / setup / release dry-run の非破壊適用 contract を定義する | setup/release planner -> GitHub plan |
| HC-P7 knowledge-contract | HB-P7 | shared memory / glossary / context map の bounded recall と drift detection contract を定義する | memory -> glossary/context map |
| HC-P8 security-boundary-contract | HB-P8 | external research / sandbox / token / security filter の trust-boundary contract を定義する | external input -> security audit |
| HC-P9 convergence-db-contract | HB-P9 | projection convergence / relation graph / contract ledger / layer baseline の DB contract を定義する | harness.db projections -> doctor |
| HC-AC adapter-consistency-contract | HB-AC | Claude/Codex/hosted API surface の rule-drift と preflight audit contract を定義する | adapter rules -> preflight audit |

## §2 L4 -> L5 -> L8 trace

| L3 ID | L4 block | L5 contract | L8 test |
|-------|----------|-------------|---------|
| HR-FR-P0-01 | HB-P0 | HC-P0 | LIT-P0-01 |
| HR-FR-P0-02 | HB-P0 | HC-P0 | LIT-P0-02 |
| HR-FR-P1-01 | HB-P1 | HC-P1 | LIT-P1-01 |
| HR-FR-P1-02 | HB-P1 | HC-P1 | LIT-P1-02 |
| HR-FR-P1-03 | HB-P1 | HC-P1 | LIT-P1-03 |
| HR-FR-P1-04 | HB-P1 | HC-P1 | LIT-P1-04 |
| HR-FR-P2-01 | HB-P2 | HC-P2 | LIT-P2-01 |
| HR-FR-P2-02 | HB-P2 | HC-P2 | LIT-P2-02 |
| HR-FR-P2-03 | HB-AC | HC-AC | LIT-P2-03 |
| HR-FR-P2-04 | HB-P2 | HC-P2 | LIT-P2-04 |
| HR-FR-P3-01 | HB-P3 | HC-P3 | LIT-P3-01 |
| HR-FR-P3-02 | HB-P3 | HC-P3 | LIT-P3-02 |
| HR-FR-P4-01 | HB-P4 | HC-P4 | LIT-P4-01 |
| HR-FR-P4-02 | HB-P4 | HC-P4 | LIT-P4-02 |
| HR-FR-P4-03 | HB-P4 | HC-P4 | LIT-P4-03 |
| HR-FR-P6-01 | HB-P6 | HC-P6 | LIT-P6-01 |
| HR-FR-P6-02 | HB-P6 | HC-P6 | LIT-P6-02 |
| HR-FR-P6-03 | HB-P6 | HC-P6 | LIT-P6-03 |
| HR-FR-P6-04 | HB-P6 | HC-P6 | LIT-P6-04 |
| HR-FR-P6-05 | HB-P6 | HC-P6 | LIT-P6-05 |
| HR-FR-P7-01 | HB-P7 | HC-P7 | LIT-P7-01 |
| HR-FR-P7-02 | HB-P7 | HC-P7 | LIT-P7-02 |
| HR-FR-P7-03 | HB-P7 | HC-P7 | LIT-P7-03 |
| HR-FR-P8-01 | HB-P8 | HC-P8 | LIT-P8-01 |
| HR-FR-P8-02 | HB-P8 | HC-P8 | LIT-P8-02 |
| HR-FR-P8-03 | HB-P8 | HC-P8 | LIT-P8-03 |
| HR-FR-P8-04 | HB-P8 | HC-P8 | LIT-P8-04 |
| HR-FR-P9-01 | HB-P9 | HC-P9 | LIT-P9-01 |
| HR-FR-P9-02 | HB-P9 | HC-P9 | LIT-P9-02 |
| HR-FR-P9-03 | HB-P9 | HC-P9 | LIT-P9-03 |
| HR-NFR-P3-01 | HB-P3 | HC-P3 | LIT-N3-01 |
| HR-NFR-P3-02 | HB-P3 | HC-P3 | LIT-N3-02 |
| HR-NFR-P3-03 | HB-P9 | HC-P9 | LIT-N3-03 |
| HR-NFR-P3-04 | HB-P3 | HC-P3 | LIT-N3-04 |
| HR-NFR-P5-01 | HB-P1 | HC-P1 | LIT-N5-01 |
| HR-NFR-P5-02 | HB-P1 | HC-P1 | LIT-N5-02 |
| HR-NFR-P5-03 | HB-P3 | HC-P3 | LIT-N5-03 |
| HR-NFR-P8-01 | HB-P8 | HC-P8 | LIT-N8-01 |
| HR-NFR-P8-02 | HB-P8 | HC-P8 | LIT-N8-02 |
| HR-NFR-P8-03 | HB-P8 | HC-P8 | LIT-N8-03 |
| HR-NFR-AC-01 | HB-AC | HC-AC | LIT-NAC-01 |
| HR-NFR-AC-02 | HB-AC | HC-AC | LIT-NAC-02 |
| HR-NFR-AC-03 | HB-AC | HC-AC | LIT-NAC-03 |

## §2.1 Route-B back-fill contract boundary

Route-B back-fill 8 件は §2 の `LIT-*` 43 件へ二重採番しない。ただし L5 contract の責務から外さず、
既存 `HC-*` contract の fail-close / projection / output 境界へ接続する。

| Route-B L3 ID | L4 block boundary | L5 contract boundary | L5 で固定する contract 判断 |
|---------------|-------------------|----------------------|------------------------------|
| HR-BR-07 | HB-P2 | HC-P2 | `LoopDispatchDecision` は canResume/evaluateStop/classifyRecovery を安全側に解釈する |
| HR-BR-12 | HB-P7 | HC-P7 | `BoundedRecallPacket` / memory contract は supersede と harness/project layer を保持する |
| HR-NFR-03 | HB-P3 / HB-P7 | HC-P3 / HC-P7 | `VerificationEvidenceProfile` は worker 自己 pass を拒否し、memory contract は secret body を保存しない |
| HR-BR-07R | HB-P2 | HC-P2 | tick runtime は cross-runtime verifier 不在時に same-runtime pass へ落とさない |
| HR-BR-12R | HB-P7 | HC-P7 | memory persistence は shared SSoT、append-only、secret reject を module contract にする |
| HR-NFR-03R | HB-P1 | HC-P1 | job claim は continuous autonomy の scheduler contract として二重取得を防ぐ |
| HR-BR-13R | HB-P2 / HB-AC | HC-P2 / HC-AC | runtime bridge は provider 選定を再実装せず adapter parity / preflight contract に従う |
| HR-BR-14R | HB-P1 / HB-P2 | HC-P1 / HC-P2 | loop CLI は scheduler state と tick contract を結合し、dry-run と dispatch を分離する |

## §3 L5 contract matrix

L5 は L4 block の名前を移すだけではなく、L8 で結合観測できる **module contract** を固定する。各
`HC-*` は「入力」「正規化 state/projection」「出力」「fail-close 条件」「L6 へ降ろす関数境界」を持つ。
旧 HELIX は read-only 設計ソースとして参照し、runtime / Python / bash / `.helix` state は取り込まない。

| Contract | Required inputs | State / projection boundary | Contract output | Fail-close / block condition | L6 carry |
|----------|-----------------|-----------------------------|-----------------|------------------------------|----------|
| HC-P0 forward-return-contract | PLAN `kind` / `workflow_phase` / `forward_return` / `gap-only` / `version_target` / stop reason | `plan_registry` + `workflow_runs` + `gate_runs` + handover stop reason | `ForwardReturnDecision` (`return_to` / `defer_to_version` / `gap_only` / `blocked_reason`) | workflow completion claim without return/defer/gap target, archived or missing return target, stop reason dropped from handover | forward-return validator, stop-reason normalizer |
| HC-P1 autonomous-work-contract | job candidate, resume 3 predicates, budget window, iteration cap, context threshold, L2 template availability, release/tag target | `jobs` + `workflow_runs` + `budget_events` + `version_target` ledger + handover provider package | `AutonomyResumeDecision` (`dispatch` / `idle` / `handover` / `version_up`) | budget expired, stale lock, missing next_action, version-up without migration/rollback/idempotency evidence, L2 skip without template/defer record | scheduler predicate evaluator, version-up dry-run planner, L2 template pack selector |
| HC-P2 agent-loop-contract | tool call request, registered tool surface, effort budget, model role, provider route, loop span id | `model_runs` + `guardrail_decisions` + tool contract registry + trace span projection | `LoopDispatchDecision` (`allow` / `deny` / `defer` / `escalate`) + replayable trace row | unknown surface without explicit defer, over-budget loop self-continues, missing worker/verifier separation, provider API/SDK daemon used as required path | tool request/response schema validator, loop budget tick, trace-span writer |
| HC-P3 verification-contract | design artifact, pair artifact, AC/test ids, green command evidence, review tier, grounding metadata, TDD oracle | `trace_edges` + `test_runs` + `review_evidence` + green-command digest projection | `VerificationEvidenceProfile` (`mechanical_green` / `qualitative_review` / `external_grounding` / `oracle_strength`) | pair missing, coverage-only pass, self-review claimed as cross-agent, stale/fake digest, external claim without URL/version/span, Red/oracle missing for code change | pair closure validator, evidence profile classifier, TDD oracle checker |
| HC-P4 repair-feedback-contract | detector finding, severity, affected artifact, rollback hint, metric event, repair result | `findings` + `quality_signals` + `feedback_events` + improvement backlog + harness memory | `RepairCandidate` / `RepairRecipe` / `MetricImprovementSignal` | destructive/auth/PII/license repair without action approval, detector event not routed, successful repair not recorded as recipe/backlog candidate | repair router, recipe promoter, metric event projector |
| HC-P6 distribution-contract | push/merge intent, branch/rules/check plan, PR review route, CI failure, setup target, release tool choice, tag bump | setup baseline + release ledger + import report + GitHub dry-run plan | `DistributionPlan` (`dry_run_changes` / `required_checks` / `ruleset_plan` / `rollback_point`) | raw push path, ruleset/secret/branch-protection apply without approval, destructive setup overwrite, CI auto-fix below confidence cap, release tool without ADR | setup planner, GitHub rules emitter, release ADR checker, CI auto-fix confidence gate |
| HC-P7 knowledge-contract | memory query, provider handover, glossary term, bounded context, context-crossing command, rename event | `.ut-tdd/memory` + provider handover + glossary/context-map + relation graph | `BoundedRecallPacket` + `GlossaryDriftFinding` + context translation rule | per-agent memory silo used as SSoT, bounded recall missing for one runtime, rename without supersedes, context-crossing call without anti-corruption boundary | memory reader, glossary drift detector, context-map checker |
| HC-P8 security-boundary-contract | external source artifact, raw text, tool/API/GitHub action, sandbox profile, token scope, approval record, threat pattern | research artifact + security event + token policy + approval audit | `SecurityBoundaryDecision` (`allow_read` / `sanitize` / `sandbox` / `human_required` / `deny`) | untrusted text becomes instruction, missing source attribution, external code/API action without sandbox/token scope, high-impact action without action-binding approval | source attribution validator, security filter parser, sandbox/token policy selector |
| HC-P9 convergence-db-contract | artifact path, PLAN generates/requires, trace edge, projection status, contract change, layer baseline, metric trend | harness.db projections + relation graph + contract ledger + layer baseline snapshot | `ConvergenceStatus` (`green` / `yellow` / `red` / `blocker`) + impact query result | generated artifact absent from projection, DB not rebuilt after change, contract change without compatibility/migration class, affected layer gate/test not run | projection convergence checker, contract ledger classifier, regression impact query |
| HC-AC adapter-consistency-contract | adapter rule file, hook map, hosted API/developer-tool surface, preflight record, deferred tool surface | rule-drift result + preflight audit + adapter dry-run plan | `AdapterParityDecision` (`covered_by_hook` / `preflight_required` / `deferred_guard` / `drift`) | hosted/API edit without git/status preflight, Codex surface claimed hook-covered when not, new agent/tool surface without registry/defer, adapter rule diverges from shared core | adapter map validator, hosted-surface preflight checker, deferred surface registry |

## §4 source-design audit and anti-corruption boundary

旧 HELIX `RetryYN/ai-dev-kit-vscode` の read-only audit で、L5 に落とすべき設計素材は以下に限定する。
いずれも UT-TDD/HELIX harness の TS/Bun・`.ut-tdd` projection・PLAN 正本へ翻案し、旧 runtime を current path にしない。

| Source signal | L5 adoption | Not adopted |
|---------------|-------------|-------------|
| `HELIX-process-L0-L14.md`: workflow は必ず Forward と DB trace へ戻る / L5↔L8 は module 結合粒度 | HC-P0 / HC-P9 の return + convergence contract、L8 の module integration observation | `.helix` state、legacy command path |
| `db-integration.md`: plan/code/command/contract/model/skill registry と drift_db_diff | HC-P9 relation graph / contract ledger / projection convergence | legacy SQLite schema の移植 |
| `recovery-workflow.md`: budget / gate / lock / stop-hook / recovery PLAN | HC-P0 stop reason、HC-P1 budget/lock、HC-P4 repair routing | rollback/cutover runtime の流用 |
| `asset-mapping.md`: command/skill/detector/hook/catalog は既存資産接続と穴埋めで扱う | HC-P2 tool registry、HC-P7 skill/memory/glossary、HC-AC adapter parity | HELIX skill/command の bulk import |

## §5 cross-contract detailed decisions

- **physical data**: 既存 `plan_registry` / `workflow_runs` / `trace_edges` / `findings` / `feedback_events` / `guardrail_decisions` / `contract_ledger` projection を優先し、新規永続 state は L6 以降の table contract で確定する。
- **module boundary**: scheduler、runtime adapter、verification gate、repair feedback、distribution planner、memory/glossary、security filter、relation graph、adapter preflight は L5 では module 結合境界までを確定し、関数 signature は L6 へ降ろす。
- **D-CONTRACT**: external API / GitHub / infra / hosted API surface は dry-run plan と action-binding approval を contract とし、L5 で実適用や credential 扱いを決めない。
- **fail-close**: pair 欠落、projection 未収束、same-provider self verification、untrusted external instruction、approval 不一致、preflight 欠落はいずれも green にしない。

## §6 carry

- L6: `HC-*` ごとの function signature、schema、threshold、doctor/lint rule。
- L8: `LIT-*` の integration fixture / Given-When-Then は pair test-design を正本とする。
- L7 以降: 実装は L6 freeze 後の add-impl / Reverse back-fill で扱う。
