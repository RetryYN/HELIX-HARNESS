# SCF-B-0006 — DELEGATED-DOC-008/017 と5 edgeのatom候補

このdirectoryは、正本台帳に保持されたL3/L10 pairを、要求採否・意味同値・owner確定・実装へ昇格させず、静的レビュー可能な仮束へ固定するscaffold candidateである。

対象は次の2文書と、これらに触れる5 edgeである。

- `DELEGATED-DOC-008`: `docs/design/helix/L3-requirements/requirement-discovery-json-authority.md`
  - 90行、source status `draft`、canonical pair `L3 ↔ L10`
  - asset `LEGACY-ASSET-E78B8D68CC327AA00991`
- `DELEGATED-DOC-017`: `docs/test-design/helix/requirement-discovery-json-authority-acceptance.md`
  - 36行、source status `draft`、canonical pair `L10 ↔ L3`
  - asset `LEGACY-ASSET-AD746F4F3487103519F9`
- `DELEGATED-REF-0342` / `DELEGATED-REF-0772`: 双方向の`pair_artifact`
- `DELEGATED-REF-0341`: DOC-008の`parent_design`。選択batch外の親依存として保持する
- `DELEGATED-REF-0414` / `DELEGATED-REF-0415`: authority文書からのinbound reference

固定比較revisionはmain `9573119070cdf8f1f70e368bc310f575e8a3538c`。原文blobはDOC-008 90行、DOC-017 36行を9 coverage spanで重複・欠落なく保持する。意味候補は、DOC-008の`RDJ-FR-001..012`とDOC-017の`RDJ-AC-001..012`を各ID一行spanへ分離し、その他の原文をmetadata／authority／lifecycle／template／partitionの境界atomへ保持する。意味候補の合計は31 atomである。

phase/product台帳の現状態は仮候補に留める。DOC-008は`PHCAP-06`候補、DOC-017はphase未確定。両方とも製品候補は`HELIX-HARNESS`のみだが、直接境界根拠は未完であり、owner確定ではない。event／projection／DB／downstreamを含む8つのFR/AC atomは、`consumer_product_candidates: ["HELIX-OS"]`を別欄へ保持する。OSをHARNESSのowner欄へ混入させない。

`consumer_boundary_ids`はFR/AC atomのうちOS consumer候補を持つ8 IDを実データから再計算した集合である。`mixed_owner_ids`はowner候補が複数製品にまたがるatomを意味し、`candidate_target=unresolved`でも数える。この定義ではmetadataの`RDJ-META-008/017`が該当する。いずれも最終ownerやconsumerの承認ではない。

旧assetは両方とも`Historical`／`unresolved`、旧実装`unknown`、旧実行`false`、consumer refs空、consumer closure `pending`で固定する。受入設計は未実行であり、PR-1 contract-only・PR-2以降`design-defined / not-implemented`の原文境界を保持する。

holding全体はsource 114件、reference 788件。既存のDOC-003/028と対応3 edgeを除外した残りはsource 112件、reference 785件として記録し、既review単位を増やさない。

```text
python3 scaffold/delegated-doc-008-017/validate.py
python3 scaffold/delegated-doc-008-017/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
```

validator／selfcheckの合格は、atom化完了、要求採用、L3/L10 freeze、implementation、consumer closure、acceptance、CI、releaseを意味しない。旧runtime／test／CI／hookは実行せず、GitHub／Issue／PR／DBへ作用しない。
