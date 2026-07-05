---
title: "HELIX L5 詳細設計 — pillar FR/NFR 詳細設計"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: AIM + TL (Codex)
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/test-design/helix/L5-pillar-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
next_pair_freeze: L8
---

# HELIX L5 詳細設計 — pillar FR/NFR 詳細設計

> 本書は L4 `pillar-basic-design.md` の 10 block / 43 要件を L5 詳細設計へ降下する add-design 正本である。
> 既存 harness L5 4 sub-doc は置換せず、HELIX 名前空間の contract / projection / adapter 境界を追加する。

## §0 量閉じ

- 入力 L4: `HB-*` 10 block、`HR-FR` 33 件 + `HR-NFR` 13 件 = 46 件。
- L5 detailed contract: 10 件 (`HC-P0` / `HC-P1` / `HC-P2` / `HC-P3` / `HC-P4` / `HC-P6` / `HC-P7` / `HC-P8` / `HC-P9` / `HC-AC`)。
- L8 integration test design: `LIT-*` 46 件。
- Route-B back-fill L3 要件 8 件は本 pillar detail の 46 件へ二重計上しない。該当契約は L6 `orchestration-memory.md` と Reverse back-fill 側で関数境界へ降下し、本書では HC-P1 / HC-P2 / HC-P3 / HC-P7 / HC-AC の contract matrix に取り込む。
- 孤児: 0。詳細は §2 trace。
- L1 §2.8 asset/progress visualization amendment は `PLAN-DISCOVERY-10` の 2026-07-06 PO 指示により
  confirmed に戻した。`PLAN-L7-206` の `VisualizationSnapshot` は先行 read-model response であり、
  本 L5 10 contract / 43 `LIT-*` の完了範囲に VSCode View/Webview contract を追加した扱いにはしない。
- G-SF `semantic_feature_frontier_record` の分類 vocabulary は L5 contract boundary でも維持する。confirmed overlay は
  `confirmed_overlay_frontier_count=0`、現行 live frontier は `live_semantic_frontier_count=2` であり、deferred 済み PLAN や live draft backlog を L5 confirmed contract と混同しない。
  `frontier_pending_decision` は visualization read-model / graph IR / drill-down / UI action contract を
  未 confirmed として扱い、`parked_future_version` は activation decision まで current integration
  contract の pass に数えず、`approval_gated_cutover` は dry-run / rollback / state backup / audit の
  contract までで apply command を持たない。中間 contract がこの分類を落とす場合、実装 path や
  first-response artifact をもって revised request が fully descended したと誤読できるため、
  G-DESIGN.L5 / L8 integration pass の完了根拠にしない。

## §1 L5 詳細 contract

| Contract | 対応 L4 block | L5 詳細境界 | 結合境界 |
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
| HR-FR-P9-04 | HB-P9 | HC-P9 | LIT-P9-04 |
| HR-FR-P9-05 | HB-P9 | HC-P9 | LIT-P9-05 |
| HR-FR-P9-06 | HB-P9 | HC-P9 | LIT-P9-06 |
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

## §2.1 Route-B back-fill contract 境界

Route-B back-fill 8 件は §2 の `LIT-*` 46 件へ二重採番しない。ただし L5 contract の責務から外さず、
既存 `HC-*` contract の fail-close / projection / output 境界へ接続する。

| Route-B L3 ID | L4 block 境界 | L5 contract 境界 | L5 で固定する contract 判断 |
|---------------|-------------------|----------------------|------------------------------|
| HR-BR-07 | HB-P2 | HC-P2 | `LoopDispatchDecision` は canResume/evaluateStop/classifyRecovery を安全側に解釈する |
| HR-BR-12 | HB-P7 | HC-P7 | `BoundedRecallPacket` / memory contract は supersede と harness/project layer を保持する |
| HR-NFR-03 | HB-P3 / HB-P7 | HC-P3 / HC-P7 | `VerificationEvidenceProfile` は worker 自己 pass を拒否し、memory contract は secret body を保存しない |
| HR-BR-07R | HB-P2 | HC-P2 | tick runtime は cross-runtime verifier 不在時に same-runtime pass へ落とさない |
| HR-BR-12R | HB-P7 | HC-P7 | memory persistence は shared SSoT、append-only、secret reject を module contract にする |
| HR-NFR-03R | HB-P1 | HC-P1 | job claim は continuous autonomy の scheduler contract として二重取得を防ぐ |
| HR-BR-13R | HB-P2 / HB-AC | HC-P2 / HC-AC | runtime bridge は provider 選定を再実装せず adapter parity / preflight contract に従う |
| HR-BR-14R | HB-P1 / HB-P2 | HC-P1 / HC-P2 | loop CLI は scheduler state と tick contract を結合し、dry-run と dispatch を分離する |

## §3 L5 contract matrix（対応表）

L5 は L4 block の名前を移すだけではなく、L8 で結合観測できる **module contract** を固定する。各
`HC-*` は「入力」「正規化 state/projection」「出力」「fail-close 条件」「L6 へ降ろす関数境界」を持つ。
旧 HELIX は read-only 設計ソースとして参照し、runtime / Python / bash / `.helix` state は取り込まない。

| Contract | Required inputs（必須入力） | State / projection boundary（境界） | Contract output（出力） | Fail-close / block condition（条件） | L6 へ降ろす境界 |
|----------|-----------------|-----------------------------|-----------------|------------------------------|----------|
| HC-P0 forward-return-contract | PLAN `kind` / `workflow_phase` / `forward_return` / `gap-only` / `version_target` / stop reason | `plan_registry` + `workflow_runs` + `gate_runs` + handover stop reason | `ForwardReturnDecision` (`return_to` / `defer_to_version` / `gap_only` / `blocked_reason`) | return/defer/gap target なしの workflow 完了主張、return target の archive 化または欠落、handover からの stop reason 脱落 | forward-return validator、stop-reason normalizer |
| HC-P1 autonomous-work-contract | job candidate、resume 3 predicates、budget window、iteration cap、context threshold、L2 template availability、release/tag target | `jobs` + `workflow_runs` + `budget_events` + `version_target` ledger + handover provider package | `AutonomyResumeDecision` (`dispatch` / `idle` / `handover` / `version_up`) | budget 期限切れ、stale lock、`next_action` 欠落、migration/rollback/idempotency evidence なしの version-up、template/defer record なしの L2 skip | scheduler predicate evaluator、version-up dry-run planner、L2 template pack selector |
| HC-P2 agent-loop-contract | tool call request、registered tool surface、effort budget、model role、provider route、loop span id | `model_runs` + `guardrail_decisions` + tool contract registry + trace span projection | `LoopDispatchDecision` (`allow` / `deny` / `defer` / `escalate`) + replayable trace row | explicit defer なしの unknown surface、budget 超過後の loop 自己継続、worker/verifier 分離の欠落、provider API/SDK daemon を required path として使うこと | tool request/response schema validator、loop budget tick、trace-span writer |
| HC-P3 verification-contract | design artifact、pair artifact、AC/test ids、green command evidence、review tier、grounding metadata、TDD oracle | `trace_edges` + `test_runs` + `review_evidence` + green-command digest projection | `VerificationEvidenceProfile` (`mechanical_green` / `qualitative_review` / `external_grounding` / `oracle_strength`) | pair 欠落、coverage-only pass、self-review を cross-agent と主張、stale/fake digest、URL/version/span なしの external claim、code change に対する Red/oracle 欠落 | pair closure validator、evidence profile classifier、TDD oracle checker |
| HC-P4 repair-feedback-contract | detector finding、severity、affected artifact、rollback hint、metric event、repair result | `findings` + `quality_signals` + `feedback_events` + improvement backlog + harness memory | `RepairCandidate` / `RepairRecipe` / `MetricImprovementSignal` | action approval なしの destructive/auth/PII/license repair、detector event の未 routing、成功 repair が recipe/backlog candidate として記録されないこと | repair router、recipe promoter、metric event projector |
| HC-P6 distribution-contract | push/merge intent、branch/rules/check plan、PR review route、CI failure、setup target、release tool choice、tag bump、identifier rename cutover plan | setup baseline + release ledger + import report + GitHub dry-run plan + rename audit JSON + cutover/action-binding approval evidence | `DistributionPlan` (`dry_run_changes` / `required_checks` / `ruleset_plan` / `rollback_point`) + `IdentifierRenameAudit` + `IdentifierRenameCutoverPlan` | raw push path、approval なしの ruleset/secret/branch-protection apply、destructive setup overwrite、confidence cap 未満の CI auto-fix、ADR なしの release tool、具体的な cutover/action-binding approval なしの identifier cutover apply。outcome + actor/tool/target だけでは approved params、current `cutoverSnapshot` sha256 binding、review/audit/expiry、backup/rollback/monitoring evidence なしの apply を許可しない | setup planner、GitHub rules emitter、release ADR checker、CI auto-fix confidence gate、rename blast-radius auditor |
| HC-P7 knowledge-contract | memory query、provider handover、glossary term、bounded context、context-crossing command、rename event | `.helix/memory` + provider handover + glossary/context-map + relation graph | `BoundedRecallPacket` + `GlossaryDriftFinding` + context translation rule | per-agent memory silo を SSoT として使うこと、どちらかの runtime で bounded recall が欠落、supersedes なしの rename、anti-corruption boundary なしの context-crossing call | memory reader、glossary drift detector、context-map checker |
| HC-P8 security-boundary-contract | external source artifact、raw text、tool/API/GitHub action、sandbox profile、token scope、approval record、threat pattern、snapshot-bound approval packet | research artifact + security event + token policy + approval audit + reviewed snapshot binding | `SecurityBoundaryDecision` (`allow_read` / `sanitize` / `sandbox` / `human_required` / `deny`) | untrusted text が instruction になること、source attribution 欠落、sandbox/token scope なしの external code/API action、action-binding approval なしの high-impact action、`reviewed_snapshot_binding` が packet field 名だけで current `sha256:` snapshotId を持たない snapshot-bound approval | source attribution validator、security filter parser、sandbox/token policy selector |
| HC-P9 convergence-db-contract | artifact path、PLAN generates/requires、trace edge、projection status、contract change、layer baseline、metric trend | harness.db projections + relation graph + contract ledger + layer baseline snapshot | `ConvergenceStatus` (`green` / `yellow` / `red` / `blocker`) + impact query result | generated artifact が projection に存在しないこと、変更後に DB が rebuild されないこと、compatibility/migration class なしの contract change、affected layer gate/test 未実行 | projection convergence checker、contract ledger classifier、regression impact query |
| HC-AC adapter-consistency-contract | adapter rule file、hook map、hosted API/developer-tool surface、preflight record、deferred tool surface | rule-drift result + preflight audit + adapter dry-run plan | `AdapterParityDecision` (`covered_by_hook` / `preflight_required` / `deferred_guard` / `drift`) | git/status preflight なしの hosted/API edit、Codex surface を hook-covered と誤主張すること、registry/defer なしの新 agent/tool surface、adapter rule が shared core から乖離すること | adapter map validator、hosted-surface preflight checker、deferred surface registry |

## §4 source-design audit and anti-corruption boundary（境界）

旧 HELIX `RetryYN/ai-dev-kit-vscode` の read-only audit で、L5 に落とすべき設計素材は以下に限定する。
いずれも HELIX/HELIX harness の TS/Bun・`.helix` projection・PLAN 正本へ翻案し、旧 runtime を current path にしない。

| Source signal | L5 採用内容 | 採用しない内容 |
|---------------|-------------|-------------|
| `HELIX-process-L0-L14.md`: workflow は必ず Forward と DB trace へ戻る / L5↔L8 は module 結合粒度 | HC-P0 / HC-P9 の return + convergence contract、L8 の module integration observation | `.helix` state、legacy command path |
| `db-integration.md`: plan/code/command/contract/model/skill registry と drift_db_diff | HC-P9 relation graph / contract ledger / projection convergence | legacy SQLite schema の移植 |
| `recovery-workflow.md`: budget / gate / lock / stop-hook / recovery PLAN | HC-P0 stop reason、HC-P1 budget/lock、HC-P4 repair routing | rollback/cutover runtime の流用 |
| `asset-mapping.md`: command/skill/detector/hook/catalog は既存資産接続と穴埋めで扱う | HC-P2 tool registry、HC-P7 skill/memory/glossary、HC-AC adapter parity | HELIX skill/command の bulk import |

## §5 contract 間の詳細判断

- **physical data**: 既存 `plan_registry` / `workflow_runs` / `trace_edges` / `findings` / `feedback_events` / `guardrail_decisions` / `contract_ledger` projection を優先し、新規永続 state は L6 以降の table contract で確定する。
- **module boundary**: scheduler、runtime adapter、verification gate、repair feedback、distribution planner、memory/glossary、security filter、relation graph、adapter preflight は L5 では module 結合境界までを確定し、関数 signature は L6 へ降ろす。
- **D-CONTRACT**: external API / GitHub / infra / hosted API surface は dry-run plan と action-binding approval を contract とし、L5 で実適用や credential 扱いを決めない。
- **fail-close**: pair 欠落、projection 未収束、same-provider self verification、untrusted external instruction、approval 不一致、preflight 欠落はいずれも green にしない。

## §6 carry

- L6: `HC-*` ごとの function signature、schema、threshold、doctor/lint rule。
- L8: `LIT-*` の integration fixture / Given-When-Then は pair test-design を正本とする。
- L7 以降: 実装は L6 freeze 後の add-impl / Reverse back-fill で扱う。
