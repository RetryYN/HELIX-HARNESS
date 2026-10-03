# SCF-B-0116 横断制約20 unit phase review研究

#2058で`CROSS_CUTTING_PHASE_REVIEW_PENDING`として保留した20 unit（HELIX-OS 15、HELIX-HARNESS 5）について、旧HELIX原文、Wave1〜50、旧assetのsource／history／decision／failure／consumerとPHCAP-01〜20境界を固定BASEから静的に照合するresearch-only Scaffoldである。#2058のformal crosswalk、phase authority、product authorityは変更しない。

このbundleのphase判断は、次の3つを分離して保持する。

- `candidate_phase_targets`: 旧asset／Wave edgeに記録された検索候補。phase authorityではない。
- `direct_phase_evidence`: unit原文からPHCAP機構を直接要求する証拠。対象20 unitでは0件のまま保持する。
- `phase_nonapplicability`: 全PHCAP-01〜20の直接責務を除外する証拠。`status=not_proven`、`direct_exclusion_evidence=[]`であり、PHCAP-20不在だけからphase非適用を導かない。

したがって20 unitは全件`CROSS_CUTTING_PHASE_REVIEW_PENDING`で、formal phase candidateは`null`、product authorityは未設定、human判断点と追加source待ちを残す。Waveのcandidate phase、旧source存在、decision／read-after、failure／consumer参照から実装成立、縮退、failure、consumer closure、未実装、phase非適用、phase authorityを生成しない。

## 分母と証拠

- 20 unit（OS 15／HARNESS 5）、Wave1〜50全598 scan row、対象40 semantic edge、旧asset 22件。
- 旧asset source 22件をBASE archive blob／declared SHA／archive SHA／Git blobへ固定。
- 旧asset historyはdisposition／classification、decisionとread-afterはBASE ledgerの存在または`absent_at_base`、failureはcoverage／counterevidence／unresolved、consumerはledger／edge refsとして別partition化。
- IR原文20件はJSON pointer、line range、span digest、statement digest、decomposition spanを保持。
- PHCAP inventory、PHCAP-20定義、四製品L1、product boundary、入口・旧資産再利用規則はcontext-onlyとして入力digestを固定。

## 成果物

- `inventory.json`: 固定BASE、73入力digest、分母、全PHCAP境界保留、authority境界、taxonomy commitの`required_ancestor`、負例コード。
- taxonomy入力として、#2058統合時点のimmutable commit `48a91dd1a8fcadf9687c698ae3c8a5df0df974fa`にある`scaffold/phase-status-taxonomy-0105/units.jsonl`（SHA-256 `e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`）を固定し、30行中statusが`CROSS_CUTTING_PHASE_REVIEW_PENDING`の20 ID、`formal_phase_candidate=null`、authority boundaryを独立照合する。snapshot bytesは同ディレクトリの`phase-status-taxonomy-0105.units.jsonl`に保存する。
- `evidence.jsonl`: unit別の原文anchor、Wave edge、旧asset source/history/decision/read-after/failure/consumer、phase review、product review、current context、人間判断点。
- `generate.py`: 固定BASE Git object bytesだけからbundleを再生成する。
- `validate.py`: `generate.py`をimportせず、固定BASEから独立再導出した期待値で全fieldをfail-closed検証する。
- `selfcheck.py`: 28負例でschema、binding、BASE、BASE ancestor、taxonomy `required_ancestor`到達性、入力digest、taxonomyの欠落／余分／status／authority boundary、unit／edge／asset、各partition、phase／product／current／authority境界とgenerator再生成改竄を検証する。
- `PR-DRAFT.md`: Draft PR本文。

## 検証

```text
python3 -B scaffold/phase-cross-20-review-0116/generate.py
python3 -B scaffold/phase-cross-20-review-0116/validate.py
python3 -B scaffold/phase-cross-20-review-0116/selfcheck.py
python3 -m py_compile scaffold/phase-cross-20-review-0116/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff origin/main...HEAD --check
```

旧archiveのsource／test／runtime／hook／CIは実行していない。merge、close、正式authority昇格は行わない。
