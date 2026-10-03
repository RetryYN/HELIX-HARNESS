# HELIX-LABO L3 機能要件（部分草稿）

**状態：部分草稿・未承認。** この文書はStage 1およびStage 2aの割当項目だけを具体化し、機構全体のL3を完了扱いにしない。実装方式・runtime・新しい承認gateを確定しない。通常のPO L3承認前である。対象版は各親L2が明示する`version_target: 1.0`であり、1.0の実装・release許可を意味しない。

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

- **LABO-056-AC-01 — 正常・追跡**：許可範囲の各結果statusをsource provenanceとともにobservationへ記録し、評価可能なoracleがない初回一件は観測済み・未評価のまま保持する。評価済みを付す場合はL2所定の根拠と評価receiptが全て辿れる。採用oracle/基準revision・適用scope・判定条件・比較条件・結果・failure/反例/unknown・評価者・時点・receiptが揃う正常caseでは評価済みを記録できる。
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
