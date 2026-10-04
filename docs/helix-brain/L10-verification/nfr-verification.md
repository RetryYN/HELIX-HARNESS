# HELIX-BRAIN L10 非機能検証（1.0対象親40件の草稿）

**状態：部分草稿・未承認・未実行。** `../L3-requirements/nfr-grade.md`の候補値を検証する測定設計。Stage 1、Stage 2b、Stage 4、Stage 5の契約確認に不要な性能SLAは追加しない。別の技術値が要件上必要な場合は、上流指定の有無にかかわらず根拠・比較・測定方法付きのL3候補として提示し、承認前の閾値をoracleへ適用しない。

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage | 正常記録で8/8由来fieldを解決でき、各fieldを1つずつ欠落/stale/revision不一致にする | source/evidence/scope/evaluationが不足するごとにcandidateのまま、accepted/matureへの誤遷移0。 |
| `HELIXBRAIN-L2-007` | false promotion | AI-generated-only、single successのみ、counterexample/limitationなし、LABO revision mismatchを個別に投入 | accepted/matureへの遷移がなく、不足元owner/fieldを観測可能。 |
| `HELIXBRAIN-L2-005` | relation-kind coverage | 7列挙relation kindの正常edgeとkind/endpoint/direction/source欠落・名称類似のみedge | exact setとedge単位traceを照合し、根拠なしedgeの誤確定0を観測。全件数だけの案との原因特定能力を比較する。親未列挙のrelation kindは対象外。候補測定、未実行。 |
| `HELIXBRAIN-L2-008` | state distinction and pin stability | 5 L2 stateをそれぞれ適用し、consumer Rをpinした後でRをsupersededとしてR2を追加 | 各state識別、既存consumer R保持、OS usageとBRAIN state別owner。 |
| `HELIXBRAIN-L2-008` | unknown handling | unknown identity/revision/stateおよびversion_targetを実版として差し替える | currentへの推測解決・version_target受入・owner間のwritebackがない。 |
| `HELIXBRAIN-L2-028` | range and identity matrix | 共通HARNESS contractのrange内/外/欠落/解釈不能、descriptorとknowledgeのfieldを独立変異 | 内側のみ適用可能、外/unknown拒否またはunknown、field cross-substitutionがない。 |
| `HELIXBRAIN-L2-028` | boundary ownership | common rollback/unfinished-obligationをBRAIN responseへ要求 | HARNESS共通契約への返却を観測しBRAINが再定義しない。 |

### Stage 2b basic BRAIN measurements

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-001/002` | 初期Domain 10件と4段階構造の追跡 | 固定親が列挙する初期Domain 10件をsource/revision付きで各々投入し、identity/meaning/state、Domain→Pattern→Design Unit→Partのkindとparent edgeを照合する。重複/unknown/製品名/参照喪失を個別に変異 | 初期Domainのidentity/meaning/stateを10/10で照合し、4段階のkind/parent relationをtraceする。追加・分割・統合・退役可能性を閉じた集合にせず、候補一覧の充実義務は検証しない |
| `HELIXBRAIN-L2-003/004` | descriptor and comparison completeness | applicability fieldを一つずつ欠落させ、複数候補のscope/weightを欠落 | field別にunknown/holdを確認し、推測適用・絶対順位がない |
| `HELIXBRAIN-L2-005/009` | relation source trace | endpoint/type/meaning/sourceを持つedge、名称類似だけのedge、source欠落composite | 各edge/candidateからsourceへtraceでき、根拠なしedgeを確定しない |
| `HELIXBRAIN-L2-006/011` | shared/product boundary | 15 knowledge exampleをsource付きで一つずつ入力し、例の欠落、装飾限定、System Design一般化、Product Core固有field混入、source context欠落/除去を別々に変異 | 15例の識別とshared/product field境界を個別に観測。分離不能時は停止し、根拠のない一般化0を候補値として記録 |
| `HELIXBRAIN-L2-010` | conditional anti-pattern integrity | context/condition/impact/counterexample/provenanceを個別欠落・条件外適用し、alternativeなしの条件付き例とalternativeありの例を比較 | universal prohibitionへの誤一般化を拒否し、不足をunknownにする。alternative欠如だけでは有効な条件付きfailure knowledgeを拒否しない |
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


## Stage 4 — connection候補のNFR測定case（未実行）

| case ID | 親L2 | 測定対象・入力 | 測定oracle | 限界 |
|---|---|---|---|---|
| `CASE-BRAIN-L10-NFR-018-01` | `HELIXBRAIN-L2-018` | CORE候補intake: source/revision、原本と抽出候補の区別、製品固有relation、受取identityの完全例および各項目欠落/混入。親にない保持期限/削除証拠を必須化するmutationも加える。 | 候補receipt、隔離/CORE返却、raw original受領/誤promotion数を固定oracleへ照合し、追加retention/erase evidenceを要求しない。 | 性能値ではなくfield/authority境界候補。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-019-01` | `HELIXBRAIN-L2-019` | Product Core query: 候補を二つ含む完全query、required input/condition/relation/constraint/evidence/versionの個別欠落、意味/version競合 | 11応答分類それぞれのtrace、候補比較、constraint欠落の拒否、推薦なし/戻し先、誤採用数を固定oracleへ照合する。 | 製品採用判断を測定・代行しない。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-020-01` | `HELIXBRAIN-L2-020` | LABO評価候補: 対象revision一致・不一致、scope/method/result/failure/counterexample/unassessed rangeの各欠落。Infrastructure maturityを扱う適用例と非該当例を分ける | 評価対象との結合、candidate保持、該当時だけINFRA-017同revision evidence、LABO返却、accepted/mature誤遷移数を固定oracleへ照合する。 | OS登録stateの判定は含まない。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-021-01` | `HELIXBRAIN-L2-021` | INTELLIGENCE向け材料: 対象課題・案件状態を示すquery identity、scope/source/version、runtime結論要求、BRAIN変更要求、各query identity/scope欠落 | 判断材料fieldと対象query identity/scopeのtrace、BRAIN mutation/runtime decision誤生成数、owner返却を固定oracleへ照合する。 | 稼働中判断品質や性能SLAではない。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-022-01` | `HELIXBRAIN-L2-022` | HARNESS設計義務trace: Pattern input/dependencyからHARNESS-L2-009への完全/欠落/誤版forward/reverse fixture | 両方向edge coverage、orphan/wrong revision/product値誤決定数を固定oracleへ照合する。 | 製品設計の正しさを判定しない。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-023-01` | `HELIXBRAIN-L2-023` | 通常の汎用知識query/返却と、別個の利用・評価結果（LABO receiptあり/なし）を与え、Product Core固有screen/flow/tokenの混在も変異する。 | 汎用知識は既存受領contractで成立すること、利用・評価結果のLABO provenance、製品固有fieldの所有先、未評価candidate保持、誤昇格数を別々の固定oracleへ照合する。 | 画面UX品質を独立評価しない。候補測定、未実行。 |
| `CASE-BRAIN-L10-NFR-030-01` | `HELIXBRAIN-L2-030` | BRAIN-HARNESS connector: contract/compatibility/query/receipt/scope/receiverの完全例、stale・非互換・field定義欠落・join-only | contract group coverage、義務receipt・open state・forward/reverse trace、join-only acceptance/false completion数を固定oracleへ照合する。 | 設計義務充足とknowledge receiptを区別する。候補測定、未実行。 |

### Stage 5 BRAIN-024/025測定候補

| 親L2 | 測定項目 | 入力・変異 | 判定材料 |
|---|---|---|---|
| `HELIXBRAIN-L2-024` | route separation / direct leakage | 設計→CORE routeとRuntime→LABO→L2-020 routeを別々に与える。直接read/write/learning、runtime state/account/credential/permission/log/metrics、boundary receipt missing/stale/scope mismatchを個別に変異 | 2経路が別owner/revision/scopeでtrace、direct runtime ingress/egress 0。未完flowはowner付きhold |
| `HELIXBRAIN-L2-025` | stage/owner coverageとfalse promotion | 5 owner statesを完全sequenceで与え、receipt欠落/誤owner/target revision mismatchと5つの単独根拠（AI生成・1実績・LABO・OS ticket・文書存在）を変異 | 5段階は別状態として追跡でき、単独根拠によるaccepted/mature/adopted遷移0。独立verifier数や実績閾値は追加しない |
