# SCF-B-0118 固定BASE 旧execution/result receipt 28件研究束

`SCF-B-0118` は、旧asset ledgerの全4,020行から execution/result 系を機械的に全件抽出し、asset-level receipt と unit直接結合の欠落を再利用可能な研究正本へ固定する Scaffold です。固定BASEは `44d546a40d2b4fa88701faf93ea8b618f4f1b86c` です。

## 調査結果

- 探索母集団は product unit 218件、source ID 153件、Wave1–50の598 edge／355 unique asset、旧asset ledger 4,020行です。
- 選定条件は ledger の `source_path` に対する `(?:\.vitest\.log$|/vitest-targeted|test-result|receipt\.json$|full-receipt)` の大文字小文字無視検索です。ledger順の28件を全件対象化し、代表サンプルへ縮めていません。
- 除外は同regexに一致しないledger 3,992行です。内訳は `.helix/evidence/` 60行、`tests/` 597行、path名に `lint` を含むもの197行、`review-*/head.txt` 3行（重複する分類を含む）で、これらや通常のtest source／lint logをexecution/result receiptへ混入させていません。
- 28件の内訳はJSON test summary 21件、text summary 5件、merge-head identity receipt 2件です。再生成後は、asset-level `pass_observed` 22件、`pass_with_pending` 1件、verdictなし5件です。verdictなしはidentity-only 2件、`LEGACY-ASSET-CE767996F54E28A6486B` のfailure marker 1件、明示的なexit=0を欠くtext 2件です。unit-level failure／縮退の判定へ昇格していません。
- JSONはtest/suiteの必須count、非負整数、総和整合、正のpass countを満たさない限りverdictを出しません。todo countは未完了としてpendingと同様に`pass_with_pending`へ含め、suite/test countが整合していても完了passへ昇格しません。textのpass summaryは行頭から行末までの構造化行だけを認識し、正のpass countには明示的なexit=0を必須化します。終了コードらしい`vitest exit`、`exit`、`exit code`、`exited with code` markerは全出現を記録し、値領域全体を符号付き十進整数として厳格にparseします。`,`／`;`／`|`は次の認識済みmarkerが続く場合に限りmarker間の区切りとして扱い、単独marker値の後ろにある余剰token（例:`0,0x1`、`0|N/A`、`0; N/A`）を見落とさず`unparseable_exit_observations`とreasonへ保持してverdictなしにします。既存receiptの`0 at YYYY-MM-DDTHH:MM:SSZ` timestamp annotationは維持します。parse不能markerはfailure markerへ混ぜず、`failure_observation`は別に保ちます。正常な複数decimal exitは全件記録し、1件でもnonzeroならverdictなし・asset-level failure observationにします。exit欠落、負値を含むnonzero、正のfailed件数、fatal/error/failureもverdictなしです。`0 failed`／`0 errors`と単語の一部に埋まった文字列はfailure markerにせず、散文中のpass表現もpassにしません。識別情報だけのreceiptもtest verdictにはしません。
- 修正後に固定BASEから再分類した28件は`pass_observed=22`、`pass_with_pending=1`、verdictなし=5、failure observed=1で、以前の確定集計を維持しました。追跡対象28件にparse不能exitはなく、今回の不具合はselfcheckのsynthetic observationで再現しています。JSON failure／欠測／zero total／不整合／todo、text `0 passed/2 failed`、mixed decimal exit、parse不能hex・N/A・空値、exit欠落、負値exit、散文passはいずれもverdictなしです。CE767は混在markerをverdictなし＋asset-level failure observedとして保存しました。unit-level verdict／acceptance verdictは生成していません。
- 選定28件はWave598 edgeに0件、crosswalkの `direct_legacy_asset_links` に0件、`representative_legacy_assets` に0件、legacy decision／copy read-afterの直接参照に0件です。一部はcrosswalkの `candidate_asset_pool` に含まれますが、これは正本crosswalk自身が `search_candidate_only_not_direct_semantic_link` と宣言する検索候補です。
- そのため各recordで `product_unit_binding`、`requirement_binding`、`acceptance_binding` は `absent`、旧実装・縮退・current実装・受入は `unknown` としています。test pass、pending test、fatal／lint marker、head/base identityはasset-level観測欄に限定し、実装・縮退・未実装・受入 verdictを生成しません。

旧archiveは `git show BASE:<path>` による静的Git object readだけです。旧runtime、test、CI、workflow、hook、adapter、sourceは実行していません。正式crosswalk、authority、successor、asset dispositionは変更していません。

## 28件の固定明細

`source path` は ledger の旧source path、`blob` は固定BASE archive sourceのGit blob、`SHA-256` は同source bytes、`anchor` は観測に使った原文行番号です。JSON receiptは1行JSONのため、行1のdigestと先頭previewを保持しています。

| asset ID | source path | blob | SHA-256 | anchor | observation | failure |
|---|---|---|---|---:|---|---|
| `LEGACY-ASSET-E605FFC4D388CAD5E843` | `.helix/evidence/g10-ux/20260906-browser-evidence.vitest.log` | `8a0669290532f52beb6ff6e3065de0d668e71557` | `ece0d50f7a45f7cd74e47a063f01aa9b66700a9fb25e1380a5bf413106c44156` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-486C4C3EF3594510B8DF` | `.helix/evidence/g8-integration/20260906-adapter-asset-evidence.vitest.log` | `c80ec361842235e8780795d8fab52b5bb4bc41f6` | `8d5f1f39ded662a4852c45657db7af27404666ceb3de4de8d7565ef1ffb686e1` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-C390C874B2E2EC190BA8` | `.helix/evidence/g8-integration/20260906-g8-pure-analyzer-evidence.vitest.log` | `a6db2e96666745fdf508e634511a50e8fc6a3ac5` | `c08fc22748b3b1637e2d54971e9e07f6a430858929c3bfd0b87018863e297706` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-74ED8AB21309CD4B660E` | `.helix/evidence/g8-integration/20260906-module-state-evidence.vitest.log` | `b3e13fb4fa4d150b81d6aeeca5f014e57c649304` | `3eb73f71fdfdbbf03b86a723dd7184f2d5928a3ea768d3377addd560e79b5bf2` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-0899FB2D361ED1D6553F` | `.helix/evidence/g9-system/20260906-selected-system-evidence.vitest.log` | `3912381db2c65ffe0b33288b16cddf6c4e141b84` | `80f2d4b2af6f7ec14ff153f66073ccc4bee7e9c683ac83b6d41315af5ee36e6e` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-8D4F298A5F04C81BAD39` | `.helix/evidence/review-1600/vitest-targeted.log` | `ea25e1f148ecdaa16420ccb6f6ed880780e4382f` | `5065beeaa4bca505628bbc620fe1bde26901b7b853b0876192edc1c3ec87e0be` | 5,6,8,10 | `vitest_text_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-7F72FC0A792044D41C5E` | `.helix/evidence/review-1602/vitest-targeted.log` | `13c43c11192a987e8b1a8c726ecaa7218f497e61` | `05014ba751e9c557e1ead4c538a60ed53c05949e237c90b132207c10e150bc85` | 5,6,8,10 | `vitest_text_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-46CEBF02B13D3730D91B` | `.helix/evidence/review-1605/vitest-targeted.log` | `db688238684f61865292caadc715133222479e82` | `287be3005652ec16d16373f10cfab7eb6ea3b46187f5c3606368593746d34e02` | 35,36,38 | `vitest_text_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-CE767996F54E28A6486B` | `.helix/evidence/review-1634/vitest-targeted.log` | `afdec0cffcc2e275c33432f4af06844995c0841c` | `16e4b9ca671257d226b4f0fc79202271011cf88fd00a178aeb3e34b0a0e61cc5` | 17,19,20,22 | `vitest_text_summary` | `observed_asset_level` |
| `LEGACY-ASSET-10B3A336BB1B1E8343FA` | `.helix/evidence/review-1649/vitest-targeted.log` | `efc5ba4af34883b8d357c2a5b640fb84ae6f276f` | `608d3a59412a1c47f18eb98fb73d00d76c1785ff5b9dffdadbe8cf4877c85925` | 5,6,8 | `vitest_text_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-2B2057E51E73A018F495` | `.helix/evidence/review-1672/vitest-targeted.json` | `5d7cfb774bc8bac4ff07cbc8b1625cc2df98ad54` | `72b2d514447ffbb35c63083abfacab60526c43db822221d9a27d1bbd050d55ce` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-F0A0EDF638E872B428E6` | `.helix/evidence/review-1676-terminal/vitest-targeted.json` | `3821c8ddd305139af147b2bd20282449974457fb` | `7f1489e907ef8dd1ae8314c694135fe62bc8895b21c8c96fd3c6a0aecf55adad` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-B53CAD5D078057BB49F5` | `.helix/evidence/review-1680/vitest-targeted.json` | `159700a6604b45383424c546b771d4c7ca0ae495` | `c13c1dad31999af424d314ec9a8b9ab4306b18998544d85f7b80d947c74f0ae3` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-1F84FE3ACA8936414064` | `.helix/evidence/review-1692/impact-ci-full-receipt.json` | `0ac6bdd13fb411b98ef29a0bfc85e14e5a547825` | `8e38e067c49509772873836d39a4f286a4dd946a275e7d45dd9c6ee4529aadd1` | 1 | `ci_merge_head_receipt` | `not_observed_in_asset` |
| `LEGACY-ASSET-5C8AFFFB2BD82797E9CE` | `.helix/evidence/review-1701/vitest-targeted-24e.json` | `c0f7da62cfefc9a5474e21b55172a633d9ee15d5` | `bbff0307d01e2a0654ff619dfa9c55125515546789c9d2c5452531793d76f654` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-B59399E1A40AAC3E21DE` | `.helix/evidence/review-1709/vitest-targeted-final.json` | `91dfe4b6c0ac9ef5e9772a05ed87b8f180b05fc5` | `efed3de7c95ad84c6194d55c7579e07811a37eeca8b200d97b34bb053d32eecd` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-7DEE91345C955CF98F21` | `.helix/evidence/review-1710/vitest-targeted.json` | `31cc547bf11ee23dc0318a3efbc192984b79e73f` | `e75dbe12e32fe0e30714a0b734501fe598ae9c5ab6c03f85c1cea3ecbc4b6ccf` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-E7FCBC2197283B859ABF` | `.helix/evidence/review-1721/vitest-targeted.json` | `18bca036207ce72f9668da41f783d68c8631862d` | `2a1d864dc57906faff5e2b71d62627c27239d763a2c6e6d3bbcb3f2e1ecbcde7` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-A55ABA3228AB39F0B960` | `.helix/evidence/review-1723/vitest-targeted-blocker-fix.json` | `498ae9d154bc3e2fdb84eca0ea6f5f3867344cc3` | `f0659e8e6f335790ceec0debf9a7f78f320a24927e125da0a88453e2306de4f4` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-E42CC55DD7AABB887D4E` | `.helix/evidence/review-1723/vitest-targeted-final.json` | `28b42e3c3e7ef5d36edffd5017542f56240eb067` | `39c34feebb299f5451e70d83415eb0a9f70ad9333a718524a4577de6576dbb96` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-1CE53569B37B89F89E02` | `.helix/evidence/review-1729/vitest-targeted.json` | `9d6c0939d640fcfc8cdb293246a4ce4672962dc7` | `4052967f5cd23fdb455cdb7356a839378a90deae6b02a66a9b4459ec72e7f997` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-3D25C64627B9D873D520` | `.helix/evidence/review-1730/vitest-targeted.json` | `24ab109bcf03c6667f584fcbc2880d466ff4a294` | `0387a96bb14368e7e589e5332b07790bd14ed9789f3c6973469de3db3787e85f` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-7B8BF587E8338F0DD11A` | `.helix/evidence/review-1731/vitest-targeted.json` | `6749a87726a54e8d03c4406ac0af173f5795e233` | `b065727d0bbcc9570cedea876535064dc31a93a958ca9753498fbab490ae861c` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-5B4EF64C379970EFF318` | `.helix/evidence/review-1735/impact-ci-full-receipt.json` | `81fe4e40c103cde26ebcb131523b53f1891193fe` | `a03154c6112bd3afe6f7071f180eb95c416fbeb528662182c906efbeae910903` | 1 | `ci_merge_head_receipt` | `not_observed_in_asset` |
| `LEGACY-ASSET-DB6FF660E65FB14E0868` | `.helix/evidence/review-865/vitest-targeted.json` | `e3ef43413ed83cda5006c2fe06c8afd79ab9d1e6` | `4cfa6dbc627cba53e90c8c7ee6bc6f73ab3dceb9e8a73e0891a33fc2cda7ff58` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-F5B69051F50A2D6914DF` | `docs/governance/evidence/PR-1679/vitest-targeted.json` | `4e45e2451692a5ea33b3f3eb00595ac66a5c1df3` | `f0b71876d084df17622ddd2387bb2b543b392422cc33b70f1d585f48952ae08f` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-2323B2E3608B8FF50F23` | `docs/governance/evidence/PR-1699/vitest-targeted.json` | `86d58adb1253db7b840871779f98c6036ee65901` | `ad53079d7b2e0c096ac55fe99a2d52697f8e0c2713f08e8c7dffed35189247ce` | 1 | `vitest_json_summary` | `not_observed_in_asset` |
| `LEGACY-ASSET-3016311717BF80969414` | `docs/governance/evidence/PR-1767/vitest-targeted.json` | `edae0169468f564fb0dddb72407869aeffb64b06` | `eca986bacb7c8b5e69c649ef0b435412ab82ba634b9bcf9cc7050191211f6a48` | 1 | `vitest_json_summary` | `not_observed_in_asset` |

## 検証

```text
python3 -B scaffold/legacy-execution-evidence-0118/generate.py
python3 -B scaffold/legacy-execution-evidence-0118/validate.py
python3 -B scaffold/legacy-execution-evidence-0118/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`generate.py`は`common.py`を使い、validatorは独立したoracle実装を持ちます。selfcheckが両者の出力一致を検査し、意味的独立性は主張しません。selfcheckはO01–O42の42観測状態（JSON failure／欠測／zero total／suite不整合／todo、textの厳格summary、同一行の複数exit全件保持、hex／N/A／空値／一部parse不能なexit、単独markerのcomma／pipe／semicolon余剰token、正当な複数marker区切りと許可外境界のmarker、timestamp suffix、exit形式／欠落／負値、0 failed／0 errors、混在したFAIL＋zero errors、npm ERR marker、bare FAIL／failed／Segmentation fault、path中のerror語、ハイフン連結語、散文、pending、identity）と、N01–N32の32負例（unit／requirement／acceptance結合、consumer／source、asset集合、input／BASE／scope／selection、authority／実装status、record authority_effect／asset_role、inventory schema_revision／binding_id、anchor_rule／exploration、破損JSON／JSONL、digest／履歴、schema）を期待error code付きで検査します。FAIL_REはpath区切り、dot、ハイフンに連結された語をmarkerにせず、bare FAIL／failed／fatal／error／segmentation fault／npm ERR!を維持します。

Progress reference: Issue #1813（進捗参照のみ。closeは行わない）。#2067のレビュー中worktreeは変更していません。
