# HELIX-SECURITY Stage 1 基本設計

## 1. 範囲と親の固定

本書は、承認済みSECURITY Stage 1の19親に対する下流設計である。対象は `HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`。Stage 2cの `031`、後続Stage、Web／1.x sink enforcementは含めない。L3要件・L10検証設計の意味、値、owner、対象revisionを変更せず、実装や実行を表さない。

親の権威は本文metadataでなく、固定対象revisionと判断記録による。18親（001–016、020、028）は `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md` の固定revision `49318f1f1de5810dfc61fdfe3a2565b86509009d`、全体SHA-256 `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff` の採択行39–54、58、66に結ばれる。033は採択MPR `-002`とP0追補を含む別decision pinであり、要求source commit `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、decision file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、P0追加受入digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`に結ぶ。decision pin、L3/L10節の固定pin、現在の共通kernel設計revisionは別の参照である。

| 対象 | 固定親 | FR / AC / CASE | L3機能要件の対象節（固定本文） |
|---|---|---|---:|
| 001–016 | 各 `HELIXSECURITY-L2-NNN` | `SECURITY-FR-NNN-01` / `SECURITY-AC-NNN-01` / `SECURITY-CASE-NNN-01` | `functional-requirements.md:58–281`、親順 |
| 020 | `HELIXSECURITY-L2-020` | `SECURITY-FR-020-01` / `SECURITY-AC-020-01` / `SECURITY-CASE-020-01` | 同:282–295 |
| 028 | `HELIXSECURITY-L2-028` | `SECURITY-FR-028-01` / `SECURITY-AC-028-01` / `SECURITY-CASE-028-01` | 同:296–309 |
| 033 | `HELIXSECURITY-L2-033` | `SECURITY-FR-033-01` / `SECURITY-AC-033-01` / `SECURITY-CASE-033-01`…`-15` | 同:310–331 |

親の対象revisionは各判断pinの承認revisionに固定する。下表は、親ごとの固定L3/L10本文SHA-256を6文書すべてについて示す。値は [Stage 1 義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md) のSECURITY pin表と一致し、各承認revisionのGit blob bytesから再計算した。対象親は `HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`の19件であり、親へのpin割当は同crosswalkの親別表に従う。隣接する031節は親・義務・fixtureへ混ぜない。

| 親 | 判断pin / 承認revision | L3業務 | L3機能 | L3 NFR | L10業務 | L10機能 | L10 NFR |
|---|---|---|---|---|---|---|---|
| 001, 003–006, 008, 010–011, 013–016, 020 | `PIN-SECURITY-3f8e6f22` / `3f8e6f220eaeeab42618d97f005b5dab17bec66f` | `fcf2504a4fef152d1829fddb1a9d65397cb16114a6edbd964c619422da75097d` | `54d038fd20d5380aaee039682ecc07668f224d4b01143b48fcf37f4903ddeb4e` | `3fe1d98024d5a54e734ab8276ee3d55af78d743c7f1bf12b46b9d351139fe50b` | `717e206126b910a8261e5448227bb73b0961ac3dbf3f1f71a41ef487dc0f6ee5` | `36cff0854ed103c387616e91e3c6b032d9a0b0b14e749dc220e9ea97300e96d5` | `37d223cb22f8a7923662967ad501200e5f2a7e5f4db436a180d7af3affd0da9c` |
| 002, 007 | `PIN-SECURITY-5cea59c8` / `5cea59c85553b646311561048b5e13a8b9ff3ada` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` | `d2c1d93cf4fb142ba6abae13c7e640a7c9826f6c0ed5ce49de7991cb8f884c3b` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `0d81d49d2a16cb70b78b5ef7d0379e3b64632bbe18ac6fda9e3302f00c5bb40b` | `3675115f6d1b242a511651e627e8c46cfc71013ce9cf129c5045f1ce51e5f685` |
| 009, 012 | `PIN-SECURITY-09dda543` / `09dda5431bd92c23ea61a1a8adfe35547ecba655` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `d01a8a9a4e89ffc3f86ad377ea4a5f76cf3322c352cdad496388b3f09b2830b8` | `bd8533006ead1dacde26ad88733c88379bf7453d297211387564db053cbec59b` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `1ed95d5dee48a5c2effac2210a595c9b527dd40775ff98727878c24cbb2d7a14` | `a52d221d47f0ec92e1d14969ce322b7f1ff88200e8cdb574a63fd9fb06dcf2d7` |
| 028 | `PIN-SECURITY-cea18391` / `cea18391e3cad9af5df0fa9e3650fe136a885f46` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` | `d2c1d93cf4fb142ba6abae13c7e640a7c9826f6c0ed5ce49de7991cb8f884c3b` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `f37da9b01739f8a7718be2b6ff124c56c0a21342a8b32bae11337368f3480910` | `3675115f6d1b242a511651e627e8c46cfc71013ce9cf129c5045f1ce51e5f685` |
| 033 | `PIN-SECURITY-6098740c` / `6098740c61f2c6dbd6d59921bf05d594103a99f2` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` | `f6da676a3c816e6e845e7cc7c8e7711f9f0d9e4a6b8fa6a6c6595dd730aa8ea5` | `5b4a647220bea4192788ac937f9ee889574abb49639493f5e78edadc2950f66e` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` | `30b4e33419b617c0f7b2710f26e2aa8ae771b67e3fa29510aa01495e0200947a` | `444560c4ffe00c4a330d6b8a76ad2c86798be1bd4ab506886c96ce0cc4a40e43` |

## 2. 保持する意味と責務境界

SECURITYは既存の有効なoperation-specific authorityとpolicyを照合し、理由付きallow/deny/holdを返す。既決権限に毎回の人間承認を足さない。actor、target、operation、revision、environment、scope、expiryの7軸、operation入力、source分類、実適用観測は別の入力・責務として扱い、K3のqueryとpermission record、OS assignment、Worker実行環境、INFRASTRUCTURE観測、接続先ownerの意味を相互に代行しない。

L3業務要件にはこの19親に独立したbusiness identity／ACはない。L4/L9はSECURITYの判断やreceiptから業務成功、要件承認、canonical保存、LABO評価、BRAIN登録、OS assignment、CONNECT deliveryを作らない。各ownerの結果はそのownerに残し、機能ACの単体判定を機構横断の完了としない。

L3 NFRと対L10の適用は親表で固定した範囲に限る。SEC-NFR-001/002/003/004/005/006/007/008/014-01/028-01の数値・比較・fixture網羅率は、すべて検証設計上の根拠付き候補であり、承認済み実装値・実測値・SLOではない。特にexpiry候補A/Bはいずれも本設計で採択せず、retention、latency、quota、timeout、resource上限を補わない。候補測定の未観測/missing/unknown/staleを成功0件へ変換しない。

## 3. 現行共通kernelへの接続

接続先はmain `33bbe8cd5f080be9e400e9259db22645bc620eda`の共通kernel設計の固定bytesに示す既存契約である。L4 `common-kernel.md` 全体SHA-256 `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`の§10 K6、§15 K7/G5、§16 K3、§18 K8と、L9 `common-kernel-integration-verification.md` 全体SHA-256 `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`の既存IVを参照する。下表はそれらのAPIへSecurity固有のcurrent sourceを結ぶadapterの配置であり、独立authority/receipt/oracle語彙を作らない。

| 既存契約 | SECURITY Stage 1での利用 | 境界 |
|---|---|---|
| K3 `OperationAuthorityTuple` / `PermissionQuery` / `check_permission` | 各operationのactor・段階identity target・`to.composition` revision subject・operation・environment・scope・expiryと操作固有inputを分けて束縛する。SECURITY所有のcurrent authority declarationとpermission recordを照合する。 | 呼出側のquery/自己申告を許可としない。`Rejected(missing_key)`／Unknown／Stale／conflict／denyを肯定へ写さない。K3に未宣言のoperation kindやpermissionを作らない。purposeやegress条件はoperation inputであり、7軸tupleに混ぜない。 |
| K7 / G5 `request_move`, `apply_move`, `recover_move_observation`, `admit_effect`, `propagate`, `ledger_view` | revoke・quarantine・停止を既存OS/Worker/CONNECT/credential/artifact recipient graphへ束縛し、operation continuation fenceに使う。 | SECURITYはrecipient map/stateを創作せず、各ownerのstate変更を代行しない。G5の未達/未観測は肯定でない。K7 move authorization checkとpostcheck記録を既存契約どおり保持する。 |
| K8 `observe_input_label`, `observe_authority_effect`, `validate_label_transition`, `record_label_transition` | 001の外部入力classification、read-only、effectの分離に接続する。019等の隣接責務は新設しない。015/016のasset identity/classification記録はowner-declared current sourceとしてSECURITY固有adapterが受ける。 | K8汎用input-label APIが015/016のasset readerを実装するとみなさない。SECURITY固有adapterは未具体化であり、owner/source reader未解決なら影響するasset分類だけUnknownとする。SECURITY独自label/result/polarity、暗黙のdeclassificationを加えず、分類結果からtrust/permissionを作らない。 |
| K6 `required`, `admit_receipt`, `reverify` | ownerが宣言するsource bytes、既存verification result、必要なread setとassuranceを照合する。 | receiptの存在、bytes digest、reproductionはissuer authenticity、過去の実行事実、authority、物理enforcementを証明しない。`issuer_authenticity=Unknown(unsupported)`を維持する。 |

### 3.1 Security Stage 1 adapter

Adapterは既存owner宣言を固定参照から再読し、親ID／operation keyに対応するcurrent source slicesと既存API入力を構成する境界である。このadapterの呼出契約は次の形に限る。

```text
ProjectionNotApplicable = { projection_state: "not_applicable" }

resolve_security_stage1_case(parent: FixedRef, case: FixedRef,
                             input_heads: InputHeads)
  -> Observed<ResolvedSecurityCase> | Rejected(missing_key)

evaluate_security_stage1_case(resolved: ResolvedSecurityCase)
  -> SecurityCaseProjection {
       authority: PermissionCheck | ProjectionNotApplicable,
       label: ObservedLabel | Rejected(missing_key) | ProjectionNotApplicable,
       effect: Observed<EffectObservation> | Rejected(missing_key) | ProjectionNotApplicable,
       verification: RequiredResult | ProjectionNotApplicable,
       propagation: Observed<PropagationView> | ProjectionNotApplicable,
       source_refs: FixedRef[]
     }
```

`ResolvedSecurityCase`と`SecurityCaseProjection`はこのadapter内部の値である。`PermissionCheck`は共通K3の`PermissionCheckResult | PermissionCheckDiagnostic`をそのまま保持し、外側に`Observed`を重ねない。`label`はK8 `observe_input_label`の`ObservedLabel | Rejected(missing_key)`、`effect`はK8 `observe_authority_effect`の`Observed<EffectObservation> | Rejected(missing_key)`、`verification`はK6 `RequiredResult`、`propagation`はG5 `Observed<PropagationView>`をそのまま保持する。`InputLabel`という型や独自のAPI result unionは導入しない。

`ProjectionNotApplicable`は、固定親で当該APIが適用対象外であることをadapter内部で示すprojection sentinelであり、K1/K2状態、既存APIの返値、または新たな承認語彙ではない。適用対象外のslotはK1 componentとして合成しない。適用状態が不明ならsentinelを使わず、当該既存APIの`Unknown`／`Unobserved`を保つ。既存API diagnostic（K3 `PermissionCheckDiagnostic`、K8 `Rejected(missing_key)`など）は型と理由を変えず保持し、K1 `Observed`やK2保存結果を捏造しない。

`SecurityCaseProjection`自体には横断の`components`／`combined`を持たせず、K3 `PermissionCheckResult`の`components`／`combined`、K8 `ObservedLabel.classification`、K6 `RequiredResult`とG5 `PropagationView`の`combined`／assuranceを各APIの元の型のまま保持する。K1の合成が必要な場合は既存APIの契約に従う。将来、機構横断の合成が必要になった場合は、共通kernel K1 §2.5に従い、current完全keyと成分ごとの`PolarityOf`を明示して既存`combine`へ渡す。新しい`Observed<PermissionCheck>`等で包まない。API diagnosticと`ProjectionNotApplicable`はK1 componentとして捏造しない。owner戻し先は既存component evidence内の参照として保持し、独立state/result型を追加しない。case input不足でkeyを構成できないときは既存API diagnosticを保持する。

`evaluate`は一つの正準current lookup/evaluationを各既存APIへ委譲し、その返値・assurance・diagnosticを保存する。呼出側が渡すcontext、permission record、classifier、reader、recipient map、物理適用結果を信頼根にしない。source owner contractにないname/schema/endpointを補作せず、該当sliceだけを`Unknown(unregistered)`／`Unknown(missing_input)`／`Unknown(unsupported)`として返す。分類・許可の意味不足は該当SECURITY L2 owner、assignmentはOS、実行適用はWorker、物理環境の観測はINFRASTRUCTURE、descriptor/lifecycleはHARNESSへ戻す。未確認を欠落確定と同一視しない。

### 3.2 source-owner binding

| source slice | 所有者／reader | adapterの結合根拠 | 欠落・不明時 |
|---|---|---|---|
| SECURITY policy、operation required inputs、current effective permission | SECURITYのcurrent declarationとpermission record。K3 owner contractを使う。 | operationに対応する既存K3 `AuthorityDecl`とsource refを使う。targetは段階identity、revision subjectはtarget compositionの版とする。 | 影響するoperationだけをdeny／hold／Unknownとする。queryやtask outputで補わない。 |
| project／tenant／environment／assignment、Worker descriptor、assignment scope／current HEAD | OS assignmentおよび現行OS owner source。 | assignmentが宣言したidentity/refをK3 inputへ対応付ける。 | 影響するscope／dispatchを停止し、不足をOSへ返す。OS source自体が未登録なら`Unknown(unregistered)`。 |
| credential class／secret canonical classifier、asset identity／classification record、provenance | SECURITYの一元classifier/current declarationと各asset/source ownerの宣言。generic K8 input-label APIは001の外部入力に限り、asset側はK6 refsと未具体化のSECURITY固有adapterで読む。 | SECURITYがclassifier identity/revisionを宣言し、asset ownerがasset/source identityを宣言する。 | class／identity／source／adapterが不明なら該当operationをdeny／hold/Unknownとする。別consumerの分類やraw valueを使わない。 |
| effective execution constraint／enforcement status | SECURITY policyは要求値のowner、Worker execution environmentは適用者。 | K3の既存permission／operation inputと、ownerが宣言するexecution observationを別々のsource refで照合する。 | 適用不能または観測不能ならUnknownとし、該当dispatchを停止する。 |
| actual resource／network state | INFRASTRUCTUREのcurrent resource/environment observation。 | 対象resource/environment identityへ束縛されたowner recordを使う。 | 未観測はUnknownとする。`not-applied`は実観測で確認した場合だけ保持する。 |
| revoke／quarantine recipient graphとrecipientごとのstate | SECURITYは現行policy/triggerを、OS/Worker/CONNECT/credential/artifact ownerは各自のrecipient stateを宣言する。K7/G5を使う。 | 既存G5 recipient mapとowner declarationsをcurrent readする。 | source/map/recipientが未登録なら該当recipientだけをUnknownとする。recipient全体の閉包を推定しない。 |
| pack descriptor／update artifact lifecycle | HARNESSがdescriptorと共通交換／rollback／unfinished lifecycleを所有する。SECURITYは固有acceptanceのみを扱う。 | AC-028では既存HARNESS-L2-010/011 descriptorとSECURITY target/update artifact refsを結ぶ。 | 共通descriptorの不足はHARNESSへ、SECURITY integrity/authorityの不足は該当SECURITY ownerへ返す。 |

SECURITY Stage 1自身の入力や実行結果からsource ownerを推定しない。実際のproducer graphをcurrent sourceで照合できない場合、source completenessは`Unknown`とし、そのoperationの判定を保留する。これは19親すべてを一括停止する条件ではない。

## 4. 19親から既存APIへのtrace

この表の正例／negative／unknownは、固定L3/L10の合成fixtureを既存APIへ接続する設計であり、実測結果ではない。正例でも、正しいsource/owner bytesを構成できたことだけをPositive条件とし、物理enforcementや下流業務結果を別のreceiptで代用しない。

| 親 / AC | 主API・入力 | Positive条件 | negative／Unknownの境界 | 旧sourceの起点 |
|---|---|---|---|---|
| 001 / AC-001-01 | K8 `observe_input_label`、選択入力に対するK6 read refs | source/project/revision/classification definitionがcurrentで、外部入力をuntrustedとして保ち、read-onlyとeffectを分離する。 | 分類不能はUnknown/untrusted。readだけでinstruction/authority/persistence/trainingへ昇格させるのはNegative。source reader未登録はUnknown。 | EE5D、source-boundary 0327。 |
| 002 / AC-002-01 | K8 input/effect分離、別途authority operationが求められた場合のみK3 | 5つの合成命令例をdataとして保ち、policy/rule/source revisionを示す。 | 各直結変異を個別にdeny/holdする。境界を証明できない場合は該当downstream operationをUnknown/停止とする。完全なinjection detectorは要求しない。 | B62、EE5D。 |
| 003 / AC-003-01 | K3 tuple、OS assignment、INFRA environment refs | project/適用される場合のtenant/environment/assignmentを各resource参照へ明示し、接続内の正常caseだけを許可する。 | 各scope軸の個別drift、collision、missingを拒否する。owner source不明はUnknown。tenant runtimeやprimary-tree fallbackを作らない。 | B62、D461（隣接）。 |
| 004 / AC-004-01 | K6 source bytes read。config適用にoperation authorityが必要な場合のみK3 | root/HEAD/revision/digest/owner/scopeがcurrent config refに一致する。 | stale/unknown/別projectのconfigを拒否し、既定値で補わない。source未登録はUnknown。 | B62、0327。 |
| 005 / AC-005-01 | K3 credential-use query（purposeはoperation input）、K6 classifier/source read、該当時はK7/G5 revoke | 単一のcurrent classifierとscope-boundなnonpublic credential useが一致し、raw secretが露出しない。 | leak/raw/unknown class、direct store exposure、purpose欠落、expired/revokedをfail closedとする。consumer別classifierを作らず、evidenceへsecret bytesを記録しない。 | 99C9、B62、D461、capability lease decision。 |
| 006 / AC-006-01 | egress inputを持つK3 operation query、INFRA current path observation | sender/destination/protocol/path/class/bytes/purpose/authority/expiryの各条件が既存declarationに一致する。 | purpose/scope/tuple/sourceの各不一致はdeny。物理path不明はUnknown。quotaや1.x sink gateは追加しない。 | B62 CAP-004 partial。 |
| 007 / AC-007-01 | K3既存operation authority、K6 owner refsを介したWorker適用evidenceとINFRA observation | 宣言された9制約を個別に渡し、実際の適用をowner観測で確認する。 | いずれか1制約のmissing/unknown/unsupportedで該当operationを停止し、別制約のreceiptで相殺しない。not-appliedは実観測時だけ記録する。 | B62 CAP-006 partial、BC22（隣接）。 |
| 008 / AC-008-01 | K3 `check_permission` | 7 tuple axesと列挙済み11 operationの一つがcurrent recordに一致する。 | 各軸とoperation kindの置換を個別拒否する。read capabilityは他operationを許可しない。 | B62、1701 acceptance design。 |
| 009 / AC-009-01 | K7/G5 `propagate`、`admit_effect`、既存K3 current permission | 適用対象として宣言されたrecipient集合と各owner stateを観測し、無関係なoperationを停止しない。 | revoke/scope drift/leak/abnormal communication/runtime deviation/unknownのfixtureを個別に扱う。該当recipientのmissing/unobservedはnon-positiveのまま保持する。 | D461 SEA intentは隣接起点のみ（L2-009から意味を再導出）、BC22、1B41。 |
| 010 / AC-010-01 | K6 source/provenance reads。影響するoperationに限りK3 | 必要なversion/digest/dependency/permission/network/finding/rollback evidenceを15 candidate typesごとに保持する。 | 各fieldのmissing/unknownでacceptしない。新しいversionだけではPositiveにしない。 | EE5D／44DDは隣接起点であり、完全一致する旧owner contractはない。 |
| 011 / AC-011-01 | K6 before/after source refs。capability operation評価時はK3 | version/configとcapabilityの差分を同じtargetへ対応付ける。 | 同じfilename/hashだけでcapability不変を証明しない。比較不能なsourceはUnknown。 | EE5D／44DD。 |
| 012 / AC-012-01 | source/producer/version/digest/dependencies/permissions/network/risk/update/rollbackのK6 provenance refs | currentとして確認したfieldを宣言producerとsourceへ追跡する。 | unknown field listを保持し、unknownをtrustedへ昇格しない。scanner/registry/providerを必須にしない。 | EE5Dは隣接起点、source-boundary 0327。 |
| 013 / AC-013-01 | K6 chain refsと既存verifier result。該当authorizationに限りK3 | build/validation/distribution/execution artifactのidentity chainとproducerを一致させる。 | producer単独欠落、工程欠落、digest mismatchで昇格させない。digestが証明するのはbytesだけ。 | EE5Dは隣接起点、1701 legacy acceptance consumer。 |
| 014 / AC-014-01 | K6 source/classification refsとSECURITY固有owner-declared adapter。要求operationに必要な場合のみ既存K3 permission | memory/training/BRAIN target class別に理由付きSECURITY判断を行う。 | target/source/classのunknownまたは不一致はhold/deny。handoff、save、LABO評価、BRAIN登録を含意しない。K8汎用input-label APIはこのasset分類readerを実装しない。adapter/source ownerが未解決なら該当target判断だけUnknown。 | EE5D/B62は隣接起点のみ。完全一致する旧契約なし。 |
| 015 / AC-015-01 | K6 asset identity/metadata refsとSECURITY固有owner-declared adapter | 同じasset revision内でidentityを安定させ、revision/digestが変われば別versionとして扱う。content dumpはしない。 | owner/identity不明はunclassified/Unknown。Web保護の成立を主張しない。K8汎用input-label APIをasset identity readerとは扱わず、adapter/source ownerが未解決なら該当assetだけUnknown。 | EE5D（隣接）。 |
| 016 / AC-016-01 | K6 current definition/record refsとSECURITY固有owner-declared classification adapter | 固定L2の6分類とclassification-record metadataをL2-015 asset identityへ結ぶ。 | missing/stale/mismatched/unknownはUnknownのまま。public/allowへ写さない。1.x sink enforcementは対象外。K8汎用input-label APIはasset classification readerを実装せず、adapter/source owner未解決なら該当分類だけUnknown。 | EE5D partial。 |
| 020 / AC-020-01 | 明示authorityにはK3、current deterministic rule refsにはK6。optional INTELLIGENCE inputは別成分 | Botなしでも8つのdeterministic Guard責務を維持し、Botはoptional semantic inputとして分離する。 | rule/observation未登録はUnknown/holdとしてenforcement ownerへ返す。Botにdecisionやblanket writeを与えず、1.xは対象外。 | EE5D、44DD（隣接）。 |
| 028 / AC-028-01 | current HARNESS descriptorとSECURITY artifact/provenanceのK6 refs。acceptance operationにauthorityが必要な場合のみK3 | descriptor field/scope、SECURITY candidate、verifier result、target/update artifactのidentity/version/digestを一致させる。 | descriptor欠落はHARNESS ownerへ、integrity mismatchはSECURITY L1-013へ返し、unknownはacceptしない。共通lifecycleはHARNESSが所有する。 | legacy searchはFR-028に記録済み。直接一致するowner contractは確認されていない。 |
| 033 / AC-033-01 | K3 operation authority、K6 source/descriptor/evidence、該当時K7/G5、OS assignment、Worker observation、INFRA physical observation | 既存assignment、descriptor、current HEAD、authority/rule revision、task boundaryが一致する。既存条件が揃うscoped credential useへper-task approvalを追加しない。 | 各binding fieldの変更/unknownは影響するdispatchだけを停止する。raw secretやsecret/confidential task contentはdeny。observed not-appliedとunobservedを区別する。provider/additional-runtime名で条件を狭めず、Worker outputからstate/authorityを作らない。 | 02319 P2-05とB62 CAP-007は別の隣接atom。BC22、1B41。 |

## 5. 旧sourceと変更理由

旧資産は意味の再導出源およびfailure/consumer根拠として読んだ。旧CLI/runtime/test/CIは実行せず、旧ledgerのstatusも昇格しない。

| asset ID／source path:lines／全体SHA-256 | 保持点 | Stage 1で変えた点と理由 |
|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | raw input／trusted metadata／instructionを分離する。 | 対象・owner・分類を現行L2から再導出し、旧P8全体は引き継がない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:30–44,109–151,160–166` / `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | 型付きauthority axes、target binding、fail-closedの意味を保つ。 | K3の現行query/record/context contractへ再導出し、旧schema/runtime/CAP連番は移さない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:20–24,28–42,60–70` / `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | unknownはallowでないこと、effect前driftでは作用0、effect後mismatchでは不確実性を保持すること。 | K3/K6/K7/K8の現行result型から再導出し、旧API/schema/signature/runtimeは移さない。 |
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–42,55–58` / `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | decision/approval/dispositionを分け、approvalをexact bindingする。 | 過去のcandidateを新authority語彙や承認gateにせず、現K3型に限定する。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:1–59` / `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | authority tupleのdriftとnegative fixtureを個別に試すconsumer設計を保つ。 | 古いoracle/runtimeを実行・合格証拠化せず、L10固定caseを現行K3へ対応付ける。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:24–25,33,39–44` / `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | owner recipientへの停止伝播の隣接意図を保つ。 | L2-009の意味に限定してG5から再導出する。旧SEA全scopeを採択せず、遅延閾値も設けない。 |
| `LEGACY-ASSET-99C939E249CAF40935CB` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61–64` / `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2` | secret predicateを単一の正本へ集約する。 | SECURITY L2-005のcanonical classifier identity/revisionから再導出し、旧実装は移さない。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:133–136` / `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | cancellation/reassignment後の遅延作用を止めるfailure sourceを保つ。 | K7 fencing/current permissionから再導出し、旧runtimeは復帰させない。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` / `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-009-node-python-linux-runtime.md:113–120` / `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | 明示rollbackとautomatic fallbackを区別する。 | K7のunfinished/rollback-required stateを使い、自動rollback/fallbackは追加しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120` / `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 過去のacceptance設計とrisk/changeの隣接例を、旧consumer境界として保持する。 | 現行のAC-010/011の意味は固定L3/L2から再導出する。旧test、runtime、oracleは実行・移植せず、44DDを完全一致するcurrent owner contractとして扱わない。 |
| `LEGACY-ASSET-02319C2481B9E01698D5` / `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:428` / `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 旧HR-FR-P2-05を独立した隣接source atomとして保持し、B62 CAP-007との同一視を避ける。 | HR-FR-P2-05は現在のL2-033 credential-use／Worker dispatch意味の根拠ではない。033は採択MPR-002/P0補正から再導出し、旧requirement本文を移さない。 |

source-boundary sourceのeffect前後の不一致、authority acceptanceのfield別negative、runtimeの遅延作用、ADRのfallback失敗をconsumer/failure根拠として保持する。L4 K6の既存設計では保存receiptやdigest一致は発行者真正性を証明しないため、SECURITYもreceiptを許可や実適用の代用にしない。source/ownerが未確認のときは架空のpermission record、receipt、enforcement declarationで補わず、該当operationだけをUnknown/holdにする。

## 6. 配置と未解決境界

L9対は各親のL3 AC/L10 CASEをcommon-kernelのIV-K3、IV-K7/G5、IV-K8、IV-K6へ対応付ける。SECURITY専用の実行test、CLI、policy値、架空source declarationは追加しない。physical enforcement／assignment／source producer graphをcurrent owner contractから再構成できない親のoperationは未確定である。特にSEC-NFR-006/SEC-NFR-007の実適用／expiry測定候補と033の個別physical sourceは設計fixtureであり、観測事実ではない。unknownは影響するoperation/scopeに限り、他親の設計や意味を一括停止しない。
