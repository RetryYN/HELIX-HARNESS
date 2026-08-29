---
plan_id: PLAN-L7-668-project-hook-authority-surface-projector
title: "PLAN-L7-668 (add-impl): project hook authorityを4 surfaceへ同一bytes投影する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #895 provider resolutionを4 surfaceへ同一bytes投影する"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-PROJECTOR-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L7-667 providerが一度だけ解決したauthority receiptまたはfailureを返す"
contract_postconditions: "SessionStart／doctor／status／dispatchのexact 4 surfaceへ同じcanonical receipt/failure bytesを投影する"
contract_invariants: "surface別のauthority再計算、field追加／欠落、repair hint、fallbackを行わない"
contract_failures: "success/failureの片面だけ異なるbytes、surface欠落、入力resolution mutation"
tdd_red_required: true
red_test: "U-CNWHOOKPROJ-001/002がsurface projector module不在でsuite load failureになる"
red_at: "2026-08-24T19:56:37Z"
green_at: "2026-08-24T19:57:26Z"
mutation_oracle_evidence: "src/runtime/project-hook-authority-surface-projector.ts の dispatch bytesだけへ改行を付加する変異を実測し、tests/project-hook-authority-surface-projector.test.ts の U-CNWHOOKPROJ-001/002 が2件ともSet不一致でfailしてkillした"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-24T23:17:58Z"
    tests_green_at: "2026-08-24T23:16:31Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    reviewed_head_sha: 1fafd3afd2a8c62e09b89ee0a226c9551c1a362f
    scope: "PR #1007 HEAD 1fafd3afd2a8c62e09b89ee0a226c9551c1a362fをClaude Codeが独立検収し、harness-check run 32787104439、4 surface exact-byte投影、DB projection／replay、checkpoint／replayの一致を実測してblocker 0と判定した。canonical review: https://github.com/RetryYN/HELIX-HARNESS/pull/1007#issuecomment-5402782985"
    green_commands:
      - kind: smoke
        command: "gh run view 32787104439 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-24T23:16:31Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:247e82cda050d25114f1a4cbd31eec9ac10322217cf23fc3775f7098b2d9cfdd"
        result: "completed / success / HEAD 1fafd3afd2a8c62e09b89ee0a226c9551c1a362f"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-24T23:17:58Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-24T23:17:58Z"
    evidence_digest: "sha256:0801a90d5faa94b17c782e71c24f54c4254e0f06c1fd60759ba2c7e18d121ae1"
  entries: []
complexity_effect: net_negative
complexity_justification: "4 consumerの個別serializationを単一pure projectorへ収束する"
removal_trigger: "4 surfaceが同一typed envelopeをnative transportで共有しprojector consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKPROJ-001, test_path: tests/project-hook-authority-surface-projector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKPROJ-002, test_path: tests/project-hook-authority-surface-projector.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-668-project-hook-authority-surface-projector.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/project-hook-authority-surface-projector.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-authority-surface-projector.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-667-project-hook-authority-input-provider
  requires:
    - docs/plans/PLAN-L7-667-project-hook-authority-input-provider.md
    - src/runtime/project-hook-authority-provider.ts
  blocks:
    - "issue:895-assignment-adapter"
agent_slots:
  - { role: se, slot_label: "SE — canonical 4-surface projector" }
  - { role: qa, slot_label: "QA — surface equality／failure exactness oracle" }
  - { role: tl, slot_label: "TL — no-recompute／no-fallback監査" }
---

# project hook authority 4 surface投影

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | projectorをRed→Green | success/failure双方をcanonical bytes化 |
| 2 | 4 surface exact set | SessionStart／doctor／status／dispatchだけ |
| 3 | byte equality反証 | 1 surfaceだけの改変をoracleがkill |
| 4 | targeted／typecheck／Biome | 全green |
| 5 | Claude同一HEAD検収 | blocker 0 |

本sliceはpure projectionだけを所有する。CLI／hook consumer接続、Assignment kernel adapter、process supervisor、
Luna read-afterは後続sliceとし、projector自身はfilesystem、process、DB、GitHubへ触れない。
