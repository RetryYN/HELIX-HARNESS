---
title: "Cursor Cloud第三者実行admission L7単体テスト設計"
layer: L7
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-09-13
owner: QA
plan: docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md
pair_artifact: docs/design/helix/L6-function-design/cursor-cloud-independent-execution.md
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
---

# Cursor Cloud第三者実行admission L7単体テスト設計

- `U-CCI-001`: unknown fieldとIssue/PLAN曖昧性を拒否する。
- `U-CCI-002`: absolute/traversal/overlap pathを拒否する。
- `U-CCI-003`: HELIX未発行branchを拒否する。
- `U-CCI-004`: repository＋branch ownershipの勝者だけを受理する。
- `U-CCI-005`: generation/fence、expiry、released ownershipを拒否する。
- `U-CCI-006`: unknown/stale budgetを拒否する。
- `U-CCI-007`: stale authorityを先に返し、external read-after identity不一致を拒否する。
- `U-CCI-008`: launch応答不明と409でblind retryを許さない。
- `U-CCI-009`: scope・secret・networkの実効強制欠落を拒否する。
- `U-CCI-010`: cost reservationとabsolute deadline強制欠落を拒否する。
- `U-CCI-011`: launch/collectionの2 legとexact observation schemaを要求する。
- `U-CCI-012`: foreign base lineageとUNKNOWN costを拒否する。
- `U-CCI-013`: scope外・traversal remote pathと不正digestを拒否する。
- `U-CCI-014`: self review、旧HEAD、foreign assignmentを拒否する。
- `U-CCI-015`: changes requestedを同assignment・同branchだけへ返す。
- `U-CCI-016`: terminal・writer不能・pending 0・cost・generationが揃うまで返却しない。
- `U-CCI-017`: Phase A/B二重writerとlive predecessorを拒否する。
- `U-CCI-018`: retry上限後も未解消を保持し、peer laneへ停止を伝播しない。

各分岐除去mutationをkillするまでconfirmed化しない。provider mock成功や文字列存在だけをoracleにしない。
