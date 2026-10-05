# #2607 review03 legacy source semantic correction — follow-up 03

## 対象と根拠

Rootが作成したread-only legacy source pin再計算 `/tmp/pr2607-root-legacy-source-pin-recompute.json` を読み、FR source tableの014/016を補正した。対象revisionは作業開始時HEAD `01db90bc71f03f74627485482785012b71ceca14`。過去の監査記録は変更していない。

再計算記録ではasset ID/path/full source digest/span boundsに問題はなく、今回の所見は意味対応の誤りである。`LEGACY-ASSET-17C4BF78919578FEBB18` の実体は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md`。指定行129–160はOPS-R-10 ChangeDiagnosis（symptomからruntime/deployment/CI/release/PR/commit/diff/requirement/contract/module/code/test/config/infraへの診断）、OPS-R-11終端証拠（health/window/SLO/rollback/regression/review/read-after）、OPS-R-13 BackflowDecision（change class、existing route、affected/return layer、requirement/design、stale target、Forward再入）を定義する。Worker obligationやBot execution contractではない。

Worker共通契約の根拠は `LEGACY-ASSET-9114D4E463E95B67DD0C`（`worker-common-contract.md:47–137`）であり、versioned descriptor、sandbox、receipt、worker/reviewer separation、context packetの契約面を記述する。`LEGACY-ASSET-D881AF6AFD277B1DE934` は限定修復候補で、lines 35–58等が適用先分離/自動適用契約/停止を扱う。これらのsource責務を17C4へ帰属させない。

## 補正内容

- **014**：現行source columnに17C4は含まれていない。旧rationaleがD881と17C4を一組の「限定修復・Worker obligation」として引用していたのを修正した。WCCのidentity/scope/contextは9114、限定修復candidate/許可境界はD881/901Cの比較起点に区分し、17C4はこの親のBot/Worker contractを支えないと本文に明記した。したがって17C4は014のsource columnへ追加しない。Bot identity/purpose/scopeとOS割当境界は固定L2から再導出する。
- **016**：source columnにある17C4の範囲129–160を保持し、その役割をOPS-R-10/11/13の製品ライフサイクル診断、終端証拠、backflow/re-entryに限定して記述した。Worker obligationやrepair permissionとは位置付けない。Worker execution/assignmentは固定L2/L11のOS境界から再導出する。F46Aは旧OPS受入test-designであり、016ではsource columnどおり入力/結果対応の照合参照に限る。

人の新しい意味判断、承認手続き、owner、権限は追加していない。本文変更は既存FR source tableの014/016 rationaleだけである。

## 静的確認と限界

旧資産明細台帳の17C4/9114/D881/901C/F46A/C6AD asset ID/path/SHAと該当source bytesを照合した。FR source tableの22 parent rows/93 asset occurrence/36 unique source spansは維持され、014 rowには17C4 asset citationがなく、016 rowには17C4 129–160 citationがあり、rationaleと一致することを確認する。JSON再計算出力のsource spansと該当旧原文をread-onlyで照合した。

これはsource/rationale意味対応の作成側修正と静的確認であり、独立reviewや実行挙動の証拠ではない。旧runtime/CLI/test/CI、Bun、repository CIは起動していない。
