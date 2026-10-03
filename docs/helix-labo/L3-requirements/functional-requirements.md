# HELIX-LABO L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書はStage 1、Stage 2a、Stage 2b基本エンジン9件、Stage 4 LABO-L2-036/037/038/039/040/041/052/054、Stage 5のうちLABO-L2-050/059/060/061だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する範囲に従い、1.0の実装・release許可を意味しない。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64`（`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`、全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## LABO-001-FR-01 — HELIXLABO-L2-001

### 親revisionとauthority

- L2 parent: `HELIXLABO-L2-001` — [`docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L48); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
  - Source `docs/helix-labo/L2-requirements/labo-requirements.md:69-76`; full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`, raw inclusive-span SHA-256 `9c1f285a0835a56fd7042025636ff68c2bca46d31eb2df693465d02fe772a104`.
- Paired L11 source: `docs/helix-labo/L11-acceptance/labo-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`; lines 43–47 raw SHA-256 `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b`, lines 109–116 raw SHA-256 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

個別に許可された1.0 source contractsからのobservationを、source identity/revisionおよび出典とともにLABO observationとして集積する。少なくとも親L2の20 fields（episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result）と、status vocabulary（success, failure, rejected, cancelled, blocked, unknown, not_observed）を保持する。sourceのcanonical state/authorityはsource ownerに残り、LABOへ書き戻さない。Web/WEB-OS L2-031/032はsource contract採択時のみ追加し1.0必須にしない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：個別に採択された1.0 input source contract（`HELIXLABO-L2-021〜030`）へ接続する。Web/WEB-OS `L2-031/032`はそれぞれのsource contractが採択された場合だけ加える任意接続で、1.0必須ではない。`version_target: 1.0`。対象観測には開発ログ、Worker/AI判断、CI/test/review、backflow/recovery/incident/refactor、release/deployment/runtime、利用、再作業、費用/token/API、model/provider、correction/rollback/product resultを含める。

### 受入条件（AC候補）

- **LABO-001-AC-01 — 正常・追跡**：複数の許可sourceから各sourceに実在するstatusを受け、各recordのsource identity/revisionと列挙fieldを保った独立observationを返す。source範囲のeventがすべてsuccessならそのsuccess recordだけで受け入れ、発生していないstatusを捏造しない。過去のsource revisionに結びつく観測は、その当時のrevision・時点を保ったhistorical recordとして追跡可能にする。1 sourceの欠落・破損はそのsourceのwarning/unknownとして分離し、他sourceの有効recordを巻き込まない。
- **LABO-001-AC-02 — 異常・境界**：元sourceに存在するfailure/rejected/cancelled/blocked/unknown/not_observedをsuccess-only projectionで除去する、unknownをsuccess化する、既知の古いrevisionをcurrentとして偽装する、scope外/secret dataを取り込む、LABOからsource stateへwritebackする場合は不成立。該当observationを保留しsource ownerへ返す。元source上で対象期間に非success eventが存在しない正常ケースは拒否せず、その期間にstatusを追加生成しない。旧BR21-09の部分破損時に他sourceを維持するfailure類型は参考にするが、旧dashboardの4 source/5 metric/30秒poll/token costは移さない。旧L3 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22-34`と`business-detail.md:137-145`、旧対のtest design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`を調査したが、現行cross-mechanism observation planeに直接一致は確認されなかった。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| source input・observation output：許可sourceごとのidentity/revision/attribution、L2のepisode_idからresultまでの全20 field | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C01,C03,C04,C08,C09` | 20/20列挙fieldとexact current/historical source revision |
| 状態網羅：実在するsuccess/failure/rejected/cancelled/blocked/unknown/not_observedを区別し、成功だけに投影しない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C01,C03,C08` | 存在statusの個別識別、sourceに存在する非success eventの脱落0、未発生status捏造0 |
| source authority境界：canonical state/authorityはsourceに残し、LABO observationを書き戻さない | `LABO-001-FR-01 / LABO-001-AC-02` | `L10-LABO-001-C05,C06` | 許可外入力hold、source writeback 0 |
| 部分失敗：一sourceの破損/欠落はsource単位でwarning/unknownを残し他sourceを捨てない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C02` | 当該source warningと他source valid recordの保持 |
| 否定・戻し先：古い既知revisionはhistoryとして保持できるがcurrent扱いせず、secret/out-of-scope/権限外は成功とせずsource ownerへ返す | `LABO-001-AC-02` | `L10-LABO-001-C04,C05,C09` | exact historical revision保持、stale-as-current拒否、理由・source owner |
| 任意接続：Web/WEB-OS未選択時に1.0必須dependencyへしない | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C07` | 未選択時必須扱い0 |
| 依存・版：個別採択source contract L2-021〜030を1.0接続対象とし、L2-031/032は採択時だけ任意接続 | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C01,C07` | 採択済みsourceのみ接続し、未選択Web/WEB-OSをrequired dependencyにしない。version_targetは実source contract版を意味しない |

### 旧L3／対のテスト設計からの意味対応

旧BR21のAC-FR-BR21-09は壊れたinvocation_logを個別skipし他sourceを集計する例だが、HARNESS単一dashboardの業務要件である。部分source failureを分離する失敗類型のみ意味上参照し、4 source/5 metric/30秒poll/token dashboardは置換・不採用とする。旧L3/L10に現行LABO横断observationとの直接一致はない。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`:137–145 | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | 7cee661109db34583676144f6acbd6bc1e1342e4492d06e8b0f6009b56aa9e3f |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md`:22–34 | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 5d28764f462e5bb9fa6dd3b8a3557941f53946698da94bed79fb386a3df22b55 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## LABO-011-FR-01 — HELIXLABO-L2-011

### 親revisionとauthority

- L2 parent: `HELIXLABO-L2-011` — [`docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L59); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
  - Source `docs/helix-labo/L2-requirements/labo-requirements.md:163-166`; full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`, raw inclusive-span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`.
- Paired L11 source: `docs/helix-labo/L11-acceptance/labo-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`; lines 60–64 raw SHA-256 `136d16707e53e545e4bc6cc18384d604f971e35d00cb2a9750676cdb34f66563`, lines 109–116 raw SHA-256 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

Aggregate observation fields/source revisionからepisode候補を作り、元observationへのidentity/revision参照と欠測を往復可能な形で保持する。集積単体の成功をcorrelation接続成功と同一視しない。相関は因果の証明ではなく、時刻/pathの近さだけから因果を確定しない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。



**親の依存・版**：`HELIXLABO-L2-001` Aggregate identity/outputを入力前提として、`version_target: 1.0`。

### 受入条件（AC候補）

- **LABO-011-AC-01 — 正常・追跡**：Aggregateで得たobservationをCorrelateへ渡し、episode候補から元source observation・revisionへ往復参照できる。欠測や未対応relationはunknown/unresolvedとして保つ。
- **LABO-011-AC-02 — 異常・境界**：observation identity/source revision欠落または不一致、Aggregate単体成功だけで接続完了を主張、同時刻/同pathだけのeventを因果と断定する場合は不成立。元source recordを保ったままrelation/correlationへ戻す。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・出力：source付きobservationとfield/revisionからepisode candidateへ渡し、episode/元observationを往復参照 | `LABO-011-FR-01 / LABO-011-AC-01` | `L10-LABO-011-C01,C06` | 元source ID/revisionへroundtrip |
| 保証：元source参照と欠測を保持し、Aggregate単体成功を接続成功に読み替えない | `LABO-011-FR-01 / LABO-011-AC-01,AC-02` | `L10-LABO-011-C03,C04,C06` | field/source revision/missingness保持 |
| 否定：relation不一致を黙って補完せず、相関を因果と確定しない | `LABO-011-FR-01 / LABO-011-AC-02` | `L10-LABO-011-C04,C05` | unresolved保持、evidenceなしcausal claim 0 |
| 失敗・戻し先：ID/source revision欠落時は元recordを保ちcorrelationへ戻す | `LABO-011-AC-02` | `L10-LABO-011-C02,C04,C06` | 元record保持、欠落理由と戻し先 |
| 依存・版：L2-001 Aggregate identity/output、version_target 1.0 | `LABO-011-FR-01 / LABO-011-AC-01,AC-02` | `L10-LABO-011-C01,C03` | Aggregate identityを入力参照し、Aggregate単体成功をcorrelation接続成功と混同しない |

### 旧L3／対のテスト設計からの意味対応

対象のAggregate→Correlate source-revision-preserving relationに一致する旧L3/L10は確認できない。調査範囲は旧HARNESS L3 `business-detail.md:137-145`と`functional-requirements.md:22-34`、旧pillar L3 `pillar-functional-requirements.md:134-153,178-190`、旧対test design `L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`。旧BR-21のpartial aggregation failureは他sourceを失わない点だけ類例として扱い、旧dashboard groupingや因果・時間相関ruleは継承しない。現行L2-001/011からsource ref、revision、missingnessを再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`:137–145 | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | 7cee661109db34583676144f6acbd6bc1e1342e4492d06e8b0f6009b56aa9e3f |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md`:22–34 | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 5d28764f462e5bb9fa6dd3b8a3557941f53946698da94bed79fb386a3df22b55 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |

## 未承認事項

各候補の採否は本L3と対のL10を一体として通常のPO L3承認へ渡す。パラメーターごとの承認質問は作らない。親L2の意味・scope・owner・versionに変更が必要だと判明した場合だけL2へ戻す。

## Stage 5 — HELIXLABO-L2-050/059/060/061（部分草稿）

このcheckpointは担当4 identityだけを具体化する。各親のPO判断とL2/L11本文をmain `633bf12`で固定し、後続の候補登録・本文・Stage分類からauthorityを作らない。全対象L2は`docs/helix-labo/L2-requirements/labo-requirements.md`（SHA-256 `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`）、L11は`docs/helix-labo/L11-acceptance/labo-acceptance.md`（SHA-256 `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`）。PO判断記録は`helix-labo-requirements-po-decision-2026-09-28.md`（SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`）と`po-decision-2026-09-29-57candidates.md`（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）である。L2 raw spanは各行の固定値と一致する。

| L3 ID / 親L2 | PO固定registration／decision行 | L2行／raw SHA-256 | L11行／raw SHA-256 | 旧起点と項目別の扱い |
|---|---|---|---|---|
| `FR-LABO-L3-050` / `HELIXLABO-L2-050` | `MPR-RC-HELIXLABO-L2-050-001`, semantic `e41ea805b72f36d34e326b11488f07d2f0a3e030b795442f47370e6869aecbce` / 2026-09-28 decision L92 | 298–303 / `cf8c0d89eed3ce45df65af0f5813f94a2e8bfc0508547c5157f11ac117f3f907` | L11 100 / `2b14174aa263cc1febb95bc17131102c75cf4d8d554741a89031a9a7a7ec0148`; invariant 15 row 125 / `8a17d986dd9c6a60de8ba880e94ca3201a112cb808620cb4adef5579700ef663` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` lines 154–156 raw SHA `9d0257f90826b20a3bb20663eacdc70863c7e093b2ea3bb9095cd6c3b1c39b31`, 237–242 raw SHA `bb865149314ed0458f05af62098c4bb93cc37748be3967acd4d03b321778ffad`; `LEGACY-ASSET-44DD86E3DEC09E65EF51`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` lines 111–113 raw SHA `ebdbb94005d30a24c3e61e3d0b2077c7c13d24f8c7ba5f30ef0fff9994f8c01b`. 修復候補・owner/rollback・再観測・改善候補への還流を意味起点として再導出。旧threshold、runtime、memory/backlog実装は移植しない。 |
| `FR-LABO-L3-059` / `HELIXLABO-L2-059` | `MPR-RC-HELIXLABO-L2-059-002`, semantic `10edd365a96da6d00927fe40ce16f250978f99c3d248c3ad2f7ff5364e59856c` / 2026-09-28 decision L99 | 416–440 / `5ead2e790e1d138c633770851687b0e5f91e9dc15d0c4c525c322ba81fd30e08` | L11 170 / `9e5a9113e596edec50d6a068d769a2d3d3ff9b08938e9dbf6db6cb09e789a433` | `LEGACY-ASSET-28FB139B26CD61CC51EE`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md` SHA `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` lines 96–146 raw SHA `4ba5a4f961c7c36a8893b1964101c280b36cdd3d65f89e31448b28a8c01e8aa1`; `LEGACY-ASSET-A952A3A175EB82A4781B`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md` SHA `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` lines 30–41 raw SHA `5d58b45aedb4b44b6984a1e5bc2fc9c204fd39fec240d75ca7fac423c2c634ba`. task snapshot/protocol/同条件比較・oracleから再計算可能なevidence・重大失敗を平均相殺しない・全費用と価格provenanceの意味を再利用。固定5カテゴリ/12指標/実行構成は持ち込まない。 |
| `FR-LABO-L3-060` / `HELIXLABO-L2-060` | `MPR-RC-HELIXLABO-L2-060-002`, semantic `470bc2c564e2ea6121a7f24645bdb5e9c81f0954d650c1e3e665760ff9c9aca5` / 2026-09-28 decision L100 | 441–456 / `a047f7e535616eb29f5221d81f89a8b319c02910d5cbfde874b0520b0a7c01c5` | L11 178–185 / `50a4e4a914eee9f1f1049b854493e1884c52f77bd7d1394deccf7d7c08116011` | 059と同じBench sourceのR-04/R-05（同一snapshot・protocol・hardware等）を隣接起点にする。Bench L3 lines 96–126 raw SHA `b1e1ad5ce41e266e13b9469c20e87d57d46cf9f7d80773ce2a9c65c96102aae1`、Bench acceptance line 34 raw SHA `212c1056ff2561804fdabad16123c822c8bee9ce51b07cd77ffabfeb4fa09ace`。支援有無だけを変える比較は旧sourceに直接存在しないため現行L2から再導出し、旧runtime/数値を流用しない。 |
| `FR-LABO-L3-061` / `HELIXLABO-L2-061` | `MPR-RC-HELIXLABO-L2-061-001`, semantic `f78b726f14dddee5af773d915b7d97b6d8cdef5ca14cf51034b0d4cd599f6a7f` / 2026-09-29 decision L76 | 457–469 / `9f064d206645f1db6ef946a78ddfd2fe6656c003c4af86ed46c54dab2ee4ad3a` | L11 205–215 / `d7c170e0b047db4a74ef955f1295a5d8fc893cd0ca84aefc72d96b764ed1bb1b` | HELIX-Bench R-04/R-08、AC-005/006/012/013（上記asset）および`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` line 215 raw SHA `930a87db86581b1433c4682bb626b9a83100503594f6447e3c2be2fd6860ec59` (HIL-NFR-35). 15-field snapshot、hidden oracle分離・candidate名blind・再現条件を再利用し、full Bench admission/固定sampleやprovider条件へ拡張しない。 |

### FR-LABO-L3-050 — 内部改善循環

`HELIXLABO-L2-050`はadopted `version_target: 1.0`。Observed→Correlated→Hypothesized→Experimented→Evaluated→Feedback Candidate→OS登録/routing→target owner変更・検証→運用→LABO再観測の各状態と同じticket/experiment/target revisionのsource identityを結び、変更後の効果と退行を評価できる形で返す。実験はOS assignment/Worker result receiptを要し、LABOは割当・変更・実行を行わない。candidate、登録、target変更、CI成功だけで循環完了にせず、旧記録を上書きしない。

- `AC-LABO-L3-050-01`（正常）：同一scopeの全列挙段階を識別し、実験段階ではOS assignmentと実行receiptを同ticket/experiment/対象revisionへ結び、target変更後の再観測と効果/退行結果までtraceする。
- `AC-LABO-L3-050-02`（未完）：assignment、target revision、変更後観測または効果評価のいずれかがmissing/staleなら該当義務だけ未完で残す。登録やCI成功を後段の証拠へ昇格させない。
- `AC-LABO-L3-050-03`（正常対照・境界）：まだ変更を採択していないcandidateはcandidateのまま保ち、旧記録をappend-onlyに残す。別ticketの成功を同じ循環へ結合しない。

### FR-LABO-L3-059 — 効果優先関係付き比較評価

`HELIXLABO-L2-059`はadopted `version_target: 1.0`。scope/revisionに適用可能な品質oracle、優先関係と許容悪化の既決判断を入力として再利用し、runごとに再確認させない。baseline/current/candidate/hybridの実験条件軸とHELIXなし/旧版/新版の支援cohort軸を別fieldにし、主張する比較に必要な群だけを事前選択する。品質不足はcost/time等で相殺せず、適合したrun間だけで既決の順序を用いる。費用はretry、救援、rework、CI/review、人修正も測定scopeに応じて含め、価格source等を保つ。人時間に換算率がなければ別掲して0円化しない。欠測・比較不能は明示し、LABOはpriority決定、配置、実験、ticket、target変更を行わない。

- `AC-LABO-L3-059-01`（正常）：同じtask/scope/oracle/scorer/protocol/hardwareの選択二群を事前に対応付け、各cohortで選択された実験条件だけを比較する。必要品質、適用既決priority/tolerance、全費用、人時間とuncertaintyを分けた結果を返す。適用可能な判断は繰返しrunで再利用する。
- `AC-LABO-L3-059-02`（独立反例）：oracle、snapshot、protocol、hardware、decision scopeのいずれかを個別にずらす。比較可能・効果達成と主張せず、その不一致を理由付きで残す。重大失敗や品質不成立を平均点・安さ・速度で相殺しない。
- `AC-LABO-L3-059-03`（部分比較／unknown）：二者比較に必要な群の証拠がそろい第三の未選択群がない場合、二者の限定結果を返す。適用decisionが未決・失効・scope外またはprice/human-timeの一部が欠測なら結論をunknown/部分評価として示し、欠測を0や万能順位にしない。

### FR-LABO-L3-060 — Worker支援有無の同一設定比較

`HELIXLABO-L2-060`はadopted `version_target: 1.0`。059の品質優先・費用/人介入の比較を再利用する。支援の有無だけを変え、task snapshot、対象revision/scope、Worker/model/provider/version/effort、oracle、toolchain、run protocolを同一に保つ。両群のOS assignment/result receiptを入力し、支援側で選択して実際に使ったsource、別Worker救援、相談、人手修正、retry/reworkを記録する。支援なし群への助言や支援context漏れは比較逸脱とする。LABOは支援を実行・割当しない。

- `AC-LABO-L3-060-01`（正常）：同じWorker/model/version/effortの対runで支援有無のみが異なり、同じ品質oracleで両方のresultが観測できる。許可された支援利用後に元Workerが修正し、元Worker・支援者とは別のidentity/context/authorityを持つreviewerがreviewし、OS-L2-020の同一oracle再実行receiptまで結ばれた正常例を含める。品質gate、accepted outcome、費用、作業時間、人介入、再作業、欠測を群別に返す。
- `AC-LABO-L3-060-02`（独立反例）：片群のassignment/result、oracleまたは設定同一性を一つずつ欠落・変異させ、支援者をindependent reviewerにする場合も試す。比較成立を主張せず不足source/ownerへ返し、片群を成功扱いにしない。支援者reviewを独立検証扱いにしない。
- `AC-LABO-L3-060-03`（unknown正常対照）：支援なし群に追加助言がなく、支援群が未選択の支援sourceを使っていない適格caseは正常。実使用支援のprovenance不明、または支援漏出の疑いがあれば当該pairを比較不能とし、他scopeを停止しない。

### FR-LABO-L3-061 — task・oracle隔離と履歴の完全性

`HELIXLABO-L2-061`はadopted `version_target: 1.0`。選択task評価の15項目（task_id/version、fixture digest、requirement/acceptance IDs、base HEAD、allowed/forbidden paths、hidden oracle digest、seed、toolchain versions、timeout/retry/cache policy、hardware class）をsnapshotに固定し、public worker inputとhidden oracle/judge contextを分離する。snapshot/scorer/protocol/rubric/judgeの版・digest、介入・retry・結果provenanceとhistorical revisionを保存する。hidden oracleを使う評価scopeではblind分離を必須とする。oracleを使わない場合でも通常の独立judge契約は自動解除せず、別契約で独立judge要件が適用外と確認できる根拠がある範囲だけ適用外と記録する。通常のLABO-055履歴全件にhidden taskを拡張しない。漏洩fixtureは合成データに限り、監査記録へsecret/private contextの内容を複写せずsource identityとreasonだけを記録する。

- `AC-LABO-L3-061-01`（正常）：選択評価の15 fields、snapshot/scorer/protocol/rubric/judge identityとdigestが整合し、workerはpublic inputだけを受領しhidden oracleへ到達できない。judgeは固定oracleを使い、authorとは別のidentity/session/contextで評価し、receiptは実際のrole/context分離を示す。historical結果は当時のscope/model/runtime evidenceとして読める。
- `AC-LABO-L3-061-02`（独立反例）：15 fieldの単独欠落、digest/version driftに加え、hidden answer、future answer、合成secret、合成PII、private review contextの各漏出を個別に変異する。さらにauthorのjudge兼任、identity名札だけ変更してcontextを共有、task snapshotとoracle digestの不一致、fixture/protocol/scorer version driftを別々に試す。該当比較だけを隔離し、重大leakage/scope/security failureを平均点で相殺しない。正当なjudge oracle accessはWorkerへの漏出と誤判定しない。
- `AC-LABO-L3-061-03`（条件付き正常・未見）：hidden oracleを使わないscopeでは、別契約の独立judge要件が適用外であることを示す根拠がある場合だけblind要件を適用外と記録する。hidden oracle非選択だけでは通常の独立judge契約を解除しない。新task/scopeの適用性がunknownならownerへ戻して未評価とし、未見attachment由来のanswer leakは漏出、worker可視範囲不明は未検証として隔離する。historical resultをcurrent性能へ流用しない。

## Stage 4 — HELIXLABO-L2-036/037/038/039/040/041/052/054（部分草稿）

本節は固定済みの親候補を具体化する。PRやこの文書の記述から新たな要求採択・実装許可は生じない。各親の版は親L2とPO判断記録の適用条件に従う。L3承認前であり、後続版・Web対象を1.0へ含めない。

### 固定親と旧起点の出所

全8件のL2親はPO判断基準 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `docs/helix-labo/L2-requirements/labo-requirements.md`（SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`）から採り、対応L11は同commitの `docs/helix-labo/L11-acceptance/labo-acceptance.md`（SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`）から採る。PO判断記録 `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md`（SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`）の行84–94は8 identityのregistration IDと対象版／条件を固定する。各L2 raw span、L11 span、register行SHAは下表に示す。registerは候補のidentity/digest照合に用い、承認の根拠は該当するPO判断行である。

| 親L2 | L2行／raw SHA-256 | registration ID／register行SHA-256／semantic digest | PO行 | L11行／raw SHA-256 | 版・scope |
|---|---|---|---:|---|---|
| `HELIXLABO-L2-036` | 263–266 / `c450a34b71da74caa7581aa24ee0b5643fecfaf7bb4fed433d6dc72825616549` | `MPR-RC-HELIXLABO-L2-036-001` / `2ac618d1d18e82817953ecc402aca84771347da7d3fd994487d58397b3a27ed3` / `c39cf807fbf13b0af8089cf1bfbdf30f23dd9c8c2df0385ced7cc786827e4632` | 84 | 87 / `1bc14c3da94b1369e519c047b10802021587ccabea2020cb07a983ed234aa376` | `1.0`, HARNESS向けfeedback candidate |
| `HELIXLABO-L2-037` | 267–270 / `09ac5ca3849fd18206ddeb80167af78bafa675d225d3f2d355bdf75495cf3a0d` | `MPR-RC-HELIXLABO-L2-037-001` / `af993041c2427a7114408b556a5ee21d0226092d0d15a55557451b4d29c2ea23` / `dc0518a71c488c47e5667a7a42ec6690b0a25a4cd576ffb9e16c80505f21375f` | 85 | 88 / `2ed1c2fdc810d0821abd8490675a7e25e08f92f46638d11d469718d44a267860` | `1.0`, OS向けfeedback candidate |
| `HELIXLABO-L2-038` | 271–274 / `6dd9869f768924aa8ce2eebbf16f00ea63ba08531ad14a6ee8e266c02ca3a72a` | `MPR-RC-HELIXLABO-L2-038-001` / `87f52dd5bdc3ef425add5db146a364b245ebd65051969fb442c72023866c0fcb` / `0b136320b842e354a9051bef54a0af4a9ba3a56dc72b0087568457ca9a464750` | 86 | 89 / `2c76492ed68ece437b415b17a5dd3500c5ab681e91ca70c5b4c330d64be01f3d` | `1.0`, SECURITY向けfeedback candidate |
| `HELIXLABO-L2-039` | 275–278 / `93a93e36996492e5078bd3e36a508911004c41d121a62bf8b26654b83d29815f` | `MPR-RC-HELIXLABO-L2-039-001` / `fb12911b4cc496b033a25f760fdcc0c499560bb2306f7d7f8c105a65b3315c73` / `c151457d618aa1a32cd5369b2144396e24643ed13a487f520188a47627e95183` | 87 | 90 / `a5d0ca93e9098fa5a4a4c99d2b04ef1b4e800a9eba48894fea899fe99c717dfe` | `1.0`, Worker結果をOS/SECURITY routing経由で扱う |
| `HELIXLABO-L2-040` | 279–282 / `345242b4cb93912809c4ca080f087cd1779a05450c8a6d0df0bf1e46ba1cde32` | `MPR-RC-HELIXLABO-L2-040-001` / `84fdf1fc4f4721eb4aef4d937c7f1f5ca70b9db871ce3ec574158d3a6229c326` / `2beb40acf8391b6cbc263c21e20c015b1cbe8abddc5e9504f8243d3f064593d6` | 88 | 91 / `cfc41e09fecdb075d4107f06296911ec2d6c3dfda9e78d864af58bfa6a14b614` | 接続対象の上流採択scopeに限定 |
| `HELIXLABO-L2-041` | 283–286 / `c04d0a5053ce53a42a9b4960cff938130b85bda38b08a3036455ad4bdccbafb0` | `MPR-RC-HELIXLABO-L2-041-001` / `30c6818bdfe8ec5f61d5bbf28e667cb424956a6ead45602c1dcd83216bdf704a` / `74b141f510ecfed2a47f3083275cc4c89697f4b930021341a1aa11af22d2a5cf` | 89 | 92 / `093fd0e824f98a716abb04e4c2c7fc72eb33d6c5f962164647eabd476b558fd4` | 各製品の採択scopeに限定 |
| `HELIXLABO-L2-054` | 290–295 / `ed36ee1f061bb4f70ce6c590c019d5eae594c08ca19de6d3f719e99026018373` | `MPR-RC-HELIXLABO-L2-054-001` / `e5b270919adbcc3baf237f0b3ff5aa89a37fe1c1bdfc16c80b9ba1435166ee09` / `6afd3f3b015ff2064e35a2dc2840da101ea06cf40d2f255ff49bfaeb51dabc4c` | 91 | 94 / `325bf15f1535899d2d63c5ce09bb35afe99dcbc9596f0f2e1e5fce195a2dbf74` | `1.0`, 055の水準をINTELLIGENCEへ接続 |
| `HELIXLABO-L2-052` | 310–315 / `5f699714785fe30793a121c50082b86a1569622c9e6b0ce8a633d011055fde69` | `MPR-RC-HELIXLABO-L2-052-001` / `b40e79ef73c618795b7d0c2730870d3f988c2fbce0bb5a7d2b90ad6a66158146` / `4c785ecb6f8f402ebb96c9f1e9452aea184b387c23dc6fc52425541d5a19f917` | 94 | 102 / `5d7d649878da8b308e11b0fd9da626404c460e285ab4b59c8acfecd6c4bb8f3b` | `1.0`, 035 payloadによる評価材料のみ |

旧L3／対テスト設計の出所と扱いはidentityごとに区別する。旧資産台帳上の状態はいずれもhistorical/unresolvedであり、現行authorityとして継承しない。

| 親 | 旧L3／test起点（asset ID、path、行、full SHA-256） | 旧記述からの扱い |
|---|---|---|
| 036 | `LEGACY-ASSET-02D897E62EF2FA267267`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` 143–160, SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`; `LEGACY-ASSET-0B5B38F146D9538C9A36`, paired `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md` 31–42, SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | 既存workflowへの候補routingとauthority非書込を隣接起点として再利用。V-model/verification/release運用問題という現L2固有入力・HARNESS接続は再導出。旧route名、workflow実行、completionは置換。 |
| 037 | 同上 | typed routeとauthority非書込の一般failure類型だけ再利用。ticket/WIP/assignment/priority/CI profile等OS運転evidence、OSへの戻し先は現L2から再導出。LABOにticket発行やOS state更新を持たせない。 |
| 038 | 同上 | authority変更を候補生成だけで行わないfailure類型を再利用。現行SECURITYの認可・隔離・credential・情報保護scope、restricted-data遮断、SECURITYへ戻す境界を再導出。 |
| 039 | 同上 | target routingと候補状態を分離する隣接例だけ再利用。許可済みWorker実行/停止/復旧結果とOS/SECURITY経由の連携を再導出。Worker assignment/executionは旧routeから継承せずLABO外に置く。 |
| 040 | 同上 | evidence revision・候補route・authority非書込を類例として再利用。connection identity、retry、contract version、trace、CONNECT ownerへの不一致返却を現L2から再導出。旧connector仕様は移さない。 |
| 041 | 同上 | affected owner/scopeへの候補routingを類例として再利用。対象Product Core・製品版と個別connectorを現L2から再導出し、product meaningを保持する。旧product名や単一の横断routeは置換。 |
| 054 | `LEGACY-ASSET-28FB139B26CD61CC51EE`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md` 19–36, 96–169, SHA `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`; `LEGACY-ASSET-A952A3A175EB82A4781B`, paired `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md` 28–41, SHA `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | 055のBench評価とworker-admission benchmarkを別責務にするAC-014の考えだけ類例として再利用。現親は055の水準・根拠・範囲・未評価状態をそのままINTELLIGENCEへ接続するだけ。旧12指標、5カテゴリ、scoring、admission、runtime、旧数値は置換し継承しない。 |
| 052 | `LEGACY-ASSET-02D897E62EF2FA267267`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` 143–160, SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`; `LEGACY-ASSET-0B5B38F146D9538C9A36`, paired `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md` 31–42, SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | 旧backflow/receipt/authority境界は隣接起点。評価済みsource revisionからINTELLIGENCE受領までの同一revision・scope・未評価状態の閉包は現L2-035/052から再導出。旧Universal Improvement state machineやterminal outcomeを適用しない。 |

旧L3 requirementとtest designのSHA/lineはarchive中の固定sourceを示す。旧test/runtimeは実行せず、旧oracleを現行合否根拠にしていない。現在のL2/L11固定条件を各itemの最終根拠とする。

旧sourceのraw inclusive-span SHA-256（各行の原改行を含む）: `LEGACY-ASSET-02D897E62EF2FA267267` 143–160=`c968096594bfd6ae95d82a37c2d0ad914ba8299746a38bbb20b0ecba168c2f6b`; `LEGACY-ASSET-0B5B38F146D9538C9A36` 31–42=`80adc31e42723500dffed7ef494d0529a3fbef2ffce51a2b5b8c40e78522e8f2`（036/037/038/039/040/041/052の共通隣接起点）; `LEGACY-ASSET-28FB139B26CD61CC51EE` 19–36=`0dec8b52e8c24136d6fbde9780e6e41c354d7147465f04da94c1046fb4a054b0`, 96–169=`1784f920ed3295fbaf5b6ed5652b07c8695182b051b08fc23340d1d298085ce4`; `LEGACY-ASSET-A952A3A175EB82A4781B` 28–41=`e304c3c36a59b2b3ef28f15d2912056fc3874cc211e0ed61d6b385d1fa0deaa7`（054の対設計）。

### 機能要件と受入条件（候補）

#### LABO-036-FR-01 — HARNESS向け工程feedback candidate

対象revisionとHARNESS connectorを伴う許可evidenceから、V-model、要求形成、design obligation、verification contract、backflow、境界調整、refactor、release criteria、ops-maintenanceに関するscope付きcandidateをHARNESSへ返す。要求・contractのcanonical内容は変更せず、実験結果は即時反映ではなく検討材料として残す。`LABO-036-AC-01`は有効なtarget revisionとconnector、根拠evidenceがそろう正常入力でcandidateとsource参照を保持する。`LABO-036-AC-02`はtarget不明、stale connector、または要求意味を直接書き換える変異で該当candidateをholdし、対象ownerへ戻す。意見の相違や候補自体の提示は許容し、候補提示を採択・変更と扱わない。

#### LABO-037-FR-01 — OS運転問題の提案

ticket、WIP、worker placement、priority、CI profile、inspection/integration、release promotion、retry/recovery、cost/order/stateの運転evidenceをOS target identityに結び、OS向けcandidateにする。ticket登録、routing、優先度、実行、state更新はOSに残る。`LABO-037-AC-01`は正常なOS target/connectorを伴う許可evidenceの各source/revisionと問題scopeを保持する。`LABO-037-AC-02`はticket発行・assignment・priority/stateの直接変更、OS routingを飛ばす変異を不成立としてOSへ返す。source evidenceにfailureがないfixtureではfailureを作らず正常提案を保持する。

#### LABO-038-FR-01 — SECURITY向けauthority/data handling candidate

認可、隔離、credential利用、情報保護に関する許可されたevidenceを、SECURITY data-handling/target contractとscope付きcandidateとして接続する。restricted dataは通常evidence packetへ流さず、LABOは実際のpermission/authorityを変更しない。`LABO-038-AC-01`はcredentialを含まない許可要約、source revision、SECURITY target/contractを保ったcandidateを確認する。`LABO-038-AC-02`はLABOによる直接の権限変更を不成立とし、変更案の提示自体はsanitizedな差分candidateとしてSECURITYの判断材料へ返す。restricted/raw credential混入、target/scope不明はholdし、SECURITYへ戻す。許可要約にrestricted fieldが存在しない正常fixtureは拒否理由にしない。

#### LABO-039-FR-01 — Worker結果に関するtarget-routed candidate

許可されたWorker execution/stop/recovery resultをWorker identity・result revisionに結び、OS/SECURITYのtarget routingを経由するcandidateとして保持する。LABOはWorker割当や実行を変更しない。`LABO-039-AC-01`は実行結果とOS/SECURITY routing identityが揃う場合に限りtarget-specific candidateを生成し、source resultへ遡れる。`LABO-039-AC-02`はWorkerへの直接割当・実行指示、routing欠落、結果identity不一致をholdしOS/SECURITYへ戻す。未選択Worker/sourceを毎回要求せず、fixtureで対象scopeに含めた許可sourceだけを検証し、入力にないWorker resultを推測で追加しない。

#### LABO-040-FR-01 — CONNECT接続単位feedback

内外connectionに関するevidenceを、connection identity、対象connector contract version、retry/traceへ結び、CONNECT向けcandidateとして返す。対象版はその接続について採択された上流scopeに従う。`LABO-040-AC-01`は有効なconnection identity/version/traceと明示scopeに対応するfeedbackを保持する。`LABO-040-AC-02`はversion mismatch、trace欠落、接続identity混同をそれぞれ不成立としてCONNECTへ戻し、connector contractをLABOから直接変更しない。未選択connectionを存在すると推測しない。

#### LABO-041-FR-01 — Product Core別feedback

製品固有meaning、要求、設計、domain、UXに関するcandidateを、target Product Core identity、版、専用connectorへ結び、製品正本側へ返す。製品固有意味をBRAINの汎用知識へ変換しない。`LABO-041-AC-01`は選択したProduct Coreのtarget/版/connectorとevidenceを保つ。`LABO-041-AC-02`はtarget不明、版/connector不一致、product meaningを汎用化する変異をholdし当該product ownerへ戻す。複数製品が未選択なら全製品の接続を要求しない。

#### LABO-054-FR-01 — HELIX-Bench水準接続

L2-055が生成したtask type/model class別のlevel、basis、applicability/evaluation scope、unassessed状態を同一identity・版・scopeでINTELLIGENCEへ渡し、INTELLIGENCE受領からLABO sourceまで追跡できるようにする。055が水準を生成し、配置案はINTELLIGENCE、指定・割当てはOSが担う。`LABO-054-AC-01`は同じ水準payloadとINTELLIGENCE receiptをscopeを変えずに結ぶ。`LABO-054-AC-02`はpayload/receiptのtask class、model class、scope、根拠、未評価状態の個別不一致、未知jobへの過去水準外挿、LABOによる割当・authority変更をそれぞれ不成立にする。未評価jobはunassessedのまま受け渡せる。

#### LABO-052-FR-01 — INTELLIGENCE評価材料循環

L2-035で定義されたpayloadを重複定義せず、評価済みsource revisionからINTELLIGENCE受領まで同じrevision、scope、unassessed markerを追跡する。出力receiptは035 payload、source identity、scopeを指す。`LABO-052-AC-01`は対象材料のsource provenanceと受領receiptの完全一致を確認する。`LABO-052-AC-02`はrevision/scope/payload contract/receipt identityの個別不一致・missingを保留し、source/evidenceまたはLABO再評価へ戻す。評価材料の受け渡しはmodel change/training許可ではなく、INTELLIGENCEのcurrent judgment、prediction、placement案、bot operationをLABOは行わない。

### 親別L2/L11句・旧項目分類とL10対応

旧L3項目の扱いは上記8行のとおりで、旧UIL由来のbackflow/routeという隣接役割だけを再利用し、各target専用入力・出力・owner・版を現行L2/L11から再導出する。HELIX-Benchの旧scoring値やworker-admissionは054へ移さない。各caseは `../L10-verification/functional-verification.md` の同じ親ID節にある。下表は固定親の可観測条件と個別owner-returnをまとめ、各AC番号と対応caseを結ぶ。

| 親 | 固定親句／意味 | L3要件・AC | 対応L10 case | 再利用／再導出／置換の区別 |
|---|---|---|---|---|
| 036 | V-model等の問題evidence→HARNESS scope付きcandidate、要求/contractは書換えず、即時変更しない | `LABO-036-FR-01`; AC-01/02 | `L10-LABO-036-C01..C04` | UIL route/authority failure類型を再利用、target/evidence/接続は再導出、旧workflowを置換 |
| 037 | OS運転field→OS candidate、ticket/routing/実行/stateはOS owner | `LABO-037-FR-01`; AC-01/02 | `L10-LABO-037-C01..C04` | owner route類型を再利用、OS field/identityを再導出、旧runtime操作を置換 |
| 038 | authority/隔離/credential/情報保護→SECURITY、権限変更なし、restricted dataを通常packetへ流さない | `LABO-038-FR-01`; AC-01/02 | `L10-LABO-038-C01..C04` | authority非書込の類型を再利用、現在のdata/permission boundaryを再導出、旧secret handlingを置換 |
| 039 | Worker実行等の許可結果→OS/SECURITY target routing、assignmentはLABO外 | `LABO-039-FR-01`; AC-01/02 | `L10-LABO-039-C01..C04` | routing失敗類型を再利用、現Worker result identity/routingを再導出、旧Worker assignment/operationを置換 |
| 040 | connection/retry/version/trace→CONNECT、connector contractは変更せず mismatchを返す | `LABO-040-FR-01`; AC-01/02 | `L10-LABO-040-C01..C04` | source version/trace類型を再利用、接続単位境界を再導出、旧connector/runtime規則を置換 |
| 041 | product meaning/requirements/design/domain/UX→該当Product Core、BRAINへ汎用化しない | `LABO-041-FR-01`; AC-01/02 | `L10-LABO-041-C01..C04` | affected owner routing類型を再利用、target product/版を再導出、旧product構成を置換 |
| 054 | 055水準/basis/scope/unassessedを同一scopeでINTELLIGENCEへ、INTELLIGENCE案とOS assignmentを分離 | `LABO-054-FR-01`; AC-01/02 | `L10-LABO-054-C01..C04` | 旧worker-admissionとの責務分離だけ再利用、055 payload接続を再導出、旧bench metrics/admissionを置換 |
| 052 | 035 payload、sourceからINTELLIGENCE receiptまで同じrevision/scope/unassessed、035 schema重複なし | `LABO-052-FR-01`; AC-01/02 | `L10-LABO-052-C01..C04` | feedback handoff/authority類型を再利用、035/052閉包を再導出、旧universal state-machineを置換 |

### 候補技術値と測定根拠

本範囲で性能時間・容量の合否閾値は親に指定されず、接続機能の成否にも不要なため固定しない。必要な測定候補は、各親が要求する必須identity/version/scope/provenance/receipt fieldの一致率 `100%`、不一致や不明のsuccess昇格 `0` とする。根拠は「same scope/version/receipt」「不一致を隠さない」という親条件であり、比較案の99%許容は少なくとも1件の取り違えを合格させるため不適切。fixtureは必須fieldを一つずつ欠落・改変し、併発変異も加え、正常な完全packet、正常な未選択source、sourceに問題のない通常caseを対照にする。実標本数・反復数やlatencyを任意で固定せず、後続測定で必要性が判明した場合だけ、比較案・根拠・測定計画付き候補として本L3/L10対に示す。parameter単独のPO質問は作らない。


## LABO-055-FR-01 — HELIXLABO-L2-055 HELIX-Bench 作業水準生成

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXLABO-L2-055-002` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 451, row SHA `7e7d4868c33fd35b35741cae55d295e7ed6f1ad42df23cef5e10b4c718b1af88`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 58, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 150–155行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `f6c97eeef48634ec11fc36f849763a35da358f5ce89490f6c785c9f67b4575c7`、heading「### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）」
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 191–197行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c`、heading「### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠」

### 要件（候補）

依存は許可されたLABO observation (L2-001/028)、Worker historyのtask type/model class identityと評価可能な実績（必要に応じL2-006）で、`version_target: 1.0`とする。許可されたWorker historyをtask class / model class / declared scopeごとに評価し、評価した出力にはeligible denominator、算入結果、欠測/失敗/拒否/停止/unknownの処置と算入・除外理由、metric/scorer-oracle revisionを結ぶ。定性的水準も適用条件・根拠・未評価部分を記録する。評価していないclassを未評価と表示し、結果確認後にdenominator/scopeを変えない。Benchは配置案、Worker/modelの選定・指定・割当て、authorityを作らない。

### 受入条件（AC候補）

- **LABO-055-AC-01 — 正常・追跡**：同一の許可snapshotとdeclared task/model class/scopeから評価結果を再構成できるよう、eligible denominator、各resultのdisposition、metric/scorer revisionと判定理由が揃う。qualitative outcomeでも根拠とunassessed subsetが追跡可能。
- **LABO-055-AC-02 — 異常・境界**：failure/missing/unknownを理由なく分母から落とす、欠測費用を0扱いする、result確認後に母数・scopeを変える、根拠/採点版なしに水準を出す、major failuresを平均で相殺する、未評価を評価済みにする場合は不成立。scoreで配置/割当/権限を生成しない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力: Worker history/task type/model class/evaluation result/source revision/scope | `LABO-055-FR-01 / LABO-055-AC-01` | `L10-LABO-055-C01,C03` | eligible record setとsource identity/revision |
| 提供: task/model class別level、basis、period/applicability、evaluated/unassessed | `LABO-055-FR-01 / LABO-055-AC-01` | `L10-LABO-055-C01,C04` | outputと適用scope/basis |
| 定量/定性根拠: denominator、included result、missing/failure disposition/reason、scorer/oracle revision | `LABO-055-FR-01 / LABO-055-AC-01,AC-02` | `L10-LABO-055-C01,C02,C04` | source receiptから出力再構成 |
| 否定: omission/zero cost/post-hoc denominator/major failure average compensation | `LABO-055-FR-01 / LABO-055-AC-02` | `L10-LABO-055-C02` | disposition保持と水準非成立 |
| 範囲・戻し先: unknown/unassessedを維持し履歴sourceへ戻す; placement/assignment/authorityはLABO外 | `LABO-055-FR-01 / LABO-055-AC-02` | `L10-LABO-055-C03,C04` | 未評価明示・owner分離 |
| 依存・版: L2-001/028と評価可能なhistory source; version_target 1.0; accepted L2 scope only | `LABO-055-FR-01 / LABO-055-AC-01,AC-02` | `L10-LABO-055-C01,C04` | 将来数値規則/旧score protocolを移さない |

### 旧L3／対のtest designからの意味対応

旧`helix-bench-evaluation`から評価根拠・対象scope・failureを分けて記録する考えだけを再導出する。旧5 category／12 metrics、反復数、score protocol／weightsは移さない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-28FB139B26CD61CC51EE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md` 21-34, 37-148 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | 21–34行 SHA `e819394856de959eab1c952660e87c57f37f88f341c901db1dbd3df8cbd99f0c`、37–148行 SHA `643558f22760925dc85032d98c93eca1b96aa2b428466194cd120c603073de62` |
| 旧test design `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md` 19-43 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | 19–43行 SHA `b4c77226040fb25106d983d81642f7bd1a12778399b79f86cceae0a1ee819c40` |


## LABO-056-FR-01 — HELIXLABO-L2-056 初回Worker結果のBench観測取込

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXLABO-L2-056-003` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 452, row SHA `90466597333d23a63fd5e33a28f2f8b18dac5ed2053c93908a14838dcf5d0d03`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 96, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 379–390行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d8d9c30b52c338580f535a913a4b04d67f0d3d59d79eb2645ed33c911b1621c7`、heading「### HELIXLABO-L2-056 — 初回Worker結果のBench観測取込（単体候補、1.0）」
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 138–147行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed`、heading「### HELIXLABO-L2-056 初回Worker結果のBench観測取込」

### 要件（候補）

許可されたfirst Worker resultをticket/assignment/attempt, task/Worker/contract revision, request revision/scope, result state, verification/human-confirmation, data-use class, source receiptへ結び、Bench履歴に観測済みとして追加する。success/failure/rejected/interrupted/unknownを区別しsource authorityを変更しない。観測済みと評価済みを分け、評価済みを出す場合は採用oracle/基準revision・適用範囲・判定条件・比較条件・結果・失敗/反例/unknown・評価者・時点および判定receiptが揃う範囲に限る。

### 受入条件（AC候補）

- **LABO-056-AC-01 — 正常・追跡**：許可範囲の各結果statusをsource provenanceとともにobservationへ記録し、評価可能なoracleがない初回一件は観測済み・未評価のまま保持する。評価済みを付す場合はL2所定の根拠と評価receiptが全て辿れる。対象scopeに適用可能な評価oracle/基準revision・判定条件・比較条件・結果・failure/反例/unknown・評価者・時点・receiptが揃う正常caseでは、その範囲の評価済みを記録できる。
- **LABO-056-AC-02 — 異常・境界**：assignment/source/scope/classification/revision/verification/receiptの欠落、不一致、stale、重複、矛盾を暗黙補完/統合しない。single successやreceipt successだけでunknown taskを成功/qualified/evaluatedにしない。source canonical stateやassignment/worker eligibilityを書き換えない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力: OS assignment/ticket/task, Worker/execution contract revision, requested revision/scope, attempt status, evidence/classification/receipt | `LABO-056-FR-01 / LABO-056-AC-01` | `L10-LABO-056-C01,C02,C03` | 列挙入力field・source receipt |
| 提供: 初回resultをobservation historyへ追加; observation≠performance evaluation | `LABO-056-FR-01 / LABO-056-AC-01,AC-02` | `L10-LABO-056-C01,C02` | 観測状態と評価状態の分離 |
| 保証: oracle/scope/revision/conditions/result/failure/unknown/evaluator/time/receiptに基づく範囲のみ評価済み。必要証跡が揃う正常評価も許容 | `LABO-056-FR-01 / LABO-056-AC-01` | `L10-LABO-056-C04,C05` | 未充足証跡は未評価を維持し、充足時は範囲限定の評価済みreceiptを再構成 |
| 否定・戻し先: stale/duplicate/contradictory/missing evidence; OS/SECURITY/Workerまたは未評価維持 | `LABO-056-FR-01 / LABO-056-AC-02` | `L10-LABO-056-C03,C04` | 元記録維持・正しいowner返却 |
| 範囲: 1.0 unit candidate、既存001/028/055とOS assignment、SECURITY data-use; 054は別edge | `LABO-056-FR-01 / LABO-056-AC-01,AC-02` | `L10-LABO-056-C01,C03` | 親の既存責任を重複しない |

### 旧L3／対のtest designからの意味対応

旧Bench評価のprovenance/evidenceとfailure classのみ再導出。score categories/sample count/weights/executorを持ち込まない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-28FB139B26CD61CC51EE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md` 21-34, 37-148 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | 21–34行 SHA `e819394856de959eab1c952660e87c57f37f88f341c901db1dbd3df8cbd99f0c`、37–148行 SHA `643558f22760925dc85032d98c93eca1b96aa2b428466194cd120c603073de62` |
| 旧test design `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md` 19-43 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | 19–43行 SHA `b4c77226040fb25106d983d81642f7bd1a12778399b79f86cceae0a1ee819c40` |


## LABO-057-FR-01 — HELIXLABO-L2-057 初回実行結果のBench受領接続

### 親revisionとauthority

- 採択登録: `MPR-RC-HELIXLABO-L2-057-002` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 347, row SHA `fccb53bbca7f001259db848bc491deeb0f0b5cb5e5906e9bb13dcaa4b0a83e17`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 97, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 391–402行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d5a62f8588867f80e17e1931f7570c72c89f28eedfd30a5aa9a368fbaba8004d`、heading「### HELIXLABO-L2-057 — 初回実行結果のBench受領接続（接続候補、1.0）」
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 148–155行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `ac433c56cece7fae90458ab3e3edf556425b90af8c1917ec60a1c61479bb3b60`、heading「### HELIXLABO-L2-057 初回実行結果のBench受領接続」

### 要件（候補）

OSが受領したexact ticket/task/assignment/attempt、要求/Worker/契約revision、scope、result state、verification/human-confirmation receipt、data-use classを同一identityのままLABO-L2-028へ接続し、LABO-056/055が履歴化・評価できるdelivery receiptを返す。採択済みCONNECT契約または親が認める明示的な人手receiptのどちらかでschema/revision/scope、acknowledgement、trace、重複抑止、stale停止、同一ID再送/未完保持を示す。HELIXOS-L2-027は任意provenance参照でdependencyにしない。接続は受領だけで、authority/result/evaluation/assignmentを生成・修正しない。

### 受入条件（AC候補）

- **LABO-057-AC-01 — 正常・追跡**：同一OS source identityのpayloadとLABO acceptance receiptがscope、state、revision、verification/data-use fieldsで一致し、accepted CONNECT契約または明示的な人手receiptの一方が必要な受渡し義務を証明する。受領は観測履歴の入力になり、evaluation/assignmentを作らない。
- **LABO-057-AC-02 — 異常・境界**：ack/receipt不在、schema/version/scope mismatch、stale payload、duplicate retryを成功・新規実績として扱わない。受信側はresult stateやsource authorityを書き換えない。CONNECT contractがなく人手receiptもない場合は未受領/unknownのままOSへ返す。OS-027を必須dependencyにしない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・出力: OS accepted result/ticket/assignment/attempt→LABO-028 receipt | `LABO-057-FR-01 / LABO-057-AC-01` | `L10-LABO-057-C01,C02` | same source identity and result state |
| 保証: revision/scope/verification/human confirmation/data-use classを保持しack/traceを返す | `LABO-057-FR-01 / LABO-057-AC-01` | `L10-LABO-057-C01,C02` | 送受信一致・明示receipt |
| 重複/stale: same-ID retry deduplicated; stale stops; missing receipt stays unreceived | `LABO-057-FR-01 / LABO-057-AC-02` | `L10-LABO-057-C03,C04,C05` | 重複、新規record化0、stale insertion0 |
| 責務: OS authority/resultを改変せずLABO observation/evaluation/assignmentを生成しない | `LABO-057-FR-01 / LABO-057-AC-02` | `L10-LABO-057-C01,C05` | owner別state |
| 依存/版: OS-018/019/023, LABO-001/028/056, SECURITY data-use; OS-027 optional provenance only | `LABO-057-FR-01 / LABO-057-AC-01,AC-02` | `L10-LABO-057-C01,C02,C05` | 027をrequired edgeにしない |

### 旧L3／対のtest designからの意味対応

旧LABO receipt contract direct matchなし。L3-pillar acceptance designからFR/AC↔oracle trace形式とnegative/boundary caseの構成のみ部分参照。旧L12/HAT/CLIや新たなconnectorは作らない。

| 起点 | 旧asset source・行 | 全文SHA-256 | 該当raw span SHA-256 (LF保持) |
|---|---|---|---|
| 旧L3 `LEGACY-ASSET-28FB139B26CD61CC51EE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md` 21-34, 37-148 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | 21–34行 SHA `e819394856de959eab1c952660e87c57f37f88f341c901db1dbd3df8cbd99f0c`、37–148行 SHA `643558f22760925dc85032d98c93eca1b96aa2b428466194cd120c603073de62` |
| 旧test design `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 32-90, 91-216 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 32–90行 SHA `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228`、91–216行 SHA `066ad9e1de61935f6a5c5a939a5e78a4348f29431a9737f187edb991b71d82e4` |


## Stage 2b 基本エンジン（部分草稿・未承認）

この追補は固定親 `HELIXLABO-L2-002`〜`HELIXLABO-L2-010` の9 identityだけを具体化する。Stage 2bの残り22 identityは後続追補とする。POの決定basisは `633bf12`、親revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。以下の旧文書は現行要件のauthorityではなく、旧L3定義・旧L3/test-designの項目別再利用／再導出／置換の起点である。

| 親L2 | PO登録／決定／semantic digest | 固定L2 source full SHA-256 | inclusive raw span SHA-256 |
|---|---|---|---|
| `HELIXLABO-L2-002` | `MPR-RC-HELIXLABO-L2-002-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L49 | `sha256:145d4ce09a5534cb92e2635d6615563648203f98b4e33eaeb69882d06aabc141`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L77–84: `d4ecde864ac4129741f32ac65d0075d1d0704cc7166b86491bbae6ef8865bf28` |
| `HELIXLABO-L2-003` | `MPR-RC-HELIXLABO-L2-003-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L50 | `sha256:a3ccf853b438c3efb2edf13a75bf655ac80c9f9624be92b9d81a2c3f4e114921`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L85–92: `5a5472b632726e3b6069e251024c59dbb4c076889bf48771d4cd306907922901` |
| `HELIXLABO-L2-004` | `MPR-RC-HELIXLABO-L2-004-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L51 | `sha256:f49fe650080acaf4036c482b5e9b588e3f9cd1cbfc8674612ba984d4a1d6176c`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L93–100: `6f1751ca2ca2dddd1e1065a68421d63e3c18ce656786c9c1fe318b1a4e458889` |
| `HELIXLABO-L2-005` | `MPR-RC-HELIXLABO-L2-005-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L52 | `sha256:38f70e844ce832dfc9b39e91c537f9c8ba913095cf2140bdf7cc631a2dafc922`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L101–108: `3b7f37f57a9db5df451275962aa0a90f951cf61e23496828cb9a078f52bc36ee` |
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L53 | `sha256:70efe5dee64cbfddf73ddcf4b553038f2b51a4a2bfd9b6113dca338164b2476d`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L109–116: `2d5aa6810c6a2a21c532e7f2a96ec39fdef9b8e6040b476b23187f3be0bd02ce` |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L54 | `sha256:acf5320cccc03496897ab3f6bee06adc9195436cc8673fc0d360a751e2194fb9`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L117–124: `89aa2011a64af3475f1bf23f6e52d2622535c96b374bebbc6926c5bab280c84e` |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L55 | `sha256:a219e81f5975e845f9db4ec85774dedd9955857a14949ddc3b263c683c4fd867`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L125–132: `08da4c2fb64ede944ace1e21fe8f165a161fe981e902458a8263602040d581ce` |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L56 | `sha256:448afdff95e00eabe1089657c5424d010f4de9369c3f1f095a993a715a98a0aa`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L133–140: `de30f29aef8d0d1af93e32843fadd823afc398352d9017fe24dfc84a2f7bd025` |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L57 | `sha256:b5df4ddf97563451cfb408cc04d7069a1b953c4596fe539850981e225c22f36a`; file `docs/helix-labo/L2-requirements/labo-requirements.md` full `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | L141–149: `6ffc430c2762f509b39c2baab152115de82834be0cf168575470ed3832f9294e` |

共通L11 acceptance basis: `docs/helix-labo/L11-acceptance/labo-acceptance.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`。L11 lines 43–47 span SHA `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b` と lines 109–116 span SHA `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d` を対の共通受入境界として読む。

旧RCLS要件本文22行は `L3-PO-1384-001` をPLAN-L3-80の候補承認として記録し、承認対象の候補本文とBR 6/FR 6/AC 20、およびcanonical昇格・IR admission・runtime実装を別工程としている（旧sourceの承認文言と `docs/governance/audits/requirements-stage/legacy-candidate4755-explanation-normative-complement-ranks-2341-2380-2026-10-02.md` のRCLS判断履歴を参照）。したがって本書では旧RCLS候補を「未採択」とは扱わない。この旧候補承認はその時点の候補revisionに限られ、現行LABO L2/L11や本草稿へauthorityを移さない。旧項目は類例を読み、保持点を示したうえで固定L2から再導出する。

旧資産の共通pin: 旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md` (asset `LEGACY-ASSET-F542125805B777D8A56A`, full SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`, lines 13–21/101/148–168、raw span SHA `d16597b2119b4b6d89a48c97777397f983d404059799ab440e76d02f821e1a69` / `9a48e962ded1a655d4d467b146034189604c8545efe963446a06d5230e32889c` / `e3458062d75fec1bb5ea1a71dc1f9988ead52879c228a6495b39ba04bfcba2f9`) と旧gates `.../root/docs/process/gates.md` (asset `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`, full SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`, lines 41/64、raw span SHA `f3e1188383002fad74fca0fe087c327d6514afe8236fc765a4e4925e81cde4c0` / `e7b1b13818bf8e3c8cc1afa702735fd64e570bb0fccd9775a35d2a07dbb12a17`) からFR+AC、対応するL10、functional/business/NFR区分と人の承認・AI起草境界だけを保持する。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85` (asset `LEGACY-ASSET-6EBDB617A8104A7756D0`, full SHA `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`、raw span SHA `fc924232f93af2593a0d8ec97c36224a3c2f641ca5c03468ecae747107bd4785`) も同じ責任分担の起点。旧runtime/testは実行していない。

| 旧asset・判定 | 旧source path・行 | full SHA-256 | raw span SHA-256 | 本追補での扱い |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:35–106 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `defc92ec2fd6817d3bee69a183661df9b63e8984d78614cab660c09a17eb5571` | 比較条件・evidence/failure/costを記録する隣接例を再導出。Bench固有指標・task snapshot・軸・固定値は置換し現要件へ持ち込まない。 |
| 旧Bench対test-design `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:20–43 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `1b5e4eecc558013b0b38d5f3390021e4b44f6fdeb6991f07653f8fff23731cf8` | L10のpositive/negative oracleを対にする形だけを再利用。Bench-specific expected category/metric/valueは不採用。 |
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:21–76 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `4d513bd6b0fe222f3c5f757cd20275bee7d88b208106a1f5bcff65be80c2db52` | counterexample/scope/lifecycle/owner・candidate-authority境界の類例。draft_candidate（候補承認参照あり、canonical昇格・IR admission・runtime実装とは別工程）の規則・語彙は現行authorityとして継承せずL2から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:14–37 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `f2b1958d662a6c64d9e29b1c6b74a281a46f1d99f93aa5d9e432c6231f68ab32` | failure/counterexampleを成功標本で相殺しないnegative oracleの隣接例。旧候補ACを現行acceptanceと誤認しない。 |

## LABO-002-FR-01 — HELIXLABO-L2-002 Correlation Engine（相関）

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-002` / `MPR-RC-HELIXLABO-L2-002-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L49`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:77–84`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `d4ecde864ac4129741f32ac65d0075d1d0704cc7166b86491bbae6ef8865bf28`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: L2-001のobservation identity/field contractとAggregate→Correlate接続L2-011。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。L2-002は許可source付きobservationからepisodeへのrelationを求め、時間的近接だけで因果を断定せず、孤立event・欠落義務・訂正relationを保つ。旧Benchのversioned task/receipt比較は隣接する証跡形だけ、RCLS R-07はsource/outcome/correlation保持のdraft_candidate（候補承認参照あり、canonical昇格・IR admission・runtime実装とは別工程）として参照し、相関意味自体は現親から再導出する。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:96–126 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `b1e1ad5ce41e266e13b9469c20e87d57d46cf9f7d80773ce2a9c65c96102aae1` | task/source snapshotと比較条件の固定は隣接証跡形。旧cohort/repeat規則を継承せずrelation条件をL2から再導出。 |
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:37–37 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `b715ad01077fb05d1955165344b54803945e06746db67bec382bfa36a7e11e2c` | source/outcome/correlation/causal state結合の候補承認済み旧資料の類例。field規則は継承せず現親から再導出。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:25–34 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `e5ec702da7e6aa732bda4d81e5388c0415106aa60d4730b0350b6a2a9be365f5` | 旧のtask snapshot・hidden oracle・証拠receiptのoracle形式は隣接例として参照し、因果/relation規則は現行L2から再導出。 |

### 要件候補

許可されたsource observation（event identity、source/revision、requirement/ticket/responsibility、worker/artifact、CIからrecovery/runtimeまでの関係証拠、時点と未完義務）を受け、episodeと明示relation/unknown/孤立状態を返す。各edgeは根拠source/revisionを指し、temporal proximityは因果evidenceと区別する。誤relationは元eventを書換えず訂正candidateとして表す。LABOはsource authorityへ書き戻さず、欠落はsource/責務ownerへ戻す。

### 受入条件候補

- **LABO-002-AC-01 — 正常・追跡**：episode内の全relationにsource identity/revisionと根拠が追跡できる。
- **LABO-002-AC-02 — 否定・owner境界**：近接時刻のみの因果主張、欠落を補完したrelation、元event改変、未完義務の消去は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力/出力: source付きobservation→要求からrecovery等を結ぶepisode | `LABO-002-FR-01 / LABO-002-AC-01` | `L10-LABO-002-C01` | episode event/edgeとsource/revisionの対応 |
| requirement/revision、責務、product、mechanism、worker、provider/model/config、artifact、環境、結果を関連づける | `LABO-002-FR-01 / LABO-002-AC-01` | `L10-LABO-002-C01`, `L10-LABO-002-C04` | 親に列挙されたevent identity/relationship fieldを追跡 |
| 時間的近接だけで因果断定せず、相関不能eventを孤立/unknownへ | `LABO-002-AC-02` | `L10-LABO-002-C02` | time/path-only causal edge 0、unknown/isolated retained |
| 部分episodeの不足/未完義務を明示し、誤relationは元event不変でrelation訂正へ | `LABO-002-FR-01 / LABO-002-AC-01, LABO-002-AC-02` | `L10-LABO-002-C03` | immutable original event、訂正edgeとunfinished obligation |

## LABO-003-FR-01 — HELIXLABO-L2-003 Structural Decomposition Engine（構造分解）

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-003` / `MPR-RC-HELIXLABO-L2-003-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L50`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:85–92`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `5a5472b632726e3b6069e251024c59dbb4c076889bf48771d4cd306907922901`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: source evidence付きepisode L2-002とCorrelate→Decompose接続L2-012。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-06のapplicability/structure/invariant/tradeoff/failure/counterexample/scopeは候補承認済み旧資料の類例として読む。その承認は当時の候補revisionに限られ、現行authorityへは継承しない。旧Benchの平均scoreからfailureを隠す形も本親の分類要件には移さない。良否・条件依存等の区別は現L2-003から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | applicability/structure/invariant/trade-off/failure/counterexample/scopeの類例。分類軸自体はL2から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–27 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `7b0a281ee8bf1d6b82d4ac147f9e917259a8af4371018243c91830231da6bf88` | 単一事例/頻度だけの飛越を拒む旧候補oracle例。現要件へはunknown保持を再導出。 |

### 要件候補

episodeとsource evidenceを入力し、good/bad、condition-dependent、generic candidate、product-specific、system candidate、operation candidate、unknown、unnecessaryを別々に分類して、分類ごとの根拠と未確定・矛盾・欠測を出力する。全体の単一accept/rejectに丸めず、根拠不足はsource/evidence ownerへ返す。

### 受入条件候補

- **LABO-003-AC-01 — 正常・追跡**：親が列挙した各分類軸を独立fieldとして出し、同一fixtureの根拠へ戻れる。
- **LABO-003-AC-02 — 否定・owner境界**：全体二択化、反証/欠測の脱落、根拠のないgeneric/system昇格は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力: episodeとsource evidence、出力: 親列挙9種を個別評価 | `LABO-003-FR-01 / LABO-003-AC-01` | `L10-LABO-003-C01`, `L10-LABO-003-C04` | 9分類fieldと根拠の分離 |
| 全体を単一accept/rejectへ丸めない | `LABO-003-AC-02` | `L10-LABO-003-C02` | 分類軸混同/単一二択化0 |
| 分類不能/反証/欠測は未確定で保持し、元意味を改変せずevidenceへ戻る | `LABO-003-AC-02` | `L10-LABO-003-C02`, `L10-LABO-003-C03` | unknown/contradiction/missing evidenceとsource owner |

## LABO-004-FR-01 — HELIXLABO-L2-004 Vector Shu-Ha-Ri Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-004` / `MPR-RC-HELIXLABO-L2-004-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L51`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:93–100`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `6f1751ca2ca2dddd1e1065a68421d63e3c18ce656786c9c1fe318b1a4e458889`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: 根拠付き分類とDecompose→Vector接続L2-013、および比較対象source本文。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧Bench R-03の比較軸分離とRCLS R-06のpattern structure/trade-offは比較記述の隣接例。旧artifactは現行の方式変換authorityではなく、守破離の意味・停止境界はL2-004から再導出する。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:76–94 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `78e36e944f81b3d86848540620e4836a1f7ce35e58f290fdb84f7d0a640480e4` | 比較軸の分離は隣接例。旧benchmark axisを移さず守破離比較を再導出。 |
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | pattern structure/invariant/trade-offの候補承認済み旧資料の比較例。意味不明なら停止する規則はL2から再導出。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:22–24 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `111268a4e97a66f6b6caccd88a57cbf6fa32510bcecde33a06973088206c4f22` | 比較軸を分離するoracle形式だけを隣接例として参照し、守破離のfieldは現行L2から再導出。 |

### 要件候補

既存方式とsource evidenceを受け、purpose、structure、behavior、assumption、constraint、guarantee、costを分けた比較仮説を返す。守では改変前の意味/目的/条件を保存し、破では部分構造と条件差を比較し、離では有効部分だけをcandidateとして再構成する。元意味がunknownなら停止しclarificationを元source ownerへ戻す。

### 受入条件候補

- **LABO-004-AC-01 — 正常・追跡**：全7比較fieldと改変前source/revisionが揃い、守/破/離の候補に保持点と差分を結べる。
- **LABO-004-AC-02 — 否定・owner境界**：意味差を隠すこと、根拠のないmeaning/guarantee補完、上流判断前にcandidateを実施/決定することは不成立。意味差を明示したcandidateは比較proposalとして保持し、source/L1 ownerの判断材料へ返す。候補提示自体は不成立としない。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力既存方式/source evidence、出力7比較fieldを持つhypothesis | `LABO-004-FR-01 / LABO-004-AC-01` | `L10-LABO-004-C01`, `L10-LABO-004-C04` | 7 fieldとoriginal source/revision |
| 守は意味等を保存、破は部分構造/条件差比較、離は有効部candidate再構成 | `LABO-004-FR-01 / LABO-004-AC-01` | `L10-LABO-004-C01` | 保持/変更field・候補が各段階に対応 |
| 元意味不明なら停止しsource clarificationへ | `LABO-004-AC-02` | `L10-LABO-004-C02` | unknown意味から確定candidateを作らずsource/L1 ownerへ戻す |
| 意味変更proposalの差分を明示し、上流判断前に実施/決定へ昇格しない | `LABO-004-AC-01 / LABO-004-AC-02` | `L10-LABO-004-C03` | 明示proposalは保持しowner判断へ返す。隠蔽・無根拠cost=0・自動確定だけを否定 |

## LABO-005-FR-01 — HELIXLABO-L2-005 Transformation Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-005` / `MPR-RC-HELIXLABO-L2-005-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L52`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:101–108`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `3b7f37f57a9db5df451275962aa0a90f951cf61e23496828cb9a078f52bc36ee`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: Vector出力L2-004/014が保持する元意味と部分比較。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-12/13/15のlifecycle・縮退・rollback条件を候補資料として比較。非採択文書のstate machineは継承せず、変換語彙・meaning delta・owner/fallback条件はL2-005から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–52 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `7787b88b50767904ae5d36f52c98ff1be94a47407f3bda0bc0da5c82d32f227f` | lifecycle/縮退/mechanization/rollbackの候補例。旧lifecycle/action語彙を移植せず現在の変換候補を再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 段階飛越を拒むtest-design類例。L2-005の比較/意味差だけを現要件化。 |

### 要件候補

根拠付き仮説を受け、KEEP/REDUCE/SPLIT/MERGE/REDEFINE/REPLACE/RELOCATE/ABSTRACT/SPECIALIZE/REFRAME/DEFER/RETIREの一つ以上のcandidate、保持意味、変更意味、適用条件、既存機構への吸収/owner移動/operation fallback/retirementの比較を返す。意味変更は上流判断候補として示しLABOは決定しない。

### 受入条件候補

- **LABO-005-AC-01 — 正常・追跡**：候補ごとに列挙語彙、維持/変更意味、条件と比較対象が照合可能。
- **LABO-005-AC-02 — 否定・owner境界**：意味変更の隠蔽、LABOによる決定/実変更、比較不能候補の確定は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input hypothesis、output 親列挙12 transformation candidatesとmeaning/condition | `LABO-005-FR-01 / LABO-005-AC-01` | `L10-LABO-005-C01`, `L10-LABO-005-C04` | action語彙、meaning delta、condition |
| existing mechanism absorption、owner move、operation fallback、retireを比較 | `LABO-005-FR-01 / LABO-005-AC-01` | `L10-LABO-005-C01` | 継続/吸収/戻し/retireを含む |
| 意味変更は上流判断対象、LABOは決定しない | `LABO-005-AC-02` | `L10-LABO-005-C02`, `L10-LABO-005-C03` | 決定/実変更/authority生成0 |

## LABO-006-FR-01 — HELIXLABO-L2-006 Experiment Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-006` / `MPR-RC-HELIXLABO-L2-006-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L53`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:109–116`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `2d5aa6810c6a2a21c532e7f2a96ec39fdef9b8e6040b476b23187f3be0bd02ce`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: 比較可能なbaseline/candidate/hybrid、oracle/条件L2-005/015、およびOS assignment・Worker結果のsource observation L2-022/028。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧Bench R-04–08はsnapshot/protocol/evidence/costを固定する隣接起点だが、旧15field、12metrics、repeat/timeout、hardware/cohortを置換し移さない。RCLS R-08はoracleとindependent assessmentを扱う候補承認済み旧資料の例。実験責務・対象metricsはL2-006から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:121–141 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `eb6b076cc591a88b1057cae1bb81cde6da94fd9474eabf4c86c39f24785d57de` | run comparability/evidence/cost recording類例。旧timeout/repeat/metric/denominator規則は置換し親評価項目から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:23–24 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `b78289563ee8a1f00918c1b1a560e355fd649d723aa06588bb0b904f1545a12b` | failure/high costを成功で相殺しない否定oracleの旧候補例。現行親に必要な範囲だけ再導出。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:25–37 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `f650a2cd806e0d3375d2fd594c456bd2da0776614a97e28b0ed0972a4a803ff0` | 比較可能性・証拠・cost欠測の否定例を参照し、旧固定指標/値を置換してL2-006から再導出。 |

### 要件候補

baseline/current/candidate/hybrid仮説・条件・oracleとOS割当Workerの結果を受け、比較、成功/失敗、FP/FN、rework、speed、CI/Worker時間、token/API、人介入、context、複雑度、復旧、release lead time、運用負担、cross-product reuse、反例、適用範囲、cost/限界を出力する。assignment/resultは同一ticket/experiment/target versionへ結ぶ。OSが割当・起動し、Workerが実験する。比較条件違い/中断/invalid oracleは成功扱いしない。

### 受入条件候補

- **LABO-006-AC-01 — 正常・追跡**：比較対象・条件・oracle・割当/実行証跡を追跡し、列挙された測定結果と限界が対応する。
- **LABO-006-AC-02 — 否定・owner境界**：LABOがWorker選定/割当/起動、比較不能・中断をsuccess化、失敗/費用を捨てるのは不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力 baseline/current/candidate/hybrid・conditions/oracle・OS assigned Worker result、出力comparison等 | `LABO-006-FR-01 / LABO-006-AC-01` | `L10-LABO-006-C01`, `L10-LABO-006-C04` | assignment/resultと比較出力 |
| same ticket/experiment/target versionでassignmentとresultを結ぶ | `LABO-006-FR-01 / LABO-006-AC-01` | `L10-LABO-006-C01` | 同一identity/revision/target trace |
| 親列挙の品質/失敗/費用/運用指標と限界を評価 | `LABO-006-FR-01 / LABO-006-AC-01` | `L10-LABO-006-C01`, `L10-LABO-006-C04` | 結果fieldとevidence/limit |
| OS assignment/Worker execution境界、比較不能/中断を成功扱いしない | `LABO-006-AC-02` | `L10-LABO-006-C02`, `L10-LABO-006-C03` | invalid/interrupted unknown |

## LABO-007-FR-01 — HELIXLABO-L2-007 Assurance Allocation Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-007` / `MPR-RC-HELIXLABO-L2-007-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L54`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:117–124`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `89aa2011a64af3475f1bf23f6e52d2622535c96b374bebbc6926c5bab280c84e`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: 比較可能性とoracleを備えたexperiment evidence L2-006/016。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-12/15の段階飛越抑止/rollbackや旧Bench R-06のoracle evidenceは類例。L2-007が求める再現条件、machine判定可能性、oracle、副作用範囲、retry/rollback/idempotenceの5条件を現行親から再導出し、旧昇格状態や閾値は移さない。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–51 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `002b11ad0d60246e7bcf3b658c09f30c5bd472901cb5db482365b609a2d77142` | promotion/rollback/verification candidate例。旧候補承認を現行authorityへ継承せず、L2-007の5条件から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 頻度だけのpromotion否定例。現行L2の自動昇格なしに限り再導出。 |

### 要件候補

反復episode、実験証拠、rule candidate、oracleを入力し、operation継続とsystem化候補の双方を、再現条件・判定可能性・副作用範囲・retry/rollback/idempotence・oracle・例外/限界と共に評価する。評価段階は候補比較であって自動昇格/新承認gateではない。

### 受入条件候補

- **LABO-007-AC-01 — 正常・追跡**：再現条件、machineによる判定可能性、oracle、副作用範囲、retry/rollback/idempotenceを別々の5条件として判定し、各根拠を示す。
- **LABO-007-AC-02 — 否定・owner境界**：反復件数のみのsystemization、oracleなしの自動昇格、operation候補の消去は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input repeated episodes/evidence/rule candidate/oracle、output operation vs systemization evaluation | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C04` | 両候補とoracle evidence |
| 再現条件、machine判定可能性、oracle、副作用範囲、retry/rollback/idempotenceの5条件 | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C02` | 5条件それぞれの入力証拠・判定状態・不足理由 |
| 自動昇格せず、文脈依存等はoperation候補へ | `LABO-007-AC-02` | `L10-LABO-007-C02`, `L10-LABO-007-C03` | auto-promotion 0、operation候補保持 |

## LABO-008-FR-01 — HELIXLABO-L2-008 Operational Fallback Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-008` / `MPR-RC-HELIXLABO-L2-008-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L55`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:125–132`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `08da4c2fb64ede944ace1e21fe8f165a161fe981e902458a8263602040d581ce`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: current system rule/version、operation evidenceのL2-007/017。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-13の縮退状態とR-15 rollbackは失敗時の戻し方を示す候補承認済み旧資料の類例。system exception/avoidance/costからoperationへ戻す現在の意味はL2-008から再導出し、旧 lifecycleを移植しない。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–51 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `002b11ad0d60246e7bcf3b658c09f30c5bd472901cb5db482365b609a2d77142` | 縮退・rollback例。current ruleからoperationへ戻す条件/ownerはL2-008から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 段階縮退を保持する候補test。現行owner/fallback境界のみ再導出。 |

### 要件候補

system ruleの版と運用結果、exception、false positive、avoidance、変更costを入力し、system継続/修正またはoperation再評価候補を、戻し条件・未完義務・ownerと共に出力する。systemを永久固定せず、実行切替は行わない。情報不足は現責務ownerへ戻す。

### 受入条件候補

- **LABO-008-AC-01 — 正常・追跡**：current rule/versionから各例外・誤検知・回避・costを追跡し、候補と未完義務/戻しownerを示す。
- **LABO-008-AC-02 — 否定・owner境界**：LABOが実行切替、例外を消去、戻し先/未完義務なしの完了宣言は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input system result/exceptions/FP/avoidance/cost、output continue/amend/operation reassessment candidate | `LABO-008-FR-01 / LABO-008-AC-01` | `L10-LABO-008-C01`, `L10-LABO-008-C04` | rule revision・例外・回避・cost source |
| system→operationを改善候補として扱い永続固定しない | `LABO-008-FR-01 / LABO-008-AC-01` | `L10-LABO-008-C01`, `L10-LABO-008-C03` | 戻し候補と条件 |
| 未完義務を示し、切替せず、情報不足は現ownerへ戻す | `LABO-008-AC-02` | `L10-LABO-008-C02`, `L10-LABO-008-C03` | 切替0、unknown/owner/backflow |

## LABO-009-FR-01 — HELIXLABO-L2-009 Generalization Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-009` / `MPR-RC-HELIXLABO-L2-009-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L56`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:133–140`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `de30f29aef8d0d1af93e32843fadd823afc398352d9017fe24dfc84a2f7bd025`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: 評価済みexperiments、counterexamples、sample conditions L2-006/018。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-06のscope/counterexample/revalidationとAC-007の単一事例による飛越否定は類例。ただし旧候補承認はその候補revisionに限られ、現行authorityを作らない。判定規則も現行L2から再導出する。単一episodeから一般化せず、支持scope段階を出す本体はL2-009から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | scope/counterexample/revalidationの候補承認済み旧資料の類例。一般化ladderはL2-009から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–27 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `7b0a281ee8bf1d6b82d4ac147f9e917259a8af4371018243c91830231da6bf88` | single-case/frequency-only飛越否定の旧候補oracle。sample数は現parent未指定なので候補値として測定。 |

### 要件候補

実験結果とepisode群、counterexample、適用条件を受け、single episode→repeated episodes→cross-project→cross-product→general structureのうち証拠が支持する最大scopeを評価する。product固有意味を汎用先へ送らず、反例/適用外はscopeを狭め元証拠へ戻す。

### 受入条件候補

- **LABO-009-AC-01 — 正常・追跡**：出力scopeを全入力episode/experiment/counterexampleへ追跡し、未支持の上位scopeへ進まない。
- **LABO-009-AC-02 — 否定・owner境界**：単一事例での上位scope認定、counterexampleを無視したscope維持、product固有意味の汎用化は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input experiment/episodes、output supported scope ladder | `LABO-009-FR-01 / LABO-009-AC-01` | `L10-LABO-009-C01`, `L10-LABO-009-C04` | 出力scopeとsupporting evidence |
| 一事例で一般化せずscope別feedback先を維持 | `LABO-009-AC-02` | `L10-LABO-009-C02` | single-only guard、target責務区別 |
| 反例/適用外でscopeを狭め元証拠へ戻る | `LABO-009-FR-01 / LABO-009-AC-01, LABO-009-AC-02` | `L10-LABO-009-C02`, `L10-LABO-009-C03` | 反例でscope縮小とsource backflow |

## LABO-010-FR-01 — HELIXLABO-L2-010 Feedback Derivation Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-010` / `MPR-RC-HELIXLABO-L2-010-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L57`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:141–149`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `6ffc430c2762f509b39c2baab152115de82834be0cf168575470ed3832f9294e`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: scope付き知見、target responsibility、evidence/counterexample L2-009/019。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-21–23/AC-019はselection/approval/disposition/runtime judgment/decisionを分け候補をauthorityにしない類例だが、draft_candidateなので規則は継承しない。feedbackの16 fields、action vocabulary、OS/target-owner境界はL2-010から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:63–65 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `89866c7e0c08df4f035eb420ebcf8f827286e143d50c1f0abc56f60b792299d7` | selection/approval/disposition/runtime-judgment/decision分離とcandidate非authorityのdraft。現行L2のcandidate/OS/target-owner境界から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:39–39 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `674dfd8e0cac2f25a1d2e971d1871b55393e6659d5b8f52cb25d4de992d9e221` | authority混同拒否を示す旧候補acceptance例。human decision生成禁止は現行境界に従い再導出。 |

### 要件候補

評価済みepisode/experiment/counterexample/supported scopeからtarget-specific feedback candidateを作る。必須16 fields（source_episode, source_revision, target_mechanism, target_responsibility, observation, evidence, failure_or_success, hypothesis, experiment, result, counterexample, scope, confidence, regression_risk, recommended_action, revalidation_condition）と許可action語彙を保持する。候補はauthorityでなく、OSが登録/routingしtarget ownerが変更を判断する。欠落根拠を補完せず差戻す。

### 受入条件候補

- **LABO-010-AC-01 — 正常・追跡**：各candidateの16/16 fields、source revision、scope、対象責務とactionがsourceへ追跡できる。
- **LABO-010-AC-02 — 否定・owner境界**：欠落field補完、candidateから登録/authority/owner変更を生成、scope外のtargetへ送るのは不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| evaluated episode/experiment/counterexample/scopeからtarget-specific feedback candidatesを出力 | `LABO-010-FR-01 / LABO-010-AC-01` | `L10-LABO-010-C01`, `L10-LABO-010-C04` | target-specific candidate/source links |
| 16 required fieldsと許可action vocabularyを保持 | `LABO-010-FR-01 / LABO-010-AC-01` | `L10-LABO-010-C01`, `L10-LABO-010-C02` | 16/16 field・action/source identity |
| candidateはauthorityでなく、OS registration/routing・target owner changeに留める | `LABO-010-AC-02` | `L10-LABO-010-C02`, `L10-LABO-010-C03` | authority生成0、missing evidenceを戻す |

## 未承認事項

Stage 2bの基本9件と追加22 identity、計31件のFR/L10 pair候補はすべて部分草稿・未承認であり、L3承認前である。値候補と測定案は一つの承認対象として提示し、parameterごとのPO gateを作らない。親の意味・scope・owner・versionを変える必要が生じた場合だけL2へ戻す。


## Stage 2b 接続・条件補足22件（部分草稿・未承認）

本checkpointは固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc` / PO decision basis `633bf12` のStage 2b基本9件に加える22 identityを追補する。全L2 parentは同じ`docs/helix-labo/L2-requirements/labo-requirements.md`、full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。L11共通pinは前のStage 2b checkpointの親pin表を参照する。

旧起点は旧HELIX system L3 `LEGACY-ASSET-C7F0C3B79CBAA72960BF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`, full SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`) と対test-design `LEGACY-ASSET-FA8C6E69463183D6A19B` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`, full SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`)。旧HIL-01/02/11とHAT-01/02/11からsource/cause/revision/authority、owner別read connector、lineage/unknownを保つ形およびpositive/negative case構造だけを類例として読む。domain別connection semanticsは現行L2から再導出し、旧HARNESS Issue/Node runtime/connector/acceptance IDs/approval gatesは移さない。

旧Universal Improvement Loop L3 `LEGACY-ASSET-02D897E62EF2FA267267` (full SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`) と対 `LEGACY-ASSET-0B5B38F146D9538C9A36` (full SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`) はscope/counterexample/proposal/authority boundaryの隣接例として参照し、旧UIL candidate/output/lifecycleを本L2へ権威として移植しない。058は旧FRSを含む現行L2の明示起点を別途照合し、FRS資料のdraft-candidate statusを維持する。

| 親L2 / PO registration / decision / semantic digest | L2 source line/span | FR/AC/L10 mapping |
|---|---|---|
| `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60 / `sha256:bce298745ed3da0c1538e5bf7324a22da4b16e68715f915e46c48fa7731435a4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L167–170; raw SHA `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | `LABO-012-FR-01`, `LABO-012-AC-01/02`, `L10-LABO-012-C01..04` |
| `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61 / `sha256:f2072a508c91ea00ff35ba233c945365b4dffe3e2d5a3c800152ce38add38876` | `docs/helix-labo/L2-requirements/labo-requirements.md` L171–174; raw SHA `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | `LABO-013-FR-01`, `LABO-013-AC-01/02`, `L10-LABO-013-C01..04` |
| `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62 / `sha256:3d255c00ffd8f560dd9a181790bcc294bfae57e0571acac032ea1eba0f8760d8` | `docs/helix-labo/L2-requirements/labo-requirements.md` L175–178; raw SHA `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | `LABO-014-FR-01`, `LABO-014-AC-01/02`, `L10-LABO-014-C01..04` |
| `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63 / `sha256:c55dbc5072f5a55a2e35c7d7acd39392441d19ca3f3c3db387c313c63e73437c` | `docs/helix-labo/L2-requirements/labo-requirements.md` L179–182; raw SHA `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | `LABO-015-FR-01`, `LABO-015-AC-01/02`, `L10-LABO-015-C01..04` |
| `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64 / `sha256:439c9ed877915de9a0d2f3028fce04a12f451d7812946e3322be8b46306e8467` | `docs/helix-labo/L2-requirements/labo-requirements.md` L183–186; raw SHA `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | `LABO-016-FR-01`, `LABO-016-AC-01/02`, `L10-LABO-016-C01..04` |
| `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65 / `sha256:34ceade9563b09db94ef5d031c66df4c2741db3d13aa126ca0aa74b9a92b5440` | `docs/helix-labo/L2-requirements/labo-requirements.md` L187–190; raw SHA `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | `LABO-017-FR-01`, `LABO-017-AC-01/02`, `L10-LABO-017-C01..04` |
| `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66 / `sha256:d1b31fb8d379f9dcfcdc6213ac4d7fcb193e20d7d59276e231f548f3db9dcfdd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L191–194; raw SHA `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | `LABO-018-FR-01`, `LABO-018-AC-01/02`, `L10-LABO-018-C01..04` |
| `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67 / `sha256:e7a90eba26b101083aa9fa449b220ea53d5c8230eed1f82980797cdabbb51d65` | `docs/helix-labo/L2-requirements/labo-requirements.md` L195–198; raw SHA `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | `LABO-019-FR-01`, `LABO-019-AC-01/02`, `L10-LABO-019-C01..04` |
| `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68 / `sha256:61ae506fe25a2218b3c2581e47eb76a167f8344cc792d5c27d4895bd65121501` | `docs/helix-labo/L2-requirements/labo-requirements.md` L199–202; raw SHA `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | `LABO-020-FR-01`, `LABO-020-AC-01/02`, `L10-LABO-020-C01..04` |
| `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69 / `sha256:00dda7b8a7675bba719585e6fbb94e43a2f273146b195d00daae5718f3f1fc9e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L203–206; raw SHA `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | `LABO-021-FR-01`, `LABO-021-AC-01/02`, `L10-LABO-021-C01..04` |
| `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70 / `sha256:4dba319cb6d4abe7c909c9ffc1c9e50593efe4aa6d26548fd0434375baeae783` | `docs/helix-labo/L2-requirements/labo-requirements.md` L207–210; raw SHA `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | `LABO-022-FR-01`, `LABO-022-AC-01/02`, `L10-LABO-022-C01..04` |
| `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71 / `sha256:aafe6d1641624bd7986d5fd6c6a1c67644221c9df0f4503433f442c98f26a36b` | `docs/helix-labo/L2-requirements/labo-requirements.md` L211–214; raw SHA `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | `LABO-023-FR-01`, `LABO-023-AC-01/02`, `L10-LABO-023-C01..04` |
| `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72 / `sha256:b9716e90512221b17da8f2eb3df7d8ea64bcdab2e4223ea32a720ae8c19ddbd4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L215–218; raw SHA `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | `LABO-024-FR-01`, `LABO-024-AC-01/02`, `L10-LABO-024-C01..04` |
| `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73 / `sha256:e6cc467c72635a5fb91257cfb90f6a1039654d8f34a28454353566e3f3c28bf3` | `docs/helix-labo/L2-requirements/labo-requirements.md` L219–222; raw SHA `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | `LABO-025-FR-01`, `LABO-025-AC-01/02`, `L10-LABO-025-C01..04` |
| `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74 / `sha256:64944055712d4d2c8ad4817624c5eeacba241c5bf7a008da18b2cfcdb53ec150` | `docs/helix-labo/L2-requirements/labo-requirements.md` L223–226; raw SHA `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | `LABO-026-FR-01`, `LABO-026-AC-01/02`, `L10-LABO-026-C01..04` |
| `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75 / `sha256:ee444d777dfa4e45646584941998a8fa812b0070d62261e0c9ae3249928b8bab` | `docs/helix-labo/L2-requirements/labo-requirements.md` L227–230; raw SHA `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | `LABO-027-FR-01`, `LABO-027-AC-01/02`, `L10-LABO-027-C01..04` |
| `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76 / `sha256:f51b751526a581ca0cd80821dfdb9b558d3e2d4d0d3cb123420ea7391e45564e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L231–234; raw SHA `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | `LABO-028-FR-01`, `LABO-028-AC-01/02`, `L10-LABO-028-C01..04` |
| `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77 / `sha256:c37e1dbc85f2c6fcfb9b55e28d867faf9c4727a3615bd36882a71353eed3c89f` | `docs/helix-labo/L2-requirements/labo-requirements.md` L235–238; raw SHA `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | `LABO-029-FR-01`, `LABO-029-AC-01/02`, `L10-LABO-029-C01..04` |
| `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78 / `sha256:79a9ed7a30f650e949b2f092958a3e84c428e7ff84c0e6409fd056196d4c1e50` | `docs/helix-labo/L2-requirements/labo-requirements.md` L239–242; raw SHA `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | `LABO-030-FR-01`, `LABO-030-AC-01/02`, `L10-LABO-030-C01..04` |
| `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82 / `sha256:3d6fa067472bd28ce86fa0da805972e817170bde8602652a2e070b9af572cdbf` | `docs/helix-labo/L2-requirements/labo-requirements.md` L255–258; raw SHA `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | `LABO-034-FR-01`, `LABO-034-AC-01/02`, `L10-LABO-034-C01..04` |
| `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83 / `sha256:8cdd8f7cbbdeb905ea12b600ff007e25ad5f0bb6196c70009402ef1453662bfd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L259–262; raw SHA `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | `LABO-035-FR-01`, `LABO-035-AC-01/02`, `L10-LABO-035-C01..04` |
| `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98 / `sha256:0ff4f665f3a465611b2489a908bfb161e852fa5706393d04c21d59c3598d9f17` | `docs/helix-labo/L2-requirements/labo-requirements.md` L403–415; raw SHA `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | `LABO-058-FR-01`, `LABO-058-AC-01/02`, `L10-LABO-058-C01..05` |

## LABO-012-FR-01 — HELIXLABO-L2-012 Correlate → Decompose

### 親・依存・版

- 固定親 `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:167–170`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-002のepisode/evidence/relation `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: episode、evidence、relation版を受けて分類対象を出力する。根拠/unknownを保ち、relation版不一致は訂正sourceへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

episode、evidence、relation版を受けて分類対象を出力する。根拠/unknownを保ち、relation版不一致は訂正sourceへ戻す。

### 受入条件候補

- **LABO-012-AC-01 — 正常・trace**：分類入力全てに元episode/source evidence/relation revisionが追跡できる。
- **LABO-012-AC-02 — failure/owner boundary**：relation版不一致、根拠欠落、unknown消去を受理しない。 上流のepisodeとrelation authorityを変更しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-012-FR-01 / LABO-012-AC-01` | `L10-LABO-012-C01`, `L10-LABO-012-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-012-FR-01 / LABO-012-AC-02` | `L10-LABO-012-C02`, `L10-LABO-012-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-012-FR-01 / LABO-012-AC-02` | `L10-LABO-012-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-012-FR-01 / LABO-012-AC-01` | `L10-LABO-012-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-013-FR-01 — HELIXLABO-L2-013 Decompose → Vector Shu-Ha-Ri

### 親・依存・版

- 固定親 `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:171–174`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-003の根拠付き分解結果 `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: 根拠付き分類を意味/条件別比較仮説の入力へ渡し、分類軸と根拠を保持する。欠落をsource evidenceへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

根拠付き分類を意味/条件別比較仮説の入力へ渡し、分類軸と根拠を保持する。欠落をsource evidenceへ戻す。

### 受入条件候補

- **LABO-013-AC-01 — 正常・trace**：各比較hypothesisから元分類と証拠を追跡可能。
- **LABO-013-AC-02 — failure/owner boundary**：分類軸の混同/根拠欠落をsuccessにしない。 Vectorはsource meaningを上書きしない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-013-FR-01 / LABO-013-AC-01` | `L10-LABO-013-C01`, `L10-LABO-013-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-013-FR-01 / LABO-013-AC-02` | `L10-LABO-013-C02`, `L10-LABO-013-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-013-FR-01 / LABO-013-AC-02` | `L10-LABO-013-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-013-FR-01 / LABO-013-AC-01` | `L10-LABO-013-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-014-FR-01 — HELIXLABO-L2-014 Vector → Transformation

### 親・依存・版

- 固定親 `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:175–178`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-004の部分比較candidate `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: 元意味、目的、条件を含む部分比較candidateからtransformation candidateを渡し、保持意味と変更部分を区別する。意味不明ならL1/sourceへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

元意味、目的、条件を含む部分比較candidateからtransformation candidateを渡し、保持意味と変更部分を区別する。意味不明ならL1/sourceへ戻す。

### 受入条件候補

- **LABO-014-AC-01 — 正常・trace**：元source/revision、意味、目的、条件とcandidate差分を追跡する。
- **LABO-014-AC-02 — failure/owner boundary**：元意味不明、meaning delta欠落を確定candidateにしない。 接続はcandidateを実変更/決定へ昇格しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-014-FR-01 / LABO-014-AC-01` | `L10-LABO-014-C01`, `L10-LABO-014-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-014-FR-01 / LABO-014-AC-02` | `L10-LABO-014-C02`, `L10-LABO-014-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-014-FR-01 / LABO-014-AC-02` | `L10-LABO-014-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-014-FR-01 / LABO-014-AC-01` | `L10-LABO-014-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-015-FR-01 — HELIXLABO-L2-015 Transformation → Experiment

### 親・依存・版

- 固定親 `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:179–182`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-005 transformation candidateと適用条件 `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: 変換candidate/適用条件からbaseline/current、candidate、hybridの比較条件を組み立てる。版・条件を固定し、oracle/条件不足なら実験成立扱いにしない。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

変換candidate/適用条件からbaseline/current、candidate、hybridの比較条件を組み立てる。版・条件を固定し、oracle/条件不足なら実験成立扱いにしない。

### 受入条件候補

- **LABO-015-AC-01 — 正常・trace**：3比較armのsource revision、条件、oracle、target versionが一貫する。
- **LABO-015-AC-02 — failure/owner boundary**：比較arm間の版/条件差、oracle不足を成功扱いしない。 Worker実行を開始/割当しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-015-FR-01 / LABO-015-AC-01` | `L10-LABO-015-C01`, `L10-LABO-015-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-015-FR-01 / LABO-015-AC-02` | `L10-LABO-015-C02`, `L10-LABO-015-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-015-FR-01 / LABO-015-AC-02` | `L10-LABO-015-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-015-FR-01 / LABO-015-AC-01` | `L10-LABO-015-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-016-FR-01 — HELIXLABO-L2-016 Experiment → Assurance Allocation

### 親・依存・版

- 固定親 `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:183–186`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-006比較結果、反例、oracle、中断状態 `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: これらをsystem/operation適格性評価材料へ渡し比較可能性と反例を保つ。判定不能はoperation候補で保留する。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

これらをsystem/operation適格性評価材料へ渡し比較可能性と反例を保つ。判定不能はoperation候補で保留する。

### 受入条件候補

- **LABO-016-AC-01 — 正常・trace**：比較可能性、反例、oracle、run interruptionが評価材料へ個別に残る。
- **LABO-016-AC-02 — failure/owner boundary**：判定不能をsystem候補成立へ読み替えない。 自動system化/昇格をしない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-016-FR-01 / LABO-016-AC-01` | `L10-LABO-016-C01`, `L10-LABO-016-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C02`, `L10-LABO-016-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-016-FR-01 / LABO-016-AC-01` | `L10-LABO-016-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-017-FR-01 — HELIXLABO-L2-017 Assurance Allocation → Operational Fallback

### 親・依存・版

- 固定親 `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:187–190`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-007 system/operation適格性と現行保証 `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: system/operation適格性とcurrent guaranteeから再評価candidate/unfinished obligationを出す。切替せず、owner運転結果不足ならownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

system/operation適格性とcurrent guaranteeから再評価candidate/unfinished obligationを出す。切替せず、owner運転結果不足ならownerへ戻す。

### 受入条件候補

- **LABO-017-AC-01 — 正常・trace**：current rule version、適格性材料、未完義務とownerを結ぶ。
- **LABO-017-AC-02 — failure/owner boundary**：current version/evidence不足を切替完了にしない。 LABOはoperational switchを実行しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-017-FR-01 / LABO-017-AC-01` | `L10-LABO-017-C01`, `L10-LABO-017-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-017-FR-01 / LABO-017-AC-02` | `L10-LABO-017-C02`, `L10-LABO-017-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-017-FR-01 / LABO-017-AC-02` | `L10-LABO-017-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-017-FR-01 / LABO-017-AC-01` | `L10-LABO-017-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-018-FR-01 — HELIXLABO-L2-018 Experiment → Generalization

### 親・依存・版

- 固定親 `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:191–194`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-006 comparison result/sample conditions/counterexample `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: comparison result、sample condition、counterexampleからsupported applicability scopeを出す。反例/condition欠落はexperiment evaluationへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

comparison result、sample condition、counterexampleからsupported applicability scopeを出す。反例/condition欠落はexperiment evaluationへ戻す。

### 受入条件候補

- **LABO-018-AC-01 — 正常・trace**：scopeとsupporting sample/condition/counterexampleを結ぶ。
- **LABO-018-AC-02 — failure/owner boundary**：unsupported scopeを承認済み一般則にしない。 一例を根拠に広げない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-018-FR-01 / LABO-018-AC-01` | `L10-LABO-018-C01`, `L10-LABO-018-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-018-FR-01 / LABO-018-AC-02` | `L10-LABO-018-C02`, `L10-LABO-018-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-018-FR-01 / LABO-018-AC-02` | `L10-LABO-018-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-018-FR-01 / LABO-018-AC-01` | `L10-LABO-018-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-019-FR-01 — HELIXLABO-L2-019 Generalization → Feedback Derivation

### 親・依存・版

- 固定親 `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:195–198`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-009 scope-bound insightとL2-019 target responsibility/evidence `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: scope-bound insight/target candidateからtarget別Feedback candidateへ渡す。target別提案を分離し、target不明はOS routing candidateへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

scope-bound insight/target candidateからtarget別Feedback candidateへ渡す。target別提案を分離し、target不明はOS routing candidateへ戻す。

### 受入条件候補

- **LABO-019-AC-01 — 正常・trace**：各proposalはtarget identity/evidence/scopeへ個別にtraceする。
- **LABO-019-AC-02 — failure/owner boundary**：target不明/複数target混同を自動routingしない。 OS routingとtarget owner変更は実行しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-019-FR-01 / LABO-019-AC-01` | `L10-LABO-019-C01`, `L10-LABO-019-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-019-FR-01 / LABO-019-AC-02` | `L10-LABO-019-C02`, `L10-LABO-019-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-019-FR-01 / LABO-019-AC-02` | `L10-LABO-019-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-019-FR-01 / LABO-019-AC-01` | `L10-LABO-019-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-020-FR-01 — HELIXLABO-L2-020 Operational Fallback → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:199–202`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-008 operation-return resultとL2-001 observation contract `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: operationへ戻った後の結果と旧/新rule versionをnew observationへ集積する。未完義務とbefore/after versionを保持し欠落はsource ownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

operationへ戻った後の結果と旧/新rule versionをnew observationへ集積する。未完義務とbefore/after versionを保持し欠落はsource ownerへ戻す。

### 受入条件候補

- **LABO-020-AC-01 — 正常・trace**：result observationに戻し前後versionとowner provenanceが含まれる。
- **LABO-020-AC-02 — failure/owner boundary**：旧新version/source欠落で新observed successを作らない。 fallbackの実行責務はowner、Aggregateは観測に限定。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-020-FR-01 / LABO-020-AC-01` | `L10-LABO-020-C01`, `L10-LABO-020-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-020-FR-01 / LABO-020-AC-02` | `L10-LABO-020-C02`, `L10-LABO-020-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-020-FR-01 / LABO-020-AC-02` | `L10-LABO-020-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-020-FR-01 / LABO-020-AC-01` | `L10-LABO-020-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-021-FR-01 — HELIXLABO-L2-021 HELIX-HARNESS → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:203–206`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: HARNESS source contractと個別connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたHARNESS過去工程/実績をsource identity/revision付きobservationにする。HARNESS authority/raw recordを維持し、scope/version不明はHARNESS ownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたHARNESS過去工程/実績をsource identity/revision付きobservationにする。HARNESS authority/raw recordを維持し、scope/version不明はHARNESS ownerへ戻す。

### 受入条件候補

- **LABO-021-AC-01 — 正常・trace**：許可source revisionとobservation attribution/raw-source locatorが一貫する。
- **LABO-021-AC-02 — failure/owner boundary**：scope/version不明やunauthorized dataを取込成功にしない。 HARNESS raw record/authorityをLABOで変更しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-021-FR-01 / LABO-021-AC-01` | `L10-LABO-021-C01`, `L10-LABO-021-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C02`, `L10-LABO-021-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-021-FR-01 / LABO-021-AC-01` | `L10-LABO-021-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-022-FR-01 — HELIXLABO-L2-022 HELIX-OS → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:207–210`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: OS source contractと個別connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたticket/operation/evidenceをsource identity/revision付きobservationにする。OS正本と未完/unknownを保持し、stale/missingはOSへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたticket/operation/evidenceをsource identity/revision付きobservationにする。OS正本と未完/unknownを保持し、stale/missingはOSへ戻す。

### 受入条件候補

- **LABO-022-AC-01 — 正常・trace**：ticket/run/receiptのOS ID/revision/stateがobservationへ一致する。
- **LABO-022-AC-02 — failure/owner boundary**：stale/欠落を完了/評価済みにしない。 OSが割当/運転state ownerのまま。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-022-FR-01 / LABO-022-AC-01` | `L10-LABO-022-C01`, `L10-LABO-022-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C02`, `L10-LABO-022-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-022-FR-01 / LABO-022-AC-01` | `L10-LABO-022-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-023-FR-01 — HELIXLABO-L2-023 BRAIN → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:211–214`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: BRAIN source contractと個別connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたknowledge use/application resultをsource-version付きobservationにする。BRAIN knowledge canonical stateは書換えず、identity不明はBRAINへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたknowledge use/application resultをsource-version付きobservationにする。BRAIN knowledge canonical stateは書換えず、identity不明はBRAINへ戻す。

### 受入条件候補

- **LABO-023-AC-01 — 正常・trace**：usage observationは知識asset revisionと結果を区別して追跡する。
- **LABO-023-AC-02 — failure/owner boundary**：unknown source identity、unauthorized knowledge useを受理しない。 BRAIN knowledge sourceを編集/更新しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-023-FR-01 / LABO-023-AC-01` | `L10-LABO-023-C01`, `L10-LABO-023-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C02`, `L10-LABO-023-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-023-FR-01 / LABO-023-AC-01` | `L10-LABO-023-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-024-FR-01 — HELIXLABO-L2-024 INTELLIGENCE → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:215–218`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: INTELLIGENCE source contractと個別connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたdecision/prediction/diagnosis/reviewの結果を、観測事実と判断結果を分けたobservationにする。過去評価はcurrent authorityでなく、version mismatchはINTELLIGENCEへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたdecision/prediction/diagnosis/reviewの結果を、観測事実と判断結果を分けたobservationにする。過去評価はcurrent authorityでなく、version mismatchはINTELLIGENCEへ戻す。

### 受入条件候補

- **LABO-024-AC-01 — 正常・trace**：past assessment revision/timeとobservation fact/judgmentを区別する。
- **LABO-024-AC-02 — failure/owner boundary**：source revision mismatchをcurrent resultに偽装しない。 評価履歴を現在のauthority/decisionへ変えない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-024-FR-01 / LABO-024-AC-01` | `L10-LABO-024-C01`, `L10-LABO-024-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C02`, `L10-LABO-024-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-024-FR-01 / LABO-024-AC-01` | `L10-LABO-024-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-025-FR-01 — HELIXLABO-L2-025 SECURITY → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:219–222`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: SECURITY data-use scopeとconnector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: SECURITYが許可したsafety/incident evidenceだけを範囲付きobservationにする。restricted data/authorityを移さず、scope unknownはSECURITYへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

SECURITYが許可したsafety/incident evidenceだけを範囲付きobservationにする。restricted data/authorityを移さず、scope unknownはSECURITYへ戻す。

### 受入条件候補

- **LABO-025-AC-01 — 正常・trace**：許可されたscope/authority locatorとobservation範囲が照合できる。
- **LABO-025-AC-02 — failure/owner boundary**：scope不明/制限データを受理、展開しない。 restricted payloadやsecurity authorityをLABOに保持・移管しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-025-FR-01 / LABO-025-AC-01` | `L10-LABO-025-C01`, `L10-LABO-025-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C02`, `L10-LABO-025-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-025-FR-01 / LABO-025-AC-01` | `L10-LABO-025-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-026-FR-01 — HELIXLABO-L2-026 INFRASTRUCTURE → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:223–226`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: INFRASTRUCTURE source contractとconnector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたresource/runtime evidenceをsource-version付きobservationにする。resource authorityはINFRASTRUCTUREに残し、stale/unknownはsourceへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたresource/runtime evidenceをsource-version付きobservationにする。resource authorityはINFRASTRUCTUREに残し、stale/unknownはsourceへ戻す。

### 受入条件候補

- **LABO-026-AC-01 — 正常・trace**：resource/runtime source revision, environment, stateがobservationへ保持される。
- **LABO-026-AC-02 — failure/owner boundary**：stale/unknown environmentをcurrent healthyに変換しない。 resource authority/configurationは変更しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-026-FR-01 / LABO-026-AC-01` | `L10-LABO-026-C01`, `L10-LABO-026-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C02`, `L10-LABO-026-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-026-FR-01 / LABO-026-AC-01` | `L10-LABO-026-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-027-FR-01 — HELIXLABO-L2-027 HELIX-CONNECT → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:227–230`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: 各元connection contractと専用connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: CONNECT経由の個別connection observation/traceをprovenance/schema version付きobservationへ写す。drift/unknownを明示しcontract mismatchはCONNECT/source ownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

CONNECT経由の個別connection observation/traceをprovenance/schema version付きobservationへ写す。drift/unknownを明示しcontract mismatchはCONNECT/source ownerへ戻す。

### 受入条件候補

- **LABO-027-AC-01 — 正常・trace**：source connection ID/schema version/traceと受領内容を照合できる。
- **LABO-027-AC-02 — failure/owner boundary**：schema drift/unknownを正常接続として扱わない。 logical connection contractをLABOで改定しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-027-FR-01 / LABO-027-AC-01` | `L10-LABO-027-C01`, `L10-LABO-027-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C02`, `L10-LABO-027-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-027-FR-01 / LABO-027-AC-01` | `L10-LABO-027-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-028-FR-01 — HELIXLABO-L2-028 Worker → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:231–234`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: OS assignmentとWorker result contract `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたWorker resultをtask class/assignment/source付きobservationへする。Workerはauthority ownerでなく、未評価resultを評価済みにしない。assignment不明はOSへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたWorker resultをtask class/assignment/source付きobservationへする。Workerはauthority ownerでなく、未評価resultを評価済みにしない。assignment不明はOSへ戻す。

### 受入条件候補

- **LABO-028-AC-01 — 正常・trace**：result/task class/worker/source/assignment revisionsを相互照合する。
- **LABO-028-AC-02 — failure/owner boundary**：assignment不明、unknown resultを評価済み/qualifiedへしない。 Workerの実行/OS assignment責務を置換しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-028-FR-01 / LABO-028-AC-01` | `L10-LABO-028-C01`, `L10-LABO-028-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C02`, `L10-LABO-028-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-028-FR-01 / LABO-028-AC-01` | `L10-LABO-028-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-029-FR-01 — HELIXLABO-L2-029 CI/test → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:235–238`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: HARNESS verification contractとOS execution evidence `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 許可CI/test resultと対象revisionから検査範囲付きobservationを作る。未実行/stale/interruptedをpassにせず、scope欠落はsource ownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可CI/test resultと対象revisionから検査範囲付きobservationを作る。未実行/stale/interruptedをpassにせず、scope欠落はsource ownerへ戻す。

### 受入条件候補

- **LABO-029-AC-01 — 正常・trace**：対象revisionとverification scope/statusが同一observationに残る。
- **LABO-029-AC-02 — failure/owner boundary**：未実行/stale/interrupted/missing scopeをpassにしない。 LABOはCI/testを実行せずverification authorityも変更しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-029-FR-01 / LABO-029-AC-01` | `L10-LABO-029-C01`, `L10-LABO-029-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C02`, `L10-LABO-029-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-029-FR-01 / LABO-029-AC-01` | `L10-LABO-029-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-030-FR-01 — HELIXLABO-L2-030 Product Core → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:239–242`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: 各採択済Product Core source contractと専用connector `version_target: 1.0`。
- 旧項目判定: 入力接続。固定親で保持する意味: 各製品の許可利用/resultをproduct/source identity別observationにする。製品意味とauthorityを維持し異なるsourceを一identityに統合しない。target versionは採択済product scopeに従う。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

各製品の許可利用/resultをproduct/source identity別observationにする。製品意味とauthorityを維持し異なるsourceを一identityに統合しない。target versionは採択済product scopeに従う。

### 受入条件候補

- **LABO-030-AC-01 — 正常・trace**：source/product identityと適用版/許可が観測ごとに追跡可能。
- **LABO-030-AC-02 — failure/owner boundary**：異なるsourceを統合、scope外を同一identityへ混入しない。 未採択source/productを暗黙必須化せず、製品stateを書換えない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-030-FR-01 / LABO-030-AC-01` | `L10-LABO-030-C01`, `L10-LABO-030-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C02`, `L10-LABO-030-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-030-FR-01 / LABO-030-AC-01` | `L10-LABO-030-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-034-FR-01 — HELIXLABO-L2-034 LABO → BRAIN

### 親・依存・版

- 固定親 `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:255–258`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-009 supported generic structureとBRAIN connector `version_target: 1.0`。
- 旧項目判定: 境界接続。固定親で保持する意味: 異なるproduct/meaning/episodeを横断して支持されたgeneric structure evidenceからBRAIN向けstructure candidateを作る。product-specific meaningを渡さず、一事例/unknown scopeはL2-009へ戻す。1.0は内部evidenceだけ。external knowledge evaluation loopは2.0のため本1.0候補から除外。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:68–103 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `f985ea2700541c99cb88efe15e28e0105a7fa08d9ede28ccc34ac6cc20ae620b` | counterexample/scope/proposal/rollback candidate shapeを隣接参照。1.0内部evidence boundaryは現parentから再導出。 |
| `LEGACY-ASSET-0B5B38F146D9538C9A36` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md`:34–40 | `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | `c2facd21b95f934b7927085aabf50b690648f1803c9b6e712775272a4efcc4fc` | scope/counterexample/generalization authorityのoracle類例。旧lifecycle/external loopは対象外。 |

### 要件候補

異なるproduct/meaning/episodeを横断して支持されたgeneric structure evidenceからBRAIN向けstructure candidateを作る。product-specific meaningを渡さず、一事例/unknown scopeはL2-009へ戻す。1.0は内部evidenceだけ。external knowledge evaluation loopは2.0のため本1.0候補から除外。

### 受入条件候補

- **LABO-034-AC-01 — 正常・trace**：複数の独立product/meaning/episodeを含むsupported structureのみ内部candidateとして渡しsource/scopeを保持。
- **LABO-034-AC-02 — failure/owner boundary**：single case/product-specific meaning/unknown applicabilityからgeneric candidateを作らない。 BRAIN ingestion/authorityを作らず、外部knowledge/evaluation loopを1.0に含めない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-034-FR-01 / LABO-034-AC-01` | `L10-LABO-034-C01`, `L10-LABO-034-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C02`, `L10-LABO-034-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-034-FR-01 / LABO-034-AC-01` | `L10-LABO-034-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-035-FR-01 — HELIXLABO-L2-035 LABO → INTELLIGENCE 評価材料境界

### 親・依存・版

- 固定親 `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:259–262`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: evaluated evidenceとINTELLIGENCE connector。L2-052 full collection/revision reach; L2-054 Bench level remains separate `version_target: 1.0`。
- 旧項目判定: 境界接続。固定親で保持する意味: judgment accuracy、failure corpus、counterexample、model/provider comparison、FP/FN、diagnosis/review/bot evaluation materialsをscope/source revision/unassessed state付きpacketとして渡す。全材料の収集/同revision到達はL2-052、Bench level payloadはL2-054専用。LABOはcurrent judgment/placement/botを実行しない。1.0は評価材料に限り、learning/tuningは3.0以降の範囲として除外する。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:68–103 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `f985ea2700541c99cb88efe15e28e0105a7fa08d9ede28ccc34ac6cc20ae620b` | evidence packetとproposal/authority separationの隣接例。INTELLIGENCE evaluation materialsは現parentから再導出。 |
| `LEGACY-ASSET-0B5B38F146D9538C9A36` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md`:30–40 | `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | `9c3f0a691d1a108e2af9fb2771d4ff2944e1851d19f15e579c7cc58635f701f9` | failure/counterevidenceとproposal-only boundaryのacceptance類例。学習/調整は本1.0範囲にしない。 |

### 要件候補

judgment accuracy、failure corpus、counterexample、model/provider comparison、FP/FN、diagnosis/review/bot evaluation materialsをscope/source revision/unassessed state付きpacketとして渡す。全材料の収集/同revision到達はL2-052、Bench level payloadはL2-054専用。LABOはcurrent judgment/placement/botを実行しない。1.0は評価材料に限り、learning/tuningは3.0以降の範囲として除外する。

### 受入条件候補

- **LABO-035-AC-01 — 正常・trace**：評価material packetはscope/source revision/unassessed stateを保持し、052/054 responsibilitiesと混ぜない。
- **LABO-035-AC-02 — failure/owner boundary**：source/scope/revision unknownやunassessedを評価済み/learnedへ変えない。 INTELLIGENCEの学習/調整、model selection/placement/bot operationを実行しない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-035-FR-01 / LABO-035-AC-01` | `L10-LABO-035-C01`, `L10-LABO-035-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-035-FR-01 / LABO-035-AC-02` | `L10-LABO-035-C02`, `L10-LABO-035-C03` | 個別および併発mutationを成功へ昇格しない |
| 責務ownerと変更禁止境界 | `LABO-035-FR-01 / LABO-035-AC-02` | `L10-LABO-035-C03` | LABOの書戻し/dispatch/owner変更0、親指定ownerへ戻す |
| 親範囲内のheld-out正常fixture | `LABO-035-FR-01 / LABO-035-AC-01` | `L10-LABO-035-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-058-FR-01 — HELIXLABO-L2-058 観測集積の入力元ごとの依存条件

### 親・依存・版

- 固定親 `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:403–415`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: 既存L2-001、HARNESS-L2-010/011/023 dependency-class contract、選択source input connectorとsafety/version condition。058自身を001のrecursive preconditionにしない。 `version_target: 1.0`。
- 旧項目判定: 条件補足。固定親で保持する意味: 各呼出しで対象scope、選択source identity/operation、source/contract version、data-use permission、selected connector、既存001 contractを受け取る。選択/未選択と選択理由を示し、選択source依存閉包を確認したLABO observation、unobserved sources、receipt failure/missing reasonを返す。常時要件は001 provenance/identity/revision/status/scope/data-use/authority/version/no-source-write。source-specific connector/safety closureは選択したsourceだけ必須。複数選択なら全選択sourceの閉包を満たす。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`:89–92 | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | `4fc611db8d2563773d3f0a1b2e363015a7adcb00899d7f1a3da659661e048779` | FRS-R-06はinclude/exclude exact-setとrequired dependency欠落/暗黙包含のcandidate起点。未採択FRSの他bundle意味は継承しない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`:134–145 | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | `e3dd6a564bd8236db8afda5df895221ee89f7c4b54a0793f49bb2459a96cb0a1` | FRS-R-13/14はdependent closureとunknown/stale safety handlingのcandidate起点。現L2-058のselected-input closureだけを再導出。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`:39–39 | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | `f0f8b45e05554194f2fa6886cabbbd524b40c48e47cb3764188859394819609f` | FRS-AC-006のselected/excluded/required-missing negative oracle形式を照合。draft-candidate acceptanceでありauthorityではない。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`:46–47 | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | `8664d01493c44c49e34d248a6ff85ec7d7b9e5c8f4a25a8dd5b108034a4f7e76` | FRS-AC-013/014のclosure/unknown fail-close oracleを照合し、L2-058の選択source semanticsへ限定。 |

### 要件候補

各呼出しで対象scope、選択source identity/operation、source/contract version、data-use permission、selected connector、既存001 contractを受け取る。選択/未選択と選択理由を示し、選択source依存閉包を確認したLABO observation、unobserved sources、receipt failure/missing reasonを返す。常時要件は001 provenance/identity/revision/status/scope/data-use/authority/version/no-source-write。source-specific connector/safety closureは選択したsourceだけ必須。複数選択なら全選択sourceの閉包を満たす。

### 受入条件候補

- **LABO-058-AC-01 — 正常・trace**：Workerだけを選択した呼出しではWorkerのconnector/permission/version/result contractを要求し、未選択BRAIN等の接続稼働を要求せず、選択/未選択と理由を表示する。
- **LABO-058-AC-02 — failure/owner boundary**：選択sourceのmissingは未選択へ変えず、未選択/unconnected sourceはunobservedのままにする。選択またはscopeがunknownなら呼出条件へ戻す。選択sourceのpermission/version/scope/receiptが欠落・不一致なら該当inputを拒否し、source ownerまたはSECURITYへ返す。Bench評価済み、assignment permission、全source完了を主張しない。001の本文/outputは変更せず、source選択条件だけを補う。source未選択はpermission不明データの取込許可にならない。Web/WEB-OSは選択時だけ既存採択source contractを要求し、外部取得2.0を1.0へ前倒ししない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 呼出しscope/selected source/operation/permission/versionを入力として選択理由とunselectedを表示 | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C02` | 入力集合と選択/未選択一覧が一致 |
| 常時001 contractとselected-source dependency closure | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C03` | 選択した全sourceの接続/安全/版条件を検査 |
| unselectedはunobserved、selected-missingはunmet dependency | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C02`, `L10-LABO-058-C03` | 未選択≠成功観測、選択欠落≠未選択化 |
| unknown selection/permission/scopeは確認に戻し、no selectionは未許可取込を許可しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C04` | 入力成立拒否と戻し先、unauthorized intake 0 |
| WEB/WEB-OSは選択時だけ既存contract、external 2.0を1.0へ含めない | `LABO-058-FR-01 / LABO-058-AC-01/02` | `L10-LABO-058-C05` | 未選択時の実稼働依存0、2.0 external intake 0 |

## 未承認事項

Stage 2bの31件すべてについてFR/L10 pair候補を記したが、部分草稿・未承認であり、機構全体のL3完了や実装/releaseを意味しない。個別parameterの承認gateを作らず、L2の意味/scope/owner/versionを変える場合だけL2へ戻す。
