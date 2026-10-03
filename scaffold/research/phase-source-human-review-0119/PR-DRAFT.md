# Draft PR

## Title

research: source and human decision pending review for 10 units (SCF-B-0119)

## 目的

`SCF-B-0105`の`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW` 10 unitについて、旧IR原文、Wave1〜50、旧assetのsource／history／decision／read-after／failure／consumer、PHCAP-01〜20、四製品L1を固定BASEから静的に照合する。#2068の20 unitとは重複せず、正式phase／product authority、実装成立、未実装、縮退、consumer closureを生成しない。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e`から、10 unitの原文anchor、Wave1〜50の598 scan row／26対象edge、旧asset 17件を固定。
- taxonomy immutable source `78e23a622bc9c40183269e22a59c566d22b93435:scaffold/phase-status-taxonomy-0105/units.jsonl`（SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、blob OID `c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`）を照合し、10 unitのstatus、matrix rule、candidate statement、required evidence、judgment waiting、formal phase null、authority boundaryを保持する。固定taxonomy commitのHEAD祖先性、blob OID、snapshot digestも固定する。
- 旧asset source／history／decision／read-after／failure／consumerを別partitionに保持する。implementation／degradation／failureはunknown、consumer closureはpendingであり、未実装・縮退・failureの確定を行わない。
- asset／Wave由来のphase candidate targetsを候補として記録し、direct phase evidenceは0件、phase非適用は`not_proven`、全PHCAP-01〜20境界は保留する。
- Binding `SCF-B-0119`へ全成果物を登録する。

## 検証

- `generate.py`: 10 units、26 edges、17 old assets、598 scan rows
- `validate.py`: PASS（10 units、26 edges、17 assets; source/human unresolved）
- `selfcheck.py`: PASS（32 negative cases、taxonomy set/status/matrix join/authority boundary、孤立commit本文改竄再生成を含む期待error code照合）
- `py_compile`: PASS
- `scfctl validate`: PASS
- `scfctl stale`: PASS
- `scfctl residuals`: PASS
- `git diff origin/main...HEAD --check`: PASS

## 境界

10 unitは`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW`のままである。候補phaseは正式phaseではなく、追加sourceとhuman判断を待つ。旧archive実行、正式authority変更、要求採否、実装、未実装断定、縮退断定、merge、closeは行わない。

Progress reference: #2058（Closes指定なし）
