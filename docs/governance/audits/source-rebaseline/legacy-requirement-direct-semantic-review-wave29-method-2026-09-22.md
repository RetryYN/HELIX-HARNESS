# Wave29 旧HELIX要求直接semantic review method（schema10）

Wave29は、旧archiveの要求、asset catalog、design、implementation sourceをstatic read-onlyで照合するresearch-premise candidateです。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave29`、branchは `docs/legacy-semantic-review-wave29` です。旧runtime、旧test、旧CIは実行していません。

Wave28 PR #1980はmainへ統合済みです。旧main `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` から最新main `fbeee47920ed8b2992ae123b00c224ff88987c50` への差分を確認し、Wave29が宣言するWave28 ledger／meta／verifierおよび共有IR・分解・catalog・crosswalk・phase inventory入力には差分がなく、追加されたPHCAP04–05 scaffoldは対象外であることを確認して候補branchをrebaselineしました。`current_tree_revision`、`parent_revision`、`stacked_pr_parent_revision`、`source_revision`、`source_main_base_revision`、`main_merge_revision`は最新mainです。mainのmerge parentsは `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`、`81144b44b16064bc864b01bd83830455bb7bada3` です。mainまたは共有入力が変わった場合は停止し、入力digestと親系譜を再確認します。作成側はmergeを行いません。

Wave28後の次の未レビュー要求atom境界から、FR18、FR19、FR20のHARNESS／OS product splitを6 unit、18 edge（requirement 6、design 6、implementation_source 6）として選択しました。同一要求IDのproduct splitでもsource spanを分け、shared atomを推測していません。FR18-HARNESSは3 atom、FR18-OSは1 atom、FR19-HARNESS／OSは各2 atom、FR20-HARNESSは3 atom、FR20-OSは2 atomです。全atomのproduct boundaryは `product_boundary_pending_human_decision` です。

累積receiptは95 unit／282 asset edges、残り123 unitです。全218 unitの4-product candidate denominator（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）は維持しています。semantic countsはconfirmed 6、unresolved 12、rejected 0です。product、phase authority、旧実装、縮退、failure、consumer、successorは確定していません。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲と静的分類

| unit | product候補 | direct phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-18-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 | 3 | 3470 / 204 |
| `IRUNIT-HIL-FR-18-HELIX-OS` | HELIX-OS | なし（unknown） | 1 | 3470 / 0 |
| `IRUNIT-HIL-FR-19-HELIX-HARNESS` | HELIX-HARNESS | なし（unknown） | 2 | 2726 / 0 |
| `IRUNIT-HIL-FR-19-HELIX-OS` | HELIX-OS | PHCAP-19 | 2 | 2726 / 413 |
| `IRUNIT-HIL-FR-20-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-07 | 3 | 3057 / 124 |
| `IRUNIT-HIL-FR-20-HELIX-OS` | HELIX-OS | なし（unknown） | 2 | 3057 / 0 |

phase候補がある行もcatalog上の候補であり、authorityや採用ではありません。crosswalkの縮退評価はFR18-HARNESSが `degraded_to_candidate`、FR19-OSが `degraded_to_draft`、FR20-HARNESSがPHCAP-05 `degraded_to_draft`／PHCAP-07 `not_reimplemented_formally`です。phase poolが0のproduct splitと全implementation edgeは、旧実装成立・現行実装・縮退完了を示さずunknown／unresolvedに保ちました。

## source atomの意味境界

- FR18: Prototype Builderのscreen ID、主要操作、遷移、9状態fixture、仮データ境界、再生可能な操作経路と、artifact manifest、digest、起動手順、screen/interaction/state traceを分離しました。
- FR19: prototype版、ユーザー観測、要求deltaまたは `no_delta`、L1反映先、再作成判断・walkthrough receipt・requirements deltaと、bounded反復・iteration checkpointを分離しました。
- FR20: 画面対象のartifact／walkthrough／要求反映／prototype agreement検査、非対象のskip receipt検査、G2判定とagreement／skip receipt、不足時のL1 freeze／L3 fail-close・不足codeを分離しました。

## selected old asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`です。

| unit / role | asset（classification） | static source excerpt |
|---|---|---|
| FR18-HARNESS／OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2157-2198`、raw `infinity-loop-platform-requirements.md:108` |
| FR18-HARNESS／OS / design | `335176749F6322C3CD8D`（LASPH-0439） | `ai-vision-design-harness-engine.md:24-33,37-50,95-108` |
| FR18-HARNESS／OS / implementation_source | `59E0D99F388128AEE177`（LASPH-3277） | `hybrid-vmodel-manifest.ts:125-159,410-500,502-524` |
| FR19-HARNESS／OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2200-2241`、raw `infinity-loop-platform-requirements.md:109` |
| FR19-HARNESS／OS / design | `F6E9EA3422A0EF1DF090`（LASPH-0386） | `feedback-lifecycle.md:10-25,73-95,106-125,177-188` |
| FR19-HARNESS／OS / implementation_source | `03B06987CECB57AC4AE2`（LASPH-3358） | `projection-writer.ts:792-840,2873-2889` |
| FR20-HARNESS／OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2243-2284`、raw `infinity-loop-platform-requirements.md:110` |
| FR20-HARNESS／OS / design | `535EBA960C372C61F999`（LASPH-0429） | `ux-evidence-boundary.md:17-44` |
| FR20-HARNESS／OS / implementation_source | `A85EC3703B6A61D3A7F1`（LASPH-2919） | `doctor/index.ts:1468-1501,5497-5516` |

design／implementationは候補近接の静的source evidenceです。design edgeとimplementation_source edgeは `semantic_link_status=unresolved`、`catalog_legacy_implementation_status=unknown`、`legacy_execution_status=not_run` とし、旧実装、採用、現行完了を主張していません。旧archiveのsource、判断史、failure、consumerは参照した範囲だけを保持し、新世代のbaseline、oracle、fallbackにはしません。

asset dispositionも確認しました。選択した6 assetはすべて `asset_class=Historical`、`authority_status=historical`、`disposition=unresolved`、`implementation_status=unknown`、`consumer_refs=[]` です。`src/`のimplementation候補は `reuse_exclusion_class=legacy_runtime_cli_or_adapter` を保持し、migration preconditions（semantic atom inventory、product owner decision、parent requirement binding、consumer／rights／executability／secret／external effect check）が未充足です。これは旧資産の判断史・failure・consumer closureが未確定であることを示す静的分類であり、実行や再利用許可ではありません。

## 検証境界

Wave29 schema10 verifierはrow/meta schema、main／stacked parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–28 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に確認します。authority、product boundary、phase採否、failure／consumer closure、acceptance receipt、旧asset実行はこの候補から生成しません。
