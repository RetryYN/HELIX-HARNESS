---
title: "HELIX L8 結合テスト設計 — Universal Reverse／Redesign"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/universal-reverse-redesign.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-04
  - HAC-HIL-04a
  - HAC-HIL-04b
  - HAC-HIL-04c
source_capabilities:
  - HU-CAP-001
---

# HELIX L8 結合テスト設計 — Universal Reverse／Redesign

## §0 共通oracle

固定Issue/drive/source snapshot、R0–R4 artifact、layer/pair graph、screen receipt、PO approval、
isolated harness.db、固定clock/IDを使い、実AI runtimeや外部networkを起動しない。`HU-CAP-001` fixtureは
commit `e506a67e9c243cc9781ff4a6d8d1870b072fd37b`、tree
`2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720`、L5 §0.1のfile SHA-256へbindする。

各caseは正本のcase ID、pre_state、expected_state、canonical failureを独立assertする。加えてphase、
obligation/workload、drive pair、route、stale edge、re-freeze、claim/tool countを直接測る。全caseは未実装である。

| ID | 単一scenario | 期待結果／evidence | HAC | exact HST | pre_state | expected_state | canonical failure | test参照先 |
|---|---|---|---|---|---|---|---|---|
| `IT-URR-001` | 有効なR0–R4とroutingでReverse Gateを評価 | Universal Reverse receipt一件、pair-freeze target current | `HAC-HIL-04a` | `HST-CASE-002-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` | `tests/universal-reverse-pair.integration.test.ts` |
| `IT-URR-002` | R0欠落でReverse Gateを評価 | claim/tool 0、R0不足receipt | `HAC-HIL-04b` | `HST-CASE-002-02` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_STAGE_MISSING` | `tests/universal-reverse-pair.integration.test.ts` |
| `IT-URR-003` | L1変更findingをroute | L1/L14 pairとdescendantをstale化、re-freeze task一件 | `HAC-HIL-04c` | `HST-CASE-002-03` | `pair_current` | `pair_stale` | `HIL_REDESIGN_PAIR_STALE` | `tests/redesign-reentry.integration.test.ts` |
| `IT-URR-004` | L2変更findingをroute | screen/prototype/no-UI receiptをstale化、Screen Applicability再entry一件 | `HAC-HIL-04c` | `HST-CASE-002-04` | `screen_receipt_current` | `screen_receipt_stale` | `HIL_REDESIGN_SCREEN_STALE` | `tests/redesign-reentry.integration.test.ts` |
| `IT-URR-005` | L0変更findingをroute | design write/freeze/claim 0、PO escalation receipt | `HAC-HIL-04c` | `HST-CASE-002-05` | `redesign_pending` | `po_escalation_required` | `HIL_REDESIGN_L0_APPROVAL_REQUIRED` | `tests/redesign-l0-authority.integration.test.ts` |
| `IT-URR-006` | 主駆動モデルIssueでForward claim要求 | driveとR0–R4 pairがcurrentでない全fixtureをclaim 0 | `HAC-HIL-04a` | `HST-CASE-002-06` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_PAIR_MISSING` | `tests/universal-reverse-pair.integration.test.ts` |
| `IT-URR-007` | design defectをRedesignなしで実装修正へroute | first-class Redesign eventなしのForwardを拒否 | `HAC-HIL-04c` | `HST-CASE-002-07` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_ROUTE_MISSING` | `tests/redesign-routing.integration.test.ts` |
| `IT-URR-008` | Reverse/route/freezeの一receiptを欠くIssueで4 transition要求 | ready/implement/merge/close増分0 | `HAC-HIL-04a` | `HST-CASE-002-08` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_GATE_BYPASS` | `tests/reverse-entry-interlock.integration.test.ts` |
| `IT-URR-009` | L0–L6の各findingをroute | L1/L2は正しいpair/screen stale、L0はPO、L3–L6は最小Lへroute | `HAC-HIL-04c` | `HST-CASE-002-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_LAYER_INVALID` | `tests/redesign-routing.integration.test.ts` |
| `IT-URR-010` | Reverse/Redesign/pair-freezeの一つを未完にしてCodex claim要求 | claim/実装tool call 0、具体的blocked reason | `HAC-HIL-04a` | `HST-CASE-002-10` | `assertion_input_ready` | `assertion_pass` | `HIL_IMPLEMENTATION_NOT_READY` | `tests/reverse-entry-interlock.integration.test.ts` |
| `IT-URR-011` | L1/L2 finding後、re-freeze前にForward join要求 | stale pair/screenを検出しclaim/join 0 | `HAC-HIL-04c` | `HST-CASE-002-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REDESIGN_REENTRY_BYPASS` | `tests/redesign-reentry.integration.test.ts` |
| `IT-URR-012` | R0–R4全assertionを有効にしてsubstance Gate評価 | phase別semantic coverage 100% receipt | `HAC-HIL-04a`, `HAC-HIL-04b` | `HST-CASE-018-01` | `reverse_r4` | `pair_freeze_ready` | `なし（正常系）` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-013` | R0 source spanを空にして確定 | phase receipt 0、source不足を列挙 | `HAC-HIL-04b` | `HST-CASE-018-02` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_SUBSTANCE_SOURCE_MISSING` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-014` | R1をplaceholderにして確定 | phase receipt 0 | `HAC-HIL-04b` | `HST-CASE-018-03` | `reverse_r1` | `reverse_r1` | `HIL_REVERSE_SUBSTANCE_PLACEHOLDER` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-015` | R2 semantic assertionをR1と同文にして確定 | phase receipt 0 | `HAC-HIL-04b` | `HST-CASE-018-04` | `reverse_r2` | `reverse_r2` | `HIL_REVERSE_SUBSTANCE_IDENTICAL` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-016` | R3 output digestをR2から再利用して確定 | phase receipt 0 | `HAC-HIL-04b` | `HST-CASE-018-05` | `reverse_r3` | `reverse_r3` | `HIL_REVERSE_SUBSTANCE_DIGEST_REUSED` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-017` | R4 obligation一件を未被覆にして確定 | incomplete一件、completion/claim 0 | `HAC-HIL-04b` | `HST-CASE-018-06` | `reverse_r4` | `reverse_r4` | `HIL_REVERSE_OBLIGATION_MISSING` | `tests/reverse-workload.integration.test.ts` |
| `IT-URR-018` | workload budget上限で完了要求 | 元分母を保持したcheckpoint一件、完了0 | `HAC-HIL-04b` | `HST-CASE-018-07` | `reverse_incomplete` | `reverse_incomplete` | `HIL_REVERSE_BUDGET_INCOMPLETE` | `tests/reverse-workload.integration.test.ts` |
| `IT-URR-019` | R1を欠いたままR0からR2へ遷移 | transition 0、R1 obligation保持 | `HAC-HIL-04b` | `HST-CASE-018-08` | `reverse_r0` | `reverse_r0` | `HIL_REVERSE_PHASE_SKIP` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-020` | 空、placeholder、同文、同digest、未被覆を個別投入 | 全不正artifactをstage固有assertionで拒否 | `HAC-HIL-04b` | `HST-CASE-018-09` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SUBSTANCE_HOLLOW` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-021` | skip、例外値、budget途中停止で完了とclaim要求 | 未完obligationを保持してcheckpoint、claim 0 | `HAC-HIL-04b` | `HST-CASE-018-10` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_OBLIGATION_WAIVED` | `tests/reverse-workload.integration.test.ts` |
| `IT-URR-022` | 非空だが同文、同digest、spanなし、coverage不足を個別投入 | semantic assertionで全不備拒否、receipt/claim 0 | `HAC-HIL-04b` | `HST-CASE-018-11` | `assertion_input_ready` | `assertion_pass` | `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` | `tests/reverse-substance.integration.test.ts` |
| `IT-URR-023` | manifest/event/run/R0–R4 artifact/workload/pair/route各appendへfault、CAS loser、same/different digest retry、およびstale/refreeze payload混載を投入 | fault/CAS/conflictはReverse本体write 0。同operation同digestは同receipt一件、異digestはconflict。混載はrejectされ、stale/refreeze増分0。event rebuild digest一致 | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting atomic commit oracle | `commit_ready` | `committed` | `HIL_REVERSE_TRANSACTION_CONFLICT` | `tests/universal-reverse-transaction.integration.test.ts` |
| `IT-URR-024` | state/data/schema/runtime/dependency差分とcontract差分をmatrix分類し、migration plan/dry-run/backup/rollback/monitoringを一件ずつ欠落・stale化 | Retrofit routeは全evidence current時だけcommit。contract併存は同causality Redesign先行、欠落時claim 0 | `HAC-HIL-04c` | supporting Retrofit oracle | `route_pending` | `migration_ready` | `HIL_RETROFIT_EVIDENCE_INCOMPLETE` | `tests/retrofit-routing.integration.test.ts` |
| `IT-URR-025` | finding/parent Issue/run/route/affected layer/stale closureのcausalityを個別変異 | Redesign/stale commit 0、同一causality完全版だけroute＋stale receipt | `HAC-HIL-04c` | supporting Redesign causality oracle | `route_pending` | `causality_bound` | `HIL_REDESIGN_CAUSALITY_INVALID` | `tests/redesign-causality.integration.test.ts` |
| `IT-URR-026` | parent Reverse receipt付きstale operationと、parent stale receipt付きrefreeze operationを順に実行し、各中間appendへfault、親欠落、同operation混載を注入 | stale closure/refreezeは別operationで各partial 0。親receipt欠落・順序逆転・混載は全write 0。refreeze成功後だけstale 0とclaim eligibilityを公開 | `HAC-HIL-04c` | supporting stale/refreeze oracle | `pair_stale` | `refrozen` | `HIL_REDESIGN_REFREEZE_COMMIT_FAILED` | `tests/redesign-refreeze-transaction.integration.test.ts` |
| `IT-URR-027` | commit receipt消失、projection欠損、crash後同operation retryをimmutable artifact/eventからreconcile | artifact/route/freezeを推測せず、evidence一致時だけreceipt一件と同projection digestへ復旧 | `HAC-HIL-04a`, `HAC-HIL-04b`, `HAC-HIL-04c` | supporting reconcile oracle | `commit_pending` | `committed` | `HIL_REVERSE_RECONCILE_FAILED` | `tests/universal-reverse-reconcile.integration.test.ts` |

## §1 合否

22/22すべてでcase ID、pre_state、expected_state、canonical failureをexactly-onceでassertする。
range、代表case、まとめ行での代替を禁止する。R0–R4全workload、route minimality、L0 PO authority、
L1/L2 stale/re-entry、claim-before-tool countも保存する。正常caseだけ`なし（正常系）`とする。
