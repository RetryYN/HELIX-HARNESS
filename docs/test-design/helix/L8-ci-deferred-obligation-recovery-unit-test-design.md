---
title: CI deferred obligation recovery unit test design
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-31
updated: 2026-08-31
owner: Codex / QA
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
plan: PLAN-L7-717-ci-deferred-obligation-recovery
pair_artifact: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
---

# CI deferred obligation recovery unit test design

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CIDEFER-001 | exactly-once receipt | assignmentを最初のterminal runへ接続しdigestを固定する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-002 | terminal cardinality | missing、duplicate、expiredを個別にfail-closeする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-003 | recovery identity | wrong profile、stale HEAD、wrong origin、cancelledを相殺しない | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-004 | backprop | failureをselector、registry edge、oracleへbackpropする | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-005 | quarantine | owner、期限、replacement oracle欠落を拒否する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-006 | safety metrics | escaped defectまたはmutation未検出があれば時間短縮を拒否する | `tests/ci-deferred-obligation-recovery.test.ts` |
| U-CIDEFER-007 | CLI adapter | projection JSONを出力しfinding時は非zeroでfail-closeする | `tests/ci-deferred-obligation-recovery.test.ts` |

後続E2Eではselector edge削除、risk downgrade、Module closure欠落、test owner誤配線、artifact reuse誤りを
workflow inputへ注入し、selector、aggregate、recoveryのいずれかが全件検出することを確認する。
