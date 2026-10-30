# WR204 OS017 負例候補のsource-only形成

## 対象と境界

- 対象V-pair: HELIX-OS OS017 L4/L9、PR #3945 R1 M1/F2への対応。
- L4条件表とL7 `given_input_ref` の固定入力から、resume phaseの `binding.project` 比較に関する2つの負例候補を形成した。
- L9 `OS017-NORMAL-RESUME`に対応するL7 `OS017-L8-NORMAL-RESUME`は比較用の基準入力であり、負例classには含めない。
- L9の `condition` / `expected` は導出に使わない。L7 `original_expected_ref` も導出に使わない。L7期待は旧L9→旧L8→L7の移管lineageがあるため独立oracleと主張しない。
- L7の入力・binding・context bindingはRFC6901 pointerを実値まで解決して記録した。context参照はcontext objectの`/binding`からbinding objectの`/project`へ辿る。
- L4/L5のalgorithmは実行していない。L5/L8は編集していない。
- 4層 `explicit_negative_equivalence_classes` markerは付けない。typed `owner_ref` とL5/L8投影を後続V-pairへ残す。今回の4wayはlegacy modeのままで未成立であり、PASSを主張しない。

## source-only導出

L7 `ticket-workflow-derivation.json` の `/cases/3`, `/cases/5`, `/cases/6` の `given_input_ref` を展開した。3入力の再帰的な値差分は `/binding/project` のみ。

| L7 case | actual `/binding/project` | context `/context/binding/project` | L4条件からの局所分類 |
| --- | --- | --- | --- |
| `OS017-L8-NORMAL-RESUME` | `SYNTHETIC-PROJECT` | `SYNTHETIC-PROJECT` | known一致。正例としてclass外。 |
| `OS017-L8-BINDING-PROJECT-UNKNOWN` | `null` | `SYNTHETIC-PROJECT` | binding比較はinputs facet。非string operandに`source_unresolved`、局所状態unknown。 |
| `OS017-L8-BINDING-PROJECT-CONFLICT` | `OTHER-SOURCE` | `SYNTHETIC-PROJECT` | binding比較はinputs facet。known不一致に`source_conflict`、局所状態violation。 |

L4 `/diagnostic_contract/comparison_table/binding` は`project`を含む5 fieldをinputs facet/string比較として定める。`diagnostic_code_facets` は`source_unresolved` / `source_conflict`をcomparison facetへ対応させ、L4 `condition_semantics` は選択phaseのfacet集約順を定める。L4のresume適用規則は設計テキストとして読み、実行していない。resumeの他の固定入力は3 caseで同じであり、base inputのownership、ticket、workflow、backflow、continuity、scope_limit条件はL4テキストに照らして対応を確認した。したがって全体conditionはunknown caseが`workflow_material_unknown`、conflict caseが`workflow_material_violation`。ownerはL4固定値`ticket-workflow-owner`。新しいphase/facet別ownerやgateは作らない。

2件はL4の正規`failure_classifications`配列に置き、F01契約の`negative_class_refs`から双方向に結んだ。L9 caseはそのL4 rowへの`l4_source_class_candidate_ref`を持つ。4層markerの`negative_equivalence_classes`はL4/L5/L8/L9の全配列が揃うまで付けないため、checkerはlegacy modeを維持する。QA explicit modeに必要なL5 typed ownerとL5/L8 rowsは未形成である。

## 期待値の保持確認

L9の217 integration caseについて、`id`, `condition`, `expected`, `expected_preserved` の順序付きprojectionをJSON canonical formでdigest化した。base `e465b3b2edcf8951ea3a5bbedc271543eb2e094e` と候補で件数・digestが同一である。digest比較は編集前後不変の確認だけに用い、期待値やL7移管期待から分類を導いていない。

## 残件

- 残る214件はこのtrancheでは分類していない。旧期待の条件別件数は独立導出の根拠に含めない。
- L5 typed owner mappingとL8 class/case projectionは別V-pairで行う。
- 4層markerを揃えるまで`CHK-NEG-4WAY-MATCH`はlegacy/not-evaluatedのまま。今回のL4/L9 candidate-only evidenceは4way成立・freeze・実装許可を意味しない。

## 静的検証

`python3 scaffold/research/wr204-os017-negative-classes-20261031/validate_manual_derivation.py` は、監査とL4 rowの宣言pointerをRFC6901で解決し、L7の入力からactual/contextの参照先objectと`project` leafまで辿れること、3入力のraw差分、2つのL4 rowとL9 217件の期待projection保持、4層marker不在を確認する。L4/L5のalgorithmやruntimeは実行しない。
