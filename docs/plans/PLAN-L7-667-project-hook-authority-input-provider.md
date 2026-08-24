---
plan_id: PLAN-L7-667-project-hook-authority-input-provider
title: "PLAN-L7-667 (add-impl): project hook authority明示input providerを実装する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #895 4 surface wiring前のauthority input provider port"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-PROVIDER-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: port
contract_preconditions: "Control Planeが12-field authority inputまたは取得不能の固定reason identityを明示する"
contract_postconditions: "provider結果をpure resolverへ無変更で渡し、取得不能・throw・malformedを既存stale/foreign failureへ決定的に変換する"
contract_invariants: "cwd、環境変数、primary tree、origin/main、provider例外本文からauthorityを補完しない"
contract_failures: "authority input取得不能をproject_hook_source_stale_or_foreign／authority_input pointer／side effect 0へ閉じる"
tdd_red_required: true
red_test: "U-CNWHOOKPROV-001..003がprovider module不在でsuite load failureになる"
red_at: "2026-08-24T19:39:48Z"
green_at: "2026-08-24T19:40:27Z"
mutation_oracle_evidence: "2026-08-24T19:43:08Zにprovider unavailable分岐を空objectのschema resolverへ縮退させ、tests/project-hook-authority-provider.test.tsのU-CNWHOOKPROV-002が期待stale/foreign・/authority_inputに対するschema_invalid・/schema_versionを検出して1 failed / 2 passed（exit 1）となるkillを実測した。正規failure projectionへ復元後に3/3 greenを再確認した。"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-24T21:23:25Z"
    tests_green_at: "2026-08-24T21:18:13Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    reviewed_head_sha: f986ebbbff6bf2ede1489659b79d4cf51c1b6f35
    scope: "PR #1006 HEAD f986ebbbff6bf2ede1489659b79d4cf51c1b6f35をClaude Codeが独立検収し、harness-check run 32776959655、providerのno-fallback契約、DB projection／replay、checkpoint／replayの一致を実測してblocker 0と判定した。canonical review: https://github.com/RetryYN/HELIX-HARNESS/pull/1006#issuecomment-5401557441"
    green_commands:
      - kind: smoke
        command: "gh run view 32776959655 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-24T21:18:13Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:8db6416d6f7fed98d1253aa612c4a8b8d6a063d17cd85bada570b27c196e3462"
        result: "completed / success / HEAD f986ebbbff6bf2ede1489659b79d4cf51c1b6f35"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-24T21:23:25Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-24T21:23:25Z"
    evidence_digest: "sha256:48599f8c913b1b5dbaa874e078db15793576981a648aaaa2cc648671a8542734"
  entries: []
complexity_effect: net_negative
complexity_justification: "4 surfaceが個別にcwdやcurrent authorityを推測する余地を一つの明示provider portへ集約する"
removal_trigger: "Assignment kernelが同等のtyped provider portを所有し本adapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKPROV-001, test_path: tests/project-hook-authority-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKPROV-002, test_path: tests/project-hook-authority-provider.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKPROV-003, test_path: tests/project-hook-authority-provider.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-667-project-hook-authority-input-provider.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/project-hook-authority-provider.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-authority-provider.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/project-hook-authority.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-651-project-hook-authority-resolver
  requires:
    - docs/plans/PLAN-L7-651-project-hook-authority-resolver.md
    - docs/plans/PLAN-L7-662-project-hook-physical-adapter.md
  blocks:
    - "issue:895-surface-projector"
agent_slots:
  - { role: se, slot_label: "SE — explicit provider port／failure projection" }
  - { role: qa, slot_label: "QA — unavailable／throw／malformed negative oracle" }
  - { role: tl, slot_label: "TL — L5 exact failure set／no-fallback監査" }
---

# project hook authority明示input provider

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | provider portをRed→Green | 明示inputだけをpure resolverへ渡す |
| 2 | unavailable projection | 既存failure code、固定pointer、side effect 0 |
| 3 | malformed／throw反証 | provider固有情報を出力せずfallback 0 |
| 4 | targeted／typecheck／Biome | 全green |
| 5 | mutation／Claude同一HEAD検収 | blocker 0 |

本sliceはauthority input providerだけを所有する。4 surface projector、Assignment kernel adapter、
process supervisor、Luna read-afterは依存順の後続sliceとし、current surfaceへcwd由来の暫定配線を作らない。
