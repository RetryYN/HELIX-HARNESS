# WR181 OS015 ソースのみ手導出pilot — レビュー要約

**状態:** 導出を一部進めた時点で、根拠記述だけでは値を決められないrootに達したため停止。既存期待との比較は未実施。

**固定入力revision:** `f5d511841c665b3424e159c8c1029bde51434521`
**導出に使った資料:** L3/L10の記述、L4診断契約の記述/表、L7の固定`given.input`とsource hashの解決。
**導出に使っていない資料:** L4の埋め込みalgorithm、L5 `formal_reference`、L7/L8/L9の期待値、L10 `expected_observation`、L4のexpected classification列。

この記録は監査用のscaffold evidenceであり、formal expectation、authority、freeze、実行結果を形成しない。`semantic_summary`はsource上の意味だけを要約したもので、返却JSONの厳密な値や構造ではない。encodingが決まらないrootは`partial_unknown`または`unknown`のまま保持する。

## 対象と結果

### HELIXOS-L9-015-C0001

- 役割: 正常なinspect。raw fixtureは変更なし。
- L7入力: `/connection_materials/OS015/case/cases/0/given/input`
- base: `inspect`; replacements数: `0`
- source比較の要約: L7 rawでは両targetの比較値はcontextと一致し、target_a.source.target_idにも差分がない。target_correspondenceの正確なJSON構造は未確定。

| root | status |
|---|---|
| `condition` | `derived` |
| `selected_phase` | `derived` |
| `target_correspondence` | `partial_unknown` |
| `current_source_material` | `partial_unknown` |
| `original_classification_state` | `unknown` |
| `original_authority_state` | `unknown` |
| `retained_original_events` | `partial_unknown` |
| `retained_original_classifications` | `partial_unknown` |
| `retained_unresolved_history` | `partial_unknown` |
| `retained_classification_lineage` | `unknown` |
| `findings` | `derived` |
| `actual_management_record_written` | `unknown` |
| `actual_event_rewritten` | `unknown` |
| `actual_authority_generated` | `unknown` |
| `whole_registry_verified` | `unknown` |
| `operation_effect` | `unknown` |

### HELIXOS-L9-015-C0004

- 役割: target_a.source.target_idがnullのinspect入力。
- L7入力: `/connection_materials/OS015/case/cases/3/given/input`
- base: `inspect`; replacements数: `1`
- source比較の要約: L7 rawではtarget_a.source.target_idがnullで、context側はknown。target_bの比較対象は一致する。正確なJSON構造は未確定。

| root | status |
|---|---|
| `condition` | `derived` |
| `selected_phase` | `derived` |
| `target_correspondence` | `partial_unknown` |
| `current_source_material` | `partial_unknown` |
| `original_classification_state` | `unknown` |
| `original_authority_state` | `unknown` |
| `retained_original_events` | `partial_unknown` |
| `retained_original_classifications` | `partial_unknown` |
| `retained_unresolved_history` | `partial_unknown` |
| `retained_classification_lineage` | `unknown` |
| `findings` | `partial_unknown` |
| `actual_management_record_written` | `unknown` |
| `actual_event_rewritten` | `unknown` |
| `actual_authority_generated` | `unknown` |
| `whole_registry_verified` | `unknown` |
| `operation_effect` | `unknown` |

### HELIXOS-L9-015-C0005

- 役割: target_a.source.target_idが既知でcontextと異なるinspect入力。
- L7入力: `/connection_materials/OS015/case/cases/4/given/input`
- base: `inspect`; replacements数: `1`
- source比較の要約: L7 rawではtarget_a.source.target_idが空でないでcontext側と異なる。target_bの比較対象は一致する。正確なJSON構造は未確定。

| root | status |
|---|---|
| `condition` | `derived` |
| `selected_phase` | `derived` |
| `target_correspondence` | `partial_unknown` |
| `current_source_material` | `partial_unknown` |
| `original_classification_state` | `unknown` |
| `original_authority_state` | `unknown` |
| `retained_original_events` | `partial_unknown` |
| `retained_original_classifications` | `partial_unknown` |
| `retained_unresolved_history` | `partial_unknown` |
| `retained_classification_lineage` | `unknown` |
| `findings` | `partial_unknown` |
| `actual_management_record_written` | `unknown` |
| `actual_event_rewritten` | `unknown` |
| `actual_authority_generated` | `unknown` |
| `whole_registry_verified` | `unknown` |
| `operation_effect` | `unknown` |

## 集計と停止点

- 代表母集団: 91（80 class×phase + 11 positive case）。pilotは3件、残り88件。その他の保持済みunit casesは494件。
- 3件それぞれ16 rootを記録。各rootの根拠はJSONの`/audit/cohort`にある。意味上の要約だけで返却値の厳密なserialization形式を示せないrootは未形成として扱う。
- 停止理由: 許可されたsourceの記述だけでは、複数のroot値とfinding pointer/serializationを一意に確定できない。根拠不足はL3/L10/L4へ返す。
- 既存期待との比較、全91代表の独立性、freeze成立は主張しない。

## 旧HELIXと失敗記録

pilot内の`/audit/legacy_and_failure_basis`に旧asset・failure record・保持/変更点を記録した。旧世代のruntime/test/CIは実行していない。
