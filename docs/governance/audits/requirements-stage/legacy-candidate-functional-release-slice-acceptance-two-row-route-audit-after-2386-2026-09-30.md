# Functional Release Slice acceptance: 2行のroute監査案

- 監査ID: `legacy-candidate-functional-release-slice-acceptance-two-row-route-audit-after-2386-2026-09-30`
- 基点: `0f5050e2b25cd622640c99c5de170cca087f7d8a`（#2386 merge後）
- authority effect: none
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`（SHA-256 `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee`）
- 固定比較: `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の採択済HARNESS L2/L11 bytesと、HARNESS PO decision record。

| Source ID | 旧source位置 | Route | 採択済L2 ID | 直接一致と残差 |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-002076` | acceptance:66 | partial | HARNESS-L2-017、HARNESS-L2-022 | L2-017 / L11:212はRelease Port適格性、検証済み成果物、再現、rollbackを規定し、L2-022 / L11:217はIntegrated→Verified→Acceptedの段階と証拠を分ける。旧文の実証順のうちqualificationからrelease eligibility、rollbackと段階証拠への重なりがある。旧順序全体、#397 IR admission、FRS固有schema/registry/composition/qualification、およびCI・consumer・replay・read-afterの厳密な順序は採択済み述語にない。 |
| `LEGACY-CAND-LINE-002077` | acceptance:67 | partial | HARNESS-L2-005、HARNESS-L2-022 | L2-005 / L11:25, 46–51は検証義務・oracle・expected failure・証拠を定め、L11:47は必須oracle欠落、unknownのN/A化、expected failure/差戻し先欠落を拒否する。L2-022 / L11:217は段階別証拠とcounterexampleによる受入を定め、段階飛越を拒否する。旧文のnegative/unknown failure確認と一部が直接重なる。FRS固有の全negative mutation集合、独立実行の条件、stale固有oracle、未承認writeの具体例は残る。 |

## 母集団とunion

両IDは#2353 baseline full row records上で `condition/product_requirement_atom/unknown` であり、#2385のmetadata overlay 7行には含まれず、#2386後の471行product/unknown poolに残る。#2386前のproduct route unionは341 ID（pool交差312）、all-route unionは371 ID（うちHMCのpool外30 ID）。この2 IDは各unionおよび#2386のDGH 7 IDと交差しない。本監査案を加えるとproduct route unionは343、all-route unionは373、pool交差は314、未監査poolは157となる。

## authority境界と限界

旧文のfrontmatterは `draft_candidate`。§0はv0.2差分の承認を受入条件に限定し、implementation acceptance、independent review、canonical promotion、#397 IR admission、publish/cutoverの成立を明示的に否定する。現在の比較はPO decisionと固定L2/L11 bytesに従い、旧candidate metadataから現authorityを生成しない。この監査案はsuccessor、source全体のcoverage、受入実行、実装、Stage 5完了を意味しない。旧workflow、CLI、hook、adapter、test、CI、runtimeは実行していない。
