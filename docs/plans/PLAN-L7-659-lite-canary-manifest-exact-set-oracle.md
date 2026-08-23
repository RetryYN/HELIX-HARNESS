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
    reviewed_at: "2026-08-23T18:32:48Z"
    tests_green_at: "2026-08-23T18:27:31Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude-opus-5
    reviewed_head_sha: 8e33c63372513986d170453b13652d3a1aa3c0f1
    scope: "PR #969 exact HEAD 8e33c63372513986d170453b13652d3a1aa3c0f1をClaude Codeがread-onlyでpre-confirm検収した。Issue #965の起票時反例を再投入し、archive_exact_set_mismatch判定除去とexact比較のsubset弱化をU-DISTCAN-001aが個別にred化、復元後10 tests greenを確認した。approve／blocker 0／非blocker 0。Actions run 32656964419はfull regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQLがgreenで、唯一のredは本PLANがreview前draftであることを拒否したmergedPlanStatus。canonical comment: https://github.com/RetryYN/HELIX-HARNESS/pull/969#issuecomment-5387753113"
    green_commands:
      - kind: integration_test
        command: "GitHub Actions harness-check run 32656964419 full regression vitest run"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T18:27:31Z"
        evidence_path: tests/distribution-lite-consumer-canary.test.ts
        output_digest: "sha256:9bf8b188514d24e11c3ea7732732fb68f53c93aced92fb6b3a608af17cf3faaa"
        result: "full regression、Biome、pre/post DB rebuild、Linux／Windows Lite canary、CodeQL green。doctorの唯一redはconfirm前mergedPlanStatusであり、本review evidence記録とconfirmed遷移で解消対象。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T18:32:48Z"
  review_binding:
    reviewer: "Claude Code / independent AI-B"
    reviewed_at: "2026-08-23T18:32:48Z"
    evidence_digest: "sha256:6845678e4af1560321c7a5640de5aa8a940e9159994775e1905feeae51fac85f"
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
