# Wave16 status

## batch state

- batch: `LEGACY-SEMANTIC-WAVE16-2026-09-21`
- parent revision: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- scope: 3 units / 8 atoms / 9 edges
- cumulative: 47 units / 141 edges / 171 units remaining
- confirmed 3 (contract 3 / design 0) / rejected 0 / unresolved 6
- authority effect: `none`; consumer closure: `pending`; new build: `false`
- BR14-OS phase 0: `direct_phase_candidates=[]`, `phase_capability_evidence=[]`

## phase capability crosswalk

| unit | product scope | phase | current status | legacy capability status | transition assessment |
| --- | --- | --- | --- | --- | --- |
| IRUNIT-HIL-BR-12-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 | candidate | implemented_partial | degraded_to_candidate |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 | candidate | implemented_partial | degraded_to_candidate |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04 | draft_containers | documented_with_runtime_support | degraded_to_unapproved_routing_containers |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | HELIX-HARNESS | PHCAP-06 | candidate_only | documented_with_implementation_assets | degraded_to_candidate |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | HELIX-HARNESS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally |

## atom coverage receipt

| unit | atoms | contract | design confirmed | design unresolved | design rejected | design partial | implementation confirmed | implementation unresolved | implementation rejected | implementation uncovered | no evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IRUNIT-HIL-BR-12-HELIX-HARNESS | 2 | 2 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | 3 | 3 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 1 |
| IRUNIT-HIL-BR-14-HELIX-OS | 3 | 3 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 1 |

BR12-A01はshared peerであり、BR14のatomはproduct-exclusiveである。BR14-OS phase 0は候補を補わず保持する。candidate membershipはsemantic evidenceではない。runtime、test、hook、CI、adapterは実行していない。
