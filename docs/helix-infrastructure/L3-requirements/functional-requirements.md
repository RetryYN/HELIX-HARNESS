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

**INFRA-001-AC-01**: 対象scope内の各resourceについて上記7属性の値または明示的unknownとsource/revisionが追跡できる。未登録・重複・不明identityを別resourceや既定値で補完しない。environment間のresourceを同一と推定しない。resource/owner/environment/location/version/dependencyが不明ならunknownのままresource sourceまたはCORE設計ownerへ返し、返却先owner自体が特定できない場合は停止して未解決ownerを記録する。読み取り不能または部分更新時は、以前のobservationをcurrentと見なさず、未完の観測範囲を残す。

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

**INFRA-006-AC-02**: 5 operationを各々独立に許可/拒否fixtureで照合する。要求外operation、誤target、異revision、scope外、別authority不一致、失効、recovery義務unknownはoperationを開始しない。通常operation用authorityだけの提示では、通常operation上有効でも独立recovery operationを開始しない。読取health checkは状態を返すだけで変更操作を開始しない。rollback/recoveryの状態変更結果と未完義務を保持する。

### INFRA-006-FR-01-03 — operation状態と結果保持

operationごとに開始条件、対象、使用したauthority identity/revision、開始前state、結果、最終適格revision、未完の操作/制約/復旧義務を区別して記録する。復旧が失敗または部分結果の場合、最後の適格revisionと未完義務を保持し、より古い結果や状態で上書きしない。

**INFRA-006-AC-03**: 正常完了、拒否、失敗、部分結果、unknownを区別する。失敗/部分結果/unknownでは最後の適格revisionと未完の操作・制約・復旧義務を追跡でき、後続観測でsource state/receiptを上書きして未完義務を消さない。安全に復旧できない範囲を明示して停止し、独立pathまたはauthorityを提供するownerへ戻す。

## scope境界

本組にL2-002〜005、007以降をStage 1のL3対象として加えない。特にL2-005は採択済みの入力依存であって、本PR範囲で要件を発行する親ではない。完全自動failover、autoscaling、multi-cloud、failure-domain/SPOF詳細、Web顧客runtime、provider選定、容量/費用の採否を1.0条件にしない。L2の意味・scope・owner・versionを変更する必要が生じた場合は該当L2へ戻し、ここでは埋めない。
