---
title: "HELIX-INFRASTRUCTURE Stage 1 機能要件候補"
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
layer: L3
kind: requirement
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L10-verification/functional-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 機能要件候補

本書は採択済みの `HELIXINFRASTRUCTURE-L2-001` と `HELIXINFRASTRUCTURE-L2-006` を親にしたL3候補である。対象はこの2 identityのみ。各要件は親L2の意味・scope・owner・`version_target: 1.0`を保ち、実装方式や技術製品を確定しない。検証設計は対となる[機能検証](../L10-verification/functional-verification.md)に置く。

## authorityと固定親

- 基準HEAD: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。POは `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11本文を確認対象revisionとして固定し、2026-09-28判断記録が採択した。L2全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。
- `HELIXINFRASTRUCTURE-L2-001`: `MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`、semantic digest `sha256:1f419d31826a8f6627f0595822cd99d5b8c55db0bfd5faa25a735bca92b529c6`、1.0 / Stage 1。固定L2 `infrastructure-requirements.md` §同ID、対L11 `infrastructure-acceptance.md` §同ID。
- `HELIXINFRASTRUCTURE-L2-006`: `MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`、semantic digest `sha256:546bf30c3fca163f1ccb8303cbf26d3be45baa700c77099ddc7d3f6a4701fcbc`、1.0 / Stage 1。固定L2/L11 §同ID。
- `HELIXINFRASTRUCTURE-L2-005` は採択済みL2であり006の復旧責務が参照する親入力である。Stage 1のL3候補や未承認の候補要件として扱わず、本組では005自体を要件化しない。
- L2-006の親scopeと別SECURITY authorityは固定L2-006/L11-006を根拠とする。Workerの実操作契約およびtarget/action/revision/scope/expiry入力の細目は、採択済みL2-010 `infrastructure-requirements.md` L126–134（特にL129、L132）を横断参照する。L2-010はこのStageの要件対象へ加えず、006の5操作・独立recovery条件を置き換えない。
- 採択・L3承認・実装/実行許可は本候補から生成しない。人の判断が必要な要求変更は検出してL2へ戻す。技術パラメータごとの個別質問は作らない。

## 旧HELIXからの起点と項目別処置

旧L3定義のFR+AC、functional/business/NFRの3文書構成、L3と対応検証を対にする形式を起点とする。旧assetは比較資料として読んだ。下表は旧記述の意味単位ごとの扱いを示し、旧文面・schema・algorithm・runtime・testを移植しない。

| 対象意味 | 再利用区分と根拠 | 現行要件での扱い |
|---|---|---|
| 001の環境identity・resource・permission/credential reference | 部分的に意味再利用。`LEGACY-ASSET-17C4BF78919578FEBB18`、旧`product-lifecycle-operations-requirements.md` L68–73、全文SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`、span SHA-256 `90ec4ca119bf860db25efd2126095d80376a2fa1ce3db2159a5da49fc5610f14`。対の`LEGACY-ASSET-F46AB11BD14F2C0469F4`、旧`product-lifecycle-operations-acceptance.md` L26、全文SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`、span SHA-256 `f14b760580d8ec6a8b1a01bd0d4ef197a9b9b670fb8201f4ff8c1c8630b20657`。 | Environment/resource/credential-referenceとambiguous identityの正常/negative観点だけ保持する。旧provider adapter/permission/credential schemaは持ち込まず、L2-001のenvironment separation・8 network axes・storage/model scope・現行ownerへ再導出する。これは旧source直接起点がないとの評価を訂正する。 |
| environment lifecycle/health/incident/rollbackの隣接意味 | 意味を再導出。`LEGACY-ASSET-17C4BF78919578FEBB18`、旧`product-lifecycle-operations-requirements.md` L74–98、L108–119、L140–171、SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`。 | 上の直接OPS-R-01根拠に付随する比較資料。旧release/incident closure/全lifecycleは001へ流入させず、現行親のscopeにある資源/観測だけをFR-001-01〜04へ展開する。 |
| HELIX固有のplane/control topology | 置換。`LEGACY-ASSET-653A097F9C9EE51F6FDD`、旧`helix-concept-v4.0.md` L36,79–85,116–128、SHA-256 `8c492aae7a3c2f2c27dd24794d2ba4c7a9fc025737fa7ea61215b3b6658a5e59` | 旧plane名を復活させず、現行L2が指定する機構・resource identityとowner境界を使う。 |
| CPU/memory/GPU等の資源制約と不足時の扱い | 意味を再導出。`LEGACY-ASSET-235F57A4DC453383E6C7`、旧`HELIX_CONCEPT_v0.1.md` L69–91,234–238、SHA-256 `ab9d93f843875c1cd9b61049721c455ae067548196c216e64168711156afd475` | 資源値と観測範囲を記録し、容量採否・配置判断はOS/INTELLIGENCE側へ返す。旧数値、旧organism/planeを引き継がない。 |
| rollback、停止中の独立復旧、健康確認 | 意味を再導出。上記旧L3 L68–98、および旧受入asset `LEGACY-ASSET-F46AB11BD14F2C0469F4`、`product-lifecycle-operations-acceptance.md` L20–39、SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | FR-006-01〜03。旧production apply、approval、Runbook、state machine、復旧成功の業務終端を採用せず、固定L2の独立path/別authority/限定操作/未完義務へ再構成する。 |
| FR+ACの識別とL3/L10の対 | 形式の意味を再導出。`LEGACY-ASSET-F542125805B777D8A56A`、旧L3定義 `L00-L06-design-phase.md` L148–168、SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | 現行FR/ACとL10検証caseを同一IDで結び、旧G3、旧L10 UX受入というgateやlayer意味は移さない。 |

上のL3定義は`LEGACY-ASSET-F542125805B777D8A56A`、旧`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md` L13–21,101,148–168、全文SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`。L13–21の設計成果物と対のテスト設計、L101の要望/システム仕様区別、L148–168のFR+ACと対応検証の意味を形式として保持し、旧G3 gateは現行approval conditionへ移さない。旧`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` `docs/process/gates.md` L41,64（全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）は旧G3/AP-4の履歴根拠であり実行しない。旧自律境界`LEGACY-ASSET-6EBDB617A8104A7756D0` `CLAUDE.md` L82–85（全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）からAI起草/人の要件承認の意味だけ保持し、旧CLI/CI/runtimeや承認権限は持ち込まない。旧asset statusを現行authorityへ継承しない。旧運用sourceからL2-005/006以外のStage 1要求は生成しない。なおL2-001 footerの旧source追補は本親範囲で照合し、L2-005由来の旧source事項を001へ混入しない。

## INFRA-001-FR-01 — Runtime Resource Topologyと環境

**固定親**: `HELIXINFRASTRUCTURE-L2-001` / `MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`。`L2-requirements/infrastructure-requirements.md` §HELIXINFRASTRUCTURE-L2-001および`L11-acceptance/infrastructure-acceptance.md` §同ID。要求revisionはf6dad固定、採択根拠は基準main633の2026-09-28 PO decision。

### INFRA-001-FR-01-01 — resource identityとtopology

宣言された対象scope内のHELIX本体resourceごとに、resource identity、role、environment、location、version、dependency、lifecycle stateを観測元とrevisionへ結び付ける。L2-001の単独成立依存である承認対象HELIX-HARNESS-CORE設計の参照revisionを入力として扱い、設計承認自体を本要件から生成しない。2026-09-26 PO判断に従い、旧Runner/Sandboxの実行能力は独立runtimeとして継承せずWorkerとして参照する。最低範囲13 Deployment versionのうちINFRASTRUCTUREが担うruntime revisionを記録し、OS stage release identityとは別の識別子として扱う。値を読めない項目はunknownとして残す。構成図や記録の存在だけで実体の状態を証明しない。

**INFRA-001-AC-01**: 対象scope内の各resourceについて上記7属性の値または明示的unknownとsource/revisionが追跡できる。未登録・重複・不明identityを別resourceや既定値で補完しない。environment間のresourceを同一と推定しない。resource/owner/environment/location/version/dependencyが不明ならunknownのままresource sourceまたはCORE設計ownerへ返し、返却先owner自体が特定できない場合はunknownと未完の観測範囲を保持し、成功・利用可能にしない。読み取り不能または部分更新時は、以前のobservationをcurrentと見なさず、未完の観測範囲を残す。

### INFRA-001-FR-01-02 — environment分離

development、verification、staging、production、recovery等の各environmentは独立identityを持つ。resource/config/network/credential scope/data/version/authorityの観測は対象environmentへ結び付け、別environmentの状態を対象environmentの成功証拠にしない。environment classの集合は親が宣言した対象範囲に限る。

**INFRA-001-AC-02**: environment identityが合致する同一resourceの観測だけを対象stateとして扱う。scope、version、authority、source、config、network、credential scope、dataの各軸を独立に照合する。いずれかが不明または別environmentであれば一致/利用可能としない。

### INFRA-001-FR-01-03 — network pathの実体記述

HELIX-CONNECTの論理接続identityとphysical/runtime network pathを別々に記録する。pathごとに source、destination、protocol、endpoint、direction、purpose、security boundary、dependency の8軸を、対象scopeと観測source/revisionに結び付ける。欠落軸はunknownのまま残し、論理接続から物理経路を推測しない。

**INFRA-001-AC-03**: 各宣言pathに8軸が値またはunknownとして存在し、logical connection参照とは別identityで追える。方向や境界が欠落したpathを既知/健全として報告しない。

### INFRA-001-FR-01-04 — storageと実行資源属性

persistent stateとtemporary stateを区別する。対象storageごとに owner、durability、backup、retention、environment、confidentiality の6属性と、適用されるrecovery requirementへの参照を持ち、source/revisionへ結び付ける。CPU/RAM/GPU/VRAM/storage/networkおよび対象scopeに含まれるModel/Worker Runtimeの属性を記録する。Model Runtimeでは model、version、server、GPU-memory requirement、concurrency、latency、capacity、health、endpointを対象environment/source/revisionへ束ねる。未観測のruntimeを存在すると仮定せず、model capability、Worker ticket/assignment、security policyをINFRASTRUCTURE値にしない。

**INFRA-001-AC-04**: 各対象storageの6属性およびrecovery参照は値またはunknownと追跡元を持つ。対象scopeに含むruntimeの列挙属性に未観測があればそのまま示す。resource lifecycle/environmentなどの観測値からSECURITY authorityまたはoperation許可を生成・代用しない。Model/Worker能力評価やauthorityをこの結果から生成しない。

## INFRA-006-FR-01 — HELIX独立Bootstrap・Recovery Path

**固定親**: `HELIXINFRASTRUCTURE-L2-006` / `MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`。同じ固定L2/L11 revisionと基準main633の採択根拠を参照する。L2-005は採択済みL2 dependency inputとしてのみ参照され、005のL3 candidate pairはこのStage 1範囲外。

### INFRA-006-FR-01-01 — HELIX control planeから独立した判定経路

通常のHELIX/HELIX-OS control planeが利用不能な状態でも、recovery対象、operation、resource/path revision、scope、SECURITYの別authorityを独立pathで照合できる。通常operation用authorityが有効でも、独立recoveryに適用される別authorityの代用にしない。判定は停止中HELIXのticket、assignment、health応答、承認状態に依存しない。pathまたはauthorityを提供するownerが特定できる場合はそこへ戻す。提供owner自体が不明なら復旧成功を示さず停止し、未解決ownerと義務を記録する。独立pathとは別途作成する万能運用系を意味せず、L2-006の限定recovery経路を指す。

**INFRA-006-AC-01**: fixture上でHELIX/OS応答を利用不能にしても、対象/operation/scope/revision/expiryに適用される通常operation authorityとは別のSECURITY authorityを照合できる。通常Control Planeまたは停止中サービスを経由しない証拠があり、別authorityの欠落/unknown/期限切れは拒否される。独立path/authorityを提供するownerが特定できる場合は該当ownerへ戻す。提供owner自体が不明なら復旧成功を示さず停止し、未解決ownerと残る義務を記録する。

### INFRA-006-FR-01-02 — 5種の限定operation

独立pathはbootstrap、health check、service stop、rollback、recoveryの5種だけを、指定resource・revision・scopeに対するoperationとして判定する。各operationを許可するときはSECURITYの別authority、必要なresource/path状態、operation固有の前提と結果を記録する。実操作のWorker実行契約は採択済みL2-010（`infrastructure-requirements.md` L126–134）を参照する。これはL2-006の対象親を拡張せず、別authority条件も置き換えない。state-changing operationは採択済みL2-005の当該actionに適用されるbackup/restore/rollback/recovery義務を参照し、不明または未充足なら保留する。無関係なread-only操作へ一律のbackup義務を加えない。SECURITY制約下のWorkerが実操作を行い、INFRASTRUCTUREはsecurity policyや認可を生成しない。

**INFRA-006-AC-02**: 5 operationを各々独立に許可/拒否fixtureで照合する。要求外operation、誤target、異revision、scope外、別authority不一致、失効、recovery義務unknownはoperationを開始しない。通常operation用authorityだけの提示では、通常operation上有効でも独立recovery operationを開始しない。読取health checkは状態を返すだけで変更操作を開始しない。rollback/recoveryの状態変更結果と未完義務を保持する。完全自動failoverの有無を5操作の適格判定に用いない。

### INFRA-006-FR-01-03 — operation状態と結果保持

operationごとに開始条件、対象、使用したauthority identity/revision、開始前state、結果、最終適格revision、未完の操作/制約/復旧義務を区別して記録する。復旧が失敗または部分結果の場合、最後の適格revisionと未完義務を保持し、より古い結果や状態で上書きしない。

**INFRA-006-AC-03**: 正常完了、拒否、失敗、部分結果、unknownを区別する。失敗/部分結果/unknownでは最後の適格revisionと未完の操作・制約・復旧義務を追跡でき、後続観測でsource state/receiptを上書きして未完義務を消さない。安全に復旧できない範囲を明示して停止し、独立pathまたはauthorityを提供するownerへ戻す。

## scope境界

本組にL2-002〜005、007以降をStage 1のL3対象として加えない。特にL2-005は採択済みの入力依存であって、本PR範囲で要件を発行する親ではない。完全自動failover、autoscaling、multi-cloud、failure-domain/SPOF詳細、Web顧客runtime、provider選定、容量/費用の採否を1.0条件にしない。L2の意味・scope・owner・versionを変更する必要が生じた場合は該当L2へ戻し、ここでは埋めない。

## Stage 2b suffix — HELIXINFRASTRUCTURE-L2-002/007 機能要件

状態：候補のみ。対象は採択済み HELIXINFRASTRUCTURE-L2-002/007、version_target 1.0。固定L2/L11が要求意味のauthority、PO決定は親identity/revision/versionの採択登録、G0は実装順序のみを記録する。このL3/L10本文は未承認・未実行であり、実装・実行・配布の許可を生成しない。対象範囲とsource pinsは[Stage2b公開cutout監査](../../governance/audits/requirements-stage/l3-l10-infra-stage2b-main-publication-cutout-2026-10-05-72fa2f08.json)に固定する。

### 対象・適用範囲 — HELIXINFRASTRUCTURE-L2-002/007

対象は採択済みHELIXINFRASTRUCTURE-L2-002/007のみ、version_target 1.0。固定L2/L11の意味・scope・担当・版を保持する。本cutoutはこの2親だけを対象とし、他の親やstageを追加しない。候補草稿・未承認・未実行。

## INFRA-002-FR-01 — HELIXINFRASTRUCTURE-L2-002 Desired Target・Actual State・Drift

設計ownerが持つapproved design/configuration、deployment target、source-qualified actual observationを、対象environment/resource/revisionごとに別の意味状態として保持する。同じ比較対象・適用scopeで不足、余剰、version/config/network/permission/capacity差、runtime交換、unknown dependencyを提示する。差異を直す操作、設計の承認、targetの採否はこの比較から生成しない。比較に用いたdesign、target、actual、observationの入力bytesも書き換えない。設計、target、observationがmissing/stale/互換不明ならその部分の比較を未確定としてsource ownerへ返し、確認できた部分と未確認範囲を残す。修正はOS ticket・SECURITY authority・Workerの別契約による。

- **INFRA-002-AC-01**：同じ対象のdesign/target/actualからdriftを再構成でき、三入力と結果のsource/revisionを別々に辿れる。差異を比較しただけで正本やauthorityを書き換えない。比較入力を読取専用として扱い、design、target、actual、observationのcanonical bytesを変更しない。
- **INFRA-002-AC-02**：resource missing/unexpected、version/config/network/permission/capacity差、runtime replacement、unknown dependencyを個別に識別する。入力の欠落/stale/互換不明を一致へ変換せず、該当owner・未確認scope・再比較に必要な入力を示す。

| 親の句 | AC | L10 case | 観測 |
|---|---|---|---|
| 入力・提供・三状態の分離 | `INFRA-002-AC-01` | `L10-INFRA-002-C01,C02` | 同一対象の各source/revisionとdrift差分 |
| 9差異類型・unknown保全 | `INFRA-002-AC-02` | `L10-INFRA-002-C02,C03` | missing/unexpected、5設定差、runtime交換、unknown dependency |
| 自動変更・承認にしない | `INFRA-002-AC-01,AC-02` | `L10-INFRA-002-C04,C08,C09` | actual昇格、unexpected承認扱い、比較入力上書きの個別拒否とbytes・authority不変 |
| L2-001・設計・観測依存、source ownerへ返却 | `INFRA-002-AC-02` | `L10-INFRA-002-C03,C05,C06` | 部分比較・不足・未確認scope・依存field欠落と返却owner |
| 未見正常な同一比較 | `INFRA-002-AC-01` | `L10-INFRA-002-C07` | 新しいresource/environmentで差異を個別提示し入力不変 |

## INFRA-007-FR-01 — HELIXINFRASTRUCTURE-L2-007 Runtime Rebuildability

環境消失後の対象をapproved design/config、artifact/dependency/data backupのidentity/revision、deployment evidenceから再構築し、依存再接続・起動・検証の結果を同じ復旧scopeへ結ぶ。必要情報は消失したmachineだけから取得する前提にしない。backupの存在、手順の存在、起動成功と再構築の成立を別に扱う。source/設定/依存/dataまたは適用authorityの不足があれば成功にせず、復元部分、未完の依存・verification、返却ownerを保持する。L2-005のbackup/restore契約とL2-006のcontrol-plane非依存経路を参照し、その責務を再定義しない。

- **INFRA-007-AC-01**：消失対象のmachineに頼らず、完全な復旧入力から宣言された隔離環境を再構築する。必要な依存再接続、起動、固定oracleの実結果まで満たすscopeだけを再構築済みとし、入力版から結果・証拠を辿れる。 ここで固定oracleはL11-007の検証に対応する対象scopeの既存verification sourceのidentity/revisionと期待結果を指す。具体source・期待結果が未確認ならunknown/unassessedを保持し、起動結果や別scopeのoracleで補完しない。
- **INFRA-007-AC-02**：各入力欠落/stale/異版/依存・data・credential authority不足、再接続失敗、起動失敗、検証failure/unknownを個別に与えた場合は成功にしない。復元部分と残義務を分け、design/artifact/dependency/data/authorityの該当ownerへ返す。再開で元のscopeと版を失わない。

| 親の句 | AC | L10 case | 観測 |
|---|---|---|---|
| 全復旧入力から実環境再構築 | `INFRA-007-AC-01` | `L10-INFRA-007-C01,C02` | source版・再構築・再接続・起動・oracle実結果 |
| 特定machine内への情報閉込めを避ける | `INFRA-007-AC-01,AC-02` | `L10-INFRA-007-C01,C08` | 元machine喪失時の入力取得可否 |
| 文書のみ・backupのみと成功を別判定 | `INFRA-007-AC-02` | `L10-INFRA-007-C03,C07` | 文書のみとbackupのみの各入力で再構築成功にしない |
| machine内情報のみとowner戻し | `INFRA-007-AC-02` | `L10-INFRA-007-C08` | 消失machineに閉じた情報を不足として返す |
| 欠落ownerへ返却・未完verification保持 | `INFRA-007-AC-02` | `L10-INFRA-007-C04,C05` | 復元部分、残義務、owner、再開時の版対応 |
| L2-001/005/006・1.0・別authority | `INFRA-007-AC-01,AC-02` | `L10-INFRA-007-C01,C04,C05,C06` | resource identity、復旧経路、既存authorityの条件 |

### INFRA-002 固定親と旧資産の起点

- PO対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択登録 `MPR-RC-HELIXINFRASTRUCTURE-L2-002-002`、PO判断 `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48`（全文SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`）。
- 固定L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 42–51行、全文SHA `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、raw span SHA `ec40a66b707315814420ac5a7fe17dd4da4b4b3a958cf74a6f799d65ef1d41bc`。
- 固定L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 44–53行、全文SHA `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、raw span SHA `710b5ef8b55bbef350573769de70e255962fde93e9421fbf4a9c2f43ac4dacfb`。

### INFRA-007 固定親と旧資産の起点

- PO対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択登録 `MPR-RC-HELIXINFRASTRUCTURE-L2-007-002`、PO判断 `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48`（全文SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`）。
- 固定L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 92–101行、全文SHA `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、raw span SHA `29820e63b84ed4119c171e12b127b5f1eb3ff0bada5b693cfd0bf860b2934959`。
- 固定L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 94–103行、全文SHA `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、raw span SHA `671533fadb07000ed569641feaee10a4d186d105b58a23a34a763a4e58e7aa1b`。

### Stage 2bの項目別再導出

002はTER-R-02/05の宣言・実効観測の区別とdrift/unknownのfailure patternを部分再導出する。approved design/target/actualの三状態と9差異類型は現固定L2/L11から導く。外部技術inventory、periodic upgrade、shadow/canary/promotion、旧authorityは移植しない。007はdistributionのclean consumer・入力版・結果照合と復旧failureを隣接例として部分再導出し、環境消失からの再構築・依存再接続・起動・検証は固定親の意味から導く。旧consumer_core_v1、Lite/Full、配布先、旧CI/runtime、release standing authorizationは置換・除外する。rootは旧L3ディレクトリをdrift/Desired/rebuild/再構築で検索した。今回の意味比較は下表のTER・distributionと対のtest designに限定し、全候補に対応資産がないとは判断しない。比較したsourceは完全一致再利用せず、二項目とも部分再導出として記録する。

| 旧asset | source行 | 全文SHA | raw span SHA | 現item |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 32–70 | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `c58abfe822a6c95a70d11c10e6355ef14f032c4c6cf9993c24f6eb24f41d4477` | 002の観測/差異類例 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md` 16–39 | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `672efe8812416fa909f5d391b362be23d4631b42bdbc2015918bfe59b184df85` | 002の観測/差異類例 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` 24–83 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | `60f558ed4c14b1b235e060dad063c8a07c202b02868a1004ae8f4855671e6c2e` | 007の版付き復旧/結果類例 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` 1–58 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | 007の版付き復旧/結果類例 |

両親のL2-001 identity/environment契約、002の比較入力と007のL2-005/006参照を個別にmissing/unknown/stale/異revisionにする依存negativeは各L10 C06へ結ぶ。007の復旧実行は既存authorityとWorker契約を使い、比較/再構築結果から権限や操作を生成しない。

002の未見正常は独立fixtureのL10-INFRA-002-C07でAC-01を照合し、C02の個別差異変異と分ける。

## Stage 2a 追加範囲 — L2-003/004/005/009/010

この付記は、固定PO採択済みL2のStage 2a範囲だけを起草する局所候補である。親L2/L11は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択根拠はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` のPO決定に固定する。承認済みStage 1とStage 2bの6文書prefixはbytesそのまま保持するが、その承認を今回のStage 2a候補revisionへ継承しない。今回直接の親対象は003/004/005/009/010の5 identityだけ。005はStage 2aの採択済み直接親であり、Stage 1の006への依存入力とは役割が異なる。006等ほかのStage/親を本追記へ加えない。

### 旧source起点・項目別処置

旧L3 process `LEGACY-ASSET-F542125805B777D8A56A` (`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`, SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`) のFR+AC、3区分、対の検証という**形式の意味を再導出**する。旧G3、sub-gate、runtime、旧test実行経路は置換する。旧`OPS-R-01` (`LEGACY-ASSET-17C4BF78919578FEBB18`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68-73`, file SHA `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`)と`OPS-AC-001` (`LEGACY-ASSET-F46AB11BD14F2C0469F4`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:26`, file SHA `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`)は、environment/resource identity、曖昧target拒否、credential referenceを保持してsecret値を保持しない意味を**部分再利用**し、適用scopeと現行ownerを再導出する。旧操作方式やauthority経路は移さない。旧OPS-R-01/OPS-AC-001はsecret値を保持しないと無限定に記す一方、固定L2-010は通常resource stateへの保存を無条件に禁じ、backup/snapshotは適用されるSECURITY条件に従わせる。この差を保ち、旧記述の無限定禁止をbackup/snapshotへ拡張しない。SECURITY条件の適用が不明ならSECURITYへ返す。旧`OPS-R-03`同L3 file `:81-85` と`OPS-AC-003`同acceptance `:28` はrollback plan/receiptとincident closureを分ける形を**部分再利用**し、現在のL2-005 scopeへ再導出する。旧tech-environment reconciliation、lifecycle state separation、security broker等の旧資産はversion/source mismatch、unknown、owner境界を持つfixtureの形だけを意味再導出し、旧schema/state taxonomy/CLI/DB/CI/runtime/valueは置換する。

### 親句→FR/AC trace

| 固定親句の意味 | FR/AC | 主な受入境界 |
|---|---|---|
| L2-003: common resource modelとlocal/VPS/dedicated/cloud/container/GPU/Worker各resource type | INFRA-003-FR-01 / INFRA-003-AC-01 | 7種を固定allowlistにせず、宣言された対象scopeのresource identity/type/source/revisionを追跡する。 |
| L2-003: Network path 8軸（source/destination/protocol/endpoint/direction/purpose/security boundary/dependency） | INFRA-003-FR-01 / INFRA-003-AC-02 | 各軸はvalueまたはunknown。論理connectionからphysical routeを推定しない。 |
| L2-003: persistent/temporary database/evidence-artifact/queue/cache/log-metric/model storeとowner/durability/backup/retention/environment/confidentiality/recovery attributes | INFRA-003-FR-02 / INFRA-003-AC-03 | 各宣言categoryを区別し、各6属性と該当recovery referenceを追う。storage categoryを網羅済と推定しない。 |
| L2-003: Model/server/version/GPU-memory/concurrency/latency/capacity/health/endpoint; external model API/local LLM/GPU server/distributed model server/tuned model; intelligence qualityは別owner | INFRA-003-FR-03 / INFRA-003-AC-04 | Model Runtime各fieldと5つの明示model種を対象environment/source/revisionへ束ねる。Workerは適用するresource fieldsだけを資格化し、Worker操作権限/version authorityや知能評価を作らない。 |
| L2-003: launch前capacity確認、不足時queue/delay等をOS/INTELLIGENCEへ渡す、unbounded job/placement/cost決定禁止 | INFRA-003-FR-04 / INFRA-003-AC-05 | 不足を`capacity unavailable`としてdecision ownerへ返し、無制限Job・未承認node移動/cost選択を成立扱いしない。 |
| L2-003: missing/stale/unmeasurable/unknownでsafe-to-acceptを返さず、queue/snapshotを保持 | INFRA-003-FR-05 / INFRA-003-AC-06 | 独立missing/stale/unmeasurable/partial-updateを拒否/unknown化し、前回値をcurrentにせず未完範囲を保持。 |
| L2-004: observation stateとnormal/degraded/unavailable/capacity/dependency/data-network/security-isolation/unknown、unknown≠healthy | INFRA-004-FR-01 / INFRA-004-AC-01 | 観測分類を既存parent wordingへ限定し、無観測をhealthyへ昇格しない。 |
| L2-004: incident meaning/severityはapproved sourceだけ、独自定義しない | INFRA-004-FR-02 / INFRA-004-AC-02 | 正常・未見正常と未承認severity追加を個別照合し、原因を推測しない。 |
| L2-004: source/target revision保持、staleをcurrent化しない。L2-019 detailed freshnessは後続版 | INFRA-004-FR-03 / INFRA-004-AC-03 | source/currentnessを照合し、019のfreshness/confidenceを1.0 gateへ追加しない。 |
| L2-004: telemetry/source/collector failureはunknown/unobservedでownerへ戻し、pending evaluation保持 | INFRA-004-FR-04 / INFRA-004-AC-04 | source欠落とcollector failureを別negativeにし、未確認範囲と評価待ちを残す。原因は推測で確定しない。 |
| L2-005: backup source/target revision/time/completeness/location/integrity/expiry、state ownerのretention requirement。configured/success/existenceを分離 | INFRA-005-FR-01 / INFRA-005-AC-01, INFRA-005-AC-02 | owner保持期間と適用recovery requirementを保持し、owner/retention/recovery requirementの欠落・unknownとjob-success-onlyを独立negativeにする。recovery requirement不足はstate owner、restore failureはrecovery design owner/OSへ戻す。 |
| L2-005: actual restoreでintegrity/reconnect/startup/verification、L2-001/002依存と独立restore environment | INFRA-005-FR-02 / INFRA-005-AC-02 | 4 evidenceとdependency参照/独立環境を別々に照合し、failure時はrecovery design owner/OSへ戻す。 |
| L2-005: rollback targetをinfra version/config/artifact/dependency/data compatibilityとprocedureへ結び、rollback≠incident closure | INFRA-005-FR-03 / INFRA-005-AC-03 | 対象適格性とreceiptを保持し、rollbackだけでincidentを閉じない。 |
| L2-005: failure/unknownでsuccessを出さずrecovery design owner/OSへ、prior eligible state/failure/unfinished dutyを保持 | INFRA-005-FR-04 / INFRA-005-AC-04 | 戻し先をACに明記し、失敗・部分復旧で未完義務を消さない。 |
| L2-009: versioned OS Work/Changeとresource-state view、ownershipを分離 | INFRA-009-FR-01 / INFRA-009-AC-01 | OS work/change IDとINFRA runtime/resource IDをversioned referenceでつなぎ二重正本にしない。 |
| L2-009:通常接続はstage release不要、条件付きstageはOS-L2-014、stage ID≠runtime revision | INFRA-009-FR-02 / INFRA-009-AC-02 | stageなし正常例を独立させ、stage例は条件付き・別fixtureとする。 |
| L2-009: mismatch/partial/unknownはchange successでない、OS/INFRA ownerへ、stage/runtime/rollback/pending保持 | INFRA-009-FR-03 / INFRA-009-AC-03 | cause別ownerへ戻し、適格状態と未完操作を残す。 |
| L2-010: 全operationはtarget/action/revision/scope/expiryに適用されるSECURITY authorityとSEC Worker。read-only/state-changingは区別 | INFRA-010-FR-01 / INFRA-010-AC-01 | read-onlyにはwrite権限を要求せず、mutating actionは該当005 dutyだけを確認。normal stateへのsecret値保存は無条件に拒否し、backup/snapshotは該当SECURITY条件に従う。unbounded ShellとINFRA発行authorityは独立に拒否しSECURITY/OSへ戻す。 |
| L2-010: normal operationはOS assignment/ticket+009、update-admissionは変更適用時のみ | INFRA-010-FR-02 / INFRA-010-AC-02 | read-onlyと更新を別fixtureにし、更新時の欠落/拒否/unknown/mismatch/expired/revoked admissionだけを変更前に拒否。 |
| L2-010: independent bootstrap/recoveryは006 path+別authority、OS停止時ticket/009不要、復旧後OSへresult sync | INFRA-010-FR-03 / INFRA-010-AC-03 | OS停止中の限定操作を独立判定し、復旧後のresult同期証拠はこの010句だけから導出。006へ一般化しない。 |
| L2-010: authority/credential-scope/target/revision mismatchは事前拒否、partial runは成功でなくactual state/recovery duty保持 | INFRA-010-FR-04 / INFRA-010-AC-04 | 個別mismatchとpartial resultを分離し、SECURITY/OS/INFRA ownerと未完義務を保持。 |

### Stage 2a owner / condition / version guard

| Parent | Owner boundary | 固定条件・版 |
|---|---|---|
| L2-003 | observationはresource/capacity source owner、capacity/launch判断はOS/INTELLIGENCE | L2-001 snapshotと実際の観測sourceが必要。高度なautoscalingを含まず`version_target: 1.0`。 |
| L2-004 | observation source/collector owner、incident meaning/severityの承認済み上流owner | L2-001、既存approved incident meaning/sourceが必要。L2-019 detailed freshness/confidenceは1.0 gateにせず`version_target: 1.0`を保つ。 |
| L2-005 | recovery design owner/OS | L2-001/002、state owner/retention/recovery requirement、restore environmentを参照。automatic failoverを含まず`version_target: 1.0`。 |
| L2-009 | mapping mismatchの責務に応じOSまたはINFRA owner | L2-001/002/004/006とOS Work/Change interface。stage release依存はstage packへ実際に収載するときだけOS-L2-014を適用。`version_target: 1.0`。 |
| L2-010 | authority/update admissionはSECURITY/OS、partial actual stateは該当INFRA owner | 全operationでL2-001と適用可能SECURITY authority/Worker。normal routeはOS+009、mutationだけupdate-admission、state changeに適用する005 duties、独立recoveryは006 path+別authority。`version_target: 1.0`。 |

上のStage 1 scope境界はStage 1候補の対象限定としてそのまま保持する。Stage 2aの直接対象は本節の5採択親だけであり、Stage 1境界文を保持し、承認済みStage 1／Stage 2b prefixの承認を今回のStage 2a候補revisionへ継承しない。全5親の適用条件は固定L2/L11とPO採択revisionに従い、Stage 2a候補から要求の意味/scope/owner/versionを拡張しない。

### HELIXINFRASTRUCTURE-L2-003 — resource topology / capacity

#### INFRA-003-FR-01 — 共通resource modelとnetwork path

対象scopeに宣言されたlocal machine、VPS、dedicated server、cloud VM、container runtime、GPU node、Worker node等を共通resource modelで識別し、CPU/RAM/GPU/VRAM/storage/runtime/capacity/health/availabilityをresource type、environment、source/revisionに結び付ける。Network pathはsource、destination、protocol、endpoint、direction、purpose、security boundary、dependencyの8軸をphysical path identityに結び付け、論理CONNECT identityとは分ける。

**INFRA-003-AC-01**: distinct resource type/identity/environment/version/dependency fixtureで全宣言resourceのCPU/RAM/GPU/VRAM/storage/runtime/capacity/health/availabilityを値またはunknownとsource/revision付きで追跡できる。未見typeは宣言scope内なら個別identityのまま保持する。

**INFRA-003-AC-02**: 8 network軸の各fieldにvalueまたはunknownがあり、各fieldを一つずつ欠落/ambiguousにしたnegativeでpathを既知・健全・許可済みとしない。CONNECT logical identityからphysical pathを補完しない。

#### INFRA-003-FR-02 — storage categoriesと属性

固定L2が列挙するpersistent/temporary database、evidence/artifact store、queue、cache、log/metric store、model storeごとにstorage identity、owner、durability、backup、retention、environment、confidentialityおよび該当recovery attribute/referenceをsource/revisionとともに記録する。persistentとtemporaryを同一分類へ畳み込まない。

**INFRA-003-AC-03**: 各宣言categoryの全6属性とrecovery referenceにvalueまたはunknownとsource/revisionがある。個々の属性欠落をnegativeにし、temporary cache/queueでpersistent backup要件を満たしたとしない。未見categoryを既知に推定しない。

#### INFRA-003-FR-03 — Model RuntimeとWorker resource qualification

対象environment/scopeに含まれるModel Runtimeについてmodel、server、version、GPU-memory requirement、concurrency、latency、capacity、health、endpointをsource/revisionと共に記録する。親が明示するmodel種はexternal model API、local LLM、GPU server、distributed model server、tuned modelであり、各種をscope内のmodel type/resource classとして識別する。Worker nodeは該当するCPU/RAM/GPU/VRAM/storage/runtime/capacity/health/availabilityのresource nodeとして扱う。知能品質、Worker capability/version authority、operation authorizationは本親から導出しない。

**INFRA-003-AC-04**: scopeにModel Runtimeを含むnormal fixtureでは上記全fieldをvalueまたはunknownとしてtraceし、external model API、local LLM、GPU server、distributed model server、tuned modelの各typeをそれぞれ分類・照合する。個別missing/stale fieldまたはtype/class不一致でqualification incompleteを示す。scope外runtimeを存在すると仮定せず、知能score/Worker authorityを発行しない。

#### INFRA-003-FR-04 — capacity observationとdecision handoff

CPU/RAM/GPU/VRAM/storage/network/runtime/model requirementとcapacity/utilization/queue/concurrency/saturation/rejection/backpressureの対象revisionを、launch requestの前に観測する。known shortage/unknown capacityはOS/INTELLIGENCEのdecision interfaceへ情報として返す。Infrastructureはcapacity sufficiencyの未承認閾値、placement/cost choice、無制限Job追加を作らない。

**INFRA-003-AC-05**: 十分と宣言されたknown fixtureは、参照可能なsource/revisionとcapacity fieldsを伴ってdecision interfaceへ渡る。shortageは`capacity unavailable`としてOS/INTELLIGENCEのdecision ownerへ返し、queue/delay/reject/escalationはそのownerが判断する。別node候補や低費用候補を含むfixtureでもInfrastructureはnode/costを選択しない。無制限Job追加または未承認node移動/cost選択を個別に試みるnegativeでは、成立/採用扱いにしない。threshold未設定ならsufficiency=unknownであり、採用判定を生成しない。

#### INFRA-003-FR-05 — 欠落・stale・計測不能時の保留

Resource/capacity observationがmissing、stale、unmeasurable、unknown、read-failureまたはpartial-updateの場合、safe-to-accept/availableを返さず、対象snapshot、queue/delay中要求、未完の観測範囲を保持してsource ownerまたはOS/INTELLIGENCEへ戻す。失敗/partial read後の以前のobservationをcurrentと扱わない。

**INFRA-003-AC-06**: missing、stale、unmeasurable、明示unknown、読取失敗、途中更新を独立fixtureで照合する。いずれもsafe-to-acceptを返さず、旧observationをcurrentへ昇格しない。失敗範囲、snapshot、pending requestを追跡し、resource/source状態は該当source owner、作業判断はOS/INTELLIGENCEへ戻す。ownerがunknownなら未解決を保持し、戻し先を推測しない。

### HELIXINFRASTRUCTURE-L2-004 — observability / incident state

#### INFRA-004-FR-01 — versioned observation分類

Health、metric、log、resource use、dependency、queue、error、latency、deployment revision、recovery observationをsource/target revisionに結び、fixed L2のnormal/degraded/unavailable/capacity/dependency/data-network/security-isolation/unknownを区別する。無観測・collector未完はhealthyへ変換しない。

**INFRA-004-AC-01**: normal観測がsource/revisionと結び付く。列挙categoryごとの負例とtelemetry欠落はそれぞれ該当state/unknownとして保持し、未定義severityを割り当てない。

#### INFRA-004-FR-02 — 既存incident meaningのみ

Incident meaning/severityは既に承認されたsource/requirementとrevisionから参照する。INFRASTRUCTUREはseverity taxonomy、business影響、原因、incident close条件を独自定義しない。

**INFRA-004-AC-02**: approved meaning sourceがあるnormal fixtureは、そのID/revisionと適用されたmeaning/severityを辿れる。approved schema内の未見normal sourceも同じoracleで照合する。未承認severityを独自追加する単独negativeでは分類を確定せず、意味のsource/ownerへ戻す。原因を推測で確定しない。

#### INFRA-004-FR-03 — source/current revision境界

各observationのsource revisionと対象runtime/deployment revisionを保持し、stale sourceをcurrentへ昇格しない。L2-019の詳細freshness/confidenceを1.0受入gateへ追加しない。

**INFRA-004-AC-03**: current source/revision fixtureは対象に結び付き、stale/mismatched revision fixtureはcurrentでない状態として扱う。未見sourceの正常値は保持し、L2-019を依存親にしない。

#### INFRA-004-FR-04 — telemetry failureとowner return

Telemetry欠落、source不明、collector failureをunknown/unobservedにし、原因を推測確定せず観測source/collector ownerへ戻す。未確認resource、評価待ちincident、未完のobservationを保持する。

**INFRA-004-AC-04**: missing telemetry、unknown source、collector failureを独立negativeにし、health/incident successへ転換しない。原因を推測で確定せず、telemetryはsource/collector ownerへ、incident meaning/severityは承認済みmeaning ownerへ戻した記録とpending evaluationを追跡できる。

### HELIXINFRASTRUCTURE-L2-005 — backup / restore / rollback

#### INFRA-005-FR-01 — backup stateの独立記録

Backupごとにsource/target revision、time、completeness、location、integrity、expiryと実行stateを記録する。expiry/保持期間は対象state ownerの既存retention要求を参照し、Infrastructureがownerまたは保持期間を新設しない。owner/retention要求が欠落・unknownなら保持適格性をunknownにする。backup configured、job success、backup artifact existenceを別stateにし、いずれも実restore可能性と同一視しない。

**INFRA-005-AC-01**: completeかつ対象revision/integrity/locationが合致するbackup recordを正常に追跡し、expiryはstate ownerの既存retention要求と照合する。owner欠落、retention要求欠落/unknown、適用されるrecovery requirementの欠落/unknown、incomplete、wrong revision/target、integrity mismatch、expiry、configured-only、backup-job-success-onlyをそれぞれ独立negativeにし、いずれもrestoreable/successへ昇格しない。recovery requirement不足は該当state ownerへ確認し、ownerを特定できなければ未解決のまま保留する。別resource用に同schemaを宣言した未見normal fixtureも個別評価する。

#### INFRA-005-FR-02 — actual restore検証

Restoreを実行した対象とrevisionについてintegrity、dependency reconnection、startup、verification evidenceを別々に記録する。backup metadataや手順書だけではrestore成功を示さない。

**INFRA-005-AC-02**: 採択済みL2-001/002のsource/target snapshot、revision、compatibility referenceと適用されるrecovery requirement identity/revisionが条件を満たすnormal fixtureで、独立restore environment上の4 evidenceを追跡する。適用recovery requirementのmissing/unknownは独立negativeとし、復旧成功を出さずstate ownerまたはrecovery design owner/OSへ戻して未完義務を保持する。dependency参照のmissing/stale/revision mismatchと、restore環境が独立していない状態を別々にnegative化する。integrity、dependency reconnect、startup、verification failureも別々に注入し、いずれもrestore successにしない。failure/未完はrecovery design ownerまたはOSへ戻す。未見のrestore targetでも同じ条件を照合する。

#### INFRA-005-FR-03 — eligible rollback targetとprocedure

Rollback targetをInfrastructure version/configuration/artifact/dependency/data compatibilityおよびrecovery procedureへ束縛し、実行結果とincident stateを別記録する。rollback successはincident closureやforward-fix completionを意味しない。

**INFRA-005-AC-03**: known compatible target/procedureの正常fixtureを追跡する。unknown target、各incompatibility、unbound procedureを個別negativeとし、incident stateは未解決のまま保持する。未見targetでも同じeligibility fieldsを要求する。

#### INFRA-005-FR-04 — failure/partial recovery保持と戻し先

Backup/restore/rollback/recoveryがfailure、unknown、partialならsuccessを発行せず、変更前の最終適格state、failure evidence、未完recovery/verification dutyを保持し、recovery design ownerまたはOSへ戻す。

**INFRA-005-AC-04**: owner destinationと未完義務がACにある。failure/partial/unknownを独立fixtureで入力し、変更前state/failure/dutyが残る。回復設計はrecovery design owner、OS上の作業状態はOSへ戻す。該当ownerが不明なら未解決のまま保留し、循環的な未定義ownerへ戻さない。

### HELIXINFRASTRUCTURE-L2-009 — OS Work/Change と runtime resource state

#### INFRA-009-FR-01 — versioned state接続とowner分離

OS Work/Change actor/identity、target、revision、start/stop/resume、evidence referenceをInfrastructure topology/actual/deployment/recovery revisionへversioned referenceで接続する。OSはwork/change state、Infrastructureはresource/runtime stateの正本を持つ。

**INFRA-009-AC-01**: 別IDのOS ticket/changeとInfrastructure resource/runtime stateを明示revision referencesで正常に接続し、二重正本化しない。未見のticket/resource pairでも同じidentity契約を適用する。

#### INFRA-009-FR-02 — stage releaseから独立した通常接続

通常Work/Change-to-resource connectionはHELIX全体のstage release構成体や後続版HRI-L1-015を待たず成立する。stage packへ収載するときだけHELIXOS-L2-014の契約を用い、stage IDとruntime revisionを分ける。

**INFRA-009-AC-02**: stageなしの通常fixtureを個別に成立させ、HELIX全体stage release、後続版HRI-L1-015、全7製品/L1-023完成を待たない。条件付きstage fixtureでは、同一stageの構成証拠、必要なInfrastructure依存、更新/rollback evidenceの3種をそれぞれsource/revisionへ結び、stage ID/pack identityとruntime revisionを別fieldとして相互参照する。部分更新、rollback失敗、未完operationは独立negativeとし、stage未使用を失敗扱いしない。OS ticketをruntime stateの正本にすること、Infrastructureが作業承認を発行すること、全体完成をstage開始gateにすることもそれぞれnegativeで拒否する。failure/partial時はOSまたはInfrastructureの該当state ownerへ戻し、稼働中stage、runtime revision、適格rollback先、停止中operationを保持する。

#### INFRA-009-FR-03 — mapping失敗時の保留と戻し先

Ticket/target/runtime revision/state mappingがunknown、mismatch、partialならresource changeをsuccessとせず、原因に応じOSまたはInfrastructure ownerへ戻す。適用時はcurrent stage、runtime revisions、eligible rollback target、pending operationを保持する。

**INFRA-009-AC-03**: wrong target/revision, stage-ID conflation, partial mappingを個別negativeにする。change successを出さず、cause-based owner returnと既存適格state/rollback/pending operationを記録する。

### HELIXINFRASTRUCTURE-L2-010 — SECURITY authority / Worker operation

#### INFRA-010-FR-01 — operation-scoped authorityとread/write義務分離

全operationのtarget/project/action/revision/scope/expiryに適用される有効SECURITY authorityと、SECURITY制約下のWorker execution contractを照合する。Read-onlyとstate-changing operationを分け、state-changingに限り、そのactionへ適用される採択済みL2-005のbefore/after、backup/restore/rollback/recovery dutyを確認する。credential値は通常resource stateへ無条件に保存しない。backup/snapshotは固定L2の「無条件に保存しない」を保ち、該当SECURITY条件を伴わない保存を拒否する。条件または適用可否がunknownならSECURITYへ返す。Workerはunbounded Shell主体でなく、operation-scoped contractに従う。INFRASTRUCTUREはpolicy/authority/credentialを発行しない。

**INFRA-010-AC-01**: read-only normalはdeclared target/scope/read target、空のwrite-set、適用可能なread authorityを確認する。当該operationのwriteを拒否し、declared target resourcesのbefore/after不変を確認するが、無関係なresourceの変化をfailureにしない。不要なwrite authority/005 dutyを強制しない。mutating normalは該当する005 dutyを別fixtureで確認する。wrong target/project/action/revision/scope/expiredまたはrevoked authorityは個別に拒否する。credential値を通常resource stateへ保存する変異は無条件に拒否する。backup/snapshotへSECURITY条件なしに保存する変異は個別negativeとし、条件がunknownならSECURITYへ戻す。read-only宣言だけでwrite禁止の適用証跡を欠くfixture、および宣言targetのbefore/after証拠を欠くfixtureも個別negativeにし、開始/成功扱いせずSECURITY/OSへ返す。unbounded Shell実行とINFRAによるpolicy/authority発行は開始前に拒否し、違反と未完義務を保持してSECURITY/OSへ返す。Worker成功返答だけで実状態変更を受け入れず、実状態証拠の欠落は実状態を担うInfrastructure ownerへ戻す。Read-only outcomeと変更結果を混同しない。

#### INFRA-010-FR-02 — normal OS/Worker routeとupdate admission

通常操作はOS assignment/ticketとINFRA-009 Work/Change connectionを用いる。該当義務がunknownまたは未充足ならstate-changing operationを保留する。Update-admissionはresource変更を適用するoperationに限り追加条件とする。未accepted/unknown/mismatched admissionは当該変更を開始前に停止する。停止・回収時は実state、未完operation、該当義務を保持してOSへ返す。OS復旧後のresult同期は独立bootstrap/recovery routeに限るINFRA-010-FR-03へ置く。

**INFRA-010-AC-02**: 有効なassignment/ticket/referenceと充足済み適用義務を持つnormal fixtureを記録する。通常routeのticket欠落、assignment欠落、義務unknown、義務未充足をそれぞれ独立negativeにして変更を保留する。別mutating fixtureではaccepted admissionのみ変更開始可能で、denied/unknown/mismatch/expired/revokedを個別negativeにする。同じ条件下のread-only operationはupdate admission不在だけで拒否しない。通常operationがindependent recoveryの免除を流用する変異も拒否する。停止・回収時のactual state、未完操作、義務を保持してOSへ返す。独立recovery routeの復旧後result同期はFR-03/AC-03に限定する。

#### INFRA-010-FR-03 — independent bootstrap/recovery route

OS/Control Plane停止中のbootstrap/recoveryはINFRA-006の限定resource/pathと別SECURITY authorityで開始する。停止中OS ticket/assignmentまたは通常INFRA-009応答を開始条件にしないが、通常operationに対する一般免除ではない。OS復旧後はoperation/resultを通常Work/Change traceへ同期する。この同期義務はこのL2-010句に由来し、INFRA-006要件へ加えない。

**INFRA-010-AC-03**: OS/CP停止中の独立route、対象operation/authority照合、制限された操作結果を正常fixtureで記録する。停止中通常routeのみを唯一とするnegativeでは実行しない。復旧後のresult-to-OS sync receiptは010のみに対応づけ、006だけから要求しない。

#### INFRA-010-FR-04 — mismatch / partial execution

Authority、credential scope、target、revisionの不一致は実行前に拒否する。部分実行はsuccessとせず、実際のstate、operation receipt、未完operation、適用されるrecovery/rollback dutyを保持する。

**INFRA-010-AC-04**: 完了normal fixtureではWorker result receiptと別個のactual-state observationをtarget/action/revision参照で結ぶ。Worker応答だけでactual stateを推定しない。mismatched authority/credential scope/target/revisionは個別negative fixtureで確認しoperation-startがない。途中失敗fixtureでは実際に変わったstateと未完dutyを保持し、SECURITY/OSまたは実状態のInfrastructure ownerへ戻す。

## Stage 4 追加範囲 — HELIXINFRASTRUCTURE-L2-008/025

この追記は採択済み `HELIXINFRASTRUCTURE-L2-008` と `HELIXINFRASTRUCTURE-L2-025` の1.0候補である。固定要求意味はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2/L11、PO確認対象は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。既承認prefixのbytesを保ち、この追記の承認・実装結果は別に判断する。実装順序はG0案Bに従う。後続版、自動配置最適化、高度な自動増減、Web展開を受入条件へ加えない。

### 固定親と旧資産の処置

L2全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。採択根拠は `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md:48`。

| 正規親 | 採用登録 / semantic digest | 固定L2 / 対L11行（633bf12） |
|---|---|---|
| `HELIXINFRASTRUCTURE-L2-008` | `MPR-RC-HELIXINFRASTRUCTURE-L2-008-002` / `sha256:ae2457734e68f0fa49d801f485fad5b99b08945c8ba85f405306150d8d65c925` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:104–113` / `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:106–115` |
| `HELIXINFRASTRUCTURE-L2-025` | `MPR-RC-HELIXINFRASTRUCTURE-L2-025-002` / `sha256:7465361b4d272cc1bf352a019272d6212a59282c938af704583ba1c0d493554c` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:287–296` / `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:290–298` |

008は旧OPS-R-01/02/04とOPS-AC-001/002/004の環境・設計入力・deployment planと実結果の分離、曖昧target/unknown capability拒否を部分再導出する。現行のCORE設計意味owner、runtime target/actual ownerと変更提案の境界は固定008から導く。旧Manifest/Plan/Receipt schema、provider command、promotion/production apply、rollback義務や旧承認gateは008へ移植しない。025は旧WCC-FR-01/03/04とHAT-WCC-03/06のWorker identity・実隔離・宣言だけを証拠にしない意味を部分再導出し、旧Conceptの資源不足時に未完を失わず再配置する意味を比較する。Worker≠計算機、ticket/要求/責務のOS正本、利用資源の方式でSECURITY条件を適用する責務は固定025から導く。旧wrapper、sandbox option、禁止path、network default、provider制約を現行要求へ移さない。旧L3のFR+AC/三文書/検証pairという形式を再導出し、旧G3/UX受入layer定義は置換する。旧自律境界のAI起草と人の要件承認という分担を保持し、現在の委任承認は現行PO判断による。完全一致copyはない。

| 旧asset | 読んだsource / 行 | 全文SHA-256 | raw span SHA-256（LF含む） |
|---|---|---|---|
| `LEGACY-ASSET-17C4BF78919578FEBB18` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68–79` | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | `acb16d0cc266a710a0f2aee3677954b25aa4837a2003b01830575944e999a370` |
| `LEGACY-ASSET-17C4BF78919578FEBB18` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:86–92` | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | `2adc06537aa0e010b7f28b75dcb7fe0945628bc08b65eeb93a7672fe79792e39` |
| `LEGACY-ASSET-F46AB11BD14F2C0469F4` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:26–29` | `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | `b97936e170c2a450dac6d3c2d618105de2af24cabfaec450818c142f988f4663` |
| `LEGACY-ASSET-9114D4E463E95B67DD0C` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:55–58` | `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `bd9b513950c7a52195b507b04ef5cdd7b77216fc6011dc0119b37e00569d3752` |
| `LEGACY-ASSET-C6ADB99F1353965C5449` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:31–34` | `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | `636d42400dbd74350f4e2175119cd1a5af47e8219ab653cabf43731f8b85dc18` |
| `LEGACY-ASSET-235F57A4DC453383E6C7` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md:234–238` | `ab9d93f843875c1cd9b61049721c455ae067548196c216e64168711156afd475` | `801ef4f2b8b36fd779d4570fee866fd46f959ce0358c4f7c11ceea07ff7101bb` |
| `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | `e3458062d75fec1bb5ea1a71dc1f9988ead52879c228a6495b39ba04bfcba2f9` |
| `LEGACY-ASSET-6EBDB617A8104A7756D0` | `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85` | `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` | `fc924232f93af2593a0d8ec97c36224a3c2f641ca5c03468ecae747107bd4785` |

### INFRA-008-FR-01 — CORE設計とdeployment targetの接続

CORE所有のapproved Infrastructure designのidentity/exact revision/scopeとversioned design interfaceを受け取り、同じ設計を根拠にdeployment targetとactualとの比較入力を提供する。target/runtime revisionは設計revisionと別identityで明示的に対応づける。同じSHA文字列であることを強制しない。L2-001/002のresource/environmentと三状態の比較契約を参照し、COREが設計意味、INFRASTRUCTUREがruntime target/actualを所有する。変更提案は設計変更と実行から別に保つ。

**INFRA-008-AC-01**：適用design identity/revision/scope・承認状態・interfaceを確認できる入力からだけtargetを導く。別revision、scope不一致、未承認、missing/unknown/stale、interface/contract不一致ではtarget確定と比較成立に進めず、CORE/上流design ownerへ返して比較保留を保持する。必要なL2-001/002参照が不明なら比較の未確認範囲を保持し、他resource/environmentや旧証拠で補完しない。sourceの既存currentness条件を照合し、独自expiry値は作らない。

**INFRA-008-AC-02**：targetとactualのidentity/revision/scope/sourceおよびCORE設計参照を追跡できる。いずれかが不足/不明/非current/不一致ならその比較を保留し、設計・target対応はCORE/design owner、actual観測は資源source ownerへ該当問題を戻す。同一対象の一致とdriftを分け、actualから要求/design/targetのcanonical bytesや設計承認を生成・変更しない。actual観測の資源source ownerへの戻しは依存L2-002の固定L11:51（欠落/stale observationはそのownerへ戻す）を再導出したものである。design意味ownerとruntime state ownerを移さず、変更提案だけでは設計変更・実操作を実施しない。適用する同じ契約に明示的に対応する未見design/target/actualでも、未見名称だけで拒否しない。

### INFRA-025-FR-01 — Workerと実資源の対応

Worker identity、Worker実行契約、OS ticket・要求・作業責務の参照、必要なCPU/memory/GPU/storage/networkとprocess/container等の実行環境、SECURITY隔離条件を受け取る。L2-001/003のresource identity、実際の容量・状態へWorkerを対応づける。Workerとresourceは別identityとして関連づけ、同じ名称でも混同しない。INFRASTRUCTUREは実資源/stateを所有し、その資源で利用できる方式で隔離条件を適用する。隔離policyの意味/認可はSECURITY、作業参照の正本はOS/要求・責務ownerに保持する。

**INFRA-025-AC-01**：Worker実行契約と必要な資源・環境の要求、実capacity/state/source/revisionをWorker参照へ結び、各CPU/memory/GPU/storage/network/process/container等の適用対象を宣言して照合する。非適用は既存契約で明示し、不明を非適用や十分へ丸めない。Workerを計算機のidentity/stateで置換しない。新たなWorker/resource種でも既存契約に適用できる場合は正常に対応づける。

**INFRA-025-AC-02**：対象資源で利用できる隔離方式による実適用の観測をSECURITY条件へ対応づける。宣言・policy存在・Worker応答だけでは隔離成立にしない。資源不足/容量・状態不明および隔離実適用の観測問題は資源owner、隔離不能/条件不明はSECURITY、ticket/要求/作業参照不明はOSまたはその既存参照ownerへ戻す。該当ownerを特定できなければ推測せず未解決を保持する。Worker実行契約の不足/不明/非current/不一致もOSまたは既存作業参照ownerへ返す。これらの状態では接続成立を示さず、未完作業と元資源の観測状態、移動がある場合は移動先の観測状態を保持する。

### INFRA-025-FR-02 — 資源移動時の作業lineage

必要に応じ別資源へ移る場合も、ticket、要求、Worker責務、未完義務を同じ作業へ辿れるよう保持し、元資源と移動先の観測状態を別々に残す。計算機変更でWorker責務を消さず、INFRASTRUCTUREへticket正本を移さない。実操作の認可から実行までの構成体L2-010は別契約として参照し、本接続の検証で権限や新しい移動許可を生成しない。

**INFRA-025-AC-03**：既存契約下の移動の前後でWorker、ticket、要求、責務、未完作業の参照を辿り、元資源/移動先のidentity/revision/状態を保持する。移動失敗・部分移動・停止/再開で義務を消さず、資源ownerまたはOS/SECURITYの原因に対応するownerへ戻す。旧資源の結果を移動先の現在状態へ流用しない。既存契約に適用できる未見Worker/資源の移動も、未見名称だけで拒否しない。

**INFRA-025-AC-04**：自動配置最適化や高度な自動増減の未成立だけで接続を不合格にしない。INFRASTRUCTUREがWorker assignment、SECURITY policy/authority、ticket/要求/責務の意味正本を所有する変異は成立させない。資源対応の正常結果をL2-010の操作許可や構成体受入へ代用しない。

| 親句 | FR/AC | 対L10 |
|---|---|---|
| 008入力・依存・失敗戻し | INFRA-008-FR-01 / INFRA-008-AC-01 | CASE-INFRA-008-S4-01/03–32 |
| 008提供・設計/target/actual分離・提案境界 | INFRA-008-FR-01 / INFRA-008-AC-02 | CASE-INFRA-008-S4-01–03/33–39/40–73 |
| 025入力・capacity/state・資源/Worker区別 | INFRA-025-FR-01 / INFRA-025-AC-01 | CASE-INFRA-025-S4の資源/参照fixture |
| 025隔離実適用・失敗owner | INFRA-025-FR-01 / INFRA-025-AC-02 | CASE-INFRA-025-S4の隔離/容量/作業参照の個別negative |
| 025移動後の作業lineage・未完と両資源状態 | INFRA-025-FR-02 / INFRA-025-AC-03 | CASE-INFRA-025-S4の移動/失敗/再開fixture |
| 025版・最適化非依存・010別契約 | INFRA-025-FR-02 / INFRA-025-AC-04 | CASE-INFRA-025-S4の境界変異 |
| 025束ねる条件：最低項目7・16のWorker/資源区別と2026-09-26 Worker判断（固定L2:295） | INFRA-025-FR-01 / INFRA-025-AC-01 | CASE-INFRA-025-S4-01–02/93 |

## Stage 5 追加範囲 — HELIXINFRASTRUCTURE-L2-011

本追記の対象は採択済み `HELIXINFRASTRUCTURE-L2-011`、registration `MPR-RC-HELIXINFRASTRUCTURE-L2-011-003`、version 1.0 / Stage 5 のみ。固定L2/L11の意味・scope・ownerを保つ候補であり、L3承認、実装・操作・配布許可を生成しない。Stage 1–4の既存prefixは保持する。後続版、WEB顧客runtime、OS-014は通常の独立受入条件へ加えない。OS-014は実際にOS Stage releaseへ収載されるときだけ、その収載証拠を別に照合する。

### 旧source起点と処置

旧L3のFR+ACと対のL10検証という形式は `LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`）を起点に意味再導出する。旧gate/runtime/testの実行・権限は移さない。L2-011に直接対応する旧L3 requirement / paired consumer はinventoryの登録receiptでsource atom 0件。指定identity・指定語句の完全一致検索でも直接sourceは特定できていない。旧`infrastructure-operations-requirements-and-connections-source_v0.1.md:9–11`（`LEGACY-ASSET-`登録と資産台帳での全文pinは監査に記録）はNFR registry/measurement contractの隣接提案であり、直接successorではないため比較限定とする。意味上の全archive検索は未完で、旧source不在とは断定しない。

POの18最低項目とL2最低項目対応表を起点にし、旧sourceの未確認箇所を推測で埋めず現在の採択済み固定L2/L11から再導出する。項目別の扱いは各行のowner/source boundaryに限定する。

| # | 固定PO最低項目 | 固定L2対応 | 必須source/責務owner入力（項目固有） |
|---:|---|---|---|
| 01 | 資源identity | L2-001 | INFRASTRUCTURE resource source owner / CORE design owner: resource identity・type・role・source/revision・CORE design identity/revision |
| 02 | Topology | L2-001/003 | INFRASTRUCTURE topology source owner / CORE design owner: declared topology・dependency・scope・source/revision |
| 03 | Environment | L2-001 | INFRASTRUCTURE environment source owner: environment identity・resource mapping・source/revision |
| 04 | Desired/Actual分離 | L2-002/008 | CORE desired/design owner / INFRASTRUCTURE actual resource owner: desiredとactualの別identity・revision・scope・source |
| 05 | Drift | L2-002 | CORE approved expected-state owner / INFRASTRUCTURE actual source owner: expected/actual comparison input・revision・difference evidence |
| 06 | Compute/Network/Storage | L2-001/003 | INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable: 適用resource属性・network path・storage state・source/revision |
| 07 | Model/Worker Runtime | L2-001/003/025 | INFRASTRUCTURE runtime/resource owner / Worker contract owner: runtime/model/Worker identity・version・resource relationship・source |
| 08 | Capacity | L2-003 | INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner: declared capacity・observation・source/revision・decision reference |
| 09 | Observability | L2-004 | observation source/collector owner; INFRASTRUCTURE state owner: observation value or explicit unknown・source/revision・coverage |
| 10 | Incident state | L2-004 | approved incident-meaning owner / INFRASTRUCTURE observation source owner: approved source classification・incident reference・source/revision |
| 11 | Backup/Restore | L2-005 | state owner / recovery design owner; INFRASTRUCTURE evidence source owner: backup artifact and separate actual restore evidence・scope/revision |
| 12 | Rollback | L2-005 | recovery design owner / OS operation owner where applicable: eligible rollback target・procedure・result・unfinished duty |
| 13 | Deployment version | L2-001/009 | INFRASTRUCTURE runtime version owner / OS stage identity owner: runtime revision distinct from OS stage release identity |
| 14 | Security connection | L2-010 | SECURITY authority owner / INFRASTRUCTURE resource owner: separate SECURITY authority reference・condition・source/revision |
| 15 | OS connection | L2-009 | OS work/change owner / INFRASTRUCTURE runtime state owner: OS ticket/reference and runtime-state link・source/revision |
| 16 | Runner execution (current Worker) | L2-010/025 | Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner: Worker identity and execution contract / resource mapping / authority refs |
| 17 | Bootstrap/Out-of-Band Recovery | L2-006 | INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner: independent path/resource・separate authority・Worker contract・result |
| 18 | Rebuildability | L2-007/011 | INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input: rebuild input inventory・dependency reconnection・startup verification・result |

各項目は個別のevidence/resultを持つ。正常、欠落、unknown、未観測、stale、不一致、無権限は項目単独のfixtureとして列挙し、ひとつの失敗から複数field欠落を推定しない。staleは各sourceが持つ既存currentness条件との照合であり、新しい期限を定義しない。unit、CORE/OS/SECURITY/Worker接続、全項目を束ねるcomposite acceptanceは別判定とする。

### INFRA-011-FR-01 — runtime infrastructure 1.0の最小要件閉包

選択されたruntime infrastructure scopeについて、上表18項目それぞれの入力・期待・結果・evidenceをowner/source/revision付きで追跡する。各項目のunit成立、適用するCORE/OS/SECURITY/Worker connection、composite acceptanceを別々に判定する。親minimumが欠落、unknown、未観測、stale、不一致または無権限ならcompositeを成立させず、部分成功と未完義務を残す。容量の採否、incident意味、SECURITY authority、OS作業意味、Worker契約は対応する各ownerに保持し、INFRASTRUCTURE観測から生成しない。

**INFRA-011-AC-01**: 18項目それぞれについて、宣言されたscope、入力identity/revision、source/owner、期待、観測結果、dispositionを個別に追跡できる。対象を網羅したとの主張は18項目の全行を根拠とし、mapping tableの存在だけでは成立しない。欠落・unknown・未観測・stale・不一致・無権限の項目を明示し、部分成功/未完義務/返却ownerを保持する。

**INFRA-011-AC-02**: connectionはCORE設計、OS work/change、SECURITY authority、Worker実行契約/resourceの各契約を適用範囲に応じ個別照合する。資源のunit成功をconnection成功やcomposite成功に昇格しない。各connection failureはその契約/source ownerへ戻し、owner不明を推測で埋めずunknownとして残す。

**INFRA-011-AC-03**: composite acceptanceは18項目と適用されるconnection結果の全参照を同じ対象scope/revisionへ結び付ける。backup artifact存在だけではrestore成立にせず、restore成功だけではindependent recoveryまたはrebuildability成立にせず、各resultと未完義務を保持する。

**INFRA-011-AC-04**: runtime revisionをOS stage release identityと別に保持する。OS-014はこの候補scopeが実際にOS Stage releaseへ収載される場合だけ照合する。OS停止中の独立recoveryをOS ticket/assignmentまたは通常L2-009応答へ依存させず、独立path、別SECURITY authority、制約下Workerの実証拠で判定し、OS復帰後はoperation/resultを同期する。

### INFRA-011-S5 各項目の単独変異fixture設計

各行は基準入力から一つの項目/variantだけを変える候補である。全行で対象parent identity/version、scope、source/revision、expected result、観測結果、未完義務、ownerを記録する。以下は設計候補であり、未実行である。

| fixture | item | variant | 単独入力変異 | oracle / 戻し先 |
|---|---:|---|---|---|
| `INFRA-011-S5-001` | 01 資源identity | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-002` | 01 資源identity | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-003` | 01 資源identity | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-004` | 01 資源identity | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-005` | 01 資源identity | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-006` | 01 資源identity | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-007` | 01 資源identity | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE resource source owner / CORE design owner。 |
| `INFRA-011-S5-008` | 02 Topology | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-009` | 02 Topology | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-010` | 02 Topology | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-011` | 02 Topology | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-012` | 02 Topology | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-013` | 02 Topology | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-014` | 02 Topology | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE topology source owner / CORE design owner。 |
| `INFRA-011-S5-015` | 03 Environment | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-016` | 03 Environment | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-017` | 03 Environment | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-018` | 03 Environment | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-019` | 03 Environment | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-020` | 03 Environment | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-021` | 03 Environment | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE environment source owner。 |
| `INFRA-011-S5-022` | 04 Desired/Actual分離 | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-023` | 04 Desired/Actual分離 | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-024` | 04 Desired/Actual分離 | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-025` | 04 Desired/Actual分離 | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-026` | 04 Desired/Actual分離 | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-027` | 04 Desired/Actual分離 | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-028` | 04 Desired/Actual分離 | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: CORE desired/design owner / INFRASTRUCTURE actual resource owner。 |
| `INFRA-011-S5-029` | 05 Drift | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-030` | 05 Drift | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-031` | 05 Drift | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-032` | 05 Drift | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-033` | 05 Drift | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-034` | 05 Drift | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-035` | 05 Drift | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: CORE approved expected-state owner / INFRASTRUCTURE actual source owner。 |
| `INFRA-011-S5-036` | 06 Compute/Network/Storage | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-037` | 06 Compute/Network/Storage | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-038` | 06 Compute/Network/Storage | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-039` | 06 Compute/Network/Storage | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-040` | 06 Compute/Network/Storage | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-041` | 06 Compute/Network/Storage | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-042` | 06 Compute/Network/Storage | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE resource/path/storage owner; CONNECT path contract where applicable。 |
| `INFRA-011-S5-043` | 07 Model/Worker Runtime | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-044` | 07 Model/Worker Runtime | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-045` | 07 Model/Worker Runtime | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-046` | 07 Model/Worker Runtime | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-047` | 07 Model/Worker Runtime | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-048` | 07 Model/Worker Runtime | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-049` | 07 Model/Worker Runtime | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE runtime/resource owner / Worker contract owner。 |
| `INFRA-011-S5-050` | 08 Capacity | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-051` | 08 Capacity | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-052` | 08 Capacity | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-053` | 08 Capacity | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-054` | 08 Capacity | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-055` | 08 Capacity | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-056` | 08 Capacity | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE measurement owner / OS or INTELLIGENCE decision owner。 |
| `INFRA-011-S5-057` | 09 Observability | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-058` | 09 Observability | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-059` | 09 Observability | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-060` | 09 Observability | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-061` | 09 Observability | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-062` | 09 Observability | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-063` | 09 Observability | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: observation source/collector owner; INFRASTRUCTURE state owner。 |
| `INFRA-011-S5-064` | 10 Incident state | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-065` | 10 Incident state | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-066` | 10 Incident state | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-067` | 10 Incident state | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-068` | 10 Incident state | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-069` | 10 Incident state | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-070` | 10 Incident state | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: approved incident-meaning owner / INFRASTRUCTURE observation source owner。 |
| `INFRA-011-S5-071` | 11 Backup/Restore | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-072` | 11 Backup/Restore | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-073` | 11 Backup/Restore | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-074` | 11 Backup/Restore | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-075` | 11 Backup/Restore | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-076` | 11 Backup/Restore | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-077` | 11 Backup/Restore | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: state owner / recovery design owner; INFRASTRUCTURE evidence source owner。 |
| `INFRA-011-S5-078` | 12 Rollback | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-079` | 12 Rollback | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-080` | 12 Rollback | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-081` | 12 Rollback | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-082` | 12 Rollback | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-083` | 12 Rollback | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-084` | 12 Rollback | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: recovery design owner / OS operation owner where applicable。 |
| `INFRA-011-S5-085` | 13 Deployment version | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-086` | 13 Deployment version | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-087` | 13 Deployment version | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-088` | 13 Deployment version | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-089` | 13 Deployment version | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-090` | 13 Deployment version | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-091` | 13 Deployment version | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE runtime version owner / OS stage identity owner。 |
| `INFRA-011-S5-092` | 14 Security connection | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-093` | 14 Security connection | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-094` | 14 Security connection | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-095` | 14 Security connection | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-096` | 14 Security connection | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-097` | 14 Security connection | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-098` | 14 Security connection | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-099` | 15 OS connection | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-100` | 15 OS connection | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-101` | 15 OS connection | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-102` | 15 OS connection | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-103` | 15 OS connection | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-104` | 15 OS connection | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-105` | 15 OS connection | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: OS work/change owner / INFRASTRUCTURE runtime state owner。 |
| `INFRA-011-S5-106` | 16 Runner execution (current Worker) | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-107` | 16 Runner execution (current Worker) | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-108` | 16 Runner execution (current Worker) | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-109` | 16 Runner execution (current Worker) | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-110` | 16 Runner execution (current Worker) | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-111` | 16 Runner execution (current Worker) | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-112` | 16 Runner execution (current Worker) | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: Worker contract owner / OS work owner / SECURITY authority owner / INFRASTRUCTURE resource owner。 |
| `INFRA-011-S5-113` | 17 Bootstrap/Out-of-Band Recovery | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-114` | 17 Bootstrap/Out-of-Band Recovery | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-115` | 17 Bootstrap/Out-of-Band Recovery | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-116` | 17 Bootstrap/Out-of-Band Recovery | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-117` | 17 Bootstrap/Out-of-Band Recovery | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-118` | 17 Bootstrap/Out-of-Band Recovery | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-119` | 17 Bootstrap/Out-of-Band Recovery | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE recovery-path owner / SECURITY authority owner / Worker contract owner。 |
| `INFRA-011-S5-120` | 18 Rebuildability | normal | 対象source/current revisionを固定し、項目固有の必要入力を全て提示。scope/source/revisionは他の17項目で不変。 | その項目だけをsource-qualifiedで照合し、他項目の成立へ代用しない。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-121` | 18 Rebuildability | missing | 項目固有の必須入力を1つだけ除く。scope/source/revisionは他の17項目で不変。 | 欠落を明示し、その項目を未完として該当ownerへ返す。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-122` | 18 Rebuildability | unknown | 項目固有の値をunknownにする。scope/source/revisionは他の17項目で不変。 | unknownを正常/非適用/availableへ昇格しない。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-123` | 18 Rebuildability | unobserved | 必要な観測結果だけを未観測にする。scope/source/revisionは他の17項目で不変。 | unobservedをhealthy/成功へ丸めず、観測範囲を残す。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-124` | 18 Rebuildability | stale | 項目固有source/evidenceを既存のcurrentness条件に対してstaleにする。scope/source/revisionは他の17項目で不変。 | staleをcurrentとして採用せず、該当source ownerへ返す。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-125` | 18 Rebuildability | mismatch | 項目固有identity/revision/scopeの一つだけを不一致にする。scope/source/revisionは他の17項目で不変。 | 不一致を明示し、別revision/環境の証拠で補完しない。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |
| `INFRA-011-S5-126` | 18 Rebuildability | unauthorized | 項目の意味/source/state ownerまたは必要な適用authorityを無権限sourceへ置換する。scope/source/revisionは他の17項目で不変。 | 無権限入力で項目成立・意味変更・操作許可を生成しない。責務owner: INFRASTRUCTURE rebuild/recovery owner; CORE/OS/SECURITY/Worker owners by input。 |

上記単独fixtureとは別に、4種類のoperation oracle（read-only/no-change、該当recovery dutyを伴うstate-changing operation、L2-010で許可されたupdate、OS停止中independent recovery）を独立に判定する。各operationは適用されるauthority/scope/result/未完義務のみを評価し、無関係なrecovery要件を操作ごとの前提へ一律拡張しない。4 oracleをひとつのcaseに束ねない。

### 接続とcompositeの独立fixture境界

個別項目のunit判定から独立させ、適用されるconnection ownerごとのfixtureと、18項目+connectionのcomposite fixtureを追加する。各接続はその接続入力だけを変異し、ほかの項目/connectionを不変とする。

| fixture | unit/接続 | 単独変異とoracle | owner |
|---|---|---|---|
| `INFRA-011-S5-140` | CORE connection | approved CORE design identity/revision/scope参照を照合。参照欠落・unknown・stale・mismatchを個別に保留しCORE design ownerへ返す。 | CORE design owner |
| `INFRA-011-S5-141` | OS connection | OS work/change referenceとruntime state linkを照合。OS停止中独立recoveryの例外を通常connection全般へ拡張しない。 | OS work/change owner |
| `INFRA-011-S5-142` | SECURITY connection | 適用操作の別SECURITY authority/条件を照合。欠落・unknown・mismatch・unauthorizedを許可へ昇格しない。 | SECURITY authority owner |
| `INFRA-011-S5-143` | Worker connection | Worker identity/contractをresource mappingと別に照合。Worker名だけで実resourceや契約を成立にしない。 | Worker contract owner / INFRASTRUCTURE resource owner |
| `INFRA-011-S5-144` | composite acceptance | 18項目のevidenceと適用connection全てが同一scope/source revisionに束縛され、未完義務がない場合だけ候補成立。 | INFRASTRUCTURE composite owner; 各source ownerは自領域を保持 |
