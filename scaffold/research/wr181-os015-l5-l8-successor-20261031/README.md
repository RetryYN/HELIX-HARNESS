# WR181 OS015 残112件 L5/L8 successor候補

## 対象と根拠

- 基点は#3927 M1 correction head `5e7286c6def741df3f8abfabdb1f2058eaaedd07`。C0577/C0580はoverall violation、classification局所state unknownへ修正済み。先行L5/L8候補`0b3573b7845381d1ab33e7efaf883c2644b8430a`へM1をmergeし、同じ分類keyをL5/L8へ反映した。
- 対象はHELIX-OS OS015のL5/L8 pair。L5は既存33 failure rulesを保持して18 composite rule rowsを追加し、L8は既存27 class rowsを保持して18 class rowsを追加する。
- 追加caseは既存2 classの残75件と補正後18 classの37件、計112件。L8基点の460 class linksへ112 linksを追加する。先行29 composite linksは460件に含まれ、変更しない。
- class keyはL4/L7独立auditのmanifestを入力とし、L5 `formal_reference.composite_class_formation` のordered-code保持、既存failure ruleへのowner join、`input_boundary`を照合してL5 rowsへ形成した。L8では既存unit caseのcase IDとraw input sourceを結び、L7 `given.input`のbase/replacements/hashを確認してL5 class/rule/function refsを付けた。
- L7 `expected_proposal`、L8 case `expected`、L9 class row／case `expected`をclass形成のoracleにしていない。L8の全583件で既存`condition`、`expected`、`expected_preserved`を0dd基点から保持する。

## C0573–C0582 correctionの反映

6 affected caseのclass keyはL4 algorithm/L7 raw input correction auditに合わせた。source unresolvedは次の4 occurrenceを順に保持する。

1. context `prior_classification_ref`
2. context `prior_classification_revision`
3. actual `prior_classification_ref`
4. actual `prior_classification_revision`

C0574/C0575はprior-present findings、C0577/C0580とC0578/C0581はprior-unresolved findingsを保持する。C0574/C0575はoverall violation・classification/violation、C0577/C0580はoverall violation・classification/unknown、C0578/C0581はoverall unknown・classification/unknown。C0577/C0580では`original_classification_mutated`がhistory/violationだが、選択されたclassification facet内の所見はunknownである。L8の元case expectedは変更しない。

## 保持した境界

- L5/L8ともL4/L9 pair pinは#3927 merge済みmain `2e5ef018a89898bede25c8aa280ce61fe4ee5104` のpath bytesを固定する。L8 `candidate_l5_bytes`は最新pair pinを含むL5 successor commit `e60ab113dc8d2018a8fd48680bdccf5ac0254b1a`とそのpath hashを固定する。
- L8 case rowsの条件・期待・expected_preserved、および先行29 linksは不変。追加112件で変えるのはraw `given.input` pointer、`negative_class_ref`、`rule_ref`、`function_ref`だけ。
- 6 singleton-less classesはL4/L5には残し、L8に形成しない。対象は`OS015-NEG-source_unresolved-original_event`、`OS015-NEG-source_conflict-original_event`、`OS015-NEG-original_event_mutated`、`OS015-NEG-unresolved_promoted_to_current`、`OS015-NEG-first_classification_prior_present`、`OS015-NEG-first_classification_prior_unresolved`。L8/L9での対応未形成によりchildは24 class mismatchでFAILし、freezeも成立しない。
- #3927のcorrected classificationはmainへmerge済み。successor候補は未push・未PR。

## 静的確認

`build_successor.py`は文書投影のみ行い、L4 predicate、product runtime、test、CIを実行しない。`validate_successor.py`はL5/L8のsource pointer、L5 owner join、L7 raw input hash、全583 case expected preservation、29 prior links、112新規links、6 singleton-less class、candidate pinを確認する。validatorはL9文書をロードしない。

再現コマンド:

```sh
python3 scaffold/research/wr181-os015-l5-l8-successor-20261031/validate_successor.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

checker結果とfreeze比較は`verification-summary.json`、現候補の静的検証報告は`static-validation.json`に記録する。
