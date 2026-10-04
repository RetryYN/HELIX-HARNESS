# HELIX-LABO L3 機能要件（1.0対象親57件の草稿）

**状態：部分草稿・未承認。** この文書はStage 1、Stage 2a、Stage 2bの31件、Stage 4 LABO-L2-036/037/038/039/040/041/052/054、Stage 5のうちLABO-L2-050/059/060/061/063/064/065/066/067/068/069/070/071だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する範囲に従い、1.0の実装・release許可を意味しない。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64`（`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`、全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## LABO-001-FR-01 — HELIXLABO-L2-001

### 親revisionとauthority

- 採択登録 `MPR-RC-HELIXLABO-L2-001-001` / semantic digest `27b001d93a39c0a7f2b3b6d89e8acc5777015224c2a18f222f1e32e8933bdc4a`。
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
- **LABO-001-AC-02 — 異常・境界**：元sourceに存在するfailure/rejected/cancelled/blocked/unknown/not_observedをsuccess-only projectionで除去する、unknownをsuccess化する、必須observation fieldを欠落したまま成功扱いする、既知の古いrevisionをcurrentとして偽装する、scope外/secret dataを取り込む、LABOからsource stateへwritebackする場合は不成立。該当observationを保留しsource ownerへ返す。元source上で対象期間に非success eventが存在しない正常ケースは拒否せず、その期間にstatusを追加生成しない。旧BR21-09の部分破損時に他sourceを維持するfailure類型は参考にするが、旧dashboardの4 source/5 metric/30秒poll/token costは移さない。旧L3 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22-34`と`business-detail.md:137-145`、旧対のtest design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`を調査したが、現行cross-mechanism observation planeに直接一致は確認されなかった。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| source input・observation output：許可sourceごとのidentity/revision/attribution、L2のepisode_idからresultまでの全20 field | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C01,C03,C04,C08,C09` | 20/20列挙fieldとexact current/historical source revision |
| 状態網羅：実在するsuccess/failure/rejected/cancelled/blocked/unknown/not_observedを区別し、成功だけに投影しない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C01,C03,C08` | 存在statusの個別識別、sourceに存在する非success eventの脱落0、未発生status捏造0 |
| source authority境界：canonical state/authorityはsourceに残し、LABO observationを書き戻さない | `LABO-001-FR-01 / LABO-001-AC-02` | `L10-LABO-001-C05,C06` | 許可外入力hold、source writeback 0 |
| 部分失敗・field欠落：一sourceの破損/欠落または必須observation field欠落は当該observationを成功扱いせずsource責務へ戻し、他sourceを捨てない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C02,C10` | 当該source/observationのwarning・holdと戻し先、他source valid recordの保持 |
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

- 採択登録 `MPR-RC-HELIXLABO-L2-011-001` / semantic digest `39d5c13584a1a339660788e79c9fab9b3ad688675587c3d8510fe65153505724`。
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

### Stage 5 — HELIXLABO-L2-063/064/065/066（部分草稿）

このcheckpointは担当4 identityを、main `633bf12`の現行PO判断・親L2/L11本文に束縛する。親とL11の全体SHA-256は、それぞれ `docs/helix-labo/L2-requirements/labo-requirements.md`=`cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`、`docs/helix-labo/L11-acceptance/labo-acceptance.md`=`39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`。採択状態はPO判断行とregistration revisionで判断し、候補本文中の過去status記述から採否を再推定しない。PO記録 `po-decision-2026-09-29-57candidates.md`（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）の78–81行を固定する。

| L3 ID / 親 | PO固定revision | 親L2 span | L11 span | 旧source／対応分類 |
|---|---|---|---|---|
| `FR-LABO-L3-063` / `HELIXLABO-L2-063` | 採択、`MPR-RC-HELIXLABO-L2-063-001`, semantic `274ea8f4562f7677b90f72bdbc8ba474540fdb74e3f6ff9e6632ad1274566c1a`, decision L78 | 480–490, raw `bb239f6a98b11cba1bc8bb3a8f0f42563f377594e8018c644808a8b5d0bf3416` | 225–231, raw `5e7c8afa50b3f430b01b641f145abee034e0b4ef87af3a4146c820c9c9aea174` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, old Pillar L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` full `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`, line155 raw `bacb965380167dbc0492aad52ed470f67181d3b3569c2a39282b2184546acb25`, HAC lines239–240 raws `dc642e7c08ec73e65df01901400f8d66ae661822ddcfcb4dedbd949041eaf06c` / `280ca5e578cb185f616b560c69fd8582983d51c0e85b5a196d4b466ce857b18e`; `LEGACY-ASSET-44DD86E3DEC09E65EF51`, paired old acceptance `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` full `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`, HAT-P4-02 line112 raw `7e567d6913cb01071968d1f08e6f8e48883e57f2174af8c043408734e5e0ac9e`. Reuse success-recipe retention, recurrence evidence, candidate/warning and backlog handoff; rederive knowledge ownership per existing HMC-BR-003 and keep OS registration/owner action separate from LABO evaluation. |
| `FR-LABO-L3-064` / `HELIXLABO-L2-064` | 採択、`MPR-RC-HELIXLABO-L2-064-002`, semantic `e28da5b2f47c3d1327cc091003d14a7ab572a3282040b2ed7ec6614dae7079b8`, decision L79 | 491–502, raw `0c391b9afc6be1919e99ffd98bcf09beec0998e19c5b7316eb5c623c677b2969` | 233–239, raw `4f51be505b3c169f08aa61c2dd192b21b1b185db0f5243f556853bcb3e1a1fe3` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`, old `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` full `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`, HIL-NFR-35 line215 raw `930a87db86581b1433c4682bb626b9a83100503594f6447e3c2be2fd6860ec59`; `LEGACY-ASSET-AFE91778057B7E76BEEC`, paired HOT-HIL-54 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md` full `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`, line81 raw `345fb8f509ac7b83f43b3225b07dea96d6ba1e86e985d32839624c645c88e157`. Reuse selected-scope blinding, fixed condition versions, smoke/full distinction and no averaging of severe failures; rederive only the current L2-064 masking/reproducibility boundary, without old runtime/admission behavior or global blind scope. |
| `FR-LABO-L3-065` / `HELIXLABO-L2-065` | 条件付き採択D1（first Attemptは067と別）、`MPR-RC-HELIXLABO-L2-065-001`, semantic `6f50887b94a8d3341c55700393896798cc1273324a868071447bf0e5a95cf019`, decision L80 | 503–517, raw `60692c91117266c2fb4e4a5743bcc81bdc632d4e262e454a914b0d893ff812de` | 241–259, raw `c70905fd036f0c6e6bfdce0368e462cd85acd467354bcad599d1112634d9b1b6` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`, old HIL-FR-61/62 `infinity-loop-platform-requirements.md` full `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`, lines151–152 raws `dc1b368f1d53bf63c6d3c8d1b07e27f96da1c195ff4518860eece988d706e909` / `165fb38a830b748ec1ac1df3426af6e08a326af7d7d5380de48be7452a92ea9f`; paired `LEGACY-ASSET-FA8C6E69463183D6A19B`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md` full `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`, HAT-HIL-22 line54 raw `6397d2f4f365c8d02765d5cd55917e6badc2e4279c9cf2517e4e925616fdbaf5`; paired HOT-HIL-54 above. Reuse selected-scope smoke/full separation and named 8-axis/scorecard observations, with current L2/L11 owner, field, and scope rules; old runtime/provider/admission and universal sample thresholds are replaced by evidence-only current candidates. |
| `FR-LABO-L3-066` / `HELIXLABO-L2-066` | 採択、`MPR-RC-HELIXLABO-L2-066-001`, semantic `d65780351792a4587966a7eb45c34359626200af5bdd8eb55e197b0a6f0db184`, decision L81 | 518–528, raw `5a67776a3f4567fa662c86898caf275fddbe8dc806fd3a19622cae9f733cdb69` | 261–267, raw `0a1d72d7d0fb3b97b14ce6f53738785b76bce642a2f9b7c83c4328a45fc68cce` | `LEGACY-ASSET-D881AF6AFD277B1DE934`, historical candidate requirements `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md` full `81dc848cde93395e5cf5e49d5545856f482403d41c7eae75cae993a9c4229dbb`, selected line75 raw `678d10fb645494bf12216a7dd4a4ff9f45a6cb88e4dfc6d7d23d9de30a15fbe8`; `LEGACY-ASSET-901CD182B52024593E41`, historical candidate acceptance `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md` full `cd2fdd3dcfaa98935db0fef6b876d6cdb7133b11b8c8877363c3d0138c4b8cbc`, BBR-AC07 metric line28 raw `fabeeb1b2f40135a6dc64bca8d0e030b06ff4eb8371094132f5acb28d32f42c2`. The old L3/L10 candidate had `approved_pending_canonical_promotion`; its 1642 decision does not create current authority. Reuse only its selected same-condition cost/time/rework/error-count atom as current L2 directs; rederive shared eligible denominator, oracle evidence, unknown handling and owner boundaries from current L2/L11. |

### FR-LABO-L3-063 — 成功修復知見と再発候補

`HELIXLABO-L2-063`はadopted `version_target: 1.0`。修復対象/版、原因候補と適用条件、修復手順・結果、独立検証、再発防止根拠を受け取り、裏付けのある成功recipeだけをLABO評価知識へ結ぶ。母数・閾値・反例が不明なら頻出とは断定せず、親から与えられた適用条件で反復を集計する。閾値以上を確認できた場合は、予防条件を組み込む候補と根拠・適用範囲・反例・残検証義務を、LABO-010 Feedback契約を介してOSへ返す。未処理の頻出問題は見える警告にする。OSの登録/routing、HARNESS ownerの候補採否・実装、target変更、変更後検証と運用後再観測を別stateとして保ち、成功終結・candidate作成・backlog登録を循環完了にしない。LABOは修復、gate強制、owner判断を行わない。

- `AC-LABO-L3-063-01`（正常）：独立検証済みrecipeと対象版/適用条件を同定し、同じ原因・条件の反復episodeだけを、親が指定する母集団/threshold basisに基づいて数える。予防candidateとOS Feedback登録、未処理時のwarning、target ownerの判断、変更後検証、運用後観測を因果系譜内で区別する。
- `AC-LABO-L3-063-02`（独立反例）：未検証の修復案を成功扱い、再送を複数episode扱い、異なる原因/適用条件を混合、親の閾値/母集団不足を0で補う、頻出findingを候補もwarningもなく落とす、registration/target changeだけを予防完了とする、LABOがgateを直接有効化する、harness/provider memoryを修復知識の正本へ戻す、特定問題の未評価知識をBRAIN汎用構造や実行権限へ昇格する各変異を拒否し、担当ownerへ戻す。
- `AC-LABO-L3-063-03`（未見・再評価）：新しい原因または改版recipeの適用範囲が未確認ならunknownを保ち、旧成功数を現行有効性へ流用しない。適用範囲を検証できるまでLABO評価を未完として保持する。

### FR-LABO-L3-064 — 選択比較scopeの候補名遮蔽と固定条件

`HELIXLABO-L2-064`はadopted `version_target: 1.0`。比較に明示選択されたrunだけで、元のruntime/model identity・版は記録側に追跡可能なままjudge提示情報から候補名を遮蔽する。fixture/rubric/judge version/sample/retry条件を比較前に固定し、judge可視範囲と各版を証拠に結ぶ。露出、可視範囲不明、条件変化は該当比較を不成立にし再評価義務をevaluation ownerへ戻す。通常履歴の保存にはblind compareを一律要求せず、smoke、評価、assignment/admissionを混同しない。LABOはWorkerを起動せずassignment/admissionを発行しない。

- `AC-LABO-L3-064-01`（正常）：選択比較pairでjudge-visible fixture/output/metadataを照合し候補名を隠す一方、元identity mappingを制限された記録に保持する。fixture/rubric/judge version/sample/retryが事前固定の同一条件であるときだけblind比較結果を返す。
- `AC-LABO-L3-064-02`（独立反例）：候補名を資料へ直書き、添付/metadataへ混入、judge可視範囲をunknown、または5条件を個別に欠落/変更させる。さらにsmokeのみでfull適格性、重大security/scope/unknownを平均点で相殺、評価だけでassignment許可を出す変異をそれぞれ不成立にする。
- `AC-LABO-L3-064-03`（正常境界・未見）：通常履歴の記録scopeではblind compareを強制しない。新runtime版/新出力形式でjudge-visible範囲に不明点があれば過去blind結果を継承せず、当該比較だけを再評価へ戻す。

### FR-LABO-L3-065 — 選択資格scopeと実task scorecard

`HELIXLABO-L2-065`は条件付き採択D1。first Attempt結果は067のfirst-eligible/同Attempt内repairと別指標として維持する。選択candidate-runtime資格scopeでは、task/fixture/oracle/rubric/scorer/runtime版、OS assignment/result receipt、judge-visible境界を結び、machine smokeとblind full-benchを別出力にする。full-bench成立候補は8軸（correctness、mutation kill、instruction/scope following、skill A/B、quality、concision、security、second-diff extensibility）を同一選択fixture/版とrubric/oracleで一つずつ示す。資格選択のない通常Worker履歴へfull benchを課さない。実task scorecardは親が要求する6 fields（first_pass、retry_count、proposal_diff_size、lint_violation_count、quality-judge result、effective cost）をtask/scope/attempt receiptへ結ぶ。適用外は理由、適用されるが欠測/判定不能はunknownとし、根拠なく0にしない。 選択済みの同一task class/scope/測定定義/revisionに限りtrendとfailure findingを出し、条件の異なるtrendを混ぜない。quality/costとdecision ownerへのhandoffは採択済み059の条件を再利用し、LABOはqualification/admission、実験、採否、配置を決めない。採択済み061/064の要件は各適用scopeで参照し、hidden oracle隔離と選択blind比較の範囲を通常作業へ一律依存として広げない。

- `AC-LABO-L3-065-01`（正常）：明示選択された資格scopeでmanifest、assignment/result receiptと全8軸の個別判定を同一fixture・oracle/rubric revisionへ結び、machine smokeとblind full-benchを別々に返す。別task scorecardでは6 fields全部を定義/単位/tool版/receiptとともに記録し、初回失敗後2回目成功は`first_pass=false`として保持する。既存decision ownerの採否は参照のみ。
- `AC-LABO-L3-065-02`（独立反例）：8軸それぞれの欠落/版ずれ、manifest/digest欠落、smoke-only full claim、異なるfixture/rubric条件混合、candidate/hidden oracleのvisible leakを個別に投入する。scorecardでは6 fieldsを一つずつ欠落・適用外根拠なし・unknownを0化・retry成功をfirst passへ誤記・costからretry/救援/reworkを除外する変異を拒否する。いずれも当該scope/metricのみ未完にし他軸で相殺しない。
- `AC-LABO-L3-065-03`（正常境界・未見）：qualification scope未選択の通常Worker作業は履歴scorecardを記録できるがfull benchを要求しない。新runtime/task class/fixture/rubric版は既存資格を継承せず、適用oracleまたはdiff/lint定義が未確認ならunknown/未評価としてownerへ戻す。

### FR-LABO-L3-066 — A比較の誤修復・未解消件数

`HELIXLABO-L2-066`はadopted `version_target: 1.0`。採択済み059の品質優先、比較条件、費用・時間・手戻りをそのまま使い、Aと修復候補の同条件比較に誤修復数と未解消数を分母/oracle付きで加える。比較前に固定したA identity/version、対象scope/revision、重複を除く共通eligible case集合`N`、適用oracle/scorerとrevision、同一protocol/toolchain/environment、期間/cutoff、各case結果receiptがそろう場合、両群別に`misrepair_count/N`と`unresolved_count/N`を分子・分母付きで返す。両指標は重なる場合も別々に数える。unknown/欠測/重複を結果を見て分母から外さず、oracle不能・receipt不足は比較未評価にする。旧候補の承認済みpending-canonicalization stateは歴史として記録されているが、current authorityとして継承しない。LABOはAを命名推定、修復runを起動、権限/採否/採択を行わない。

- `AC-LABO-L3-066-01`（正常）：結果を見る前に両群へ固定した同一eligible setとoracleを適用し、各caseの判定receiptから2群それぞれの誤修復数/`N`と未解消数/`N`を分子・分母付きで返す。059の同一scope費用/time/reworkを保持しunknown理由も示す。
- `AC-LABO-L3-066-02`（独立反例）：A/候補のcase集合・scope・oracle・protocol・cutoffを変える、結果後に`N`を変更、重複/unknownを黙って除外、oracle receiptなしでcount確定、分子だけ表示、費用や誤りを成功/安価さで隠す各変異を比較不能/未評価にする。unknownは0にしない。
- `AC-LABO-L3-066-03`（未見・戻し先）：A identity/version、oracle applicabilityまたはcase結果receiptが初見で不明なら一般化せずownerへ戻し、その比較だけunknownにする。未決のA定義や許容thresholdをL3で補完しない。

### Stage 5 — HELIXLABO-L2-067/068/069/070/071（部分草稿）

この追補は基準main `633bf12`で固定した5親と各PO decision rowに束縛する。採択対象のL2全文SHA-256は`cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`、L11全文SHA-256は`39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`。067–069は9/29 decision rows 82–84、070/071は`docs/governance/decisions/po-decision-2026-09-30-live26.md` rows 49–50の各exact registrationを固定する。本文中に残る古い採否表現は時点記述であり、採否は固定PO判断revisionで扱う。特にL11-069行290の「未採択」はPO decision L84（採択）より前の記載として扱い、現在の採否へ引き継がない。

| L3 ID / 親 | PO固定revision | 親L2 span | L11 span | 旧source／対応分類 |
|---|---|---|---|---|
| `FR-LABO-L3-067` / `HELIXLABO-L2-067` | 条件付き採択D1、`MPR-RC-HELIXLABO-L2-067-001`、semantic `d39bc9f0a20fb6159bf701cf65d38213935d8d00a9e0189c1b81078bdb8d4784`、decision L82 | 529–540, raw `bf545a7b5e4714f442c4f96cec498ac07056f314b13765fc05ad049b69a8c188` | 269–276, raw `7a9adc0a54e009ca370033d5b2a88f8b53bf79a99ff146352169d055ff46d331` | `LEGACY-ASSET-3A15E5645D2D2A59DFF5`、旧execution-ticket candidate `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399` full `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`, raw `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`; 旧対test `LEGACY-ASSET-BE8B151A0094B754FF20`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:84–86` full `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`, raws `1d10fca6ff8162c621da8ce6ebd546163f137143d8fb33b78677e2795618fa37` / `67ddb8e6722d5f5de0c6cc254a015e01cf29e86b00f7d7a9e850aab1e980839a` / `8628b4db2348da879eed9e5daa9ba32f35959bd91bbe326301ca503453da87ca`. HXB-AC-001/002/003はevent intake・起動前拒否・重複/orderの隣接oracle。first-eligible境界と同一Attempt repair roundsだけを保持し、旧runtime/policyは置換。 |
| `FR-LABO-L3-068` / `HELIXLABO-L2-068` | 採択、`MPR-RC-HELIXLABO-L2-068-001`、semantic `7e3df32b0131722c88ae148c4cbfa9a1be20f81826099c0ceb29a674e07030e2`、decision L83 | 541–551, raw `fc2b03eb022dd91a46cee3ab49d2e9b297d053ab3f5201ca0794bb9ecfcfa1d4` | 278–286, raw `3dcf068de1351b2e8c1f2d772ec9273cb7908368a32b389ee40ce51929ad8d94` | `LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399` full `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`, physical raw (LF込み) `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`。S3Cの総distinct Attempt countだけを選択。旧対test `LEGACY-ASSET-BE8B151A0094B754FF20`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:85–86` full `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`, raws `67ddb8e6722d5f5de0c6cc254a015e01cf29e86b00f7d7a9e850aab1e980839a` / `8628b4db2348da879eed9e5daa9ba32f35959bd91bbe326301ca503453da87ca`。起動前拒否とduplicate/orderは隣接oracle。067 repair-round atomと区別し再導出。 |
| `FR-LABO-L3-069` / `HELIXLABO-L2-069` | 採択、`MPR-RC-HELIXLABO-L2-069-001`、semantic `605acfa9ec39bbdc0d964f3bf3c644122f1c081c202ddea48fe682ac31be5bc9`、decision L84 | 552–560, raw `0cd188238560cc07f0f24c675d290f11d57392e7528cfc1c0e530034a91c25cf` | 288–295, raw `d1cc8c180bab90b84ef6300bf91c79d622cff416a596131fe0b1843fd6aa61db` | `LEGACY-ASSET-3A15E5645D2D2A59DFF5`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:319` full `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`, physical raw (LF込み) `69d2c0a4cb59e7b85d25745a78823d614869d15923aa0d5793a3f50263d2e476`; paired `LEGACY-ASSET-BE8B151A0094B754FF20`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:96–97` full `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`, raws `186fd527748fea12548f328efd3a2c20fa7b94d296d38f42f0df6260577ee2e3` / `f9fb03451ee791b8979ecfba467df5d37d407f21576e83e1cc0b824a8a83f0f4`; `LEGACY-ASSET-F6E9EA3422A0EF1DF090`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/feedback-lifecycle.md:24`, full `2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655`, physical full-line raw (LF込み) `5afb8c01c5f3705e0c8ee690ca4f302db5cb3e2907b3ae1e12c93b773e2bdcb4`, selected sentence span raw `bd4055aba638835af6b305faf044e70c4b71c5322f9fee903e49e40f070db809`. 元closure保持・後日finding relation・観測途中を0扱いしない・件数減少を品質証明にしない点を再利用。返却率/理由別傾向/再発行後成立metricは`docs/governance/audits/requirements-stage/ops-o1-o2-request-source-snapshot-2026-09-29.md:12,14`（full `c09a32e8daf3ffe03a6bbe358f9c1cc5483613beac4ae7090b36bf5d2d1475fa`、raw `39c8d57586a72ce09b576d31fa3e4493fbe37d3ad3db463b15089511ca1176d1` / `d13f3c7082ac0ade2174914381d1569bcf103052842635ea9520bdd83192ddac`）由来の新規候補案で、Claude review-handoff summaryを写したtask-input snapshotである。これを固定したcoverage receipt `docs/governance/audits/requirement-registration/ops-o1-o2-coverage-receipt-2026-09-29.json` (SHA-256 `b3bde2d942f62470f7a3a45b09b1b6a4e6ce4b6e6e5aac7d77897f24f041d164`, HELIXLABO-L2-069 object)は旧atomをexecution-ticket-requirements.md:319とfeedback-lifecycle.md:24の2箇所に限定し、返却率/理由別傾向等の新metricはlegacy atomとしていない。直接PO発言・旧source継承ではない。 |
| `FR-LABO-L3-070` / `HELIXLABO-L2-070` | 採択、`MPR-RC-HELIXLABO-L2-070-001`、semantic `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、decision `docs/governance/decisions/po-decision-2026-09-30-live26.md#L49` | 561–575, raw `82b94ab1ed63d1ab15476e61bfd4fec07c202a2b5874d5f3dffa6161969da064` | 297–307, raw `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1` | `LEGACY-ASSET-3A15E5645D2D2A59DFF5`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399` full `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`, physical raw (LF込み) `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`。旧対test `LEGACY-ASSET-BE8B151A0094B754FF20`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:92–93` full `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`, raws `02719c58b487f18b1e0156def14facb9a58ca87e2ae8b4e05923003e510af883` / `bc87d8f4873189a159373e33a40d8b334b36b9dc05c97e0349a4922f1efb0e62`。旧12指標の保全・same-raw-receipt再計算だけ類例。9 selected atomの範囲だけを再利用・別metricとして再導出し、legacy 12指標へsilent renameしない。source holdingのunselected atomsはclosure対象にしない。 |
| `FR-LABO-L3-071` / `HELIXLABO-L2-071` | 採択、`MPR-RC-HELIXLABO-L2-071-001`、semantic `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`、decision `docs/governance/decisions/po-decision-2026-09-30-live26.md#L50` | 576–584, raw `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` | 311–316, raw `1f8ef8bdb0a6daf2a0e24fb2150fd28c3339d33bd45537a1d039d563264d9655`（qualification状態・対象範囲・独立field、失効/unknownと差戻しの受入意味）。PO承認pin `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0`は承認記録のpinとして保持し、本文rawとは区別する。heading 309 raw `b7e7604c7edb78f57b1b88939ecdf11f5298e1062d1b937395ef8d0ab2fffc9c`はlocator。 | `LEGACY-ASSET-A6926200F28B26300432`, 旧L1 request `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:69`, full `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`, raw `c3b70c8c3575ca3b19b5dee7e744734ecb5386a8c0c369458dfd4f40b662de91`; `LEGACY-ASSET-A26561A0EF7396D8F017`, 旧L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:77–79`, full `4b388cda67484f1808b0f4b8834d5d234a47de49f7db6dcb12d92d2dcfbee185`, raws `f8dfb5ab87b7220bfbb7d5d78ada51a0399043e6c4e0a6dd274efdd09f53f1c8` / `cc0b46f34174d0c0a0ed872c44483819bb58437447523b9323a54e956ed73265` / `010ac3303a57dc15e01b84705964f23b984ebe3555d35a932467a3d06739e85b`; `LEGACY-ASSET-E9D6CA411D75485A0984`, old paired acceptance `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/three-lane-cloud-governance-acceptance.md:45–47`, full `785421188d23f371290ff5bacecba6c5215e7baa66110c461f548cae8f6a2fc7`, raws `eef5033c617d2a7657bea863de2fc010bbff8e037ee1ae82b4a6a5393af6c9b7` / `0048194b441ac3aabfab7fbe56235f25079dc124ef0ba98a1ab49cc188e6c57c` / `25b1395ea48b3f72ad380714d6b5472a49489f187423f833a0de4ccf6d21e8df`. Keep class/revision qualification, identity separation, major-miss/revision invalidation; replace old fixed classes, lifecycle stages, expiry and write authority. |

### FR-LABO-L3-067 — first-eligible resultとAttempt内修復round

選択task/scope/revisionで既存task contractが定めるeligibility predicateとrevision、候補identity/digest、candidate event、適用oracle/revision、OS assignment/Attempt identityとresult receiptがそろう範囲を観測する。結果を見る前のpredicateで最初にeligibleとなったcandidateとその既存oracle結果を保持し、同一Attempt内の後続candidate変更・repair roundを順序と前後digest付きで記録する。別Attemptは分ける。総Attempt countは068に属し、first-eligible/repair roundと065のfirst_pass/retry_countは換算・統合しない。候補metric名は`first_eligible_candidate_result`と`same_attempt_repair_round_count`。

- `AC-LABO-L3-067-01`（正常）：事前固定predicate/oracle版、OS assignment/Attempt A、candidate A→B→Cの順序と各digest/result receiptを入力し、Aが最初のeligible candidate、B/Cが同Attempt修復として記録される。各metricが別grainのreceiptへ結び、065 first_pass/retry_countと068 total Attempt countを併記しても換算しない。
- `AC-LABO-L3-067-02`（独立反例）：predicateの事後選択、predicate/oracle版またはcandidate digestの欠落、順序不明、duplicate event、Attempt境界越え、final candidateからfirst-eligibleを逆推定、round欠落を0化、最初のresultを後続passで上書きする変異を個別に与える。該当観測だけunknown/未評価にしsource/OS/task ownerへ返す。
- `AC-LABO-L3-067-03`（未見）：新task classまたは新predicate/oracle版で既存eligibility条件の適用性が不明なら適格条件を推測せずunknownを返す。既存値は担当owner確認まで未評価。

### FR-LABO-L3-068 — distinct OS Attempt count

選択task/scope/revision/evaluation windowのOS assignment/Attempt identityとstatus、result receipt、記録完全性・訂正履歴から、各distinct Attempt identityを一度だけ数える。Attempt境界が不明、event欠落または記録complete性が確認不能なら観測された部分数を総数・0へ昇格せずunknownとする。実行前拒否でAttempt identityが存在しないintakeは別状態に残す。retry policy、成功rate、067 repair rounds、065 retry_countは算出しない。

- `AC-LABO-L3-068-01`（正常）：同じ選択範囲にOS receiptが完全と示すAttempt A/B/Cと、Aのduplicate deliveryを入力する。distinct countは3、各Attempt statusはsourceどおりで、duplicateは二重計上しない。
- `AC-LABO-L3-068-02`（独立反例）：identity欠落、scope外混入、duplicateを別Attempt扱い、実行前拒否の偽Attempt、event gapを0扱い、067 roundまたは065 retry_countからAttempt countを推定する各変異を個別に投入する。完全性不明なら総数unknown、他の不変な範囲の有効recordは維持する。
- `AC-LABO-L3-068-03`（未見）：訂正eventが遅延、移管後lineage不明、same identityの重複と別Attemptを区別不能の場合は総数を確定せずOS record ownerへ不足証拠を返す。

### FR-LABO-L3-069 — ticket返却・再発行後の評価状況

OSから与えられたreturn finding、理由分類、対象ticket/scope/revision、観測母数とsource completeness、元ticketへの根拠付きrelation、再発行後の同一scope verification結果を受け、return/reason別傾向と後続成立・不成立・未評価を分母/window付きassessment candidateとして返す。時間や同一pathだけで因果を断定せず元closureを保持し追補assessmentとして出力する。件数減少だけをquality proofとせず、観測窓未満・未追跡・打切りをdefect 0としない。新しいrate/window/thresholdは候補比較として示せるが固定親にない値を合否gateにしない。ticket発行・routing・priority・oracle・placementはOS/既存ownerに残し、LABOは変更しない。

- `AC-LABO-L3-069-01`（正常）：異なる理由class別にsource-complete cohortを構成し、closed ticketの後日findingと根拠relation、元closure、再発行後の検証receiptが結ぶfixtureを与える。出力は同じscope/revision/windowの分母と理由別return count、検証成立/不成立/未評価を分け、closureを改変しない。
- `AC-LABO-L3-069-02`（独立反例）：時間近接/path一致のみで原因ticketを断定、異scope/revision混合、母数/完全性欠落のrate確定、観測途中・未追跡・打切りを0 defect、未実行を成功、件数減少だけでquality closure、再発行結果を元findingの因果効果と断定する変異を個別に与え、比較不能またはunknownへ返す。
- `AC-LABO-L3-069-03`（未見）：初見return reasonまたはoracle不足findingを入力し、source identity/reasonは保持して未知classを創作せず未分類/未評価にする。分類根拠不足はsource/OS ownerへ返す。通常ticket closeを長期観測window待ちにしない。

### FR-LABO-L3-070 — 補助telemetryとAttempt scorecardの併記

選択されたscope/revision/windowの9 source atomだけを対象に、queue wait、active time、review wait、Human wait、受入後escaped defect、rollback/Recovery、observer overhead、evidence freshnessおよびfirst-eligible/Attempt/repair系metricの併記をsource receiptへ結ぶ。4種の時間は分離し、二重計上しない。escaped defectは既存owner oracle、対象scope、適用revisionと受入後eventの確認を要する。rollbackは実操作せずevent/stateを観測する。overheadは観測自体に直接帰属する実測値、freshnessは有効なsource timesに限る。067/068値は各契約のreceiptとgrainを保持し、旧12指標とのidentity/version対応を創作しない。coverage/旧12指標relationはsource-held unresolvedのまま。

- `AC-LABO-L3-070-01`（正常）：全9 selected atomを必要なscope/revision/window/event receipt付きで入力する。4 durationが独立し、重なるwait区間があっても有効な個別duration fieldを保つ。escaped defectは適用owner oracleにより検証済み、rollback/Recovery statusとoverhead/freshnessの根拠へ追跡可能、067/068値は定義別に並び、059費用を同一receipt参照で一回のみ扱う。
- `AC-LABO-L3-070-02`（独立反例）：親は待機・実作業・review待ち・人待ちのdurationを個別に扱い、総所要時間の合算oracleを定義しない。4値を加算して未定義totalを出す、重複wait区間を二重加算/按分する、境界eventなしで推定する、欠測を0にする、事後oracle/window、未確認findingのescaped扱い、rollback costまたはobserver cost二重計上、overhead推計、timestamp欠落age確定、ageから採否/許可を作る、067 roundsを068へ加算する、旧12指標をsilent renameする各変異を個別に与え、該当fieldのみinvalid/unknownとする。4つの個別durationは各々の根拠があれば保持する。
- `AC-LABO-L3-070-03`（未見・部分適用）：選択scopeにevent/oracle/sourceがない項目は理由付きunavailable、scope不一致はunknownで保持する。未選択source/atomを常時requiredにせず、部分観測を完全scorecardとも宣言しない。

### FR-LABO-L3-071 — GitHub監査task class別model revision qualification

明示されたGitHub audit task class、model revision、評価範囲と根拠から、class/revisionに束縛したqualification状態を観測記録として返す。称号、qualification、permission/authority、assignment roleを独立fieldで保持する。major missは該当資格を失効させ、model revision更新は旧revision資格を新revisionへ継承させない。新revisionの資格は独立した評価根拠が揃うまで未評価とする。major-miss rubric、数値threshold、class既定集合、再評価schedule、provider/lane、permission/assignment変更は追加せず、qualification失効をpermission失効と同一視しない。

- `AC-LABO-L3-071-01`（正常）：既知task class/revisionに対する評価証拠とqualification stateを対応づける。称号・permission・assignment roleは別fieldのまま、結果はそれらを変更しない。
- `AC-LABO-L3-071-02`（独立反例）：major miss後も資格有効、model revision更新後の資格/score/称号継承、class/revision/evidence scope不一致、称号からpermission発行、qualificationからassignment生成、permission状態とqualification状態の混同を各々変異する。該当qualificationだけ失効/unknownにし、権限状態は既存authority ownerへ残す。
- `AC-LABO-L3-071-03`（未見）：新task class、初見model revision、major-miss有無を判定する根拠が不明ならunknown/未評価とし、既存classや同名称号から補完しない。source ownerへ不足評価根拠を戻す。

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

- 採択登録: `MPR-RC-HELIXLABO-L2-055-002`, semantic digest `7796690dfd399e1f5d0cccddde8c7aeabb5da5dd2d8ab7edcdd3e71e74e84065` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 451, row SHA `7e7d4868c33fd35b35741cae55d295e7ed6f1ad42df23cef5e10b4c718b1af88`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 58, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 150–155行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `f6c97eeef48634ec11fc36f849763a35da358f5ce89490f6c785c9f67b4575c7`、heading「### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）」
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` line 56（raw SHA-256 `9e169e5f6a6eead24677031a479dba94060fe6916e76f4e3b1508527880f13c5`、未知jobを履歴だけで成功保証しない）と採択追補191–197（全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、span SHA-256 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c`）、heading「### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠」

### 要件（候補）

依存は許可されたLABO observation (L2-001/028)、Worker historyのtask type/model class identityと評価可能な実績（必要に応じL2-006）で、`version_target: 1.0`とする。許可されたWorker historyをtask class / model class / declared scopeごとに評価し、評価した出力にはeligible denominator、算入結果、欠測/失敗/拒否/停止/unknownの処置と算入・除外理由、metric/scorer-oracle revisionを結ぶ。定性的水準も適用条件・根拠・未評価部分を記録する。評価していないclassを未評価と表示する。特に履歴だけで未知jobの成功を保証せず、新task class・source・scorer/oracle版は適用性が示されない限り未評価を保つ。結果確認後にdenominator/scopeを変えない。Benchは配置案、Worker/modelの選定・指定・割当て、authorityを作らない。

### 受入条件（AC候補）

- **LABO-055-AC-01 — 正常・追跡**：同一の許可snapshotとdeclared task/model class/scopeから評価結果を再構成できるよう、eligible denominator、各resultのdisposition、metric/scorer revisionと判定理由が揃う。qualitative outcomeでも根拠とunassessed subsetが追跡可能。
- **LABO-055-AC-02 — 異常・境界**：failure/missing/unknownを理由なく分母から落とす、未知jobを履歴だけで成功保証する、新task class/source/scorer版の未評価を過去水準へ流用する、欠測費用を0扱いする、result確認後に母数/scopeを変える、根拠/採点版なしに水準を出す、major failuresを平均で相殺する、未評価を評価済みにする場合は不成立。scoreで配置/割当/権限を生成しない。

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

- 採択登録: `MPR-RC-HELIXLABO-L2-056-003`, semantic digest `5965a1449b772ba7b53b1e47325a0f0ce77cbde29eb4f6d80c68c9911db48019` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 452, row SHA `90466597333d23a63fd5e33a28f2f8b18dac5ed2053c93908a14838dcf5d0d03`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 96, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
- 固定parent commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; version candidate `1.0 explicit/current PO-targeted candidate`; sequence `Stage 2a`.
- 固定L2親: `docs/helix-labo/L2-requirements/labo-requirements.md` 379–390行、全文SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、該当span SHA-256 `d8d9c30b52c338580f535a913a4b04d67f0d3d59d79eb2645ed33c911b1621c7`、heading「### HELIXLABO-L2-056 — 初回Worker結果のBench観測取込（単体候補、1.0）」
- 固定L11親: `docs/helix-labo/L11-acceptance/labo-acceptance.md` 138–147行、全文SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、該当span SHA-256 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed`、heading「### HELIXLABO-L2-056 初回Worker結果のBench観測取込」
- 採択済みregistration `MPR-RC-HELIXLABO-L2-056-003` の正確な採択親はPO decision `helix-labo-requirements-po-decision-2026-09-28.md` line 96の固定行SHAである。`helix-labo-stage-review-coverage-receipt-2026-09-27.json`（full SHA-256 `99e3d6df84dc8344ef4b6309bad471c02f7d62913e325896819d41ebe7335b3d`）は審査範囲・先行追補のcoverage文脈として参照し、receipt内の先行candidateを`-003`採択根拠へ読み替えない。`-003`が採択したL11追補198–203のraw inclusive span SHA-256は`24d96629585ccb7f8bb248f7748d06575c3af38f892753d306733eb9609bb1e0`（同じ固定L11 full SHA）。追補は観測済みと評価済みを分け、適用可能なoracle/基準revision・scope・判定・比較・result/failure/unknown・evaluator/time/receiptが揃う範囲だけ評価済みとする。

### 要件（候補）

許可されたfirst Worker resultをticket/assignment/attempt, task/Worker/model identity, 実行契約revision, request revision/scope, run identity/result state, verification/human-confirmation, data-use class, source receiptへ結び、receiptのmodel/source/revision/scope/run identityを実際のrunと照合してBench履歴に観測済みとして追加する。success/failure/rejected/interrupted/unknownを区別しsource authorityを変更しない。観測済みと評価済みを分け、評価済みを出す場合は採用oracle/基準revision・適用範囲・判定条件・比較条件・結果・失敗/反例/unknown・評価者・時点および判定receiptが揃う範囲に限る。

### 受入条件（AC候補）

- **LABO-056-AC-01 — 正常・追跡**：許可範囲の各結果statusをsource provenanceとともにobservationへ記録し、受領receiptのmodel/source/revision/scope/run identityが実行recordと一致することを照合する。評価可能なoracleがない初回一件は観測済み・未評価のまま保持する。評価済みを付す場合はL2所定の根拠と評価receiptが全て辿れる。対象scopeに適用可能な評価oracle/基準revision・判定条件・比較条件・結果・failure/反例/unknown・評価者・時点・receiptが揃う正常caseでは、その範囲の評価済みを記録できる。
- **LABO-056-AC-02 — 異常・境界**：assignment/source/scope/classification/revision/verification/receiptの欠落、不一致、stale、重複、矛盾を暗黙補完/統合しない。single successやreceipt successだけでunknown taskを成功/qualified/evaluatedにしない。source canonical stateやassignment/worker eligibilityを書き換えない。新provider/model/toolchain等の未見条件で適用性が未確認なら観測記録を残して未評価とし、任意の期限や再評価間隔を足さず、不一致を「実績なし」へ書き換えない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力: OS assignment/ticket/task, Worker/execution contract revision, requested revision/scope, attempt status, evidence/classification/receipt | `LABO-056-FR-01 / LABO-056-AC-01` | `L10-LABO-056-C01,C02,C03` | 列挙入力field・source receipt |
| 提供: 初回resultをobservation historyへ追加; observation≠performance evaluation | `LABO-056-FR-01 / LABO-056-AC-01,AC-02` | `L10-LABO-056-C01,C02` | 観測状態と評価状態の分離 |
| 保証: 受領receiptのmodel/source/revision/scope/run identityを実runと照合し、oracle/scope/revision/conditions/result/failure/unknown/evaluator/time/receiptに基づく範囲のみ評価済み。必要証跡が揃う正常評価も許容 | `LABO-056-FR-01 / LABO-056-AC-01` | `L10-LABO-056-C01,C04,C05` | receipt-run一致、未充足証跡は未評価、充足時は範囲限定の評価済みreceiptを再構成 |
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

- 採択登録: `MPR-RC-HELIXLABO-L2-057-002`, semantic digest `4c8acbcfcf35bcdb62d6e5371141135b7a70da1d69115a41194065471b4fa63b` (`docs/governance/management-provisional-requirement-register.jsonl` main633 line 347, row SHA `fccb53bbca7f001259db848bc491deeb0f0b5cb5e5906e9bb13dcaa4b0a83e17`); PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md` line 97, SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
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

共通L11 acceptance basis: `docs/helix-labo/L11-acceptance/labo-acceptance.md`、基準main `633bf12` full SHA-256 `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`。lines 43–47 raw SHA `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b`、109–116 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`に加え、Stage2b採択row 012/027/028のspan 63–81 `fa8c0ca23fbd64e111de2fe2afbd71d742ab66515f00832fba46be54ff7e3e7d`、L2-007個別受入row 51 `afa339ed01fdff62267af2e2a4949cc57f0bdb194914c73a4089effa22420cae`、055 191–197 `c585c90b04dc2f8cf5c979ea4096a2c877029a234ce5f5154aac4267e23fa46c`、056 138–147 `b2c453c3cdc4aa99ee2df28d3c1a6c96dc2bd4d3d68d41c77ad49dc78243f3ed`、057 148–155 `ac433c56cece7fae90458ab3e3edf556425b90af8c1917ec60a1c61479bb3b60`、058 156–163 `f42d0cdbc001aeb26b91b0c1464f772c381cd7a4334908f24485c6847e802fcd`、055/056/058不変条件 117–124 `bb797b8f26fd6e27d18f5cd24bf367c45e2b944b1d40b2083e2d26fff090a6d0`をそれぞれ項目別に照合する。L2-007の詳細条件は固定L2の117–124行（raw `89aa2011a64af3475f1bf23f6e52d2622535c96b374bebbc6926c5bab280c84e`）であり、L11 locatorとは区別する。採択済み056 -003のL11 supplement 198–203は別pinとして扱う（上記056項）。

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
- 旧項目ごとの判定: 再導出。旧RCLS R-12/13/15のlifecycle・縮退・rollback条件を候補資料として比較。旧候補文書のstate machineは継承せず、変換語彙・meaning delta・owner/fallback条件はL2-005から再導出。

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
- **LABO-006-AC-02 — 否定・owner境界**：LABOがWorker選定/割当/起動、比較不能・中断をsuccess化、失敗/費用を捨てるのは不成立。一度の実行だけから改善と認定せず、異なる条件・証拠の結果を同一比較へ混ぜない。

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
- 旧項目ごとの判定: 再導出。旧RCLS R-12/15の段階飛越抑止/rollbackや旧Bench R-06のoracle evidenceは類例。L2-007が求める6条件（再現性、machine判定可能性、oracle、副作用限定、retry/rollback可能性、冪等性。retryとrollbackの可否は個別観測）を現行親から再導出し、旧昇格状態や閾値は移さない。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・候補承認済み／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–51 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `002b11ad0d60246e7bcf3b658c09f30c5bd472901cb5db482365b609a2d77142` | promotion/rollback/verification candidate例。旧候補承認を現行authorityへ継承せず、L2-007の6条件から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・候補承認済みpairのacceptance案／canonical昇格なし | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 頻度だけのpromotion否定例。現行L2の自動昇格なしに限り再導出。 |

### 要件候補

反復episode、実験証拠、rule candidate、oracleを入力し、operation継続とsystem化候補の双方を、再現条件・判定可能性・副作用範囲・retry/rollback/idempotence・oracle・例外/限界と共に評価する。評価段階は候補比較であって自動昇格/新承認gateではない。

### 受入条件候補

- **LABO-007-AC-01 — 正常・追跡**：再現性、machine判定可能性、oracle availability、副作用範囲、retry/rollback可能性、冪等性の6条件群を判定する。retry可否とrollback可否は同じ条件群の中で別々に観測し、欠落時は各々特定する。
- **LABO-007-AC-02 — 否定・owner境界**：反復件数だけのsystemization、oracleに意味判断の余地がある場合、例外が多い場合、不完全で期待値を確定できない場合の区別を無視した昇格、context-dependent/high-FP/overconstraint candidateの消去は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input repeated episodes/evidence/rule candidate/oracle、output operation vs systemization evaluation | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C04` | 両候補とoracle evidence |
| 再現性、machine判定可能性、oracle、副作用限定、retry/rollback可能性、冪等性の6条件群（retry可否とrollback可否は個別観測） | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C02`, `L10-LABO-007-C05` | 6群の証拠、retry/rollback個別状態・不足理由とoperation候補保持 |
| 自動昇格せず、文脈依存等はoperation候補へ | `LABO-007-AC-02` | `L10-LABO-007-C02`, `L10-LABO-007-C03`, `L10-LABO-007-C06` | auto-promotion 0、context-dependent候補保持、shadowとsystemization状態の分離 |

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
- 旧項目判定: 接続。固定親で保持する意味: episode、evidence、relation版を受けて分類対象を出力する。co-timed/co-located eventは相関candidateとしてのみ保持し、関係証拠なしの因果主張を作らない。根拠/unknownを保ち、relation版不一致は訂正sourceへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:26–31 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `a14894d6c566a1087e805ac26c9f2ebbd1acb5a09115e0dd8228bc147cd87739` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

episode、evidence、relation版を受けて分類対象を出力する。co-timed/co-located eventは相関candidateとしてのみ保持し、関係証拠なしの因果主張を作らない。根拠/unknownを保ち、relation版不一致は訂正sourceへ戻す。

### 受入条件候補

- **LABO-012-AC-01 — 正常・trace**：分類入力全てに元episode/source evidence/relation revisionが追跡できる。
- **LABO-012-AC-02 — failure/owner boundary**：relation版不一致、根拠欠落、unknown消去を受理しない。時間/pathの近さや相関だけから因果を確定しない。上流のepisodeとrelation authorityを変更しない。

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
- 旧項目判定: 入力接続。固定親で保持する意味: 各選択HELIX-CONNECT connection固有のadmitted contract identity/revision、schema、provenanceを照合して個別observationへ写す。別connectorの契約を共有・代用する経路を暗黙に許可せず、contract driftを適合に見せない。drift/unknownはCONNECT/source ownerへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

各選択HELIX-CONNECT connection固有のadmitted contract identity/revision、schema、provenanceを照合して個別observationへ写す。別connectorの契約を共有・代用する経路を暗黙に許可せず、contract driftを適合に見せない。drift/unknownはCONNECT/source ownerへ戻す。

### 受入条件候補

- **LABO-027-AC-01 — 正常・trace**：選択connection固有のadmitted contract identity/revision、schema version、source traceと受領内容が一致し、そのconnection固有の契約範囲でのみ受領する。
- **LABO-027-AC-02 — failure/owner boundary**：contract/schema/version/traceのdrift、暗黙の別connector契約の共有・代用、unknownを正常接続として扱わずCONNECT ownerへ戻す。logical connection contractをLABOで改定しない。

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
- 旧項目判定: 入力接続。固定親で保持する意味: 許可されたWorker resultをtask class/assignment/source付きobservationへする。Experimentに属する結果はLABO-L2-006と同じexperiment identity・target version・scopeへ結び、他ticket/experimentの結果を混ぜない。Workerはauthority ownerでなく、未評価resultを評価済みにしない。assignment不明はOSへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:35–35 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `83627537bb90bddb152261a51ae7fe76a198e7cc1b21266bdd0b564bed2ddcad` | 旧HIL-01はHARNESSのsource intake/authority案。source identity/revision/unknownの扱いだけを隣接例として参照し、分野固有の意味は現行親から再導出する。 |
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:45–45 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `418c5e6b16f22dcc8fb8802062ad8e6a6e3d97ec22644f4bddc55cb1ab6f7462` | 旧HIL-11はHARNESS専用のread connector draft；source-specific read/lineage shapeのみ類例、各機構connectorへ置換。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:33–33 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `9132ea7e9037fa8abf11471ba32ade81fb98ea478bf0547944525380b8a7134b` | 旧HAT-01のsource receipt/negative oracle形式のみ保持。旧HARNESS内容は本L2へ適用しない。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:43–43 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `398fbc4c37319f6ac1a63aa258251efa580747895bb2d49716525e2d2f8bf2d3` | 旧HAT-11のlineage/drift negative shapeのみ保持し、現parentのsource/owner条件へ再導出。 |

### 要件候補

許可されたWorker resultをtask class/assignment/source付きobservationへする。Experimentに属する結果はLABO-L2-006と同じexperiment identity・target version・scopeへ結び、他ticket/experimentの結果を混ぜない。Workerはauthority ownerでなく、未評価resultを評価済みにしない。assignment不明はOSへ戻す。

### 受入条件候補

- **LABO-028-AC-01 — 正常・trace**：result/task class/worker/source/assignment revisionsを相互照合し、Experiment resultはL2-006の同一experiment identity・target version・scopeへ結ぶ。
- **LABO-028-AC-02 — failure/owner boundary**：assignment不明、unknown result、別experiment/ticket/target version resultを評価済み/qualifiedへしない。Workerの実行/OS assignment責務を置換せず、誤ったidentityはOS/result sourceへ戻す。

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
- 旧項目判定: 条件補足。固定親で保持する意味: 各呼出しで対象scope、選択source identity/operation、source/contract version、data-use permission、selected connector、既存001 contractを受け取る。選択/未選択と選択理由を示し、選択source依存閉包を確認したLABO observation、unobserved sources、receipt failure/missing reasonを返す。常時要件は001 provenance/identity/revision/status/scope/data-use/authority/version/no-source-write。source-specific connector/safety closureは選択したsourceだけ必須。複数選択なら全選択sourceの閉包を満たす。scope、選択source identity、operation、source/contract versionのいずれかが変わった場合は、その呼出しのselected dependency closureを再照合する。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`:89–92 | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | `4fc611db8d2563773d3f0a1b2e363015a7adcb00899d7f1a3da659661e048779` | FRS-R-06はinclude/exclude exact-setとrequired dependency欠落/暗黙包含のcandidate起点。未採択FRSの他bundle意味は継承しない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`:134–145 | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | `e3dd6a564bd8236db8afda5df895221ee89f7c4b54a0793f49bb2459a96cb0a1` | FRS-R-13/14はdependent closureとunknown/stale safety handlingのcandidate起点。現L2-058のselected-input closureだけを再導出。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`:39–39 | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | `f0f8b45e05554194f2fa6886cabbbd524b40c48e47cb3764188859394819609f` | FRS-AC-006のselected/excluded/required-missing negative oracle形式を照合。draft-candidate acceptanceでありauthorityではない。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`:46–47 | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | `8664d01493c44c49e34d248a6ff85ec7d7b9e5c8f4a25a8dd5b108034a4f7e76` | FRS-AC-013/014のclosure/unknown fail-close oracleを照合し、L2-058の選択source semanticsへ限定。 |

### 要件候補

各呼出しで対象scope、選択source identity/operation、source/contract version、data-use permission、selected connector、既存001 contractを受け取る。選択/未選択と選択理由を示し、選択source依存閉包を確認したLABO observation、unobserved sources、receipt failure/missing reasonを返す。常時要件は001 provenance/identity/revision/status/scope/data-use/authority/version/no-source-write。source-specific connector/safety closureは選択したsourceだけ必須。複数選択なら全選択sourceの閉包を満たす。scope、選択source identity、operation、source/contract versionのいずれかが変わった場合は、その呼出しのselected dependency closureを再照合する。

### 受入条件候補

- **LABO-058-AC-01 — 正常・trace**：Workerだけを選択した呼出しではWorkerのconnector/permission/version/result contractを要求し、未選択BRAIN等の接続稼働を要求せず、選択/未選択と理由を表示する。
- **LABO-058-AC-02 — failure/owner boundary**：選択sourceのmissingは未選択へ変えず、未選択/unconnected sourceはunobservedのままにする。選択またはscopeがunknownなら呼出条件へ戻す。選択sourceのpermission/version/scope/receiptが欠落・不一致なら該当inputを拒否し、source ownerまたはSECURITYへ返す。source/operation/scope/version変更後に旧closureをそのまま再利用しない。選択source固有のconnector・permission・version・result conditionを再照合し、満たさなければ該当sourceをunknown/holdとする。Bench評価済み、assignment permission、全source完了を主張しない。001の本文/outputは変更せず、source選択条件だけを補う。source未選択はpermission不明データの取込許可にならない。Web/WEB-OSは選択時だけ既存採択source contractを要求し、外部取得2.0を1.0へ前倒ししない。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 呼出しscope/selected source/operation/permission/versionを入力として選択理由とunselectedを表示 | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C02` | 入力集合と選択/未選択一覧が一致 |
| 常時001 contractとselected-source dependency closure | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C03` | 選択した全sourceの接続/安全/版条件を検査 |
| unselectedはunobserved、selected-missingはunmet dependency | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C02`, `L10-LABO-058-C03` | 未選択≠成功観測、選択欠落≠未選択化 |
| unknown selection/permission/scopeは確認に戻し、no selectionは未許可取込を許可しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C04` | 入力成立拒否と戻し先、unauthorized intake 0 |
| WEB/WEB-OSは選択時だけ既存contract、external 2.0を1.0へ含めない | `LABO-058-FR-01 / LABO-058-AC-01/02` | `L10-LABO-058-C05` | 未選択時の実稼働依存0、2.0 external intake 0 |
| source/scope/operation/contract version変更後にselected closureを再照合 | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C06` | 変更後のclosure再照合、影響sourceだけunknown/hold |

## 未承認事項

Stage 2bの31件すべてについてFR/L10 pair候補を記したが、部分草稿・未承認であり、機構全体のL3完了や実装/releaseを意味しない。個別parameterの承認gateを作らず、L2の意味/scope/owner/versionを変える場合だけL2へ戻す。
