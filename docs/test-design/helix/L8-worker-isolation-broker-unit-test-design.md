---
title: "worker isolation broker L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L5-88-worker-isolation-broker.md
pair_artifact: docs/design/helix/L5-detail/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker L8単体テスト設計

| oracle | 検証 |
|---|---|
| `U-WIB-001` | repo内scratch拒否 |
| `U-WIB-002` | symlink/git/state/DB拒否 |
| `U-WIB-003` | platform/backend拒否 |
| `U-WIB-004` | wrapper execution copy拒否 |
| `U-WIB-005` | bounded regular byte snapshot |
| `U-WIB-006` | broker launch copy拒否 |
| `U-WIB-007` | 実processのrepo/state/DB/credential不可視 |
| `U-WIB-008` | descriptor admission stale拒否 |
| `U-WIB-009` | filesystem isolation mutationをRed化 |
