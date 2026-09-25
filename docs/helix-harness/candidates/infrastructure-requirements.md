---
title: "HELIX-HARNESSのInfrastructureの要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-26
mechanism: HELIX-HARNESS
source: docs/helix-harness/sources/infrastructure-requirements-po-original-2026-09-26.md
decision_record: docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md
---

# HELIX-HARNESSのInfrastructureの要求候補

## これは何か

POが2026-09-26に示した[HELIX-HARNESS Infrastructure要求候補の原文](../sources/infrastructure-requirements-po-original-2026-09-26.md)を、HARNESSの要求候補として整理したものである。
原文は、新しい独立したHARNESSを作るものではなく、既存のHARNESS-L2-003／004／005／006／008／009を具体にするものである。HARNESSの要求（L2）は2026-09-25の判断で仮決めであり、本書は要求（L2）へ採る前の候補として置く。採否はPOが決める。本書から要求の採用・承認・実装許可を生成しない。
IDは原文のもの（HARNESS-INFRA-001〜020）をそのまま使う。

## 位置づけ

| 持ち手 | 持つもの |
|---|---|
| HELIX-BRAIN | Infrastructureの汎用の設計知識（[BRAINのInfrastructure領域の要求候補](../../helix-brain/candidates/infrastructure-domain-requirements.md)、PR #2145） |
| HELIX-HARNESS | 何を要求・設計・検証すべきか |
| 各製品のHELIX-HARNESS-CORE | その製品のInfrastructureの要求と設計 |
| 実際に稼働しているInfrastructure（Runtime） | 実際の状態と実行 |

HARNESSは、serverの作成、networkの変更、databaseの操作、scaling、配備、backup、restore、監視、incidentへの対応を直接行わない。それらが何を満たし、何を証明しなければならないかを定める。BRAINのPatternの一覧を複製しない。

## 要求候補

| ID | 要求候補 | 具体にする既存の要求 |
|---|---|---|
| HARNESS-INFRA-001 | 要求の形成のときに、対象製品の品質の領域（Availability、Reliability、Performance、Capacity、Scalability、Cost、Security、Privacy、Recovery、Backup／Restore、Observability、Deployment、Operation、Maintenance）の適用を、required、conditional、N/A、unresolvedで理由付きで区別する。不明をN/Aへ変えない | HARNESS-L2-008、「運用品質を落とさない工程条件」 |
| HARNESS-INFRA-002 | Infrastructureの設計へ進む前に、必要な入力（workload、想定のtraffic、同時実行、dataの量と重要度、遅延・可用性・耐久性・復旧の期待、地理・security・privacy・運用・費用・配備の制約、外部の依存）を要求の入力として確かめる。値をHARNESSが決めず、不足はBackflowで要求へ戻す | HARNESS-L2-008 |
| HARNESS-INFRA-003 | 設計義務を作るときに、BRAINのInfrastructure領域のPattern、Unit、Part、適用の条件、trade-off、failure、Anti-Pattern、根拠を参照できる。BRAINにPatternがあることを、その製品での採用の決定としない | HARNESS-L2-009 |
| HARNESS-INFRA-004 | Infrastructureの要求も、単体・接続・構成体を別のidentityとして扱う（databaseの単体の成立、applicationからdatabaseへの接続の成立、システム全体の可用性の成立を区別する）。単体の成功からInfrastructure全体の成立を推定しない | HARNESS-L2-008（構成的保証と差分証明） |
| HARNESS-INFRA-005 | 要求から、必要なcomponent（Compute、Network、Storage、Database、Cache、Queue、Load Balancer、Runtime、外部service、監視、Backup、Recovery）と、その関係（depends_on、communicates_with、deployed_on、replicated_by、backed_up_by、monitored_by、failover_to）を設計義務として導く | HARNESS-L2-009 |
| HARNESS-INFRA-006 | 当てはまるfailure（依存・network・資源・storageの枯渇、queueの飽和、timeout、部分的な失敗、設定の誤り、配備・backup・restoreの失敗、外部providerの失敗）を明示し、検出、影響、封じ込め、復旧、検証を必要に応じて設計義務に含める | HARNESS-L2-009 |
| HARNESS-INFRA-007 | 重要な機能・data・接続について、何が壊れたら全体が止まるか（単一障害点）を設計で確かめる。必ず冗長にするとはせず、受け入れる場合も理由、影響、復旧、受け入れるriskを明示する | HARNESS-L2-009 |
| HARNESS-INFRA-008 | 想定の容量、資源の上限、bottleneck、飽和したときの振る舞い、scalingの条件、backpressure、過負荷のときの振る舞いを、設計と検証へつなぐ。正常なときに速いことだけでなく、限界を超えたときにどうなるかを対象にする | HARNESS-L2-005、009 |
| HARNESS-INFRA-009 | 設計の時点で、成立・異常・劣化・復旧を何で観測するかを決め、必要な観測を義務として持つ。観測できない状態を正常と判定しない | HARNESS-L2-005、009 |
| HARNESS-INFRA-010 | 何をincidentとして扱うか（観測できる症状、影響の範囲、重さの条件、検出、通知、対応の境界、復旧の条件、証拠）を、製品の要求とInfrastructureの設計へつなぐ。incidentの定義を実装後の運用の判断だけに任せない | HARNESS-L2-008、009 |
| HARNESS-INFRA-011 | backupの作成、restoreの確認、復旧の要求の充足を別の成果として検証する。backupの対象と版、restoreの対象と手順、restore後の完全性、復旧の時間、許容するdataの損失へつなぐ。RTO／RPOの値は製品の要求が持つ | HARNESS-L2-005 |
| HARNESS-INFRA-012 | Releaseできること、特定の環境へ配備されたこと、観測で健全と確かめたことを区別する。配備の設計に、成果物と版、対象の環境、設定、依存、migration、前提、healthの確認、巻き戻し、配備後の観測を必要に応じて求める | HARNESS-L2-003、006（成果物の状態の段階） |
| HARNESS-INFRA-013 | Infrastructureの変更（Compute、Network、Storage、Database、依存、Runtime、配備の方法、設定、資源の大きさ、scalingの規則、Backup、Recovery、監視、provider、regionと場所）を追い、影響する要求・設計・接続、必要な再検証、運用の観測を導く | HARNESS-L2-004 |
| HARNESS-INFRA-014 | 望む状態と実際の状態がずれる可能性を前提に、そのずれ（drift）を検証の対象として定められる。実際のdriftの検出と状態の取得は、HARNESS自身では行わない | HARNESS-L2-005 |
| HARNESS-INFRA-015 | 費用を運用後の請求額だけで扱わず、資源、遊休、scaling、冗長、storage、network、modelと実行環境、運用の費用を設計のtrade-offへつなぐ。具体的な価格と予算の値は製品の要求が持つ | HARNESS-L2-008、009 |
| HARNESS-INFRA-016 | HELIX-SECURITYまたは製品のsecurityの要求から、networkの境界、隔離、資格情報・data・実行の境界、外部との接続、更新の境界等のInfrastructureの設計義務を導く。HARNESSは操作のauthorityを発行しない | HARNESS-L2-009 |
| HARNESS-INFRA-017 | 変更の内容、risk、layer、対象から必要な検証義務を導く（例：networkの変更は接続・隔離・failure、databaseの変更はmigration・整合性・巻き戻し、scalingの変更は負荷・飽和・復旧、backupの変更はbackupと実際のrestore）。固定したInfrastructureのCI一式を毎回回さない | HARNESS-L2-005（ticketで決めるCI） |
| HARNESS-INFRA-018 | 下のcomponentの有効な証拠を上へ集めてよいが、Compute・Database・Networkの合格だけでシステムのInfrastructureの合格とせず、接続と構成体に固有の未充足の義務だけを追加で検証する | HARNESS-L2-005（構成的保証と差分証明） |
| HARNESS-INFRA-019 | Infrastructureについて、Designed、Implemented、Verified、Deployed、Observed、Operatedを区別し、検証の環境での成功を本番の運用の成立へ読み替えない。L12で、可用性、性能、failure、復旧、飽和、費用、incident、観測の完全さを評価できる | HARNESS-L2-003、「運用品質を落とさない工程条件」 |
| HARNESS-INFRA-020 | 実運用で想定外のfailure、容量の不足、費用の逸脱、復旧の失敗、観測の不足、incidentの再発、前提の不成立が見つかれば、観測、finding、Backflow、要求・設計の改訂へ戻せる。運用のlogから要求を自動で変えない | HARNESS-L2-004 |

## サービス⑥・⑦との関係

- サービス⑥（リリースの仕組み、インフラ）では、Infrastructureの要求、設計、実装（IaC等）、検証、Releaseの適格、配備の契約、復旧の契約を、一つの追える流れとして扱う。AWS、GCP、Terraform、OpenTofu、Ansible、Docker、Kubernetes等を、HARNESSの固定の技術にしない。
- サービス⑦（運用保守）では、観測、incident、復旧、保守、Infrastructureの変更、Backflowを、サービス⑥で作った要求と設計へ戻せる。サービス⑥と⑦は別のリリースの単位として成り立ち、接続の要求で結ぶ。

## 旧HELIXと現行の要求との対応

| 本書 | 旧HELIX・現行 | 保持する点 | 変わる点 |
|---|---|---|---|
| 001、002、019 | 旧NIO-L3-01、09（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7,15`）、現行HARNESS L2の「運用品質を落とさない工程条件」 | 適用・非適用・unknown・決定ownerの確認、typed inputの収集、designed・implemented・verified・observed・operatedの分離 | 適用の区分をrequired・conditional・N/A・unresolvedにし、Deployedの段を加える |
| 006、011 | 旧NIO-L3-06（同:12） | backup／restore、rollback、failoverを実行できる手順で確かめ、名前や文書があることを成功の証拠にしない | backupの作成、restoreの確認、復旧の要求の充足を3つの別の成果にする |
| 009 | 旧NIO-L3-03、09（同:9,15） | 観測の証拠の定義と、欠測・停止・古い状態を健全にしないこと | 観測を設計の時点で決める |
| 004、017、018 | 現行HARNESS L2の構成的保証と差分証明、ticketで決めるCI（本PR） | 同じ | Infrastructureへ当てる |
| 012 | 現行HARNESS L2の成果物の状態の段階（Release-eligible、Deployed、Observed。本PR） | 同じ | Infrastructureの配備の設計の中身を加える |

## 未確定の点

- 原文の「Infrastructure Runtime」をどの機構が持つかは、まだ決まっていない（[BRAINのInfrastructure領域の要求候補](../../helix-brain/candidates/infrastructure-domain-requirements.md)の未確定の点と同じ）。HARNESSが持たないことは原文で確定している。
- 本書を要求（L2）の本文へ入れるか、候補のまま残すかは、POが仮決めのL2の最終確認のときに決める。
