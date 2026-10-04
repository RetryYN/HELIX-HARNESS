# HELIX-INFRASTRUCTURE L3 機能要件（1.0対象親12件の草稿）

**状態：部分草稿・未承認。** この文書はStage 1・Stage 2a・Stage 2b、Stage 4およびStage 5の割当項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64`（`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`、全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## INFRA-001-FR-01 — HELIXINFRASTRUCTURE-L2-001

### 親revisionとauthority

- L2 parent: `HELIXINFRASTRUCTURE-L2-001` — [`docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L27); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- PO対象registration: `MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`、semantic digest `sha256:1f419d31826a8f6627f0595822cd99d5b8c55db0bfd5faa25a735bca92b529c6`。基準main633bf12 register locator `docs/governance/management-provisional-requirement-register.jsonl#L440`、row SHA `e2fa74ad7f424982e8ff02e6038e3d497208bdd384074c53d37cd41dec4e671f`。
  - Source `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:32-41`; full SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`, raw inclusive-span SHA-256 `3291942a92945d75c2e95d3c2be284d2349e9b89527ff9b7c56b70f785720b77`.
- Paired L11 source: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`; lines 34–42 raw SHA-256 `54a9aee8e76a5b4369d18f225e9b4970def0ea7e1d447dad8c79d714e3b25742`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

対象resourceをidentity、role、environment、location、version、dependency、lifecycle stateへ結び、source/revisionからresource topologyとして参照可能にする。各environmentは独立identityとして扱い、resource/config/network/credential scope/data/version/authorityを混ぜない。HELIX-CONNECTのlogical connectionとphysical/runtime pathを別に表し、pathにはsource、destination、protocol、endpoint、direction、purpose、security boundary、dependencyを結ぶ。persistent/temporary stateはowner、durability、backup、retention、environment、confidentiality、recovery属性をsource付きで記録する。Model/Worker runtime資源・状態は参照するが、model評価、ticket state、security policyを所有しない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：承認対象HELIX-HARNESS-CORE設計への参照とresource/environment/interface identityを前提にし、`version_target: 1.0`。最低範囲はResource identity、Topology、Environment、Compute/Network/Storage、Model/Worker Runtime、Deployment versionのruntime側（L2記載の範囲1/2/3/6/7/13）。各観測はsource/revision付きとし、unknownを推測で埋めない。Model/Worker runtime資源・状態は記録するが、model能力評価、Worker ticket/作業状態、SECURITY policyのownerにはならない。

### 受入条件（AC候補）

- **INFRA-001-AC-01 — 正常・追跡**：同一environmentのsource/revisionに結びついたresource群について列挙fieldとtopology/dependencyを参照でき、logical CONNECT edgeとphysical pathを区別する。対象scopeに含むModel Runtime属性はmodel/version/server/GPU-memory requirement/concurrency/latency/capacity/health/endpointを出典付きで示す。観測されない値はunknownとして示す。
- **INFRA-001-AC-02 — 異常・境界**：staging/development等のresourceをproduction成立の証拠にする、logical connectorをphysical routeと同一視する、欠けたversion/dependencyを推定で埋める、security authorityをresource stateで代替する場合は不成立。部分更新・読取不能の範囲をcurrentと扱わず、未完観測としてsource/ownerへ戻す。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| resource入力・topology出力：identity/role/environment/location/version/dependency/lifecycleをenvironment/source/revision別に参照 | `INFRA-001-FR-01 / INFRA-001-AC-01` | `L10-INFRA-001-C01,C04,C06` | 各tupleをsource/revisionに結び、欠落・未観測値をunknownにする |
| 環境境界：environment独立identity、resource/config/network/credential/data/version/authorityを混同せず別環境の成功をproduction証拠にしない | `INFRA-001-FR-01 / INFRA-001-AC-02` | `L10-INFRA-001-C01,C02` | cross-environment誤帰属0 |
| 通信境界：CONNECT logical connectionとphysical/runtime pathを区別し、source/destination/protocol/endpoint/direction/purpose/security boundary/dependencyを結ぶ | `INFRA-001-FR-01 / INFRA-001-AC-01,AC-02` | `L10-INFRA-001-C03` | 両recordを分離し、route tuple欠落時はunknown、logical edgeだけでphysical到達を成功にしない |
| state/storage：persistent/temporary、owner/durability/backup/retention/environment/confidentiality/recovery属性を保持 | `INFRA-001-FR-01 / INFRA-001-AC-01` | `L10-INFRA-001-C05` | 区分と全属性を確認し、未観測属性をunknownにする |
| Model/Worker runtime：scope対象attributeをsource/revision付きで記録し、能力・ticket state・security policyをINFRASTRUCTURE所有にしない | `INFRA-001-FR-01 / INFRA-001-AC-01,AC-02` | `L10-INFRA-001-C06` | model/version/server/GPU-memory requirement/concurrency/latency/capacity/health/endpointをsource/revisionに結び、owner stateを分離 |
| 否定・戻し先：欠落resource/owner/environment/location/version/dependency、読取不能・partial updateはcurrent扱いせずsource/ownerまたはCORE設計ownerへ戻す | `INFRA-001-AC-02` | `L10-INFRA-001-C04` | unknown/未完範囲/返却owner |
| 依存・版・minimum範囲：承認対象CORE設計参照、resource/environment/interface identity、version_target 1.0、最低範囲1/2/3/6/7/13 | `INFRA-001-FR-01 / INFRA-001-AC-01` | `L10-INFRA-001-C01,C04,C06` | CORE参照と6範囲の所在を照合し、1.0候補以外の版確定や未観測値の補完をしない |

### 旧L3／対のテスト設計からの意味対応

旧nfr-grade・pillar FR/NFRとHAT設計から測定可能性・正常/反例/境界を対にする骨格だけ再利用する。旧runtime/CLI、閾値、old physical topologyは移さない。現行L2/L11にあるidentity/environment/resource graphと明示attributeを再導出し、owner境界に合わせてCONNECT論理接続・INFRA物理pathを分ける。現行ownershipを持つ全要件の完全一致再利用ではなく、旧OPS-R-01/OPS-AC-001の環境identity・資源・資格情報参照/値非保存を起点に意味を再導出する（下の項目別追補）。旧L3 `technology-environment-reconciliation-requirements.md:32-70,72-94`および旧test design `technology-environment-reconciliation-acceptance.md:16-39`のsource/version drift観点を部分参照した。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md`:19–68 | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | 0ee58a93182c45c23c90b3f0bbaae15ec5c727c3113c4ea32afb9384a04c077b |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## INFRA-006-FR-01 — HELIXINFRASTRUCTURE-L2-006

### 親revisionとauthority

- L2 parent: `HELIXINFRASTRUCTURE-L2-006` — [`docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- PO対象registration: `MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`、semantic digest `sha256:546bf30c3fca163f1ccb8303cbf26d3be45baa700c77099ddc7d3f6a4701fcbc`。基準main633bf12 register locator `docs/governance/management-provisional-requirement-register.jsonl#L126`、row SHA `95a7ec0849ed46f8691ada7731beaca4cba70cb9efae0a9c095a4b4a6900f7f8`。
  - Source `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:82-91`; full SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`, raw inclusive-span SHA-256 `35b634d00f4139bc7fbf91f0c3674f6420fec4f84cc1504f2b489845b31965ef`.
- Paired L11 source: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`; lines 84–92 raw SHA-256 `74183904675612644b9ca9f8ced9b4b34f3d6b76f8e29db779aa6605e7a24c29`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

HELIX-OS/通常control planeが利用不能な状況で、独立resource pathから、SECURITYが管理する別authorityの範囲内で限定されたbootstrap、health check、service stop、rollback、recoveryを可能にする設計境界を示す。復旧記録には対象、操作、最終適格revision、未完の操作・制約を残す。完全自動failoverを1.0条件にしない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXINFRASTRUCTURE-L2-005`、独立したbootstrap/recovery resource、および別SECURITY authorityを前提にし、`version_target: 1.0`。完全自動failoverは含めない。

### 受入条件（AC候補）

- **INFRA-006-AC-01 — 正常・追跡**：HELIX-OS/通常control plane unavailableのとき、停止中control planeへ依存しないpathと別SECURITY authorityで親L2に列挙された点検・health確認・service停止・rollback・recovery起動の5操作を個別に確認し、対象revisionと残作業を含む結果を返す。
- **INFRA-006-AC-02 — 異常・境界**：停止中OSへ修復を依頼する循環、通常権限の流用、credential/policy/target不明の実行、許可された範囲外operation、完全自動failoverを必須化した成功主張は不成立。安全に復旧できなければ停止し、最後に適格なrevisionと残workを記録する。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・操作範囲：HELIX/OS unavailable、独立minimum resource、別SECURITY authorityによるbootstrap/health check/service stop/rollback/recovery | `INFRA-006-FR-01 / INFRA-006-AC-01` | `L10-INFRA-006-C01,C02,C03` | 停止中control planeなしで各列挙operationを照合 |
| 保証・責務：復旧経路は停止中HELIX-OS/通常control planeに依存せず、通常の万能経路ではない | `INFRA-006-FR-01 / INFRA-006-AC-01` | `L10-INFRA-006-C01,C02` | 依存経路とoperation/target scope |
| authority・否定：通常権限の流用、credential/policy不明、範囲外operationは成功扱いしない | `INFRA-006-AC-02` | `L10-INFRA-006-C03` | 別SECURITY authorityのみ受け入れ、欠落/不一致で停止 |
| 結果・戻し先：最終適格revision、残る操作/制約を示し、安全に復旧できない範囲は停止。完全自動failoverを1.0条件にしない | `INFRA-006-FR-01 / INFRA-006-AC-02` | `L10-INFRA-006-C04,C05` | 未完義務/last eligible revision、failover非必須 |
| 依存・版：L2-005、独立bootstrap/recovery resource、SECURITY authority、version_target 1.0 | `INFRA-006-FR-01 / INFRA-006-AC-01` | `L10-INFRA-006-C01,C03` | recovery resourceと別authorityを照合し、1.0候補境界を記録 |

### 旧L3／対のテスト設計からの意味対応

旧L3/NFR gradeの測定・normal/negative/boundary構成だけ参照する。対象scopeのcontrol plane停止時に独立するbootstrap/recovery pathを定義する旧L3/AC直接一致は確認されていないため現行L2/L11から再導出する。確認範囲は旧`nfr-grade.md:19-68`、`pillar-functional-requirements.md:134-153,178-190`および`L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`。旧Recovery CLI/command/runtime、閾値、旧authorityは置換・除外し、新たな万能管理pathにしない。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md`:19–68 | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | 0ee58a93182c45c23c90b3f0bbaae15ec5c727c3113c4ea32afb9384a04c077b |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## 未承認事項

各候補の採否は本L3と対のL10を一体として通常のPO L3承認へ渡す。パラメーターごとの承認質問は作らない。親L2の意味・scope・owner・versionに変更が必要だと判明した場合だけL2へ戻す。


## INFRA-003-FR-01 — HELIXINFRASTRUCTURE-L2-003 資源容量と起動可否

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXINFRASTRUCTURE-L2-003-003` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 441, row SHA `f1d480e98f23b9929a01a49c20ce731299073524ec472337b98c730dd63728db`); PO decision `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` line 48, SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 52–61行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `44e32ca4dd7884e3bace925f48b9d76893035f6fcc46dfe958dd249b3b6eea99`、heading「### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量」
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 54–63行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `064f0a0391c19e8726b2252b4dcefa786800983a769a556955ed55108aa4e5db`、heading「### HELIXINFRASTRUCTURE-L2-003 Compute・Network・Storage・Model資源と容量」

### 要件（候補）

起動要求に結びつくCPU/RAM/GPU/VRAM/storage/network/runtime/model requirement、capacity/utilization/queue/concurrency/saturation/rejection/backpressureの観測を、対象environment/resource identity/revisionに結んで判定材料を返す。対象scopeにModel Runtimeがある場合はmodel/version/server/GPU-memory needs/concurrency/latency/capacity/health/endpointの各属性をsource/revisionと観測範囲へ結び、属性欠落・stale・計測不能をunknownとする。これらはruntime資源の記録であり、モデル能力の評価はINTELLIGENCE/LABOの責務とする。要求量以上の観測値、要求量未満の不足、stale/欠落/計測不能のunknownを分け、available >= requestedの十分性候補は入力契約に適用閾値・条件が設定された場合だけ評価し、未設定なら十分性unknownを保持する。common resource modelのlocal/VPS/dedicated/cloud VM/container/GPU/Worker nodeとnetwork/persistent・temporary storage属性を同じ資源契約へ対応付け、起動前にOS/INTELLIGENCEの判断へ渡す。Infrastructureはplacement/費用を採否せず、自動増減scaleを1.0へ足さない。

### 受入条件（AC候補）

- **INFRA-003-AC-01 — 正常・追跡**：要求scopeのCompute/Network/Storage/Model資源fieldがsource/revision付きで揃い、要求量と同じresource/environmentのavailable capacityを比較できる。対象Model Runtimeがあるfixtureではmodel/version/server/GPU-memory requirement/concurrency/latency/capacity/health/endpointの全属性を対象revisionのsourceと観測範囲に結ぶ。available >= requested は適用する閾値・条件が入力契約で設定済みの場合に限る技術候補であり、未設定なら観測値を保持して十分性判定をunknownとする。共通資源モデルはlocal/VPS/dedicated/cloud VM/container/GPU/Worker nodeを同じresource属性へ対応させ、network pathとpersistent/temporary stateのL2-001/003属性を参照する。条件が設定された正常候補は不足なしの根拠付きsnapshotを返し、決定ownerはOS/INTELLIGENCEに残す。モデル能力評価をInfrastructureの記録から推定しない。
- **INFRA-003-AC-02 — 異常・境界**：available < requested、field欠落、計測不能、stale、identity/environment不一致を十分/healthyとして扱わない。容量不足は不足と未完状態を保持してOS/INTELLIGENCEへ返す。閾値・適用条件が未設定なら十分性はunknownとし、無制限なJob追加を成立にしない。Infrastructureは承認なしにnode移動またはcost選択を実行しない（根拠付き候補情報の提示はこの禁止に含めない）。配置・費用の自動採択、未根拠の固定utilization/latency閾値、自動autoscalingを要求しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・提供: resource/model requirementとcapacity等の観測、Model Runtime全属性・common resource model・network/storage属性をsource/revisionへ結ぶ | `INFRA-003-FR-01 / INFRA-003-AC-01` | `L10-INFRA-003-C01,C02` | resource/environment/revision別requirement・available capacity |
| 保証: 起動前capacity確認、queue/delay/alternative/reject/escalation情報、placement/costはowner外 | `INFRA-003-FR-01 / INFRA-003-AC-01,AC-02` | `L10-INFRA-003-C01,C02,C04` | 適格性情報とdecision ownerの分離 |
| 否定: stale/unknown/計測不能と適用閾値・条件未設定を十分capacityにせず、無制限Job追加を認めない | `INFRA-003-FR-01 / INFRA-003-AC-02` | `L10-INFRA-003-C03` | unknown/unavailable/理由と観測source |
| 戻し先: capacity source、OS/INTELLIGENCE decision owner、queue等未完義務 | `INFRA-003-FR-01 / INFRA-003-AC-02` | `L10-INFRA-003-C02,C03` | 不足snapshot・未完queue保持 |
| 依存・版: L2-001、容量観測source、OS/INTELLIGENCE interface; version_target 1.0。高度autoscalingは後続 | `INFRA-003-FR-01 / INFRA-003-AC-01,AC-02` | `L10-INFRA-003-C01,C04` | L2-001/resource link。自動増減の必須化0 |

### 旧L3／対のtest designからの意味対応

TERから外部技術の観測・根拠付きdiff・unknown/staleのfail-closeだけ部分再導出。TERのversion inventory/approval/promotion循環、数値、external-technology semanticsは置換しない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 32-70, 72-94 | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | 32–70行 SHA `c58abfe822a6c95a70d11c10e6355ef14f032c4c6cf9993c24f6eb24f41d4477`、72–94行 SHA `afaad3aaa2f623b5979b658c32525c0552dce29b8591dc58e8b11b8b1ab684bf` |
| 旧test design `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md` 16-39 | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | 16–39行 SHA `672efe8812416fa909f5d391b362be23d4631b42bdbc2015918bfe59b184df85` |


## INFRA-004-FR-01 — HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXINFRASTRUCTURE-L2-004-002` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 124, row SHA `5d4ef26954dc614855ebf159ec8a65f101455a4c8770f3195c46088259cc2a7e`); PO decision `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` line 48, SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 62–71行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `eec7bc7e7e6f7bb710fd2a191195c6fd656b81d78a8c8aff2bb76b26bca7a2a8`、heading「### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State」
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 64–73行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `c2a55878949b2659e2000c847df3aa263bbc69ad407b3097e694a1c138631013`、heading「### HELIXINFRASTRUCTURE-L2-004 Runtime ObservabilityとIncident State」

### 要件（候補）

依存はL2-001および対象observability source、approved incident meaningとする。`version_target: 1.0`。health/metric/log/resource/dependency/queue/error/latency/deployment/recoveryの観測を対象revision/sourceに結び、L2で列挙したruntime/incident stateを区別して提供する。観測結果からincident cause/severityを創作せず、meaning/severityは承認済み要求を参照する。telemetry/collector欠測はunknown/unobservedとして観測元へ戻す。

### 受入条件（AC候補）

- **INFRA-004-AC-01 — 正常・追跡**：対象scopeの8 state（normal, degraded, unavailable, capacity_exhausted, dependency_failure, data/network_unavailable, security_isolation, unknown）を観測source/revision付きで個別に識別する。
- **INFRA-004-AC-02 — 異常・境界**：telemetry欠測、collector failure、source/revision欠落・staleをhealthy/currentに読み替えない。承認済み定義がないseverity/causeを追加せず、L2-019の後続版freshness/confidence詳細を1.0へ要求しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・提供: runtime telemetryと異常観測→最低限のruntime/incident state | `INFRA-004-FR-01 / INFRA-004-AC-01` | `L10-INFRA-004-C01,C02` | source/revisionに結びついた状態 |
| 保証: 観測不能をhealthyにしない。severityはapproved requirementから参照 | `INFRA-004-FR-01 / INFRA-004-AC-01,AC-02` | `L10-INFRA-004-C02,C03` | unknown状態とseverityの出典 |
| 否定: stale source=current、未承認severity、unknown=healthyを禁止 | `INFRA-004-FR-01 / INFRA-004-AC-02` | `L10-INFRA-004-C02,C03` | false healthy/severity追加0 |
| 戻し先: telemetry/collector/source ownerまたはincident meaning owner | `INFRA-004-FR-01 / INFRA-004-AC-02` | `L10-INFRA-004-C02,C03` | unknown理由とowner |
| 版境界: L2-019 freshness/confidence詳細は後続版、Stage 2aは明示1.0だけ | `INFRA-004-FR-01 / INFRA-004-AC-01,AC-02` | `L10-INFRA-004-C04` | 1.0判定に後続状態を追加しない |

### 旧L3／対のtest designからの意味対応

旧lifecycle-state-separationの設計/runtime/release/observation混同を避ける failure patternを再導出。旧4-state entity/state machineを持ち込まず、current incident vocabulary/source authorityは現L2/L11を正とする。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-63857110B2C14B808B15` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/lifecycle-state-separation.md` 91-187 | `a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b` | 91–187行 SHA `8586f132926ad587bf60d819952cdd285df08eb782929ebf08e3f026ed48c4af` |
| 旧test design `LEGACY-ASSET-1EAF81D2FED559ED38C4` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/lifecycle-state-separation-acceptance.md` 235-265 | `73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` | 235–265行 SHA `76e4d210553408b6ee98fe9d59df0a8e883cdeea893f5f484ac65baa46a2fad7` |


### INFRA-004の直接の旧起点と保持・変更

旧lifecycle-state-separationは隣接する混同failureの補助資料である。observability/incidentの直接の起点は以下であり、現行のsource/revision付き8状態とunknownの意味へ再導出する。旧候補のauthorityと現行採択を混同しない。

| 旧asset/source span | full SHA-256 | raw span SHA-256 | 対応と変更理由 |
|---|---|---|---|
| `LEGACY-ASSET-17C4BF78919578FEBB18` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:108–112` | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | `d36a7b113b96991aabd0cfca088da0f1de5847d51fd8b64116cfc5fda5616dd5` | OPS-R-07: source/変更への相関、stale/missing provenanceから原因を確定しない観点を部分再導出。旧Release schema、Runbook実行権限を現行1.0へ移さない。 |
| `LEGACY-ASSET-F46AB11BD14F2C0469F4` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:32–33` | `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | `bb403a0a1852e180d9687097e490bba7e61ce6d3430a6fb28b4e4cc9eb484b69` | OPS-AC-007/008: stale・duplicate・out-of-orderから原因を推測しない反例の形式。旧自動復旧契約を追加条件にしない。 |
| `LEGACY-ASSET-5D41345F55800F23AC38` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:9–9` | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `9174666dbd02a290fc26d2629a0fe3e8da79243b5a4b2ec1158258a4d3274ea4` | NIO-L3-03は旧candidate/unapproved。metric/source/collector観測根拠の候補構造を比較し、全fieldやfreshness閾値を現行承認済み要求へ昇格させない。 |

## INFRA-005-FR-01 — HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXINFRASTRUCTURE-L2-005-002` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 125, row SHA `9791bdf9cea784f30c65fe435dc77fd2352ffab1ac6a8d8b0f2b0a191dfa0483`); PO decision `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` line 48, SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 72–81行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `4d2e826d42920d60b234a0cd1f23be671829fb052e9235a46fc1a36426acff5f`、heading「### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback」
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 74–83行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `7a26bfaffee4f4b526deb40fb24536531672dceefc243f340c78a44c11d5d408`、heading「### HELIXINFRASTRUCTURE-L2-005 Backup・Restore・Rollback」

### 要件（候補）

L2-001/002と対象stateのowner/retention/recovery要求、独立検証できるrestore environmentに依存し、`version_target: 1.0`とする。backup対象・source revision・time・completeness・location・integrity・expiry、要求にあるretention、configuration/artifact/dependency/data compatibility、復旧procedureとverification resultを対応付ける。backup実行state、実restore結果、適格rollback targetを別々に記録する。restoreでintegrity、dependency reconnection、startup、verificationを確認し、rollback targetにはInfrastructure version・configuration・artifact・dependency・data compatibilityとprocedureを結ぶ。backup設定≠backup成功、backup存在≠restore可能、rollback≠incident closureを保つ。変更前の適格state、failure、未完recovery/verificationを保存し、不完全または互換性不明ならrecovery design owner/OSへ返す。

### 受入条件（AC候補）

- **INFRA-005-AC-01 — 正常・追跡**：対象backup target/source revision/time/completeness/location/integrity/expiryとrestore environment/source revisionが参照できる。backup実行、実restore、rollback適格性が別々に記録され、restore integrity/dependency reconnection/startup/verificationおよびrollback target compatibility/procedureの証拠をscope内で再構成できる。rollback成功からincident closureやforward fix完了を生成せず、各ownerの別証拠を要求する。
- **INFRA-005-AC-02 — 異常・境界**：backup不完全、restore不成立、integrity/dependency/startup/verification欠落、互換性不明、rollback target不明をsuccess stateにしない。変更前の適格state・failure・未完義務を保持してrecovery design owner/OSへ返す。rollback receiptのみでincidentをclosedにする反例を拒否し、元incident状態と未完義務を保持する。今回のscopeが指定しない汎用retention/RTO/RPO条件を一律追加しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 依存: L2-001/002、対象state owner/retention/recovery requirement、独立検証可能restore environment | `INFRA-005-FR-01 / INFRA-005-AC-01` | `L10-INFRA-005-C01,C02,C03` | target/source revision/time/completeness/location/integrity/expiry |
| 保証: backup→restore/rollback結果を対象scopeのstate/evidenceと対応し、rollbackだけからincident closure/forward fix完了を生成しない | `INFRA-005-FR-01 / INFRA-005-AC-01,AC-02` | `L10-INFRA-005-C01,C03,C05` | backup state、実restore、rollback eligibility、incident/forward fixの別owner証拠を分離 |
| 否定: source欠落/stale/別版/部分復元を完全成功としない | `INFRA-005-FR-01 / INFRA-005-AC-02` | `L10-INFRA-005-C02,C03,C04,C05` | integrity/dependency/startup/verification/compatibility failure |
| 戻し先: source owner/recovery obligation owner、未完義務を保持 | `INFRA-005-FR-01 / INFRA-005-AC-02` | `L10-INFRA-005-C02,C03,C04,C05` | previous eligible state、failure、未完義務、recovery design owner/OS |
| 版境界: version_target 1.0の明示scope。今回のoperation-scoped restore/rollback判定は親記載のintegrity・dependency・startup・verification・compatibility・procedureで閉じるため、汎用RTO/RPO/retentionを成功条件に要しない。別scopeで技術値が必要なら、上流指定の有無に拘らず根拠・比較・測定方法付きの候補としてL3に提示する | `INFRA-005-FR-01 / INFRA-005-AC-01,AC-02` | `L10-INFRA-005-C04,C05` | 今回不要な汎用閾値を必須gateにせず、operation固有義務を判定。必要な別技術値は候補化可能 |

### 旧L3／対のtest designからの意味対応

retention-purge旧L3/test designからirreversible evidence deletionとderived projection差だけ比較。旧sourceが持つ期限だけによる物理削除禁止、可逆compaction/archive、projection rebuildの区別は旧保持契約の比較観点として記録する。現行INFRA-005全体の共通保持義務・削除禁止をこれだけから生成せず、対象stateの採択済みowner/retention契約を参照する。旧purge approvalやaudit-runtimeをbackup/restore全体の追加条件へ一般化しない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-4520E9CF35DA2E27102B` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/retention-purge-policy.md` 17-69 | `16459bba2779ee0472e52f354500e2e06ad654f2b930e20a23d9849229d32f37` | 17–69行 SHA `800bee815f8a68c4ab664e908f6cd80205696a03fa979d1763122bf7253d2707` |
| 旧test design `LEGACY-ASSET-CB6C6154115B10C04853` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-retention-purge-acceptance-test-design.md` 18-43 | `52d8ad8515c8f425bc0cb0ef52d99e472d57d7dfdfa5b71c6c506bff0b1373c5` | 18–43行 SHA `71d589c8ba3f9dda9ac7f7b4d51a0c87e5be2bd8ddc09261c9cd0b7c156f23a5` |


## INFRA-009-FR-01 — HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXINFRASTRUCTURE-L2-009-002` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 129, row SHA `ef5274aa9bd4d16a77cfb5d86b2e7ff4f45f77410984cbaa29501aebef3374a7`); PO decision `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` line 48, SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 114–123行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `b27aee4ffe80a11d8259e5af0ee0e716907c66ba0d65faa0fe9c0216487a7c16`、heading「### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続」
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 116–125行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `db7eccb04c92d0cc674f4c2b0452b20ede329bd83bc09d46aaed99af2c61c9ea`、heading「### HELIXINFRASTRUCTURE-L2-009 OS Runtime Resource StateとWork/Change Stateの接続」

### 要件（候補）

L2-001/002/004/006とOSのversioned Work/Change interface/evidenceに依存し、`version_target: 1.0`とする。OS Work/Change identityとInfrastructure resource/runtime identityを、target、revision、deployment/recovery state、evidence、stop/resumeを保つversioned cross-referenceで接続する。OSは作業・変更を正本とし、Infrastructureは実在資源・実行状態を正本とする。通常接続はstage release構成体なしで成立する。HELIXOS-L2-014 stage packに収載する場合だけstage identity/contract/runtime revisionの追加対応証拠を要求し、各IDを同一視しない。

### 受入条件（AC候補）

- **INFRA-009-AC-01 — 正常・追跡**：通常接続でOS ticket/changeとInfrastructure resource/runtime recordを相互に参照し、未完/stop/resume/rollbackを失わない。stage packを使うfixtureでは、stage IDとruntime revisionを分離し、同stage evidence内に適用条件を対応づける。
- **INFRA-009-AC-02 — 異常・境界**：unknown target/revision/owner、部分適用、未完operation欠落を成功扱いしない。OS ticketをruntime stateの正本にせず、Infrastructureに作業承認させない。通常接続をstage release完成待ちにせず、全7製品や後続L1-015/023を開始条件にしない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力: OS ticket/change/target/evidence/stop-resumeとInfrastructure topology/actual state/revision | `INFRA-009-FR-01 / INFRA-009-AC-01` | `L10-INFRA-009-C01,C02` | 双方のidentity/revision cross-reference |
| 提供・保証: versioned view、OS work stateとInfra resource stateの別正本 | `INFRA-009-FR-01 / INFRA-009-AC-01` | `L10-INFRA-009-C01,C02` | owner別canonical stateと共有link |
| stage条件: pack利用時だけstage composition/update/recovery、stage ID≠runtime revision | `INFRA-009-FR-01 / INFRA-009-AC-01,AC-02` | `L10-INFRA-009-C02` | 同stage evidenceと異なるidentity |
| 否定/戻し先: target/revision不明、OSがruntime正本化、Infraがoperation承認、未完操作損失 | `INFRA-009-FR-01 / INFRA-009-AC-02` | `L10-INFRA-009-C03` | unknown/holdとowner返却 |
| 依存・版: L2-001/002/004/006とOS versioned Work/Change interface/evidence; stage pack収載時だけHELIXOS-L2-014; version_target 1.0 | `INFRA-009-FR-01 / INFRA-009-AC-01,AC-02` | `L10-INFRA-009-C01,C04` | stage構成を通常接続の前提にしない |

### 旧L3／対のtest designからの意味対応

orchestration-runtime-bridgeのoperation/work requestとruntime evidenceをつなぐ発想は部分比較可能だが、旧state/approval/bridge runtimeを再利用しない。旧system test design generic trace shapeはstructure reference only。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-9F5B7A285FB301CD667C` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-runtime-bridge.md` 14-45 | `c89200f3992b6af4031bbc8609723ee88985f0659cf3d7932595560d51c4122b` | 14–45行 SHA `03f05ac9dbafad8e0e85b0960afb679ab1397d1e913976c97fde9f11493f4be7` |
| 旧test design `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 32-90, 91-216 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 32–90行 SHA `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228`、91–216行 SHA `066ad9e1de61935f6a5c5a939a5e78a4348f29431a9737f187edb991b71d82e4` |


## INFRA-010-FR-01 — HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXINFRASTRUCTURE-L2-010-003` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 442, row SHA `cd5a4ccad39d710adfd845c2924fc2023fbaef5b911eb160dbb95f6af3ad8841`); PO decision `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md` line 48, SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 126–135行、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、該当span SHA-256 `550d8ffed768dd86e5604fe82ba94efba3bd1cb51a7ede68654ba524e3dec798`、heading「### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体」
- 固定L11親: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 128–137行、全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、該当span SHA-256 `15225795b3c03a72922512501bcf696cf13b66d3861a94d0806fa39dfd292cc7`、heading「### HELIXINFRASTRUCTURE-L2-010 SECURITY authority・Worker操作の構成体」

### 要件（候補）

INFRASTRUCTUREの限定操作を、SECURITYが持つ適用可能なauthorityとWorker execution contractの下でのみ実行し、operation request、target/project/action/revision/scope/expiry、OS assignment/ticket (通常経路)、result receipt、実際のbefore/after resource stateを別々のevidenceとして接続する。更新を適用するoperationでは同一target/revision/scopeのaccepted update-admissionを照合し、read-onlyにはupdate-admissionを要求しないがread authority/scopeを照合する。state change時は該当するL2-005 recovery義務だけを確かめる。独立bootstrap/recoveryはL2-006の独立pathと別SECURITY authorityを使い、通常OS ticketなしの限定実行を許す。復旧後は結果をOSへ同期する。credential valueをresource normal state、backup、snapshotへ無条件に保存しない。許可条件をINFRAが新設せず、対象source ownerと既存SECURITY契約を参照する。

### 受入条件（AC候補）

- **INFRA-010-AC-01 — 正常・追跡**：有効なauthorityが同一target/project/action/revision/scope/expiryを覆う場合だけ許可範囲を判定する。通常operationはOS assignment/ticketをtraceし、update actionはaccepted update-admissionを要求、read-onlyは対象内write=0と対象resource前後状態を照合する。独立recovery fixtureは別authority/pathに制限し、OS復旧後の同期を示す。Workerを無制限Shell主体にせず、OS/SECURITY/Workerの責務内で停止・回収できる証拠を照合する。INFRAがpolicyや自身のauthorityを発行しない。
- **INFRA-010-AC-02 — 異常・境界**：authority不明/期限切れ/失効/mismatch、scope外target/action、update-admissionがdenied/unknownの変更、必要な該当recovery obligation未充足、部分操作、Worker successだけでactual state未確認を成功にしない。read-onlyにupdate-admissionを要求せず、無関係なresource状態digest不変も求めない。無制限Shell、停止/回収不能、INFRAによるpolicy/authority発行、credential値のnormal state/backup/snapshotへの無条件保存を各反例として拒否する。条件付き保持の可否は既存SECURITYとsource ownerの契約を参照し、全面保存禁止や新しい許可を生成しない。検証証拠にraw値を出さない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・責務: limited request/SECURITY authority/通常OS ticket/Worker receipt/actual resource state | `INFRA-010-FR-01 / INFRA-010-AC-01` | `L10-INFRA-010-C01,C02,C04` | 各ownerの入力とeffect evidence |
| 保証: operationはSECURITY範囲内、Workerはunlimited shellでなく停止/回収可能 | `INFRA-010-FR-01 / INFRA-010-AC-01,AC-02` | `L10-INFRA-010-C01,C03` | 許可された限定effect |
| 条件: update-admissionはstate update only、read-onlyは通常authority下の対象内write禁制 | `INFRA-010-FR-01 / INFRA-010-AC-01,AC-02` | `L10-INFRA-010-C02,C03` | read/write分離とaccepted/denied/unknown |
| 回復例外: bootstrap/recoveryは別resource/path・別authority。通常OS ticket/responseを停止中に要求しない | `INFRA-010-FR-01 / INFRA-010-AC-01` | `L10-INFRA-010-C04` | 限定scopeと復旧後OS sync |
| 否定・戻し先: authority mismatchは実行前拒否、部分実行はactual state/未完義務を保持 | `INFRA-010-FR-01 / INFRA-010-AC-02` | `L10-INFRA-010-C03,C04` | SECURITY/OSまたはrecovery owner |
| 版/依存: L2-001;通常OS経路L2-009; state-changing時だけ該当L2-005; recoveryはL2-006 | `INFRA-010-FR-01 / INFRA-010-AC-01,AC-02` | `L10-INFRA-010-C01,C02,C04` | 無関係なobligationを一律適用しない |

### 旧L3／対のtest designからの意味対応

旧security capability brokerからtarget/action/data/sink provenance境界とunknown/mismatch deny failureのみ部分再導出。capability schema/risk enum/approval/runtime admissionは移植しない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-B62E49D2E156232B8C63` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md` 17-45, 46-113, 114-175 | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | 17–45行 SHA `95bb13ba0b63fe735374c3f31c65e9de06cb7c1fb71938bbcbda34e4a52b1f95`、46–113行 SHA `a71f13bf3b552cb6711ff8a9bff3387c9a92e0ef9409b465893aff12e111f8c0`、114–175行 SHA `b73525567a5742ba4d50fdc44bd7f38fa9824260986211e686e25730ceccbc12` |
| 旧test design `LEGACY-ASSET-170112AB2FA2FFDBFEE9` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` 13-29, 42-50 | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | 13–29行 SHA `7cacf65c679bc4fed25cbf60470790b47577e85982d01a88cafc0da6d46ae2fd`、42–50行 SHA `115a969c533a592ad6fe4b1dbb60829b744259d1912a1677d0763a5a34374230` |


## INFRA-002-FR-01 — HELIXINFRASTRUCTURE-L2-002 Desired Target・Actual State・Drift

設計ownerが持つapproved design/configuration、deployment target、source-qualified actual observationを、対象environment/resource/revisionごとに別の意味状態として保持する。同じ比較対象・適用scopeで不足、余剰、version/config/network/permission/capacity差、runtime交換、unknown dependencyを提示する。差異を直す操作、設計の承認、targetの採否はこの比較から生成しない。設計、target、observationがmissing/stale/互換不明ならその部分の比較を未確定としてsource ownerへ返し、確認できた部分と未確認範囲を残す。修正はOS ticket・SECURITY authority・Workerの別契約による。

- **INFRA-002-AC-01**：同じ対象のdesign/target/actualからdriftを再構成でき、三入力と結果のsource/revisionを別々に辿れる。差異を比較しただけで正本やauthorityを書き換えない。
- **INFRA-002-AC-02**：resource missing/unexpected、version/config/network/permission/capacity差、runtime replacement、unknown dependencyを個別に識別する。入力の欠落/stale/互換不明を一致へ変換せず、該当owner・未確認scope・再比較に必要な入力を示す。

| 親の句 | AC | L10 case | 観測 |
|---|---|---|---|
| 入力・提供・三状態の分離 | `INFRA-002-AC-01` | `L10-INFRA-002-C01,C02` | 同一対象の各source/revisionとdrift差分 |
| 9差異類型・unknown保全 | `INFRA-002-AC-02` | `L10-INFRA-002-C02,C03` | missing/unexpected、5設定差、runtime交換、unknown dependency |
| 自動変更・承認にしない | `INFRA-002-AC-01,AC-02` | `L10-INFRA-002-C04` | design/target/source bytes・authority状態の不変 |
| L2-001・設計・観測依存、source ownerへ返却 | `INFRA-002-AC-02` | `L10-INFRA-002-C03,C05` | 部分比較・不足・未確認scope・返却owner |

## INFRA-007-FR-01 — HELIXINFRASTRUCTURE-L2-007 Runtime Rebuildability

環境消失後の対象をapproved design/config、artifact/dependency/data backupのidentity/revision、deployment evidenceから再構築し、依存再接続・起動・検証の結果を同じ復旧scopeへ結ぶ。必要情報は消失したmachineだけから取得する前提にしない。backupの存在、手順の存在、起動成功と再構築の成立を別に扱う。source/設定/依存/dataまたは適用authorityの不足があれば成功にせず、復元部分、未完の依存・verification、返却ownerを保持する。L2-005のbackup/restore契約とL2-006のcontrol-plane非依存経路を参照し、その責務を再定義しない。

- **INFRA-007-AC-01**：消失対象のmachineに頼らず、完全な復旧入力から宣言された隔離環境を再構築する。必要な依存再接続、起動、固定oracleの実結果まで満たすscopeだけを再構築済みとし、入力版から結果・証拠を辿れる。
- **INFRA-007-AC-02**：各入力欠落/stale/異版/依存・data・credential authority不足、再接続失敗、起動失敗、検証failure/unknownを個別に与えた場合は成功にしない。復元部分と残義務を分け、design/artifact/dependency/data/authorityの該当ownerへ返す。再開で元のscopeと版を失わない。

| 親の句 | AC | L10 case | 観測 |
|---|---|---|---|
| 全復旧入力から実環境再構築 | `INFRA-007-AC-01` | `L10-INFRA-007-C01,C02` | source版・再構築・再接続・起動・oracle実結果 |
| 特定machine内への情報閉込めを避ける | `INFRA-007-AC-01,AC-02` | `L10-INFRA-007-C01,C03` | 元machine喪失時の入力取得可否 |
| 文書/backup存在と成功を別判定 | `INFRA-007-AC-02` | `L10-INFRA-007-C03,C04` | existenceとobserved resultの区別 |
| 欠落ownerへ返却・未完verification保持 | `INFRA-007-AC-02` | `L10-INFRA-007-C04,C05` | 復元部分、残義務、owner、再開時の版対応 |
| L2-001/005/006・1.0・別authority | `INFRA-007-AC-01,AC-02` | `L10-INFRA-007-C01,C04,C05` | resource identity、復旧経路、既存authorityの条件 |

### INFRA-002 固定親と旧資産の起点

- PO対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択登録 `MPR-RC-HELIXINFRASTRUCTURE-L2-002-002`、PO判断 `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48`（全文SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`）。管理履歴 `docs/governance/management-provisional-requirement-register.jsonl#L122` の行SHA `9fd1dbecb3a6e3fb8a2b6e071783cc276df7162b079bafbafb79fb1246589a26`は追跡情報であり承認生成元ではない。
- 固定L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 42–51行、全文SHA `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、raw span SHA `ec40a66b707315814420ac5a7fe17dd4da4b4b3a958cf74a6f799d65ef1d41bc`。
- 固定L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 44–53行、全文SHA `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、raw span SHA `710b5ef8b55bbef350573769de70e255962fde93e9421fbf4a9c2f43ac4dacfb`。

### INFRA-007 固定親と旧資産の起点

- PO対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、採択登録 `MPR-RC-HELIXINFRASTRUCTURE-L2-007-002`、PO判断 `docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48`（全文SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`）。管理履歴 `docs/governance/management-provisional-requirement-register.jsonl#L127` の行SHA `faf8943bfd68ef3068ab2a2dfd3939124250dffb36841ba985550e5270d73e12`は追跡情報であり承認生成元ではない。
- 固定L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 92–101行、全文SHA `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、raw span SHA `29820e63b84ed4119c171e12b127b5f1eb3ff0bada5b693cfd0bf860b2934959`。
- 固定L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` 94–103行、全文SHA `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、raw span SHA `671533fadb07000ed569641feaee10a4d186d105b58a23a34a763a4e58e7aa1b`。

### Stage 2bの項目別再導出

002はTER-R-02/05の宣言・実効観測の区別とdrift/unknownのfailure patternを部分再導出する。approved design/target/actualの三状態と9差異類型は現固定L2/L11から導く。外部技術inventory、periodic upgrade、shadow/canary/promotion、旧authorityは移植しない。007はdistributionのclean consumer・入力版・結果照合と復旧failureを隣接例として部分再導出し、環境消失からの再構築・依存再接続・起動・検証は固定親の意味から導く。旧consumer_core_v1、Lite/Full、配布先、旧CI/runtime、release standing authorizationは置換・除外する。旧L3ディレクトリ内のrebuildability/rebuildable/Desired Target/actual state/再構築の検索で12候補を得た。今回の意味比較は下表のTER・distributionと対のtest designに限定し、全候補に対応資産がないとは判断しない。比較したsourceは完全一致再利用せず、二項目とも部分再導出として記録する。

| 旧asset | source行 | 全文SHA | raw span SHA | 現item |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 32–70 | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `c58abfe822a6c95a70d11c10e6355ef14f032c4c6cf9993c24f6eb24f41d4477` | 002の観測/差異類例 |
| `LEGACY-ASSET-30FFE84409079C9B06D1` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md` 16–39 | `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d` | `672efe8812416fa909f5d391b362be23d4631b42bdbc2015918bfe59b184df85` | 002の観測/差異類例 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` 24–83 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | `60f558ed4c14b1b235e060dad063c8a07c202b02868a1004ae8f4855671e6c2e` | 007の版付き復旧/結果類例 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` 1–58 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | 007の版付き復旧/結果類例 |

## Stage 4 — INFRASTRUCTURE-L2-008/025（対の部分草稿）

固定親はbase 633bf12の採択revisionで照合した。旧OPS/WCCは隣接責務の類例として項目別に部分再利用する。現行resource mappingは固定L2/L11から再導出し、旧資産が直接同じ意味を持つとは扱わない。

### INFRA-008-FR-01 — approved designからdeployment targetへの対応

入力はINFRASTRUCTURE-L2-001/002が定めるversioned infrastructure design interface、approved designのexact revision/scopeと、deployment targetの別identity/revisionである。設計で宣言した対象とtargetのfield対応を導き、targetとobserved actualを独立sourceとして比較する。L2-001/002 interfaceがmissing/stale、またはversion/scope不一致ならtarget mappingを確定しない。INFRASTRUCTUREは設計意味を所有・変更せず、actualからdesignへ書き戻さない。未承認・不一致・unknown designはholdとする。

**受入条件**

- INFRA-008-AC-01: approved design、target、actualを各source/revision付きで与え、design→target field mappingとtarget→actual比較を別々に追跡する。COREがdesignの意味を、Infrastructureがdeployment targetとactualを所有する。targetまたは変更の提案はdesign変更やdeployment実行ではなく、変更提案をdesign/actualへ昇格しない。
- INFRA-008-AC-02: design approval、target mapping、actual observationを個別に欠落/stale/不一致にする。該当比較だけをunknown/holdとし、actualをdesign/targetへ昇格しない。
- INFRA-008-AC-03: actual driftを設計変更で消す変異、INFRAがdesign ownerとしてwriteする変異を拒否し、設計意味の不足をHARNESS-CORE ownerへ戻す。
- INFRA-008-AC-04: L2-001/002 versioned design interfaceを欠落、stale、version/scope mismatchにする。deployment targetを確定せず、interface ownerへ戻す。

旧product lifecycle operations LEGACY-ASSET-17C4BF78919578FEBB18とpaired acceptance F46AB11BD14F2C0469F4はdeployment/release境界の類例を部分再利用する。静的な承認design→deployment targetのmappingは現行親から再導出する。

### INFRA-025-FR-01 — Workerと実行資源の対応維持

Worker identityと実際のexecution resource identity/capacity/stateを対応させ、resource移動時もticket/request/work referenceとunfinished workを保つ。Workerはmachineではない。SECURITYが隔離policy/条件を所有し、Infrastructureは各resource/environmentへ隔離条件を適用し利用可能性を報告し、OSはticket/assignment/work stateを所有する。CPU、memory、GPU、storage、networkの需要、process/container environment、INFRASTRUCTURE-L2-001/003 resource設計とcapacity、Worker execution contract、OS assignment/reference、該当SECURITY条件を入力に含める。policyの適用可能性宣言と実資源上の適用/観測stateは別の証拠とし、適用可能という宣言だけでは成立しない。capacity不足・isolation実適用不能・ticket/reference不明なら成立しない。resource mappingは観測・追跡であり、自動scaling、placement optimizer、operation実行を含まない。

**受入条件**

- INFRA-025-AC-01: CPU/memory/GPU/storage/network requested/available values、process/container environment、INFRASTRUCTURE-L2-001/003 design/capacity revision、Worker contract、OS assignment/ticket/work reference、SECURITY isolation policyをsource/revision付きで入力し、SEC policyの適用可能性宣言と実資源上で観測した適用stateを別々に確認する。実際の適用条件・resource identity・environment revisionが一致し、capacityが足りる場合だけ接続を成立させる。適正な再配置後もworker/work identityとunfinished workを保持する。
- INFRA-025-AC-02: 各資源dimension不足、隔離条件を適用できない、ticket/assignment不明、state stale/mismatchを別々に与える。どれも成立/利用可能にせず、不足dimension・適用不能条件・unknown fieldを示してSECURITY、Infrastructure resource ownerまたはOS ticket ownerへ戻す。
- INFRA-025-AC-03: 元resourceから移動先resourceへのtransitionでbefore/after state、未完work/義務、ticket/request/work referenceを保持する。resource移動でWorkerの責務を消失扱いせず、OS ticket stateをInfrastructureへ移管しない。移動先だけのcapacity/isolationを元側へ流用する、元stateを破棄する変異は不合格。
- INFRA-025-AC-04: Worker=machine、resource=assignment、resource stateからSECURITY isolation policyを推定する、自動scale/placementを行う、またはこの接続からoperation実行authorityを生成する変異を拒否する。自動配置最適化器の不在だけを理由に、親が定めるWorker/resource/ticket対応や許可範囲内の隔離適用を不成立としない。既存の許可scope内でInfrastructureが隔離条件を適用・観測することは拒まない。resource利用可能性の判断とoperation実行authorityを混同しない。

旧WCC LEGACY-ASSET-9114D4E463E95B67DD0C とpaired acceptance C6ADB99F1353965C5449 はworker descriptor/role境界の類例として部分再利用する。INFRA resource identityとOS ticketの結合意味は固定親から再導出する。

## Stage 4 fixed-parent and legacy source pins

基準commitはmain 633bf12。PO decision rowが採択根拠でありregister metadataは承認を生成しない。固定spanはinclusive physical lines、raw SHAは行末を含むbytes。

| 親 | PO判断／登録ID／row SHA | 固定L2 path・span・raw SHA・semantic digest | 固定L11 path・span・raw SHA | 基準commit／decision・L2・L11 full SHA |
|---|---|---|---|---|
| HELIXINFRASTRUCTURE-L2-008 | MPR-RC-HELIXINFRASTRUCTURE-L2-008-002 / docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48 / 4c8d971350ada77c36cb15632dcfc06c6342d61c3b329909bca8d289ec9cba49 | docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:104–113 / 841dc7e17255170394ce240dc10f263108e9e56b3c724de138eed92855812172 / sha256:ae2457734e68f0fa49d801f485fad5b99b08945c8ba85f405306150d8d65c925 | docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:106–115 / fac0236f782f4f888f8e5a923e20993edbda01d2912654021e2fa8e1af818bed | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision 0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f / L2 569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b / L11 7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada |
| HELIXINFRASTRUCTURE-L2-025 | MPR-RC-HELIXINFRASTRUCTURE-L2-025-002 / docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48 / 4c8d971350ada77c36cb15632dcfc06c6342d61c3b329909bca8d289ec9cba49 | docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:287–296 / 57341fdb5ed91f80eba13c50345e47483818d40c4135d28c301e1d44369e3c59 / sha256:7465361b4d272cc1bf352a019272d6212a59282c938af704583ba1c0d493554c | docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:290–298 / 199e879c05ce07661cabaabd7df55efa29697cc20b51bf55339d738558d52a88 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision 0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f / L2 569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b / L11 7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada |

旧L3／paired test-designのitem別source map（asset IDはdisposition ledger照合済み。span raw bytesで再計算）：

| 親 | old asset/path/lines | full SHA-256 | raw span SHA-256 | 対応分類 |
|---|---|---|---|---|
| HELIXINFRASTRUCTURE-L2-008 | LEGACY-ASSET-17C4BF78919578FEBB18 / archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:74–84 | ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0 | 9786e0423a3a973e4c4d8265b965ac72cdd00b9445bb9dbde272fe9cb4078166 | deployment target/receiptとrelease境界の隣接類例のみ部分参照。design→target static mapは現行固定親から再導出。 |
| HELIXINFRASTRUCTURE-L2-008 | LEGACY-ASSET-23D3D9769B093AFDCC25 / archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:62–70 | f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6 | 50e04feabdd91d74265cc8d0812b9a6c32fac1cfe6fa6e80c86afcb0e715367f | integratorとwriter/reviewer責務分離の類例を部分参照。現行INFRA design authorityは置換しない。 |
| HELIXINFRASTRUCTURE-L2-008 | LEGACY-ASSET-F46AB11BD14F2C0469F4 / archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:20–36 | 19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58 | b39cba60ebbd8080776a96ab23433a3a5dc8f5734fedb0ff820d3b7ea48eb6c6 | deployment/release境界の受入形式のみ参照。旧test/runtimeは実行しない。 |
| HELIXINFRASTRUCTURE-L2-025 | LEGACY-ASSET-9114D4E463E95B67DD0C / archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:48–66 | 773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290 | 63bb68435df91364aaa50763f5274cbac07862522af7fdf5513799dc17680e50 | worker descriptor/role/sandbox境界を隣接類例として部分再利用。resource-to-worker mappingとOS ticket ownerは固定親から再導出。 |
| HELIXINFRASTRUCTURE-L2-025 | LEGACY-ASSET-C6ADB99F1353965C5449 / archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:32–36 | c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d | b0c57435523ab501bc3d36fd785525fdc6ac43da623d85d1973371c90e1c24c8 | identity/receipt/source mismatchのnegative oracle類例を参照のみ。旧testは実行しない。 |

旧runtime、CLI、testを実行せず、採択済みL2/L11の要求意味を本Stage4の正本に再導出した。

## Stage 5 — HELIXINFRASTRUCTURE-L2-011 Infrastructure 1.0構成体の要件草稿

### INFRA-011-FR-01 — PO列挙18 minimum itemの個別・構成体受入

対象はHELIX自身のInfrastructure構成体である。固定親が入力として列挙するHELIX-HARNESS-CORE design、HELIX-OS/SECURITY/Worker connection、対象runtime/recovery environment、およびL2-001〜010/025の必要なversioned identity/evidenceを同一構成scopeへ結ぶ。PO既決の最低18項目は一つずつ個別scope、test input、expected outcome、observed evidence、結果へ対応させてから、unit、CORE/OS/SECURITY/Worker connection、composite outcomeを別々に評価する。

構成体成立には18項目すべての採択済み要求と適用契約、適格なbackup/restore/rollback、独立bootstrap/recovery、rebuildabilityの結果が要る。どれか一つの欠落・unknown/stale/mismatch/unauthorized、または必要な独立recovery/rebuildabilityの失敗があればcompositeは未成立のまま部分成功と未完義務を保ち、欠けたunit/connection ownerへ戻す。HELIX-WEB-OSの顧客runtimeと1.0より後の能力を混ぜない。

HELIXOS-L2-014のstage contractはInfrastructureがHELIX自身のstage releaseへ収載される場合だけ照合する。通常のInfrastructure 1.0 compositeを成立させるための必須dependencyとしては扱わない。OSはWork/Change stateを、INFRASTRUCTUREはresource/runtime stateをそれぞれ所有する。read-only操作に無関係なbackup全件を要求しない一方、構成体の18項目からbackup/restore/rollback/recoveryを外さない。個々のoperationのauthorityはL2-010/SECURITY/OS/Workerの既存契約に従い、このFRから実行権限を生成しない。

**受入条件**

- `INFRA-011-AC-01`: PO最低18項目の各々に、L2 identity、入力source/revision、expected outcome、observed evidence、結果を一件ずつ結ぶ。項目は親の対応表どおりに識別し、合算したgreenで欠落項目を補わない。HELIX-WEB顧客runtime・後続版項目は1.0対象外とする。
- `INFRA-011-AC-02`: 同一target scopeでunit、CORE/OS/SECURITY/Worker connection、compositeの結果を別々に記録する。backupと実restore/verificationを区別し、rollback適格先、独立bootstrap/recoveryおよびrebuildabilityまで照合する。一つでも欠落/unknown/stale/mismatch/unauthorizedならaggregate passにしない。HELIXOS-L2-014はstage収載時のみ追加照合し、OSとの二重state ownershipを作らない。

**最低18項目のtrace分類**（項目定義は固定L2の1.0表をそのまま保つ。下表はFR/AC/L10観測への索引である。）

| item | 固定L2範囲 | 要件で追跡する観点 |
|---|---|---|
| 1 Resource identity | L2-001 | resource identity/role/environment/location/version/dependency/lifecycle |
| 2 Topology | L2-001 | 機構・resource関係とphysical/runtime path |
| 3 Environment | L2-001 | environment identityとconfig/network/credential/data/version/authority分離 |
| 4 Design/Deployment Target/Actual separation | L2-002/008 | CORE design・target・actualの区別、actualからdesignを書換えない |
| 5 Drift | L2-002 | missing/unexpected/version/config/network/permission/capacity/runtime replacement/unknown dependency |
| 6 Compute/Network/Storage | L2-001/003 | compute/network/storage resource modelと観測 |
| 7 Model/Worker Runtime | L2-001/003/025 | model/Worker runtime identity・version・要求資源。能力評価・assignmentはownerへ残す |
| 8 Capacity | L2-003 | demand/available/capacity/utilization/queue/concurrency/saturation/rejection/backpressure |
| 9 Observability | L2-004 | health/metric/log/resource/dependency/queue/error/latency/deployment/recovery |
| 10 Incident state | L2-004 | degraded/unavailable/capacity/dependency/data/network/security-isolated/unknown区別 |
| 11 Backup/Restore | L2-005 | backup状態と実restore/verificationを分ける |
| 12 Rollback | L2-005 | 適格target、版/config/artifact/dependency/data compatibility/procedure |
| 13 Deployment version | L2-001/009 | runtime revisionとOS stage release identityを分ける |
| 14 SECURITY connection | L2-010 | policy/authority/credential/isolation/egressのowner参照 |
| 15 OS connection | L2-009 | Work/ChangeとRuntime Resource Stateをつなぎ、二重正本を防ぐ |
| 16 Worker execution | L2-010/025 | OS assignmentとSECURITY-authorized Worker operation/result/actual state |
| 17 Bootstrap/Out-of-Band Recovery | L2-006 | HELIX/control planeから独立したminimum path/resource/別SECURITY authority |
| 18 Rebuildability | L2-007/011 | approved design/config/artifact/dependency/data backup/version/evidenceから実再構築結果 |

### HELIXINFRASTRUCTURE-L2-011 固定親・旧sourceとの照合

固定親はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`。採択PO decision `helix-infrastructure-requirements-po-decision-2026-09-28.md#L48`（全文SHA `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`）はL2-001〜011および025を1.0として採択し、最低18項目と後続版境界を維持する。固定L2 `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:138–147`（全文SHA `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、raw span SHA `ddedb41002d72be9322e99d6f82233d231795f3e9cc167d2bc048c2bbe765791`、semantic digest `6bebc7a8fecafca8fa776e06bf718c0774ef7ae9c96de4bce50155b203a54351`、採択登録 `MPR-RC-HELIXINFRASTRUCTURE-L2-011-003`）。対L11 `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:140–151`（全文SHA `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、raw span SHA `6b9835a47096ab07f9007e47429bf2415bf29bf23cdf70420f1b0c2b3ac52a6e`）。最低18表 `infrastructure-requirements.md:376–399`のraw SHA `10148eae3c04c7d0f925c27c6d71cdafd4ba2d3e58f41f21c3a00aab4681da69`。

旧HELIX L3/test inventoryでは、1.0最低18項目をHELIX自身のInfrastructure構成体として一件ずつ束ね、CORE/OS/SECURITY/Worker connectionと別に受け入れる同一要件は特定できなかった。`LEGACY-ASSET-7F8960532611D89D03E1`旧Technology Environment Reconciliation L3 (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32–70,72–94`、全文SHA `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc`、raw span SHA `c58abfe822a6c95a70d11c10e6355ef14f032c4c6cf9993c24f6eb24f41d4477` / `afaad3aaa2f623b5979b658c32525c0552dce29b8591dc58e8b11b8b1ab684bf`) と `LEGACY-ASSET-30FFE84409079C9B06D1` paired acceptance (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:16–39`、全文SHA `aa61d626e7e5d5ee61f6bc96532cec931da4a1dbd104be805e4c03a0c9a2fd7d`、raw span SHA `672efe8812416fa909f5d391b362be23d4631b42bdbc2015918bfe59b184df85`) はsource/revision差異を正常・negative/unknownとして扱う観点だけを部分再利用する。旧external technology reconciliation scope、旧threshold、runtime state/CLI/testを持ち込まず、18項目、ownership、backup≠restore、independent recovery、rebuildabilityの意味は採択済み現行L2/L11から再導出する。asset IDとsource SHAは`legacy-asset-disposition.jsonl`照合済み。

## Review修正：INFRA-001/005の旧source起点

旧OPS-R-01は環境identityと資源・資格情報参照の区別、旧OPS-R-03はrollback contract/receiptとincident closureの分離を保持する起点である。対応旧ACの正常/反例の観点を部分再利用し、現行L2/L11のowner境界へ意味を再導出する。旧provider adapter schema、credential方式、release・approval authorityや後続版能力は移植せず、001の環境/資源identityと005の独立backup/restore/rollbackおよびincident非closureを現行AC/L10へ結ぶ。既存の隣接sourceは補助資料として保持し、直接の起点がないとの扱いを訂正する。

| 現行item | 旧L3 source pin | 対の旧受入 pin |
|---|---|---|
| INFRA-001 | `LEGACY-ASSET-17C4BF78919578FEBB18` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68–73` / full `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` / raw `90ec4ca119bf860db25efd2126095d80376a2fa1ce3db2159a5da49fc5610f14` | `LEGACY-ASSET-F46AB11BD14F2C0469F4` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:26–26` / full `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` / raw `f14b760580d8ec6a8b1a01bd0d4ef197a9b9b670fb8201f4ff8c1c8630b20657` |
| INFRA-005 | `LEGACY-ASSET-17C4BF78919578FEBB18` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:81–85` / full `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` / raw `69c71beb6d0c9f1d7b8c9c53989fe139c6ac563a13f21b40f73686de127376b8` | `LEGACY-ASSET-F46AB11BD14F2C0469F4` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/product-lifecycle-operations-acceptance.md:28–28` / full `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` / raw `2aff5b1396950997bcb3344bf1cb87b41f51dd0d6990b8ece5b07972f822f7bc` |
