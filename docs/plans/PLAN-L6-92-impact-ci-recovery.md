---
plan_id: PLAN-L6-92-impact-ci-recovery
title: "PLAN-L6-92 (add-design): Impact CI Recovery"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 Issue #93 L3Q-IT-024 implementation"
created: 2026-08-01
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-84の型・selector・receipt契約がPR #332でmainへmerge済み"
contract_postconditions: "draft PRはimpact-selected test、Ready candidateとmainはfull exact setを実行する"
contract_invariants: "unknown/high-riskはfull、required gate非縮退、surface間green相殺0"
contract_failures: "invalid inventory、unknown impactのtargeted化、partition/receipt driftをfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存workflowとrelation inventoryへ薄いselectorを追加しfull suite実装を複製しない"
removal_trigger: "恒久profile契約のためなし。legacy unconditional PR full stepはconsumer 0後に削除する"
parent_design: docs/design/helix/L5-detail/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — selector／CLI／workflow境界設計" }
  - { role: qa, slot_label: "QA — fail-close／partition／receipt oracle" }
  - { role: tl, slot_label: "TL — required gate非縮退と未接続境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-92-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-84-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L5-84-impact-ci-recovery.md
  blocks:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T15:25:14Z"
    tests_green_at: "2026-08-01T15:18:40Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #333 HEAD 380cdd81bb0be1c82ab184d40f9107bc6746f4dfを独立read-only review。pure selector、workflow fail-close、required gate非縮退、M-1/M-3/M-4閉鎖、B-1 content解消を確認し、content Critical／High／Medium 0。残条件は本receipt転記によるL6 confirm、L7 confirm、最終HEAD full CI。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/333#issuecomment-5152067607"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/impact-ci.test.ts tests/harness-check-workflow.test.ts tests/impact-ci-recovery-detail-design.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: tests/impact-ci.test.ts, output_digest: "sha256:30629190c3b30152642b10b613ee6d3672d1dbbf08e034433e2bb45d3b5e7525", result: "3 files / 44 tests pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: src/runtime/impact-ci.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-L6-92: Impact CI Recovery設計

L5契約を、pure selector、receipt validator、CLI profile projection、既存workflow dispatchへ一対一で降下する。
新runner、cache、DB table、required jobは追加しない。
