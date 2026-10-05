# CONNECT Stage 4 008/009 起草・照合記録（2026-10-05）

main `54d8724a601115914793e03b2d8361f3a563d2a7` の承認済み6本文prefixをそのまま保持し、1.0採択済み2親を追補した。本文revision `0c667b635a2be0c963e09cdfbeff6fc542915015`。9機能AC、172個別CASE、NFR候補4件。各CASEは1ACへ結び、missing/unknown/stale/conflictはsuffix M/U/S/Cの別fixtureで識別する。独立した業務criterionは生成しない。

固定633bf12 L2/L11、PO訂正行15と採択行94/95、登録002の10pinを再計算した。旧v1.3 archive/baselineの供給6atomと、009の隣接比較5lineはfull SHA・LF除外元line SHA・raw-LF行SHAを照合した。008は供給と安全を分離して意味再導出し、SECURITY atomとsource holdingを保持。009は旧直接candidate input0の新type案がPO採択されたものを固定親から再導出する。旧loop形状は比較に限り、TL/DB/CI、旧layer pair、実probeは移さない。

編集前に6既存本文と固定親・旧引用spanを実読した。操作別unknownを初回/feedback/loop/join/ACKに分け、独立適格な辺を一括停止しない。上限・期限・budgetは既存適用契約から読み、CONNECTが候補数値としても新設しない。6本文SHA/bytesと追補248行literal、source pin、全CASE→AC対応は[JSON](l3-l10-connect-stage4-root-authoring-2026-10-05.json)へ固定。

validate147/fail0、stale0、residuals0、govcheck/diff-check、全表幅・末尾pipe、CASE一意・AC参照はPASS。検証設計であって実測結果ではない。旧runtime/test/CI/Bun、実MCP/probe/送信は実行していない。rootの起草・照合から独立review合格、L3承認、下流開始、Issue closeを生成しない。
