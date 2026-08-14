---
title: "measurement evidence evaluator L6 runtime単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
pair_artifact: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
related_l8: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
---

# measurement evidence evaluator L6 runtime単体テスト設計

本artifactはL6 pure evaluatorの関数境界、処理順序、6軸独立評価、finding順序、verdict導出を所有する。
L5 schema／境界値の詳細oracleは`L8-measurement-evidence-evaluator-unit-test-design.md`が所有し、
両artifactは同じproduction testを異なる設計責務から反証する。

runtime oracleは`U-MEVAL-001`、`U-MEVAL-002`、`U-MEVAL-003`、`U-MEVAL-004`、`U-MEVAL-005`、
`U-MEVAL-006`、`U-MEVAL-007`、`U-MEVAL-008`、`U-MEVAL-009`、`U-MEVAL-010`、
`U-MEVAL-011`、`U-MEVAL-012`、`U-MEVAL-013`、`U-MEVAL-014`、`U-MEVAL-015`のexact setとする。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-MEVAL-001 | exact root admission | unknown／missing fieldを受理しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-002 | scalar admission | invalid ID／revision／digest／numberを受理しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-003 | declaration binding | revision／metric／unit driftをmatchにしない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-004 | context binding | workload／environment／sampling／window driftをmatchにしない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-005 | time admission | invalid range／時刻を受理しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-006 | freshness | stale境界をcurrentへ縮退しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-007 | representativeness | countとratioの不足を相殺しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-008 | scalar threshold | comparator／符号／ゼロを誤判定しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-009 | range threshold | inclusive flagと両端を無視しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-010 | baseline union | unknown／measuredを混在受理しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-011 | baseline binding | context／HEAD driftをusableにしない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-012 | hard limit | unknown／pass／failをthresholdで相殺しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-013 | verdict優先順位 | failureをunknown、unknownをgreenへ縮退しない | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-014 | finding exact contract | first-error return、順序drift、raw値露出を拒否する | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-015 | pure／deterministic境界 | input mutation、共有result、clock／I/O依存を許可しない | `tests/measurement-evidence-evaluator.test.ts` |

current HEAD／probe dataset admission、history永続化、scheduler、DB、外部processはIssue #221の責務であり、
本runtime unit testでmock successを作らない。
