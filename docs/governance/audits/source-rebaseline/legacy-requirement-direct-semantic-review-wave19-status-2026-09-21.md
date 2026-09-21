# Wave19 status（2026-09-21）

- parent / main merge: `17ce6830d2d4c684c96d55705cdc65790a4fdaa4`
- main merge parents: `4bff98789877b5b9b3b65c181a63ea1c1d826ee3`, `e40f7f778117864dc2271af323977ca6e4fd1e4c`
- Wave18 exact head: `e40f7f778117864dc2271af323977ca6e4fd1e4c`
- source base（historical）: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- units: 4
- evidence edges: 10
- confirmed / unresolved / rejected: 4 / 6 / 0
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

| unit | product | phase candidates | current | legacy | transition | unresolved boundary |
|---|---|---|---|---|---|---|
| IRUNIT-HIL-BR-23-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 / PHCAP-06 | candidate | catalog candidate | degraded_to_research_candidate | product boundary／atom／consumer pending |
| IRUNIT-HIL-BR-23-HELIX-OS | HELIX-OS | PHCAP-09 / PHCAP-19 | candidate | catalog candidate | degraded_to_research_candidate | product boundary／atom／consumer pending |
| IRUNIT-HIL-BR-24-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 / 04 / 05 / 06 | candidate | catalog candidate | degraded_to_research_candidate | product boundary／atom／consumer pending |
| IRUNIT-HIL-BR-24-HELIX-OS | HELIX-OS | none | unresolved | no direct phase/pool | unresolved_no_direct_phase_or_pool | direct phase=[]／pool=0; 2,650 candidates、2,649未review; missing design／implementation evidence |

BR23 は Template Gap feedback を HARNESS／OS間の共有候補として保持します。BR24 は要件台帳の設計責務とOS projectionの境界を保持します。BR24-OS は同じ7 anchorで2,650候補を検索し、共通requirement 1件を選択、2,649件を未reviewとして保持します。direct phase=[]／pool=0を理由に design／implementationを未選定とし、空phase／空poolから asset、phase、実装を補いません。

再baseline前の `cfff5c3c006be85b91b2b1197bc5b239528e42a8` は authorityとして使用しません。Wave18 exact input digest、main merge parent、row field／atom provenanceの固定が変わった場合は、親revision、prior fixed input digest、output digestを再計算してから verifier を再実行します。
