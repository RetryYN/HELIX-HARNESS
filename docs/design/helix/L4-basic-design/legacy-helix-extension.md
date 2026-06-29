---
title: "HELIX L4 基本設計 — old HELIX extension adoption"
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

# HELIX L4 基本設計 — old HELIX extension adoption

旧 HELIX 由来 `HLX-FR-*` を、既存 HELIX pillar block へ重複なしで接続する L4 boundary。

## §1 L4 boundary

| L3 ID | L4 boundary | L4 設計判断 | system oracle |
|-------|-------------|-------------|---------------|
| HLX-FR-01 | HB-P0 / HB-P1 / HB-P3 | runtime discipline は work preflight と gate invariant。Forward return、acceptance、allowed scope 欠落を作業開始前に止める | HLX-SYS-01 |
| HLX-FR-02 | HB-P2 / HB-P3 / HB-AC | technical user question gate は adapter consistency と verification governance の横断境界。TL advisor evidence なしの技術質問を止める | HLX-SYS-02 |
| HLX-FR-03 | HB-P4 / HB-P9 | detector axis registry は repair-learning と convergence DB の境界。axis result を gate/workflow routing へ送る | HLX-SYS-03 |
| HLX-FR-04 | HB-P7 / HB-P9 | recommender catalog は shared knowledge と relation graph の境界。skill/code/command 候補を traceable にする | HLX-SYS-04 |
| HLX-FR-05 | HB-P3 / HB-P4 / HB-P9 | RUN & Debug trace は verification governance、repair feedback、layer regression の境界。missing action を improvement/blocker に送る | HLX-SYS-05 |

## §2 anti-corruption boundary

- 旧 HELIX の `helix` CLI、`.helix` state、Python detector/recommender/debug 実装は採用しない。
- 現行 CLI 名や state path の rename は `PLAN-M-02-helix-identifier-rename.md` の atomic migration まで行わない。
- L4 では block 境界だけを固定し、関数 signature は L6 へ降ろす。
