# WR181 OS015 ソースのみ手導出pilot — レビュー要約

**状態:** C0001/C0004/C0005の16 result rootを、許可された015上流資料とL7 raw inputから意味上導出した。L4に返却JSONの型・一部のencodingがないrootは、その意味と未確定のserializationを分けて記録した。盲検担当は既存期待を導出に使わなかった。固定後、Codexが7 scalarとcurrent_source_materialだけを比較し、後者の単一boolean解釈と既存のtarget別objectに差を確認した（#3510 comment 6529774668）。残りは未比較。

**対象入力revision:** `f5d511841c665b3424e159c8c1029bde51434521`
**L3/L10 source revision:** `a2cc3defcee5a229145c89217af30c7d20da998f`（L3/L10両文書）
**L3/L10 content revision:** `0200d20aa4d5086e9cf9e9305ec9fdea59dc2c39`

## 読んだ根拠

- L3 business `/requirements/4` の `HELIXOS-L3-015-B01` と functional `/requirements/24..26` の `F01..F03`。L10 business `/cases/4` の `HELIXOS-L10-015-B01` と functional `/cases/24..26` の `F01..F03`。L10の `expected_observation` は上流の検証観点として読んだ。
- L4 `/contracts/0..3` がそれぞれ015 B01/F01/F02/F03と対応することを確認し、各契約本文を読んだ。
- L4 `diagnostic_contract` の phases、source/event/classification field、facets/codes、comparison facets、aggregation、current material limit、raw retention、mutation rule、finding shape、return owner、condition values、result fieldsを読んだ。埋込algorithm本文は読んでいない。
- L4 `failure_classifications` の `OS015-NEG-source_unresolved-source` と `OS015-NEG-source_conflict-source` を読み、code、condition、classification、finding code、axis/state、preserved obligations、side effect countを参照した。これはL4上流の分類資料であり、L7/L8/L9期待の照合ではない。
- L7から読んだのは `/connection_materials/OS015/case/fixture_inputs/inspect` と `/cases/{0,3,4}/given/input` のみ。case全体やexpected fieldは読んでいない。case 0は無差分、case 3はactual `target_a.source.target_id=null`、case 4はactualが既知の `FOREIGN-target_id` へ置換される。

**導出に使っていない資料:** L4埋込algorithm、L5 `formal_reference`、既存L7/L8/L9期待値。`expanded_input_sha256` はraw inputに記録された値を記載し、独立再計算はしていない。

この記録はscaffold監査資料であり、formal expectation、authority、freeze、実行結果を形成しない。`partial_unknown` は意味要約まではできたが完全な返却形が決まらないことを示す。`unknown` はL4でstate/value mappingが決まらないことを示す。

## 固定結果と比較後の改訂

盲検担当が比較前に固定した原本は [blind-derivation-fixed-e96d09af.json](blind-derivation-fixed-e96d09af.json)（SHA-256 `e96d09afb12131681bf126b6414a4700f60c37da156cb9297b823f6344362b79`）。原本は意味上の草案で、完全なserialized oracleではない。固定後にCodexが7 scalarと`current_source_material`を比較した。原本の後者は単一boolean true/false/false、`whole_registry_verified`はfalseだった。

比較後、盲検担当がL4 contracts・L10と分類根拠を広げて監査を再評価し、その後Codexが比較結果を知った状態で本監査を補正した。原本の両rootは、返却型とmappingの不足を理由に現行監査では`partial_unknown`とする。比較後の既存期待の値合わせではない。未比較rootの完全な返却値や独立oracleは成立していない。

## 3ケースの16 root

### HELIXOS-L9-015-C0001 — 正常なinspect

L7 input: `/connection_materials/OS015/case/cases/0/given/input`（base `inspect`、replacementsなし）。

| root | 判定 | 導出した意味／残る不足 |
|---|---|---|
| `condition` | `derived` — `management_material_corresponding` | 両targetのsource/event/authority比較値はcontextと一致し、適用される入力欠陥がない。 |
| `selected_phase` | `derived` — `inspect` | L7 `base_ref` とL4 phases。 |
| `target_correspondence` | `partial_unknown` | target_a/target_bとも比較上corresponding。L4は返却JSONのtarget別構造を定めない。 |
| `current_source_material` | `partial_unknown` | L4はsource/event/authorityの不備でfalseとするが、対象間の集約と返却形は未定義。比較後の値合わせを避け、L4明確化後に再導出する。 |
| `original_classification_state` | `unknown` | raw classificationは両target null。inspectは将来のclassification/history receiptを評価せず、出力state encodingも未定義。 |
| `original_authority_state` | `unknown` | raw authority fieldsは両targetでcontextと一致（canonical_source/current_material、claim false）。resultへのmappingが未定義。 |
| `retained_original_events` | `partial_unknown` | L4 raw retention/mutationとfailure-class `expected_preserved` はevent whole/revisionの保持を要求。返却wrapperは未定義。 |
| `retained_original_classifications` | `partial_unknown` | 両raw値nullを保持する意味は導ける。返却wrapperは未定義。 |
| `retained_unresolved_history` | `partial_unknown` | 両targetのraw arrayを変更せず保持する意味は導ける。返却wrapperは未定義。 |
| `retained_classification_lineage` | `unknown` | new classificationはnull、historyは空。inspectでlineageを評価せず、「なし」のencodingも未定義。 |
| `findings` | `derived` — 空 | 比較上の不一致・未解決operandなし。 |
| `actual_management_record_written` | `derived` — false | L4 operation_effectはnone、raw retentionはwriterを動かさないと宣言。 |
| `actual_event_rewritten` | `derived` — false | raw retention/mutation ruleによる不変保持、writerなし。 |
| `actual_authority_generated` | `derived` — false | B01の生成禁止、writer/effectなし。raw generated claimsもfalse。 |
| `whole_registry_verified` | `partial_unknown` | 全registryの検証は成立していない。入力は2 synthetic target、whole_registry_claim=false。出力mapping/typeは未定義。 |
| `operation_effect` | `derived` — `none` | L4の明示値。 |

### HELIXOS-L9-015-C0004 — target_a source identity欠落

L7 input: `/connection_materials/OS015/case/cases/3/given/input`（base `inspect`、actual `target_a.source.target_id=null`）。

| root | 判定 | 導出した意味／残る不足 |
|---|---|---|
| `condition` | `derived` — `management_material_unknown` | known contextに対するsource identity欠落。L4 source_unresolvedはunknown。 |
| `selected_phase` | `derived` — `inspect` | L7 `base_ref` とL4 phases。 |
| `target_correspondence` | `partial_unknown` | target_a source facetはunknown、他の比較facetとtarget_bはcorresponding。返却JSON構造は未定義。 |
| `current_source_material` | `partial_unknown` | L4はsource/event/authorityの不備でfalseとするが、対象間の集約と返却形は未定義。比較後の値合わせを避け、L4明確化後に再導出する。 |
| `original_classification_state` | `unknown` | 両raw classificationはnull。inspectで将来receiptを評価せず、出力state encodingも未定義。 |
| `original_authority_state` | `unknown` | authority fields自体は両targetでcontextと一致するが、target_a source identityはunknown。resultへのmappingは未定義。 |
| `retained_original_events` | `partial_unknown` | L4 raw retention/mutationとsource_unresolved classのpreserved obligationは原event保持を要求。返却wrapperは未定義。 |
| `retained_original_classifications` | `partial_unknown` | 両raw null値を保持する意味は導ける。返却wrapperは未定義。 |
| `retained_unresolved_history` | `partial_unknown` | 両targetのraw arrayを保持する意味は導ける。返却wrapperは未定義。 |
| `retained_classification_lineage` | `unknown` | new classificationはnull、historyは空。lineageなしのencodingは未定義。 |
| `findings` | `partial_unknown` | code `source_unresolved`、axis source、disposition unknown、return owner `management-authority-owner`。pointer serializationとfinding全体の返却条件は未定義。 |
| `actual_management_record_written` | `derived` — false | L4 operation_effect none、writerなし、failure-class side_effect_count 0。 |
| `actual_event_rewritten` | `derived` — false | L4 raw retention/mutation ruleによる保持、writerなし、side effectなし。 |
| `actual_authority_generated` | `derived` — false | B01の生成禁止、writer/effectなし。 |
| `whole_registry_verified` | `partial_unknown` | 全registry検証は成立していない。2 synthetic targetとclaim=falseからこれを導く。出力mapping/typeは未定義。 |
| `operation_effect` | `derived` — `none` | L4の明示値。 |

### HELIXOS-L9-015-C0005 — target_a known source conflict

L7 input: `/connection_materials/OS015/case/cases/4/given/input`（base `inspect`、actual `target_a.source.target_id=FOREIGN-target_id`）。

| root | 判定 | 導出した意味／残る不足 |
|---|---|---|
| `condition` | `derived` — `management_material_violation` | contextと既知の非空source identityが不一致。L4 source_conflictはviolation。 |
| `selected_phase` | `derived` — `inspect` | L7 `base_ref` とL4 phases。 |
| `target_correspondence` | `partial_unknown` | target_a source facetはviolation、他の比較facetとtarget_bはcorresponding。返却JSON構造は未定義。 |
| `current_source_material` | `partial_unknown` | L4はsource/event/authorityの不備でfalseとするが、対象間の集約と返却形は未定義。比較後の値合わせを避け、L4明確化後に再導出する。 |
| `original_classification_state` | `unknown` | 両raw classificationはnull。inspectで将来receiptを評価せず、出力state encodingも未定義。 |
| `original_authority_state` | `unknown` | authority fields自体は両targetでcontextと一致するが、target_a source identityはconflict。resultへのmappingは未定義。 |
| `retained_original_events` | `partial_unknown` | L4 raw retention/mutationとsource_conflict classのpreserved obligationは原event保持を要求。返却wrapperは未定義。 |
| `retained_original_classifications` | `partial_unknown` | 両raw null値を保持する意味は導ける。返却wrapperは未定義。 |
| `retained_unresolved_history` | `partial_unknown` | 両targetのraw arrayを保持する意味は導ける。返却wrapperは未定義。 |
| `retained_classification_lineage` | `unknown` | new classificationはnull、historyは空。lineageなしのencodingは未定義。 |
| `findings` | `partial_unknown` | code `source_conflict`、axis source、disposition violation、return owner `management-authority-owner`。pointer serializationとfinding全体の返却条件は未定義。 |
| `actual_management_record_written` | `derived` — false | L4 operation_effect none、writerなし、failure-class side_effect_count 0。 |
| `actual_event_rewritten` | `derived` — false | L4 raw retention/mutation ruleによる保持、writerなし、side effectなし。 |
| `actual_authority_generated` | `derived` — false | B01の生成禁止、writer/effectなし。 |
| `whole_registry_verified` | `partial_unknown` | 全registry検証は成立していない。2 synthetic targetとclaim=falseからこれを導く。出力mapping/typeは未定義。 |
| `operation_effect` | `derived` — `none` | L4の明示値。 |

## 集計と未解決shape

- `current_source_material` はL4でsource/event/authorityの不備がfalseにするとされるが、対象間の集約と返却形は未定義。比較後に値を修正せず、L4明確化後に再導出する。
- `target_correspondence`、classification/authority state、retained wrappers、空lineage、finding pointer encoding、`whole_registry_verified` の出力mappingはL4が定義しない。上のroot別表にsemantic結果と不足を分けて記した。
- `actual_*`、`operation_effect` はruntime結果から推測せず、L4のoperation_effect、raw retentionの「writerなし」、対応failure classのside effect count 0と、B01/F02の契約から設計上の意味を導いた。
- 3件それぞれ16 root。固定後の一部比較を除く既存期待との比較、残る代表88件、全91代表の独立性、freezeは未実施・未成立。
- 監査の機械可読版: [manual-source-only-pilot.json](manual-source-only-pilot.json)。このpilotは正式設計・実行・受入を意味しない。
