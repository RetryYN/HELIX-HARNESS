---
title: "HELIX L8 検証契約 — Node Minimum provisional evidence"
layer: L8
artifact_type: test_design
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: QA / TL
plan: PLAN-L7-458-node-minimum-provisional-evidence
pair_artifact: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md
---

# Node Minimum provisional evidence 検証契約

| U-ID | 反例 | 期待結果 |
|---|---|---|
| U-NMIN-001 | exact 6 workflow | `pass`かつ`terminal:false` |
| U-NMIN-002 | 未知workflow | `HIL_NODE_WORKFLOW_SET_INVALID` |
| U-NMIN-003 | 重複workflow | `HIL_NODE_WORKFLOW_SET_INVALID` |
| U-NMIN-004 | Node/npm、lock/tree、SQLite API/version/compile options、artifactを一件ずつdrift | 各反例を`HIL_NODE_AUTHORITY_BINDING_INVALID`でblocked |

HEAD/treeはcanonical expectation pathを含む現在HEADの観測値とし、6 workflow artifactとの同一性を
`HIL_NODE_WORKFLOW_UNVERIFIED`、collect後の変化をpersist freshnessで拒否する。

PASS receiptはdigest名でcreate-new保存し、同一pathの再保存・上書き・全ancestorのsymlink escape・
collect後のHEAD/tree driftを拒否する。expectation/workflow artifactはclosed schemaで未知fieldを拒否する。

active surfaceがBun authorityのまま不変であることを差分監査し、Node greenだけでcutover完了をclaimしない。
