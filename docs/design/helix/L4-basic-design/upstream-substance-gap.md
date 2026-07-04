---
title: "HELIX L4 基本設計 — upstream A-146 substance-gap 採用"
layer: L4
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L4-51-helix-pillar-basic-design
pair_artifact: docs/test-design/helix/upstream-substance-gap.md
related_l3: docs/design/helix/L3-requirements/upstream-substance-gap.md
---

# HELIX L4 基本設計 — upstream A-146 substance-gap 採用

L3 `HU-FR-*` 8 件を、既存 HELIX pillar block に二重計上せず接続する L4 back-fill。

## §1 L4 boundary（L4 境界）

| L3 ID | L4 境界 | L4 設計判断 | system oracle |
|-------|-------------|-------------|---------------|
| HU-FR-01 | HB-P6 / HB-AC | consumer adapter guard governance は distribution と adapter consistency の横断境界。未配線 surface は deferred として露出する | HUT-SYS-01 |
| HU-FR-02 | HB-P6 | setup / distribution は consumer PATH で `ut-tdd` が解決できるかを install preflight で扱う | HUT-SYS-02 |
| HU-FR-03 | HB-P3 / HB-P9 | green evidence integrity は verification governance と DB convergence の境界。digest restamp は closure 根拠にしない | HUT-SYS-03 |
| HU-FR-04 | HB-P9 | telemetry provenance は convergence DB 境界。runtime/projected/derived を区別する | HUT-SYS-04 |
| HU-FR-05 | HB-P6 / HB-P8 | distribution curation は consumer package と internal/dogfood governance material の trust boundary | HUT-SYS-05 |
| HU-FR-06 | HB-P3 / HB-P9 | FE design coverage は presence でなく substance / defer / out-of-scope の説明を持つ verification boundary | HUT-SYS-06 |
| HU-FR-07 | HB-P0 / HB-P1 | drive entry enforcement は workflow entry と autonomous work selection の境界。advisory だけで完了にしない | HUT-SYS-07 |
| HU-FR-08 | HB-AC | runtime matcher compatibility は adapter consistency 境界。対象 runtime evidence が無い matcher は unverified | HUT-SYS-08 |

## §2 cross-cutting invariant（横断不変条件）

- A-146 adoption は upstream audit の文言をそのまま移植しない。HELIX の PLAN / gate / harness.db /
  adapter / distribution block へ翻案する。
- `HU-FR-*` は existing pillar 43 件の下位・横断 hardening であり、pillar 43 件へ二重採番しない。
- L4 では boundary を固定し、関数 signature は L6 `upstream-substance-gap.md` へ降ろす。
