# Draft PR

## Title

research: cross-cutting phase review for 20 unresolved units (SCF-B-0116)

## 目的

#2058で`CROSS_CUTTING_PHASE_REVIEW_PENDING`として保留した20 unit（HELIX-OS 15、HELIX-HARNESS 5）について、旧HELIX source／decision／failure／consumer証拠とPHCAP-01〜20境界を固定BASEから静的に分離する。#2058のformal crosswalk、phase authority、product authorityは変更しない。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e`の原文anchor、Wave1〜50の598 scan row／40対象edge、旧asset 22件を固定。
- 旧asset source／history／decision／read-after／failure／consumerを別partitionに保持し、実装成立、縮退、failure receipt、consumer closure、未実装断定を生成しない。
- 各unitについてasset／Wave由来のphase candidate targetsを候補として記録し、直接phase evidenceは0件、phase非適用は`not_proven`、全PHCAP-01〜20境界はhuman review pendingとした。
- product scope候補とformal product authority、current contextとimplementation／acceptance／operationを分離した。
- validatorはgeneratorをimportせず固定BASEから独立再導出する。generatorのphase候補／phase非適用／authority改竄後の再生成も拒否する。
- Binding `SCF-B-0116`へ全成果物を登録する。

## 検証

- `generate.py`: 20 units、40 edges、22 old assets、598 scan rows
- `validate.py`: PASS（20 units、40 edges、22 assets; phase/NA unresolved）
- `selfcheck.py`: PASS（23 negative cases、期待error code照合）
- `py_compile`: PASS
- `scfctl validate`: PASS
- `scfctl stale`: PASS
- `scfctl residuals`: PASS
- `git diff origin/main...HEAD --check`: PASS

## 境界

20 unitはformal unresolvedのままである。candidate phase targetsはasset検索候補であり、直接phase所属を示さない。全PHCAP境界を除外する直接証拠がないためphase非適用も確定しない。旧archive実行、formal authority変更、merge、closeは行わない。

Progress reference: #2058（Closes指定なし）
