# Wave17 status（2026-09-21）

- base: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- source main base: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- stacked PR parent / Wave16 candidate: `74bfd04f7aa2384e1e30856ec6c29282b764e8c5`（merge base `6dad906ed9a52c9e49611931645db2f298c6bf6a`、ledger/metaはcurrent tree内）
- scope: 3 units / 7 atoms / 8 evidence edges
- cumulative: 50 reviewed units / 149 reviewed edges / 168 units remaining (crosswalk unit inventory)
- semantic links: confirmed 3（要求契約3） / rejected 0 / unresolved 5
- authority effect: none; consumer closure: pending; legacy execution: not run; new build: false

## unit coverage

| unit | atoms | contract | design confirmed | design unresolved | implementation confirmed | implementation unresolved | implementation uncovered | no evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IRUNIT-HIL-BR-15-HELIX-OS | 3 | 3 | 0 | 2 | 0 | 0 | 3 | 1 |
| IRUNIT-HIL-BR-16-HELIX-HARNESS | 2 | 2 | 0 | 2 | 0 | 1 | 1 | 0 |
| IRUNIT-HIL-BR-16-HELIX-OS | 2 | 2 | 0 | 1 | 0 | 1 | 1 | 1 |

BR15は直接implementation assetなしのため、implementation edgeを作らず、missing evidence receiptへ記録した。BR16 shared spanは両unitのcontract inventoryに残すが、共有意味を二重計上していない。

## unresolved holds

- BR15-OS: `direct_phase_review_pending`, `routing_correction_pending_direct_phase_review`, `exact_head_independent_review_pending`, `human_product_authority_decision_pending`, `successor_assignment_unassigned`, `candidate_product_routing_requires_human_review`, `source_atomization_review_pending`。
- BR16-HARNESS / BR16-OS: `product_unit_boundary_human_decision_pending`, `unit_split_requires_independent_review`, `exact_head_independent_review_pending`, `human_product_authority_decision_pending`, `successor_assignment_unassigned`, `candidate_product_routing_requires_human_review`, `source_atomization_review_pending`。
- direct asset、implementation status、consumer closure、phase adoption、successor assignmentは未確定。

## phase rows

| IRUNIT-HIL-BR-15-HELIX-OS | HELIX-OS | PHCAP-03 | candidate | implemented_partial | degraded_to_candidate | HARNESS意味コアとOS分類projectionの分離・正式要求化が未完了 |
| IRUNIT-HIL-BR-15-HELIX-OS | HELIX-OS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally | 現行証拠はHARNESS／OS候補に限定。Web／Web-OSのL10、oracle registry、新世代CIが未構築 |
| IRUNIT-HIL-BR-15-HELIX-OS | HELIX-OS | PHCAP-09 | candidate | documented_candidate | degraded_to_rederived_candidate | ticket contract、発行責務、GitHub projectionの正式分離が未完了 |
| IRUNIT-HIL-BR-16-HELIX-HARNESS | HELIX-HARNESS | PHCAP-07 | candidate_only | documented_with_test_design | not_reimplemented_formally | 現行証拠はHARNESS／OS候補に限定。Web／Web-OSのL10、oracle registry、新世代CIが未構築 |
| IRUNIT-HIL-BR-16-HELIX-HARNESS | HELIX-HARNESS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有Scaffold Binding、責務別profile、現行oracleが未構築。一般Scaffoldのlocal検査はCI能力として数えない |
| IRUNIT-HIL-BR-16-HELIX-OS | HELIX-OS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有Scaffold Binding、責務別profile、現行oracleが未構築。一般Scaffoldのlocal検査はCI能力として数えない |

## static validation boundary

archiveのruntime/test/hook/CI/adapterは実行していない。検証器は台帳、meta、静的source digest、line/span digest、stacked-tree上のWave16 ledger/meta、prior candidate overlay、shared span、controlled anchorを読むだけである。shallow cloneでは固定canonical digestを使い、full cloneのgit object照合は任意の追加検証とする。
