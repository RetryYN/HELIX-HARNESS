# Wave30 旧HELIX要求直接semantic review method（schema10）

Wave30は、旧archiveの要求、asset catalog、design、implementation sourceをstatic read-onlyで照合するresearch-premise candidateです。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave30`、branchは `docs/legacy-semantic-review-wave30` です。旧runtime、旧test、旧CIは実行していません。

Wave29 Draft PR #1983の再ベース後 exact HEADを `bc42927178980f1bb210e33177cf5feee8442b5b` に固定し、`origin/main` の `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` をmain baseとするstacked候補にしました。`current_tree_revision`、`parent_revision`、`stacked_pr_parent_revision`、`source_revision` はWave29 exact HEAD、`source_main_base_revision` と `main_merge_revision` は現行mainです。mainのmerge parentsは `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11`、`d272a97b3e55401fa75ad41670fbeefd18f8a4cf` です。mainまたはWave29 exact HEADが変わった場合は停止し、入力digestと親系譜を再baselineします。作成側はmergeを行いません。

Wave29後の次の未レビュー要求atom境界から、FR21 OS、FR22 HARNESS／OS、FR23 OSの4 product unit、12 edge（requirement 4、design 4、implementation_source 4）を選択しました。FR21 OSは1 atom、FR22 HARNESS／OSは各2 atom、FR23 OSは1 atomです。source spanの共有は確認されず、全atomのproduct boundaryは `product_boundary_pending_human_decision` です。

累積receiptは99 unit／294 asset edges、残り119 unitです。全218 unitの4-product candidate denominator（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）は維持しています。semantic countsはconfirmed 4、unresolved 8、rejected 0です。product、phase authority、旧実装、縮退、failure、consumer、successorは確定していません。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲と静的分類

| unit | product候補 | direct phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-21-HELIX-OS` | HELIX-OS | なし（unknown） | 1 | 3499 / 0 |
| `IRUNIT-HIL-FR-22-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-07 | 2 | 3054 / 103 |
| `IRUNIT-HIL-FR-22-HELIX-OS` | HELIX-OS | PHCAP-07 | 2 | 3054 / 142 |
| `IRUNIT-HIL-FR-23-HELIX-OS` | HELIX-OS | なし（unknown） | 1 | 3536 / 0 |

phase候補がある行もcatalog上の候補であり、authorityや採用ではありません。FR22のcrosswalkは `current_status=candidate_only`、`legacy_capability_status=documented_with_test_design`、`transition_assessment=not_reimplemented_formally` です。phase poolが0のproduct splitと全implementation edgeは、旧実装成立・現行実装・縮退完了を示さずunknown／unresolvedに保ちました。

## source atomの意味境界

- FR21 OS: Source Snapshot Manifestのidentity、namespace、A/B digest、refからentryまでのedge、sealed receipt、source/tree digest、stale判定を一つのsource spanとして保持しました。
- FR22 HARNESS: capabilityごとの一意ID、`adopt/harden/redesign/reject/absorbed`、根拠とHIL／design／test／detectorの双方向join、およびcapability ledger／coverage matrixを分離しました。
- FR22 OS: 未判断・根拠なしreject・孤立capability・複合ID一括合格時のpair-freeze拒否とfailure codeを分離しました。
- FR23 OS: Product Data Connector Registryのsource／connector／schema／credential reference／classification／read-write／sync／owner／enabledと、credential値を保存しない契約、digest／enable-disable receiptを一つのsource spanとして保持しました。

## selected old asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。

| unit / role | asset（classification） | static source excerpt |
|---|---|---|
| FR21 OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2286-2328`、raw `infinity-loop-platform-requirements.md:111` |
| FR21 OS / design | `48A992A1B3B2B0F8B458`（LASPH-0584） | `source-capability-capture.md:24-49,55-62` |
| FR21 OS / implementation_source | `41C752D10BF2ECC0B092`（LASPH-3064） | `source-ledger-freshness.ts:1-13,47-68` |
| FR22 HARNESS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2329-2371`、raw `infinity-loop-platform-requirements.md:112` |
| FR22 HARNESS / design | `4674004EAE02B2811AE0`（LASPH-0434） | `vmodel-layer-coverage.md:128-148,159-173` |
| FR22 HARNESS / implementation_source | `B5C4F0A803AA80593EB0`（LASPH-2964） | `design-coverage.ts:6-14,206-260` |
| FR22 OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2329-2371`、raw `infinity-loop-platform-requirements.md:112` |
| FR22 OS / design | `4674004EAE02B2811AE0`（LASPH-0434） | `vmodel-layer-coverage.md:128-148,159-173` |
| FR22 OS / implementation_source | `B5C4F0A803AA80593EB0`（LASPH-2964） | `design-coverage.ts:6-14,206-260` |
| FR23 OS / requirement | `A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2372-2414`、raw `infinity-loop-platform-requirements.md:113` |
| FR23 OS / design | `310E87378AFE8095809C`（LASPH-0363） | `physical-data.md:126-140,247-253` |
| FR23 OS / implementation_source | `44C4FC0A3896A110ACE9`（LASPH-2958） | `db-projection-ingestion.ts:1-14,138-166` |

design／implementationは候補近接の静的source evidenceです。design edgeとimplementation_source edgeは `semantic_link_status=unresolved`、`catalog_legacy_implementation_status=unknown`、`legacy_execution_status=not_run` とし、旧実装、採用、現行完了を主張していません。FR23 designはproduct connector専用設計ではなく、freshな物理schema／projection候補であり、connector要件との直接意味一致は未確定です。旧archiveのsource、判断史、failure、consumerは参照した範囲だけを保持し、新世代のbaseline、oracle、fallbackにはしません。

選択したassetはWave1–29の旧implementation／design assetと重複しないことを確認しました。catalog／dispositionでは `asset_class=Historical`、`authority_status=historical`、`disposition=unresolved`、`implementation_status=unknown`、`consumer_refs=[]` を保持しています。`src/`のimplementation候補は `reuse_exclusion_class=legacy_runtime_cli_or_adapter` を保持し、migration preconditions（semantic atom inventory、product owner decision、parent requirement binding、consumer／rights／executability／secret／external effect check）は未充足です。これは静的分類であり、旧資産の実行や再利用許可ではありません。

## 検証境界

Wave30 schema10 verifierはrow/meta schema、main／stacked parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–29 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に確認します。authority、product boundary、phase採否、failure／consumer closure、acceptance receipt、旧asset実行はこの候補から生成しません。
