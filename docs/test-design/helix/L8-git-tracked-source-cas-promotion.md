---
title: "HELIX L8 — raw Git-tracked source CAS promotion"
layer: L8
sub_doc: unit-test-design
status: draft
created: 2026-07-17
updated: 2026-07-17
owner: QA / TL
pair_artifact: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md
plan: docs/plans/PLAN-L7-460-git-tracked-source-cas-promotion.md
---

# raw Git-tracked source CAS promotion 単体テスト設計

| ID | 反例 | 期待 |
|---|---|---|
| U-GTCAS-001 | bundle未配置、未知field、repository/path/digest不一致 | `HIL_GIT_CAS_MANIFEST_INVALID`または`HIL_GIT_CAS_BUNDLE_MISSING`、credit 0 |
| U-GTCAS-002 | base objectの変更、削除、別pathへの移動 | `HIL_GIT_CAS_MUTATION_FORBIDDEN` |
| U-GTCAS-003 | A/B不一致、expired、scan finding、bundle verify/fsck/ref/tree/edge replay不一致 | fail-close、credit 0 |
| U-GTCAS-004 | self verification、restore receipt欠落、別HEAD/blob/digest | `HIL_GIT_CAS_INDEPENDENT_REVIEW_REQUIRED`またはrestore failure |

positive fixtureもexact 2、closed schema、different actor、fresh capture、全replayとrestoreを要求する。positiveはgate実装の到達性だけを
示し、repositoryにbundleが無い現状のcurrent authorityを主張しない。
