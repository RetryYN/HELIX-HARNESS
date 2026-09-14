---
title: "旧資産退役・非実行archiveの上流要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-14
updated: 2026-09-14
product_targets:
  - HELIX-HARNESS
  - HELIX-OS
derived_from:
  - docs/concept/helix-concept-v4.1.md
  - docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md
---

# 旧資産退役・非実行archiveの上流要求候補

## 目的

現行資産を意味採取後の参考資料として保全しながら、current authority、AI read、runtime、CI、配布、復元経路から
確実に外す。要求整理中の物理移動・削除は行わず、上流確定後に新世代replacementから退役条件を導出する。

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| LAR-HARNESS-001 | 退役対象の要求、behavior、設計、検証、consumerに対し、保持・変更・分割・棄却した意味と後継上流IDを確認できる | path削除や旧test greenを意味移管の証拠にしない |
| LAR-HARNESS-002 | 後継に必要なpair、oracle、expected failure、利用者受入、差戻し条件が揃うまで退役を許可しない | 未移管条件を旧実装とのparityやdual-greenで相殺しない |
| LAR-HARNESS-003 | archive資料をcurrent authority・実行可能成果・検証済み能力と区別する共通判定を定める | historicalな成功や旧承認から新世代の進行・完了を生成しない |

## HELIX-OSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| LAR-OS-001 | pathに依存しないasset identity、revision、class、対象製品、authority状態、provenance、dispositionを管理する | rename、重複、未参照を削除理由にしない |
| LAR-OS-002 | source、runtime、AI read、CI、registry、生成、配布、外部writer、復元のconsumer relationを閉じる | 一つのファイル移動で全consumer切替済みと判定しない |
| LAR-OS-003 | replacementのsource revision、artifact、consumer、適用結果、rollback先を退役対象へ束縛する | replacement evidenceなしで旧capabilityを停止しない |
| LAR-OS-004 | archiveをcurrent startup、authority検索、AI context、runtime、CI、package、rollback実行経路から隔離する | archive pathの存在をfallbackや自動復旧元にしない |
| LAR-OS-005 | cutover前後にcurrent consumer、外部writer、schedule、required check、配布先をread-before／read-afterし、旧経路の再出現を拒否する | repo内変更だけでGitHub等の外部状態を停止済みにしない |
| LAR-OS-006 | archive原文、digest、source locator、判断史を保持し、内容変更やcurrent化を別operationとして扱う | 参考資料の改変や再配置からauthorityを生成しない |
| LAR-OS-007 | 法的・security・PII・secret・容量上の理由で物理削除が必要な場合、archive退役と分けてaction-binding approval、対象、証拠を要求する | 通常の整理要求から不可逆削除を認可しない |

## 現在の停止条件

- Concept、対象別L1／L2、L3／L10、replacement evidenceが揃う前にcurrent資産を移動・削除・停止しない。
- 旧資産を新世代のbaseline、parity oracle、fallback、rollback実行経路として再有効化しない。
- archive計画、物理path、manifest、移動単位、cutover commandはL3以降で導出する。
- 既存CI、runtime、hook、AI文書、DB、GitHub設定、配布先を操作しない。

## L11受入候補

全件未実行である。

- 旧pathを削除してもAI read、registry、template、CI、配布、外部schedule、復元経路の一つが残れば退役を不成立にする。
- 後継artifactが存在しても、上流ID、pair、oracle、consumer適用、rollbackの一つが欠ければ退役を許可しない。
- archive内の旧承認、green receipt、成功ログを与えても新世代のauthority・検証・受入・完了へ昇格しない。
- archive原文のdigest不一致、source欠落、current pathへの再出現を個別に検出する。
- 物理削除要求を通常archiveとして処理せず、別の人間承認がない場合は保全したまま停止する。

本候補は退役の意味と責務を分離する入力であり、現行資産の移動・削除・無効化を認可しない。
