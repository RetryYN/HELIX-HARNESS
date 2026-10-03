# 調査前提と境界

- `MPR-SH-OUTSIDE67-001` は67件のsource holdingであり、path_revision_pairは要求atomそのものではない。
- PATH011–015のproduct／phaseはholdingのpath-based候補ラベルである。HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの候補集合を保ち、最終owner・接続writer・authorityを決めない。
- source textの存在、current counterpartの有無、旧ledgerのhit／no-hitは、旧／現行implementation・degradation・failure・consumer・decisionの証拠にならない。exact evidenceがない値はunknownとする。
- 冒頭`---`、key形式、閉じ`---`で構成されるfrontmatterは全PATHで`metadata_only`とする。表行や複数責務行を一つのsource lineとして保全し、分割境界を断定できないものを `composite_unresolved` とする。normative sourceを `metadata_only` として処理しない。
- PATH011既存atomの再利用はID／digest参照だけであり、新規意味や採択、重複atomを生成しない。
- GitHub、Issue、PR、DB、memory、外部APIの状態から要求意味・承認・完了を生成しない。archive内の旧runtime／test／CI／workflow／hook／adapterは実行しない。
