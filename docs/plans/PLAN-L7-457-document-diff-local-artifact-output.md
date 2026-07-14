---
plan_id: PLAN-L7-457-document-diff-local-artifact-output
title: "PLAN-L7-457 (impl): document semantic diff local artifact output"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-14 /goal『設計を正としてテストや検出基はそれに追従』に基づくHVM-GAP-02 --out契約実装"]
created: 2026-07-14
updated: 2026-07-14
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE — document diff artifact port / CLI" }
  - { role: qa, slot_label: "QA — path / durability / dry-run mutation oracle" }
backprop_decision: not_required
backprop_decision_reason: "L6 §3.1のlocal-only artifact出力を実装へ降下し、公開・release境界は含めない。"
parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md, oracle_id: U-DOCDIFF-008, test_path: tests/document-report-write-port.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md, oracle_id: IT-DOCDIFF-003, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-457-document-diff-local-artifact-output.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/document-report-write-port.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/document-report-write-port.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
  requires: []
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
---

# PLAN-L7-457: 文書semantic diffのローカルartifact出力

## 実装境界

stdout既定を保ち、明示 `--out` のときだけ `.helix/artifacts/document-diff/` 内へ new-file-only で report を出力する。
任意path、上書き、source docs更新、release/tag/API/DB/stateへの副作用は含めない。専用write portはpath canonicalization、
symlink拒否、before不存在確認、temp/fsync/rename/directory-fsync、digest receiptを強制する。

## 完了条件

U-DOCDIFF-008 と IT-DOCDIFF-003 が green であり、dry-run・拒否ケースで書込み 0、成功ケースでdigest receiptと
durable artifactを確認できること。公開やrelease操作は別の action-binding approval slice とする。
