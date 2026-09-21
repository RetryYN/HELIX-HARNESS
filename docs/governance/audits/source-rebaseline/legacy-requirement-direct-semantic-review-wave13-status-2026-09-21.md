# Wave13 status（2026-09-21）

- batch: `LEGACY-SEMANTIC-WAVE13-2026-09-21`
- parent: `9061b51a1e0b4a898dcfd568891335cbb33bc135`
- schema: 10
- authority_effect: none / legacy_execution_performed: false / new_build_allowed: false
- batch edges: confirmed 3 (contract 3 / design 0) / rejected 1 / unresolved 5
- cumulative: 38 units / 114 edges / 180 units remaining

| unit | product | phase | current_status | legacy_capability_status | transition_assessment |
|---|---|---|---|---|---|
| IRUNIT-HIL-BR-01-HELIX-OS | HELIX-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap |
| IRUNIT-HIL-BR-01-HELIX-OS | HELIX-OS | PHCAP-12 | scaffold_operating | implemented_with_tests | degraded_to_operating_contract_and_gui_scaffold |
| IRUNIT-HIL-BR-01-HELIX-OS | HELIX-OS | PHCAP-13 | operating_contract_only | implemented_with_draft_system_test_design | degraded_to_manual_operating_contract |
| IRUNIT-HIL-BR-02-HELIX-OS | HELIX-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap |
| IRUNIT-HIL-BR-02-HELIX-OS | HELIX-OS | PHCAP-12 | scaffold_operating | implemented_with_tests | degraded_to_operating_contract_and_gui_scaffold |
| IRUNIT-HIL-BR-03-HELIX-OS | HELIX-OS | PHCAP-19 | draft_requirement | implemented_with_acceptance_design_assets | degraded_to_draft |
| IRUNIT-HIL-BR-03-HELIX-OS | HELIX-OS | PHCAP-20 | draft_requirement | implemented_with_tests | degraded_to_draft |

| unit | atoms | contract | design confirmed | design unresolved | design rejected assets | design pending-kind atoms | implementation confirmed | implementation unresolved | implementation rejected assets | implementation uncovered | no evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| IRUNIT-HIL-BR-01-HELIX-OS | 5 | 5 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 5 | 3 |
| IRUNIT-HIL-BR-02-HELIX-OS | 4 | 4 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 2 | 2 |
| IRUNIT-HIL-BR-03-HELIX-OS | 7 | 7 | 0 | 3 | 0 | 0 | 0 | 1 | 0 | 6 | 4 |

詳細なbounded search receiptはmetaに固定した。candidate membershipはsemantic evidenceではない。対象はHELIX-OSだけで、BR01の共有source spanは2件（product boundary pendingとして保持）、製品境界decisionはpendingである。currentはnot_established、legacyはunknown_pending_direct_asset_semantic_review、consumer closureはpending。実装完了を主張しない。
