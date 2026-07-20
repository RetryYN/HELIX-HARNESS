---
plan_id: PLAN-L7-463-github-project-projection
title: "PLAN-L7-463 (impl): GitHub Project open workの一方向投影"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-21 Projectを追加して対応"
created: 2026-07-21
updated: 2026-07-21
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/github-project-projection.md
pair_artifact: docs/test-design/harness/github-project-projection.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/github-project-projection.md, oracle_id: U-GPROJ-001, test_path: tests/github-project-projection.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/github-project-projection.md, oracle_id: U-GPROJ-002, test_path: tests/github-project-projection.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/github-project-projection.md, oracle_id: U-GPROJ-003, test_path: tests/github-project-projection.test.ts }
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — Project snapshot、差分plan、apply/read-back adapterの実装"
  - role: tl
    slot_label: "TL — GitHubを第二正本化しない境界と外部mutationのレビュー"
generates:
  - { artifact_path: docs/plans/PLAN-L7-463-github-project-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/github-project-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/github-project-projection.md, artifact_type: test_design }
  - { artifact_path: src/audit/github-project-projection.ts, artifact_type: source_module }
  - { artifact_path: tests/github-project-projection.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-19-github-operations-projection.md
  requires:
    - docs/design/helix/L3-requirements/github-operations-projection.md
  references:
    - docs/test-design/helix/github-operations-projection-acceptance.md
  blocks: []
review_evidence: []
---

# PLAN-L7-463: GitHub Project open workの一方向投影

## 位置づけ

GOP-FR-01/02/08/09/10の最小implementation sliceとして、open Issue / PRとStatusの投影を実装する。
親L3は未confirmのため本PLANとL6/L8 pairはdraftを維持し、stacked draft PRでレビュー可能な状態まで進める。

## 工程

1. snapshotとpure差分analyzerを実装する。
2. dry-run既定、明示`--apply`、適用後read-backのCLI adapterを実装する。
3. unit test、typecheck、実Project dry-runをgreen化する。
4. 親L3 confirm後にpair freeze、independent review、外部CIへ進む。

## 受入条件

- dry-runは外部状態を変更せず、欠落・Status mismatch・余剰itemを区別する。
- applyは追加とStatus是正だけを行い、余剰itemを削除しない。
- read-back不一致、認証不足、Status option欠落を成功扱いにしない。
- GitHub側の値をharness正本へ逆流させない。
- scheduled workflowとcredential activationは別approval-bound sliceとして残す。
