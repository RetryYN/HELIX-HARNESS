# v1.3 execution policy registry 7条件の個別監査

- 基準revision: `d327f109f49e7971c453a338d5c40a54035415d6`
- 比較revision: 固定 SECURITY L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 対象: `REQSRC-SUP-00134/00135/00137–00141`（7条件、partial 5・unresolved 2）
- authority effect: `none`
- 判定境界: 採択、successor指定、source意味変更、closureは行わない。

## 対象範囲と方法

#2396のv1.3 condition closure queue（basis `2bf484b1a84af346feaf8cf7b72e59f3889e6333`、JSON SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）から、§4.2.2のprimary residualである7条件を選んだ。#2394のfocused audit対象 `REQSRC-SUP-00127–00131`（行167–171）とは別であり、本選定IDは#2396の後発採択source citation join 24行にも含まれない。7行はいずれもqueue上で個別監査refが0件、source tuple完全一致の先行個別監査もない。

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:175,177,179–183`、archive file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、asset `LEGACY-ASSET-02319C2481B9E01698D5`。物理行ごとの`source_item_id`、line SHA-256、原文は[JSON記録](v13-execution-policy-registry-seven-condition-audit-2026-09-30.json)へ固定した。行178は初期binding route列挙の文脈として参照するが、今回の7 condition IDには含めない。

旧consumerとして、同じv1.3文書§4.2.3（185–211）、archive `workflow-execution-policy-registry.v1.json`（22–80）、`PLAN-L3-57-workflow-execution-policy-registry.md`（25–36および同planに示される旧test path）、旧L4 `function.md`（192–201）を読み、SHA-256・行をJSONに固定した。これらは旧設計／旧consumerの意味確認であり、旧test・runtime・CLIの実行や現行への移植はしていない。

## 固定f6 SECURITY-007/008との比較

2026-09-28 SECURITY判断record（SHA-256 `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`）はf6のL2/L11一式に合意している。`HELIXSECURITY-L2/L11-007`はWorker環境へ制約を適用・観測し、unknown/未適用時のhost fallbackを拒否する。`-008`はactor、target、operation、revision、environment、scope、expiryが一致するoperation-specific authorityを要求する。対象文書のfile SHA、見出し行・section digest、L11行番号・row digestはJSONに固定した。

保持されるのは、未許可操作を通さないこと、unknown/stale/期限切れを成功にしないこと、実行制約をWorker環境へ適用する責務である。固定pairには、workflow identityからregistry binding/commandを選ぶexact resolver、4つのrisk boolean、未登録組合せのpolicy disposition、初期registryのcommand集合、`program`/固定`argv` grammar、shell構文拒否は明記されない。したがって、一般authority/enforcementと旧sourceのregistry条件は部分的に近接するが、同一の被覆とは扱わない。

## 条件ごとの所見

### REQSRC-SUP-00134 — 後続versionとunsupported

- Source: 行175。旧条件はexecution policy registry、generated projection、consumer移行を後続versionへ回し、未実装identityへのexecution要求を`unsupported`としてfail-closeする。
- 保持: identity未実装時にpolicyやcommandを推測しない。f6 SECURITY-008のoperation authority不足・unknown等の拒否とも整合する。
- 差分: f6 pairは registry自体のversion配備やroute-resolution consumerを保証しない。旧sourceのversion deferralは現行1.0へ無断で前倒ししない。
- 未決: どのversionで追加するか、unsupported identity集合、exact disposition/consumer、未実装identityから実行要求が来た場合のsource-to-target trace。
- 反例: 未実装identityに「近い」既存commandを返すケースはunsupportedで停止。登録されていないidentityへ既定成功を返すケースも不成立。
- 後発pair: SECURITY-032/034、HARNESS-052のいずれも未実装workflow identityのunsupported dispositionを定めない。

### REQSRC-SUP-00135 — 初期registryの対象

- Source: 行177。初期registryは実在するread-only/planning commandだけを登録する。行178には`ADD_FEATURE + pair_cell`、`RECOVERY`、`INCIDENT`、`RETROFIT`がbinding surfaceとして列挙される。
- 保持: 実在し、read-only/planningの用途を確認できるcommandに限るという初期範囲。
- 差分: fixed SECURITY-007/008は制約とauthorityを定めるが、初期command allowlistや4つのbinding surfaceを宣言しない。
- 未決: commandのidentity、owner、source/version、read-only性の証拠、4 surfaceそれぞれの登録範囲、登録しないcommandの扱い。
- 反例: planningらしい名前だけからcommandを登録する、実在/owner/revision不明のcommandを追加する、初期surfaceを暗黙拡張するケースは未確定または不成立。
- 後発pair: SECURITY-034は既に選択されたMCP profileのtool operationに限定。HARNESS-052はcommandの意味identityとreplay競合を扱うが、実行可能commandの許可一覧ではない。

### REQSRC-SUP-00137 — 未登録identityに対する近似禁止

- Source: 行179。未登録identityを近似commandへ送らない。
- 保持: authorityの対象scopeを推測で拡張せず、登録されていないidentityは実行へつながない。
- 差分: SECURITY-008のexact authority tupleは既知operationの権限判定を支えるが、workflow identityからbinding/commandへの登録照合規則は定めない。
- 未決: `policy_unsupported`と`policy_ambiguous`の条件、duplicate/multiple binding時のprecedence、identityからcommandまでのtrace。
- 反例: 名前が近い別identityへrouteする、複数候補から優先順位を推定するケースは停止し、記録済みexact dispositionを返す。
- 後発pair: SECURITY-032はbypass deny優先順位、SECURITY-034はMCP profileに限る。HARNESS-052のcommand ID一致だけでもworkflow identityのbindingは成立しない。

### REQSRC-SUP-00138 — 4つのrisk boolean

- Source: 行180。`production_impact`、`destructive_data_operation`、`credential_access`、`backend_derived`を明示booleanとして受ける。
- 保持: four-field tupleを必須入力とし、`signal`から推定しない。固定SECURITY-008はoperation scope等を明示的に照合する。
- 差分: fixed SECURITY-008のauthority tupleに、この4分類fieldや`backend_derived`は含まれない。
- 未決: field供給owner/revision、missing・null・誤型時のexact disposition、どのtupleが登録済みか。旧文の高影響列挙は別箇所でproduction/destructive/credentialの3条件なので、`backend_derived`だけを高影響へ統合しない。
- 反例: 4 fieldの一つを欠落・null・文字列にする、またはsignalから補う場合は成功解決しない。4 fieldが全て明示でも未登録の組合せならfail-close。
- 数値境界: boolean次元は4個、理論上16組合せ。ただし16組合せすべてを登録・許可する要求ではない。数値thresholdは追加しない。
- 後発pair: SECURITY-034のprofile/capability確認はworkflow risk boolean契約ではなく、HARNESS-052のsemantic digestにもrisk分類はない。

### REQSRC-SUP-00139 — 未登録組合せと高影響承認

- Source: 行181。未登録condition combinationはfail-close。いずれかの高影響conditionがtrueならbindingの`approval_policy: action_binding`を必須化する。
- 保持: 未登録tupleの拒否と、高影響operationでapproval policyをnoneへ落とさないこと。§4.2.3 consumerは承認receiptを同一HEAD・同一policy digestへ束縛する。
- 差分: fixed SECURITY-008はoperation authorityの完全一致を要求するが、registry lookup miss、binding approval downgrade、receipt consumerの細目を定めない。
- 未決: tuple match/duplicate precedence、three high-impact fields eachのdowngrade oracle、approval receiptのpolicy/current revision trace。
- 反例: `production_impact=true`、`destructive_data_operation=true`、`credential_access=true`をそれぞれ単独にし、各々`approval_policy:none`なら不成立。未登録tupleを近似bindingへ送る例も不成立。`backend_derived=true`だけでは高影響扱いを推定しないが、tuple自体が未登録なら別理由でfail-close。
- 数値境界: 高影響fieldはsourceが明記する3つ。固定thresholdはない。
- 後発pair: SECURITY-032のdeny precedenceは一般action_binding発行規則ではなく、034も既存L2-008をMCP-profile scopeで再利用するだけ。

### REQSRC-SUP-00140 — action_bindingとcommand record

- Source: 行182。高影響bindingに`action_binding`を要求し、command recordを`program`と固定`argv` token列で表す。
- 保持: approval policyとoperation identityを分ける固定SECURITY-008の境界。
- 差分: f6 SECURITY pairはcommand record schemaやcommand ID/argv bindingを定めない。§4.2.3ではraw `program`/`argv`をrouting receiptへ出さず、実行境界のcommand ID再検証に限る。
- 未決: program/argvのsource/version、argv tokenizationの厳密形式、実行境界ownerとHEAD/policy-digest approvalとのbinding。
- 反例: 固定token列の代わりに任意mutable shell stringをcommand recordとして渡す、高影響bindingを`action_binding`以外へ縮退する、public routing receiptにraw invocationを出すケースを個別に拒否する。
- 後発pair: HARNESS-052が最も近く、same command ID/scope/base/payload digestのreplayと異payload conflictを扱う。ただし実際のinvocation/argvや承認を所有しない。SECURITY-032/034はcommand recordを定めない。

### REQSRC-SUP-00141 — command invocationの危険構文

- Source: 行183。shell operator、command substitution、absolute executable pathを拒否する。
- 保持: SECURITY-007の実行制約を物理enforcementで確認する責務。
- 差分: fixed SECURITY-007/008のL2/L11はこの3構文・path形状を列挙しない。
- 未決: parser/lexer規則、platform-specific absolute path識別、wrapper/tokenization挙動。監査は旧sourceにない追加deny grammarを新設しない。
- 反例: shell `;`/`&&`、`$()` command substitution、absolute executable pathをそれぞれ独立に与え、いずれも拒否。解析不能・曖昧なcommandはunknown/fail-closeで実行しない。
- 後発pair: SECURITY-034のMCP profile capabilityとHARNESS-052のcommand semantic replayは、このshell grammarを定めない。

## 後発57+11判断の全identity/status screen

57候補判断は42採択、11条件付き採択、4保留。11候補判断は10採択、`HARNESS-L2-049`の現revisionは不採択（訂正L11とPO再確認待ち）。両判断記録の全68 entryをidentity/statusごとに[JSONへ収録](v13-execution-policy-registry-seven-condition-audit-2026-09-30.json)。重複IDはそれぞれの判断revisionとして保持する。

近接pairはSECURITY-032、SECURITY-034（57記録で採択）、HARNESS-052（11記録で採択）。採択statusの根拠とexact L2/L11 file SHA・section digest、decision source revisionをJSONへ記録した。いずれもsource 7条件のsuccessorやclosureにはならない。SECURITY-032が57判断recordで直接引用する旧v1.3 line430は今回選定行とは別であり、その引用をline175/177/179–183へ伝播しない。

## 制限

本監査は選択7条件の文書上のcondition comparisonであり、§4.2.2/4.2.3全体、v1.3の303 condition/255 primary residual、実装、実行、L11 acceptanceのclosureを主張しない。JSONのsource tuple、consumer revision/hash、f6 pair pins、後発decisionの全identity/statusと近接pair根拠を併読する。旧PLAN/schema/L4はconsumer/historyの参照で、旧runtime/test/CIは実行していない。
