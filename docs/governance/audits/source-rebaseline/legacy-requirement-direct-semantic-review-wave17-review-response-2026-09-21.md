# Wave17 review response（2026-09-21）

Wave17は、旧HELIXの再発明ではなく、Wave16までの静的棚卸しを引き継いだ上流semantic premiseである。source main base `6dad906ed9a52c9e49611931645db2f298c6bf6a` とstacked PR parentのWave16 `74bfd04f7aa2384e1e30856ec6c29282b764e8c5` を分けて保持し、Wave16 ledger/metaはcurrent treeから固定digestでprior計算へ明示的に含めた。

## 結果

- `IRUNIT-HIL-BR-15-HELIX-OS`: HIL-BR-15の要求契約を確認。L5 product-data connector設計はA01/A02へ部分接地したが、A03 downstream supply、consumer closure、実装は未確認。直接implementation assetは検索で見つからず、無関係assetの代用を避けた。
- `IRUNIT-HIL-BR-16-HELIX-HARNESS`: HIL-BR-16の要求契約、CI verification plan、critical path schedulerを接地候補として記録。planはtyped candidate/full fallbackに留まり、3段CIの成立を確認しない。
- `IRUNIT-HIL-BR-16-HELIX-OS`: telemetry designとGitHub tree/head adapterを記録。source/candidate HEAD、DAG、tree read-afterは部分接地するが、predecessor binding全体とstyle統合SHA追跡は未確認。

## evidence / counterevidence

要求edgeはA60のHIL-BR-15/16 exact source spanだけをconfirmedとし、候補文書のIDや存在から実装を生成していない。design/implementationはWave16 controlled-anchor gateを継承し、全てunresolved。BR16-HとBR16-OSのshared source spanは両unitに保存しつつ、shared semantic meaningを一度だけ扱う。

BR15ではcatalog-wide implementation_source検索でも3語のmatch countが0で、`src/product-data/` が旧archive snapshotにもなく、`ProductDataConnector`、`ProductDataProjection`、`HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN` の直接sourceも見つからない。これは旧snapshotの静的なmissing evidenceであり、現行実装の断定ではない。BR15のL6配置候補DD66は過去waveで使用済みのため、nonrequirement asset重複除外により再利用していない。

## admission boundary

authority effectはnone、consumer closureはpending、legacy実行はnot_run、new buildはfalse。direct phase review、routing correction、product boundary human decision、successor assignment、exact HEAD reviewが完了するまで下流実装へ進めない。
