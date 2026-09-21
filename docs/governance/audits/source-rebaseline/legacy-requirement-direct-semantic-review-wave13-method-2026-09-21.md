# Wave13 direct semantic review 方法（2026-09-21）

対象はHELIX-OSの `IRUNIT-HIL-BR-01-HELIX-OS`、`IRUNIT-HIL-BR-02-HELIX-OS`、`IRUNIT-HIL-BR-03-HELIX-OS`。parent `9061b51a1e0b4a898dcfd568891335cbb33bc135` を固定し、Wave1〜12のunit、edge、design／plan／implementation assetを除外した。累計は38 unit／114 edge、残り180 unitである。

要求atomはproduct unit crosswalkの `source_text_spans` だけを無損失に分解した。BR01は4 atom、BR02は4 atom、BR03は7 atomである。BR01はA01/A02をOS固有のexclusive atom、A03/A05をHARNESS側BR01との共有atomとした。A05は重複していたOS固有実行句を削除して両raw fragmentを保持する共有境界atomへ統合した。candidate membershipはsemantic evidenceではなく、phase／product候補と直接意味照合を分離した。

requirement edgeは同一requirement ID、semantic digest、source snapshotのcontract根拠としてconfirmedにする。requirement roleのphase非交差は個別unitのphase分類と共通Requirement IR assetのcatalog候補を混同しないため明示した。confirmed／unresolved edgeはcounterevidenceとconsumer closure境界を記録する。

design／implementationは静的sourceの役割だけを記録し、実装成立を生成しない。BR01 designはCodex／Claude PR監査境界の一部証拠、BR02 planはCodex PRからClaude収束reviewへの計画候補、BR03 designはraw／durable／continuation境界を部分被覆とした。BR01 implementationはsemantic mismatchでrejected、BR02 implementationはPR／Claude receiptとcurrent HEADの部分候補だがcatalog product candidatesが空のためclassification conflict、BR03 implementationはmemory compactionの部分証拠としてunresolvedとした。

archiveは静的read-only参照だけに使用し、runtime、test、hook、CI、adapterは実行していない。

PR #1926のClaude exact-HEAD review Major 1を受け、助詞を除いたshared／exclusive fragmentの包含重複を検出する静的検査を追加した。
