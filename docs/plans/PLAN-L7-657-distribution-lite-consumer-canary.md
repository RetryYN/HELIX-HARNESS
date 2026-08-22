---
plan_id: PLAN-L7-657-distribution-lite-consumer-canary
title: "PLAN-L7-657 (test): HELIX-HARNESS-LITE clean consumer canaryを成立させる"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #948 HELIX-HARNESS-LITE clean consumer canaryを成立させる"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 948
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-CANARY-001
responsibility_owner: distribution-lite-consumer-canary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: application_service
contract_preconditions: "#947 profile-bound packageがdeterministic green"
contract_postconditions: "同一Lite artifactがclean Linux consumerとWindows smokeでidentity-bound green"
contract_invariants: "consumer ownership、excluded capability、DevOS identity、publish境界を維持する"
contract_failures: "checksum／HEAD／profile／ownership／runtime driftをtyped failureでinstall前またはwrite前に拒否する"
tdd_red_required: true
red_test: "fresh consumer npm install後にdist/helix.jsがなくbuild／CLI起動不能になることを実測"
red_at: 2026-08-23T06:09:29+09:00
green_at: 2026-08-23T06:31:08+09:00
mutation_oracle_evidence: "U-DISTCANARY-009でchecksum／source HEAD／profile digestを各1 byte変異させ、verifyDeterministicDistributionPackageがchecksum_mismatch／source_head_mismatch／profile_digest_mismatchとして全件拒否することを実測"
complexity_effect: justified_positive
complexity_justification: "consumer entrypointとservice portsをFull monolithから分離し、単一bundleでplatform parityを作る"
removal_trigger: "Lite canaryが#659 stable release rehearsalへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — Lite entrypoint／service／bundle" }
  - { role: qa, slot_label: "QA — clean consumer／mutation／Windows parity" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-001, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-002, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-003, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-004, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-005, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-007, test_path: tests/slow/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-008, test_path: tests/slow/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-009, test_path: tests/slow/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-010, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-011, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-012, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-013, test_path: tests/distribution-consumer-node-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCANARY-014, test_path: tests/distribution-dependency-closure.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: package.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/templates/adapter/AGENTS.md, artifact_type: template }
  - { artifact_path: docs/templates/adapter/CLAUDE.md, artifact_type: template }
  - { artifact_path: docs/templates/distribution-lite/.codex/hooks.json, artifact_type: template }
  - { artifact_path: docs/templates/distribution-lite/.claude/settings.json, artifact_type: template }
  - { artifact_path: docs/templates/github/common/pack-harness-check.yml, artifact_type: template }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow }
  - { artifact_path: src/setup/distribution-consumer-command-registry.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-node-adapter.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-entrypoint.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-hook-adapter.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-services.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-package.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-package-builder.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-consumer-command-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-command-composition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-node-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-dependency-closure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-services.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
  references:
    - issue:948
  blocks:
    - issue:856-consumer-canary
review_evidence: []
---

# PLAN-L7-657: Lite clean consumer canary

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | consumer bundle／package transform | install後に同一dist artifactが起動 |
| 2 | setup／status／doctor／completion／lifecycle | ownershipとidempotency green |
| 3 | clean Linux E2E／negative mutation | manifest chain一致 |
| 4 | Windows same-artifact smoke | platform rebuildなし |
| 5 | full CI／doctor／Claude review | blocker 0 |

## 非対象

tag、publish、remote cutover、promotionは#659へ残す。
