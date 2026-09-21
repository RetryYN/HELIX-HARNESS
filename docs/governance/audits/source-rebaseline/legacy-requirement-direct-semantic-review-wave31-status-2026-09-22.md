# Wave31 旧要求 semantic review status（2026-09-22）

修正後のWave30 exact HEAD `d243362013dc55dd01f9843c0ee6d81c6fc2befd` をparentとし、最新main `fbeee47920ed8b2992ae123b00c224ff88987c50` を土台にWave31候補をrebaselineしました。mainまたはparentが変われば停止して再確認します。

FR24〜FR27のHELIX-OS 4 unit、12 edgeを保存しました。要求edge 4件はconfirmed、design 4件とimplementation_source 4件はunresolved、rejected 0件です。Wave1–30の既レビューunit／edgeおよび非requirement assetとの重複はありません。

累積は103 unit／306 edge、残り115 unit（全218 unit）です。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。phase候補、product boundary、旧実装、failure、consumer、successorは未確定です。

静的検証:

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave31.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave31.py` — `Wave31 static schema10 verification: PASS`

旧mainから最新mainへ進んだ差分を確認し、Wave29・30の台帳／meta修正を含む親系譜と共有入力を再検証しました。差分は対象外のPHCAP04–05 scaffold 5 pathだけで、Wave31のFR24〜FR27 source、archive manifest、IR、catalog、decomposition、crosswalk、phase inventoryに意味入力の変更はありません。

旧archiveのruntime、test、CIは実行していません。作成側はmergeとIssue closeを行いません。
