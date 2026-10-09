---
title: "HELIX-SECURITY Stage 1 単体試験設計"
layer: L7
status: draft
owner: HELIX-SECURITY
scope: SECURITY Stage 1 adapters / K3-K6-K7/G5-K8 projections
base: `7d4ed840d96b43ea91f10c314b85dfdaf7a6242b`
paired_l6: ../L6-function-design/stage1-security.md
paired_l6_sha256: `d5e1f7ad9b9f7010917951d5c02a7b2af0f834136b90b581f3c09a6b076046bc`
paired_l8: ../L8-detail-verification/stage1-security-detail-verification.md
paired_l8_sha256: `e2d55fdd753484c6bfac260719aa8290b8defa910aab348cad88da5fa5ea463a`
paired_l9: ../L9-integration-verification/stage1-security-integration-verification.md
paired_l9_sha256: `41c23cd12c9717f2479e40017c62f1221efe55525507c6d2e48a56f06bb6e9a6`
---

# HELIX-SECURITY Stage 1 単体試験設計

本書はL6関数の単体fixture設計であり、未実装・未実行である。L4/L5/L8/L9の意味、result class/reason、owner、authority、候補NFR値を変更しない。テスト合格、物理適用、実credential/network access、保存、L3/L10 approvalを主張しない。

## 1. 固定sourceとinventory

| source | revision / SHA-256 | 使用範囲 |
|---|---|---|
| SECURITY L4 | `docs/helix-security/L4-basic-design/stage1-security.md`, `71504a3c76512e8aa9c249eb229f7ecb25c9c350219d8a4b221c29d753767f68` | 19親・owner/API mapping |
| SECURITY L5 | `docs/helix-security/L5-detail-design/stage1-security.md`, `120ec37f7abbae712e54a07fcf425d98074ac7d7d5dcdd0aa844884c0576d38f` | 9 API signatures/return types |
| SECURITY L8 | `docs/helix-security/L8-detail-verification/stage1-security-detail-verification.md`, `e2d55fdd753484c6bfac260719aa8290b8defa910aab348cad88da5fa5ea463a` | 421 canonical fixture oraclesと17 aliases |
| SECURITY L9 | `docs/helix-security/L9-integration-verification/stage1-security-integration-verification.md`, `41c23cd12c9717f2479e40017c62f1221efe55525507c6d2e48a56f06bb6e9a6` | 19親、33 CASE、43 verifier（10 NFRを含む） |
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`, `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1/K2, K3, K6, K7/G5, K8 contract |
| Common Kernel L6/L7/L9 | L6 `a7139003fa07f0b34b2d4a2e90496721c483ae8b07e5944cc460de8dc5bf5dba`; L7 `f60a67b2fb18cce4ed17c715dddf1049d6bdcd5a49ea04bf1b4ec52cb6d191a8`; L9 `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | 既存function/unit styleと共通API oracle |

L8 §5の438 fixture IDsは421 canonical definitionsと17 aliasesからなる。この文書の`SEC-UT-001`〜`SEC-UT-421`は421 canonical rowへ一対一に対応する。aliasは同じcanonical test/resultの参照でありAPIを再呼出ししない。alias元のL9 verifierもcanonical testへtraceする。L8 §5.4 NFR ID列は既存canonical fixtureへの参照で、別fixtureを作らない。L5の9 API候補すべてをunit/構造境界へtraceする。`project_effect`はL8 §5のAPI候補列に明示されないため、既存Common Kernel K8 IVに基づくL7-only補助fixtureへ分離する。`evaluate_security_case`にはL7-only slot-preservation補助fixtureを3件置き、`project_parent_obligations`はL5 §6の固定parent対応を構造照合する。いずれもSECURITY L8 fixture数・L9 verifier数を増やさない。

Fixture入力はすべてsynthetic。owner/K3/K6 source/read boundariesは構成済みtyped stubで、production current source、permission、physical enforcementの実証ではない。各test caseはbaseline・一変異・expected class/reason/payload/polarity/assertionを持ち、L8の期待を正本として保持する。API return type/diagnosticをflattenせず、known domain mismatchとK2 conflict、fresh queryとsaved lookupのStaleを区別する。

### 1.1 Test ID・API call・stub boundary

`SEC-UT-001`…`SEC-UT-421`はL7-local method identityであり、requirements/AC/CASE/L9 IDを増やさない。各メソッドはL8行のL5 API候補を記載順で呼び、baselineに一つのmutationを適用して、L8 expectedの戻り型/class/reasonと指定component fieldsをassertする。L8がcompound input/oracleを明示する場合だけその複合形を保つ。private fixture builder/helperをpublic APIと扱わない。

| stub boundary | 観測 |
|---|---|
| SECURITY/各owner current declaration・source | caller期待refからsourceを選ばない。L5の既存API型と当該field stateを保持する。 |
| K3 `PermissionCheck` | Result/Diagnostic union、11 operation別query、7軸、components/assurance。 |
| K6 `RequiredResult` | component result class/reason、typed `Value(payload)`、owner `PolarityOf<T>`、combined/assurance/diagnostic。issuer authenticityを補わない。 |
| G5 `Observed<PropagationView>` | recipient単位の結果とcombinedを保持し、owner state bytes/write countは不変。 |
| K8 label/effect/transition | untrusted保持、event/effect factとvalidation result、selected/NotSelectedを分離。record APIを呼ばない。 |
| OS/Worker/INFRA/HARNESS source | 合成 typed source/refのみ。assignment/execution/network/secret/resource writerを呼ばない。 |

## 2. 421 canonical fixture oracle

各小節はL8のcanonical fixture一件である。L9 verifier、L5 API、baseline、single mutation、expectedはL8固定rowから移した全文。L9別scopeがalias経由で同じcanonical fixtureを参照する場合、そのverifierも同じunit assertionへ併記し、二重実行しない。

### SEC-UT-001 — `L8-SECURITY-003-01-M01`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`は必要ref/sourceとcurrent bindingが既知で揃った正常入力。
- 一つの変異（L8正本）: project identityだけを別の既知projectへ変更する。
- exact expected（L8正本）: resolverは`Observed<ResolvedSecurityCase>`を返す。続く完全current K3 queryの確定scope不一致は`PermissionCheckResult`内の該当componentで型付きdomain payloadを`Value(payload)`として保持し、ownerの`PolarityOf<payload>`がNegativeである場合に限りその成分をNegativeとする。source不明は別fixture。assignment/environmentはOS/INFRA ownerへ。

### SEC-UT-002 — `L8-SECURITY-006-01-M01`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: sourceだけ明示許可外へ変更
- exact expected（L8正本）: 完全current queryの確定不一致はK3 `PermissionCheckResult.combined=Negative`。該当成分は`Value(domain_payload)`の型を保ち、ownerの`PolarityOf`がNegativeを与える。物理path不明はUnknownとしてINFRA ownerへ。

### SEC-UT-003 — `L8-SECURITY-009-01-M01`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。 全対象recipientのcurrent applied receiptが揃い、owner stateのbefore bytesを固定する。
- 一つの変異（L8正本）: SECURITY projectionがowner stateを書き換える変異
- exact expected（L8正本）: G5 `Observed<PropagationView>`内のapplied componentは`Value`かつowner polarity Positive、`combined=Positive`。SECURITY projection前後のowner state bytesは不変でwrite count=0。書換え変異はこの構造assertionで不合格。

### SEC-UT-004 — `L8-SECURITY-010-01-M01`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: new versionだけを採用根拠にする
- exact expected（L8正本）: 新version refだけでは既存K6 verifierのrequired inputsが揃わない。K6 `RequiredResult`の該当componentは`Unknown(missing_input)`を保持し、version単独でacceptしない。asset ownerへ戻す。

### SEC-UT-005 — `L8-SECURITY-011-01-M01`

- L9 verifier(s): `IV-SECURITY-011-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-011-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: capabilityだけread-onlyからwriteへ変更
- exact expected（L8正本）: current before/after capability値の既知差分をK6の型付きdomain payloadとして保持し、owner `PolarityOf=Negative`がその成分をNegativeにする。owner mapping不明なら該当fieldだけ`Unknown(unsupported)`。

### SEC-UT-006 — `L8-SECURITY-012-01-M01`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: producer refだけ未登録にする
- exact expected（L8正本）: producerがcurrent owner declarationへ登録されていないためK6 source componentは`Unknown(unregistered)`。trustedへ昇格しない。producer/source ownerへ。

### SEC-UT-007 — `L8-SECURITY-013-01-M01`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: digest一致だけからissuer authenticityを肯定する
- exact expected（L8正本）: K6 issuer_authenticityはUnknown(unsupported)を保ち、chain trust/passを作らない。

### SEC-UT-008 — `L8-SECURITY-015-01-M01`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: ownerが宣言した別のcurrent revisionだけへ変更し、同じlogical asset identityを保持
- exact expected（L8正本）: 同じlogical identityの新revisionを別版として観測する。revision変更だけからK1/K2 `Stale`やUnknownは生成せず、内容dump/1.x protectionも生成しない。

### SEC-UT-009 — `L8-SECURITY-028-01-M01`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`は必要source/current bindingが既知で揃った正常入力。
- 一つの変異（L8正本）: descriptor dependency rangeだけを既知の対象外rangeへ変更する。
- exact expected（L8正本）: current descriptor dependency rangeとverification scopeの確定mismatchはK6 `RequiredResult`で型付きpayloadとowner `PolarityOf=Negative`を保持し`combined=Negative`。HARNESSへ戻し、共通lifecycleを生成しない。

### SEC-UT-010 — `L8-SECURITY-033-02-M01`

- L9 verifier(s): `IV-SECURITY-033-02`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-02-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: contract identityだけUnknownへ変更
- exact expected（L8正本）: resolverは`Observed<ResolvedSecurityCase>`を返す。OS worker-contract identity fieldをこのfixture入力だけ`Unknown(indeterminate)`に固定し、K6 `RequiredResult`の対応componentはその既存Unknownを保持してdispatchを肯定しない。assignment/契約owner OSへ戻す。

### SEC-UT-011 — `L8-SECURITY-033-03-M01`

- L9 verifier(s): `IV-SECURITY-033-03`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-03-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: contract versionだけUnknownへ変更
- exact expected（L8正本）: resolverは`Observed<ResolvedSecurityCase>`を返す。OS worker-contract version fieldをこのfixture入力だけ`Unknown(indeterminate)`に固定し、K6 `RequiredResult`の対応componentはその既存Unknownを保持してdispatchを肯定しない。assignment/契約owner OSへ戻す。

### SEC-UT-012 — `L8-SECURITY-033-04-M01`

- L9 verifier(s): `IV-SECURITY-033-04`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-04-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: contract stateだけUnknownへ変更
- exact expected（L8正本）: resolverは`Observed<ResolvedSecurityCase>`を返す。OS worker-contract state fieldをこのfixture入力だけ`Unknown(indeterminate)`に固定し、K6 `RequiredResult`の対応componentはその既存Unknownを保持してdispatchを肯定しない。assignment/契約owner OSへ戻す。

### SEC-UT-013 — `L8-SECURITY-033-05-M01`

- L9 verifier(s): `IV-SECURITY-033-05`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-05-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: observation contract identityだけUnknown
- exact expected（L8正本）: OS observation contract identity componentは指定済み`Unknown(indeterminate)`。観測主体を推定せずそのまま保持。

### SEC-UT-014 — `L8-SECURITY-033-06-M01`

- L9 verifier(s): `IV-SECURITY-033-06`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-06-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: observation versionだけUnknown
- exact expected（L8正本）: OS observation version componentは指定済み`Unknown(indeterminate)`。これだけでINFRA ownerの欠落とはしない。

### SEC-UT-015 — `L8-SECURITY-033-07-M01`

- L9 verifier(s): `IV-SECURITY-033-07`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-07-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: effective state observationだけを未実施として`Unobserved(not_run)`に固定する。他のcontract/current refsと観測sourceは既知のまま。
- exact expected（L8正本）: `project_verification`はK6 `RequiredResult`の該当observation componentに`Unobserved(not_run)`を保持し、適用済み・未適用・欠落確認へ変換しない。物理適用はWorker/INFRA ownerへ。

### SEC-UT-016 — `L8-SECURITY-033-08-M01`

- L9 verifier(s): `IV-SECURITY-033-08`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-033-08-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: authority decision ownerだけOSへ反転
- exact expected（L8正本）: owner field mismatchは完全なcurrent K3 queryで`PermissionCheckResult.combined=Negative`。authority owner SECURITYとassignment owner OSを区別する。

### SEC-UT-017 — `L8-SECURITY-033-09-M01`

- L9 verifier(s): `IV-SECURITY-033-09`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-09-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: not-applied観測があるのにdispatchを継続
- exact expected（L8正本）: 実読したnot-applied observation componentが既存K6 `RequiredResult`にnegative polarityで含まれる。該当dispatchを継続しない。単なる未観測はこのfixtureに含めない。

### SEC-UT-018 — `L8-SECURITY-033-10-M01`

- L9 verifier(s): `IV-SECURITY-033-10`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-033-10-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: assignment ownerだけSECURITYへ反転
- exact expected（L8正本）: resolverは必要key/refを構成できれば`Observed<ResolvedSecurityCase>`を返す。assignment-owner反転はOS-owned domain fieldでありL5にそのprojection mappingは定義されないため、resolver rejectやK1 resultを捏造せず、このfield/result mappingだけ局所未決としてOSへ返す。

### SEC-UT-019 — `L8-SECURITY-033-11-M01`

- L9 verifier(s): `IV-SECURITY-033-11`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-033-11-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: 未選択contractを使う
- exact expected（L8正本）: resolverは必要key/refを構成できれば`Observed<ResolvedSecurityCase>`を返す。未選択contractの代用禁止は維持するが、L5にcontract-selectionのprojection mappingは定義されないため、Unknown/Rejected結果を捏造せず、そのselection fieldだけ局所未決としてHARNESS/assignment ownerへ戻す。

### SEC-UT-020 — `L8-SECURITY-033-12-M01`

- L9 verifier(s): `IV-SECURITY-033-12`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-12-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: OS receiptだけをphysical application evidenceへ置換
- exact expected（L8正本）: required physical-state observationがなく、OS receiptだけでは代用できない。該当K6 componentは`Unknown(missing_input)`で、適用済み/未適用を推定しない。

### SEC-UT-021 — `L8-SECURITY-033-13-M01`

- L9 verifier(s): `IV-SECURITY-033-13`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-13-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: policy declarationだけをeffective evidenceにする
- exact expected（L8正本）: effect observationがなくpolicy declarationでは代用できない。該当K6 componentは`Unknown(missing_input)`で適用済みを推定しない。

### SEC-UT-022 — `L8-SECURITY-033-14-M01`

- L9 verifier(s): `IV-SECURITY-033-14`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-033-14-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: Worker self-reportだけをeffective evidenceにする
- exact expected（L8正本）: Worker self-reportは外部effective-state observationを代替しない。該当componentは`Unknown(unsupported)`で、適用済みを推定しない。

### SEC-UT-023 — `L8-SECURITY-033-15-M01`

- L9 verifier(s): `IV-SECURITY-033-15`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-033-15-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: authority ownerだけINFRAへ反転
- exact expected（L8正本）: authority owner field mismatchは完全current K3 queryで`PermissionCheckResult.combined=Negative`。不足owner SECURITYへ戻す。

### SEC-UT-024 — `L8-SECURITY-NFR-003-M01`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: record sourceだけ未登録にする
- exact expected（L8正本）: classification sourceが未登録なのでK6 source componentは`Unknown(unregistered)`。public/allowへ昇格しない。

### SEC-UT-025 — `L8-SECURITY-NFR-007-M01`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: HEADだけ変更し旧permission re-use
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-026 — `L8-SECURITY-NFR-008-M01`

- L9 verifier(s): `IV-SECURITY-NFR-008`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-NFR-008-BASE`は対応する§3/§4のmutationなしの正常基準入力。必要source/current bindingを揃え、他fieldはbaselineから変更しない。
- 一つの変異（L8正本）: window declarationだけ欠落
- exact expected（L8正本）: owner-declared window自体が未登録ならK6 componentは`Unknown(unregistered)`。retention期限を作らない。

### SEC-UT-027 — `L8-SECURITY-001-01-LABEL-MISSING-001`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: external classification sourceだけを未登録にする。
- exact expected（L8正本）: 分類source自体が未登録なので、`ObservedLabel`のclassification componentは`Unknown(unregistered)`。既存の`untrusted` labelを保持し、instruction/authority/persistence/learningへ昇格しない。source ownerへ戻す。

### SEC-UT-028 — `L8-SECURITY-001-01-LABEL-UNKNOWN-002`

- L9 verifier(s): `IV-SECURITY-001-01`; aliasから共有する追加verifier: `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: classificationだけをfixture由来の既存Unknownへ置換。
- exact expected（L8正本）: `ObservedLabel`のclassification componentは入力の`Unknown(indeterminate)`を保持し、trustは`untrusted`のまま。instruction/authority/persistence/learningへ昇格しない。source ownerへ戻す。

### SEC-UT-029 — `L8-SECURITY-001-01-READ-AS-INSTRUCTION-003`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataをread outputだけをinstruction入力へ昇格する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持する。記録projectionでは`validated_transition=NotSelected`、K8 validation queryは発行しない。readingだけからtargetへ昇格しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-030 — `L8-SECURITY-001-01-READ-AS-AUTHORITY-004`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataをread outputだけをauthority sourceへ昇格する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持する。記録projectionでは`validated_transition=NotSelected`、K8 validation queryは発行しない。readingだけからtargetへ昇格しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-031 — `L8-SECURITY-001-01-READ-AS-PERSISTENCE-005`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataをread outputだけをpersistence sourceへ昇格する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持する。記録projectionでは`validated_transition=NotSelected`、K8 validation queryは発行しない。readingだけからtargetへ昇格しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-032 — `L8-SECURITY-001-01-READ-AS-LEARNING-006`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-001-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataをread outputだけをlearning targetへ昇格する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持する。記録projectionでは`validated_transition=NotSelected`、K8 validation queryは発行しない。readingだけからtargetへ昇格しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-033 — `L8-SECURITY-001-01-READ-AS-INSTRUCTION-TRANSITION-007`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`はsource/project/classification definitionへ完全一致し、明示route・target・K3 check・effect observationはcurrent bindingと一致する。K3 checkはこのtargetに対してNegative。
- 一つの変異（L8正本）: read-only source labelをsystem instruction targetへ昇格するrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。`k8_transition_polarity`で`Denied`はNegative。source labelは`untrusted`のまま。

### SEC-UT-034 — `L8-SECURITY-001-01-READ-AS-AUTHORITY-TRANSITION-008`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`はcurrent classification recordに一致し、route/effect refsは完全。K3 current checkのtarget authorityはNegative。
- 一つの変異（L8正本）: read-only source labelをauthority targetへ昇格するrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。payloadは`TransitionOutcome`、polarityはHARNESS所有mappingのNegative。`untrusted`を解除しない。

### SEC-UT-035 — `L8-SECURITY-001-01-READ-AS-PERSISTENCE-TRANSITION-009`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`と明示route/effect/K3 refsはcurrent bindingへ一致する。K3 checkはpersistence targetにNegative。
- 一つの変異（L8正本）: read-only source labelをpersistence targetへ昇格するrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。transition payloadと`k8_transition_polarity=Negative`を分け、保存処理を行わない。

### SEC-UT-036 — `L8-SECURITY-001-01-READ-AS-LEARNING-TRANSITION-010`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`と明示route/effect/K3 refsはcurrent bindingへ一致する。K3 checkはlearning targetにNegative。
- 一つの変異（L8正本）: read-only source labelをlearning targetへ昇格するrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。`untrusted`を保持し、training/learningへ渡さない。

### SEC-UT-037 — `L8-SECURITY-002-01-SYSTEM-INSTRUCTION-TRANSITION-011`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`、明示route/target/effect refsはcurrent bindingへ一致し、K3 current checkはNegative。
- 一つの変異（L8正本）: 例文だけをsystem-instruction targetへ結ぶrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。例文は入力dataのままで、system instructionに変換しない。

### SEC-UT-038 — `L8-SECURITY-002-01-PERMISSION-TRANSITION-012`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`とexplicit operation routeはcurrent。K3 checkに必要なquery/refは完全で、要求operationの判定はNegative。
- 一つの変異（L8正本）: 例文だけをpermission operation targetへ結ぶrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。新しいpermissionを発行せず、payloadは`Denied`、polarityはNegative。

### SEC-UT-039 — `L8-SECURITY-002-01-CREDENTIAL-TRANSITION-013`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`とexplicit credential-use route/effect refsはcurrent。K3 checkのpurposeは別operation inputで、checkはNegative。
- 一つの変異（L8正本）: 例文だけをcredential送信targetへ結ぶrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。credentialを読取・送信せず、本文を記録しない。

### SEC-UT-040 — `L8-SECURITY-002-01-POLICY-TRANSITION-014`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved `InputLabelRef`、current policy definition、explicit route/effect refsを揃え、K3 current checkはNegative。
- 一つの変異（L8正本）: 例文だけをpolicy mutation targetへ結ぶrouteを選択する。
- exact expected（L8正本）: K8 `TransitionValidation.result`は`Observed<TransitionOutcome>`内の`Value(Denied{source:permission_check})`。policy変更を行わず、`untrusted` labelを維持する。

### SEC-UT-041 — `L8-SECURITY-002-01-TOOL-ARGS-001`

- L9 verifier(s): `IV-SECURITY-002-01`; aliasから共有する追加verifier: `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを5つの固定例文のうち1文だけをTool argsへ結ぶ。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持し、記録projectionの`validated_transition=NotSelected`とする。K8 validation query/effectは発行せず、入力dataからoperation/credential/policy作用を生成しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-042 — `L8-SECURITY-002-01-SYSTEM-INSTRUCTION-002`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを1文だけをsystem instructionとして解釈する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持し、記録projectionの`validated_transition=NotSelected`とする。K8 validation query/effectは発行せず、入力dataからoperation/credential/policy作用を生成しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-043 — `L8-SECURITY-002-01-PERMISSION-003`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを1文だけからpermission operationを作る。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持し、記録projectionの`validated_transition=NotSelected`とする。K8 validation query/effectは発行せず、入力dataからoperation/credential/policy作用を生成しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-044 — `L8-SECURITY-002-01-CREDENTIAL-004`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを1文だけからcredential送信を作る。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持し、記録projectionの`validated_transition=NotSelected`とする。K8 validation query/effectは発行せず、入力dataからoperation/credential/policy作用を生成しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-045 — `L8-SECURITY-002-01-POLICY-CHANGE-005`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを1文だけをpolicy updateへ結ぶ。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`を保持し、記録projectionの`validated_transition=NotSelected`とする。K8 validation query/effectは発行せず、入力dataからoperation/credential/policy作用を生成しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-046 — `L8-SECURITY-003-01-TENANT-CROSS-001`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: tenant identityだけを別の明示tenantへ置換。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-047 — `L8-SECURITY-003-01-ENVIRONMENT-CROSS-002`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: environment identityだけを別値へ置換。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-048 — `L8-SECURITY-003-01-WORKTREE-CROSS-003`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: worktree identityだけを別値へ置換。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-049 — `L8-SECURITY-003-01-ASSIGNMENT-CROSS-004`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: OS assignment identityだけを別projectへ置換。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-050 — `L8-SECURITY-003-01-COLLISION-005`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 二つのscope identityだけを同じ表記・異なるidentityにする。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-051 — `L8-SECURITY-003-01-FALLBACK-006`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: current refだけを欠落させる（この単一入力変異に対して、実装が別project refへfallbackしないことを検査する）。
- exact expected（L8正本）: 必須current ref欠落で`resolve_security_case`は既存`Rejected(missing_key)`を返す。K3 queryは呼ばず、別project refへfallbackしない。OS/INFRA ownerへ戻す。

### SEC-UT-052 — `L8-SECURITY-003-01-EXECUTION-TARGET-CROSS-007`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: execution targetだけをscope外へ置換。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-053 — `L8-SECURITY-004-01-M-AGENTS-MD-MISSING-001`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agents-md config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-054 — `L8-SECURITY-004-01-M-AGENTS-MD-STALE-002`

- L9 verifier(s): `IV-SECURITY-004-01`; aliasから共有する追加verifier: `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みagents-md config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-055 — `L8-SECURITY-004-01-M-AGENTS-MD-OTHER-PROJECT-003`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agents-md config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-056 — `L8-SECURITY-004-01-M-AGENTS-MD-UNKNOWN-004`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agents-md config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-057 — `L8-SECURITY-004-01-M-CLAUDE-MD-MISSING-005`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: claude-md config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-058 — `L8-SECURITY-004-01-M-CLAUDE-MD-STALE-006`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みclaude-md config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-059 — `L8-SECURITY-004-01-M-CLAUDE-MD-OTHER-PROJECT-007`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: claude-md config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-060 — `L8-SECURITY-004-01-M-CLAUDE-MD-UNKNOWN-008`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: claude-md config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-061 — `L8-SECURITY-004-01-M-AGENT-DEFINITION-MISSING-009`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agent-definition config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-062 — `L8-SECURITY-004-01-M-AGENT-DEFINITION-STALE-010`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みagent-definition config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-063 — `L8-SECURITY-004-01-M-AGENT-DEFINITION-OTHER-PROJECT-011`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agent-definition config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-064 — `L8-SECURITY-004-01-M-AGENT-DEFINITION-UNKNOWN-012`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: agent-definition config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-065 — `L8-SECURITY-004-01-M-HOOK-MISSING-013`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: hook config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-066 — `L8-SECURITY-004-01-M-HOOK-STALE-014`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みhook config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-067 — `L8-SECURITY-004-01-M-HOOK-OTHER-PROJECT-015`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: hook config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-068 — `L8-SECURITY-004-01-M-HOOK-UNKNOWN-016`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: hook config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-069 — `L8-SECURITY-004-01-M-SKILL-MISSING-017`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: skill config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-070 — `L8-SECURITY-004-01-M-SKILL-STALE-018`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みskill config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-071 — `L8-SECURITY-004-01-M-SKILL-OTHER-PROJECT-019`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: skill config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-072 — `L8-SECURITY-004-01-M-SKILL-UNKNOWN-020`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: skill config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-073 — `L8-SECURITY-004-01-M-MCP-CONFIG-MISSING-021`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: mcp-config config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-074 — `L8-SECURITY-004-01-M-MCP-CONFIG-STALE-022`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みmcp-config config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-075 — `L8-SECURITY-004-01-M-MCP-CONFIG-OTHER-PROJECT-023`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: mcp-config config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-076 — `L8-SECURITY-004-01-M-MCP-CONFIG-UNKNOWN-024`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: mcp-config config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-077 — `L8-SECURITY-004-01-M-RUNTIME-CONFIG-MISSING-025`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: runtime-config config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-078 — `L8-SECURITY-004-01-M-RUNTIME-CONFIG-STALE-026`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みruntime-config config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-079 — `L8-SECURITY-004-01-M-RUNTIME-CONFIG-OTHER-PROJECT-027`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: runtime-config config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-080 — `L8-SECURITY-004-01-M-RUNTIME-CONFIG-UNKNOWN-028`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: runtime-config config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-081 — `L8-SECURITY-004-01-M-SANDBOX-POLICY-MISSING-029`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: sandbox-policy config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-082 — `L8-SECURITY-004-01-M-SANDBOX-POLICY-STALE-030`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みsandbox-policy config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-083 — `L8-SECURITY-004-01-M-SANDBOX-POLICY-OTHER-PROJECT-031`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: sandbox-policy config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-084 — `L8-SECURITY-004-01-M-SANDBOX-POLICY-UNKNOWN-032`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: sandbox-policy config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-085 — `L8-SECURITY-004-01-M-SYSTEM-INSTRUCTION-MISSING-033`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: system-instruction config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-086 — `L8-SECURITY-004-01-M-SYSTEM-INSTRUCTION-STALE-034`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みsystem-instruction config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-087 — `L8-SECURITY-004-01-M-SYSTEM-INSTRUCTION-OTHER-PROJECT-035`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: system-instruction config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-088 — `L8-SECURITY-004-01-M-SYSTEM-INSTRUCTION-UNKNOWN-036`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: system-instruction config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-089 — `L8-SECURITY-004-01-M-MODEL-CONFIG-MISSING-037`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: model-config config source refだけを必要input refsから省く。
- exact expected（L8正本）: 必要refを解決できず`Rejected(missing_key)`を返し、下流projectionを呼ばない。該当source ownerへ返す。

### SEC-UT-090 — `L8-SECURITY-004-01-M-MODEL-CONFIG-STALE-038`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: 必要config source refs/current owner bindingはすべて既知で一致し、保存済みK6 verifier `Value`は直前のcurrent keyに対応する。
- 一つの変異（L8正本）: 保存済みmodel-config config Valueはそのまま保持し、照会側のcurrent revision keyだけを新しいowner-declared revisionへ変更する。
- exact expected（L8正本）: K6 verifier結果のK2 lookup componentは`Stale(prior Value, recorded_key, current_key)`を保持する。`RequiredResult`はK6既存合成に従って肯定しない。source missing/Unknownは別fixture。default補完なし。該当source ownerへ。

### SEC-UT-091 — `L8-SECURITY-004-01-M-MODEL-CONFIG-OTHER-PROJECT-039`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: model-config config sourceだけを別projectへ結ぶ。
- exact expected（L8正本）: source identityと両project値は既知で、照会元projectとの確定binding mismatchである。K6 `RequiredResult`はcurrent `VerifierSet`の型付きdomain payloadとowner `PolarityOf=Negative`を保持して`combined=Negative`となる。K2 `Unknown(conflict)`やsource unknownへ読み替えず、該当source ownerへ返す。

### SEC-UT-092 — `L8-SECURITY-004-01-M-MODEL-CONFIG-UNKNOWN-040`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: model-config config valueだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該config componentのfixture指定済み`Unknown(indeterminate)`をそのまま保持し、`RequiredResult`は既存K6合成で非肯定にする。default補完なし。該当source ownerへ返す。

### SEC-UT-093 — `L8-SECURITY-005-01-REPOSITORY-MIX-001`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: synthetic markerだけをrepository outputへ混入させる。
- exact expected（L8正本）: K6 `RequiredResult`は当該 leak verifier の既知 `Value(payload)` とowner `PolarityOf<T>=Negative`を保持し、`combined=Negative`。raw valueはprojection/evidenceへ出さない。

### SEC-UT-094 — `L8-SECURITY-005-01-WORKER-STORE-002`

- L9 verifier(s): `IV-SECURITY-005-01`; aliasから共有する追加verifier: `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: synthetic markerだけをWorker store outputへ露出させる。
- exact expected（L8正本）: K6 `RequiredResult`は当該 leak verifier の既知 `Value(payload)` とowner `PolarityOf<T>=Negative`を保持し、`combined=Negative`。raw valueはprojection/evidenceへ出さずWorker ownerへ戻す。

### SEC-UT-095 — `L8-SECURITY-005-01-EGRESS-LEAK-003`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: synthetic markerだけをegress outputへ漏えいさせる。
- exact expected（L8正本）: K6 `RequiredResult`は当該 leak verifier の既知 `Value(payload)` とowner `PolarityOf<T>=Negative`を保持し、`combined=Negative`。raw valueはprojection/evidenceへ出さずegress ownerへ戻す。

### SEC-UT-096 — `L8-SECURITY-005-01-RECEIPT-LEAK-004`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: synthetic markerだけをreceipt fieldへ記録させる。
- exact expected（L8正本）: K6 `RequiredResult`は当該 leak verifier の既知 `Value(payload)` とowner `PolarityOf<T>=Negative`を保持し、`combined=Negative`。raw valueをreceipt/projectionへ渡さずK6/SECURITY ownerへ戻す。

### SEC-UT-097 — `L8-SECURITY-005-01-CLASSIFIER-DRIFT-005`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: 一consumerのcurrent classifier referenceだけを他consumerのreferenceと異なる既知sourceへ変更する。
- exact expected（L8正本）: K6 `RequiredResult`のclassifier-consistency componentは既知の型付きmismatch `Value(payload)`を保持し、そのowner `PolarityOf<T>`はNegative、`combined=Negative`。これはK2同revision・異digestのsource-key conflictではない。

### SEC-UT-098 — `L8-SECURITY-005-01-CLASS-UNKNOWN-006`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: classification componentだけをfixtureの既存`Unknown(indeterminate)`へ置換する。
- exact expected（L8正本）: K6 `RequiredResult`のclassification componentは`Unknown(indeterminate)`、他のsource/permission componentsはbaselineのまま。Unknown classificationをpermitへ変換しない。

### SEC-UT-099 — `L8-SECURITY-005-01-INSPECTION-UNREADABLE-007`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6 `required`); K3 permissionは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: classifier sourceのreadだけを不能にする。
- exact expected（L8正本）: K6 `RequiredResult`のclassifier source componentは`Unknown(unreadable)`。他consumerで補完しない。

### SEC-UT-100 — `L8-SECURITY-005-01-PURPOSE-MISSING-008`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: complete current K3 queryを構成できるままrequired purpose domain input値だけを欠落させる。
- exact expected（L8正本）: K3 `PermissionCheckResult`のpurpose componentは`Unknown(missing_input)`、`combined=Undetermined`。K3 query key自体は構成可能なので`PermissionCheckDiagnostic(missing_key)`ではない。

### SEC-UT-101 — `L8-SECURITY-005-01-EXPIRED-009`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: 同一permission recordのexpiryだけをfixture current timeより過去にする。current queryとrevocation observationはbaselineのまま。
- exact expected（L8正本）: 完全なcurrent K3 queryで既知のexpiry違反により`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。

### SEC-UT-102 — `L8-SECURITY-005-01-REVOKED-010`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`: source、classifier、current binding、current permission inputは完全かつ既知であり、指定mutation以外の全fieldは基準入力と同一。
- 一つの変異（L8正本）: current revocation observationだけを明示的な取消済み状態へ変える。
- exact expected（L8正本）: 取消しを読めたcurrent queryなので`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。

### SEC-UT-103 — `L8-SECURITY-006-01-SOURCE-MISMATCH-001`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source, query key, owner declarations, および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: egress sourceだけを別の既知sourceへ変更する。
- exact expected（L8正本）: 完全current K3 queryの確定不一致により`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。これはK2 `Unknown(conflict)`ではない。

### SEC-UT-104 — `L8-SECURITY-006-01-SCOPE-MISMATCH-002`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source, query key, owner declarations, および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: requested scopeだけを明示許可範囲外の既知scopeへ変更する。
- exact expected（L8正本）: 完全current K3 queryの確定不一致により`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。これはK2 `Unknown(conflict)`ではない。

### SEC-UT-105 — `L8-SECURITY-006-01-PURPOSE-MISMATCH-003`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source, query key, owner declarations, および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: operation purposeだけを許可外の既知purposeへ変更する。
- exact expected（L8正本）: 完全current K3 queryの確定不一致により`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。これはK2 `Unknown(conflict)`ではない。

### SEC-UT-106 — `L8-SECURITY-006-01-AUTHORITY-MISMATCH-004`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source, query key, owner declarations, および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: permission tupleの既知authority値だけを許可recordと不一致にする。
- exact expected（L8正本）: 完全current K3 queryの確定不一致により`PermissionCheckResult.combined=Negative`。該当componentはowner定義の型付き`Value(payload)`を保ち、owner `PolarityOf<T>`はNegative。これはK2 `Unknown(conflict)`ではない。

### SEC-UT-107 — `L8-SECURITY-006-01-CLASS-UNKNOWN-005`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source、query key、owner declaration、 および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: data-classification operation inputだけを`Unknown(indeterminate)`へ置換する。
- exact expected（L8正本）: K3 classification componentは`Unknown(indeterminate)`、`combined=Undetermined`。他成分とsource refsはbaselineのまま。

### SEC-UT-108 — `L8-SECURITY-006-01-EXPIRY-UNKNOWN-006`

- L9 verifier(s): `IV-SECURITY-006-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-006-01-BASE`: current permission source、query key、owner declaration、 および無関係なoperation inputは完全かつ既知である。
- 一つの変異（L8正本）: expiry observationだけを`Unknown(unreadable)`へ置換する。
- exact expected（L8正本）: K3 expiry componentは`Unknown(unreadable)`、`combined=Undetermined`。expiryを許可扱いせず、他成分はbaselineのまま。

### SEC-UT-109 — `L8-SECURITY-007-01-M-WRITE-PATH-MISSING-001`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: write-path constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-110 — `L8-SECURITY-007-01-M-NETWORK-MISSING-002`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: network constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-111 — `L8-SECURITY-007-01-M-CREDENTIAL-MISSING-003`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: credential constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-112 — `L8-SECURITY-007-01-M-ENVIRONMENT-MISSING-004`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: environment constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-113 — `L8-SECURITY-007-01-M-TIMEOUT-MISSING-005`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: timeout constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-114 — `L8-SECURITY-007-01-M-RESOURCE-MISSING-006`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: resource constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-115 — `L8-SECURITY-007-01-M-DIFF-MISSING-007`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: diff constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-116 — `L8-SECURITY-007-01-M-ROLLBACK-MISSING-008`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: rollback constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-117 — `L8-SECURITY-007-01-M-RESULT-COLLECTION-MISSING-009`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: result-collection constraintのmissingだけを与える。
- exact expected（L8正本）: constraint source/refは存在し、完全読取のdomain fieldが欠けている。`RequiredResult`の該当constraint componentを`Unknown(missing_input)`とし、他制約と合成して肯定しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-118 — `L8-SECURITY-007-01-M-WRITE-PATH-UNOBSERVED-001`

- L9 verifier(s): `IV-SECURITY-007-01`; aliasから共有する追加verifier: `IV-SECURITY-007-01`, `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: write-path post-state適用観測だけを未実施にする。policy declaration/source readと他8制約は既知の正常値。
- exact expected（L8正本）: `RequiredResult`のwrite-path適用観測componentは厳密に`Unobserved(not_run)`。policy declarationから適用済みを推定せず、他8制約のpositiveで相殺しない。Worker/INFRA ownerへ戻す。

### SEC-UT-119 — `L8-SECURITY-007-01-M-WRITE-PATH-UNKNOWN-010`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: write-path constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-120 — `L8-SECURITY-007-01-M-NETWORK-UNKNOWN-011`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: network constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-121 — `L8-SECURITY-007-01-M-CREDENTIAL-UNKNOWN-012`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: credential constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-122 — `L8-SECURITY-007-01-M-ENVIRONMENT-UNKNOWN-013`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: environment constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-123 — `L8-SECURITY-007-01-M-TIMEOUT-UNKNOWN-014`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: timeout constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-124 — `L8-SECURITY-007-01-M-RESOURCE-UNKNOWN-015`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: resource constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-125 — `L8-SECURITY-007-01-M-DIFF-UNKNOWN-016`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: diff constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-126 — `L8-SECURITY-007-01-M-ROLLBACK-UNKNOWN-017`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: rollback constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-127 — `L8-SECURITY-007-01-M-RESULT-COLLECTION-UNKNOWN-018`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: result-collection constraintのunknownだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(indeterminate)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-128 — `L8-SECURITY-007-01-M-WRITE-PATH-UNSUPPORTED-019`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: write-path constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-129 — `L8-SECURITY-007-01-M-NETWORK-UNSUPPORTED-020`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: network constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-130 — `L8-SECURITY-007-01-M-CREDENTIAL-UNSUPPORTED-021`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: credential constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-131 — `L8-SECURITY-007-01-M-ENVIRONMENT-UNSUPPORTED-022`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: environment constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-132 — `L8-SECURITY-007-01-M-TIMEOUT-UNSUPPORTED-023`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: timeout constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-133 — `L8-SECURITY-007-01-M-RESOURCE-UNSUPPORTED-024`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: resource constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-134 — `L8-SECURITY-007-01-M-DIFF-UNSUPPORTED-025`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: diff constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-135 — `L8-SECURITY-007-01-M-ROLLBACK-UNSUPPORTED-026`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: rollback constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-136 — `L8-SECURITY-007-01-M-RESULT-COLLECTION-UNSUPPORTED-027`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: result-collection constraintのunsupportedだけを与える。
- exact expected（L8正本）: `RequiredResult`の当該constraint componentをfixtureの`Unknown(unsupported)`に固定し、他制約で相殺しない。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-137 — `L8-SECURITY-007-01-POST-OBSERVATION-OMITTED-028`

- L9 verifier(s): `IV-SECURITY-007-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-007-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: read-only labelがあることだけを根拠にpost-state observationを省く。
- exact expected（L8正本）: post-state観測を未実施として`Unobserved(not_run)`に固定する。policy declarationから適用結果を導かず、Worker/INFRA ownerへ戻す。値不足はSECURITYへ、適用・観測はWorker/INFRAへ戻す。

### SEC-UT-138 — `L8-SECURITY-008-01-M-ACTOR-DRIFT-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: actor軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-139 — `L8-SECURITY-008-01-M-TARGET-DRIFT-002`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: target軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-140 — `L8-SECURITY-008-01-M-OPERATION-DRIFT-003`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operation軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-141 — `L8-SECURITY-008-01-M-REVISION-DRIFT-004`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: revision軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-142 — `L8-SECURITY-008-01-M-ENVIRONMENT-DRIFT-005`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: environment軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-143 — `L8-SECURITY-008-01-M-SCOPE-DRIFT-006`

- L9 verifier(s): `IV-SECURITY-008-01`; aliasから共有する追加verifier: `IV-SECURITY-NFR-002`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: scope軸だけを別のcurrent valueへ置換。
- exact expected（L8正本）: K3 `PermissionCheckResult.combined=Negative`。不一致componentは`Value(domain_payload)`のまま、ownerの`PolarityOf`を適用する。owner declaration欠落は既存Unknown、K2 key不能はPermissionCheckDiagnostic(missing_key)。

### SEC-UT-144 — `L8-SECURITY-008-01-M-EXPIRY-DRIFT-007`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 他のcurrent query/record軸を固定し、permission record expiry=`2026-10-09T11:59:00Z`、query evaluation time=`2026-10-09T12:00:00Z`とする。
- exact expected（L8正本）: 完全typed/current queryでexpiredが確定するためK3は型付きdomain payloadを`Value(payload)`として保持し、ownerの`PolarityOf<payload>`がNegativeである場合に限りその成分をNegativeとする。期限source自体を解決できない場合はこのfixtureの範囲外で、別のUnknown fixtureとして扱う。

### SEC-UT-145 — `L8-SECURITY-008-01-M-READ-TO-WRITE-008`

- L9 verifier(s): `IV-SECURITY-008-01`; aliasから共有する追加verifier: `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからwriteへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-146 — `L8-SECURITY-008-01-M-READ-TO-EXECUTE-009`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからexecuteへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-147 — `L8-SECURITY-008-01-M-READ-TO-NETWORK-010`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからnetworkへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-148 — `L8-SECURITY-008-01-M-READ-TO-INSTALL-011`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからinstallへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-149 — `L8-SECURITY-008-01-M-READ-TO-DELETE-012`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからdeleteへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-150 — `L8-SECURITY-008-01-M-READ-TO-MERGE-013`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからmergeへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-151 — `L8-SECURITY-008-01-M-READ-TO-RELEASE-014`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからreleaseへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-152 — `L8-SECURITY-008-01-M-READ-TO-DEPLOY-015`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからdeployへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-153 — `L8-SECURITY-008-01-M-READ-TO-CREDENTIAL-USE-016`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからcredential-useへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-154 — `L8-SECURITY-008-01-M-READ-TO-SECURITY-CHANGE-017`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: operationだけreadからsecurity-changeへ置換。
- exact expected（L8正本）: 当該operationの独立K3 queryで照合し、read permissionを再利用しない。既知のcurrent record不一致ではK3 `PermissionCheckResult.combined=Negative`。component payload型は保ち、ownerの`PolarityOf`を適用する。

### SEC-UT-155 — `L8-SECURITY-009-01-M-REVOKE-UNRELATED-SCOPE-001`

- L9 verifier(s): `IV-SECURITY-009-01`; aliasから共有する追加verifier: `IV-SECURITY-NFR-005`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger REVOKE のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをREVOKE triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-156 — `L8-SECURITY-009-01-M-SCOPE-DRIFT-UNRELATED-SCOPE-002`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger SCOPE-DRIFT のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをSCOPE-DRIFT triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-157 — `L8-SECURITY-009-01-M-CREDENTIAL-LEAK-UNRELATED-SCOPE-003`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger CREDENTIAL-LEAK のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをCREDENTIAL-LEAK triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-158 — `L8-SECURITY-009-01-M-ABNORMAL-COMMUNICATION-UNRELATED-SCOPE-004`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger ABNORMAL-COMMUNICATION のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをABNORMAL-COMMUNICATION triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-159 — `L8-SECURITY-009-01-M-RUNTIME-DEVIATION-UNRELATED-SCOPE-005`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger RUNTIME-DEVIATION のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをRUNTIME-DEVIATION triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-160 — `L8-SECURITY-009-01-M-UNKNOWN-UNRELATED-SCOPE-006`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: 対象trigger UNKNOWN のcurrent graph/RecipientMap/RecipientDeclと全対象recipient applied receiptを固定。無関係scopeの独立stateを別に持つ。
- 一つの変異（L8正本）: 無関係scopeのreceiptだけをUNKNOWN triggerの別scope receiptへ差し替える。対象triggerのgraph/recipient/receiptは変更しない。
- exact expected（L8正本）: IV-G5-01(2)/04(4)：対象集合のapplied成分は`Value`かつowner polarity Positive、`PropagationView.combined=Positive`を保つ。別scope receiptは対象集合へ入れず、無関係scopeにglobal stopを生成しない。

### SEC-UT-161 — `L8-SECURITY-014-01-M-MEMORY-WRONG-TARGET-001`

- L9 verifier(s): `IV-SECURITY-014-01`; aliasから共有する追加verifier: `IV-SECURITY-014-01`, `IV-SECURITY-NFR-014-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-014-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: memory targetだけを別targetのclassification refへ結ぶ。
- exact expected（L8正本）: current targetとclassification refは既知だが、異なるmemory targetへ結び付いている。K6 `RequiredResult`は型付きmismatch payloadを保持し、current verifier ownerの`PolarityOf<T>`がNegativeへ写して`combined=Negative`となる。handoff/save/evaluation/registrationは生成しない。

### SEC-UT-162 — `L8-SECURITY-014-01-M-TRAINING-DATASET-WRONG-TARGET-002`

- L9 verifier(s): `IV-SECURITY-014-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-014-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: training-dataset targetだけを別targetのclassification refへ結ぶ。
- exact expected（L8正本）: current targetとclassification refは既知だが、異なるtraining-dataset targetへ結び付いている。K6 `RequiredResult`は型付きmismatch payloadを保持し、current verifier ownerの`PolarityOf<T>`がNegativeへ写して`combined=Negative`となる。handoff/save/evaluation/registrationは生成しない。

### SEC-UT-163 — `L8-SECURITY-014-01-M-BRAIN-KNOWLEDGE-WRONG-TARGET-003`

- L9 verifier(s): `IV-SECURITY-014-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-014-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: brain-knowledge targetだけを別targetのclassification refへ結ぶ。
- exact expected（L8正本）: current targetとclassification refは既知だが、異なるBRAIN-knowledge targetへ結び付いている。K6 `RequiredResult`は型付きmismatch payloadを保持し、current verifier ownerの`PolarityOf<T>`がNegativeへ写して`combined=Negative`となる。handoff/save/evaluation/registrationは生成しない。

### SEC-UT-164 — `L8-SECURITY-015-01-M-OWNER-MISSING-001`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`: 完全読取済みasset declaration/current bindingは正常。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: ownerだけを欠落させる。
- exact expected（L8正本）: 完全読取済みcurrent asset declarationから`owner` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。既定値で補完せず、publicへ昇格しない。

### SEC-UT-165 — `L8-SECURITY-015-01-M-IDENTITY-MISSING-002`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`: 完全読取済みasset declaration/current bindingは正常。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: identityだけを欠落させる。
- exact expected（L8正本）: 完全読取済みcurrent asset declarationから`identity` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。既定値で補完せず、publicへ昇格しない。

### SEC-UT-166 — `L8-SECURITY-015-01-M-SOURCE-MISSING-003`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`: 完全読取済みasset declaration/current bindingは正常。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: sourceだけを欠落させる。
- exact expected（L8正本）: 完全読取済みcurrent asset declarationから`source` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。既定値で補完せず、publicへ昇格しない。

### SEC-UT-167 — `L8-SECURITY-015-01-M-REVISION-MISSING-004`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`: 完全読取済みasset declaration/current bindingは正常。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: revisionだけを欠落させる。
- exact expected（L8正本）: 完全読取済みcurrent asset declarationから`revision` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。既定値で補完せず、publicへ昇格しない。

### SEC-UT-168 — `L8-SECURITY-015-01-M-DIGEST-MISSING-005`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`: 完全読取済みasset declaration/current bindingは正常。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: digestだけを欠落させる。
- exact expected（L8正本）: 完全読取済みcurrent asset declarationから`digest` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。既定値で補完せず、publicへ昇格しない。

### SEC-UT-169 — `L8-SECURITY-016-01-M-PUBLIC-RECORD-UNKNOWN-001`

- L9 verifier(s): `IV-SECURITY-016-01`; aliasから共有する追加verifier: `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: public classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-170 — `L8-SECURITY-016-01-M-CUSTOMER-OWNED-RECORD-UNKNOWN-002`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: customer-owned classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-171 — `L8-SECURITY-016-01-M-SERVICE-INTERNAL-RECORD-UNKNOWN-003`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: service-internal classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-172 — `L8-SECURITY-016-01-M-HELIX-CONFIDENTIAL-RECORD-UNKNOWN-004`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: helix-confidential classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-173 — `L8-SECURITY-016-01-M-HELIX-RESTRICTED-RECORD-UNKNOWN-005`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: helix-restricted classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-174 — `L8-SECURITY-016-01-M-SECRET-RECORD-UNKNOWN-006`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: secret classification recordだけを既存Unknownへ置換。
- exact expected（L8正本）: その分類fieldの既存Unknownを保持。public/allowへ寄せずclassification ownerへ。

### SEC-UT-175 — `L8-SECURITY-020-01-M-INJECTION-GUARD-OMITTED-001`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Injection Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-176 — `L8-SECURITY-020-01-M-SCOPE-GUARD-OMITTED-002`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Scope Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-177 — `L8-SECURITY-020-01-M-HOOK-GUARD-OMITTED-003`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Hook Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-178 — `L8-SECURITY-020-01-M-SECRET-GUARD-OMITTED-004`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Secret Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-179 — `L8-SECURITY-020-01-M-EGRESS-GUARD-OMITTED-005`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Egress Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-180 — `L8-SECURITY-020-01-M-RUNTIME-GUARD-OMITTED-006`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Runtime Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-181 — `L8-SECURITY-020-01-M-PERMISSION-GUARD-OMITTED-007`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Permission Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-182 — `L8-SECURITY-020-01-M-CORE-ASSET-GUARD-OMITTED-008`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Core Asset Guardのcurrent ruleだけを評価集合から省く。残る7 GuardとBot inputはbaselineどおり。
- exact expected（L8正本）: L3 AC-020-01の固定8 Guard集合との既知rule omission。K6 `RequiredResult`の当該rule componentはowner verifierの型付き`Value(payload)`を保持し、owner `PolarityOf<T>`がNegative、`combined=Negative`。Bot presenceは条件にしない。

### SEC-UT-183 — `L8-SECURITY-033-01-RAW-SECRET-OUTPUT-001`

- L9 verifier(s): `IV-SECURITY-033-01`; aliasから共有する追加verifier: `IV-SECURITY-NFR-001`
- L5 API候補: `project_verification` (K6 secret/source) と `project_permission` (K3 operation authority) を別々に照合
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Worker outputにsynthetic markerのraw valueを含める。
- exact expected（L8正本）: K6の該当 secret/classification component はcurrent sourceから既知の禁止条件を示し、owner-defined typed payloadと`PolarityOf<T>=Negative`で`RequiredResult.combined=Negative`。K3 permission resultはその独立queryを保持する。raw contentは記録せず該当dispatchだけ停止し、無関係taskは継続する。

### SEC-UT-184 — `L8-SECURITY-033-01-SECRET-TASK-CONTENT-002`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `project_verification` (K6 secret/source) と `project_permission` (K3 operation authority) を別々に照合
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: task boundary内にsecret/confidential contentを含める。
- exact expected（L8正本）: K6の該当 secret/classification component はcurrent sourceから既知の禁止条件を示し、owner-defined typed payloadと`PolarityOf<T>=Negative`で`RequiredResult.combined=Negative`。K3 permission resultはその独立queryを保持する。raw contentは記録せず該当dispatchだけ停止し、無関係taskは継続する。

### SEC-UT-185 — `L8-SECURITY-002-01-IGNORE-INSTRUCTIONS-AS-DATA-006`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを「ignore previous instructions」だけをdata labelで固定する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`とdata labelを保持する。記録projectionは`validated_transition=NotSelected`、K8 validation/effect queryは発行しない。完全なinjection検出器の有無は判定しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-186 — `L8-SECURITY-002-01-WRITE-AGENTS-AS-DATA-007`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを「AGENTS.mdへ書け」だけをdata labelで固定する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`とdata labelを保持する。記録projectionは`validated_transition=NotSelected`、K8 validation/effect queryは発行しない。完全なinjection検出器の有無は判定しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-187 — `L8-SECURITY-002-01-DELETE-REPOSITORY-AS-DATA-008`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを「repository削除」だけをdata labelで固定する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`とdata labelを保持する。記録projectionは`validated_transition=NotSelected`、K8 validation/effect queryは発行しない。完全なinjection検出器の有無は判定しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-188 — `L8-SECURITY-002-01-SAVE-MEMORY-AS-DATA-009`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを「memory保存」だけをdata labelで固定する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`とdata labelを保持する。記録projectionは`validated_transition=NotSelected`、K8 validation/effect queryは発行しない。完全なinjection検出器の有無は判定しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-189 — `L8-SECURITY-002-01-SEND-CREDENTIAL-AS-DATA-010`

- L9 verifier(s): `IV-SECURITY-002-01`
- L5 API候補: `project_external_label`
- baseline（L8正本）: `L8-SECURITY-002-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: query未発行・owner not_selectedの記録projectionで、入力dataを「credential送信」だけをdata labelで固定する。という誤った接続を試みる。
- exact expected（L8正本）: `ObservedLabel.trust=untrusted`とdata labelを保持する。記録projectionは`validated_transition=NotSelected`、K8 validation/effect queryは発行しない。完全なinjection検出器の有無は判定しない。 これは記録projectionの構造assertionで、selected routeを明示照会するTRANSITION fixtureとは入力selectionが異なる。

### SEC-UT-190 — `L8-SECURITY-003-01-STATE-CROSS-008`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: project stateだけを別projectへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-191 — `L8-SECURITY-003-01-AGENT-CROSS-009`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Agent refだけを別scopeへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-192 — `L8-SECURITY-003-01-HOOK-CROSS-010`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Hook refだけを別scopeへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-193 — `L8-SECURITY-003-01-CREDENTIAL-CROSS-011`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: credential scope refだけを別scopeへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-194 — `L8-SECURITY-003-01-MEMORY-CROSS-012`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: memory targetだけを別scopeへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-195 — `L8-SECURITY-003-01-ARTIFACT-CROSS-013`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: artifact refだけを別scopeへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-196 — `L8-SECURITY-003-01-WORKER-CROSS-014`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Worker targetだけを別assignmentへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-197 — `L8-SECURITY-003-01-EXECUTION-CROSS-015`

- L9 verifier(s): `IV-SECURITY-003-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-003-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: execution targetだけを別projectへ移す。
- exact expected（L8正本）: `resolve_security_case`は`Observed<ResolvedSecurityCase>`を返す。完全なcurrent K3 queryは`PermissionCheckResult.combined=Negative`を返し、不一致componentはowner定義型Tの`Value(payload)`を保ち、ownerの`PolarityOf<T>`がpayloadをNegativeへ写す。この既知domain mismatchは`Unknown(conflict)`ではない。assignment/environment sourceはOS/INFRASTRUCTUREへ戻す。

### SEC-UT-198 — `L8-SECURITY-009-01-REVOKE-RECIPIENT-UNOBSERVED-007`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-199 — `L8-SECURITY-009-01-SCOPE-DRIFT-RECIPIENT-UNOBSERVED-008`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-200 — `L8-SECURITY-009-01-CREDENTIAL-LEAK-RECIPIENT-UNOBSERVED-009`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-201 — `L8-SECURITY-009-01-ABNORMAL-COMM-RECIPIENT-UNOBSERVED-010`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-202 — `L8-SECURITY-009-01-RUNTIME-DEVIATION-RECIPIENT-UNOBSERVED-011`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-203 — `L8-SECURITY-009-01-UNKNOWN-TRIGGER-RECIPIENT-UNOBSERVED-012`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-204 — `L8-SECURITY-010-01-SOURCE-CODE-IDENTITY-001`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はSOURCE-CODEで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはSOURCE-CODEのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-205 — `L8-SECURITY-010-01-DEPENDENCY-IDENTITY-002`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はDEPENDENCYで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはDEPENDENCYのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-206 — `L8-SECURITY-010-01-PACKAGE-IDENTITY-003`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はPACKAGEで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはPACKAGEのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-207 — `L8-SECURITY-010-01-PLUGIN-IDENTITY-004`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はPLUGINで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはPLUGINのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-208 — `L8-SECURITY-010-01-MCP-IDENTITY-005`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はMCPで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはMCPのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-209 — `L8-SECURITY-010-01-SKILL-IDENTITY-006`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はSKILLで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはSKILLのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-210 — `L8-SECURITY-010-01-AGENT-DEFINITION-IDENTITY-007`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はAGENT-DEFINITIONで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはAGENT-DEFINITIONのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-211 — `L8-SECURITY-010-01-HOOK-IDENTITY-008`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はHOOKで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはHOOKのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-212 — `L8-SECURITY-010-01-RUNTIME-CONFIG-IDENTITY-009`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はRUNTIME-CONFIGで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはRUNTIME-CONFIGのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-213 — `L8-SECURITY-010-01-SANDBOX-POLICY-IDENTITY-010`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はSANDBOX-POLICYで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはSANDBOX-POLICYのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-214 — `L8-SECURITY-010-01-MODEL-IDENTITY-011`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はMODELで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはMODELのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-215 — `L8-SECURITY-010-01-MODEL-WEIGHTS-IDENTITY-012`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はMODEL-WEIGHTSで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはMODEL-WEIGHTSのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-216 — `L8-SECURITY-010-01-PROMPT-SYSTEM-INSTRUCTION-IDENTITY-013`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はPROMPT-SYSTEM-INSTRUCTIONで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはPROMPT-SYSTEM-INSTRUCTIONのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-217 — `L8-SECURITY-010-01-CONNECTOR-IDENTITY-014`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はCONNECTORで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはCONNECTORのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-218 — `L8-SECURITY-010-01-INFRASTRUCTURE-CONFIG-IDENTITY-015`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象種別はINFRASTRUCTURE-CONFIGで必要source/owner refsを既知にする。
- 一つの変異（L8正本）: 対象identityはINFRASTRUCTURE-CONFIGのまま、provenance/digest/dependency evidenceだけを別の対象種別のrefから代理流用する。
- exact expected（L8正本）: 別対象のrefとの確定不一致はK6 componentの`Value(domain_payload)`として保持し、owner `PolarityOf=Negative`、`RequiredResult.combined=Negative`。同revision異digestのK2 conflictとは区別し、各field/refとassuranceを捨てない。

### SEC-UT-219 — `L8-SECURITY-011-01-VERSION-CHANGE-001`

- L9 verifier(s): `IV-SECURITY-011-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-011-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 同一対象のversionだけを変更。
- exact expected（L8正本）: current before/afterのversion差分をprojectionで別fieldとして保持する。同名/hashから不変を推定しない。L4/L5はこのdomain fieldのK1 polarity/reasonを定めないため、このfieldのK1 mappingだけを局所未決としてownerへ戻す。

### SEC-UT-220 — `L8-SECURITY-011-01-CAPABILITY-CHANGE-002`

- L9 verifier(s): `IV-SECURITY-011-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-011-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 同一対象のcapabilityだけをread-onlyからwriteへ変更。
- exact expected（L8正本）: current before/after capability差分は既知のowner-defined typed domain payloadとしてK6 `RequiredResult`に保持する。owner `PolarityOf<T>=Negative`なら`combined=Negative`。owner mapping自体が不明な場合だけ該当fieldを`Unknown(unsupported)`として保持する。

### SEC-UT-221 — `L8-SECURITY-011-01-IMPACT-CHANGE-003`

- L9 verifier(s): `IV-SECURITY-011-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-011-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 同一対象のsecurity impact fieldだけを変更。
- exact expected（L8正本）: current before/afterのsecurity impact差分をprojectionで別fieldとして保持する。同名/hashから不変を推定しない。L4/L5はこのdomain fieldのK1 polarity/reasonを定めないため、このfieldのK1 mappingだけを局所未決としてownerへ戻す。

### SEC-UT-222 — `L8-SECURITY-012-01-SOURCE-MISSING-001`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `resolve_security_case`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 必須source `SubjectRef`だけを必要input refsから省く（domain fieldの値欠落ではない）。
- exact expected（L8正本）: `Rejected(missing_key)`を返し、下流projectionを呼ばない。K1にmissing classは作らない。

### SEC-UT-223 — `L8-SECURITY-012-01-VERSION-UNKNOWN-002`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: versionだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-224 — `L8-SECURITY-012-01-DIGEST-MISSING-003`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: domain provenanceのdigest fieldだけを欠落させる。全`SubjectRef`の4必須fieldとdigest形式は完全かつ有効のまま。
- exact expected（L8正本）: domain digest fieldを`Unknown(missing_input)`として保持しtrustedへ昇格しない。K2 key診断へ読み替えない。

### SEC-UT-225 — `L8-SECURITY-012-01-DEPENDENCY-UNKNOWN-004`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: dependencyだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-226 — `L8-SECURITY-012-01-PERMISSION-UNKNOWN-005`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: permission refだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-227 — `L8-SECURITY-012-01-NETWORK-UNKNOWN-006`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: network fieldだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-228 — `L8-SECURITY-012-01-RISK-UNKNOWN-007`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: risk fieldだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-229 — `L8-SECURITY-012-01-UPDATE-UNKNOWN-008`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: update fieldだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-230 — `L8-SECURITY-012-01-ROLLBACK-UNKNOWN-009`

- L9 verifier(s): `IV-SECURITY-012-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-012-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: rollback refだけを既存Unknownへ置換。
- exact expected（L8正本）: 当該domain fieldだけを`Unknown(indeterminate)`に固定して保持しtrustedへ昇格しない。既存SubjectRefと他fieldは完全のまま。

### SEC-UT-231 — `L8-SECURITY-013-01-BUILD-ARTIFACT-MISMATCH-001`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: build artifact identityだけを別artifactへ置換。
- exact expected（L8正本）: current chain refsと比較対象がともに既知のartifact identity不一致。K6 `RequiredResult`の該当chain componentはowner-defined typed `Value(payload)`を保ち、verifier `PolarityOf<T>`はNegative、`combined=Negative`。`issuer_authenticity=Unknown(unsupported)`は別assuranceとして保持する。

### SEC-UT-232 — `L8-SECURITY-013-01-VALIDATION-STEP-MISSING-002`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: validation chain step refだけを欠落。
- exact expected（L8正本）: 必要chain fieldのsourceは存在し完全読取できるが値が欠けているため、K6 `RequiredResult`の該当componentは`Unknown(missing_input)`。他chain fieldsを保持し、digest/receiptからtrustを導かない。`issuer_authenticity=Unknown(unsupported)`は別assurance。

### SEC-UT-233 — `L8-SECURITY-013-01-DISTRIBUTION-ARTIFACT-MISMATCH-003`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: distribution artifact refだけを別artifactへ置換。
- exact expected（L8正本）: current chain refsと比較対象がともに既知のartifact identity不一致。K6 `RequiredResult`の該当chain componentはowner-defined typed `Value(payload)`を保ち、verifier `PolarityOf<T>`はNegative、`combined=Negative`。`issuer_authenticity=Unknown(unsupported)`は別assuranceとして保持する。

### SEC-UT-234 — `L8-SECURITY-013-01-EXECUTION-ARTIFACT-MISMATCH-004`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: execution artifact refだけを別artifactへ置換。
- exact expected（L8正本）: current chain refsと比較対象がともに既知のartifact identity不一致。K6 `RequiredResult`の該当chain componentはowner-defined typed `Value(payload)`を保ち、verifier `PolarityOf<T>`はNegative、`combined=Negative`。`issuer_authenticity=Unknown(unsupported)`は別assuranceとして保持する。

### SEC-UT-235 — `L8-SECURITY-013-01-PRODUCER-MISSING-005`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: producer refだけを欠落。
- exact expected（L8正本）: 必要chain fieldのsourceは存在し完全読取できるが値が欠けているため、K6 `RequiredResult`の該当componentは`Unknown(missing_input)`。他chain fieldsを保持し、digest/receiptからtrustを導かない。`issuer_authenticity=Unknown(unsupported)`は別assurance。

### SEC-UT-236 — `L8-SECURITY-016-01-RECORD-OWNER-MISSING-007`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: classification record source/current bindingは既知で、完全読取済み。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: classification record ownerだけを欠落。
- exact expected（L8正本）: 完全読取済みclassification recordから`owner` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。public/allowへ昇格せず、asset metadataや過去K2 `Value`で補完しない。

### SEC-UT-237 — `L8-SECURITY-016-01-RECORD-SOURCE-MISSING-008`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: classification record source/current bindingは既知で、完全読取済み。指定field以外は基準入力と同一。
- 一つの変異（L8正本）: classification record sourceだけを欠落。
- exact expected（L8正本）: 完全読取済みclassification recordから`source` domain fieldだけが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`。public/allowへ昇格せず、asset metadataや過去K2 `Value`で補完しない。

### SEC-UT-238 — `L8-SECURITY-016-01-RECORD-REVISION-STALE-009`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: classification record revisionだけを旧くする。
- exact expected（L8正本）: L4 AC-016どおりclassification recordのrevision stale 009 domain fieldは`Unknown`として保持しpublic/allowへ昇格しない。reason mappingはAC-016で指定されないため、このfieldのUnknown reasonだけを局所未決として残す。過去K2 `Value` lookupの`Stale`とは区別し、asset metadataで補完しない。

### SEC-UT-239 — `L8-SECURITY-016-01-ASSET-RECORD-MISMATCH-010`

- L9 verifier(s): `IV-SECURITY-016-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-016-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 別assetのclassification recordだけを結ぶ。
- exact expected（L8正本）: L4 AC-016どおりclassification recordのasset mismatch 010 domain fieldは`Unknown`として保持しpublic/allowへ昇格しない。reason mappingはAC-016で指定されないため、このfieldのUnknown reasonだけを局所未決として残す。過去K2 `Value` lookupの`Stale`とは区別し、asset metadataで補完しない。

### SEC-UT-240 — `L8-SECURITY-020-01-BOT-DELEGATION-009`

- L9 verifier(s): `IV-SECURITY-020-01`; aliasから共有する追加verifier: `IV-SECURITY-020-01`, `IV-SECURITY-NFR-004`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: deterministic rule結果をBotへ委譲。
- exact expected（L8正本）: 固定deterministic Guard ruleをBotへ委譲する既知mismatchは、K6 `RequiredResult`の該当rule componentがowner-defined typed `Value(payload)`とowner `PolarityOf<T>=Negative`を保ち`combined=Negative`。

### SEC-UT-241 — `L8-SECURITY-020-01-BLANKET-WRITE-010`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_permission` → K3 `check_permission`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: Botへblanket Writeを付与。
- exact expected（L8正本）: 完全current K3 queryで許可されないblanket Writeは`PermissionCheckResult.combined=Negative`。該当permission componentはowner-defined typed `Value(payload)`とowner `PolarityOf<T>`を保つ。新しいgrantは生成しない。

### SEC-UT-242 — `L8-SECURITY-020-01-OPTIONAL-BOTS-REQUIRED-011`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 全候補Botの有無を1.0条件へ加える。
- exact expected（L8正本）: optional Botが不在でもfailureではない。固定deterministic Guard projectionとK6 `RequiredResult`は基準入力と同一に保つ。Bot数条件やverifierは追加しない。

### SEC-UT-243 — `L8-SECURITY-020-01-SINK-1X-AS-REQUIRED-012`

- L9 verifier(s): `IV-SECURITY-020-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-020-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: 1.x public sink completionを1.0条件へ加える。
- exact expected（L8正本）: 1.x public sinkの完成はこの1.0 rule setの対象外である。固定Guard集合が変わらなければK6 `RequiredResult`は基準入力と同一に保ち、1.x verifier/gateは追加しない。

### SEC-UT-244 — `L8-SECURITY-028-01-DESCRIPTOR-IDENTITY-MISSING-001`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: current HARNESS descriptorのfunctional identity domain fieldが完全読取で欠けている（必須`SubjectRef` fieldは完全）。
- exact expected（L8正本）: current descriptorは完全読取済みで、必須SubjectRef fieldは揃っているが、functional identity domain fieldが欠けている。L5 AC-004の技術投影候補に従い、該当K6 componentは`Unknown(missing_input)`として保持しHARNESS ownerへ戻す。missing classは作らず、共通lifecycleも追加しない。

### SEC-UT-245 — `L8-SECURITY-028-01-CONTRACT-VERSION-MISMATCH-002`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: descriptor contract versionだけを変更。
- exact expected（L8正本）: current descriptor/artifact inputと比較基準がともに既知の確定domain mismatch。K6 `RequiredResult`は該当componentのowner-defined typed `Value(payload)`を保持し、verifier `PolarityOf<T>`はNegative、`combined=Negative`。K2 `Unknown(conflict)`やsource unknownへ読み替えず、HARNESS ownerへ戻す。common lifecycleを追加しない。

### SEC-UT-246 — `L8-SECURITY-028-01-SCOPE-MISMATCH-003`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: verification scopeだけを対象外へ変更。
- exact expected（L8正本）: current descriptor/artifact inputと比較基準がともに既知の確定domain mismatch。K6 `RequiredResult`は該当componentのowner-defined typed `Value(payload)`を保持し、verifier `PolarityOf<T>`はNegative、`combined=Negative`。K2 `Unknown(conflict)`やsource unknownへ読み替えず、HARNESS ownerへ戻す。common lifecycleを追加しない。

### SEC-UT-247 — `L8-SECURITY-028-01-TARGET-MISMATCH-004`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: verification target identityだけを別artifactへ変更。
- exact expected（L8正本）: current descriptor/artifact inputと比較基準がともに既知の確定domain mismatch。K6 `RequiredResult`は該当componentのowner-defined typed `Value(payload)`を保持し、verifier `PolarityOf<T>`はNegative、`combined=Negative`。K2 `Unknown(conflict)`やsource unknownへ読み替えず、HARNESS ownerへ戻す。common lifecycleを追加しない。

### SEC-UT-248 — `L8-SECURITY-028-01-ARTIFACT-VERSION-MISMATCH-005`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: artifact versionだけを変更。
- exact expected（L8正本）: current descriptor/artifact inputと比較基準がともに既知の確定domain mismatch。K6 `RequiredResult`は該当componentのowner-defined typed `Value(payload)`を保持し、verifier `PolarityOf<T>`はNegative、`combined=Negative`。K2 `Unknown(conflict)`やsource unknownへ読み替えず、SECURITY L1-013 ownerへ戻す。common lifecycleを追加しない。

### SEC-UT-249 — `L8-SECURITY-028-01-ARTIFACT-DIGEST-MISMATCH-006`

- L9 verifier(s): `IV-SECURITY-028-01`; aliasから共有する追加verifier: `IV-SECURITY-NFR-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`: §3/§4の正常基準入力。指定mutation以外のfield/source refは基準入力と同一。
- 一つの変異（L8正本）: artifact digestだけを変更。
- exact expected（L8正本）: current descriptor/artifact inputと比較基準がともに既知の確定domain mismatch。K6 `RequiredResult`は該当componentのowner-defined typed `Value(payload)`を保持し、verifier `PolarityOf<T>`はNegative、`combined=Negative`。K2 `Unknown(conflict)`やsource unknownへ読み替えず、SECURITY L1-013 ownerへ戻す。common lifecycleを追加しない。

### SEC-UT-250 — `L8-SECURITY-004-01-M-SOURCE-UNREGISTERED-041`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 唯一のconfig source/reader状態をsource-unregisteredにする。
- exact expected（L8正本）: K6の該当source componentは`Unknown(unregistered)`。config ownerへ戻し、defaultを使わない。

### SEC-UT-251 — `L8-SECURITY-004-01-M-READER-UNREGISTERED-042`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 唯一のconfig source/reader状態をreader-unregisteredにする。
- exact expected（L8正本）: K6の該当source componentは`Unknown(unregistered)`。config ownerへ戻し、defaultを使わない。

### SEC-UT-252 — `L8-SECURITY-004-01-M-SOURCE-UNREADABLE-043`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 唯一のconfig source/reader状態をsource-unreadableにする。
- exact expected（L8正本）: K6の該当source componentは`Unknown(unreadable)`。config ownerへ戻し、defaultを使わない。

### SEC-UT-253 — `L8-SECURITY-004-01-M-READER-UNREADABLE-044`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 唯一のconfig source/reader状態をreader-unreadableにする。
- exact expected（L8正本）: K6の該当source componentは`Unknown(unreadable)`。config ownerへ戻し、defaultを使わない。

### SEC-UT-254 — `L8-SECURITY-004-01-M-DEFAULT-ADOPTED-045`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: current config sourceに値がないとき、候補runtimeが暗黙defaultを実効値として採用する。
- exact expected（L8正本）: defaultの出所がcurrent sourceにないため該当componentは`Unknown(missing_input)`のまま。default値をsource結果として採用しない。

### SEC-UT-255 — `L8-SECURITY-004-01-M-ROOT-FIELD-MISSING-046`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`root` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-256 — `L8-SECURITY-004-01-M-HEAD-FIELD-MISSING-047`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`HEAD` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-257 — `L8-SECURITY-004-01-M-REVISION-FIELD-MISSING-048`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`revision` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-258 — `L8-SECURITY-004-01-M-DIGEST-FIELD-MISSING-049`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`digest` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-259 — `L8-SECURITY-004-01-M-OWNER-FIELD-MISSING-050`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`owner` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-260 — `L8-SECURITY-004-01-M-SCOPE-FIELD-MISSING-051`

- L9 verifier(s): `IV-SECURITY-004-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-004-01-BASE`。必要な他source/current bindingは正常値のまま。
- 一つの変異（L8正本）: 完全に読めた一つのconfig recordから`scope` domain fieldだけを欠落させる。ref/source bytes自体は存在する。
- exact expected（L8正本）: 該当fieldは`Unknown(missing_input)`として保持し、既定値で補完しない。

### SEC-UT-261 — `L8-SECURITY-005-01-M-CLASSIFIER-SOURCE-UNREGISTERED-011`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: classifier sourceだけをunregisteredにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 当該source componentを`Unknown(unregistered)`として非肯定に保ち、raw secretを記録しない。source ownerへ返す。

### SEC-UT-262 — `L8-SECURITY-005-01-M-CLASSIFIER-SOURCE-UNOBSERVED-012`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: classifier sourceだけをunobservedにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 登録済みsourceの実適用/読取結果が未観測なので、当該componentを`Unobserved(not_run)`として保持し、raw secretを記録しない。source ownerへ返す。

### SEC-UT-263 — `L8-SECURITY-005-01-M-CREDENTIAL-SOURCE-UNREGISTERED-013`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: credential sourceだけをunregisteredにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 当該source componentを`Unknown(unregistered)`として非肯定に保ち、raw secretを記録しない。source ownerへ返す。

### SEC-UT-264 — `L8-SECURITY-005-01-M-CREDENTIAL-SOURCE-UNOBSERVED-014`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: credential sourceだけをunobservedにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 登録済みsourceの実適用/読取結果が未観測なので、当該componentを`Unobserved(not_run)`として保持し、raw secretを記録しない。source ownerへ返す。

### SEC-UT-265 — `L8-SECURITY-005-01-M-OWNER-SOURCE-UNREGISTERED-015`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: owner sourceだけをunregisteredにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 当該source componentを`Unknown(unregistered)`として非肯定に保ち、raw secretを記録しない。source ownerへ返す。

### SEC-UT-266 — `L8-SECURITY-005-01-M-OWNER-SOURCE-UNOBSERVED-016`

- L9 verifier(s): `IV-SECURITY-005-01`
- L5 API候補: `project_verification` (K6); K3 queryは別projection
- baseline（L8正本）: `L8-SECURITY-005-01-BASE`。secretはsynthetic markerで値を出力しない。
- 一つの変異（L8正本）: owner sourceだけをunobservedにする。他のcurrent refsはbaselineを保つ。
- exact expected（L8正本）: 登録済みsourceの実適用/読取結果が未観測なので、当該componentを`Unobserved(not_run)`として保持し、raw secretを記録しない。source ownerへ返す。

### SEC-UT-267 — `L8-SECURITY-008-01-M-ACTOR-MISSING-018`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: actor axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-268 — `L8-SECURITY-008-01-M-ACTOR-UNKNOWN-019`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: actor axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-269 — `L8-SECURITY-008-01-M-ACTOR-STALE-020`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: actor軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-270 — `L8-SECURITY-008-01-M-ACTOR-CONFLICT-021`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: actor axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-271 — `L8-SECURITY-008-01-M-TARGET-MISSING-022`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: target axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-272 — `L8-SECURITY-008-01-M-TARGET-UNKNOWN-023`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: target axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-273 — `L8-SECURITY-008-01-M-TARGET-STALE-024`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: target軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-274 — `L8-SECURITY-008-01-M-TARGET-CONFLICT-025`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: target axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-275 — `L8-SECURITY-008-01-M-OPERATION-MISSING-026`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: operation axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-276 — `L8-SECURITY-008-01-M-OPERATION-UNKNOWN-027`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: operation axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-277 — `L8-SECURITY-008-01-M-OPERATION-STALE-028`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: operation軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-278 — `L8-SECURITY-008-01-M-OPERATION-CONFLICT-029`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: operation axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-279 — `L8-SECURITY-008-01-M-REVISION-MISSING-030`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: revision axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-280 — `L8-SECURITY-008-01-M-REVISION-UNKNOWN-031`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: revision axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-281 — `L8-SECURITY-008-01-M-REVISION-STALE-032`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: revision軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-282 — `L8-SECURITY-008-01-M-REVISION-CONFLICT-033`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: revision axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-283 — `L8-SECURITY-008-01-M-ENVIRONMENT-MISSING-034`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: environment axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-284 — `L8-SECURITY-008-01-M-ENVIRONMENT-UNKNOWN-035`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: environment axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-285 — `L8-SECURITY-008-01-M-ENVIRONMENT-STALE-036`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: environment軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-286 — `L8-SECURITY-008-01-M-ENVIRONMENT-CONFLICT-037`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: environment axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-287 — `L8-SECURITY-008-01-M-SCOPE-MISSING-038`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: scope axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-288 — `L8-SECURITY-008-01-M-SCOPE-UNKNOWN-039`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: scope axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-289 — `L8-SECURITY-008-01-M-SCOPE-STALE-040`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: scope軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-290 — `L8-SECURITY-008-01-M-SCOPE-CONFLICT-041`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: scope axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-291 — `L8-SECURITY-008-01-M-EXPIRY-MISSING-042`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。 current keyの必須refはすべて存在し、source bytesは完全読取済み。
- 一つの変異（L8正本）: expiry axisの必須current valueだけを欠落させる。K3 query自体は他field/refを保持する。
- exact expected（L8正本）: K3の当該source componentは`Unknown(missing_input)`、`PermissionCheckResult.combined=Undetermined`。key構成可能なdomain value欠落だけを検査する。

### SEC-UT-292 — `L8-SECURITY-008-01-M-EXPIRY-UNKNOWN-043`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: expiry axisのsource/valueだけを既存K1 `Unknown`へ置換する。
- exact expected（L8正本）: K3は入力componentの既存Unknown class/reasonを保持し、allowへ昇格しない。

### SEC-UT-293 — `L8-SECURITY-008-01-M-EXPIRY-STALE-044`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。actor/target/operation/revision/environment/scope/expiry、`subject`、`operation_version`、`scope`、required-input identity集合、各source identityはすべてcurrent baselineのまま。保存済みK3 `Value(payload)`とその完全な`recorded_key`を与える。
- 一つの変異（L8正本）: expiry軸を供給する同一owner sourceの`identity`とsource identity集合を保ち、そのsourceの`revision`だけをowner-declared新revisionへ進める。保存済みresultとrecorded keyは変更せず、current keyでlookupする。
- exact expected（L8正本）: K2 lookupのみに`Stale(prior=Value(payload), recorded_key, current_key)`を返す。両keyのoperation/subject/scope/inputs identityは同一で、差は当該既存source refのrevisionだけ。fresh queryのaxis mismatchを`Stale`にしない。

### SEC-UT-294 — `L8-SECURITY-008-01-M-EXPIRY-CONFLICT-045`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。他の6軸・operation・owner declarationを固定。
- 一つの変異（L8正本）: expiry axisの同一revision sourceに対するdigestだけをcurrent keyと食い違わせる。
- exact expected（L8正本）: 同revision異digestはK2/K3既存規則どおり`Unknown(conflict)`であり、確定domain mismatchへしない。

### SEC-UT-295 — `L8-SECURITY-008-01-M-AGENT-USE-TO-WRITE-046`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。Agent read/use permissionは有効。
- 一つの変異（L8正本）: Agent利用権だけから包括`write` operationを継承させる。
- exact expected（L8正本）: 当該`write`/`deploy`用の独立current K3 queryは既存根拠を欠き非肯定となる。包括grantを生成せず、operation mappingの未定義分は§7の局所保留を保つ。

### SEC-UT-296 — `L8-SECURITY-008-01-M-AGENT-USE-TO-DEPLOY-047`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-008-01-BASE`。Agent read/use permissionは有効。
- 一つの変異（L8正本）: Agent利用権だけから包括`deploy` operationを継承させる。
- exact expected（L8正本）: 当該`write`/`deploy`用の独立current K3 queryは既存根拠を欠き非肯定となる。包括grantを生成せず、operation mappingの未定義分は§7の局所保留を保つ。

### SEC-UT-297 — `L8-SECURITY-009-01-M-REVOKE-NOT-REACHED-013`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-298 — `L8-SECURITY-009-01-M-REVOKE-REUSES-SCOPE-DRIFT-033`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: revoke triggerのrecipient/state refをscope-drift triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-299 — `L8-SECURITY-009-01-M-SCOPE-DRIFT-NOT-REACHED-014`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-300 — `L8-SECURITY-009-01-M-SCOPE-DRIFT-REUSES-CREDENTIAL-LEAK-034`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: scope-drift triggerのrecipient/state refをcredential-leak triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-301 — `L8-SECURITY-009-01-M-CREDENTIAL-LEAK-NOT-REACHED-015`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-302 — `L8-SECURITY-009-01-M-CREDENTIAL-LEAK-REUSES-ABNORMAL-COMMUNICATION-035`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: credential-leak triggerのrecipient/state refをabnormal-communication triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-303 — `L8-SECURITY-009-01-M-ABNORMAL-COMMUNICATION-NOT-REACHED-016`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-304 — `L8-SECURITY-009-01-M-ABNORMAL-COMMUNICATION-REUSES-RUNTIME-DEVIATION-036`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: abnormal-communication triggerのrecipient/state refをruntime-deviation triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-305 — `L8-SECURITY-009-01-M-RUNTIME-DEVIATION-NOT-REACHED-017`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-306 — `L8-SECURITY-009-01-M-RUNTIME-DEVIATION-REUSES-UNKNOWN-TRIGGER-037`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: runtime-deviation triggerのrecipient/state refをunknown-trigger triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-307 — `L8-SECURITY-009-01-M-UNKNOWN-TRIGGER-NOT-REACHED-018`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有のcurrent recipient/source mapは存在。
- 一つの変異（L8正本）: 当該triggerの対象recipientのcurrent revocation_apply receiptだけを不存在にする。
- exact expected（L8正本）: IV-G5-01/04：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。残りのapplied成分とassuranceを保持し、SECURITYはstateを変更しない。

### SEC-UT-308 — `L8-SECURITY-009-01-M-UNKNOWN-TRIGGER-REUSES-REVOKE-038`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `resolve_security_case` → `project_propagation`
- baseline（L8正本）: `L8-SECURITY-009-01-BASE`。trigger固有recipient mapを持つ。
- 一つの変異（L8正本）: unknown-trigger triggerのrecipient/state refをrevoke triggerのmapから流用する。 流用先のreceiptは取消しrecordのidentityが対象triggerのcurrent recordと異なる。
- exact expected（L8正本）: IV-G5-04(1)：対象recipient componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。別identityのappliedを対象取消しの適用へ数えない。

### SEC-UT-309 — `L8-SECURITY-010-01-M-SOURCE-CODE-FIELD-UNKNOWN-401`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSOURCE-CODE、他の対象とrefを固定。
- 一つの変異（L8正本）: SOURCE-CODE対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-310 — `L8-SECURITY-010-01-M-SOURCE-CODE-UNKNOWN-FIELD-ACCEPTED-421`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSOURCE-CODE、他の対象とrefを固定。
- 一つの変異（L8正本）: SOURCE-CODE対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-311 — `L8-SECURITY-010-01-M-DEPENDENCY-FIELD-UNKNOWN-402`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はDEPENDENCY、他の対象とrefを固定。
- 一つの変異（L8正本）: DEPENDENCY対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-312 — `L8-SECURITY-010-01-M-DEPENDENCY-UNKNOWN-FIELD-ACCEPTED-422`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はDEPENDENCY、他の対象とrefを固定。
- 一つの変異（L8正本）: DEPENDENCY対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-313 — `L8-SECURITY-010-01-M-PACKAGE-FIELD-UNKNOWN-403`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPACKAGE、他の対象とrefを固定。
- 一つの変異（L8正本）: PACKAGE対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-314 — `L8-SECURITY-010-01-M-PACKAGE-UNKNOWN-FIELD-ACCEPTED-423`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPACKAGE、他の対象とrefを固定。
- 一つの変異（L8正本）: PACKAGE対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-315 — `L8-SECURITY-010-01-M-PLUGIN-FIELD-UNKNOWN-404`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPLUGIN、他の対象とrefを固定。
- 一つの変異（L8正本）: PLUGIN対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-316 — `L8-SECURITY-010-01-M-PLUGIN-UNKNOWN-FIELD-ACCEPTED-424`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPLUGIN、他の対象とrefを固定。
- 一つの変異（L8正本）: PLUGIN対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-317 — `L8-SECURITY-010-01-M-MCP-FIELD-UNKNOWN-405`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMCP、他の対象とrefを固定。
- 一つの変異（L8正本）: MCP対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-318 — `L8-SECURITY-010-01-M-MCP-UNKNOWN-FIELD-ACCEPTED-425`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMCP、他の対象とrefを固定。
- 一つの変異（L8正本）: MCP対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-319 — `L8-SECURITY-010-01-M-SKILL-FIELD-UNKNOWN-406`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSKILL、他の対象とrefを固定。
- 一つの変異（L8正本）: SKILL対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-320 — `L8-SECURITY-010-01-M-SKILL-UNKNOWN-FIELD-ACCEPTED-426`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSKILL、他の対象とrefを固定。
- 一つの変異（L8正本）: SKILL対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-321 — `L8-SECURITY-010-01-M-AGENT-DEFINITION-FIELD-UNKNOWN-407`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はAGENT-DEFINITION、他の対象とrefを固定。
- 一つの変異（L8正本）: AGENT-DEFINITION対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-322 — `L8-SECURITY-010-01-M-AGENT-DEFINITION-UNKNOWN-FIELD-ACCEPTED-427`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はAGENT-DEFINITION、他の対象とrefを固定。
- 一つの変異（L8正本）: AGENT-DEFINITION対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-323 — `L8-SECURITY-010-01-M-HOOK-FIELD-UNKNOWN-408`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はHOOK、他の対象とrefを固定。
- 一つの変異（L8正本）: HOOK対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-324 — `L8-SECURITY-010-01-M-HOOK-UNKNOWN-FIELD-ACCEPTED-428`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はHOOK、他の対象とrefを固定。
- 一つの変異（L8正本）: HOOK対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-325 — `L8-SECURITY-010-01-M-RUNTIME-CONFIG-FIELD-UNKNOWN-409`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はRUNTIME-CONFIG、他の対象とrefを固定。
- 一つの変異（L8正本）: RUNTIME-CONFIG対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-326 — `L8-SECURITY-010-01-M-RUNTIME-CONFIG-UNKNOWN-FIELD-ACCEPTED-429`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はRUNTIME-CONFIG、他の対象とrefを固定。
- 一つの変異（L8正本）: RUNTIME-CONFIG対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-327 — `L8-SECURITY-010-01-M-SANDBOX-POLICY-FIELD-UNKNOWN-410`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSANDBOX-POLICY、他の対象とrefを固定。
- 一つの変異（L8正本）: SANDBOX-POLICY対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-328 — `L8-SECURITY-010-01-M-SANDBOX-POLICY-UNKNOWN-FIELD-ACCEPTED-430`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はSANDBOX-POLICY、他の対象とrefを固定。
- 一つの変異（L8正本）: SANDBOX-POLICY対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-329 — `L8-SECURITY-010-01-M-MODEL-FIELD-UNKNOWN-411`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMODEL、他の対象とrefを固定。
- 一つの変異（L8正本）: MODEL対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-330 — `L8-SECURITY-010-01-M-MODEL-UNKNOWN-FIELD-ACCEPTED-431`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMODEL、他の対象とrefを固定。
- 一つの変異（L8正本）: MODEL対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-331 — `L8-SECURITY-010-01-M-MODEL-WEIGHTS-FIELD-UNKNOWN-412`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMODEL-WEIGHTS、他の対象とrefを固定。
- 一つの変異（L8正本）: MODEL-WEIGHTS対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-332 — `L8-SECURITY-010-01-M-MODEL-WEIGHTS-UNKNOWN-FIELD-ACCEPTED-432`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はMODEL-WEIGHTS、他の対象とrefを固定。
- 一つの変異（L8正本）: MODEL-WEIGHTS対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-333 — `L8-SECURITY-010-01-M-PROMPT-SYSTEM-INSTRUCTION-FIELD-UNKNOWN-413`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPROMPT-SYSTEM-INSTRUCTION、他の対象とrefを固定。
- 一つの変異（L8正本）: PROMPT-SYSTEM-INSTRUCTION対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-334 — `L8-SECURITY-010-01-M-PROMPT-SYSTEM-INSTRUCTION-UNKNOWN-FIELD-ACCEPTED-433`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はPROMPT-SYSTEM-INSTRUCTION、他の対象とrefを固定。
- 一つの変異（L8正本）: PROMPT-SYSTEM-INSTRUCTION対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-335 — `L8-SECURITY-010-01-M-CONNECTOR-FIELD-UNKNOWN-414`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はCONNECTOR、他の対象とrefを固定。
- 一つの変異（L8正本）: CONNECTOR対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-336 — `L8-SECURITY-010-01-M-CONNECTOR-UNKNOWN-FIELD-ACCEPTED-434`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はCONNECTOR、他の対象とrefを固定。
- 一つの変異（L8正本）: CONNECTOR対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-337 — `L8-SECURITY-010-01-M-INFRASTRUCTURE-CONFIG-FIELD-UNKNOWN-415`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はINFRASTRUCTURE-CONFIG、他の対象とrefを固定。
- 一つの変異（L8正本）: INFRASTRUCTURE-CONFIG対象のprovenance fieldだけを既存Unknownへ置換する。
- exact expected（L8正本）: 当該K6 componentの既存Unknown class/reasonを保持しtrustedへ昇格しない。

### SEC-UT-338 — `L8-SECURITY-010-01-M-INFRASTRUCTURE-CONFIG-UNKNOWN-FIELD-ACCEPTED-435`

- L9 verifier(s): `IV-SECURITY-010-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-010-01-BASE`。対象はINFRASTRUCTURE-CONFIG、他の対象とrefを固定。
- 一つの変異（L8正本）: INFRASTRUCTURE-CONFIG対象に定義外のunknown fieldだけを加え、その値を既知の許可fieldとして採用する。
- exact expected（L8正本）: 宣言外fieldは該当K6 componentの`Unknown`として保持し、`RequiredResult.combined=Undetermined`。reasonだけは既存owner verifierで未固定のため§7局所保留。既知fieldやallowへ変換しない。

### SEC-UT-339 — `L8-SECURITY-013-01-BUILD-STEP-MISSING-006`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他chain refs/digests/receiptをcurrentで既知にする。
- 一つの変異（L8正本）: build stage refだけをchainから欠落させる。
- exact expected（L8正本）: K6の該当chain componentを`Unknown(missing_input)`として保持し、他stageのdigest一致で補わない。

### SEC-UT-340 — `L8-SECURITY-013-01-DISTRIBUTION-STEP-MISSING-007`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他chain refs/digests/receiptをcurrentで既知にする。
- 一つの変異（L8正本）: distribution stage refだけをchainから欠落させる。
- exact expected（L8正本）: K6の該当chain componentを`Unknown(missing_input)`として保持し、他stageのdigest一致で補わない。

### SEC-UT-341 — `L8-SECURITY-013-01-EXECUTION-STEP-MISSING-008`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他chain refs/digests/receiptをcurrentで既知にする。
- 一つの変異（L8正本）: execution stage refだけをchainから欠落させる。
- exact expected（L8正本）: K6の該当chain componentを`Unknown(missing_input)`として保持し、他stageのdigest一致で補わない。

### SEC-UT-342 — `L8-SECURITY-013-01-ARTIFACT-DIGEST-MISMATCH-009`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。identity/version/provenance/producer chainは同一。
- 一つの変異（L8正本）: 同一artifactのdigestだけを比較対象と不一致にする。
- exact expected（L8正本）: 既知のartifact bytes mismatchをchain componentに保持し、K6 issuer authenticityは`Unknown(unsupported)`のまま。digest一致/不一致からissuer authenticityを導かない。

### SEC-UT-343 — `L8-SECURITY-013-01-CHAIN-SOURCE-MISSING-010`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他のchain elementsは既知かつcurrent。
- 一つの変異（L8正本）: chain-source ref/valueだけをmissingにする。
- exact expected（L8正本）: K6該当componentは`Unknown(missing_input)`。issuer authenticityは別assuranceとして`Unknown(unsupported)`を保持する。

### SEC-UT-344 — `L8-SECURITY-013-01-CHAIN-SOURCE-STALE-011`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。artifact/chain identity、K6 operation/subject/scope、required-input identity集合と他source refsは既知かつ同一。該当K6 source refにはprior `Value(payload)`があり、完全な`recorded_key`へ保存済み。
- 一つの変異（L8正本）: chain-sourceの同じsource identityを保ち、current source refのrevisionだけをowner-declared新revisionへ進めてcurrent K6 keyでlookupする。prior result/keyは変更しない。
- exact expected（L8正本）: K2 lookupは`Stale(prior=Value(payload), recorded_key, current_key)`を返す。operation/subject/scope/input identity集合は不変で、key差は該当source ref revisionのみ。fresh mismatchやkey identity集合変更はStaleにしない。K6 `issuer_authenticity=Unknown(unsupported)`は独立assuranceとして維持する。

### SEC-UT-345 — `L8-SECURITY-013-01-CHAIN-SOURCE-UNREADABLE-012`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他のchain elementsは既知かつcurrent。
- 一つの変異（L8正本）: chain-source ref/valueだけをunreadableにする。
- exact expected（L8正本）: K6該当componentは`Unknown(unreadable)`。issuer authenticityは別assuranceとして`Unknown(unsupported)`を保持する。

### SEC-UT-346 — `L8-SECURITY-013-01-RECEIPT-MISSING-013`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他のchain elementsは既知かつcurrent。
- 一つの変異（L8正本）: receipt ref/valueだけをmissingにする。
- exact expected（L8正本）: K6該当componentは`Unknown(missing_input)`。issuer authenticityは別assuranceとして`Unknown(unsupported)`を保持する。

### SEC-UT-347 — `L8-SECURITY-013-01-RECEIPT-STALE-014`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。artifact/chain identity、K6 operation/subject/scope、required-input identity集合と他source refsは既知かつ同一。該当K6 source refにはprior `Value(payload)`があり、完全な`recorded_key`へ保存済み。
- 一つの変異（L8正本）: receiptの同じsource identityを保ち、current source refのrevisionだけをowner-declared新revisionへ進めてcurrent K6 keyでlookupする。prior result/keyは変更しない。
- exact expected（L8正本）: K2 lookupは`Stale(prior=Value(payload), recorded_key, current_key)`を返す。operation/subject/scope/input identity集合は不変で、key差は該当source ref revisionのみ。fresh mismatchやkey identity集合変更はStaleにしない。K6 `issuer_authenticity=Unknown(unsupported)`は独立assuranceとして維持する。

### SEC-UT-348 — `L8-SECURITY-013-01-RECEIPT-UNREADABLE-015`

- L9 verifier(s): `IV-SECURITY-013-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-013-01-BASE`。他のchain elementsは既知かつcurrent。
- 一つの変異（L8正本）: receipt ref/valueだけをunreadableにする。
- exact expected（L8正本）: K6該当componentは`Unknown(unreadable)`。issuer authenticityは別assuranceとして`Unknown(unsupported)`を保持する。

### SEC-UT-349 — `L8-SECURITY-015-01-M-OLD-IDENTITY-REUSE-006`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`。他asset refsとowner bindingsは正常。
- 一つの変異（L8正本）: asset digestだけを更新した後も旧revisionのidentityを新revisionへ再利用する。
- exact expected（L8正本）: L4 AC-015どおり更新版を別版として保持する。同一identityの内容書換えとしてpositive扱いせず、K1/K2 lookup Staleと混同しない。

### SEC-UT-350 — `L8-SECURITY-015-01-M-UNKNOWN-AS-PUBLIC-007`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`。asset identity/source/owner refsは読取り可能で既知。入力classification componentだけを`Unknown(indeterminate)`とする。
- 一つの変異（L8正本）: input ref、asset identity/source、その他のcomponentは変えず、projectionだけがclassificationを`public`として返す。
- exact expected（L8正本）: `Unknown(indeterminate)` classificationを保持し、`public`/allowへ昇格しない。K8/K1既存語彙の`Unknown(indeterminate)`を使い、asset identity不明の変異はこのfixtureへ混ぜない。

### SEC-UT-351 — `L8-SECURITY-015-01-M-DIGEST-NEW-VERSION-008`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`。他asset refsとowner bindingsは正常。
- 一つの変異（L8正本）: 同じrevision identityのdigestだけを変更する。
- exact expected（L8正本）: digest変更を別version/sourceとして表示し、同一版のpositiveとして扱わない。これは完全読取済みdomain fieldの欠落ではなく、K1/K2 lookup `Stale`やconflictへ読み替えない。

### SEC-UT-352 — `L8-SECURITY-015-01-M-OUTSIDE-ASSET-LIST-009`

- L9 verifier(s): `IV-SECURITY-015-01`
- L5 API候補: `project_verification`
- baseline（L8正本）: `L8-SECURITY-015-01-BASE`。他asset refsとowner bindingsは正常。
- 一つの変異（L8正本）: 既知列挙にない合成asset identityを入力する。
- exact expected（L8正本）: 列挙外assetをpublicや無条件許可にせず、asset owner/identity mappingを既存`Unknown`のまま保持する。source/readerの登録・読取状態が不明な場合のreasonはowner mappingが定める範囲に限り、別のUnknown fixtureとする。

### SEC-UT-353 — `L8-SECURITY-028-01-M-DESCRIPTOR-ARTIFACT-007`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`。他descriptor/target refsは既知でcurrent。
- 一つの変異（L8正本）: descriptor artifact refだけを別artifactへ結ぶ。
- exact expected（L8正本）: current descriptor/artifact mismatchを保持しK6 verifier ownerの既存Negative mappingがある場合だけNegative、未定義ならfield-local hold。

### SEC-UT-354 — `L8-SECURITY-028-01-M-DESCRIPTOR-COMPATIBILITY-008`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`。他descriptor/target refsは既知でcurrent。
- 一つの変異（L8正本）: descriptor compatibility fieldだけを既知の不一致へ変える。
- exact expected（L8正本）: compatibility mismatchを保持。L4/L5はそのfieldのK1 mappingを固定しないため結果class/reason mappingだけ局所保留。

### SEC-UT-355 — `L8-SECURITY-028-01-M-DESCRIPTOR-DEPENDENCY-009`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`。他descriptor/target refsは既知でcurrent。
- 一つの変異（L8正本）: descriptor dependency refだけを欠落させる。
- exact expected（L8正本）: dependency evidenceを補わず非肯定に保つ。正確なK1 mappingは当該fieldのowner rule範囲に限り、未定義なら局所保留。

### SEC-UT-356 — `L8-SECURITY-028-01-M-VERSION-TARGET-AS-RELEASED-010`

- L9 verifier(s): `IV-SECURITY-028-01`
- L5 API候補: `resolve_security_case` → `project_verification`
- baseline（L8正本）: `L8-SECURITY-028-01-BASE`。他descriptor/target refsは既知でcurrent。
- 一つの変異（L8正本）: descriptorの`version_target`候補だけを実際のartifact versionとして扱う。
- exact expected（L8正本）: `version_target`は実artifact観測でないためversion/artifact acceptanceを生成しない。実artifact sourceは欠落として非肯定に保つ。

### SEC-UT-357 — `L8-SECURITY-033-01-M-WORKER-VERSION-DRIFT-016`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: worker-versionだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。OS/Worker descriptor ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-358 — `L8-SECURITY-033-01-M-WORKER-CONFIG-DRIFT-017`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: worker-configだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。OS/Worker descriptor ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-359 — `L8-SECURITY-033-01-M-TARGET-DRIFT-018`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: targetだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。HARNESS target ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-360 — `L8-SECURITY-033-01-M-RULE-REVISION-DRIFT-019`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: rule-revisionだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。SECURITY rule ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-361 — `L8-SECURITY-033-01-M-AUTHORITY-REVISION-DRIFT-020`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: authority-revisionだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。existing authority ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-362 — `L8-SECURITY-033-01-M-ASSIGNMENT-SCOPE-DRIFT-023`

- L9 verifier(s): `IV-SECURITY-033-01`; aliasから共有する追加verifier: `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` → `project_permission`
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。current OS assignment、Worker descriptor、K3 permission sourceと他binding refsは正常。
- 一つの変異（L8正本）: assignment scopeだけをowner-declared別scopeへ変更し、他のbinding fieldはbaselineのままにする。
- exact expected（L8正本）: OS assignment ownerのcurrent scopeをK3 queryへ反映する。既知の完全queryが許可scopeと不一致なら`PermissionCheckResult.combined=Negative`で、該当componentは既存typed `Value(payload)`とowner `PolarityOf<T>`を維持する。source/key不足はこのfixtureに含めない。OS assignment ownerへ戻す。

### SEC-UT-363 — `L8-SECURITY-033-01-M-HEAD-DRIFT-021`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: HEADだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。current source ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-364 — `L8-SECURITY-033-01-M-TASK-BOUNDARY-DRIFT-022`

- L9 verifier(s): `IV-SECURITY-033-01`
- L5 API候補: `resolve_security_case` plus the applicable K3/K6/K7 projection
- baseline（L8正本）: `L8-SECURITY-033-01-BASE`。他binding refs/current owner valuesは一致。
- 一つの変異（L8正本）: task-boundaryだけをowner-declared別値へ変更し旧bindingを再利用する。
- exact expected（L8正本）: 変更後のcurrent owner fieldを保持し、old bindingを肯定へ流用しない。OS assignment ownerへ戻す。対象fieldのK1 class/reasonはowner contractが明示する範囲だけ採用し、未指定なら§7で局所保留。

### SEC-UT-365 — `L8-SECURITY-NFR-003-CLASS-PUBLIC-001`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`public`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `public` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-366 — `L8-SECURITY-NFR-003-CLASS-CUSTOMER-OWNED-002`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`customer-owned`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `customer-owned` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-367 — `L8-SECURITY-NFR-003-CLASS-SERVICE-INTERNAL-003`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`service-internal`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `service-internal` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-368 — `L8-SECURITY-NFR-003-CLASS-HELIX-CONFIDENTIAL-004`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`helix-confidential`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `helix-confidential` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-369 — `L8-SECURITY-NFR-003-CLASS-HELIX-RESTRICTED-005`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`helix-restricted`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `helix-restricted` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-370 — `L8-SECURITY-NFR-003-CLASS-SECRET-006`

- L9 verifier(s): `IV-SECURITY-NFR-003`
- L5 API候補: `project_verification` (K6 classification record)
- baseline（L8正本）: `L8-SECURITY-NFR-003-BASE`。record/source/asset bindingは完全。
- 一つの変異（L8正本）: classification fieldだけを固定L2の`secret`へ設定する。
- exact expected（L8正本）: K6 classification projectionは既存owner-defined `secret` classを正確に保持する。これはasset class observationのみで、public classからoperation allowを生成しない。

### SEC-UT-371 — `L8-SECURITY-NFR-006-WRITE-PATH-BEFORE-001`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: write-pathのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-372 — `L8-SECURITY-NFR-006-WRITE-PATH-AT-002`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: write-pathのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-373 — `L8-SECURITY-NFR-006-WRITE-PATH-OVER-003`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: write-pathのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-374 — `L8-SECURITY-NFR-006-NETWORK-BEFORE-004`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: networkのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-375 — `L8-SECURITY-NFR-006-NETWORK-AT-005`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: networkのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-376 — `L8-SECURITY-NFR-006-NETWORK-OVER-006`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: networkのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-377 — `L8-SECURITY-NFR-006-CREDENTIAL-BEFORE-007`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: credentialのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-378 — `L8-SECURITY-NFR-006-CREDENTIAL-AT-008`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: credentialのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-379 — `L8-SECURITY-NFR-006-CREDENTIAL-OVER-009`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: credentialのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-380 — `L8-SECURITY-NFR-006-ENVIRONMENT-BEFORE-010`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: environmentのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-381 — `L8-SECURITY-NFR-006-ENVIRONMENT-AT-011`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: environmentのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-382 — `L8-SECURITY-NFR-006-ENVIRONMENT-OVER-012`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: environmentのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-383 — `L8-SECURITY-NFR-006-TIMEOUT-BEFORE-013`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: timeoutのcurrent観測だけをowner宣言の数値境界`b`より前（`< b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-384 — `L8-SECURITY-NFR-006-TIMEOUT-AT-014`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: timeoutのcurrent観測だけをowner宣言の数値境界`b`と同値（`= b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-385 — `L8-SECURITY-NFR-006-TIMEOUT-OVER-015`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: timeoutのcurrent観測だけをowner宣言の数値境界`b`を超過（`> b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-386 — `L8-SECURITY-NFR-006-RESOURCE-BEFORE-016`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: resourceのcurrent観測だけをowner宣言の数値境界`b`より前（`< b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-387 — `L8-SECURITY-NFR-006-RESOURCE-AT-017`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: resourceのcurrent観測だけをowner宣言の数値境界`b`と同値（`= b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-388 — `L8-SECURITY-NFR-006-RESOURCE-OVER-018`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。timeout/resourceだけを数値境界として扱う。owner宣言値`b`とcurrent観測を固定し、未宣言値は追加しない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: resourceのcurrent観測だけをowner宣言の数値境界`b`を超過（`> b`）へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-389 — `L8-SECURITY-NFR-006-DIFF-BEFORE-019`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: diffのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-390 — `L8-SECURITY-NFR-006-DIFF-AT-020`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: diffのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-391 — `L8-SECURITY-NFR-006-DIFF-OVER-021`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: diffのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-392 — `L8-SECURITY-NFR-006-ROLLBACK-BEFORE-022`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: rollbackのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-393 — `L8-SECURITY-NFR-006-ROLLBACK-AT-023`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: rollbackのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-394 — `L8-SECURITY-NFR-006-ROLLBACK-OVER-024`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: rollbackのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-395 — `L8-SECURITY-NFR-006-RESULT-COLLECTION-BEFORE-025`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: result-collectionのcurrent観測だけをownerが宣言した型の許可範囲内へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-396 — `L8-SECURITY-NFR-006-RESULT-COLLECTION-AT-026`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: result-collectionのcurrent観測だけをownerが宣言した型付き境界状態へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Positive`、他8制約の肯定を保ち`RequiredResult.combined=Positive`。数値順序はtimeout/resourceだけ。

### SEC-UT-397 — `L8-SECURITY-NFR-006-RESULT-COLLECTION-OVER-027`

- L9 verifier(s): `IV-SECURITY-NFR-006`
- L5 API候補: `project_verification` (K6 declared constraint and Worker observation)
- baseline（L8正本）: `L8-SECURITY-NFR-006-BASE`。この制約は数値順序を持たない。owner declarationの型・許可集合・状態境界とcurrent観測だけを使い、数値閾値を補わない。 合成owner verifierは許可範囲内と境界をPositive、範囲外をNegativeへ写す型付き宣言を固定する。これは実運用値の採択ではない。
- 一つの変異（L8正本）: result-collectionのcurrent観測だけをownerが宣言した型の許可範囲外へ置く。
- exact expected（L8正本）: 該当K6 componentは`Value(domain_payload)`、owner `PolarityOf=Negative`、他8制約の肯定を保ち`RequiredResult.combined=Negative`。数値順序はtimeout/resourceだけ。

### SEC-UT-398 — `L8-SECURITY-NFR-007-EXPIRY-BEFORE-001`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。owner expiry `t` と観測時刻は合成値で固定。 許可source adapterの比較規則を合成候補A（now < t）として固定。他のK3成分は肯定。
- 一つの変異（L8正本）: 照合時刻だけをexpiry候補`t`のbeforeにする。
- exact expected（L8正本）: expiry componentは`Value(domain_payload)`、owner polarity Positive、`PermissionCheckResult.combined=Positive`。候補Aをfixture内で比較するだけで製品へ採択しない。

### SEC-UT-399 — `L8-SECURITY-NFR-007-EXPIRY-AT-002`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。owner expiry `t` と観測時刻は合成値で固定。 許可source adapterの比較規則を合成候補A（now < t）として固定。他のK3成分は肯定。
- 一つの変異（L8正本）: 照合時刻だけをexpiry候補`t`のatにする。
- exact expected（L8正本）: expiry componentは`Value(domain_payload)`、owner polarity Negative、`PermissionCheckResult.combined=Negative`。候補Aをfixture内で比較するだけで製品へ採択しない。

### SEC-UT-400 — `L8-SECURITY-NFR-007-EXPIRY-AFTER-003`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: `project_permission`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。owner expiry `t` と観測時刻は合成値で固定。 許可source adapterの比較規則を合成候補A（now < t）として固定。他のK3成分は肯定。
- 一つの変異（L8正本）: 照合時刻だけをexpiry候補`t`のafterにする。
- exact expected（L8正本）: expiry componentは`Value(domain_payload)`、owner polarity Negative、`PermissionCheckResult.combined=Negative`。候補Aをfixture内で比較するだけで製品へ採択しない。

### SEC-UT-401 — `L8-SECURITY-NFR-007-REVOKE-RESUME-004`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: revoke後にcurrent K3/K7 bindingを再照合せずresumeする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-402 — `L8-SECURITY-NFR-007-REVOKE-RETRY-005`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: revoke後にcurrent K3/K7 bindingを再照合せずretryする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-403 — `L8-SECURITY-NFR-007-HEAD-RESUME-006`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: HEAD変更後に旧K3 permission bindingでresumeする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-404 — `L8-SECURITY-NFR-007-HEAD-RETRY-007`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: HEAD変更後に旧K3 permission bindingでretryする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-405 — `L8-SECURITY-NFR-007-BINDING-RESUME-008`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: owner binding更新後に旧bindingでresumeする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-406 — `L8-SECURITY-NFR-007-BINDING-RETRY-009`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: 既存`project_permission` / `project_propagation`
- baseline（L8正本）: `L8-SECURITY-NFR-007-BASE`。変更後current sourceとscopeは明示。 current owner sourceは完全解決済みで、取消し済みまたは新bindingに不一致の許可recordを固定する。
- 一つの変異（L8正本）: owner binding更新後に旧bindingでretryする。
- exact expected（L8正本）: K3-I2/I5：fresh checkの該当成分は`Value(domain_payload)`かつowner polarity Negative、`PermissionCheckResult.combined=Negative`。旧binding許可を再利用しない。

### SEC-UT-407 — `L8-SECURITY-008-01-KEY-ACTOR-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: actorを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-408 — `L8-SECURITY-008-01-KEY-TARGET-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: targetを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-409 — `L8-SECURITY-008-01-KEY-OPERATION-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: operationを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-410 — `L8-SECURITY-008-01-KEY-REVISION-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: revisionを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-411 — `L8-SECURITY-008-01-KEY-ENVIRONMENT-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: environmentを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-412 — `L8-SECURITY-008-01-KEY-SCOPE-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: scopeを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-413 — `L8-SECURITY-008-01-KEY-EXPIRY-MISSING-001`

- L9 verifier(s): `IV-SECURITY-008-01`
- L5 API候補: `project_permission`
- baseline（L8正本）: 完全current keyを持つ008 BASE。domain fieldは既知。
- 一つの変異（L8正本）: expiryを供給する必須owner source refだけを欠落させ、K2 keyを構成不能にする。
- exact expected（L8正本）: `PermissionCheckDiagnostic(reason: missing_key)`。K1 resultを捏造せず、record/下流作用は0件。

### SEC-UT-414 — `L8-SECURITY-NFR-007-EXPIRY-AT-B-010`

- L9 verifier(s): `IV-SECURITY-NFR-007`
- L5 API候補: `project_permission`
- baseline（L8正本）: AT-002と同じt/current source/時刻。合成source adapterだけ候補B（now <= t）に固定。
- 一つの変異（L8正本）: 時刻をtへ置く。
- exact expected（L8正本）: expiry componentは`Value(domain_payload)`、owner polarity Positive、`PermissionCheckResult.combined=Positive`。A/B双方を別fixtureで比較し、製品規則は採択しない。

### SEC-UT-415 — `L8-SECURITY-001-01-READ-AS-REQUIREMENT-TRANSITION-015`

- L9 verifier(s): `IV-SECURITY-001-01`
- L5 API候補: `project_label_transition`
- baseline（L8正本）: saved InputLabelRef/current route/effect/target refsは完全。requirement targetに対するcurrent K3 checkはNegative。
- 一つの変異（L8正本）: read-only source labelをrequirement targetへ昇格するrouteを選択する。
- exact expected（L8正本）: `TransitionValidation.result=Value(Denied{source:permission_check})`、`k8_transition_polarity=Negative`。source labelはuntrustedのまま、要求意味・承認を生成しない。

### SEC-UT-416 — `L8-SECURITY-009-01-G5-NO-RECEIPT-001`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: revocation_apply receiptだけ不存在。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Unobserved(not_run)`、`PropagationView.combined=Undetermined`。全component/assuranceと無関係scopeを保持する。

### SEC-UT-417 — `L8-SECURITY-009-01-G5-RECEIVED-002`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: receipt innerのappliedだけreceivedへ変更。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Unobserved(pending_receipt)`、`PropagationView.combined=Undetermined`。全component/assuranceと無関係scopeを保持する。

### SEC-UT-418 — `L8-SECURITY-009-01-G5-FAILED-003`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: receipt innerのappliedだけfailedへ変更。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Value(domain_payload) / owner PolarityOf=Negative`、`PropagationView.combined=Negative`。全component/assuranceと無関係scopeを保持する。

### SEC-UT-419 — `L8-SECURITY-009-01-G5-UNMAPPED-004`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: 対象node kindだけSECURITY宣言RecipientMapで写せない値へ変更。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Unknown(unregistered)`、`PropagationView.combined=Undetermined`。全component/assuranceと無関係scopeを保持する。

### SEC-UT-420 — `L8-SECURITY-009-01-G5-DIGEST-CONFLICT-005`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: 同一取消しrecordの同revisionでreceipt入力digestだけ相違。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Unknown(conflict)`、`PropagationView.combined=Undetermined`。全component/assuranceと無関係scopeを保持する。

### SEC-UT-421 — `L8-SECURITY-009-01-G5-SEGMENT-MISSING-006`

- L9 verifier(s): `IV-SECURITY-009-01`
- L5 API候補: `project_propagation`
- baseline（L8正本）: 009 BASE：完全current graph/SECURITY RecipientMap/owner RecipientDecl/VerifierSet、全対象recipient applied。
- 一つの変異（L8正本）: 対象recipient segmentだけinput_headsから欠落。他成分は変更しない。
- exact expected（L8正本）: IV-G5-01/03/04：対象componentは`Unknown(missing_input)`、`PropagationView.combined=Undetermined`。全component/assuranceと無関係scopeを保持する。

## 3. L5 `project_effect` の補助unit trace

L5 `project_effect(resolved, effect_ref)`は9 API候補の一つだが、L8 §5の438行は同APIをAPI-candidate列に記載せず、transition行の入力にeffect observation refを含める。fixture coverageを偽装せず、SECURITY L8 canonical 421件と区分したL7-only補助試験で、既存Common Kernel L4 K8 effect-observation APIおよびCommon Kernel L9 `IV-K8-06`の返却契約だけをテストする。新しいSECURITY verifierやbusiness expectationを作らない。`ResolvedSecurityCase`のcurrent owner binding/source readerをtyped stubに固定する。`project_effect`のpublic signatureにはcaller `input_heads`がないため、呼出側だけが持つhead mutation testは置かず、現行L5型で表現できない境界を追加しない。

| L7-only case ID | baseline | 一つの変異 | exact expected / assertion |
|---|---|---|---|
| `SEC-EFFECT-UT-001` | fixed case binding・SECURITY current effect-source registration・source owner readerが解決済み。原record bytesに`outcome="none"`, `event=null`, `binding=null`がある。 | mutationなし（baseline）。 | `Observed<EffectObservation>`。`none`、null event、null binding、原source/revision/issuer情報を入力recordどおり保持する。`none`を「作用なし」と推論せず、許可や未観測へも写さない。 |
| `SEC-EFFECT-UT-002` | `SEC-EFFECT-UT-001`と同一input。 | effect source/readerの登録だけを未登録にする。 | K8 existing `Unknown(unregistered)`を`Observed`へ偽装せず保持。 |
| `SEC-EFFECT-UT-003` | `SEC-EFFECT-UT-001`と同一input。 | 登録済みreaderのraw bytes readだけを失敗させる。 | K8 existing `Unknown(unreadable)`。 |
| `SEC-EFFECT-UT-004` | `SEC-EFFECT-UT-001`と同一input。 | observation recordの到着だけを未完了にする。 | K8 existing `Unobserved(not_run)`。 |
| `SEC-EFFECT-UT-005` | `SEC-EFFECT-UT-001`と同一input。 | 必須`effect_ref`だけを欠落させる。 | L5/K8 existing `Rejected(missing_key)`。source read/effect projectionを続けない。 |

Root/oracle引用: Common Kernel L4 §18 `observe_authority_effect`（current case binding・effect-source registration・readerの再読、原bytesのnull/binding保持、unregistered/unreadable/not-arrived/missing-key分類）、Common Kernel L9 `IV-K8-06`（同じresult class/reason境界）。SECURITY L5 `project_effect`はこのK8 result型を保持するadapterであり、ここに新しい分類を足さない。

## 3.2 `evaluate_security_case` slot-preservation補助fixture

L5はevaluate APIを既存component結果の型付きprojectionと定める。以下はL8 API-candidate行にはない補助unitで、L8/L9 oracleや新result classを増やさず、slot保持だけを確認する。baselineとmutationはすべてsynthetic stub inputである。

| L7-only case ID | baseline | 一つの変異 | exact expected / assertion |
|---|---|---|---|
| `SEC-EVALUATE-UT-001` | 固定parent 001の`ResolvedSecurityCase`。この親に適用するK8 `ObservedLabel(trust=untrusted)`とK8 `Observed<EffectObservation>(outcome=none)`をstubから渡し、他slotはL5 parent mappingに従う。 | effect observationのraw `outcome` fieldだけを`none`からcurrent source上で既に観測された`occurred`へ変更する。 | `SecurityInputProjection`を返し、全slot型を維持する。parent 001に全5 APIが適用されるとは主張せず、L5で非適用と定まるslotは`ProjectionNotApplicable`。`.effect`はK8 observationの原事実とbindingを保持し、read projectionから新しいvalidation/authority/writeを生成しない。他slotはbaselineとfield完全一致。 |
| `SEC-EVALUATE-UT-002` | 固定parent 008のresolved source set。L5 mappingに従うK3 `PermissionCheckResult`はcurrent queryの既知Negativeで、他slotは親別適用に従い値または`ProjectionNotApplicable`を持つ。 | permission slotのK3 resultだけを、既存K3 `PermissionCheckDiagnostic(missing_key)`を返すquery construction stubへ変更する。 | `SecurityInputProjection.permission`は既存K3 unionの`PermissionCheckDiagnostic(missing_key)`を型どおり保持する。`Observed`で包む・K1 Unknownへ変える・他slotを消す変異は不合格。これはK3診断のprojection保持であり新diagnosticではない。 |
| `SEC-EVALUATE-UT-003` | 固定parent 001のresolved source set。L5 parent mappingで非適用と定まるpermission/verification/propagation slotは`ProjectionNotApplicable`、label/effectは既知baseline。 | mutationなし（非適用slotの保持control）。 | `SecurityInputProjection`で非適用slotの`ProjectionNotApplicable`を同じslotに保持し、K1/K2 componentやempty/Unknownへ変換しない。適用不明のslotへsentinelを置くのは不合格。 |

## 3.3 `project_parent_obligations` fixed mappingの構造照合

L5 `project_parent_obligations(parent_ref, projection)`は19親のAC/API/owner mappingをinternal `SecurityCaseProjection`へ投影する候補だが、L5/L8/L9は専用のK1 result class/reasonを定めない。したがって、この補助範囲は既存L5 §6の19行との構造一致のみを照合し、unknown/mismatch/rejectionを新設しない。各行のbaseline/mutation/expectedは次の固定形である。

- baseline: L5 §6に記録された対象parentの`SecurityInputProjection`と対応`parent_ref`。
- mutation: なし（正準mapping fixture。L5に異なるparent/projectionの不整合result分類がないため、negative mutationを創作しない）。
- expected: L5 §6の該当parent rowと同じAC/CASE/API/owner戻し先を保つ内部projection。L3/L10判定、権限、完了を生成しない。

対象parent IDは`001`〜`016`、`020`、`028`、`033`。033 CASE-01…15のcase mappingはCASE単位のL5/L9表を正本とする。これらはL7-only structural tracesでありL8 canonical fixture定義には加算しない。

## 4. 17 aliases（canonical参照、再実行しない）

| L8 alias fixture ID | canonical fixture ID | 共有条件 |
|---|---|---|
| `L8-SECURITY-001-01-M01` | `L8-SECURITY-001-01-LABEL-UNKNOWN-002` | classification Unknownを保持する同一source input |
| `L8-SECURITY-002-01-M01` | `L8-SECURITY-002-01-TOOL-ARGS-001` | dataをTool argsへ直接結ぶ単一変異 |
| `L8-SECURITY-004-01-M01` | `L8-SECURITY-004-01-M-AGENTS-MD-STALE-002` | AGENTS.md current revisionだけを更新する同一K2 lookup |
| `L8-SECURITY-005-01-M01` | `L8-SECURITY-005-01-WORKER-STORE-002` | raw credentialをWorker storeへ露出する同一漏えい変異 |
| `L8-SECURITY-007-01-M01` | `L8-SECURITY-007-01-M-WRITE-PATH-UNOBSERVED-001` | write-path post-state適用観測だけが未実施の同一制約case |
| `L8-SECURITY-008-01-M01` | `L8-SECURITY-008-01-M-READ-TO-WRITE-008` | read operationをwriteへ置換する同一permission query |
| `L8-SECURITY-014-01-M01` | `L8-SECURITY-014-01-M-MEMORY-WRONG-TARGET-001` | memory targetだけを誤結合する同一target変異 |
| `L8-SECURITY-016-01-M01` | `L8-SECURITY-016-01-M-PUBLIC-RECORD-UNKNOWN-001` | public classification recordのUnknown保持 |
| `L8-SECURITY-020-01-M01` | `L8-SECURITY-020-01-BOT-DELEGATION-009` | deterministic Guard判定をBotへ委譲する同一変異 |
| `L8-SECURITY-033-01-M01` | `L8-SECURITY-033-01-M-ASSIGNMENT-SCOPE-DRIFT-023` | assignment scopeだけを別scopeへ変更する同一K3 query |
| `L8-SECURITY-NFR-004-M01` | `L8-SECURITY-020-01-BOT-DELEGATION-009` | deterministic Guard ruleをBot出力へ置換する同一変異 |
| `L8-SECURITY-NFR-001-M01` | `L8-SECURITY-033-01-RAW-SECRET-OUTPUT-001` | 同じraw-output変異をNFR-001でも参照 |
| `L8-SECURITY-NFR-005-M01` | `L8-SECURITY-009-01-M-REVOKE-UNRELATED-SCOPE-001` | 無関係scopeのreceiptを別scopeへ差し替える同一G5入力 |
| `L8-SECURITY-NFR-006-M01` | `L8-SECURITY-007-01-M-WRITE-PATH-UNOBSERVED-001` | write-path post-state適用観測だけが未実施の同一制約case |
| `L8-SECURITY-NFR-002-M01` | `L8-SECURITY-008-01-M-SCOPE-DRIFT-006` | tuple scope driftの同一permission case |
| `L8-SECURITY-NFR-014-01-M01` | `L8-SECURITY-014-01-M-MEMORY-WRONG-TARGET-001` | target mismatchの同一SECURITY trace |
| `L8-SECURITY-NFR-028-01-M01` | `L8-SECURITY-028-01-ARTIFACT-DIGEST-MISMATCH-006` | artifact digest mismatchをNFR-028でも参照 |

## 5. 親/CASE/verifier coverage

Fixture countとauthority scopeは別々に保つ。L9 verifier IDは33 functional + 10 NFRで固定43。alias元verifierはcanonical targetのtest headerに記載し、別testにしない。33 CASEはL9 §2/§2.1 mappingへ戻り、CASE-033-01…15は各々対応するunit oracleを維持する。NFRはL8 §5.4のcanonical refsを同じ入力で再利用し、measurement candidateや実測値へ転換しない。19親以外、Stage 2c-031、後続Stage、Web/1.x sinkを追加しない。

| scope | L7 treatment |
|---|---|
| L8 canonical definitions | `SEC-UT-001`…`SEC-UT-421`各一件。 |
| L8 aliases | §4 17 links。aliasは別API call/test countではない。 |
| L9 verifier | 43 unique IDs。§2各fixtureに主verifier、alias共有元verifierも明記。 |
| L5 API candidates | 9候補すべて。421 canonical fixture rowsが列挙するAPIを個別traceし、`project_effect`は5件のK8-IV補助fixture、`evaluate_security_case`は§3.2の3件、`project_parent_obligations`は§3.3の19 parent structural tracesへ分ける。 |
| NFR 10 | canonical fixture reuse only。candidate valueは未採択・未測定。 |

## 6. 旧source保持/変更と実行境界

旧HELIXのinventory-first比較は対L6 §6にasset ID/path/span/full-file SHA単位で記録する。L7は旧test/runtime/CLI/CIを実行・移植せず、現L8/L9の具体oracleを新しいunit test設計へ対応させる。旧broker authorityのtyped tuple/fail-close、P8のraw/untrusted分離、consumer tuple driftのcase-by-case観測、owner recipientへの停止伝播という隣接意図を保持する。旧approval/activation gate、CAP語彙、old schema/runtime/hook/Bun、credential store/scanner/deploy pass条件は移さない。owner stubの合成値はproduction source read、permission issuance、recipient delivery、physical application、issuer authenticityを立証しない。

## 7. 静的照合と未実行状態

本pairは未実装・未実行設計である。静的proof `/tmp/security-l6-l7-static-proof.json`は対象固定文書のSHAとID集合・本文セルの機械照合を記録し、unit test executionを示さない。将来の照合では次を確認する。

- L8 §5の438 definition IDs = L7 canonical 421 + alias 17。§2とL8 canonical集合が一対一で、§4 alias targetがcanonicalである。
- 各canonical rowにL9 verifier(s)、L5 API、baseline、one mutation、exact expectedが非空で保存される。
- §2 + §3のL9 verifier集合が既存43 IDに一致し、19 parent/33 CASE/NFR 10 traceがL9固定範囲内。
- paired source SHAと一方向pinを再計算。内容変更時は下位pinを同期するが、L4/L5/L8/L9の意味をこのpairから変えない。
- Markdown/headings/duplicate IDs/table columns/alias targetsを静的確認する。実test/CI/旧test/旧runtimeは、このL7設計段階では実行しない。
