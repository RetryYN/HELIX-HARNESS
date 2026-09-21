# Wave27 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE27-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave27`
- branch: `docs/legacy-semantic-review-wave27`
- Wave26 merged lineage: main merge parent `49ed8acf548fa2ee599a9787c2e5cee85763001f`
- candidate parent／current tree／main merge revision: `3df81ad27157c471e004083783f37a5860eaa2ee`
- main merge parents: `d7f515ec15a19a55f98edabe22d1018a912c7760`、`49ed8acf548fa2ee599a9787c2e5cee85763001f`
- rebaseline stop: `origin/main`またはmerge parentが進んだら停止して再読込
- scope: 4 units / 12 asset edges / 4 confirmed requirement edges / 8 unresolved candidate edges
- cumulative: 83 units / 246 asset edges / 残り135 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

Wave1–26の既レビューunitと実装asset edgeは再追加しません。FR09-HARNESS／OSを共有receipt atomを保つ一組として選び、FR10-OSとFR11-HARNESSを続けました。FR09共有atomを分割する追加unitや、製品境界を推測する追加edgeは採用していません。

## 要求sourceとatom

| requirement | IR span | raw span | semantic digest |
|---|---:|---:|---|
| HIL-FR-09 | `requirements.json:1770-1811` | `:99` | `sha256:5594aeaf9047a9dd14646c862da184acf810231d961af8cdadeebf2e54d407c3` |
| HIL-FR-10 | `requirements.json:1813-1855` | `:100` | `sha256:1fbb80b64b2182063ff3a301d80e56bace634c8b9e362d61d860c6cbc54bcd65` |
| HIL-FR-11 | `requirements.json:1856-1897` | `:101` | `sha256:2e149ad2069ec8f3a8e5c8138b31bf34bbd5ad2c6830dd4c35c4d19536b9ead6` |

| unit | product scope candidate | phase | atom IDs |
|---|---|---|---|
| `IRUNIT-HIL-FR-09-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-12 | `FR09-HARNESS-A01`–`A06` |
| `IRUNIT-HIL-FR-09-HELIX-OS` | HELIX-OS | PHCAP-12 | `FR09-OS-A01`、`A02` |
| `IRUNIT-HIL-FR-10-HELIX-OS` | HELIX-OS | PHCAP-20 | `FR10-OS-A01` |
| `IRUNIT-HIL-FR-11-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-06 / PHCAP-07 / PHCAP-08 | `FR11-HARNESS-A01` |

`FR09-HARNESS-A06`／`FR09-OS-A02`は `typed非終端disposition receipt` の共有候補atomです。FR10、FR11のatomはこの4-unit範囲では他unitと共有しません。全atomの `boundary_review_state` は `product_boundary_pending_human_decision` で、connector recordは空です。

## selected candidate asset role

selected assetは method 文書記載の12 edgeと同一です。各excerptは `static_read_only` としてline bounds、source SHA、excerpt SHAをledgerへ固定しました。bounded searchはFR09-HARNESS／OSが2185 candidate／2182 unreviewed、FR10-OSが1618／1615、FR11-HARNESSが2565／2562です。phase/product poolは110、147、488、314です。design／implementationの8 edgeは semantic link `unresolved`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false` です。

旧archiveのruntime、test、CIは実行していません。旧assetの判断史・failure・consumerはcatalogのpending／unknownを保持し、current authorityへ再利用しません。4-product candidate集合（`HELIX-HARNESS`、`HELIX-OS`、`HELIX-Web`、`HELIX-Web-OS`）と全218 unit denominatorを維持し、product、phase、implementation、degraded、failure、consumerの完了を導出していません。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、degraded／failure assessment、acceptance receipt、shared atomの独立判断を未確定のまま保持します。candidateは正式採否・下流利用へ昇格しません。`origin/main`またはmerge parentが変化した場合はrebaseline stop conditionを適用し、commit、push、PR、merge、Issue操作は行いません。
