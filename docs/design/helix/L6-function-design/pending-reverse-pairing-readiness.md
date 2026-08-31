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
| `authorForwardPlanTransaction` | `(input, deps?) => ForwardPlanAuthoringTransactionResult` | exact allocation要求、live origin/main、Forward／Reverse原稿、既存reservation authorityが一致する | transaction内issuerがreceiptを発行し、PLAN 2件、receipt、更新済みreservation authorityをsealed journalの同一transactionでmaterializeして再読込する | caller署名receipt、authority drift、symlink、collision、seal不正、partial commitをfail-close／roll-forwardする |

`backfill_state=complete`のterminal／legacy Reverseは既存の`requires`契約を維持する。pending pairのreferences成立をexecution
dependency readyへ昇格させず、confirmed PLANが明示requiresを持つ場合だけready dependencyとして受理する。
予約時点ではReverse本文、review evidence、完了証拠を生成しない。Forward merge後のR0〜R4、独立review、main read-afterは
terminal contractとして残し、予約だけでIssue closeを許可しない。

## production authoring境界

`helix plan author-forward --input <json>`を唯一のproduction consumerとする。input JSONは
`reservationInput`、`reservationAuthorityPath`、両documentを必須とする。`allocation_id`は1〜128文字の
`[A-Za-z0-9][A-Za-z0-9._:-]*`だけを受理する。caller提供`receipt_digest`は拒否し、live authorityと
既存reservation projectionを検証したtransaction内issuerだけがexact ID receiptを発行する。receiptは
`.helix/state/plan-allocator-receipts/<allocation_id>.json`、reservation authorityは既存
`.helix/state/open-branch-plan-reservations.json`だけを認める。CLIは固定git command以外を入力から組み立てない。

apply時はForward／Reverse／receiptの最終pathがすべて不存在であることを確認し、一時fileをfsyncしてjournalを保存した後、HEADを
再検証して3 create artifactをhard-link no-clobberで作成し、reservation authorityをCAS更新する。journalはHEAD、main、issuer receipt、
authority before/after、4 artifactをsealする。recoveryはfinal／stagedのphysical pathをアクセスごとに再検証する。prepared中に
create finalが出現した場合はdigest一致でも外部writeとして保持してfail-closeする。preparedはcompensate、commit marker後は
roll-forwardし、未収束時は`recovery_required`を返す。全artifactと再読込authorityが一致するretryだけを
`idempotent`として受理する。review、PLAN完了、Reverse R0〜R4は本transactionの非対象とする。

## 検証接続

`U-BACKFILL-008..010`を`tests/backfill-pairing.test.ts`が所有し、draft／confirmed pendingの双方向正例、
片方向、wrong ID、state不一致、terminal requires昇格、`backfill_state`条件除去mutationを検査する。
`U-FPATR-001..012`が4 artifact同時永続化／再読込、live main、caller-forge拒否、no-clobber、exact references／workflow identity、
process-start／host／token lock、realpath、snapshot／digest drift、journal seal／HEAD binding、journal後parent symlink swap、
prepared external write保持、bounded allocation IDを列挙検証する。
