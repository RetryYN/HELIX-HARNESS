---
plan_id: PLAN-L7-659-lite-canary-manifest-exact-set-oracle
title: "PLAN-L7-659 (impl): Lite canaryのarchive／manifest exact-set oracleを固定する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 965
behavior_contract_id: DISTRIBUTION-LITE-CANARY-EXACT-SET-001
responsibility_owner: distribution-lite-consumer-canary
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "canary admissionがtar実体とmanifest artifact_pathsのexact setを比較する"
contract_postconditions: "manifest申告不足／過多の両方をarchive_exact_set_mismatchで拒否するoracleが存在する"
contract_invariants: "production code、failure code体系、Windows同一artifact chainを変更しない"
contract_failures: "exact-set判定の除去または片方向比較への退行をU-DISTCAN-001aがredにする"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #965にarchive_exact_set_mismatch除去mutationのSURVIVED実測と不足manifestが誤admitされる反例が記録済みであり、未記録timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "production実装を増やさず、既存fail-close境界へ不足／過多fixtureを追加する"
removal_trigger: "archive listingとmanifest生成が同一unforgeable receiptへ統合され比較境界が消滅した時"
mutation_oracle_evidence: "archive_exact_set_mismatch判定を一時除去するとU-DISTCAN-001aが不足fixtureの誤admitを検出して1 test redとなり、判定復元後10 tests green"
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:ForwardレーンでPR #962の独立レビュー由来Issue #965を回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-001a, test_path: tests/distribution-lite-consumer-canary.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — manifest申告不足／過多mutation" }
  - { role: tl, slot_label: "TL — production source無変更と既存chainの確認" }
review_evidence:
  - reviewer: "Claude Code / independent AI-B"
    review_kind: cross_agent
    reviewer_session_id: "dc96b0e4-d8a6-4ba0-b7e9-a8e3c0d6ce8a"
    reviewed_at: "2026-08-23T20:03:04Z"
    tests_green_at: "2026-08-23T20:01:09Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude-opus-5
    reviewed_head_sha: cb98936e9d8937974eab996283780271b0e53a44
    scope: "PR #969 current exact HEAD cb98936e9d8937974eab996283780271b0e53a44をClaude Codeが検収し、Issue #965のarchive／manifest exact-set oracle、U-DISTCAN-001a、CI／DB projection／replayを照合した。approve／blocker 0。Actions run 32662050327はfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreen。canonical comment: https://github.com/RetryYN/HELIX-HARNESS/pull/969#issuecomment-5388178566。receipt digest: sha256:9ea7fa4530baa2a0479be020051bfe8ecd5f570c29a4729c497f5b66d948d708"
    green_commands:
      - kind: smoke
        command: "gh run view 32662050327 --log"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T20:01:09Z"
        evidence_path: tests/distribution-lite-consumer-canary.test.ts
        output_digest: "sha256:af4f9628b479d0f61a04a587b7df8c7b21d06883a631a180ffbe398a256ebb1e"
        result: "current HEADのfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreen。Claude current exact-HEAD reviewはapprove／blocker 0。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T20:03:04Z"
  review_binding:
    reviewer: "Claude Code / independent AI-B"
    reviewed_at: "2026-08-23T20:03:04Z"
    evidence_digest: "sha256:9cbac9e2b10f38d24b4c932af62077b33e4931ea7ba1dff94c14a70bf178014b"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-659-lite-canary-manifest-exact-set-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  requires:
    - docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  references:
    - issue:965
  blocks:
    - issue:965
---

# Lite canaryのarchive／manifest exact-set検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 申告不足fixture | tar実体を変えずmanifestから1 path除去してexact codeでred |
| 2 | 申告過多fixture | tarにないportable pathをmanifestへ追加してexact codeでred |
| 3 | mutation確認 | exact-set判定除去でU-DISTCAN-001aが失敗 |
| 4 | 回帰確認 | canary targeted、typecheck、Biome、PLAN lintがgreen |

## 境界

production code、failure code、Windows workflow、配布publishは変更しない。
