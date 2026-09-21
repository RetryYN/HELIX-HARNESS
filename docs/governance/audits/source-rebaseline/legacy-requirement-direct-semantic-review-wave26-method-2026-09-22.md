# Wave26 旧HELIX要求直接semantic review method（schema10）

Wave26は、旧archiveの要求、asset catalog、判断史・failure・consumer参照、design、implementation sourceを静的read-onlyで照合するresearch-premise candidateです。旧runtime、旧test、旧CIは実行していません。対象worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave26`、branchは `docs/legacy-semantic-review-wave26` です。

Wave25 exact HEAD `31b14151ce64e6e06e36e0c41d854335ac8d32eb` をcandidate lineageとして記録し、Wave25 merge後の最新 `origin/main`／current tree `d7f515ec15a19a55f98edabe22d1018a912c7760` へrebaselineしました。main merge parentsは `86989d74923a7a30c5cf503075a336bc836a18f9` と `17a321721aa5f613f64883084ef13e85648aac58` です。origin/mainまたはmerge parentが進んだ場合は停止して再読込・rebaselineします。commit、push、PR、mergeは行いません。

scopeはFR07のHARNESS／OSとFR08のOSの3 product unit、9 edge（requirement 3、design 3、implementation_source 3）です。FR06のHARNESS／OSはWave2のexact prior lineageでレビュー済みのため除外しました。FR09は4単位目にするとHARNESS／OS共有候補atomを分割するため、source atom境界を保てる3単位で停止しました。semantic countsはconfirmed 3、unresolved 6、rejected 0、累積receiptは79 unit／218 total、234 asset edges、残り139 unitです。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲とproduct boundary

| unit | product | phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-07-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-07 / PHCAP-11 / PHCAP-12 / PHCAP-13 | 1 | 1258 / 357 |
| `IRUNIT-HIL-FR-07-HELIX-OS` | HELIX-OS | PHCAP-09 / PHCAP-11 / PHCAP-12 / PHCAP-13 / PHCAP-20 | 2 | 1258 / 789 |
| `IRUNIT-HIL-FR-08-HELIX-OS` | HELIX-OS | PHCAP-10 | 1 | 1569 / 418 |

FR07はClosure GateのPR、CI、独立audit、styleへのmerge、oracle、memory compaction、子Issue状態を保持し、OS候補は `closure receipt、close可否` も保持します。`FR07-HARNESS-A01`／`FR07-OS-A01`を共有候補atomとしてholdします。FR08はready IssueのclaimとReverse／Redesign／pair-freeze前提を保持します。shared spanからproduct、successor、phase authority、connector責務を確定しません。

## sourceとselected asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。

| unit / role | asset ID（classification） | exact old source / static excerpt |
|---|---|---|
| FR07-HARNESS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1684-1725`、raw `infinity-loop-platform-requirements.md:97` |
| FR07-HARNESS / design | `LEGACY-ASSET-9E1F87AFB52388BA1A48`（LASPH-0400） | `module-drift.md:20-22` |
| FR07-HARNESS / implementation_source | `LEGACY-ASSET-54515309EF4528FEED70`（LASPH-2987） | `github-guards.ts:278-292` |
| FR07-OS / design | `LEGACY-ASSET-0604C89E6A1ECEEA98A0`（LASPH-0391） | `governance-enforcement.md:61-65` |
| FR07-OS / implementation_source | `LEGACY-ASSET-54515309EF4528FEED70`（LASPH-2987） | `github-guards.ts:278-292` |
| FR08-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1727-1768`、raw `infinity-loop-platform-requirements.md:98` |
| FR08-OS / design | `LEGACY-ASSET-3E1C053D694BC48E3017`（LASPH-0656） | `forward-infinity-orchestration.md:30-35` |
| FR08-OS / implementation_source | `LEGACY-ASSET-FC45A779AE4D3F9FE8DE`（LASPH-3102） | `pair-agent.ts:48-58` |

要求のsemantic digestはFR07が `sha256:a79c1994beaedc462b691f9b398bdd0ef9d64fb3b49678b5617c96bfa85dbbb0`、FR08が `sha256:e0118fde6e7618d078d4eeb752a429a1618da24859d31be1b4b930ae168ccf05` です。bounded global searchは4020 catalog recordsに対し、FR07各unitは1258 candidate／1255 unreviewed、FR08-OSは1569 candidate／1566 unreviewedです。phase/product poolは357、789、418です。design／implementationは候補近接であり、実装成立、実行、採用、consumer closure、authorityを示しません。

## 保留と検証境界

全9 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、shared atomのproduct boundary、phase authority、successor assignment、current implementation、consumer closure、acceptance receipt、実行可否を保留します。旧判断史・failure・consumerの未確定をclosureとは解釈しません。candidateから下流設計・実装やaudit運用を生成しません。

Wave25 schema10 verifier patternを継承し、row/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–25 prior lineage、edge／asset重複、FR06 exclusion、shared atom hold、stale-anchor negative caseを静的に確認します。
