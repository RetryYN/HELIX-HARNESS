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
| `HELIXLABO-L2-012` / `MPR-RC-HELIXLABO-L2-012-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L60 / `sha256:bce298745ed3da0c1538e5bf7324a22da4b16e68715f915e46c48fa7731435a4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L167–170; raw SHA `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | `LABO-012-FR-01`, `LABO-012-AC-01/02`; 個別fixture: `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10`; summary/index（分母外）: `L10-LABO-012-C03` |
| `HELIXLABO-L2-013` / `MPR-RC-HELIXLABO-L2-013-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L61 / `sha256:f2072a508c91ea00ff35ba233c945365b4dffe3e2d5a3c800152ce38add38876` | `docs/helix-labo/L2-requirements/labo-requirements.md` L171–174; raw SHA `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | `LABO-013-FR-01`, `LABO-013-AC-01/02`; 個別fixture: `L10-LABO-013-C01`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17`; summary/index（分母外）: `L10-LABO-013-C02`, `L10-LABO-013-C03`|
| `HELIXLABO-L2-014` / `MPR-RC-HELIXLABO-L2-014-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L62 / `sha256:3d255c00ffd8f560dd9a181790bcc294bfae57e0571acac032ea1eba0f8760d8` | `docs/helix-labo/L2-requirements/labo-requirements.md` L175–178; raw SHA `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | `LABO-014-FR-01`, `LABO-014-AC-01/02`; 個別fixture: `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`, `L10-LABO-014-C11`, `L10-LABO-014-C12`; summary/index（分母外）: `L10-LABO-014-C02`, `L10-LABO-014-C03` |
| `HELIXLABO-L2-015` / `MPR-RC-HELIXLABO-L2-015-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L63 / `sha256:c55dbc5072f5a55a2e35c7d7acd39392441d19ca3f3c3db387c313c63e73437c` | `docs/helix-labo/L2-requirements/labo-requirements.md` L179–182; raw SHA `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | `LABO-015-FR-01`, `LABO-015-AC-01/02`; 個別fixture: `L10-LABO-015-C01`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12`; summary/index（分母外）: `L10-LABO-015-C02`, `L10-LABO-015-C03` |
| `HELIXLABO-L2-016` / `MPR-RC-HELIXLABO-L2-016-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L64 / `sha256:439c9ed877915de9a0d2f3028fce04a12f451d7812946e3322be8b46306e8467` | `docs/helix-labo/L2-requirements/labo-requirements.md` L183–186; raw SHA `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | `LABO-016-FR-01`, `LABO-016-AC-01/02`; 個別fixture: `L10-LABO-016-C01`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11`; summary/index（分母外）: `L10-LABO-016-C02`|
| `HELIXLABO-L2-017` / `MPR-RC-HELIXLABO-L2-017-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L65 / `sha256:34ceade9563b09db94ef5d031c66df4c2741db3d13aa126ca0aa74b9a92b5440` | `docs/helix-labo/L2-requirements/labo-requirements.md` L187–190; raw SHA `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | `LABO-017-FR-01`, `LABO-017-AC-01/02`; 個別fixture: `L10-LABO-017-C01`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13`; summary/index（分母外）: `L10-LABO-017-C02`, `L10-LABO-017-C07`|
| `HELIXLABO-L2-018` / `MPR-RC-HELIXLABO-L2-018-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L66 / `sha256:d1b31fb8d379f9dcfcdc6213ac4d7fcb193e20d7d59276e231f548f3db9dcfdd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L191–194; raw SHA `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | `LABO-018-FR-01`, `LABO-018-AC-01/02`; 個別fixture: `L10-LABO-018-C01`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10`; summary/index（分母外）: `L10-LABO-018-C02` |
| `HELIXLABO-L2-019` / `MPR-RC-HELIXLABO-L2-019-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L67 / `sha256:e7a90eba26b101083aa9fa449b220ea53d5c8230eed1f82980797cdabbb51d65` | `docs/helix-labo/L2-requirements/labo-requirements.md` L195–198; raw SHA `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | `LABO-019-FR-01`, `LABO-019-AC-01/02`; 個別fixture: `L10-LABO-019-C01`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11`; summary/index（分母外）: `L10-LABO-019-C02`, `L10-LABO-019-C03` |
| `HELIXLABO-L2-020` / `MPR-RC-HELIXLABO-L2-020-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L68 / `sha256:61ae506fe25a2218b3c2581e47eb76a167f8344cc792d5c27d4895bd65121501` | `docs/helix-labo/L2-requirements/labo-requirements.md` L199–202; raw SHA `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | `LABO-020-FR-01`, `LABO-020-AC-01/02`; 個別fixture: `L10-LABO-020-C01`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12`; summary/index（分母外）: `L10-LABO-020-C02`, `L10-LABO-020-C03`|
| `HELIXLABO-L2-021` / `MPR-RC-HELIXLABO-L2-021-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L69 / `sha256:00dda7b8a7675bba719585e6fbb94e43a2f273146b195d00daae5718f3f1fc9e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L203–206; raw SHA `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | `LABO-021-FR-01`, `LABO-021-AC-01/02`; 個別fixture: `L10-LABO-021-C01`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C13`, `L10-LABO-021-C16`; summary/index（分母外）: `L10-LABO-021-C02`, `L10-LABO-021-C03`|
| `HELIXLABO-L2-022` / `MPR-RC-HELIXLABO-L2-022-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L70 / `sha256:4dba319cb6d4abe7c909c9ffc1c9e50593efe4aa6d26548fd0434375baeae783` | `docs/helix-labo/L2-requirements/labo-requirements.md` L207–210; raw SHA `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | `LABO-022-FR-01`, `LABO-022-AC-01/02`; 個別fixture: `L10-LABO-022-C01`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C15`, `L10-LABO-022-C16`, `L10-LABO-022-C17`, `L10-LABO-022-C18`; summary/index（分母外）: `L10-LABO-022-C02`, `L10-LABO-022-C03`, `L10-LABO-022-C06`|
| `HELIXLABO-L2-023` / `MPR-RC-HELIXLABO-L2-023-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L71 / `sha256:aafe6d1641624bd7986d5fd6c6a1c67644221c9df0f4503433f442c98f26a36b` | `docs/helix-labo/L2-requirements/labo-requirements.md` L211–214; raw SHA `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | `LABO-023-FR-01`, `LABO-023-AC-01/02`; 個別fixture: `L10-LABO-023-C01`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C13`, `L10-LABO-023-C16`; summary/index（分母外）: `L10-LABO-023-C02`, `L10-LABO-023-C03`, `L10-LABO-023-C10`|
| `HELIXLABO-L2-024` / `MPR-RC-HELIXLABO-L2-024-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L72 / `sha256:b9716e90512221b17da8f2eb3df7d8ea64bcdab2e4223ea32a720ae8c19ddbd4` | `docs/helix-labo/L2-requirements/labo-requirements.md` L215–218; raw SHA `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | `LABO-024-FR-01`, `LABO-024-AC-01/02`; 個別fixture: `L10-LABO-024-C01`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18`; summary/index（分母外）: `L10-LABO-024-C02`, `L10-LABO-024-C03`|
| `HELIXLABO-L2-025` / `MPR-RC-HELIXLABO-L2-025-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L73 / `sha256:e6cc467c72635a5fb91257cfb90f6a1039654d8f34a28454353566e3f3c28bf3` | `docs/helix-labo/L2-requirements/labo-requirements.md` L219–222; raw SHA `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | `LABO-025-FR-01`, `LABO-025-AC-01/02`; 個別fixture: `L10-LABO-025-C01`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16`; summary/index（分母外）: `L10-LABO-025-C02`, `L10-LABO-025-C03`|
| `HELIXLABO-L2-026` / `MPR-RC-HELIXLABO-L2-026-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L74 / `sha256:64944055712d4d2c8ad4817624c5eeacba241c5bf7a008da18b2cfcdb53ec150` | `docs/helix-labo/L2-requirements/labo-requirements.md` L223–226; raw SHA `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | `LABO-026-FR-01`, `LABO-026-AC-01/02`; 個別fixture: `L10-LABO-026-C01`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16`; summary/index（分母外）: `L10-LABO-026-C02`, `L10-LABO-026-C03`|
| `HELIXLABO-L2-027` / `MPR-RC-HELIXLABO-L2-027-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L75 / `sha256:ee444d777dfa4e45646584941998a8fa812b0070d62261e0c9ae3249928b8bab` | `docs/helix-labo/L2-requirements/labo-requirements.md` L227–230; raw SHA `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | `LABO-027-FR-01`, `LABO-027-AC-01/02`; 個別fixture: `L10-LABO-027-C01`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16`; summary/index（分母外）: `L10-LABO-027-C02`, `L10-LABO-027-C03`|
| `HELIXLABO-L2-028` / `MPR-RC-HELIXLABO-L2-028-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L76 / `sha256:f51b751526a581ca0cd80821dfdb9b558d3e2d4d0d3cb123420ea7391e45564e` | `docs/helix-labo/L2-requirements/labo-requirements.md` L231–234; raw SHA `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | `LABO-028-FR-01`, `LABO-028-AC-01/02`; 個別fixture: `L10-LABO-028-C01`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16`; summary/index（分母外）: `L10-LABO-028-C02`|
| `HELIXLABO-L2-029` / `MPR-RC-HELIXLABO-L2-029-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L77 / `sha256:c37e1dbc85f2c6fcfb9b55e28d867faf9c4727a3615bd36882a71353eed3c89f` | `docs/helix-labo/L2-requirements/labo-requirements.md` L235–238; raw SHA `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | `LABO-029-FR-01`, `LABO-029-AC-01/02`; 個別fixture: `L10-LABO-029-C01`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19`; summary/index（分母外）: `L10-LABO-029-C02`, `L10-LABO-029-C03`, `L10-LABO-029-C08`|
| `HELIXLABO-L2-030` / `MPR-RC-HELIXLABO-L2-030-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L78 / `sha256:79a9ed7a30f650e949b2f092958a3e84c428e7ff84c0e6409fd056196d4c1e50` | `docs/helix-labo/L2-requirements/labo-requirements.md` L239–242; raw SHA `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | `LABO-030-FR-01`, `LABO-030-AC-01/02`; 個別fixture: `L10-LABO-030-C01`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10`; summary/index（分母外）: `L10-LABO-030-C02`, `L10-LABO-030-C03` |
| `HELIXLABO-L2-034` / `MPR-RC-HELIXLABO-L2-034-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L82 / `sha256:3d6fa067472bd28ce86fa0da805972e817170bde8602652a2e070b9af572cdbf` | `docs/helix-labo/L2-requirements/labo-requirements.md` L255–258; raw SHA `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | `LABO-034-FR-01`, `LABO-034-AC-01/02`; 個別fixture: `L10-LABO-034-C01`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12`; summary/index（分母外）: `L10-LABO-034-C02` |
| `HELIXLABO-L2-035` / `MPR-RC-HELIXLABO-L2-035-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L83 / `sha256:8cdd8f7cbbdeb905ea12b600ff007e25ad5f0bb6196c70009402ef1453662bfd` | `docs/helix-labo/L2-requirements/labo-requirements.md` L259–262; raw SHA `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | `LABO-035-FR-01`, `LABO-035-AC-01/02`; 個別fixture: `L10-LABO-035-C01`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19`; summary/index（分母外）: `L10-LABO-035-C02`, `L10-LABO-035-C03` |
| `HELIXLABO-L2-058` / `MPR-RC-HELIXLABO-L2-058-001` / docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md#L98 / `sha256:0ff4f665f3a465611b2489a908bfb161e852fa5706393d04c21d59c3598d9f17` | `docs/helix-labo/L2-requirements/labo-requirements.md` L403–415; raw SHA `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | `LABO-058-FR-01`, `LABO-058-AC-01/02`; 個別fixture: `L10-LABO-058-C01`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41`; summary/index（分母外）: `L10-LABO-058-C02`, `L10-LABO-058-C03`, `L10-LABO-058-C04`, `L10-LABO-058-C05` |

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
- **LABO-013-AC-02 — failure/owner boundary**：分類軸の混同/根拠欠落をsuccessにしない。unknownはunknownとして保持し、不要や成功へ読み替えない。Vectorはsource meaningを上書きしない。

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
- **LABO-014-AC-02 — failure/owner boundary**：元意味・適用条件不明、meaning delta欠落を確定candidateにしない。接続はcandidateを実変更/決定へ昇格しない。

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
- **LABO-015-AC-02 — failure/owner boundary**：比較arm間の版/条件/scope差、oracle不足を成功扱いしない。固定L2-015の評価oracleと対象版の依存から、比較条件の不足は当該比較の評価oracle/source ownerへ戻す。Worker実行を開始/割当しない（OS assignment/Worker選定境界は固定L2-006 source lines 57, 113–115から導出）。

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
- **LABO-016-AC-02 — failure/owner boundary**：判定不能をsystem候補成立へ読み替えない。反例を欠落させず評価材料に保持する。oracle identity欠落はunknownのまま保持し、system適格性を導かない。比較結果はoperation候補として保留し、固定親にないowner routeを追加しない。自動system化/昇格をしない。

### 補正ACと個別fixtureの対応

- `LABO-016-AC-01` は正常fixture `L10-LABO-016-C08` の個別oracleを満たし、同一性/未完・unknown状態を保持する。

個別negative検証対象（summary/indexを除く）: `L10-LABO-016-C03`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-016-FR-01 / LABO-016-AC-01` | `L10-LABO-016-C01`, `L10-LABO-016-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C03`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-016-FR-01 / LABO-016-AC-02` | `L10-LABO-016-C09` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
| 親範囲内のheld-out正常fixture | `LABO-016-FR-01 / LABO-016-AC-01` | `L10-LABO-016-C04`, `L10-LABO-016-C08` | 未見typeだけを理由に落とさず同じ親契約で照合 |

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
- **LABO-017-AC-02 — failure/owner boundary**：current version/evidence・適格性材料・system/operation条件の欠落、例外記録・現行保証または未完義務の消失、system永続固定を切替完了や成功にしない。脱落義務と既存ownerを保持し、運転結果の不足は既存ownerへ戻す。適格性・条件の不足は固定L2-017の依存L2-007の適格性sourceへ不足を返す。LABOはoperational switchを実行しない。

### 補正ACと個別fixtureの対応

個別negative検証対象（summary/indexを除く）: `L10-LABO-017-C03`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-017-FR-01 / LABO-017-AC-01` | `L10-LABO-017-C01`, `L10-LABO-017-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-017-FR-01 / LABO-017-AC-02` | `L10-LABO-017-C03`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
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
- **LABO-020-AC-02 — failure/owner boundary**：旧新version/source欠落で新observed successを作らない。復帰後観測を旧版と同じ版へ統合せず、未完義務と前後版を保持する。不一致はsource ownerへ戻す。fallbackの実行責務は固定L2-017の切替非実行境界を保持しownerに残す。Aggregateは観測に限定。

### 補正ACと個別fixtureの対応

- `LABO-020-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-020-FR-01 / LABO-020-AC-01` | `L10-LABO-020-C01`, `L10-LABO-020-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-020-FR-01 / LABO-020-AC-02` | `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
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
- **LABO-021-AC-02 — failure/owner boundary**：scope/version不明やunauthorized dataを取込成功にしない。 HARNESS raw record/authorityをLABOで変更しない。 許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-021-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C16`, `L10-LABO-021-C13`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-021-FR-01 / LABO-021-AC-01` | `L10-LABO-021-C01`, `L10-LABO-021-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C16`, `L10-LABO-021-C13` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-021-FR-01 / LABO-021-AC-02` | `L10-LABO-021-C08`, `L10-LABO-021-C10`, `L10-LABO-021-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-022-AC-02 — failure/owner boundary**：stale/欠落を完了/評価済みにしない。 OSが割当/運転state ownerのまま。 許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-022-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C16`, `L10-LABO-022-C15`, `L10-LABO-022-C17`, `L10-LABO-022-C18`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-022-FR-01 / LABO-022-AC-01` | `L10-LABO-022-C01`, `L10-LABO-022-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C16`, `L10-LABO-022-C15`, `L10-LABO-022-C17`, `L10-LABO-022-C18` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-022-FR-01 / LABO-022-AC-02` | `L10-LABO-022-C08`, `L10-LABO-022-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-023-AC-02 — failure/owner boundary**：unknown source identity、unauthorized knowledge use、BRAIN source contract欠落を受理せず、BRAIN knowledge sourceを編集/更新しない。source identity不明と依存するBRAIN source contract欠落は固定L2-023のBRAIN source責務へ戻す。許可scope不明はL2-058:413に従い既存SECURITY permission ownerへ戻す。欠落を理由に正本とauthorityの所在をLABOへ移さない。許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-023-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

`L10-LABO-023-C08`の許可不明はSECURITY既存permission ownerへ、`L10-LABO-023-C09`のsource利用scope不明はBRAIN source contract ownerへ戻す。呼出し側の選択/scope自体がunknownの場合に限りL2-058の既存call-scope ownerへ戻す。canonical write拒否は`L10-LABO-023-C07`で照合しC10はその索引である。正本/authorityの所在移管は独立した`L10-LABO-023-C11`で拒否する。

個別negative検証対象（summary/indexを除く）: `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C16`, `L10-LABO-023-C13`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-023-FR-01 / LABO-023-AC-01` | `L10-LABO-023-C01`, `L10-LABO-023-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C16`, `L10-LABO-023-C13` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-023-FR-01 / LABO-023-AC-02` | `L10-LABO-023-C07`, `L10-LABO-023-C11`, `L10-LABO-023-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-024-AC-02 — failure/owner boundary**：source identity/revision欠落・不一致、過去評価のcurrent authority化、稼働中判断を過去実績へ混ぜること、観測事実と判断の混同、INTELLIGENCE正本への書戻しを成功扱いしない。現行判断は現行判断のまま、過去評価は過去評価のまま分離する。

### 補正ACと個別fixtureの対応

- `LABO-024-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-024-FR-01 / LABO-024-AC-01` | `L10-LABO-024-C01`, `L10-LABO-024-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18` | 各独立CASEの一条件変異を成功へ昇格せず、稼働中判断と過去実績の区分を維持 |
| 責務ownerと変更禁止境界 | `LABO-024-FR-01 / LABO-024-AC-02` | `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-025-AC-02 — failure/owner boundary**：scope不明・制限データ・stale source revisionを受理しない。restricted payloadやsecurity authorityをLABOに保持・移管しない。許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-025-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-025-FR-01 / LABO-025-AC-01` | `L10-LABO-025-C01`, `L10-LABO-025-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-025-FR-01 / LABO-025-AC-02` | `L10-LABO-025-C07`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-026-AC-02 — failure/owner boundary**：stale/unknown environmentをcurrent healthyに変換せず、resource contract欠落をunknownとして保持する。resource authority/configurationは変更しない。許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-026-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-026-FR-01 / LABO-026-AC-01` | `L10-LABO-026-C01`, `L10-LABO-026-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-026-FR-01 / LABO-026-AC-02` | `L10-LABO-026-C07`, `L10-LABO-026-C09`, `L10-LABO-026-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-027-AC-02 — failure/owner boundary**：schema drift/unknownを正常接続として扱わない。 logical connection contractをLABOで改定せず、全sourceへのconnector暗黙共用を拒否する。 許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-027-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-027-FR-01 / LABO-027-AC-01` | `L10-LABO-027-C01`, `L10-LABO-027-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-027-FR-01 / LABO-027-AC-02` | `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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

- **LABO-028-AC-01 — 正常・trace**：result/task class/worker/source/assignment revisionsを相互照合する。実験結果の場合はL11:79とL2-006に従いexperiment identityと対象版を保つ。
- **LABO-028-AC-02 — failure/owner boundary**：assignment不明、unknown resultを評価済み/qualifiedへしない。 Workerの実行/OS assignment責務を置換しない。 許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-028-AC-01` は正常fixture `L10-LABO-028-C09` の個別oracleを満たし、同一性/未完・unknown状態を保持する。
- `LABO-028-AC-02` は次の各fixtureをそれぞれ一変数で照合する。`C10`の誤experiment identityと`C11`の誤target versionは当該Worker result source ownerへ、`C12`は有効receiptを保ったresult-source欠落であり、そのresult source ownerへ戻す。OS receipt欠落だけは`L10-LABO-028-C14`でOS assignment/receipt ownerへ戻す。正常なassignment/receiptとresult-source不一致を相互補完しない。 `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`。集約fixtureの件数は個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-028-C03`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-028-FR-01 / LABO-028-AC-01` | `L10-LABO-028-C01`, `L10-LABO-028-C04`, `L10-LABO-028-C09` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C03`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-028-FR-01 / LABO-028-AC-02` | `L10-LABO-028-C13`, `L10-LABO-028-C15`, `L10-LABO-028-C16` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-029-AC-02 — failure/owner boundary**：未実行/stale/interrupted/missing scopeおよびOS execution receipt identity不一致をpassにしない。固定L2-029が戻し先を定める検査scope欠落だけはsource ownerへ返す。OS execution evidence/receiptの欠落・不一致はOS execution evidence ownerへ、HARNESS verification contractの欠落・staleはHARNESS verification contract ownerへ返す。permission/classificationの不備はSECURITYへ返す。各条件を別々に判定し、誤ったownerへの返却は不合格とする。unknown/拒否を保持し、passやCI実行を生成しない。LABOはCI/testを実行せずverification authorityも変更しない。許可sourceごとのobservation identity/revisionを混合しない。

### 補正ACと個別fixtureの対応

- `LABO-029-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-029-FR-01 / LABO-029-AC-01` | `L10-LABO-029-C01`, `L10-LABO-029-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-029-FR-01 / LABO-029-AC-02` | `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C16`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19` | OS execution evidence/receiptの不備はOSへ、HARNESS verification contractの不備はHARNESSへ返す。誤ったownerへの返却は不合格とし、unknown/拒否を保持してpassやCI実行を生成しない |
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
- **LABO-030-AC-02 — failure boundary**：product identity欠落、source revision不一致、異なるsource統合、authority移管、source contract欠落を成功扱いしない。親が戻し先を定めないidentity欠落・source統合・authority移管は拒否のみとし、返却先を新設しない。選択Product Core sourceのrevision不一致・source contract欠落の返却は、L2-030が001へ渡す入力接続であること、固定L2-001:73の欠落時source責務への返却、L2-058:410の選択source接続条件、L2-058:413のversion/scope/許可/receipt条件から再導出し、該当Product Core source ownerへ戻す（接続契約の不足として）。L2-030単独に明記のない返却先を推定しているものではない。未採択source/productを暗黙必須化せず製品stateを書き換えない。

### 補正ACと個別fixtureの対応

- `LABO-030-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-030-FR-01 / LABO-030-AC-01` | `L10-LABO-030-C01`, `L10-LABO-030-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` | 各独立CASEの一条件変異を成功へ昇格せず、固定親に戻し先がある場合だけ照合 |
| 責務ownerと変更禁止境界 | `LABO-030-FR-01 / LABO-030-AC-02` | `L10-LABO-030-C08` | source authority/meaningを書き換えず、固定親にない返却先を作らない |
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
- **LABO-034-AC-02 — failure/owner boundary**：single case/product-specific meaning/unknown applicabilityからgeneric candidateを作らない。BRAIN個別connector契約の欠落/staleは受渡し済みにせずunknownで保持し、固定L2-034の個別connector依存（L2:159–162,257）に従ってCONNECTの当該connector契約ownerへ返す。BRAIN ingestion/authorityを作らず、外部knowledge/evaluation loopを1.0に含めない。

### 補正ACと個別fixtureの対応

- `LABO-034-AC-02` の個別fixtureは下の「個別negative検証対象」に列挙する。各CASEの一条件変異・oracle・固定戻し先をそれぞれ照合し、summary/indexを代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-034-C03`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-034-FR-01 / LABO-034-AC-01` | `L10-LABO-034-C01`, `L10-LABO-034-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C03`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
| 責務ownerと変更禁止境界 | `LABO-034-FR-01 / LABO-034-AC-02` | `L10-LABO-034-C06`, `L10-LABO-034-C09`, `L10-LABO-034-C10` | 各CASEの責務区分と変更禁止oracleを独立に照合し、記載した固定戻し先を保持 |
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
- **LABO-035-AC-02 — failure/owner boundary**：source/scope/revision unknownやunassessedを評価済み/learnedへ変えない。INTELLIGENCE個別connector契約の欠落/不一致は受渡し済みにせずunknownを保持し、固定L2-035の個別connector依存（L2:159–162,261）に従ってCONNECTの当該connector契約ownerへ返す。INTELLIGENCEの学習/調整、model selection/placement/bot operationを実行しない。

### 補正ACと個別fixtureの対応

- `LABO-035-AC-01` は正常fixture `L10-LABO-035-C11` の個別oracleを満たし、同一性/未完・unknown状態を保持する。
- `LABO-035-AC-02` は各fixtureを一変数ずつ照合する。C09/C10のsource version欠落・staleは該当source ownerへ戻し、同一revisionのpacket/receipt不一致はL2-052の境界条件と区別する。C12はunassessedを保ったままINTELLIGENCE境界へ渡し、C13/C14はLABOがplacement・bot判断/実行を生成せず既存INTELLIGENCE境界に保持する。`L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19`。C15はBench専用契約を保持し、C16/C17はsource scope不明/欠落を当該source ownerへ戻す。集約fixtureの件数は個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| parentの入力→出力とprovenance/version guarantee | `LABO-035-FR-01 / LABO-035-AC-01` | `L10-LABO-035-C01`, `L10-LABO-035-C04` | 許可input・source identity/revision・出力状態が対応 |
| 不一致/欠落/unknown/staleの失敗規則 | `LABO-035-FR-01 / LABO-035-AC-02` | `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19` | 各独立CASEの一条件変異を成功へ昇格せず、そのCASEの固定戻し先を照合 |
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

- **LABO-058-AC-01 — 正常・trace**：Workerだけを選択した呼出しではWorkerのconnector/permission/version/result contractを要求し、未選択BRAIN等の接続稼働を要求せず、選択/未選択と理由を表示する。Web/WEB-OSを明示選択した条件付きfixtureでは既存L2-031/032の採択source contractと該当接続・安全条件を照合する。
- **LABO-058-AC-02 — failure/owner boundary**：選択sourceのmissingは未選択へ変えず、未選択/unconnected sourceはunobservedのままにする。選択sourceまたは呼出しscope自体がunknownなら既存call-scope ownerへ戻す。選択sourceのpermission/classification不足はSECURITYへ、source/contract/versionの不足・不一致は当該source owner/LABOまたは接続contractならCONNECTへ、OS assignment/receipt不足は既存OS ownerへ戻す。operation/source条件の不一致は当該selected source ownerへ戻し、誤った戻し先は不合格とする。scope不足またはscope変更後のreceipt不一致は固定L2:413に従い当該source owner／SECURITYへ戻す。source集合等が明示変更された場合は新条件で再closureし、旧receiptを流用しない。058追補の存在だけを001の実行前提にせず、001固有の有効条件を満たす実行を拒まない。Bench評価済み、assignment permission、全source完了を主張しない。001の本文/責務/outputは変更せず、source選択条件だけを補う。source未選択はpermission不明データの取込許可にならない。Web/WEB-OSは選択時だけ既存採択source contractを要求し、外部取得2.0を1.0へ前倒ししない。

### 補正ACと個別fixtureの対応

- `LABO-058-AC-01` は正常fixture `L10-LABO-058-C12`, `L10-LABO-058-C32`, `L10-LABO-058-C37` の各選択source閉包を個別に照合する。
- `LABO-058-AC-02` は各一変数fixtureを個別に照合し、未選択・未完・unknownを成功へ変えず、固定親に定めのある場合だけ既存ownerへ戻す: `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41`。C41は001実行前提へ058を再帰追加する誤りを拒否する独立fixture。集約fixtureを個別negativeの代替にしない。

個別negative検証対象（summary/indexを除く）: `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41`。

### 固定親句trace

| 親句／条件 | FR/AC | L10 case | oracle |
|---|---|---|---|
| 呼出しscope/selected source/operation/permission/versionを入力として選択理由とunselectedを表示 | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C12` | 入力集合と選択/未選択一覧が一致し、選択理由が表示される |
| 常時001 contractとselected-source dependency closure | `LABO-058-FR-01 / LABO-058-AC-01` | `L10-LABO-058-C01`, `L10-LABO-058-C12` | 選択した全sourceの接続/安全/版条件を検査 |
| unselectedはunobserved、selected-missingはunmet dependency | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C13`, `L10-LABO-058-C19` | 未選択≠成功観測、選択欠落≠未選択化 |
| unknown selection/scopeはcall-scope owner、permission/classificationはSECURITYへ戻し、no selectionは未許可取込を許可しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C06`, `L10-LABO-058-C09`, `L10-LABO-058-C18`, `L10-LABO-058-C22` | 入力成立拒否と条件別の既存戻し先、unauthorized intake 0 |
| reference-only資料を実行時必須依存へ変換しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C11` | 参照資料と当該呼出しの選択source dependencyを分離し、実行時必須化を拒否 |
| Webは選択時だけL2-031の既存contract、external 2.0を1.0へ含めない | `LABO-058-FR-01 / LABO-058-AC-01/02` | `L10-LABO-058-C10`, `L10-LABO-058-C21`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34` | 選択時の採択/接続/安全条件を照合し、未選択時の実稼働依存0、2.0 external intake 0 |
| WEB-OSは選択時だけL2-032の既存contractとtenant/customer scope、authorityを保持 | `LABO-058-FR-01 / LABO-058-AC-01/02` | `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40` | 選択時の採択/個別connector/scope条件を照合し、未選択時の実稼働依存0、WEB-OS authorityをsource側に保持 |
| source集合/operation/scope/contract版の明示変更後にclosureを再検証 | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C30`, `L10-LABO-058-C31` | 旧receiptを流用せず新条件で再closureする。選択sourceのreceipt/operation/source不備は当該source ownerへ、接続contract不備はCONNECTへ、permission/classificationはSECURITYへ戻す。selection自体がunknownの場合だけcall-scope ownerへ戻し、誤った戻し先は不合格とする |
| 未選択sourceを観測成功化／単一call passを全source完了化しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C19`, `L10-LABO-058-C20` | unselected remains not_observed、単一callは対応範囲だけを成功として保持 |
| 観測成功をBench評価済み・割当許可へ昇格しない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C26`, `L10-LABO-058-C27` | 観測成立を評価・割当authorityへ変換しない |
| 1.0義務と既存001契約を保全 | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C35`, `L10-LABO-058-C36` | 未選択を理由に完成義務を削除せず001出力を改定しない |
| 058追補を001の実行前提にしない | `LABO-058-FR-01 / LABO-058-AC-02` | `L10-LABO-058-C41` | 001固有の入力条件と接続条件が有効なら、058の補助的な依存区分情報がないことだけを理由に001の観測を拒まない |

CONNECT契約とOS assignment責務の戻し先は固定L2の接続共通前置き159–162行とL2-022/028から再導出し、各sourceとLABOの観測責務を移さない。

## 未承認事項

本追補の22親についてFR/L10 pair候補を記したが、部分草稿・未承認である。既承認のStage 2b基本9親の状態はその決定記録に従う。本追補から機構全体のL3完了や実装/releaseを生成しない。個別parameterの承認gateを作らず、L2の意味/scope/owner/versionを変える場合だけL2へ戻す。


## Stage 2b — 独立case追補のFR/AC trace

| 親 | 固定意味範囲 | AC | 個別L10 fixture（正常/negativeをACで区別） |
|---|---|---|---|
| `HELIXLABO-L2-012` | 固定親のscope/owner/version、条件句を保持 | `LABO-012-AC-01/02` | `L10-LABO-012-C01`, `L10-LABO-012-C02`, `L10-LABO-012-C04`, `L10-LABO-012-C05`, `L10-LABO-012-C06`, `L10-LABO-012-C07`, `L10-LABO-012-C08`, `L10-LABO-012-C09`, `L10-LABO-012-C10` |
| `HELIXLABO-L2-013` | 固定親のscope/owner/version、条件句を保持 | `LABO-013-AC-01/02` | `L10-LABO-013-C01`, `L10-LABO-013-C04`, `L10-LABO-013-C05`, `L10-LABO-013-C06`, `L10-LABO-013-C07`, `L10-LABO-013-C08`, `L10-LABO-013-C09`, `L10-LABO-013-C10`, `L10-LABO-013-C11`, `L10-LABO-013-C12`, `L10-LABO-013-C13`, `L10-LABO-013-C14`, `L10-LABO-013-C15`, `L10-LABO-013-C16`, `L10-LABO-013-C17`|
| `HELIXLABO-L2-014` | 固定親のscope/owner/version、条件句を保持 | `LABO-014-AC-01/02` | `L10-LABO-014-C01`, `L10-LABO-014-C04`, `L10-LABO-014-C05`, `L10-LABO-014-C06`, `L10-LABO-014-C07`, `L10-LABO-014-C08`, `L10-LABO-014-C09`, `L10-LABO-014-C10`, `L10-LABO-014-C11`, `L10-LABO-014-C12` |
| `HELIXLABO-L2-015` | 固定親のscope/owner/version、条件句を保持 | `LABO-015-AC-01/02` | `L10-LABO-015-C01`, `L10-LABO-015-C04`, `L10-LABO-015-C05`, `L10-LABO-015-C06`, `L10-LABO-015-C07`, `L10-LABO-015-C08`, `L10-LABO-015-C09`, `L10-LABO-015-C10`, `L10-LABO-015-C11`, `L10-LABO-015-C12` |
| `HELIXLABO-L2-016` | 固定親のscope/owner/version、条件句を保持 | `LABO-016-AC-01/02` | `L10-LABO-016-C01`, `L10-LABO-016-C03`, `L10-LABO-016-C04`, `L10-LABO-016-C05`, `L10-LABO-016-C06`, `L10-LABO-016-C07`, `L10-LABO-016-C08`, `L10-LABO-016-C09`, `L10-LABO-016-C10`, `L10-LABO-016-C11` |
| `HELIXLABO-L2-017` | 固定親sourceのversion・scope・owner・列挙条件を本文各親節に記録 | `LABO-017-AC-01/02` | `L10-LABO-017-C01`, `L10-LABO-017-C03`, `L10-LABO-017-C04`, `L10-LABO-017-C05`, `L10-LABO-017-C06`, `L10-LABO-017-C08`, `L10-LABO-017-C09`, `L10-LABO-017-C10`, `L10-LABO-017-C11`, `L10-LABO-017-C12`, `L10-LABO-017-C13` |
| `HELIXLABO-L2-018` | 固定親のscope/owner/version、条件句を保持 | `LABO-018-AC-01/02` | `L10-LABO-018-C01`, `L10-LABO-018-C03`, `L10-LABO-018-C04`, `L10-LABO-018-C05`, `L10-LABO-018-C06`, `L10-LABO-018-C07`, `L10-LABO-018-C08`, `L10-LABO-018-C09`, `L10-LABO-018-C10` |
| `HELIXLABO-L2-019` | 固定親のscope/owner/version、条件句を保持 | `LABO-019-AC-01/02` | `L10-LABO-019-C01`, `L10-LABO-019-C04`, `L10-LABO-019-C05`, `L10-LABO-019-C06`, `L10-LABO-019-C07`, `L10-LABO-019-C08`, `L10-LABO-019-C09`, `L10-LABO-019-C10`, `L10-LABO-019-C11` |
| `HELIXLABO-L2-020` | 固定親のscope/owner/version、条件句を保持 | `LABO-020-AC-01/02` | `L10-LABO-020-C01`, `L10-LABO-020-C04`, `L10-LABO-020-C05`, `L10-LABO-020-C06`, `L10-LABO-020-C07`, `L10-LABO-020-C08`, `L10-LABO-020-C09`, `L10-LABO-020-C10`, `L10-LABO-020-C11`, `L10-LABO-020-C12`|
| `HELIXLABO-L2-021` | 固定親のscope/owner/version、条件句を保持 | `LABO-021-AC-01/02` | `L10-LABO-021-C01`, `L10-LABO-021-C04`, `L10-LABO-021-C05`, `L10-LABO-021-C06`, `L10-LABO-021-C07`, `L10-LABO-021-C08`, `L10-LABO-021-C09`, `L10-LABO-021-C10`, `L10-LABO-021-C11`, `L10-LABO-021-C12`, `L10-LABO-021-C13`, `L10-LABO-021-C16` |
| `HELIXLABO-L2-022` | 固定親のscope/owner/version、条件句を保持 | `LABO-022-AC-01/02` | `L10-LABO-022-C01`, `L10-LABO-022-C04`, `L10-LABO-022-C05`, `L10-LABO-022-C07`, `L10-LABO-022-C08`, `L10-LABO-022-C09`, `L10-LABO-022-C10`, `L10-LABO-022-C11`, `L10-LABO-022-C12`, `L10-LABO-022-C13`, `L10-LABO-022-C14`, `L10-LABO-022-C15`, `L10-LABO-022-C16`, `L10-LABO-022-C17`, `L10-LABO-022-C18` |
| `HELIXLABO-L2-023` | 固定親のscope/owner/version、条件句を保持 | `LABO-023-AC-01/02` | `L10-LABO-023-C01`, `L10-LABO-023-C04`, `L10-LABO-023-C05`, `L10-LABO-023-C06`, `L10-LABO-023-C07`, `L10-LABO-023-C08`, `L10-LABO-023-C09`, `L10-LABO-023-C11`, `L10-LABO-023-C12`, `L10-LABO-023-C13`, `L10-LABO-023-C16` |
| `HELIXLABO-L2-024` | 固定親のscope/owner/version、条件句を保持 | `LABO-024-AC-01/02` | `L10-LABO-024-C01`, `L10-LABO-024-C04`, `L10-LABO-024-C05`, `L10-LABO-024-C06`, `L10-LABO-024-C07`, `L10-LABO-024-C08`, `L10-LABO-024-C09`, `L10-LABO-024-C16`, `L10-LABO-024-C17`, `L10-LABO-024-C18` |
| `HELIXLABO-L2-025` | 固定親のscope/owner/version、条件句を保持 | `LABO-025-AC-01/02` | `L10-LABO-025-C01`, `L10-LABO-025-C04`, `L10-LABO-025-C05`, `L10-LABO-025-C06`, `L10-LABO-025-C07`, `L10-LABO-025-C08`, `L10-LABO-025-C09`, `L10-LABO-025-C10`, `L10-LABO-025-C16`|
| `HELIXLABO-L2-026` | 固定親のscope/owner/version、条件句を保持 | `LABO-026-AC-01/02` | `L10-LABO-026-C01`, `L10-LABO-026-C04`, `L10-LABO-026-C05`, `L10-LABO-026-C06`, `L10-LABO-026-C07`, `L10-LABO-026-C08`, `L10-LABO-026-C09`, `L10-LABO-026-C16`|
| `HELIXLABO-L2-027` | 固定親のscope/owner/version、条件句を保持 | `LABO-027-AC-01/02` | `L10-LABO-027-C01`, `L10-LABO-027-C04`, `L10-LABO-027-C05`, `L10-LABO-027-C06`, `L10-LABO-027-C07`, `L10-LABO-027-C08`, `L10-LABO-027-C09`, `L10-LABO-027-C10`, `L10-LABO-027-C11`, `L10-LABO-027-C12`, `L10-LABO-027-C16`|
| `HELIXLABO-L2-028` | 固定親のscope/owner/version、条件句を保持 | `LABO-028-AC-01/02` | `L10-LABO-028-C01`, `L10-LABO-028-C03`, `L10-LABO-028-C04`, `L10-LABO-028-C05`, `L10-LABO-028-C06`, `L10-LABO-028-C07`, `L10-LABO-028-C08`, `L10-LABO-028-C09`, `L10-LABO-028-C10`, `L10-LABO-028-C11`, `L10-LABO-028-C12`, `L10-LABO-028-C13`, `L10-LABO-028-C14`, `L10-LABO-028-C15`, `L10-LABO-028-C16`|
| `HELIXLABO-L2-029` | 固定親のscope/owner/version、条件句を保持 | `LABO-029-AC-01/02` | `L10-LABO-029-C16`, `L10-LABO-029-C01`, `L10-LABO-029-C04`, `L10-LABO-029-C05`, `L10-LABO-029-C06`, `L10-LABO-029-C07`, `L10-LABO-029-C09`, `L10-LABO-029-C10`, `L10-LABO-029-C11`, `L10-LABO-029-C12`, `L10-LABO-029-C17`, `L10-LABO-029-C18`, `L10-LABO-029-C19` |
| `HELIXLABO-L2-030` | 固定親のscope/owner/version、条件句を保持 | `LABO-030-AC-01/02` | `L10-LABO-030-C01`, `L10-LABO-030-C04`, `L10-LABO-030-C05`, `L10-LABO-030-C06`, `L10-LABO-030-C07`, `L10-LABO-030-C08`, `L10-LABO-030-C09`, `L10-LABO-030-C10` |
| `HELIXLABO-L2-034` | 固定親のscope/owner/version、条件句を保持 | `LABO-034-AC-01/02` | `L10-LABO-034-C01`, `L10-LABO-034-C03`, `L10-LABO-034-C04`, `L10-LABO-034-C05`, `L10-LABO-034-C06`, `L10-LABO-034-C07`, `L10-LABO-034-C08`, `L10-LABO-034-C09`, `L10-LABO-034-C10`, `L10-LABO-034-C11`, `L10-LABO-034-C12` |
| `HELIXLABO-L2-035` | 固定親のscope/owner/version、条件句を保持 | `LABO-035-AC-01/02` | `L10-LABO-035-C01`, `L10-LABO-035-C04`, `L10-LABO-035-C05`, `L10-LABO-035-C06`, `L10-LABO-035-C07`, `L10-LABO-035-C08`, `L10-LABO-035-C09`, `L10-LABO-035-C10`, `L10-LABO-035-C11`, `L10-LABO-035-C12`, `L10-LABO-035-C13`, `L10-LABO-035-C14`, `L10-LABO-035-C15`, `L10-LABO-035-C16`, `L10-LABO-035-C17`, `L10-LABO-035-C18`, `L10-LABO-035-C19` |
| `HELIXLABO-L2-058` | 固定親のscope/owner/version、条件句を保持 | `LABO-058-AC-01/02` | `L10-LABO-058-C01`, `L10-LABO-058-C06`, `L10-LABO-058-C07`, `L10-LABO-058-C08`, `L10-LABO-058-C09`, `L10-LABO-058-C10`, `L10-LABO-058-C11`, `L10-LABO-058-C12`, `L10-LABO-058-C13`, `L10-LABO-058-C14`, `L10-LABO-058-C15`, `L10-LABO-058-C16`, `L10-LABO-058-C17`, `L10-LABO-058-C18`, `L10-LABO-058-C19`, `L10-LABO-058-C20`, `L10-LABO-058-C21`, `L10-LABO-058-C22`, `L10-LABO-058-C23`, `L10-LABO-058-C24`, `L10-LABO-058-C25`, `L10-LABO-058-C26`, `L10-LABO-058-C27`, `L10-LABO-058-C28`, `L10-LABO-058-C29`, `L10-LABO-058-C30`, `L10-LABO-058-C31`, `L10-LABO-058-C32`, `L10-LABO-058-C33`, `L10-LABO-058-C34`, `L10-LABO-058-C35`, `L10-LABO-058-C36`, `L10-LABO-058-C37`, `L10-LABO-058-C38`, `L10-LABO-058-C39`, `L10-LABO-058-C40`, `L10-LABO-058-C41` |

Stage 2b review01の集約CASEは索引としてのみ保持する。個別fixtureとnegative/NFR分母から除外し、上の親句traceでは個別CASEのoracleを照合する。

### review02責務境界の補足trace

`LABO-023-AC-02`の正本/authority移管はC11、既知不許可はC12で照合する。`LABO-025-AC-02`のSECURITY finding disposition変更はC10で照合し、authority移転はC07、policy本文書換えはC09で別に照合する。`LABO-034-AC-02`のBRAIN取込済み/authority化禁止はC10で照合する。各補足は固定親の責務不変を具体化し、採択・実行・source正本変更を生成しない。


### L11 §24 named-parent trace (review03)

| §24 row | 固定親の範囲 | FR/AC | 個別L10 CASE | oracle |
|---|---|---|---|---|
| #1 source別identity/revision | 001, 021–032 | 001 AC-01/02; 021–030 AC-01/02 | 001-C14/C15; 021-C16, 022-C16, 023-C16, 024-C16, 025-C16, 026-C16, 027-C16, 028-C16, 029-C16, 030-C07 | 各許可sourceのidentity/revisionを保持し、異なるsourceを1 observation identityへ混ぜない。C16は各source親ごとの独立oracle。 |
| #2 source state/authorityを集中させない | 021–042 | 各source親のAC-02 | 021-C10, 022-C08, 023-C11, 024-C17, 025-C07, 026-C07, 027-C12, 028-C13, 029-C11, 030-C08, 034-C10, 035-C07/C08/C13/C14 | source/target authorityとraw stateを元ownerに保持し、LABOから書き戻さない。 |
| #12 LABOによる切替禁止 | 017, 020 | LABO-017-AC-02; LABO-020-AC-02 | 017-C08/C13; 020-C12 | 有効な復帰後result/前後版を保っても、LABOは運用切替を実行しない。 |
| #14 変更後の再観測 | 020, 050 | LABO-020-AC-01 | 020-C06 | 復帰後観測を新observationにし、変更前後の版を追跡する。 |
| #9 Intelligence評価材料境界 | 035, 052, 054, 055 | LABO-035-AC-01/02; 052/054/055のAC・CASE対応未確認 | 035-C07/C08/C13/C14/C18/C19; 052・054・055は本trace表での個別fixture対応を未確認 | 035の未評価状態・受渡し境界は単独CASEで照合する。052/054/055はL11が名指す適用対象として記録し、該当する個別CASE/ACとの接続確認は未完。未評価を評価済み化せず、LABOが判断・配置・botを実行せず、評価材料をINTELLIGENCE境界へ渡す。 |

#1の021–029への適用はL11 §24の明示対象範囲に基づく。各C16はそれぞれの既存source contract/ownerを保持するsource別単独CASEであり、cross-source compositeだけで代替しない。#2は固定L11 §24の「021–042」の範囲指定であり、034・035・030だけを個別名指しした記述ではない。この表は対象親の代表fixtureを載せたにとどまり、範囲内の各親・条件の網羅確認は未完である。#9の052/054/055はL11:119の名指し対象だが、この表では個別CASE traceを未確認として残す。

034補足：L11 §24 #7のProduct固有meaning返却先はL2-041のProduct Core責務であり、034のscope支持不足・不明の戻し先L2-009とは別条件である。

015のC10–C12におけるOS assignment ownerへの返却は、固定L2-006のOS assignment/実行証拠とWorker選定境界（L2 source lines 57, 113–115）を根拠とし、L2-015単独からownerを導出しない。

## Stage 5 — HELIXLABO-L2-050 1.0 pair 草稿

状態: 本追補はStage 5の `HELIXLABO-L2-050` 一親だけを対象にするL3/L10候補であり、L3承認、実装・実験・運用の許可、完了を生成しない。PO/G0登録 `MPR-RC-HELIXLABO-L2-050-001` の1.0対象を保持する。未承認の他親・他Stageをauthorityやgateにしない。

### HELIXLABO-L2-050 固定意味の対応

|固定条件|現行要件で保つ意味|対応FR/AC|L10根拠|
|---|---|---|---|
|L2-050:300の11段階|Observed → Correlated → Hypothesized → Experimented → Evaluated → Feedback Candidate → OS registration/target routing → target change process → verification → deployment/operation → LABO re-observationをそれぞれ別状態として追う。|FR-01 / AC-01|CASE-01の一つの正常traceで段階をすべて表示|
|L2-050:300,302 identity/未完義務|ticket、experiment、target revision、source/target revision、OS assignment、Worker result、未完義務を結ぶ。|FR-01 / AC-01,03|CASE-01正常、CASE-03a–e/24–28の各binding負例、CASE-16–19/21/30の部分完了主張、CASE-20のchange receipt欠落|
|L2-050:300採択前candidate|採択前はcandidateのまま。candidate数/発行のみでは完了しない。|FR-01 / AC-03|CASE-11,17,21|
|L2-050:300,302 target authority|registration/routingはOS、target change/verification/deployment/operationはtarget owner、evaluation/re-observationはLABO。OS assignmentは実験の依存として扱い、target authorityへ混ぜない。|FR-01 / AC-01,03|CASE-04a/b、CASE-16–19/21|
|L2-050:300,302変更後|変更後のverification、deployment、operation、re-observation、effectとregression評価を未完義務として別々に保つ。|FR-01 / AC-01,03|CASE-03f,13–16,19,20,22,23,30|
|L2-050:300過去記録|同一target identity・ticket・episodeの遅着観測は既存episodeへ追加し、元source recordを上書きしない。|FR-01 / AC-02,03|CASE-02,12|

### LABO-050-FR-01 — 内部改善循環

親: `HELIXLABO-L2-050`、PO/G0登録: `MPR-RC-HELIXLABO-L2-050-001`、`version_target: 1.0`。

入力は許可された観測、episode、experimentと評価済みFeedback candidate。正常循環では上記11段階を順番どおり別状態として記録し、ticket・experiment・対象target revisionを揃え、L2-022のOS assignment観測とL2-028のWorker result観測を結ぶ。各段階のsource/target revisionと未完義務を保持する。出力はOS registration/routing後にtarget ownerが行うtarget change、verification、deployment/operationと、その後LABOが行うre-observationを一つのepisodeへ追跡できる記録である。採択前candidateを正本化せず、過去記録を書き換えない。

LABOはFeedbackの評価・candidate提示・変更後re-observationを担う。Feedbackの登録/routingはOS、target change/verification/deployment/operationはtarget ownerに残る。LABOはOS assignment、registration、target変更を実行せず、候補数・candidate発行・registration・change結果・CI成功だけから循環完了を推定しない。

- `LABO-050-AC-01` 正常: 11段階すべてを独立した状態として表示する。同一ticket/experiment/target revisionのassignmentとWorker result、評価済みFeedback candidate、OS registration/routing、target-owner change/verification/deployment/operation、変更後のLABO re-observationを結び、source/target revisionと未完義務を保持する。effect評価とregression評価を別の判定結果として記録する。CASE-01をこの正常traceに使う。
- `LABO-050-AC-02` 未見正常: 同一target identity・ticket・episodeに属する、許可された後続target revisionの遅着re-observationを追加し、既存source recordを上書きせず、過去と現在のrevisionおよび未完義務を区別する。CASE-02を未見正常例に使う。
- `LABO-050-AC-03` 不成立・責務境界: ticket/experiment/target revision/OS assignment/Worker resultの各欠落・不一致をCASE-03a–e/24–28の単独入力で照合する。OS assignment側のticket/receipt不備は既存OS境界、Worker-resultのexperiment/target binding不成立（CASE-03b/03c/03e/25/26）は実験評価bindingとしてLABOへ戻し、target authority・変更・検証はtarget ownerに残す。registration/target change/verification/deployment/operation/re-observationの各未完、採択前candidateの正本化、過去record上書き、stage順序違反、effectまたはregression評価の欠落、candidate countだけ・Feedback発行だけ・registrationだけ・target changeだけ・CI成功だけ・verificationだけの完了主張も、それぞれの独立CASEで完了に補完しない。OS、target owner、LABOの固定責務区分へ原因別に戻し、新ownerを作らない。

#### 旧source起点と対応

|旧asset / source|保持・再導出する意味|置換・非継承と理由|
|---|---|---|
|`LEGACY-ASSET-02D897E62EF2FA267267` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:43–76,162–196`|source/effect/recurrence evidence、before/after、過去baselineを現在のrevisionと混同しないことを再導出。|旧自律loop、recipe promotion、old terminal/routing機構は移さず、固定L2-050のLABO→OS→target ownerへ置換。|
|`LEGACY-ASSET-0B5B38F146D9538C9A36` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md:20–42`|source欠落/identity不一致、effectとregressionの別評価、単一greenで採択しないfailure境界を設計材料にする。|旧HAT/HIA実行、命令、runtime、failure codeは移植・実行しない。|
|`LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:154–156,237–242`|HAC-P4-02aの条件「repairが成功し再発防止が明確」なら、その修復単位をcloseしrecipeをharness memoryとimprovement backlogへ保存する。反復時のgate/detector/backlog候補化とP4 metricsの改善候補化も保持点として扱う。|旧unit repairのclose/recipe保存と固定050の全循環完了を分離する。後者はtarget変更後の再観測とeffect/regression評価がないと未完了。旧close・memory runtimeは移植せず、既存のLABO評価、OS登録/routing、target ownerの変更/検証境界へ再導出する。|
|`LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:33–83`|observable FR/ACと責務/失敗条件を対にする構成を再導出。|旧HR/HAC IDや旧system operationを現行ID/ownerとして流用しない。|
|`LEGACY-ASSET-FA8C6E69463183D6A19B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:31–56`|paired scenario / observable / negative を結ぶ読み方だけを再導出。|旧CI実行・旧oracle passを新しい合格根拠にしない。|
|UIL-AC-020（LEGACY-ASSET-0B5B38F146D9538C9A36:39）|state order/HEAD/baseline/scope照合とstage skip・別candidate証拠混載の拒否を保持し、固定L2-050の順序・同一identityへ再導出する。|旧state machine/runtime/controlや旧stage固有gateは移植しない。|
|HAC-HIL-02b（LEGACY-ASSET-C7F0C3B79CBAA72960BF:65）|transition/edge欠落の拒否を旧要件側の条件として記録し、固定L2-050の段階順序へ再導出する。|旧runtime/controlは移植しない。|
|HAT-HIL-02（LEGACY-ASSET-FA8C6E69463183D6A19B:34）|HAC-HIL-02a/b/cを参照するpaired consumerの該当範囲を隣接資料として記録する。|HAC-HIL-02bの要件定義はC7F0 assetの65行を参照し、旧budget/checkpoint/実行oracleは移植しない。|

#### L10 CASE索引との対応

`CASE-03g` は同時欠落案を示す非独立ラベルとして保持し、現行fixtureや索引先を持たない。`CASE-10` は既存識別子を保ち、effect-only `CASE-22` と regression-only `CASE-23` の両fixtureを直接参照する。`CASE-07/08/09`も対応先を明示した非独立索引として保持し、これらを追加negativeとして数えない。先行snapshotは[a4a365dcdfe824ebb28d040c8bc3bc924556efad](https://github.com/RetryYN/HELIX-HARNESS/blob/a4a365dcdfe824ebb28d040c8bc3bc924556efad/docs/governance/audits/requirements-stage/labo-stage5-review04-root-correction-2026-10-06.md)であり、その本文SHA-256は`23c30525763520ff05c41e5da2997cd2ef3604b5ef738d6559fc3981f5776f91`。これは履歴上の参照であり、現在のfixture分類は本本文の定義に従う。


### LABO-059-FR-01 — 効果優先関係付き比較評価

親: HELIXLABO-L2-059、PO/G0対象 MPR-RC-HELIXLABO-L2-059-002、version_target 1.0、unit。以下は未承認のL3候補であり、実験・実装・運用許可や実測結果を生成しない。固定L2 source revision f6dad2a33e24f000b87d7f09b8d40288257e74cc の固定条件を対象とする。L2本文が示すdraft_candidate状態と、PO/G0が同revisionを採択対象として登録した記録を区別する。

同じtask/work scope、要求・受入・quality oracleのidentity/revision、対象期間、実験条件、scorer、run protocol、hardware/toolchain classを選択比較の中で対応づける。baseline/current/candidate/hybridは実験条件の軸、HELIXなし/旧版/新版は支援cohortの軸として分け、比較目的が求める群だけを選ぶ。未選択群を必須にせず、証拠がない主張だけを未測定/比較不能にする。旧版cohortを選択した場合は保存済みの当時receiptを読むだけで、旧runtime等を実行しない。

品質oracleとtask acceptanceを先に個別判定し、適用scope/revisionで有効な既決priority/toleranceを再利用する。毎runの再確認を要求せず、決定が未決・失効または適用境界外の場合に限り既存decision ownerへ返す。品質不成立は価格/速度で相殺しない。費用にはprovider/API/token、Worker/parent effort、retry、CI/rerun、review、救援、integration、rollback/recovery、reworkと人の作業を範囲に従い含める。費目ごとのreceipt、価格source/currency/effective time/classを保つ。人間時間・介入量は貨幣費用と別掲し、未承認換算をしない。開始/終了event、停止/待機規則の異なるdurationを黙って比較しない。

出力は選択cohortごとのquality/acceptance結果、cost内訳、elapsed time、人介入/Worker effort、欠測・未価格化・比較不能、同順位/判定不能/要人判断を分けて示す。万能rankingを作らない。LABOはWorker/effortの選択・assignment、登録/routing、ticket起票、target変更、permission/merge authority変更をしない。

| 固定条件 | L3で保つ意味 | 対AC | 既存/追加L10根拠 |
|---|---|---|---|
| L2-059:420、L11:170 | 同一task/work scope、要求/受入/oracle revision、対象期間、scorer/run condition、OS receiptを選択比較に束縛する。task revision、source revision、requirement revision、acceptance-oracle revisionを別fieldとして照合する。 | AC-01/03 | CASE-01/02、03a/b/i、10–14、51、57–62、71–72 |
| L2-059:420/426、L11:170/173–175 | 実験条件とcohortを別軸にし、目的別に二群/三群を選ぶ。未選択群を必須化しない。 | AC-01/02/03 | CASE-01/02、03h/i、15、21、50 |
| L2-059:420/429、L11:170/173/176 | 現行OS割当とhistorical当時のactor/authority/receiptを保ち、assignmentを後付けしない。 | AC-01/03 | CASE-01、16、51 |
| L2-059:421–422、L11:170/173–175 | oracle別のquality/acceptance出力、同順位/比較不能、品質先行、適用可能な既決priorityの再利用。 | AC-01/02/03 | CASE-01/02、03b–d、05–08、48–49 |
| L2-059:423–424、L11:170/173–174 | receipt付き全費目、人時間数量、duration定義、accepted outcome/未完状態を分離する。 | AC-01/03 | CASE-01、03e/f/m/g/j–l、17–20、22–30、37、39–56 |
| L2-059:425/427 | LABOはeffort/Workerを選ばず、source identity/version/digestと依存契約を保持する。 | AC-01/03 | CASE-01、04a、14、38、57–62、71–72 |
| L2-059:428–429 | 保証限界と変更禁止を保ち、欠落原因別に既存戻し先を使う。 | AC-03 | CASE-03a–l/m、04a/b、31–32、37、48–72 |

- LABO-059-AC-01 正常: 選択目的に必要な比較群と同一条件、適用可能なquality oracle/既決decision、OS assignment/実験結果receiptを対応づけ、quality、acceptance、cost、time、人介入、effortと比較不能項目を別々に返す。有効decisionは同scope内で再利用する。
- LABO-059-AC-02 未見正常: 条件が選択scope内で適用可能な未見taskでも、選択した群の証拠を保って比較する。未選択群の欠落で選択済み比較を拒否しない。未見taskへの一般化は主張しない。
- LABO-059-AC-03 不成立・戻し先: 条件/receipt/identity/revisionの欠落や不一致、品質未達の相殺、cost/time/human quantityの欠落、未完runの成功化、過去結果のcurrent化、scope外claim、LABOによるauthority副作用を独立oracleで拒否する。task revision（CASE-14）とsource revision（既存CASE-58）、requirement revision（CASE-71）、acceptance-oracle revision（CASE-72）を別fieldとして照合する。task/source側の不一致は既存OSまたは観測sourceへ、requirement/acceptance-oracle側の不一致は既存HARNESS/要求ownerへ戻す。個別source/owner identityが特定できない場合はunknownを保つ（L10 CASE-14/58/71/72）。その他の戻し先もL2-059:429に明記された原因別既存source区分へ限定し、未特定ならunknownを保つ。

#### 旧source起点と対応

| 旧役割 | 旧asset/path・span | 保持/再導出 | 非継承 |
|---|---|---|---|
| 直接要件 R-03..08 | LEGACY-ASSET-28FB139B26CD61CC51EE、archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76–94,96–119,121–126,128–135,137–141,143–147 | R-03のteam/harness軸分離・provider/model固定加減点禁止、R-04 snapshot、R-05 protocol、R-06 evidence/counterevidence、R-07 cost/capacity/provenance、R-08 integrity/historyを固定L2-059へ再導出。 | 固定順位、scorer weight、旧runtime/CI、admissionを移さない。R-03のlabelと実model identityを混ぜない。 |
| paired acceptance consumer | LEGACY-ASSET-A952A3A175EB82A4781B、archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30–40 | R-03〜08の識別可能な反例/acceptance読み方を対応づける。 | acceptance行を直接要件sourceと取り違えない。 |
| related requirement | LEGACY-ASSET-50CA1C554747F12266D3、resident-lane-orchestration-requirements.md:663–666 | task-class別effort・未評価表示・scoreから権限を作らない既存意味を関連根拠として使う。 | Bench R-03〜08の本文sourceではない。 |
| paired acceptance consumer | LEGACY-ASSET-437A6A68F9A9E0AE1B、resident-lane-orchestration-acceptance.md:43 | 上記RLO要件のacceptance consumerとして区別する。 | 059への直接要件sourceではない。 |
| related worker contract | LEGACY-ASSET-9114D4E463E95B67DD0C、worker-common-contract.md:61–62,130–131 | 共通Worker契約の関係範囲を確認する。 | 固定L2-059の比較意味・ownerを上書きしない。 |
| separate three-lane scope | LEGACY-ASSET-A6926200F28B26300432、three-lane-cloud-governance-requests.md:67–69; LEGACY-ASSET-A26561A0EF7396D8F017、three-lane-cloud-governance-requirements.md:78–79; LEGACY-ASSET-E9D6CA411D75485A0984、three-lane-cloud-governance-acceptance.md:44–47 | 別L1/qualification candidateとそのcontext/consumerとして区別する。 | 059からadmission・qualification lifecycleを新設/必須化しない。 |


## Stage 5 — HELIXLABO-L2-060 支援有無の同一設定比較

親: `HELIXLABO-L2-060`、PO登録 `MPR-RC-HELIXLABO-L2-060-002`、`version_target: 1.0`、`unit`。対象は固定採択revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の一親だけ。以下はL3/L10候補であり、実測、実験実行、Worker割当、採用判断、受入、実装・運用許可を生成しない。L2本文のdraft metadataと、POが対象revisionを採択した事実は別の状態として扱う。

`HELIXLABO-L2-060` は、同じtask/scope/oracleと同じ元Worker/model/provider/version/effortの下で、選択した作業中支援経路の利用有無だけが異なる比較結果を評価する。支援を実行・割当する能力ではなく、効果・品質・費用・人介入を記録する評価能力である。HELIXLABO-L2-059の比較・全費用原則を再利用し、重複所有しない。

| 固定source | 保つ条件 | 対応ACとL10 | 適用区分 |
|---|---|---|---|
| L2:445–449、L11:180–182 | task/scope/oracle、環境・protocolと元Worker設定をarm間で一致させる。支援だけで品質不成立を相殺しない。支援側の追加model/provider/上位Worker/effortは支援の測定対象として費用・時間と共に保持する。 | AC-01/03、CASE-01/03a/05/06/07/09/10/11/18 | 常時の比較条件。支援追加resource自体は禁止しない。 |
| L2:446–447/449、L11:180–181/184 | OS assignment/result receipt、source/use、review/test、retry/rework/CI/review、追加支援と人の時間・費用、価格source/currency/effective timeを条件に応じて対応づける。 | AC-01/02/03、CASE-01/02/03d/e/12–17/20–25/33–45 | receipt/費用は該当run・選択項目の証拠。既知の人時間量を換算率不明だけで消去しない。 |
| L2:448/451/453、L11:181/183 | 支援あり/なしの選択経路とgroup leakageを分け、未選択consult/sourceを実行依存にしない。OS-028相談receiptは実相談を選ぶ場合だけ、OS-029は完了したcomposite roundtripを評価対象として選ぶ場合だけ使う。 | AC-01/02/03、CASE-01/02/03b/19/26–28/43 | 選択時依存。未選択経路は非必須。 |
| L2:449–454、L11:182–185 | 新runの適用OS assignment・必要なSECURITY許可、事前固定HARNESS-L2-022 oracle、原因別の既存戻し先、unknown/unassessedを保持する。 | AC-01/02/03、CASE-01/02/03c/34–38/46 | assignment/許可は新runで該当する場合。片群receiptまたは適用oracleが欠ければ比較成立としない。 |

### LABO-060-AC-01 — 正常候補

合成givenとして、固定L11:181の `PATCH /applications/{id}` oracleを使う。対応する二runは同じtask snapshot、scope、対象revision、environment/toolchain/protocol、元Worker/model identityとmodel/provider/version/effort、開始前に固定したHARNESS-L2-022 oracleを持つ。両runで `draft` 編集は受理し、`approved` 編集は拒否され保存値を変えない。対応OS assignment/result receiptsと、選択した支援source/useの記録を与える。新しいrunのfixtureなら該当OS assignmentとSECURITY許可もgivenに置く。支援側のみINTELLIGENCEの設計/validator/regression sourceと相談・修正指示を選び、元Workerが作業する。独立reviewerは元WorkerとINTELLIGENCE支援者のいずれともidentity/context/authorityを区別する。必要なconsultation receiptはconsultを選んだ当該runだけに付す。支援に伴う追加model/provider、上位Worker、retry/review、相談、人の調査・修正・確認時間と実費は省略しない。両runの結果receiptを同じoracleで照合する。この合成fixtureは実測済みrunの主張ではない。

### LABO-060-AC-02 — 未見正常候補

未見taskの合成givenでも、task/scope/対象revision/environment/protocol、元Worker/model/provider/version/effort、当該taskの事前oracle、対応する両群のOS assignment/result receiptを揃え、支援経路の選択有無だけを比較する。選択したsupport source/consult/compositeだけを記録し、未選択経路を必須化しない。unknown/missingなreceiptを正常fixtureへ混ぜず、一taskの結果を一般有効性へ拡張しない。これも実測済みrunの主張ではない。

### LABO-060-AC-03 — 不成立・既存責務への返却

L10に置く一項目変異候補を個別に照合し、単一点性は独立reviewで確認する。群間で元Worker設定が異なる比較、対照側への助言漏れ、oracle/task/scope/protocol不一致、選択証拠・assignment・receipt・費用の欠落、failed/unknown runの除外、未価格人時間の0円化、品質不成立の費用相殺、LABOによるrun/assignment生成は成功比較にしない。比較出力は比較可能性・quality・効果evidenceに限り、比較結果からINTELLIGENCEのproposal・推奨、採用判断、Worker配置水準、受入authority、merge authorityをLABOが決める誤出力を拒否する。評価材料と既存proposal/assignment/authority参照は保持し、正当な材料返却を拒否しない。選択支援proposal/use sourceの欠落はINTELLIGENCE、OS handoff/assignment/result receiptの欠落はOS、oracleの適用・契約不足はHARNESS/requirement owner、必要なdata-use/実行permissionはSECURITY、比較scope/evaluation capabilityはLABOへ原因別に返す。固定sourceでownerを識別できないfieldはunknownを保持し、ownerを創作しない。非独立indexは指定した完全IDの主fixtureを指し、独立fixture・negative分母へ重ねない。

#### 旧source起点と差分

| 旧役割 | 旧asset/path・span | 保持・再導出 | 置換・非継承 |
|---|---|---|---|
| 支援loopの直接行動祖先（同一設定の支援有無比較要件そのものではない） | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:147` HR-FR-P2-04。paired acceptance atomは同asset:224 HAC-P2-04b。 | test/oracle→実装/相談→review/指示→修正loop、相談pendingと完了authority境界を意味起点として再導出。 | 旧段階/agent/runtime、harness DB trace、CLI、budgetやapproval markerは移さない。支援有無の同条件効果比較はPO採択L2-060で具体化した差分。 |
| 旧consumer | `LEGACY-ASSET-44DD86E3DEC09E65EF51` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:104` HAT-P2-04。`LEGACY-ASSET-20B1CF42FF88724DE8AD` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-pillar-unit-test-design.md:49` HU-PILLAR-P2-04。 | 旧要件と対応consumerの関係を識別する。 | 旧test/runtime/CIの実行結果を新acceptance evidenceにしない。 |
| 関連比較手法sourceとpaired consumer | `LEGACY-ASSET-28FB139B26CD61CC51EE` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76–147` R-03..08。consumer `LEGACY-ASSET-A952A3A175EB82A4781B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30–41` AC-003..014。 | 比較軸、task/oracle/protocol、receipt、quality非相殺、cost/provenance/historyを評価方法の関連材料として再導出。 | 同一支援有無の直接要件sourceではない。旧固定provider加点、accepted-change denominator、admission、runtime/CIを移さない。 |
| 関連effort要件とconsumer | `LEGACY-ASSET-50CA1C554747F12266D3` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:659–666` RLO-FR-040。consumer `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43` RLO-AC-030。 | effort evidence、未評価表示、score単独でauthority変更しない意味を関連根拠とする。 | 060はeffortを比較条件/測定fieldとして扱い、旧defaultを実測値・assignmentとして流用しない。 |
| 関連Worker benchmark要件・paired consumers | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:61–62,130–131` WCC-FR-07/08、WCC-AC-04/05。consumer `LEGACY-ASSET-C6ADB99F1353965C5449` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:29–30,36` HAT-WCC-01/02/08。 | blind comparisonと重大failure非相殺は比較方法の関連材料。 | worker admission/retirement、blind score authorityを060へ足さない。限定検索では同一元Worker設定のsupport/no-support直接要件を特定していないが、archive全体の不在は主張しない。 |
| 関連詳細設計/Worker budget（G19 derivationで参照された資料） | `LEGACY-ASSET-1D32912A9A194FEAA7DE` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/harness-agent-lifecycle.md:34–303`、`LEGACY-ASSET-D4E9C31E6AE7D18CA11D` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/harness-agent-lifecycle.md:27–359`、`LEGACY-ASSET-15D88CCE539AA79ED788` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/worker-budget-lifecycle.md:9–55`。 | support actor/lifecycle/effort contextとして役割を区別し、fixed L2-060の同条件比較と費用・時間表示へ必要部分だけ再導出する。 | 旧registry/runtime/adapter/process implementation/worker-budget enforcementを移植せず、L2-060の比較要件sourceや実測値と扱わない。 |


限定された旧source検索範囲は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/` と `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/`。検索語は `worker.*support`、`support.*worker`、`assistance`、`assisted`、`unassisted`、`same.*configuration`、`same.*setting`、「支援有無」、「同一設定」。この範囲では同一元Worker設定で支援有無だけを比較する直接要件source identityを同定していない。archive全体に存在しないとは主張しない。

#### CASE inventoryと固定source trace

現在のCASE定義IDは57件（正常候補2、negative候補47、非独立索引候補8）。単一点性・独立性は独立review未確認であり、ID数や一意性は完全性の証明ではない。L10行はoracleの固定source意味を代替しない。全定義: `L10-LABO-060-CASE-01`, `L10-LABO-060-CASE-02`, `L10-LABO-060-CASE-03a`, `L10-LABO-060-CASE-03b`, `L10-LABO-060-CASE-03c`, `L10-LABO-060-CASE-03d`, `L10-LABO-060-CASE-03e`, `L10-LABO-060-CASE-04a`, `L10-LABO-060-CASE-04b`, `L10-LABO-060-CASE-05`, `L10-LABO-060-CASE-06`, `L10-LABO-060-CASE-07`, `L10-LABO-060-CASE-08`, `L10-LABO-060-CASE-09`, `L10-LABO-060-CASE-10`, `L10-LABO-060-CASE-11`, `L10-LABO-060-CASE-12`, `L10-LABO-060-CASE-13`, `L10-LABO-060-CASE-14`, `L10-LABO-060-CASE-15`, `L10-LABO-060-CASE-16`, `L10-LABO-060-CASE-17`, `L10-LABO-060-CASE-18`, `L10-LABO-060-CASE-19`, `L10-LABO-060-CASE-20`, `L10-LABO-060-CASE-21`, `L10-LABO-060-CASE-22`, `L10-LABO-060-CASE-23`, `L10-LABO-060-CASE-24`, `L10-LABO-060-CASE-25`, `L10-LABO-060-CASE-26`, `L10-LABO-060-CASE-27`, `L10-LABO-060-CASE-28`, `L10-LABO-060-CASE-29`, `L10-LABO-060-CASE-30`, `L10-LABO-060-CASE-31`, `L10-LABO-060-CASE-32`, `L10-LABO-060-CASE-33`, `L10-LABO-060-CASE-34`, `L10-LABO-060-CASE-35`, `L10-LABO-060-CASE-36`, `L10-LABO-060-CASE-37`, `L10-LABO-060-CASE-38`, `L10-LABO-060-CASE-39`, `L10-LABO-060-CASE-40`, `L10-LABO-060-CASE-41`, `L10-LABO-060-CASE-42`, `L10-LABO-060-CASE-43`, `L10-LABO-060-CASE-44`, `L10-LABO-060-CASE-45`, `L10-LABO-060-CASE-46`, `L10-LABO-060-CASE-47`, `L10-LABO-060-CASE-48`, `L10-LABO-060-CASE-49`, `L10-LABO-060-CASE-50`, `L10-LABO-060-CASE-51`, `L10-LABO-060-CASE-52`.

| L10対応条件 | 固定根拠 | fixture |
|---|---|---|
| 同一task/scope/oracle・元Worker設定、支援有無のみを比較 | L2:445–449、L11:180–182 | AC-01/03、CASE-01/03a/05–11 |
| 選択した支援経路、control leakage、consult/composite選択依存 | L2:448/451/453、L11:181/183 | AC-01/02/03、CASE-01/02/03b/19/26–28/43 |
| receipt、費用・人時間・unknown、quality非相殺 | L2:446–449/454、L11:181–184 | AC-01/02/03、CASE-01/02/03d/e/12–17/18/20–25/33–45 |
| 事前HARNESS oracle、OS assignment、原因別owner、scope/権限境界 | L2:449–454、L11:181–185 | AC-01/02/03、CASE-01/02/03c/04a/b/34–38/46 |
| 評価材料から判断・authorityを生成しない | 固定L2-060「提供するもの」「保証すること」、固定L11-060「結果・責務境界」 | AC-03、CASE-47–52（各誤出力を別fixtureで照合） |

## Stage 5 — HELIXLABO-L2-061 比較task・oracle境界と履歴

状態: `HELIXLABO-L2-061`、PO採択行 `MPR-RC-HELIXLABO-L2-061-001`、`version_target: 1.0` のL3/L10候補。採択根拠はPO決定basisと固定L2/L11をそれぞれ参照し、現行登録metadataだけから要求意味を生成しない。ここでは比較対象の契約、可視範囲、当時の履歴、評価上の不成立を扱う。LABOはtaskを作成・変更せず、Worker/judgeを割当せず、実行・permission・qualification・admission・採用判断を生成しない。

| 固定要件句 | 親source | 機能境界 / trace |
|---|---|---|
| 既存059比較の選択taskに、15条件をfieldごとに結び、該当する実context・runを追跡する | L2-061:457–463; L11-061:205–208 | `LABO-061-AC-01`, `LABO-061-AC-03`; 選択taskのtask/fixture/oracle/protocol/scorer identity・version・digest、worker-visible context、author/judge、actor/authority、receiptを分ける。 |
| secret・future answer・hidden oracle等がWorker-visible contextへ漏れた比較を有効扱いしない | L2-061:461–464; L11-061:208–210 | `LABO-061-AC-03`; 情報漏洩の判定・permissionはSECURITY、識別可能な入力sourceはその既存ownerへ返す。 |
| author/judgeのidentity・session・context分離と、judgeが使うoracleをWorker漏洩と混同しない | L2-061:462–465; L11-061:209–211 | `LABO-061-AC-01/03`; 役割/可視範囲を区別し、盲検成立・任命をLABOが生成しない。 |
| selected taskに限ってsnapshot fieldを照合し、055通常履歴や未選択sourceへ一律適用しない | L2-061:465–467; L11-061:211–213 | `LABO-061-AC-02/03`; 適用scopeを選択taskへ束ね、非適用根拠のある通常履歴はfield欠落へ変換しない。 |
| failed/invalid/historical evidenceを保持し、別run・current値で補わず、score/receiptからauthorityを作らない | L2-061:467–469; L11-061:213–215 | `LABO-061-AC-03`; task/oracle条件はその既存owner、漏洩はSECURITYと識別可能なsource owner、実行context/assignment/receiptは実行主体へ返す。個人・source identity不明はidentity unknownを維持する。 |

### LABO-061-AC-01 — 選択taskの正常比較

合成givenとして、選択task snapshotにtask ID/version、fixture digest、requirement/acceptance IDs、base HEAD、allowed/forbidden paths、hidden-oracle digest（適用時）、seed、toolchain versions、timeout/retry/cache policy、hardware classを個別fieldで結ぶ。task/protocol/scorer/oracleの対象revisionとscope、実際のWorker-visible context参照、benchmark authorと独立judgeのidentity・session・context、judgeへ渡したoracle、run actor/authority/receiptを保持する。全fieldが選択taskへ適用され、証拠が一致する場合だけその比較範囲のtask/evidence対応を返す。judgeがoracleを使うこと自体はWorkerへの漏洩ではない。合成例であり、実測、実験実行、採択・任命の証拠ではない。

### LABO-061-AC-02 — 未見正常と非適用対照

別の未見fixtureでも同じ選択task契約へ結び、適用fieldだけを照合する。055通常履歴のようにtask snapshotが非適用である根拠が入力にある場合は、その非適用理由を保持し、15 field欠落やblind評価失敗として数えない。適用性が未確定ならunknownを返す。未選択task/sourceは参照のみで、実行依存へ昇格しない。

### LABO-061-AC-03 — 不成立、履歴と責務境界

L10の各単独fixtureを用い、値を推測・currentから補完せず、missing field、value unknown、stale、revision mismatch、選択scope違いを区別する。Worker-visible漏洩を含むrunは比較不適格のまま保持しSECURITYへ戻す。historical runの当時model/runtime/toolchain/actor/version/authority evidenceは各々保存し、欠落をcurrent stateで埋めない。failed/invalid runを削除・平均点・低費用・短時間で相殺しない。receipt・score・比較結果からOS assignment、permission、admission、judge任命、qualificationを生成しない。正当な材料・既存状態は保持する。

#### 旧sourceからの再導出

`LEGACY-ASSET-28FB139B26CD61CC51EE` の `helix-bench-evaluation.md` R-04/R-08と `LEGACY-ASSET-A952A3A175EB82A4781B` の対応acceptance AC005/006/012/013を、task snapshot、当時条件、反例・履歴保持の起点として再導出する。旧文字列schema、runtime、test、CI、閉ループ、資格・permission・admissionの仕組みは移さない。旧consumerは対応検証の読み方であり、直接要件sourceとは区別する。旧a4本文で存在した132定義はIDを保持して本L10へ移し、機械的ID保持を独立fixture性・完全性の証明とはしない。


## Stage 5 — HELIXLABO-L2-063 修復再発評価と予防候補

状態: `MPR-RC-HELIXLABO-L2-063-001` のPO判断では親063が採択され、対象版は `1.0`。固定L2本文の「未採択候補」という旧記述はそのsource literalとして保持し、この追補から別の承認手続きや実行許可を生成しない。G0 `sequence_stage: Stage 5` は順序metadataである。

LABOは、許可された修復観測と既存の評価記録から、成功修復知識、原因・適用条件・版が一致する再発、予防候補、未完義務を評価して保持する。修復の実行とOS登録/routingはOS、検証契約と実行結果はHARNESS、対象変更の採否・実行・運用後観測は既存の対象ownerに残す。INTELLIGENCEの案、OS assignment/Worker実行、HARNESS verification、LABO effectiveness evaluationを同一状態へ畳まない。候補、OS登録、対象ownerの採用、変更、再検証、運用後の再観測を別々に追跡し、いずれからも完了・authority・実行permissionを生成しない。

| 固定sourceの句 | trace先 | 条件と境界 |
|---|---|---|
| L2-063:483 入力field、source/evidence | `LABO-063-AC-01/03` | 対象/版、原因候補、適用条件、修復手順・結果、検証、反例を元episodeへ結ぶ。案や単独greenで成功としない。 |
| L2-063:484 recipe・適用scope・原証拠・残義務の保持とOS Feedback登録 | `LABO-063-AC-01/03` | 知識評価・保持はLABO、既存Feedbackでの登録/routingはOS。修復作業終了だけでどちらも完了しない。 |
| L2-063:485 同種反復、同一性、閾値/観測範囲 | `LABO-063-AC-01/03` | 問題・手順・適用条件・版・episodeを照合し、再送/重複観測を重ねず、異なる原因/条件を混ぜない。閾値と母集団は入力であり、新数値を定めない。unknownを0としない。 |
| L2-063:486 gate/detector候補と未処理warning | `LABO-063-AC-01/03` | 根拠付き候補とwarningを可視化する。LABOは直接有効化・強制しない。 |
| L2-063:487 既存依存と必要時のOS割当/HARNESS検証 | `LABO-063-AC-01/03` | 過去履歴の評価に新規repairを要求しない。再実験・修正を選んだ場合のみ既存OS assignmentとHARNESS契約を使う。特定知識を無条件にBRAINへ一般化しない。 |
| L2-063:488 原因別戻し先と版変更後の再評価 | `LABO-063-AC-03` | 観測/target版不足は観測提供主体、修復成功/再発防止根拠不足はLABO評価、登録/routing不成立はOS、verification不足はHARNESSへ。source identityが固定sourceから分からない場合はunknownを保つ。 |
| L11-063:228 成功手順、独立検証、候補、根拠、未処理warning | `LABO-063-AC-01/02/03` | 同種性・閾値根拠・母集団・反例を添える。未見eventは別evidenceとして追跡し、条件の異なる群へ一般化しない。 |
| L11-063:229 個別反例 | `LABO-063-AC-03` | 以下L10定義の入力変異とoracleで照合する。CASE数・索引・列挙は意味の完全性を証明しない。 |
| L11-063:230 未見、版変更、未完義務 | `LABO-063-AC-02/03` | cause/applicabilityが違えば同種と断定しない。旧成功を改版後へ流用せず、登録失敗、変更未完、運用後観測欠落を分けて保持する。 |
| L11-063:231 知識・authorityの境界 | `LABO-063-AC-03` | LABO知識評価、OS登録/routing、対象ownerの採否/変更を区別し、memory正本化、未評価BRAIN一般化、頻度由来の権限生成を拒否する。 |

#### LABO-063受入条件

- **LABO-063-AC-01 — 正常評価と系譜保持**：許可された修復観測について、対象/target revision、問題・原因候補・適用条件、修復手順/結果、HARNESS検証、再発・反例、episodeをsourceへ結んで保持する。根拠のある同種反復と既決の閾値/母集団から予防candidateを評価し、LABO知識保持、OS Feedback登録/routing、target ownerの採否/変更、HARNESS検証、運用後観測/effect評価をそれぞれ既存主体のsource-bound状態として区別する。正常例は合成fixtureであり、実行やauthorityを生成しない。対応CASE: 01/05/07/10/67。
- **LABO-063-AC-02 — 未見・unknown・未完保持**：原因/適用条件/target revisionまたは母集団/閾値がunknown、変更後の再評価や後続義務が未完の場合、既存の成功/頻度を補完せずunknown/openを保持する。過去の評価だけを理由に新規repair/OS assignmentを要求せず、未見eventを根拠なしに別scopeへ一般化しない。対応CASE: 02/68。改版・staleを変異させるCASE12/27/40/59は、CASE表の対応ACどおりAC-03のnegative oracleであり、AC-02のnormative fixture IDには重ねない。
- **LABO-063-AC-03 — 不成立・固定責務へ返却**：単独の欠落/stale/mismatch、重複、根拠不足、またはLABOが正本化・gate強制・authority/assignmentを生成する変異を拒否する。観測または対象版の不足は既存の観測提供主体へ、修復成功/再発防止根拠の不足はLABO評価へ、Feedback登録/routing不成立はOSへ、verification不足はHARNESSへ返す。変更後の運用観測が欠ける場合は循環を未完としてLABO評価に保持する。source/owner identityが特定できなければunknownを保ち、新ownerを作らない。対応CASE: 03a–d/04a–b/06/08/09/11–66。


### 旧source起点、保持と差分

| 役割 | 旧asset / path / span | 再利用・再導出 | 置換・非継承 |
|---|---|---|---|
| 直接旧要件source `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | baseline `6fabd12512a3659fff4a956692cdd61faeeb16ce:docs/design/helix/L3-requirements/pillar-functional-requirements.md` HR-FR-P4-02:149, HAC-P4-02a/b:230–231; pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a` 同path:155,239–240; archived snapshot `a4a365dcdfe824ebb28d040c8bc3bc924556efad:archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`:154–156,237–240. 3 selected atoms byte-identical. | 成功repair recipeと再発防止が明確なrepair単位でrecipeを保持し、improvement backlogへ残す。閾値を満たす同種repairはgate/detector candidateとwarningへつなぐ。 | 旧 `close` は旧repair単位のknowledge/backlog保存であり、現063全循環の効果再評価・登録・target change・verification・post-observation完了を意味しない。旧doctor/memory runtimeは移さない。 |
| 対応するpaired acceptance consumer `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:112` HAT-P4-02 | HR-FR-P4-02/HAC-P4-02a/bの対応consumerとして、recipe retentionとbacklog/promotionの検証意図を読む。 | 旧test実行やpassを現行evidenceにしない。 |
| 関連する別系列UIL requirement `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:175–181` UIL-R-11、:183–187 UIL-R-12、:210–220 state sequence | 複数episode、scope、counterexample、mutation、version/applicability/expiry/rollbackを含むcandidate境界と、採択後の同一invariant/finding/scope/windowへの再発・効果消失の因果接続を関連sourceとして参照する。 | P4-02の直接要件や同一ownerとして重複計上せず、human review境界、固定閾値、別baseline/state machineを063へ新設しない。 |
| 関連UIL acceptance consumer `LEGACY-ASSET-0B5B38F146D9538C9A36` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md:36–37` UIL-AC-017/018 | UIL-R-11/12のconsumer。P4 paired consumerとは別系列の関連検証source。 | 未実行の旧受入設計は新test実行の証拠ではない。 |
| 知識責務の判断 | `docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md` HMC-BR-003（`a2638477be294880ba33e215778a763caacfa6ee`） | 1.0〜2.xはLABOが評価・保持し、3.0からIntelligenceが改善に使うという区分を保持する。 | 旧Learning/Skill authority、provider標準memoryを復活させない。 |

限定したsource範囲のほか、archive全体の不在・網羅は主張しない。旧runtime/test/CIは参照のみで実行していない。

#### CASE/AC trace索引

L10の69件の定義は既存旧IDの保持と追跡索引である。literal上の分類候補は正常5、negative 53、索引11で、意味的独立性・完全性の認定ではない。索引IDは `L10-LABO-063-CASE-03a`, `L10-LABO-063-CASE-24`, `L10-LABO-063-CASE-25`, `L10-LABO-063-CASE-30`, `L10-LABO-063-CASE-31`, `L10-LABO-063-CASE-32`, `L10-LABO-063-CASE-33`, `L10-LABO-063-CASE-35`, `L10-LABO-063-CASE-36`, `L10-LABO-063-CASE-39`, `L10-LABO-063-CASE-63`。索引は示された主fixtureを参照し、独立fixture/negative分母として重ねない。`L10-LABO-063-CASE-58`は`L10-LABO-063-CASE-13`と同じ運用後観測欠落の旧軸を保持し、今回固定された観測提供主体への返却とidentity unknown保持を明示する。既存IDの保持や本索引だけでCASEの一変異性・完全性を主張しない。

### HELIXLABO-L2-065 — 選択qualification scopeとtask scorecard（1.0候補）

**根拠と起点**：固定L2-065（0dd946cec1c3fca8e144513b72e2e10d16c7c9c3、L2:503–516、span SHA-256 `6f50887b94a8d3341c55700393896798cc1273324a868071447bf0e5a95cf019`）と固定L11-065（同revision、L11:241–259、span SHA-256 `c70905fd036f0c6e6bfdce0368e462cd85acd467354bcad599d1112634d9b1b6`）を具体化する。旧HIL-FR-61/62とHIL-NFR-35の保持・再導出・置換は末尾の対応記録に示す。

- **FR-LABO-065-01 — 選択資格scope**：明示的に選ばれたcandidate-runtime資格scopeについて、比較目的、runtime/model/version、task・scope・revision、許可されたfixture集合とrevision、oracle・rubric/scorerのidentityと版、評価者の独立性・可視context、対応するOS assignment/run receiptを一つのscopeへ結び付ける。資格scopeが選ばれていない通常Worker作業にはfull benchを課さない。
- **FR-LABO-065-02 — smokeとfull-bench**：machine smokeとblind full-benchを別結果として記録する。full-benchとして報告する場合、correctness、mutation kill、instruction/scope following、skill A/B、quality、concision、security、second-diff extensibilityの8軸を、同一scope内のfixture集合・revision、rubric/scorer revision、oracleと判定結果へ個別に結ぶ。必要軸または同一性証拠が欠ける場合は未完・未評価とし、資格済みにしない。hidden answerをWorker-visible contextへ含めず、candidate名のblind条件とauthor/judge分離をそのscopeで確認する。
- **FR-LABO-065-03 — task scorecard**：HELIX実taskごとに、task/scope/revision、assignment・attempt・result receiptとともに`first_pass`、`retry_count`、`proposal_diff_size`、`lint_violation_count`、quality-judge結果、effective costを記録する。`first_pass`はPO固定行83が定める「最初のAttempt」の適用oracle結果、`retry_count`はそのAttempt後の同一task scope内の再試行数とする。retry後の成功で初回結果を上書きしない。
- **FR-LABO-065-04 — 適用外と未観測**：diff/lint指標を選択scopeへ適用しない場合は根拠を残す。適用対象だが値・定義・版・receiptが得られない場合は`unknown`を保持する。実測値0は根拠付き0として保持する。unknown、適用外、未観測を0へ置き換えない。
- **FR-LABO-065-05 — 品質・費用・比較**：qualityは採択済みL2-059の品質gate、effective costは同候補が定めるretry・救援・rework・CI・review・人修正を含む費用境界と既存の価格source/currency/effective timeに従う。品質・security・scope逸脱・検証不能を価格、所要時間または平均scoreで相殺しない。trend/failure findingは同じtask class、scope、測定定義、revisionで比較可能な記録に限る。
- **FR-LABO-065-06 — owner受渡しと権限境界**：qualification証拠とscorecardから、適用scope/revision、source・result receipt、oracle/rubric/fixture版、既決decision ownerのidentity/revision/statusまたは未決を辿れる形で渡す。LABOは計測・比較・証拠を出し、runtime/providerを選択せず、Workerを割り当て・実行せず、実験許可を生成せず、qualification証拠から既存ownerのqualification/admission decision、権限、採否・限定・quarantine・retireを生成しない。
- **FR-LABO-065-07 — 065/067指標分離**：065の`first_pass`は最初のAttemptの結果である。067の「最初の適格candidate」と同じAttempt内の修正回数とは異なる。相互換算・統合をしない。

**受入条件候補**

- **LABO-065-AC-01 — 選択scope内の正常**：選択scopeでは8軸の証拠と同一性receipt、machine smokeとblind full-benchの別結果、task scorecardの各fieldを返す。測定対象外には理由を、未観測にはunknownを添える。初回失敗後のretry成功は`first_pass=false`として区別する。
- **LABO-065-AC-02 — 選択scope内の未見正常**：同じ選択scope・適用条件の未見task/runtimeを、存在するreceiptと適用oracleで評価する。証拠がある軸・metricだけを報告し、scope外への一般化や通常作業へのfull-bench要求を作らない。
- **LABO-065-AC-03 — 否定・保留**：smokeだけの資格表示、必要軸/receipt欠落、hidden answer漏えい、blind/author分離不成立、版・scope不一致、初回失敗の上書き、unknownのzero化、retry/救援費用の欠落、品質不成立の相殺、LABOによる権限/decision生成を拒否する。固定L2-065:514の原因別戻し先だけを使う。具体的なsource identityが入力から分からない場合はunknownを保ち、IDだけからowner identityを推測しない。

**旧資産との対応**：旧HIL-FR-61/62から選択scope内bench分離、8軸、task単位の初回/retry/diff/lint/quality/cost証拠を保持し、固定L2/L11のauthority・scope・owner境界に合わせて意味を再導出する。旧HIL-NFR-35とBench R04/R08のblind/context保護も選択scopeへ再導出する。旧runtime/provider/schema/admission実装、固定sample数・閾値、普遍的性能主張は置換対象外として移さない。旧HIL-BR-31は現固定L2-065の独立business outcomeとして採用せず、採否等の旧business判断を新要件に持ち込まない。



## Stage 5 — HELIXLABO-L2-064 Worker比較評価の候補名遮蔽と再現条件

状態: `HELIXLABO-L2-064` はPO採択済み、`MPR-RC-HELIXLABO-L2-064-002`、`version_target: 1.0`。固定L2/L11は `0857205ecb7a18db9d8d926142e865776c1bf6e2` のL2:491–501/L11:233–239である。このL3/L10候補は要求採択の再承認、比較実行、Worker/judge割当、qualification、assignment、admission、実運用を許可しない。

対象は選択された比較scopeのrunだけである。通常履歴へblindを一律必須化せず、`HELIXLABO-L2-063`の修復再発/Feedback循環や`HELIXLABO-L2-065`の資格scopeを前提にしない。候補名をjudge可視資料から隠しても、元runtime/model identityと版は記録側で追跡可能に保ち、judgeへ実際に提示した資料・可視範囲とは別に記録する。fixture/rubric/judge version/sample/retryは比較前に固定し、未実行通常履歴へ後付けblind済み印を付けない。

| 固定要件・入力 | AC | 機能条件 / 責務 |
|---|---|---|
| 比較対象run、元identity/version、judge提示資料と可視範囲 | `LABO-064-AC-01/02/03` | 記録側のidentity追跡とjudge-visible情報を分ける。元identity追跡不能は観測元へ戻す。可視scopeの判定不能はevaluation ownerへ戻す。 |
| fixture/rubric/judge version/sample/retry固定と途中変更禁止 | `LABO-064-AC-01/03` | 条件は比較前に入力として固定する。missing、unknown、stale、不一致を他条件の成功で補わず、run/条件を保持する。 |
| smoke成功のみで完全適格性を主張しない | `LABO-064-AC-03` | full evaluationとsmokeを異なる証拠として扱う。security failure、scope逸脱、検証不能出力を平均点で相殺しない。 |
| 評価結果は水準・配置案の材料 | `LABO-064-AC-03` | LABO評価からassignment/admissionを生成しない。比較を実施する場合はOS assignmentとSECURITYの許可が必要であり、LABOはそのassignmentや許可を生成しない。 |
| 不成立・再評価義務 | `LABO-064-AC-03` | 不明・漏洩・不一致は理由付きで比較不能として保持する。固定条件/可視scopeの判定はevaluation ownerへ、再評価義務はtask/evaluation ownerへ戻す。 |

### LABO-064-AC-01 — 選択scopeの正常比較材料

合成fixture `B0`（L10表）を与える。selected scope、run identity、runtime/model identityと版、記録側mapping、judgeに渡す資料・可視範囲、fixture/rubric/judge version/sample/retryを比較前に固定し、候補名をjudge-visible資料へ出さない。fixture revision（Fv0）とruntime revision（V0）は別fieldとして記録する。元identityと版への追跡は記録側に残す。返すのは当該scopeの条件・evidence対応であり、実測・実比較・qualification/assignment/admissionではない。

### LABO-064-AC-02 — 未見正常と差分対照

未見candidate pairまたはruntime版差があっても、同じ選択scopeのjudge-visible資料から候補名が分からず、record-side identity/version mappingと比較条件が有効であれば、差分だけで露出や不成立を推測しない。通常履歴を比較母集団に加えず、結果を別scope/版へ外挿しない。

### LABO-064-AC-03 — 漏洩、条件不成立、証拠相殺と権限境界

実際に比較runを行う場合は、既存OS assignmentと適用されるSECURITY許可を入力条件として用いる。この候補はそれらを生成しない。L10の各直接fixtureは一つの入力field変異、または入力不変で一つの誤出力を検査する。候補名の資料本文/metadata/output metadata露出はそれぞれ区別し、identity mapping欠落/staleとは混同しない。mapping/sourceの追跡不能は観測元、可視scope/固定条件の不明はevaluation ownerへ戻す。再評価義務はtask/evaluation ownerへ返す。smoke-only結果でblind evidenceを代替すること、またはそれだけで完全適格性をclaimすることをfull evaluationと区別する。failureの平均相殺、scope外run混入、検証不能の成功化を拒否する。評価だけでassignment/admissionを生成しない。qualification一般の生成禁止を追加しない。

比較を実施する場合、対象runに必要な既存OS assignmentおよび適用される既存SECURITY許可を入力条件として照合する。LABOは評価・比較結果から比較実施許可、SECURITY許可、Worker起動、OS assignmentまたはadmissionを生成しない。必要なassignmentまたは許可がmissing/unknownなら同条件比較の成立として扱わず、元runと条件を保持し、task/evaluation ownerに再評価義務を残す。

### 旧sourceからの再導出

直接の旧要求source `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、HIL-NFR-35（旧platform requirements 215行）から、候補名blind化、fixture/rubric/judge version/sample/retryの再現条件、smoke-onlyではfull admission相当の結論を出さないこと、security failure/scope逸脱/検証不能を平均相殺しないことを再導出した。HR-FR-HIL-22（旧functional requirements 56/85行）、HAC-HIL-22a/b/c、HAT-HIL-22、HOT-HIL-54（旧operational test design 81行）は対応consumerとして別役割で参照した。

旧「full admission」は、現行L2の評価結果を水準・配置案の材料とする意味へ限定して再導出し、旧admission engine、routing、実task実行、資格・実装権限は持ち込まない。sample数やretry回数の数値、測定閾値、execution permissionも新設しない。旧test/runtime/CIは実行根拠にしない。

| CASE inventory上の扱い | 内容 |
|---|---|
| 旧公開ID保持 | L10に旧42 IDをすべて保持する。CASE-03c/03d/05/13/16/17/21/04aは索引であり、主fixtureの変異を重複計上しない。 |
| 漏洩とidentity | CASE-03a/12/24/25/33は候補名可視性の異なる出力面、CASE-03b/14/26はmapping/source traceの異なるfield状態として扱う。author/judge作成context独立性を要求に追加しない。 |
| smokeとfull evaluation | CASE-15はblind evidenceをsmokeで代替する入力変異、CASE-38はsmoke-onlyから完全適格性をclaimする誤出力を別oracleで検査する。意味が同一なら索引化し、二重計上しない。 |
| authority | CASE-37/39はassignment/admission生成拒否。CASE-38はsmoke-only evidenceの不足のみを扱いqualification一般を禁止しない。CASE-04aは37/38/39を直接指す索引とし、束ねたnegativeにしない。 |

CASE定義数・ID保持だけでfixtureの独立性や意味完全性を認定しない。

## Stage 5 — HELIXLABO-L2-067 初回eligible candidateと同一Attempt内修復の観測

親: `HELIXLABO-L2-067` / `MPR-RC-HELIXLABO-L2-067-001`。PO判断record revision `048a1770d10f5a1f24f7cf0a95f43dfdc318591d` line 82はD1条件付き採択として「最初の適格candidateの結果」と同一Attempt内修正回数を登録する。固定L2本文の`draft_candidate`状態はその時点の原文として保ち、このL3/L10候補を要件承認、実験/資格/完了、Worker割当、permissionまたは実行許可としない。

固定要件revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2:529–540（full SHA-256 `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`、raw-LF span `bf545a7b5e4714f442c4f96cec498ac07056f314b13765fc05ad049b69a8c188`）とL11:269–277（full SHA-256 `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`、raw-LF span `7b3e55cbeeb4fb0f2ae322b3ea439b63ea6acfcaabf2753a642aee158f378a16`）を対で起点とする。

### LABO-067-FR-01 — 最初の適格candidateと同一Attempt内修復回数

明示的に選択したtask/scope/revisionに適用される既存eligibility predicate/revisionと受入oracle/revisionを候補結果前に参照する。predicate/oracleは固定L2のtask/要求ownerが供給する既存task/requirement contract（または同契約が示す既存source）から受け取り、新規に定義・選択しない。OSの既存assignment identity/AttemptIDと順序付きcandidate identity/digest、生成・eligibility判定・変更/repair・oracle判定event receiptを結び、最初にeligibleと判定されたcandidateの既存oracle結果と、同一assignment Attempt内の提出前repair roundだけを観測する。LABOは観測・比較evidenceを返し、candidateの生成/変更/修復、predicate/oracle、threshold、採否を作らない。

same-attempt修復回数は、最初にeligibleなcandidateから同じOS assignment Attempt内の最終提出までにreceiptで観測できたrepair eventの数とする。eventの順序・identity・重複排除根拠が不明ならunknownとし、0と推定しない。別Attemptを混ぜず、複数Attemptの総Attempt countは算出しない。

065のPO判断「最初のAttemptの結果」とは別grainである。065のfixed本文にあるfirst_pass/post-initial retry_count定義も変更しない。たとえば最初のAttempt内でineligible C0の後にeligible C1があり、その後修復される場合も、067はC1のoracle結果と同じAttemptのrepair roundを観測する。065 first_attempt/first_passやretry_countへ換算・代替・加算しない。065の採択を依存条件にせず、065の有無にかかわらず同じ入力証拠から067の観測だけを返す。059のquality priority、比較条件、費用・時間・手戻り定義も変更しない。

- `LABO-067-AC-01` 正常: 事前に選択されたexisting predicate/oracle revision、OS assignment/AttemptID、候補identity/digestと順序付きreceiptを対応づけ、first-eligible candidateの既存oracle結果と同一Attempt内roundだけを保持する。後続結果でfirst-eligible resultを上書きせず、065と別field/分母にする。
- `LABO-067-AC-02` 未見正常: 未見task classでも同じ既存predicate/oracleが適用されることをtask/要求owner sourceが示す範囲だけ観測する。適用可否や新revisionを推測しない。
- `LABO-067-AC-03` 不成立・権限境界: predicate/oracle/revision/candidate/assignment/Attempt/event/receiptの欠落・unknown、不順序、別Attempt混入、重複排除根拠不足または最終提出からの逆算は指標をunknown/未評価にする。責務roleはpredicate/oracle=task/要求owner、assignment/Attempt/event=OS、result observation=LABO、比較実施時の既存permission=SECURITYとして保持し、特定個体identityがunknownでもroleを混同/創作しない。LABOはOS assignment/Attempt、SECURITY permission、採否、Worker起動、qualification/admissionを生成しない。unknownはunknownのまま、原因に対応する既存source/roleへ不足を返す。

#### 旧source起点・保持・再導出・範囲差分

直接source `LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`。保持・意味再導出するのはfirst eligible candidate境界と提出前repair-round可視性の2 selected subatomだけ。総Attempt count、queue/active/review/Human wait、escaped defects、rollback/recovery、coverage、observer overhead、freshness等の他telemetryは本候補に入れない。旧first-passをcurrent 065 first_attemptと067 resultで統合せず、旧schema/runtime/thresholdも置換対象外とする。固定L2 literalのsource line hash `58be…db4f`はsource lineのLF除外SHA-256で、実際のline+LF SHA-256は`aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`。`MPR-SH-CANDIDATE-003`は固定L2本文にあるsource-holding locator。現registerの`004`との差はauthority effectなしのmetadata差異として残し、ここで意味を確定しない。

L10 CASE IDsは照合用であり、ID数・独立fixture数から完全性を主張しない。

## Stage 5 — HELIX-LABO L3 機能要件候補 — HELIXLABO-L2-069

**固定source／状態候補**：PO採択対象のL2/L11 bytesを入力にした起草案。歴史的な本文内「未採択候補」表記はそのままsource表記として記録し、PO採択状態はdecision row 84から読む。候補本文はL3承認・実装・実行・ticket操作を許可しない。version_targetは親記載どおり`1.0`。

### LABO-069-FR-01 — Ticket返却・再発行後の成立状況評価

既存OSから受け取るticket返却、検証不成立、不足oracle/input、および証拠付きrelationに結ばれた再発行後resultについて、ticket/assignment identity、source・対象revision・scope、観測時点、evidence、評価可能/未評価状態を保つ評価candidateを作る。出力は返却reason class、返却数と適用denominator、理由別傾向、同一scopeでの再発行後成立/不成立/未評価、counterexample、regression risk、revalidation conditionを区別し、根拠となるsource/revision/scope/window/completenessを示す。

評価に必要な比較条件が揃わない場合は比較不能またはunknownを明示し、欠測を0へ補完しない。window未満・未追跡・打切りもdefect 0とせず、件数減少だけをquality closureの証明にしない。個別の再発行後resultは記述できるが、単一事例や単純な前後比較だけから因果効果または発行精度改善を断定しない。固定数値threshold、統計方式、学習方式は追加しない。

### 受入条件候補

- **LABO-069-AC-01 — 条件が揃った評価candidate**：同一ticket family/scope/対象revisionとそのrelation/evidence、denominator、reason分類、window、source completeness、再発行後resultを束ね、成立・不成立・未評価を区別する。評価candidateには固定L2が求める理由別傾向、counterexample、regression risk、revalidation conditionを含め、各項目を当該source/revision/scope/windowと利用可能な根拠に対応づける。元closureを保ちticketを変更しない。ここで固定数値threshold、統計方式、学習方式は追加しない。
- **LABO-069-AC-02 — 未見reasonの保持**：既存分類にないreasonは分類を新設せずunknown/unclassifiedとして保持し、成立/不成立へ推測変換しない。
- **LABO-069-AC-03 — 比較不能・欠測の保持**：source、denominator、scope、classification条件、revision、観測時点、evidence、再発行後relation/result等の必要入力が欠ける・stale・不完全ならrate/resultを未評価とし、欠測/window未満/未追跡/打切りを0にしない。戻し先は既存のOSまたは識別可能なsource-owner区分に限定する。役割区分が既知でも個別identityがsourceで特定できなければその値はunknownのままとし、新ownerを作らない。
- **LABO-069-AC-04 — 既存authorityと責務の保持**：LABOはticket本文、priority、assignment、verification oracle、authorityを変更しない。固定L2/L11が別ownerへ残すticket issue/assignment/authorityと、未評価結果からtarget変更・配置・ticket発行、同評価から採否・改善完了・配置変更を導かない境界を保つ。各出力fieldはFVで別々に変異させる。OSの登録/routing/ticket発行とINTELLIGENCEの配置案、適用中のSECURITY/data-use条件は既存責務のままにする。

### 旧sourceとの対応

`LEGACY-ASSET-3A15E5645D2D2A59DFF5` の旧ticket要求は、閉じたticketのclosureを保ち、後日のfinding等をevidence-backed relation付き追補assessmentへ接続し、時間的近接/pathだけで原因ticketを決めず、window未満・未追跡・打切りをzero defectsにしない点を**意味から再導出**する。旧storage/実行方式をbyte再利用しない。`LEGACY-ASSET-F6E9EA3422A0EF1DF090` のfeedback品質proxy拒否文は、件数減少のみで品質を証明しない限定根拠として**意味から再導出**する。reason class・分母・window・評価の候補は固定L2と登録済みO2 source atomに結び直して新たに起こす。旧source全体・consumer全体の移管や因果証明は主張しない。

### HELIXLABO-L2-068 — Worker Attempt countの観測（Stage 5、version_target: 1.0、起草候補）

**固定親と採択根拠**：PO判断記録 `af93d1f171d994f9fae2e78026b39ac27f896f5c` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:83` は `HELIXLABO-L2-068` を採択し、L2/L11の全体SHAと節digestを固定する。採択本文自体は `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2 `docs/helix-labo/L2-requirements/labo-requirements.md:541–550`（file SHA-256 `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`、節SHA-256 `7e3df32b0131722c88ae148c4cbfa9a1be20f81826099c0ceb29a674e07030e2`）とL11 `docs/helix-labo/L11-acceptance/labo-acceptance.md:278–286`（file SHA-256 `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`、節SHA-256 `3dcf068de1351b2e8c1f2d772ec9273cb7908368a32b389ee40ce51929ad8d94`）である。line 83のhistorical MPR `MPR-RC-HELIXLABO-L2-068-001` はlocator correctionの後継 `...-002` と区別する。採択されたcandidate/digest/atom setは変わらず、receiptはauthorityを生成しない。候補本文内の `draft_candidate` は固定bytesのmetadataであり、PO採択状態は判断記録から読む。

**旧source起点と処置**：`LEGACY-ASSET-3A15E5645D2D2A59DFF5`、`LEGACY-CAND-LINE-001656`、旧 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`（source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`、raw LF span SHA-256 `aa9dacc58969d896bbfbe38ce9c2ed6b55f47476b4cd3a411041d62bebf70468`)を起点に、S3C「総Attempt count」だけを意味再導出する。S3A/S3B、隣接line、旧candidate全体や全12指標へのcoverage/closureを主張しない。old asset ledgerは `unresolved`、paired consumer未確認であり、限定検索結果はconsumer不存在の証明ではない。

**receiptのpin差**：採択節digestはPO行の`7e3df32b…`／`3dcf068d…`と一致する。coverage receipt r2はL11規則を「見出しからEOF」と記す一方、実際の採択digestはL11の068節span 278–286に一致する。これはreceipt本文の規則記述と実際の採択pinの差として残し、receiptから採択範囲やauthorityを作らない。

**固定意味・境界**：明示選択されたtask/scope/revision/evaluation範囲に属するOS Worker Attempt identityのdistinct総数を数え、完全性が証明できない場合は総数を `unknown` とする。identityを持つdenied Attemptは数え、実行前に拒否されidentityのないintakeは数えない。result stateは別fieldで保持する。固定318の本文には065/067を「未採択」と記すが、現PO判断record `af93d1f171d994f9fae2e78026b39ac27f896f5c` line 80/82は両候補を条件付き採択と記録する。snapshot metadataと現authorityを区別し、どちらの採択状態にも068を依存させない。065 first_pass/retry_count、067 same-Attempt repair round、068 identity countは換算・代替・合算しない。比較時も採択済み `HELIXLABO-L2-059` の品質優先・費用の意味を変更しない。

**責務・返却**：OSは既存assignment、Attempt identity、event/evidence、state/correctionを提供する。LABOは許可済み記録のdistinct countと比較証拠を返す。固定親の生成禁止はAttempt identity、identity/counting policy、Attempt/Retry policy、retry上限、task success rate、Attempt success rate、task-evaluation oracle、assignment、Worker起動/retry、adoption、qualification、admission、実験許可、SECURITY許可であり、L10で各出力fieldの生成を個別に拒否する。新規実験には既存OS assignmentと適用されるSECURITY許可を要し、count結果からその許可を生成しない。LABOはこれらを生成しない。identity対応・event/correction lineageの欠落、重複衝突、対象recordのstale・scope不一致、捕捉完全性不明は総数をunknown/未評価にする。result receiptだけが欠ける場合は、identity集合の完全性receiptだけで当該範囲のAttempt記録完全性を確認済みとせず、総数をunknown/未評価にする。該当result stateも別fieldでunknownとして保持し、既知の観測sourceまたはOS記録ownerへ不足を返す。event遅延（OSの訂正event遅延を含む）は総数をunknown/未評価にし、観測sourceまたはOS記録ownerへ不足を返す。完全性receiptが存在していても、遅延eventから総数を推測・確定しない。原因に沿って既知の観測sourceまたはOS record owner区分へ返す。個体source/owner identityが不明ならそのidentity unknownを別に保持し、既知責務区分を消さない。未採番の担当や権限を新設しない。

**版・範囲**：旧a4の25 CASE IDを保持する。旧literalは監査材料に保全し、下の6列表のfixture setup/oracleは固定L2/L11へ意味再導出した候補であり、旧literalのbyteコピーを正本定義とみなさない。固定親は仕様として引用し、これらの候補表は意味完全性・単独変異性の証明ではない。

- **`FR-LABO-068-01` — 選択scopeとdistinct identity count**：既存OS assignmentから明示されたtask/scope/revision/evaluation範囲を受け、範囲に結び付いた各Attempt identityを一度だけ数え、総数を `attempt_count` として返す。scope外identityは、OS記録とsource/identity linkが矛盾せず、所属scopeが一意に確認できる場合に限り選択範囲から除外し、元記録をscope外として保持する。scope linkとsourceまたは他の権威ある記録が矛盾する場合は、どちらかを選んで範囲を確定したりlinkを修復したりせず、記録を保持したまま総数を `unknown`/未評価として既知の観測sourceまたはOS記録ownerへ不足を返す。具体的な個体identityが不明ならunknownを別に保持し、既知の責務区分は維持する。
- **`FR-LABO-068-02` — 完全性・state・訂正**：OS event/evidence/result/correction receiptをidentityへ結び、重複配送・訂正eventを同一identityへ統合する。記録集合の完全性を確認できない場合は `attempt_count=unknown` とする。完全性receiptが同じ選択範囲の観測identity集合と矛盾する場合、またはreceipt revisionが選択source revisionと異なるstaleの場合も総数をunknown/未評価とし、既知の観測sourceまたはOS記録owner責務区分へ不足を戻す。具体的個体identityがunknownなら別に保持する。identityが確認できるAttemptのsuccess/failure/interrupted/denied等のstateはcountと別fieldで保持する。result receipt欠落時は、当該範囲のAttempt記録完全性receiptの有無にかかわらず総数をunknown/未評価、該当result stateもunknownとして別fieldで保持する。既知の観測sourceまたはOS記録owner区分へ不足を返し、個体source/owner identityが不明ならそのidentity unknownを別に保持する。identity付きdeniedは一件とする。実行前拒否intakeとAttempt identityを持たないassignmentは別々にAttemptとして数えず、各intake/assignment状態を別記する。
- **`FR-LABO-068-03` — 指標・authority・責務分離**：065 first_pass/retry_countと067 same-Attempt repair roundを独立指標として保持し、換算・合算・代替しない。CI rerunやrepair event、duplicate deliveryを新Attemptにしない。LABOは観測と証拠受渡しのみを行い、OS Attempt identity、identity/counting policy、Attempt/Retry policy、retry上限、task success rate、Attempt success rate、task-evaluation oracleを定義・生成しない。task-evaluation oracle、assignment、Worker起動/retry、採否、qualification、admission、実験許可、SECURITY許可を出力fieldとして生成しない。原因に沿う既知責務区分を保ち、具体的個体identityが不明ならunknownを併記する。

**受入条件候補**

- **`LABO-068-AC-01` — 選択scopeの正常**：OSの完全性receiptがある選択scope内のdistinct Attempt identityを一度ずつ数える。identity付きdeniedを含め、state別内訳は分離する。
- **`LABO-068-AC-02` — 未見scopeの正常**：結果閲覧前に固定された別の選択task/scope/revision/evaluation範囲に同じ定義を適用し、全記録の完全性を確認できる場合に限り総数を返す。前のscopeの分母・receiptを流用しない。
- **`LABO-068-AC-03` — 否定・未評価**：missing/unknown/stale/collision/scope mismatch/event遅延/訂正event遅延の記録を確定総数や0へ変換せず、unsupported completeness assertion、実行前拒否intakeまたはAttempt identityを持たないassignmentの算入、scope外event、CI rerun、065/067換算を拒否する。完全性receiptの観測identity集合が同じscopeの観測record集合と矛盾するCASE-31、および完全性receipt revisionだけが選択source revisionと異なるCASE-32では、総数unknown/未評価として確定せず、既知の観測sourceまたはOS記録owner責務区分へ不足を戻し、個体identity unknownは別に保持する。固定親の禁止するAttempt identity、identity/counting policy、Attempt/Retry policy、retry上限、task success rate、Attempt success rate、task-evaluation oracle、assignment、Worker起動/retry、adoption、qualification、admission、実験許可、SECURITY許可の出力fieldを各々個別に生成しない。result receiptだけが欠ける場合は、identity集合の完全性receiptだけで当該範囲のAttempt記録完全性を代替せず、総数をunknown/未評価にする。該当stateも別fieldでunknownとして保持し、既知の観測sourceまたはOS記録ownerへ不足を返す。

**旧資産対応**：旧 `LEGACY-ASSET-3A15E5645D2D2A59DFF5` のS3C Attempt count subatomだけを意味再導出する。旧source行に併記されたfirst-pass、repair roundsやその他metricsを068へ混ぜない。旧runtime/schema/policyを再利用せず、OSの既存記録を入力として扱う。採択済059の比較条件を保護し、固定本文に残る065/067 status metadataと現PO decision上の条件付き採択を区別し、どちらも068の依存条件にしない。

### HELIXLABO-L2-071 — GitHub監査task class別qualification（Stage 5、version_target: 1.0、起草候補）

**採択済み固定親とPO根拠**：PO判断記録 `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a` の `docs/governance/decisions/po-decision-2026-09-30-live26.md:50` は `HELIXLABO-L2-071` を通常採択22件に含むものとして承認し、L2節digest `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f` とL11節digest `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0` に固定する。決定の`source_repository_revision`は `ea6f756f96a7370de78e412d737c7a7ed472114a`、`decision_basis_revision`は `81d1f35f9c5793c5312be4ae52526c96b609c254`。この二つを同一revisionと扱わない。

固定L2本文は `ea6f756f96a7370de78e412d737c7a7ed472114a:docs/helix-labo/L2-requirements/labo-requirements.md:576–584`（全体SHA-256 `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`、節SHA-256 `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`）、固定L11は同revisionの `docs/helix-labo/L11-acceptance/labo-acceptance.md:309–316`（全体SHA-256 `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`、節SHA-256 `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0`）である。PO行は `MPR-RC-HELIXLABO-L2-071-001` を参照する。候補中の `draft_candidate` は固定本文metadataであり、authority状態をそれ自体から読み替えない。

**旧HELIX sourceと処置**：選択inputは `LEGACY-ASSET-A6926200F28B26300432` の旧L1 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md:67,69`（revision `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a`のarchive bytes、file SHA-256 `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765`、span 67–69 SHA-256 `ab29276edf0e04c4c163ab5d4e3889b0c845fbbd86fc0f7d23f8bd32a7ffdb4e`）である。3L-BR-008から、task class / model revision単位の評価、qualification・表示称号・permission/authority・assignment roleの分離、記録済みmajor missまたはmodel revision更新による資格対象revisionの失効だけを意味再導出する。

旧L3 `LEGACY-ASSET-A26561A0EF7396D8F017`（同archive revisionの `three-lane-cloud-governance-requirements.md:77–79`、file SHA-256 `4b388cda67484f1808b0f4b8834d5d234a47de49f7db6dcb12d92d2dcfbee185`、span SHA-256 `e7c4bec23a84c57b06c826c67ae19d011293a689d1b7463c10ea0d5950a313dd`）と旧acceptance `LEGACY-ASSET-E9D6CA411D75485A0984`（`three-lane-cloud-governance-acceptance.md:44–47`、file SHA-256 `785421188d23f371290ff5bacecba6c5215e7baa66110c461f548cae8f6a2fc7`、span SHA-256 `db3f977c22140f8ef9cb9628fa0341fe261daabaf7240051211df91ce6406993`）は歴史的contextに限る。旧7 class固定一覧、状態遷移列、expiry条件、provider/lane、旧runtime/test behaviorを移さない。未確認のconsumerを読み切ったとは主張しない。

**適用・責務境界**：対象task classは呼出し元が選択したscopeから受け取り、既定集合を作らない。qualification recordはtask class・model revision・evaluation scope・evidenceへ束縛する。表示称号、資格状態、permission/authority、assignment roleは別identity/fieldとして保持し、相互推論しない。LABOはqualification evidenceを記録・返却するだけで、provider/lane/modelの選択、評価実行、permission、assignment、authorityを発行/変更しない。permissionは既存SECURITY責務、assignmentは既存OS責務に残す。資格失効とpermission失効は別状態である。

**unknown・失効条件**：class、revision、scope、evidenceが不足・stale・矛盾するときはqualificationを `unknown`/未評価にする。記録済みmajor missは対象revisionのqualificationを失効させる。model revision更新は旧revisionのqualificationを失効させ、新revisionへ継承しない。major missの分類・rubric、数値threshold、task class既定値、expiry条件、再評価方法/時期を新設しない。不足した評価根拠は、個体source/owner identityを特定できるかにかかわらず、その根拠を供給する既存source owner責務区分へ返す。個体identity unknownは別に保持する。role名やqualification outcomeから未特定ownerを作らない。

**L2-055との関係**：採択済み `HELIXLABO-L2-055` のWorker履歴に基づく作業種別/model class別の水準・根拠・範囲・未評価集計は既存契約として再利用する。071が追補するのはGitHub監査task classとmodel revisionに結ぶqualificationおよび二つの固定失効条件である。055/059の一般評価・比較契約、OS assignment、SECURITY permission/expiry/revocationを複製・変更しない。

- **`LABO-071-FR-01` — task-class/model-revision qualification記録**：選択scopeのtask class、対象model revision、evaluation scope、evidence source/revisionとqualification記録の対象revisionを一つの追跡可能な記録に結ぶ。evidenceとqualification記録が同じtask class/model revision/scopeに束縛される場合だけその状態を返し、revisionが食い違う場合はunknown/未評価にする。表示称号、qualification、permission/authority、assignment roleは別identity/fieldとして保持し、互いから推論しない。
- **`LABO-071-FR-02` — 固定失効事象の適用**：根拠sourceに対象revisionのmajor missが記録されたとき、その資格対象revisionのqualificationを失効させる。model revisionが更新されたとき旧revisionのqualificationを失効し、新revisionへ継承しない。新revisionはそのrevision固有のevidenceが記録されるまで未評価とする。二つの事象以外のexpiry triggerを足さない。
- **`LABO-071-FR-03` — unknown・返却・非authority**：class/revision/scope/evidenceが欠落、stale、矛盾、またはsource identityを結べない場合はqualificationをunknown/未評価とする。不足evidenceは個体identity特定の有無にかかわらずその既存source責務区分へ返し、個体identity unknownは別に保持する。title、qualification、permission/authority、assignment roleは一つのfieldから別のfieldを補完せず、title→qualification、qualification→title、title→permission、title→authority、title→assignment、permission→assignment、assignment→permissionの出力をしない。qualificationからmodel/provider/laneの選択、称号、permission、authority、assignment、実行許可、採否、完了を生成しない。permissionやauthorityの実体はSECURITY、assignmentはOSの既存責務に残す。

**受入条件候補**

- **`LABO-071-AC-01` — 同じ対象の正常**：evaluation evidenceが同一task class/model revisionへ結び付く場合、そのscopeのqualification stateを証拠どおり返す。称号/permission/roleは変えない。
- **`LABO-071-AC-02` — 未見class/revisionの正常**：新たに選択されたtask class/model revisionの組合せをその固有evidenceで評価し、別class・別revision・称号から未評価を補わない。既定class集合を作らない。
- **`LABO-071-AC-03` — 不成立・返却**：class/revision/scope/evidence欠落・stale・mismatch、record済みmajor miss見落とし、資格のrevision間継承、title/qualification/permission/authority/assignment role各field間の補完または相互更新（qualification→titleを含む）を各々拒否する。qualificationからのmodel/provider/lane選択、実行許可・採否・完了の生成、major miss rubricまたは既定task-class集合の出力追加も拒否する。不足評価根拠は個体identity特定の有無にかかわらず原因となった既存source責務区分へ返す。実際に不足・矛盾するpermission/authority根拠はSECURITY、assignment根拠はOSの既存責務区分へ返し、個体owner不明はunknownとする。入力が正常なのにLABOがpermission/authority/assignmentを誤出力した場合は、入力側へ返さずLABO自身が該当出力を訂正する。

### HELIXLABO-L2-066 — A比較における誤修復・未解消数の明示

状態：未承認のL3候補。version_target: `1.0`。固定L2/L11は要件authority、POのL2採択は親のauthority登録であり、本候補からL3承認・実装・比較run・実測合格を生成しない。

**固定sourceとPO状態**：固定revision `0dd946cec1c3fca8e144513b72e2e10d16c7c9c3` のL2 `docs/helix-labo/L2-requirements/labo-requirements.md:518-528`（file SHA-256 `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`、span SHA-256 `5a67776a3f4567fa662c86898caf275fddbe8dc806fd3a19622cae9f733cdb69`）およびL11 `docs/helix-labo/L11-acceptance/labo-acceptance.md:261-268`（file SHA-256 `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`、span SHA-256 `dd302f23a38d74475e707be64d9ee69a0bfda35b98902c62173c45d8c369a556`）を対で起点にする。PO記録 `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:81` は、候補base `af8d0aac1a20cd3a41ca9df088bc7bf3501847ff` 上の当該行をactualReadして確認した。行SHA-256 `41121ae7430cd5890e3aae87edd38e1c3cc37b493cc20e65b6dacb0976d81d4f`。同行はHELIXLABO-L2-066を採択し、`MPR-RC-HELIXLABO-L2-066-001` と固定本文digestを指す。登録証拠 `MPR-RCPT-LABO-BUGBOT-MISREPAIR-COMPARISON-2026-09-28`（SHA-256 `b678eee15274606442d9b4f6ac99767e8f6c50939d36793550913fa89a443d56`）は旧source atomと候補対応を記録する。L2本文の事前metadata `draft_candidate` はそのまま保持し、PO採択状態と混同しない。

**旧HELIX起点と処置**：旧source `LEGACY-ASSET-D881AF6AFD277B1DE934` の `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:75`（file SHA-256 `81dc848cde93395e5cf5e49d5545856f482403d41c7eae75cae993a9c4229dbb`、line SHA-256 `9facff56cbc42f9f7157dd85f1078605951af16a52fef5ec698bb62fd46681bc`）は「成功件数だけで評価せず、Aと同条件の費用・時間・手戻り・誤修復・未解消数を測定する。」の単独atomである。保持する意図はAとの同条件比較で誤修復・未解消数を隠さないこと。成功数以外の費用・時間・手戻り、品質優先、比較条件は採択済みL2-059から再利用する。旧sourceの残る意味を、共通eligible case分母Nと事前固定oracleに結んだ2指標として再導出する。隣接73/74/76行、旧Bugbot全要求、runtime/test/実装はこの親へ移さず、旧実行・write・assignment/admission authorityは現行L2-066の責務境界に置換する。

旧paired consumer `LEGACY-ASSET-901CD182B52024593E41`（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md`、file SHA-256 `cd2fdd3dcfaa98935db0fef6b876d6cdb7133b11b8c8877363c3d0138c4b8cbc`）はdraft候補で、別紙02/03/05が未提供であり、旧18シナリオ全件対応を主張しない。旧consumer全体を現行の許可や実行条件として再利用しない。

**要求本文**

`LABO-066-FR-01` 比較前にA identity/version、候補repair method identity/version、task/scope/target revision、共通eligible case集合とそのrevision、受入/quality oracle・scorer identity/revision、protocol、toolchain、environment、期間または同一終了/cutoffを受け取る。case identity重複は一件に正規化する。結果閲覧前にeligible集合、N、oracle、cutoffを固定し、結果後に変更しない。

`LABO-066-FR-02` A群・候補群ごとに、oracleが誤修復と判定した件数 `misrepair_count/N` と、終了/cutoff時に受入oracleを満たす解決のない件数 `unresolved_count/N` を別々に分子・分母・case判定receipt付きで示す。表示する群帰属と各分子・分母は、該当群のcase判定receiptから再構成した値と一致させる。両指標は同じcaseに該当し得る。oracle適用不能とresult/判定receipt欠測は別の理由としてunknownに記録し、どちらもeligible集合Nから黙って除外しない。unknownの理由と影響するcase identityを元oracle適用結果/receiptに対応して表示する。oracleが適用不能、またはresult/判定receiptが欠けるcaseを含む比較は割合を未評価/比較不能にする。費用・時間・手戻りの意味と集計はL2-059を再利用する。

`LABO-066-FR-03` task/scope/target/oracle/cutoff/eligible setの不一致、stale/missing result receipt、費用の片側欠落、unknown証拠を比較不能/未評価へ分ける。固定L2-066:527が列挙する不足・不一致は、個別source/owner identityを特定できるかにかかわらず、原因となった対象の既存責務ownerへ返す。oracle/acceptance/scorer適用性およびoracle/判定receiptはHARNESSまたは要求owner、task/scope/target revision・A identity・eligible-set等の入力recordはその入力を供給する既存sourceの責務、assignment/run receiptはOS、result/cost/time receiptは各receiptの既存供給元、comparison scope/measurement/comparison/evaluationはLABOの責務区分へ返す。個別identity unknownはunknownとして別に保持し、LABOの評価義務を維持する。digestを独立した既存ownerや新しいfieldとして作らず、contract側かinput/source側かを固定意味で判別する。評価結果からL2採択、効果達成、実験/run許可、repair permission/action、placement、admission、requirement completion、Worker/修復器の選定・割当・起動・実行を生成しない。旧Bugbot候補の採択、Bugbot/修復器の実装要求・実装開始・実装自体を生成しない。新しい比較runは既存OS assignmentと該当SECURITY許可に従い、LABO自身はWorker/methodを選定・割当・起動・実行しない。

**Acceptance criteria（定義は本L3 functional suffixのみ）**

`LABO-066-AC-01`（正常・FR-01/02）：B0の入力fieldと両群receiptがそろう合成比較で、case判定receiptからA群・候補群の各`misrepair_count/N`と`unresolved_count/N`を別々に再構成する。比較出力のA identity/versionが入力recordの実値と一致し、出力された群帰属、各分子、各分母が再構成した該当群の値と一致するときだけ正常として受け入れる。2指標の重複を許す。

`LABO-066-AC-02`（未見・FR-01/02/03）：B0とは別の合成比較scopeで、未見caseを含むeligible set N1を結果閲覧前に固定する。同じpredicate/oracleを適用できる根拠があればN1のcaseとして数え、適用不能ならunknown/未評価を保ち、oracle適用性不足を既存HARNESSまたは要求ownerへ返す。A identity/conditionの不足ならその入力の既存sourceへ戻し、特定個体不明はunknownを保持してLABO評価義務を残す。既存B0のNは変更しない。unknownを含む合成正常対照では、理由と影響するcase identityが該当入力のoracle適用結果/receiptと一致して表示され、Nに当該caseを保持し、その比較が未評価/比較不能で率非出力となることを照合する。

`LABO-066-AC-03`（異常・境界・FR-01/02/03）：単独field mutationとして、task/scope/target revision各欠落、A version競合、時間measurement receipt欠落・source receipt不一致・比較出力不一致、費用receipt不一致、結果閲覧後の共通cutoff変更、unknown除外、その他の条件不一致、stale/missing receipt、費用receiptの片側欠落・非対称、結果閲覧後のoracle/N変更を個別に与え、各当該比較の率を出さず比較不能/未評価へ分ける。さらに固定L2-066が禁止する固定target、許容率/tolerance、事前に課す試行件数、合否thresholdの生成を別々のCASE-79–82で拒否する。CASE-79は比較の固定結果目標、CASE-80は許容rate/tolerance、CASE-81は事前に課す試行件数をそれぞれ拒否しつつ、観測されたN・receipt数は表示する。CASE-82は固定pass/fail thresholdを拒否する。これは固定L2-066:523–527の比較境界を各fieldに対応させたもので、新しいtarget・rate・試行件数・合否条件を設けない。固定L2-066:527の不足・不一致は原因ごとの既存責務ownerへ返す。oracle/acceptance/scorer適用性およびoracle/判定receiptはHARNESSまたは要求owner、task/scope/target revision・A identity・eligible-set等の入力recordはその入力を供給する既存sourceの責務、assignment/run receiptはOS、result/cost/time receiptは各receiptの既存供給元、comparison scope/measurement/comparison/evaluationはLABOへ返し、個別source/owner identity unknownは別に保持する。LABOの評価義務は返却先個体の特定有無で消えない。新しいownerや分類を作らない。評価結果から採択・効果達成・実験/run許可・repair permission/action・placement・admission・requirement_complete・Worker/修復器の選定・割当・起動・実行を生成しない。旧Bugbot候補の採択、Bugbot/修復器の実装要求・実装開始・実装自体を生成しない。

## Stage 5 — HELIXLABO-L2-070 補助運用telemetryとAttempt scorecard併記

固定親はPO live26の49行が採択した `MPR-RC-HELIXLABO-L2-070-001`。source revision `ea6f756f96a7370de78e412d737c7a7ed472114a` のL2:561–574 SHA `07d9114fe55ed6bea2522756652cadec23f89397c619429360062256dc94e533`、L11:297–307 SHA `c6268c5f97bfa3d87a1075d9aa6eac2eca20593e611c9aadcd92ee1025e9beb1`をraw-LFで照合した。旧候補が参照した0abb2894の同範囲とbytesは一致し、採択状態はPO記録で確認する。

### LABO-070-FR-01 — 補助運用telemetryとAttempt scorecard併記

HELIXLABO-L1-005をprimary、L1-011をcontextとして、旧source line 399から固定親が選択した9 atomに限るscope付きscorecardを候補として提示する。既存のL2-059比較basis、L2-006品質評価、L2-001 provenanceを置換しない。対象task/scope、対象revision、window、source identity/revision、eventまたはresult receiptを各値に結び、条件が揃わない値はunknown/未評価/unavailableとする。異なるscope/revisionを混ぜず、欠落を0や成功へ変換しない。

1. **4種のduration**：queue wait、active time、review wait、Human waitを別々のfieldで提示する。各durationは適用sourceの開始・終了event、clock source、unit、occurred_at/observed_at、windowを保持する。境界が不明・無効ならunknown/invalidとする。重なる待ち時間を排他的と推定して按分せず、4値の合計でL2-059のend-to-end wall-clockを再定義しない。
2. **escaped defects**：既存の要求/受入ownerが適用するquality oracleとrevisionを用い、そのscopeで受入済みの対象へ関係付けられた受入境界後の検証済みdefect eventだけを観測値として示す。oracle、受入境界、追加の観測window、重大度または合否thresholdを新設しない。oracle/event/relation/母数/追跡完全性が確かめられない場合は確定count/rateを出さずunknown/未評価とする。L2-006のquality結果と同一視しない。
3. **rollback/Recovery**：許可済みsourceのevent identity、scope、発生/結果state、receiptのみを観測する。費用・時間はL2-059の同一event/receipt参照に従い二重算入しない。欠落は「発生なし」でなくunknown。観測結果からLABOがrollback triggerを生成したり、rollbackを開始/決定したり、実行・復旧操作権限・Recovery実行を作ったりしない。
4. **observer overhead**：計測・観測に直接帰属する実測資源とsource receiptをtask workから分けて示し、sourceの定義・単位を保つ。根拠のない推計や換算、未観測値の0扱いをしない。L2-059費用への算入は同じreceipt参照で一度だけとする。
5. **evidence freshness**：L2-001の既存source identity/revision/provenanceを保ち、sourceが持つeffective/occurred時刻とobserved時刻との差を観測値として示す。時刻欠落/不整合はage unknown/invalid。ageからfresh/stale状態、期限、適格性、採否、実験許可を作らない。
6. **Attempt系との併記**：scopeに適用可能なら、L2-067のfirst-eligible resultと同一Attempt内repair rounds、L2-068のdistinct total Attempt countを同じscorecardに別fieldとして置く。各定義revision/grain/identity/scope/receiptを保ち、換算・合算・代替しない。対象候補またはreceipt不在・不採択・scope不一致なら理由付きunavailable/unknownとし、併記完了を主張しない。070から067/068の採択を生成しない。
7. **既存指標境界**：telemetryを旧12指標へsilent renameせずidentity/version対応を割り当てない。coverage atomのtarget/denominator/oracle等、固定親が未解決としたatomはsource holdingに残す。

### 受入条件候補

- **LABO-070-AC-01 — 出典付きscorecard**：9 selected atomの適用可能な値を明示scope/revision/window/event-or-result receiptに結ぶ。各fieldの定義・単位・identityを保持し、出力値とsource receiptまたはsource-defined計算値の一致をL10正常fixtureで照合する。source identity/revisionに加え、各evidenceのprovenance出力は対応する有効source receiptのprovenance実値と一致させる。対象revisionとsource identity/revisionの一致はCASE-01およびCASE-99–101で確認する。
- **LABO-070-AC-02 — 正常な異単位field**：source定義に一致する異なるunitのfieldは別fieldのまま表示し、相互換算・合算しない。
- **LABO-070-AC-03 — 欠落・不一致の隔離**：必要event/clock/unit/time/source/revision/oracle/scope/relation/receiptが欠落・不明・矛盾・staleなら該当fieldだけunknown/invalid/unavailableとし、0・成功・不存在に置き換えない。他の根拠あるfieldは別に保持する。
- **LABO-070-AC-04 — 固定親の境界保持**：4 durationは独立、escaped defectは既存oracleと受入済対象/受入境界後の検証済みrelationに限定、rollbackは観測だけ、overheadは直接測定だけ、freshnessはage観測だけ。追加の観測window/重大度/合否threshold/expiry/decisionを作らない。Recovery操作権限/実行、age由来fresh/stale/期限/適格性、LABO作成の受入境界/受入済み/escapedの単独field生成拒否はL10 CASE-102–109で確認する。task success rateとAttempt success rateは固定L2-068が「定義しない」とする指標であり、既存FR-LABO-068-03がその意味を出力fieldの生成禁止へ導く。070は固定L2/L11の9 atomに限り、L11-070の「分子・分母の適用可能性が証明できない場合はrateを出さない」境界も保つ。CASE-131/132で各rate fieldを独立に生成拒否し、AC-05の正常な067/068併記fieldは保持する。
- **LABO-070-AC-05 — Attempt co-presentation**：scope適用可能な067/068 fieldを元定義とreceiptどおり独立表示し、不在・不一致のfieldは理由付きunavailable/unknownにする。換算・合算・代替で完全scorecardに見せない。L10の正常CASE-01、欠落CASE-16/17、067/068個別scope mismatch CASE-18/127、067/068定義revision mismatch CASE-129/130、metric置換禁止CASE-19、067/068未採択を推定しないCASE-65、predicate欠落CASE-66、oracle欠落CASE-73、結果receipt欠落CASE-68、出力field欠落CASE-67、および065からの置換禁止CASE-72をこのACで照合する。禁止rate誤出力を拒否するCASE-131/132でも正常な067/068併記fieldが保たれることを照合する。汎用telemetry event/receiptとscorecardのscope不一致はCASE-128で別に照合する。

### 欠落・不一致と出典保持の照合

固定L11-070「欠落・比較不能」が列挙するsource completeness、event identity、definition revision、単位、oracle、scope/window、対象とのrelation、receiptについて、不足/stale/矛盾の状態を既存CASEとCASE-110〜123で、固定L2-070 evidence freshnessの時計不正をCASE-124でCASE-01の正常入力に対する単独変異として照合する。該当する一つのreceipt/fieldだけを変え、他のbaseline値は保持する。欠落・stale・矛盾のfieldは確定値、0、成功へ変換せずunknown/invalid/unavailableとする。source event、scope/window、escaped-defectのquality母数/追跡完全性ではない一般source記録completeness、event identity、unit、時計、067/068 predicate/oracle/task定義ではない一般source/metric definition revision、およびescaped-defect relation receipt・quality母数/追跡完全性receiptではない一般source receiptの不足/stale/矛盾は既存source/event/observation責務区分へ無条件で返す。escaped-defect eventと受入済対象を結ぶrelation、escaped-defectのquality母数/追跡完全性またはそのreceipt、またはその受入oracleの不足/stale/矛盾は既存要求/受入責務区分へ無条件で返す。067/068 fieldのpredicate/oracle/task定義revisionの不足・不一致は固定親のtask/要求owner責務区分へ無条件で返す。個別責務主体のidentity unknownは責務区分の返却を消さず別fieldで保持する。

CASE-01の正常oracleは、各evidenceのsource identity/revisionとともに、対応する有効source receiptのprovenance実値との完全一致を照合する。CASE-125/126は入力側receiptが有効なまま、LABO出力provenance fieldだけをそれぞれ欠落・別値にする単独反例であり、当該LABO出力を訂正して正常sourceへ責務を返さない。CASE-128–130もCASE-01の正常入力と組み合わせた単独変異として同じtraceで確認する。

### 旧sourceとの対応・限界

旧`LEGACY-ASSET-3A15E5645D2D2A59DFF5` の `execution-ticket-requirements.md:399`を意味再導出の起点とし、固定親が選んだ9 atomだけを保持する。旧runtime/storage/testをbyte再利用しない。sourceの別receiptにある067/068関連3 atom、source holdingの2 unresolved atom、行399の他3 atom・列挙外tail・隣接行・旧candidate全体のsuccessor/closureを主張しない。旧12指標、旧scorecard、旧severity/thresholdを現行へ移さない。

### 責務区分と出力境界

許可済みsource event/assignmentは既存source owner（OS等）の責務区分、quality/acceptance oracleは既存要求owner、data/execution permissionは適用されるSECURITY境界に従う。固定親が定める責務区分を保ち、individual source/owner identityが不明な場合はそのidentityだけをunknownとして別に保持する。observer overheadの直接計測資源またはreceiptが不足する場合、値はunknownとして、その資源・receiptを提供する既存source owner責務区分へ無条件で返す。個別source/owner identityが不明なら、そのidentityだけをunknownとして別に保持し、責務区分を消さず、新ownerも作らない。CASE-10/15/19のように入力が有効で070自身の出力が誤る場合、入力側sourceへ返却せず当該出力処理を訂正する。

CASE-85–93、CASE-96–98、CASE-102–109およびCASE-131/132は、source event・oracle・threshold・計測許可・要求採択・実験/run許可・Worker assignment・rollback permission/execution・Recovery操作権限/実行・fresh/stale状態・evidence期限/適格性・受入境界/受入済み/escaped出力・L3承認・requirement completion・task success rate・Attempt success rateの出力生成を一つずつ拒否し、他の根拠あるscorecard fieldと既存状態を保つ。これらのCASEは固定親が禁じる生成の確認であり、権限/decisionを新設しない。CASE-99–101はAC-01のrevision照合、CASE-102–109はAC-04のRecovery・age由来判定・受入境界および状態出力の拒否、CASE-131/132は固定L2-068が禁じる2種のsuccess-rate出力の拒否であり、固定親が禁じる単独field生成を確認する。
