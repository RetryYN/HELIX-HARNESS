---
title: "pending Reverse pairing readiness機能設計"
canonical_layer_scheme: L1-L12
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
authority: docs/design/harness/L6-function-design/backfill-pairing.md
plan: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
pair_artifact: docs/test-design/helix/L8-pending-reverse-pairing-readiness-unit-test-design.md
---

# pending Reverse pairing readiness機能設計

## 目的

current Reverseが`backfill_state=pending_reverse`である間、pair identityとexecution dependencyを混同しない。`draft`は
Forward／Reverse双方のexact `dependencies.references`だけをpair成立とし、`confirmed`はreferencesによるidentityまたは
明示済みrequiresによるready dependencyのどちらかを受理する。statusからrequiresを推測生成してはならない。

## 関数契約

| 関数 | シグネチャ | 事前条件 | 事後条件 | 失敗契約 |
|---|---|---|---|---|
| `analyzeBackfill` | `(plans: ParsedPlan[], glossaryText: string) => BackfillResult` | ForwardとReverseのPLAN identity、status、backfill state、references/requiresが解析済み | draft pendingはreferences、confirmed pendingはreferencesまたは明示requires、terminalはrequiresでpairingする | 片方向、wrong Reverse ID、state不一致を`reverseLinkMissing`としてfail-close |
| `reserveForwardReverseTerminalPair` | `(input) => ForwardReverseTerminalReservationResult` | typed `ADD_FEATURE`の`add-impl`、allocator receipt、main HEAD、既存reservation snapshotが一致 | Forwardとpending Reverseのidentity、双方向reference、ownershipを同一projectionへ原子的に予約する | wrong allocator identity、stale main、collisionでは予約を生成せずfail-close |

`backfill_state=complete`のterminal／legacy Reverseは既存の`requires`契約を維持する。pending pairのreferences成立をexecution
dependency readyへ昇格させず、confirmed PLANが明示requiresを持つ場合だけready dependencyとして受理する。
予約時点ではReverse本文、review evidence、完了証拠を生成しない。Forward merge後のR0〜R4、独立review、main read-afterは
terminal contractとして残し、予約だけでIssue closeを許可しない。

## 検証接続

`U-BACKFILL-008..010`を`tests/backfill-pairing.test.ts`が所有し、draft／confirmed pendingの双方向正例、
片方向、wrong ID、state不一致、terminal requires昇格、`backfill_state`条件除去mutationを検査する。
