---
plan_id: PLAN-L7-555-issue-metadata-enforcement
title: "PLAN-L7-555 (add-impl): Issue起票metadataの機械強制"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
completion_claim_allowed: false
entry_signals: ["issue:633"]
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 633
engineering_discipline_required: true
behavior_contract_id: ISSUE-METADATA-ENFORCEMENT-001
responsibility_owner: github-issue-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "GitHub Issueのnumber/state/createdAt/labelsが取得できる"
contract_postconditions: "open Issueのtype/lifecycle欠落と48時間以上unlabeledがdeterministic findingになる"
contract_invariants: "closed Issueと48時間未満をstale-unlabeledへ誤算入せずmetadataを推測補完しない"
contract_failures: "invalid clock/thresholdと必須label欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-08-14T04:30:00+09:00"
green_at: "2026-08-14T04:31:00+09:00"
mutation_oracle_evidence: "tests/issue-metadata-audit.test.tsがtype/lifecycle/stale threshold/closed exclusionを固定"
complexity_effect: net_positive_bounded
complexity_justification: "pure classifierと既存github CLI配線だけを追加しdependency graphは#634へ分離"
removal_trigger: "GitHub側Issue Form/Rulesetが同一taxonomyと滞留判定を強制しHELIX auditが不要になった時"
parent_design: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
pair_artifact: docs/test-design/helix/github-update-lifecycle-system-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md, oracle_id: U-IMETA-001, test_path: tests/issue-metadata-audit.test.ts }
generates:
  - { artifact_path: src/runtime/issue-metadata-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-metadata-audit.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
  requires: [docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md]
  blocks: [issue:633, issue:634]
agent_slots:
  - { role: se, slot_label: "SE — metadata classifier/CLI" }
  - { role: qa, slot_label: "QA — threshold/false-positive oracle" }
review_evidence: []
---

# Issue起票metadataの機械強制

#633だけを閉じる原子slice。依存graphとPLAN相互整合は#634へ残す。
