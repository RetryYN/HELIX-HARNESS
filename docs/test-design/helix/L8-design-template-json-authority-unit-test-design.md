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

| oracle | 対象 | 反例と期待結果 |
|---|---|---|
| U-DTJ-001 | `validateDesignTemplate` strict parse | required field欠落、unknown property、unknown enumを`schema_invalid` |
| U-DTJ-002 | identity/lifecycle | duplicate ID/version、不正transition、unsafe integerを拒否 |
| U-DTJ-003 | current pair | L1–L12 exact pair外とlegacy layerを拒否 |
| U-DTJ-004 | predicate walk | mixed variant、空all、unknown field/operator/type、depth/node超過を拒否 |
| U-DTJ-005 | trace/oracle/measurement | 各required classを1件ずつ欠落させ個別finding |
| U-DTJ-006 | semantic digest | normative fieldを1 byte相当変更しdigest mismatch |
| U-DTJ-007 | registry exact set | missing/extra/duplicate entryとlatest暗黙解決を拒否 |
| U-DTJ-008 | normative owner | 同値classのcanonical ownerを2件にして拒否 |
| U-DTJ-009 | deprecated lifecycle | replacement/consumer/retention/removal triggerの各欠落を拒否 |
| U-DTJ-010 | three-value applicability | missing factをfalseへ丸めず`evaluation_error` |
| U-DTJ-011 | shadow mapping exactness | unmapped、double-map、fabricated targetを拒否 |
| U-DTJ-012 | legacy authority | compatibility/historical atomのcurrent default昇格を拒否 |
| U-DTJ-013 | explained delta | decisionまたは独立review欠落を拒否 |
| U-DTJ-014 | generated view | 4 digestの各1件driftを`generated_view_drift` |
| U-DTJ-015 | determinism | 入力順を並べ替えて同一finding set/logical digest |
| U-DTJ-016 | capacity | finding/template/section/field上限超過をtruncateせず拒否 |
| U-DTJ-017 | side effect | core実行でfilesystem/network/DB write 0 |

各mutationは別oracleとしてkillする。別fieldのgreen、supplemental Markdown、legacy catalogの成功、
caller指定のparity statusで失敗を相殺しない。
