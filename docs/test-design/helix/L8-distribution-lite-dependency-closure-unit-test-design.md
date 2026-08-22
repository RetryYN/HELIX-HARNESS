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
| U-DISTCLOSE-006 | consumer command exact set | setup／status／consumer doctor／completion evidenceだけを受理 | `tests/distribution-consumer-command-registry.test.ts` |
| U-DISTCLOSE-007 | minimal delegated workflow | Codex／Claudeの非execute dry-runだけを受理 | `tests/distribution-consumer-command-registry.test.ts` |
| U-DISTCLOSE-008 | excluded command | team／lane／securityと曖昧なdelegationを拒否 | `tests/distribution-consumer-command-registry.test.ts` |
| U-DISTCLOSE-009 | exact dispatch | admitted command IDに対応するhandlerだけを一度起動 | `tests/distribution-consumer-command-composition.test.ts` |
| U-DISTCLOSE-010 | side effect 0 rejection | rejected Full commandでは全handler起動0 | `tests/distribution-consumer-command-composition.test.ts` |
| U-DISTCLOSE-011 | handler identity | handlerが別command IDを返した場合に拒否 | `tests/distribution-consumer-command-composition.test.ts` |
| U-DISTCLOSE-012 | minimal Node adapter | provider dry-runだけを既存adapter planへ接続する | `tests/distribution-consumer-node-adapter.test.ts` |
| U-DISTCLOSE-013 | bounded task-file port | task-file本文だけをpromptへ投影しpathをauthority化しない | `tests/distribution-consumer-node-adapter.test.ts` |
fixture greenだけで完了せず、current profile接合を0 missingへするまでcompletion claimを許可しない。
