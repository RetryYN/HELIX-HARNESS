# Wave25 旧要求 semantic review status（2026-09-22）

Wave24 exact HEAD `5bb9ce4ca2a5fdd220be3a2874af201763ca4016` をcandidate lineageとして保持し、Wave24 merge後の最新main `2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` を親とする専用worktreeへWave25候補をrebaselineしました。main merge parentsは `4974e66e3890e41515004d18c49d59b3e49f8f68` / `5bb9ce4ca2a5fdd220be3a2874af201763ca4016` です。metadataのcurrent tree、main merge、parent、source base、stacked parent revisionを同一の最新mainへ更新し、成果物はresearch-premise candidateとして保持します。origin/mainまたはmerge parentが再度変化した場合は停止して再baselineします。

FR05の2 product unit、6 edge（requirement 2、design 2、implementation_source 2）を保存し、confirmed 2、unresolved 4、rejected 0です。FR06はWave2で既レビューのため除外し、FR07へ飛ばずFR05で止めました。累積は76 unit／218 total、225 edge、残り142 unitです。FR05 HARNESSはRedesign router／影響層／pair stale、FR05 OSはReverse→Redesign→pair-freeze→Forward順序とreceiptを保持しました。L0 escalationとreceipt outputはshared atom holdです。

要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR/raw line span、semantic digest、atom literal、selected old design/source、catalog classification、bounded search receipt、Wave1–24 prior lineageをledger/metaへ固定しました。全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。旧assetの存在や候補語近接から現行実装、採用、完了、consumer closureを主張していません。

検証は次の静的 verifier を実行しました。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave25.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave25.py` — `Wave25 static schema10 verification: PASS`
- verifierはrow/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、prior lineage、FR06重複除外、shared atom hold、stale-anchor negative caseを確認

旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。
