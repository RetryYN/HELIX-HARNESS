# WR181 OS015 PR-B: L5/L8限定候補

## PR区分と対象

- PR class: `design_verification`
- 対象V-pair: HELIX-OS OS015 L5/L8
- 基点: main `97e0ee18a98d6f9714e29fa0fae3a3c58cdeead1`
- PR-A merge: `36947baf69999c99d5370d804d69ee2f3acaed72`
- 最新mainの1d12→97e0差分はsecurity L8だけであり、本対象4文書とbindingに重なりがないことを確認した。候補は97e0上でL5/L8を順に再適用し、pair pinsと祖先pinを再検証した。
- 期待値不変性の比較基準は1d12。L8文書のbase hashは97e0でも同一。
- この候補はL5へ2件のcomposite failure rule、L8へ2 classと29件のcase linkを追加する。L9は変更しない。

PR-Aで形成されたL4/L9を前提とし、L5の`source_pair_pins`はPR-A merge revisionのL4/L9各path bytesをpinする。L5をcommitした後にL8をcommitし、L8の`candidate_l5_bytes`は到達可能なL5 commit `d0b9aadf37a53a182bf6188495771c17fd06e16c` と、その時点のL5 bytes hashを指す。L8のpair pinsもPR-A mergeのL4/L9を指す。L9へのL5 `/failure_rules/31`・`/failure_rules/32` source pointer追記はPR-Cの残件とする。

## 形成したL5/L8内容

L5既存31 rulesとL8既存25 classesを保ち、それぞれに2 composite classを追加した。ID・finding順・axis/state・ownerはL4/L5/L8間で対応する。L8ではC0045–C0061とC0102–C0113の29件だけに`l7_material_ref`、`negative_class_ref`、`rule_ref`、`function_ref`を追加した。割当15件はknown conflict class、14件はunknown operand class。

既存L8 583行の`condition`、`expected`、`expected_preserved`は全件不変で、他の変更行は29件のcase link fieldに限る。case/classの手動根拠とL7 fixed input hashはPR-Aの[`case-evidence.json`](../wr181-os015-pr-a-l4-l9-20261030/case-evidence.json)に保持される。今回のvalidatorはその記録とL8 linkを静的に照合し、raw inputからfindingやclassを計算しない。

## 未完了範囲

- L8ではC0044を含む112件が未割当。
- 6つのsingleton-less classはL8/L9に形成されていない。checkerは各layerでclass key/class rowの不一致を報告する。
- PR-CでL9の2 composite class rowへL5 rule pointerを追加する。
- negative-4wayはPASSではない。checkerはこの候補でもFAILを返す。全182件の完了、freeze成立、全体PASSは主張しない。

## 再現

```sh
python3 scaffold/research/wr181-os015-pr-b-l5-l8-20261030/validate_static_projection.py
python3 scaffold/research/wr181-os015-pr-a-l4-l9-20261030/validate_static_evidence.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

静的照合はPASS、L4/L9 pair・L5/L8 pairはcheck-childでPASS。negative-4wayは136 failureでFAIL: L8未割当case 112件と、6 class不在によるL8/L9各12件のclass mismatchが残る。既存freezeは候補前後ともmechanical FAILで、変更していない。scfctlの最終件数とstaleは`verification-summary.json`を参照。

旧HELIX CLI/runtime/test/CI、新世代CI、product runtime、testは実行していない。
