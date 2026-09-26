---
title: "HELIX-BRAIN受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
authority_status: draft_candidate
freeze_blocking: true
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-brain/L1-planning/brain-intent.md
pair_artifact: docs/helix-brain/L2-requirements/brain-requirements.md
sources:
  - docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md
  - docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md
  - docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md
  - docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
---

# HELIX-BRAIN受入候補

本書は[HELIX-BRAIN要求候補](../L2-requirements/brain-requirements.md)と対になる受入条件候補である。すべて未実行・未採択であり、文書、ID登録、review、mergeから要求合意・L3承認・実装許可を作らない。対象要求revision、scope、実物、結果、根拠を照合して利用者が判断する。

受入ではunknownをpassにしない。L2のunit、connection、compositeを別々に判定し、unit合格からconnection/compositeを成立扱いしない。`version_target`は目標版で実版ではない。機能pack共通のidentity/contract/artifact/dependency version、compatibility、交換・更新・rollback・未完義務引継ぎはHARNESS-L2-010/011が所有し、BRAIN受入はそれを参照して知識固有identity/revision/stateを照合する。

| L2要求 | version_target | 成功条件と反例 |
|---|---|---|
| HELIXBRAIN-L2-001 | 1.0 | Software Architecture、Application Architecture、Backend、Frontend、API / Integration、Data / Database、Infrastructure、Security、Visual Design、UX / Interactionを識別でき、Domainの追加・分割・統合・退役ができる。Reliability / Recovery、Performance、Observability、Testing / Quality、Operations / Maintenance、Accessibility等の候補を初版で充実必須と解釈、または特定製品/projectをDomainに固定したら不合格。 |
| HELIXBRAIN-L2-002 | 1.0 | Domain→Pattern→Design Unit→Partを辿り、Visual DesignのDashboard→Navigation/KPI/Work Area→Table/Filter/Status例を階層で表せる。ファイル/code片/UI部品の集合だけでPattern/Unit/Partの意味がない場合は不合格。 |
| HELIXBRAIN-L2-003 | 1.0 | Patternにproblem、前提、applicability、required input、constraint、trade-off、negative case、failure mode、compatible/incompatible pattern、evidence、maturityを結び、適用可能条件を追える。Patternの存在だけで今回の採用を断定、またはnegative/failure/evidenceを欠落したら不合格。 |
| HELIXBRAIN-L2-004 | 1.0 | Strong/Eventually Consistent/Compensating Transaction等の同一問題に成立し得るPatternを併存させ、適用条件、長短、制約、failure、costで比較できる。一つを恒久の正解として他を上書き、または稼働案件での選択をBRAINが確定したら不合格。 |
| HELIXBRAIN-L2-005 | 1.0 | Pattern/Unit/Part間でrequires、depends_on、compatible_with、conflicts_with、affects、alternative_to、composed_ofを方向・意味付きで辿れる。relation名だけ、端点不明、未確認の因果を確定relationにしたら不合格。 |
| HELIXBRAIN-L2-006 | 1.0 | Information Architecture、Visual Hierarchy、Layout、Grid、Spacing/Density、Typography、Navigation、Component Composition、Form、Feedback、Empty/Loading/Error State、Responsive Design、Dashboard、Content Hierarchy、Accessibilityの知識例を再利用構造として扱える。製品固有の「黒背景・青accent」等のVisual Identityを汎用知識へ取り込んだら不合格。 |
| HELIXBRAIN-L2-007 | 1.0 | Pattern/Unit/Partにsource、provenance、根拠、採用理由、評価範囲、反例、限界、LABO評価の対象revisionを辿れる。AI生成や実績一件を根拠にaccepted/matureへ進めたら不合格。 |
| HELIXBRAIN-L2-008 | 1.0 | knowledge identity、revision、current/superseded/deprecated/experimental/retiredを区別し、製品Coreが参照したexact版を追跡できる。旧版を黙って置換、BRAINの知識状態とOSのproject利用・登録状態を同じ正本にしたら不合格。 |
| HELIXBRAIN-L2-009 | 1.0 | 既存PatternのUnitを組み合わせrelationを加えた構成候補を表せ、LABO評価・OS登録とBRAIN独立検証が終わる前はcandidateに留める。構成候補だけで確立Patternへ昇格したら不合格。 |
| HELIXBRAIN-L2-010 | 1.0 | Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration drift等について、成立条件・影響・反例を知識として持てる。failureの前提を消して常時禁止/常時適用へ一般化したら不合格。 |
| HELIXBRAIN-L2-011 | 1.0 | 製品名、product requirement、画面、業務ルール、利用者判断を含む候補で、汎用化可能な部分と製品固有部分を識別し、分離不能なら受入を止める。個別製品意味をそのまま汎用Patternへ昇格したら不合格。 |
| HELIXBRAIN-L2-012 | 1.0 | BRAINの返却がPattern候補、required input、relation、alternative、constraint、evidenceに限定され、採用決定はHARNESS-CORE/INTELLIGENCE/人等の該当ownerに残る。候補返却を採用authorityや案件のruntime判断と誤認したら不合格。 |
| HELIXBRAIN-L2-INFRA-001 | 1.0 | Compute、Network、Storage、Database Infrastructure、Cache、Queue/Messaging、Load Balancing、Service Discovery、Deployment、Scaling、Availability、Reliability、Backup/Restore、Disaster Recovery、Observability、Capacity、Cost Architecture、Infrastructure Security、Environment、Runtime/Execution Platformの20 subdomainを扱え、追加・分割・統合・退役が可能。列挙を固定enum、または実Runtime resource一覧としたら不合格。 |
| HELIXBRAIN-L2-INFRA-002 | 1.0 | Infrastructure知識もDomain→Pattern→Design Unit→Partを表し、Active/PassiveやBlue-Greenの各部品とrelationを辿れる。Cloud provider固有設定だけをprovider非依存Patternとして登録したら不合格。 |
| HELIXBRAIN-L2-INFRA-003 | 1.0 | Patternにproblem、workload assumptions、expected load、availability、consistency、latency、capacity、scaling、failure/recovery、durability、network/security、operational complexity、cost、observability、applicability、negative case、trade-off、evidenceを持てる。「一般的だから適用」としたら不合格。数値根拠がないRTO/RPO等をここで新設しない。 |
| HELIXBRAIN-L2-INFRA-004 | 1.0 | Availability、Performance、Capacity、Reliability、Recoverability、Security、Privacy、Observability、Maintainability、Cost等の要求特性から関係Patternと必要設計inputを辿れる。BRAINが要求値や製品NFR値を決めたら不合格。 |
| HELIXBRAIN-L2-INFRA-005 | 1.0 | Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration driftの例について想定failure、detection、impact、containment、recovery、residual riskを対応付ける。列挙例または観点の脱落は不合格。 |
| HELIXBRAIN-L2-INFRA-006 | 1.0 | Retry、Timeout、Circuit Breaker、Failover、Graceful Degradation、Rollback、Restore、Rebuild、Reconciliation、Disaster Recoveryの知識を保持し、防止と復旧を区別する。復旧可能性を根拠なく「落ちない構成」で代替したら不合格。 |
| HELIXBRAIN-L2-INFRA-007 | 1.0 | Rolling Deployment、Blue-Green、Canary、Immutable Deployment、In-place Update、Staged Rolloutを影響範囲、rollback特性、必要重複、availability、migration制約、観測で比較できる。BRAINがrelease/deployを実行または進行したら不合格。 |
| HELIXBRAIN-L2-INFRA-008 | 1.0 | Vertical/Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressureを保持し、trigger、bottleneck、limit、state、sync cost、saturation behaviorを識別できる。自動scaling実行能力をBRAINの知識要件に混入したら不合格。 |
| HELIXBRAIN-L2-INFRA-009 | 1.0 | Pattern成立の確認にmetrics、log、trace、health、dependency、capacity、saturation、error、latency、deployment/recovery state等の観測点を関係付ける。実際のlogs/metricsをBRAINに保存、または観測欠如を正常と判断したら不合格。 |
| HELIXBRAIN-L2-INFRA-010 | 1.0 | Backup strategy/retention/replication、Restore、recovery verificationを関係付け、backupだけで復旧可能と結論しない。実際のRTO/RPO値は製品要求側に残し、BRAINが一律値を発明したら不合格。 |
| HELIXBRAIN-L2-INFRA-011 | 1.0 | Fixed/variable cost、idle、scaling、redundancy、storage、network、operation cost等の特性をtrade-offとして比較し、時点/provider依存の実価格と構造上の費用特性を分離できる。変動価格を恒久の定数として扱ったら不合格。 |
| HELIXBRAIN-L2-INFRA-012 | 1.0 | Provider非依存Pattern（Object Storage）とimplementation例（S3、GCS、Azure Blob、MinIO）を別identityで関係付け、implements/compatible_with/constraint_of等を辿れる。Patternを特定providerへ固定したら不合格。 |
| HELIXBRAIN-L2-INFRA-013 | 1.0 | Local machine、VPS、dedicated server、cloud、GPU node、distributed worker nodeを共通resource/capability model上で識別できる。特定provider/計算機構成をBRAINの前提として必須化したら不合格。 |
| HELIXBRAIN-L2-INFRA-014 | 1.0 | Topologyでdepends_on、communicates_with、replicated_by、backed_up_by、monitored_by、failover_to、secured_by、deployed_on、scales_withを端点・意味付きで辿れる。component一覧のみでtopology成立としたら不合格。 |
| HELIXBRAIN-L2-INFRA-015 | 1.0 | InfrastructureとAPI、Data、Security、Visual/UX等のDomain間にaffects、constrains、may affect等のrelationを保持し、根拠と不確かさを区別できる。影響可能性を根拠のない確定因果へ変えたら不合格。 |
| HELIXBRAIN-L2-INFRA-016 | 1.0 | Single Point of Failure、Shared Mutable Production State、Unbounded Retry/Queue/Resource Growth、Missing Timeout、Backup Without Restore Test、Monitoring Without Action、Manual-only Recovery、Hidden Dependency、Undocumented Egressを条件・兆候・安全な代替と結ぶ。対象条件を外して全状況の禁止としたら不合格。 |
| HELIXBRAIN-L2-INFRA-017 | 1.0 | experimental、observed、validated、mature、deprecated、retiredを区別し、利用実績、failure、反例、LABO評価を対象revisionに結ぶ。内部製品で一度成功しただけでuniversal Patternへ昇格したら不合格。 |
| HELIXBRAIN-L2-018 | 1.0 | HELIX-HARNESS-CORE由来candidateのsource/revisionを保持し、製品固有意味・利用者原本と再利用候補を区別してintakeする。BRAINへraw originalを保存、またはcandidate受取だけでPattern accepted/matureとしたら不合格。HELIX原本の扱いに新しい内部保持期限/破棄証拠を追加しない。 |
| HELIXBRAIN-L2-019 | 1.0 | Product Core queryに対しPattern/Unit/Part、required input、条件、代替、constraint、反例、根拠、maturity、exact knowledge versionを返す。返却候補が製品での採用決定として扱われたら不合格。 |
| HELIXBRAIN-L2-020 | 1.0 | LABO evaluation対象revisionと候補revision、scope、method、result、failure、反例、未評価範囲がL2-007/008のgeneric provenance/identity/stateに対応する。Infrastructure candidateでmaturityを扱う場合に限りL2-INFRA-017のstate/evidenceも同じrevisionに結ぶ。評価の一部欠落や対象不一致でaccepted/matureへ進めたら不合格。 |
| HELIXBRAIN-L2-021 | 1.0 | INTELLIGENCEへsource/version付き知識と適用条件を判断材料として返し、BRAIN knowledgeの改変・採用をINTELLIGENCEが直接行わない。knowledge suggestionがruntime decisionと混同されたら不合格。 |
| HELIXBRAIN-L2-022 | 1.0 | Pattern required inputとUnit/Part dependencyからHARNESS-L2-009 obligationへtraceでき、HARNESS-CORE/HARNESSが工程表・遷移図・実装優先順位を導くための材料として受け取れる。BRAINが製品要求値や導出物を単独決定、またはinput/dependencyを接続先へ落とさない場合は不合格。 |
| HELIXBRAIN-L2-023 | 1.0 | BRAINの汎用Visual Design/UX知識をVisual Design HARNESSへ渡し、製品固有screen/flow/token/Visual Identityは各製品Coreに残る。Visual Design HARNESS結果がLABOを経ず直接汎用knowledgeへ昇格したら不合格。 |
| HELIXBRAIN-L2-024 | 1.0 | Infrastructure設計知識はCORE経由、実利用結果はRuntime owner→LABO評価→L2-020経由とし、BRAIN↔Runtimeの直接read/write/learning pathを作らない。Runtime実状態とBRAIN knowledgeを別owner/identityに保ち、実log/metrics/credential/account/操作権限をBRAINに入れない。Runtime操作またはraw runtime data保存は不合格。 |
| HELIXBRAIN-L2-025 | 1.0 | Candidate→LABO evaluation→OS registration/routing→BRAIN change independent verification→adoptionの各状態とowner、対象revisionを別に追う。AI生成、単一実績、LABO評価、OS ticket、文書存在だけでaccepted/matureへ昇格、または意味を変えない差分へ新たなhuman approvalを加えたら不合格。Infrastructure candidateのmaturity判定は該当時のみL2-INFRA-017のstate/evidenceを確認する。 |
| HELIXBRAIN-L2-026 | 2.0 | OSS、設計資料、論文、Issue、PR等のsource identity/revisionを保持し、CONNECT等の取得物をuntrusted dataとしてLABOの分解・比較・評価を経て候補入力する。外部で成功した方式をそのままBRAINへ取り込んだら不合格。列挙例を全外部情報の固定範囲と扱わない。 |
| HELIXBRAIN-L2-027 | 2.0 | 外部source→LABO評価対象→BRAIN candidate/revisionのidentity chainを追い、source確認、分解・比較・実験、OS登録、BRAIN独立検証、採否を各owner契約どおり別に確認する。Infrastructure candidateのmaturityは該当時のみL2-INFRA-017と照合する。外部成功を自環境の成功とする、revision/反例/評価限界を失う、または1.0成立を2.0能力に依存させたら不合格。 |
| HELIXBRAIN-L2-028 | 1.0 | HARNESS-L2-010/011 descriptorのidentity、contract/artifact/dependency versionsとcompatibility rangeに、BRAIN知識revision/version/stateを別に照合する。unknown/mismatch/range外を止め、`version_target`を実版と扱わない。common exchange/rollback/unfinished-obligation contractをBRAINが再定義したら不合格。 |

## 端から端までの確認

- **Provenanceと採否**：候補、LABO評価対象、OS登録状態、BRAIN変更検証、accepted revisionについて、owner・identity・revisionを追い、拒否/hold/unknownからsuccessへ暗黙遷移しないことを確認する。
- **製品意味と汎用知識**：製品固有requirement、screen、business rule、runtime stateを含む例を投入し、汎用候補への混入を止める。分離可能部分の候補受付は昇格と別に記録する。
- **版と互換**：knowledge version/state、productが参照したversion、共通pack contract/artifact/dependency version、`version_target`を別欄で確認し、互換不明のfallbackを拒否する。
- **Failure/NFR**：failure例、restore、capacity、latency、availability、cost、observability等に原文の条件と制約が保持され、製品側の数値要求をBRAINが決めないことを確認する。
- **2.0外部情報**：source provenanceとLABO評価のない候補を止め、1.0の内部seed・機能が2.0外部収集に依存しないことを確認する。

## 親L1との対応

L2の「親L1全12件の受け先」の各行を、この文書の同ID受入へ接続する。1.0のL1義務は1.0列で受け入れ、026/027は外部sourceを扱う2.0拡張として別に受け入れる。Infrastructure知識を表せることと、実資源の自動増減・自動切替等が実装済みであることは別に判定する。
