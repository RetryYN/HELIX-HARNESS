---
plan_id: PLAN-L5-81-specialist-agent-registry
title: "PLAN-L5-81 (add-design): 専門agent registry詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:2026-07-28 駆動モデルの専門工程経路と担当agent authorityを整備する"]
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 190
engineering_discipline_required: true
behavior_contract_id: UTH-FR-033
responsibility_owner: specialist-agent-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9がcomponentとauthorityを定義する"
contract_postconditions: "entry/source/allowlist/team選定をversioned schema化する"
contract_invariants: "unknown capabilityや同provider verifierを補完しない"
contract_failures: "schema/digest/allowlist/capability/axis driftを拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "9 entryの単一configで既存4正本の結線を明示する"
removal_trigger: "registry major version cutover時にdual-green後に除去する"
pair_artifact: docs/test-design/helix/L5-specialist-agent-registry-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — registry schema/digest" }
  - { role: qa, slot_label: "QA — L8 mutation" }
  - { role: tl, slot_label: "TL — minimality review" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-81-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/specialist-agent-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-specialist-agent-registry-integration-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T05:54:00Z"
    tests_green_at: "2026-07-28T05:52:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #203 の current HEAD 2a5a5f02 を clean detached worktree で独立レビューした。L5 detail design が finding code 体系 (registry_missing / schema_invalid / duplicate_agent_id / definition_missing / definition_digest_mismatch / launch_not_allowlisted / model_class_not_in_ssot / worker_missing / verifier_missing / independent_verifier_missing) と、worker と verifier の runtime 独立要求を定義していることを確認した。実装の判定と 1 対 1 に対応する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/specialist-agent-registry.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T05:52:00Z"
        evidence_path: docs/design/helix/L5-detail/specialist-agent-registry.md
        output_digest: "sha256:6cd480f5f072d744826d75e323860198c97b424309ecc30fb57c9758e0af539a"
        result: "17 passed"
dependencies:
  parent: docs/plans/PLAN-L4-54-specialist-agent-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L4-54-specialist-agent-registry.md
  blocks:
    - docs/plans/PLAN-L6-85-specialist-agent-registry.md
---

# PLAN-L5-81: 専門agent registry詳細設計

entry field、digest、allowlist、team selectionとL8 mutationを閉じる。
