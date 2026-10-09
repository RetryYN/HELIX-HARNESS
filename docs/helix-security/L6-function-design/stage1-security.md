---
title: "HELIX-SECURITY Stage 1 関数設計"
layer: L6
status: draft
owner: HELIX-SECURITY
scope: SECURITY Stage 1 L5 adapters, K3/K6/K7-G5/K8 read projections
base: main `d5bb3455526c816b3af965db239c4b56207a884f`（固定source snapshot）
paired_l5: ../L5-detail-design/stage1-security.md
paired_l7: ../L7-unit-test-design/stage1-security-unit-test-design.md
---

# HELIX-SECURITY Stage 1 関数設計

本書は固定SECURITY Stage 1 L5/L8の関数境界を具体化する未実行の設計である。固定L3/L10の意味、K1 result class/reason、既存owner、authority、operation、NFR候補の採否は変更しない。ここで記す関数は純粋な照合・read projectionであり、authorization発行、network/credentialアクセス、保存、owner state変更、物理enforcementは行わない。

## 1. 固定sourceとscope

下表のSECURITY L4/L5/L8/L9およびCommon Kernel L4/L6/L7/L9は、main `d5bb3455526c816b3af965db239c4b56207a884f` の歴史的固定snapshotである。最新mainの全文SHAとは扱わない。L7→L6のみ本PR content HEAD内の本文SHAを指す。

| source | 固定revision / SHA-256 | この文書で使う範囲 |
|---|---|---|
| SECURITY L4 `../L4-basic-design/stage1-security.md` | `71504a3c76512e8aa9c249eb229f7ecb25c9c350219d8a4b221c29d753767f68` | 19親・owner境界・既存kernel trace |
| SECURITY L5 `../L5-detail-design/stage1-security.md` | `120ec37f7abbae712e54a07fcf425d98074ac7d7d5dcdd0aa844884c0576d38f` | 9 API候補と型の正本 |
| SECURITY L8 `../L8-detail-verification/stage1-security-detail-verification.md` | `e2d55fdd753484c6bfac260719aa8290b8defa910aab348cad88da5fa5ea463a` | 438 fixture definitions/aliasesと期待値 |
| SECURITY L9 `../L9-integration-verification/stage1-security-integration-verification.md` | `41c23cd12c9717f2479e40017c62f1221efe55525507c6d2e48a56f06bb6e9a6` | 19親、33 CASE、43 verifier oracle |
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`, `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1/K2、K3 §16、K6 §10、K7/G5 §15、K8 §18 |
| Common Kernel L6 | `docs/helix-harness/L6-function-design/common-kernel.md`, `340fc3b5f263d82bbc9c4d0b8e5a7d93ef4447781b8ef988a1e7e7919a04b7ae` | 既存関数設計の粒度・既存K3関数形 |
| Common Kernel L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`, `0a232dbb019d703b39941f920cbb561538b92bc977fa0f197c8560198708a9f5` | unit fixture trace形式 |
| Common Kernel L9 | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`, `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | 既存kernel IV参照 |

対象は`HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`の19親、19 AC、33 functional CASE、L9の33 functional verifierと10 NFR verifier、計43 verifierに限る。L8 §5は438 fixture ID（421 canonical definition、17 alias）であり、aliasを別試験として数えない。Stage 2c-031、後続stage、Web/1.x sink、製品adapter実装は含めない。設計文書の存在や本書のfixtureは実装・実行・pass・L3/L10 approvalを意味しない。

## 2. 型と公開関数境界

公開候補signatureはL5 §5の9関数を維持する。戻り値を再wrapper化せず、L5にない公開関数、API引数、result union、K1 reason、domain型、ownerまたはauthorityを追加しない。`resolve_security_stage1_case`はL4の完全名に対応する既存形で、L5 `resolve_security_case`は短縮名である。

| L5関数 | 戻り値（既存型） | 下流へ渡す契約 |
|---|---|---|
| `resolve_security_case(parent_ref, case_ref, input_heads)` | `Observed<ResolvedSecurityCase> | Rejected(missing_key)` | 固定caseと登録済みowner source bindingを解決する。入力sliceの既存Unknown/UnobservedはObserved payload内に残す。 |
| `project_permission(resolved, query, permission_ref, input_heads)` | `PermissionCheckResult | PermissionCheckDiagnostic` (`PermissionCheck`) | K3 `resolve_authority_context`/`check_permission`を使用し、union・components・assurance・diagnosticをそのまま保持する。 |
| `project_external_label(resolved, source_ref)` | `ObservedLabel | Rejected(missing_key)` | K8 generic external input labelを読み出す。asset identity/classification readerではない。 |
| `project_label_transition(resolved, case_ref, input_label_ref, route_ref, k3_permission_check_ref, effect_observation_ref, input_heads)` | `TransitionValidation | Rejected(missing_key)` | K8 `validate_label_transition`を呼び出すread projection。selected validationとNotSelected projectionを区別し、record APIを呼ばない。 |
| `project_effect(resolved, effect_ref)` | `Observed<EffectObservation> | Rejected(missing_key)` | K8既存effect observationを読み、`none`・実作用・検証済み遷移を混同しない。 |
| `project_verification(resolved, operation, base_key, verifier_set, reverify)` | `RequiredResult` | K6 `required`の結果全体を返し、components/assurance/diagnosticsを保持する。 |
| `project_propagation(resolved, revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads)` | `Observed<PropagationView>` | G5 `propagate`のread-derived projectionを返し、recipient/obligation stateを変更しない。 |
| `evaluate_security_case(resolved)` | `SecurityInputProjection` | 既存API返値を型どおりslotへ配置する。独自K1 aggregateや承認・完了を生成しない。 |
| `project_parent_obligations(parent_ref, projection)` | `SecurityCaseProjection`相当の内部projection | 親/AC/CASE/verifier/owner traceだけを保つ。L3/L10判定を再定義しない。 |

この候補実装で使うprivate helperはowner/source current bindingの読取要求を既存APIへ渡すための内部手続きに限る。`__all__`等の外部公開集合へ出さず、`__qualname__`等からidentity/version/ownerを推定しない。callerのplain context、PermissionRecord、classifier、recipient map、reader、実適用報告はauthority rootとしない。`input_heads`はcurrent source選択ではなく、owner/current readerで再解決した入力との照合期待値である。

## 3. 共通評価手順

すべての関数候補は、受け取ったcase identityの型・必須ref構成を先に確認し、必要なowner current sourceは所有者の固定参照・既存declarationを使って解決する。型または必須API key/refを構成できない場合に限り、そのAPIが定める既存`Rejected(missing_key)`を返して後続を呼ばない。sourceが登録されていない、登録済みだが読めない、値が指定されているがunknown、値を完全に読めて不整合が判明した状態を相互に読み替えない。

K1/K2/K3の結果境界を以下のように保つ。

| 観測条件 | 保持する既存結果 | 禁止する写像 |
|---|---|---|
| 必須SubjectRef/operation keyを構成できない | APIで規定された`Rejected(missing_key)`またはK3 `PermissionCheckDiagnostic(missing_key)` | 架空refを作る、Unknownへ写す、queryを続ける |
| source/reader未登録 | 当該componentの`Unknown(unregistered)` | empty sourceをcomplete/negativeに扱う |
| 登録sourceが読めない | 当該componentの`Unknown(unreadable)` | `not-applied`や確定missingへ読み替える |
| source値が明示的Unknown | 既存Unknown class/reasonをそのまま保持 | 新reason作成、public/allowへdefault |
| owner domain recordを完全に読み、固定必須fieldの不存在を確認 | L5 §5のAC-004/015/016 technical projection candidateの`Unknown(missing_input)` | K1 class追加、field default補完 |
| current typed permission/verification inputの確定不一致 | K3/K6既存typed payload `Value(payload)`とowner `PolarityOf<T>`（Negative） | `Unknown(conflict)`へ誤分類 |
| 保存済みK2 result keyがcurrent keyと異なる | 既存K2 `Stale`/`Unobserved`規則 | fresh current K3 mismatchと同一視 |
| 同じrevisionの保存結果で異なるdigest | 既存K2/K3 conflict result | domain mismatch Negativeへ合流 |
| effectが既に観測されたがtransition binding不足/不一致 | 元effect observationを保持しtransitionをpositiveとしない。K8/L5の既存validation outcomeを使う | 作用事実を削除する、観測を許可/transitionと同義にする |

current K3 checkで現在の入力に対する確定mismatchまたはDeniedが生じた場合はK3 result内のNegativeとして扱い、K1 Staleではない。Staleは過去に保存されたValueとそのrecorded keyをcurrent lookupが比較したときにだけ使用する。`ProjectionNotApplicable`は固定caseで非適用が既知の場合のL5内部sentinelでありK1/K2 componentではない。横断aggregateをこのpairで追加しない。

## 4. 関数契約

### 4.1 `resolve_security_case`

**呼出:** `resolve_security_case(parent_ref, case_ref, input_heads)`
**戻り値:** `Observed<ResolvedSecurityCase> | Rejected(missing_key)`

固定parent/caseをL4 §1のscopeに照合し、L5 §4のowner input refsをcurrent owner declarationから解決する。`input_heads`は解決済みhead/binding期待の照合にだけ使う。owner source refをcaller入力から選ばない。入力key/refが構成不能なら`Rejected(missing_key)`で終了する。構成済みsourceのvalue/reasonがUnknownまたはUnobservedならcase resolver全体を拒否せずpayload内の該当sliceへ残す。owner declarationやsource reader自体が未確定の014–016は、該当sliceだけを既存Unknown/未解決adapterとして保持する。

**不変条件:** source omissionや0件からcompleteを推定しない。assignmentはOS、物理観測はINFRASTRUCTURE、worker applicationはWorker、共通descriptor/lifecycleはHARNESSのownerへ留める。resolverはK3 permission queryを実行しない。

### 4.2 `project_permission`

**呼出:** `project_permission(resolved, query, permission_ref, input_heads)`
**戻り値:** `PermissionCheckResult | PermissionCheckDiagnostic`

K3 §16の`resolve_authority_context`と`check_permission`既存contractを使う。`PermissionQuery`は既存の5 field（`operation`、`target`、`revision`、`requested_scope`、`operation_inputs`）を維持し、target identityとrevision `SubjectRef` identityを同一だと仮定しない。actor/environment等の7軸はowner resolverが作る`AuthorityContext`のtuple側で照合し、PermissionQueryのfieldとして扱わない。OS assignment/INFRA environment/current SECURITY `OperationDecl`から解決したfieldを各既存所有fieldへ束縛する。11 operationを独立照合する。purpose、egress endpoint/class/bytes等は既存operation-specific inputのまま7軸へ移さない。

K3結果unionをそのまま返す。known domain mismatchは型付き`Value(payload)`＋owner polarity Negative、K3 query construction/ref failureは`PermissionCheckDiagnostic(missing_key)`、source uncertaintyはK3既存Unknown。assignment scopeの不足はOSへ、SECURITY policy/operation authorityはSECURITYへ戻す。許可を作る、recordを発行する、K6 receiptからpermissionを生成することはない。

### 4.3 `project_external_label`

**呼出:** `project_external_label(resolved, source_ref)`
**戻り値:** `ObservedLabel | Rejected(missing_key)`

K8 `observe_input_label`をL2-001/002のexternal input sourceに限って使い、K8 current owner source/classificationとの照合結果を返す。必要source/refが構成不能ならK8既存`Rejected(missing_key)`を保持する。source/classificationがunknownなら`ObservedLabel`内部classification Unknownと`trust=untrusted`を保つ。分類不能をpublic、permission、instruction、requirement、persistence、learningへ昇格しない。L2-015/016のasset classification readerに流用しない。

### 4.4 `project_label_transition`

**呼出:** `project_label_transition(resolved, case_ref, input_label_ref, route_ref, k3_permission_check_ref, effect_observation_ref, input_heads)`
**戻り値:** `TransitionValidation | Rejected(missing_key)`

K8 `validate_label_transition`の引数・戻り型を維持し、current case, saved InputLabelRef, route/target, K3 PermissionCheck ref, effect observation refを既存K8 bindingで再読する。selected validationとselection=`not_selected`のprojectionは別々に扱い、NotSelectedではvalidation queryを発行しない。case/current bindingなどAPIのkey基盤を読めず分類/effectの基盤も解決できない場合はL5 signatureどおり外側の`Rejected(missing_key)`とする。基盤が解決済みでselected caseの必須route/permission ref自体が無くvalidation keyを構成できない場合は、既存`TransitionValidation.result=KeyUnavailable{diagnostic: Rejected(missing_key)}`を返し、利用可能なcomponentsと観測済みeffectを保持する。route/target/resultが読めた後のknown mismatchはK8 `TransitionValidation`の既存typed outcomeとpolarityで表す。source/key conflictやUnknownは各既存K8/K2型を保持する。

`effect_observation_ref`の観測事実と`validated_transition`は別々に保つ。bindingが欠落・不一致でも発生済みeffectを消さず、effect observation単独をvalid transition、allow、保存成功と扱わない。関数は`record_label_transition`を呼ばず、effect自体を実行しない。

### 4.5 `project_effect`

**呼出:** `project_effect(resolved, effect_ref)`
**戻り値:** `Observed<EffectObservation> | Rejected(missing_key)`

K8 `observe_authority_effect`で既存観測だけを読む。raw observation refと記録bytes/owner bindingのK8現行規則を保持し、`none`は原記録の値として保存するが、作用が存在しなかったという事実へ解釈しない。許可や未観測とも混同しない。effect observation自体が未登録/未読ならK8/K1既存reasonを保持する。実action/writer/read secretを呼ばない。

### 4.6 `project_verification`

**呼出:** `project_verification(resolved, operation, base_key, verifier_set, reverify)`
**戻り値:** K6 `RequiredResult`

K6 `required`へL5既存引数を渡し、返されたRequiredResult全体を保持する。`reverify`は既存K6が定義する同じdeterministic verifierの再評価条件であり、new verifierやissuer authenticity proofではない。K6 components内のK2 lookup Stale/conflict/Unknown/Unobserved、negative typed payload、assuranceを削除しない。raw secretsをcomponent/evidenceに入れず、classification/source bytesはowner/K6 boundaryで参照する。

AC-004/015/016のcomplete-read source domain field absenceについては、L5 §5が定義するcandidateに限り`Unknown(missing_input)`とする。それ以外のunregistered/unreadable/missing keyは表3どおり区別する。Domain payloadがknown mismatchならK6 verifier owner `PolarityOf<T>`がNegativeを与える。L5 §7 NFR候補はverification designであり実測やSLOではない。

### 4.7 `project_propagation`

**呼出:** `project_propagation(resolved, revocation, graph_decl, graph_rules, condition_state, obligation_set_keys, decls, recipient_decls, verifier_set, input_heads)`
**戻り値:** G5 `Observed<PropagationView>`

既存G5 `propagate`へ同じ引数を渡す。SECURITYが所有するcurrent RecipientMap/trigger declarationと、各recipient ownerが所有するRecipientDecl/current stateを区別する。G5 returned `PropagationView`のrecipient state・combined・assurance・diagnosticsを変更せず返す。G5 IVで定義されたno receipt=`Unobserved(not_run)`、received/pending=`Unobserved(pending_receipt)`、failed=`Value(payload)`/owner Negative、unmapped recipient=`Unknown(unregistered)`、same-revision digest conflict=`Unknown(conflict)`、required segment missing=`Unknown(missing_input)`を保つ。

`propagate`はread-derived projectionであってeffectful appendではない。`admit_effect`、K7 move/apply、owner state writer、全体停止を呼ばない。unrelated scope/operationを停止せず、global closureを推定しない。

### 4.8 `evaluate_security_case`

**呼出:** `evaluate_security_case(resolved)`
**戻り値:** L5 `SecurityInputProjection`

各APIから得た値をL5 §4 projection slotへそれぞれの既存型で配置し、input refs/source refsを保持する。APIを再呼出しして同一fixtureを二重評価しない。`ProjectionNotApplicable`はL5の内部slot sentinelでありK1 inputでない。API diagnosticをpayloadへ押し込む、UnknownをPositiveへdefault、raw secretを結果へ転載することはしない。SECURITY固有の横断`Combined`を作らない。

### 4.9 `project_parent_obligations`

**呼出:** `project_parent_obligations(parent_ref, projection)`
**戻り値:** L5が示す内部`SecurityCaseProjection`相当

19親/AC/CASE/L9 verifier/各component owner/source/unknownの戻り先をL5の既存mappingへ結び付けるtrace projectionに限る。L3/L10の測定結果、authority、承認、事業成功、完了は算出しない。033の15 caseは一括一値にせずcase IDとsource/ownerを個別保持する。NFR IDsは該当functional canonical inputを参照し、NFR helperが同じcanonical caseを二度呼ばない。

## 5. 親ごとの関数・owner対応

| SECURITY親 | API候補 | primary owner/boundary | 主な分離点 |
|---|---|---|---|
| 001 | external label / K6 source; selected時K8 transition | SECURITY label source、入力source owner | untrusted labelとread/effect/transitionを分離 |
| 002 | external label / selected K8 transition / 必要時K3 | SECURITY policy、operation owner | 命令様dataからTool args・instruction・permissionを直接作らない |
| 003 | resolver + K3 permission | OS assignment、INFRA environment | project/適用tenant/environment/assignmentのscope |
| 004 | resolver + K6 verification | SECURITY config/source owner | project/root/HEAD/revision/digest/owner/scope・field欠落 |
| 005 | K3 credential-use + K6 classifier/source; 必要時K7/G5 | SECURITY classifier、credential/source owner | purposeはoperation input。raw secretを出さない |
| 006 | K3 egress operation inputs + INFRA observation | OS/INFRA/endpoint owner | declared tupleとphysical path evidenceを分ける |
| 007 | K3 authority + K6 evidence/read | SECURITY policy、Worker application、INFRA observation | 9制約を個別保持し適用・観測を宣言から分離 |
| 008 | K3 permission | SECURITY current OperationDecl/record owner | 11 operations × 7 axes。cross-operation reuse禁止 |
| 009 | K3 current permission + G5 propagate | SECURITY trigger/map、各recipient owner | trigger/recipient単位read projection。state writeなし |
| 010 | K6 verification | asset/source/provenance owner | 15 target classesを混同せず保持 |
| 011 | K6 before/after source | capability/source owner | identity同一のbefore/after差分 |
| 012 | K6 provenance | package/source owner | declared fieldsとunknown fieldsを維持 |
| 013 | K6 chain/receipt | producer/verifier owner | digest整合とissuer authenticityを分離 |
| 014–016 | K6 refs + SECURITY固有未具体化asset adapter | asset owner/SECURITY | generic K8 labelをasset readerとしない |
| 020 | K3 authority + K6 deterministic rule refs | SECURITY rule owner; optional INTELLIGENCE input | fixed 8 Guardとoptional semantic inputを分ける |
| 028 | K6 descriptor/artifact/provenance | HARNESS descriptor/lifecycle、SECURITY artifact |共通pack lifecycleはHARNESSのowner |
| 033 | resolver + K3/K6/K7/G5、必要時K8 | SECURITY authority; OS assignment; Worker application; INFRA observation | CASE-01–15個別trace、unobserved ≠ not-applied |

## 6. 旧source、保持点、差分理由

旧HELIXをinventory-firstで読み、旧API/runtimeを移植せず現行L4/L5/Common Kernel contractから再導出した。asset IDs・path/span・full-file SHAは次表のとおり。archive/ledgerはread-only。旧command、hook、runtime、test、CIは起動していない。

| 旧asset ID / source path:span / full SHA-256 | 保持 | 現行差分・理由 |
|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | raw/untrusted dataとtrusted instruction、memory/learning targetへの不用意な昇格を分ける。 | K8 generic input-labelとSECURITY固定L2-001/002から再導出。旧memory/learning policy全体を導入しない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:30–44,109–151,160–166` / `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | typed authority axes、target binding、fail-closed | 現K3 query/record/contextへ再導出し、旧schema、CAP連番、runtimeを移さない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:20–24,28–42,60–70` / `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | unknownはallowでない、effect前 driftとeffect後不確実性を分ける。 | K3/K6/K7/K8 current型を使う。旧API/signature/runtimeは移さない。 |
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–42,55–58` / `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | request/selection/approval/decisionを混同しない。 | 過去candidateを新authority語彙やhuman gateへ昇格させず、K3型に限定する。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:1–59` / `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | tuple driftとnegative fixtureの個別検査。 | 旧oracle/testを実行せず、固定L10を現K3へ対応付ける。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:24–25,33,39–44` / `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | owner recipientへの停止伝播という隣接意図。 | L2-009へ限定しG5から再導出。旧SEA全scope/latencyは採用しない。 |
| `LEGACY-ASSET-99C939E249CAF40935CB` / `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61–64` / `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2` | canonical classifier単一参照。 | current SECURITY classifier/source ownerから再導出。旧consumer実装は移さない。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:133–136` / `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | cancellation/reassignment後の遅延作用を見落とさない。 | K7 fence/current permissionから再導出し旧runtimeを復帰させない。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` / `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-009-node-python-linux-runtime.md:113–120` / `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | 明示rollbackとautomatic fallbackを区別。 | K7 unfinished/rollback-requiredを使いautomatic rollback/fallbackを追加しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:43–50,67–90,91–120` / `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | consumer視点とcaseごとの観測例。 | 新L8/L9 oracleを使い、旧test/greenを証拠化しない。 |
| `LEGACY-ASSET-02319C2481B9E01698D5` / `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:428` / `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | requirement source snapshotとauthority stateの区別。 | snapshotを新承認や実行証拠へ昇格させない。 |

Ledger recordsは`docs/governance/legacy-asset-disposition.jsonl`の対象asset_id行（482, 412, 792, 2842, 869, 352, 577, 266, 2536, 956ほか該当行）を照合し、historical/unresolvedの状態を採否/実装許可へ読み替えない。過去root plan/acceptanceのcredential/egress gate、old Bun、scanner/deploy運用もread-onlyで比較したが、本stageへ移さない。

## 7. 局所未解決境界

| 領域 | 固定できる契約 | 現時点で未確定の点／扱い |
|---|---|---|
| 014–016 asset classification reader | K6 refs、owner-declared current sourceが必要。K8 generic labelは対象外。 | SECURITY adapter/source owner未具体化。該当asset componentだけUnknown/holdとし、新reader/APIを作らない。 |
| actual producer graph / owner source completeness | zero/omitted inputsからcompleteを推定しない。 | real owner binding unresolvedなら該当operation/recipientだけUnknown。 |
| physical enforcement observation | Worker applies, INFRA observes。policy/OS assignment/Worker self-reportだけでは実状態でない。 | owner observation未登録・未読はUnknown/Unobserved。new receipt/physical guardを作らない。 |
| K6 issuer authenticity | K6 `Unknown(unsupported)`保持。 | 署名/anchor検査を追加しない。 |
| NFR候補 | L5/L9の対象scopeとfixture候補のみ保持。 | expiry A/B、未採択数値、SLOは選ばない。 |
| K3 operation owner | current owner OperationDecl / input sourceで解決。 | declarationがない場合、action nameからoperationを推測しない。 |

## 8. 設計状態

本書と対のL7は§1とfront matterに明記したmain `d5bb3455526c816b3af965db239c4b56207a884f`の固定sourceを基準とする起草であり、実装・test execution・承認・releaseを表さない。L7はL8の421 canonical definitionsを一対一のunit oracleへ写し、17 aliasesをcanonical link assertionだけにする。再照合の手順と結果はL7 §7へ記録し、fixture mappingが固定source bytesから再現できることだけを示す。
