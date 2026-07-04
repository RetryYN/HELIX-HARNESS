---
title: "HELIX L4 基本設計 — 旧 HELIX 拡張採用"
layer: L4
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L4-51-helix-pillar-basic-design
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l3: docs/design/helix/L3-requirements/legacy-helix-extension.md
---

# HELIX L4 基本設計 — 旧 HELIX 拡張採用

旧 HELIX 由来 `HLX-FR-*` を、既存 HELIX pillar block へ重複なしで接続する L4 境界。

## §1 L4 boundary（L4 境界）

| L3 ID | L4 境界 | L4 設計判断 | system oracle |
|-------|-------------|-------------|---------------|
| HLX-FR-01 | HB-P0 / HB-P1 / HB-P3 | runtime discipline は work preflight と gate invariant。Forward return、acceptance、allowed scope 欠落を作業開始前に止める | HLX-SYS-01 |
| HLX-FR-02 | HB-P2 / HB-P3 / HB-AC | technical user question gate は adapter consistency と verification governance の横断境界。TL advisor evidence なしの技術質問を止める | HLX-SYS-02 |
| HLX-FR-03 | HB-P4 / HB-P9 | detector axis registry は repair-learning と convergence DB の境界。axis result を gate/workflow routing へ送る | HLX-SYS-03 |
| HLX-FR-04 | HB-P7 / HB-P9 | recommender catalog は shared knowledge と relation graph の境界。skill/code/command 候補を traceable にする | HLX-SYS-04 |
| HLX-FR-05 | HB-P3 / HB-P4 / HB-P9 | RUN & Debug trace は verification governance、repair feedback、layer regression の境界。missing action を improvement/blocker に送る | HLX-SYS-05 |
| HLX-FR-06 | HB-P1 / HB-P2 / HB-AC | core injection / adapter distribution は lifecycle と adapter consistency の境界。repo-local 正本と generated consumer asset を分ける | HLX-SYS-06 |
| HLX-FR-07 | HB-P2 / HB-P3 / HB-AC / HB-P9 | hook / guard suite は adapter surface、verification governance、convergence DB の境界。未配線 guard を pass と扱わない | HLX-SYS-07 |
| HLX-FR-08 | HB-P2 / HB-P7 / HB-AC | agent / role / model roster は adapter consistency と shared knowledge の境界。delegation と model-family policy を typed contract にする | HLX-SYS-08 |
| HLX-FR-09 | HB-P0 / HB-P1 / HB-P4 | workflow process inventory は charter/pillar/lifecycle/repair feedback の境界。既存 pillar 接続と new-plan-required を分ける | HLX-SYS-09 |
| HLX-FR-10 | HB-P6 / HB-P9 / HB-AC | DB / registry / telemetry / API は repository structure、convergence DB、adapter boundary の境界。raw legacy state を current state にしない | HLX-SYS-10 |
| HLX-FR-11 | HB-P1 / HB-P3 / HNFR-P5 | continuous-run / scheduler / budget は lifecycle、verification governance、performance budget の境界。stop condition なしの自動継続を止める | HLX-SYS-11 |
| HLX-FR-12 | HB-P4 / HB-P7 / HB-P9 | learning / feedback / recipe loop は repair-learning、shared knowledge、convergence DB の境界。feedback は改善候補であり acceptance proof ではない | HLX-SYS-12 |

## §2 anti-corruption boundary（腐敗防止境界）

- 旧 HELIX の `helix` CLI、`.helix` state、Python detector/recommender/debug 実装は採用しない。
- 旧 HELIX の global core 配布、Claude hook shell、agent persona、Python DB/API/scheduler/learning 実装は直接採用しない。
- 現行 CLI 名や state path の rename は `PLAN-M-02-helix-identifier-rename.md` の atomic migration まで行わない。
- L4 では block 境界だけを固定し、関数 signature は L6 へ降ろす。
