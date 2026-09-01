---
title: "Review DB candidate tree binding 詳細設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-79-review-db-candidate-tree-binding.md
pair_artifact: docs/test-design/helix/L8-review-db-candidate-tree-binding-unit-test-design.md
github_issue_id: 1383
behavior_contract_id: REVIEW-DB-CANDIDATE-TREE-BINDING-001
responsibility_owner: claude-pr-convergence
---

# Review DB candidate tree binding 詳細設計

## 責務

独立レビューreceiptの論理DB証拠を、レビュー対象のPR HEADとclean working treeへ束縛する。
レビュー内容、CI generation、GitHub commentの責務は既存`claude-pr-convergence`契約を維持する。

## 契約

`bindCanonicalLogicalDbReceipt`はDB receiptの`source_head`がreview inputの`headSha`と完全一致し、
`source_tree`がGit tree identityであり、`workspace_attestation`がtracked workspaceかつclean、
status entry 0である場合だけdigest群を束縛する。

次を個別failureとしてfail-closeする。

- `canonical_db_source_head_mismatch`
- `canonical_db_source_tree_invalid`
- `canonical_db_workspace_dirty`
- `workspace_status_digest_invalid`

共有rootの変更を破棄・無視してclean扱いにしない。review producerは対象HEADのdedicated worktreeから実行する。
