---
plan_id: PLAN-RECOVERY-68-source-package-manifest-migration
title: "PLAN-RECOVERY-68: source ZIP正本をmanifest identityへ移行する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1195 root source ZIPとdeep researchの責務配置・原本処分"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1195
behavior_contract_id: SOURCE-PACKAGE-MANIFEST-001
responsibility_owner: source-intake-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "既存L3/L10へ採用済みsourceの物理配置とidentityを是正し、新しい製品挙動は追加しない。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "旧archive digest、entry inventory、既存canonical projection、current runtime consumerを照合できる"
contract_postconditions: "current outputはsource_family_idを返し、root source ZIPはtreeから消え、manifestでprovenanceを再現できる"
contract_invariants: "archive filenameはcompatibility input-only、raw researchはauthorityではなく、source codeをbulk importしない"
contract_failures: "missing manifest、wrong digest、root ZIP再混入、legacy filename current出力、unverified research昇格を拒否する"
tdd_red_required: true
red_test: "U-SRCMAN-001..004がroot ZIP存在、manifest欠落、legacy current identity、raw citation昇格を検出する"
red_at: "2026-08-29T06:30:00+09:00"
green_at: "2026-08-29T07:08:25+09:00"
mutation_oracle_evidence: "tests/source-package-manifest.test.ts の U-SRCMAN-001..004 は、manifest欠落、root ZIP再混入、legacy current identity、source binding欠落のseeded mutationを個別にkillしてredにする。"
complexity_effect: net_negative
complexity_justification: "binary source packageをcurrent treeとruntime identityから除き、2個のversioned manifestと既存canonical projectionへ集約する。"
removal_trigger: "source-family manifestがRequirement IRの標準intake receiptへ統合された時"
parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md
pair_artifact: docs/test-design/helix/L8-source-package-manifest-migration-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-001, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-002, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-003, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md, oracle_id: U-SRCMAN-004, test_path: tests/source-package-manifest.test.ts }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - "issue:1195"
    - "issue:1033"
    - "issue:1174"
agent_slots:
  - { role: aim, slot_label: "AIM — source採否と上流authority trace" }
  - { role: se, slot_label: "SE — source identityとmanifest migration" }
  - { role: qa, slot_label: "QA — ZIP再混入とlegacy output反例" }
  - { role: tl, slot_label: "TL — authority／research disposition境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-68-source-package-manifest-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/source-package-manifest-migration.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-source-package-manifest-migration-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/migration/source-manifests/universal-workflow-requirements-skill.v1.1.0.json, artifact_type: json_config }
  - { artifact_path: docs/migration/source-manifests/hybrid-vmodel-source.v1.json, artifact_type: json_config }
  - { artifact_path: docs/research/design-harness-ecosystem-disposition-2026-08-29.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/vmodel-docgen-fit.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/multimodal-design-harness-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L12-vmodel/vmodel-layer-coverage.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/operation-scope.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/operation-scope.md, artifact_type: test_design }
  - { artifact_path: docs/research/design-harness-deep-research-coverage-2026-07-29.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/repository-structure.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/hybrid-vmodel-manifest.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/vmodel-fit.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/summary-surface-audit.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/source-package-manifest.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tracked-canonical.test.ts, artifact_type: test_code }
  - { artifact_path: tests/universal-workflow-requirements-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-multimodal-design-harness-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/db-projection-ingestion.test.ts, artifact_type: test_code }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-treeview.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-view-model.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: ハイブリッド設計ドキュメントv1-fixed.zip, artifact_type: other }
---

# source package manifest移行

rootへ置かれたbinary archiveをcurrent authorityとして利用せず、意味採用済みprojectionとversioned source manifestへ分離する。
旧archive名は履歴とcompatibility inputにだけ残し、DB／CLI／Project viewは`hybrid-vmodel-source.v1`を返す。
