# Wave27 旧HELIX要求直接semantic review method（schema10）

Wave27は、旧archiveの要求、asset catalog、design、implementation sourceを静的read-onlyで照合する research-premise candidate です。旧runtime、旧test、旧CIは実行していません。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave27`、branchは `docs/legacy-semantic-review-wave27` です。

Wave26のmerged lineageを main merge parent `49ed8acf548fa2ee599a9787c2e5cee85763001f` として引き継ぎ、current main `3df81ad27157c471e004083783f37a5860eaa2ee` にrebaselineしました。main merge parentsは `d7f515ec15a19a55f98edabe22d1018a912c7760` と `49ed8acf548fa2ee599a9787c2e5cee85763001f` です。origin/mainまたはmerge parentが進んだ場合は停止して再読込・rebaselineします。commit、push、PR、mergeは行いません。

scopeはFR09のHARNESS／OS、FR10-OS、FR11-HARNESSの4 product unit、12 edge（requirement 4、design 4、implementation_source 4）です。FR09-HARNESS／OSの `typed非終端disposition receipt` は同一source atomを共有するため両unitを同時に保持しました。FR10とFR11はこのsource範囲で他unitと共有しないため、4 unitで停止しました。Wave1–26の既レビューunitおよび実装asset edgeは重複追加していません。semantic countsはconfirmed 4、unresolved 8、rejected 0、累積receiptは83 unit／246 asset edges、残り135 unitです。catalogの4-product candidate集合（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）と218 unit denominatorを保持し、製品境界、phase authority、implementation、degraded、failure、consumerは未確定です。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とproduct boundary

| unit | decomposition product scope | direct phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-09-HELIX-HARNESS` | HELIX-HARNESS候補 | PHCAP-12 | 6 | 2185 / 110 |
| `IRUNIT-HIL-FR-09-HELIX-OS` | HELIX-OS候補 | PHCAP-12 | 2 | 2185 / 147 |
| `IRUNIT-HIL-FR-10-HELIX-OS` | HELIX-OS候補 | PHCAP-20 | 1 | 1618 / 488 |
| `IRUNIT-HIL-FR-11-HELIX-HARNESS` | HELIX-HARNESS候補 | PHCAP-06 / PHCAP-07 / PHCAP-08 | 1 | 2565 / 314 |

FR09-HARNESSは監査actor、finding disposition、current contract／successor境界、非終端review、typed receiptを保持します。FR09-OSはrelation／coverage／impactとtyped receiptを保持します。`FR09-HARNESS-A06`／`FR09-OS-A02`を共有候補atomとしてholdします。FR10-OSはIssue admissionとCodex completionのmemory event、promote／supersede／no-promotionを保持し、FR11-HARNESSはruntime中立agent contractのregistry語彙を保持します。shared spanからproduct、successor、phase authority、connector責務を確定しません。

## sourceとselected asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。

| unit / role | asset ID（classification） | exact old source / static excerpt |
|---|---|---|
| FR09-HARNESS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1770-1811`、raw `infinity-loop-platform-requirements.md:99` |
| FR09-HARNESS / design | `LEGACY-ASSET-ACDA251E358A7F419507`（LASPH-0394） | `handover-retirement.md:21-30` |
| FR09-HARNESS / implementation_source | `LEGACY-ASSET-1B131E1B4D35900C81F0`（LASPH-3042） | `relation-graph.ts:141-225,371-430` |
| FR09-OS / design | `LEGACY-ASSET-ACDA251E358A7F419507`（LASPH-0394） | `handover-retirement.md:21-30` |
| FR09-OS / implementation_source | `LEGACY-ASSET-1B131E1B4D35900C81F0`（LASPH-3042） | `relation-graph.ts:141-225,371-430` |
| FR10-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1813-1855`、raw `infinity-loop-platform-requirements.md:100` |
| FR10-OS / design | `LEGACY-ASSET-E2208C8FDEDCABF63A79`（LASPH-0693） | `orchestration-memory.md:96-122` |
| FR10-OS / implementation_source | `LEGACY-ASSET-AB9A16E8A8DB2F094CC5`（LASPH-3087） | `memory-store.ts:12-40` |
| FR11-HARNESS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1856-1897`、raw `infinity-loop-platform-requirements.md:101` |
| FR11-HARNESS / design | `LEGACY-ASSET-99C939E249CAF40935CB`（LASPH-0352） | `architecture.md:67-76,109-115` |
| FR11-HARNESS / implementation_source | `LEGACY-ASSET-617D1B11905560615D04`（LASPH-3060） | `skill-assignment.ts:28-50` |

要求のsemantic digestはFR09が `sha256:5594aeaf9047a9dd14646c862da184acf810231d961af8cdadeebf2e54d407c3`、FR10が `sha256:1fbb80b64b2182063ff3a301d80e56bace634c8b9e362d61d860c6cbc54bcd65`、FR11が `sha256:2e149ad2069ec8f3a8e5c8138b31bf34bbd5ad2c6830dd4c35c4d19536b9ead6` です。bounded global searchは4020 catalog recordsに対し、FR09各unitは2185 candidate、FR10-OSは1618、FR11-HARNESSは2565です。phase/product poolはそれぞれ110、147、488、314です。design／implementationは候補近接であり、実装成立、実行、採用、consumer closure、authorityを示しません。

## 保留と検証境界

全12 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、FR09共有atomのproduct boundary、phase authority、successor assignment、current implementation、degraded／failure評価、consumer closure、acceptance receipt、実行可否を保留します。旧判断史・failure・consumerの未確定をclosureとは解釈しません。candidateから下流設計・実装やaudit運用を生成しません。

Wave26 verifier patternを継承した Wave27 schema10 verifier は、row/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–26 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に確認します。
