# HELIX-BRAIN L10 非機能検証（部分草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。Stage 1/Stage 2b契約確認に不要な性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage | 正常記録で8/8由来fieldを解決でき、各fieldを1つずつ欠落/stale/revision不一致にする | source/evidence/scope/evaluationが不足するごとにcandidateのまま、accepted/matureへの誤遷移0。 |
| `HELIXBRAIN-L2-007` | false promotion | AI-generated-only、single successのみ、counterexample/limitationなし、LABO revision mismatchを個別に投入 | accepted/matureへの遷移がなく、不足元owner/fieldを観測可能。 |
| `HELIXBRAIN-L2-008` | state distinction and pin stability | 5 L2 stateをそれぞれ適用し、consumer Rをpinした後でRをsupersededとしてR2を追加 | 各state識別、既存consumer R保持、OS usageとBRAIN state別owner。 |
| `HELIXBRAIN-L2-008` | unknown handling | unknown identity/revision/stateおよびversion_targetを実版として差し替える | currentへの推測解決・version_target受入・owner間のwritebackがない。 |
| `HELIXBRAIN-L2-028` | range and identity matrix | 共通HARNESS contractのrange内/外/欠落/解釈不能、descriptorとknowledgeのfieldを独立変異 | 内側のみ適用可能、外/unknown拒否またはunknown、field cross-substitutionがない。 |
| `HELIXBRAIN-L2-028` | boundary ownership | common rollback/unfinished-obligationをBRAIN responseへ要求 | HARNESS共通契約への返却を観測しBRAINが再定義しない。 |

### Stage 2b basic BRAIN measurements

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-001/002` | candidate domain and hierarchy trace | identity/meaning/state、4 kind level、parent edgeを投入し、重複/unknown/製品名/参照喪失を変異 | 列挙field coverageと候補停止を観測。domain候補一覧を充実させる義務は検証しない |
| `HELIXBRAIN-L2-003/004` | descriptor and comparison completeness | applicability fieldを一つずつ欠落させ、複数候補のscope/weightを欠落 | field別にunknown/holdを確認し、推測適用・絶対順位がない |
| `HELIXBRAIN-L2-005/009` | relation source trace | endpoint/type/meaning/sourceを持つedge、名称類似だけのedge、source欠落composite | 各edge/candidateからsourceへtraceでき、根拠なしedgeを確定しない |
| `HELIXBRAIN-L2-006/011` | shared/product boundary | shared knowledgeとProduct Core固有fieldを混在し、source context欠落/除去 | 分離可能fieldの対応率と、分離不能時に停止することを記録 |
| `HELIXBRAIN-L2-010` | conditional anti-pattern integrity | context/condition/impact/alternative/provenanceを個別欠落・条件外適用 | universal prohibitionへの誤一般化を拒否し、不足をunknownにする |
| `HELIXBRAIN-L2-012/029` | candidate/decision and unseen boundary | candidate response、unit composite、別owner adoption recordとheld-out別Domain/required-input-missing fixtureを投入 | BRAINのみで採択へ遷移せず、scope不明はunknown/未評価。追加actor/threshold/gateは検証条件にしない |

### Stage 2b Infrastructure measurement cases

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | field・source境界 | Compute、Network、Storage等の列挙subdomainを例として含むDomain構造と、source付き未列挙subdomain案を投入し、追加/分割/統合/退役を別々にsimulateし参照先を維持。 + item別missing/unknown/invalid mutations | 列挙20初期Subdomainをfixtureで認識 (20/20 coverage候補)、追加candidate 1件は固定集合外でも保持。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-002` | field・source境界 | Availability→Active/Passive→Primary/Standby/Health Detection/FailoverとDeployment→Blue-Green→Active/Candidate/Traffic Switch/Rollbackの両階層fixture。 + item別missing/unknown/invalid mutations | 2つの階層例それぞれの明示node/edge/typeが全て追跡可能 (2/2 structure coverage候補)。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-003` | field・source境界 | 全20 descriptor fieldをsource付きで持つInfrastructure Pattern fixtureとcomplete contextを投入。 + item別missing/unknown/invalid mutations | descriptor 20/20 fieldが全てtrace可能またはunknownの理由付き。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-004` | field・source境界 | Availability/Performance/Capacity/Reliability/Recoverability/Security/Privacy/Observability/Maintainability/Costそれぞれについてinput sourceとPattern candidate relationを用意。 + item別missing/unknown/invalid mutations | NFR特性10/10件をsource-to-pattern-to-inputへtrace可能またはunknown。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-005` | field・source境界 | 期待failure・detection・impact・containment・recovery・residual riskの全field/sourceを持つcondition付きfailure recordを投入。 + item別missing/unknown/invalid mutations | 13/13 failure類型と6/6 oracle fieldを状態・source付きで観測可能。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-006` | field・source境界 | Retry/Timeout、Circuit Breaker/Failover、Graceful Degradation、Rollback/Restore/Rebuild/Reconciliation/Disaster Recoveryを条件付きRecovery Pattern candidateとして投入し、実行stateを付けない。 + item別missing/unknown/invalid mutations | 列挙Recovery Pattern候補10/10件を識別、実操作/実行完了claim 0。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-007` | field・source境界 | 6 deployment methodと6 comparison characteristicにsource付き値を備えた同一problem fixtureを投入。 + item別missing/unknown/invalid mutations | deployment method 6/6件と6/6 比較特性をfixture上で保持、BRAIN実action 0。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-008` | field・source境界 | 8 scaling patternとtrigger/bottleneck/limit/statefulness/synchronization/saturationの入力・条件を持つworkload fixture。 + item別missing/unknown/invalid mutations | 8/8 pattern kindと6/6 trigger/bottleneck/limit/state/sync/saturation attributesを確認。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-009` | field・source境界 | 11 design observation pointsをsource付きPattern contextに結び、実sample値なしの設計fixtureを投入。 + item別missing/unknown/invalid mutations | 観測設計点11/11件をtraceし、実signal valueの保存0。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-010` | field・source境界 | backup strategy+replication+restore pattern+restore verification+required conditionsをrelationするcandidateとproduct-source RTO/RPOを別fieldにする。 + item別missing/unknown/invalid mutations | backup-only/restore-verified/required-conditionの3 evidence statesを区別し、targetはproduct sourceどおり。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-011` | field・source境界 | fixed/variable tendencyとidle/scaling/redundancy/storage/network/operations costsをcontext/effective source/time付きで比較。 + item別missing/unknown/invalid mutations | cost特性7/7件を比較可能、source/time欠落 priceを現在価格として表示0。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-012` | field・source境界 | Object Storage abstractionとS3/GCS/Azure Blob/MinIO implementation examplesを別identity・version・relation source付きで投入。 + item別missing/unknown/invalid mutations | abstract identityとimplementation identityをfixtureごとに分離。4つのprovider例は例示で、網羅義務ではない。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-013` | field・source境界 | Local/VPS/Dedicated/Cloud/GPU/Distributed workerを同じabstract Resource/Capability structureで表現するfixture。 + item別missing/unknown/invalid mutations | 列挙resource class 6件を同じ抽象モデルでfixtureで確認、credential/state/permissionの記録0件。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-014` | field・source境界 | Web→LB→App→DB→BackupおよびApp→Queue→Workerのnodesと9 typed relation examplesをsource付きで構成。 + item別missing/unknown/invalid mutations | typed topology relation 9/9件をendpoint/meaning/sourceへtrace、unknown edgeを確定0。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-015` | field・source境界 | 固定L2に列挙した4 cross-domain scenarioのrelation scope/evidenceをsource付きで投入。 + item別missing/unknown/invalid mutations | cross-domain例4/4件はscope/sourceつきで保持、根拠のない因果claim 0件。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-016` | field・source境界 | 11 listed Anti-Patternそれぞれにcondition、manifestation、detection clue、safer alternative/sourceを添えて投入。 + item別missing/unknown/invalid mutations | Anti-Pattern 11/11件のcondition/detection/alternative mapをfixtureで保持、普遍禁止への誤一般化0件。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |
| `HELIXBRAIN-L2-INFRA-017` | field・source境界 | 6 maturity stateを異なるevidence/scope/version付きで別々に与え、single internal successとproject-use recordを含める。 + item別missing/unknown/invalid mutations | maturity value 6/6件をevidence/scope/versionに結び、単独成功による普遍mature化0件。unknown/unsupported claimを成功にしない。性能時間/容量SLAは本契約検証に不要。 |

測定結果はfield完全性、owner境界、source revision、unknown/holdの処置などの観測値で記録する。このStage 2bのfield/source/owner境界検証では、対象behaviorの合否に性能時間・容量・保持期間の閾値を要しないため新設しない。別の技術値が要件上必要なら、上流に数値指定がなくてもL3候補として根拠・比較案・測定方法を添えて通常の承認パッケージに提示し、parameterごとの承認は求めない。旧値や参考測定値を自動継承・合否閾値へ昇格させない。
