# Wave30 旧要求 semantic review status（2026-09-22）

Wave29 Draft PR #1983の再ベース後 exact HEAD `a75a36b548af46d916234d8d894f07840f76cfd0` をstacked parentとして、専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave30` にWave30候補を作成しました。branchは `docs/legacy-semantic-review-wave30`、main baseは `1c6912ad34b9a7950206188ad364e3a712dc9e6b` です。mainまたはWave29 exact HEADが変化した場合は停止してrebaselineします。

FR21-OS、FR22-HARNESS／OS、FR23-OSの4 product unit、12 edgeを保存しました。要求edge 4件はconfirmed、design 4件とimplementation_source 4件はunresolved、rejected 0件です。FR21〜23のsource spanとproduct splitは連続しており、shared atomは記録していません。Wave1–29の既レビューunit／edgeと旧implementation／design assetは重複していません。

累積は99 unit／218 total、294 edge、残り119 unitです。4-product candidate denominator（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）は維持しています。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。phase候補、旧実装、縮退、failure、consumer、product boundaryは未確定です。FR22のphase candidateはPHCAP-07ですが、現行statusはcandidate_only、transitionはnot_reimplemented_formallyです。

要求sourceはFR21 `requirements.json:2286-2328`／raw line 111、FR22 `:2329-2371`／raw line 112、FR23 `:2372-2414`／raw line 113を固定しました。selected assetは要求 `A60CF...`、FR21 `48A992...`／`41C752...`、FR22 `467400...`／`B5C4...`、FR23 `310E...`／`44C4...` です。classification、source SHA、excerpt SHA、line bounds、bounded search receipt、Wave1–29 prior lineageをledger/metaへ保存しました。

静的検証は次の通りです。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave30.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave30.py` — `Wave30 static schema10 verification: PASS`

verifierはrow/meta schema、main／stacked parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–29 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを確認しました。旧archiveのruntime、test、CIは実行していません。push、PR、merge、Issue操作は行っていません。

保留事項は、Wave29のmerge前提、main／parentの変更時rebaseline、product boundary／phase authority／successor assignment、current implementation、degraded／failure assessment、consumer closure、acceptance receiptです。FR23のdesign候補は物理schema／projectionの近接証拠であり、connector registryへの直接意味一致は未確定です。

selected assetのdispositionはHistorical／historical authority／unresolved／unknown implementation／consumer refs空であり、implementation候補にはlegacy runtime／CLI／adapterのreuse exclusionがあります。failureとconsumerのclosureは未成立です。
