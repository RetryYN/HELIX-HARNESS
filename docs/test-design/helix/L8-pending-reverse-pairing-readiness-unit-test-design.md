---
title: "pending Reverse pairing readiness単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
authority: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
plan: docs/plans/PLAN-L7-699-pending-reverse-pairing-readiness.md
pair_artifact: docs/design/helix/L6-function-design/pending-reverse-pairing-readiness.md
---

# pending Reverse pairing readiness単体テスト設計

| U-ID | 対象 | 正例 | 反例／mutation | test citation |
|---|---|---|---|---|
| U-BACKFILL-008 | `analyzeBackfill` | `draft`かつ`pending_reverse`のReverseとForwardが双方向referencesで一致 | Forward側欠落、wrong Reverse ID、state不一致を拒否し、`backfill_state`条件除去mutationをkill | `tests/backfill-pairing.test.ts` |
| U-BACKFILL-009 | confirmed pending pair | `confirmed`かつ`pending_reverse`では双方向referencesまたは明示requiresでpair identityを維持 | statusだけからrequiresを推測せず、link欠落を拒否 | `tests/backfill-pairing.test.ts` |
| U-BACKFILL-010 | terminal dependency | `backfill_state=complete`ではForward `requires`でpairingする | terminal Reverseをreferences-onlyのまま残した場合は拒否 | `tests/backfill-pairing.test.ts` |
| U-FRTR-001 | atomic reservation | allocator receiptからForward／Reverseの双方向pending予約を同時生成 | Forward単独生成を許可しない | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-002 | identity／HEAD | allocator独立採番とForward由来semantic slugが一致するReverse、current mainを受理 | wrong Forward、receipt-validなwrong Reverse slug、stale mainを個別拒否 | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-003 | collision | 既存reservation projectionへ2予約を追加 | 異ownerのactive collisionを拒否 | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-004 | current output | typed identityとpending stateだけを出力 | legacy `route_mode`、旧mode、未実測review evidenceを出力しない | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FPATR-001 | dry-run boundary | semantic slug、両原稿、HEAD／snapshotを検証してdeterministic allocationを計画する | `docs/plans/`、`.helix/`を変更したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-002 | production materialization | Forward／pending Reverse／issuer receipt／reservation authorityを同時materializeし、read-afterと同一bytes retryを検証する | 4 artifactの一部だけを生成する、同一retryで再writeしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-003 | issuer authority | remote mainに束縛したtransaction内issuerだけがreceiptを生成する | remote main driftまたはcaller exact ID／自己署名`receipt_digest`を受理したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-004 | commit boundary | collisionなし、commit直前も同一HEADならcommitする | existing path collision、preflight後HEAD drift、途中write失敗をfail-closeしcompensateする | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-005 | typed frontmatter | Forward／ReverseのID、kind、Issue、owner、state、相互referenceがexact一致する | wrong frontmatterを本文・コメント内の期待tokenで偽装しても拒否する | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-006 | writer lock | dead owner lockを回収してtransactionを再開する | live owner lockを回収せず`authoring_transaction_locked`で拒否する | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-007 | physical boundary | canonical repo realpathを受理 | symlink alias／repo escapeを拒否 | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-008 | authority drift | exact snapshot／document digestを受理 | caller snapshot drift／document digest driftを拒否 | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-009 | sealed journal | HEAD／main／issuer receipt／authority／4 artifactをseal | seal改変とcommit直前HEAD driftを拒否しpreparedをcompensate | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-010 | recovery physical boundary | recoveryのfinal／staged pathをアクセスごとにrealpath再検証 | journal作成後のparent symlink swapを拒否せず外部pathへwriteしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-011 | prepared ownership | prepared中はcreate finalが不存在の場合だけcompensate | 同digestの外部finalをtransaction所有と誤認して削除したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-012 | semantic request | bounded lowercase semantic slugを受理 | slash、backslash、dot segment、過長、制御文字、colonを受理したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-013 | allocator anchor | exact branch／HEAD／assignment／lease／fenceのactive_writerをauthority anchorにする | anchor欠落またはevidence unavailableでexact IDを発行したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-014 | journal-first staging | prepared journalのdurable作成後だけstageを作成し、crash後のretryがrecoveryしてcommitする | journal作成直後crashでjournalなしstaged orphanを残す、または次回retryが収束しなければfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-015 | fresh authority provider | provider snapshot／digest、local expected、caller expectedのexact一致だけを受理 | provider unavailable、stale、wrong lease、wrong head、collisionを拒否せずlocal/callerへfallbackしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-FRTR-001 | atomic reservation | Forward単独生成を許さず双方向pending予約を同時生成する | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-002 | identity／HEAD | wrong Forward、wrong Reverse、stale mainを個別拒否する | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-003 | collision | 異ownerのactive collisionを既存projectionで拒否する | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FRTR-004 | current output | legacy identityと未実測証拠を生成しない | `tests/forward-reverse-terminal-reservation.test.ts` |
| U-FPATR-001 | dry-run boundary | validationだけでfilesystem writeが発生したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-002 | production materialization | 4 artifactの欠落、receipt／projection再読込不一致、同一bytes retryで再writeしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-003 | issuer authority | remote main driftまたはcaller exact ID／自己署名receiptをauthorityとして受理したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-004 | commit boundary | collision、commit直前HEAD drift、途中失敗で片方向pathを残したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-005 | typed frontmatter | prose／comment内tokenでwrong Issue、owner、kind、stateを相殺したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-006 | writer lock | live owner lockをstale扱いして二重writerを許したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-007 | physical boundary | symlink／realpath escapeを許したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-008 | authority drift | caller snapshot／document digest driftを許したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-009 | sealed journal | seal改変またはHEAD driftをtransaction外へ漏らしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-010 | recovery physical boundary | journal後のparent symlink swapを見逃したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-011 | prepared ownership | prepared中に出現した同digest finalを削除したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-012 | semantic request | path非正規またはboundedでないsemantic slugを受理したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-013 | allocator anchor | exact active_writer anchorなしでIDを発行したらfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-014 | journal-first staging | journal作成直後crashでstaged orphanが残る、またはretry recovery→commitできなければfail | `tests/forward-plan-authoring-transaction.test.ts` |
| U-FPATR-015 | fresh authority provider | unavailable／stale／wrong lease／wrong head／collision時にlocal snapshotへfallbackしたらfail | `tests/forward-plan-authoring-transaction.test.ts` |

pending Reverseのpair成立をterminal／legacy `requires`契約の代替にせず、execution dependency readyも推測しない。
authoring transactionのgreenをallocator ID選定policy、review、completion、Reverse検証の完了証拠へ拡張しない。
#1256 adapter未接続中のgreenはinjected provider contractのunit evidenceであり、production write admissionやIssue #1297 completionを意味しない。
