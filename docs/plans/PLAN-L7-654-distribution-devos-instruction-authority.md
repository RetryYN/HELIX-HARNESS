---
plan_id: PLAN-L7-654-distribution-devos-instruction-authority
title: "PLAN-L7-654 (impl): DevOS distribution instruction authorityを収束する"
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
  target_id: VERSION_UP
entry_signals:
  - "po_directive:Issue #943でDevOS instruction authorityを原子的に収束する"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 943
behavior_contract_id: DISTRIBUTION-DEVOS-INSTRUCTION-AUTHORITY-001
responsibility_owner: distribution-repository-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-65がDevOS current identityと旧identity compatibility input-only境界を正本化している"
contract_postconditions: "AGENTS／CLAUDEとrule-driftが同じDevOS identityとcompatibility境界を返す"
contract_invariants: "runtime／CLI／setup移行、tag、publish、remote cutoverを本sliceへ混載しない"
contract_failures: "片面のcurrent identity欠落またはcompatibility marker欠落をrule-driftで拒否する"
tdd_red_required: true
red_test: "U-RDRIFT-005で旧AGENTS／CLAUDEのDevOS marker欠落を先行検出する"
red_at: "2026-08-22T18:49:47Z"
green_at: "2026-08-22T18:49:47Z"
mutation_oracle_evidence: "tests/rule-drift.test.ts U-RDRIFT-005の片面marker除去mutationがmissingMarkersへ入りredとなり、同一HEAD CI全回帰でkillを確認した"
complexity_effect: net_negative
complexity_justification: "sessionごとに読まれる2正本の配布authorityをrequirementsへ一本化する"
removal_trigger: "distribution identityがgenerated instruction blockへ統合され手書き複製が0になった時"
parent_design: docs/design/helix/L6-function-design/distribution-devos-instruction-authority.md
pair_artifact: docs/test-design/helix/L8-distribution-devos-instruction-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-instruction-authority.md, oracle_id: U-RDRIFT-005, test_path: tests/rule-drift.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-instruction-authority.md, oracle_id: U-RDRIFT-006, test_path: tests/rule-drift.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — instruction authority／rule-drift実装" }
  - { role: qa, slot_label: "QA — current／compatibility marker mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-devos-instruction-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-devos-instruction-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/rule-drift.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/rule-drift.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md
  requires:
    - docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md
  blocks:
    - issue:944
review_evidence:
  - reviewer: "Codex CLI / gpt-5.6-luna"
    review_kind: intra_runtime_subagent
    reviewer_session_id: "01a02ade-a48a-7ea3-9405-c143a3b7170d"
    reviewed_at: "2026-08-22T19:07:28Z"
    tests_green_at: "2026-08-22T18:49:47Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: codex:gpt-5.6-luna
    reviewed_head_sha: 07bd35ffe2109235d677d3107d96f3c9fc51c5bc
    scope: "PR #945 exact HEAD 07bd35ffe2109235d677d3107d96f3c9fc51c5bcをread-only Codex CLI Luna xhighが独立reviewした。Issue #943、差分13ファイル、PLAN、L6/L8 pair、AGENTS／CLAUDE、rule-drift、reviewed-safe digest、design catalog、requirements v1.3.13を確認し、DevOS current identity、旧OS compatibility input-only、runtime slice非混載、digest伝播をblocker 0でapproveした。targeted Vitestはread-only sandboxの一時領域write拒否で起動前停止したためgreenへ数えず、GitHub Actions run 32590869702の同一HEAD impact-ci全回帰step greenを技術証拠とした。run全体は後続doctorがdraft PLAN lifecycleを検出してfailureでありterminal successとは数えない。review receipt digest=sha256:1ade4686ac3b56d69386fcf2b225f9bb4b9364963a4a6ee27ce78bde5287b1f7"
    green_commands:
      - kind: integration_test
        command: "GitHub Actions harness-check impact-ci: vitest run --project fast/slow shards"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-22T18:49:47Z"
        evidence_path: tests/rule-drift.test.ts
        output_digest: "sha256:03bd1f0d6e62884bf93373d9a5572dd8324c8ec5862d29c39d0dff8a539b135a"
        result: "GitHub Actions run 32590869702のHEAD 07bd35ffe2109235d677d3107d96f3c9fc51c5bcに対するimpact-ci全回帰stepがexit 0。shard step log 1010行だけのsha256を束縛した。run全体は後続doctorのPLAN lifecycle failureによりfailureであり、terminal CI successとは主張しない。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-22T19:07:28Z"
  review_binding:
    reviewer: "Codex CLI / gpt-5.6-luna"
    reviewed_at: "2026-08-22T19:07:28Z"
    evidence_digest: "sha256:9b466454d0632ff185103216fa31c48438f81bc938a7b11bab420d46a67e898c"
  entries: []
---

# DevOS配布instruction authority

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | instruction authorityをDevOSへ更新 | AGENTS／CLAUDEが同じidentityを返す |
| 2 | compatibility-only境界を明示 | 旧identityをcurrent outputへ戻さない |
| 3 | rule-drift mutation oracle | 片面欠落が個別にred |
| 4 | targeted／typecheck／PLAN lint | 全green |
| 5 | Claude exact-HEADレビュー | blocker 0 |

runtime／CLI／setup／doctor／generated consumer surfaceは後続sliceへ残す。
