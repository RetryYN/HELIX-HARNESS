---
title: "HELIX L7 単体テスト設計 — Universal Reverse／Redesign"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-04
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-002
  - HST-HIL-018
pair_artifact: docs/design/helix/L6-function-design/universal-reverse-redesign.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-04
  - HAC-HIL-04a
  - HAC-HIL-04b
  - HAC-HIL-04c
source_capabilities:
  - HU-CAP-001
---

# HELIX L7 単体テスト設計 — Universal Reverse／Redesign

固定snapshot、clock、ID、in-memory portを使い、外部runtime、network、実DBを変更しない。
各rowは一つのcanonical case/state/failure tupleだけを主oracleにする。全caseは未実装である。

| ID | exact function | 反例と期待結果 | HAC | exact HST | pre_state | expected_state | canonical failure | test参照先 |
|---|---|---|---|---|---|---|---|---|
| `U-URR-001` | `compileUniversalReverseManifest` | R0–R4原子分母とpair targetをstable生成 | `HAC-HIL-04a` | `HST-CASE-002-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` | `tests/universal-reverse-pair.test.ts` |
| `U-URR-002` | `rejectMissingReverseStage` | R0欠落を全列挙しclaim 0 | `HAC-HIL-04b` | `HST-CASE-002-02` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_STAGE_MISSING` | `tests/universal-reverse-pair.test.ts` |
| `U-URR-003` | `invalidateL1VerticalPair` | L1/L14、上下edge、全descendantを閉包 | `HAC-HIL-04c` | `HST-CASE-002-03` | `pair_current` | `pair_stale` | `HIL_REDESIGN_PAIR_STALE` | `tests/redesign-reentry.test.ts` |
| `U-URR-004` | `invalidateL2ScreenDecision` | screen/prototype/no-UIとL3以降を閉包 | `HAC-HIL-04c` | `HST-CASE-002-04` | `screen_receipt_current` | `screen_receipt_stale` | `HIL_REDESIGN_SCREEN_STALE` | `tests/redesign-reentry.test.ts` |
| `U-URR-005` | `requirePoEscalationForL0` | approval欠落、AI、別snapshotでwrite/freeze/claim 0 | `HAC-HIL-04c` | `HST-CASE-002-05` | `redesign_pending` | `po_escalation_required` | `HIL_REDESIGN_L0_APPROVAL_REQUIRED` | `tests/redesign-l0-authority.test.ts` |
| `U-URR-006` | `validateDriveReversePair` | drive/Reverseのrevision/scope/snapshotを個別変異しclaim 0 | `HAC-HIL-04a` | `HST-CASE-002-06` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_PAIR_MISSING` | `tests/universal-reverse-pair.test.ts` |
| `U-URR-007` | `requireRedesignRoute` | design defectのForward直行、prose-only routeを拒否 | `HAC-HIL-04c` | `HST-CASE-002-07` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_ROUTE_MISSING` | `tests/redesign-routing.test.ts` |
| `U-URR-008` | `validateReverseReadinessForTransition` | ready/implement/merge/closeでreceiptを一件ずつ欠落 | `HAC-HIL-04a` | `HST-CASE-002-08` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_GATE_BYPASS` | `tests/reverse-entry-interlock.test.ts` |
| `U-URR-009` | `resolveMinimalAffectedLayer` | L0–L6で一段上/下一段のrouteを拒否 | `HAC-HIL-04c` | `HST-CASE-002-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_LAYER_INVALID` | `tests/redesign-routing.test.ts` |
| `U-URR-010` | `authorizeClaimBeforeTool` | Reverse/route/freeze/lease欠落でclaim/tool 0 | `HAC-HIL-04a` | `HST-CASE-002-10` | `assertion_input_ready` | `assertion_pass` | `HIL_IMPLEMENTATION_NOT_READY` | `tests/reverse-entry-interlock.test.ts` |
| `U-URR-011` | `validateRedesignReentry` | L1/L2 stale、旧receipt、別lineageでForward join 0 | `HAC-HIL-04c` | `HST-CASE-002-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_REENTRY_BYPASS` | `tests/redesign-reentry.test.ts` |
| `U-URR-012` | `sealReverseSubstanceCoverage` | 全phase 100% coverageだけpair-freeze ready | `HAC-HIL-04a`, `HAC-HIL-04b` | `HST-CASE-018-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-013` | `validateR0SourceSpans` | span空、unpinned、unreadable未計上を拒否 | `HAC-HIL-04b` | `HST-CASE-018-02` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_SUBSTANCE_SOURCE_MISSING` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-014` | `validateR1ObservedContracts` | placeholder、skip、探索なし結論を拒否 | `HAC-HIL-04b` | `HST-CASE-018-03` | `reverse_r1` | `reverse_r1` | `HIL_REVERSE_SUBSTANCE_PLACEHOLDER` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-015` | `validateR2AsIsSemanticDelta` | R1同文、同assertion、孤立nodeを拒否 | `HAC-HIL-04b` | `HST-CASE-018-04` | `reverse_r2` | `reverse_r2` | `HIL_REVERSE_SUBSTANCE_IDENTICAL` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-016` | `validateR3IntentDigest` | R2 digest再利用、反証/PO receipt欠落を拒否 | `HAC-HIL-04b` | `HST-CASE-018-05` | `reverse_r3` | `reverse_r3` | `HIL_REVERSE_SUBSTANCE_DIGEST_REUSED` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-017` | `accountR4ObligationCoverage` | obligation一件欠落、routeなしでincomplete | `HAC-HIL-04b` | `HST-CASE-018-06` | `reverse_r4` | `reverse_r4` | `HIL_REVERSE_OBLIGATION_MISSING` | `tests/reverse-workload-ledger.test.ts` |
| `U-URR-018` | `checkpointReverseBudget` | budget到達でtotal維持、completion/claim 0 | `HAC-HIL-04b` | `HST-CASE-018-07` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_BUDGET_INCOMPLETE` | `tests/reverse-workload-ledger.test.ts` |
| `U-URR-019` | `validateReversePhaseSequence` | R1欠落でR0→R2 transition 0 | `HAC-HIL-04b` | `HST-CASE-018-08` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_PHASE_SKIP` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-020` | `detectHollowReverseArtifact` | 空/placeholder/同文/同digest/未被覆を個別分類 | `HAC-HIL-04b` | `HST-CASE-018-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SUBSTANCE_HOLLOW` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-021` | `preventReverseObligationWaiver` | range/sample/skip/例外/budget免除を全拒否 | `HAC-HIL-04b` | `HST-CASE-018-10` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_OBLIGATION_WAIVED` | `tests/reverse-workload-ledger.test.ts` |
| `U-URR-022` | `validateReverseSemanticCoverage` | 非空でも同文/digest/span/coverage不足を全拒否 | `HAC-HIL-04b` | `HST-CASE-018-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` | `tests/reverse-substance-gate.test.ts` |
| `U-URR-023` | `classifyRetrofitDelta` | state/data/schema/runtime/dependencyとcontract差分を個別分類しunknown Forward fallback 0 | `HAC-HIL-04c` | supporting | `route_pending` | `classified` | `HIL_RETROFIT_CLASSIFICATION_INVALID` | `tests/retrofit-classifier.test.ts` |
| `U-URR-024` | `validateRetrofitMigrationEvidence` | plan/dry-run/backup/rollback rehearsal/monitoring/abort threshold/snapshotを一fieldずつ欠落・stale化 | `HAC-HIL-04c` | supporting | `classified` | `migration_ready` | `HIL_RETROFIT_EVIDENCE_INCOMPLETE` | `tests/retrofit-evidence.test.ts` |
| `U-URR-025` | `bindRedesignCausality` | finding/parent/run/route/layer/stale digest不一致を拒否 | `HAC-HIL-04c` | supporting | `route_pending` | `causality_bound` | `HIL_REDESIGN_CAUSALITY_INVALID` | `tests/redesign-causality.test.ts` |
| `U-URR-026` | `buildUniversalReverseCommitBundle` | 全write set、FK target、expected heads/revisions、operation/payload欠落を拒否 | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `prepared` | `commit_ready` | `HIL_REVERSE_TRANSACTION_INVALID` | `tests/universal-reverse-transaction.test.ts` |
| `U-URR-027` | `commitUniversalReverseBundle` | 各append fault、FK/unique/check、CAS、same/different digest retryでpartial 0／exactly-one | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_ready` | `committed` | `HIL_REVERSE_TRANSACTION_CONFLICT` | `tests/universal-reverse-transaction.test.ts` |
| `U-URR-028` | `commitRedesignStaleClosure` | descendant edge一件欠落/faultでstale publication 0 | `HAC-HIL-04c` | supporting | `pair_current` | `pair_stale` | `HIL_REDESIGN_STALE_COMMIT_FAILED` | `tests/redesign-stale-transaction.test.ts` |
| `U-URR-029` | `commitReentryRefreeze` | stale supersession/pair/oracle/lineage/freeze一件欠落/faultでclaim eligibility 0 | `HAC-HIL-04c` | supporting | `pair_stale` | `refrozen` | `HIL_REDESIGN_REFREEZE_COMMIT_FAILED` | `tests/redesign-refreeze-transaction.test.ts` |
| `U-URR-030` | `reconcileUniversalReverseCommit` | immutable evidence/head一致時だけreceipt/projectionを復旧しphase/route/freezeを推測しない | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting | `commit_pending` | `committed` | `HIL_REVERSE_RECONCILE_FAILED` | `tests/universal-reverse-reconcile.test.ts` |

## §1 合否

22/22でexact function、case ID、pre_state、expected_state、canonical failureを一対一で保存する。
range、まとめcase、代表sampleでの省略を禁止する。
