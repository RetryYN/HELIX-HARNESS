---
title: "HELIX-INFRASTRUCTURE L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md
decision_record: docs/governance/decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md
created: 2026-09-26
updated: 2026-09-26
---

# HELIX-INFRASTRUCTURE L1企画案

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。本文は、POが2026-09-26に示した[HELIX Runtime Infrastructure L1要求候補の原文](../sources/runtime-infrastructure-l1-po-original-2026-09-26.md)を、企画（L1）の形に整理したものである（[判断記録](../../governance/decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md)）。
POの回答により、HELIX-INFRASTRUCTUREは新しいコア機構である。2026-09-26のPOの回答で、HELIX-INFRASTRUCTUREをConceptの機構の表に加え（「9つの機構と1つの共通部品」）、1.0は原文の18項目に当たる要求だけとし、18項目に当たらない要求と、高度なAutoscaling・Multi-cloud・完全自動のFailover等は1.0より後（版は未定）とした（[Concept配置の判断記録](../../governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)）。本書は、Conceptに加えた機構の企画案（L1）である。本書の対象revisionは、POが確認する。本書から、要求（L2）の合意、要件（L3）の承認、実装・実行の許可を生成しない。

## 提供価値

HELIX-INFRASTRUCTUREは、HELIX自身の各機構、Worker、モデルの実行環境、dataの保存先、コネクタ等が、安全に続けて稼働するための実行基盤を提供する。
承認されたHELIXのInfrastructureの設計を、観測でき復旧できる実際の実行環境として成り立たせ、その実際の状態を持つ。

```text
HELIX-BRAIN            Infrastructureの汎用の設計知識
        ↓
HELIX-HARNESS-CORE     HELIXに固有のInfrastructureの設計（意味の正本）
        ↓
HELIX-INFRASTRUCTURE   配備の目標と、実際の実行環境
        ↓
                       観測した実際の状態
```

役割を次のように分ける。HELIX-INFRASTRUCTUREは、設計知識、要求の意味、進行の統制、securityのauthority、判断、評価を持たない。

| 機構・担い手 | 担うもの |
|---|---|
| HELIX-BRAIN | Infrastructureの汎用の設計知識 |
| HELIX-HARNESS | Infrastructureの要求と検証の契約 |
| HELIX-HARNESS-CORE | HELIXに固有のInfrastructureの設計 |
| HELIX-INFRASTRUCTURE | 配備の目標、実際の実行環境の資源とその状態 |
| HELIX-OS | 変更、配備、incidentの進行の統制（作業と変更の状態） |
| HELIX-SECURITY | authority、隔離、資格情報 |
| Worker | 実際のInfrastructureの操作を含む、作業の実行（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)、PR #2149） |
| HELIX-INTELLIGENCE | 配置、容量、診断の判断の候補 |
| HELIX-LABO | 運用、failure、費用、復旧の評価 |

## 企画要求

IDは原文のHRI-L1-001〜040と同じ番号で対応する。種類の列は、要求の粒度の分け方（2026-09-25のPO指示）による。
「原文の1.0最低範囲」の列は、原文の「1.0で最低限成立させる範囲」の18項目のうち、その要求が当たる項目の番号である。版の列は、その要求を入れる版の印（`version_target`）である。18項目に当たる要求は、POの回答（「1.0は18項目、残りは後の版」）により1.0とした。18項目に当たらない要求は、POの回答2により1.0より後（版は未定）とする。

| ID | L1企画要求 | 原文 | 原文の1.0最低範囲 | 版 | 種類 |
|---|---|---|---|---|---|
| HELIXINFRASTRUCTURE-L1-001 | 人間は、HELIXを構成する実行環境の資源（各機構、Workerとモデルの実行環境、database、queue、成果物と証拠の保存先、logとmetricの基盤）とその関係を識別し、各資源のidentity、役割、環境、場所、版、依存、lifecycleの状態を辿れる | HRI-L1-001 | 1、2 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-002 | 人間は、承認された設計、配備の目標、観測した実際の状態を別のものとして扱える。設計の意味の正本はHELIX-HARNESS-COREが持ち、HELIX-INFRASTRUCTUREは設計から導いた配備の目標と観測した実際の状態を持つ。実際の状態から要求や設計を直接書き換えない | HRI-L1-002 | 4 | 1.0 | 単体（設計の受け取りはHELIX-HARNESS-COREとの接続） |
| HELIXINFRASTRUCTURE-L1-003 | 人間は、承認された構成と実際の環境の差（資源の欠落、予期しない資源、版・設定・network・権限・容量のずれ、実行環境の差し替え、不明な依存）を確かめられる。ずれを自動で正しい変更とみなさない | HRI-L1-003 | 5 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-004 | 人間は、開発、検証、staging、本番、復旧等の環境を独立したidentityとして扱い、環境ごとに資源、設定、network、資格情報の範囲、data、版、authorityを分けられる。別の環境での成功を本番の成立の証拠にしない | HRI-L1-004 | 3 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-005 | 人間は、手元の計算機、VPS、専用server、cloudの仮想機械、containerの実行環境、GPUのnode、Workerのnodeを共通のモデルで扱い、providerや物理的な場所に関係なく、CPU、memory、GPUとVRAM、storage、実行環境、容量、健全性、可用性を確かめられる | HRI-L1-005 | 6 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-006 | 人間は、HELIXの内部と外部への通信の経路を、送信元、送信先、protocol、endpoint、向き、目的、securityの境界、依存とともに把握できる。HELIX-CONNECTの論理の接続と、Infrastructureの物理・実行の通信経路を区別する | HRI-L1-006 | 2、6 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-007 | 人間は、HELIXが使う永続と一時の状態（運用のdatabase、証拠と成果物の保存先、queue、cache、logとmetricの保存先、モデルの保存先）を区別し、それぞれにowner、耐久性、backupの要否、保持、環境、機密区分、復旧の要件を持たせられる | HRI-L1-007 | 6 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-008 | 人間は、HELIXの管理と判断の部分（OS、SECURITY、調整）と、資源を大量に使う実行の部分（Worker、CI、モデル）を分けられる。Workerの暴走、CIの負荷、モデルの実行の負荷で、HELIXの管理・停止・復旧の能力を失わない構成を取れる | HRI-L1-008 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-009 | 人間は、LLMの実行環境（外部のモデルAPI、ローカルLLM、GPU server、分散したモデルserver、調整済みモデルの実行環境）をInfrastructureの資源として扱い、モデル、版、server、GPUとmemoryの必要量、同時実行、遅延、容量、健全性、endpointへ辿れる。モデルの知能の評価はINTELLIGENCEとLABOに分ける | HRI-L1-009 | 7 | 1.0 | 単体（評価はINTELLIGENCE、LABOとの接続） |
| HELIXINFRASTRUCTURE-L1-010 | 人間は、各資源の容量、使用率、queue、同時実行、飽和、拒否、backpressureを観測でき、資源の枯渇を突然の異常としてだけでなく、予定された状態として制御できる | HRI-L1-010 | 8 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-011 | 人間は、新しいJob、Worker、モデル、CI等を起動する前に、必要な資源を使えるかを確かめられる。容量が足りないときは、待たせる、遅らせる、費用の低い実行環境や別のnodeへ回す、拒否する、人へ上げる等へつなげ、過負荷の状態で際限なくJobを足さない | HRI-L1-011 | 8 | 1.0 | 単体（回し先の判断はINTELLIGENCE、OSとの接続） |
| HELIXINFRASTRUCTURE-L1-012 | 人間は、資源を一覧ではなく故障の単位（手元の計算機、VPS、GPUのnode、network、provider、database、storage）として扱い、一つの故障がどこまで影響するかを辿れる | HRI-L1-012 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-013 | 人間は、HELIX自身について、ある資源を失うとHELIXの何が止まるかを把握できる。冗長を必須とはせず、受け入れる単一障害点について、影響、復旧、理由を明示する | HRI-L1-013 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-014 | 人間は、HELIX自身のInfrastructureについて、健全性、metric、log、資源の使用、依存の状態、queueの状態、error、遅延、配備のrevision、復旧の状態を観測できる。観測できないことを健全に変えない | HRI-L1-014 | 9 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-015 | 人間は、実行環境の出来事をHELIX全体の相関IDへつなぎ、要求、ticket、Worker、資源、failure、復旧を一つのepisodeとして追える。LABOへ渡す観測の材料を失わない | HRI-L1-015 | — | 1.0より後（版は未定） | 接続（OS、LABO） |
| HELIXINFRASTRUCTURE-L1-016 | 人間は、HELIXのInfrastructureの上で、劣化、利用不能、容量の枯渇、依存の失敗、data・networkの利用不能、securityによる隔離、不明を、通常の状態と区別できる。incidentの意味と重さは承認済みの要求を参照し、HELIX-INFRASTRUCTURE自身が定めない | HRI-L1-016 | 10 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-017 | 人間は、HELIX自身の重要な状態について、backupの対象、元のrevision、時刻、完全さ、場所、完全性、期限を確かめられる。backupの設定があることをbackupの成功としない | HRI-L1-017 | 11 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-018 | 人間は、backupがあることとrestoreできることを別の状態として扱い、実際に、戻し、完全性、依存の再接続、起動、検証まで確かめられる | HRI-L1-018 | 11 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-019 | 人間は、Infrastructureの変更、実行環境の更新、モデルの更新等について、変更前の適格な状態へ戻せる。巻き戻し先に、Infrastructureの版、設定、成果物、依存、dataの互換、復旧の手順を関連づける | HRI-L1-019 | 12 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-020 | 人間は、HELIX全体が止まっても、HELIX自身を使わなければ復旧できない循環した依存を避けられる。最低限の起動、復旧、点検、巻き戻しの能力は、止まったHELIXの本体から独立して使える（例：HELIX-OSが止まったときに、HELIX-OSに「OSを直して」とは頼めない） | HRI-L1-020 | 17 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-021 | 人間は、通常の管理の部分が使えないときに、実行環境の点検、健全性の確認、serviceの停止、巻き戻し、復旧の起動を行える限定された経路（通常の経路の外にある復旧の経路）を持てる。通常の運用の万能な裏口にはせず、SECURITYの別のauthorityを求める | HRI-L1-021 | 17 | 1.0 | 接続（SECURITY） |
| HELIXINFRASTRUCTURE-L1-022 | 人間は、何が、どこで、いつから、どの版・設定・成果物・依存で動いているかを確かめられる。同じ「HELIX」という名前でも、異なる実行環境のrevisionを区別する | HRI-L1-022 | 13 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-023 | 人間は、HELIX自身のInfrastructureの変更を一括の更新だけにせず、必要に応じて、候補、隔離またはshadow、部分の適用、検証済み、昇格と段階を踏んで適用できる。SECURITYの更新の受け入れを通らない変更を自動で昇格させない | HRI-L1-023 | — | 1.0より後（版は未定） | 接続（SECURITY） |
| HELIXINFRASTRUCTURE-L1-024 | 人間は、変更の前に、影響する資源、機構、依存するJob、環境、data、巻き戻し先を確かめられる。Infrastructureの変更で、HELIX全体を無条件に止めない | HRI-L1-024 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-025 | 人間は、HELIXの実行環境をAWS、GCP、Azure、VPSの事業者、手元の計算機、特定のGPUのprovider等へ恒久に固定せず、providerに固有の実装と、HELIXが必要とする能力を分けられる | HRI-L1-025 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-026 | 人間は、単一のcloudを前提にせず、手元の計算機（管理と開発）、VPS（常時稼働のWorker、CI）、GPU server（ローカルLLM）、cloud（任意のservice）を混ぜた実行環境を扱える。配置の判断は、INTELLIGENCEとOSとの接続で行う | HRI-L1-026 | — | 1.0より後（版は未定） | 単体（配置の判断はINTELLIGENCE、OSとの接続） |
| HELIXINFRASTRUCTURE-L1-027 | 人間は、状態、Worker、モデル、成果物等がどこに在るかを確かめられる。場所の分からない資源を、安全に使える対象とみなさない | HRI-L1-027 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-028 | 人間は、HELIX-INFRASTRUCTUREがSECURITYから、networkの制約、資格情報の制約、環境とprojectの隔離、操作のauthority、更新の受け入れ、外部への送信の方針を受け取ることを確かめられる。HELIX-INFRASTRUCTURE自身がsecurityの方針を作らない | HRI-L1-028 | 14 | 1.0 | 接続（SECURITY） |
| HELIXINFRASTRUCTURE-L1-029 | 人間は、実行環境の資源が資格情報そのものを通常の状態として保存しないことを確かめられる。資格情報はSECURITYの管理の境界から必要な範囲で受け取り、backupやsnapshotへsecretを無条件に含めない | HRI-L1-029 | 14 | 1.0 | 接続（SECURITY） |
| HELIXINFRASTRUCTURE-L1-030 | 人間は、HELIX自身の計算、GPU、storage、network、外部のservice、モデルのAPI、常時稼働の資源等の費用を、資源やworkloadへ関連づけられる。費用の採否や予算の決定はHELIX-INFRASTRUCTUREが行わない | HRI-L1-030 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-031 | 人間は、資源について、計画、用意、設定、有効化、観測、更新、劣化、復旧、退役、廃棄を区別できる。作れることだけでInfrastructureの管理が成り立つとしない | HRI-L1-031 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-032 | 人間は、不要になった資源を「使っていない」だけで放置せず、廃棄のときに、依存、data、資格情報、network、費用、backup、代わりを確かめられる | HRI-L1-032 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-033 | 人間は、観測した実際の状態に、観測した時刻、source、新しさ、収集した主体、確からしさまたは不明を持たせられる。古い観測の結果を現在の状態として使わない | HRI-L1-033 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-034 | 人間は、健全、不健全、不明、未観測、古い状態を区別できる。確認できない資源を健全として補わない | HRI-L1-034 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-035 | 人間は、将来のWebの展開で、HELIXの内部のInfrastructureと、HELIX-Webのserviceの側のInfrastructureを分けられる。tenantの実行環境、顧客のjob、顧客の資格情報、serviceの状態、配備を、HELIXの本体のInfrastructureへ暗黙に共有しない | HRI-L1-035 | — | 1.0より後（版は未定） | 単体 |
| HELIXINFRASTRUCTURE-L1-036 | 人間は、HELIX-HARNESS-CORE、BRAIN、INTELLIGENCE、LABO等の内部の資産を、実行環境の配置によって不用意に外へ公開しないことを確かめられる。SECURITYの資産の境界に従い、内部のみ、service内部、外部、制限等の配置の条件を当てられる | HRI-L1-036 | — | 1.0より後（版は未定） | 接続（SECURITY） |
| HELIXINFRASTRUCTURE-L1-037 | 人間は、HELIXがHELIX自身のInfrastructureを変えるときに、稼働している世代と候補の世代を分けられる。候補の世代が自分の成功を自分で承認して、稼働している世代を先に壊さず、適格な前の世代へ戻れる状態を保つ | HRI-L1-037 | — | 1.0より後（版は未定） | 構成体（HELIX-INFRASTRUCTURE、OS、SECURITY、Worker） |
| HELIXINFRASTRUCTURE-L1-038 | 人間は、Infrastructureの状態が失われても、承認された設計、設定、成果物、依存、dataのbackup、版、配備の証拠から、必要な実行環境を作り直せる。特定の一台の計算機の中だけに、復旧できない知識を持たない | HRI-L1-038 | 18 | 1.0 | 単体 |
| HELIXINFRASTRUCTURE-L1-039 | 人間は、HELIXがInfrastructureを実際に操作するとき（用意、設定、配備、停止、増減、restore、削除）、SECURITYのauthorityと制約を受けたWorkerの実行を通すことを確かめられる。HELIX-INFRASTRUCTURE自身が際限のないshellの主体にならない | HRI-L1-039 | 16 | 1.0 | 接続（SECURITY、Worker） |
| HELIXINFRASTRUCTURE-L1-040 | 人間は、Infrastructureの操作を、Terraform／OpenTofu、Ansible、cloudのAPI、providerのCLI、ローカルのscript、containerの実行環境等で実装でき、特定のToolをHELIXのInfrastructureの意味の正本にしない | HRI-L1-040 | — | 1.0より後（版は未定） | 単体 |

原文の1.0最低範囲のうち、15（OSとの接続）は、下の「接続の要求と構成体の要求として外へ出すもの」のOSとの接続に当たり、1.0とする。

### 後の版へ回すもの

原文は「高度なAutoscaling、Multi-cloud、完全自動Failover等は、必要性と実績から後の版へ拡張できる」としている。原文に具体の版番号がないため、版は「1.0より後（版は未定）」とする（旧HELIXのVERSION_UPが将来版へ保全する項目に`version_target: future`の印を付けたことに対応する）。上の表の要求は、これらを1.0の完成条件に持ち込まない。「1.0で入れておくもの」の列には、18項目に当たる1.0の要求だけを挙げる。

| 後の版へ回すもの | 版 | 1.0で入れておくもの |
|---|---|---|
| 高度なAutoscaling（容量に応じた資源の自動の増減） | 1.0より後（版は未定） | 容量と飽和の観測、資源の受け入れの判断（010、011） |
| Multi-cloud（複数のcloudを同時に使う構成） | 1.0より後（版は未定） | 計算の資源を、providerや物理的な場所に関係なく共通のモデルで扱うこと（005） |
| 完全自動のFailover | 1.0より後（版は未定） | backupとrestore、巻き戻し、HELIX自身から独立した起動と復旧（017〜021） |

## 接続の要求と構成体の要求として外へ出すもの

機構をまたぐ処理は接続の要求、複数の機構で成り立つ能力は構成体の要求として扱う。接続の間にはコネクタを入れ、コネクタは接続の数だけ置く（[LABOの判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）。

| 流れ | 種類 | 機構 | 境界 |
|---|---|---|---|
| HELIX-HARNESS-CORE → HELIX-INFRASTRUCTURE | 接続 | HELIX-HARNESS-CORE、HELIX-INFRASTRUCTURE | 承認された設計を受け取り、配備の目標を導く。実際の状態から設計を書き換えない |
| HELIX-OS ↔ HELIX-INFRASTRUCTURE | 接続 | HELIX-OS、HELIX-INFRASTRUCTURE | OSは、何を変えるか、どのticketで進めるか、誰が行うか、どの証拠を登録するか、いつ止めて再開するか（作業と変更の状態）を持つ。HELIX-INFRASTRUCTUREは、どの資源が在るか、どの構成か、どの版か、今どういう状態か、どこに置かれているか（実行環境の資源の状態）を持つ。同じ状態を二重に正本にしない |
| HELIX-INFRASTRUCTURE → SECURITY → Worker | 構成体 | HELIX-INFRASTRUCTURE、SECURITY、Worker | HELIX-INFRASTRUCTUREが操作を求め（例：server AへJobを配備したい）、SECURITYが対象、project、操作、revision、期限を限って許可し、OSがticketを割り当てたレーンの主が呼び出したWorkerが、その範囲だけ実行する。HELIX-INFRASTRUCTUREは自分の権限を広げない |
| Worker → HELIX-INFRASTRUCTURE | 接続 | Worker、HELIX-INFRASTRUCTURE | Workerは作業の主体であり、計算機そのものではない。HELIX-INFRASTRUCTUREは、Workerが動く実際の資源（計算機、CPU、memory、GPU、storage、network、processやcontainerの実行環境）とその容量・状態を持ち、隔離はその資源で使える方式で当てる。Workerは必要に応じて別の資源へ移れ、資源が変わってもticket、要求、Workerの責務を失わない。Workerの作業の責務やticketの状態をHELIX-INFRASTRUCTUREへ移さない（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)、PR #2149） |
| HELIX-INFRASTRUCTURE → LABO | 接続 | HELIX-INFRASTRUCTURE、LABO | 生のmetric、出来事、failure、復旧、費用、容量を渡す。構成が良かったかはLABOが過去の実績として評価する。HELIX-INFRASTRUCTUREが成功の実績から設計のPatternをBRAINへ直接昇格させない |
| INTELLIGENCE → HELIX-INFRASTRUCTURE | 接続 | INTELLIGENCE、HELIX-INFRASTRUCTURE | 資源とWorkerの配置、容量の不足、failureの診断、増減、復旧の候補を判断の候補として受け取る。候補をそのままauthorityとして実行しない |
| HELIX-BRAIN → HELIX-HARNESS-CORE | 接続 | HELIX-BRAIN、HELIX-HARNESS-CORE | 汎用の設計知識は、HELIX-HARNESS-COREの設計を経てHELIX-INFRASTRUCTUREへ届く（[BRAINのInfrastructure領域の要求候補](../../helix-brain/candidates/infrastructure-domain-requirements.md)（PR #2145） |

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。旧HELIXには、HELIX自身の実行環境を持つ独立した機構はなかった。旧の製品ライフサイクル運用要件は、製品の配備と運用の契約として、環境、配備、巻き戻し、providerの中立、運用の観測、障害の記録を扱っていた。

| 本書 | 旧HELIX・現行の上位 | 保持する点 | 変わる点 |
|---|---|---|---|
| 002 | 旧製品ライフサイクル運用要件（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:29-30`） | 意味のauthorityは要求と設計の側に置き、実行時の観測、log、metric、providerの管理画面は証拠であって、意味のauthorityとして手で書き換えない | 設計の意味の正本をHELIX-HARNESS-COREに、実際の状態をHELIX-INFRASTRUCTUREに置く |
| 004、029 | 旧OPS-R-01 環境contract（同:68-72） | 環境ごとにidentity、class、providerのadapter、資源の制約、権限、資格情報の参照、dataの区分を持つ。secretの値を持たない | 対象を、HELIX自身の環境に広げ、復旧の環境を加える。資格情報はSECURITYの管理の境界から受け取る |
| 022 | 旧OPS-R-02 配備contract（同:74-79） | 配備を、成果物、設定、対象の環境、依存とともに記録する | 同じ |
| 019 | 旧OPS-R-03 巻き戻しcontract（同:81-84）、旧memory-learning-promotionのrollback target（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/memory-learning-promotion.md:184-185`） | 有効にする前に、直前の版、成果物と設定、止める手順、影響の範囲を巻き戻し先として固める。巻き戻し先の不明を拒否する | Infrastructure、実行環境、モデルの更新へ当てる |
| 025、040 | 旧OPS-R-04 provider中立planner（`product-lifecycle-operations-requirements.md:88-92`）、旧Concept v4要求（providerに固定したtopologyをhistoricalへ隔離する。`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4-requirements.md:43`） | local、VPS、container、cloud等をadapterでつなぎ、providerに固有のschemaやcommandを中心へ埋め込まない | HELIX自身の実行環境に当てる |
| 023 | 旧OPS-R-05 段階的promotion（同:94-98） | 同じ成果物を段階を踏んで昇格させ、段の飛ばしを拒否する | 段を、候補、隔離またはshadow、部分の適用、検証済み、昇格とし、SECURITYの更新の受け入れを条件にする |
| 016 | 旧OPS-R-07 障害記録（同:108-111） | 異常を変更と相関させ、不足した証拠から原因を推測で確定しない | incidentの意味と重さは承認済みの要求を参照し、HELIX-INFRASTRUCTUREは状態を区別する |
| 003 | 旧OPS-R-08 保守義務（同:118）のconfiguration drift | 設定のずれを追う | ずれを、資源、版、network、権限、容量、依存へ広げ、自動で正しい変更とみなさない |
| 014、033、034 | 旧NIO-L3-03、09（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:9,15`） | 観測の証拠に時刻、新しさ、収集の健全性を持たせ、収集の停止・欠測・古い状態を健全に変えない | 未観測と古い状態を、健全・不健全・不明と並ぶ状態にする |
| 017、018 | 旧NIO-L3-06（同:12） | backupとrestoreは実行できる手順で確かめ、名前や文書があることを成功の証拠にしない | 同じ |
| 039 | 旧ConceptのRunner／Sandbox（共通部品。限定された実行、停止、隔離、結果の回収）。2026-09-26のPO判断でWorkerへ統一した（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)、PR #2149） | 実際の操作を限定された実行経路に置く | 実行はWorkerが担い、Infrastructureの操作へ当てる |
| 035 | 現行のConceptのHELIX-WEB-OS（内部OSの状態・鍵・権限を共有しない） | HELIXの内部とWebのserviceの側を分ける | Infrastructureの資源へ当てる |
| 008 | 旧HIL-TR-01、02（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165-166`） | 管理の部分（control plane）と処理の部分（data／detection plane）を分け、版付きの契約でつなぐ | 旧は実行の言語と実行環境で分けていた。本書は資源の消費で分け、実行の負荷で管理・停止・復旧の能力を失わないことを目的にする |
| 012 | 旧インフラ・運用品質の要求導出の原文（`archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:128`） | 故障の単位（failure domain）を設計で定め、複数のregionや特定のcloudを無条件に求めない | 旧は製品の基本設計（L4）の義務だった。本書はHELIX自身の資源を故障の単位として扱い、影響の範囲を辿る |
| 037 | 旧OPS-R-12（`product-lifecycle-operations-requirements.md:169-171`） | HELIX自身も通常の利用者として、配備から観測、incident、修正、再配備までを同じ経路で通し、HELIX自身のための例外の契約を作らない | 稼働している世代と候補の世代を分け、候補の世代の自己承認で稼働している世代を壊さない |
| 013、020、021 | 対応なし | — | 単一障害点の把握、HELIX自身から独立した起動と復旧、通常の経路の外にある復旧の経路は、新しい案である。`archive/`全体を「recovery root」「SPOF」「単一障害点」「out-of-band」で探した。「out-of-band」の3件は、旧work-guardで人が環境変数を設定することを指すもので、復旧の経路ではなかった。他は0件だった |

## 未確定の点

- 2026-09-26のPOの回答で、Conceptの機構の表にHELIX-INFRASTRUCTUREの行を加え、1.0の機構に並べた（[Concept配置の判断記録](../../governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)）。
- 本書の対象revisionは、POが確認する。
- 後の版へ回すもの（高度なAutoscaling、Multi-cloud、完全自動のFailover等）の具体の版は、原文にないため未定である。
