---
title: "project hook lifecycle supervisor L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-653-project-hook-lifecycle-supervisor.md
pair_artifact: docs/design/helix/L6-function-design/project-hook-lifecycle-supervisor.md
---

# project hook lifecycle supervisor L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CNWHOOKLIFE-001 | completion | operation完了時timerをcancelしtimeoutへ誤遷移しない | `tests/project-hook-lifecycle.test.ts` |
| U-CNWHOOKLIFE-002 | timeout | fake schedulerでabort、child grace、parent terminalを観測する | `tests/project-hook-lifecycle.test.ts` |
| U-CNWHOOKLIFE-003 | result preservation | timeout前後でterminal result bytesを保全し同一referenceへ依存しない | `tests/project-hook-lifecycle.test.ts` |
| U-CNWHOOKLIFE-004 | policy／seal | 60001msとdigest改変receiptをtyped failureで拒否する | `tests/project-hook-lifecycle.test.ts` |
| U-CNWHOOKLIFE-005 | terminal failure | child／parent falseを成功へ降格しない | `tests/project-hook-lifecycle.test.ts` |
