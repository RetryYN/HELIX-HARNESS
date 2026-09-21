# Wave29 旧要求 semantic review status（2026-09-22）

Wave28 PR #1980未mergeのexact HEAD `a05b9f5444ba11626823683cc486db95c9d1f3a3` をstacked parentとして、専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave29` にWave29候補を作成しました。branchは `docs/legacy-semantic-review-wave29`、main baseは `b27e61f079edf64eeddc43eb8095159b19730b94` です。mainまたはWave28 exact HEADが変化した場合は停止してrebaselineします。

FR18-HARNESS／OS、FR19-HARNESS／OS、FR20-HARNESS／OSの6 product unit、18 edgeを保存しました。要求edge 6件はconfirmed、design 6件とimplementation_source 6件はunresolved、rejected 0件です。FR18〜20のsource spanとproduct splitは連続しており、shared atomは記録していません。Wave1–28の既レビューunit／edgeと旧実装assetは重複していません。

累積は95 unit／218 total、282 edge、残り123 unitです。4-product candidate denominator（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）は維持しています。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。phase候補、旧実装、縮退、failure、consumer、product boundaryは未確定です。

要求sourceはFR18 `requirements.json:2157-2198`／raw line 108、FR19 `:2200-2241`／raw line 109、FR20 `:2243-2284`／raw line 110を固定しました。selected assetは要求 `A60CF...`、FR18 design／implementation `335176...`／`59E0...`、FR19 `F6E9...`／`03B...`、FR20 `535E...`／`A85...` です。classification、source SHA、excerpt SHA、line bounds、bounded search receipt、Wave1–28 prior lineageをledger/metaへ保存しました。

静的検証は次の通りです。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave29.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave29.py` — `Wave29 static schema10 verification: PASS`

verifierはrow/meta schema、main／stacked parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–28 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを確認しました。旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。

保留事項は、Wave28のmerge前提、main／parentの変更時rebaseline、product boundary／phase authority／successor assignment、current implementation、degraded／failure assessment、consumer closure、acceptance receiptです。

selected assetのdispositionはHistorical／historical authority／unresolved／unknown implementation／consumer refs空であり、implementation候補にはlegacy runtime／CLI／adapterのreuse exclusionがあります。failureとconsumerのclosureは未成立です。
