---
title: "HELIX L5 結合テスト設計 — pillar detail design（柱詳細設計）"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: QA + AIM
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/design/helix/L5-detail/pillar-detail-design.md
related_l5: docs/design/helix/L5-detail/pillar-detail-design.md
next_pair_freeze: L5
---

# HELIX L5 結合テスト設計 — pillar detail design（柱詳細設計）

> L5 detail design `pillar-detail-design.md` の L8 integration test design（結合テスト設計）。
> 実装済みテストの存在ではなく、L5 contract（L5 契約）を結合境界として観測する GWT を定義する。

## §0 量閉じ

- 対象 L5 contract（L5 契約）: 10 件。
- integration test（結合テスト）観測: `LIT-*` 43 件。
- 対象 L3 要件: 43 件。
- Route-B back-fill L3 要件 8 件は L6 route-B / Reverse back-fill の unit/acceptance oracle（単体/受入オラクル）で観測し、本 L5 pillar integration test では 43 件に二重計上しない。ただし HC-P1 / HC-P2 / HC-P3 / HC-P7 / HC-AC の contract（契約）境界に接続されることは §1.1 で観測する。
- 孤児: 0。
- L1 §2.8 asset/progress visualization amendment は S4 decision 待ちであり、本 `LIT-*` 43 件の
  integration pass（結合通過判定）に含めない。S4 confirmed 後は visualization read-model / graph IR / drill-down /
  read-only UI action boundary（読み取り専用 UI 操作境界）の結合観測を追加する。
- G-SF `semantic_feature_frontier_record` が `frontier_pending_decision` / `parked_future_version` /
  `approval_gated_cutover` を返す意味単位は、L8 integration pass の対象外でなければならない。
  `completion_claim_allowed=false` を integration expected result（結合期待結果）とし、first-response read model、
  setup output（セットアップ出力）、activation/cutover packet が存在しても、S4 / activation / cutover approval 前は
  current 43 件の integration completion に混ぜない（結合完了に混入させない）。

## §1 結合テスト trace

| LIT-ID | 対応 L3 | 対応 L5 contract（L5 契約） | GWT |
|--------|---------|------------------|---------------------|
| LIT-P0-01 | HR-FR-P0-01 | HC-P0 | 前提: workflow PLAN / 操作: return contract を確認 / 期待: Forward return、gap-only、または `version_target` が存在する |
| LIT-P0-02 | HR-FR-P0-02 | HC-P0 | 前提: cap または lock signal / 操作: stop contract を記録 / 期待: state と handover が stop reason を保持する |
| LIT-P1-01 | HR-FR-P1-01 | HC-P1 | 前提: runnable job と budget / 操作: scheduler が resume を評価 / 期待: resume predicate がすべて pass する |
| LIT-P1-02 | HR-FR-P1-02 | HC-P1 | 前提: version target / 操作: dry-run upgrade を生成 / 期待: migration、rollback、idempotency evidence が存在する |
| LIT-P1-03 | HR-FR-P1-03 | HC-P1 | 前提: large request / 操作: work breakdown を実行 / 期待: sprint または PoC slice が Forward return と budget を持つ |
| LIT-P1-04 | HR-FR-P1-04 | HC-P1 | 前提: L2 skipped slice / 操作: template pack を emit / 期待: mock workflow と back-propagation contract が利用可能なまま残る |
| LIT-P2-01 | HR-FR-P2-01 | HC-P2 | 前提: tool call / 操作: registry が検証 / 期待: unknown surface は fail-close または explicit defer になる |
| LIT-P2-02 | HR-FR-P2-02 | HC-P2 | 前提: effort budget / 操作: loop tick が budget を消費 / 期待: over-budget loop は self-continue しない |
| LIT-P2-03 | HR-FR-P2-03 | HC-AC | 前提: Codex/hosted surface / 操作: adapter map を確認 / 期待: hook-covered surface と preflight-only surface を分離する |
| LIT-P2-04 | HR-FR-P2-04 | HC-P2 | 前提: agent loop span / 操作: trace projection を rebuild / 期待: plan/tool/handoff/guardrail/eval row が API/SDK 前提なしに join する |
| LIT-P3-01 | HR-FR-P3-01 | HC-P3 | 前提: design artifact / 操作: pair gate を実行 / 期待: missing pair または coverage-only pass を reject する |
| LIT-P3-02 | HR-FR-P3-02 | HC-P3 | 前提: external claim / 操作: grounding gate を実行 / 期待: URL/version/span と separate verifier evidence を要求する |
| LIT-P4-01 | HR-FR-P4-01 | HC-P4 | 前提: detector finding / 操作: repair routing を実行 / 期待: repair candidate が owner、route、rollback を含む |
| LIT-P4-02 | HR-FR-P4-02 | HC-P4 | 前提: successful repair / 操作: close flow を実行 / 期待: recipe を memory/backlog candidate に保存する |
| LIT-P4-03 | HR-FR-P4-03 | HC-P4 | 前提: metric event / 操作: feedback projection を実行 / 期待: implementation/review/test/regression signal が improvement candidate になる |
| LIT-P6-01 | HR-FR-P6-01 | HC-P6 | 前提: raw push risk / 操作: GitHub plan を emit / 期待: ruleset、check、merge queue constraint が可視化される |
| LIT-P6-02 | HR-FR-P6-02 | HC-P6 | 前提: PR/CI auto-fix / 操作: verifier を選択 / 期待: worker != verifier と confidence cap を enforce する |
| LIT-P6-03 | HR-FR-P6-03 | HC-P6 | 前提: setup target / 操作: dry-run setup を実行 / 期待: managed change と import report は non-destructive である |
| LIT-P6-04 | HR-FR-P6-04 | HC-P6 | 前提: tag bump または PLAN-M-02 identifier rename cutover / 操作: migration/audit plan を生成 / 期待: rollback point、blast-radius baseline、destructive-apply block、full approval evidence requirement、current `cutoverSnapshot` sha256 binding requirement が存在する |
| LIT-P6-05 | HR-FR-P6-05 | HC-P6 | 前提: release automation choice / 操作: ADR/check を実行 / 期待: selected tool と CI auto-fix confidence policy を記録する |
| LIT-P7-01 | HR-FR-P7-01 | HC-P7 | 前提: Claude/Codex session start / 操作: memory を surface / 期待: 両 runtime route が shared provider を読む |
| LIT-P7-02 | HR-FR-P7-02 | HC-P7 | 前提: glossary rename / 操作: drift detection を実行 / 期待: old/new term と bounded context が link される |
| LIT-P7-03 | HR-FR-P7-03 | HC-P7 | 前提: context-crossing call / 操作: context map を確認 / 期待: anti-corruption boundary または translation rule が存在する |
| LIT-P8-01 | HR-FR-P8-01 | HC-P8 | 前提: external source / 操作: research artifact を作成 / 期待: source attribution と span verification を保存する |
| LIT-P8-02 | HR-FR-P8-02 | HC-P8 | 前提: skillify candidate / 操作: registry admission を実行 / 期待: license、safety、scope review を要求する |
| LIT-P8-03 | HR-FR-P8-03 | HC-P8 | 前提: external execution/API action / 操作: boundary policy を実行 / 期待: sandbox と short-lived token contract を要求する |
| LIT-P8-04 | HR-FR-P8-04 | HC-P8 | 前提: untrusted text / 操作: security filter が parse / 期待: raw、metadata、executable instruction を分離する |
| LIT-P9-01 | HR-FR-P9-01 | HC-P9 | 前提: incomplete projection / 操作: completion を試行 / 期待: DB convergence blocker が visible のまま残る |
| LIT-P9-02 | HR-FR-P9-02 | HC-P9 | 前提: relation graph query / 操作: impact analysis を実行 / 期待: doc/code/test/PR/check/state edge を返す |
| LIT-P9-03 | HR-FR-P9-03 | HC-P9 | 前提: layer baseline / 操作: regression query を実行 / 期待: gate result、metric trend、owner を比較できる |
| LIT-N3-01 | HR-NFR-P3-01 | HC-P3 | 前提: pass claim / 操作: evidence gate を実行 / 期待: green command、review tier、grounding を区別する |
| LIT-N3-02 | HR-NFR-P3-02 | HC-P3 | 前提: implementation claim / 操作: trace check を実行 / 期待: design、AC、code/test evidence、finding が整合する |
| LIT-N3-03 | HR-NFR-P3-03 | HC-P9 | 前提: affected layer / 操作: regression fence を実行 / 期待: missing gate/test/doctor profile が pass を block する |
| LIT-N3-04 | HR-NFR-P3-04 | HC-P3 | 前提: AI implementation / 操作: TDD evidence を確認 / 期待: Red/oracle/Green/refactor または substitute oracle が存在する |
| LIT-N5-01 | HR-NFR-P5-01 | HC-P1 | 前提: injection plan / 操作: budget split を確認 / 期待: verbatim、summary、stable constraint が bounded である |
| LIT-N5-02 | HR-NFR-P5-02 | HC-P1 | 前提: handover update / 操作: anchored merge を実行 / 期待: Next Action と artifact trail を保持する |
| LIT-N5-03 | HR-NFR-P5-03 | HC-P3 | 前提: verification request / 操作: profile を選択 / 期待: fast/default/full と resource budget を evidence 化する |
| LIT-N8-01 | HR-NFR-P8-01 | HC-P8 | 前提: high-impact action / 操作: approval gate を実行 / 期待: apply 前に action-binding approval を要求し、snapshot-bound approval は `reviewed_snapshot_binding` が current `sha256:` snapshotId を cite するまで pending のまま残る |
| LIT-N8-02 | HR-NFR-P8-02 | HC-P8 | 前提: injection/exfiltration pattern / 操作: security classification を実行 / 期待: deny/review/redaction decision を記録する |
| LIT-N8-03 | HR-NFR-P8-03 | HC-P8 | 前提: agentic AI escalation / 操作: risk gate を実行 / 期待: least privilege、rollback、monitoring、risk owner を要求する |
| LIT-NAC-01 | HR-NFR-AC-01 | HC-AC | 前提: adapter/template/skill/runtime rule / 操作: drift check を実行 / 期待: shared core からの divergence を surface する |
| LIT-NAC-02 | HR-NFR-AC-02 | HC-AC | 前提: hosted API/developer tool edit / 操作: preflight audit を確認 / 期待: hook non-enforcement と target path を記録する |
| LIT-NAC-03 | HR-NFR-AC-03 | HC-AC | 前提: runtime execution route / 操作: route contract を確認 / 期待: PLAN/CLI/harness DB/dry-run path が SSoT である |

## §1.1 Route-B contract 観測

| Route-B L3 ID | L5 contract boundary（L5 契約境界） | integration 観測 |
|---------------|----------------------|------------------|
| HR-BR-07 | HC-P2 | `LoopDispatchDecision` が canResume/evaluateStop/classifyRecovery の安全側出力を持つ |
| HR-BR-12 | HC-P7 | memory contract が layer / supersede / bounded recall を保持する |
| HR-NFR-03 | HC-P3 / HC-P7 | verification profile が worker 自己 pass を拒否し、memory contract が secret body を保存しない |
| HR-BR-07R | HC-P2 | tick runtime が cross-runtime verifier 不在時に same-runtime pass を出さない |
| HR-BR-12R | HC-P7 | memory persistence が shared SSoT / append-only / secret reject を満たす |
| HR-NFR-03R | HC-P1 | scheduler/job contract が `BEGIN IMMEDIATE` claim と busy backoff を扱う |
| HR-BR-13R | HC-P2 / HC-AC | runtime bridge が provider 選定を再実装せず adapter parity に従う |
| HR-BR-14R | HC-P1 / HC-P2 | loop CLI が scheduler state と tick contract を結合し、dry-run と dispatch を分離する |

## §2 G-DESIGN.L5

本 test design（テスト設計）は L5 detail design と pair であり、`PLAN-L5-09` の G-DESIGN.L5 add-design readiness（追加設計準備）を検査する。

## §3 結合観測 contract

各 `LIT-*` は実装テストではなく L8 で実装される結合観測の設計である。したがって、各 case は
L5 `HC-*` contract matrix（契約マトリクス）の 4 面を観測する。

| 観測軸 | L8 で観測するもの | 欠落時の扱い |
|------------------|------------------|--------------|
| contract input（契約入力） | PLAN / job / tool call / evidence / external source / adapter surface など、該当 `HC-*` の Required inputs が揃うこと | test design の片肺として fail |
| projection/evidence（投影/証跡） | `plan_registry`、`workflow_runs`、`trace_edges`、`test_runs`、`feedback_events`、`guardrail_decisions`、`contract_ledger`、memory/glossary/context-map 等の境界に証跡が残ること | green claim 不可 |
| contract output（契約出力） | `ForwardReturnDecision`、`AutonomyResumeDecision`、`LoopDispatchDecision`、`VerificationEvidenceProfile`、`DistributionPlan`、`SecurityBoundaryDecision` 等の正規化出力が一意に決まること | L6 function contract へ降下不可 |
| fail-close behavior（安全側失敗挙動） | missing return、over-budget self-continue、self-review claim、untrusted instruction、approval/preflight 欠落、projection 未収束などが green にならないこと | L8 case は negative path を持つ |

## §3.1 結合検証戦略

L8 integration では、module/adapter/state 境界を跨いだ実挙動を観測する。テスト戦略は GWT
を決めるが、検証戦略はその観測が実 runtime（実行環境）由来かを決める。

| 検証軸 | 必須 evidence（必須証跡） | fail condition（失敗条件） |
|-------------------|-------------------|----------------|
| runtime provenance（実行由来性） | real `session_id`、`source`、adapter/runtime surface、timestamp、evidence path | projection-only row または空の session id だけでは fired/used/works を証明できない |
| cross-boundary correlation（境界横断相関） | PLAN id、requirement/test id、module または adapter boundary、log/projection row 間の correlation id join | join できない log row は trace-support のみに留まる |
| debug reproducibility（デバッグ再現性） | L7.5 RUN & Debug command または adapter invocation を、secret redaction 済みの recorded args から再実行または review できる | prose-only debug note は acceptance evidence ではない |
| negative verification（負例検証） | hosted/API hook non-enforcement、preflight-only edit、blocked external action、missing approval が blocked outcome として観測可能なまま残る | blocked path が integration evidence から欠落している |
| semantic frontier preservation（意味境界の保持） | `semantic_feature_frontier_record` classification が PLAN/design state から L8 evidence へ join する | `frontier_pending_decision`、`parked_future_version`、`approval_gated_cutover` を completed integration work として報告している |

## §4 source design coverage 対応

旧 HELIX source から採用するのは設計概念のみで、L8 では以下が観測対象になる。

| source 由来の関心 | 対応 LIT |
|------------------------|------------|
| workflow は Forward と DB trace へ戻る | LIT-P0-01 / LIT-P9-01 |
| budget / lock / stop reason で runaway を止める | LIT-P0-02 / LIT-P1-01 / LIT-P2-02 |
| catalog / registry / contract ledger に収束する | LIT-P2-01 / LIT-P9-02 / LIT-NAC-03 |
| command/skill/hook は bulk import せず adapter parity と drift で扱う | LIT-P7-01 / LIT-NAC-01 / LIT-NAC-02 |
