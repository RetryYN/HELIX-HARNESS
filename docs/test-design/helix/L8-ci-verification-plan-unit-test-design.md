---
title: "CI Verification Plan単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / QA
plan: PLAN-L7-706-ci-verification-plan
parent_design: docs/design/helix/L6-function-design/ci-verification-plan.md
pair_artifact: docs/design/helix/L6-function-design/ci-verification-plan.md
---

# CI Verification Plan単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CIVPLAN-001 | 決定性 | 同一authorityから同一partition／digest | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-002 | changed test | graph外でもrequired capabilityへ追加 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-003 | full fallback | high-risk／selector／registryをactive exact setへ展開 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-004 | identity | unknown／wrong HEAD／stale registryを個別拒否 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-005 | deferred | release-onlyをexactly-once targetへ割当 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-006 | dependency | duplicate assignmentとdeferred dependencyを拒否 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-007 | authority | Issue／PLAN kind mismatchを拒否 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-008 | compatibility | legacy itemをcapability IDへ一方向変換 | `tests/ci-verification-plan.test.ts` |
| U-CIVPLAN-009 | legacy mutation | unknown／overlapをcurrent planへ混入させない | `tests/ci-verification-plan.test.ts` |
