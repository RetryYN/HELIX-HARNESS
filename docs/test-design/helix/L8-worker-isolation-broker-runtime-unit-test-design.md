---
title: "worker isolation broker L8実装単体テスト設計"
layer: L8
artifact_type: test_design
status: draft
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-96-worker-isolation-broker.md
pair_artifact: docs/design/helix/L6-function-design/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker L8実装単体テスト設計

`tests/worker-isolation-broker.test.ts`をcanonical oracleとする。Linux実process oracleはrepo absolute path、workspace `.git/.helix/harness.db`、
`GITHUB_TOKEN`が不可視で、child env key exact setが`HOME/LANG/PATH/TMPDIR`であることを検証する。
