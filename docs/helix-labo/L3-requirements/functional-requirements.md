# HELIX-LABO L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書はStage 1、Stage 2aおよびStage 2b基本エンジン9件の割当項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

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

旧資産の共通pin: 旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md` (asset `LEGACY-ASSET-F542125805B777D8A56A`, full SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`, lines 13–21/101/148–168、raw span SHA `d16597b2119b4b6d89a48c97777397f983d404059799ab440e76d02f821e1a69` / `9a48e962ded1a655d4d467b146034189604c8545efe963446a06d5230e32889c` / `e3458062d75fec1bb5ea1a71dc1f9988ead52879c228a6495b39ba04bfcba2f9`) と旧gates `.../root/docs/process/gates.md` (asset `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`, full SHA `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`, lines 41/64、raw span SHA `f3e1188383002fad74fca0fe087c327d6514afe8236fc765a4e4925e81cde4c0` / `e7b1b13818bf8e3c8cc1afa702735fd64e570bb0fccd9775a35d2a07dbb12a17`) からFR+AC、対応するL10、functional/business/NFR区分と人の承認・AI起草境界だけを保持する。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82–85` (asset `LEGACY-ASSET-6EBDB617A8104A7756D0`, full SHA `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`、raw span SHA `fc924232f93af2593a0d8ec97c36224a3c2f641ca5c03468ecae747107bd4785`) も同じ責任分担の起点。旧runtime/testは実行していない。

| 旧asset・判定 | 旧source path・行 | full SHA-256 | raw span SHA-256 | 本追補での扱い |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:35–106 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `defc92ec2fd6817d3bee69a183661df9b63e8984d78614cab660c09a17eb5571` | 比較条件・evidence/failure/costを記録する隣接例を再導出。Bench固有指標・task snapshot・軸・固定値は置換し現要件へ持ち込まない。 |
| 旧Bench対test-design（asset ledger未登録の照合済source） | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:20–43 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `1b5e4eecc558013b0b38d5f3390021e4b44f6fdeb6991f07653f8fff23731cf8` | L10のpositive/negative oracleを対にする形だけを再利用。Bench-specific expected category/metric/valueは不採用。 |
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:21–76 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `4d513bd6b0fe222f3c5f757cd20275bee7d88b208106a1f5bcff65be80c2db52` | counterexample/scope/lifecycle/owner・candidate-authority境界の類例。未採択候補の規則・語彙は現行authorityとして継承せずL2から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS対test-design・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:14–37 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `f2b1958d662a6c64d9e29b1c6b74a281a46f1d99f93aa5d9e432c6231f68ab32` | failure/counterexampleを成功標本で相殺しないnegative oracleの隣接例。旧候補ACを現行acceptanceと誤認しない。 |

## LABO-002-FR-01 — HELIXLABO-L2-002 Correlation Engine（相関）

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-002` / `MPR-RC-HELIXLABO-L2-002-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L49`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:77–84`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `d4ecde864ac4129741f32ac65d0075d1d0704cc7166b86491bbae6ef8865bf28`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: L2-001のobservation identity/field contractとAggregate→Correlate接続L2-011。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。L2-002は許可source付きobservationからepisodeへのrelationを求め、時間的近接だけで因果を断定せず、孤立event・欠落義務・訂正relationを保つ。旧Benchのversioned task/receipt比較は隣接する証跡形だけ、RCLS R-07はsource/outcome/correlation保持の未採択候補として参照し、相関意味自体は現親から再導出する。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:96–126 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `b1e1ad5ce41e266e13b9469c20e87d57d46cf9f7d80773ce2a9c65c96102aae1` | task/source snapshotと比較条件の固定は隣接証跡形。旧cohort/repeat規則を継承せずrelation条件をL2から再導出。 |
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:37–37 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `b715ad01077fb05d1955165344b54803945e06746db67bec382bfa36a7e11e2c` | source/outcome/correlation/causal state結合の未採択類例。field規則は継承せず現親から再導出。 |
| `LEGACY-ASSET-OLD-BENCH-ACCEPTANCE (asset ledger未登録・照合済)` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:25–34 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `e5ec702da7e6aa732bda4d81e5388c0415106aa60d4730b0350b6a2a9be365f5` | 旧のtask snapshot・hidden oracle・証拠receiptのoracle形式は隣接例として参照し、因果/relation規則は現行L2から再導出。 |

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
- 旧項目ごとの判定: 再導出。旧RCLS R-06のapplicability/structure/invariant/tradeoff/failure/counterexample/scopeは類例として読むが未採択candidateのためauthorityを引き継がない。旧Benchの平均scoreからfailureを隠す形も本親の分類要件には移さない。良否・条件依存等の区別は現L2-003から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | applicability/structure/invariant/trade-off/failure/counterexample/scopeの類例。分類軸自体はL2から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–27 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `7b0a281ee8bf1d6b82d4ac147f9e917259a8af4371018243c91830231da6bf88` | 単一事例/頻度だけの飛越を拒む未採択oracle例。現要件へはunknown保持を再導出。 |

### 要件候補

episodeとsource evidenceを入力し、good/bad、condition-dependent、generic candidate、product-specific、system candidate、operation candidate、unknown、unnecessaryを別々に分類して、分類ごとの根拠と未確定・矛盾・欠測を出力する。全体の単一accept/rejectに丸めず、根拠不足はsource/evidence ownerへ返す。

### 受入条件候補

- **LABO-003-AC-01 — 正常・追跡**：親が列挙した各分類軸を独立fieldとして出し、同一fixtureの根拠へ戻れる。
- **LABO-003-AC-02 — 否定・owner境界**：全体二択化、反証/欠測の脱落、根拠のないgeneric/system昇格は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力: episodeとsource evidence、出力: 親列挙8種を個別評価 | `LABO-003-FR-01 / LABO-003-AC-01` | `L10-LABO-003-C01`, `L10-LABO-003-C04` | 8分類fieldと根拠の分離 |
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
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | pattern structure/invariant/trade-offの未採択比較例。意味不明なら停止する規則はL2から再導出。 |
| `LEGACY-ASSET-OLD-BENCH-ACCEPTANCE (asset ledger未登録・照合済)` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:22–24 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `111268a4e97a66f6b6caccd88a57cbf6fa32510bcecde33a06973088206c4f22` | 比較軸を分離するoracle形式だけを隣接例として参照し、守破離のfieldは現行L2から再導出。 |

### 要件候補

既存方式とsource evidenceを受け、purpose、structure、behavior、assumption、constraint、guarantee、costを分けた比較仮説を返す。守では改変前の意味/目的/条件を保存し、破では部分構造と条件差を比較し、離では有効部分だけをcandidateとして再構成する。元意味がunknownなら停止しclarificationを元source ownerへ戻す。

### 受入条件候補

- **LABO-004-AC-01 — 正常・追跡**：全7比較fieldと改変前source/revisionが揃い、守/破/離の候補に保持点と差分を結べる。
- **LABO-004-AC-02 — 否定・owner境界**：根拠なしの意味補完、cost/guaranteeの捏造、候補をauthority扱いは不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 入力既存方式/source evidence、出力7比較fieldを持つhypothesis | `LABO-004-FR-01 / LABO-004-AC-01` | `L10-LABO-004-C01`, `L10-LABO-004-C04` | 7 fieldとoriginal source/revision |
| 守は意味等を保存、破は部分構造/条件差比較、離は有効部candidate再構成 | `LABO-004-FR-01 / LABO-004-AC-01` | `L10-LABO-004-C01` | 保持/変更field・候補が各段階に対応 |
| 元意味不明なら停止しsource clarificationへ | `LABO-004-AC-02` | `L10-LABO-004-C02`, `L10-LABO-004-C03` | unknown意味から確定candidateを作らない |

## LABO-005-FR-01 — HELIXLABO-L2-005 Transformation Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-005` / `MPR-RC-HELIXLABO-L2-005-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L52`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:101–108`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `3b7f37f57a9db5df451275962aa0a90f951cf61e23496828cb9a078f52bc36ee`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: Vector出力L2-004/014が保持する元意味と部分比較。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-12/13/15のlifecycle・縮退・rollback条件を候補資料として比較。非採択文書のstate machineは継承せず、変換語彙・meaning delta・owner/fallback条件はL2-005から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–52 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `7787b88b50767904ae5d36f52c98ff1be94a47407f3bda0bc0da5c82d32f227f` | lifecycle/縮退/mechanization/rollbackの候補例。旧lifecycle/action語彙を移植せず現在の変換候補を再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 段階飛越を拒むtest-design類例。L2-005の比較/意味差だけを現要件化。 |

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
- 旧項目ごとの判定: 再導出。旧Bench R-04–08はsnapshot/protocol/evidence/costを固定する隣接起点だが、旧15field、12metrics、repeat/timeout、hardware/cohortを置換し移さない。RCLS R-08はoracleとindependent assessmentの未採択例。実験責務・対象metricsはL2-006から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` 旧Bench L3 draft | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`:121–141 | `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | `eb6b076cc591a88b1057cae1bb81cde6da94fd9474eabf4c86c39f24785d57de` | run comparability/evidence/cost recording類例。旧timeout/repeat/metric/denominator規則は置換し親評価項目から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:23–24 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `b78289563ee8a1f00918c1b1a560e355fd649d723aa06588bb0b904f1545a12b` | failure/high costを成功で相殺しない否定oracleの未採択類例。現行親に必要な範囲だけ再導出。 |
| `LEGACY-ASSET-OLD-BENCH-ACCEPTANCE (asset ledger未登録・照合済)` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`:25–37 | `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | `f650a2cd806e0d3375d2fd594c456bd2da0776614a97e28b0ed0972a4a803ff0` | 比較可能性・証拠・cost欠測の否定例を参照し、旧固定指標/値を置換してL2-006から再導出。 |

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
- 旧項目ごとの判定: 再導出。旧RCLS R-12/15の段階飛越抑止/rollbackや旧Bench R-06のoracle evidenceは類例。L2-007が求める再現性・機械判定可能性・副作用・retry/rollback/idempotenceを現行親から再導出し、旧昇格状態や閾値は移さない。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–51 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `002b11ad0d60246e7bcf3b658c09f30c5bd472901cb5db482365b609a2d77142` | promotion/rollback/verification candidate例。未採択authorityとして継承せず、L2-007の5条件から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 頻度だけのpromotion否定例。現行L2の自動昇格なしに限り再導出。 |

### 要件候補

反復episode、実験証拠、rule candidate、oracleを入力し、operation継続とsystem化候補の双方を、再現条件・判定可能性・副作用範囲・retry/rollback/idempotence・oracle・例外/限界と共に評価する。評価段階は候補比較であって自動昇格/新承認gateではない。

### 受入条件候補

- **LABO-007-AC-01 — 正常・追跡**：同条件で再現可能か、machine oracle、副作用限定、retry/rollback/idempotenceを項目ごと判定し根拠を示す。
- **LABO-007-AC-02 — 否定・owner境界**：反復件数のみのsystemization、oracleなしの自動昇格、operation候補の消去は不成立。

### 固定親句trace

| 固定親の句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| input repeated episodes/evidence/rule candidate/oracle、output operation vs systemization evaluation | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C04` | 両候補とoracle evidence |
| same-condition reproducibility, machine oracle, side effects, retry/rollback/idempotence | `LABO-007-FR-01 / LABO-007-AC-01` | `L10-LABO-007-C01`, `L10-LABO-007-C02` | conditionごとの判定根拠 |
| 自動昇格せず、文脈依存等はoperation候補へ | `LABO-007-AC-02` | `L10-LABO-007-C02`, `L10-LABO-007-C03` | auto-promotion 0、operation候補保持 |

## LABO-008-FR-01 — HELIXLABO-L2-008 Operational Fallback Engine

### 親・旧資産・意味判定

- 固定親 `HELIXLABO-L2-008` / `MPR-RC-HELIXLABO-L2-008-001`。PO decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L55`、固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、親source `docs/helix-labo/L2-requirements/labo-requirements.md:125–132`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `08da4c2fb64ede944ace1e21fe8f165a161fe981e902458a8263602040d581ce`。採択basis `633bf12` はこのrevisionの起草根拠であり、この草稿は未承認。`version_target: 1.0` はrelease/implementation許可ではない。
- 依存／版: 依存: current system rule/version、operation evidenceのL2-007/017。 `version_target: 1.0`。これは対象能力の目標版であり、実契約版・成果物版、実装許可またはrelease許可ではない。採択後の実版と互換範囲はHARNESS共通L2-010/011で扱う。
- 旧項目ごとの判定: 再導出。旧RCLS R-13の縮退状態とR-15 rollbackは失敗時の戻し方の未採択類例。system exception/avoidance/costからoperationへ戻す現在の意味はL2-008から再導出し、旧 lifecycleを移植しない。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:48–51 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `002b11ad0d60246e7bcf3b658c09f30c5bd472901cb5db482365b609a2d77142` | 縮退・rollback例。current ruleからoperationへ戻す条件/ownerはL2-008から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–29 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `446cd40c076a405028445fa0329ba81dec7c61e78de1dd45dfeb6839581b3a63` | 段階縮退を保持する候補test。現行owner/fallback境界のみ再導出。 |

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
- 旧項目ごとの判定: 再導出。旧RCLS R-06のscope/counterexample/revalidationとAC-007の単一事例による飛越否定は類例。ただし旧 candidate statusと判定規則は権威ではない。単一episodeから一般化せず、支持scope段階を出す本体はL2-009から再導出。

**旧項目別起点（再利用／再導出／置換の根拠）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 判定 |
|---|---|---|---|---|
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:36–36 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `5a93c69a5699f57857074b26a127ddce2cf3f23d7a4191c2c66b245dafdb994c` | scope/counterexample/revalidationの未採択類例。一般化ladderはL2-009から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:27–27 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `7b0a281ee8bf1d6b82d4ac147f9e917259a8af4371018243c91830231da6bf88` | single-case/frequency-only飛越否定の未採択oracle。sample数は現parent未指定なので候補値として測定。 |

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
| `LEGACY-ASSET-5841D44AE1255A061667` RCLS draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md`:63–65 | `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb` | `89866c7e0c08df4f035eb420ebcf8f827286e143d50c1f0abc56f60b792299d7` | selection/approval/disposition/runtime-judgment/decision分離とcandidate非authorityのdraft。現行L2のcandidate/OS/target-owner境界から再導出。 |
| `LEGACY-ASSET-B1F192F46FC3AC336094` RCLS acceptance draft_candidate・未採択 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md`:39–39 | `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7` | `674dfd8e0cac2f25a1d2e971d1871b55393e6659d5b8f52cb25d4de992d9e221` | authority混同拒否の未採択acceptance類例。human decision生成禁止は現行境界に従い再導出。 |

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

Stage 2bの残り22 identityは後続追補対象。9件のFRと対L10は部分草稿であり、L3承認前。値候補と測定案は一つの承認対象として提示し、parameterごとのPO gateを作らない。親の意味・scope・owner・versionを変える必要が生じた場合だけL2へ戻す。
