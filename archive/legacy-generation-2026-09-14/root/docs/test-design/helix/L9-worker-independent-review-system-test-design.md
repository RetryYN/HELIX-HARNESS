---
title: "worker independent review L9 system test設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L4-65-worker-independent-review.md
pair_artifact: docs/design/helix/L4-basic-design/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review L9 system test設計

| ST-ID | 経路 | 期待結果 |
|---|---|---|
| ST-WRR-001 | worker／reviewer別broker実行→strict receipt→三軸分離 | sealed review capability 1件 |
| ST-WRR-002 | copied output／digest drift／schema違反 | capability 0、typed failure |
| ST-WRR-003 | identity／session／context collision | 各固有reason code、capability 0 |
| ST-WRR-004 | same provider／model、三軸独立 | 正常受理しmodel metadataを保持 |
| ST-WRR-005 | DB／Git／merge surface | write 0、後続lifecycle責務へ非混載 |
| ST-WRR-006 | actor自己申告／copy output／stale registry | broker origin不成立として拒否 |
| ST-WRR-007 | 任意finding claim／copied reviewer output | sealed reviewer payloadと不一致ならtyped拒否 |
| ST-WRR-008 | Ubuntu required CIのbubblewrap実process | packageを導入し、Ubuntu 24.04 AppArmorのunprivileged user namespace制限だけをephemeral runnerで解除した後に実sandboxを起動する。backend欠落・namespace起動失敗時はskipせずrequired checkをRed |
