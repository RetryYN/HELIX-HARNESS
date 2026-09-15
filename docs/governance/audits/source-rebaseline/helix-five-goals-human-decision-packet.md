# HELIX自体の5大目標 人間判断packet

prepared_at: 2026-09-16
status: human_decision_gated_by_current_head_review
decision_id: HDEC-HELIX-FIVE-GOALS-0.1
authority_effect_before_decision: none

## 判断対象

| 対象 | SHA-256 | 状態 |
|---|---|---|
| `docs/concept/helix-five-goals.md` | `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca` | `draft_candidate`、人間判断時のcurrent HEAD review必須 |

SHA-256は上記pathのUTF-8 file bytes全体に対して算出する。内容が変わった場合、この判断対象は失効し、新しいdigestへ
固定し直す。PR、Issue、review、CI、DB、会話の状態はこの判断を成立させない。

## 何を判断するか

POが提示した次の5大目標を、HELIX全体の到達方向として採用してよいかを判断する。

1. システム駆動エージェント自走システム
2. 開発するほど賢くなる自己知能型改善システム
3. 設計から全体をシミュレーションする予測型システム
4. CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム
5. 低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム

判断対象本文は、五項目を既存Conceptへ接続し、確認済みの関与と未確定の責務論点、HELIX-WebのVersion 1後の
利用体験、HELIX-Web-OSのservice運転とlog還流を分離して説明する。同本文の「PO提示原文」節が2026-09-16の指示を
表記変更せず保持する。個別要求、責務の新規割当、数値基準、技術、実装順は本判断へ含めない。

## review状態と未解決事項

| 項目 | 現在値 |
|---|---|
| completed review | [本文HEAD `4f620e32d2f60f2ce80113db1ba4e01d4facd565`のGitHub Claude review](https://github.com/RetryYN/HELIX-HARNESS/pull/1827#issuecomment-5685768483) |
| result | Blocker 0／Major 0／Minor 0 |
| state | 判断対象本文は上記review後に不変。人間判断時は本packetを含むPR current HEADの最新reviewをGitHubからread-afterする |

未解決事項は、承認後に5大目標をConcept v4.1の目的・製品別Conceptへ取り込む改訂範囲、および旧L0 charter §2の
目的P0–P9との保持・追加・重複関係である。
これらを本PRで確定せず、Concept改訂時のsemantic diffと人間判断へ送る。人間判断時はPRのcurrent HEAD、本文file SHA-256、
review対象HEAD／digest、最新findingをread-afterする。本文digestに未reviewの変更がある、または未解消Blocker／Majorが
ある場合は判断を停止する。Minorは内容と処置を示し、人間が残存を認識できる状態にする。

## 選択肢

| 判断 | 結果 |
|---|---|
| `approve` | 上記exact file revisionをHELIX全体の5大目標として承認する。対象別要求と設計は別判断のまま |
| `changes_requested` | 既存Conceptと要求を保持したまま、指定された目標または説明を修正して新しいdigestへ再固定する |
| `reject` | 本候補をauthorityへ昇格しない。既存Concept、要求、台帳の状態は変更しない |

平易な返答では「この5大目標で進める」、または異なる目標と修正内容の指定で足りる。記録時にactor、decision、target path、
SHA-256、時点、維持する条件を`HDEC-HELIX-FIVE-GOALS-0.1`へ束縛する。

## この判断で成立しないもの

- 5大目標から導く個別要求の追加、採否、分割、配置、優先順位。
- Concept v4.1、対象別L1、L2／L11、L3／L10の承認。
- simulation、要求engine、database、CI、bot、dashboard、Worker配置のschema・技術・実装。
- 各目標の達成、HELIX-HARNESS Version 1完成、HELIX-Web展開、release、deployment。
- repository foundation PR #1797またはエージェント七大原則PR #1826のmerge admission。

## 既存上流との接続

| source | SHA-256 | 接続する範囲 |
|---|---|---|
| `docs/concept/helix-concept-v4.1.md` | `56118722c190dddfdf5436cb2c15f8b5773431d18638e0870f8dd03ec68c210e` | 自走、改善、証拠、Worker、HARNESS／OS／Web境界 |
| `docs/concept/product-boundary.md` | `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038` | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務分離 |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L0-charter/helix-charter_v0.1.md` | `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8` | historical sourceの§2目的P0–P9を意味保持し、5大目標との保持・追加・重複をConcept改訂時に比較する |

既存上流は未承認候補であるため、5大目標の承認だけで親Conceptや製品責務境界を承認済みにしない。親sourceが変更された
場合は影響を確認し、本候補を必要に応じて`stale`へ戻す。5大目標が承認されても、Conceptを迂回して対象別L1／L2へ
直接降ろさない。

## 七大原則候補との関係と統合順

5大目標はHELIXの到達方向・価値、別PR #1826の七大原則はエージェントの行動基準である。いずれもConceptに従属し、
一方の承認またはmergeが他方の承認、Concept改訂、要求追加を生成しない。物理統合順はrepository foundation PR #1797、
5大目標PR #1827、#1827上へ載せ直した七大原則PR #1826とする。最終読込順はConcept／製品責務境界→5大目標→
七大原則→対象別L1へ揃える。
