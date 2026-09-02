---
title: "checkout pathspec guard単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-81-checkout-pathspec-guard.md
parent_design: docs/design/helix/L6-function-design/checkout-pathspec-guard.md
pair_artifact: docs/design/helix/L6-function-design/checkout-pathspec-guard.md
behavior_contract_id: GIT-CHECKOUT-PATHSPEC-GUARD-001
responsibility_owner: git-command-guard
---

# checkout pathspec guard単体テスト設計

## Oracle

- `git checkout .`、tracked path、`HEAD path`、未解決targetをblockする。
- branchと同名pathが存在する曖昧targetをblockする。
- existing branchだけを指すtargetと`checkout -b`を許可する。
- hookが実cwdを使って判定することを一時repositoryで実測する。

## 回帰境界

既存destructive command、nested shell、override audit、contextual mutation oracleを維持する。
