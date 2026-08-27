---
title: "Atomic Slice Admission L7 runtime単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: QA
plan: docs/plans/PLAN-L6-93-atomic-slice-admission.md
pair_artifact: docs/design/helix/L6-function-design/atomic-slice-admission.md
related_l8: docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md
queue_id: L3Q-IT-023
---

# Atomic Slice Admission L7 runtime単体テスト設計

本artifactはL7 production moduleの実行oracleだけを所有する。PLAN-L5-85が所有する
`L8-atomic-slice-admission-unit-test-design.md`の詳細設計oracleを再所有せず、そのIDと期待結果を実行へ投影する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ATOMIC-001 | `evaluateAtomicSlice` | contract／owner／model ownerを0・2件へ変えadmittedを拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-002 | `canonicalizeAtomicSliceSnapshot` | absolute、`..`、backslash、NUL、root family、duplicateを拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-003 | `evaluateAtomicSlice` | expected／actualの片方向比較mutationを拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-004 | `evaluateAtomicSlice` | companionを1件欠落し別contractで相殺しない | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-005 | `evaluateAtomicSlice` | self-review、別HEAD、旧manifest、delta違いを個別拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-006 | `evaluateAtomicSlice` | expansion receiptで複数behaviorをadmitするmutationを拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-007 | `evaluateAtomicSlice` | recovery failureをsplit／successで相殺せず全件stable順 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-008 | `evaluateAtomicSlice` | path入力順、locale、clockを変えてdigest同一 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-009 | `evaluateAtomicSlice` | add_code直行、prefix skip、evidence欠落を拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-010 | `evaluateAtomicSlice` | current blockerをsuccessorへ送るmutationを拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-011 | `selectAtomicSliceDesignCandidate` | oracle 99%、非有限値、4観測量欠落をunqualified | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-012 | `evaluateAtomicSlice` | lifecycle／invariant 0でpure_function／noneを受理 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-013 | `evaluateAtomicSlice` | HEAD／manifest drift後の旧receipt再利用を拒否 | `tests/atomic-slice-admission.test.ts` |
| U-ATOMIC-ID-001 | `isAtomicContractId` | 2〜6 segmentのuppercase alphanumeric IDを境界値込みで受理 | `tests/atomic-contract-id.test.ts` |
| U-ATOMIC-ID-002 | `isAtomicContractId`／全consumer | 7／8 segment、小文字、空・連続hyphen、空白、underscoreを拒否し、Issue closureだけが広く受理する退行を検出 | `tests/atomic-contract-id.test.ts`、`tests/issue-closure-graph.test.ts` |

`tests/atomic-slice-admission.test.ts`の13 executable casesをprimary citationとする。Redはproduction module未存在、
Greenは13/13、Refactorはcanonical JSON、集合差分、failure orderingを単一helperへ集約した状態である。
ID authority追加時は共有parser suiteとPR／runtime／Issue closure consumer suiteを同時にgreenとし、
各consumerへregexを再導入するmutationを許可しない。
