---
title: "HELIX-BRAINのInfrastructure領域の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-26
mechanism: HELIX-BRAIN
source: docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md
decision_record: docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
---

# HELIX-BRAINのInfrastructure領域の要求候補

## これは何か

POが2026-09-26に示した[HELIX-BRAIN Infrastructure Domain 要求候補の原文](../sources/brain-infrastructure-domain-po-original-2026-09-26.md)を、BRAINの要求候補として整理したものである。
BRAINの企画（L1）は[L1企画案](../L1-planning/brain-intent.md)がPOによる対象revisionの確認待ちである。そのため本書は要求（L2）ではなく候補であり、L1企画案のrevisionをPOが確認した後に要求として採否する。本書から要求の採用・承認・実装許可を生成しない。
IDは原文のもの（HELIXBRAIN-L2-INFRA-001〜017）をそのまま使う。

## 位置づけ

| 持ち手 | 持つもの |
|---|---|
| HELIX-BRAIN | 再利用できるInfrastructureの設計知識 |
| 各製品のHELIX-HARNESS-CORE | その製品で採用したInfrastructureの設計 |
| 実際に稼働しているInfrastructure（Runtime） | 実際のserver、network、database、資源の状態、配備・backup・restore・scalingの実行 |

BRAINは、AWS、GCP、VPS等の実環境の状態、資格情報、provider account、Infrastructureの操作権限を持たない。これらはRuntime、OS、SECURITY、Runner／Sandbox等の責務に分ける。

## 要求候補

Infrastructureは、BRAINのL1企画案で1.0から扱う初期の領域の一つである。版はすべて1.0とする。

| ID | 要求候補 | 親にするL1 | 種類 |
|---|---|---|---|
| HELIXBRAIN-L2-INFRA-001 | Infrastructureの設計知識を他の設計と区別して体系化し、少なくともCompute、Network、Storage、Database Infrastructure、Cache、Queue／Messaging、Load Balancing、Service Discovery、Deployment、Scaling、Availability、Reliability、Backup／Restore、Disaster Recovery、Observability、Capacity、Cost Architecture、Infrastructure Security、Environment、Runtime／Execution Platformの下位の領域を扱える。下位の領域は固定せず、追加・分割・統合・退役できる | HELIXBRAIN-L1-001 | 単体 |
| HELIXBRAIN-L2-INFRA-002 | Infrastructureでも、領域→Pattern→Design Unit→Partの共通の構造を使う（例：Availability→Active／Passive→Primary、Standby、Health Detection、Failover）。cloud providerに固有の設定だけをPatternとして扱わない | HELIXBRAIN-L1-002 | 単体 |
| HELIXBRAIN-L2-INFRA-003 | Patternに、問題、workloadの前提、想定の負荷、可用性・整合性・遅延・容量・scalingの条件、failureの前提、復旧の条件、dataの耐久性、networkの要件、securityの制約、運用の複雑さ、費用の特性、必要な観測、適用の条件、使えない場合、trade-off、根拠を持たせられる。「この構成が一般的」という理由だけで適用できるとしない | HELIXBRAIN-L1-003 | 単体 |
| HELIXBRAIN-L2-INFRA-004 | 非機能の要求の特性（Availability、Performance、Capacity、Reliability、Recoverability、Security、Privacy、Observability、Maintainability、Cost）から、関係するInfrastructureのPattern、必要な設計のinputへ辿れる。BRAINは要求の値を決めない | HELIXBRAIN-L1-003、005 | 単体（設計のinputはHARNESSへの接続） |
| HELIXBRAIN-L2-INFRA-005 | 正常な構成だけでなくfailureの構造（単一障害点、networkの分断、依存の失敗、storageの枯渇、queueの飽和、接続の枯渇、資源の不足、連鎖する障害、regionやzoneの障害、配備・backup・restoreの失敗、設定のずれ）を持ち、各Patternについて想定のfailure、検出、影響、封じ込め、復旧、残るriskを扱える | HELIXBRAIN-L1-010 | 単体 |
| HELIXBRAIN-L2-INFRA-006 | 障害を防ぐ設計だけでなく、障害の後に戻す設計の知識（Retry、Timeout、Circuit Breaker、Failover、Graceful Degradation、Rollback、Restore、Rebuild、Reconciliation、Disaster Recovery）を持つ。「落ちない構成」だけでInfrastructureが成り立つとしない | HELIXBRAIN-L1-002、010 | 単体 |
| HELIXBRAIN-L2-INFRA-007 | 提供・更新のPattern（Rolling Deployment、Blue-Green、Canary、Immutable Deployment、In-place Update、Staged Rollout）を持ち、影響の範囲、巻き戻しの特性、必要な重複、可用性への影響、移行の制約、必要な観測を比べられる。実際のreleaseや配備の進行はBRAINが行わない | HELIXBRAIN-L1-004 | 単体 |
| HELIXBRAIN-L2-INFRA-008 | workloadに応じて資源を増減する設計の知識（Vertical Scaling、Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressure）を持ち、Patternにtrigger、bottleneck、上限、状態の有無、同期の費用、飽和したときの振る舞いを持たせられる | HELIXBRAIN-L1-003 | 単体 |
| HELIXBRAIN-L2-INFRA-009 | Patternごとに、成り立っていることを確かめる観測点（metrics、log、trace、health、依存の状態、容量、飽和、error、遅延、配備の状態、復旧の状態）を持てる。構成を作っただけで設計を閉じない。実際のlogやmetricはBRAINに保存しない | HELIXBRAIN-L1-003 | 単体 |
| HELIXBRAIN-L2-INFRA-010 | BackupのPatternをRestoreのPatternと切り離さず、backupの戦略、保持、複製、restore、復旧の確認の設計知識を関係づけられる。backupがあることを復旧できることとせず、backup、restoreの確認、必要な復旧の条件がそろって初めて復旧の証拠の候補とする。実際のRTO／RPOの値は製品の要求が持つ | HELIXBRAIN-L1-003、010 | 単体 |
| HELIXBRAIN-L2-INFRA-011 | 費用を設計のtrade-offの材料として表せる（固定・変動の傾向、遊休の費用、scaling・冗長・storage・network・運用の費用）。具体的な価格を恒久の知識として扱わず、providerや時点で変わる値と、構造の上の費用の特性を区別する | HELIXBRAIN-L1-004 | 単体 |
| HELIXBRAIN-L2-INFRA-012 | providerに依存しないPattern（例：Object Storage）と、providerの実装の例（S3、GCS、Azure Blob、MinIO）を分ける。汎用のPatternを特定のproviderに固定せず、providerに固有の実装の知識は、implements、compatible_with、constraint_of等の関係でPatternへつなげる | HELIXBRAIN-L1-005、011 | 単体 |
| HELIXBRAIN-L2-INFRA-013 | cloudだけを前提にせず、local machine、VPS、dedicated server、cloud、GPU node、分散したworker nodeを、共通の資源・能力のモデルで表せる知識の構造を持つ。特定のproviderや計算機の構成をBRAINの前提にしない | HELIXBRAIN-L1-001、002 | 単体 |
| HELIXBRAIN-L2-INFRA-014 | Infrastructureを部品の一覧ではなく構成の関係（topology）として扱い、少なくともdepends_on、communicates_with、replicated_by、backed_up_by、monitored_by、failover_to、secured_by、deployed_on、scales_withを扱える | HELIXBRAIN-L1-005 | 単体 |
| HELIXBRAIN-L2-INFRA-015 | Infrastructureの領域を孤立させず、API、Data、Security、Visual／UX等の他の領域との関係（affects、constrains、may affect等）を持つ | HELIXBRAIN-L1-005 | 単体 |
| HELIXBRAIN-L2-INFRA-016 | Infrastructureに固有のAnti-Pattern（単一障害点、共有する可変な本番の状態、上限のないretry・queue・資源の増加、timeoutの欠落、restoreを試さないbackup、行動を伴わない監視、手作業だけの復旧、隠れた依存、記録のない外部送信）を、成り立つ条件、現れ方、検出の手がかり、より安全な代替とともに持つ | HELIXBRAIN-L1-010 | 単体 |
| HELIXBRAIN-L2-INFRA-017 | Patternの成熟度（experimental、observed、validated、mature、deprecated、retired）を区別し、内部の製品で一度成功しただけで普遍のPatternへ昇格させない。利用の実績、failure、反例、LABOの評価を関係づける | HELIXBRAIN-L1-007、008 | 単体（評価はLABOとの接続） |

## 接続の要求として外へ出すもの

接続の間にはコネクタを入れ、コネクタは接続の数だけ置く（[LABOの判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）。

| 接続 | 渡すもの |
|---|---|
| HELIX-HARNESS-CORE → BRAIN | 製品で実際に成り立ったInfrastructureの設計から、汎用化の候補 |
| LABO → BRAIN | 運用の実績、failure、incident、復旧、費用等を比べて評価し、再利用できると確かめた構造 |
| BRAIN → HELIX-HARNESS-CORE | 製品のInfrastructureの設計に使えるPattern、Unit、Part、trade-off、failureのPattern |
| BRAIN ↔ INTELLIGENCE | Infrastructureの設計の候補の選択、比較、影響の予測にBRAINの知識を使う |
| BRAIN → HARNESS | Patternが必要とするinput（workload、可用性、容量、復旧、観測、費用、security）を、要求と設計義務へつなぐ |
| BRAIN ↔ Runtime | BRAINは汎用の設計知識を渡す。Runtimeの実際の状態をBRAINへ直接学習させず、利用の結果はLABOの評価を経て汎用の知識の候補へ戻す |

## 旧HELIXとの対応

| 本書 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| INFRA-003、004、BRAIN → HARNESS | 旧NIO-L3-01、02（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7-8`）。現行ではHARNESSの要求案の「運用品質を落とさない工程条件」が再採否待ちとして持つ | 要求の形成で、対象、環境、workload、failure mode、dataの重要度、RTO／RPOの候補、観測、運用のownerをtyped inputとして集め、配備・容量・telemetry・backup・restore・rollback等を設計義務にする | 工程の条件はHARNESSに残し、BRAINはそれに使う再利用のPatternと、Patternが求めるinputを持つ |
| INFRA-006、010 | 旧NIO-L3-06（同:12） | backup／restore、rollback、failoverは実行できる手順を持ち、名前や文書があることを成功の証拠にしない | BRAINは、backupとrestoreを対にする設計知識を持つ。実行と証拠は製品と運用の側に残す |
| INFRA-009 | 旧NIO-L3-03、09（同:9,15） | 計測の証拠の定義と、観測の停止・欠測・古い状態を健全として扱わないこと | Patternごとに成り立ちを確かめる観測点を持たせる |
| INFRA-012、013、017 | 対応なし | — | providerに依存しないPatternと実装の分離、local・VPS・cloud・GPUの共通の抽象、Patternの成熟度は、新しい案である |

## 未確定の点

- 原文の「Infrastructure Runtime」（実際に稼働しているInfrastructure）のうち、HELIX自身の実際の実行環境は、2026-09-26のPOの回答で新しいコア機構のHELIX-INFRASTRUCTUREが持つことにした（未mergeのPR #2148の判断記録HDEC-INFRASTRUCTURE-L1-IDEA-2026-09-26。PR #2148の統合後に同記録へ付け替える）。HELIX-INFRASTRUCTURE自体は、POが全体を見てから扱いを決めるアイデアの段階である。利用者の環境の運転はHELIX-Web-OS（Visionの材料）が近く、HELIXの本体のInfrastructureへ暗黙に共有しない。原文の「BRAINが持たないもの」はRuntime、OS、SECURITY、Runner等へ分けるとしており、BRAINが持たないことは確定している。
