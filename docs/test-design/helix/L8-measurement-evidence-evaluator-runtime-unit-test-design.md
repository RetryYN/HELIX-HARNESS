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

| U-ID | runtime契約 | 反例と期待結果 | test citation |
|---|---|---|---|
| `U-MEVAL-001`..`U-MEVAL-005` | exact input admissionとordered failure | unknown field、invalid scalar／time、異bindingを受理しない | `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-006`..`U-MEVAL-012` | 6軸の独立評価と境界 | 一軸の成功でstale、sample不足、threshold、baseline、hard limit失敗を相殺しない | `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-013` | verdict優先順位 | failureをunknown、unknownをgreenへ縮退しない | `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-014` | finding exact contract | first-error return、順序drift、raw値露出を拒否する | `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-015` | pure／deterministic境界 | input mutation、共有result、clock／I/O依存を許可しない | `tests/measurement-evidence-evaluator.test.ts` |

current HEAD／probe dataset admission、history永続化、scheduler、DB、外部processはIssue #221の責務であり、
本runtime unit testでmock successを作らない。
