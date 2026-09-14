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

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HELIXOS-L1-001 | 人間は、対象ごとのConcept・要求・採否・合意revisionと判断の出所を管理できる | HELIXOS-L2-001／003 |
| HELIXOS-L1-002 | 人間は、複数プロジェクトの要求から作業・検証・提供・運用までの欠落、競合、staleを把握できる | HELIXOS-L2-002／007 |
| HELIXOS-L1-003 | 人間は、許可・予算・依存・独立検証の範囲でWorkerへ委譲し、中断後も安全に再開できる | HELIXOS-L2-004／009 |
| HELIXOS-L1-004 | 人間は、承認済み上流とHARNESS契約に従うCI・review・証拠収集を統制できる | HELIXOS-L2-007／008 |
| HELIXOS-L1-005 | 人間は、HARNESSの構成版を対象projectへ導入・更新・復旧し、配布結果を追跡できる | HELIXOS-L2-006 |
| HELIXOS-L1-006 | 人間は、観測・失敗・学習を出典付き候補として評価し、採択した改善だけを対象要求へ戻せる | HELIXOS-L2-005 |
| HELIXOS-L1-007 | 人間は、HARNESSと個別製品のrelease、deployment、observationを対象revisionと許可へ束縛して統制できる | HELIXOS-L2-002／006／007 |
| HELIXOS-L1-008 | 人間は、authority、design、verification、runtimeのprojection不整合を検出し、原情報から再構築できる | HELIXOS-L2-001／002／007／009 |
| HELIXOS-L1-009 | 人間は、管理・推進・検収の責務を分け、許可範囲内の直接調整を保ったまま仕事を統制できる | HELIXOS-L2-010 |
| HELIXOS-L1-010 | 人間は、変更と依存に合う統合順序・統合単位・検証集合を確認し、結果に応じて収束計画を更新できる | HELIXOS-L2-011 |
| HELIXOS-L1-011 | 人間は、内部状態と外部技術情報を出典・revision・適用条件付きで調査し、安全に採否できる | HELIXOS-L2-012 |
| HELIXOS-L1-012 | 人間は、一つの仕事を要求から運用まで診断し、管理機構自身を含む是正と効果確認へ閉じられる | HELIXOS-L2-013 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。

## L0 charterからの投影

| L0柱 | 本L1での帰属 |
|---|---|
| P0 | HELIXOS-L1-002／003のroute・停止・復旧統制 |
| P1 | HELIXOS-L1-003のqueue・budget・継続 |
| P2 | HELIXOS-L1-003のWorker・capability・実行境界 |
| P3 | HELIXOS-L1-002／004の検証実行・証拠回収 |
| P4 | HELIXOS-L1-006の観測・改善還流 |
| P5 | 独立柱が存在しないため推測で追加しない |
| P6 | HELIXOS-L1-005／007の配布・release・deployment運転 |
| P7 | HELIXOS-L1-002／008のstate・log・projection・再構築 |
| P8 | HELIXOS-L1-003の外部実行・安全統制 |
| P9 | HELIXOS-L1-001／002／008のauthority・trace・整合管理 |

## 管理対象と対象外

管理対象にはHARNESS、HELIX-Web、HELIX-Web-OS、将来追加する個別製品・運転基盤を含む。OSは各対象の要求意味やHARNESSの工程規則を
別本文として所有せず、承認revisionを参照して開発・改善を実行・記録・制御する。HELIX-Web-OSの展開後service runtimeはOS外に置く。外部へ提供する製品はHARNESSであり、
本企画はHELIX-OSの外販を目的にしない。

## 採択条件

Concept v4.1のexact revisionが人間承認され、本書の12要求がそのrevisionから導出されることを確認する。
Issue、PR、Projects、DB、memory、既存CIの状態から要求・承認・完了を生成しない。
採択後にL2要求、L11受入、L12運用評価を同じrevisionへ接続し、操作authorityや実装方式はL3以降で導出する。
