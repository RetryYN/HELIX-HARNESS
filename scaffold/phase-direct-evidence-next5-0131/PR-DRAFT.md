# Draft PR

## Title

research: record direct phase evidence gaps for next five held units (SCF-B-0131)

## 目的

`SCF-B-0105`のheld30から順序上の次5 unit（FR20、FR21、FR23、FR24、FR31）について、旧IR原文、Wave1〜50、旧assetのsource／history／decision／read-after／failure／consumer、PHCAP-01〜20、四製品L1を固定BASEから静的に照合する。既存SCF-B-0119（FR20／FR24／FR31）およびSCF-B-0116/#2068（FR21／FR23）とIDは重なるが、既存成果物をoracleにせず独立再導出する。正式phase／product authority、実装成立、未実装、縮退、consumer closureは生成しない。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e`から、5 unitsの原文anchor、Wave1〜50の598 scan row／15対象edge、旧asset 11件を固定。
- taxonomy immutable source `78e23a622bc9c40183269e22a59c566d22b93435:scaffold/phase-status-taxonomy-0105/units.jsonl`（SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、blob OID `c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`）を照合する。対象statusはUNRESOLVED_SOURCE_OR_HUMAN_REVIEW 3件、CROSS_CUTTING_PHASE_REVIEW_PENDING 2件で、全件未解決のまま保持する。
- 旧asset source／history／decision／read-after／failure／consumerを別partitionに保持する。implementation／degradation／failureはunknown、consumer closureはpendingであり、未実装・縮退・failureの確定を行わない。
- asset／Wave由来のphase candidate targetsを候補として記録し、direct phase evidenceは0/5、phase非適用は`not_proven`、全PHCAP-01〜20境界は保留する。
- Binding `SCF-B-0131`へ全9成果物を登録する。

## unit別の結果

| unit | taxonomy status | IR anchor | phase候補（candidate only） | 直接phase根拠 | 不足／判断待ち |
| --- | --- | --- | --- | --- | --- |
| IRUNIT-HIL-FR-20-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2243–2285 | PHCAP-04、05、07、11、16〜20 | 0 | Screen Gateのartifact／skip責務とcurrent contract |
| IRUNIT-HIL-FR-21-HELIX-OS | CROSS_CUTTING_PHASE_REVIEW_PENDING | 2286–2328 | PHCAP-11、16〜20 | 0 | Snapshot custody／ref authorityと全PHCAP境界 |
| IRUNIT-HIL-FR-23-HELIX-OS | CROSS_CUTTING_PHASE_REVIEW_PENDING | 2372–2414 | PHCAP-06、16〜20 | 0 | Connector運用責務とcredential／enable receipt境界 |
| IRUNIT-HIL-FR-24-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2415–2457 | PHCAP-02、10、16〜20 | 0 | Ingestion snapshot／mapping責務とcurrent contract |
| IRUNIT-HIL-FR-31-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2716–2758 | PHCAP-16〜20 | 0 | Re-entryのstale／re-freeze責務とphase authority |

候補targetsは旧asset／Waveの静的参照であり、formal phaseではない。5件とも直接phase証拠0、phase非適用`not_proven`、formal phase nullを維持する。

## 検証

- `generate.py`: 5 units、15 edges、11 old assets、598 scan rows
- `validate.py`: PASS（5 units、15 edges、11 assets; direct phase evidence unresolved）
- `selfcheck.py`: PASS（33 negative cases、taxonomy set/status/matrix join/authority boundary、孤立commit本文改竄再生成を含む期待error code照合）
- `py_compile`: PASS
- `scfctl validate`: PASS
- `scfctl stale`: PASS
- `scfctl residuals`: PASS
- `git diff origin/main...HEAD --check`: PASS

## 境界

5 unitsはtaxonomy status別の未解決状態のままである。候補phaseは正式phaseではなく、追加sourceとhuman判断を待つ。旧archive実行、正式authority変更、要求採否、実装、未実装断定、縮退断定、merge、closeは行わない。

Progress reference: #2058（Closes指定なし）
