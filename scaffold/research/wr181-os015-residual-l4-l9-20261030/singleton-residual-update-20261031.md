# WR181: L4/L9 singleton residual と promotion witness 更新

作業branchは latest main `0fc143f1bc356b4b1e0ab410d974572b935bffa1` から開始し、計測時点のlatest main `de7908f1c9cb6d05531a339a0054ac577902b58c` へrebaseしてtrialした。source-onlyでL4の `diagnostic_contract` と既存L9 `compact_whole_observation.ordered_findings` のcode/pointerを照合した。L4埋込algorithm、旧runtime、test、CIは実行していない。L7は不変で、L9の `material_ref` をL7固定fixtureに向け、`forward_stimulus_replacements` で刺激を2件だけ追加した。L5/L8は不変。

## 6 singleton residual のcode+pointer witnessとsingleton class不成立

`non_occurring_singleton_residuals` の `member_count: 0` はsingleton finding classが発火しない意味である。code/pointer自体にwitnessがないという意味ではない。各findingは、列挙した別findingとL4条件上必ず共起する。

| L4 class | L9 source witness | L4条件による同時finding |
| --- | --- | --- |
| `source_unresolved` / original_event | C0044: `source_unresolved` at `/records/target_a/original_event/event_id` | 片側だけnullならwhole event不一致による `original_event_mutated`。両側同一nullならmutationなしだがactual/context pointer双方で `source_unresolved` が出る |
| `source_conflict` / original_event | C0045: `source_conflict` at `/records/target_a/original_event/event_id` | known値不一致による `source_conflict` とwhole event不一致による `original_event_mutated` が共起する |
| `original_event_mutated` | C0044: `/records/target_a/original_event` | field comparisonで `source_unresolved`; C0045では `source_conflict` |
| `unresolved_promoted_to_current` | C0505: at `/records/target_a/current_material_claim` | source unresolved at `/records/target_a/source/source_digest`; C0584/C0585はevent/authority経路を加える |
| `first_classification_prior_present` | C0573–C0575, C0582: original classification pointer(s) | C0573 mutation共起、C0574/75 source_unresolved×4、C0582は既知値がactual/contextで同値でもprior-presentが2 finding。C0574等のpointer順と分類は既存class-correction-auditのsource-only記録に従う |
| `first_classification_prior_unresolved` | C0576–C0581: actual/context original classification pointer(s) | C0576/79 mutation、C0577/80 mutation＋source_unresolved×4、C0578/81はactual/context同値のprior-unresolvedが2 finding（加えてsource_unresolved×4） |

### Promotionの2経路

両方ともL7 `/connection_materials/OS015/case/fixture_inputs/inspect` をmaterial baseとし、L7 bytesは変更しない。

- C0584: actual `original_event.event_id=null`, `current_material_claim=true`。L4 event comparisonが `source_unresolved` at `/records/target_a/original_event/event_id`、whole event comparisonが `original_event_mutated` at `/records/target_a/original_event`、promotion条件が `unresolved_promoted_to_current` at `/records/target_a/current_material_claim` を形成する。ordered codesは `original_event_mutated`, `source_unresolved`, `unresolved_promoted_to_current`。全体conditionはviolation、選択facetはoriginal_event / violation。
- C0585: actual `authority_state=null`, `current_material_claim=true`。L4 authority-state条件が `authority_state_unresolved` at `/records/target_a/authority_state`、promotion条件が `unresolved_promoted_to_current` at `/records/target_a/current_material_claim`。全体conditionはviolation、authority facet局所stateもviolation（unknown + violationのseverity集約）。

IDはL4 `class_key_projection` のordered codes、全体condition、axis/state、ownerから作成。expected値はL4条件文を手でたどって記録した。L7 expected proposal、L8/L9既存expected、checker outputはoracleとして使っていない。C0584/C0585のL9 rowsはappend-onlyで追加し、既存583件のcondition/expected/expected_preservedを変えていない。L9は585件、F03 source refsは31件となった。L7 fixtureは583件のままで、差をL9 remainingに記録した。

## scope / verification

L4 failure classification rows: 51 → 47（6 singleton rows削除、2 promotion composite rows追加）。L9 integration rows: 583 → 585、negative equivalence class rows: 45 → 47。L5/L8は51 class rowsを保持し、後続pair作業に残す。L7 hashを維持した。freezeの前後結果は別途SCF-B-0177と検収報告に記録する。
