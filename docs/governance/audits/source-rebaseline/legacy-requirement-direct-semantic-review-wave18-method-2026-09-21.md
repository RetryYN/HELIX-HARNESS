# Wave18 旧HELIX要求直接semantic review method（2026-09-21）

## 範囲

Wave18はbase `6dad906ed9a52c9e49611931645db2f298c6bf6a` 上で、Wave1〜15の既済edge、未マージWave16 `74bfd04f7aa2384e1e30856ec6c29282b764e8c5`と、Wave16上にstackされたWave17 HEAD `cd88a4e24bc95613548edc17076b9a1d3dceb538`のcurrent-tree ledger/metaを固定SHA mapでpriorとして静的に照合した。対象は次の4 product unitで、9 atom、12 asset edgeである。

- `IRUNIT-HIL-BR-17-HELIX-OS`
- `IRUNIT-HIL-BR-18-HELIX-OS`
- `IRUNIT-HIL-BR-19-HELIX-HARNESS`
- `IRUNIT-HIL-BR-19-HELIX-OS`

累計は54/218 unit、asset edgeは161、crosswalk上の残りunitは164。Wave18 JSONLはschema revision 10のresearch-premise candidateであり、採否・authority・実装成立を確定しない。

## 固定したsourceと資産

要求edgeは `LEGACY-ASSET-A60CF91DD2AF6693E6F9` のRequirement IRを共通source snapshotとして再利用し、要求ID、IR行範囲、raw markdown行、semantic digestを同時に照合する。design／implementation候補はcatalogのasset ID、path、digest、classification、candidate phase/productを固定した。Wave1〜16およびWave17 current-treeのnonrequirement assetとの重複を除外した。

旧archiveは静的read-onlyだけに使用した。旧runtime、test、hook、CI、adapterは実行していない。asset候補の存在、phase候補、過去のtest/design記述は、要求実装・consumer closure・完了の証拠へ昇格させない。

## semantic境界

BR17-OSはWave5のBR17-HARNESS peerとA01〜A04を共有候補として保持し、A05をOS側downstream causality chain候補として記録する。原文の `` `successor_issue`として `` は `source_statement_text` と `connection_records` に保持したが、upstream decompositionの `source_text_spans` には含まれない。このconnector token欠落をholdとして明記し、Wave18はlossless atomizationもsuccessor identityも主張しない。bootstrap修正とsuccessor割当は別判断である。

BR18-OSは旧HARNESS owner表現のOS routing候補を記録するが、`legacy_seed_meaning_change_review_pending`を維持する。BR19-HARNESS／OSはBun撤去とactive surface完了条件をproduct split候補として残し、`IR-ROUTE-Q1`、`unresolved_target`、technology constraintの意味変更を解消しない。

## 検証

`verify_legacy_requirement_direct_semantic_review_wave18.py` は、schema10 row/meta、main source baseとstacked current-tree priorの固定digest、decomposition/crosswalk/phase exact join、Requirement IR/raw source anchor、catalog digestとarchive excerpt digest、prior unit/edge/nonrequirement asset重複、bounded search receipt、atom coverage、controlled bindingのatom/source fragment/excerpt接地、BR17 connector holdをstatic readだけで検査する。stale anchorとmissing `anchor_evidence_terms` mappingの陰性ケースもfail-closeで確認する。検証器は旧archiveのコードをimportまたは実行しない。
