# Wave31 旧HELIX要求直接semantic review method（schema10）

Wave31は旧archiveの要求、asset catalog、design、implementation sourceをstatic read-onlyで照合するresearch-premise candidateです。専用worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave31`、branchは `docs/legacy-semantic-review-wave31` です。旧runtime、旧test、旧CIは実行していません。

Wave30 exact HEAD `f07aaa41ecc0c9098c6421049b0f4df5f0b8da6a` を親に固定し、固定main baseは `1c6912ad34b9a7950206188ad364e3a712dc9e6b` です。main merge parentsは `b27e61f079edf64eeddc43eb8095159b19730b94`、`a05b9f5444ba11626823683cc486db95c9d1f3a3` です。現在のorigin/mainは `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11`（作業開始時の観測は `43bd941b...`）へ進んでおり、固定mainとの差分があるため本候補はstale保留です。固定mainまたはWave30 exact parentが変わった場合は停止し、入力digestと親系譜を再baselineします。

Wave30後の次の未レビュー要求atom境界から、FR24 OS、FR25 OS、FR26 OS、FR27 OSの4 product unit、12 edge（requirement 4、design 4、implementation_source 4）を選択しました。各unitは1 atom、source span共有なし、product boundaryは `product_boundary_pending_human_decision` です。

累積receiptは103 unit／306 asset edges、残り115 unitです。4-product candidate denominator（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）は維持しています。semantic countsはconfirmed 4、unresolved 8、rejected 0です。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 連続範囲と静的分類

| unit | product候補 | direct phase候補 | atom数 | bounded candidate / phase-product pool |
|---|---|---|---:|---:|
| `IRUNIT-HIL-FR-24-HELIX-OS` | HELIX-OS | なし（unknown） | 1 | 再計算済み / 0 |
| `IRUNIT-HIL-FR-25-HELIX-OS` | HELIX-OS | PHCAP-10 | 1 | 再計算済み / 418 |
| `IRUNIT-HIL-FR-26-HELIX-OS` | HELIX-OS | PHCAP-07 | 1 | 再計算済み / 142 |
| `IRUNIT-HIL-FR-27-HELIX-OS` | HELIX-OS | PHCAP-10 | 1 | 再計算済み / 418 |

phase候補はcatalog上の候補でありauthorityや採用ではありません。FR24のphase poolは0で、FR25／FR27は `current_status=draft_requirement_and_bootstrap_decision`、FR26は `current_status=candidate_only` です。phase、product boundary、旧実装、縮退、failure、consumer、successorは未確定のまま保持しました。

## source atomの意味境界

- FR24 OS: full／incremental snapshot、source recordからcanonical entityへのmapping、provenance、freshness、tombstone、schema drift、read projectionを一つのatomとして保持しました。
- FR25 OS: ZIP由来build、agent metadata、assignment、schedule、trace、impact、versioned capability、run／artifact／digest／exit statusを一つのatomとして保持しました。
- FR26 OS: detector registry／runner、spec／schema／trace／consistency／file／metadata detector、finding code、severity、location、evidence、versionを一つのatomとして保持しました。
- FR27 OS: Node／Python Supervisor、worker起動、protocol handshake、request相関、progress、result、error、timeout、cancel、終了、失効runのlate result fencingを一つのatomとして保持しました。

## selected old asset

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`LASPH-2866`）、requirements IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。FR24は `9BCBB3FAE96629A0297C`／`77A70068271118050C5F`、FR25は `28B47108797C610AE0BC`／`65623783877D38E779BC`、FR26は `28B47108797C610AE0BC`／`A1918FF3AB1C2FC43DD2`、FR27は `FA37B89CBB3EBE4E9E8C`／`D1CCFACACCDB6FC251AE` を design／implementation_source候補として参照します。

design／implementation edgeは `semantic_link_status=unresolved`、implementation statusは `unknown`、legacy executionは `not_run` とし、旧実装・採用・現行完了を主張していません。選択assetはWave1–30の非requirement assetと重複しません。旧archiveはsource、判断史、failure、consumerを調べるreferenceとしてだけ読み、新世代baseline、oracle、fallbackにはしません。

## 検証境界

Wave31 schema10 verifierはrow/meta schema、固定main／Wave30 parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、Wave1–30 prior lineage、edge／asset重複、shared atom hold、stale-anchor negative caseを静的に確認します。現在mainが固定baseから進んでいるため、rebaseline完了までは下流実装へ進まず候補を保留します。push、PR、merge、Issue操作は行いません。

固定main `1c6912ad...` から観測main `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11` への変更11 pathは `scaffold/` 配下だけで、Wave31が捕捉したarchive manifest、requirements IR、要求source、asset catalog、decomposition、crosswalk、phase inventoryとは交差しませんでした。この無交差を静的に確認したうえで、候補ledgerは固定mainとWave30 exact parentに対して検証しています。mainまたはparentの変更を無条件に採用せず、次回stack前に再baselineします。
