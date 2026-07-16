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
| U-NMIN-004 | authority HEAD／toolchain／artifact drift | receipt digest不一致またはblocked |

active surfaceがBun authorityのまま不変であることを差分監査し、Node greenだけでcutover完了をclaimしない。
