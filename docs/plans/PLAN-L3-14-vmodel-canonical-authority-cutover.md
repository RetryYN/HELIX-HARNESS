---
plan_id: PLAN-L3-14-vmodel-canonical-authority-cutover
title: "PLAN-L3-14 (add-design): ZIP L1-L12 canonical authority cutover freeze"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-13 ハイブリッド設計ドキュメントv1-fixed.zipを正本としてHELIX-HARNESSを大改修する"
created: 2026-07-13
updated: 2026-07-13
owner: Codex / TL
backprop_decision: not_required
backprop_decision_reason: "現行Core governanceのL0-L14 authorityとPLAN-L3-13が定めたZIP L1-L12 canonical targetが衝突するため、実装降下前にL0/L1/governanceの正本優先順位を人間承認付きでfreezeする。"
parent_design: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
pair_artifact: docs/test-design/helix/vmodel-canonical-authority-cutover-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — canonical authority、remap、互換期限、rollback設計"
  - role: aim
    slot_label: "AIM — governance precedenceと不可逆cutover境界の監査"
  - role: qa
    slot_label: "QA — L11 acceptanceとdrift/rollback oracle設計"
generates:
  - artifact_path: docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/vmodel-canonical-authority-cutover-acceptance.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
  requires:
    - docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/design/helix/L12-vmodel/vmodel-layer-coverage.md
  blocks: []
---

# PLAN-L3-14: ZIP L1-L12 canonical authority cutover freeze

## §0 目的

`PLAN-L3-13` が採用済みのL1-L12 targetを、現行L0-L14 execution surfaceへ曖昧に併存させず、
正本優先順位、層remap、互換期間、rollbackをL3でfreezeする。本PLANは設計判断のみを行い、schema/DB、
directory、CLI、hook、consumer/distributionの実cutoverは後続L4-L7 PLANへ送る。

## §1 工程

1. ZIP hash/inventoryとrepo-owned adoption matrixをauthority inputとして固定する。
2. ZIP upstream archive、repo-owned Markdown/typed declaration、harness.db projectionの正本境界を定義する。
3. 現L0-L14からL1-L12へのexact remapと独立L6機能設計の移行先を固定する。
4. Core Reads、adapter rules、detector、DB、view、consumer templateの移行順序と互換期限を定義する。
5. L11 acceptanceで旧入力互換、drift検出、rollback可能性、archive非正本をVペアfreezeする。
6. PO承認後だけ`confirmed`化し、後続L4 architecture/L5 migration/L7 implementationへ分割する。

## §2 完了条件

- authority precedenceとL1-L12 remapに曖昧な二重canonicalがない。
- ZIPはpinned upstream source、repo-owned抽出設計とtyped declarationはruntime canonical、DB/viewはprojectionである。
- 独立した旧L6機能設計を新規生成しない境界と、既存成果物のcompatibility routeがある。
- cutover前後のrollback、compat期限、drift gate、全consumer surfaceがL11 acceptanceに列挙される。
- L3の人間承認前にruntime enum/state pathを変更しない。

## §3 対象外

- L0-L14 enumの即時削除、既存artifactの一括rename。
- `.helix`/`helix` identifier cutover。
- ZIP内Python/Excel runtimeの移植。
- release/tag/distribution切替。
