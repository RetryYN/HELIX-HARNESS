---
title: "HELIX-SECURITY Stage 1 詳細設計"
layer: L5
status: design_pair_defined
owner: HELIX-SECURITY
base: main `f0ba62ce833463eb5f747ac4b95659ecea49928a`
paired_l4: ../L4-basic-design/stage1-security.md
paired_l9: ../L9-integration-verification/stage1-security-integration-verification.md
---

# HELIX-SECURITY Stage 1 詳細設計

## 1. 固定範囲とsource

本書はmain `f0ba62ce833463eb5f747ac4b95659ecea49928a`上のSECURITY Stage 1 L4/L9に対するL5設計である。L4本文SHA-256は`71504a3c76512e8aa9c249eb229f7ecb25c9c350219d8a4b221c29d753767f68`、L9本文SHA-256は`41c23cd12c9717f2479e40017c62f1221efe55525507c6d2e48a56f06bb6e9a6`。L9の一方向`paired_l4_sha256`は同じL4 bytesを指す。両本文は既存設計sourceであり、このL5/L8草稿がL3承認、実装、実行、受入を意味しない。

対象は固定L2/L11の`HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`の19親、19 AC、33 functional case、適用表で指定された10 NFR候補とそのL10測定だけである。Stage 2cの031、後続Stage、1.x/Web sink適用、共通pack lifecycleは含めない。19親の対象revisionとdecision authorityは[Stage 1義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)のSECURITY親別表とL4 §1に従う。decision pin、各親のL3/L10固定bytes、現在のcommon-kernel bytesは別々の参照である。

| 固定文書 | 本worktreeで再計算した全体SHA-256 |
|---|---|
| L3業務 `L3-requirements/business-requirements.md` | `30a0456a17c4c65e9427cc8931905cb7c1adf54c207514f948a7b179dcdb7019` |
| L3機能 `L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |
| L3 NFR `L3-requirements/nfr-grade.md` | `d2c1d93cf4fb142ba6abae13c7e640a7c9826f6c0ed5ce49de7991cb8f884c3b` |
| L10業務 `L10-verification/business-verification.md` | `7da2a3b88c866c276065c793036708a633109b176b0381829c8d3c8293ff70a4` |
| L10機能 `L10-verification/functional-verification.md` | `0d81d49d2a16cb70b78b5ef7d0379e3b64632bbe18ac6fda9e3302f00c5bb40b` |
| L10 NFR `L10-verification/nfr-verification.md` | `3675115f6d1b242a511651e627e8c46cfc71013ce9cf129c5045f1ce51e5f685` |

L4の親別pin表には、19親それぞれの対象revisionに対する6本文のexact SHAが記載されている。同じPIN集合に属する親でも、承認revisionやfunctional spanが異なる場合はcrosswalkの親別scopeへ戻る。本書は親別本文やdecisionを複製せず、別revisionへ自動適用しない。

## 2. 保持する要件意味と境界

SECURITYは既存のoperation-specific authorityとpolicyの読取り照合を行い、理由付きallow/deny/hold相当の既存判定をprojectionする。新しい許可、permission kind、tuple軸、人間approval actor、approval gate、receipt型を作らない。通常有効な既決権限に毎回の人間承認を足さない。L4 §2〜§4にある親別条件、unknown範囲、owner戻し先を維持する。

既存K3のauthority tupleはactor/target/operation/revision/environment/scope/expiryの7軸である。target identityとrevision SubjectRefのidentityは同一と仮定せず、既存owner declarationで対応を解決する。11 operation（read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change）は別々に評価する。credential purposeとegressのsource/destination/data classification等はK3の宣言済みoperation inputとして扱い、7軸へ追加しない。必須input集合は既存`AuthorityDecl.required_inputs`とsource adapterから得る。callerが渡すplain context、permission record、classifier、recipient map、実適用結果は信頼根にしない。

L3業務の独立business identity/ACはない。SECURITY判定、receipt、分類、assignment、transport、verificationをbusiness success、approval、canonical save、LABO評価、BRAIN登録、実行完了へ変換しない。L3/L10のNFR数値・比較・coverageは根拠付き検証用技術候補であり、採択済み実装値・実測値・SLOではない。候補なしの親へlatency、retention、quota、timeout値を補わない。

## 3. 共通kernelとの接続

このL5はmain fixed bytesのcommon-kernel L4 `docs/helix-harness/L4-basic-design/common-kernel.md`（SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`）とL9 `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`（SHA-256 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`）の既存契約へ接続する。SECURITY L4 §3のcommon-kernel参照は旧固定設計bytesを指す歴史的source pinであり、現在契約の上書き定義ではない。利用時の型/APIはこの節で固定したcurrent main bytesを読む。

| 既存契約 | SECURITYでの読取り・projection | してはならない変換 |
|---|---|---|
| K1/K2 | 各既存APIの型付き結果、完全なcurrent key、Stale/Unknown/Unobserved/Rejectedを保持する。 | API別の結果を架空wrapperやSECURITY独自のcombinedへ変えない。 |
| K3 §16、IV-K3-01…17・IV-K3-14a…14j | `resolve_authority_context`と`check_permission`へquery、expected input heads、permission SubjectRefを渡し、`PermissionCheck`（`PermissionCheckResult | PermissionCheckDiagnostic`）を元型で保持する。current declaration/sourceから一意に解決された有効決定だけを利用する。 | grant/record発行、context偽造、7軸拡張、欠落input補完、同じtarget identityとrevision identityの強制、K6 receiptからの許可生成。 |
| K6 §10 | `required`/`admit_receipt`/`reverify`の既存read-set、assurance、diagnosticを照合する。必要source refsはcurrent owner宣言から導く。 | receiptの存在・digest・再現をissuer authenticity、過去の実行、物理enforcementの証明と扱う。`issuer_authenticity=Unknown(unsupported)`を保つ。 |
| K7/G5 §15 | `RecipientMap`/`RecipientDecl`、K10 graph/impact/review、K6 receipt由来のrecipient状態はG5 owner契約に属する。`propagate(revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads) -> Observed<PropagationView>`を読み取り導出として呼ぶ。 | G5の状態をSECURITYが変更すること、`propagate`のObserved projectionをeffectful appendと扱うこと、global stop/autofallback、未観測を欠落確認にすること。recipient stateはG5の戻り値を保持し、新read APIやsourceを設けない。 |
| K8 §18 | 001/002の外部入力label/effect/transition分離に`observe_input_label`、`observe_authority_effect`、`validate_label_transition`を適用する。 | 汎用K8 input-label APIを015/016 asset identity/classification readerとみなさない。asset側はowner-declared current sourceとK6 refsを使う未具体化adapterに留める。 |

L4 §3.1の`ResolvedSecurityCase`、`SecurityCaseProjection`、`ProjectionNotApplicable`はSECURITY adapter内部のprojection値である。`resolve_security_stage1_case`の戻り値は`Observed<ResolvedSecurityCase> | Rejected(missing_key)`であり、既存診断型を新しいunionで包まず、slice単位のUnknown/UnobservedはObserved payload側に保つ。`ProjectionNotApplicable`は固定caseでAPIが非適用と確定した場合だけの内部sentinelで、適用不明には使わず、K1/K2へ合成しない。K1合成を将来必要とする場合はK1 §2.5のcurrent完全keyと成分別`PolarityOf`で既存combineを使い、API診断やsentinelを成分として捏造しない。

## 4. 詳細componentと固定参照

以下はL6へ渡すdata/API候補であり、外部writerやsecurity action portではない。

```text
SecurityCaseRef = { parent: FixedRef, case: FixedRef }
OwnerInputRef   = { owner: existing owner identity, role: declared role, source: SubjectRef }
SecurityInputProjection = {
  case_ref: SecurityCaseRef,
  input_refs: OwnerInputRef[],
  permission: PermissionCheck | ProjectionNotApplicable,
  label: ObservedLabel | Rejected(missing_key) | ProjectionNotApplicable,
  effect: Observed<EffectObservation> | Rejected(missing_key) | ProjectionNotApplicable,
  verification: RequiredResult | ProjectionNotApplicable,
  propagation: Observed<PropagationView> | ProjectionNotApplicable,
  source_refs: FixedRef[]
}
```

`OwnerInputRef`のrole名はSECURITY adapterが固定ケースごとに宣言する入力aliasで、別ownerのsource identityをSECURITYへ移す表現ではない。K3のqueryにある`target`と`revision`、permission record、operation inputの関係はcurrent owner declarationから解決する。query inputの欠落やref collisionでK2 keyを構成できない場合はK3 APIの`PermissionCheckDiagnostic(reason: missing_key)`をそのまま保持し、Unknown resultを捏造しない。

SECURITYのcase action名とK3 operationの対応は、このL5が新しい対応表を作らず、current SECURITY ownerの既存`OperationDecl`を読む。actor/environmentは`PermissionQuery`へ追加する引数ではなく、OS assignmentとINFRASTRUCTURE environment declarationのcurrent sourceから解決し、queryの既存fieldへ束縛する。K3 operationはSECURITY action名から推測せず、current SECURITY ownerの既存`OperationDecl`で対応付ける。operation declarationがない場合にaction名からK3 operationを推測しない。

現行source bindingは次の組でだけ解決する。

| 入力slice | source owner / consumer | 解決と未確定の扱い |
|---|---|---|
| SECURITY policy、operation declaration、effective permission | SECURITY current owner declarationとその登録済permission source | queryで過去recordを選ばずcurrent effective decisionを一意解決する。未登録・current不在・競合は影響operationのK3 non-positive。 |
| project/environment/assignment/Worker descriptor/HEAD | OS assignmentと各current OS owner source | OSが宣言したidentity/refをoperation入力へ束縛。assignment不足は該当scope/dispatchだけUnknown。 |
| credential class、asset identity/classification、provenance | SECURITY classifier/current declarationとasset/source owner declarations | 001はgeneric K8 input label。015/016 asset readerは専用adapterが未具体化のまま。classification unknownをpublic/allowへ写さない。 |
| execution constraintの要求値と適用観測 | SECURITYはpolicy要求、Worker execution environmentはenforcer、INFRASTRUCTUREは物理状態観測 | 宣言・受渡し・適用・観測を別refsにする。観測無しはunknown、実観測でnot-appliedを確認した状態と区別する。 |
| revoke recipient map/state | SECURITYのtrigger/policy、OS/Worker/CONNECT/credential/artifact owner各自のstate | G5 `propagate`をread-derived projectionとして呼び、G5が返すrecipient/obligation stateをそのまま保持する。SECURITYはstateを変更せず、`admit_effect`も呼ばない。 |
| pack descriptor/artifact/update lifecycle | HARNESS descriptor/lifecycle、SECURITY固有artifact/provenance | 028はHARNESS-L2-010/011 descriptorとSECURITY target/update refsの照合のみ。共通交換/rollback/unfinished obligationはHARNESSへ残す。 |

実際のproducer graphやcurrent owner declarationからsource completenessを照合できない場合はUnknownである。入力の自己申告、sourceの省略、0件のproducerをpositive completenessとして扱わない。OS assignmentの存在は実enforcementを証明せず、OS/Worker/SECURITY自己申告は物理観測を代替しない。物理観測でnot-appliedが確認された結果と単なるunobservedを分ける。unknownは影響operation/recipientだけへ局所化する。

## 5. 関数・API候補と責務境界

関数候補はL6で具体化する純粋projection/read-only処理である。新しいAPI result union、grant、dispatch、network、credential read、write、revoke、quarantine、rollback、secret保管を本書では作らない。

| 候補 | 入力と戻り値 | 責務 / no-effect境界 |
|---|---|---|
| `resolve_security_case(parent_ref, case_ref, input_heads)` | `Observed<ResolvedSecurityCase> | Rejected(missing_key)` | 固定parent/caseから必要な既存owner refsを解決する。sliceのUnknown/UnobservedはObserved payload側に保持する。caller refsは期待値で、owner current refsを選択しない。 |
| `project_permission(resolved, query, permission_ref, input_heads)` | `PermissionCheck` (= `PermissionCheckResult | PermissionCheckDiagnostic`) | K3 current declaration/effective decisionを一度照合し、全components/assurance/diagnosticを保持する。許可を発行しない。 |
| `project_external_label(resolved, source_ref)` | `ObservedLabel | Rejected(missing_key)` | K8 generic input labelをL2-001/002の外部入力用に読む。asset classificationへ流用しない。 |
| `project_effect(resolved, effect_ref)` | `Observed<EffectObservation> | Rejected(missing_key)` | 既存effect observationを読む。`authority_effect=none`を許可/実適用へ変換しない。 |
| `project_verification(resolved, operation, base_key, verifier_set, reverify)` | `RequiredResult` | K6の`required(operation, base_key, verifier_set, reverify)`を呼び、既存required verificationとassuranceを保持する。 |
| `project_propagation(resolved, revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads)` | `Observed<PropagationView>` | G5 `propagate`の全引数と戻り値をそのまま接続するread-derived projection。recipient/obligation stateを更新せず、K7 `admit_effect`とは別APIである。 |
| `evaluate_security_case(resolved)` | `SecurityInputProjection` | ひとつのcurrent lookup/evaluation結果を正確な型で束ねてadapter projectionする。各APIの型を混在させた独自K1合成を行わない。 |
| `project_parent_obligations(parent_ref, projection)` | `SecurityCaseProjection`相当の内部struct | 19 parentのAC/API/owner戻しを対応表へ射影するだけで、L3/L10判定や完了を生成しない。 |

**K6 domain-field absence projection candidate（AC-004/015/016）**：固定L3 `SECURITY-AC-004-01`とL4 AC-004は構成sourceのidentity field/revision/digest/scopeを照合し、欠落をdefaultで補わず、owner unknownをunknownのまま保つ。L4 AC-015/016もasset/classification recordのdomain field欠落を`unclassified/Unknown`として扱う。K6 source/readerが登録済みでbytesを完全に読めた後、これらのrecordで必須domain fieldが存在しない場合は、該当K6 componentを既存`Unknown(missing_input)`として保持する。これは完全読取済みrecordのfield欠落を表す技術投影候補であり、新しいK1 variantではない。`Unknown(unregistered)`はsource/reader登録自体がない場合、`Unknown(unreadable)`は登録済みsourceの読取が不能な場合、`Rejected(missing_key)`は必要な`SubjectRef`/K2 key構成fieldが欠ける場合に限る。これらを混同せず、default値をsource observationにしない。

### 5.1 L4 APIとの名称対応

| L5 adapter名 | 対応するL4名・形 | 差分の扱い |
|---|---|---|
| `resolve_security_case(parent_ref, case_ref, input_heads)` | `resolve_security_stage1_case(parent, case, input_heads)` | L5の短縮名。戻り値はL4どおり`Observed<ResolvedSecurityCase> | Rejected(missing_key)`。 |
| `evaluate_security_case(resolved)` | `evaluate_security_stage1_case(resolved)` | L5の短縮名。戻り値`SecurityInputProjection`はL4 `SecurityCaseProjection`と同じslots/typesを保持する。 |
| `project_permission` | `SecurityCaseProjection.authority`を構成するK3 `resolve_authority_context` / `check_permission` adapter | 既存K3 `PermissionCheck` unionを保持し、新fieldを`PermissionQuery`へ追加しない。 |
| `project_external_label` | `.label`のK8 `observe_input_label` | `ObservedLabel | Rejected(missing_key)`を保持する。 |
| `project_effect` | `.effect`のK8 `observe_authority_effect` | `Observed<EffectObservation> | Rejected(missing_key)`を保持する。 |
| `project_verification` | `.verification`のK6 `required(operation, base_key, verifier_set, reverify)` | 既存`RequiredResult`、assurance、diagnosticを保持する。 |
| `project_propagation` | `.propagation`のG5 `propagate(revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads)` | `Observed<PropagationView>`を保持する。read-derived projectionでありappendではない。 |

fresh K3 checkで同identity・別revisionを観測した場合はK3の新しいkeyのnegative decisionを保ち、K1 `Stale`とはしない。K1/K2 lookupが過去保存結果のstaleを返した場合はStaleを保つ。同revision異digestはUnknown(conflict)、current decisionが不在または非一意ならUnknown(missing_input/conflict)、key必須ref不足は既存API diagnosticのmissing_keyである。結果を省略・採否へ集約しない。

## 6. 19親のL3 AC / L10 functional CASE trace

各行は既存固定L9 verifierへの詳細実装候補であり、L10 sourceを再定義しない。L8に正例/negative/unknownの個別oracleを置く。

| 親 / AC / CASE | component・入力参照 | 期待するL5投影とfailure境界 |
|---|---|---|
| HELIXSECURITY-L2-001 / SECURITY-AC-001-01 / SECURITY-CASE-001-01 | K8 label、K6 source refs | 外部入力source/project/revision/classificationを持つuntrusted input。read-only観測とeffectを分離。分類不能はunknown/untrusted。 |
| HELIXSECURITY-L2-002 / SECURITY-AC-002-01 / SECURITY-CASE-002-01 | 001のlabel/input refs、policy/rule source refs | 固定5命令様入力はdataのまま。Tool args/system instruction/permission/credential/policy直結を個別に拒否。検出器完全性は要求しない。 |
| HELIXSECURITY-L2-003 / SECURITY-AC-003-01 / SECURITY-CASE-003-01 | K3 scope/assignment、INFRA environment、CONNECT declared connection refs | project/適用tenant/environment/assignment/worktreeを明示。cross-project、resource越境、collision、fallbackを拒否。tenant軸を捏造しない。 |
| HELIXSECURITY-L2-004 / SECURITY-AC-004-01 / SECURITY-CASE-004-01 | K6 config source identity/revision/digest refs | 10 config種をproject/root/HEAD/revision/digest/owner/scopeへ束縛。欠落/stale/他project/unknownをdefault補完しない。 |
| HELIXSECURITY-L2-005 / SECURITY-AC-005-01 / SECURITY-CASE-005-01 | K3 credential-use query、L2-005 canonical classifier、K6 source read、該当時K7/G5 | 既存nonpublic scoped useを値露出なしで照合。raw secret、repository混入、直接store、egress漏えい、expiry/revoke、classifier driftを別々に扱う。 |
| HELIXSECURITY-L2-006 / SECURITY-AC-006-01 / SECURITY-CASE-006-01 | K3 egress operation inputs、INFRA path observation | sender/destination/protocol/endpoint/path/class/bytes/purpose/authority/expiryを照合。physical path unknownはINFRAへ返す。1.x sink/quotaを加えない。 |
| HELIXSECURITY-L2-007 / SECURITY-AC-007-01 / SECURITY-CASE-007-01 | K3 current authority、Worker constraint refs、INFRA observations、K6 receipts | 9制約の宣言・受渡し・適用・観測を区別。他制約greenで欠落を相殺しない。 |
| HELIXSECURITY-L2-008 / SECURITY-AC-008-01 / SECURITY-CASE-008-01 | K3 `PermissionQuery`, `PermissionRecord` refs | 11 operationごとに7軸を照合し、operation別current decisionを返す。read/Agentから他operation grantを作らない。 |
| HELIXSECURITY-L2-009 / SECURITY-AC-009-01 / SECURITY-CASE-009-01 | K7/G5 recipient map/state、K3 current permission | 6 triggerごとのrecipient stateをG5 `propagate`の`Observed<PropagationView>`として読み取り導出し、受領/適用/未達/unobservedを保持する。SECURITYはowner stateを変更せず、`admit_effect`を呼ばない。 |
| HELIXSECURITY-L2-010 / SECURITY-AC-010-01 / SECURITY-CASE-010-01 | K6 provenance/source refs、該当時K3 authority | 15 asset種のprovenance/digest/dependency/permission/network/config/finding/rollback差分を個別保持。新versionだけで採らない。 |
| HELIXSECURITY-L2-011 / SECURITY-AC-011-01 / SECURITY-CASE-011-01 | K6 before/after capability source refs | version、capability、impactを同一対象へ束縛。hash/filename一致のみから不変を推定しない。 |
| HELIXSECURITY-L2-012 / SECURITY-AC-012-01 / SECURITY-CASE-012-01 | K6 source/producer/dependency/provenance refs | source、producer、version、digest、dependency、permission、network、risk、update、rollbackをfield単位で追跡。scanner/providerを要求しない。 |
| HELIXSECURITY-L2-013 / SECURITY-AC-013-01 / SECURITY-CASE-013-01 | K6 build/validation/distribution/execution chain refs | artifact chain identity/version/digest/provenance/producerを照合。digest一致からtrust/verifier passを導かない。 |
| HELIXSECURITY-L2-014 / SECURITY-AC-014-01 / SECURITY-CASE-014-01 | K6 source/provenance/classification refsとSECURITY固有adapter | memory/training/BRAIN target別の理由付きSECURITY判定だけ。handoff/save/LABO/BRAIN結果を含めない。adapter未解決は対象だけUnknown。 |
| HELIXSECURITY-L2-015 / SECURITY-AC-015-01 / SECURITY-CASE-015-01 | asset owner refs、K6 identity metadata、未具体化SECURITY asset adapter | 固定列挙資産と非列挙資産をowner/identity/source/revision/digestで識別。revision/digest変更は別版。内容dumpや1.x protectionを要求しない。 |
| HELIXSECURITY-L2-016 / SECURITY-AC-016-01 / SECURITY-CASE-016-01 | L2-015 identity、classification definition/record owner refs | 6分類と分類record自身のowner/source/revisionをasset identityへ結ぶ。資産metadataとの混同やunknown→publicを拒否。 |
| HELIXSECURITY-L2-020 / SECURITY-AC-020-01 / SECURITY-CASE-020-01 | K6 deterministic rule refs、該当operation K3、optional INTELLIGENCE inputは別成分 | 8 Guardの決定的条件をBotなしでも保つ。Botは必要時のsemantic inputでauthorityを持たない。1.x sinkは対象外。 |
| HELIXSECURITY-L2-028 / SECURITY-AC-028-01 / SECURITY-CASE-028-01 | HARNESS descriptor refs、SECURITY candidate/artifact/provenance、K6 verifier refs | descriptor/version/scope/dependency rangeとactual target/update artifact identity/version/digestを照合。共通lifecycleはHARNESS owner。 |
| HELIXSECURITY-L2-033 / SECURITY-AC-033-01 / SECURITY-CASE-033-01–SECURITY-CASE-033-15 | K3 authority、OS assignment、Worker descriptor/HEAD、K6 source/observation、K7/G5該当時 | fixed bindingとowner分離を15個別caseで維持し、assignment scope変更はcurrent K3 queryへ反映する。有効な既存 scoped credential-useだけを理由にdenyしない。raw secret/機密task内容は個別deny。未観測と観測済not-appliedを分ける。 |

## 7. L3 NFR候補とL10測定へのtrace

親適用条件と値はL3 NFR/L10 NFRの固定sourceをそのまま使う。すべて「検証用技術候補」であり、採択済みruntime値や測定結果ではない。

| candidate | 親/AC | component・fixture | non-positive境界 |
|---|---|---|---|
| SEC-NFR-001 | 005, 033 | synthetic markerをcontext/log/artifact/Tool result/Worker payload/environment等へ置き、値を書かないmatcherで出力を照合 | raw value露出0候補。発見時は該当operationを停止しcredential/security ownerへ。 |
| SEC-NFR-002 | 008 | 7 tuple軸を各単独driftしexact positiveと比較。purposeは別operation input。 | drift時allow 0候補。tuple漏れ・purposeの誤混入は未達。 |
| SEC-NFR-003 | 016 | 6分類とmissing/unknown、classification record binding | 6/6区別、unknown→public/allow 0候補。1.x sinkは分母外。 |
| SEC-NFR-004 | 020 | 8 GuardについてBotなし/optional Bot、rule未定義/不適用/観測欠落比較 | deterministic委譲0、条件抜け0候補。Bot稼働数は合否にしない。 |
| SEC-NFR-005 | 009 | scopeごとのrecipient集合、受領/適用/未達/unobserved、無関係scope対照 | 未達/unobservedをsuccess扱い0、global stop 0候補。latency値なし。 |
| SEC-NFR-006 | 007 | 9制約の型付き宣言値、requestからWorker適用観測までの対応。timeout/resourceだけはowner宣言の数値境界を比較する。 | 欠落0候補。未宣言timeout/resource値は補わずunknown。その他の制約はownerが宣言した型・許可集合・状態境界だけを照合し、数値順序を作らない。 |
| SEC-NFR-007 | 005/008/009/033 | expiry直前/境界/直後、resume/retry、revoke/binding/HEAD drift | current再照合前のallow 0候補。A/B expiryは未採択の解釈で本設計でも採択しない。 |
| SEC-NFR-008 | 005/009/010/013/033 | owner宣言window中のsource/revision/reason/recipient stateとraw-secret-free evidence | window未宣言なら未評価。retention期間を新設しない。 |
| SEC-NFR-014-01 | 014 | memory/training/BRAIN target別のsource/provenance/classification/decision/reason field | target trace欠落0候補。handoff/save/LABO/BRAIN成功は含めない。 |
| SEC-NFR-028-01 | 028 | descriptor field/scope/target-artifact identity/version/digestの独立fixture | finite fixture上のcoverage/誤受入候補のみ。unknownをpassにしない。共通lifecycleは除外。 |

## 8. 旧HELIX source、保持、変更、consumer/failure根拠

次のarchive sourcesは読取り専用で該当spanを確認し、SHA-256を再計算した。資産台帳のhistorical/unresolved statusはこの表から昇格しない。旧CLI/runtime/test/CIを起動せず、旧コードをコピーしない。

| asset ID / source path:span / 全体SHA-256 | 読み取った旧consumer/failureと保持点 | Stage 1での再導出・変更理由 |
|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | HR-FR-P8-04とHR-NFR-P8-02。raw input/trusted metadata/executable instructionの区別を保持。 | 001/002と更新/provenanceの意味は固定L2から再導出。旧P8全scope、approval policy、riskを移さない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:30–44,109–151,160–166` / `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | typed axis、target/sink、provenance、action/approval bindingとfail-closeを区別。CAP-001〜007と古いsecurity acceptanceがconsumer。 | K3の7軸/11 operation、宣言済みoperation inputs、現SECURITY owner sourceへ再導出。旧tuple、sink enum、approval語彙、runtime/AND gateは移さない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:20–24,28–42,60–70` / `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | source/effect前後drift、unknown≠allow、issuer/receipt、analyzerに作用portを渡さないcontract。旧consumerはsource boundary test/API design。 | K1/K3/K6/K7/K8のcurrent型とowner別作用へ再導出。旧署名必須契約を現要件へ加えず、K6 issuer authenticityはunsupportedを保つ。 |
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–42,55–58` / `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | request/selection/approval/decision分離、exact binding、provenanceを読む。 | 人間判断の捏造を避ける意味的近接源。新しいauthority vocabulary/approval gateにしない。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:1–59` / `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | CAP tuple混同、target physical identity、egress/classification、action binding、runtime coverage、legacy green相殺を分けたnegative consumer。 | 個別fixture形式を参照し、現固定L10とK3/K6へ再導出。旧oracleは実行・合格証拠にしない。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:24–25,33,39–44` / `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | target/environment/scope mismatch、revoke recipient、unknown fail-closeの隣接consumer。 | 009のrecipient責務を固定L2とK7/G5から再導出。SEA全scope/provider/latencyを採用しない。 |
| `LEGACY-ASSET-99C939E249CAF40935CB` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61–64` / `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2` | feature module間でsecret predicateを複製せず単一正本にする設計。 | 005は固定L2のcanonical classifier identity/revisionから再導出。旧pattern/実装は移さない。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:133–136` / `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | cancel/timeout/reassignment後の遅着作用をfence tokenで拒否するfailure case。 | 007/009/033は既存K7 fencingとowner観測から再導出。旧Worker runtimeを復帰させない。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` / `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-009-node-python-linux-runtime.md:113–120` / `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | rollbackをexplicitにし、自動fallbackを禁じる旧cutover consumer。 | K7のRollbackRequired/unfinished状態に限定して再導出。自動rollbackを追加しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120` / `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | old HAT consumerのlayer/requirement mapping、risk/metric/approval failures。 | AC-010/011は現L2から再導出。古いtest design、metrics、gateは移さない。 |
| `LEGACY-ASSET-02319C2481B9E01698D5` / `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:428` / `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | HR-FR-P2-05の別requirement source atom。ledger revision 3はread-only source snapshotを保持。 | L2-033のP0訂正後本文と統合せず、033 credential-use/Worker dispatchの根拠にしない。archive requirement line 428と別baseline line 409を同一atom化しない。 |

全11 assetの台帳行は`docs/governance/legacy-asset-disposition.jsonl`で照合した。10件はhistorical/unresolved（source copy・実装・consumerを承認済み移行とみなさない）。02319はrevision 3の`source_snapshot_preservation`であり、要求source保存はcurrent authority/implementationへ昇格しない。旧consumerはfailure・意味の来歴として保持し、現L9の実行結果を代替しない。

## 9. 未解決境界

SECURITY asset identity/classification adapter、owner producer graph、OS assignment source、physical enforcement observation source、G5 recipient declarationがcurrent owner sourceから結べない箇所は未解決のままにする。missingが実読で確認された場合とsourceへアクセスできずunobservedの場合を区別する。各Unknown/holdは影響operationまたはrecipientだけに適用し、19親全体を止めない。policy意味・scope・owner・版の変更が必要な場合だけ固定L2へ戻し、技術的な不足を新しい承認gateへ変えない。

この文書は設計草稿で、実装・fixture実行・物理enforcement・署名/receipt真正性を検証していない。
