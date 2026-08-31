---
title: CI deferred obligation recovery unit test design
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-31
updated: 2026-08-31
owner: Codex / QA
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
plan: PLAN-L7-717-ci-deferred-obligation-recovery
pair_artifact: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
---

# CI deferred obligation recovery単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CIDEFER-001 | exactly-once receipt | assignmentを最初のterminal runへ接続しdigestを固定する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-002 | terminal cardinality | missing、duplicate、expiredを個別にfail-closeする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-002A | evaluation timestamp | 不正な`evaluated_at`を期限判定へ流さずAPI／CLIの両方でfail-closeする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-003 | recovery identity | wrong profile、stale HEAD、wrong origin、cancelledを相殺しない | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-004 | backprop | failureをselector、registry edge、oracleへbackpropする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-005 | quarantine | owner、期限、replacement oracle欠落を拒否する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-006 | safety metrics | escaped defectまたはmutation未検出があれば時間短縮を拒否する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-007 | CLI adapter | projection JSONを出力しfinding時は非zeroでfail-closeする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-008 | Verification Plan接合 | canonical `main / nightly / release` targetをassignmentへ一方向投影する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-009 | assignment projection | edge欠落またはterminal receiptの再割当を拒否する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-010 | selector fault injection E2E | edge削除、risk downgrade、Module closure欠落、test owner誤配線、artifact reuse誤りを各authority層で検出する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-011 | profile full contract | `main / nightly / release`の全profileを縮退させずexactly-once回収する | `tests/ci-deferred-obligation-recovery.test.ts` |

U-CIDEFER-010はproduction registry fixtureからVerification PlanとSchedulerまでを実合成し、5 mutationを
workflow inputへ注入する。単独domainのmock greenではなく、selector、aggregate、schedulerの実findingを検査する。
