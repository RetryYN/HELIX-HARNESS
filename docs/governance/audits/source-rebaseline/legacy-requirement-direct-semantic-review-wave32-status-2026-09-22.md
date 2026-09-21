# Wave32 旧要求 semantic review status（2026-09-22）

最新Wave31 exact HEAD `e44a8f0cca1f1147e79753ec91cb404fe37cb772` をstacked parentとして、専用worktree `/home/tenni/.helix-worktrees/legacy-semantic-review-wave32` にWave32 candidateを作成しました。main baseは `fbeee47920ed8b2992ae123b00c224ff88987c50`、merge parentsは `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` と `81144b44b16064bc864b01bd83830455bb7bada3` です。旧mainから指定基準mainへの共有入力差分はPHCAP04–05 scaffoldの5追加ファイルのみで、Wave32宣言入力は不変です。
指定基準mainに固定しており、merge admission前に最新mainとの差分とWave31親系譜を再確認する停止条件を明記しています。
現行main `1d7f9a18dd89745b0ed0b9d6d3ed0f9437e47dff` との差分は、SCF-B-0045と `scaffold/pre-isolation-outside-holding-16-30/` のREADME／generator／inventory／selfcheck／validatorの6 scaffoldファイルです。これはRDP-001 outside-67 rows 16–30の別候補で、Wave32の要件・旧要求原文・24 edge・8 product unit・検証器入力へ取り込んでいません。

FR30-HARNESS／OS、FR31-HARNESS／OS、FR34-OS、FR35-HARNESS／OS、FR36-OSの8 unit、24 edgeを保存しました。要求edge 8件は同一要求IDのexact source contractとして `confirmed`、design 8件とimplementation_source 8件は `unresolved`、rejected 0件です。FR32・FR33は既レビューのため再選択していません。4製品candidate denominatorは維持し、product boundary、phase authority、successor、current implementation、degradation、failure、consumer closureは未確定です。

累積は111 unit／330 edge、残り107 unit（全218 unit）です。authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。FR31-OSのphase pool 0、FR35-OSのimplementation phase pool 0を含め、unknownを候補採用へ昇格させていません。

要求sourceのraw line、IR object span、semantic digest、atom provenance、candidate assetのsource path／SHA、bounded search receipt、Wave1〜31 prior lineageをledger/metaへ固定しました。選定assetはWave1〜31の既レビュー非要求assetと重複していません。shared atomは空配列です。

静的検証:

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave32.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave32.py` — `Wave32 static schema10 verification: PASS`
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave29.py` — `Wave29 static schema10 verification: PASS`
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave30.py` — `Wave30 static schema10 verification: PASS`
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave31.py` — `Wave31 static schema10 verification: PASS`

verifierはrow/meta schema、固定main／Wave31 parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、candidate集合に対するselected部分集合、selected／remainingの順序・重複・分割件数、metaの`reviewed_edges`とledgerの完全一致、phase pool、Wave1〜31 prior lineage、edge／asset重複、shared atom hold、stale-anchor／candidate外選択のnegative caseを確認します。旧archiveのruntime、test、CIは実行していません。commit、push、PR、merge、Issue操作も行っていません。

候補はresearch-premiseであり、次の再baseline時にmain／parent／共有入力の変更を検査します。product boundary、phase authority、current implementation、degradation、failure、consumer closure、acceptance receipt、successor assignmentはhuman review pendingです。
