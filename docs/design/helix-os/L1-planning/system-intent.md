---
title: "HELIX-OS L1企画候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: awaiting_parent_approval
parent_candidate: docs/governance/candidates/helix-concept-v4.1.md
created: 2026-09-14
updated: 2026-09-14
---

# HELIX-OS L1企画候補

本書はConcept v4.1候補と2026-09-14の製品責務決定から導いたHELIX-OSの対象別L1候補である。
親Conceptが未承認のため、現行L1、L2合意、L3凍結、実行権限として使わない。

## 提供価値

HELIX-OSは、HARNESSを含むHELIXプロジェクト群のauthority、変更、Worker、状態、証拠、CI、配布運転を
管理・統制し、運用結果から改善候補を要求へ戻す。担当やsessionが変わっても、承認済みの意味、未完義務、
許可範囲、停止・復旧条件を失わず、対象ごとの開発を継続できるようにする。

| ID | L1企画要求 | L2への導出先 |
|---|---|---|
| HELIXOS-L1-001 | 人間は、対象ごとのConcept・要求・採否・合意revisionと判断の出所を管理できる | HELIXOS-L2-001／003 |
| HELIXOS-L1-002 | 人間は、複数プロジェクトの要求から作業・検証・提供・運用までの欠落、競合、staleを把握できる | HELIXOS-L2-002／007 |
| HELIXOS-L1-003 | 人間は、許可・予算・依存・独立検証の範囲でWorkerへ委譲し、中断後も安全に再開できる | HELIXOS-L2-004／009 |
| HELIXOS-L1-004 | 人間は、承認済み上流とHARNESS契約に従うCI・review・証拠収集を統制できる | HELIXOS-L2-007／008 |
| HELIXOS-L1-005 | 人間は、HARNESSの構成版を対象projectへ導入・更新・復旧し、配布結果を追跡できる | HELIXOS-L2-006 |
| HELIXOS-L1-006 | 人間は、観測・失敗・学習を出典付き候補として評価し、採択した改善だけを対象要求へ戻せる | HELIXOS-L2-005 |

## 管理対象と対象外

管理対象にはHARNESS、HELIX-Web、将来追加する個別製品を含む。OSは各対象の要求意味やHARNESSの工程規則を
別本文として所有せず、承認revisionを参照して実行・記録・制御する。外部へ提供する製品はHARNESSであり、
本企画はHELIX-OSの外販を目的にしない。

## 採択条件

Concept v4.1のexact revisionが人間承認され、本書の6要求がそのrevisionから導出されることを確認する。
Issue、PR、Projects、DB、memory、既存CIの状態から要求・承認・完了を生成しない。
採択後にL2要求とL11受入を同じrevisionへ接続し、操作authorityや実装方式はL3以降で導出する。
