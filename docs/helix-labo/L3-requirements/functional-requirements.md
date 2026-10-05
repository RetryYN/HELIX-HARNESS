# HELIX-LABO L3 機能要件 — Stage 1（001/011の候補）

状態：採択済み2親の未承認要件草稿。実装・実行許可、L10合格、業務完了を生成しない。対象はHELIXLABO-L2-001/011だけで、他Stage・保留・不採択親を追加しない。

## 共通接続の境界

L2-011の論理通信条件は、要求段階main `633bf12ea8f948db8ba3d6600179c4a9507377a7`にある採択済みCONNECT-L2-001/002/003と対応L11-001/002/003の登録・互換照合・契約束縛通信fixtureを参照する。具体的な正本と適用操作は次のとおり。

| 操作 | 採択済み要求 | 対応L11 | この親で照合する内容 |
|---|---|---|---|
| connection登録・identity | [CONNECT-L2-001](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-001-接続登録と端点契約の識別unit) | [CONNECT-L11-001](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-001-接続登録) | 登録済みconnection identityと両端契約revision |
| 契約互換・revision | [CONNECT-L2-002](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-002-契約互換性照合とstale再検証unit) | [CONNECT-L11-002](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-002-契約版照合とstale再検証) | 選択revision・scopeの互換性、unknown/stale保留 |
| 契約束縛通信 | [CONNECT-L2-003](../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-003-契約に束縛した通信unit) | [CONNECT-L11-003](../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-003-契約に束縛した通信) | connection/operation/revisionに束縛した技術的送受信結果 |

これらは固定されたL2/L11への参照であり、未承認CONNECT L3候補の成立を仮定しない。fixtureは選択connection identity・admitted contract revision・scopeへreceiptを束縛し、CONNECTの技術的送受信結果とLABOのepisode/元観測往復参照を別に照合する。別scope/旧revisionの結果、自由文/source join、CONNECTのgreenだけから受領やLABO成果の成功を生成しない。技術判定と戻し先は上記の採択済み契約が明示する範囲だけを使う。比較不能等で固定L2に専用戻し先がない場合はunknown/staleを保ち停止し、ownerやrouteを新設しない。元観測/関係の不足は固定親のsource/correlation責務へ戻す。実際の共通L3/L10を参照する段階では、その承認対象revisionの正本がmainにあることを通常の参照照合で確かめる。

## 起点と作成方法

旧HELIXのL3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`（旧source whole SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、`LEGACY-ASSET-F542125805B777D8A56A`）が示すFR+ACと対応検証の意味、およびfunctional-requirement／business-requirement／nfr-gradeの3区分を保持する。旧`archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64`（`LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`、全文SHA-256 `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08`）が示すFRとACを対応させ、要件と検証設計の対が揃わなければ完了としない意味を保つ。旧工程名やruntime/sub-gate構成は持ち込まない。旧自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は人がL3を承認しAIが起草する責任分担の起点。対となる旧L10/test designは実行せず、failure classとtraceの考えだけを現行L2/L11へ再導出する。

以下の各itemに現行PO承認対象のexact parent revisionと、旧assetのidentity/path/line/full SHA/raw span SHAを記録した。候補値は根拠と比較理由付きで示し、旧数値を自動継承しない。意味・scope・owner・version変更は含まない。

## LABO-001-FR-01 — HELIXLABO-L2-001

### 親revisionとauthority

- 初回採択登録 `MPR-RC-HELIXLABO-L2-001-001`、現行source保持登録 `MPR-RC-HELIXLABO-L2-001-002`（R2289-02、metadata-only訂正）/ semantic digestは両登録で同一 `27b001d93a39c0a7f2b3b6d89e8acc5777015224c2a18f222f1e32e8933bdc4a`。
- L2 parent: `HELIXLABO-L2-001` — [`docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L48); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
  - Source `docs/helix-labo/L2-requirements/labo-requirements.md:69-76`; full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`, raw inclusive-span SHA-256 `9c1f285a0835a56fd7042025636ff68c2bca46d31eb2df693465d02fe772a104`.
- Paired L11 source: `docs/helix-labo/L11-acceptance/labo-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`; lines 43–47 raw SHA-256 `d4891130ef25adf720c5e68b584cb17bd12066ea29fc7c4b50585a1cc49d5a8b`, lines 109–116 raw SHA-256 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

個別に許可された1.0 source contractsからのobservationを、source identity/revisionおよび出典とともにLABO observationとして集積する。少なくとも親L2の20 fields（episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result）と、status vocabulary（success, failure, rejected, cancelled, blocked, unknown, not_observed）を保持する。sourceのcanonical state/authorityはsource ownerに残り、LABOへ書き戻さない。Web/WEB-OS L2-031/032はsource contract採択時のみ追加し1.0必須にしない。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。

**親の依存・版**：個別に採択された1.0 input source contract（`HELIXLABO-L2-021〜030`）へ接続する。Web/WEB-OS `L2-031/032`はそれぞれのsource contractが採択された場合だけ加える任意接続で、1.0必須ではない。`version_target: 1.0`。対象観測には開発ログ、Worker/AI判断、CI/test/review、backflow/recovery/incident/refactor、release/deployment/runtime、利用、再作業、費用/token/API、model/provider、correction/rollback/product resultを含める。

### 受入条件（AC候補）

- **LABO-001-AC-01 — 正常・追跡**：複数の許可sourceから各sourceに実在するstatusを受け、各recordのsource identity/revisionと列挙fieldを保った独立observationを返す。source範囲のeventがすべてsuccessならそのsuccess recordだけで受け入れ、発生していないstatusを捏造しない。過去のsource revisionに結びつく観測は、その当時のrevision・時点を保ったhistorical recordとして追跡可能にする。破損・欠落時のLABO処理結果は理由付きhold/warningとして分離し、source statusは元sourceの値のまま保ち、他sourceの有効recordを巻き込まない。
- **LABO-001-AC-02 — 異常・境界**：元sourceに存在するfailure/rejected/cancelled/blocked/unknown/not_observedをsuccess-only projectionで除去する、unknownまたはnot_observedをsuccess化する、必須observation fieldを欠落したまま成功扱いする、sourceを同一identityへ混ぜる、source scopeが欠落・未許可なのに横断済み／完了と示す、既知の古いrevisionをcurrentとして偽装する、scope外/secret dataを取り込む、LABOからsource stateへwritebackする場合は不成立。source statusは元のまま保つ。固定L2-001 L2:73に明記された観測情報の欠落または権限外情報は、成功扱いせず理由付きholdでsource責務へ戻す。それ以外のLABO側の誤変換・identity混合・既知revisionのcurrent偽装は、専用の戻し先が固定親にないため元記録を保ってholdし、新しいroute/ownerを作らない。元source上で対象期間に非success eventが存在しない正常ケースは拒否せず、その期間にstatusを追加生成しない。旧BR21-09の部分破損時に他sourceを維持するfailure類型は参考にするが、旧dashboardの4 source/5 metric/30秒poll/token costは移さない。旧L3 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:22-34`と`business-detail.md:137-145`、旧対のtest design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`を調査したが、現行cross-mechanism observation planeに直接一致は確認されなかった。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| source input・observation output：許可sourceごとのidentity/revision/attribution、L2のepisode_idからresultまでの全20 field | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C01,C03,C04,C08,C09` | 20/20列挙fieldとexact current/historical source revision |
| 状態網羅：実在するsuccess/failure/rejected/cancelled/blocked/unknown/not_observedを区別し、成功だけに投影しない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C01,C03,C08,C12,C13` | 存在statusの個別識別、sourceに存在する非success eventの脱落0、unknown/not_observed→success各0、未発生status捏造0 |
| source authority境界：canonical state/authorityはsourceに残し、LABO observationを書き戻さない | `LABO-001-FR-01 / LABO-001-AC-02` | `L10-LABO-001-C05,C06` | 許可外入力hold、source writeback 0 |
| 部分失敗・field欠落：一sourceの破損/欠落または必須observation field欠落はsource statusを書き換えず当該observationを成功扱いせずsource責務へ戻し、他sourceを捨てない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C02,C10` | LABO処理hold/warningと戻し先、source status保持、他source valid record保持 |
| 否定・戻し先：古い既知revisionはhistoryとして保持できるがcurrent扱いせず、secret/out-of-scope/権限外は成功とせずsource ownerへ返す | `LABO-001-AC-02` | `L10-LABO-001-C04,C05,C09,C14,C15` | exact historical revision保持、stale-as-current拒否、同一identity混合拒否、scope欠落/未許可で完了にしない |
| L11 §24 #1：許可sourceのobservation identity/revisionを保ち、identity混合や欠落・未許可scopeで横断済みにしない | `LABO-001-FR-01 / LABO-001-AC-01,AC-02` | `L10-LABO-001-C14,C15` | source identity混合、scope欠落、scope未許可を別々に入力し、成功扱い・横断完了を生成しない |
| 任意接続：Web/WEB-OS未選択時に1.0必須dependencyへしない | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C07` | 未選択時必須扱い0 |
| 未見正常：固定source contract範囲の未見identity/revisionと実在statusも既存正常条件で扱う | `LABO-001-FR-01 / LABO-001-AC-01` | `L10-LABO-001-C11` | 20 field・実在status・出典を保ち、未発生statusを生成しない |
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

- 初回採択登録 `MPR-RC-HELIXLABO-L2-011-001`、現行source保持登録 `MPR-RC-HELIXLABO-L2-011-002`（R2289-02、metadata-only訂正）/ semantic digestは両登録で同一 `39d5c13584a1a339660788e79c9fab9b3ad688675587c3d8510fe65153505724`。
- L2 parent: `HELIXLABO-L2-011` — [`docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L59); PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision body SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`.
  - Source `docs/helix-labo/L2-requirements/labo-requirements.md:163-166`; full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`, raw inclusive-span SHA-256 `9fcf8b7b648681c7ff08080565a2d708cdd9c5a619e40e8f8bad6196f4c36cb6`.
- Paired L11 source: `docs/helix-labo/L11-acceptance/labo-acceptance.md`; PO-fixed parent revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`; lines 60–64 raw SHA-256 `136d16707e53e545e4bc6cc18384d604f971e35d00cb2a9750676cdb34f66563`, lines 109–116 raw SHA-256 `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`.

- Version candidate: `1.0`;順序: `Stage 1`。G0分類は実装承認ではない。

### 要件（候補）

Aggregate observation fields/source revisionからepisode候補を作り、元observationへのidentity/revision参照と欠測を往復可能な形で保持する。集積単体の成功をcorrelation接続成功と同一視しない。L2-011の出力ではevidenceの有無にかかわらず因果を確定しない。時刻/pathの近さだけから因果を確定しないというL2-002の条件も別途維持する。

**境界**：L2で指定された入力・出力・ownerを越えない。BRAINは知識identity/state、LABOはobservation/evaluation、OSは登録・project use、INFRASTRUCTUREは資源/topology/recovery path、CONNECTは論理通信契約、SECURITYはauthorityを保持する。項目固有の適用境界は上記本文に従う。

**親の依存・版**：`HELIXLABO-L2-001` Aggregate identity/outputを入力前提として、`version_target: 1.0`。

### 受入条件（AC候補）

- **LABO-011-AC-01 — 正常・追跡**：Aggregateで得たobservationをCorrelateへ渡し、episode候補から元source observation・revisionへ往復参照できる。欠測や未対応relationは元の欠測／unresolved状態として保つ。選択したCONNECT connection identity・admitted contract revision・scope・schema/provenanceを個別に照合し、技術結果は上記共通表の採択済みCONNECT fixtureで判定する。`HELIXLABO-L2-011`は要求parent IDであり、実際に選択されたCONNECT connection identityとは別の値である。親指定の意味だけを成立させ、因果を確定しない。
- **LABO-011-AC-02 — 異常・境界**：observation identity/source revision欠落または不一致、Aggregate単体成功だけで接続完了を主張、いかなるevidenceがあってもL2-011出力でeventの因果を確定する場合は不成立。relation不一致は元source recordを保ってCorrelateへ戻す。observation identity/source revisionの欠落は、固定L2-001のL2:73「欠落や権限外情報は成功扱いせず、当該観測を保留しsource責務へ戻す」に従い、依存L2-001のsource責務へ戻す。identityまたはsource revisionの不一致は元記録を保ってholdし、固定親にないsource責務への戻し先を新設しない。relation不一致である根拠がある場合に限りCorrelateへ戻す。選択CONNECT connectionの契約identity/revision/schema/provenance不一致は、採択済みCONNECT-L2-001/002/003の該当契約fixtureで技術判定する。consumer receiptは選択connection identity・admitted contract revision・scopeに束縛し、別scope/旧revisionの結果、自由文、source join、CONNECT判定greenだけで受領や業務成立を生成しない。固定CONNECT L2が戻し先を明示する技術failureだけその戻し先を使い、比較不能など専用戻し先のない場合はunknown/staleで停止しownerを新設しない。親固有のrelation不一致はCorrelateへ、observation identity/source revisionの不足は依存L2-001のsource責務へ戻し、接続failureへ置き換えない。

### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力・出力：source付きobservationとfield/revisionからepisode candidateへ渡し、episode/元observationを往復参照 | `LABO-011-FR-01 / LABO-011-AC-01` | `L10-LABO-011-C01,C06` | 元source ID/revisionへroundtrip |
| 保証：元source参照と欠測を保持し、Aggregate単体成功を接続成功に読み替えない | `LABO-011-FR-01 / LABO-011-AC-01,AC-02` | `L10-LABO-011-C01,C03,C06,C08,C09` | field/source revision/missingnessを往復保持し、脱落・補完しない |
| 否定：relation不一致を黙って補完せず、evidenceの有無によらず相関を因果と確定しない | `LABO-011-FR-01 / LABO-011-AC-02` | `L10-LABO-011-C04,C05,C07` | unresolved保持、causal claim 0 |
| 失敗・戻し先：relation不一致はCorrelateへ、identity/source revision欠落は依存L2-001 L2:73のsource責務へ戻す。revision不一致は元記録を保ってholdし、新routeを作らない | `LABO-011-AC-02` | `L10-LABO-011-C02,C04,C06,C10,C11,C12` | 元record保持、欠落と不一致を区別した理由・戻し先。relation不一致の根拠がある場合だけCorrelateへ戻す |
| 固定L2:159：個別connectorは互いに代用しない | `LABO-011-AC-01 / LABO-011-AC-02` | `L10-LABO-011-C13` | 要求parent IDや別connection identity/receiptで選択connectionを代用した場合、receipt不一致を明示し受領・接続成功を生成せず停止する |
| 依存・版：L2-001 Aggregate identity/output、version_target 1.0 | `LABO-011-FR-01 / LABO-011-AC-01,AC-02` | `L10-LABO-011-C01,C03` | Aggregate identityを入力参照し、Aggregate単体成功をcorrelation接続成功と混同しない |
| 未見正常：同じ採択契約範囲内の未見observation/episode identityも往復参照する | `LABO-011-FR-01 / LABO-011-AC-01` | `L10-LABO-011-C07` | source revision・field・欠測・接続bindingを保ち、相関を因果へ昇格しない |

### 旧L3／対のテスト設計からの意味対応

対象のAggregate→Correlate source-revision-preserving relationに一致する旧L3/L10は確認できない。調査範囲は旧HARNESS L3 `business-detail.md:137-145`と`functional-requirements.md:22-34`、旧pillar L3 `pillar-functional-requirements.md:134-153,178-190`、旧対test design `L3-pillar-acceptance-test-design.md:43-50,67-90,91-120`。旧BR-21のpartial aggregation failureは他sourceを失わない点だけ類例として扱い、旧dashboard groupingや因果・時間相関ruleは継承しない。現行L2-001/011からsource ref、revision、missingnessを再導出する。

| 旧asset ID | 旧source path・行 | 旧source full SHA-256 | 旧span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`:137–145 | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | 7cee661109db34583676144f6acbd6bc1e1342e4492d06e8b0f6009b56aa9e3f |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md`:22–34 | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 5d28764f462e5bb9fa6dd3b8a3557941f53946698da94bed79fb386a3df22b55 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:134–153; 178–190 | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | 1182367b0bed125db89a879d2b468ab0dc0df42b480df06456e2ff438a674d41; b22d92ccdaa19287976d6c67a4289cde8f379e16382fc07498a3d9b9746752c0 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`:43–50; 67–90; 91–120 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 17a29eeb22b6ecf41e8776b556a566f0a0613212de2e7c660e259f3ec1bd6acb; e13598bd4995ac192a747b0690c0c2fa5a2d17eb9c72949211ae1430e8812866; 0493df0f6b3370862f8a2e43ae0eee86f445374bc0f45404208ebbdae14f2a8a |


状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)に固定する。

## Stage 2b — 採択親 HELIXLABO-L2-002/003/004/005（候補、1.0）

このStage 2b cutoutの前半はPO採択された4親だけを扱い、後半で006–010を累積する。対象外Stage、保留・不採択・条件付き親を含めない。採択authorityはPO決定 `633bf12ea8f948db8ba3d6600179c4a9507377a7` の採択identity/revision/version行、意味の正本は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の固定L2/L11である。G0 addendum `1880c422311a7f8321dbb0e2b98fa12c69449201` はStage順序だけを示し、採択authorityではない。`1.0` はtarget候補であり、実装・実行・build・release版ではない。未承認L3候補を依存authorityとしない。

### authority pin（この4親）

| L2親identity | 仮登録identity | PO adoption row | 固定L2 source (f6dad2a) | 固定L11 source (f6dad2a) | G0 order row (1880c422) |
|---|---|---|---|---|---|
| HELIXLABO-L2-002 | 初回 `MPR-RC-HELIXLABO-L2-002-001`; 現行metadata-only correction `MPR-RC-HELIXLABO-L2-002-002`（semantic digest不変） | PO decision `:49` | `labo-requirements.md:77-84` | `labo-acceptance.md:46,113-114` | addendum `:249` |
| HELIXLABO-L2-003 | `MPR-RC-HELIXLABO-L2-003-001` | PO decision `:50` | `labo-requirements.md:85-92` | `labo-acceptance.md:47` | addendum `:250` |
| HELIXLABO-L2-004 | `MPR-RC-HELIXLABO-L2-004-001` | PO decision `:51` | `labo-requirements.md:93-100` | `labo-acceptance.md:48` | addendum `:251` |
| HELIXLABO-L2-005 | `MPR-RC-HELIXLABO-L2-005-001` | PO decision `:52` | `labo-requirements.md:101-108` | `labo-acceptance.md:49` | addendum `:252` |

固定L2 full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、L11 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、PO decision `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`、G0 addendum `c30d5b2ca757952f9772573bffb95a03dfb8ccf686687b92bb70d2c93c956253`。raw-LF inclusive span hashは同梱の不変source/pair監査記録に記録する。

002は旧source `LEGACY-ASSET-02D897E62EF2FA267267` のUIL-R-02 (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:53–57`, full SHA-256 `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`, raw span SHA-256 `ddac07262d5bb59d30bd43d70328e3889ae842c87d08f1ed332b9b6b7efa0b17`) を起点とし、source eventのidentity/correlation/causation/evidence保持を再導出し、旧schema/digest protocol/baseline-current固定fieldsは置換する。003/004の旧source検索からこの002専用UIL-R-02を除外する。

旧source `LEGACY-ASSET-28FB139B26CD61CC51EE` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:35–147`、full SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`) と旧対 `LEGACY-ASSET-A952A3A175EB82A4781B` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`, full SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`) は先行起点である。source/version/scope/evidenceを保ち、failureを欠落扱いしない意味と正負caseのtraceだけ項目ごとに再導出する。旧5 category/12 metric、provider/team順位、hidden oracle/scorer、task portfolio、fixed protocol、runner、price、qualification/admissionは現行親にないため置換・除外する。旧L3定義と旧test-designの形式も意味を再導出し、旧runtimeやtestは実行しない。現行6正本のfunctional ACを唯一の条件正本とし、独立business outcomeがないためBR/BV/BCASEを複製しない。

### HELIXLABO-L2-002 — `LABO-002-FR-01`

許可source付きobservationから、固定L2が例示する要求→ticket→Worker→実装→atomic CI→boundary integration→proof CI→release→deployment→runtime→incident→recovery等の観測eventを、選択scopeに応じepisode候補へ関連づける。requirement/revision、責務、product、mechanism、worker、provider/model/configuration、artifact、environment、result等のsource identity/revisionを追跡し、source status `success, failure, rejected, cancelled, blocked, unknown, not_observed`を区別して保持する。相関不能eventは孤立・不明として残し、部分episodeの不足fieldと未完義務を補完しない。時刻/pathの近接だけで因果を推論せず、誤相関が判明した場合も元eventを変更せずrelation訂正候補として扱う。

20列のschemaを固定L2-001 L2:69–76に沿って、(1) context `episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact`、(2) 観測値 `CI/test, cost, time, result`、(3) 発生条件付きevent `release, deployment, runtime, failure, rework` に区分する。この区分は意味の再導出であり、全列non-emptyを要求しない。選択source contractで指定されるidentity/revision/scope envelopeは必須とする。20列はschema上保ち、field欠落と存在値unknown/not_observedを区別する。event未発生時は適用条件とnot_observedを記録し、存在しない値を生成しない。

- **LABO-002-AC-01 — episodeとsource trace**：許可sourceの複数stage eventを与えると、選択scopeで実際に観測されたsource eventをepisode候補へ対応づけ（固定L2のevent列挙は例示として扱い、入力sourceを閉じた列挙にしない）、各eventをsource identity/revisionへ逆参照できる。sourceに未発生・未観測のeventは生成せず、観測上の不在をpartialとして不足と未完義務を明示する。episode全field・環境・結果の来歴と部分性を保ち、元source canonical event/authorityを変更しない。七つのstatus `success, failure, rejected, cancelled, blocked, unknown, not_observed` は同じ観測状態へまとめず保持する。unknown/not_observedをsuccessへ変換せず、failure/rejectedを落とさない。
- **LABO-002-AC-02 — 孤立・欠測・未完保持**：相関不能event、観測上のevent不在、未完義務は孤立/partial/unknown/未完として明示する。存在しないstageや義務履行を生成せず、部分episodeを完了として表示しない。契約上必須のidentity/revision/接続の欠落やstaleは部分観測に読み替えずAC-03に従い不成立とする。
- **LABO-002-AC-03 — 誤相関・訂正**：時刻またはpathの近接だけで因果を確定する無関係event結合、七状態の統合・脱落・success変換、契約上必須のsource identity/revisionまたはAggregate→Correlate connection identity/revision/scopeの欠落・stale/wrong revision、欠けた義務の補完、訂正時の元event上書きは不成立。契約不備は該当する既存sourceまたはL2-011 connection ownerへ理由付きで戻す。観測上のevent不在は失敗にせず部分episodeとして保持する。元eventを保持しrelationだけを訂正候補として記録し、ownerやrouteを新設しない。
- **依存・版**：固定L2-001のobservation identityと列挙field、およびL2-011のAggregate→Correlate connection identity/revision/scopeだけを単独成立依存として照合する。契約上必須のidentity/field/source revision/scope/connectionがmissing, unknown, stale, wrong-revisionなら契約不備として不成立にし、別sourceから補完せず既存sourceまたはL2-011 connection ownerへ戻す。実eventが発生していない・未観測である場合は契約不備とせず、partial/unknownとして不足と未完義務を表示する。`version_target: 1.0`。

### HELIXLABO-L2-003 — `LABO-003-FR-01`

Episodeとsource evidenceを、良かった点、悪かった点、条件依存、汎用候補、product固有、system化候補、operationで補う候補、unknown、unnecessaryの別々の根拠付き評価へ分解する。分類軸をepisode全体の採否へ丸めず、分類不能・反証・欠測はunknown/unresolvedで保持し、episode内の未完義務も独立した未完状態・identityで残して完了へ読み替えず、意味を変えず根拠へ戻る。

- **LABO-003-AC-01 — 分解と独立分類**：成功/失敗、条件付き事実、汎用/product固有、system/operation、unknown/unnecessaryが併存するepisodeで、親の各分類を独立して根拠付きで保持し、元episode/evidence identity/revisionへtraceできる。
- **LABO-003-AC-02 — unknown・条件境界**：episode全体の一括採否、unknownの推測分類、条件付き成功の無条件一般化はいずれも不成立。反証・分類不能・欠測を未確定のまま明示する。未完義務を正常例で保持し、義務完了へ変換または脱落させる場合は不成立として元evidence ownerへ戻す。
- **LABO-003-AC-03 — evidence戻し**：分類根拠のsource identity/revisionまたは必要条件が欠落・矛盾する場合、補完分類せず元evidence/history sourceのownerへ理由付きで返す。sourceをLABOで修正しない。
- **依存・版**：固定L2-002のepisode identity/revision、source evidence identity/revision、event/result state、relationと未完・unknown、およびL2-012接続の同一scope/revision/evidence traceを前提として照合する。各fieldがmissing, unknown, stale, wrong-revisionなら他sourceや別episodeで補完せず分類を確定しない。source/evidence ownerまたは既存接続契約ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-004 — `LABO-004-FR-01`

既存方式A/Bとsource evidenceから `purpose, structure, behavior, assumption, constraint, guarantee, cost` の7軸を別fieldとして保持する比較仮説を作る。守では変更前に意味・目的・条件・構造を保持し、破では全体一致を仮定せず部分一致と条件依存差を比較し、離では有効部分の再構成案をcandidateとして提示する。candidateはauthority/採択済み状態ではない。原方式のmeaning/purpose/condition/structureと未完義務を先に読み、確認前に変換しない。意味が不明なら変換せずsource clarificationへ戻す。

- **LABO-004-AC-01 — 七軸・守破離**：方式A/Bの7軸をsource identity/revision付きで保持し、守の意味/目的/条件/構造、破の部分一致・条件差、離の根拠付き再構成candidateを区別して出す。共通未完義務はidentityと未完状態を保持し、比較・再構成で脱落させない。
- **LABO-004-AC-02 — 部分一致とauthority**：一軸または条件だけ異なるfixtureで部分一致を全体同等としたり差異を隠したり、candidateをauthority/採択済みと表示したら不成立。差異と根拠を該当軸へ保つ。
- **LABO-004-AC-03 — source clarification**：元方式の意味/purpose/条件/evidenceを確認できないとき、または読む前に変換を試みたときは再構成へ進まず、identity/revisionと不足理由を保って元source ownerへ戻す。未完義務を元方式から切り離し完了扱いにすることも拒否する。
- **依存・版**：固定L2-013の各分類根拠、反証、unknown、条件とDecompose→Vector接続のidentity/revision/scope/evidence trace、および比較対象source本文のidentity/revisionを前提として照合する。各軸または接続fieldがmissing, unknown, stale, wrong-revisionなら別軸・別sourceで補完せず、比較対象source/既存接続契約ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-005 — `LABO-005-FR-01`

L2-004等の仮説から `KEEP, REDUCE, SPLIT, MERGE, REDEFINE, REPLACE, RELOCATE, ABSTRACT, SPECIALIZE, REFRAME, DEFER, RETIRE` の12 operation候補を個別に表し、source identity/revision、保つ意味、変わる意味、適用条件、scopeを併記する。既存機構への吸収、責務移動、operationへの復帰、retireも比較対象に残す。機構追加件数を改善目的とせず、意味変更candidateは上流判断対象として示す。LABOは採択、実行、変更、退役を決定しない。

- **LABO-005-AC-01 — operation identityと差分**：12 operation identityを個別表現でき、各候補の維持/変更意味・条件・scopeが根拠sourceに結び付く。吸収、責務移動、operation復帰、退役も候補に含む。
- **LABO-005-AC-02 — 未確定維持**：scope/意味差分/根拠が不足または矛盾する候補を確定せずunknown/unresolvedのまま保持する。意味変更は明示する。
- **LABO-005-AC-03 — authority境界**：candidateを自動採択/実行/退役したり、意味変更を技術refactorへ偽装する出力は不成立。意味変更は既存の上流authority境界へ、元候補source不足はそのownerへ返す。新owner/approval gateは作らない。
- **依存・版**：固定L2-004/014のVector出力identity/revision/scope、元方式の意味と部分比較・条件差・evidenceを前提として照合する。いずれかのidentity/field/source revision/scope/接続根拠がmissing, unknown, stale, wrong-revisionなら別候補や別sourceで補完せずoperation candidateを確定せず、元仮説/sourceまたは既存接続契約ownerへ戻す。`version_target: 1.0`。

### 固定親句→FR/AC trace

| 固定親句 | FR / AC | L10 case | 照合点 |
|---|---|---|---|
| 002 source eventから要求→recovery等のepisodeを結び、identity/environment/resultを追う。source status 7値を区別しunknown/not_observed/拒否/失敗をsuccessへしない | `LABO-002-FR-01`; `LABO-002-AC-01` | `L10-LABO-002-CASE-01, L10-LABO-002-CASE-02, L10-LABO-002-CASE-07, L10-LABO-002-CASE-12` | 全列挙stage、field、source/revision逆参照 |
| 002 correlation不能eventを孤立/不明で保持し、実event不在はpartial正常、contract defectは不成立として分ける | `LABO-002-AC-02` | `L10-LABO-002-CASE-02, L10-LABO-002-CASE-03, L10-LABO-002-CASE-08, L10-LABO-002-CASE-12` | 孤立/欠測維持、補完なし |
| 002相関と因果未確定を分離し、時刻/path単独の因果断定や無関係event結合を禁止 | `LABO-002-AC-03` | `L10-LABO-002-CASE-04, L10-LABO-002-CASE-13, L10-LABO-002-CASE-14` | 近接だけでは結合せず因果不確定 |
| 002未完義務補完禁止、訂正で元eventを変更しない | `LABO-002-AC-02, LABO-002-AC-03` | `L10-LABO-002-CASE-05, L10-LABO-002-CASE-06` | 不足を露呈しrelationのみ訂正 |
| 002依存L2-001の全列挙fieldとL2-011接続identity/revision/scopeを独立照合 | `LABO-002-AC-01, LABO-002-AC-03` | `L10-LABO-002-CASE-09, L10-LABO-002-CASE-10, L10-LABO-002-CASE-11` | 各fieldのmissing/unknown/stale/wrong-revisionを別fixtureにし、別source補完なし・固定source/connection owner戻し |
| 003列挙分類軸の根拠付き独立分類と未完義務保持 | `LABO-003-FR-01`; `LABO-003-AC-01, LABO-003-AC-02` | `L10-LABO-003-CASE-01, L10-LABO-003-CASE-07, L10-LABO-003-CASE-10` | 全分類軸を独立保持、未見例も同一AC |
| 003一括採否/unknown推測/条件付き成功一般化禁止 | `LABO-003-AC-02` | `L10-LABO-003-CASE-02, L10-LABO-003-CASE-03, L10-LABO-003-CASE-04` | 条件差・unknown・反証を別々に保つ |
| 003意味を変えずevidenceへ戻る | `LABO-003-AC-03` | `L10-LABO-003-CASE-05, L10-LABO-003-CASE-06` | source/revision保持と元owner戻し |
| 003 L2-002/012依存fieldと9分類各根拠の個別不足/矛盾 | `LABO-003-AC-01, LABO-003-AC-02, LABO-003-AC-03` | `L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` | 一field/一分類だけ変異させ、別episode/evidence補完なし・元owner戻し |
| 004七軸比較、守破離、部分一致/条件差、離candidate | `LABO-004-FR-01`; `LABO-004-AC-01, LABO-004-AC-02` | `L10-LABO-004-CASE-01, L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-07` | 七軸・段階・差異・未見正常 |
| 004元方式の意味を読む前に変換せず、意味不明なら明確化 | `LABO-004-AC-03` | `L10-LABO-004-CASE-04, L10-LABO-004-CASE-05, L10-LABO-004-CASE-10` | source identity/revisionと不足理由を戻す |
| 004 candidateはauthorityでない | `LABO-004-AC-02` | `L10-LABO-004-CASE-06` | 採択状態を生成しない |
| 004 L2-013依存field、比較source、七軸の単独欠落/不一致 | `LABO-004-AC-01, LABO-004-AC-03` | `L10-LABO-004-CASE-08, L10-LABO-004-CASE-09` | 他軸/他sourceで補完せず、比較を確定せず既存ownerへ戻す |
| 005 12 operationごとに維持/変更意味・条件・scopeを比較 | `LABO-005-FR-01`; `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-08` | 12個別identity、根拠付き差分 |
| 005吸収/移管/operation復帰/retireと未完義務を残し機構数を目的化しない | `LABO-005-AC-01, LABO-005-AC-02` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-02, L10-LABO-005-CASE-12` | 代替候補も保持 |
| 005意味変更は上流判断、LABOが採択/retireしない | `LABO-005-AC-02, LABO-005-AC-03` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-04, L10-LABO-005-CASE-05, L10-LABO-005-CASE-06` | unknown保持、意味変更表示、権限外出力なし |
| 005 L2-004/014依存と全候補tuple（維持/変更意味・条件・scope）の個別欠落/不一致 | `LABO-005-AC-01, LABO-005-AC-02, LABO-005-AC-03` | `L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` | 補完せずcandidateを未確定にし、元仮説/sourceまたは既存connection ownerへ戻す |

### 旧source item dispositionとpair層差

- `LEGACY-ASSET-28FB139B26CD61CC51EE` §1 R-01/R-02の5 category/12 metricは本4親の固定分類語彙と一致しない。failure/missingを隠さない意味のみ再導出し、旧category/metric identity・順序・provider/team順位は置換・除外。
- 同asset §1 R-03〜R-05のprovider/team/profile軸、task snapshot、run protocolは固定親の入力契約ではない。source identity/revision/scope追跡の意味だけ再導出し、axis、15-field snapshot、seed/timeout/retry/cache/hardware protocolは持ち込まない。
- 同asset §1 R-06〜R-08のhidden oracle/scorer、accepted-change scoring/cost、blind judgeは固定親にない。evidenceとversionを保ち自己申告で確定しない意味だけ再導出し、scorer/価格/hidden dataset/judge条件は除外。
- 同asset §2 fixed portfolioと§3 runner/admission/price/implementation exclusionsは旧Bench固有であり、この4親へ移さない。
- `LEGACY-ASSET-A952A3A175EB82A4781B` の旧L10 AC-001–014は現行親のACと一致しない。positive/negative/traceの意味のみ再導出し、旧ID/runner/threshold/countは置換。
- 旧forward L3定義とREADME/test-designの配置差は自動移植せず、現行6文書のfunctional AC正本とL10照合pairへ置換する。本Stage 2bに独立business outcomeはないためBR/BV/BCASEを作らない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010（候補、1.0）

このStage 2b cutoutの後半は、前半の002–005に続く5親のL3候補である。各親のversion targetはPOが採択した1.0 target candidateで、実際の契約版・成果物版、実装・実行・release許可を意味しない。意味・scope・owner・versionを変更しない。固定L2/L11が要件authority、PO decision `633bf12ea8f948db8ba3d6600179c4a9507377a7` が採択登録、G0 `1880c422311a7f8321dbb0e2b98fa12c69449201` はStage順序だけの記録である。他Stageの候補本文をauthorityとして使わない。

| 親 | 採択registration | 固定L2 | 対L11 | PO row | G0 order row | 採択依存 |
|---|---|---|---|---:|---:|---|
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` | `labo-requirements.md:109-116` | `labo-acceptance.md:50` | 53 | 253 | L2-005/015/022/028 |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` | `labo-requirements.md:117-124` | `labo-acceptance.md:51` | 54 | 254 | L2-006/016 |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` | `labo-requirements.md:125-132` | `labo-acceptance.md:52` | 55 | 255 | L2-007/017 |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` | `labo-requirements.md:133-140` | `labo-acceptance.md:53` | 56 | 256 | L2-006/018 |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` | `labo-requirements.md:141-148` | `labo-acceptance.md:54` | 57 | 257 | L2-009/019 |

L2/L11固定revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption decisionは `633bf12ea8f948db8ba3d6600179c4a9507377a7`、順序記録は `1880c422311a7f8321dbb0e2b98fa12c69449201`。各registrationのsemantic digest、全file/span SHAは、この本文と同時点の不変監査記録に固定する。L2の依存はG0の短い要約だけでなく、固定L2本文の全句から照合する。

### HELIXLABO-L2-006 — `LABO-006-FR-01` Experiment Engine

baseline/current、candidate、hybridの仮説、条件、適用scope、oracleと評価条件を、OSが割当てたWorkerによる実験結果と同一ticket・experiment・対象版へ結んで比較する。比較結果には、品質、success/failure、false positive/negative、再作業、速度、CI/Worker時間、token/API費用、人間介入、context、複雑度、復旧時間、release lead time、運用負荷、cross-product再利用性を個別に記録し、失敗・反例・適用範囲・費用・限界を保持する。比較不能・中断・unknownをsuccessまたはimprovementへ変換しない。

依存は、L2-005/015が供給する比較armの仮説・条件・scope・oracle・version alignment、L2-022が供給するOS ticket/operation/assignment/source observation identity+revision、L2-028が供給するWorker result contract/task class/assignment identity/source/target-version linkである。assignmentと実行はOSの権限に従うWorkerが担い、LABOはWorkerを選定・割当・起動せず、元source truthやoracle条件を修正しない。

- **LABO-006-AC-01 — 比較armと個別軸**：同じ宣言条件・scope・oracleでbaseline/current、candidate、hybridを別armとして保持し、親の評価対象各dimensionを独立に出力する。Weighted score、平均点または単一「動いた」結果で失敗・品質低下・反例を相殺しない。oracleまたは宣言済み比較条件が定める必要品質条件を下回る結果を、速度改善など別dimensionで相殺して比較全体の改善としない。
- **LABO-006-AC-02 — 実行・identity束縛**：OS割当、ticket、experiment identity、Worker result contract/source、対象版が一致した観測のみを同一比較に結ぶ。LABOがassignmentを作る・変更する・Workerを指定する出力をしない。
- **LABO-006-AC-03 — 比較可能性・失敗・欠測**：arm間の条件/oracle/version差、個別metric欠測、反例、中断、判定不能をsource・理由付きで保持し、無効比較や部分観測を成功、ゼロ費用、improvementへ補完しない。assignment/source/link不足はOS、Worker result contract/source不足はその提供owner、仮説・oracle・比較条件の不足は元のexperiment/oracle ownerへ戻す。

### HELIXLABO-L2-007 — `LABO-007-FR-01` Assurance Allocation Engine

反復episode、L2-006の比較可能な実験証拠、rule candidateとoracleを入力し、同条件再現性、機械判定可能性、oracleの適用性、副作用範囲、retry/rollback可能性、冪等性の6条件をそれぞれ評価する。出力はsystemization candidateとoperation continuation candidate、およびscope・限界・未確定条件の並列評価とする。文脈依存、意味判断、例外多数、不完全oracle、高い誤検知、過剰拘束のいずれもoperation continuationの候補から除外する根拠にしない。systemization rateの最大化を目的・成功指標にせず、shadow等の段階を観測状態として区別し、六条件評価とoperation継続候補を並行して保持する。

L2-016が供給するconnectionをまたぐ比較可能性、counterexample保持、oracle/interruption/undecidable stateも入力証拠として追跡する。比較可能性・oracle・experiment identity/revisionの不足は同じ入力成果とみなさない。`Operation → Repeated Stable Decision → Rule Candidate → Shadow → Mechanism Candidate`は評価を説明する状態名であり、自動昇格、資格判定、新承認手続きではない。LABOはoperationの採択・実行、system化の承認を行わない。

- **LABO-007-AC-01 — 六条件の独立評価**：6条件をそれぞれsupported / contradicted / unknownと証拠locator付きで示す。同じscope・条件・oracleに基づく比較可能な証拠を保ち、1条件の証拠で他条件を補わない。
- **LABO-007-AC-02 — 両候補と運用継続**：systemizationとoperation continuationを同じ証拠範囲で評価し、文脈依存等の限界・反例・未完条件を保持する。未知条件があるがoperation継続を支える根拠がある場合、その候補を消さずunresolved条件を併記する。六つのoperation候補条件のどれかを根拠にsystemization-onlyへ限定する場合は不成立。operation continuation candidateの評価状態と、その候補に関して別途与えられた未完義務の有無・identity/stateを区別し、候補自体を実operationや未完義務の状態として表示しない。比較不能・中断・判定不能・stale identity/revisionは保持し、実験evidence ownerへ戻す。実operationを実行・完了したことにはしない。
- **LABO-007-AC-03 — 段階とauthorityの分離**：候補段階を観測記述として扱い、自動昇格・新gate・承認・qualification・operation実行を生成しない。experiment/oracle不足は元source ownerへ、system/operation責任文脈は現在の責務ownerへ戻し、新ownerを作らない。

### HELIXLABO-L2-008 — `LABO-008-FR-01` Operational Fallback Engine

version付きのcurrent system-rule、owner提供の運用結果、例外、誤検知、回避運用とその負担、変更費用を入力し、system継続・修正またはoperationへの復帰の再評価candidateを示す。各candidateには適用するoperation条件、現行保証、根拠と未完義務を保持する。systemの永続固定を仮定せず、operationへ戻る案をfailureやretirementに読み替えない。単独成立依存としてL2-007のsystem/operation評価candidateとL2-017のcurrent guarantee、再評価candidate、unfinished duties、owner提供結果を現行責務のownerの情報として参照する。L2-007/L2-017を未承認候補で置き換えない。

- **LABO-008-AC-01 — 根拠付き選択肢**：current system versionに対応する運用結果と例外・誤検知・workaround・変更費用をsource付きで示し、continue / modify / operational fallbackの候補を根拠・適用条件とともに出す。
- **LABO-008-AC-02 — 保証と未完義務**：候補ごとに現行保証、復帰先operationの条件、未完義務・owner提供結果を保持し、未知/欠落を完了や義務消失へ変換しない。
- **LABO-008-AC-03 — 切替とowner境界**：LABOはsystem変更やoperation切替を実行しない。version、運用結果、例外、誤検知、workaround burden、費用、保証、責務ownerのどれかがmissing/stale/conflictならunknown/unresolvedとして現行責務のownerへ戻す。L2-007/017の依存identity/revision/scope欠落・staleも同様に保留し、固定L2-008の「現行責務のowner」へ戻す。

### HELIXLABO-L2-009 — `LABO-009-FR-01` Generalization Engine

L2-006の評価済みexperiment群、counterexample、sample conditionsとL2-018の比較結果・適用限界から、支持されるscopeを5段階 `single episode`, `repeated episodes`, `cross-project`, `cross-product`, `general structure`のいずれまでか示す。一事例から反復・project・productを越える主張を作らない。各段階の根拠、標本条件、反例、applicability limitを結ぶ。Feedback先をscopeごとに分け、product固有meaningをBRAINへ送らず、generic structureは直接の根拠なしに認定しない。counterexampleまたはapplicability boundaryがclaimを反証する場合はsupported scopeを狭める。反例またはscope外条件があれば支持範囲を狭め、元evidence ownerへ戻す。

- **LABO-009-AC-01 — 五scopeの根拠**：5段階を明示して評価し、各claimの支持/反証evidence identity、sample conditions、適用境界を列記する。支持される範囲より広いscopeを出力しない。
- **LABO-009-AC-02 — 反例とFeedback先**：counterexample・applicability limitで主張scopeを狭め、元evidenceへtraceする。product固有meaningと汎用構造を混同せず、product固有meaningをBRAINへrouteしない。
- **LABO-009-AC-03 — 推測防止**：scope/sample/evaluation result/反例がmissing, unknown, staleまたは比較不能ならscopeをunknown/unassessedに保ち、該当experiment/evidenceの既存ownerへ理由付きで戻す。適用可能な反例を無視して広いscopeを維持することも不成立とする。単一episodeから上位scopeを認定せず、根拠を作らない。LABOがscope基準やsample thresholdを新設しない。

### HELIXLABO-L2-010 — `LABO-010-FR-01` Feedback Derivation Engine

評価済みepisode、実験、反例、適用範囲から、必要に応じて複数のtarget-specific Feedback proposalを作る。各proposalは親が列挙する16 fieldをすべてsource/evidenceへ結び、欠落を推測補完しない。`recommended_action`の有効語彙は正確に `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` の8値とする。親の8値を含む有効proposalは候補として通常に記録する。未知・無効enumはunknownとして保持し、近い値へ変換しない。

Feedbackは非権威の提案であり、登録とroutingはOS、内容変更はtarget ownerが担う。target identity/responsibility、scope、evidence、counterexample、regression risk、revalidation conditionを分け、複数targetへの分解はtargetごとに別proposalとして保持する。LABOはticket、target変更、許可、配置、採択、retireを生成・実行しない。L2-019からのunknown targetはrouting candidateに留め、確定routingにしない。

- **LABO-010-AC-01 — 16 mandatory fields**：`source_episode`, `source_revision`, `target_mechanism`, `target_responsibility`, `observation`, `evidence`, `failure_or_success`, `hypothesis`, `experiment`, `result`, `counterexample`, `scope`, `confidence`, `regression_risk`, `recommended_action`, `revalidation_condition`を各proposalに明示する。source/valueを別fieldから推測せず、field missing/conflictはproposalを未確定へ保つ。
- **LABO-010-AC-02 — 8 valid actions and unknown enum**：上記8有効actionは個別proposal valueとして受け付け、meaning/scope/evidenceを維持する。列挙外の値、または値が不明な場合はunknown/invalidのまま保持し、有効値へ補正しない。
- **LABO-010-AC-03 — target別提案と権限境界**：複数targetを含む根拠はtargetごとに分離し、各targetのresponsibility/evidence/applicabilityを保つ。提案からOS registration/routing、ticket、target authority変更を生成しない。mandatory field/evidenceは該当source ownerへ、target責務の不明はOS routing ownerおよびtarget responsibility sourceへ候補として戻す。

**旧source調査（項目別）**：003/004の旧source検索には、002だけの起点であるUIL-R-02を含めない。旧Bench要件 `helix-bench-evaluation.md:35–147`、paired acceptance `helix-bench-evaluation-acceptance.md:19–45`、旧共通L3定義 `L00-L06-design-phase.md:148–168` のbounded範囲を検索し、failure/source evidenceと正負pairの近接類例は確認したが、L2-003の九分類やL2-004のVector守破離七軸に一致する旧要件は見つからなかった。固定L2から再導出し、隣接Bench scorer/ranking制約は継承しない。旧L3共通定義と対testのsource pin・各対象spanは新時点監査記録に固定する。archive全体の不在は主張しない。

### 親句→FR/AC対応

| 固定親句 | L3 FR / AC |
|---|---|
| 006 baseline/current・candidate・hybridの比較、親が列挙する全evaluation dimensions、失敗/反例/費用/限界、およびoracleまたは宣言済み比較条件の必要品質を速度で相殺しない | `LABO-006-FR-01`; `LABO-006-AC-01`, `LABO-006-AC-03`; L10: `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-14`, `L10-LABO-006-CASE-15`, `L10-LABO-006-CASE-16`（品質違反と速度改善を別軸で保持し全体改善としない） |
| 006 OS assignment下のWorker実行結果、同じticket/experiment/target versionへのlink、LABOは割当しない | `LABO-006-FR-01`; `LABO-006-AC-02`, `LABO-006-AC-03` |
| 007 six conditionsを個別評価、比較可能なL2-006/016 evidence、systemization率最大化を目的にしない | `LABO-007-FR-01`; `LABO-007-AC-01`, `LABO-007-AC-02` |
| 007 systemizationとoperation continuation、候補評価と実operation/未完義務の状態分離、段階は説明用で自動昇格・新承認なし | `LABO-007-FR-01`; `LABO-007-AC-02`, `LABO-007-AC-03`; L10: `L10-LABO-007-CASE-19` |
| 008 continue/modify/operation fallback、根拠・条件・保証・未完義務、L2-007/017依存、LABO切替なし | `LABO-008-FR-01`; `LABO-008-AC-01`, `LABO-008-AC-02`, `LABO-008-AC-03` |
| 009 five scope levels、標本条件/反例/applicability、counterexampleでnarrow | `LABO-009-FR-01`; `LABO-009-AC-01`, `LABO-009-AC-02`, `LABO-009-AC-03` |
| 009 scope別Feedback先、product-specificをBRAINへ送らずgeneric structureを推測しない | `LABO-009-FR-01`; `LABO-009-AC-02`, `LABO-009-AC-03` |
| 010 target-specific Feedback proposal、16 field/8 action enum | `LABO-010-FR-01`; `LABO-010-AC-01`, `LABO-010-AC-02` |
| 010 proposalはnon-authority、OS registration/routing、target owner changes、欠落根拠を差戻す | `LABO-010-FR-01`; `LABO-010-AC-03` |

### 旧source項目別disposition

この5親に対する起点は旧Bench要件・旧paired test・旧L3定義とREADME、および関連する旧Universal Improvement Loopである。以下のdispositionは同一要求の完全一致を意味しない。項目ごとに固定親から意味を再導出し、固定親にない旧制約・runtime・資格・scorerを持ち込まない。各registration semantic digest、fixed/legacy sourceのfull SHAとraw-LF bounded span、親別trace、case count、静的確認は[本件の不変source/pair監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair04-2026-10-05.json)を参照する。

| 旧source | 対象項目と扱い |
|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:35-147` | failure/missingを隠さず、source・version・scope・comparison条件とevidenceのlineageを持つ考えは006/007/009/010の各句へ意味再導出。旧5 category/12 metrics、team/provider順位、scorer、hidden oracle、fixed task portfolio・protocol、価格/accepted-change、qualification/admissionは本親の根拠でなく置換/除外。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:19-45` | positive/negative oracleの分離・trace形式だけをL10対へ再導出。旧AC IDs、metric、runner、threshold、admissionは置換/除外。 |
| `LEGACY-ASSET-F542125805B777D8A56A` — `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168` | FR/ACと対のverification designという意味を再導出。旧G3/runtime/sub-gate/engineering disciplineを現行gateにしない。 |
| `LEGACY-ASSET-9A772391C7FB1298D45F` — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:19-56` | 責務文書の分割という意図だけ再導出し、旧3文書/L3→L12一文書配置を現行6 canonicalのL3↔L10 pairへ置換。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:68-103` | incomparable/interrupted evidenceとlineageを保つ一般的意味だけ関連sourceとして再導出。event trigger、eligibility gate、merge/post-main lifecycle、workflow routing、candidate schemaは移さない。 |

Assurance AllocationまたはOperational Fallbackと完全一致する旧L3要件は、旧HELIX-Bench L3-requirementsと旧test-design/helixの上記bounded searchで見つからなかった。隣接hitは原文文脈を読み、別概念として除外した。この範囲限定の不在確認をarchive全体の不存在とはしない。旧test/runtime/CIは実行していない。

| 固定parent | 旧source項目と判定 | 現行で保つ意味 / 置換・除外 |
|---|---|---|
| `HELIXLABO-L2-006` | 旧Bench `LEGACY-ASSET-28FB139B26CD61CC51EE` R-01/R-02, R-04–R-08（`helix-bench-evaluation.md:35-147`）とpaired AC-002/005/007/008/010/011（`helix-bench-evaluation-acceptance.md:19-45`） | failure/missingを捨てず、source/version/condition/oracleの差で比較無効を表示し、metric別evidenceとcostを記録する意味だけ再導出。旧5 category/12 metric、scorer/weight、team/provider axis、hidden oracle、fixed snapshot/protocol/hardware、accepted-change priceを置換/除外。 |
| `HELIXLABO-L2-007` | bounded old L3/test-design searchで同じAssurance Allocation要件は不在。隣接のsystem synthesis等のhitは文脈上別概念として除外。旧Bench R-06/R-08や旧UIL sourceはこの親の条件ではない。 | 六条件、両候補、operation継続、説明上の段階とno-auto-promotionは固定L2/L11から再導出。旧scorer/admission/qualification/shadow lifecycleを根拠に追加せず、旧source未発見だけを理由にL2意味を変更しない。 |
| `HELIXLABO-L2-008` | bounded old L3/test-design searchで同じOperational Fallback要件は不在。隣接する一般改善・運用記述を本親の直接起点としない。旧UILのevent trigger/lifecycleは異なる。 | current system evidence、continue/modify/operation復帰候補、保証/条件/未完義務は固定L2/L11から再導出。旧fallback workflow、退役条件、trigger、実切替を持ち込まない。 |
| `HELIXLABO-L2-009` | 旧Bench R-03/R-04/R-05（同一条件比較・snapshot/protocol）とpaired AC-003/005/007が比較可能性を扱う。 | scope・sample condition・counterexampleを保持する一般意味だけ再導出。固定親の五scopeを正本とし、旧team/profile/cohortやfixed sample/workload thresholdは置換/除外。 |
| `HELIXLABO-L2-010` | 旧Bench R-06/R-08、paired AC-008/012のevidence lineageは一般比較起点。旧UIL R-04 candidate schemaとadmission/route lifecycleは存在するが別責務なので移植しない。 | 正確な16 field、8 valid action、proposal-only/OS registration・routing/target-owner changesは固定L2/L11から再導出。旧candidate schema、event trigger、hidden oracle、eligibility/admission、ticket creationを置換/除外。 |

上記の旧source asset/path、commit、full-file SHA、個別raw-LF span SHA、bounded search条件・hit除外理由はlinked immutable auditに記録する。再利用は既存の数値・schema・runtimeをcopyすることではなく、source/evidence/failure/unknownを隠さない一般的意味の再導出に限る。

## Stage 2a — 採択親 HELIXLABO-L2-055/056/057（候補、1.0）

この追補は既存Stage 1本文の後続部分であり、Stage 1本文・権威・承認状態を変えない。対象は固定された3 parent identityのみ。L2-005や未承認L3候補はdependency authorityにしない。L2-028/001等の明示依存は当該固定親の契約として参照する。全てversion_targetは1.0、meaning/scope/owner/version変更は提案しない。

### 共通authority pin

| 親 | PO採択対象 | 固定L2 source (commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`) | 対L11 source・span |
|---|---|---|---|
| HELIXLABO-L2-055-002 | `633bf12ea8f948db8ba3d6600179c4a9507377a7:docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md:58` | `docs/helix-labo/L2-requirements/labo-requirements.md:150-154` | `docs/helix-labo/L11-acceptance/labo-acceptance.md:56,191-196` |
| HELIXLABO-L2-056-003 | same decision `:96` | `labo-requirements.md:379-389` | `labo-acceptance.md:138-146,198-203` |
| HELIXLABO-L2-057-002 | same decision `:97` | `labo-requirements.md:391-401` | `labo-acceptance.md:148-154` |

PO採択本文は decision full SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`。L2全体SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、L11全体SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`。採択行、固定親句およびraw LFを含む行span SHAは付属source pins handoffで各々pinする。implementation-order addendum 295-297行は作業順序の根拠であって採択authorityではない。

### HELIXLABO-L2-055-002 — `LABO-055-FR-01`

許可されたWorker作業履歴を `task type × model class` の別々の群として集計し、出力には群identity、source/history revision、観測件数とsourceに実在する各result-state label別の件数（状態語彙・identityを新設または統合せず、state unknownとstate missingも件数から落とさない）、評価期間・適用範囲、evidence、評価済み/未評価の別、および固定L11が定める採用する評価oracle/基準が返した対応可能性水準を保持する。証拠充足状態（観測なし、未評価、範囲内評価済み、評価済みと未評価の混在）は水準と別の補助情報とし、水準の意味・順序・値をここで新設しない。oracle/基準が対象scopeを判定でき、評価結果がある範囲に限り、その結果の水準と根拠を保持する。未観測groupや未知taskを履歴だけから成功と推論せず、配置案・Worker/modelの選定/指定/割当・権限変更を行わない。

- **LABO-055-AC-01 — groupと出典**：異なるtask typeまたはmodel classの履歴を混合せず、それぞれのsource identity/revisionとtask/model classを同じgroupへ追跡できる。sourceが持つresult-state labelは実在する値ごとに出典付きで保持し、既存の状態を別の状態へ統合・変換しない。stateがmissingまたはsource上unknownの場合も区別して事実と不確実性を併記し、件数から暗黙にdropしない。ここで新しい必須state語彙は定めない。
- **LABO-055-AC-02 — 水準と不確実性**：証拠充足状態候補 `NO_OBSERVATIONS` / `OBSERVED_UNASSESSED` / `ASSESSED_WITHIN_SCOPE` / `MIXED_EVALUATED_AND_UNASSESSED` は入力記録状態と一致し、oracle/基準由来の対応可能性水準とは別に保持する。対応可能性水準は固定L11が定める採用する評価oracle/基準の適用可能な結果から同じ群・scopeに限って保持し、oracle/基準が異なる水準を返したfixtureではそれぞれの水準と根拠を混同・統合しない。未見task/classもoracle/基準の適用scope内で判定可能な評価結果があればその範囲で評価できる。oracle/基準が未提示・適用scope外・判定不能、または根拠不足なら未評価を維持する。履歴上の単一successだけから水準・成功保証を生成せず、scope外の水準を流用しない。
- **LABO-055-AC-03 — ownerと訂正**：source/historyのmissing, stale, contradictionは該当する原履歴sourceへ戻し、LABOがsource stateを修正しない。配置/割当/資格判断を出力しない。OS-owned assignment identityはOS、Worker実行/result identityはWorkerまたは元result source、許可/data classificationはSECURITYに戻す。
- **LABO-055-AC-04 — 分母・採点根拠**：数値metricまたは集約水準を出すときは、結果確認前に固定した明示scopeごとのeligible denominatorと集計対象、算入結果、欠測/失敗/拒否/停止/unknownの個別dispositionと算入・除外理由、計算規則、scorer/oracle revisionを記録する。結果確認後に分母・集計対象を変更しない。重大なquality/scope/security/data-loss failureを平均点等で相殺せず、失敗のまま保持する。費用を出力する場合はmissing costを0へ置換しない。判定不能を未評価として残す場合も、既知の失敗を未評価へ置換しない。同じsource receiptから結果を再構成可能にし、定性的水準も適用条件・判定根拠・未評価部分を特定する。固定L11の境界に従い、旧Benchのportfolio/反復/信頼区間/accepted-change正規化を全作業種別へ一律要求しない。

### HELIXLABO-L2-056-003 — `LABO-056-FR-01`

初回Worker resultをL2に定めるOS ticket/assignment/task/attempt、Worker・実行契約revision、要求revision/scope、result state、budget、deadline、verification・人確認、data-use class、source receiptとともにBench historyへ観測として追加する。観測された状態と性能評価済み状態を分離する。結果state `success / failure / refusal / interruption / unknown` は個別保持し、推定・合成しない。

- **LABO-056-AC-01 — observed**：許可された初回結果のsource identity/revision/scope、budget、deadlineおよび列挙された付随fieldを、欠落や不一致を補完せず保持し、結果は `observed` と記録する。budget/deadline値にmissing/conflictがあればfieldの欠落・不確実性を元recordとともに保持し、result stateは書き換えず、親が示すassignment/evidenceの戻し先へ返す。観測単体ではassessedにしない。
- **LABO-056-AC-02 — state fidelity**：5 stateを別々に記録し、unknown/refusal/interruptionをsuccessへcoerceせず、failure等を欠落させない。sourceに無いstateは作らない。
- **LABO-056-AC-03 — 評価範囲**：assessed表示は採用oracle/criteria identityとexact revision、task/model class、適用scope、判定根拠・比較条件、結果/失敗/反例/unknown、評価者、評価時点、および対象resultとoracleへ束縛された判定receiptが適用可能な範囲だけに限る。要素がmissing/stale/矛盾/範囲外なら履歴をunassessedのまま記録する。不足は評価oracle/criteriaを元々提供したsource ownerへ訂正依頼し、評価者・時点などreceiptの不足について新しいownerを設けない。Benchは記録先であってoracle ownerではない。
- **LABO-056-AC-04 — 重複・矛盾**：duplicate, stale, conflicting source resultを自動統合せず、元resultとrevisionを保って訂正追跡へ戻す。OS identity/source/scope不足はOS、許可/classification不足はSECURITY、実行/result/revision不足はWorkerまたはOSへ返す。受領成功を評価成功・資格化・assignmentへ昇格しない。
- **LABO-056-AC-05 — 実績照合と未評価維持**：source receiptは実runのticket/assignment/attempt、実Worker/model identity、実行契約revision、task class、要求/source revision、scope、result state、verification、人確認、data-useと照合する。不一致や不明は実行結果とreceiptの双方を保ったまま対応水準の根拠へ混ぜず、該当範囲を未評価/評価不能にする。scoreはscope、authority、assignment、qualificationを変更しない。必要なWorker契約revision、verificationまたは反例が欠ける場合もassessedへ昇格せず、不足は固定親が示す該当source ownerへ戻す。

### HELIXLABO-L2-057-002 — `LABO-057-FR-01`

OS execution resultをLABO-028へ受け取り、同一のticket/task/assignment/attempt/Worker identity、要求/契約revision、scope、result state、verification/human receipt、data-use class、未完義務を送信元と受領記録間で保つ。受渡し証拠は採択済みCONNECT contract、または同義務を示す明示human receiptのどちらでもよい。HELIXOS-L2-027は任意provenanceでありdependencyではない。

- **LABO-057-AC-01 — identityとfield**：送信source recordとLABO receiptが全必須identity、revision、scope、state、verification、人確認、data-use class、未完義務で一致する。同じresultを変更・補完しない。
- **LABO-057-AC-02 — 受領義務**：CONNECT契約と明示human receiptを独立した代替方式として扱う。いずれか一方式が契約/schema version・scopeの照合、acknowledgment、trace、dedupe、stale停止、same-ID retryと未完義務保持を証明すれば、同一義務を満たす受領根拠となる。片方の方式が不在またはunknownであることだけでは、他方の有効な方式による受領成立を妨げない。両方式が不在/unknownで有効な証拠がない場合は受領成功を主張しない。
- **LABO-057-AC-03 — fail-closedと戻し先**：方式固有の証拠（選択CONNECT契約の有効性/版、human receipt自体）の欠落・不一致・unknownはその方式の根拠に数えない。もう一方の有効な方式は、方式固有証拠の問題だけなら同一義務を満たす根拠になり得る。ただし、共通のsource identity/送達・scope/stateが不一致、送信receiptとLABO受領receiptが不一致、またはresult revisionがstale/改変されている場合は、どちらの方式でも受領成立を主張せず、元resultと未完義務を保持する。source identity/送達不一致はOS、送信/受領receipt不一致はOS/LABOへ戻す。受領schema/classification不一致はLABOまたはSECURITYへ戻す。027だけで接続依存を満たさない。
- **LABO-057-AC-04 — receipt返却と履歴化先**：成立した受領ではLABOが受領receiptを返し、後続の履歴化先を示す。受領receiptと履歴化先の対応が追跡できることを確認し、接続・配送成功自体から評価済み水準、資格、配置判断を作らない。assignmentはOSの責務のまま保持する。

### 旧source項目別dispositionと対の層

- `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`, SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`: FR+AC、3要件区分、要件と検証のtraceの**意味を再導出**。旧G3/runtime/sub-gateは**置換**。
- `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:19-56`, SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`: 3 sub-docの分担は**意味を再導出**。READMEの1 L3 acceptance doc→L12 pairと旧G3/trace sub-gateは**置換**。
- 旧HELIX-Bench `LEGACY-ASSET-28FB139B26CD61CC51EE` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:35-74,121-147,149-170`, SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`: source/version/scopeとnegative/unknown保持、provider neutralityは項目ごと**意味を再導出**。旧team benchmark、5分類/12指標、隠しoracle/scorer、qualification/admission、pricing、固定task portfolio/fieldsは**置換または除外**。
- `LEGACY-ASSET-A952A3A175EB82A4781B` 旧L10 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:19-45`, SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`: 正負caseとtraceの形だけ**意味を再導出**。旧oracle、AC数/ID、runnerは**置換**。
- `LEGACY-ASSET-50CA1C554747F12266D3` RLO worker/admission SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` および `LEGACY-ASSET-A26561A0EF7396D8F017` cloud qualification SHA-256 `4b388cda67484f1808b0f4b8834d5d234a47de49f7db6dcb12d92d2dcfbee185`: class/version違いを暗黙統合しない点だけ**意味を再導出**。適性admission、shadow/advisory/write/block lifecycleは**置換・除外**。

旧forward定義148-168行はL3とL10 UX受入設計のpairを示すが、旧README 37-49行はL3の3文書と単一L12 acceptance文書をpairとして示す。この層差は自動移植せず、現行配置規則に従い6文書のL3↔L10、functional ACを唯一の条件正本、L10は同一ACを照合する対として**置換**する。Stage 1 local本文は作業文脈として読んだだけであり、未承認のためauthorityにしない。

## Stage 4 — HELIXLABO-L2-036/037/038/039/040/041/052/054（候補）

状態：固定親から再導出した未承認L3/L10候補。対象は列記8 parentだけで、意味・範囲・owner・版は変更しない。本文はL3承認、実装/実行/配布許可を生成しない。要求段階のmain basis、PO決定記録、候補登録はすべて `633bf12ea8f948db8ba3d6600179c4a9507377a7` に存在する。PO決定は候補採択を記録し、registerは8候補を `registered_proposal` として登録する。要件意味の正本は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の固定L2/L11であり、登録状態からL3承認を推定しない。

### 固定親・版・対L11

| 親 | 採択登録 | 版 | 固定L2/L11条件 |
|---|---|---|---|
| `HELIXLABO-L2-036` | `MPR-RC-HELIXLABO-L2-036-001` | 1.0 | L2 `263-266`、L11 `87`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-037` | `MPR-RC-HELIXLABO-L2-037-001` | 1.0 | L2 `267-270`、L11 `88`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-038` | `MPR-RC-HELIXLABO-L2-038-001` | 1.0 | L2 `271-274`、L11 `89`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-039` | `MPR-RC-HELIXLABO-L2-039-001` | 1.0 | L2 `275-278`、L11 `90`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-040` | `MPR-RC-HELIXLABO-L2-040-001` | 上流採択scopeに従う | L2 `279-282`、L11 `91`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-041` | `MPR-RC-HELIXLABO-L2-041-001` | 上流採択scopeに従う | L2 `283-286`、L11 `92`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-052` | `MPR-RC-HELIXLABO-L2-052-001` | 1.0 | L2 `310-315`、L11 `102`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |
| `HELIXLABO-L2-054` | `MPR-RC-HELIXLABO-L2-054-001` | 1.0 | L2 `290-295`、L11 `94`。固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` |

### 旧sourceからの項目別扱い

UIL旧L3 `LEGACY-ASSET-02D897E62EF2FA267267`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`、whole SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`、143–160 span SHA `c968096594bfd6ae95d82a37c2d0ad914ba8299746a38bbb20b0ecba168c2f6b`）と旧paired acceptance `LEGACY-ASSET-0B5B38F146D9538C9A36`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md`、whole SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`、31–42 span `80adc31e42723500dffed7ef494d0529a3fbef2ffce51a2b5b8c40e78522e8f2`）から、source/evidence identity、観測と欠測、候補とauthority、failure/unknownの分離を各親へ再導出する。旧25 case、schema、route enum、runtime、承認workflowを移さない。

旧Bench L3 `LEGACY-ASSET-28FB139B26CD61CC51EE`（whole SHA `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`、19–36 span `0dec8b52e8c24136d6fbde9780e6e41c354d7147465f04da94c1046fb4a054b0`）と旧paired acceptance `LEGACY-ASSET-A952A3A175EB82A4781B`（whole SHA `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`、28–41 span `e304c3c36a59b2b3ef28f15d2912056fc3874cc211e0ed61d6b385d1fa0deaa7`）は054の評価軸の区別とpositive/negative oracle形式に限り再導出する。旧5 category、12 metric、scorer、hidden oracle、provider/team順位、runner、資格/admission、価格規約を本Stageの要求にしない。

旧共通L3定義 `LEGACY-ASSET-F542125805B777D8A56A` のFR+ACと対検証の意味は6文書pairとして再導出し、旧G3/runtime/sub-gateは置換する。各親固有の保持点・差分は監査記録に固定する。

### 旧sourceの親別disposition

| 固定親 | 旧source・項目 | disposition / 差分理由 |
|---|---|---|
| `HELIXLABO-L2-036` | `LEGACY-ASSET-02D897E62EF2FA267267` UIL旧L3 FR-003/004/005、`universal-improvement-loop-requirements.md:123-174` | findingをcandidateとして根拠・影響scope・上流戻し先へ結び付ける意味を再導出。旧event trigger、route schema、工程runtimeは置換し、HARNESSの要求・contractをLABOが変更しない。 |
| `HELIXLABO-L2-037` | 同UIL旧L3 FR-001 `universal-improvement-loop-requirements.md:41-75`、FR-004/005 `:143-174`、旧受入`LEGACY-ASSET-0B5B38F146D9538C9A36` `universal-improvement-loop-acceptance.md:31-42` | operation evidenceとcandidateを分ける検証の形を再導出。旧ticket/runtime/approval routeを置換し、登録・routing・運転をOSに残す。 |
| `HELIXLABO-L2-038` | 同UIL旧L3 authority write guard FR-004 `universal-improvement-loop-requirements.md:143-160`のみ（旧受入`LEGACY-ASSET-0B5B38F146D9538C9A36` 31-42にunauthorized-input oracleはない） | 権限境界と許可evidenceの分離を再導出。旧authorization mechanismを移植せず、authority/data-handling ownerをSECURITYに残す。restricted-dataの通常evidence禁止は固定L2/L11に基づく。 |
| `HELIXLABO-L2-039` | 同UIL旧L3 source identity FR-001 `universal-improvement-loop-requirements.md:41-75`、typed return FR-004/005 `:143-174` | result provenanceとfailure returnを再導出。旧Worker execution/runtimeを置換し、Worker assignment/executionをLABOから除く。 |
| `HELIXLABO-L2-040` | 同UIL旧L3 candidate/backflow FR-004/005 `universal-improvement-loop-requirements.md:143-174` | source/target identity保持をconnection固有evidenceへ再導出。旧transport/retry implementationを置換し、connector contract責務をCONNECTに残す。 |
| `HELIXLABO-L2-041` | 同UIL旧L3 semantic impact FR-003 `universal-improvement-loop-requirements.md:123-141`とtyped route FR-004 `:143-160` | meaning impactをProduct Core別に返す意味を再導出。generic portfolio routingは置換し、製品固有meaningをBRAINへ移さない。 |
| `HELIXLABO-L2-052` | 同UIL旧L3 provenance/observation FR-001/005/007 | source revisionからreceiptまでのlineageを、固定L2-035 payloadのcomposite traceとして再導出。旧merge/post-main promotion lifecycleは置換し、評価/受領をモデル更新へ結ばない。 |
| `HELIXLABO-L2-054` | `LEGACY-ASSET-28FB139B26CD61CC51EE` Bench L3 §0/R-03/R-08、`helix-bench-evaluation.md:19-36,76-95,96-169`; `LEGACY-ASSET-A952A3A175EB82A4781B` paired acceptance `helix-bench-evaluation-acceptance.md:28-41` | 直交した評価軸、version/scopeとunassessed evidenceの区別を再導出して055出力の専用handoffに限る。旧category/metric/scorer/runner/provider順位/admissionは置換・除外。 |

同一の旧sourceを複数親が利用する場合も、各行の現行意味はそれぞれの固定L2が定める。旧sourceは出自・失敗形態の起点であり、旧要求・ID・実装・承認状態の自動継承ではない。

### LABO-036-FR-01 — LABO → HELIX-HARNESS

HELIXLABO-L2-036の入力はV-model、要求形成、design obligation、verification contract、backflow、境界調整、refactor、release/maintenance工程のevidence。出力はHARNESS向けFeedback candidateとする。同一対象revisionの許可された工程evidenceを用い、根拠・範囲付きFeedback candidateをHARNESSへ返す。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-036-AC-01 — 正常・未見正常**：同一対象revisionの許可された工程evidenceを用い、根拠・範囲付きFeedback candidateをHARNESSへ返す。 未見正常条件として、未見のmaintenance工程evidenceを同じscope付きcandidate形式で返し、工程契約変更済みとはしない。
**LABO-036-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。target不明はrouting候補へ戻し、recipientを推測しない。要求・contractの意味判断はHARNESSの既存上流ownerに残す。
- LABOが要求意味を直接変更する。 直接変更を拒否し、元要求とcandidateを分け、変更を行わない。
- LABOがverification contractを直接変更する。 直接変更を拒否し、contractはHARNESSの正本に残す。
- 実験結果を根拠に工程contractを即時変更する（結果の個数や変更済み表示の有無を問わない）。実変更を拒否し、candidateを保持してHARNESSへ返す。
- Feedback target revisionを欠落させる。candidateの適用対象を確定せず、target不明をrouting候補へ戻す。
- source/evidence identityだけが欠落する。identity不明をunknownとして保持し、対象を推測せずrouting候補へ戻す。
- 適用scopeだけが欠落する。scopeを推測せずrouting候補へ戻す。
- HARNESS connectorだけが欠落する。接続先を推測せずhandoff未完了として保持する。
- 選択されたHARNESS接続に別接続のconnectorを代用する。固有connector一致を要求し、代用を拒否する。
- 接続片側だけが成功する。接続全体を成功扱いせず、失敗側と未完義務を保持する。

### LABO-037-FR-01 — LABO → HELIX-OS

HELIXLABO-L2-037の入力はticket、WIP、worker placement、priority、CI profile、inspection/integration、release promotion、retry/recovery、cost/order/stateの運転evidence。出力はOS向けFeedback candidateとする。OS target identityと選択connectorが特定された運転evidenceをFeedback candidateとしてOSへ返す。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-037-AC-01 — 正常・未見正常**：OS target identityと選択connectorが特定された運転evidenceをFeedback candidateとしてOSへ返す。 未見正常条件として、未見のretry/recovery evidenceを対象scopeとともにcandidate化し、実運転を生成しない。
**LABO-037-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。scopeまたはOS target identity不明はOSへ戻す。
- LABOがticketを発行する。 ticketを作らずcandidateに留める。
- LABOがworker placementを変更する。 assignmentを変更せず、OS責務のまま保持する。
- LABOがpriorityを変更する。 priorityを変更せず、OS責務のまま保持する。
- LABOがticket/operationを実行する。実行を開始せず、OSが持つ既存記録を参照したcandidateに留める。
- LABOが運転stateを更新する。 stateを変更せず、OSが持つ既存記録を参照したcandidateに留める。
- FeedbackをOS routingへ渡さず迂回する。 OS routing迂回を拒否し、ticket/operationを作らない。
- LABOがoperationを運転済みとして記録する。 運転を生成せずOSの記録を参照したcandidateに留める。
- OS target identityだけが欠落する。target不明をOSへ戻し、ticket/routing/operationを生成しない。
- 選択scopeだけが欠落する。scopeを推測せずOSへ戻す。
- 選択OS connectorだけが欠落する。routing未確定として保持しOSへ戻す。
- 選択されたOS接続に別接続のconnectorを代用する。固有connector一致を要求し、代用を拒否する。
- 接続片側だけが成功する。OS接続全体を成功扱いせず、失敗側と未完義務を保持する。

### LABO-038-FR-01 — LABO → SECURITY

HELIXLABO-L2-038の入力は認可・隔離・credential・情報保護に関する許可evidence。出力はSECURITY向けFeedback candidateとする。許可evidenceだけを取り扱い情報保護candidateをSECURITYへ渡す。restricted dataを通常packetまたは通常evidenceへ流さない。fixtureには合成markerのみを使い、実secret、credential、PIIは記録しない。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-038-AC-01 — 正常・未見正常**：許可evidenceだけを取り扱い情報保護candidateをSECURITYへ渡す。通常packet/evidenceにrestricted dataを流さず、未見正常fixtureでもauthority判断はSECURITYに残す。
**LABO-038-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。scope不明またはdata-handling contract不明はSECURITYへ戻す。restricted dataは通常packet/evidenceの両方へ流さない。
- LABOがauthorityを直接変更する。 authority変更を拒否し、candidateに留める。
- 合成restricted-data markerを通常packetへ含める。packetを成立扱いせず、情報保護責務をSECURITYへ戻す。実secret値はfixtureにも記録しない。
- 合成restricted-data markerを通常evidenceへ含める。evidenceを成立扱いせずSECURITYへ戻す。実secret値はfixtureにも記録しない。
- 選択scopeが不明なevidenceを許可evidenceとして扱う。 許可判定を推測せずunknownとしてSECURITYへ戻す。
- 許可evidence identityだけが欠落する。許可evidenceとして確定せずunknownをSECURITYへ戻す。
- SECURITY data-handling/target contractだけが欠落する。許可範囲を推測せずSECURITYへ戻す。
- SECURITY接続に別接続のconnectorを代用する。固有connector一致を要求し代用を拒否する。
- 接続片側だけが成功する。接続全体を成功扱いせず、失敗側と未完義務を保持する。

### LABO-039-FR-01 — LABO → Worker execution（OS/SECURITY経由）

HELIXLABO-L2-039の入力はWorker実行、停止、復旧に関する許可結果。出力はOS/SECURITYを経たtarget-specific Feedback candidateとする。既存OS/SECURITY routingを通ったWorker result identityと許可結果をtarget-specific Feedback candidateとして扱う。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-039-AC-01 — 正常・未見正常**：既存OS/SECURITY routingを通ったWorker result identityと許可結果をtarget-specific Feedback candidateとして扱う。 未見正常条件として、未見のrecovery resultも元Worker identityと既存routingを保って扱う。
**LABO-039-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。責務不明はOSへ。authority/data scope不明はSECURITYへ。
- LABOがWorker assignmentを変更する。 assignmentを変更せずOSへ返す。
- LABOがWorkerを直接実行する。 実行を行わず候補記録に留める。
- LABOがWorkerを直接停止する。 停止を行わず候補記録に留める。
- result identityを別Workerのresultへ差し替える。 resultとWorker identityの不一致をunknownとして保持する。
- OS routingを欠いた結果をtarget-specificとして受け入れる（L10-LABO-039-CASE-06）。target-specific candidateとして確定せずOSへ戻す。
- SECURITY routingを要する結果で同routingを欠落させる（L10-LABO-039-CASE-07）。許可結果として確定せずSECURITYへ戻す。
- Worker result identityだけが欠落する。resultをtarget-specificとせずunknownとしてOSへ戻す。
- 選択されたWorker接続に別接続のconnectorを代用する。固有connector一致を要求し代用を拒否する。
- OS側だけが成功しSECURITY側が未完了、またはその逆のfixtureを作る。両方の親条件が適用される場合、片側だけで接続成功とせず未完義務を保持する。

### LABO-040-FR-01 — LABO → HELIX-CONNECT

HELIXLABO-L2-040の入力は内外connection、retry、contract version、traceに関するevidence。出力はCONNECT向けFeedback candidateとする。選択されたconnection identityとその上流採択scopeのcontract versionに結び付くretry/trace evidenceをCONNECT candidateにする。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-040-AC-01 — 正常・未見正常**：選択されたconnection identityとその上流採択scopeのcontract versionに結び付くretry/trace evidenceをCONNECT candidateにする。未選択scopeを不成立にせず、未見正常条件では別の選択connectionのtraceを別identityのまま扱う。
**LABO-040-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。接続契約不一致はCONNECTへ。版の不一致はCONNECTへ。選択scopeの版欠落は隠さずunknownとして保持しcandidateを完了扱いしない。scope自体の不明はunknownとして保持しcandidateを確定しない。選択scopeに限って不足を検査し、未選択scope自体をfailureにしない。
- connection identityを欠落させる。 接続単位のcandidateとして確定せずunknownにする。
- 選択connectionのcontract versionを別revisionへ差し替える。 異revision evidenceを成功扱いせずCONNECTへ戻す。
- 上流採択scopeだけを欠落させる。scopeを推測せずunknownとして保持しcandidateを確定しない。
- 接続traceを欠落させる。 trace欠落を保ち候補を完了扱いしない。
- LABOがconnector contractを直接変更する。 contract変更を拒否しCONNECT ownerへ返す。
- CONNECT connectorだけが欠落する。CONNECT先を推測せずcandidateを未完了として保持する。

- 選択connectionのcontract versionだけが欠落する。欠落を隠さずunknownとして保持しcandidateを完了扱いしない。
- 選択connectionに別connectionのconnectorを代用する。固有connector不一致を拒否しCONNECTへ戻す。
- 選択connection接続の片側だけ成功する。接続全体を成功扱いせず未完義務を保持する。

### LABO-041-FR-01 — LABO → 該当Product Core

HELIXLABO-L2-041の入力はproduct固有meaning、要求、設計、domain、UXのevidence。出力は該当Product Core向けcandidateとする。選択製品identityと版に対応した個別connectorがあるscopeでproduct固有candidateを該当Product Coreへ返す。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-041-AC-01 — 正常・未見正常**：選択製品identityと版に対応した個別connectorがあるscopeでproduct固有candidateを該当Product Coreへ返す。未選択scopeを不成立にせず、未見の別domain evidenceも該当Product Core別に保ち、製品meaningを汎用化しない。
**LABO-041-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。対象製品またはowner不明は既存Product Core ownerへ戻す。
- product identityを欠落させる。 製品を推測せずowner不明として戻す。
- 別のProduct Coreをtargetとして指定する。 誤routeを拒否し正しいowner確認まで確定しない。
- product固有meaningをBRAIN向けgeneric structureとして送る。 generic化を拒否し製品側の意味を保持する。
- 選択製品のversionだけが欠落する。版を推測せず該当Product Core ownerへ戻す。
- 当該製品の個別connectorだけが欠落する。別製品へ迂回せず該当Product Core ownerへ戻す。
- LABOがProduct Coreの正本へ直接書き込む。書込みを拒否し正本を製品側に残す。

- 該当Product Core個別connectorへ別製品connectorを代用する。誤routeを拒否し製品identityに対応するconnectorを要求する。
- 該当Product Core接続の片側だけ成功する。接続全体を成功扱いせず未完義務を保持する。

### LABO-052-FR-01 — INTELLIGENCE評価材料循環（L2-035 payload）

HELIXLABO-L2-052の入力はL2-035で定義する評価済みsource revisionとpayload、適用範囲、未評価状態。出力はINTELLIGENCE側の受領証跡とLABO側から辿れる同一revisionの材料循環とする。035 payloadの境界を保ち、LABO source revisionからINTELLIGENCE receiptまで同一revision、適用scope、unassessed状態を対応づける。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-052-AC-01 — 正常・未見正常**：035 payloadの境界を保ち、LABO source revisionからINTELLIGENCE receiptまで同一revision、適用scope、unassessed状態を対応づける。 未見正常条件として、別種の評価材料でも035 payloadとsame revision/scope/stateを保ち、受領を評価成功としない。
**LABO-052-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。source identity自体の欠落は該当source/evidence ownerへ戻す。scope、revision、receiptの欠落・不一致はLABO再評価へ戻し、循環を未完了のまま保持する。この振分けはL2:312のsource/evidence戻しとL2:314の範囲・版・受領のLABO再評価を原因別に読むもので、別のownerを新設しない。
- receiptのsource revisionを別revisionにする。revision不一致でreceipt照合を成立させずLABO再評価へ戻す。
- receiptの適用scopeを別scopeにする。scope不一致で受領を成功扱いせずLABO再評価へ戻す。
- payloadのunassessed状態だけをassessedへ変える。 状態を元のまま保持し評価済みへの昇格を拒否する。
- 035 payload schemaを複製・再定義する。 052からschema定義を追加せず、035境界を参照する。
- receiptからmodel変更を自動生成する。 変更を生成せずINTELLIGENCE判断に残す。
- receiptからtrainingを自動生成する。 training許可を生成せずsource状態を保持する。
- receiptからbot稼働を自動生成する。 bot稼働を生成せずINTELLIGENCE判断に残す。
- source identityだけが欠落する。identityをunknownとして保持し該当source/evidence ownerへ戻す。
- source revisionだけが欠落する。revisionをunknownとして保持しLABO再評価へ戻す。
- 適用scopeだけが欠落する。scopeをunknownとして保持しLABO再評価へ戻す。
- INTELLIGENCE receiptだけが欠落する。受領を成功扱いせずLABO再評価へ戻す。
- receiptからtrainingまたは調整の実行・完了を循環成立の必須条件にする。必須化を拒否し、receiptと評価材料循環の境界を保つ。
- LABOがINTELLIGENCEの現在判断を生成・所有する。判断をLABO成果として確定せずINTELLIGENCEへ戻す。
- LABOがINTELLIGENCEの予測を生成・所有する。予測をLABO成果として確定せずINTELLIGENCEへ戻す。
- LABOがINTELLIGENCEの配置案を生成・所有する。配置案をLABO成果として確定せずINTELLIGENCEへ戻す。

### LABO-054-FR-01 — HELIX-Bench水準のINTELLIGENCE専用接続

HELIXLABO-L2-054の入力はL2-055が生成したwork-kind/model-class別の水準、根拠、適用範囲、未評価状態。出力は同じ作業種別・model class・評価範囲・根拠・未評価状態を保ったINTELLIGENCE向け受渡しとする。055の出力を同じwork kind、model class、評価範囲、根拠、unassessed状態でINTELLIGENCEへ渡す。LABOは親が持つ意味、operation、権限、割当、正本を変更せず、入力のsource identity/revision・適用scope・根拠を保つ。対象が未選択または未発生なら候補を捏造せず、親で定める適用範囲を保持する。

**LABO-054-AC-01 — 正常・未見正常**：055の出力を同じwork kind、model class、評価範囲、根拠、unassessed状態でINTELLIGENCEへ渡す。INTELLIGENCE案とOS指定/割当てを別状態で保つ。 未見正常条件として、未見のwork-kind/model-classでも適用可能な既存055出力のみ受け渡し、unknownを成功実績へ外挿しない。
**LABO-054-AC-02 — 不成立・owner境界**：次のfixtureは独立に不成立とし、原因を併発で代用しない。未評価またはscope不明は水準生成側へ戻して再評価する。配置案はINTELLIGENCE、指定/割当はOSへ残す。unknown jobの成功保証とscoreによるscope/branch/merge authorityの変更を拒否する。
- 接続中に水準だけを変更する。 055の水準を不変に保ち不一致を不成立とする。
- work-kindだけを別値へ変える。 別work kindへ水準を流用せず再評価へ戻す。
- model classだけを別値へ変える。 別model classへ水準を流用せず再評価へ戻す。
- 評価範囲だけを別scopeへ変える。 別scopeへ水準を流用せず再評価へ戻す。
- 根拠を欠落させる。 evidence欠落をunknownのまま保持し再評価へ戻す。
- unassessedをassessedとして表示する。 未評価のまま保持し実績化を拒否する。
- 評価scopeだけを欠落させる。範囲を推測せず水準生成側へ再評価を戻す。
- LABOがmodelを指定する。model指定を生成せず、配置案はINTELLIGENCE、指定/割当はOSへ残す。
- LABOがmodelを変更する。変更を生成せず、配置案はINTELLIGENCE、指定/割当はOSへ残す。
- 過去水準だけで未評価のjobを成功保証する。 成功保証を生成せず、055水準生成側へunknownとして戻す。
- scoreだけで適用scopeを変更する。 scopeを変更せず、055が示す評価範囲を保つ。
- scoreだけでbranchを変更する。 branchを変更せず、接続candidateに留める。
- scoreだけでmerge authorityを変更する。 authorityを変更せず、既存ownerへ残す。
- LABOがworkerを割当する。 assignmentを生成せずOSへ残す。
- INTELLIGENCE connectorだけが欠落する。受領済みとせずconnection未完了を保持する。
- L2-055水準を別定義し、重複waterlineを生成する。水準生成を055へ残し接続で再定義しない。
- 055水準を別のBench定義へ置き換える。接続対象を固定055出力と照合し、別定義で成立させない。
- 配置案をOS指定/割当と同一状態へまとめる。INTELLIGENCE案とOS指定/割当を別状態で保持する。

- INTELLIGENCE専用接続へ別接続のconnectorを代用する。固有connector不一致を拒否し同scopeの受渡しを成立させない。
- INTELLIGENCE専用接続の片側だけ成功する。全体受渡しを成功扱いせず未完義務を保持する。

### Stage 4 共通の意味境界

各候補は親L2の適用条件に限る。選択された接続ごとに固有connectorを一つ対応づけ、別接続のconnectorで代用せず、片側成功だけで接続全体を成功としない。未選択対象の不存在を全体failureや追加gateにしない。L2に記載のない戻し先・owner・authority・承認・数値閾値を新設しない。

## Stage 2b 接続・条件補足22件（部分草稿・未承認）

本checkpointは固定parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc` / PO decision basis `633bf12` のStage 2b基本9件に加える22 identityを追補する。全L2 parentは同じ`docs/helix-labo/L2-requirements/labo-requirements.md`、full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`。L11共通pinは前のStage 2b checkpointの親pin表を参照する。

旧起点は旧HELIX system L3 `LEGACY-ASSET-C7F0C3B79CBAA72960BF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`, full SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`) と対test-design `LEGACY-ASSET-FA8C6E69463183D6A19B` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`, full SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`)。旧HIL-01/02/11とHAT-01/02/11からsource/cause/revision/authority、owner別read connector、lineage/unknownを保つ形およびpositive/negative case構造だけを類例として読む。domain別connection semanticsは現行L2から再導出し、旧HARNESS Issue/Node runtime/connector/acceptance IDs/approval gatesは移さない。

旧Universal Improvement Loop L3 `LEGACY-ASSET-02D897E62EF2FA267267` (full SHA `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4`) と対 `LEGACY-ASSET-0B5B38F146D9538C9A36` (full SHA `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943`) はscope/counterexample/proposal/authority boundaryの隣接例として参照し、旧UIL candidate/output/lifecycleを本L2へ権威として移植しない。058は旧FRSを含む現行L2の明示起点を別途照合し、FRS資料のdraft-candidate statusを維持する。

| 親L2 / PO registration / decision / semantic digest | L2 source line/span | FR/AC/L10 mapping |
|---|---|---|
| `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60 / `sha256:bce298745ed3da0c1538e5bf7324a22da4b16e68715f915e46c48fa7731435a4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L167–170; raw SHA `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | `LABO-012-FR-01`, `LABO-012-AC-01`, `LABO-012-AC-02`; `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C03`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07` |
| `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61 / `sha256:f2072a508c91ea00ff35ba233c945365b4dffe3e2d5a3c800152ce38add38876` | `docs/helix-labo/L2-requirements/labo-requirements.md` L171–174; raw SHA `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | `LABO-013-FR-01`, `LABO-013-AC-01`, `LABO-013-AC-02`; `L10-LABO-013-C01`, `L10-LABO-013-C02`, `L10-LABO-013-C03`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16` |
| `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62 / `sha256:3d255c00ffd8f560dd9a181790bcc294bfae57e0571acac032ea1eba0f8760d8` | `docs/helix-labo/L2-requirements/labo-requirements.md` L175–178; raw SHA `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | `LABO-014-FR-01`, `LABO-014-AC-01`, `LABO-014-AC-02`; `L10-LABO-014-C01`, `L10-LABO-014-C02`, `L10-LABO-014-C03`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09` |
| `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63 / `sha256:c55dbc5072f5a55a2e35c7d7acd39392441d19ca3f3c3db387c313c63e73437c` | `docs/helix-labo/L2-requirements/labo-requirements.md` L179–182; raw SHA `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | `LABO-015-FR-01`, `LABO-015-AC-01`, `LABO-015-AC-02`; `L10-LABO-015-C01`, `L10-LABO-015-C02`, `L10-LABO-015-C03`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09` |
| `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64 / `sha256:439c9ed877915de9a0d2f3028fce04a12f451d7812946e3322be8b46306e8467` | `docs/helix-labo/L2-requirements/labo-requirements.md` L183–186; raw SHA `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | `LABO-016-FR-01`, `LABO-016-AC-01`, `LABO-016-AC-02`; `L10-LABO-016-C01`, `L10-LABO-016-C02`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08` |
| `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65 / `sha256:34ceade9563b09db94ef5d031c66df4c2741db3d13aa126ca0aa74b9a92b5440` | `docs/helix-labo/L2-requirements/labo-requirements.md` L187–190; raw SHA `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | `LABO-017-FR-01`, `LABO-017-AC-01`, `LABO-017-AC-02`; `L10-LABO-017-C01`, `L10-LABO-017-C02`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C07`, `L10-LABO-017-C08` |
| `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66 / `sha256:d1b31fb8d379f9dcfcdc6213ac4d7fcb193e20d7d59276e231f548f3db9dcfdd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L191–194; raw SHA `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | `LABO-018-FR-01`, `LABO-018-AC-01`, `LABO-018-AC-02`; `L10-LABO-018-C01`, `L10-LABO-018-C02`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08` |
| `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67 / `sha256:e7a90eba26b101083aa9fa449b220ea53d5c8230eed1f82980797cdabbb51d65` | `docs/helix-labo/L2-requirements/labo-requirements.md` L195–198; raw SHA `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | `LABO-019-FR-01`, `LABO-019-AC-01`, `LABO-019-AC-02`; `L10-LABO-019-C01`, `L10-LABO-019-C02`, `L10-LABO-019-C03`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09` |
| `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68 / `sha256:61ae506fe25a2218b3c2581e47eb76a167f8344cc792d5c27d4895bd65121501` | `docs/helix-labo/L2-requirements/labo-requirements.md` L199–202; raw SHA `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | `LABO-020-FR-01`, `LABO-020-AC-01`, `LABO-020-AC-02`; `L10-LABO-020-C01`, `L10-LABO-020-C02`, `L10-LABO-020-C03`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10` |
| `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69 / `sha256:00dda7b8a7675bba719585e6fbb94e43a2f273146b195d00daae5718f3f1fc9e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L203–206; raw SHA `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | `LABO-021-FR-01`, `LABO-021-AC-01`, `LABO-021-AC-02`; `L10-LABO-021-C01`, `L10-LABO-021-C02`, `L10-LABO-021-C03`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10` |
| `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70 / `sha256:4dba319cb6d4abe7c909c9ffc1c9e50593efe4aa6d26548fd0434375baeae783` | `docs/helix-labo/L2-requirements/labo-requirements.md` L207–210; raw SHA `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | `LABO-022-FR-01`, `LABO-022-AC-01`, `LABO-022-AC-02`; `L10-LABO-022-C01`, `L10-LABO-022-C02`, `L10-LABO-022-C03`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C06`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11` |
| `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71 / `sha256:aafe6d1641624bd7986d5fd6c6a1c67644221c9df0f4503433f442c98f26a36b` | `docs/helix-labo/L2-requirements/labo-requirements.md` L211–214; raw SHA `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | `LABO-023-FR-01`, `LABO-023-AC-01`, `LABO-023-AC-02`; `L10-LABO-023-C01`, `L10-LABO-023-C02`, `L10-LABO-023-C03`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C10` |
| `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72 / `sha256:b9716e90512221b17da8f2eb3df7d8ea64bcdab2e4223ea32a720ae8c19ddbd4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L215–218; raw SHA `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | `LABO-024-FR-01`, `LABO-024-AC-01`, `LABO-024-AC-02`; `L10-LABO-024-C01`, `L10-LABO-024-C02`, `L10-LABO-024-C03`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09` |
| `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73 / `sha256:e6cc467c72635a5fb91257cfb90f6a1039654d8f34a28454353566e3f3c28bf3` | `docs/helix-labo/L2-requirements/labo-requirements.md` L219–222; raw SHA `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | `LABO-025-FR-01`, `LABO-025-AC-01`, `LABO-025-AC-02`; `L10-LABO-025-C01`, `L10-LABO-025-C02`, `L10-LABO-025-C03`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09` |
| `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74 / `sha256:64944055712d4d2c8ad4817624c5eeacba241c5bf7a008da18b2cfcdb53ec150` | `docs/helix-labo/L2-requirements/labo-requirements.md` L223–226; raw SHA `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | `LABO-026-FR-01`, `LABO-026-AC-01`, `LABO-026-AC-02`; `L10-LABO-026-C01`, `L10-LABO-026-C02`, `L10-LABO-026-C03`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09` |
| `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75 / `sha256:ee444d777dfa4e45646584941998a8fa812b0070d62261e0c9ae3249928b8bab` | `docs/helix-labo/L2-requirements/labo-requirements.md` L227–230; raw SHA `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | `LABO-027-FR-01`, `LABO-027-AC-01`, `LABO-027-AC-02`; `L10-LABO-027-C01`, `L10-LABO-027-C02`, `L10-LABO-027-C03`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11` |
| `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76 / `sha256:f51b751526a581ca0cd80821dfdb9b558d3e2d4d0d3cb123420ea7391e45564e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L231–234; raw SHA `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | `LABO-028-FR-01`, `LABO-028-AC-01`, `LABO-028-AC-02`; `L10-LABO-028-C01`, `L10-LABO-028-C02`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12` |
| `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77 / `sha256:c37e1dbc85f2c6fcfb9b55e28d867faf9c4727a3615bd36882a71353eed3c89f` | `docs/helix-labo/L2-requirements/labo-requirements.md` L235–238; raw SHA `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | `LABO-029-FR-01`, `LABO-029-AC-01`, `LABO-029-AC-02`; `L10-LABO-029-C01`, `L10-LABO-029-C02`, `L10-LABO-029-C03`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C08`, `L10-LABO-029-C09` |
| `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78 / `sha256:79a9ed7a30f650e949b2f092958a3e84c428e7ff84c0e6409fd056196d4c1e50` | `docs/helix-labo/L2-requirements/labo-requirements.md` L239–242; raw SHA `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | `LABO-030-FR-01`, `LABO-030-AC-01`, `LABO-030-AC-02`; `L10-LABO-030-C01`, `L10-LABO-030-C02`, `L10-LABO-030-C03`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` |
| `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82 / `sha256:3d6fa067472bd28ce86fa0da805972e817170bde8602652a2e070b9af572cdbf` | `docs/helix-labo/L2-requirements/labo-requirements.md` L255–258; raw SHA `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | `LABO-034-FR-01`, `LABO-034-AC-01`, `LABO-034-AC-02`; `L10-LABO-034-C01`, `L10-LABO-034-C02`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08` |
| `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83 / `sha256:8cdd8f7cbbdeb905ea12b600ff007e25ad5f0bb6196c70009402ef1453662bfd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L259–262; raw SHA `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | `LABO-035-FR-01`, `LABO-035-AC-01`, `LABO-035-AC-02`; `L10-LABO-035-C01`, `L10-LABO-035-C02`, `L10-LABO-035-C03`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14` |
| `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98 / `sha256:0ff4f665f3a465611b2489a908bfb161e852fa5706393d04c21d59c3598d9f17` | `docs/helix-labo/L2-requirements/labo-requirements.md` L403–415; raw SHA `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | `LABO-058-FR-01`, `LABO-058-AC-01`, `LABO-058-AC-02`; `L10-LABO-058-C01`, `L10-LABO-058-C02`, `L10-LABO-058-C03`, `L10-LABO-058-C04`, `L10-LABO-058-C05`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25` |

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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

episode、evidence、relation版を受けて分類対象を出力する。根拠/unknownを保ち、relation版不一致は訂正sourceへ戻す。

### 受入条件候補

- **LABO-012-AC-01 — 正常・trace**：分類入力全てに元episode/source evidence/relation revisionが追跡でき、根拠と反証が残る。
- **LABO-012-AC-02 — failure/owner boundary**：relation版不一致、根拠欠落、反証脱落、unknown消去、相関の因果化を受理しない。 上流のepisodeとrelation authorityを変更しない。

### 補正ACと個別fixtureの対応

- `LABO-012-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-012-C02`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-012-FR-01 / LABO-012-AC-01` | `L10-LABO-012-C01`, `L10-LABO-012-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-012-FR-01 / LABO-012-AC-02` | `L10-LABO-012-C02`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-012-FR-01 / LABO-012-AC-02` | `L10-LABO-012-C08`, `L10-LABO-012-C10` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

根拠付き分類を意味/条件別比較仮説の入力へ渡し、分類軸と根拠を保持する。欠落をsource evidenceへ戻す。

### 受入条件候補

- **LABO-013-AC-01 — 正常・trace**：各比較hypothesisから元分類と証拠を追跡可能。
- **LABO-013-AC-02 — failure/owner boundary**：分類軸の混同/根拠欠落をsuccessにしない。 Vectorはsource meaningを上書きしない。

### 補正ACと個別fixtureの対応

- `LABO-013-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-013-FR-01 / LABO-013-AC-01` | `L10-LABO-013-C01`, `L10-LABO-013-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-013-FR-01 / LABO-013-AC-02` | `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-013-FR-01 / LABO-013-AC-02` | `L10-LABO-013-C17` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

元意味、目的、条件を含む部分比較candidateからtransformation candidateを渡し、保持意味と変更部分を区別する。意味不明ならL1/sourceへ戻す。

### 受入条件候補

- **LABO-014-AC-01 — 正常・trace**：元source/revision、意味、目的、条件とcandidate差分を追跡する。
- **LABO-014-AC-02 — failure/owner boundary**：元意味不明、meaning delta欠落を確定candidateにしない。 接続はcandidateを実変更/決定へ昇格しない。

### 補正ACと個別fixtureの対応

- `LABO-014-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-014-FR-01 / LABO-014-AC-01` | `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C11`, `L10-LABO-014-C12` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-014-FR-01 / LABO-014-AC-02` | `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-014-FR-01 / LABO-014-AC-02` | `L10-LABO-014-C07` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

変換candidate/適用条件からbaseline/current、candidate、hybridの比較条件を組み立てる。版・条件を固定し、oracle/条件不足なら実験成立扱いにしない。

### 受入条件候補

- **LABO-015-AC-01 — 正常・trace**：3比較armのsource revision、条件、oracle、target versionが一貫する。
- **LABO-015-AC-02 — failure/owner boundary**：比較arm間の版/条件差、oracle不足を成功扱いしない。 Worker実行を開始/割当しない。

### 補正ACと個別fixtureの対応

- `LABO-015-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-015-FR-01 / LABO-015-AC-01` | `L10-LABO-015-C01`, `L10-LABO-015-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-015-FR-01 / LABO-015-AC-02` | `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-015-FR-01 / LABO-015-AC-02` | `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

これらをsystem/operation適格性評価材料へ渡し比較可能性と反例を保つ。判定不能はoperation候補で保留する。

### 受入条件候補

- **LABO-016-AC-01 — 正常・trace**：比較可能性、反例、oracle、run interruptionが評価材料へ個別に残る。
- **LABO-016-AC-02 — failure/owner boundary**：判定不能をsystem候補成立へ読み替えない。 自動system化/昇格をしない。

### 補正ACと個別fixtureの対応

- `LABO-016-AC-01` は正常fixture `L10-LABO-016-C08` の個別oracleを満たし、同一性/未完・unknown状態を保持する。

個別negative検証対象（summary/indexを除く）: `L10-LABO-016-C03`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-016-FR-01 / LABO-016-AC-01` | `L10-LABO-016-C01`, `L10-LABO-016-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C03`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

system/operation適格性とcurrent guaranteeから再評価candidate/unfinished obligationを出す。切替せず、owner運転結果不足ならownerへ戻す。

### 受入条件候補

- **LABO-017-AC-01 — 正常・trace**：current rule version、適格性材料、未完義務とownerを結ぶ。
- **LABO-017-AC-02 — failure/owner boundary**：current version/evidence不足、例外記録・現行保証の消失を切替完了や成功にしない。 LABOはoperational switchを実行しない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-017-C03`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C07`, `L10-LABO-017-C08`, `L10-LABO-017-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-017-FR-01 / LABO-017-AC-01` | `L10-LABO-017-C01`, `L10-LABO-017-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-017-FR-01 / LABO-017-AC-02` | `L10-LABO-017-C03`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C07`, `L10-LABO-017-C08`, `L10-LABO-017-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-017-FR-01 / LABO-017-AC-02` | `L10-LABO-017-C08`, `L10-LABO-017-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-017-FR-01 / LABO-017-AC-01` | `L10-LABO-017-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

例外記録と現行保証の消失を成功にしない。

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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

comparison result、sample condition、counterexampleからsupported applicability scopeを出す。反例/condition欠落はexperiment evaluationへ戻す。

### 受入条件候補

- **LABO-018-AC-01 — 正常・trace**：scopeとsupporting sample/condition/counterexampleを結ぶ。
- **LABO-018-AC-02 — failure/owner boundary**：unsupported scopeを承認済み一般則にしない。 一例を根拠に広げない。

### 補正ACと個別fixtureの対応

- `LABO-018-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-018-C03`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-018-FR-01 / LABO-018-AC-01` | `L10-LABO-018-C01`, `L10-LABO-018-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-018-FR-01 / LABO-018-AC-02` | `L10-LABO-018-C03`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-018-FR-01 / LABO-018-AC-02` | `L10-LABO-018-C09`, `L10-LABO-018-C10` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-018-FR-01 / LABO-018-AC-01` | `L10-LABO-018-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-019-FR-01 — HELIXLABO-L2-019 Generalization → Feedback Derivation

### 親・依存・版

- 固定親 `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:195–198`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: L2-009 scope-bound insightとtarget identity/responsibility/evidence `version_target: 1.0`。
- 旧項目判定: 接続。固定親で保持する意味: scope-bound insight/target candidateからtarget別Feedback candidateへ渡す。target別提案を分離し、target不明はOS routing candidateへ戻す。

**旧項目別起点（判定根拠。旧資料は現在のauthorityではない）**

| 旧asset・状態 | 旧path・行 | full SHA-256 | raw span SHA-256 | 対応判断 |
|---|---|---|---|---|
| `LEGACY-ASSET-C7F0C3B79CBAA72960BF` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`:36–36 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `c4c2fa627ea7c15849bd05edb46d79121ee1b649122965f46f29fe67d9bdabd2` | 旧HIL-02のcausality/flow draftを工程連結の類例として参照。段階/authority意味を移さず本L2から再導出。 |
| `LEGACY-ASSET-FA8C6E69463183D6A19B` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`:34–34 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `f3debf432438d3fc543fb32b208fe6cae8baad7a169cd00248c520c17746b9c6` | 旧HAT-02のnormal/failure/boundary分離だけを再利用。old state machine/budget oracleは移さない。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

scope-bound insight/target candidateからtarget別Feedback candidateへ渡す。target別提案を分離し、target不明はOS routing candidateへ戻す。

### 受入条件候補

- **LABO-019-AC-01 — 正常・trace**：各proposalはtarget identity/evidence/scopeへ個別にtraceする。
- **LABO-019-AC-02 — failure/owner boundary**：target不明/複数target混同を自動routingしない。 OS routingとtarget owner変更は実行しない。

### 補正ACと個別fixtureの対応

- `LABO-019-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-019-FR-01 / LABO-019-AC-01` | `L10-LABO-019-C01`, `L10-LABO-019-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-019-FR-01 / LABO-019-AC-02` | `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-019-FR-01 / LABO-019-AC-02` | `L10-LABO-019-C10`, `L10-LABO-019-C11` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md`:43–57 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `c329095d1f0e61ab5260c54a6829489dd5d9651a18dae2803dd5af20a0dc7190` | source identity/revision/correlation/counterevidenceのadjacent evidence shape。confirmed UILだがLABO current parent authorityではない。 |

### 要件候補

operationへ戻った後の結果と旧/新rule versionをnew observationへ集積する。未完義務とbefore/after versionを保持し欠落はsource ownerへ戻す。

### 受入条件候補

- **LABO-020-AC-01 — 正常・trace**：result observationに戻し前後versionとowner provenanceが含まれる。
- **LABO-020-AC-02 — failure/owner boundary**：旧新version/source欠落で新observed successを作らない。 fallbackの実行責務はowner、Aggregateは観測に限定。

### 補正ACと個別fixtureの対応

- `LABO-020-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-020-FR-01 / LABO-020-AC-01` | `L10-LABO-020-C01`, `L10-LABO-020-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-020-FR-01 / LABO-020-AC-02` | `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-020-FR-01 / LABO-020-AC-02` | `L10-LABO-020-C08` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-021-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-021-FR-01 / LABO-021-AC-01` | `L10-LABO-021-C01`, `L10-LABO-021-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C08`, `L10-LABO-021-C10` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-022-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-022-C05`, `L10-LABO-022-C06`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-022-FR-01 / LABO-022-AC-01` | `L10-LABO-022-C01`, `L10-LABO-022-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C05`, `L10-LABO-022-C06`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C08` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-023-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

`L10-LABO-023-C08`の許可不明はSECURITY既存permission ownerへ、`L10-LABO-023-C09`のsource利用scope不明はBRAIN source contract ownerへ戻す。呼出し側の選択/scope自体がunknownの場合に限りL2-058の既存call-scope ownerへ戻す。canonical write拒否は`L10-LABO-023-C07`で照合しC10はその索引である。

個別negative検証対象（summary/indexを除く）: `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-023-FR-01 / LABO-023-AC-01` | `L10-LABO-023-C01`, `L10-LABO-023-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C07` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-024-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-024-FR-01 / LABO-024-AC-01` | `L10-LABO-024-C01`, `L10-LABO-024-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C06`, `L10-LABO-024-C07` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-025-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-025-FR-01 / LABO-025-AC-01` | `L10-LABO-025-C01`, `L10-LABO-025-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C07`, `L10-LABO-025-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-026-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-026-FR-01 / LABO-026-AC-01` | `L10-LABO-026-C01`, `L10-LABO-026-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C07`, `L10-LABO-026-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-027-AC-02 — failure/owner boundary**：schema drift/unknownを正常接続として扱わない。 logical connection contractをLABOで改定せず、全sourceへのconnector暗黙共用を拒否する。

### 補正ACと個別fixtureの対応

- `LABO-027-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-027-FR-01 / LABO-027-AC-01` | `L10-LABO-027-C01`, `L10-LABO-027-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C11`, `L10-LABO-027-C12` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

### 補正ACと個別fixtureの対応

- `LABO-028-AC-01` は正常fixture `L10-LABO-028-C09` の個別oracleを満たし、同一性/未完・unknown状態を保持する。
- `LABO-028-AC-02` は次の各fixtureをそれぞれ一変数で照合する。`C10`の誤experiment identityと`C11`の誤target versionは当該Worker result source ownerへ、`C12`は有効receiptを保ったresult-source欠落であり、そのresult source ownerへ戻す。OS receipt欠落だけは`L10-LABO-028-C14`でOS assignment/receipt ownerへ戻す。正常なassignment/receiptとresult-source不一致を相互補完しない。 `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`。集約fixtureの件数は個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-028-C03`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-028-FR-01 / LABO-028-AC-01` | `L10-LABO-028-C01`, `L10-LABO-028-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C03`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C13`, `L10-LABO-028-C15` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-028-FR-01 / LABO-028-AC-01` | `L10-LABO-028-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

Workerを機構・authority ownerにしない。

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

### 補正ACと個別fixtureの対応

- `LABO-029-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C08`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-029-FR-01 / LABO-029-AC-01` | `L10-LABO-029-C01`, `L10-LABO-029-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C08`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-029-FR-01 / LABO-029-AC-01` | `L10-LABO-029-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

## LABO-030-FR-01 — HELIXLABO-L2-030 Product Core → Aggregate

### 親・依存・版

- 固定親 `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001`。decision `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78`、fixed parent `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、source `docs/helix-labo/L2-requirements/labo-requirements.md:239–242`、full SHA `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、raw span SHA `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613`; PO decision basis `633bf12`。対象版/境界は要件に記した親のversion_targetであり実装/release許可ではない。
- 親の依存区分: 各採択済Product Core source contractと専用connector。対象版は固定L2-030が示す各接続対象製品の採択済scopeに従い、機構横断の版値へ固定しない。
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

### 補正ACと個別fixtureの対応

- `LABO-030-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-030-FR-01 / LABO-030-AC-01` | `L10-LABO-030-C01`, `L10-LABO-030-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C08` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-030-FR-01 / LABO-030-AC-01` | `L10-LABO-030-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

本接続自身のPO/G0採択区分はconnection / 1.0。個々の接続対象製品・sourceの版とscopeは当該採択契約に従い、将来Webの稼働を1.0へ前倒ししない。

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

### 補正ACと個別fixtureの対応

- `LABO-034-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-034-C03`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-034-FR-01 / LABO-034-AC-01` | `L10-LABO-034-C01`, `L10-LABO-034-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C03`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C06`, `L10-LABO-034-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-034-FR-01 / LABO-034-AC-01` | `L10-LABO-034-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

一事例・scope不足・固有meaning混入の戻し先はL2-009である。source ownerを追加しない。

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

### 補正ACと個別fixtureの対応

- `LABO-035-AC-01` は正常fixture `L10-LABO-035-C11` の個別oracleを満たし、同一性/未完・unknown状態を保持する。
- `LABO-035-AC-02` は各fixtureを一変数ずつ照合する。C09/C10のsource version欠落・staleは該当source ownerへ戻し、同一revisionのpacket/receipt不一致はL2-052の境界条件と区別する。C12はunassessedを保ったままINTELLIGENCE境界へ渡し、C13/C14はLABOがplacement・bot判断/実行を生成せず既存INTELLIGENCE/OS責務を保持する。`L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`。集約fixtureの件数は個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-035-FR-01 / LABO-035-AC-01` | `L10-LABO-035-C01`, `L10-LABO-035-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-035-FR-01 / LABO-035-AC-02` | `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-035-FR-01 / LABO-035-AC-02` | `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-035-FR-01 / LABO-035-AC-01` | `L10-LABO-035-C04` | 未見typeだけを理由に落とさず同じ親契約で照合 |

source revision欠落・staleはL2接続共通前置き（159–162行）のsource authority保持と元evidenceのsource責務から該当source ownerへ戻す。connector contract自体の不成立だけCONNECT契約ownerへ戻す。

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
- **LABO-058-AC-02 — failure/owner boundary**：選択sourceのmissingは未選択へ変えず、未選択/unconnected sourceはunobservedのままにする。選択sourceまたは呼出しscope自体がunknownなら既存call-scope ownerへ戻す。選択sourceのpermission/classification不足はSECURITYへ、source/contract/versionの不足・不一致は当該source/LABOまたは接続contractならCONNECTへ、OS assignment/receipt不足は既存OS ownerへ戻す。source集合等が明示変更された場合は新条件で再closureし、旧receiptを流用しない。Bench評価済み、assignment permission、全source完了を主張しない。001の本文/outputは変更せず、source選択条件だけを補う。source未選択はpermission不明データの取込許可にならない。Web/WEB-OSは選択時だけ既存採択source contractを要求し、外部取得2.0を1.0へ前倒ししない。

### 補正ACと個別fixtureの対応

- `LABO-058-AC-01` は正常fixture `L10-LABO-058-C12` の各選択source閉包を個別に照合する。
- `LABO-058-AC-02` は各一変数fixtureを個別に照合し、未選択・未完・unknownを成功へ変えず固定ownerへ戻す: `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`。集約fixtureの件数は個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 呼出しscope/selected source/operation/permission/versionを入力として選択理由とunselectedを表示 | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C12` | 入力集合と選択/未選択一覧が一致 |
| 常時001 contractとselected-source dependency closure | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C12` | 選択した全sourceの接続/安全/版条件を検査 |
| unselectedはunobserved、selected-missingはunmet dependency | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C07`, `L10-LABO-058-C13`, `L10-LABO-058-C19` | 未選択≠成功観測、選択欠落≠未選択化 |
| unknown selection/scopeはcall-scope owner、permission/classificationはSECURITYへ戻し、no selectionは未許可取込を許可しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C06`, `L10-LABO-058-C09`, `L10-LABO-058-C18`, `L10-LABO-058-C22` | 入力成立拒否と条件別の既存戻し先、unauthorized intake 0 |
| WEB/WEB-OSは選択時だけ既存contract、external 2.0を1.0へ含めない | `LABO-058-FR-01 / LABO-058-AC-01/02` | `L10-LABO-058-C08`, `L10-LABO-058-C21` | 未選択時の実稼働依存0、2.0 external intake 0 |
| source集合/operation/scope/contract版の明示変更後にclosureを再検証 | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C24`, `L10-LABO-058-C25` | 旧receiptを流用せず新条件で再closureする。不足はsource/CONNECTまたはSECURITYへ、selection自体がunknownの場合だけcall-scope ownerへ戻す |
| 未選択sourceを観測成功化／単一call passを全source完了化しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C19`, `L10-LABO-058-C20` | unselected remains not_observed、単一callは対応範囲だけを成功として保持 |
| 観測成功をBench評価済み・割当許可へ昇格しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C26`, `L10-LABO-058-C27` | 観測成立を評価・割当authorityへ変換しない |
| 1.0義務と既存001契約を保全 | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C28`, `L10-LABO-058-C29` | 未選択を理由に完成義務を削除せず001出力を改定しない |

CONNECT契約とOS assignment責務の戻し先は固定L2の接続共通前置き159–162行とL2-022/028から再導出し、各sourceとLABOの観測責務を移さない。

## 未承認事項

本追補の22親についてFR/L10 pair候補を記したが、部分草稿・未承認である。既承認のStage 2b基本9親の状態はその決定記録に従う。本追補から機構全体のL3完了や実装/releaseを生成しない。個別parameterの承認gateを作らず、L2の意味/scope/owner/versionを変える場合だけL2へ戻す。


## Stage 2b — 独立case追補のFR/AC trace

| 親 | 固定意味範囲 | AC | 追加L10単独case |
|---|---|---|---|
| `HELIXLABO-L2-012` | 固定親のscope/owner/version、条件句を保持 | `LABO-012-AC-02` | `L10-LABO-012-C07` |
| `HELIXLABO-L2-013` | 固定親のscope/owner/version、条件句を保持 | `LABO-013-AC-02` | `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16` |
| `HELIXLABO-L2-014` | 固定親のscope/owner/version、条件句を保持 | `LABO-014-AC-02` | `L10-LABO-014-C08`, `L10-LABO-014-C09` |
| `HELIXLABO-L2-015` | 固定親のscope/owner/version、条件句を保持 | `LABO-015-AC-02` | `L10-LABO-015-C09` |
| `HELIXLABO-L2-016` | 固定親のscope/owner/version、条件句を保持 | `LABO-016-AC-01` | `L10-LABO-016-C08` |
| `HELIXLABO-L2-017` | 固定親sourceのversion・scope・owner・列挙条件を本文各親節に記録 | `LABO-017-AC-02` | `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C07`, `L10-LABO-017-C08` |
| `HELIXLABO-L2-018` | 固定親のscope/owner/version、条件句を保持 | `LABO-018-AC-02` | `L10-LABO-018-C08` |
| `HELIXLABO-L2-019` | 固定親のscope/owner/version、条件句を保持 | `LABO-019-AC-02` | `L10-LABO-019-C09` |
| `HELIXLABO-L2-020` | 固定親のscope/owner/version、条件句を保持 | `LABO-020-AC-02` | `L10-LABO-020-C09`, `L10-LABO-020-C10` |
| `HELIXLABO-L2-021` | 固定親のscope/owner/version、条件句を保持 | `LABO-021-AC-02` | `L10-LABO-021-C09`, `L10-LABO-021-C10` |
| `HELIXLABO-L2-022` | 固定親のscope/owner/version、条件句を保持 | `LABO-022-AC-02` | `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11` |
| `HELIXLABO-L2-023` | 固定親のscope/owner/version、条件句を保持 | `LABO-023-AC-02` | `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C10` |
| `HELIXLABO-L2-024` | 固定親のscope/owner/version、条件句を保持 | `LABO-024-AC-02` | `L10-LABO-024-C08`, `L10-LABO-024-C09` |
| `HELIXLABO-L2-025` | 固定親のscope/owner/version、条件句を保持 | `LABO-025-AC-02` | `L10-LABO-025-C08`, `L10-LABO-025-C09` |
| `HELIXLABO-L2-026` | 固定親のscope/owner/version、条件句を保持 | `LABO-026-AC-02` | `L10-LABO-026-C08`, `L10-LABO-026-C09` |
| `HELIXLABO-L2-027` | 固定親のscope/owner/version、条件句を保持 | `LABO-027-AC-02` | `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11` |
| `HELIXLABO-L2-028` | 固定親のscope/owner/version、条件句を保持 | `LABO-028-AC-01`, `LABO-028-AC-02` | `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12` |
| `HELIXLABO-L2-029` | 固定親のscope/owner/version、条件句を保持 | `LABO-029-AC-02` | `L10-LABO-029-C09` |
| `HELIXLABO-L2-030` | 固定親のscope/owner/version、条件句を保持 | `LABO-030-AC-02` | `L10-LABO-030-C09`, `L10-LABO-030-C10` |
| `HELIXLABO-L2-034` | 固定親のscope/owner/version、条件句を保持 | `LABO-034-AC-02` | `L10-LABO-034-C08` |
| `HELIXLABO-L2-035` | 固定親のscope/owner/version、条件句を保持 | `LABO-035-AC-01`, `LABO-035-AC-02` | `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14` |
| `HELIXLABO-L2-058` | 固定親のscope/owner/version、条件句を保持 | `LABO-058-AC-01`, `LABO-058-AC-02` | `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25` |

Stage 2b review01の集約CASEは索引としてのみ保持する。個別fixtureとnegative/NFR分母から除外し、上の親句traceでは個別CASEのoracleを照合する。
