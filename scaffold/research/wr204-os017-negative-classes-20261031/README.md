# WR204 OS017 負例候補のsource-only形成

## 対象と境界

- 対象V-pair: HELIX-OS OS017 L4/L9、PR #3945 R1 M1/F2への対応。
- L4条件表とL7 `given_input_ref` の固定入力から、inputs比較の2つの負例class候補を形成した。最初のwitnessはresume phaseの`binding.project`で、今回49件のraw witnessを同じfield-neutral class条件へ追加した。
- resumeは固定入力のwitnessが置かれたcase phaseであり、L4 class condition/keyはphaseやfield/slotを含まない。classの不変条件は全体condition、全体ordered finding signature、inputs facetの局所stateである。同じinputs facet内の別field witnessも同じkeyに属し得るが、全体finding signatureやseverityが異なるcaseは同じclassに含めない。
- L9 `OS017-NORMAL-RESUME`に対応するL7 `OS017-L8-NORMAL-RESUME`は比較用の基準入力であり、負例classには含めない。
- L9の `condition` / `expected` は導出に使わない。L7 `original_expected_ref` も導出に使わない。L7期待は旧L9→旧L8→L7の移管lineageがあるため独立oracleと主張しない。
- L7の入力・binding/management・context binding/managementはRFC6901 pointerを実値まで解決して記録した。各raw witnessでgiven inputからactual/context objectと比較leafまで参照を辿る。
- L4/L5のalgorithmは実行していない。L5/L8は編集していない。
- 4層 `explicit_negative_equivalence_classes` markerは付けない。typed `owner_ref` とL5/L8投影を後続V-pairへ残す。今回の4wayはlegacy modeのままで未成立であり、PASSを主張しない。

## source-only導出

最初のtrancheではL7 `ticket-workflow-derivation.json` の `/cases/3`, `/cases/5`, `/cases/6` の `given_input_ref` を展開し、resume固定witnessのraw差分が`/binding/project`だけであることを記録した。追加trancheでは同じsource-only手順で`/cases/7..38`と`/cases/91..107`の49入力を確認した。各入力はphase基準入力からbindingまたはmanagementのleaf一つだけが変わっている。

| L7 case | actual `/binding/project` | context `/context/binding/project` | L4条件からの局所分類 |
| --- | --- | --- | --- |
| `OS017-L8-NORMAL-RESUME` | `SYNTHETIC-PROJECT` | `SYNTHETIC-PROJECT` | known一致。正例としてclass外。 |
| `OS017-L8-BINDING-PROJECT-UNKNOWN` | `null` | `SYNTHETIC-PROJECT` | binding比較はinputs facet。非string operandに`source_unresolved`、局所状態unknown。 |
| `OS017-L8-BINDING-PROJECT-CONFLICT` | `OTHER-SOURCE` | `SYNTHETIC-PROJECT` | binding比較はinputs facet。known不一致に`source_conflict`、局所状態violation。 |

L4 `/diagnostic_contract/comparison_table/binding` は`project`を含む5 fieldをinputs facet/string比較として定める。`diagnostic_code_facets` は`source_unresolved` / `source_conflict`をcomparison facetへ対応させ、L4 `condition_semantics` は選択phaseのfacet集約順を定める。L4のresume適用規則は設計テキストとして読み、実行していない。resumeの他の固定入力は3 caseで同じであり、base inputのownership、ticket、workflow、backflow、continuity、scope_limit条件はL4テキストに照らして対応を確認した。したがって全体conditionはunknown caseが`workflow_material_unknown`、conflict caseが`workflow_material_violation`。ownerはL4固定値`ticket-workflow-owner`。新しいphase/facet別ownerやgateは作らない。

L4のbinding 5 fieldとmanagement 12 fieldはいずれもinputs facet/string比較である。追加49件ではactual側null 16件とcontext側null 17件が`source_unresolved`、actual側known unequal string 16件が`source_conflict`となる。各caseはこのinputs leaf一つだけが基準入力から変わり、L4散文にある他facetの材料は同じなので、追加後の候補witness総数はunresolved 34、conflict 17。classの全体condition/ordered finding signature/inputs局所stateは既存2 rowの意味を維持し、ownerはL4固定値`ticket-workflow-owner`。新しいphase/facet別ownerやgateは作らない。

2件のL4 `failure_classifications` rowとF01契約の`negative_class_refs`は維持し、49件分のL7 source pointerを各rowへ追加した。対応する既存L9 caseには`l4_source_class_candidate_ref`だけを追加し、L9の`condition`/`expected`等は変更しない。L9の`negative_class_ref`は付けない。QA explicit modeではそれが同層`negative_equivalence_classes` class tableへの所属を表す。L9 class tableとL5 typed owner/L5-L8 rowsは未形成なので、4層markerは付けずlegacy modeを維持する。

## 追加49 raw witnessの内訳

| L7 given-input範囲 | 件数 | 単一leaf差分 | class候補 |
| --- | ---: | --- | --- |
| `/cases/7..38` actual binding/management | 32 | bindingのproject以外4 fieldとmanagement 12 field。各fieldにnullと`OTHER-SOURCE`のcaseがある | `source_unresolved` 16、`source_conflict` 16 |
| `/cases/91..107` context binding/management | 17 | binding 5 fieldとmanagement 12 fieldがcontext側でnull | `source_unresolved` 17 |

各caseは`manual-derivation.json#/cohort/additional_raw_witnesses`にL7 case pointer、family、field、差分側、classだけを記録した。validatorがL7 case idとL9 source-case mappingを解決し、raw graphからphase、actual/context operand、単一leaf差分、classとの一致を再計算する。分類はL4の比較表・散文とL7 raw inputから手導出し、L7/L8/L9期待を導出に使っていない。

## 旧HELIXの対応・失敗記録

旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`（LEGACY-ASSET-3A15E5645D2D2A59DFF5、§3のsource refs/scope/acceptance、§5のcanonical Ticketとsource provenance）を意味再導出の起点とした。source refsとscopeを導出契約へ結ぶ点を保持し、旧CLI/DB/schema/admission engineは移していない。

関連する旧失敗記録は`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（LEGACY-ASSET-A127DEC3EEE6ED63CF17）のUTW-002（prose handoverがcontinuation正本と競合）、UTW-005（PR trace/review evidenceが最新HEAD・merge-baseへ再束縛されない）、UTW-021（completion evidenceがprose/自己申告へ戻る余地）である。これらはcanonical source/証跡の分離を照らす歴史的失敗であり、本49入力が旧失敗を再現したとは主張しない。旧runtime/test/CIは実行していない。

## 期待値の保持確認

L9の217 integration caseについて、`id`, `condition`, `expected`, `expected_preserved` の順序付きprojectionをJSON canonical formでdigest化した。base `e465b3b2edcf8951ea3a5bbedc271543eb2e094e` と候補で件数・digestが同一である。digest比較は編集前後不変の確認だけに用い、期待値やL7移管期待から分類を導いていない。

## 残件

- 217入力中source-onlyで調べた52件は、負例候補51件を2 class候補へ結び、正例の基準入力1件をclass外に置いた。他の165入力は未調査。L9期待の条件別件数は独立導出の根拠に含めない。
- L5 typed owner mappingとL8 class/case projectionは別V-pairで行う。
- 4層markerを揃えるまで`CHK-NEG-4WAY-MATCH`はlegacy/not-evaluatedのまま。今回のL4/L9 candidate-only evidenceは4way成立・freeze・実装許可を意味しない。

## 静的検証

`python3 scaffold/research/wr204-os017-negative-classes-20261031/validate_manual_derivation.py` は、監査とL4 rowの宣言pointerをRFC6901で解決し、L7の追加49入力からactual/context operand、phase、基準入力との差分leaf、classを再計算する。L9の対応case→L4 candidate参照、217件の期待projection保持、4層marker不在も確認する。L4/L5のalgorithmやruntimeは実行しない。
