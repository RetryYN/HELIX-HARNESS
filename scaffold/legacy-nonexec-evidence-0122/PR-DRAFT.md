## 概要

旧資産台帳の `non_executable_read_only_source` 29件について、固定BASEのsource／history／failure／consumer／product候補／phase候補をasset別に静的照合する研究用Scaffold `SCF-B-0122` を追加します。

## 結果

- 台帳 selector に一致する29件を台帳順で全件収録し、source archive Git blob／byte／SHA／line anchorと現行保存先を照合。
- phase classification 29行、旧decision 58行、copy read-after 29行、ledger consumer refsをnested record完全一致で保持。
- 全母集団を218 product unit、153 source ID、Wave1–50の598 edge／355 unique asset、4,020 ledger rowとして固定。対象へのsemantic edgeは222行、representative linkは49行、candidate pool行は868行、direct legacy asset linkは0件。
- source保存、candidate product／phase、Wave semantic relation、representative asset、acceptance definitionを実装証拠へ昇格せず、旧実装／未実装／縮退／failure／現行実装／acceptance verdictをunknownまたは未確定のまま記録。
- `acceptance_cases.json` と `system_tests.json` は定義のみでverdictなし。failure／consumer監査sourceの直接asset/path一致は0件だが、これは不在の証明ではない。
- 旧archiveはGit objectの静的読取だけで、旧runtime／test／CIは実行していません。

## 検証

- `validate.py`: PASS（29件、98 input digest、source／target／history／Wave／crosswalk集合を固定BASEから再導出）
- `selfcheck.py`: PASS（23負例）
- `scfctl validate`: PASS（bindings=106 fail=0）
- `scfctl stale`: PASS（stale=0）
- `scfctl residuals`: PASS（residuals=0）
- `git diff --check`: PASS
- `#1813` は進捗参照のみ（closeしない）

## 境界

`SCF-B-0122` は正式なimplementation／degradation／unimplemented／acceptance／authority／successorを変更しません。candidateやsource preservationの証拠は、unit実装状態の直接証拠として扱いません。
