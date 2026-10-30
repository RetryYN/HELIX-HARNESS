# WR244 SEC006 比較後の分類追補

本追補はPR #3987 R1 F1と後続の割当整合性検収を記録する。固定blindは`scaffold/research/wr244-sec006-psi-l4l9-20261031/blind-source-only.json`（SHA-256 `14b28cc8a9e4cee9727d458a6e7fbe175c02a46fed06a5fa57bacb983edd4e22`、#3510 comment 6534222680）。元のblind copy、`comparison.json`、`l9-assignment-audit.json`、`verification-summary.json`は変更していない。

## 先例とsource-first導出

WR230（PR #3973、`scaffold/research/wr230-sec009-l4-l9-compact-candidate-20261031/README.md`）のmarkerなし方式に沿って、L4 top-level `failure_classifications`をtaxonomyとして保持し、contract-local `negative_classifications`は別形式のcasewise projectionとして記録した。nested rowは`code/change/axis/state/backflow_owner/expected/expected_preserved/expected_side_effect_count/source_pointers/expected_text`だけを持ち、top-levelの`class_id/design_ref`を複製しない。contractの`negative_class_refs`は各top-level classの親を逆参照する。L9 `negative_class_assignment`は該当nested projectionとsource/input pointersを示す。#3980 R1 F2/F3に沿い、上流meaningと実在multi-finding residualを保持する。

分類codeは、固定blind候補の意味から始め、L3/L10/L4の規則、counterexample input、L4の設計codeの順に導出した。既存L9 expectedは最後の整合性確認だけに使い、設計codeの根拠にはしていない。identity conflictはL3 F01のasset-to-scope bindingとL4 F01の既知identity相反から`asset_scope_conflict`、identity missingは不足をfallback補完せず`scope_identity_unresolved`とした。foreign latestもcurrent scopeのasset contradictionとして同じ`asset_scope_conflict` leafを再利用し、class/axisは別のまま維持する。connection revision mismatchはL4 F02のactual/expected member完全比較から`connection_content_conflict`。known absentは`isolation_violation` / `explicit_connection_absent`、unknownは`scope_unresolved` / `connection_material_unresolved`として区別する。共有leafの一意化規則と根拠pointerは`post-comparison-derivation.json`に記録した。

2件のtenant欠落では、L9 oracleのtenant_dispositionは使わず、counterexample inputの独立contextにあるnon-empty `expected_target.tenant` / `expected_origin.tenant`とL4 F01を照合した。独立expected tenant identityがあるのでapplicable tenantとして扱い、request側のnullをscope identity missingへ割り当てた。applicability未知の3件は別の`tenant_applicability_unresolved` classに残した。

## 一致性と残件

初回の整合性検査では73件が不一致だった。中間状態として31割当・67未割当とし、その内訳と理由を記録した。その後、AIがL4の診断codeを上流meaningとinputから再設計し、L9 expectedを変更せず、98単一finding case全てにsource-derived assignmentを付けた。全98件でtop-levelからnestedへの`condition/code/axis/state/backflow_owner/expected/preserved/side-effect/source_pointers`投影を検証し、L9 `expected_observation.condition`、ordered `findings[].code`、各finding `return_owner`とも一致することを静的確認した。`design_verification_checker.py`はdual-definition/parent-link errorを出さず、予定どおりlegacy four-way FAIL 162を報告する。

16件の`multi_contract_residual`は変更していない。実在する13複数finding（2 finding 12件、3 finding 1件）もcase memberへ昇格せず、singleton分解や期待変更をしていない。

## 境界と検証

checkerはQA §3 `legacy_casewise_four_layer`の中間FAILを維持する。L4/L9 pair、L5/L8 pairはpass。countsはL4=10、L9=98、L8=52、L5=0、matched=0、failures=162。`scfctl validate`は185件・失敗0、`stale=0`。認証/認可設定、credentials、本番動作は変更せず、L4 algorithm、runtime、test、CI、旧CLI/hookは実行していない。
