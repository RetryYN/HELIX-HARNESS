# Wave26 旧要求 semantic review status（2026-09-22）

Wave25 exact HEAD `31b14151ce64e6e06e36e0c41d854335ac8d32eb` をcandidate lineageとして保持し、最新main `d7f515ec15a19a55f98edabe22d1018a912c7760` を親とする専用worktreeへWave26候補をrebaselineしました。main merge parentsは `86989d74923a7a30c5cf503075a336bc836a18f9` / `17a321721aa5f613f64883084ef13e85648aac58` です。origin/mainまたはmerge parentが変化した場合は停止して再baselineします。

FR07のHARNESS／OSとFR08-OSの3 product unit、9 edge（requirement 3、design 3、implementation_source 3）を保存し、confirmed 3、unresolved 6、rejected 0です。FR06はWave2で既レビューのため除外しました。FR09はshared atomを4単位目で分割するため保留しました。累積は79 unit／218 total、234 edge、残り139 unitです。

FR07 Closure GateはHARNESS／OS共有候補atom、FR07 OSはclosure receipt／close可否、FR08 OSはready／claimとReverse／Redesign／pair-freeze gateを保持しました。要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR/raw line span、semantic digest、atom literal、selected old design/source、catalog classification、bounded search receipt、Wave1–25 prior lineageをledger/metaへ固定しました。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。候補語近接から現行実装、採用、完了、consumer closureは主張していません。

検証は次の静的 verifier を実行しました。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave26.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave26.py` — `Wave26 static schema10 verification: PASS`

verifierはrow/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–25 prior lineage、edge／asset重複、FR06重複除外、shared atom hold、stale-anchor negative caseを確認しました。旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。
