---
title: "HELIX L5 結合テスト設計 — pillar detail design"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: QA + AIM
plan: PLAN-L5-09-helix-pillar-detail-design
pair_artifact: docs/design/helix/L5-detail/pillar-detail-design.md
related_l5: docs/design/helix/L5-detail/pillar-detail-design.md
next_pair_freeze: L5
---

# HELIX L5 結合テスト設計 — pillar detail design

> L5 detail design `pillar-detail-design.md` の L8 integration test design。実装済みテストの存在ではなく、
> L5 contract を結合境界として観測する Given/When/Then を定義する。

## §0 量閉じ

- 対象 L5 contract: 10 件。
- integration test 観測: `LIT-*` 43 件。
- 対象 L3 要件: 43 件。
- 孤児: 0。

## §1 integration test trace

| LIT-ID | 対応 L3 | 対応 L5 contract | Given / When / Then |
|--------|---------|------------------|---------------------|
| LIT-P0-01 | HR-FR-P0-01 | HC-P0 | Given workflow PLAN / When return contract is checked / Then Forward return, gap-only, or version_target exists |
| LIT-P0-02 | HR-FR-P0-02 | HC-P0 | Given cap or lock signal / When stop contract is recorded / Then state and handover carry the stop reason |
| LIT-P1-01 | HR-FR-P1-01 | HC-P1 | Given runnable job and budget / When scheduler evaluates resume / Then all resume predicates must pass |
| LIT-P1-02 | HR-FR-P1-02 | HC-P1 | Given version target / When dry-run upgrade is produced / Then migration, rollback, and idempotency evidence exist |
| LIT-P1-03 | HR-FR-P1-03 | HC-P1 | Given large request / When work breakdown runs / Then sprint or PoC slice has Forward return and budget |
| LIT-P1-04 | HR-FR-P1-04 | HC-P1 | Given L2 skipped slice / When template pack is emitted / Then mock workflow and back-propagation contract remain available |
| LIT-P2-01 | HR-FR-P2-01 | HC-P2 | Given tool call / When registry validates it / Then unknown surface is fail-close or explicit defer |
| LIT-P2-02 | HR-FR-P2-02 | HC-P2 | Given effort budget / When loop tick consumes budget / Then over-budget loop does not self-continue |
| LIT-P2-03 | HR-FR-P2-03 | HC-AC | Given Codex/hosted surface / When adapter map is checked / Then hook-covered and preflight-only surfaces are separated |
| LIT-P2-04 | HR-FR-P2-04 | HC-P2 | Given agent loop span / When trace projection is rebuilt / Then plan/tool/handoff/guardrail/eval rows join without API/SDK premise |
| LIT-P3-01 | HR-FR-P3-01 | HC-P3 | Given design artifact / When pair gate runs / Then missing pair or coverage-only pass is rejected |
| LIT-P3-02 | HR-FR-P3-02 | HC-P3 | Given external claim / When grounding gate runs / Then URL/version/span and separate verifier evidence are required |
| LIT-P4-01 | HR-FR-P4-01 | HC-P4 | Given detector finding / When repair routing runs / Then repair candidate includes owner, route, and rollback |
| LIT-P4-02 | HR-FR-P4-02 | HC-P4 | Given successful repair / When close flow runs / Then recipe is stored in memory/backlog candidate |
| LIT-P4-03 | HR-FR-P4-03 | HC-P4 | Given metric event / When feedback projection runs / Then implementation/review/test/regression signals become improvement candidates |
| LIT-P6-01 | HR-FR-P6-01 | HC-P6 | Given raw push risk / When GitHub plan is emitted / Then rulesets, checks, and merge queue constraints are visible |
| LIT-P6-02 | HR-FR-P6-02 | HC-P6 | Given PR/CI auto-fix / When verifier is selected / Then worker != verifier and confidence cap are enforced |
| LIT-P6-03 | HR-FR-P6-03 | HC-P6 | Given setup target / When dry-run setup runs / Then managed changes and import report are non-destructive |
| LIT-P6-04 | HR-FR-P6-04 | HC-P6 | Given tag bump / When migration plan is produced / Then rollback point and destructive-apply block are present |
| LIT-P6-05 | HR-FR-P6-05 | HC-P6 | Given release automation choice / When ADR/check runs / Then selected tool and CI auto-fix confidence policy are recorded |
| LIT-P7-01 | HR-FR-P7-01 | HC-P7 | Given Claude/Codex session start / When memory is surfaced / Then both runtime routes read the shared provider |
| LIT-P7-02 | HR-FR-P7-02 | HC-P7 | Given glossary rename / When drift detection runs / Then old/new terms and bounded context are linked |
| LIT-P7-03 | HR-FR-P7-03 | HC-P7 | Given context-crossing call / When context map is checked / Then anti-corruption boundary or translation rule exists |
| LIT-P8-01 | HR-FR-P8-01 | HC-P8 | Given external source / When research artifact is created / Then source attribution and span verification are stored |
| LIT-P8-02 | HR-FR-P8-02 | HC-P8 | Given skillify candidate / When registry admission runs / Then license, safety, and scope review are required |
| LIT-P8-03 | HR-FR-P8-03 | HC-P8 | Given external execution/API action / When boundary policy runs / Then sandbox and short-lived token contract are required |
| LIT-P8-04 | HR-FR-P8-04 | HC-P8 | Given untrusted text / When security filter parses it / Then raw, metadata, and executable instruction are separated |
| LIT-P9-01 | HR-FR-P9-01 | HC-P9 | Given incomplete projection / When completion is attempted / Then DB convergence blocker remains visible |
| LIT-P9-02 | HR-FR-P9-02 | HC-P9 | Given relation graph query / When impact analysis runs / Then doc/code/test/PR/check/state edges are returned |
| LIT-P9-03 | HR-FR-P9-03 | HC-P9 | Given layer baseline / When regression query runs / Then gate result, metric trend, and owner are comparable |
| LIT-N3-01 | HR-NFR-P3-01 | HC-P3 | Given pass claim / When evidence gate runs / Then green command, review tier, and grounding are distinguished |
| LIT-N3-02 | HR-NFR-P3-02 | HC-P3 | Given implementation claim / When trace check runs / Then design, AC, code/test evidence, and findings align |
| LIT-N3-03 | HR-NFR-P3-03 | HC-P9 | Given affected layer / When regression fence runs / Then missing gate/test/doctor profile blocks pass |
| LIT-N3-04 | HR-NFR-P3-04 | HC-P3 | Given AI implementation / When TDD evidence is checked / Then Red/oracle/Green/refactor or substitute oracle exists |
| LIT-N5-01 | HR-NFR-P5-01 | HC-P1 | Given injection plan / When budget split is checked / Then verbatim, summary, and stable constraints are bounded |
| LIT-N5-02 | HR-NFR-P5-02 | HC-P1 | Given handover update / When anchored merge runs / Then Next Action and artifact trail are preserved |
| LIT-N5-03 | HR-NFR-P5-03 | HC-P3 | Given verification request / When profile is selected / Then fast/default/full and resource budget are evidenced |
| LIT-N8-01 | HR-NFR-P8-01 | HC-P8 | Given high-impact action / When approval gate runs / Then action-binding approval is required before apply |
| LIT-N8-02 | HR-NFR-P8-02 | HC-P8 | Given injection/exfiltration pattern / When security classification runs / Then deny/review/redaction decision is recorded |
| LIT-N8-03 | HR-NFR-P8-03 | HC-P8 | Given agentic AI escalation / When risk gate runs / Then least privilege, rollback, monitoring, and risk owner are required |
| LIT-NAC-01 | HR-NFR-AC-01 | HC-AC | Given adapter/template/skill/runtime rule / When drift check runs / Then divergence from shared core is surfaced |
| LIT-NAC-02 | HR-NFR-AC-02 | HC-AC | Given hosted API/developer tool edit / When preflight audit is checked / Then hook non-enforcement and target paths are recorded |
| LIT-NAC-03 | HR-NFR-AC-03 | HC-AC | Given runtime execution route / When route contract is checked / Then PLAN/CLI/harness DB/dry-run path is the SSoT |

## §2 G-DESIGN.L5

本 test design は L5 detail design と pair であり、`PLAN-L5-09` の G-DESIGN.L5 add-design readiness を検査する。

## §3 integration observation contract

各 `LIT-*` は実装テストではなく L8 で実装される結合観測の設計である。したがって、各 case は
L5 `HC-*` contract matrix の 4 面を観測する。

| Observation axis | L8 で観測するもの | 欠落時の扱い |
|------------------|------------------|--------------|
| contract input | PLAN / job / tool call / evidence / external source / adapter surface など、該当 `HC-*` の Required inputs が揃うこと | test design の片肺として fail |
| projection/evidence | `plan_registry`、`workflow_runs`、`trace_edges`、`test_runs`、`feedback_events`、`guardrail_decisions`、`contract_ledger`、memory/glossary/context-map 等の境界に証跡が残ること | green claim 不可 |
| contract output | `ForwardReturnDecision`、`AutonomyResumeDecision`、`LoopDispatchDecision`、`VerificationEvidenceProfile`、`DistributionPlan`、`SecurityBoundaryDecision` 等の正規化出力が一意に決まること | L6 function contract へ降下不可 |
| fail-close behavior | missing return、over-budget self-continue、self-review claim、untrusted instruction、approval/preflight 欠落、projection 未収束などが green にならないこと | L8 case は negative path を持つ |

## §4 source-design coverage

旧 HELIX source から採用するのは設計概念のみで、L8 では以下が観測対象になる。

| Source-derived concern | Covered by |
|------------------------|------------|
| workflow は Forward と DB trace へ戻る | LIT-P0-01 / LIT-P9-01 |
| budget / lock / stop reason で runaway を止める | LIT-P0-02 / LIT-P1-01 / LIT-P2-02 |
| catalog / registry / contract ledger に収束する | LIT-P2-01 / LIT-P9-02 / LIT-NAC-03 |
| command/skill/hook は bulk import せず adapter parity と drift で扱う | LIT-P7-01 / LIT-NAC-01 / LIT-NAC-02 |
