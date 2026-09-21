# Wave31 旧要求 semantic review status（2026-09-22）

Wave30 exact HEAD `f07aaa41ecc0c9098c6421049b0f4df5f0b8da6a` をparentとし、固定main base `1c6912ad34b9a7950206188ad364e3a712dc9e6b` に対するWave31候補を専用worktreeへ作成しました。現在のorigin/mainは `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11` で固定baseから進んでいるため、候補はstale保留です。mainまたはparentが変われば停止し、rebaselineします。

FR24〜FR27のHELIX-OS 4 unit、12 edgeを保存しました。要求edge 4件はconfirmed、design 4件とimplementation_source 4件はunresolved、rejected 0件です。Wave1–30の既レビューunit／edgeおよび非requirement assetとの重複はありません。

累積は103 unit／306 edge、残り115 unit（全218 unit）です。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。phase候補、product boundary、旧実装、failure、consumer、successorは未確定です。

静的検証:

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave31.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave31.py` — `Wave31 static schema10 verification: PASS`

固定main `1c6912ad...` から観測main `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11` への11変更pathは全て `scaffold/` 配下で、archive manifest、requirements IR、FR24〜FR27 raw source、asset catalog、decomposition、crosswalk、phase inventoryとのpath交差は0件でした。したがって候補内容への静的影響は確認されず、固定main／Wave30 exact parentにpinした検証結果を保持します。main変更を取り込んだrebaselineは別途必要です。

旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。
