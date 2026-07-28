---
title: "HELIX L10 受入テスト設計 — 管理・統合セル＋ペア開発セルN"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: QA / TL / PO承認必須
plan: PLAN-L3-43-management-integration-cell-model
pair_artifact: docs/design/helix/L3-requirements/management-integration-cell-requirements.md
---

# HELIX L10 受入テスト設計 — 管理・統合セル＋ペア開発セルN

## §0 合否境界

全oracleは`MIC-FR-001`のsystem observable behaviorを検証する。fixture上の割当成功やUIの緑表示だけで
合格にせず、同一HEADのtask packet、lease、review、CI、DB、merge、read-back receiptを要求する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `MIC-AC-001` | `MIC-R-01` | dependency frontierへ独立task 2件と競合task 1件を投入する | PMが独立2件だけを別laneへexactly once割り当てる | dependency未完了または競合taskの同時dispatchを拒否する |
| `MIC-AC-002` | `MIC-R-02` | 2 laneのlane-ready候補を異なるmerge順で投入する | TLだけが順序を決定しmainへ直列mergeする | writer／reviewerによるmain mergeを拒否する |
| `MIC-AC-003` | `MIC-R-03` | writer terminal後、別identity/session/contextのreviewerがexact HEADを検証する | blocker 0かつ同一HEADの場合だけlane-ready receiptを発行する | 自己review、write可能review、stale HEAD、blocker残存を拒否する |
| `MIC-AC-004` | `MIC-R-04` | required cell bindingの各fieldを1件ずつ欠落・改変する | exact setが揃ったpacketだけをadmitする | unknown追加fieldで欠落を相殺せず、欠落／重複／digest driftを拒否する |
| `MIC-AC-005` | `MIC-R-05` | 同一Issue、責務、共有正本、DB projection、pathを組合せたtaskを投入する | conflict-free taskだけが異なるleaseを取得する | 二重writer、同一Issue重複実行、競合path同時割当を拒否する |
| `MIC-AC-006` | `MIC-R-05` | lane／target reviewer／HEADを変異させた通知を配送する |指定laneの指定reviewerが1回だけackし、ack後switchがoffになる | 別lane取得、重複配送、ack後再配送を拒否する |
| `MIC-AC-007` | `MIC-R-06` | 管理・統合セル1組＋ペア開発セル2組を同時稼働する | 2 laneが独立にPRをlane-readyまで収束する | 片lane failureを独立laneへ波及させない |
| `MIC-AC-008` | `MIC-R-06` | capacityを2からNへ変更しqueue上限を超えるtaskを投入する | 同じpacket／lease／receipt／merge契約を再利用し、超過分をbackpressureする | cell数に応じた別契約、unbounded queue、lease喪失を拒否する |
| `MIC-AC-009` | `MIC-R-02/06` | lane A merge後にlane Bのbase HEADを再評価する | lane Bのbase drift、CI、review、DB receiptを再判定してからmerge候補へ戻す | merge前HEADのreceipt流用を拒否する |
| `MIC-AC-010` | `MIC-R-07` | 工程表／DBのREADY frontierをIssue／PR／Projectsへ投影する | typed packetとread-back snapshotのidentity/stateが一致する | Project手動編集、green表示、Issue closeだけの完了を拒否する |
| `MIC-AC-011` | `MIC-R-07` | stale HEAD、orphan item、unknown option、rate limitを注入する | 完了を進めずbounded retryまたはRecoveryへ遷移する | partial writeやstale projectionを成功扱いしない |
| `MIC-AC-012` | `MIC-R-01..07` | V-model、Production Scrum、Hybridへ同一cell topologyを適用し、Discovery／PoCとDesign HARNESSを必要時追加する | development style、case-driven model、specialist process、組織軸が独立fieldのまま実行できる | cell topologyを第4 style、DiscoveryをScrum phase、Design HARNESSをruntime modeへ変換する出力を拒否する |

## §2 最小実証profile

初期profileは3つのVS Codeウィンドウで、管理・統合セル1組とペア開発セル2組を観測できることを
実証してよい。ただし同じfixtureをheadless CLIまたは別IDEでも実行でき、window countやVS Code固有IDを
receipt schemaへ入れないことを同時に検証する。

## §3 evidence

- PMの割当receipt、writer lease、candidate HEAD、独立review receipt、lane-ready receipt。
- TLのmerge順序decision、combined CIのrun、DB convergence receipt、merge commit。
- 工程表／DB／Issue／PR／Projectsのprojection snapshotとread-back digest。
- negative mutationごとのfailure code、exit code、output digest。

## §4 量閉じ

- behavior contractは`MIC-FR-001`の1件だけとする。
- supporting requirements: `MIC-R-01`〜`MIC-R-07` exact 7件。
- acceptance: `MIC-AC-001`〜`MIC-AC-012` exact 12件。
- 旧`WCC-FR-13`〜`WCC-FR-15`へのtraceは0件。
