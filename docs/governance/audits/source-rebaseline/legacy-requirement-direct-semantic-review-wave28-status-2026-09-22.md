# Wave28 旧要求 semantic review status（2026-09-22）

Wave27 merge後の最新 main `b27e61f079edf64eeddc43eb8095159b19730b94` を親とする専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave28` へWave28候補をrebaselineしました。branchは `docs/legacy-semantic-review-wave28`、main merge parentsは `3df81ad27157c471e004083783f37a5860eaa2ee` / `bd468075abd1c1a95c655acdc9cd00b8fe1d898a` です。Wave27はすでにmainへmerge済みで、Wave28に未解消のstacked依存はありません。`origin/main`またはmerge lineageが変化した場合は停止して再baselineします。

FR13-OS、FR14-OS、FR15-OS、FR16-OS、FR17-HARNESS、FR17-OSの6 product unit、18 edge（requirement 6、design 6、implementation_source 6）を保存し、confirmed 6、unresolved 12、rejected 0です。FR17のHARNESS／OSは同じ要求IDから別source spanを切り出したproduct候補であり、shared atomを分割せず、相互共有も推測していません。FR12はWave1既レビューのため範囲から除外しました。Wave1–27の既レビューunitと実装asset edgeは重複していません。累積は89 unit／218 total、264 edge、残り129 unitです。catalogの4-product candidate集合（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）は未確定のまま保持しています。

要求sourceはFR13 `requirements.json:1942-1983`、FR14 `:1985-2026`、FR15 `:2028-2069`、FR16 `:2071-2112`、FR17 `:2114-2155` と raw requirement line 103–107を固定しました。要求asset、semantic digest、atom literal、selected old design/source、catalog classification、bounded search receipt、Wave1–27 prior lineageをledger/metaへ記録しました。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。候補語近接から現行実装、採用、完了、consumer closureは主張していません。

検証は次の静的 verifier を実行しました。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave28.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave28.py` — `Wave28 static schema10 verification: PASS`

verifierは row/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–27 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを確認しました。旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。
