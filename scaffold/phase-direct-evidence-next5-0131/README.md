# SCF-B-0131 direct phase evidence next 5 unit research

`SCF-B-0105`のheld30から順序上の次5 unit（HELIX-OS 5）を、固定BASEの旧IR原文、Wave1〜50、旧assetのsource／history／decision／read-after／failure／consumer、PHCAP-01〜20、四製品L1へ静的に照合するresearch-only Scaffoldである。正式phase、product authority、実装、未実装、縮退、consumer closureは生成しない。

既存束との関係は、FR20・FR24・FR31が`SCF-B-0119`、FR21・FR23が`SCF-B-0116`（#2068）とID重複する。既存成果物をoracleやauthorityにせず、5 unitを固定BASEから独立再導出し、今回の直接phase根拠・候補参照・反証・不足を追加する追補researchとした。formal unitやauthorityは重複生成しない。

taxonomyの入力はimmutable source `78e23a622bc9c40183269e22a59c566d22b93435:scaffold/phase-status-taxonomy-0105/units.jsonl`である。SHA-256は`e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、Git blob OIDは`c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`。対象statusは`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW` 3件、`CROSS_CUTTING_PHASE_REVIEW_PENDING` 2件で、いずれも未解決のまま保持する。

各unitは次を分離して記録する。

- `taxonomy_alignment`: status、matrix rule、candidate statement、required evidence、judgment waiting、formal phase null、authority boundary。
- `source_anchor`／`semantic_review_edges`: 旧IR原文のJSON pointer・line anchor・semantic digestとWave edge。asset／Waveのphase targetsは候補であり、直接phase根拠やauthorityではない。
- `old_asset_evidence`: 旧asset source／history／decision／read-after／failure／consumer partition。旧sourceの存在は実装成立を示さない。
- `implementation_evidence`／`degradation_evidence`／`failure_evidence`／`consumer_evidence`: unknown、unknown、unknown、pendingを保持する。
- `phase_review`／`product_review`: 全PHCAP-01〜20境界を`pending_all_20`、phase非適用を`not_proven`、product authorityをnullとして保持する。
- `phase_candidate_evidence`: unitごとに候補phase、参照asset／Wave edge、直接責務が未証明である理由、反証、不足を分離する。

## unit別の静的判定

| unit | taxonomy status | IR anchor | candidate phase targets（候補） | 直接phase根拠 | 主な不足 |
| --- | --- | --- | --- | --- | --- |
| IRUNIT-HIL-FR-20-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2243–2285 | PHCAP-04、05、07、11、16〜20 | 0 | Screen Gateのartifact／skip責務とcurrent contract |
| IRUNIT-HIL-FR-21-HELIX-OS | CROSS_CUTTING_PHASE_REVIEW_PENDING | 2286–2328 | PHCAP-11、16〜20 | 0 | Snapshot custody／ref authorityと全PHCAP境界 |
| IRUNIT-HIL-FR-23-HELIX-OS | CROSS_CUTTING_PHASE_REVIEW_PENDING | 2372–2414 | PHCAP-06、16〜20 | 0 | Connector運用責務とcredential／enable receipt境界 |
| IRUNIT-HIL-FR-24-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2415–2457 | PHCAP-02、10、16〜20 | 0 | Ingestion snapshot／mapping責務とcurrent contract |
| IRUNIT-HIL-FR-31-HELIX-OS | UNRESOLVED_SOURCE_OR_HUMAN_REVIEW | 2716–2758 | PHCAP-16〜20 | 0 | Re-entryのstale／re-freeze責務とphase authority |

候補targetsは旧asset classification／Waveの静的候補参照であり、原文責務主語からの直接phase証拠ではない。5件ともphase非適用`not_proven`、formal phase nullを維持する。

## 分母と成果物

- 5 units（OS 5）、Wave scan 598行、semantic edge 15件、旧asset 11件。decision/read-afterはunit×asset pair基準で各5件、unique asset基準では各1/11件（`LEGACY-ASSET-A60CF91DD2AF6693E6F9`のみ）として別集計する。
- `inventory.json`: 固定BASE、taxonomy immutable source、入力digest、混在statusの分母、authority境界、負例コード。
- `evidence.jsonl`: 5 unitsの原文anchor、Wave edge、旧asset partition、実装／縮退／failure／consumerの未解決状態、phase候補、判断待ち。
- `generate.py`: 固定BASE Git object bytesとimmutable taxonomy sourceから再生成する。
- `validate.py`: `generate.py`をimportせず、固定BASEとtaxonomy sourceから独立再導出し、全fieldをfail-closed比較する。
- `selfcheck.py`: 37負例でschema、Binding、BASE、入力digest、unit／edge／asset、taxonomy set/status/matrix join/authority boundary、各partition、pair／unique asset集計、phase／product境界を検証する。
- `PR-DRAFT.md`: Draft PR本文。

## 検証

```text
python3 -B scaffold/phase-direct-evidence-next5-0131/generate.py
python3 -B scaffold/phase-direct-evidence-next5-0131/validate.py
python3 -B scaffold/phase-direct-evidence-next5-0131/selfcheck.py
python3 -m py_compile scaffold/phase-direct-evidence-next5-0131/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff origin/main...HEAD --check
```

旧archiveのsource／test／runtime／hook／CIは実行していない。正式crosswalk、PHCAP、phase／product authority、実装、未実装判定、縮退判定、consumer closure、merge、closeは変更しない。
