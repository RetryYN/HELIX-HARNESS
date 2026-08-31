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
| `authorForwardPlanTransaction` | `(input, deps?) => ForwardPlanAuthoringTransactionResult` | semantic Reverse slug、remote main、Forward／Reverse原稿、availableな既存reservation authority、同writer anchorが一致する | authority exact setからnext free Reverse familyとallocation IDを決定し、PLAN 2件、receipt、更新authorityを同一transactionでmaterializeして再読込する | caller exact ID、anchor欠落、authority drift、symlink、collision、seal不正、partial commitをfail-close／roll-forwardする |

`backfill_state=complete`のterminal／legacy Reverseは既存の`requires`契約を維持する。pending pairのreferences成立をexecution
dependency readyへ昇格させず、confirmed PLANが明示requiresを持つ場合だけready dependencyとして受理する。
予約時点ではReverse本文、review evidence、完了証拠を生成しない。Forward merge後のR0〜R4、独立review、main read-afterは
terminal contractとして残し、予約だけでIssue closeを許可しない。

## production authoring境界

`helix plan author-forward --input <json>`を唯一のproduction consumerとする。input JSONは
`reservationInput`、`reservationAuthorityPath`、両documentを必須とする。callerはbounded lowercase
`reverse_slug`だけを要求し、`allocation_id`、Forward／Reverse exact allocation ID、`receipt_digest`の提供を禁止する。
transaction内allocatorはavailableな`current_main`／`open_pr`／`active_writer` exact setのReverse最大番号+1を選び、
同一branch／HEAD／assignment／lease／fenceのactive_writer anchorが存在するときだけexact ID receiptを発行する。receiptは
`.helix/state/plan-allocator-receipts/<allocation_id>.json`、reservation authorityは既存
`.helix/state/open-branch-plan-reservations.json`だけを認める。production defaultのmain authorityはtracking refでなく
`git ls-remote origin refs/heads/main`から取得する。CLIは固定git command以外を入力から組み立てない。

#1258のlocal snapshotはpure projectionかつexpected valueであり、fresh authorityではない。transactionは
`FreshReservationAuthority` providerが同時取得したsnapshot exact setとそのdigestを必須とし、provider値、local expected file、
caller expected snapshotの3者がexact一致するときだけ採番する。#1256のlive GitHub／assignment adapterは未実装であるため、
production default providerは明示fail-closeし、CLI production writeは#1256接続まで非admittedとする。local fileやcaller inputへの
fallbackは禁止する。

apply時はForward／Reverse／receiptの最終pathがすべて不存在であることを確認し、prepared journalを先にdurable作成してから
4 staged fileをfsyncする。commit前にstage exact setと全digest、HEAD、remote mainを再検証し、3 create artifactを
hard-link no-clobberで作成してreservation authorityをCAS更新する。journalはHEAD、main、issuer receipt、
authority before/after、4 artifactをsealする。recoveryはfinal／stagedのphysical pathをアクセスごとに再検証する。prepared中に
create finalが出現した場合はdigest一致でも外部writeとして保持してfail-closeする。preparedはcompensate、commit marker後は
roll-forwardし、未収束時は`recovery_required`を返す。全artifactと再読込authorityが一致するretryだけを
`idempotent`として受理する。review、PLAN完了、Reverse R0〜R4は本transactionの非対象とする。

## 検証接続

`U-BACKFILL-008..010`を`tests/backfill-pairing.test.ts`が所有し、draft／confirmed pendingの双方向正例、
片方向、wrong ID、state不一致、terminal requires昇格、`backfill_state`条件除去mutationを検査する。
`U-FPATR-001..015`が4 artifact同時永続化／再読込、remote main、fresh provider、caller exact-ID拒否、deterministic allocation、no-clobber、exact references／workflow identity、
process-start／host／token lock、realpath、snapshot／digest drift、journal seal／HEAD binding、journal後parent symlink swap、
prepared external write保持、bounded semantic slug、writer anchor、journal-first crash recovery、provider unavailable／stale／wrong lease／wrong head／collisionを列挙検証する。
