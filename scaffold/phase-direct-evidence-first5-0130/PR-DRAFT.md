# Draft PR

## Title

research: source and human decision pending review for 5 units (SCF-B-0130)

## 目的

`SCF-B-0105`の`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW` 5 unitsについて、旧IR原文、Wave1〜50、旧assetのsource／history／decision／read-after／failure／consumer、PHCAP-01〜20、四製品L1を固定BASEから静的に照合する。#2068の20 unitとは重複せず、正式phase／product authority、実装成立、未実装、縮退、consumer closureを生成しない。

対象は既存`SCF-B-0119`の10-unit source／human partitionと一部重なるが、0119の成果物をoracleにせず、先頭5 unitを固定BASEから独立再導出する追補である。unit別のphase候補根拠・反証・直接phase証拠不足を追加し、formal unit／authorityの重複生成はしない。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e`から、5 unitsの原文anchor、Wave1〜50の598 scan row／13対象edge、旧asset 9件を固定。
- taxonomy immutable source `78e23a622bc9c40183269e22a59c566d22b93435:scaffold/phase-status-taxonomy-0105/units.jsonl`（SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、blob OID `c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`）を照合し、5 unitsのstatus、matrix rule、candidate statement、required evidence、judgment waiting、formal phase null、authority boundaryを保持する。固定taxonomy commitのHEAD祖先性、blob OID、snapshot digestも固定する。
- 旧asset source／history／decision／read-after／failure／consumerを別partitionに保持する。implementation／degradation／failureはunknown、consumer closureはpendingであり、未実装・縮退・failureの確定を行わない。
- asset／Wave由来のphase candidate targetsを候補として記録し、direct phase evidenceは0件、phase非適用は`not_proven`、全PHCAP-01〜20境界は保留する。
- Binding `SCF-B-0130`へ全成果物を登録する。
- decision/read-afterの分母をunit×asset pairとunique assetへ分離し、pairは各5件、uniqueは各1/9件（`LEGACY-ASSET-A60CF91DD2AF6693E6F9`のみ）としてinventory／validator／selfcheck／Bindingへ固定する。

## unit別の結果

| unit | IR anchor | phase候補（candidate only） | 直接phase根拠 | 不足／判断待ち |
| --- | --- | --- | --- | --- |
| IRUNIT-HIL-BR-14-HELIX-OS | 561–603 | PHCAP-16〜20 | 0 | ref authority receipt、product／consumer判断 |
| IRUNIT-HIL-BR-24-HELIX-OS | 991–1033 | PHCAP-16〜20 | 0 | 要求定義契約、PHCAP-02〜07境界、authority判断 |
| IRUNIT-HIL-FR-17-HELIX-OS | 2114–2156 | PHCAP-16〜20 | 0 | skip／reentry continuation契約、phase／consumer判断 |
| IRUNIT-HIL-FR-18-HELIX-OS | 2157–2199 | PHCAP-01、06、16〜20 | 0 | Prototype Builderのartifact／state replay責務境界 |
| IRUNIT-HIL-FR-19-HELIX-HARNESS | 2200–2242 | PHCAP-15〜20 | 0 | walkthrough責務境界、L1反映先authority、consumer判断 |

候補targetsは旧asset／Waveの静的参照であり、formal phaseではない。5件とも直接phase証拠0、phase非適用`not_proven`、formal phase nullを維持する。

## 検証

- `generate.py`: 5 units、13 edges、9 old assets、598 scan rows
- `validate.py`: PASS（5 units、13 edges、9 assets; source/human unresolved）
- `selfcheck.py`: PASS（37 negative cases、pair／unique asset集計、taxonomy set/status/matrix join/authority boundary、孤立commit本文改竄再生成を含む期待error code照合）
- `py_compile`: PASS
- `scfctl validate`: PASS
- `scfctl stale`: PASS
- `scfctl residuals`: PASS
- `git diff origin/main...HEAD --check`: PASS

## 境界

5 unitsは`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW`のままである。候補phaseは正式phaseではなく、追加sourceとhuman判断を待つ。旧archive実行、正式authority変更、要求採否、実装、未実装断定、縮退断定、merge、closeは行わない。

Progress reference: #2058（Closes指定なし）
