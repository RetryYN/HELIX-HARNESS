# HELIX-INFRASTRUCTURE L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書はStage 1の割当項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`docs/process/gates.md:41,64`が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85` は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## INFRA-001-FR-01 — HELIXINFRASTRUCTURE-L2-001

### 親revisionとauthority

- L2 parent: `HELIXINFRASTRUCTURE-L2-001` — [`docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L27); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
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

旧nfr-grade・pillar FR/NFRとHAT設計から測定可能性・正常/反例/境界を対にする骨格だけ再利用する。旧runtime/CLI、閾値、old physical topologyは移さない。現行L2/L11にあるidentity/environment/resource graphと明示attributeを再導出し、owner境界に合わせてCONNECT論理接続・INFRA物理pathを分ける。旧資産に現行HELIXのruntime resource topology全体との直接一致はない。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md`:19–68 | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | 0ee58a93182c45c23c90b3f0bbaae15ec5c727c3113c4ea32afb9384a04c077b |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## INFRA-006-FR-01 — HELIXINFRASTRUCTURE-L2-006

### 親revisionとauthority

- L2 parent: `HELIXINFRASTRUCTURE-L2-006` — [`docs/governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md#L48); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `0e52c250c6f1501c3ed9ae7d13ee1997632ba46ef168df50775488f268993c7f`.
  - Source `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:82-91`; full SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`, raw inclusive-span SHA-256 `35b634d00f4139bc7fbf91f0c3674f6420fec4f84cc1504f2b489845b31965ef`.
- Paired L11 source: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`; lines 84–92 raw SHA-256 `74183904675612644b9ca9f8ced9b4b34f3d6b76f8e29db779aa6605e7a24c29`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

HELIX-OS/通常control planeが利用不能な状況で、独立resource pathから、SECURITYが管理する別authorityの範囲内で限定されたbootstrap、health check、service stop、rollback、recoveryを可能にする設計境界を示す。復旧記録には対象、操作、最終適格revision、未完の操作・制約を残す。完全自動failoverを1.0条件にしない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXINFRASTRUCTURE-L2-005`、独立したbootstrap/recovery resource、および別SECURITY authorityを前提にし、`version_target: 1.0`。完全自動failoverは含めない。

### 受入条件（AC候補）

- **INFRA-006-AC-01 — 正常・追跡**：HELIX-OS/通常control plane unavailableのとき、停止中control planeへ依存しないpathと別SECURITY authorityで親L2に列挙された範囲の一操作を確認し、対象revisionと残作業を含む結果を返す。
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

旧L3/NFR gradeの測定・normal/negative/boundary構成だけ参照する。対象scopeのcontrol plane停止時に独立するbootstrap/recovery pathを定義する旧L3/AC直接一致は確認されていないため現行L2/L11から再導出する。旧Recovery CLI/command/runtime、閾値、旧authorityは置換・除外し、新たな万能管理pathにしない。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md`:19–68 | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | 0ee58a93182c45c23c90b3f0bbaae15ec5c727c3113c4ea32afb9384a04c077b |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## 未承認事項

各候補の採否は本L3と対のL10を一体として通常のPO L3承認へ渡す。パラメーターごとの承認質問は作らない。親L2の意味・scope・owner・versionに変更が必要だと判明した場合だけL2へ戻す。
