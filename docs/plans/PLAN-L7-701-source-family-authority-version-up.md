---
plan_id: PLAN-L7-701-source-family-authority-version-up
title: "PLAN-L7-701 (retrofit): source archive identityをversioned source family authorityへ移行する"
kind: retrofit
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals:
  - "po_directive:root source ZIPを廃止しversioned source familyをcurrent identityへ昇格する"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1199
behavior_contract_id: SOURCE-FAMILY-AUTHORITY-VERSION-UP-001
responsibility_owner: source-family-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements正本自身のsource identityと、そのdigest consumerを同一version-up transactionで再束縛する。"
no_code_decision: configure
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-RECOVERY-68/69によりroot ZIPがexact manifestへ移行され、archive本体がretire済みである"
contract_postconditions: "requirements v1.3.14からregistry、catalog、policy、skill applicability、NFR、PLANへversioned source familyとcurrent digestだけが一方向投影される"
contract_invariants: "旧archive filename、archive SHA、Git blobはmigration manifestのprovenance input-onlyに限定し、historical evidenceは書き換えない"
contract_failures: "manifest欠落、wrong archive digest、old filename current emission、requirements/registry/catalog/policy/consumer digest driftをfail-closeする"
tdd_red_required: true
red_test: "U-SRCMAN-008/009でrequirementsの旧filename current emissionを検出する"
red_at: "2026-08-29T03:38:00Z"
green_at: "2026-08-29T03:40:32Z"
mutation_oracle_evidence: "旧Universal Workflow archive filenameをrequirementsへ再注入するmutationがcurrentSourceFamilyAuthorityFindingsのlegacy emission findingへ入りU-SRCMAN-009でkillされ、archive_sha256を64桁の0へ変えるmutationもsourceManifestIdentityFindingsのdigest mismatchへ入りU-SRCMAN-001でkillされる。"
complexity_effect: net_negative
complexity_justification: "3 archive filenameとraw digestをcurrent authorityから除去し、3つのversioned source familyと既存manifestへ一本化する"
removal_trigger: "source family schema major version更新時に後継manifest transactionへ置換する"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: tests/source-package-manifest.test.ts
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires: []
  blocks: []
  references:
    - "issue:1199"
    - "issue:1195"
    - docs/plans/PLAN-RECOVERY-68-source-package-manifest-migration.md
    - docs/plans/PLAN-RECOVERY-69-migration-source-zip-retirement.md
agent_slots:
  - { role: tl, slot_label: "TL — requirementsとsource family authority transaction" }
  - { role: se, slot_label: "SE — registry/catalog/policy projection再生成" }
  - { role: qa, slot_label: "QA — legacy emission／digest drift mutation" }
verification_bindings:
  - { parent_design: docs/governance/helix-harness-requirements_v1.3.md, oracle_id: U-SRCMAN-008, test_path: tests/source-package-manifest.test.ts }
  - { parent_design: docs/governance/helix-harness-requirements_v1.3.md, oracle_id: U-SRCMAN-009, test_path: tests/source-package-manifest.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-701-source-family-authority-version-up.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: json_config }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json, artifact_type: json_config }
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L3-requirements/skill-applicability-registry.v1.json, artifact_type: json_config }
  - { artifact_path: config/nfr-registry.json, artifact_type: json_config }
  - { artifact_path: config/distribution-profile-catalog.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/hybrid-vmodel-manifest.ts, artifact_type: source_module }
  - { artifact_path: tests/source-package-manifest.test.ts, artifact_type: test_code }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-profile-package.test.ts, artifact_type: test_code }
  - { artifact_path: tests/skill-applicability-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-catalog-lint.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
---

# Source family authorityのversion-up

## 目的

rootへ置かれていたsource ZIPのfilename／raw digestをcurrent requirements identityから除去し、既存のexact manifestが所有するversioned source familyへ置換する。

## 移行順序

1. requirementsをv1.3.14へversion-upし、3 source familyをcurrent identityにする。
2. requirements digestへclassification registryを再束縛し、registryをv1.1.6へ更新する。
3. generated catalogをregistry bytesから決定的に再生成する。
4. execution policy registryをv1.2.3へ更新し、generated policyを再生成する。
5. skill applicability、NFR、process、typed PLAN、DB projection testを同じregistry tupleへ移行する。
6. old filename current emissionとdigest driftのmutationをkillし、full regression／doctor／DB convergence／Claude exact-HEAD reviewを閉じる。

## 非対象

- migration manifest内のlegacy filename、archive SHA、Git blobの削除
- historical PLAN／audit／archiveの書換え
- source archiveの再配置または再導入
- 配布物のpublish、tag、cutover
