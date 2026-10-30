# WR244 SEC006 比較後の分類追補

本追補はPR #3987 R1 F1と後続の割当整合性検収を記録する。R2 F1/F2の訂正は`r2-review-corrections.json`に追補し、固定済みの`post-comparison-derivation.json`にある旧説明より優先する。固定blindは`scaffold/research/wr244-sec006-psi-l4l9-20261031/blind-source-only.json`（SHA-256 `14b28cc8a9e4cee9727d458a6e7fbe175c02a46fed06a5fa57bacb983edd4e22`、#3510 comment 6534222680）。元のblind copy、`comparison.json`、`l9-assignment-audit.json`、`verification-summary.json`は変更していない。

## 先例とsource-first導出

WR230（PR #3973、`scaffold/research/wr230-sec009-l4-l9-compact-candidate-20261031/README.md`）のmarkerなし方式に沿って、L4 top-level `failure_classifications`をtaxonomyとして保持し、contract-local `negative_classifications`は別形式のcasewise projectionとして記録した。nested rowは`code/change/axis/state/backflow_owner/expected/expected_preserved/expected_side_effect_count/source_pointers/expected_text`だけを持ち、top-levelの`class_id/design_ref`を複製しない。contractの`negative_class_refs`は各top-level classの親を逆参照する。L9 `negative_class_assignment`は該当nested projectionとsource/input pointersを示す。#3980 R1 F2/F3に沿い、上流meaningと実在multi-finding residualを保持する。

分類の意味、condition、axis、state、owner、preserved fieldsと入力への割当は、固定blind候補、L3/L10/L4の規則とcounterexample inputから導出した。finding codeの綴りは別の来歴を持つ。`asset_scope_conflict`、`scope_identity_unresolved`、`implicit_fallback`、`operation_scope_conflict`、`explicit_connection_absent`、`connection_content_conflict`、`connection_material_unresolved`の7語は既存L9のleaf vocabularyを採用し、`tenant_invented`と`tenant_applicability_unresolved`の2語は既存L4語を採用した。R2 review確認のとおり、先の7語はbase revisionのL3/L10/L4と固定blindには現れない。L9 expectedはmeaningやconditionの導出に使わず、割当後の整合性照合だけに使った。identity conflictはL3 F01のasset-to-scope bindingとL4 F01の既知identity相反、identity missingは不足をfallback補完しないsource meaningから導いた。foreign latestもcurrent scopeのasset contradictionとして既存の`asset_scope_conflict` leafを採用し、class/axisは別のまま維持する。connection revision mismatchはL4 F02のactual/expected member完全比較からmeaningを導き、code spellingには`connection_content_conflict`を採用した。known absentは`isolation_violation` / `explicit_connection_absent`、unknownは`scope_unresolved` / `connection_material_unresolved`として区別する。共有leafの一意化規則と根拠pointerは`post-comparison-derivation.json`に記録した。

2件のtenant欠落では、L9 oracleのtenant_dispositionは使わず、counterexample inputの独立contextにあるnon-empty `expected_target.tenant` / `expected_origin.tenant`とL4 F01を照合した。独立expected tenant identityがあるのでapplicable tenantとして扱い、request側のnullをscope identity missingへ割り当てた。applicability未知の3件は別の`tenant_applicability_unresolved` classに残した。

## 一致性と残件

初回の整合性検査では73件が不一致だった。中間状態として31割当・67未割当とし、その内訳と理由を記録した。その後、AIがL4のfailure meaning/conditionと入力への割当を上流meaningとinputから再導出し、L9 expectedを変更せず、98単一finding case全てにsource-derived assignmentを付けた。finding codeの7綴りは既存L9語、2綴りは既存L4語である。全98件でtop-levelからnestedへの`condition/code/axis/state/backflow_owner/expected/preserved/side-effect/source_pointers`投影を検証し、L9 `expected_observation.condition`、ordered `findings[].code`、各finding `return_owner`とも一致することを静的確認した。R2 F2ではknown absentのrequested operationを「未解決」とせず、requested operationとknown absentを保持するようtop-level/nested/derivationを訂正した。`design_verification_checker.py`はdual-definition/parent-link errorを出さず、予定どおりlegacy four-way FAIL 162を報告する。

16件の`multi_contract_residual`は変更していない。実在する13複数finding（2 finding 12件、3 finding 1件）もcase memberへ昇格せず、singleton分解や期待変更をしていない。

## 境界と検証

checkerはQA §3 `legacy_casewise_four_layer`の中間FAILを維持する。L4/L9 pair、L5/L8 pairはpass。countsはL4=10、L9=98、L8=52、L5=0、matched=0、failures=162。`scfctl validate`は185件・失敗0、`stale=0`。認証/認可設定、credentials、本番動作は変更せず、L4 algorithm、runtime、test、CI、旧CLI/hookは実行していない。
