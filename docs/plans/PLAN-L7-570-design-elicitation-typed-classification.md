---
plan_id: PLAN-L7-570-design-elicitation-typed-classification
title: "PLAN-L7-570 (impl): design elicitationをtyped workflow分類へ移行する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #694 design elicitation legacy mode consumer migration"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: DESIGN-ELICITATION-TYPED-CLASSIFICATION-001
responsibility_owner: design-elicitation
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "design elicitationがrouteSignalToModeとdesign-bottomup mode identityをcurrent outputへ使用している"
contract_postconditions: "SCREEN_DESIGN、backend_derived、DISCOVERY_POCを別軸のtyped identityとして返す"
contract_invariants: "specialist workflow、trigger condition、case-driven modelを同一modeへ畳み込まず、current outputへmode／modelを再出力しない"
contract_failures: "design_uncertainがDISCOVERY_POCへ一意に分類できない場合はdiscoveryを生成せずfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存oracleがdesign-bottomup mode出力とrouteSignalToMode依存を固定しており、旧identity再出力を既存Redとして実証済み"
mutation_oracle_evidence: "2026-08-15T18:42:10Zにsrc/workflow/design-elicitation.tsのcurrent discoveryへmode=design-bottomupを一時再出力し、tests/design-elicitation.test.tsのU-DESIGNELIC-003が1 failed、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenとworktree cleanを確認した"
complexity_effect: net_negative
complexity_justification: "旧mode consumerとDriveTddFit mode taxonomy assertionを削除し、requirements-owned typed routerへ一本化する"
removal_trigger: "design elicitation consumerがversioned successorへ置換される場合に本adapter-free compositionを更新する"
parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md
pair_artifact: docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-001, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-002, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-003, test_path: tests/design-elicitation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, oracle_id: U-DESIGNELIC-004, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed classification composition境界" }
  - { role: qa, slot_label: "QA — legacy identity再出力とaxis混同反例" }
  - { role: tl, slot_label: "TL — requirements registryとconsumer migration境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T19:00:54Z"
    tests_green_at: "2026-08-15T19:00:36Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #694 design elicitation consumer migrationについて、SCREEN_DESIGN specialist workflow、backend_derived trigger condition、DISCOVERY_POC case-driven modelの軸分離、typed router fail-close、legacy mode／model非出力を確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/design-elicitation.test.ts tests/workflow-classification-routing.test.ts tests/workflow-contracts.test.ts tests/plan-entry-routing.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/goal-evidence-audit.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T19:00:36Z"
        evidence_path: tests/design-elicitation.test.ts
        output_digest: "sha256:6710d27a60b5e34ac4f37f4dd659e107252e9afd3c89074545bb11627b62ca8a"
        result: "design elicitation／typed routing／legacy非出力／governanceの82 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T19:00:54Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T19:00:54Z"
    evidence_digest: "sha256:fa2c473457600a9ce562d6220cdb3cc921910e2360b3710d48e4e3a669f05497"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-elicitation-typed-classification.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/workflow/design-elicitation.ts, artifact_type: source_module }
  - { artifact_path: tests/design-elicitation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# design elicitation typed分類移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | legacy mode consumerをtyped routerへ置換 | [直列] | U-DESIGNELIC-001 green |
| 2 | specialist workflow／trigger／case modelを別軸出力 | [直列] | U-DESIGNELIC-002..003 green |
| 3 | targeted、full CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

旧routing export自体の削除、DB projection、doctor全surface gateは後続原子的sliceで扱う。
