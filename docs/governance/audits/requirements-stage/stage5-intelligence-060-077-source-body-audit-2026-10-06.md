# Stage 5 INTELLIGENCE 9親 source/body audit — 2026-10-06

対象は 22 採択済み Stage 5 / version_target 1.0 のINTELLIGENCE L2親（060/061/062/063/069/070/071/074/077）と、6正本のStage 5追補である。本文候補・CASE設計の作成側source照合であり、独立review、L3承認、実行、実装、releaseではない。

remote main exact baseは `5acae384305b01d10e88eeb2e6406f847baf66df`。旧inventoryがfa642 local snapshotを時点基準として記した箇所は訂正し、Rootの `/tmp/stage5-int-labo-root-main-recompute.json` 126-check recomputationに基づき5acae384のsource bytesを本監査基準とした。旧inventoryと既存監査は変更していない。

旧sourceは18文書のfull file bytes/full SHAと、20選択spanのraw-LF literal・line range・SHAを固定。旧asset ledgerはfull SHAとINT source pathに一致する該当行のliteral/SHAを記録した。本文6正本はbase full SHA/byte prefixとStage 5 suffix各行literal/SHAを固定し、FR/AC/CASEの全物理行を追跡できる。固定L2、PO、L11、G0/current registerは親単位に元inventoryから保持し、対象source bytesで再照合した。G17有限計算導出記録もfull SHA/literalで固定。

069–071のL2は採択済みStage 5対象である。未承認なのは本Stage 5 L3 draft。固定L11 231–251の有限fixtureはこのStage 5本文にのみ適用し、Stage 4へ前倒ししない。

技術的parameterは固定fixture arithmeticとunit/unknown/unsupported oracleに限り、運用SLA、performance target、minimum-N、実装能力を追加していない。旧runtime/test/CIは実行していない。

未読限界・source scope・各CASE/AC行shaは隣接JSONに記録。JSONの `unread_limits` は未確認領域を維持し、archive全量不在・semantic completeness・独立review済みとは主張しない。
