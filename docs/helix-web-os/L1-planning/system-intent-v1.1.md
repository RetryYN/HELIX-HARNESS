---
title: "HELIX-Web-OS L1企画 v1.1改訂候補"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
status: draft_candidate
authority_status: awaiting_human_approval
parent_candidate: docs/concept/helix-concept-v4.2.md
previous_approved_l1_sha256: 600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c
parent_concept_sha256: b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf
source_goals_sha256: cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca
created: 2026-09-14
---

# HELIX-Web-OS L1企画 v1.1改訂候補

承認済みv4.1親の[L1本文](system-intent.md)5件を保持し、本文承認済みの
[Concept v4.2](../../concept/helix-concept-v4.2.md)との境界を確認する未承認候補である。
Concept v4.2はまだ現行適用前で、本書を既存L1や実装指示として使わない。

HELIX-Web-OSは、HELIX-Webの展開時にHELIX-OSの外へ構成し、利用者向けWebサービスを安全かつ継続的に
運転する基盤である。HELIX-OSの内部統制stateとWebサービスのtenant／job／接続stateを分離する。

| ID | L1企画要求 | L2接続予定 |
|---|---|---|
| HELIXWEBOS-L1-001 | サービス運用者は、tenant・利用者・projectごとのauthorityと隔離を保ってHELIX-Webを提供できる | HELIXWEBOS-L2-001 |
| HELIXWEBOS-L1-002 | サービス運用者は、Connectorと長時間jobを安全に配信・追跡・停止・再開・回復できる | HELIXWEBOS-L2-002／003 |
| HELIXWEBOS-L1-003 | 利用者は、認証・provider接続・data返送の対象と許可範囲を管理できる | HELIXWEBOS-L2-004 |
| HELIXWEBOS-L1-004 | HELIX-Webは、利用者へ進行・状態・成果・証拠を正しいrevisionで表示できる | HELIXWEBOS-L2-005 |
| HELIXWEBOS-L1-005 | サービス運用者は、Webサービスを配備・監視・更新・復旧し、許可された運用ログをHELIX-OSの改善候補へ接続できる | HELIXWEBOS-L2-006 |

## L0 charterからの投影

| L0柱 | 本L1での帰属 |
|---|---|
| P0／P1／P2／P3 | 工程・Worker・検証条件の直接ownerではない。採用HARNESS版とHELIX-OSの開発統制を参照 |
| P4 | HELIXWEBOS-L1-005のservice観測と改善proposal。採否は対象上流へ返す |
| P5 | 独立柱が存在しないため推測で追加しない |
| P6 | HELIXWEBOS-L1-001／002／005のWebサービス提供・運転 |
| P7 | HELIXWEBOS-L1-002／004／005のjob・state・evidence・復旧 |
| P8 | HELIXWEBOS-L1-001／003のauthority・接続・data境界 |
| P9 | HELIXWEBOS-L1-004／005のrevision・証拠・改善trace |

## 境界

HELIX-Web-OSはHELIX-OSのsubsystemではなく、Web展開先の独立運転境界である。HARNESSの開発engineや工程規則、
HELIX-OSの全project管理、Webの利用者要求を別正本として複製しない。具体cloud、provider、認証方式、料金、
SLOはL2以降の採択前に確定済みと扱わない。

独立運転は非接続を意味しない。Web-OSのservice log・telemetry・incident・利用結果は、許可された範囲を
HELIX-OSへ渡し、改善proposalと採択後の対象別変更を受け取る。service credentialやtenant原dataは暗黙共有しない。

非エンジニア向けの利用者入口はHELIX-Webが所有し、Web-OSは承認済み範囲のjob state・証拠を
正しいrevisionでWebへ渡す運転責務に限る。これをHARNESSの開発契約やOSの内部UIへ移さない。
Web-OSのservice jobでWorkerを使うか、その配置・検証契約は現時点で未決である。
OSの開発project向けWorker割当をWeb-OSのservice authorityへ暗黙継承させず、Webサービスの採用scopeを
L2で決める際に、使う場合と使わない場合を対象別に判断する。未決は使用許可にも不採用決定にもならない。

## 採択条件

Concept v4.2のexact本文承認を入力とし、本書の既存5件の意味保持と上記のWeb／Web-OS入口境界を
人間がこの本文revisionで別途承認する。service Worker利用はこの承認範囲に含めず、
Concept v4.2の現行適用も別のcanonicalization記録まで保留する。
採択後にL2／L11、L3／L10、L12運用評価を同じrevision系列へ接続する。HELIX-OSの既存runtimeや
HELIX-Web画面の存在を本systemの承認・実装・受入証拠にしない。
