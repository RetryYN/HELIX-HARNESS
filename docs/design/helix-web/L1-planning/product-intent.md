---
title: "HELIX-Web L1企画候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: awaiting_parent_approval
parent_candidate: docs/governance/candidates/helix-concept-v4.1.md
source_vision: docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md
source_vision_sha256: 1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74
created: 2026-09-14
updated: 2026-09-14
---

# HELIX-Web L1企画候補

本書はConcept v4.1候補、製品責務決定、保存されたVision原文から導いたHELIX-Webの対象別L1候補である。
親ConceptとWeb固有価値が未承認のため、現行L1、提供計画、実装指示として使わない。

## 提供価値

HELIX-Webは、利用者が許可した開発環境と能力へ接続し、長時間の開発作業、進行、成果、停止・再開を
Webから確認・操作できる個別製品を目指す。利用者環境の資産と統制を尊重し、HELIX-OSの内部管理画面や
HARNESSの工程定義をWeb固有の価値として重複実装しない。

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HELIXWEB-L1-001 | 利用者は、許可した環境・project・能力へ接続し、対象と作用範囲を確認できる | HELIXWEB-L2-001／002／004 |
| HELIXWEB-L1-002 | 利用者は、長時間作業の進行、結果、切断、取消、再開、結果不明を区別できる | HELIXWEB-L2-003 |
| HELIXWEB-L1-003 | 利用者は、自分が許可する変更と受け入れる成果を判断し、残る専門判断を確認できる | HELIXWEB-L2-005 |
| HELIXWEB-L1-004 | 利用者は、採用するHARNESS・Connector・model等の構成版と依存を確認できる | HELIXWEB-L2-006／007 |
| HELIXWEB-L1-005 | 利用者は、利用結果をHELIX改善へ渡す目的・範囲・同意を管理できる | HELIXWEB-L2-008 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。

## L0 charterからの投影

HELIX-Webは旧L0 charter P0–P9の直接ownerではない。P0–P4／P7–P9の工程・Worker・証拠・改善条件は、
採用するHARNESS版とHELIX-OS統制を参照する。P5は独立柱が存在せず、P6の外部提供条件だけを
HELIXWEB-L1-001..005のWeb固有価値へ具体化する。旧柱の実装をWeb機能へ転用しない。

## 対象外

V-modelと検証契約はHARNESS、要求・Worker・CI・ログ・改善還流の管理統制はHELIX-OSが所有する。
全コードや計算資源をSaaSへ移すこと、未採択の分散推論、横断学習への包括同意を前提にしない。

## 採択条件

Concept v4.1とWeb固有価値のexact revisionを人間が採否し、利用者、利用場面、data・操作範囲、非対象を
確認する。採択後にL2要求、prototype、L11受入、L12運用評価を同じrevisionへ接続する。Visionの将来構想や既存実装を
現在の提供scopeへ自動昇格させない。
GitHub、旧CI、旧runtime、既存実装を要求意味・採否・合意のauthorityや新世代baselineにしない。
