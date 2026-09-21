# Wave28 旧HELIX要求直接semantic review method（schema10）

Wave28 は、旧archiveの要求、asset catalog、design、implementation sourceを static read-only で照合する research-premise candidate です。旧runtime、旧test、旧CIは実行していません。作業対象は `/home/tenni/.helix-worktrees/legacy-semantic-review-wave28`、branchは `docs/legacy-semantic-review-wave28` です。

Wave27 は `b27e61f079edf64eeddc43eb8095159b19730b94` として既に main へ merge 済みです。Wave28 は stacked candidate ではなく、現行 `origin/main` の同一 commit を `current_tree_revision`、`parent_revision`、`source_main_base_revision`、`source_revision` とする直接候補へ rebaseline しました。main merge parents は `3df81ad27157c471e004083783f37a5860eaa2ee` と `bd468075abd1c1a95c655acdc9cd00b8fe1d898a` です。`origin/main` またはこの merge lineage が進んだ場合、停止して再読込・rebaselineします。commit、push、PR、mergeは行いません。

対象は Wave27 の FR09-HARNESS／OS、FR10-OS、FR11-HARNESS の後にある、FR12（Wave1で既レビュー）を飛ばした次の未レビュー source unit です。FR13-16 の各 HELIX-OS unit と、FR17 の HARNESS／OS product split の6 unit、18 edge（requirement 6、design 6、implementation_source 6）を選びました。各unitのsource spanは同一unit内で連続し、選択範囲には同一atomの重複はありません。FR17-HARNESSとFR17-OSは同じ requirement IDを参照しますが、source spanが分かれているため別atomとして保持し、product共有を推測していません。

累積 receipt は 89 unit／264 asset edges、残り 129 unit です。semantic counts は confirmed 6、unresolved 12、rejected 0 です。catalogの4-product candidate集合（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）と218 unit denominatorを維持し、製品、phase authority、implementation、degraded、failure、consumerは未確定です。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲、product boundary、phase候補

| unit | product scope候補 | direct phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-13-HELIX-OS` | HELIX-OS | PHCAP-08 / PHCAP-10 | 1 | 2084 / 437 |
| `IRUNIT-HIL-FR-14-HELIX-OS` | HELIX-OS | PHCAP-19 | 1 | 2451 / 413 |
| `IRUNIT-HIL-FR-15-HELIX-OS` | HELIX-OS | PHCAP-03 / PHCAP-07 | 1 | 2008 / 199 |
| `IRUNIT-HIL-FR-16-HELIX-OS` | HELIX-OS | PHCAP-04 | 1 | 2459 / 28 |
| `IRUNIT-HIL-FR-17-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-03 / PHCAP-05 / PHCAP-06 | 3 | 3153 / 279 |
| `IRUNIT-HIL-FR-17-HELIX-OS` | HELIX-OS | direct phase候補なし | 2 | 3153 / 0 |

FR13はtask-kind、verification pattern、eligible agentからworker/verifier teamを生成するatom、FR14はraw eventからpattern、recipe、shadow、skill/detector/gateへ昇格するatom、FR15はZIP docgen metadataをHELIX契約へ変換するatom、FR16はA/B inventoryとref dispositionのatomです。FR17-HARNESSはscreen applicability、prototype trigger、specialist capabilityの3 atom、FR17-OSはno-UI skip receiptとprototype/not-applicable receiptの2 atomです。全atomの `boundary_review_state` は `product_boundary_pending_human_decision` です。

## requirement source と selected old asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256 は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。

| unit / role | asset ID（classification） | exact old source / static excerpt |
|---|---|---|
| FR13-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1942-1983`、raw `infinity-loop-platform-requirements.md:103` |
| FR13-OS / design | `LEGACY-ASSET-1E1272FA8EE236C4FC4F`（LASPH-0585） | `specialist-agent-registry.md:18-35` |
| FR13-OS / implementation_source | `LEGACY-ASSET-AD7B3AF280F803882487`（LASPH-3091） | `cross-verifier.ts:1-20` |
| FR14-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:1985-2026`、raw `infinity-loop-platform-requirements.md:104` |
| FR14-OS / design | `LEGACY-ASSET-67B016392E3F7D58B053`（LASPH-0362） | `module-decomposition.md:47-52,120-123` |
| FR14-OS / implementation_source | `LEGACY-ASSET-E1937310AD75D57B1D83`（LASPH-3226） | `skill-memory-hygiene.ts:69-121` |
| FR15-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2028-2069`、raw `infinity-loop-platform-requirements.md:105` |
| FR15-OS / design | `LEGACY-ASSET-D08867CDFC82AD93E596`（LASPH-0554） | `engine-detector-execution.md:40-55,96-99` |
| FR15-OS / implementation_source | `LEGACY-ASSET-74D116A3BCB28DDB1C09`（LASPH-2969） | `document-agent-metadata.ts:47-125,204-230` |
| FR16-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2071-2112`、raw `infinity-loop-platform-requirements.md:106` |
| FR16-OS / design | `LEGACY-ASSET-77EDDD8BBB1F3863D007`（LASPH-0423） | `hybrid-rebaseline-v0.5.0-remediation-delta.md:85-91,110-124` |
| FR16-OS / implementation_source | `LEGACY-ASSET-3B0429583DCEA146D4DD`（LASPH-3190） | `legacy-adoption.ts:1-20,160-220` |
| FR17-HARNESS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2114-2155`、raw `infinity-loop-platform-requirements.md:107` |
| FR17-HARNESS / design | `LEGACY-ASSET-51B78F6A5128E2CD1448`（LASPH-0581） | `screen-applicability-prototype.md:30-65` |
| FR17-HARNESS / implementation_source | `LEGACY-ASSET-FC956FCBF42A39429E96`（LASPH-3412） | `design-elicitation.ts:1-87,170-245` |
| FR17-OS / requirement | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（LASPH-2866） | `requirements.json:2114-2155`、raw `infinity-loop-platform-requirements.md:107` |
| FR17-OS / design | `LEGACY-ASSET-51B78F6A5128E2CD1448`（LASPH-0581） | `screen-applicability-prototype.md:30-62` |
| FR17-OS / implementation_source | `LEGACY-ASSET-FC956FCBF42A39429E96`（LASPH-3412） | `design-elicitation.ts:1-87,170-245` |

design／implementationは候補近接の静的証拠であり、実装成立、実行、採用、現行authority、consumer closureを示しません。旧archiveの判断史、failure、consumerは参照対象として保持しますが、新世代のbaseline、oracle、fallbackにはしません。

## 保留と検証境界

全18 edgeでauthorityは `none`、consumer closureは `pending` です。source atomization review、product boundary、phase authority、successor assignment、current implementation、degraded／failure評価、consumer closure、acceptance receipt、実行可否を保留します。candidateから下流設計・実装やaudit運用を生成しません。

Wave28 schema10 verifier は row/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–27 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に確認します。
