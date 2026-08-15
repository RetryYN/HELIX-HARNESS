---
plan_id: PLAN-L7-568-workflow-classification-legacy-adapter
title: "PLAN-L7-568 (impl): legacy mode／modelをinput-only adapterへ隔離する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
route_mode: version-up
entry_signals: ["po_directive:Issue #694 legacy input-only compatibility slice"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-LEGACY-ADAPTER-001
responsibility_owner: workflow-classification-legacy-adapter
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: adapter
contract_preconditions: "旧mode／model consumerがcurrent typed registryと並存し、legacy入力の変換境界が未定義"
contract_postconditions: "bounded adapterだけがlegacy入力を受け、exact typed identity、source warning、fail-close dispositionを返す"
contract_invariants: "requirements registryが唯一の意味authorityであり、legacy identityをcurrent output／DB／生成物へ再出力しない"
contract_failures: "ambiguous／unknown legacy値を推測せずexit 1で拒否し、Forwardへfallbackしない"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでadapterとoracleを同一atomic patchとして作成し、未記録Red timestampを捏造しない。fail-close／legacy identity非出力はmutation killを別途実測する"
mutation_oracle_evidence: "2026-08-15T17:51:18Zにsrc/workflow/workflow-classification-legacy-adapter.tsのconverted receiptをemit_legacy_identity=falseからtrueへ一時mutationし、U-WFLEG-001が1 failed、exit 1となるkillを実測した。apply_patchで復元後、targeted greenとdoctorを再実行する"
complexity_effect: net_negative
complexity_justification: "後続consumer移行で旧mode分岐を削除できる単一compatibility boundaryを置く"
removal_trigger: "旧mode／model input consumerが0になりcompatibility retention期限が満了した時点"
parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-001, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-002, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-003, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-004, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-005, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-006, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-007, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded conversion tableとreceipt境界" }
  - { role: qa, slot_label: "QA — ambiguity／unknown／legacy再出力反例" }
  - { role: tl, slot_label: "TL — requirements authorityと後続consumer migration境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T17:46:02Z"
    tests_green_at: "2026-08-15T17:46:02Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #694 legacy input-only adapter sliceについて、requirements-owned exact conversion、legacy source warning、ambiguous／unknown fail-close、current outputへのlegacy identity非出力、registry cross-checkをtargeted testで確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/workflow-classification-legacy-adapter.test.ts tests/workflow-classification-registry.test.ts tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts tests/goal-evidence-audit.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/fe-roster-orchestration.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T17:46:02Z"
        evidence_path: tests/workflow-classification-legacy-adapter.test.ts
        output_digest: "sha256:3a6d5d128775d1e748264d13eddc20569c50d1e3fb1a43934946ee2c0fab1349"
        result: "legacy adapter／registry／digest／governanceの137 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T17:46:02Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T17:46:02Z"
    evidence_digest: "sha256:b8e1bb4ab3ade86793ce54dcf8a25d3a09904124c2d8acc0066c73d1eccd0a1e"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/workflow-classification-legacy-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-legacy-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
    - docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  references:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
  blocks: []
---

# 旧分類input-only adapter

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirements／registryのexact conversion契約をadapterへ投影 | [直列] | U-WFLEG-001..004、006 green |
| 2 | receiptのlegacy再出力禁止を固定 | [直列] | U-WFLEG-005 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

既存consumer除去、DB projection、doctor全surface gateは後続原子的sliceとする。
