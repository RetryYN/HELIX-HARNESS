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

本追記の対象は採択済み `HELIXINFRASTRUCTURE-L2-011`、registration `MPR-RC-HELIXINFRASTRUCTURE-L2-011-003`、version 1.0 / Stage 5のみ。固定L2/L11の意味、scope、ownerを保つ候補であり、L3承認・実装・操作・配布許可を生成しない。全fixture共通のStage scope identityは `infra-011-stage5-sim`、環境fixture identityは `verification-sim` であり、環境identityを構成体scopeへ置き換えない。Stage 1–4の既存prefixは変更しない。後続版、WEB顧客runtime、OS-014は通常の1.0受入へ加えない。OS-014は実際にOS Stage releaseへ収載する場合だけ、そのstage integration evidenceを別照合する。

### 旧source起点と再導出
旧L3のFR+ACと対のL10形式は `LEGACY-ASSET-F542125805B777D8A56A`、`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168`から形式を再導出する。旧asset `LEGACY-ASSET-17C4BF78919578FEBB18` の `product-lifecycle-operations-requirements.md:68–73` とpaired acceptance `product-lifecycle-operations-acceptance.md:26` は、環境/resource/credential-referenceと曖昧なidentityの正常・反例の意味比較に限定して再利用する。provider adapter/schema、旧permissionモデル、旧workflow/runtimeは再利用しない。OPS-R10/11/13等は製品ライフサイクルの診断/backflow文脈として比較し、このStage 5の固定L2-011要求・承認には転用しない。旧intake `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md` は隣接する未採択提案として比較限定で参照し、直接lineageや要件authorityにしない。旧source意味と現行固定L2/L11を照合し、旧runtime/test/CIは実行しない。旧source searchは既存監査の限定検索記録内であり、archive全体に対応がないとは主張しない。

### 項目別source境界と正常fixture
各値は構造・単位・参照関係を示す合成fixture候補であり、実資源・実測・閾値・承認ではない。該当source ownerが固定親で特定されないときは `unknown` とする。
| # | 固定PO項目 | L2 | 合成正常入力の要点 | 固定親から特定できる責務owner |
|---:|---|---|---|---|
| 01 | 資源identity | 001 | `resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5` | resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner |
| 02 | Topology | 001/003 | `nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api,destination=db,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim` | resource source owner=unknown。宣言graph/edge不一致はCORE design owner。CONNECTは論理接続とphysical pathを区別する参照だけで、path ownerとはしない |
| 03 | Environment | 001 | `environment_id=verification-sim; resource_id=api-db-sim-01; mapping=verification-sim/api-db-sim-01; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1` | environment/resource mapping source owner=unknown。別環境の成功をproduction成立証拠にしない |
| 04 | Desired/Actual分離 | 002/008 | `design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1` | desired side CORE design owner。actual resource source owner=unknown |
| 05 | Drift | 002 | `expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config` | expected-state CORE design owner。actual source owner=unknown |
| 06 | Compute/Network/Storage | 001/003 | `compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1` | L2-001:37/L2-003:57の固定7属性（owner/durability/backup/retention/environment/confidentiality/recovery）を保持する。各storageのresource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design ownerへ戻す。CONNECTは論理接続とphysical pathの区別に限り、path ownerにはしない |
| 07 | Model/Worker Runtime | 001/003/025 | `model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1` | Worker契約の責務ownerは固定親で未特定=unknown。resource不足はresource owner、OS/SECURITY条件はそれぞれの既存owner |
| 08 | Capacity | 003 | `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none` | capacity measurement source owner=unknown。採否判断ownerはL2に基づくOSまたはINTELLIGENCE。起動要求を含まないこのfixtureでは起動要求の差戻しは非適用。起動要求を含む場合はL2-003:59に従いOS/INTELLIGENCEへ未完状態とresource snapshotを保持して戻す。fixture値は閾値/採否ではない |
| 09 | Observability | 004 | `signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope` | observation/collector source owner=unknown |
| 10 | Incident state | 004 | `runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}` | 観測stateの欠落・不一致はobservation source owner=unknownへ。incident meaningは本fixtureで判定しない |
| 11 | Backup/Restore | 005 | `backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim` | state owner / recovery design owner（固定L2の役割）。OS操作要求を含まないこのunit fixtureでOS work/change ownerを適用外とするのはfixture範囲からの導出であり、L2-005の直接引用ではない。個別source owner=unknown |
| 12 | Rollback | 005 | `rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none` | recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown |
| 13 | Deployment version | 001/009 | `runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1` | runtime version source owner=unknown。stage収載時のOS stage identity owner |
| 14 | Security connection | 010 | `authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim` | SECURITY authority owner。resource source owner=unknown |
| 15 | OS connection | 009 | `work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim-r17}` | OS work/change owner。runtime source owner=unknown |
| 16 | Worker execution | 010/025 | `worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01` | 欠けたunit/connection owner。固定L2-025:294に該当する資源不足はresource owner、ticket/隔離条件ならOS/SECURITYへ。Worker契約の責務ownerは固定親で未特定=unknown |
| 17 | Bootstrap/Out-of-Band Recovery | 006 | `path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded` | resource source owner=unknown; SECURITY authority owner; Worker契約の責務ownerは固定親で未特定=unknown |
| 18 | Rebuildability | 007/011 | `rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17]; dependency_reconnect=sim-ok; startup_verification=sim-ok; result=sim-verified}; scope=verification-sim; revision=sim-r17` | rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ |

### 機能要件と受入criteria
**INFRA-011-FR-01 — runtime infrastructure 1.0最低18項目のsource-qualified照合**
選択されたruntime infrastructure scopeについて、POの18最低項目の入力・期待・結果をそれぞれ個別にsource/revision付きで追跡する。unit結果、適用するCORE/OS/SECURITY/Worker connection、composite acceptanceは別判定とする。親にないfield、owner、期限、閾値、承認を加えない。親minimumが未充足・unknown・未観測・stale・不一致または無権限のときは、該当項目の状態と未完義務を維持し、同じscopeの他項目の成功で補完しない。容量の採否、incident意味、SECURITY authority、OS work/change意味、Worker契約は各既存ownerに留める。

**INFRA-011-AC-01:** 18項目それぞれの合成fixture input、親field、source/revision、期待、dispositionを個別に照合する。下表のCASEごとに、単独変異fieldと期待結果を記録し、適用性を確認していない状態variantを一律要求しない。unknown/missing/unobserved/stale/mismatch/unauthorizedは当該固定fieldに意味がある場合だけ扱い、正常や非適用へ丸めない。ownerが親にない場合はunknownとして残す。

**INFRA-011-AC-02:** CORE design、OS work/change、SECURITY authority、Worker契約/resource接続を各参照先ごとに照合する。更新・変更操作に限り、該当target/revision/scopeへのSECURITY update-admissionが`accepted`であることをL2-010の既存契約から照合する。接続失敗を当該契約ownerへ戻し、unit成功をconnection/composite成功へ昇格しない。親が特定しないownerを作らない。

**INFRA-011-AC-03:** composite acceptanceでは18 unit itemと適用connectionの結果を同じ対象scope/revisionに結び、部分結果と未完義務を保持する。不成立時は現行稼働revisionと適格rollback先を特定・引継ぎする。backup成功とrestore、restoreと独立recovery、restoreとrebuildabilityを別判定する。read-only operationでは対象scope内のwrite-setが空でありwriteを禁止し、operation前後状態と操作起因changeなしを確認する。compositeから独立business outcome、capacity採否、incident closure、release/operation許可を生成しない。

**INFRA-011-AC-04:** runtime revisionとOS stage release identityを分離する。OS-014 evidenceは実際のOS Stage release収載時だけ別照合し、通常のL2-011 1.0前提にはしない。後続版条件を通常1.0の暗黙前提にすること、HELIX-WEB顧客runtimeを本体構成体へ混ぜることは不適合とする。OS停止中のindependent recoveryでは通常OS ticket/assignmentを要求せず、独立path・別SECURITY authority・制約下Worker evidenceをそれぞれ確認し、OS復帰後のoperation/result同期は別判定とする。この独立recovery例外は通常read-only操作のwrite禁止を緩めない。

### 単独unit fixture索引
各fixtureの共通test scope identityは `infra-011-stage5-sim`、その中で観測する環境identityは `verification-sim` とする。各fixtureは上記正常field/valueを基準に、一つの項目fieldだけを変異する。合成値は未実行。dot表記は列挙fieldへの選択子であり、`name@revision`のrevision部だけを変更する場合はidentityを保持する。識別子からL10 literalへ一対一に追跡する。
| FR ID | L10 CASE | 項目 | 変異内容（正常は基準保持） | 変異前の基準入力 | 期待state / 責務境界 |
|---|---|---:|---|---|---|
| `INFRA-011-S5-001` | `CASE-INFRA-011-S5-001` | 01 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5 | resource identity/type/role/location/version/dependency/lifecycleをそのsource/revisionで照合し、CORE design参照と同一scopeを記録する。operation permissionや別項目の成立は生成しない。 / resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner |
| `INFRA-011-S5-002` | `CASE-INFRA-011-S5-002` | 01 | resource_idだけを空欄にする（他fieldは固定） | resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5 | identity未完として保留し、resource source owner=unknownへ返す。 / resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner |
| `INFRA-011-S5-003` | `CASE-INFRA-011-S5-003` | 01 | core_design.revisionだけをsim-r6へ変更する | resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5 | 別設計revisionを合成せずCORE design接続を保留する。 / resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner |
| `INFRA-011-S5-004` | `CASE-INFRA-011-S5-004` | 02 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api,destination=db,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim | api→dbの宣言edgeと8 path axesを記録し、入力graph内のdependencyと一致する。 / resource source ownerは固定親で未特定=unknown。宣言設計の不一致はCORE design ownerへ戻す |
| `INFRA-011-S5-005` | `CASE-INFRA-011-S5-005` | 02 | `path.purpose`だけを空欄にする | nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api,destination=db,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim | 接続目的不明としてtopology照合を保留し、resource source owner=unknownへ返す。宣言graphとの差異が確認された場合はCORE design ownerへ。 / resource source ownerは固定親で未特定=unknown。宣言設計との不一致が確認された場合だけCORE design owner |
| `INFRA-011-S5-006` | `CASE-INFRA-011-S5-006` | 02 | `path.destination`だけをcache-simへ変更し、宣言edgeは不変にする | nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api,destination=db,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim | path宣言とgraph差を報告しCORE design ownerへ戻す。 / resource source ownerは固定親で未特定=unknown。宣言設計の不一致はCORE design ownerへ戻す |
| `INFRA-011-S5-007` | `CASE-INFRA-011-S5-007` | 03 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | environment_id=verification-sim; resource_id=api-db-sim-01; mapping=verification-sim/api-db-sim-01; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1 | このfixtureに明示したverification/productionのenvironment identityとconfig/network/credential-scope/data/version/authority参照を分離して記録する。ここにないenvironmentへの被覆は主張しない。credential値は含めない。 / environment/resource mapping source owner=unknown |
| `INFRA-011-S5-008` | `CASE-INFRA-011-S5-008` | 03 | mappingだけを空欄にする | environment_id=verification-sim; resource_id=api-db-sim-01; mapping=verification-sim/api-db-sim-01; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1 | 所属を推定せずenvironment mappingを未完としてsource owner=unknownへ返す。 / environment/resource mapping source owner=unknown |
| `INFRA-011-S5-009` | `CASE-INFRA-011-S5-009` | 03 | mapping.environmentだけをproduction-simへ変更する | environment_id=verification-sim; resource_id=api-db-sim-01; mapping=verification-sim/api-db-sim-01; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1 | verification対象とproduction mappingを混同せず不一致として保留する。 / environment/resource mapping source owner=unknown |
| `INFRA-011-S5-010` | `CASE-INFRA-011-S5-010` | 04 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1 | design/target/actualのrecord identityは別々に保ち、同じ対象resource/scopeへの参照を照合する。actualをdesign承認済み状態へ昇格しない。 / desired side CORE design owner。actual resource source owner=unknown |
| `INFRA-011-S5-011` | `CASE-INFRA-011-S5-011` | 04 | actual.resourceだけをapi-db-sim-02へ変更する | design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1 | desired/actualの別記録を保ち差異を表示。expected-state owner=CORE design owner、actual source owner=unknownへ戻す。 / desired side CORE design owner。actual resource source owner=unknown |
| `INFRA-011-S5-012` | `CASE-INFRA-011-S5-012` | 04 | actual.observationだけをunknownにする | design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1 | unknownから一致・driftなしを結論せず、actual source owner=unknownへ返す。 / desired side CORE design owner。actual resource source owner=unknown |
| `INFRA-011-S5-013` | `CASE-INFRA-011-S5-013` | 05 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config | expected/actualの各比較fieldを記録し、示されたconfig差分だけをdriftとして返す。capacity採否や自動修正を生成しない。 / expected-state CORE design owner。actual source owner=unknown |
| `INFRA-011-S5-014` | `CASE-INFRA-011-S5-014` | 05 | actual.configだけをunknownにする | expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config | drift有無を結論せずunknownを保持しactual source owner=unknownへ返す。 / expected-state CORE design owner。actual source owner=unknown |
| `INFRA-011-S5-015` | `CASE-INFRA-011-S5-015` | 05 | expected.source_revisionだけをsim-r6へ戻す | expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config | 現行性を推定せず比較を保留しCORE design ownerへ返す。 / expected-state CORE design owner。actual source owner=unknown |
| `INFRA-011-S5-016` | `CASE-INFRA-011-S5-016` | 06 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1 | compute/network/永続・一時storageの属性と観測値をsource付きで記録する。recoveryを含む固定7属性を保持する。network.pathは項目02の`path-sim-01`を参照し、8 path軸の評価は項目02で行う。resource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design owner。CONNECTは論理接続とphysical pathを区別する文脈だけに用いる |
| `INFRA-011-S5-017` | `CASE-INFRA-011-S5-017` | 06 | persistent_storage.recoveryだけを空欄にする | compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1 | 永続storageのrecovery参照を未完としてsource owner=unknownへ戻す。その他のfieldはbaselineを保持 |
| `INFRA-011-S5-018` | `CASE-INFRA-011-S5-018` | 06 | network.boundaryだけをunknownにする | compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1 | network path照合を保留し、resource sourceまたは設計ownerは固定親で特定できなければunknown。CONNECTは論理接続とphysical pathの区別に限る |
| `INFRA-011-S5-019` | `CASE-INFRA-011-S5-019` | 07 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1 | model/runtime/Worker identity、contract revision、resource bindingを別fieldで照合し、modelの存在でWorker実行を推定しない。 / Worker契約の責務ownerは固定親で未特定=unknown。resource不足はresource owner、OS/SECURITY条件はそれぞれの既存owner |
| `INFRA-011-S5-020` | `CASE-INFRA-011-S5-020` | 07 | binding.resourceだけを空欄にする | model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1 | Worker応答をresource bindingへ代用しない。欠けたunit/connection ownerが固定親で特定されない場合はunknown。resource不足はresource source owner=unknown |
| `INFRA-011-S5-021` | `CASE-INFRA-011-S5-021` | 07 | worker.contract.revisionだけをsim-r2へ変更する | model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1 | current contractと照合できない状態を保持し、欠けたunit/connection ownerが固定親で特定されない場合はunknown。resource不足はresource source owner=unknown |
| `INFRA-011-S5-022` | `CASE-INFRA-011-S5-022` | 08 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none | capacity/utilization/queue/concurrency/saturation/rejection/backpressureの観測値を記録し、数値から安全性・配置・費用採否を結論しない。 / capacity measurement source owner=unknown。採否判断ownerはL2に基づくOSまたはINTELLIGENCE。起動要求を含まないこのfixtureでは起動要求の差戻しは非適用。起動要求を含む場合はL2-003:59に従いOS/INTELLIGENCEへ未完状態とresource snapshotを保持して戻す。fixture値は閾値/採否ではない |
| `INFRA-011-S5-023` | `CASE-INFRA-011-S5-023` | 08 | capacity_observation.queue_depthだけをunknownにする | capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none | 安全受入/配置採否を導かず、queue観測unknownを保持してmeasurement source owner=unknownへ返す。 / capacity measurement source owner=unknown。採否判断ownerはL2に基づくOSまたはINTELLIGENCE。fixture値は閾値/採否ではない |
| `INFRA-011-S5-024` | `CASE-INFRA-011-S5-024` | 08 | capacity_observation.cpu_usedだけを未観測にする | capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none | 可観測性欠落として保持し、safe capacityを結論しない。 / capacity measurement source owner=unknown。採否判断ownerはL2に基づくOSまたはINTELLIGENCE。fixture値は閾値/採否ではない |
| `INFRA-011-S5-025` | `CASE-INFRA-011-S5-025` | 09 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope | 列挙したsignalとcollector state、coverageを同一source/revisionで記録する。synthetic error signal不在を実環境のerror-zero保証にしない。 / observation/collector source owner=unknown |
| `INFRA-011-S5-026` | `CASE-INFRA-011-S5-026` | 09 | collector.stateだけをunobservedへ変更する | signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope | 観測不能を正常/error-zeroへ変換せず、未観測scopeを記録してcollector source owner=unknownへ返す。 / observation/collector source owner=unknown |
| `INFRA-011-S5-027` | `CASE-INFRA-011-S5-027` | 09 | coverageだけをunknownにする | signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope | 代表範囲を推定せずcoverage unknownを保持する。 / observation/collector source owner=unknown |
| `INFRA-011-S5-028` | `CASE-INFRA-011-S5-028` | 10 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2} | 分類参照は入力されたapproved policy source/revisionに結び、incident declaration/severity/closureを独自生成しない。 / approved incident-meaning ownerが入力で特定できればそのowner、特定できなければunknown。observation source owner=unknown |
| `INFRA-011-S5-029` | `CASE-INFRA-011-S5-029` | 10 | runtime_stateだけをunknownにする | runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2} | unknownを他のruntime stateやincident classificationへ丸めず保持し、observation source owner=unknownへ戻す。incident meaningは判定しない |
| `INFRA-011-S5-030` | `CASE-INFRA-011-S5-030` | 10 | incident_classification.sourceだけをunapproved-source-sim@sim-r1へ変更する | runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2} | 未承認分類のため判定を保留し、runtime_state=degraded-simとobservation.state=degraded-simを別に保持する。分類状態をhealthy/normalへ丸めずincident declaration/severity/closureを生成しない。 / observation source owner=unknown; approved sourceがmeaning ownerを特定しない場合はunknown |
| `INFRA-011-S5-031` | `CASE-INFRA-011-S5-031` | 11 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim | backup artifact/job metadataとrestore integrity/reconnect/startup/verificationを別resultとして記録し、この合成例のrestore結果をverification済みとする。 / state owner / recovery design owner（固定L2の役割）。OS操作要求を含まないこのunit fixtureでOS work/change ownerを適用外とするのはfixture範囲からの導出であり、L2-005の直接引用ではない。個別source owner=unknown |
| `INFRA-011-S5-032` | `CASE-INFRA-011-S5-032` | 11 | restore.verificationだけを欠落させる | backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim | backup成功をrestore成功へ代用せずrestoreを未完にしrecovery design ownerへ返す。 / state owner / recovery design owner（固定L2の役割）。OS操作要求を含まないこのunit fixtureでOS work/change ownerを適用外とするのはfixture範囲からの導出であり、L2-005の直接引用ではない。個別source owner=unknown |
| `INFRA-011-S5-033` | `CASE-INFRA-011-S5-033` | 11 | restore.revisionだけをsim-r6へ変更する | backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim | backup source revisionとの不一致を保持しrecovery design ownerへ返す。 / state owner / recovery design owner（固定L2の役割）。OS操作要求を含まないこのunit fixtureでOS work/change ownerを適用外とするのはfixture範囲からの導出であり、L2-005の直接引用ではない。個別source owner=unknown |
| `INFRA-011-S5-034` | `CASE-INFRA-011-S5-034` | 12 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none | rollback targetとartifact/config/dependency/data/procedure/resultをcurrent revisionに対して照合し、未完義務なしの合成結果を示す。 / recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown |
| `INFRA-011-S5-035` | `CASE-INFRA-011-S5-035` | 12 | rollback.target_revisionだけをsim-r6へ変更する | rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none | 現行/適格targetとの不一致でrollback完了を示さずrecovery design ownerへ返す。 / recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown |
| `INFRA-011-S5-036` | `CASE-INFRA-011-S5-036` | 12 | rollback.resultだけをunknownにする | rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none | rollback実行成功を推定せず未完を保持する。 / recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown |
| `INFRA-011-S5-037` | `CASE-INFRA-011-S5-037` | 13 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1 | runtime revision/artifactとOS stage release identityを別fieldで記録し、OS stage IDをruntime versionに代用しない。 / runtime version source owner=unknown。stage収載時のOS stage identity owner |
| `INFRA-011-S5-038` | `CASE-INFRA-011-S5-038` | 13 | runtime_revisionだけをos-stage-sim@sim-r4へ置換する | runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1 | runtime revisionとOS stage releaseを同一視せずversion照合を保留する。 / runtime version source owner=unknown。stage収載時のOS stage identity owner |
| `INFRA-011-S5-039` | `CASE-INFRA-011-S5-039` | 13 | runtime_revisionだけを空欄にする | runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1 | OS stage idからruntime versionを推定せずsource owner=unknownへ返す。 / runtime version source owner=unknown。stage収載時のOS stage identity owner |
| `INFRA-011-S5-040` | `CASE-INFRA-011-S5-040` | 14 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim | 通常接続の適用scopeに対応するSECURITY authority reference/condition/source/revisionを記録する。`別authority`条件はL2-006独立recoveryの文脈だけに限定する。単なるresource観測から権限を生成しない。 / SECURITY authority owner。resource source owner=unknown |
| `INFRA-011-S5-041` | `CASE-INFRA-011-S5-041` | 14 | authority.refだけを空欄にする | authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim | 接続/operationを許可済みとせずSECURITY authority ownerへ戻す。 / SECURITY authority owner。resource source owner=unknown |
| `INFRA-011-S5-042` | `CASE-INFRA-011-S5-042` | 14 | authority.conditionだけを`scope-production-sim`へ変更する | authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim | 他scope authorityを流用せず接続を保留しSECURITY ownerへ戻す。 / SECURITY authority owner。resource source owner=unknown |
| `INFRA-011-S5-043` | `CASE-INFRA-011-S5-043` | 15 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim-r17} | OS work/change参照とruntime resource/revision linkを別ownerのsource付きで追跡する。ticketをruntime状態の正本にしない。 / OS work/change owner。runtime source owner=unknown |
| `INFRA-011-S5-044` | `CASE-INFRA-011-S5-044` | 15 | work.ticketだけを空欄にする | work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim-r17} | OS work/change linkを成立扱いせずOS work/change ownerへ返す。 / OS work/change owner。runtime source owner=unknown |
| `INFRA-011-S5-045` | `CASE-INFRA-011-S5-045` | 15 | link.runtime_revisionだけをinfra-runtime-sim-r16へ変更する | work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim-r17} | 別runtime revisionで補完せずOS connectionを保留する。 / OS work/change owner。runtime source owner=unknown |
| `INFRA-011-S5-046` | `CASE-INFRA-011-S5-046` | 16 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01 | Worker contract/assignment、resource mapping、SECURITY/OS referencesを別参照として記録し、resource availabilityだけでexecution成立を推定しない。 / 欠けたunit/connection owner。固定L2-025:294に該当する資源不足はresource owner、ticket/隔離条件ならOS/SECURITYへ。Worker契約の責務ownerは固定親で未特定=unknown |
| `INFRA-011-S5-047` | `CASE-INFRA-011-S5-047` | 16 | worker.contractだけを空欄にする | worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01 | resourceの正常だけでWorker接続を成立させない。Worker契約の責務ownerは固定親で未特定=unknown。resource不足はresource source owner=unknown |
| `INFRA-011-S5-048` | `CASE-INFRA-011-S5-048` | 16 | worker.contract.revisionだけをsim-r2へ変更する | worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01 | stale contractをcurrentとして採用せず未完として保持する。Worker契約の責務ownerは固定親で未特定=unknown。resource不足はresource source owner=unknown |
| `INFRA-011-S5-049` | `CASE-INFRA-011-S5-049` | 17 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded | OSに依存しないpath/resource、別authority、Worker contract、recovery resultとOS復帰後syncを個別に記録する。OS ticketは前提にしない。 / resource source owner=unknown; SECURITY authority owner; Worker契約の責務ownerは固定親で未特定=unknown |
| `INFRA-011-S5-050` | `CASE-INFRA-011-S5-050` | 17 | path.depends_on_osだけをtrueにする | path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded | OS停止中の独立pathと認めずrecoveryを保留しresource source owner=unknownへ返す。 / resource source owner=unknown; SECURITY authority owner; Worker契約の責務ownerは固定親で未特定=unknown |
| `INFRA-011-S5-051` | `CASE-INFRA-011-S5-051` | 17 | authority.refだけを空欄にする | path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded | independent path/Worker結果があっても許可済みrecoveryと扱わずSECURITY ownerへ返す。 / resource source owner=unknown; SECURITY authority owner; Worker契約の責務ownerは固定親で未特定=unknown |
| `INFRA-011-S5-052` | `CASE-INFRA-011-S5-052` | 18 | 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。 | rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17]; dependency_reconnect=sim-ok; startup_verification=sim-ok; result=sim-verified}; scope=verification-sim; revision=sim-r17 | artifact/config/data inputs、dependency reconnection、startup verification、resultを同じruntime revisionへ結び、文書/backupの存在だけでrebuildableとしない。 / rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ |
| `INFRA-011-S5-053` | `CASE-INFRA-011-S5-053` | 18 | dependency_reconnectだけを欠落させる | rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17]; dependency_reconnect=sim-ok; startup_verification=sim-ok; result=sim-verified}; scope=verification-sim; revision=sim-r17 | input/document存在からrebuildabilityを推定せず未完を保持、該当dependency ownerが不明ならunknown。 / rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ |
| `INFRA-011-S5-054` | `CASE-INFRA-011-S5-054` | 18 | revisionだけをsim-r16へ変更する | rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17]; dependency_reconnect=sim-ok; startup_verification=sim-ok; result=sim-verified}; scope=verification-sim; revision=sim-r17 | 別revisionのrebuild evidenceを流用せずrebuild/recovery owner=unknownへ返す。 / rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ |

### 操作別oracle fixture
| L10 CASE | 対象 | 単独入力/変異 | oracle / owner戻し先 | AC |
|---|---|---|---|---|
| `CASE-INFRA-011-S5-055` | read-only通常操作正常 | `request={target=api-db-sim-01,action=inspect-sim,revision=infra-runtime-sim@sim-r17,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=infra-runtime-sim@sim-r17,action=inspect-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim-r17}; write_scope=declared; write_set=empty; writes=none; before=sim-r1; after=sim-r1`。正常、変異なし。 | L2-010 target/authority/Worker/OS条件とL2-009接続を照合し、空write-set・write禁止・writeなし・operation起因changeなしを記録。 | `INFRA-011-AC-03/04` |
| `CASE-INFRA-011-S5-056` | 適用recovery duty付きstate change正常 | `request={target=api-db-sim-01,action=replace-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=sim-r2,action=replace-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; update_admission=accepted; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim-r17}; applicable_duty=restore-check-sim; duty_result=sim-verified; before=sim-r1; after=sim-r2`。正常、変異なし。 | L2-010 target/authority/accepted admission/Worker/OS条件とL2-009接続、適用duty/resultを個別照合。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-057` | 操作別 既存契約に基づくupdate正常 | `request={target=api-db-sim-01,action=update-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim}; security_authority=security-authority-sim-01; update_admission=accepted; worker_contract=worker-contract-sim@sim-r3; os_work=os-work-sim-01; before=sim-r1; after=sim-r2; result=sim-applied`; 操作専用入力だけを適用し、18 unit itemの値を再判定しない。 | L2-010のtarget/action/revision/scope、SECURITY authority、該当更新のaccepted admission、Worker契約、OS work、resultを別照合する。/ 正常時は戻し先なし。 | `INFRA-011-AC-02/03` |
| `CASE-INFRA-011-S5-058` | 操作別 OS停止中のindependent recovery | `os_state=down-sim; os_ticket=none; path={id=oob-path-sim-01,depends_on_os=false}; security_authority=security-authority-sim-oob; worker_contract=worker-contract-oob-sim@sim-r3; action=bootstrap-sim; result=sim-verified; after_os_up_sync=sim-recorded`; 操作専用入力だけを適用し、18 unit itemの値をこのCASEで再判定しない。 | 停止OS ticketを要求しない。path/SECURITY authority/Worker契約/実結果を別に確認し、復帰後syncを独立確認する。ticket不要は通常操作の条件を変えない。正常時は戻し先なし。resource source owner未特定はunknownとして記録し、正常fixtureから差戻しを生成しない。 | `INFRA-011-AC-04` |

### 復旧・scope境界 fixture
CASE-059〜067は、各CASEの「変異前baseline」literalを入力とし、明示した一field以外は保持する。064はOS停止中でもticket不要で成立する独立recovery正常fixture、067はOS-014 stage integration evidenceを別照合する正常fixtureであり、いずれも変異なし。
| L10 CASE | 対象 | 単独入力/変異 | oracle / owner戻し先 | AC |
|---|---|---|---|---|
| `CASE-INFRA-011-S5-059` | 復旧境界 restore結果欠落 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,backup={job=sim-success,artifact=backup-sim-01,source_revision=sim-r7},restore={result=sim-verified,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok},current_active_revision=sim-r8,eligible_rollback_target=sim-r7,os_operation_request=none}`; restore.resultだけをmissingへ変更。 | backupとrestoreを別判定しrestore成功へ昇格しない。current active revisionとeligible rollback targetを保持する。recovery design ownerへ戻す。OS work/change ownerは操作要求を含まないこのfixtureには適用しない。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-060` | 復旧境界 restore integrity失敗 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,backup={job=sim-success,artifact=backup-sim-01,source_revision=sim-r7},restore={result=sim-verified,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok},current_active_revision=sim-r8,eligible_rollback_target=sim-r7,os_operation_request=none}`; restore.integrityだけをsim-failedへ変更。 | restore失敗を保持し成功/rollback完了にしない。current active revisionとeligible rollback targetを保持する。recovery design ownerへ戻す。OS work/change ownerは操作要求を含まないこのfixtureには適用しない。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-061` | 復旧境界 dependency reconnect未観測 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,backup={job=sim-success,artifact=backup-sim-01,source_revision=sim-r7},restore={result=sim-verified,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok},current_active_revision=sim-r8,eligible_rollback_target=sim-r7,os_operation_request=none}`; restore.dependency_reconnectだけをunobservedへ変更。 | unobservedを成功へ丸めずrestore/rebuild未完とし、current active revisionとeligible rollback targetを保持する。dependency source owner=unknown、recovery design ownerへ戻す。OS work/change ownerは操作要求を含まないこのfixtureには適用しない。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-062` | 復旧境界 independent path欠落 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,backup=sim-success,restore=sim-verified,independent_path=sim-available,security_authority=sim-authorized,worker_contract=sim-current,os_state=down-sim,os_ticket=none}`; independent_pathだけをmissingへ変更。 | restoreからbootstrap/recoveryを推定しない。L2-006 path/source ownerは未特定ならunknown。 / independent resource source owner=unknown | `INFRA-011-AC-03/04` |
| `CASE-INFRA-011-S5-063` | 復旧境界 rebuild startup失敗 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,rebuild.inputs=complete-sim,rebuild.dependency_reconnect=sim-ok,rebuild.startup_verification=sim-ok,rebuild.result=sim-verified,current_active_revision=sim-r8,eligible_rollback_target=sim-r7}`; rebuild.startup_verificationだけをsim-failedへ変更。 | rebuildabilityを別判定で失敗とし部分結果・稼働版・適格rollback先を保持する。 / rebuild/recovery owner=unknown（固定親で未特定） | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-064` | 復旧境界 OS停止中ticketなしの正常 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,os_state=down-sim,os_ticket=none,independent_path=sim-available,security_authority=sim-authorized,worker_contract=sim-current,recovery.result=sim-verified,after_os_up_sync=sim-recorded}`; 正常fixture、変異なし。 | 停止OS ticketをrequireしない。独立path/SECURITY authority/Worker契約/resultと復帰後syncを別々に確認する。ticket欠落は許可免除を意味しない。 / 正常時は戻し先なし | `INFRA-011-AC-04` |
| `CASE-INFRA-011-S5-065` | 復旧境界 independent authority欠落 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,os_state=down-sim,os_ticket=none,independent_path=sim-available,security_authority=sim-authorized,worker_contract=sim-current,recovery.result=sim-present}`; security_authorityだけをmissingへ変更。 | 許可済みrecoveryと扱わず停止し、SECURITY authority ownerへ返す。 / SECURITY authority owner | `INFRA-011-AC-04` |
| `CASE-INFRA-011-S5-066` | 復旧境界 復旧後operation同期欠落 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,os_state=up-sim,recovery.result=sim-verified,operation_sync=sim-recorded}`; operation_syncだけをmissingへ変更。 | recovery結果自体は保持するが接続compositeは未完。OS work/change ownerへ戻す。 / OS work/change owner。同期source ownerが特定できない場合はunknown | `INFRA-011-AC-04` |
| `CASE-INFRA-011-S5-067` | 復旧境界 OS-014 stage収載時の正常 | `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,stage_release_inclusion=true,os_014_stage_ref=os-stage-sim@sim-r4,requested_evidence=none}`; 正常fixture。変異なし。 | OS-014 evidenceは実際のstage収載時だけ別照合する。通常のInfrastructure 1.0受入には要求しない。/ 正常時は戻し先なし | `INFRA-011-AC-04` |


| `CASE-INFRA-011-S5-068` | 接続 CORE design参照欠落 | `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=missing}; target_scope=infra-011-stage5-sim`。core_design.revisionだけをmissingにする。 | CORE接続だけ保留。CORE design ownerへ。 | `INFRA-011-AC-02` |
| `CASE-INFRA-011-S5-069` | 接続 OS work/change参照欠落 | `runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; os_work={ticket=missing,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; action=deploy-sim`。ticketのみ欠落。 | OS connectionを保留しOS work/change ownerへ。S5-058には通常operationのticket条件を流用しない。 | `INFRA-011-AC-02` |
| `CASE-INFRA-011-S5-070` | 接続 SECURITY authority欠落 | `resource=api-db-sim-01; action=inspect-sim; security_authority={ref=missing,source=SECURITY-sim@sim-r3,revision=sim-r3,scope=infra-011-stage5-sim,environment=verification-sim}`。authority refのみ欠落。 | 許可済みconnection/operationとせずSECURITY authority ownerへ。 | `INFRA-011-AC-02` |
| `CASE-INFRA-011-S5-071` | 接続 Worker contract欠落 | `worker={id=worker-sim,contract=missing,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim`。contractのみ欠落。 | 資源対応だけでWorker connectionを成立させない。欠けたunit/connection ownerは固定親で未特定=unknown。 | `INFRA-011-AC-02` |
| `CASE-INFRA-011-S5-072` | composite正常 | `unit_results={CASE-INFRA-011-S5-001=normal@sim-r1,CASE-INFRA-011-S5-004=normal@sim-r1,CASE-INFRA-011-S5-007=normal@sim-r1,CASE-INFRA-011-S5-010=normal@sim-r1,CASE-INFRA-011-S5-013=normal@sim-r1,CASE-INFRA-011-S5-016=normal@sim-r1,CASE-INFRA-011-S5-019=normal@sim-r1,CASE-INFRA-011-S5-022=normal@sim-r1,CASE-INFRA-011-S5-025=normal@sim-r1,CASE-INFRA-011-S5-028=normal@sim-r1,CASE-INFRA-011-S5-031=normal@sim-r1,CASE-INFRA-011-S5-034=normal@sim-r1,CASE-INFRA-011-S5-037=normal@sim-r1,CASE-INFRA-011-S5-040=normal@sim-r1,CASE-INFRA-011-S5-043=normal@sim-r1,CASE-INFRA-011-S5-046=normal@sim-r1,CASE-INFRA-011-S5-049=normal@sim-r1,CASE-INFRA-011-S5-052=normal@sim-r1}; connections={CORE={design=core-infra-sim@sim-r5,target_scope=infra-011-stage5-sim};OS={work=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim-r17};SECURITY={authority=security-authority-sim-01@sim-r3,scope=infra-011-stage5-sim,environment=verification-sim};Worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1,mapping=worker-sim→worker-host-sim}}; scope=infra-011-stage5-sim; environment=verification-sim; source_revision=sim-r1; current_active_revision=sim-r8; eligible_rollback_target={revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7}; composite_result=sim-complete; unfinished_duties=none`。正常、変異なし。 | 18 unit、4 connection、compositeを別記録する。独立business outcome/approval/release/executionは生成しない。正常時は戻し先なし。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-073` | composite CORE revision不一致 | `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=sim-r6}; expected_core_revision=sim-r5; other_connections=normal`。core_design.revisionだけをsim-r6へ変更。 | unit結果を保持しCORE connection/compositeを保留。CORE design ownerへ。 | `INFRA-011-AC-02/03` |
| `CASE-INFRA-011-S5-074` | composite restore証拠欠落 | `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; backup={artifact=backup-sim-01,source_revision=sim-r7,result=sim-success}; restore={target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=missing}; os_operation_request=none`。restore.verificationだけをmissingへ変更。 | backup/他項目の部分成功を保持しcompositeを保留。recovery design ownerへ。OS operation requestはないためOS戻しは非適用。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-075` | capacity採否owner判断なし | `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,queue_depth=3-sim-observation,source=capacity-sim@sim-r1}; decision_ref=none`。変異なし。 | 観測を記録し、OS/INTELLIGENCE採否やcomposite判断を生成しない。戻し先なし。 | `INFRA-011-AC-01/03` |
| `CASE-INFRA-011-S5-076` | 外部authority非生成 | `unit_results={CASE-INFRA-011-S5-001=normal@sim-r1,CASE-INFRA-011-S5-004=normal@sim-r1,CASE-INFRA-011-S5-007=normal@sim-r1,CASE-INFRA-011-S5-010=normal@sim-r1,CASE-INFRA-011-S5-013=normal@sim-r1,CASE-INFRA-011-S5-016=normal@sim-r1,CASE-INFRA-011-S5-019=normal@sim-r1,CASE-INFRA-011-S5-022=normal@sim-r1,CASE-INFRA-011-S5-025=normal@sim-r1,CASE-INFRA-011-S5-028=normal@sim-r1,CASE-INFRA-011-S5-031=normal@sim-r1,CASE-INFRA-011-S5-034=normal@sim-r1,CASE-INFRA-011-S5-037=normal@sim-r1,CASE-INFRA-011-S5-040=normal@sim-r1,CASE-INFRA-011-S5-043=normal@sim-r1,CASE-INFRA-011-S5-046=normal@sim-r1,CASE-INFRA-011-S5-049=normal@sim-r1,CASE-INFRA-011-S5-052=normal@sim-r1}; connections=CASE-INFRA-011-S5-072.normal.connections; external_approval=none; execution_state=not_requested`。変異なし。 | L3候補から承認・実装・操作・配布状態を生成しない。戻し先なし。 | `INFRA-011-AC-01..04` |
#### scope境界 CASE（Stage 5 fixture）
| CASE | 説明 | 変異前baselineと単独変異 | 期待oracle / 戻し先 | AC |
|---|---|---|---|---|
| `CASE-INFRA-011-S5-077` | scope境界 後続版条件の暗黙前提化 | `baseline={scope=infra-011-stage5-sim,version_target=1.0,later_feature=not_requested}`; `later_feature=automated_failover`だけを追加。 | 後続版機能を1.0前提にせず不適合を保持。戻し先なし。 | `INFRA-011-AC-04` |
| `CASE-INFRA-011-S5-078` | scope境界 HELIX-WEB顧客runtime混入 | `baseline={scope=infra-011-stage5-sim,version_target=1.0,HELIX-WEB-customer-runtime=excluded,included_runtime=none}`; `included_runtime`だけをHELIX-WEB-customer-runtime-simへ変更。 | 顧客runtime混入を不適合とし、本体構成体成立にしない。戻し先なし。 | `INFRA-011-AC-04` |

#### 環境境界 CASE（Stage 5 fixture）
| CASE | 説明 | 変異前baselineと単独変異 | 期待oracle / 戻し先 | AC |
|---|---|---|---|---|
| `CASE-INFRA-011-S5-079` | Environment別成功の流用 | `baseline=CASE-INFRA-011-S5-007 normal（production_evidence_source=production-sim,production_evidence_result=sim-success）`から`production_evidence_source=verification-sim`だけを変更。 | 別環境の成功をproduction成立の証拠にしない。environment/resource source owner=unknown。 | `INFRA-011-AC-01` |

#### operation / composite境界 CASE（Stage 5 fixture）
| CASE | 説明 | 変異前baselineと単独変異 | 期待oracle / 戻し先 | AC |
|---|---|---|---|---|
| `CASE-INFRA-011-S5-080` | update admission欠落 | `baseline=CASE-INFRA-011-S5-057 normal; update_admission=accepted`から`update_admission=missing`だけを変更。 | 変更開始を保留し、該当SECURITY update-admission source ownerへ返す。 | `INFRA-011-AC-02/03` |
| `CASE-INFRA-011-S5-081` | update admission未accepted | `baseline=CASE-INFRA-011-S5-057 normal（update_admission=accepted）`から`update_admission=denied`だけへ変更。 | acceptedでないため変更開始を保留し、該当SECURITY update-admission source ownerへ返す。 | `INFRA-011-AC-02/03` |
| `CASE-INFRA-011-S5-082` | read-onlyが状態を変更 | `baseline=CASE-INFRA-011-S5-055 normal; after=sim-r1`から`after=sim-r2`だけを変更。 | read-only違反として不適合。write禁止とoperation起因changeなしを確認し、source ownerが特定できなければunknown。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-083` | state changeの適用recovery duty欠落 | `baseline=CASE-INFRA-011-S5-056 normal; applicable_duty=restore-check-sim; duty_result=sim-verified`から`applicable_duty=missing`だけを変更。 | state changeを成功扱いせず未完義務を保持する。欠落fieldはrecovery dutyだけである。recovery design ownerとOS work/change ownerへ戻し、基準fixtureのOS work/change正常参照を保持する。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-084` | state changeの適用recovery duty unknown | `baseline=CASE-INFRA-011-S5-056 normal; applicable_duty=restore-check-sim; duty_result=sim-verified`から`applicable_duty=unknown`だけを変更。 | state changeを成功扱いせず未完義務を保持する。欠落fieldはrecovery dutyだけである。recovery design ownerとOS work/change ownerへ戻し、基準fixtureのOS work/change正常参照を保持する。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-085` | composite部分結果で稼働版/適格rollback先保持 | `baseline=CASE-INFRA-011-S5-072 normal`から`composite_result=sim-complete`だけを`{state=partial,missing_component={field=connection-result-receipt,source=connection-result-sim@sim-r1},unfinished_duties=[record-connection-result-sim],responsible_owner=unknown}`へ置換。その他fieldはbaselineのまま。 | compositeを不成立に保ち、欠落field/source、未完義務、責務owner=unknown、稼働版`sim-r8`と適格rollback target`sim-r7`を保持する。rollback実行や成功を生成しない。 | `INFRA-011-AC-03` |
| `CASE-INFRA-011-S5-086` | read-onlyでwrite試行を拒否 | `baseline=CASE-INFRA-011-S5-055 normal（write_set=empty; writes=none; before=sim-r1; after=sim-r1）`から`write_attempt={target=api-db-sim-01,action=write-sim,scope=infra-011-stage5-sim}`だけを追加する。 | empty write-setへのwrite試行を拒否し、writeを実行しない。拒否後もbefore/afterはsim-r1のまま。read-onlyのwrite禁止を維持し、OS停止中independent recovery例外から通常操作のwrite許可を生成しない。ownerが必要な差戻しは固定親で特定できる契約ownerに限り、特定不能ならunknown。 | `INFRA-011-AC-03/04` |


### L10 trace
| AC | L10 CASE集合 | 判定境界 |
|---|---|---|
| `INFRA-011-AC-01` | `CASE-INFRA-011-S5-001`, `CASE-INFRA-011-S5-002`, `CASE-INFRA-011-S5-003`, `CASE-INFRA-011-S5-004`, `CASE-INFRA-011-S5-005`, `CASE-INFRA-011-S5-006`, `CASE-INFRA-011-S5-007`, `CASE-INFRA-011-S5-008`, `CASE-INFRA-011-S5-009`, `CASE-INFRA-011-S5-010`, `CASE-INFRA-011-S5-011`, `CASE-INFRA-011-S5-012`, `CASE-INFRA-011-S5-013`, `CASE-INFRA-011-S5-014`, `CASE-INFRA-011-S5-015`, `CASE-INFRA-011-S5-016`, `CASE-INFRA-011-S5-017`, `CASE-INFRA-011-S5-018`, `CASE-INFRA-011-S5-019`, `CASE-INFRA-011-S5-020`, `CASE-INFRA-011-S5-021`, `CASE-INFRA-011-S5-022`, `CASE-INFRA-011-S5-023`, `CASE-INFRA-011-S5-024`, `CASE-INFRA-011-S5-025`, `CASE-INFRA-011-S5-026`, `CASE-INFRA-011-S5-027`, `CASE-INFRA-011-S5-028`, `CASE-INFRA-011-S5-029`, `CASE-INFRA-011-S5-030`, `CASE-INFRA-011-S5-031`, `CASE-INFRA-011-S5-032`, `CASE-INFRA-011-S5-033`, `CASE-INFRA-011-S5-034`, `CASE-INFRA-011-S5-035`, `CASE-INFRA-011-S5-036`, `CASE-INFRA-011-S5-037`, `CASE-INFRA-011-S5-038`, `CASE-INFRA-011-S5-039`, `CASE-INFRA-011-S5-040`, `CASE-INFRA-011-S5-041`, `CASE-INFRA-011-S5-042`, `CASE-INFRA-011-S5-043`, `CASE-INFRA-011-S5-044`, `CASE-INFRA-011-S5-045`, `CASE-INFRA-011-S5-046`, `CASE-INFRA-011-S5-047`, `CASE-INFRA-011-S5-048`, `CASE-INFRA-011-S5-049`, `CASE-INFRA-011-S5-050`, `CASE-INFRA-011-S5-051`, `CASE-INFRA-011-S5-052`, `CASE-INFRA-011-S5-053`, `CASE-INFRA-011-S5-054`, `CASE-INFRA-011-S5-075`, `CASE-INFRA-011-S5-076`, `CASE-INFRA-011-S5-079` | 18 item単独入力とunit結果。 |
| `INFRA-011-AC-02` | `CASE-INFRA-011-S5-057`, `CASE-INFRA-011-S5-068`, `CASE-INFRA-011-S5-069`, `CASE-INFRA-011-S5-070`, `CASE-INFRA-011-S5-071`, `CASE-INFRA-011-S5-073`, `CASE-INFRA-011-S5-076`, `CASE-INFRA-011-S5-080`, `CASE-INFRA-011-S5-081` | 各接続とupdateの参照先。 |
| `INFRA-011-AC-03` | `CASE-INFRA-011-S5-055`, `CASE-INFRA-011-S5-056`, `CASE-INFRA-011-S5-059`, `CASE-INFRA-011-S5-060`, `CASE-INFRA-011-S5-061`, `CASE-INFRA-011-S5-062`, `CASE-INFRA-011-S5-063`, `CASE-INFRA-011-S5-072`, `CASE-INFRA-011-S5-073`, `CASE-INFRA-011-S5-074`, `CASE-INFRA-011-S5-075`, `CASE-INFRA-011-S5-076`, `CASE-INFRA-011-S5-082`, `CASE-INFRA-011-S5-083`, `CASE-INFRA-011-S5-084`, `CASE-INFRA-011-S5-085`, `CASE-INFRA-011-S5-086` | read-onlyのwrite禁止とempty write-set、復旧、部分結果、composite分離。 |
| `INFRA-011-AC-04` | `CASE-INFRA-011-S5-055`, `CASE-INFRA-011-S5-058`, `CASE-INFRA-011-S5-064`, `CASE-INFRA-011-S5-065`, `CASE-INFRA-011-S5-066`, `CASE-INFRA-011-S5-067`, `CASE-INFRA-011-S5-076`, `CASE-INFRA-011-S5-077`, `CASE-INFRA-011-S5-078`, `CASE-INFRA-011-S5-086` | version / OS境界 / independent recovery、通常read-onlyのwrite禁止との分離。 |
