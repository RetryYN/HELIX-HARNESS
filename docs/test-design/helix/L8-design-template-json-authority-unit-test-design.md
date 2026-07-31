---
title: "Design Template JSON authority単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-07-31
updated: 2026-07-31
owner: QA
plan: docs/plans/PLAN-L6-86-design-template-json-authority.md
pair_artifact: docs/design/helix/L6-function-design/design-template-json-authority.md
---

# Design Template JSON authority L7単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DTJ-001 | strict parse | unknown propertyを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-002 | identity | unsafe integerを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-003 | current pair | legacy layerを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-004 | predicate | 空allを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-005 | trace | required class欠落を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-006 | semantic digest | digest mismatchを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-007 | registry exact set | missing entryを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-008 | normative owner | canonical owner重複を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-009 | deprecated lifecycle | lifecycle field欠落を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-010 | applicability | missing factをerror | `tests/design-template-authority.test.ts` |
| U-DTJ-011 | shadow exactness | unmapped atomを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-012 | legacy authority | current昇格を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-013 | explained delta | review欠落を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-014 | generated view | digest driftを拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-015 | determinism | 入力順に依存しない | `tests/design-template-authority.test.ts` |
| U-DTJ-016 | capacity | 上限超過を拒否 | `tests/design-template-authority.test.ts` |
| U-DTJ-017 | side effect | 入力mutation 0 | `tests/design-template-authority.test.ts` |

各mutationは別oracleとしてkillする。別fieldのgreen、supplemental Markdown、legacy catalogの成功、
caller指定のparity statusで失敗を相殺しない。
