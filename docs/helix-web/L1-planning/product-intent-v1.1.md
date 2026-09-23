---
title: "HELIX-Web L1企画 v1.1改訂候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft_candidate
authority_status: awaiting_human_approval
parent_candidate: docs/concept/helix-concept-v4.2.md
previous_approved_l1_sha256: 26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756
parent_concept_sha256: b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf
source_goals_sha256: cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca
source_vision: archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md
source_vision_sha256: 1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74
created: 2026-09-14
updated: 2026-09-24
---

# HELIX-Web L1企画 v1.1改訂候補

承認済みv4.1親の[L1本文](product-intent.md)6件と保存されたVision原文を保持し、本文承認済みの
[Concept v4.2](../../concept/helix-concept-v4.2.md)がWeb側L1へ委ねた非エンジニア向け入口を候補化する。
Concept v4.2はまだ現行適用前で、本書も未承認である。既存L1、提供計画、実装指示として使わない。

## 提供価値

HELIX-Webは、利用者が許可した開発環境と能力へConnectorで接続し、長時間の開発作業、進行、成果、停止・再開を
ダッシュボードから確認・操作できるAI開発SaaSを目指す。利用者環境の資産と統制を尊重し、HELIX-OSの内部管理画面、
HELIX-Web-OSの運転機構、HARNESSの工程定義をWeb固有の価値として重複実装しない。

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HELIXWEB-L1-001 | 利用者は、許可した環境・project・能力へ接続し、対象と作用範囲を確認できる | HELIXWEB-L2-001／002／004 |
| HELIXWEB-L1-002 | 利用者は、ダッシュボードで長時間作業の進行、結果、切断、取消、再開、結果不明を区別できる | HELIXWEB-L2-003 |
| HELIXWEB-L1-003 | 利用者は、自分が許可する変更と受け入れる成果を判断し、残る専門判断を確認できる | HELIXWEB-L2-005 |
| HELIXWEB-L1-004 | 利用者は、採用するHARNESS・Connector・model等の構成版と依存を確認できる | HELIXWEB-L2-006／007 |
| HELIXWEB-L1-005 | 利用者は、利用結果をHELIX改善へ渡す目的・範囲・同意を管理できる | HELIXWEB-L2-008 |
| HELIXWEB-L1-006 | 展開判断者は、HELIX-HARNESS製品群Version 1の完成を確認してからHELIX-Webを展開できる | HELIXWEB-L2-009 |
| HELIXWEB-L1-007 | HARNESS Version 1完成後のWeb利用者は、実装詳細を操作せず、目的・進行・品質・未決・riskと必要な判断をダッシュボードで理解し、許可と受入を行える | 後続L2判断 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。
追加1件は[5大目標](../../concept/helix-five-goals.md)のG4と
[Concept v4.2](../../concept/helix-concept-v4.2.md)のWeb固有入口の判断に対応する候補であり、
HARNESSの非エンジニア向け開発契約やVersion 1成立を代替しない。

## L0 charterからの投影

HELIX-Webは旧L0 charter P0–P9の直接ownerではない。P0–P4／P7–P9の工程・Worker・証拠・改善条件は、
採用するHARNESS版とHELIX-OS統制を参照する。P5は独立柱が存在せず、P6の外部提供条件だけを
HELIXWEB-L1-001..006のWeb固有価値へ具体化する。旧柱の実装をWeb機能へ転用しない。

## 対象外

V-modelと検証契約はHARNESS、開発projectの要求・Worker・CI・ログ・改善還流の管理統制はHELIX-OS、
展開後のtenant・Connector job・service state・配備・監視・復旧はHELIX-Web-OSが所有する。
全コードや計算資源をSaaSへ移すこと、未採択の分散推論、横断学習への包括同意を前提にしない。

## 採択条件

Concept v4.2のexact本文承認を入力とし、本書7件のうち既存6件の意味保持と追加1件のWeb固有価値を
人間がこの本文revisionで別途採否し、利用者、利用場面、data・操作範囲、非対象を
確認する。採択後にL2要求、prototype、L11受入、L12運用評価を同じrevisionへ接続する。Visionの将来構想や既存実装を
現在の提供scopeへ自動昇格させない。
Concept v4.2の現行適用は別のcanonicalization記録まで保留する。
GitHub、旧CI、旧runtime、既存実装を要求意味・採否・合意のauthorityや新世代baselineにしない。
