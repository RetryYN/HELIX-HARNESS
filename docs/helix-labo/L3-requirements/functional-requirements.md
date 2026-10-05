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

## Stage 2a — 採択親 HELIXLABO-L2-055/056/057（候補、1.0）

この追補は既存Stage 1本文の後続部分であり、Stage 1本文・権威・承認状態を変えない。対象は固定された3 parent identityのみ。L2-005や未承認L3候補はdependency authorityにしない。L2-028/001等の明示依存は当該固定親の契約として参照する。全てversion_targetは1.0、meaning/scope/owner/version変更は提案しない。

### 共通authority pin

| 親 | PO採択対象 | 固定L2 source (commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`) | 対L11 source・span |
|---|---|---|---|
| HELIXLABO-L2-055-002 | `633bf12ea8f948db8ba3d6600179c4a9507377a7:docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md:58` | `docs/helix-labo/L2-requirements/labo-requirements.md:150-154` | `docs/helix-labo/L11-acceptance/labo-acceptance.md:56` |
| HELIXLABO-L2-056-003 | same decision `:96` | `labo-requirements.md:379-389` | `labo-acceptance.md:138-146` |
| HELIXLABO-L2-057-002 | same decision `:97` | `labo-requirements.md:391-401` | `labo-acceptance.md:148-154` |

PO採択本文は decision full SHA-256 `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`。L2全体SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、L11全体SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`。採択行、固定親句およびraw LFを含む行span SHAは付属source pins handoffで各々pinする。implementation-order addendum 295-297行は作業順序の根拠であって採択authorityではない。

### HELIXLABO-L2-055-002 — `LABO-055-FR-01`

許可されたWorker作業履歴を `task type × model class` の別々の群として集計し、出力には群identity、source/history revision、観測件数とsourceに実在する各result-state label別の件数（状態語彙・identityを新設または統合せず、state unknownとstate missingも件数から落とさない）、評価期間・適用範囲、evidence、評価済み/未評価の別、および固定L11が定める採用する評価oracle/基準が返した対応可能性水準を保持する。証拠充足状態（観測なし、未評価、範囲内評価済み、評価済みと未評価の混在）は水準と別の補助情報とし、水準の意味・順序・値をここで新設しない。oracle/基準が対象scopeを判定でき、評価結果がある範囲に限り、その結果の水準と根拠を保持する。未観測groupや未知taskを履歴だけから成功と推論せず、配置案・Worker/modelの選定/指定/割当・権限変更を行わない。

- **LABO-055-AC-01 — groupと出典**：異なるtask typeまたはmodel classの履歴を混合せず、それぞれのsource identity/revisionとtask/model classを同じgroupへ追跡できる。sourceが持つresult-state labelは実在する値ごとに出典付きで保持し、既存の状態を別の状態へ統合・変換しない。stateがmissingまたはsource上unknownの場合も区別して事実と不確実性を併記し、件数から暗黙にdropしない。ここで新しい必須state語彙は定めない。
- **LABO-055-AC-02 — 水準と不確実性**：証拠充足状態候補 `NO_OBSERVATIONS` / `OBSERVED_UNASSESSED` / `ASSESSED_WITHIN_SCOPE` / `MIXED_EVALUATED_AND_UNASSESSED` は入力記録状態と一致し、oracle/基準由来の対応可能性水準とは別に保持する。対応可能性水準は固定L11が定める採用する評価oracle/基準の適用可能な結果から同じ群・scopeに限って保持し、oracle/基準が異なる水準を返したfixtureではそれぞれの水準と根拠を混同・統合しない。未見task/classもoracle/基準の適用scope内で判定可能な評価結果があればその範囲で評価できる。oracle/基準が未提示・適用scope外・判定不能、または根拠不足なら未評価を維持する。履歴上の単一successだけから水準・成功保証を生成せず、scope外の水準を流用しない。
- **LABO-055-AC-03 — ownerと訂正**：source/historyのmissing, stale, contradictionは該当する原履歴sourceへ戻し、LABOがsource stateを修正しない。配置/割当/資格判断を出力しない。OS-owned assignment identityはOS、Worker実行/result identityはWorkerまたは元result source、許可/data classificationはSECURITYに戻す。

### HELIXLABO-L2-056-003 — `LABO-056-FR-01`

初回Worker resultをL2に定めるOS ticket/assignment/task/attempt、Worker・実行契約revision、要求revision/scope、result state、budget、deadline、verification・人確認、data-use class、source receiptとともにBench historyへ観測として追加する。観測された状態と性能評価済み状態を分離する。結果state `success / failure / refusal / interruption / unknown` は個別保持し、推定・合成しない。

- **LABO-056-AC-01 — observed**：許可された初回結果のsource identity/revision/scope、budget、deadlineおよび列挙された付随fieldを、欠落や不一致を補完せず保持し、結果は `observed` と記録する。budget/deadline値にmissing/conflictがあればfieldの欠落・不確実性を元recordとともに保持し、result stateは書き換えず、親が示すassignment/evidenceの戻し先へ返す。観測単体ではassessedにしない。
- **LABO-056-AC-02 — state fidelity**：5 stateを別々に記録し、unknown/refusal/interruptionをsuccessへcoerceせず、failure等を欠落させない。sourceに無いstateは作らない。
- **LABO-056-AC-03 — 評価範囲**：assessed表示は採用oracle/criteria identityとexact revision、task/model class、適用scope、判定根拠・比較条件、結果/失敗/反例/unknown、評価者、評価時点、および対象resultとoracleへ束縛された判定receiptが適用可能な範囲だけに限る。要素がmissing/stale/矛盾/範囲外なら履歴をunassessedのまま記録する。不足は評価oracle/criteriaを元々提供したsource ownerへ訂正依頼し、評価者・時点などreceiptの不足について新しいownerを設けない。Benchは記録先であってoracle ownerではない。
- **LABO-056-AC-04 — 重複・矛盾**：duplicate, stale, conflicting source resultを自動統合せず、元resultとrevisionを保って訂正追跡へ戻す。OS identity/source/scope不足はOS、許可/classification不足はSECURITY、実行/result/revision不足はWorkerまたはOSへ返す。受領成功を評価成功・資格化・assignmentへ昇格しない。

### HELIXLABO-L2-057-002 — `LABO-057-FR-01`

OS execution resultをLABO-028へ受け取り、同一のticket/task/assignment/attempt/Worker identity、要求/契約revision、scope、result state、verification/human receipt、data-use class、未完義務を送信元と受領記録間で保つ。受渡し証拠は採択済みCONNECT contract、または同義務を示す明示human receiptのどちらでもよい。HELIXOS-L2-027は任意provenanceでありdependencyではない。

- **LABO-057-AC-01 — identityとfield**：送信source recordとLABO receiptが全必須identity、revision、scope、state、verification、人確認、data-use class、未完義務で一致する。同じresultを変更・補完しない。
- **LABO-057-AC-02 — 受領義務**：CONNECT契約と明示human receiptを独立方式として扱い、いずれも契約/schema version・scopeの照合、acknowledgment、trace、dedupe、stale停止、same-ID retryと未完義務保持を証明する。方式が違っても義務を軽くしない。
- **LABO-057-AC-03 — fail-closedとowner**：receipt欠落/不一致、stale revision、scope/state/identity改変、未知の契約では受領成立を主張せず、元resultと未完義務を保持する。source/送達/送受receipt不一致は固定親のとおりOS/LABOへ戻し、受領schema/classification不一致はLABOまたはSECURITYへ戻す。027だけで接続依存を満たさない。配送成功から評価済み/資格/配置判断を作らない。

### 旧source項目別dispositionと対の層

- `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168`, SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`: FR+AC、3要件区分、要件と検証のtraceの**意味を再導出**。旧G3/runtime/sub-gateは**置換**。
- `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:19-56`, SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`: 3 sub-docの分担は**意味を再導出**。READMEの1 L3 acceptance doc→L12 pairと旧G3/trace sub-gateは**置換**。
- 旧HELIX-Bench `LEGACY-ASSET-28FB139B26CD61CC51EE` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:35-74,121-147,149-170`, SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`: source/version/scopeとnegative/unknown保持、provider neutralityは項目ごと**意味を再導出**。旧team benchmark、5分類/12指標、隠しoracle/scorer、qualification/admission、pricing、固定task portfolio/fieldsは**置換または除外**。
- `LEGACY-ASSET-A952A3A175EB82A4781B` 旧L10 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:19-45`, SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`: 正負caseとtraceの形だけ**意味を再導出**。旧oracle、AC数/ID、runnerは**置換**。
- `LEGACY-ASSET-50CA1C554747F12266D3` RLO worker/admission SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` および `LEGACY-ASSET-A26561A0EF7396D8F017` cloud qualification SHA-256 `4b388cda67484f1808b0f4b8834d5d234a47de49f7db6dcb12d92d2dcfbee185`: class/version違いを暗黙統合しない点だけ**意味を再導出**。適性admission、shadow/advisory/write/block lifecycleは**置換・除外**。

旧forward定義148-168行はL3とL10 UX受入設計のpairを示すが、旧README 37-49行はL3の3文書と単一L12 acceptance文書をpairとして示す。この層差は自動移植せず、現行配置規則に従い6文書のL3↔L10、functional ACを唯一の条件正本、L10は同一ACを照合する対として**置換**する。Stage 1 local本文は作業文脈として読んだだけであり、未承認のためauthorityにしない。
