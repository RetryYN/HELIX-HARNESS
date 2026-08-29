---
plan_id: PLAN-RECOVERY-69-migration-source-zip-retirement
title: "PLAN-RECOVERY-69: migration source ZIPをmanifestへ退役する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1196 tracked migration source ZIPをcontent-addressed manifestへ退役する"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1196
behavior_contract_id: MIGRATION-SOURCE-ZIP-RETIREMENT-001
responsibility_owner: source-intake-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: retire_legacy
legacy_retirement_state: removed
backprop_decision: not_required
backprop_decision_reason: "既存sourceのGit物理配置だけを退役し、採用済みrequirements／designの意味を変更しない。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "2 archiveのGit blob、archive digest、entry inventory、canonical projectionを照合できる"
contract_postconditions: "tracked source ZIPが0件となり、family ID、Git blob、archive digest、entry-set digestから履歴を再現できる"
contract_invariants: "generated distribution archiveとmigration source archiveを混同せず、archive内部versionをfilenameから推測しない"
contract_failures: "tracked source ZIP再混入、manifest欠落、wrong digest、v0.5.0内部root不一致の隠蔽を拒否する"
tdd_red_required: true
red_test: "U-SRCMAN-005..007がtracked migration ZIP、manifest exact set欠落、version identity誤昇格を検出する"
red_at: "2026-08-29T09:36:00+09:00"
green_at: null
mutation_oracle_evidence: "pending: manifest削除、ZIP再配置、v0.5.0 root_prefix改変を個別seedしてkillする"
complexity_effect: net_negative
complexity_justification: "約755KBのbinary sourceをGit current treeから除き、2個の小さなversioned receiptへ集約する。"
removal_trigger: "source-family manifestがRequirement IR標準intake receiptへ統合された時"
parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md
pair_artifact: docs/test-design/helix/L8-source-package-manifest-migration-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-005, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-006, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-007, test_path: tests/source-package-manifest.test.ts }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-68-source-package-manifest-migration.md
  requires: [docs/plans/PLAN-RECOVERY-68-source-package-manifest-migration.md]
  blocks: [issue:1199]
  references: ["issue:1196", "issue:1199"]
agent_slots:
  - { role: aim, slot_label: "AIM — source archiveの同名異digestとversion identity誤昇格の原因分離" }
  - { role: se, slot_label: "SE — archive inventoryとmanifest identity" }
  - { role: qa, slot_label: "QA — ZIP再混入とversion誤昇格mutation" }
  - { role: tl, slot_label: "TL — current／historical authority境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-69-migration-source-zip-retirement.md, artifact_type: markdown_doc }
  - { artifact_path: docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.0.json, artifact_type: json_config }
  - { artifact_path: docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.1.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/hybrid-rebaseline-v0.5.0-intake-audit-2026-07-18.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/source-package-manifest-migration.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-source-package-manifest-migration-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/source-package-manifest.test.ts, artifact_type: test_code }
  - { artifact_path: docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.0.zip, artifact_type: other }
  - { artifact_path: docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.1.zip, artifact_type: other }
---

# migration source ZIP退役

source binaryをcurrent Git treeから除去し、意味authorityは既存requirements／design、履歴provenanceはversioned manifestへ分離する。
