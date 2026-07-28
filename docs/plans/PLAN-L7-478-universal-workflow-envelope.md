---
plan_id: PLAN-L7-478-universal-workflow-envelope
title: "PLAN-L7-478 (add-impl): Universal Workflow envelope admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 Issue #184 Universal Workflow envelopeをTDD実装する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 184
engineering_discipline_required: true
behavior_contract_id: U-UWENV-001
responsibility_owner: universal-workflow-envelope
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9、L5/L8、L6/L7のschema/authority/oracleがdraft pairとして存在する"
contract_postconditions: "strict Zod schemaとsemantic validatorが完全fixtureだけをactivation可能にする"
contract_invariants: "AI/adapter write authorityを追加せず、invalid入力でside effect 0"
contract_failures: "unknown version/field、欠落、参照、coverage、digest、blocking unresolvedを拒否する"
tdd_red_required: true
red_at: "2026-07-28T10:05:00+09:00"
green_at: "2026-07-28T10:11:09+09:00"
mutation_oracle_evidence: "tests/universal-workflow-envelope.test.tsがloop max、data retention、5出力、digest、runtime version欠落変異を個別にkillする"
complexity_effect: justified_positive
complexity_justification: "Zod既存依存とpure validatorだけで後続4sliceの共通schemaを提供する"
removal_trigger: "version cutover時にconsumer=0とdual-greenを確認して旧schemaを除去する"
parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md
pair_artifact: docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-001, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-002, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-003, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-004, test_path: tests/universal-workflow-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-workflow-envelope.md, oracle_id: U-UWENV-005, test_path: tests/universal-workflow-envelope.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — schema/semantic validator" }
  - { role: qa, slot_label: "QA — exact executable oracle" }
  - { role: tl, slot_label: "TL — authority/minimality convergence" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-478-universal-workflow-envelope.md, artifact_type: markdown_doc }
  - { artifact_path: src/workflow/universal-workflow-envelope.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-workflow-envelope.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-28T02:14:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-28T02:14:00Z"
    evidence_digest: "sha256:840e90399b13c24e97cfe2a7c9538cf7ddb18ea2dbcca07e5e48f5ad98d6dac3"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T02:14:00Z"
    tests_green_at: "2026-07-28T02:12:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #189 の current HEAD 4f2f2e30 を clean detached worktree で独立レビューした。validateUniversalWorkflowEnvelope は zod discriminated union と .strict() で 15 atom 種を閉じ、schema parse 失敗時は activation_allowed=false で即返す。semantic 検査は duplicate atom_id、required/core atom 欠落、coverage_report drift (covered_atom_kinds が実 atom 種集合と exact 一致しない)、missing_atom_kinds 非空、source digest の三者一致 (source / workflow_model / runtime_orchestration)、blocking unresolved item、および全 atom 種の参照整合 (transition→state/trigger/condition/action、loop→state/condition、terminal→state/notification/audit、condition→data) を検査する。activation_allowed は findings 0 のときだけ true になる fail-close。副作用は無く DB/network/filesystem に触れない純関数である。test oracle は U-UWENV-001..005 に加え missing transition 参照と capacity 超過の反例を持ち、PLAN の mutation claim と一致する。独立 review で docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md の layer を L6 から L8 へ訂正し plan-descent を解消した。confirm により outstanding が 26 から 22 へ戻るため、helix-objective-evidence-audit.md と goal-evidence-audit.test.ts の実数を追随させた。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/universal-workflow-envelope.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T02:12:00Z"
        evidence_path: tests/universal-workflow-envelope.test.ts
        output_digest: "sha256:3d301ab265f0995130e20a47027fcb7cde8064f5d5383fcefecbb0d94a707cb9"
        result: "6 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T02:11:00Z"
        evidence_path: src/workflow/universal-workflow-envelope.ts
        output_digest: "sha256:81b9a975cb1004967d5707c432ac30201c0ebb2ccd138e5aed6184c4a2782e61"
        result: "exit 0"
dependencies:
  parent: docs/plans/PLAN-L6-83-universal-workflow-envelope.md
  requires: []
  references:
    - docs/plans/PLAN-L6-83-universal-workflow-envelope.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
  blocks: []
---

# PLAN-L7-478: Universal Workflow envelope受入

## 完了条件

- U-UWENV-001〜005、typecheck、Biome、PLAN gateがgreen。
- 独立AI-Bがschemaの過不足、write authority、後続責務分離を確認する。
