---
title: "HELIX L5 詳細設計 — pillar FR/NFR detail design"
layer: L5
kind: add-design
status: confirmed
created: 2026-06-28
updated: 2026-06-28
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
- 孤児: 0。詳細は §2 trace。

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

## §3 detailed design decisions

- **physical data**: 既存 `plan_registry` / `workflow_runs` / `trace_edges` / `findings` / `feedback_events` / `guardrail_decisions` / `contract_ledger` projection を優先し、新規永続 state は L6 以降の table contract で確定する。
- **module boundary**: scheduler、runtime adapter、verification gate、repair feedback、distribution planner、memory/glossary、security filter、relation graph、adapter preflight は L5 では module 結合境界までを確定し、関数 signature は L6 へ降ろす。
- **D-CONTRACT**: external API / GitHub / infra / hosted API surface は dry-run plan と action-binding approval を contract とし、L5 で実適用や credential 扱いを決めない。
- **fail-close**: pair 欠落、projection 未収束、same-provider self verification、untrusted external instruction、approval 不一致、preflight 欠落はいずれも green にしない。

## §4 carry

- L6: `HC-*` ごとの function signature、schema、threshold、doctor/lint rule。
- L8: `LIT-*` の integration fixture / Given-When-Then は pair test-design を正本とする。
- L7 以降: 実装は L6 freeze 後の add-impl / Reverse back-fill で扱う。
