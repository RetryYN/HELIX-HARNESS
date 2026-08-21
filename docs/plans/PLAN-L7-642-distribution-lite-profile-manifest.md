---
plan_id: PLAN-L7-642-distribution-lite-profile-manifest
title: "PLAN-L7-642 (impl): Lite capability profile manifestを型付けする"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #856 DIST-LITE-R-01/R-02をmanifest schemaへ降ろす"
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 856
behavior_contract_id: DISTRIBUTION-LITE-PROFILE-001
responsibility_owner: distribution-lite-profile-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "DIST-LITE-FR-001とconsumer_core_v1のL3/L10 pairが存在する"
contract_postconditions: "Lite profileがtyped capability exact set、profile digest、Requirement IR refinement digestへ束縛される"
contract_invariants: "HELIX-HARNESSだけをsource authorityとし、#819/#854等の除外capabilityをallowlistへ混在させない"
contract_failures: "parse、duplicate、overlap、profile digest、refinement欠落／driftをfail-closeする"
tdd_red_required: true
red_test: "U-DISTLITE-002でprofile digest検証を除去した退行を先行検出する"
red_at: "2026-08-21T03:37:04Z"
green_at: "2026-08-21T03:37:19Z"
mutation_oracle_evidence: "src/setup/distribution-profile.ts のprofile_digest_mismatch検証を一時的に除去した。2026-08-21T03:37:04Zにtests/distribution-profile.test.tsを実行し、U-DISTLITE-002がexpected profile_digest_mismatch / received failures=[]で1件red、他2件greenとなり退行を検出した。検証を復元後、2026-08-21T03:37:19Zに同3 testsがexit 0でgreenへ戻り、source diff 0を確認した。"
complexity_effect: justified_positive
complexity_justification: "手編集path allowlistをtyped profile projectionへ置換し、後続builderの入力境界を一箇所にする"
removal_trigger: "distribution profile registryがRequirement IRの同一typed schemaへ吸収され全consumerが移行した時"
agent_slots:
  - { role: se, slot_label: "SE — profile schema／digest／refinement authority" }
  - { role: qa, slot_label: "QA — duplicate／overlap／digest drift negative oracle" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-manifest-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, oracle_id: U-DISTLITE-001, test_path: tests/distribution-profile.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, oracle_id: U-DISTLITE-002, test_path: tests/distribution-profile.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, oracle_id: U-DISTLITE-003, test_path: tests/distribution-profile.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, oracle_id: U-DISTLITE-004, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-profile-manifest.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-profile-manifest-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: config/distribution-profile-catalog.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/setup/distribution-profile.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-profile.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - docs/test-design/helix/distribution-package-release-system-test-design.md
  blocks:
    - issue:856-lite-artifact-projection
review_evidence:
  - reviewer: "Claude Code / Fable"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T04:15:02Z"
    tests_green_at: "2026-08-21T04:15:02Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:fable
    scope: "PR #858 exact HEAD 36e4a8cb753b03bfd70a9f9bc86920c936383c88を独立検収。profile digestとcatalog digestを再計算し、宣言値との一致、allowlist 11／exclusions 10、非対象境界、mutation復元後3 tests greenを確認してblocker 0。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/858#issuecomment-5365118851。非blockerのcatalog_invalid二経路oracle不足はIssue #882へ分離した。"
---

# PLAN-L7-642: Lite capability profile manifest実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L3/L10 exact setをL6/L8へ分解 | authorityとbehavior未実装境界が明示される |
| 2 | catalog schema／loaderを実装 | identity、digest、refinementをfail-close検証する |
| 3 | positive／negative oracleを実装 | duplicate、overlap、digest driftが検出される |
| 4 | PLAN lint、typecheck、targeted test、Claude review | blocker 0、candidate exact HEADが一致する |

## 非対象

artifact path projection、builder、consumer E2E、promotion、publishは後続PLANへ分離する。
