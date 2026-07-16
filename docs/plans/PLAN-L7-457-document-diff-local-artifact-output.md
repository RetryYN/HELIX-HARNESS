---
plan_id: PLAN-L7-457-document-diff-local-artifact-output
title: "PLAN-L7-457 (impl): document semantic diff local artifact output"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-14 /goal『設計を正としてテストや検出基はそれに追従』に基づくHVM-GAP-02 --out契約実装"]
created: 2026-07-14
updated: 2026-07-14
owner: Codex
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-16T17:38:00Z"
  review_binding:
    reviewer: cluster_c_independent_review
    reviewed_at: "2026-07-16T17:38:00Z"
    evidence_digest: "sha256:e9b0938f17e3368f7b16f501efb521c73ba07d8de2917f5dc4a96035473b1030"
  entries: []
review_evidence:
  - reviewer: cluster_c_independent_review
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-16T17:38:00Z"
    tests_green_at: "2026-07-16T17:37:28Z"
    verdict: pass
    scope: "semantic diff local artifact port、path/durability/dry-run mutation oracle、L6/L8 V-pairを独立監査。Blocker/High 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run document-engine targeted set --reporter=dot", runner: bun, scope: targeted, exit_code: 0, evidence_path: docs/evidence/requirements-reseal-document-engine-green.md, output_digest: "sha256:68e2e3e9b9a9c353864c46a23c5a9c2990c2feba14a824bab106f2f0062dc5e8" }
agent_slots:
  - { role: se, slot_label: "SE — document diff artifact port / CLI" }
  - { role: qa, slot_label: "QA — path / durability / dry-run mutation oracle" }
parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md
pair_artifact: docs/test-design/helix/L8-document-semantic-diff-contracts.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md, oracle_id: U-DOCDIFF-008, test_path: tests/document-report-write-port.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md, oracle_id: IT-DOCDIFF-003, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-457-document-diff-local-artifact-output.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/document-semantic-diff.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/document-report-write-port.ts, artifact_type: source_module }
  - { artifact_path: tests/document-report-write-port.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
  requires: []
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - src/adapters/document-semantic-diff-fs.ts
    - src/runtime/document-change-report.ts
    - src/runtime/document-semantic-diff.ts
---

# PLAN-L7-457: 文書semantic diffのローカルartifact出力

## 実装境界

既存source/testは本PLANが生成済みとclaimせず、L6/L8 statusとgreen evidenceを閉じるまで検証対象として扱う。

stdout既定を保ち、明示 `--out` のときだけ `.helix/artifacts/document-diff/` 内へ new-file-only で report を出力する。
任意path、上書き、source docs更新、release/tag/API/DB/stateへの副作用は含めない。専用write portはpath canonicalization、
symlink ancestor拒否、before不存在確認、temp/fsync/atomic no-replace publish/directory-fsync、digest receiptを強制する。
publish後のdurability検証失敗はreceipt前にcompensating unlinkとdirectory fsyncを行う。補償失敗は
`document_report_compensation_ambiguous`として通常失敗と区別する。

## 完了条件

U-DOCDIFF-008 と IT-DOCDIFF-003 が green であり、dry-run・拒否ケースで書込み 0、成功ケースでdigest receiptと
durable artifactを確認できること。公開やrelease操作は別の action-binding approval slice とする。
