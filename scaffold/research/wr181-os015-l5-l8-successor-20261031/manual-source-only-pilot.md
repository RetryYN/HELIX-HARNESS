# WR181 OS015 source-only pilot — review summary

**状態:** 一部導出の途中で、根拠記述が不足するrootに達したため停止。期待値との比較は未実施。

**固定入力revision:** `f5d511841c665b3424e159c8c1029bde51434521`
**導出に使った資料:** L3/L10 prose, L4 diagnostic contract prose/tables, L7 fixed `given.input` and source hash resolution.
**導出に使っていない資料:** L4 embedded algorithm, L5 `formal_reference`, L7/L8/L9 expected values, L10 expected observations, L4 expected classification columns.

この記録は監査用scaffold evidenceであり、formal expectation、authority、freeze、実行結果を形成しない。`semantic_summary`はsource-levelの意味上の要約であり、返却JSONのexact value/shapeではない。exact encodingが決まらないrootは`partial_unknown`または`unknown`のまま保持する。

## 対象と結果

### HELIXOS-L9-015-C0001

- 役割: normal inspect; unmodified raw fixture
- L7入力: `/connection_materials/OS015/case/cases/0/given/input`
- base: `inspect`; replacements: `0`
- source比較の要約: L7 rawで両targetの比較値はcontextと一致し、target_a.source.target_idにも差分なし。target_correspondenceのexact JSON shapeは未確定。

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

- 役割: unknown inspect; target_a source.target_id=null
- L7入力: `/connection_materials/OS015/case/cases/3/given/input`
- base: `inspect`; replacements: `1`
- source比較の要約: L7 rawでtarget_a.source.target_id=null、context側はknown。target_bの比較対象は一致。exact JSON shapeは未確定。

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

- 役割: violation inspect; target_a source.target_id is known and different
- L7入力: `/connection_materials/OS015/case/cases/4/given/input`
- base: `inspect`; replacements: `1`
- source比較の要約: L7 rawでtarget_a.source.target_idはnonemptyかつcontext側と異なる。target_bの比較対象は一致。exact JSON shapeは未確定。

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

- 代表母集団: 91（80 class×phase + 11 positive cases）。pilotは3件、残り88件。その他の保持済みunit casesは494件。
- 3件それぞれ16 rootを記録。derived/partial_unknown/unknownのsource根拠はJSONの`/audit/cohort`にある。意味上の要約があってもexact serialized return valueを示さないrootは未形成扱い。
- 停止理由: 許可されたsource proseだけでは複数rootの値とfinding pointer/serializationを一意に確定できない。根拠不足はL3/L10/L4へ戻す。
- 既存期待との比較、全91代表の独立性、freeze成立は主張しない。

## 旧HELIXと失敗記録

pilot内の`/audit/legacy_and_failure_basis`に旧asset・failure record・保持/変更点を記録。旧runtime/test/CIは実行していない。
