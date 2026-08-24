---
plan_id: PLAN-L7-664-project-hook-physical-identity-validation
title: "PLAN-L7-664 (impl): project hook physical identityの退化stat値をfail-closeする"
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
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #983 device／inode fail-close dead pathを実効化する"
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 983
behavior_contract_id: CNW-HOOK-PHYSICAL-IDENTITY-VALIDATION-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L7-662のread-only project hook physical adapterがcurrent mainへ存在する"
contract_postconditions: "退化stat値・型外値・安全範囲外numberをunsupported_physical_identityへfail-closeし、validなdevice／inodeだけをreceiptへ投影する"
contract_invariants: "String coercionでunknownや退化値を成功へ丸めない。filesystem／Git write、schema変更、Windows provider追加を行わない"
contract_failures: "undefined、null、非有限数、非整数、安全範囲外number、負値、inode 0、0/0を成功へ丸めない"
tdd_red_required: true
red_test: "U-CNWHOOKPHYS-007がstat validation除去をredにする"
red_at: "2026-08-24T08:59:29Z"
green_at: "2026-08-24T08:58:12Z"
mutation_oracle_evidence: "M0 baselineはU-CNWHOOKPHYS-001..007の7 tests passed。normalizePhysicalStatIdentityのdevice／inode validationをString(stat.*)へ置換したM1 mutantではU-CNWHOOKPHYS-007がthrowせずred（1 failed、他6 testsはskip）となり、validation分岐の除去を検出した。mutantは破棄し、production実装を復元した"
complexity_effect: net_negative
complexity_justification: "dead pathを実効的な入力境界へ置換し、physical identityのvalidity判定を一箇所へ集約する"
removal_trigger: "後継cross-platform physical identity providerが同一validation contractを吸収し現adapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-physical-identity-validation.md
pair_artifact: docs/test-design/helix/L8-project-hook-physical-identity-validation-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-662-project-hook-physical-adapter.md
  requires:
    - src/runtime/project-hook-physical-adapter.ts
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/security-capability-broker-authority.md
  blocks:
    - issue:895-surface-wiring
agent_slots:
  - { role: se, slot_label: "SE — stat value validationとprovider境界" }
  - { role: qa, slot_label: "QA — 退化値・型外値・mutation oracle" }
  - { role: tl, slot_label: "TL — #983 scopeとphysical identity authority監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-identity-validation.md, oracle_id: U-CNWHOOKPHYS-007, test_path: tests/project-hook-physical-adapter.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-664-project-hook-physical-identity-validation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-physical-identity-validation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-physical-identity-validation-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/project-hook-physical-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/project-hook-physical-adapter.test.ts, artifact_type: test_code }
---

# PLAN-L7-664: project hook physical identityの退化値検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | stat identity validityを要件・設計へ分解 | `0/0`、型外、負値、非有限、非整数を拒否する契約がL6/L8へ接続される |
| 2 | validationをadapterへ実装 | validな値以外が `unsupported_physical_identity` へfail-closeする |
| 3 | negative oracleを追加 | U-CNWHOOKPHYS-007とmutation実測が成立する |
| 4 | targeted／typecheck／Biome／CI | current HEADで全green、Claude exact-HEAD reviewへ進める |

本PLANは#662の既存adapter契約を狭く補強する。Windows provider、schema変更、surface wiring、credentialや外部副作用は対象外とする。
