# WR181 OS015 PR-C: L9 source pointer追記候補

## 対象と境界

- PR class: `design_verification`
- 対象pair: HELIX-OS OS015 L4/L9
- 基点: PR-B merge `2d7cabb70861f4cc40d4d2e850d35c6b09083034`
- PR-A merge ancestor: `36947baf69999c99d5370d804d69ee2f3acaed72`
- PR-CはL9の既存2 composite class rowに、対応するL5 `failure_rules` へのsource pointerを各1件追記する。
- L4/L5/L7/L8、L9のcase rows、既存583件の期待・case linkは変更しない。
- PR-Aで形成した29件（C0045–C0061、C0102–C0113）・2 classをPR-A/B/Cで順方向に接続する。C0044を含むL9残り112件と6 singleton-less classは未形成のまま扱う。

| L9 class | L5 source pointer |
| --- | --- |
| `OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4` | `/failure_rules/31` |
| `OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5` | `/failure_rules/32` |

L9 class rowの既存source pointersと期待は維持する。PR-Cの変更でnegative-4way checker結果やfreeze成立を主張しない。checkerはL9 `source_pointers` を検査しないため、今回の静的検証は実在するL5 pointer、前段の29件link、既存期待不変を個別に確認する。

## 再現

```sh
python3 scaffold/research/wr181-os015-pr-c-l9-pointers-20261030/validate_prc_l9_pointers.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

実測revision、check-child/check-freezeの前後結果、scaffold binding件数、最新mainとの試行merge結果は`verification-summary.json`に記録する。PR-A/PR-Bはそれぞれのmerge時点を記録した先行evidenceであり、PR-CはL9 pointer追記の後続記録である。
