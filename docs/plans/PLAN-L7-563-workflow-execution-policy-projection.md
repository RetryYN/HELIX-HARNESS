---
plan_id: PLAN-L7-563-workflow-execution-policy-projection
title: "PLAN-L7-563 (impl): execution policyをrequirements registryから生成する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
route_mode: version-up
entry_signals: ["po_directive:Issue #704 generated execution-policy projection slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-POLICY-PROJECTION-001
responsibility_owner: workflow-execution-policy-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements-owned policy registryは存在するが、下流consumer向けの生成projectionが無い"
contract_postconditions: "registered command IDとtyped bindingをsource digest付きで損失なく再生成するpolicy projectionが存在する"
contract_invariants: "requirements registryだけが意味authorityであり、projectionはraw command、legacy identity、旧modeを出力しない"
contract_failures: "source digest drift、command／binding欠落、raw command、legacy identity、manual driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでprojection moduleとoracleを同一atomic patchとして作成し、未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "runtime consumer切替前にrequirements registryとcurrent projectionの一方向境界を固定する"
removal_trigger: "policy registry schema successorへ移行しv1 projection consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-policy-projection-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-001, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-002, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-003, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-004, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — deterministic policy projectionとdigest binding" }
  - { role: qa, slot_label: "QA — raw command、legacy identity、manual drift反例" }
  - { role: tl, slot_label: "TL — requirements authorityとcompatibility境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-15T02:13:00Z"
    tests_green_at: "2026-08-15T01:51:38Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "PR #707 exact HEAD 7df343e63f173ecef72558a3eb4585030a00fb11をClaude Code Opusがread-only独立レビューした。requirements-owned policy registryのみからのlossless projection、旧15-route token 0件、三重digest、bindings 5件／commands 4件 exact一致、raw command／legacy identity／manual drift fail-closeを実測確認した。Critical 0、Blocker 0、Important 0、Minor 0でAPPROVE。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-execution-policy-projection.test.ts tests/workflow-execution-policy-registry.test.ts tests/workflow-classification-registry.test.ts tests/digest.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T01:51:38Z"
        evidence_path: tests/workflow-execution-policy-projection.test.ts
        output_digest: "sha256:5d76f36d9a5cee9b5cfca7af419c25a760afc17d2b01efbc48e8cc3fddf2af1b"
        result: "exact HEAD 7df343e6: 5 files / 51 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T02:13:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-15T02:13:00Z"
    evidence_digest: "sha256:f7641ca37fce40b2f7d4b4bbe9b671109629364435a17bbf10656209a692564b"
  entries: []
generates:
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-projection.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-execution-policy-projection.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md
  requires:
    - docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json
    - docs/design/helix/L6-function-design/workflow-execution-policy-projection.md
  references:
    - src/schema/route-map.ts
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# workflow execution policy generated projection実装

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | projection schemaと三重digest bindingを実装 | [直列] | U-WFEPROJ-001..002 green |
| 2 | raw command／legacy identity／manual driftを反証 | [直列] | U-WFEPROJ-003..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus独立review | [review] | blocker 0 |

runtime、CLI、DB、legacy adapterの切替は後続sliceとし、本PLANでは旧route-mapを削除しない。
