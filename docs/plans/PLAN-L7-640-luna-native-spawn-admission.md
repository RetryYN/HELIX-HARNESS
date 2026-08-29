---
plan_id: PLAN-L7-640-luna-native-spawn-admission
title: "PLAN-L7-640 (impl): Luna xhigh native spawn admissionを実payloadへ接合する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-SPAWN-001
responsibility_owner: codex-native-spawn-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: policy
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T04:51:12Z"
    tests_green_at: "2026-08-21T04:40:57Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    scope: "PR #852 exact HEAD 1cce1bbf3d38d727e2fad9d104c330b1b40fedf1を独立検収し、AGENTS.md契約、reviewed digest、PR scope、policy provenance、fail-close oracleを確認して内容blocker 0。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/852#issuecomment-5365342238。Codex native payloadにagent_typeが存在せず旧hookがblockした実測はhttps://github.com/RetryYN/HELIX-HARNESS/pull/852#issuecomment-5360451653へ束縛した。"
    green_commands:
      - kind: unit_test
        command: "gh run view 32446261655 --json jobs --jq '.jobs[].steps[] | select(.name == \"test — 全回帰 (vitest run)\") | {name,status,conclusion,startedAt,completedAt}'"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-21T04:40:57Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:0e460c81451b77304088f8d83835c9f625a14007a1cea9fecd369e242ec7aecb"
        result: "full regression step success; started 04:22:34Z, completed 04:40:57Z"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T04:51:12Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-21T04:51:12Z"
    evidence_digest: "sha256:a0e13329ea551522aa2d0f9d72d68cab1d4623e3f6ab668a1b4246d531e8bf36"
  entries: []
entry_signals:
  - "po_directive:Codex native workerをLuna xhighで起動可能にする"
agent_slots:
  - { role: se, slot_label: "SE — hook payload／tool contract接合" }
  - { role: qa, slot_label: "QA — arbitrary override negative oracle" }
contract_preconditions: "PLAN-L7-639でcurrent worker modelとeffortがLuna／xhighへ確定済み"
contract_postconditions: "version／digest検証済みpolicyが導出するLuna／xhigh／concrete taskだけがnative単体spawnを通過する"
contract_invariants: "Sol／Terra／任意model、bulk spawn、task欠落を許可しない"
contract_failures: "公開schemaにないfield要求、effort未束縛、任意override許可をfail-closeする"
tdd_red_required: true
red_test: "U-LUNASPAWN-008でLuna model exact check除去による任意model昇格を先行検出する"
red_at: "2026-08-21T03:38:13Z"
green_at: "2026-08-21T03:38:29Z"
mutation_oracle_evidence: "src/runtime/codex-native-worker-policy.ts のLuna model exact checkを一時的に除去した。2026-08-21T03:38:13Zにtests/codex-native-worker-policy.test.tsを実行し、U-LUNASPAWN-008がexpected codex_native_worker_policy_invalid / received codex_native_worker_policy_digest_mismatchで1件red、他2件greenとなり任意model昇格経路を検出した。exact check復元後、2026-08-21T03:38:29Zに同3 testsがexit 0でgreenへ戻り、source diff 0を確認した。"
complexity_effect: net_neutral
complexity_justification: "存在しないrole fieldをmodel／effort exact pairへ置換し契約を狭める"
removal_trigger: "Codex native spawnがsigned policy receiptを直接受理するsurfaceへ移行した時"
parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md
pair_artifact: docs/test-design/helix/L8-luna-native-spawn-admission-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
dependencies:
  requires:
    - docs/plans/PLAN-L7-639-luna-worker-model-registry.md
  blocks:
    - issue:624-runtime-receipt
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-001, test_path: tests/agent-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-004, test_path: tests/tool-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-006, test_path: tests/codex-native-worker-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, oracle_id: U-LUNASPAWN-009, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
generates:
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-640-luna-native-spawn-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/luna-native-spawn-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-luna-native-spawn-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/agent-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/codex-native-worker-policy.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/tool-contract.ts, artifact_type: source_module }
  - { artifact_path: tests/agent-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tool-contract.test.ts, artifact_type: test_code }
  - { artifact_path: tests/codex-native-worker-policy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# PLAN-L7-640: Luna native spawn admission実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | hosted payloadとguard差分を実測 | `agent_type`不在blockを再現 |
| 2 | versioned model／effort policyへ移行 | version／digest検証済みLuna／xhighだけpass |
| 3 | negative oracleとCLI smoke | stale policy／arbitrary overrideがfail |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |
