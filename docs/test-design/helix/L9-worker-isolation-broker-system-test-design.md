---
title: "worker isolation broker L9システムテスト設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L4-62-worker-isolation-broker.md
pair_artifact: docs/design/helix/L4-basic-design/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker L9システムテスト設計

| oracle | 正例 | 反例 |
|---|---|---|
| ST-WIB-001 | Linux bubblewrapでallowlisted fileを処理 | repo/state/DB/credentialが見える |
| ST-WIB-002 | repo外scratchだけread-write | repo内scratch、git worktree |
| ST-WIB-003 | current descriptor + sealed wrapper | stale/rejected/copy/raw launch |
| ST-WIB-004 | fixed child env | parent secret/env継承 |
| ST-WIB-005 | bounded regular byte snapshot | symlink/special/oversize/history |
| ST-WIB-006 | WCC-FR-03だけ完了 | network/secret/output receiptを過大claim |
