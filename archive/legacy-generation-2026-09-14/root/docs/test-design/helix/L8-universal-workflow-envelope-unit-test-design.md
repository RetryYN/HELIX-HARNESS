---
title: "Universal Workflow envelope L7 unit test設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: QA / TL
plan: docs/plans/PLAN-L6-83-universal-workflow-envelope.md
pair_artifact: docs/design/helix/L6-function-design/universal-workflow-envelope.md
---

# Universal Workflow envelope L7 unit test設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UWENV-001 | exact atom/coverage | 15種atomと5出力の完全fixtureだけactivation allowed | `tests/universal-workflow-envelope.test.ts` |
| U-UWENV-002 | loop/terminal | max/limit/terminal contract欠落をschema reject | `tests/universal-workflow-envelope.test.ts` |
| U-UWENV-003 | condition data | retention等8属性欠落をschema reject | `tests/universal-workflow-envelope.test.ts` |
| U-UWENV-004 | envelope/digest | 5出力欠落とsource digest driftをreject | `tests/universal-workflow-envelope.test.ts` |
| U-UWENV-005 | runtime composition | 旧workflow schema単体とruntime version不適合をactivationしない | `tests/universal-workflow-envelope.test.ts` |
