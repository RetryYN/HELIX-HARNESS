# Wave15 status

## batch state

- batch: `LEGACY-SEMANTIC-WAVE15-2026-09-21`
- parent revision: `de98b6cfe0d700cdd5027f6f0b2a2695f5d1e070`
- scope: 3 units / 7 atoms / 9 edges
- cumulative: 44 units / 132 edges / 174 units remaining
- confirmed 3 (contract 3 / design 0) / rejected 0 / unresolved 6
- authority effect: `none`; consumer closure: `pending`; new build: `false`

## phase capability crosswalk

| unit | product scope | phase | current status | legacy capability status | transition assessment |
| --- | --- | --- | --- | --- | --- |
| IRUNIT-HIL-BR-08-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04 | draft_containers | documented_with_runtime_support | degraded_to_unapproved_routing_containers |
| IRUNIT-HIL-BR-08-HELIX-HARNESS | HELIX-HARNESS | PHCAP-05 | draft | documented_with_test_design_partial | degraded_to_draft |
| IRUNIT-HIL-BR-08-HELIX-HARNESS | HELIX-HARNESS | PHCAP-09 | candidate | documented_candidate | degraded_to_rederived_candidate |
| IRCONN-HIL-BR-09-HARNESS-OS | HELIX-HARNESS／HELIX-OS | PHCAP-08 | approved_requirement_not_applied | equivalent_capabilities_found_no_explicit_wbs_asset | semantic_equivalence_unresolved |
| IRCONN-HIL-BR-09-HARNESS-OS | HELIX-HARNESS／HELIX-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap |
| IRUNIT-HIL-BR-11-HELIX-OS | HELIX-OS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally |
| IRUNIT-HIL-BR-11-HELIX-OS | HELIX-OS | PHCAP-19 | draft_requirement | implemented_with_acceptance_design_assets | degraded_to_draft |

## atom coverage receipt

| unit | atoms | contract | design confirmed | design unresolved | design rejected | design partial | implementation confirmed | implementation unresolved | implementation rejected | implementation uncovered | no evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IRUNIT-HIL-BR-08-HELIX-HARNESS | 2 | 2 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |
| IRCONN-HIL-BR-09-HARNESS-OS | 2 | 2 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |
| IRUNIT-HIL-BR-11-HELIX-OS | 3 | 3 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 1 |

BR09の2 atomはcross-product connection専用区分であり、product-exclusiveではない。接続契約の人間decisionとshared connection atomの独立reviewはpendingである。

候補assetの分類・phase候補・product候補はauthority判断へ昇格していない。candidate membershipはsemantic evidenceではない。runtime、test、hook、CI、adapterは実行していない。
