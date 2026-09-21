# Wave17 旧HELIX要求直接semantic review method（2026-09-21）

## 範囲

Wave17は authoritative base `origin/main` の `6dad906ed9a52c9e49611931645db2f298c6bf6a` から、crosswalk順の未review 3 unitを静的に棚卸しした。対象は `IRUNIT-HIL-BR-15-HELIX-OS`、`IRUNIT-HIL-BR-16-HELIX-HARNESS`、`IRUNIT-HIL-BR-16-HELIX-OS`。Wave1〜15の141 edge・47 unitを除外し、stacked PR parentとしてWave16 `74bfd04f7aa2384e1e30856ec6c29282b764e8c5` を先行候補として明示的に入力へ含めた。Wave16 ledger/meta are available in the current tree; shallow cloneでもgit objectに依存せず固定digestで検証する。Wave17の実証拠edgeは8、atomは7、累積は50 unit・149 edgeで、crosswalk unit inventory上の残りは168 unitである。

要件edgeは `requirements-ir/requirements.json` の同一要求IDの静的source snapshot（A60）に限定する。候補L3/L5/L6文書の存在は要求IDの同一契約や実装完了を意味しない。BR15は直接のproduct-data実装assetを確認できなかったため、無関係な実装ソースを割り当てず、missing evidence receiptで記録した。

## 守る境界

- `archive/legacy-generation-2026-09-14/` は静的read-only参照だけに使った。runtime、test、hook、CI、adapterは実行していない。
- bounded searchの候補membershipはsemantic evidenceではない。asset ID、path、digest、行範囲、未解決フラグを台帳へ固定した。
- design/planのcontrolled anchorはWave16再レビューのgateを継承する。source fragmentとexcerptに接地しない弱いanchorをconfirmedへ昇格させない。
- BR16-HARNESSとBR16-OSの共有spanは両unitの責務境界に残すが、意味edgeは一つとして扱い、共有spanを二重計上しない。H側は3段CI gate、OS側はSHA/treeとpredecessor bindingを主担当候補とする。
- `direct_phase_review_pending` と `routing_correction_pending_direct_phase_review`（BR15）、`product_unit_boundary_human_decision_pending`（BR16両unit）を落とさない。authority、consumer closure、successor、phase採否は未確定のままとする。

## 検証

`verify_legacy_requirement_direct_semantic_review_wave17.py` はJSONL/metaのschema、source main base、stacked PR parent、Wave16 ledger/metaの固定digest、prior unit/edgeとnonrequirement asset重複、archive SHA、excerpt SHA、atom loss、BR16 shared span、controlled anchor接地、未実装missing receiptを静的に確認する。full cloneでは利用可能な場合だけparent/blob/ancestorも追加確認する。
