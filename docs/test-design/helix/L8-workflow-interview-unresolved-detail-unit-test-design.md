---
title: "Workflow interview／unresolved L5詳細単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/design/helix/L5-detail/workflow-interview-unresolved.md
related_l8: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
---

# Workflow interview／unresolved L5詳細単体テスト設計

本artifactはL5のquestion／answer schemaとunresolved分類の詳細契約を所有する。L6 runtime oracleは
`L8-workflow-interview-unresolved-unit-test-design.md`が所有し、本artifactは同じtest citationを使って
設計値の境界を反証する。

| U-ID | 詳細契約 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UWINT-D-001 | coreとconditional exact 15種 | signal 0でもcoreを1件選び、true以外のconditionalを選ばない | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-D-002 | answer binding | digest／revision／question version／authorityのいずれかが不一致ならadmitしない | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-D-003 | unresolved taxonomy | ambiguity／contradiction／authority_missing／branch_missingをsource span／history付きで返す | `tests/workflow-interview-unresolved.test.ts` |
| U-UWINT-D-004 | schema fail-close | 空source、unknown field/version、非該当answerをfindingへ変換しfreezeを拒否する | `tests/workflow-interview-unresolved.test.ts` |

詳細設計は補完、質問の推測追加、永続化、外部dispatchを許可しない。これらの副作用APIをruntimeへ
追加するmutationはL6 oracleと併せて拒否する。
