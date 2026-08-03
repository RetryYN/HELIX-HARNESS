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
| ST-WIB-003 | current descriptor＋封印済みwrapper | stale／拒否済み／複製／未封印launch |
| ST-WIB-004 | fixed child env | parent secret/env継承 |
| ST-WIB-005 | 上限付きregular byte snapshot | symlink／特殊file／上限超過／history |
| ST-WIB-006 | WCC-FR-03だけ完了 | network/secret/output receiptを過大claim |
