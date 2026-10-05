# Stage 5 HELIXLABO L3/L10 source・本文固定監査（13親）

記録日: 2026-10-06。対象は採択済みStage 5 / 1.0 のHELIXLABO L2 13親に限定する。固定parent setは ``HELIXLABO-L2-050`, `HELIXLABO-L2-059`, `HELIXLABO-L2-060`, `HELIXLABO-L2-061`, `HELIXLABO-L2-063`, `HELIXLABO-L2-064`, `HELIXLABO-L2-065`, `HELIXLABO-L2-066`, `HELIXLABO-L2-067`, `HELIXLABO-L2-068`, `HELIXLABO-L2-069`, `HELIXLABO-L2-070`, `HELIXLABO-L2-071``。

基準はremote main `5acae384305b01d10e88eeb2e6406f847baf66df`。共有source inventoryの `fa642cddc3c4446e3635f1c6badd90209862cfac` は読取snapshot由来であり、main基準として記述しない。Rootの `stage5-int-labo-root-main-recompute.json` は5aca基準の126照合すべて一致し、G0 full SHAも一致した。本文前の6正本prefixをexact 5aca bytesと比較し、追補各行を末尾LF込みで固定した。

固定L2本文、PO decision row、G0 register row、L11、旧source full files/span、asset ledger選択行、追補本文はJSONにliteralとSHA-256を保持する。旧資産は意味の再導出候補・参照に限り、verbatim移植、旧runtime/test/CI実行、または旧approvalの移管を意味しない。旧sourceはLABOに関連する全文読取文書とinventory指定spanに範囲限定した。

本文には正常、未見正常、独立した欠落・stale・mismatch、責務越境negative、unknown/unassessedのCASEを記録した。L10 CASEは一行一変異と期待oracleを持つ。L2 065のPO条件D1は `first_pass`、067は最初の適格candidateと同一Attempt内repair roundとして別計測し、068 distinct Attempt数とは換算しない。070の9 selected telemetry atomsも個別fieldとし、067/068/059と二重計上しない。

未読範囲はJSONの `unread_limits` に列挙した。特に全archiveの同義語横断探索、legacy ledger 4,020行の逐語的意味調査、inventoryでspan-only指定された巨大文書の全行semantic censusは行っていない。

静的確認: 13親の完全一致、固定source 126 pin照合の継承、6 prefix exact保持、本文/CASE/AC行のliteralとraw SHA記録、`git diff --check`。旧CLI/runtime/test/CI、新世代CIは起動していない。
