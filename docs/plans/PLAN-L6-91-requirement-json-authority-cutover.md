---
plan_id: PLAN-L6-91-requirement-json-authority-cutover
title: "PLAN-L6-91 (add-design): Requirement JSON authority cutover"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 PR-5 JSON canonical cutover"
created: 2026-07-30
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 287
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PR3 shadow exact setとPR4 generated view／DB shadowが同一root digestへ収束済み"
contract_postconditions: "JSON stable-ID shardだけがcanonicalで、Markdownはgeneratedまたはcompatibility read-only、DBはrequirement_irへ一回切替される"
contract_invariants: "153/24/72/24、12 owner correction、3 design port、human-only authorityを維持し、dual authorityを作らない"
contract_failures: "JSON/view/digest/compatibility drift、legacy semantic read、shadow artifact/table残存をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "shadow/canonical二系統をcanonical loaderと既存doctor責務へ統合し、旧shadow artifact/tableを削除する"
removal_trigger: "恒久authority contractのためなし。compatibility inputはconsumer 0とfreeze後のretirement承認で削除する"
parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — canonical shard／view／DB atomic cutover"
  - role: qa
    slot_label: "QA — dual authority／digest／consumer negative oracle"
  - role: tl
    slot_label: "TL — legacy compatibilityとcutover境界"
generates:
  - { artifact_path: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  requires:
    - docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  references:
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
  blocks:
    - docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T23:46:31Z"
    tests_green_at: "2026-07-30T23:46:31Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #298 HEAD 6b9ecc45142cc6e927b8caa751eb3efcd47ea261をclean detached worktreeで独立review。Requirement JSON authority cutoverの設計、canonical exact set 153/24/72/24、generated view、compatibility read-only、requirement_ir v41、shadow retirement、Design Template接続口、pair設計を確認し、設計内容にCritical／High／Medium finding 0。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/298#issuecomment-5137440253"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/left-arm-carry-log.test.ts tests/ddd-tdd-rules.test.ts tests/goal-evidence-audit.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-30T23:41:09Z", evidence_path: tests/goal-evidence-audit.test.ts, output_digest: "sha256:6293bd2290887ba903b1625e95d99e3a4761891fa7d790b10f9091e31fe09e19", result: "53/53 pass; reviewer independently reproduced green" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-30T23:40:09Z", evidence_path: src/requirements/requirement-authority.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; reviewer independently reproduced green" }
---

# PLAN-L6-91: Requirement JSON authority切替

pair freezeはJSON authority、generated view、compatibility exact set、DB projection、legacy retirementを
一つの切替契約として確定する。G1/G3 freezeやDesign Template JSON完了を意味しない。
