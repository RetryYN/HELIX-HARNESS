---
title: "L8 Derived requirement trace 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
pair_artifact: docs/design/helix/L6-function-design/derived-requirement-trace.md
---

# L8 Derived requirement trace 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DTRACE-001 | 1 transitionをcompile | FR/AC/test各1件、reverse artifact 11件 | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-002 | 8派生系統をcompile | exact 8種、全件candidate | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-003 | orphan/片edge/stale/confirmed mutation | 対応findingで`ok=false` | `tests/derived-requirement-trace.test.ts` |
| U-DTRACE-004 | placement重複/pair欠落/revision drift | 対応findingで`ok=false` | `tests/derived-requirement-trace.test.ts` |

実行コードは`tests/derived-requirement-trace.test.ts`を正本とする。
