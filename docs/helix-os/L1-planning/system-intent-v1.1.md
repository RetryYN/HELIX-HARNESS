---
title: "HELIX-OS L1企画 v1.1改訂候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft_candidate
authority_status: awaiting_human_approval
parent_candidate: docs/concept/helix-concept-v4.2.md
previous_approved_l1_sha256: 0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8
parent_concept_sha256: b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf
source_goals_sha256: cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca
created: 2026-09-14
updated: 2026-09-24
---

# HELIX-OS L1企画 v1.1改訂候補

承認済みv4.1親の[L1本文](system-intent.md)12件を保持し、本文承認済みの[Concept v4.2](../../concept/helix-concept-v4.2.md)から
5大目標の不足4領域だけを追加する改訂候補である。Concept v4.2はまだ現行適用前で、本書も未承認である。
既存L1、L2合意、L3凍結、実行権限として使わない。

## 提供価値

HELIX-OSは、HARNESSを含むHELIXプロジェクト群のauthority、変更、Worker、状態、証拠、CI、配布運転を
管理・統制し、HARNESSをHARNESS自身へ適用して継続改善する。各projectとWeb-OSから得た運用結果を
HARNESS自身および各対象の改善候補へ戻す。担当やsessionが変わっても、承認済みの意味、未完義務、
許可範囲、停止・復旧条件を失わず、対象ごとの開発を継続できるようにする。

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HELIXOS-L1-001 | 人間は、対象ごとのConcept・要求・採否・合意revisionと判断の出所を管理できる | HELIXOS-L2-001／003 |
| HELIXOS-L1-002 | 人間は、複数プロジェクトの要求から作業・検証・提供・運用までの欠落、競合、staleを把握できる | HELIXOS-L2-002／007 |
| HELIXOS-L1-003 | 人間は、許可・予算・依存・独立検証の範囲でWorkerへ委譲し、中断後も安全に再開できる | HELIXOS-L2-004／009 |
| HELIXOS-L1-004 | 人間は、承認済み上流とHARNESS契約に従うCI・review・証拠収集を統制できる | HELIXOS-L2-007／008 |
| HELIXOS-L1-005 | 人間は、HARNESSの構成版を対象projectへ導入・更新・復旧し、配布結果を追跡できる | HELIXOS-L2-006 |
| HELIXOS-L1-006 | 人間は、HARNESS自身への適用を含む観測・失敗・学習を評価し、HELIX-OSに採択済み改善の実行・再検証・効果確認を継続させられる | HELIXOS-L2-005 |
| HELIXOS-L1-007 | 人間は、HARNESS package運転と個別製品のrelease準備・artifact受渡し・observationを対象revisionと許可へ束縛して統制し、展開先runtimeのdeployment authorityを分離できる | HELIXOS-L2-002／006／007 |
| HELIXOS-L1-008 | 人間は、authority、design、verification、runtimeのprojection不整合を検出し、原情報から再構築できる | HELIXOS-L2-001／002／007／009 |
| HELIXOS-L1-009 | 人間は、管理・推進・検収の責務を分け、許可範囲内の直接調整を保ったまま仕事を統制できる | HELIXOS-L2-010 |
| HELIXOS-L1-010 | 人間は、変更と依存に合う統合順序・統合単位・検証集合を確認し、結果に応じて収束計画を更新できる | HELIXOS-L2-011 |
| HELIXOS-L1-011 | 人間は、内部状態と外部技術情報を出典・revision・適用条件付きで調査し、安全に採否できる | HELIXOS-L2-012 |
| HELIXOS-L1-012 | 人間は、一つの仕事を要求から運用まで診断し、管理機構自身を含む是正と効果確認へ閉じられる | HELIXOS-L2-013 |
| HELIXOS-L1-013 | 人間は、承認済み上流と許可範囲を保ちながら、system stateとwork graphから次作業・依存・検証を導出して割当・継続し、要求・承認・権限をエージェントに自己生成させず自走させられる | 後続L2判断 |
| HELIXOS-L1-014 | 人間は、承認済みHARNESS契約に基づく全体simulationの予測、前提、revision、不確実性と実測差を確認し、再計画候補へ戻せる | 後続L2判断 |
| HELIXOS-L1-015 | 人間は、CI・bot・Workerによる自動検査、証拠化、差戻し、停止・再開を統制し、その結果をHARNESS契約に従う進行・品質・未決・risk・判断待ちの証拠として提供できる | 後続L2判断 |
| HELIXOS-L1-016 | 人間は、作業特性と対象revisionに結び付けたWorkerの品質・費用・時間・再作業・失敗の実測を使い、配置・再配置と独立検証を統制できる | 後続L2判断 |

上表は接続予定である。L2側にも親L1 IDと親revisionを記載して初めて導出関係が成立する。
追加4件は[5大目標](../../concept/helix-five-goals.md)のG1・G3・G4・G5と
[L1被覆監査](../../governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md)の未被覆意味に対応する候補である。
既存12件を再計上せず、L2 ID・受入条件・実装方式は本改訂で確定しない。

## L0 charterからの投影

| L0柱 | 本L1での帰属 |
|---|---|
| P0 | HELIXOS-L1-002／003のroute・停止・復旧統制 |
| P1 | HELIXOS-L1-003のqueue・budget・継続 |
| P2 | HELIXOS-L1-003のWorker・capability・実行境界 |
| P3 | HELIXOS-L1-002／004の検証実行・証拠回収 |
| P4 | HELIXOS-L1-006の観測・改善還流 |
| P5 | 独立柱が存在しないため推測で追加しない |
| P6 | HELIXOS-L1-005／007のHARNESS配布運転と個別製品release準備・artifact受渡し |
| P7 | HELIXOS-L1-002／008のstate・log・projection・再構築 |
| P8 | HELIXOS-L1-003の外部実行・安全統制 |
| P9 | HELIXOS-L1-001／002／008のauthority・trace・整合管理 |

## 管理対象と対象外

管理対象にはHARNESS、HELIX-Web、HELIX-Web-OS、将来追加する個別製品・運転基盤を含む。OSは各対象の要求意味やHARNESSの工程規則を
別本文として所有せず、承認revisionを参照して開発・改善を実行・記録・制御する。HELIX-Web-OSの展開後service runtimeはOS外に置く。外部へ提供する製品はHARNESSであり、
本企画はHELIX-OSの外販を目的にしない。
実装詳細を操作しない利用者向けの開発契約はHARNESS、Web固有の表示・操作体験はHELIX-Webが所有する。
OSの証拠提供から利用者入口の所有を推定しない。

## 採択条件

Concept v4.2のexact本文承認を入力とし、本書16件のうち既存12件の意味保持と追加4件の製品責務を
人間がこの本文revisionで別途承認する。Concept v4.2の現行適用は別のcanonicalization記録まで保留する。
Issue、PR、Projects、DB、memory、既存CIの状態から要求・承認・完了を生成しない。
採択後にL2要求、L11受入、L12運用評価を同じrevisionへ接続し、操作authorityや実装方式はL3以降で導出する。
