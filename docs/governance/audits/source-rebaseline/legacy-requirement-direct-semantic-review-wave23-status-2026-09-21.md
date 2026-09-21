# Wave23 旧要求 semantic review status（2026-09-21）

最新main `c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3` を固定した独立worktreeで、未review連続範囲の先頭2 product unit、HIL-FR01／HIL-FR02（HELIX-OS）を静的semantic reviewしました。main merge parentsは `ac54c3f9008bb501d6f0c501e66137c21cd5f149` と `30e87714ef09c89258a93bbbd5567ea753fbbf96` です。

2 unit、6 edge（requirement 2、design 2、implementation_source 2）を保存し、confirmed 2、unresolved 4、rejected 0です。累積は72 unit／213 edge、残り146 unitです。FR01はInfinityLoopEventのstate transition、digest／receipt bind、append-only state causalityを保持し、FR02はPR hook identity normalization、delivery exactly-once audit queue、idempotency receiptを保持しました。両unitのproduct boundary、source atomization、phase authority、consumer closureは保留です。

共通要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9` と requirements IR SHA、IR/raw line span、atom literal、selected old design/source、bounded search receipt、Wave1–22 prior lineageをledger/metaへ固定しました。全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。FR02 implementation sourceの直接hook証拠不足は候補のunresolvedとして明示し、成立を主張していません。

実施した検証は以下です。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave23.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave23.py` — `Wave23 static schema10 verification: PASS`
- `python3 scaffold/tools/scfctl.py validate` — PASS（bindings=16 fail=0）
- `git diff --check` — PASS

旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作は行っていません。
