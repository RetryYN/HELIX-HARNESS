# Wave23 旧HELIX要求直接semantic review method（schema10）

## 対象と固定系譜

Wave23は、旧archiveの要求、旧asset catalog、旧design、旧implementation sourceを静的read-onlyで照合する research-premise candidate の下書きです。対象は連続した未review product unitの先頭2件、HIL-FR01とHIL-FR02（いずれも HELIX-OS）です。旧runtime、旧test、旧CIは実行しません。独立worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave23`、branchは `docs/legacy-semantic-review-wave23` です。

固定baselineは最新main `c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3` です。merge parentsは `ac54c3f9008bb501d6f0c501e66137c21cd5f149` と `30e87714ef09c89258a93bbbd5567ea753fbbf96` です。Wave22のledger/meta、Wave1–22のprior batch、現行catalog／decomposition／crosswalk／phase inventory、archive manifestを入力digestとして固定しました。

scopeは2 product unit、6 asset edge（requirement 2、design 2、implementation_source 2）です。requirement edgeは2 confirmed、候補asset edgeは4 unresolved、rejectedは0です。累積は72 unit／213 edge、残り146 unitです。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とproduct boundary

| unit | product | phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-01-HELIX-OS` | HELIX-OS | PHCAP-06 / 09 / 10 / 11 / 12 / 13 / 18 | 3 | 193 / 1068 |
| `IRUNIT-HIL-FR-02-HELIX-OS` | HELIX-OS | PHCAP-12 | 3 | 116 / 147 |

HIL-FR01とHIL-FR02はdecompositionのproduct unit候補をそのまま保持し、いずれも product boundary、source atomization、phase authority、successor assignment、consumer closureを確定しません。shared atomとconnector recordは空です。候補unitの存在からWeb、Web-OS、HARNESSへの責務を推定しません。

## sourceと候補assetの扱い

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、requirements IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | statement semantic digest |
|---|---:|---:|---|
| HIL-FR-01 | `requirements.json:1426-1467` | `infinity-loop-platform-requirements.md:91` | `sha256:bf1e51a051e81e130843ed584640fcc1df69d9b5d84f22f22aa29c261b03c3b7` |
| HIL-FR-02 | `requirements.json:1469-1510` | `infinity-loop-platform-requirements.md:92` | `sha256:022383e2542716540cf4fc42ef8d52b58606a03fdf50eb77de378a5d374236b7` |

candidate membershipはcatalog source pathへのbounded anchor any-matchとphase/product poolの照合結果です。candidate ID digest、未review ID digest、selected ID、source path、line bounds、excerpt SHAをledger/metaへ固定しました。FR02のimplementation sourceは直接のphase/product候補として選択され、要求anchorのbody any-match集合には含まれないため、unreviewed digestはcandidate集合から選択集合との交差だけを除いて計算しています。この選択はsemantic evidenceや実装成立を意味しません。選択assetは静的candidate roleとしてのみ保持し、phase capability、design、implementation sourceの存在をcurrent implementation、completion、authority、consumer closureへ昇格しません。

## bounded searchと選択asset

| unit / role | asset ID | exact old source |
|---|---|---|
| FR01-OS / design | `LEGACY-ASSET-BB08D70A42B6445B2D1E` | `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` |
| FR01-OS / implementation_source | `LEGACY-ASSET-3FEC0B8E1BD14109D214` | `src/state-db/github-execution-episode.ts` |
| FR02-OS / design | `LEGACY-ASSET-944C5027F71733A26597` | `docs/design/helix/L6-function-design/github-execution-episode-state.md` |
| FR02-OS / implementation_source | `LEGACY-ASSET-DFF9BADFBFC93A632EBA` | `src/runtime/continuation.ts` |

FR01のsource statementは `InfinityLoopEvent` の状態遷移、入力commit/tree digestと前段receiptへのbind、append-only event・current state・parent/cause IDです。FR02のsource statementはPR hook intakeでrepository/PR/head SHA/event delivery IDを正規化し、同一deliveryを一度だけaudit queueへ登録し、audit jobとidempotency receiptを持つことです。各statementを3 atomへ分解し、atomのliteral textとsource span indexをdecompositionからledgerへ引き継ぎました。

FR02 implementation sourceはphase/product candidateとして選択していますが、抜粋にhook intakeの直接実装語が揃うとは扱わず、候補証拠の不足を `unresolved` として保持します。FR01/FR02のdesignおよびimplementation_source edgeは、excerptが要求の一部語を示しても実装成立を示しません。

## 保留と検証境界

全6 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、product routing、phase authority、successor assignment、current implementation、consumer closure、missing acceptance receiptを保留します。候補から採否、下流設計・実装、provider配送、audit運用へ進みません。

Wave22 patternのschema10 static verifierを継承し、unknown row/meta key、source SHA、exact line excerpt、requirement atom grounding、candidate atom provenance、bounded search receipt、prior lineage、selected asset edge重複、stale anchorのnegative caseを検査します。検証は文書revision、ID対応、参照、責務境界のstatic確認に限定し、旧archiveのruntime、test、CIは実行しません。
