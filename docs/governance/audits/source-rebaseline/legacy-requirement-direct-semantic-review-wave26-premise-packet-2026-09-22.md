# Wave26 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE26-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave26`
- branch: `docs/legacy-semantic-review-wave26`
- Wave25 exact candidate lineage: `31b14151ce64e6e06e36e0c41d854335ac8d32eb`
- candidate parent／current tree／main merge revision: `d7f515ec15a19a55f98edabe22d1018a912c7760`
- main merge parents: `86989d74923a7a30c5cf503075a336bc836a18f9`、`17a321721aa5f613f64883084ef13e85648aac58`
- rebaseline stop: `origin/main`またはmerge parentが進んだら停止して再読込
- scope: 3 units / 9 asset edges / 3 confirmed requirement edges / 6 unresolved candidate edges
- cumulative: 79 units / 234 asset edges / 残り139 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

FR06のHARNESS／OSはWave2の既存edgeを維持して重複追加しません。FR09を4単位目に加えると共有候補atomをsplitするため、FR07二製品unitとFR08-OSの3単位で停止しました。

## 要求sourceとatom

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。

| requirement | IR span | raw span | semantic digest |
|---|---:|---:|---|
| HIL-FR-07 | `requirements.json:1684-1725` | `:97` | `sha256:a79c1994beaedc462b691f9b398bdd0ef9d64fb3b49678b5617c96bfa85dbbb0` |
| HIL-FR-08 | `requirements.json:1727-1768` | `:98` | `sha256:e0118fde6e7618d078d4eeb752a429a1618da24859d31be1b4b930ae168ccf05` |

| unit | product | phase | atom IDs |
|---|---|---|---|
| `IRUNIT-HIL-FR-07-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-05 / PHCAP-07 / PHCAP-11 / PHCAP-12 / PHCAP-13 | `FR07-HARNESS-A01` |
| `IRUNIT-HIL-FR-07-HELIX-OS` | HELIX-OS | PHCAP-09 / PHCAP-11 / PHCAP-12 / PHCAP-13 / PHCAP-20 | `FR07-OS-A01`、`FR07-OS-A02` |
| `IRUNIT-HIL-FR-08-HELIX-OS` | HELIX-OS | PHCAP-10 | `FR08-OS-A01` |

`FR07-HARNESS-A01`／`FR07-OS-A01`はClosure Gate共有候補atomです。`FR07-OS-A02`はclosure receipt／close可否、`FR08-OS-A01`はready／claimとReverse／Redesign／pair-freeze gateです。shared atomのproduct boundaryとconnector recordは未確定です。

## selected candidate asset role

selected assetは、method文書記載の9 edgeと同一です。各excerptは `static_read_only` としてline bounds、source SHA、excerpt SHAをledgerへ固定しました。FR07各unitのbounded searchは1258 candidate／1255 unreviewed、FR08-OSは1569／1566、phase/product poolは357／789／418です。6つのdesign／implementation edgeは semantic link `unresolved`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false` です。

旧archiveのruntime、test、CIは実行していません。旧assetの判断史・failure・consumerはcatalogのpending／unknownを保持し、current authorityへ再利用しません。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、acceptance receipt、shared atomの独立判断を未確定のまま保持します。candidateは正式採否・下流利用へ昇格しません。`origin/main`またはmerge parentが変化した場合はrebaseline stop conditionを適用し、commit、push、PR、merge、Issue操作は行いません。
