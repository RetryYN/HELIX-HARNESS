# SCF-B-0119 source／human decision pending 10 unit研究

`SCF-B-0105`で`UNRESOLVED_SOURCE_OR_HUMAN_REVIEW`として保持された10 unit（HELIX-OS 9、HELIX-HARNESS 1）を、固定BASEの旧IR原文、Wave1〜50、旧assetのsource／history／decision／read-after／failure／consumer、PHCAP-01〜20、四製品L1へ静的に照合するresearch-only Scaffoldである。#2068の20 unitとはIDを共有しない。正式phase、product authority、実装、未実装、縮退、consumer closureは生成しない。

taxonomyの入力は現行main `78e23a622bc9c40183269e22a59c566d22b93435`にある
`scaffold/phase-status-taxonomy-0105/units.jsonl`をimmutable sourceとして固定する。SHA-256は
`e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4`、Git blob OIDは
`c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f`で、30行中対象statusは10行である。固定taxonomy commitが現HEADの祖先であること、pathのblob OID、snapshotのdigestをvalidatorが再照合する。

各unitは次を分離して記録する。

- `taxonomy_alignment`: `M-WAIT-SOURCE-AUTHORITY`または`M-WAIT-PHCAP-BOUNDARY`、candidate statement、required evidence、judgment waiting、status、formal phase null、authority boundary。
- `source_anchor`／`semantic_review_edges`: 旧IR原文のJSON pointer・line anchor・semantic digestとWave edge。asset／Waveのphase targetsは候補であり、直接phase根拠やauthorityではない。
- `old_asset_evidence`: 旧asset source／history／decision／read-after／failure／consumer partition。旧sourceの存在は実装成立を示さない。
- `implementation_evidence`／`degradation_evidence`／`failure_evidence`／`consumer_evidence`: それぞれ`unknown`、`unknown`、`unknown`、`pending`を保持し、旧archive実行や未実装断定を行わない。
- `phase_review`／`product_review`: 全PHCAP-01〜20境界を`pending_all_20`、phase非適用を`not_proven`、product authorityをnullとして保持する。

## 分母と成果物

- 10 unit（OS 9／HARNESS 1）、Wave scan 598行、semantic edge 26件、旧asset 17件。
- 旧assetのsource／history／decision／read-after／failure／consumerをunit別に保持する。
- `inventory.json`: 固定BASE、taxonomy immutable source、入力digest、分母、authority境界、負例コード。
- `evidence.jsonl`: 10 unitの原文anchor、Wave edge、旧asset partition、実装／縮退／failure／consumerの未解決状態、phase候補、判断待ち。
- `generate.py`: 固定BASE Git object bytesとimmutable taxonomy sourceから再生成する。
- `validate.py`: `generate.py`をimportせず、固定BASEとtaxonomy sourceから独立再導出し、全fieldをfail-closed比較する。
- `selfcheck.py`: 32負例でschema、Binding、BASE、入力digest、unit／edge／asset、taxonomy set／status／matrix join／authority boundary、各partition、phase／product境界を検証する。taxonomy本文を孤立commitへ改竄して再生成する負例も`E_TAXONOMY_NOT_ANCESTOR`で拒否する。
- `PR-DRAFT.md`: Draft PR本文。

## 検証

```text
python3 -B scaffold/phase-source-human-review-0119/generate.py
python3 -B scaffold/phase-source-human-review-0119/validate.py
python3 -B scaffold/phase-source-human-review-0119/selfcheck.py
python3 -m py_compile scaffold/phase-source-human-review-0119/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff origin/main...HEAD --check
```

旧archiveのsource／test／runtime／hook／CIは実行していない。正式crosswalk、PHCAP、phase／product authority、実装、未実装判定、縮退判定、consumer closure、merge、closeは変更しない。
