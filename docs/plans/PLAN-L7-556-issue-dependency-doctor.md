---
plan_id: PLAN-L7-556-issue-dependency-doctor
title: "PLAN-L7-556 (impl): Issue依存graphとPLAN双方向binding監査"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-14 #633・#634を先行し、Issue依存とPLAN参照をharness・GitHub rulesで機械強制してopen PRを収束させる"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 634
engineering_discipline_required: true
behavior_contract_id: ISSUE-DEPENDENCY-DOCTOR-001
responsibility_owner: github-issue-hierarchy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "block採用Issue snapshotと対応PLAN github_issue_id bindingが得られる"
contract_postconditions: "open依存を残したcloseとPLAN双方向不一致がdoctor/CIでfail-visibleになる"
contract_invariants: "prose Refsを推測せず、既存hierarchy validatorを再利用し、legacy Issueへ一括強制しない"
contract_failures: "欠落target、非対称関係、open dependency close、PLAN/Issue不一致をstable findingにする"
tdd_red_required: true
red_at: "2026-08-14T06:23:00+09:00"
green_at: "2026-08-14T06:26:00+09:00"
mutation_oracle_evidence: "U-IHIER-002がopen dependency close許容とdepends_on/blocksいずれか片方向だけを受理するmutationを、U-IHIER-003が片方向PLAN binding許容のmutationをkillしてredにする"
complexity_effect: net_neutral
complexity_justification: "既存Issue hierarchy moduleと単一CLI/CI/doctor wiringを拡張し、新DB schemaや重複graphを追加しない"
removal_trigger: "harness.db共通graph validatorがGitHub dependency projectionとPLAN bindingを同一transactionで検査する時点で統合する"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-002, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-003, test_path: tests/issue-hierarchy.test.ts }
generates:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: config }
  - { artifact_path: docs/design/helix/L3-requirements/github-operations-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/github-issue-hierarchy-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-80-issue-hierarchy-contract.md
  requires: []
  blocks: [issue:635]
agent_slots:
  - { role: se, slot_label: "SE — dependency projectionとPLAN binding監査" }
  - { role: qa, slot_label: "QA — open依存closeと双方向不一致の反例" }
  - { role: tl, slot_label: "TL — legacy段階適用とdoctor/CI境界" }
review_evidence: []
---

# Issue依存graphとPLAN双方向binding監査

#633で確立したIssue metadata admissionを前提に、#634だけを閉じる原子的sliceとして依存projectionを追加する。
既存`issue-hierarchy`責務を拡張し、重複graphや新DB schemaは作らない。
