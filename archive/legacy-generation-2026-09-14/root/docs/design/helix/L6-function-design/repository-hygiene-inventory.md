---
title: "repository hygiene read-only inventory機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-11
updated: 2026-09-11
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1110-repository-hygiene-inventory.md
pair_artifact: docs/test-design/helix/L8-repository-hygiene-inventory-unit-test-design.md
github_issue_id: 1110
behavior_contract_id: REPOSITORY-HYGIENE-INVENTORY-001
responsibility_owner: repository-hygiene
---

# repository hygiene read-only inventory機能設計

## 責務

branch／worktree整理を正本化の前提にするため、物理worktreeとcanonical main、open PR、active writer
leaseの証拠を結合し、`reclaim_candidate`、`protected`、`unknown_fail_closed`へ分類する。これは削除命令ではなく、
#631へ渡すread-only proposalである。

## 契約

- `reclaim_candidate`はclean、main到達、named branch、open PRなし、active writerなし、完全な証拠面をすべて満たす。
- default branch、dirty、main未到達、open PR、active writerは`protected`とする。
- detached、cleanliness／reachability不明、shallow history、main／PR／writer証拠取得不能は
  `unknown_fail_closed`とし、他のgreen証拠で相殺しない。
- branch名からprovider、workflow、ownerを推測しない。
- 本機能はbranch、worktree、remote refを変更・削除しない。

## 上下・V-pair束縛

上位はIssue #1110のinventory要求、下位実装は`src/audit/repository-hygiene.ts`、対応L8は
`docs/test-design/helix/L8-repository-hygiene-inventory-unit-test-design.md`である。cleanup適用は#631、
resource計測は#604、assignment／leaseの発行authorityは既存機構へ残す。
