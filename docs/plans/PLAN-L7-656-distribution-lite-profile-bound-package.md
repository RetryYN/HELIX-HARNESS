---
plan_id: PLAN-L7-656-distribution-lite-profile-bound-package
title: "PLAN-L7-656 (impl): Lite exact artifact setを共通deterministic builderへ接続する"
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
  - "po_directive:Issue #947 consumer_core_v1を既存builderへprofile-bound接続する"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 947
behavior_contract_id: DISTRIBUTION-LITE-PROFILE-PACKAGE-001
responsibility_owner: distribution-lite-profile-package
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "#941のartifact projectionとdependency closureがcurrent profileでgreen"
contract_postconditions: "profile-bound Lite tarball／manifest／checksumを共通builderから決定的に生成する"
contract_invariants: "Full HELIX正本、DevOS identity、exact artifact set、publish approval境界を維持する"
contract_failures: "profile／projection／closure／path／identity不正をarchive write前にtyped failureで拒否する"
tdd_red_required: true
red_test: "U-DISTPKG-001..006が未実装shared builderとprofile admissionを検出する"
red_at: 2026-08-23T05:50:31+09:00
green_at: 2026-08-23T10:06:03+09:00
mutation_oracle_evidence: "U-DISTPKG-005で1 byte mutationによりtarball digest不一致を実測。resolvePhysicalSourceのsymlink拒否除去をU-DISTPKG-009bが検出した。fresh stack監査でWindows absolute、logical traversal、artifact stem逸脱、manifest extension／digest alias上書きをU-DISTPKG-009d／009eへ追加した。Luna/xhigh adversarial reviewでsource root symlink、output directory／final file symlink・hardlink、directory recursive収録、top-level／nested runtime余剰identity keyのok=true反例を実測し、U-DISTPKG-009f..009mでexclusive write前のtyped拒否とcanonical IR loader共有へ是正した。再レビューでdangling output symlinkとcompatibility artifactDigest aliasの拒否漏れを実測し、source hardlink境界と合わせてU-DISTPKG-009n／009oへ固定した"
complexity_effect: net_neutral
complexity_justification: "既存CLI内archive処理を共通coreへ抽出し、Lite専用builderの重複を作らない"
removal_trigger: "distribution package identityが単一generated release transactionへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — shared archive core／identity receipt" }
  - { role: qa, slot_label: "QA — fail-before-write／determinism mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-bound-package-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-001, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-002, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-003, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-004, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-005, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-006, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-007, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-008, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009b, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009c, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009d, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009e, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009f, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009g, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009h, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009i, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009j, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-010, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-011, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-012, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009k, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009l, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009m, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009n, test_path: tests/distribution-lite-profile-package.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, oracle_id: U-DISTPKG-009o, test_path: tests/distribution-lite-profile-package.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-profile-bound-package-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-package-builder.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-package.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-cli.ts, artifact_type: source_module }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: tests/distribution-lite-profile-package.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md
    - docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md
  references:
    - issue:947
  blocks:
    - issue:948
review_evidence: []
---

# PLAN-L7-656: Lite profile-bound決定的package

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L6/L8とred oracleを固定 | fail-before-writeとidentityが反証可能 |
| 2 | 既存archive処理をshared coreへ抽出 | Full packageの出力契約を維持 |
| 3 | profile／projection／closureを接続 | current profileのみgreen |
| 4 | 2 build＋mutation＋CLI検証 | digest一致と差分検出 |
| 5 | 全CI／doctor／Claude exact-HEADレビュー | blocker 0 |

## 非対象

setup／status／doctor／minimal workflowのclean consumer実行、Windows smoke、tag、publish、promotion、remote applyは
#948／#659へ残す。本sliceではpackage installとprebuilt `helix --version`の起動だけを検証する。
