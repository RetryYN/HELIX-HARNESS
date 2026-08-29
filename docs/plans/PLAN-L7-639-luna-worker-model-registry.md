---
plan_id: PLAN-L7-639-luna-worker-model-registry
title: "PLAN-L7-639 (impl): Codex current workerをLuna xhighへversion-upする"
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
behavior_contract_id: CODEX-NATIVE-WORKER-MODEL-001
responsibility_owner: codex-native-worker-model-registry
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-21T01:46:34Z"
    reviewed_at: "2026-08-21T01:51:00Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude:claude-fable-5
    scope: "PR #851 HEAD 5cc3ff4317cad83daf98fda4f84f48ee9d297d00をClaude CodeがPLAN confirm前に独立reviewした。Issue #624、Luna current registry、Terra historical retention、Sol parent非worker、ADD_FEATURE分類、L6/L8 pair、catalog digest c9c7fd2d…を照合しblocker 0。CI run 32436508412は全回帰、Biome、DB rebuildがgreenで、doctor唯一redは本PLAN draftのmergedPlanStatus。review source: https://github.com/RetryYN/HELIX-HARNESS/pull/851#issuecomment-5364223213"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast --project slow (GitHub Actions harness-check run 32436508412)"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-21T01:46:34Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:f6cdd935883fdd508b072fe2a516582556521d03d69e575f2922e145bfbd15d5"
        result: "Actions run 32436508412。full regression、Biome、pre/post DB rebuild、Windows smokeがgreen。doctor唯一redはconfirm前mergedPlanStatus。output_digestはClaude pre-confirm review comment本文のdigest。"
entry_signals:
  - "po_directive:Codex native workerをLuna xhighへ移行しTerraを退役する"
agent_slots:
  - { role: se, slot_label: "SE — registry／router／team projection" }
  - { role: qa, slot_label: "QA — currentとhistorical identity分離" }
contract_preconditions: "PLAN-L7-638でxhighがcurrent effort exact setへ追加済み"
contract_postconditions: "Codex current worker、T1 route、proposal memberがLuna xhighへ一致する"
contract_invariants: "Sol parentをworker化しない。Terra historical pricing／receiptを保持し、spawn admissionを本sliceで緩和しない"
contract_failures: "Terra current fallback、Sol worker化、Luna price／effort drift、historical price削除をfail-closeする"
tdd_red_required: true
red_test: "U-LUNA-001..003で旧Terra／medium projectionを先行検出する"
red_at: "2026-08-21T02:18:30Z"
green_at: "2026-08-21T02:18:44Z"
mutation_oracle_evidence: "src/schema/model-registry.ts のcurrent Codex workerをLunaから旧Terraへ一時退行させた。2026-08-21T02:18:30Zにtests/model-registry.test.tsを実行し、U-MREG-001とU-LUNA-001がexpected gpt-5.6-luna / received gpt-5.6-terraで2件red、他4件greenとなり退行を検出した。Lunaへ復元後、2026-08-21T02:18:44Zに同6 testsがexit 0でgreenへ戻った。"
complexity_effect: net_neutral
complexity_justification: "既存model registry SSoTからrouter／team projectionを一方向更新する"
removal_trigger: "model registryがversioned generated authorityへ移行し本projectionが吸収された時"
parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md
pair_artifact: docs/test-design/helix/L8-luna-worker-model-registry-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T01:51:00Z"
  review_binding:
    reviewer: "Claude Code / claude-fable-5"
    reviewed_at: "2026-08-21T01:51:00Z"
    evidence_digest: "sha256:df9d984e8c0af52efae8e402be19cfd7adcf8fb26a418545fc548213fbbb6f00"
  entries: []
dependencies:
  requires:
    - docs/plans/PLAN-L7-638-xhigh-reasoning-effort-schema.md
  blocks:
    - issue:624-spawn-admission
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-001, test_path: tests/model-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-002, test_path: tests/tier-router.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-003, test_path: tests/team-launch-policy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/luna-worker-model-registry.md, oracle_id: U-LUNA-004, test_path: tests/model-effort.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-639-luna-worker-model-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/luna-worker-model-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-luna-worker-model-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-effort.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-policy.ts, artifact_type: source_module }
  - { artifact_path: src/team/launch-policy.ts, artifact_type: source_module }
  - { artifact_path: tests/model-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/model-effort.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tier-router.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-launch-policy.test.ts, artifact_type: test_code }
---

# PLAN-L7-639: Luna worker model registry実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | current／historical model surfaceを棚卸し | Terra削除対象と保持対象が分離される |
| 2 | registryをLuna／xhigh／公式価格へ更新 | SSoTが一致する |
| 3 | T1 router／proposal teamへ投影 | current consumerがLuna xhighを返す |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |

## 非対象

policy-derived spawn admission、hook payload、receipt authority、Sol subagent退役は後続PRで扱う。
