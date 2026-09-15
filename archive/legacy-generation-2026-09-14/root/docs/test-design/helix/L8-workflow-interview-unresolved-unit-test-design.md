---
title: "Workflow interview／unresolved L8単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/design/helix/L6-function-design/workflow-interview-unresolved.md
---

# Workflow interview／unresolved L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UWINT-001 | core question | signal 0でもcoreをexactly once選択する | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-002 | conditional exactness | trueのsignalだけを選び、非該当回答を拒否する | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-003 | unresolved projection | 未回答、矛盾、authority不足、branch gapをsource span／履歴付きでfreeze blockする | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-004 | stale answer | source digest／revision／question version不一致を再利用しない | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-005 | schema fail-close | 空source、unknown version／fieldを拒否しtyped inputを返さない | `tests/workflow-interview-unresolved.test.ts` |
