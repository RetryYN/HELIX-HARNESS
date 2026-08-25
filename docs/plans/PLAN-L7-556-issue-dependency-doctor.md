---
plan_id: PLAN-L7-556-issue-dependency-doctor
title: "PLAN-L7-556 (impl): Issue依存graphとPLAN双方向binding監査"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
completion_claim_allowed: true
entry_signals:
  - "po_directive:2026-08-14 #633・#634を先行し、Issue依存とPLAN参照をharness・GitHub rulesで機械強制してopen PRを収束させる"
created: 2026-08-14
updated: 2026-08-24
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
contract_postconditions: "open依存を残したcloseとPLAN双方向不一致がdoctor/CIでfail-visibleになり、単一PLANはscalar plan_id、複数atomic PLANを所有するparent/capability Issueはplan_id: nullと明示的plan_ids集合で監査され、曖昧なscalar/set併記は拒否される。PRはclosure graph focus、scheduled/手動runは全採用Issueを監査し、main pushは未merge PLAN重複を誤ってredにしない"
contract_invariants: "prose Refsを推測せず、既存hierarchy validatorを再利用し、PR focus外のlive driftを混入させず、legacy Issueへ一括強制しない"
contract_failures: "欠落target、非対称関係、open dependency close、PLAN/Issue不一致、scheduled/手動全件監査のmissing PLANをstable findingにする"
tdd_red_required: true
red_at: "2026-08-14T06:23:00+09:00"
green_at: "2026-08-14T06:26:00+09:00"
mutation_oracle_evidence: "tests/issue-hierarchy.test.ts U-IHIER-003でrequireReferencedPlans既定を!== falseから=== trueへ一時mutationし、issue_plan_missingが消えて1 test failedとなるkillを2026-08-14に実測した"
complexity_effect: net_neutral
complexity_justification: "既存Issue hierarchy moduleと単一CLI/CI/doctor wiringを拡張し、新DB schemaや重複graphを追加しない"
removal_trigger: "harness.db共通graph validatorがGitHub dependency projectionとPLAN bindingを同一transactionで検査する時点で統合する"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
backfill_state: complete
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-002, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-003, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-005, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-006, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-008, test_path: tests/issue-hierarchy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-009, test_path: tests/issue-hierarchy.test.ts }
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
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-80-issue-hierarchy-contract.md
  requires:
    - docs/plans/PLAN-REVERSE-634-issue-dependency-doctor-terminal-fullback.md
  references:
    - docs/plans/PLAN-REVERSE-634-issue-dependency-doctor-terminal-fullback.md
  blocks: [issue:635]
agent_slots:
  - { role: se, slot_label: "SE — dependency projectionとPLAN binding監査" }
  - { role: qa, slot_label: "QA — open依存closeと双方向不一致の反例" }
  - { role: tl, slot_label: "TL — legacy段階適用とdoctor/CI境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-13T23:23:00Z"
    tests_green_at: "2026-08-13T23:21:45Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #676 current HEAD f17cb7f7f0b34bdbe328b1df29ede8561b14f5a8を独立検証し、snapshot decision_count=24、PO directive entry signal、Issue依存双方向監査、PLAN双方向binding、既定fail-closeを確認。blocker 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/issue-hierarchy.test.ts tests/plan-entry-routing.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-13T23:21:45Z"
        evidence_path: tests/issue-hierarchy.test.ts
        output_digest: "sha256:cd3a3904fa55c3799df3e158faf20ef6ad1b35ca8986f19e12f03b8f2de524f7"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-13T23:23:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-13T23:23:00Z"
    evidence_digest: "sha256:c5ee8645fee5302e0ace61d2347971ba1bc5e16ce87084b9ec0d78fc9503e134"
  entries: []
---

# Issue依存graphとPLAN双方向binding監査

#633で確立したIssue metadata admissionを前提に、#634だけを閉じる原子的sliceとして依存projectionを追加する。
既存`issue-hierarchy`責務を拡張し、重複graphや新DB schemaは作らない。

`U-IHIER-006` はworkflow event境界を固定し、PRではfocus component、schedule／手動runでは
repository full auditを実行する一方、main pushでは未merge PLANを理由にredへ戻さない。

## Reverse fullback終端

PLAN-REVERSE-634-issue-dependency-doctor-terminal-fullbackのR0〜R4で、Issue #634、Issue #633の解決済み
metadata、実装PR #1016のcanonical merge、required CI、Claude exact-HEAD receipt、DB projection/replay、
current-mainのIssue dependency auditを再照合した。main read-afterはPLAN lint、DB rebuild、依存監査でgreenとなり、
`findings=[]`を確認したため、本PLANを`backfill_state: complete`、`completion_claim_allowed: true`へ遷移する。
Issue #634のcloseはReverse PLANのmain read-afterと同一証拠を参照して実施し、Issueの終端状態をPLANの完了主張と
混同しない。
