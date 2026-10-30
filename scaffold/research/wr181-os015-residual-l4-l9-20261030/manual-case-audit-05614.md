# WR181 OS015 手動case照合証拠

## 対象と境界

この証拠は、mainへmerge済みのPR #3901 commit dd5787507a9ef3b69f411074e2fcbc7710ca1d62 のL4/L5追補を形成根拠として、L7固定入力から選んだ未割当caseを1件ずつ静的に照合する。merge前candidate b06b6cf9f2960472597079eb56525dce87a28d14 と対象L4/L5/L7/checker bytesは同一である。PR branchやPRレビュー用worktreeは変更しない。ここに記録するclass keyは独立照合の結果であり、L4/L5/L8/L9のcase rowやrefを追加したことを意味しない。

本記録で参照したL4/L5/L7のsource bytesは次のとおり。

| 層 | 文書 | SHA-256 |
|---|---|---|
| L4 | docs/helix-os/L4-basic-design/management-authority-source-record.json | e2e92c62217f70203752ab4f79ed7a92831d94cb813c6947153f237c83c8576b |
| L5 | docs/helix-os/L5-detail-design/management-authority-source-record.json | 6d313e6faaf56c0806c1964ac2bece5da0699de1d82dcc804fc77962f679275e |
| L7 | docs/helix-os/L7-function-verification/management-authority-source-record.json | b2a71c3d2a99c5268275e183f21c2b1bbc4b21ad79d577af42573a079e920a09 |

class keyの根拠には、L7 fixture_inputs.inspect と各caseの given.input のみを使う。L7 expected_proposal、L8/L9の期待値・観測・class ref、旧crosswalk、廃棄script、checker出力は導出元にしない。L4の文書化されたアルゴリズム本文は読み取り専用で経路を手で追い、実行・再実装しない。製品runtime、test、CIは起動しない。

C0044は先行探索時にL7 case全体を表示し、expected_proposalに触れたため、本証拠群から除外する。以下のcaseは個別のidとgiven.inputのみを取得し、期待値フィールドは表示・参照していない。

## HELIXOS-L9-015-C0045

### 刺激

L7 /connection_materials/OS015/case/cases/44/given/input は base_ref=inspect、replacementは records.target_a.original_event.event_id を "FOREIGN-event_id" に置換する1項目のみ。宣言されたexpanded input SHA-256は 602f907fadef66b20be2f4549e2bb316829697d2114936ff87f3dc081b0359fa。

L7 /connection_materials/OS015/case/fixture_inputs/inspect のtarget_a actual/context event_idは置換前にともに "SYNTHETIC-EVENT_ID-target_a"。他のsource/event/authority/classification/history/boundary値はこのreplacementの対象外で、fixture上actual/contextが一致する。target_bは全fieldでfixture actual/contextが一致する。

### L4経路の手動追跡

1. phase=inspect はL4 /diagnostic_contract/algorithm_dependencies/phases の許可値。phase global findingはない。
2. target_a のsource 20 fieldはfixture actual/contextで同値かつknown。source facetにfindingはない。
3. target_a のoriginal event 9 field中、event_idだけがknown値 "FOREIGN-event_id" と "SYNTHETIC-EVENT_ID-target_a" の不一致になる。L4 /diagnostic_contract/algorithm_python_document_text の cmp 経路により、actual pointer /records/target_a/original_event/event_id に source_conflict が一件出る。/diagnostic_contract/comparison_facets により比較findingは original_event facetへ入る。
4. L4 /diagnostic_contract/mutation_rule とalgorithmのwhole-event比較により、target_a全体の不一致から /records/target_a/original_event に original_event_mutated が一件出る。
5. target_bのsource/event fieldは同値でfindingなし。target_a/bのauthority originはともに許可値canonical_source、authority stateはともにcurrent_materialでactual/context一致。authority findingはない。
6. 両targetのoriginal classificationはnullでactual/context一致。inspectではclassify/correct専用の新classification/history分岐へ入らない。unresolved_historyは両側で同値の非空文字列配列。current_material_claimと全generated_claimsはfalse、whole_registry_claimもfalseで、境界/global findingはない。

以上より、全findingは次の2件。L4最終sort (code, pointer, return_owner) 順ではcode順に示す。

| 順 | code | pointer | disposition / facet | return owner |
|---:|---|---|---|---|
| 1 | original_event_mutated | /records/target_a/original_event | violation / original_event | management-authority-owner |
| 2 | source_conflict | /records/target_a/original_event/event_id | violation / original_event（comparison facet mapped by lane） | management-authority-owner |

global markなし。全体conditionは management_material_violation。L4 facet順でsourceは両targetともcorresponding、次のoriginal_eventでtarget_aがviolationとなるため、primary axisは original_event、両target aggregateのstateは violation。backflow ownerは両findingの共通値 management-authority-owner。

### L5 owner joinと導出key

L5 /formal_reference/composite_class_formation/owner_ref_resolution の規則で、各codeを既存failure_rulesへjoinする。

| L4 code | L5 rule pointer | function_ref | backflow_owner |
|---|---|---|---|
| original_event_mutated | /failure_rules/8 | FN-OS015-01 | management-authority-owner |
| source_conflict | /failure_rules/4 | FN-OS015-01 | management-authority-owner |

original_event_mutatedは対応する単一rule、source_conflictは導出済みaxis=original_eventと組にしたrule /failure_rules/4 へ一意joinする。両codeの一意ownerは同じなので、checkerの型付きowner参照は {"kind":"function_ref","id":"FN-OS015-01"}。L5のfailure ruleにfunction_refが明示されているためcontract fallbackは使わない。

独立導出したcandidate key:

    {
      "expected_classification": "management_material_violation",
      "finding_codes": ["original_event_mutated", "source_conflict"],
      "backflow_owner": "management-authority-owner",
      "expected_axis": "original_event",
      "expected_state": "violation",
      "owner_ref": {"kind": "function_ref", "id": "FN-OS015-01"}
    }

このkeyは手動証拠であり、既存rowへの割当て・class ID追加・L8/L9 expected更新は行わない。

## HELIXOS-L9-015-C0046

### 刺激とL4経路

L7 /connection_materials/OS015/case/cases/45/given/input は base_ref=inspect、replacementは records.target_a.original_event.event_revision をnullにする1項目のみ。expanded input SHA-256は 42096ec3ec4aefe788555ad5c90fae637cd9971d41d4d59fd794c631f996e38d。fixture actual/contextのevent_revisionは置換前にともに EVENT-r1。このfield以外の入力はC0045と同じinspect fixtureである。

C0045の手動追跡で列挙した共通branch（source comparison、target_b、authority、inspect時のclassification/history分岐、claim flags、whole_registry）は同じ入力のため同じ結論となる。target_aのevent_revision比較だけはactual=null、context=EVENT-r1。L4 cmpはactual側pointer /records/target_a/original_event/event_revision に source_unresolved（unknown）を出し、L4 whole-event比較は /records/target_a/original_event に original_event_mutated（violation）を出す。他のevent fieldは両側known同値で、追加findingはない。

全findingは次の順。

| 順 | code | pointer | disposition / facet | return owner |
|---:|---|---|---|---|
| 1 | original_event_mutated | /records/target_a/original_event | violation / original_event | management-authority-owner |
| 2 | source_unresolved | /records/target_a/original_event/event_revision | unknown / original_event（comparison facet mapped by lane） | management-authority-owner |

他にglobal findingはない。overall severityはviolation、L4 facet順の最初のnon-corresponding facetはoriginal_event、両target aggregate stateもviolation。backflow ownerはmanagement-authority-owner。

L5 /failure_rules/8 は original_event_mutated を function_ref FN-OS015-01 に結び、/failure_rules/1 は source_unresolved をexpected_axis=original_eventのruleとして同じfunction_refへ結ぶ。従ってtyped owner_refは {"kind":"function_ref","id":"FN-OS015-01"}。独立導出keyはexpected_classification=management_material_violation、finding_codes=[original_event_mutated, source_unresolved]、backflow_owner=management-authority-owner、expected_axis=original_event、expected_state=violation、owner_ref=(function_ref,FN-OS015-01)。

## HELIXOS-L9-015-C0047

### 刺激とL4経路

L7 /connection_materials/OS015/case/cases/46/given/input は base_ref=inspect、replacementは records.target_a.original_event.event_revision を FOREIGN-event_revision にする1項目のみ。expanded input SHA-256は 5d67d3faa223a8eb6e02b526ef8f7a0305e924b890a458f70cc72212a6075f4d。fixture contextのevent_revisionは EVENT-r1で、replacement後のactual値はcontextと異なるknown文字列。他fieldはC0045と同じinspect fixture。

共通branchはC0045と同じ。event_revisionのactual/contextは双方knownで異なるため、L4 cmpは /records/target_a/original_event/event_revision に source_conflict（violation）を出し、そのwhole-event不一致から /records/target_a/original_event に original_event_mutated（violation）を出す。他field・target_b・他branchからfindingはない。

全finding、condition、axis/state、backflow owner、typed owner_refはC0045と同じ形である。pointerだけはsource_conflictの位置がevent_revisionへ変わる。checker class keyはpointerを含まず、ordered finding code列も同じなので、C0045とC0047は同一candidate keyへ属する。

| 順 | code | pointer | disposition / facet | return owner |
|---:|---|---|---|---|
| 1 | original_event_mutated | /records/target_a/original_event | violation / original_event | management-authority-owner |
| 2 | source_conflict | /records/target_a/original_event/event_revision | violation / original_event（comparison facet mapped by lane） | management-authority-owner |

## HELIXOS-L9-015-C0048

L7 /connection_materials/OS015/case/cases/47/given/input は base_ref=inspect、replacementは records.target_a.original_event.source_ref をnullにする1項目のみ。expanded input SHA-256は 687297318754805fb0f1bd456a5fdadbaf6a9ddb2bfceaa19b8580a1fc863ed2。fixture actual/context source_refは置換前にともに SYNTHETIC-SOURCE_REF-target_a。

C0045と同じ共通branchを通る。target_a source_ref actualはnull、contextはknown値なのでL4 cmpによりactual pointer /records/target_a/original_event/source_ref に source_unresolved（unknown）。whole event差分により /records/target_a/original_event に original_event_mutated（violation）。他fieldの比較は同値で、他branchからfindingはない。

全findingは順に original_event_mutated と source_unresolved。全体conditionはmanagement_material_violation、axis/stateはoriginal_event/violation、return ownerはmanagement-authority-owner。L5 /failure_rules/8 と /failure_rules/1 のoriginal_event ruleは両方FN-OS015-01を参照するため、typed owner_refはfunction_ref: FN-OS015-01。class keyはC0046と同一。

## HELIXOS-L9-015-C0049

L7 /connection_materials/OS015/case/cases/48/given/input は base_ref=inspect、replacementは records.target_a.original_event.source_ref を FOREIGN-source_ref にする1項目のみ。expanded input SHA-256は d313327b9c8ab0c654000763fa3dd77eb1fd3c780b7806e40b0595d73d243dfa。fixture context source_refは SYNTHETIC-SOURCE_REF-target_a。

両側がknown値で異なるためL4 cmpはactual pointer /records/target_a/original_event/source_ref に source_conflict（violation）。whole eventも異なるため /records/target_a/original_event に original_event_mutated（violation）。他fieldとbranchはC0045と同じで追加findingなし。全体condition、axis/state、owner、typed owner_refはC0045と同一。pointerのfield名だけがsource_refへ変わるため、candidate keyもC0045と同一。

## HELIXOS-L9-015-C0050–C0061

6件ともL7 inputはbase_ref=inspectに対するtarget_a original_eventの単一field replacement。対象fieldはL4 event_fieldsに含まれる。各base fixtureのactual/context値は同値のknown synthetic stringで、replacement後は他のrecord/context fieldを変更しない。従ってC0045–C0049で列挙した同じ全branchを通り、変更fieldだけがevent cmpを起動し、そのwhole-event差分が同じtargetのoriginal_event_mutatedを起動する。

| case | replacement path末尾 | after | expanded input SHA-256 | 順序付きfinding codes | class key |
|---|---|---|---|---|---|
| C0050 | source_revision | null | c1bd38948d4b5eacfd15b3190181702650fbc45454a6376818b0d8d735c84c11 | original_event_mutated, source_unresolved | C0046/C0048群 |
| C0051 | source_revision | FOREIGN-source_revision | 3f693c3b0ce5819727f447f6f9e0166698945c50d550be15627614aacf486c73 | original_event_mutated, source_conflict | C0045/C0047/C0049群 |
| C0052 | source_digest | null | 82d1e9ed5ff174b62836c86e022d8aafd903f653f2c93805e49641c4dbe2cb21 | original_event_mutated, source_unresolved | C0046/C0048群 |
| C0053 | source_digest | FOREIGN-source_digest | a0d58bfd455ac00dbdf7721816a32415377ed872d816977394d326cb6f38e182 | original_event_mutated, source_conflict | C0045/C0047/C0049群 |
| C0054 | actor_ref | null | 7a30d66c817f16876e6a327872e5df53906a7cbdfe837a7690f98f6e64963c56 | original_event_mutated, source_unresolved | C0046/C0048群 |
| C0055 | actor_ref | FOREIGN-actor_ref | 7d8a6577697f3e8732a62b21a39119d3fd5134fd43a676e9056937b4f566ae95 | original_event_mutated, source_conflict | C0045/C0047/C0049群 |

各caseのcomparison finding pointerは、それぞれ /records/target_a/original_event/{field}。null replacementはactual側unknown / context knownなのでsource_unresolved（unknown）、FOREIGN replacementはknown / known mismatchなのでsource_conflict（violation）。すべてoriginal_event laneへ入り、axis/state=original_event/violation、backflow_owner=management-authority-owner、typed owner_ref=function_ref: FN-OS015-01。従ってnull群はexpected_classification=management_material_violationでfinding_codes=[original_event_mutated, source_unresolved]、FOREIGN群は同violationで[original_event_mutated, source_conflict]。既存層row/refは追加しない。

同じ1-field / same-inspect-fixture経路の残り3組もL7 given.inputだけから照合した。

| case | replacement path末尾 | after | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0056 | observed_at_ref | null | 7e456dae7b3f14b81b288dae6f4b9e6260e5862feb4617c37d2f6ab1ec803ce1 | original_event_mutated, source_unresolved | null group |
| C0057 | observed_at_ref | FOREIGN-observed_at_ref | b4e073e74bf86ff00d46a765e4a115f003332d298ba97030b4486dd066f6db7d | original_event_mutated, source_conflict | FOREIGN group |
| C0058 | causal_id | null | 342794618867d6b259f2fe69aee88172aa4a8d0479fe1c368fe0578a87edceab | original_event_mutated, source_unresolved | null group |
| C0059 | causal_id | FOREIGN-causal_id | b0c2ca705456f2f3984c09f7f430b066a6be8470865f41d05bcac0e5960bc701 | original_event_mutated, source_conflict | FOREIGN group |
| C0060 | payload_ref | null | f610c8cd98a93f92d1f5ea2ce9b09bc2e931729e0119cc938ddfdbb0a4fc8aa9 | original_event_mutated, source_unresolved | null group |
| C0061 | payload_ref | FOREIGN-payload_ref | 0e4186545cadecf917aeb5429e3c77781ac1b5ff2f93f7a025de6597eacd66eb | original_event_mutated, source_conflict | FOREIGN group |

各comparison pointerは /records/target_a/original_event/{field}。null群とFOREIGN群はそれぞれ前段と同じ2つの完全なcandidate keyになる。各入力は単一replacement以外を変えず、source/authority/other target/history/boundary各branchから追加findingなし。

## HELIXOS-L9-015-C0102–C0119

12件ともbase_ref=inspectでcontext側target_a original_eventの単一field replacement。各fieldはL4 event_fieldsに含まれ、置換前はactual/contextが同値のknown synthetic string。source-field comparison、target_b、authority、classification/history、claim、global各branchはC0045–C0061の共通fixtureと同じ結論を持つ。context側の値が変わるため、cmpのunknown/conflict branchとwhole-event difference branchが次のとおり分かれる。

- null replacementでは、actual側はknown、context側はunknown。source_unresolved（unknown）はcontext pointer /context/records/target_a/original_event/{field}に出る。whole-event不一致はactual pointer /records/target_a/original_event に original_event_mutated（violation）を出す。
- FOREIGN replacementでは両側knownで異なる。source_conflict（violation）はactual pointer /records/target_a/original_event/{field}に出る。whole-event不一致は同じactual whole-event pointerに original_event_mutated（violation）を出す。

| case | field | context replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0102 | event_id | null | 490232b5ae8a2a15df2701467bcf9acf35e008406c9664fe0942803e47f897b2 | original_event_mutated, source_unresolved | null group |
| C0103 | event_id | FOREIGN-event_id | 0236e1839080ff72bdddc9415ac0add173bc04aaa40079c9c247413bff890232 | original_event_mutated, source_conflict | FOREIGN group |
| C0104 | event_revision | null | 10351b741b3e4af281711575fa203998a1bba314a2d6888512d37425e2140a9f | original_event_mutated, source_unresolved | null group |
| C0105 | event_revision | FOREIGN-event_revision | 9a957572177829fa1e5343d1aeeccda5f4ad3d9b269bfac7fb8146539bf0cb61 | original_event_mutated, source_conflict | FOREIGN group |
| C0106 | source_ref | null | bb8c912ea37929756375589e31fff27fc58109a339daed3833f3be74d1bc7d61 | original_event_mutated, source_unresolved | null group |
| C0107 | source_ref | FOREIGN-source_ref | 196aad04d0337a741587b264ed386ae6d8deb4761ef5645529ca437f3053f3a3 | original_event_mutated, source_conflict | FOREIGN group |
| C0108 | source_revision | null | 03f2f975d459784eda1fbb3a285c32daef85576154e372055c34ff3541278a21 | original_event_mutated, source_unresolved | null group |
| C0109 | source_revision | FOREIGN-source_revision | 4c524f586fa614564277e9ee7ba9dd263b05d28f4a6e46050b7d94ca9c6013cf | original_event_mutated, source_conflict | FOREIGN group |
| C0110 | source_digest | null | 98edcaa3a1f793b43040a797114a20d91b22180579f58cfe6f36dea0335b60d8 | original_event_mutated, source_unresolved | null group |
| C0111 | source_digest | FOREIGN-source_digest | 92aa853e6420f5a03bbb46a0fd39e2213e37c6f47d3da59046249ad06b1fc8a4 | original_event_mutated, source_conflict | FOREIGN group |
| C0112 | actor_ref | null | 151f559cc59fda012850d7f770d2d302ba362ca228ae02e71f8452beadd79e2f | original_event_mutated, source_unresolved | null group |
| C0113 | actor_ref | FOREIGN-actor_ref | bd03c53f26f4049ee498685200dd853e6b2b206ba482ad73b11c1b4da0d6f76f | original_event_mutated, source_conflict | FOREIGN group |

C0114–C0119もcontext側の同じsingle-field patternで照合した。

| case | field | context replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0114 | observed_at_ref | null | 21382fce55af1091542e04914d6dd6e91258dc9e3f7c01923c84c5eea2e542b9 | original_event_mutated, source_unresolved | null group |
| C0115 | observed_at_ref | FOREIGN-observed_at_ref | a962bc0e11548e2c4dbc739a6b2ee5316820426f990cd9ccf75b86fdfde8827e | original_event_mutated, source_conflict | FOREIGN group |
| C0116 | causal_id | null | 64c9bc61744d4d8fb1a8d6162374f2c05d1a243d37f3ecde3115235b99555cf8 | original_event_mutated, source_unresolved | null group |
| C0117 | causal_id | FOREIGN-causal_id | 015b96d8b0a3421bfca07451d4f9a50b3041a482ce432686a5c7aa3459baf248 | original_event_mutated, source_conflict | FOREIGN group |
| C0118 | payload_ref | null | b87fadcbd343625232780e5c5210afda1f7482306122039bec917d6b326de486 | original_event_mutated, source_unresolved | null group |
| C0119 | payload_ref | FOREIGN-payload_ref | b77a347b0d8c3f2e44af7fceaf8c1d2118d03a017007f5f6d2c7bb8cd12e56a0 | original_event_mutated, source_conflict | FOREIGN group |

same-inspect-fixtureのL4 event comparatorはC0102–C0113と同様にnull値をcontext pointer、known不一致をactual pointerへ返す。whole-event mutation finding、condition=violation、axis/state=original_event/violation、return owner、typed owner_refはそれぞれnull/FOREIGNの既存key群に一致する。

両findingはoriginal_event laneに入り、overall conditionはmanagement_material_violation、axis/stateはoriginal_event/violation、backflow_ownerはmanagement-authority-owner。L5 rule joinによりtyped owner_refはfunction_ref: FN-OS015-01。null群は[original_event_mutated, source_unresolved] key、FOREIGN群は[original_event_mutated, source_conflict] keyで、C0045–C0061の各対応群と同一となる。case row/refは追加しない。

## HELIXOS-L9-015-C0160–C0171

12件ともbase_ref=classifyで、actual側target_a original_eventの単一field replacement。置換対象6 fieldはL4 event_fieldsに含まれ、classify fixtureでは各original_event fieldがcontext側と同値のknown string。classify phaseのsource/original_event比較とwhole-event比較はC0045–C0061と同じ結果になる。

classify固有の枝も個別に照合した。actual/context双方のoriginal_classificationはnullなのでprior classification検査はN/A。actual new_classificationは変更されず、event_id/event_revisionとtarget_id/scopeの比較先であるcontext original_event/sourceもfixture値のまま一致する。kindは許可値new_kind。historyとunresolved_historyは両側で有効な一意文字列配列であり、lost条件は成立しない。authority、current_material_claim、generated_claims、whole_registry_claimも基底fixtureのままなので追加findingはない。

| case | field | actual replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0160 | event_id | null | debb32bd8c05b134e585870261382e5adf29f407231ccbb7b4c56cd75f726962 | original_event_mutated, source_unresolved | null group |
| C0161 | event_id | FOREIGN-event_id | 55c62b87a5e396dc652d679e370cb6eafea49e95806f8170c28331707ee9e8a2 | original_event_mutated, source_conflict | FOREIGN group |
| C0162 | event_revision | null | eae82e977265806178bcf09f0de0638c8cfd28d5fc175b63d7bf90780e82a566 | original_event_mutated, source_unresolved | null group |
| C0163 | event_revision | FOREIGN-event_revision | 5b372bd9a7e73868fc6fb9a1a02fc45d657616621721ca37ad729469467aaa78 | original_event_mutated, source_conflict | FOREIGN group |
| C0164 | source_ref | null | 3020347c0ecd4a5bf317633b784d54b53f911ba16b348318a3ef2e7ea814a75c | original_event_mutated, source_unresolved | null group |
| C0165 | source_ref | FOREIGN-source_ref | d1b9358310e901eb45089ff903f6f9e7fdbb091dd30daec70616e96c4d20858a | original_event_mutated, source_conflict | FOREIGN group |
| C0166 | source_revision | null | 3b62034fc5ea7e5c6be545eaca24a0b67402b2a7bc88d4ea153917a5aed4a6bc | original_event_mutated, source_unresolved | null group |
| C0167 | source_revision | FOREIGN-source_revision | 56044b5ad7d9e10e3047c8c207b5dfc6f6a26799ed5f8826008f2f010e45ef65 | original_event_mutated, source_conflict | FOREIGN group |
| C0168 | source_digest | null | 0b28a23d8db1eb467e309cbe93b89d47da95ce63d528ae0f03806cd608527794 | original_event_mutated, source_unresolved | null group |
| C0169 | source_digest | FOREIGN-source_digest | d292ec73f42afb09ea91bc3ec51b2e3f4a3efce5ff048853429fb406efb92d9a | original_event_mutated, source_conflict | FOREIGN group |
| C0170 | actor_ref | null | 3fd2dc9f22157dfa13fedd9655a15328f2aa112c7cea61788f01ef6bab77b849 | original_event_mutated, source_unresolved | null group |
| C0171 | actor_ref | FOREIGN-actor_ref | b1542cf50bcb8ba058d05f7b885c56848a7f8933bf01a1d899a079c3467f796e | original_event_mutated, source_conflict | FOREIGN group |

null replacementはactual側pointerにsource_unresolved（unknown）、FOREIGN replacementはknown mismatchとしてactual pointerにsource_conflict（violation）。whole-event差分によりactual whole-event pointerへoriginal_event_mutated（violation）が加わる。L4全体conditionとprimary axis/stateはmanagement_material_violation、original_event/violation。L5 `/failure_rules/8` と `/failure_rules/1` または `/failure_rules/4` はいずれもFN-OS015-01に一意joinし、typed owner_refはfunction_ref: FN-OS015-01。

## HELIXOS-L9-015-C0172–C0177

6件ともbase_ref=classifyで、actual側target_a original_eventの単一field replacement。対象fieldはobserved_at_ref、causal_id、payload_refで、L4 event_fieldsに含まれる。classify fixtureでは置換前のactual/context値が同じknown string。classify固有のprior/new classification、history、authority、claim枝はC0160–C0171と同じ入力状態で追加findingを生じない。

| case | field | actual replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0172 | observed_at_ref | null | 4d6dd92fd47eeb0869ccba056c16e75e642c9d819777f7a862c237414ed27d40 | original_event_mutated, source_unresolved | null group |
| C0173 | observed_at_ref | FOREIGN-observed_at_ref | 6cc0f12871c9815cd14f2cff6679f8761b3e4b7133399d1b02890246046b4e80 | original_event_mutated, source_conflict | FOREIGN group |
| C0174 | causal_id | null | 1eb5308d0d7ee4709b96c4275e29f5c8462f09a1edfb4a7d5926b8e2b275085f | original_event_mutated, source_unresolved | null group |
| C0175 | causal_id | FOREIGN-causal_id | 878ba8af0788789feb689dc7e81b478c78121150cb6c758c19bb15f5a2c2f9df | original_event_mutated, source_conflict | FOREIGN group |
| C0176 | payload_ref | null | e1a9bbb4f2feb0d33d30c87a0452f4e351dd9201c343eca5ee8d7edae4c64683 | original_event_mutated, source_unresolved | null group |
| C0177 | payload_ref | FOREIGN-payload_ref | bff72017527bd881fcdba042e197cfddde9c1489a5d2bd0f04b4cc1a89f34b0d | original_event_mutated, source_conflict | FOREIGN group |

null replacementはactual側comparison pointerにsource_unresolved、FOREIGN replacementは同pointerにsource_conflict。全event objectがcontextと異なるためactual whole-event pointerにoriginal_event_mutatedが付く。condition=management_material_violation、primary axis/state=original_event/violation、return owner=management-authority-owner。L5 owner joinは既存のnull/FOREIGN key群と同一で、typed owner_ref=function_ref: FN-OS015-01。

## HELIXOS-L9-015-C0179・C0185

2件ともbase_ref=classifyで、context側target_a.sourceの単一fieldをFOREIGN値へ置換する。L7 given.inputのexpanded SHA-256は次のとおり。

| case | context field | replacement | expanded input SHA-256 |
|---|---|---|---|
| C0179 | target_id | FOREIGN-target_id | 7add75b704e43588e01c88ff807e2767326c41f84161d731182e13fe8be0111e |
| C0185 | scope | FOREIGN-scope | 6468179f85a11567d0f54d947c337d149a0e472d8b02dae4a6d01f304d61e37b |

各変更前はactual/context source値が同一known string。L4 source facetの比較はactual `/records/target_a/source/{field}` にsource_conflictを出す。classifyではnew_classification.target_idとscopeもcontext sourceへ照合するため、変更対象に対応するfieldではactual `/records/target_a/new_classification/{field}` にもう一件source_conflictが出る。target_id/scope以外のnew_classification比較、original event、prior classification（双方null）、history、authority、claimsは一致または有効で、他findingはない。L4 sort順はpointer順でnew_classification pointer、source pointerの順。同codeの2所見を重複保持する。

全体condition=management_material_violation、facet順でsourceが最初の違反なのでaxis/state=source/violation。両所見のreturn ownerはmanagement-authority-owner。L5 `/failure_rules/5` のclassification source_conflictと`/failure_rules/3` のsource source_conflictはともにFN-OS015-01を指し、typed owner_ref=function_ref: FN-OS015-01。独立導出keyはfinding_codes=[source_conflict, source_conflict]で、C0179とC0185は同key群。

## HELIXOS-L9-015-C0218–C0235

18件ともbase_ref=classifyで、context側target_a original_eventの単一field replacement。全9 event_fieldsのactual値はknown stringで、置換前context値と同値。分類phaseではevent_idとevent_revisionだけがnew_classificationとの追加比較対象になる。

L4 event comparatorは、context nullならcontext pointerへsource_unresolvedを出し、FOREIGNならactual event pointerへsource_conflictを出す。全event object差分からactual whole-event pointerにoriginal_event_mutatedが出る。event_id/event_revisionではclassify new_classification comparatorも同じcontext event pointerへsource_unresolvedを出すため、L4最終tuple重複除去により同じcode/pointer/return_ownerの二件は一件に畳まれる。FOREIGN値では追加比較がactual new_classification pointerへの別source_conflictになるので、同codeの異なるpointerを二件保持する。他6 fieldはclassification compare対象外。

| case | context field | replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0218 | event_id | null | 83a2e95e90c965ff498378e9f2907c441d52bfeee2ce7d296e9d9d48be649dce | original_event_mutated, source_unresolved | null+mutation |
| C0219 | event_id | FOREIGN-event_id | c3788fc02eb6797fbd9ab3e254823043a99a0cc08da520825a00574dc7f81899 | original_event_mutated, source_conflict, source_conflict | event foreign+classification |
| C0220 | event_revision | null | 627873ba23e05bbe5b6b3ed4e2690865e91841d023ceb3b097b8f96be11319ce | original_event_mutated, source_unresolved | null+mutation |
| C0221 | event_revision | FOREIGN-event_revision | aea1cda7956a764897e42b3b7c48b3b8a0c30439249d7fa80a6c63863d7d3316 | original_event_mutated, source_conflict, source_conflict | event foreign+classification |
| C0222 | source_ref | null | 3df1bcbf61012f973af287c0d02dd4a86e3bf4d9c0561f01610954f4807d4216 | original_event_mutated, source_unresolved | null+mutation |
| C0223 | source_ref | FOREIGN-source_ref | 24ec8b41d397ee0299010b2e7d5e81306031cf8709a007ab6bdf25230c277978 | original_event_mutated, source_conflict | event foreign |
| C0224 | source_revision | null | 1d1d3fee1f4e766b8ce69c32d79410ded531823d880aa6a0ee376e3ec32dcb8e | original_event_mutated, source_unresolved | null+mutation |
| C0225 | source_revision | FOREIGN-source_revision | 1a86f042afe3a1cae410435e6f0acd33fdeb3b51f86c89269dc60f7f62c4ab59 | original_event_mutated, source_conflict | event foreign |
| C0226 | source_digest | null | 77b82ff4a2e2c20677c16918c4f6f7a17c1299fb604621041976dc817371a53e | original_event_mutated, source_unresolved | null+mutation |
| C0227 | source_digest | FOREIGN-source_digest | 2e3804c6f8473e1e33861bc9bc7042324dc51ca97b749d33c19972d80b86a4c7 | original_event_mutated, source_conflict | event foreign |
| C0228 | actor_ref | null | a55514cf48f86e783ed6f2e62563a83e02c5c7053fb1c0f72d6ffe3dbb653ae1 | original_event_mutated, source_unresolved | null+mutation |
| C0229 | actor_ref | FOREIGN-actor_ref | 6cfc18f666bb5dd592da08405424c671c906494a1c22eeb3a3ffff5b9a622b82 | original_event_mutated, source_conflict | event foreign |
| C0230 | observed_at_ref | null | 4ddd38a237719c331d7fce1ab54a5a5c9e27a8962d62be34ea55e1f227ee5b0e | original_event_mutated, source_unresolved | null+mutation |
| C0231 | observed_at_ref | FOREIGN-observed_at_ref | dfbd53e882a39fe34eaf15a000135463d4e30c5de5fd49cae53d63fd3bc68ea0 | original_event_mutated, source_conflict | event foreign |
| C0232 | causal_id | null | ae4cf6b11f0c41d962379152375e67739efea3acb3bfb71b6fd756921b3572a0 | original_event_mutated, source_unresolved | null+mutation |
| C0233 | causal_id | FOREIGN-causal_id | 470510a8ec801fc1906a584b009933a7f494320e6c695e021c421e8971e50dce | original_event_mutated, source_conflict | event foreign |
| C0234 | payload_ref | null | 02ba974cac026c90897c0aa085f142b7fa7cbc1b98846e84dfd43d4197be5e17 | original_event_mutated, source_unresolved | null+mutation |
| C0235 | payload_ref | FOREIGN-payload_ref | 9769d035f04adc2402716127874230cf2e4a938faaac652530d9131b68d45290 | original_event_mutated, source_conflict | event foreign |

全件のoverall condition=management_material_violation、axis/state=original_event/violation、backflow owner=management-authority-owner。source_unresolvedとsource_conflictはL5のoriginal_event rule `/failure_rules/1` と `/failure_rules/4` に、mutationは`/failure_rules/8`に一意joinし、typed owner_ref=function_ref: FN-OS015-01。

## HELIXOS-L9-015-C0276–C0293

18件ともbase_ref=correctで、actual側target_a original_eventの単一field replacement。置換対象はL4 event_fieldsの9項目、基底fixtureではactual/contextが同値のknown string。correct固有枝を確認すると、actual/context original_classificationは同じ既知旧分類、new_classificationの全fieldとprior refsもcontextと一致し、classification_revisionは旧revisionと異なる。historyは両側とも有効でcontext entryがactual historyに保持されている。unresolved_history、authority、claim branchにも差分はないため、新規比較・prior・historyからの追加findingはない。

| case | field | actual replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0276 | event_id | null | 292d412075cd8873011585e7a6b8537fd46c6be4580a25f8de85a35d9bce54b3 | original_event_mutated, source_unresolved | null+mutation |
| C0277 | event_id | FOREIGN-event_id | cb9e42d6fd47cc61e1a0e97c908d05918e88b03ac5ded7b851f3e372b27c04c8 | original_event_mutated, source_conflict | event foreign |
| C0278 | event_revision | null | ba82d7e295780d9de316a7fca24fbd699ac69103425d56b4f11cc567f7f1f184 | original_event_mutated, source_unresolved | null+mutation |
| C0279 | event_revision | FOREIGN-event_revision | efd701f3940a49155d1d451955bd87915dd43436ff25f3f6fe224024339f5863 | original_event_mutated, source_conflict | event foreign |
| C0280 | source_ref | null | 82214cd163518ea8c075be96a487308761a3265ba71aac15c183dcb90d8e89e1 | original_event_mutated, source_unresolved | null+mutation |
| C0281 | source_ref | FOREIGN-source_ref | c8f870ef4274fc9d3db68f9004e8d0ffd9ba9d2d42dfb57a66706de95b670dab | original_event_mutated, source_conflict | event foreign |
| C0282 | source_revision | null | f381021b41a1259817460f9b44e402eedaec6bd5c2135bcd2a4379749715452a | original_event_mutated, source_unresolved | null+mutation |
| C0283 | source_revision | FOREIGN-source_revision | 8cb4d48c74275026c1ea5e398ab89e0b3248489eac393e5afef72d7f5730c3b4 | original_event_mutated, source_conflict | event foreign |
| C0284 | source_digest | null | 27d139aaa4c6473299ca048a8da6918642b4ccd427a21a3ccd897f5e94afe8b3 | original_event_mutated, source_unresolved | null+mutation |
| C0285 | source_digest | FOREIGN-source_digest | 0ded7219a7b66b36f79f0aa1ca552860649551b969e78ae9a1ac3a0e71849006 | original_event_mutated, source_conflict | event foreign |
| C0286 | actor_ref | null | 564995fa6ef1bb1d78727bf4b471a9e8b3737f6e2c8e76e75e50e5740b9e1535 | original_event_mutated, source_unresolved | null+mutation |
| C0287 | actor_ref | FOREIGN-actor_ref | b904fb858758dda5af3ec7c1ee89f5cbdf06ca71ebb47c8c6ded1b2b17df4eda | original_event_mutated, source_conflict | event foreign |
| C0288 | observed_at_ref | null | 6476166f1e24c8287f8cf1e8b9318706a634b76d7a17df633b5b77cb82aed3c0 | original_event_mutated, source_unresolved | null+mutation |
| C0289 | observed_at_ref | FOREIGN-observed_at_ref | aea2a7cfa672f466b7b56c5239a4e3b93387e9a01e55bc38be9820e4f6aeeb9c | original_event_mutated, source_conflict | event foreign |
| C0290 | causal_id | null | 4f7cc61a364be60b4b62bd24d7cbb3bb9c292eca107e6c6c0b284fc63f6b1973 | original_event_mutated, source_unresolved | null+mutation |
| C0291 | causal_id | FOREIGN-causal_id | 7c620be2961f13bb13acd1f80fdbb16467a5b5e1a787b96f3f91eee7463ac43b | original_event_mutated, source_conflict | event foreign |
| C0292 | payload_ref | null | ee98756b572e8c724ff21056e7bff4197f4ba14cf0d554a96afe3ca461e1b958 | original_event_mutated, source_unresolved | null+mutation |
| C0293 | payload_ref | FOREIGN-payload_ref | a5c15b48df677f05e3ae6c193a761e8952f7cbd21b42c5423405b7e36c8fb5e5 | original_event_mutated, source_conflict | event foreign |

null replacementはactual側field pointerのsource_unresolved、FOREIGN replacementは同pointerのsource_conflict。全event objectの不一致でactual whole-event pointerにoriginal_event_mutatedが加わる。overall condition=management_material_violation、primary axis/state=original_event/violation、return owner=management-authority-owner、typed owner_ref=function_ref: FN-OS015-01。class keyはinspect/classifyのevent mutation群と同じnull/FOREIGN key。

## HELIXOS-L9-015-C0295・C0301

2件ともbase_ref=correctで、context側target_a.sourceのtarget_id/scopeをFOREIGN値へ置換する。

| case | context field | replacement | expanded input SHA-256 | ordered finding codes |
|---|---|---|---|---|
| C0295 | target_id | FOREIGN-target_id | 1f3d817c242c79c9696a879befedf44f2026511623fb0ce02ebed4fa5f809afe | source_conflict, source_conflict |
| C0301 | scope | FOREIGN-scope | a3bd0401d8118fcecc5b2584574a134ffa19f6027d21c354ad91ce2507fd4a4e | source_conflict, source_conflict |

変更前はactual/context sourceとnew_classificationの対応値がすべて同じknown string。source比較とcorrect-phase new_classification target_id/scope比較がそれぞれ違反し、actual `/records/target_a/source/{field}` とactual `/records/target_a/new_classification/{field}` へsource_conflictを一つずつ出す。prior classification、revision差分、history、event、authorityに追加findingなし。最終pointer順はnew_classification、source。全体condition=management_material_violation、axis/state=source/violation。L5 `/failure_rules/5` と`/failure_rules/3` のownerはFN-OS015-01で、C0179/C0185と同じkey `[source_conflict, source_conflict]`。

## HELIXOS-L9-015-C0334–C0351

18件ともbase_ref=correctで、context側target_a original_eventの単一field replacement。actual eventとcontext eventは変更前に全9 fieldで同じknown string。correct-phaseのnew_classificationからcontext eventへの比較はevent_id/event_revisionだけで、prior classification参照、history、revision、他の補正枝はfixture上対応している。

| case | context field | replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|---|
| C0334 | event_id | null | 67a51425956c8f9fb3c840e67dda99d6bc3aac26ae9e29e4e0c051d3c14db1c1 | original_event_mutated, source_unresolved | null+mutation |
| C0335 | event_id | FOREIGN-event_id | f23ee125144eb4b7c4fa6c644b5b3f1e3465fd7bc3bbc5a1f83e6ac7acb0728d | original_event_mutated, source_conflict, source_conflict | event foreign+classification |
| C0336 | event_revision | null | 0125062143af3f22a0c97cb079585416c9c852a16601175f1965d4e5f6ca9f5b | original_event_mutated, source_unresolved | null+mutation |
| C0337 | event_revision | FOREIGN-event_revision | 62a05bd0310e5e9a6f31ce412300c10d68fca644b69843ff7b36057b85894df2 | original_event_mutated, source_conflict, source_conflict | event foreign+classification |
| C0338 | source_ref | null | a6cfa61bb87d94bf73f219f6a443aaa38db42e6823a615dec2dac372c9af4d17 | original_event_mutated, source_unresolved | null+mutation |
| C0339 | source_ref | FOREIGN-source_ref | 1265deed2a3ae1a91d8032bb7b7287592d2c99ea84e539cb379403046b302293 | original_event_mutated, source_conflict | event foreign |
| C0340 | source_revision | null | fccc66c4f48c4fb7058151e1280b1f1a6904ecf58f9af287363a0f6f7e73879a | original_event_mutated, source_unresolved | null+mutation |
| C0341 | source_revision | FOREIGN-source_revision | 4976b715449414e88ffc0059d7468e5c76c5957537a7679700ff1a11479f3899 | original_event_mutated, source_conflict | event foreign |
| C0342 | source_digest | null | 21503bdae7a2ecee562e4249833f3647fac48553fec404240b35e8bb5181dabe | original_event_mutated, source_unresolved | null+mutation |
| C0343 | source_digest | FOREIGN-source_digest | 46d7ac4fe6687882ff5702005fd2efbc65aec562ea6dae761f04640b43747882 | original_event_mutated, source_conflict | event foreign |
| C0344 | actor_ref | null | 6ce8af04534a40787ebdb1f997d640e02cd8daa10e84ed61e5038fbf68f39f53 | original_event_mutated, source_unresolved | null+mutation |
| C0345 | actor_ref | FOREIGN-actor_ref | eaea385023908ddca32195306ce545294f8f07746ff6338aee0e909c4c763180 | original_event_mutated, source_conflict | event foreign |
| C0346 | observed_at_ref | null | f11d3125c637a910cce04ae6c1cba6e0694f0629363c05e3ce2c2bd2d9358bb7 | original_event_mutated, source_unresolved | null+mutation |
| C0347 | observed_at_ref | FOREIGN-observed_at_ref | f034312e184edf632c376fe0498a3f3ca28a56417090ef89352d3985ee4f6fb6 | original_event_mutated, source_conflict | event foreign |
| C0348 | causal_id | null | dc3ac5311ec9d82ec14f210c0aebdc88a96cd0944b21402b9f72578735fe3187 | original_event_mutated, source_unresolved | null+mutation |
| C0349 | causal_id | FOREIGN-causal_id | 0817049ae44158be884b2dfdcbd993bd44bb689b3affcf2c8737c1fa3e59d8d1 | original_event_mutated, source_conflict | event foreign |
| C0350 | payload_ref | null | a029bba0ebd48687b033823a6af45b95b4a23bd55ca94d298fc0cd7c9f1057fe | original_event_mutated, source_unresolved | null+mutation |
| C0351 | payload_ref | FOREIGN-payload_ref | 72c8fc118915250b672cd603c7d348d31a69c527ad39dffbfe9bc7a9b88707ac | original_event_mutated, source_conflict | event foreign |

nullではevent comparatorとcorrect-phase new_classification comparatorが同一context event pointerのsource_unresolvedを返すためtuple重複除去後は1件。event_id/event_revision FOREIGNではactual event pointerとactual new_classification pointerに異なるsource_conflictを保持する。他field FOREIGNではnew_classification比較がなくactual event pointerのsource_conflictだけ。axis/stateは全件original_event/violation、overall condition=management_material_violation、typed owner_ref=function_ref: FN-OS015-01。

## HELIXOS-L9-015-C0364・C0365・C0414・C0415

4件ともactual new_classification.kindの単一変更。C0364/C0365はclassify、C0414/C0415はcorrectで、各base fixtureのactual/context kindはnew_kind。classify/correct固有の他field、prior classification、history、authority値は変更されない。

L4のkind field比較はactual pointer `/records/target_a/new_classification/kind` に次を生成する。

- nullの場合: known/unknown比較からsource_unresolved、許可kind集合の外としてclassification_kind_unresolved。両方unknownで、ordered codesは[classification_kind_unresolved, source_unresolved]。overall classification=management_material_unknown、axis/state=classification/unknown。
- FOREIGN値の場合: known mismatchからsource_conflict、許可kind集合の外としてclassification_kind_unresolved。ordered codesは[classification_kind_unresolved, source_conflict]。violationが優先するためoverall classification=management_material_violation、axis/state=classification/violation。

両所見のreturn ownerはmanagement-authority-owner。L5 `/failure_rules/20` のclassification_kind_unresolvedとclassification axisのsource_unresolved `/failure_rules/2` またはsource_conflict `/failure_rules/5` は全てFN-OS015-01に一意joinする。

| case | phase | replacement | expanded input SHA-256 | ordered finding codes |
|---|---|---|---|---|
| C0364 | classify | null | 4302bfd933f10d415523a9b2ba8bcf055b03da1a4bdf8018847510fbd902fbb4 | classification_kind_unresolved, source_unresolved |
| C0365 | classify | FOREIGN-kind | 0f7b4851c29c6dc13bd714dfac7d4a53422b6b7015f83f127fdfbed5a2222971 | classification_kind_unresolved, source_conflict |
| C0414 | correct | null | 4c757081eb77048ba54f226478df2a4c8d18e3606cf2ffe4926a0e68e34d1b6c | classification_kind_unresolved, source_unresolved |
| C0415 | correct | FOREIGN-kind | 78cf60434b2e3becb2e98dfb32c89bd88ed837be6e8ee74a01dd85c7303d6460 | classification_kind_unresolved, source_conflict |

null cases share one candidate key; FOREIGN cases share another. Both use typed owner_ref=function_ref: FN-OS015-01.

## HELIXOS-L9-015-C0460・C0463・C0466・C0469・C0472・C0477・C0480

7件ともbase_ref=correct。最初の5件はactual authority_originを許可enum内の非canonical値（issue/pr/ci/memory/management_record）へ変更するため、context canonical_sourceとの差からsource_conflict、非canonical値としてauthority_origin_forbiddenをactual authority_origin pointerへ出す。残る2件はactual/context双方を同一の未許可値（nullまたはunknown_origin）へ変えるため、comparison conflictはなくactual/context双方にauthority_origin_unresolvedを出す。

| case | actual/context replacement | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|
| C0460 | actual issue | 9c4e99d9ea183324f8b938e5413f50d546440070dad14768b198fa66e8a5b849 | authority_origin_forbidden, source_conflict | forbidden origin |
| C0463 | actual pr | 5fef6a05d5a33f1d49d0894d29081f0bc493f79e2373ed1d7f813ee0f440d0a2 | authority_origin_forbidden, source_conflict | forbidden origin |
| C0466 | actual ci | d10c6515b0daa1dc1aa720a39dbb41241548aa1139290f0ff84cf9b11416a675 | authority_origin_forbidden, source_conflict | forbidden origin |
| C0469 | actual memory | 20f12b9393cc44e98ed1823888e918bc8e88a7f4b5d94e21f50a68b28c6263a0 | authority_origin_forbidden, source_conflict | forbidden origin |
| C0472 | actual management_record | a0d1e5e26d53137fe912f084ec32b900569bd86d53f07e31590fd4c3bcd67569 | authority_origin_forbidden, source_conflict | forbidden origin |
| C0477 | actual/context null | 6c4da25b9830ed40121b6a772c9558c149e7d3136d4f4f4b9adbdd57c6eb511f | authority_origin_unresolved, authority_origin_unresolved | unresolved origin |
| C0480 | actual/context unknown_origin | 9455a362e5f8a40c71e68f2264b87bcf5d4fbf49f83dc4b4c5d37370825d9cbd | authority_origin_unresolved, authority_origin_unresolved | unresolved origin |

全件axis=authority。forbidden群はoverall classification=management_material_violation/state=violation、L5 `/failure_rules/10` と`/failure_rules/6`からtyped owner_ref=function_ref: FN-OS015-01。unresolved群はoverall classification=management_material_unknown/state=unknown、context pointerがactual pointerより先のsort順。L5 `/failure_rules/11`が両findingへ同じownerを与える。

## HELIXOS-L9-015-C0481・C0484・C0487・C0492・C0495

5件ともbase_ref=correctで、actual/context authority_stateのみを次のとおり変更する。変更前は双方current_material。L4はvalid state間の不一致にactual authority_state pointerのsource_conflictを出し、actual stale/conflict/unresolved状態にはそれぞれ専用所見を付ける。双方が同じinvalid値の場合はそれぞれのpointerにauthority_state_unresolvedを出すだけで、両者同じ値なのでsource_conflictはない。

| case | actual/context state | expanded input SHA-256 | ordered finding codes | key group |
|---|---|---|---|---|
| C0481 | actual stale_material | f43e8ce0fe9d3c11bdaeb0aaaf55539fc6e04c3c40d1b926aa398e4e0a08b604 | authority_stale, source_conflict | stale difference |
| C0484 | actual conflict_material | a13587285be055d701feb9e9465eaa90279a2b29db655fa44fd0d6d9bc7ceee6 | authority_conflict, source_conflict | conflict difference |
| C0487 | actual unresolved | 94db73cbdc8aa4989b55c1caebaaee6355657eb16241284b631324440e6aacf0 | authority_state_unresolved, source_conflict | unresolved difference |
| C0492 | actual/context null | 31343937280ddbb8d473f0602263dc9816a3edd13618c7e0edc12ff6a3d237e0 | authority_state_unresolved, authority_state_unresolved | same invalid state |
| C0495 | actual/context unknown_state | 305263aca5bba535fdc0f07b660894734093ef09faa9b65bbd291ba8cf1dc0dd | authority_state_unresolved, authority_state_unresolved | same invalid state |

各state findingはauthority facetに帰属する。異なるvalid stateはoverall classification=management_material_violation/state=violation。双方同一invalid stateはmanagement_material_unknown/state=unknownで、context pointer順が先。L5 `/failure_rules/6`、`/failure_rules/12`、`/failure_rules/13`、`/failure_rules/14` の該当ownerはすべてFN-OS015-01。

## HELIXOS-L9-015-C0505・C0522・C0539

3件ともtarget_a source.source_digestをactual側nullにし、current_material_claimをtrueにする二変更。C0505はinspect、C0522はclassify、C0539はcorrect。source comparisonによりactual digest pointerへsource_unresolvedが出てsource facetはunknown。L4 promotion branchはcurrent_material_claim=trueかつsource markありのためactual claim pointerへunresolved_promoted_to_current（violation）を出す。classify/correctでnew_classification等を照合してもcontext sourceと値は一致し、追加findingはない。

| case | phase | expanded input SHA-256 | ordered finding codes |
|---|---|---|---|
| C0505 | inspect | 66d00bb9f5d67a780d6a097ed31d585b35333007c2221804b18353ef056d5436 | source_unresolved, unresolved_promoted_to_current |
| C0522 | classify | 78bc52c3428970b3f718dd40d67a2a4c86101dc913d574460b202d9cc5fa0e9e | source_unresolved, unresolved_promoted_to_current |
| C0539 | correct | ce364a4e77349fc6c8b793004ccf787c1d55fe745080dac7e83e447872fb1e23 | source_unresolved, unresolved_promoted_to_current |

overall classification=management_material_violationはauthority violationを含む全体集約。facet順ではsourceが先に不一致となるためaxis/state=source/unknown。L5 source `/failure_rules/0` と promotion `/failure_rules/15` はFN-OS015-01に一意joinし、typed owner_ref=function_ref: FN-OS015-01。3件は同じcandidate key。

## HELIXOS-L9-015-C0573–C0582

10件ともbase_ref=classify。L4 classify phaseではactual/context original_classificationがnullであることが初回分類条件。非null化すると全体不一致からactual pointerにoriginal_classification_mutated、各非null側にidentity/revisionが既知ならfirst_classification_prior_present、未識別ならfirst_classification_prior_unresolvedを出す。

C0573/C0574では片側だけ既知prior objectがあるためmutation＋present。C0576/C0577は片側だけempty object、C0579/C0580は片側だけUNKNOWN-PRIOR stringであり、いずれもmutation＋unresolved。C0575では両側に同じ既知prior object、C0578では両側にempty object、C0581では両側に同じunknown stringがあるためmutationなし、両側それぞれのpresent/unresolved findingが残る。

C0582は両側のoriginal_classificationを同じ既知prior objectへ変更し、actual/context双方のnew_classification classification_ref/prior_classification_refをOLD-CLASS-target_a、classification_revision/prior_classification_revisionをCLASS-r1へ変更する。従って原分類のmutationはなく、両側にfirst_classification_prior_presentを一件ずつ出す。classifyのnew-classification field比較は実/文脈双方同値、null優先refの分岐も成立せず、history/unresolved_history/authority/claimに追加findingはない。

| case | input変更の要約 | expanded input SHA-256 | ordered finding codes | candidate key group |
|---|---|---|---|---|
| C0573 | actual original_classification = known prior object | 0caa9c9666add694384805bc5abf26bd5790a99ede3f636e89082e81a20e3ae3 | first_classification_prior_present, original_classification_mutated | one known prior |
| C0574 | context original_classification = known prior object | 5a7948fcd5626fa63379a7ae0db44e8b742fdaa11719aeab6b30124985f274c1 | first_classification_prior_present, original_classification_mutated | one known prior |
| C0575 | actual/context original_classification = same known prior object | 99b66273f06831b5fd3295c4fdf49b34806da85d580f98e20c8afb74fb1bfd1f | first_classification_prior_present, first_classification_prior_present | two known priors |
| C0576 | actual original_classification = {} | a272cd166d470aed32ba7bbc07bebbc5a5fa85f68837f767ffb078209f36c73e | first_classification_prior_unresolved, original_classification_mutated | one unresolved prior |
| C0577 | context original_classification = {} | 39593fb283cb22badf86c59a265a9449d36bf4aaab9c29144709a5fe2482f7ce | first_classification_prior_unresolved, original_classification_mutated | one unresolved prior |
| C0578 | actual/context original_classification = {} | 89f3fd01ece80c9576841b2b5c7556393198e1fb070aabaac0ef26da8b686fd9 | first_classification_prior_unresolved, first_classification_prior_unresolved | two unresolved priors |
| C0579 | actual original_classification = UNKNOWN-PRIOR | b807d7c40121ac266011d10c9a5ce316c750eca0ee8c0548e17935c95e895009 | first_classification_prior_unresolved, original_classification_mutated | one unresolved prior |
| C0580 | context original_classification = UNKNOWN-PRIOR | d034a0faa908957715bba295565cc97d9542a44949478323adf1eb613350e9b6 | first_classification_prior_unresolved, original_classification_mutated | one unresolved prior |
| C0581 | actual/context original_classification = UNKNOWN-PRIOR | 876b14318dbe2118931db728413bb1162334edcf0fb2daa7841f80f1d3b12f81 | first_classification_prior_unresolved, first_classification_prior_unresolved | two unresolved priors |
| C0582 | both original classifications and both new/prior ref+revision pairs set to matching known prior | f29a638488f00dc7c9b2e19875ddaf2ba05f4f3e458dadb7e94b1fd214969801 | first_classification_prior_present, first_classification_prior_present | two known priors |

one-known-prior key is overall management_material_violation, axis/state=classification/violation. One-unresolved-prior key is overall management_material_violation, axis/state=classification/unknown (classification facet precedes history where original_classification_mutated is placed). Two-known-priors key is management_material_violation/classification/violation; two-unresolved-priors key is management_material_unknown/classification/unknown. L5 `/failure_rules/9`, `/failure_rules/29`, `/failure_rules/30` bind these findings to FN-OS015-01; typed owner_ref is the same function_ref.

## Candidate key一覧

上記140件は17のkey群を含む。既存13群は各case節を参照。classification prior群はC0573/C0574 [first_classification_prior_present, original_classification_mutated]、C0576/C0577/C0579/C0580 [first_classification_prior_unresolved, original_classification_mutated]、C0575/C0582 [first_classification_prior_present, first_classification_prior_present]、C0578/C0581 [first_classification_prior_unresolved, first_classification_prior_unresolved]。L8/L9やL4/L5のcase row/refは追加していない。

| case | expected_classification | ordered finding_codes | expected_axis / state | typed owner_ref |
|---|---|---|---|---|
| C0045, C0047, C0049, C0051, C0053, C0055, C0057, C0059, C0061, C0103, C0105, C0107, C0109, C0111, C0113, C0115, C0117, C0119, C0161, C0163, C0165, C0167, C0169, C0171, C0173, C0175, C0177, C0223, C0225, C0227, C0229, C0231, C0233, C0235, C0277, C0279, C0281, C0283, C0285, C0287, C0289, C0291, C0293, C0339, C0341, C0343, C0345, C0347, C0349, C0351 | management_material_violation | [original_event_mutated, source_conflict] | original_event / violation | function_ref: FN-OS015-01 |
| C0046, C0048, C0050, C0052, C0054, C0056, C0058, C0060, C0102, C0104, C0106, C0108, C0110, C0112, C0114, C0116, C0118, C0160, C0162, C0164, C0166, C0168, C0170, C0172, C0174, C0176, C0218, C0220, C0222, C0224, C0226, C0228, C0230, C0232, C0234, C0276, C0278, C0280, C0282, C0284, C0286, C0288, C0290, C0292, C0334, C0336, C0338, C0340, C0342, C0344, C0346, C0348, C0350 | management_material_violation | [original_event_mutated, source_unresolved] | original_event / violation | function_ref: FN-OS015-01 |
| C0179, C0185, C0295, C0301 | management_material_violation | [source_conflict, source_conflict] | source / violation | function_ref: FN-OS015-01 |
| C0219, C0221, C0335, C0337 | management_material_violation | [original_event_mutated, source_conflict, source_conflict] | original_event / violation | function_ref: FN-OS015-01 |
| C0364, C0414 | management_material_unknown | [classification_kind_unresolved, source_unresolved] | classification / unknown | function_ref: FN-OS015-01 |
| C0365, C0415 | management_material_violation | [classification_kind_unresolved, source_conflict] | classification / violation | function_ref: FN-OS015-01 |
| C0460, C0463, C0466, C0469, C0472 | management_material_violation | [authority_origin_forbidden, source_conflict] | authority / violation | function_ref: FN-OS015-01 |
| C0477, C0480 | management_material_unknown | [authority_origin_unresolved, authority_origin_unresolved] | authority / unknown | function_ref: FN-OS015-01 |
| C0481 | management_material_violation | [authority_stale, source_conflict] | authority / violation | function_ref: FN-OS015-01 |
| C0484 | management_material_violation | [authority_conflict, source_conflict] | authority / violation | function_ref: FN-OS015-01 |
| C0487 | management_material_violation | [authority_state_unresolved, source_conflict] | authority / violation | function_ref: FN-OS015-01 |
| C0492, C0495 | management_material_unknown | [authority_state_unresolved, authority_state_unresolved] | authority / unknown | function_ref: FN-OS015-01 |
| C0505, C0522, C0539 | management_material_violation | [source_unresolved, unresolved_promoted_to_current] | source / unknown | function_ref: FN-OS015-01 |
| C0573, C0574 | management_material_violation | [first_classification_prior_present, original_classification_mutated] | classification / violation | function_ref: FN-OS015-01 |
| C0576, C0577, C0579, C0580 | management_material_violation | [first_classification_prior_unresolved, original_classification_mutated] | classification / unknown | function_ref: FN-OS015-01 |
| C0575, C0582 | management_material_violation | [first_classification_prior_present, first_classification_prior_present] | classification / violation | function_ref: FN-OS015-01 |
| C0578, C0581 | management_material_unknown | [first_classification_prior_unresolved, first_classification_prior_unresolved] | classification / unknown | function_ref: FN-OS015-01 |

## 既知の境界

- C0045-C0061、C0102-C0119、C0160-C0177、C0179、C0185、C0218-C0235、C0276-C0293、C0295、C0301、C0334-C0351、C0364、C0365、C0414、C0415、C0460、C0463、C0466、C0469、C0472、C0477、C0480、C0481、C0484、C0487、C0492、C0495、C0505、C0522、C0539、C0573-C0582のraw刺激、L4全branch、全finding、axis/state、return owner、L5 owner_refまでを採用済みmainのL4/L5契約から独立に閉じた。L4 algorithm本文は実行していない。
- checkerのcheck-childやfreeze検査はcase意味の独立根拠にしない。
- L7 expected_proposalとL8/L9は、このcaseの導出中に参照していない。
- この140件は141件全体や負例領域全体のcoverageを主張しない。C0044は過去の探索でexpected_proposalに触れたため除外し、残る10件の新しいcaseは独立に追跡した。
- #3901 R1 reviewで形成規則が変わった場合は、記録したsource revisionを更新し、このcaseを再照合する。現在の根拠は採用済みmain dd5787507a9ef3b69f411074e2fcbc7710ca1d62 である。
