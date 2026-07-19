---
plan_id: PLAN-L7-460-l12-dual-projection
title: "PLAN-L7-460 (impl): L12 canonical 二重投影の機械化 (HR-FR-VMCUT-02 スライス 1)"
kind: impl
layer: L7
drive: be
status: draft
route_mode: forward
entry_signals: ["po_directive: 2026-07-19 L12 体制がいつまでも閉じない構造 (L3 confirmed のまま L4 以降降下 0) の是正指示 (issue #46)"]
created: 2026-07-19
updated: 2026-07-19
backprop_decision: not_required
backprop_decision_reason: "confirmed L3 要件 HR-FR-VMCUT-02/05 の Forward 実装降下であり、要件の意味変更を伴わない。"
owner: AIM (Claude)
parent_design: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
    oracle_id: U-VMCUT-001
    test_path: tests/layer-projection.test.ts
agent_slots:
  - role: aim
    slot_label: "AIM — remap SSoT の完全性 (exact remap 15 layer) と fail-close 監査"
  - role: se
    slot_label: "SE — layer projection SSoT + doctor 二重表示の実装"
  - role: qa
    slot_label: "QA — unmapped fail-close / 実 repo dual green の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-460-l12-dual-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/vmodel/layer-projection.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/layer-projection.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L3-14-vmodel-canonical-authority-cutover
  requires: []
---

# PLAN-L7-460: L12 canonical 二重投影の機械化（スライス 1）

## 0. 背景

L12 canonical 化（HR-FR-VMCUT-01..05、PLAN-L3-14 confirmed）は L3 で確定したまま L4 以降への
降下 PLAN が存在せず、「二重表示を green にしてから schema enum / PLAN ID policy を変える」
（`vmodel-docgen-fit.md` §5）の前段が駆動されていなかった。このままでは compatibility 二重体制が
恒久化する（PO 指摘 2026-07-19、issue #46）。本 PLAN はその第 1 スライスとして remap の機械 SSoT と
二重表示 surface を実装する。

## 1. 実装範囲

- `src/vmodel/layer-projection.ts` を新設し、HR-FR-VMCUT-02 の exact remap 表
  （legacy L0–L14 → canonical L1–L12）を機械 SSoT として保持する。
- `projectLegacyLayer(legacy)` は canonical layer と表示ラベルを返し、map に無い L-token は
  unmapped として報告する（HR-FR-VMCUT-05 の authority drift fail-close の基礎）。
- doctor `l12-dual-projection` check: `docs/design/helix/` の層ディレクトリと `docs/plans/`
  frontmatter `layer:` を走査し、legacy/canonical の二重表示 summary を出力する。unmapped の
  legacy L-token 検出時は violation。非 L-token（`cutover` 等）は対象外。
- HR-FR-VMCUT-03 に従い、新規の独立 L6 設計成果物は生成せず、契約は既存
  `vmodel-pair-freeze.md` の §8 として吸収する（上位 trace = L3 cutover 文書 HR-FR-VMCUT-02/05）。

## 2. 受入条件

- [ ] remap SSoT が L0–L14 の全 15 layer を漏れなく被覆し、L5/旧 L6→L5、L13/L14→L12 の縮退を含む。
- [ ] unmapped fixture で violation、実 repo で unmapped 0 の dual summary が出る。
- [ ] `bunx vitest run tests/layer-projection.test.ts`、typecheck、Biome、`helix plan lint` green。

## 3. 範囲外（後続スライス）

- schema enum / PLAN ID policy の canonical 切替（二重表示 green 実績を条件に次スライス）。
- 既存 artifact の rename・ディレクトリ移動（cutover 承認境界、PLAN-M-02 と分離）。
- Layer Ledger Chain（HIL-BR-25 系）の canonical 番号化（L1/L3 draft の remap 注記が先）。

## 4. Vペア

- L3: `vmodel-canonical-authority-cutover.md` HR-FR-VMCUT-02/05。
- L6: `vmodel-pair-freeze.md` §8（既存 L6 への吸収、独立 L6 新規生成なし）。
- L8: `U-VMCUT-001`（`tests/layer-projection.test.ts`）。
