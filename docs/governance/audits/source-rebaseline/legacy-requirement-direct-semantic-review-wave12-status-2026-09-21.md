# Wave12 status（2026-09-21）

- batch: `LEGACY-SEMANTIC-WAVE12-2026-09-21`
- parent: `1c6062e4922b01bc0584aa76e902b737b65da25d`
- schema: 10
- authority_effect: none / legacy_execution_performed: false / new_build_allowed: false
- batch edges: confirmed 4 (contract 3 / design 1) / rejected 3 / unresolved 2
- cumulative: 35 units / 105 edges / 183 units remaining

| unit | product | phase | current_status | legacy_capability_status | transition_assessment |
|---|---|---|---|---|---|
| IRUNIT-HIL-BR-07-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04 | draft_containers | documented_with_runtime_support | degraded_to_unapproved_routing_containers |
| IRUNIT-HIL-BR-07-HELIX-HARNESS | HELIX-HARNESS | PHCAP-12 | scaffold_operating | implemented_with_tests | degraded_to_operating_contract_and_gui_scaffold |
| IRUNIT-HIL-BR-21-HELIX-HARNESS | HELIX-HARNESS | PHCAP-18 | requirement_candidate | implemented_with_tests | degraded_to_candidate |
| IRUNIT-HIL-FR-45-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 | candidate | implemented_partial | degraded_to_candidate |
| IRUNIT-HIL-FR-45-HELIX-HARNESS | HELIX-HARNESS | PHCAP-05 | draft | documented_with_test_design_partial | degraded_to_draft |

| unit | atoms | contract | design confirmed | design unresolved | design rejected assets | design pending-kind atoms | implementation confirmed | implementation unresolved | implementation rejected assets | implementation uncovered | no evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| IRUNIT-HIL-BR-07-HELIX-HARNESS | 3 | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 3 | 3 |
| IRUNIT-HIL-BR-21-HELIX-HARNESS | 3 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 1 |
| IRUNIT-HIL-FR-45-HELIX-HARNESS | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 5 |

詳細なbounded search receiptはmetaに固定した。candidate membershipはsemantic evidenceではない。対象はHELIX-HARNESSだけで、shared source spanは0、製品境界decisionはpendingである。currentはnot_established、legacyはunknown_pending_direct_asset_semantic_review、consumer closureはpending。具体的な縮退値、実装完了、運用完了を主張しない。
