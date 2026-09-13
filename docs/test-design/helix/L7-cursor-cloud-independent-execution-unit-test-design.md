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

## 実行可能oracle binding

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CCI-001 | envelope schema | unknown fieldまたはIssue/PLAN曖昧性を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-002 | path scope | absolute、traversal、overlap pathを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-003 | branch authority | HELIX未発行branchを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-004 | branch ownership | repository＋branch ownershipの勝者以外を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-005 | ownership freshness | generation/fence、expiry、released ownership不整合を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-006 | budget authority | unknownまたはstale budgetを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-007 | read-after identity | stale authorityを優先し、external identity不一致を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-008 | launch reconciliation | 応答不明または409でblind retryを許可しない | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-009 | runtime confinement | scope、secret、networkの実効強制欠落を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-010 | cost/deadline | cost reservationまたはabsolute deadline強制欠落を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-011 | observation legs | launch/collectionの2 legとexact schemaが欠ける観測を拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-012 | lineage/cost | foreign base lineageまたはUNKNOWN costを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-013 | remote output | scope外・traversal pathまたは不正digestを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-014 | independent review | self review、旧HEAD、foreign assignmentを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-015 | changes requested | 異なるassignmentまたはbranchへの差戻しを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-016 | safe release | terminal・writer不能・pending 0・cost・generationの欠落時は返却しない | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-017 | phase transition | Phase A/B二重writerまたはlive predecessorを拒否する | `tests/cursor-cloud-independent-execution.test.ts` |
| U-CCI-018 | retry isolation | retry上限後も未解消を保持し、peer laneへ停止を伝播しない | `tests/cursor-cloud-independent-execution.test.ts` |
