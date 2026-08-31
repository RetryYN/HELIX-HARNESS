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
| `authorForwardPlanTransaction` | `(input, deps?) => ForwardPlanAuthoringTransactionResult` | allocator receipt、Forward／Reverse原稿、exact current HEAD、reservation snapshotが存在する | kernelが受理した両PLANだけをjournal付きNode transactionで同時materializeし、同一bytesのretryを冪等化する | stale HEAD、digest drift、collision、片方向writeでは計画pathを変更しない |

`backfill_state=complete`のterminal／legacy Reverseは既存の`requires`契約を維持する。pending pairのreferences成立をexecution
dependency readyへ昇格させず、confirmed PLANが明示requiresを持つ場合だけready dependencyとして受理する。
予約時点ではReverse本文、review evidence、完了証拠を生成しない。Forward merge後のR0〜R4、独立review、main read-afterは
terminal contractとして残し、予約だけでIssue closeを許可しない。

## production authoring境界

`helix plan author-forward --input <json>`を唯一のproduction consumerとする。input JSONは
`reservationInput`（versioned allocator receiptを含む）、`forwardDocument`、`reverseDocument`を必須とし、allocator生成は行わない。
CLIは固定した`git rev-parse HEAD`以外のcommandを入力から組み立てず、原稿文字列をshellへ渡さない。`--dry-run`はkernel、
document contract、digest、HEAD、snapshotだけを検証し、`.helix/`を含めwriteを行わない。

apply時はForward／Reverseの最終pathが双方とも不存在であることを確認し、一時fileをfsyncしてjournalを保存した後、HEADを
再検証して2 pathをmaterializeする。crash recoveryはprepared journalをcompensateし、commit marker後をroll-forwardする。
同一digestの2 pathが既に存在するretryだけを
`idempotent`として受理する。allocator生成、review、PLAN完了、Reverse R0〜R4は本transactionの非対象とする。

## 検証接続

`U-BACKFILL-008..010`を`tests/backfill-pairing.test.ts`が所有し、draft／confirmed pendingの双方向正例、
片方向、wrong ID、state不一致、terminal requires昇格、`backfill_state`条件除去mutationを検査する。
`U-FPATR-001..006`を`tests/forward-plan-authoring-transaction.test.ts`が所有し、dry-run、同時materialize、冪等retry、
stale HEAD、digest drift、collision、commit直前HEAD drift、typed frontmatterのexact一致を検査する。本文やコメントに
期待tokenが存在しても、wrong Issue／owner／kind／stateを相殺しない。process owner付きlockはlive ownerを拒否し、dead ownerだけを
回収してjournal recoveryをlock内で実行する。
