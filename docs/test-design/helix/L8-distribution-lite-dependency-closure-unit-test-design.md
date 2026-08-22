---
title: "distribution Lite dependency closure単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md
---

# distribution Lite dependency closure単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTCLOSE-001 | static import closure | entrypointから到達する全relative importがartifact exact setにある場合だけgreen | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-002 | ownership境界 | source treeに存在してもartifact ownership外のimportをmissingとして拒否 | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-003 | dynamic ownership | literal dynamic importをdynamic asset exact setへ明示しない場合に拒否 | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-004 | current profile | `consumer_core_v1` consumer entrypointのmissing countが0、excluded marker到達が0 | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-005 | excluded reachability | exact artifact set内でもexcluded capability由来pathへ到達した場合に独立して拒否 | `tests/distribution-dependency-closure.test.ts` |
fixture greenだけで完了せず、current profile接合を0 missingへするまでcompletion claimを許可しない。
