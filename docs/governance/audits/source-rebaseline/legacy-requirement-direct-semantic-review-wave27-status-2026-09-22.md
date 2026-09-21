# Wave27 旧要求 semantic review status（2026-09-22）

Wave26 merged lineage（main merge parent `49ed8acf548fa2ee599a9787c2e5cee85763001f`）を引き継ぎ、最新main `3df81ad27157c471e004083783f37a5860eaa2ee` を親とする専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave27` へWave27候補をrebaselineしました。branchは `docs/legacy-semantic-review-wave27`、main merge parentsは `d7f515ec15a19a55f98edabe22d1018a912c7760` / `49ed8acf548fa2ee599a9787c2e5cee85763001f` です。origin/mainまたはmerge parentが変化した場合は停止して再baselineします。

FR09-HARNESS／OS、FR10-OS、FR11-HARNESSの4 product unit、12 edge（requirement 4、design 4、implementation_source 4）を保存し、confirmed 4、unresolved 8、rejected 0です。FR09-HARNESS／OSは `typed非終端disposition receipt` を共有候補atomとして保持しました。Wave1–26の既レビューunitと実装asset edgeは重複していません。累積は83 unit／218 total、246 edge、残り135 unitです。catalogの4-product candidate集合（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）は未確定のまま保持しています。

FR09は `requirements.json:1770-1811`、FR10は `:1813-1855`、FR11は `:1856-1897` と raw requirement line 99–101を固定しました。要求asset、semantic digest、atom literal、selected old design/source、catalog classification、bounded search receipt、Wave1–26 prior lineageをledger/metaへ記録しました。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。候補語近接から現行実装、採用、完了、consumer closureは主張していません。

検証は次の静的 verifier を実行しました。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave27.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave27.py` — `Wave27 static schema10 verification: PASS`

verifierはrow/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–26 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを確認しました。旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。
