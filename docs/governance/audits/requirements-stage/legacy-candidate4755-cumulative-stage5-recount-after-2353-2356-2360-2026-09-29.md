# 旧candidate Stage 5 累積再集計と#2359再標本化

- audit id: `legacy-candidate4755-cumulative-stage5-recount-after-2353-2356-2360-2026-09-29`
- 対象: `origin/main` `bf00aca56add8ca29d9a56af9a989fdeb0a7d969` の4,755 source rowsに、#2353/#2356/#2360のexact overlay proposalを適用した機械集計。R2361-02の件数・再標本化補正を反映済み。R2361-01（#2353/#2356/#2360のmerged pinと最新main basisへの更新）は#2360 merge後に実施するため保留。
- authority effect: `none`。分類、subtype、routeラベルは監査proposalの有効値であり、要求採択・successor・source coverage・受入・Stage 5完了を示さない。
- 方法: #2353 JSONの4,755 `row_records`を全件読み、#2356の9 IDs、#2360の7 IDsを完全一致の`source_item_id`で適用し、重複なく再集計した。row identity・archive line digestは同JSONの固定入力に依存する。

## 累積件数

| effective classification | #2353 | #2356差分 | #2360差分 | 累積 |
|---|---:|---:|---:|---:|
| structure | 926 | 0 | 0 | 926 |
| explanation | 2,918 | +8 | +2 | 2,928 |
| condition | 911 | -8 | -2 | 901 |
| **total** | **4,755** | **0** | **0** | **4,755** |

| condition subtype | #2353 | #2356差分 | #2360差分 | 累積 |
|---|---:|---:|---:|---:|
| product_requirement_atom | 904 | -9 | -2 | 893 |
| management_process_condition | 6 | +1 | 0 | 7 |
| concept_condition | 1 | 0 | 0 | 1 |

| route status（condition内） | #2353 | #2356差分 | #2360差分 | 累積 |
|---|---:|---:|---:|---:|
| unknown | 559 | -9 | -5 | 545 |
| source_relation_coverage_unresolved | 141 | 0 | 0 | 141 |
| unadopted_candidate_relation_only | 162 | 0 | 0 | 162 |
| adopted_relevant_partial | 24 | 0 | +3 | 27 |
| partial | 16 | 0 | 0 | 16 |
| management_successor_unresolved | 6 | +1 | 0 | 7 |
| unresolved | 2 | 0 | 0 | 2 |
| outside_product_route_population | 0 | 0 | 0 | 0 |
| covered_limited | 1 | 0 | 0 | 1 |
| **condition total** | **911** | **0** | **0** | **901** |

product subtypeは`893 = known 349 + unknown 544`。#2356はproduct/unknown 9行を8 explanationと1 management conditionへ移した。#2360は000142/143/331をproduct/unknownから`adopted_relevant_partial`へ移し、000476/477をexplanationへ移す一方、000180はproduct subtype・unknown routeのまま保持したため、product/unknownはさらに5減った（うち3行はroute status変更）。`known`はunknown以外のroute labelの件数で、coverageや採択を意味しない。

## #2359の20行再標本化

#2359 exact HEAD `4096b10020fd75fe8fc4f200855f27435912fc6f`の元20行から、#2360でproduct-unknown条件から外れた000142・000143・000331・000476・000477を除外し、000180を含む残る15行を維持した。#2350のoriginal 20 IDs、#2356の9 reclassification IDs、および#2359の元sample IDsを除外集合とし、累積後の`condition / product_requirement_atom / unknown`からsource ID昇順で補充した。残るunknown母集団は544行、既監査IDを除いた候補は528行。

補充IDは次の5件。source path/lineとfile・line digestはrouterおよびarchive原文と照合した。relationは評価しておらず、coveredまたはroute knownとしていない。

| source ID | archive source line | file SHA-256 | source line SHA-256 (line ending excluded) |
|---|---|---|---|
| `LEGACY-CAND-LINE-000492` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:18` | `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc` | `59574435a104ef3b087ee55aae7d0b6b5dd67fa50bc9710085d420b37cfc2526` |
| `LEGACY-CAND-LINE-000496` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:23` | `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc` | `54da727c33e1c968dde952d86d8c87554125586c0933489b3f6fdbafd3979f8a` |
| `LEGACY-CAND-LINE-000497` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:24` | `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc` | `42f14d5e3d614691ce97ac6ad86307e00cde4e2638c74d13b512a9b1576cb621` |
| `LEGACY-CAND-LINE-000499` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:28` | `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc` | `ec626939ed95bf2fe355d787c4e39f80f6ab28d73d1b0645631297a6df02c9e0` |
| `LEGACY-CAND-LINE-000500` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:29` | `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc` | `71b9164791062edec41697b3ed306f6f6bcb46b56fa608261765691a4e42e4a4` |

更新後の20 source IDはJSONに固定した。元標本の`original_head`と`original_selected_ids`は履歴として保持し、除外・維持・補充の結果のみを更新した。維持した行の#2359評価ラベルは限定的な監査ラベルのままであり、この再集計では変更しない。

## Authority snapshot

`HELIXINTELLIGENCE-L2-073`の対象exact L2/L11 revisionは、2026-09-29のPO判断記録`MPR-RC-HELIXINTELLIGENCE-L2-073-002`（判断表86行）で採択された。 判断記録が固定するL2節digestは `sha256:4425189d3870de92165ebdbc790902317dc2799d89f760156ab17441662a2eb5`、L11節digestは `sha256:d98488d23fc02992143edb4a1e689a0c12dcc91d0ec1c9adabe1b8e334dd9ef1`。現行本文のcandidate表記と旧receiptの状態は判断前の記録であり、この対象revisionの判断を上書きしない。この項目から旧行のrelationを付与しない。

## 静的検証

4,755 unique row IDsの全件再集計、両overlay ID集合の重複・適用確認、合計・route subtype内訳の検算、#2359の残存15件と補充5件の再現、archive physical-line bytesとのSHA-256照合を行った。旧runtime、CLI、test、hook、CIは実行していない。
