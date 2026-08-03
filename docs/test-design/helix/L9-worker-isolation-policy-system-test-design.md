---
title: "worker isolation policy L9システムテスト設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L4-63-worker-isolation-policy.md
pair_artifact: docs/design/helix/L4-basic-design/worker-isolation-policy.md
github_issue_id: 226
behavior_contract_id: WCC-FR-04
responsibility_owner: worker-isolation-policy
---

# worker isolation policy L9システムテスト設計

| oracle | 正例 | 反例 |
|---|---|---|
| ST-WIP-001 | non-secret exact wrapperを起動 | secret／unknown／copied wrapper |
| ST-WIP-002 | network namespaceが分離 | `--unshare-net`欠落、prose denyだけ |
| ST-WIP-003 | deny-all egress | authority未実装のhost allowlistを許可 |
| ST-WIP-004 | scope内add/modify/delete | scope外変更、曖昧prefix、git/state/DB |
| ST-WIP-005 | bounded regular post-state | symlink／特殊file／oversize／content露出 |
| ST-WIP-006 | WCC-FR-04だけ完了 | FR-05/06のoutput再検証／receiptを過大claim |
