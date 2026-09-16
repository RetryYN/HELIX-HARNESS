---
title: "HELIX L4 基本設計 — UI Domain・Pattern Profile capability境界"
layer: L4
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-UDP-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
pair_artifact: docs/test-design/helix/L4-ui-domain-pattern-profile-system-test-design.md
next_pair_freeze: L5
requirements:
  - VDH-FR-003
  - VDH-FR-005
  - HR-FR-DHR-004
github_issue_id: 209
---

# HELIX L4 基本設計 — UI Domain・Pattern Profile capability境界

Issue #209 の capability を、隣接 capability との境界（owner 分離）と system assertion
対象で定める。route は `forward_full_v` + `screen_design`（L2↔L11）からの L4/L5 降下で
あり、不確実な体験意味は `discovery`、backend 由来は `design_bottomup` から同じ型へ合流する。

## §1 capability境界（owner 分離）

| capability | primary owner | 本設計の関係 |
|---|---|---|
| UI Domain 型付け（VDH-FR-003）・Pattern Contract / UI Profile（VDH-FR-005）・risk pairwise（HR-FR-DHR-004） | **#209（本設計）** | primary |
| Design Registry 台帳・trace 閉包（HR-FR-DHR-001） | #177 | consumer（ID 空間 SCR-/CMP-/TOK-/CNT- を共有し台帳を複製しない） |
| responsive/viewport 実測 evidence（VDH-FR-011） | #211 | 本設計は responsive **宣言**のみを持ち、実測は #211 |
| chain 追跡（HR-FR-DHR-003） | #210 | consumer trace のみ |
| Canonical Design IR intake（#257） | #257 | 上流供給元 |

## §2 system assertion（L4↔L9 対象）

L8（結合、IT-UDP）が型・段間契約の検証であるのに対し、L9 は「実 repository の実 doc /
実 fixture 一式を端から端まで通す」system 粒度で検証する（L8 の再実行にしない）。

| SA | assertion | 検証面（L9 固有粒度） |
|---|---|---|
| SA-UDP-01 | 実 repository の L2 screen 設計正本（screen-list / wireframe / ui-element / screen-detail）を入力に、intake→typed entity 化→registry consumer trace までの全経路を通し、class/path 主キー 0 件と #177 ID 空間整合を end-to-end で assert する | system（実 L2 doc 全件・合成 fixture 不使用） |
| SA-UDP-02 | 実 product profile / 実 Pattern Contract / 実共通 Rule Pack の一式を CI 実行経路（doctor/lint 配線後の実 gate）で同時 load し、混入・競合が実行環境で fail-close されることを検証する | system（実 gate 配線経由、型レベル検証と区別） |
| SA-UDP-03 | 実 risk matrix 宣言から fixture 列を生成し、生成物が実際のテスト実行計画（fixture consumer）へ接続可能で、軸・level の実バリエーション下でも被覆 3 条件を維持することを検証する | system（生成→消費の全経路） |

## §3 Design Reality Binding契約

本 doc は設計フェーズの正本であり、runtime asset は実装スライスで生成する。到達性 witness は
実装スライスの test 着地時に追記する（着地前に到達性を主張しない）。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```

## §4 非scope

- fixture の実行（テスト実行基盤・#211 の viewport 実測）
- registry への write（#177 の transaction 経路を consumer として使う）
- FE 実装そのもの（fe-lead / fe-ui のオーケストレーション対象）
