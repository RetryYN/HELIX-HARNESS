# v1.3 §4.2.2 policy/resolver 7条件の個別監査

- 基準revision: `7484346c9d0e0ab735309156b8724a87d9d972ee`
- 比較revision: 固定 SECURITY L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 対象: `REQSRC-SUP-00118/00120/00121/00122/00123/00124/00132`（7条件、partial 5・unresolved 2）
- authority effect: `none`
- 判定: 採択・successor指定・source意味変更・closureを行わない。

## 対象とsource/consumer

#2396のv1.3 condition closure queue（basis `2bf484b1a84af346feaf8cf7b72e59f3889e6333`、SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）から、§4.2.2のprimary residualを選んだ。#2394（127–131）と#2401（134/135/137–141）は除外。選定7件はいずれもqueue上の個別監査ref 0件、後発採択source citation ref 0件。baseline statusはpartial 5、unresolved 2。

旧sourceは[`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`:152–183]（全体SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、asset `LEGACY-ASSET-02319C2481B9E01698D5`）。原文、source item ID、行SHA-256、queue tupleを[JSON記録](v13-policy-resolver-seven-condition-audit-2026-09-30.json)に保持した。行157と158、161と162はそれぞれ条件境界をまたいで文が続くため、両行のsource tupleを分けたまま意味上の続きも明記する。

消費側は旧§4.2.3（185–215）、archive registry schema（22–80）、PLAN-L3-57（25–36）、L4 `function.md`（192–201）を読み、file SHAと範囲をJSONへ固定した。§4.2.3はtyped input、signal推測禁止、strict receipt、exact disposition/exitを消費契約として示す。旧test/runtime/CLIは実行していない。

## 固定f6 SECURITY-007/008

SECURITY判断record（`7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`）はf6の明示候補を採択している。007はWorker環境の制約適用・観測とunknown/未適用時のhost fallback拒否、008はactor/target/operation/revision/environment/scope/expiryが一致するoperation-specific authorityを保持する。L2/L11のpath、file SHA、section/row digestと行はJSONへpinした。

このfixed pairはrequirements-owned policyの一方向導出、execution policyのfield schema、precedence、resolverの具体error class、high-impact flagからの`approval_policy`規則、L3 freeze style選択を定義しない。したがって一般的なauthority/enforcement境界は保持点だが、7条件のresolver contractを同一被覆とは扱わない。

## 条件別照合

### REQSRC-SUP-00118 — policy導出のownerと方向

- Source（行155）: 確定した`target_axis`/`target_id`からrequirements-owned versioned policyを一方向導出し、signalや旧`mode`からcommandを選ばない。
- 保持: SECURITY-008のexact operation authorityと007のenforced Worker constraints。
- 差分・未決: fixed pairにはpolicy source owner/version、target identity→projection trace、signal/legacy-mode prohibitionがない。正本owner、policy version/projection同期、拒否consumerのexact contractが未決。
- 反例: signal文字列だけからcommandを選ぶ、旧`mode`を正本扱いする、identity未確定のままresolvedにする。
- 近接pairの限界: SECURITY-032はrepository bypass deny順位、034は選択済みMCP profile、HARNESS-052はcommand semantic replay/conflictに限定され、一方向policy導出の根拠にならない。

### REQSRC-SUP-00120 — execution formとenum条件の独立field

- Source（行157）: `execution_form`と限定enumの適用条件を独立fieldで保持し、raw shell／approval booleanをcurrent policyへ入れない。行158と続けて読む。
- 保持: execution環境制約とoperation authorityを適用するSECURITY境界。
- 差分・未決: fixed pairはexecution policy schemaやfield分離を定義しない。許容enum値、適用条件、type/owner/validationは未決であり、ここで新しいenumを補わない。
- 反例: execution formと条件を自由文1個へ畳む、raw shell文字列を値にする、approvalをbooleanだけで記録する。
- 近接pairの限界: SECURITY-034のprofile scoped capability fieldsは一般execution schemaではない。HARNESS-052はfield schemaを定めない。SECURITY-032も適用外。

### REQSRC-SUP-00121 — 自由式と旧route fieldの排除

- Source（行158）: 自由式および旧`mode`/`model`/`catalog_route_id`/`route_class`をcurrent policyに入れない。
- 保持: exact authorityとWorker enforcementの一般境界。
- 差分・未決: SECURITY fixed pairは旧HARNESS route fieldの隔離・移行を定めない。compatibility input境界、typed replacement、残存ログの扱いが未決。
- 反例: current policy predicateを実行時evalする自由文字列で保持する、列挙した旧route fieldから直接command/policyを決める。
- 近接pairの限界: 032/034/052いずれも旧field排除ルールを定めない。034のMCP inputsもworkflow route selectorにはならない。

### REQSRC-SUP-00122 — 明示precedence

- Source（行160）: 同一identityに複数policyが適用される場合は明示`precedence`を要求。行161のduplicate・複数match条件と一緒に読む。
- 保持: SECURITY-008が既知operationのauthority scope等をexact matchする点。
- 差分・未決: 固定pairにworkflow policy間のprecedenceはない。precedence domain/type、tie behavior、duplicate規則、複数predicate matchの扱いは未決。
- 反例: 複数policyにprecedenceがない、同条件・同precedenceの重複、未定義のfirst/name orderで複数matchから選ぶ。
- 数値境界: sourceはprecedence fieldを求めるが、numeric scale/thresholdを定めない。
- 近接pairの限界: SECURITY-032は特定のpermanent bypass deny順位だけ。034はprofile checks、052はreplay identityであり、policy precedence一般ではない。

### REQSRC-SUP-00123 — duplicate/multiple/missingでfail-close

- Source（行161）: duplicate、複数条件match、未登録command、binding欠落に近似値を選ばずfail-close。§4.2.3にはexact disposition/exit setがあるが、この条件ごとのmappingはここで創作しない。
- 保持: unknown/stale authorityや未適用Worker constraintsを成功として通さない境界。
- 差分・未決: fixed SECURITY pairはworkflow resolverの各error classとdispositionを列挙しない。各classのreceipt reason、exit mapping、修復後再入場を確認する必要がある。
- 反例: duplicateの片方を黙って捨てる、複数matchをfirst-matchにする、未登録commandを近似commandへ送る、binding missingをdefaultで補う。
- 近接pairの限界: SECURITY-032のdeny precedenceはresolver ambiguityではない。034のMCP profile欠落拒否はprofile内。052の異payload conflictはcommand replayで、policy binding欠落とは別。

### REQSRC-SUP-00124 — 高影響actionのapproval縮退禁止

- Source（行162）: production impact、destructive data operation、credential accessのいずれかを含むactionを`approval_policy:none`へ縮退しない。
- 保持: fixed SECURITY-008のoperation-specific authorityと007のWorker enforcement。
- 差分・未決: f6 pairはこの3 flagsからworkflow bindingの`action_binding`条件へ結ぶpredicateを直接定義しない。input owner/type、policy value、same-HEAD/policy digest receipt consumerが未決。
- 反例: 3 flagそれぞれを単独trueにして`approval_policy:none`とする例は拒否。3 flag falseでもtupleが未登録なら別条件でfail-close。
- 数値境界: sourceにthreshold/scoreはない。高影響の列挙は3項目で、`backend_derived`を同じ高影響判定へ追加しない。
- 近接pairの限界: SECURITY-032はdeny precedence、034はMCP profileのcredential/authority確認、052はreplay identity。どれも一般approval policyを発行しない。

### REQSRC-SUP-00132 — L3 freeze時のstyle明示選択

- Source（行172）: development styleはL3 freeze時に明示選択し、signalから`PRODUCTION_SCRUM`等を自動確定しない。
- 保持: 選択済みoperationへのSECURITY authority/Worker enforcement。
- 差分・未決: fixed security targetsにstyle選択、L3 freeze record、signal分類はない。選択者/receipt、未選択・複合・矛盾signal時のdispositionと再入場が未決。
- 反例: feature signalから自動的に`PRODUCTION_SCRUM`へ変更、未選択のままexecution policy決定、signal分類をL3 freeze選択と同等扱いする。
- 近接pairの限界: 032のbypass precedence、034のMCP profile capability、052のcommand replayはいずれもdevelopment style選択を定めない。

## 後発57+11 decision screenと近接pair

57候補判断record（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、source revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`）は42採択・11条件付き・4保留。11候補判断record（SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、source revision `5aa100319361b0cc86edd3c51815ec777d55410a`）は10採択、`HARNESS-L2-049` current revision不採択・corrected L11/PO再確認待ち。全68 identity/statusをJSONに収録し、重複IDも各record revisionのentryとして保持した。選定7 source IDはqueueの後発採択citation joinにも含まれない。

比較した近接採択pairはSECURITY-032、SECURITY-034、HARNESS-052。decision basis/source revision、MPR、L2/L11 file SHAとsection digest、各限定効果はJSONへpinした。採択pairの意味近接はこの7 source条件のsuccessor・adoption・closureを生成しない。

## 制限

本記録は7 conditionの文書比較で、§4.2.2/4.2.3全体、303 condition/255 primary residual、実装・実行・acceptance closureを主張しない。旧PLAN/schema/L4は歴史consumerとして読んだだけで、旧test/runtime/CIは実行していない。
