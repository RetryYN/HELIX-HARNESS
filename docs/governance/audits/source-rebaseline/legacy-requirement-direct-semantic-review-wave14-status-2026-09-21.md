# Wave14 status（2026-09-21）

- batch: `LEGACY-SEMANTIC-WAVE14-2026-09-21`
- parent: `b3e0b758725116e770a866e09067c6bd65023967`
- schema: 10
- authority_effect: none / legacy_execution_performed: false / new_build_allowed: false
- batch edges: confirmed 3 (contract 3 / design 0) / rejected 1 / unresolved 5
- cumulative: 41 units / 123 edges / 177 units remaining

| unit | product | phase | current_status | legacy_capability_status | transition_assessment |
|---|---|---|---|---|---|
| IRUNIT-HIL-BR-05-HELIX-OS | HELIX-OS | PHCAP-18 | requirement_candidate | implemented_with_tests | degraded_to_candidate |
| IRUNIT-HIL-BR-06-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04 | draft_containers | documented_with_runtime_support | degraded_to_unapproved_routing_containers |
| IRUNIT-HIL-BR-06-HELIX-HARNESS | HELIX-HARNESS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally |
| IRUNIT-HIL-BR-06-HELIX-HARNESS | HELIX-HARNESS | PHCAP-13 | operating_contract_only | implemented_with_draft_system_test_design | degraded_to_manual_operating_contract |
| IRUNIT-HIL-BR-07-HELIX-OS | HELIX-OS | PHCAP-02 | candidate_with_partial_current_registry | implemented_with_tests | degraded_to_candidate_and_static_registry |
| IRUNIT-HIL-BR-07-HELIX-OS | HELIX-OS | PHCAP-13 | operating_contract_only | implemented_with_draft_system_test_design | degraded_to_manual_operating_contract |

| unit | atoms | contract | design confirmed | design unresolved | design rejected assets | design pending-kind atoms | implementation confirmed | implementation unresolved | implementation rejected assets | implementation uncovered | no evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| IRUNIT-HIL-BR-05-HELIX-OS | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 |
| IRUNIT-HIL-BR-06-HELIX-HARNESS | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| IRUNIT-HIL-BR-07-HELIX-OS | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 1 | 0 |

詳細なbounded search receiptはmetaに固定した。candidate membershipはsemantic evidenceではない。BR05はA01/A02をHARNESS共有、BR06はA01/A02をOS共有、BR07はshared source overlapなしでOS固有として扱った。BR06のdecompositionにあるcomposite overlapは、2 source spanを順序連結した1件としてreceipt／verifierでexact照合する。製品境界decision、実装成立、consumer closureはpendingであり、実装完了を主張しない。
