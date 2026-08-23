---
plan_id: PLAN-L7-657-distribution-lite-consumer-canary
title: "PLAN-L7-657 (impl): Lite clean consumer canaryを成立させる"
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
  - "po_directive:Issue #948で同一Lite artifactのclean Linux consumerとWindows smokeを成立させる"
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
ddd_modeling_decision: domain_service
contract_preconditions: "#947のprofile-bound deterministic tarball／manifest／checksumがgreen"
contract_postconditions: "同一artifactをclean Linux／Windowsで実行しcompletion evidenceとrollback receiptへ束縛する"
contract_invariants: "Full HELIX唯一正本、consumer所有bytes保全、同一artifact、remote write 0"
contract_failures: "差替え、checksum、HEAD、profile、physical path、setup ownership、OS artifact driftをtyped拒否する"
tdd_red_required: true
red_test: "U-DISTCAN-001..004が未検証artifactの実行可能性を拒否する"
red_at: null
green_at: null
mutation_oracle_evidence: "tests/distribution-lite-consumer-canary.test.tsのtarballへ1 byteを追加するとU-DISTCAN-002がartifact_digest_mismatchでredになり、復元後4/4 green"
complexity_effect: justified_positive
complexity_justification: "配布artifactを実行前に再検証する共通admissionとOS別receiptを追加する"
removal_trigger: "consumer release transactionが同じadmission／canary receiptを単一promotion kernelへ統合した時"
agent_slots:
  - { role: se, slot_label: "SE — artifact admission／consumer runtime composition" }
  - { role: qa, slot_label: "QA — Linux／Windows／rollback mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-001, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-002, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-003, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-004, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-005, test_path: tests/distribution-lite-consumer-canary.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006a, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006b, test_path: tests/distribution-lite-consumer-services.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-007a, test_path: tests/distribution-lite-consumer-services.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/setup/distribution-lite-consumer-canary.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-consumer-services.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-cli.ts, artifact_type: source_module }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: json_catalog }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-services.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:948
  blocks:
    - issue:856-clean-consumer-canary
review_evidence: []
---

# PLAN-L7-657: Lite clean consumer canary

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | artifact admissionをRed→Green | 差替え／checksum／HEAD／profileを実行前に拒否 |
| 2 | consumer runtime serviceを接続 | setup／status／doctor／minimal workflow／completionが実起動 |
| 3 | Linux fresh process E2E | installからgenerated CIまでgreen |
| 4 | Windows＋rollback rehearsal | 同一artifactとconsumer bytes保全 |
| 5 | 全CI／doctor／Claude exact-HEADレビュー | blocker 0 |

## 非対象

tag、publish、remote sync、promotion、DevOS cutoverは実行しない。
