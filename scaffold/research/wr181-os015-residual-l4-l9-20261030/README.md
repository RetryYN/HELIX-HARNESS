# WR181 OS015 残112件のL4/L9候補

## 対象と根拠

- PR class: `design_verification`、対象V-pair: HELIX-OS OS015 L4/L9
- source baseはPR-C #3923 head `64d3cf379335e0a4b034f7295a9a225a2d755986`（mainへmerge済み）。分類補正branchは#3927 head `5d541f69ff86674e585311558ad2dac1972d42e4`の子で、#3927の分類がmainへmergeされる前のpush/PRは行わない。
- 既存手動監査はcommit `05614def4e0427f9390c2b6535e520f5c7c26590` の [`manual-case-audit-05614.md`](manual-case-audit-05614.md) に保存し、そのbytesを複製した。対象L4/L5/L7の元根拠revisionはdd5787507a9ef3b69f411074e2fcbc7710ca1d62。L4のdiagnostic_contract、L5の既存functionとfailure_rules先頭31件、L7 bytesが候補基点でも保持されていることを静的に確認する。
- 手動監査のCandidate key一覧は既存2 event-class keyに103件、新15 key群に37件を記録する。既存29件はPR-Aのcase-evidenceにより既に接続済みなので、前者の残74件に含めない。そこへC0044を独立導出して加えて112件とする。後続のL4/L7 correctionで新規15 classから誤groupを除き、補正後18 classへ37件を割り当てた。
- 新しいclass keyは手動監査記録のfinding code列、全体condition、axis/state、共通backflow ownerとL5 function ownerから形成する。L4/L9のcase expected、L7 `expected_proposal`、checker出力からclassや期待を逆生成しない。

## C0044の独立導出

L7 `/connection_materials/OS015/case/cases/43/given/input` は`base_ref=inspect`で、`records/target_a/original_event/event_id`を`null`にする置換が1つだけある。展開input hashは`9975567cf158a570be3f1d62cbf9af619c2166d78e5fdaef7908d9ee06088148`。inspect fixtureでは置換前のactual/context event_idが同じ既知文字列で、置換後はactual側だけnullになる。L4のevent comparatorからactual event_id pointerに`source_unresolved`、whole-event比較からtarget_a original_event pointerに`original_event_mutated`を得る。最終keyは既存 `OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5`。L7 expected、L8/L9 expectedは使っていない。

## 新規18 classの下流形成

L4 `failure_classifications`に18 rowを追加し、F02 contractの`negative_class_refs`へ同じ18 IDを追加した。class IDは監査済みのcanonical keyを、UTF-8 JSON `ensure_ascii=False, sort_keys=True, separators=(comma, colon)`で符号化したSHA-256全64桁に`OS015-NEG-COMPOSITE-`を付けて作る。C0573–C0582のうち6件は後続のL4/L7再照合で4つのclass keyへ修正した。詳細は[`class-correction-audit-5d541.md`](class-correction-audit-5d541.md)と[`class-correction-cases.json`](class-correction-cases.json)。

| class ID | case数 | phase | ordered finding codes | overall / axis / state |
| --- | ---: | --- | --- | --- |
| `OS015-NEG-COMPOSITE-0847e4310de684d30c54c16de19c0ce068f2666a3e68fe3e3d93f144934f9a42` | 4 | classify, correct | `source_conflict, source_conflict` | management_material_violation / source / violation |
| `OS015-NEG-COMPOSITE-08695e0fad423852ebf0d60b18b944ec130ec1c4865698ff05c83b4646a9e405` | 2 | classify | `first_classification_prior_unresolved, first_classification_prior_unresolved, source_unresolved, source_unresolved, source_unresolved, source_unresolved` | management_material_unknown / classification / unknown |
| `OS015-NEG-COMPOSITE-087fdf8f8d9303e619d04ccc3cbc6da653d08a4b20f6009bab1ec8dfe3cc90c9` | 1 | correct | `authority_conflict, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-a0f8ffe7cb48eb9237554e7c9344182b48c98fed14721acb96cafa89481c6429` | 2 | classify | `first_classification_prior_unresolved, original_classification_mutated, source_unresolved, source_unresolved, source_unresolved, source_unresolved` | management_material_violation / classification / unknown |
| `OS015-NEG-COMPOSITE-3123046e6695da60ba6abef15c2588c632081391d431ec133fa509d6d90017bb` | 1 | correct | `authority_state_unresolved, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-4e80f5977bf48e95192dcbe7ebd26ffba7aa253ddef99755e42e3e0990008f72` | 2 | classify | `first_classification_prior_unresolved, original_classification_mutated` | management_material_violation / classification / unknown |
| `OS015-NEG-COMPOSITE-4ed7dc758943d0971c6a7853ba3568609804d47e1f5f615e39eaa5e523ef1c04` | 2 | correct | `authority_origin_unresolved, authority_origin_unresolved` | management_material_unknown / authority / unknown |
| `OS015-NEG-COMPOSITE-89de10e4554c2fb25885bc24b09de095d209750e791130a0f121afac952aa4ea` | 5 | correct | `authority_origin_forbidden, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-8db83e3dc818dc613437d06b57bc7695b8867a0c7a35f630b9e0837c6c5950a4` | 1 | classify | `first_classification_prior_present, first_classification_prior_present, source_unresolved, source_unresolved, source_unresolved, source_unresolved` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-931c9057eaac57f35bd0ed64d5288c4339e3e4ff9b96eb19b2d77ff8a25767e2` | 3 | inspect, classify, correct | `source_unresolved, unresolved_promoted_to_current` | management_material_violation / source / unknown |
| `OS015-NEG-COMPOSITE-9539a1f0e6787f121075bfc71469d281caadb1e4c31ba4a8df9ccd5fe882d3d7` | 2 | correct | `authority_state_unresolved, authority_state_unresolved` | management_material_unknown / authority / unknown |
| `OS015-NEG-COMPOSITE-9c5c0fb87d1b6f9fbdf5e2e825c9e600024bbcd3f5bac7a32e7c20423fca521c` | 4 | classify, correct | `original_event_mutated, source_conflict, source_conflict` | management_material_violation / original_event / violation |
| `OS015-NEG-COMPOSITE-d509d10e51a98c1fe8971d91e909e058b360a803c1d686891282e3a8667a158f` | 1 | classify | `first_classification_prior_present, first_classification_prior_present` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-dead4dfeefccac8eec603d8be3bf804b928f0882d4c1b4ff907acba7b10f277a` | 1 | classify | `first_classification_prior_present, original_classification_mutated, source_unresolved, source_unresolved, source_unresolved, source_unresolved` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-df9154ac8720b176f3ba2d4bf5fc0362496e530eafdd829278de18d4a3d5c39b` | 2 | classify, correct | `classification_kind_unresolved, source_conflict` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-e23551bcfb260256f33d6911d244f0715dee4f62c3f09840e48d7de5c6473ae9` | 1 | correct | `authority_stale, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-f26b128d495605fef34af26296623a373d06205bdbe8e9e366001ee980e6f294` | 2 | classify, correct | `classification_kind_unresolved, source_unresolved` | management_material_unknown / classification / unknown |
| `OS015-NEG-COMPOSITE-f5d02578a904f76ed01d15f549851918588f40e74d8216f84c54500cc38a384a` | 1 | classify | `first_classification_prior_present, original_classification_mutated` | management_material_violation / classification / violation |

L9 `negative_equivalence_classes`にはL4 class rowからexpected keyを順方向に写し、source pointersをL4/L7だけにした18 rowを追加する。L9の112 case rowsでは`negative_class_ref`と`material_ref`をL7 fixed `given.input`へ向ける。既存29 linkを変更せず、全583 case rowsの`condition`、`expected`、`expected_preserved`はbyte意味を保つ。L5/L8文書はこの補正では編集しない。
## L4 class conditionと112件のraw input照合

18個の新規L4 class conditionは、L7 `given.input`の`base_ref`と`replacements`だけを各caseの`expanded_input_sha256`に束縛して照合した。manifestの`condition_review`には各classの対象pointer集合、phase集合、入力件数を残し、静的validatorは全112入力でpointer・hash・phase表記を確認する。L7 `expected_proposal`、L8/L9 case expected、checker出力は分類根拠に使わない。

| class ID末尾 | 件数 | phase | conditionの刺激範囲 |
| --- | ---: | --- | --- |
| `934f9a42` | 4 | classify, correct | classify/correct。context側target_a.source.target_idまたはscopeの片方を既知のFOREIGN値に置換し、対応するactual new_classification fieldとの不一致を作る。sourceとnew_classificationの別々のactual pointerにsource_conflictが各1件。 |
| `46a9e405` | 2 | classify | classifyでactual/context original_classificationが双方{}またはUNKNOWN-PRIOR。new_classification prior ref/revisionはactual/context双方nullのままなので4 pointerでsource_unresolved。両側prior-unresolved findingsも保持する。 |
| `e3cc90c9` | 1 | correct | correct。actual側target_a.authority_stateをconflict_materialに置換し、context側current_materialとの不一致を作る。 |
| `fd9fdc4c` | 2 | classify | classifyでcontext original_classificationが{}またはUNKNOWN-PRIOR、actual original_classificationはnull。new_classification prior ref/revisionはactual/context双方nullのままなので4 pointerでsource_unresolved。context prior-unresolvedとactual mutationも保持する。 |
| `d90017bb` | 1 | correct | correct。actual側target_a.authority_stateをunresolvedに置換し、context側current_materialとの不一致を作る。 |
| `90008f72` | 2 | classify | classifyでactual original_classificationを{}またはUNKNOWN-PRIORに置換し、context original_classificationはnullのまま。prior-unresolvedとoriginal-classification mutationが併発する。 |
| `23ef1c04` | 2 | correct | correct。actual/context双方のtarget_a.authority_originを同じ未許可値（nullまたはunknown_origin）に置換し、両側pointerにauthority_origin_unresolvedを保持する。 |
| `952aa4ea` | 5 | correct | correct。actual側target_a.authority_originを許可enum内の非canonical値（issue/pr/ci/memory/management_recordのいずれか）に置換し、canonical_sourceとの不一致を作る。 |
| `6c5950a4` | 1 | classify | classifyでactual/context original_classificationが同じknown prior。new_classification prior ref/revisionはactual/context双方nullのままなので4 pointerでsource_unresolved。両側prior-present findingsも保持する。 |
| `a25767e2` | 3 | inspect, classify, correct | inspect/classify/correct。actual側target_a.source.source_digestをnull、current_material_claimをtrueへ置換し、L4のpromotion branchでsource_unresolvedとunresolved_promoted_to_currentを生じる。 |
| `e882d3d7` | 2 | correct | correct。actual/context双方のtarget_a.authority_stateを同じ未定義値（nullまたはunknown_state）に置換し、両側pointerにauthority_state_unresolvedを保持する。 |
| `3fca521c` | 4 | classify, correct | classify/correct。context側target_a.original_event.event_idまたはevent_revisionの片方を既知のFOREIGN値に置換。whole-event比較でoriginal_event_mutated、eventとnew_classificationの別々のactual pointerにsource_conflictが各1件。 |
| `667a158f` | 1 | classify | classify。actual/context双方のtarget_a.original_classificationに同一の既知prior objectを設定し、両側にfirst_classification_prior_presentを1件ずつ生じる。C0582では双方のnew_classification class/prior refとrevisionも同priorへ合わせる。 |
| `b10f277a` | 1 | classify | classifyでcontext original_classificationにknown prior、actual original_classificationはnull。new_classification prior ref/revisionはactual/context双方nullのままなので4 pointerでsource_unresolved。prior-presentとactual original-classification mutationも保持する。 |
| `a3d5c39b` | 2 | classify, correct | classify/correct。actual側target_a.new_classification.kindを許可値外の既知値FOREIGN-kindに置換し、classification_kind_unresolvedとsource_conflictを生じる。 |
| `c6473ae9` | 1 | correct | correct。actual側target_a.authority_stateをstale_materialに置換し、context側current_materialとの不一致を作る。 |
| `80e6f294` | 2 | classify, correct | classify/correct。actual側target_a.new_classification.kindをnullに置換し、classification_kind_unresolvedとsource_unresolvedを生じる。 |
| `c38a384a` | 1 | classify | classifyでactual original_classificationにknown priorを設定し、context original_classificationはnullのまま。prior-presentとoriginal-classification mutationが併発する。 |

元入力の人口は、既存2 event classへ75件、新規classへ37件、合計112件。既存29件の割当てを維持する。 C0577/C0580は全体conditionがviolationだが、選択されたclassification facetの局所stateはunknown（mutation findingはhistory/violation）である。#3927 head `5d541f69`で見つかった分類欠落は、C0574/C0575/C0577/C0578/C0580/C0581におけるactual/context new-classification prior ref/revisionのsource unresolved 4件である。C0573/C0576/C0579はcontext priorがnullなので該当comparisonをskipし、C0582はgiven.inputで両側のprior ref/revisionがknown一致する。
## Pin・bindingの影響

変更前にL4/L9をpinしていたbindingを全件確認した。SCF-B-0170はL4、SCF-B-0173/0175/0176はL4/L9のpinを新bytesに更新し、各noteに以前のhashと意味差分を残す。0175/0176がpinする0170のbinding hashも追随。新しい独立証拠bindingはSCF-B-0177。candidateでは`scfctl validate`と`scfctl stale`を実測する。

## 最新mainとの関係と残件

最新mainは`32ba19e67227c51d343831f22cea511b204ffc41`（fetchと`git ls-remote`一致）。候補commit `450eb6343837379ce6bd073dde6a4e2189e962d4`を隔離worktreeでno-commit trialし、競合なし、merge-base `4aa01e3`からmain/candidateのpath交差なし（候補16 path、main 14 path）。main単体からtrialへのcheck-child negative-4way failuresは136→226、L4/L9・L5/L8 pairはPASS、matched cases=460。trialのscfctlは166 bindings validate PASS/stale=0。静的validatorは20 class / 112 case linkをPASSし、L5/L8 bytes unchanged。freezeはbaseline/trialで同一report hash `cc4bd1a42fcde81c9b38c3d9f68af3531cab8a235811fb937e2a57f35d320003`、mechanical matchなし、pointer failures=2421、public function failures=8。候補の残件はverification-summary.jsonに記録した。

既存6 singleton-less classはL8/L9に形成しない: `OS015-NEG-source_unresolved-original_event`, `OS015-NEG-source_conflict-original_event`, `OS015-NEG-original_event_mutated`, `OS015-NEG-unresolved_promoted_to_current`, `OS015-NEG-first_classification_prior_present`, `OS015-NEG-first_classification_prior_unresolved`。L5/L8 pair projectionとL8 112 refsは未実施。negative-4wayのFAIL、checkerの同時省略検出限界、旧freezeの不一致を残件として記録し、全182件の完了・全体PASS・freeze成立とは呼ばない。

## 再現

```sh
python3 scaffold/research/wr181-os015-residual-l4-l9-20261030/build_projection.py
python3 scaffold/research/wr181-os015-residual-l4-l9-20261030/validate_projection.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

`build_projection.py`はmanifestの人手形成keyとcase割当てだけを文書へ反映し、L4 predicateを実行・再実装しない。`validate_projection.py`は原revisionとのpointer、集合、hash、期待値不変、pinを静的比較する。
