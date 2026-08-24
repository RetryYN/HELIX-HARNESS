---
plan_id: PLAN-L7-662-project-hook-physical-adapter
title: "PLAN-L7-662 (impl): project hook physical identity adapterを実装する"
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
  - "po_directive:Issue #895 pure resolverへ実filesystem identityを供給する"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-PHYSICAL-ADAPTER-001
responsibility_owner: project-hook-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
contract_preconditions: "PLAN-L7-651のpure resolver input schemaがroot／HEAD／source identityをexact化している"
contract_postconditions: "Linux/macOS adapterがrealpath、git common-dir、device／inode、HEAD、三source digestを観測値とcurrent authorityへ分離して返す"
contract_invariants: "filesystem／Gitはread-only、request mutation 0、unsupported platformをsameへ推測しない"
contract_failures: "unsupported_physical_identityまたはread failureをcallerへ返しfallbackしない"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "host依存captureを単一adapterへ隔離しpure resolverをI/O非依存に保つ"
removal_trigger: "cross-platform file identity providerへ置換され現adapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md
pair_artifact: docs/test-design/helix/L8-project-hook-physical-adapter-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-001, test_path: tests/project-hook-physical-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-002, test_path: tests/project-hook-physical-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-003, test_path: tests/project-hook-physical-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-004, test_path: tests/project-hook-physical-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-005, test_path: tests/project-hook-physical-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, oracle_id: U-CNWHOOKPHYS-006, test_path: tests/project-hook-physical-adapter.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — read-only filesystem／Git identity adapter実装" }
  - { role: qa, slot_label: "QA — symlink／worktree／unsupported platform oracle" }
  - { role: tl, slot_label: "TL — pure resolver境界とhost authority監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-662-project-hook-physical-adapter.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-physical-adapter.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-physical-adapter-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/project-hook-physical-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-physical-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-651-project-hook-authority-resolver.md
  requires:
    - src/runtime/project-hook-authority.ts
  blocks:
    - issue:895-surface-wiring
---

# project hookの物理identity adapter実装

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | injected adapterをRed→Green | host I/Oをfixtureで反証できる |
| 2 | realpath／common-dir／stat／HEAD capture | lexical path単独判定0 |
| 3 | observed／authority三digest分離 | 同一object上書き0 |
| 4 | unsupported platform fail-close | Windowsをstat推測でsameにしない |
| 5 | targeted／typecheck／Biome | 全green |

本sliceはcapture adapterだけを所有し、process supervisor、4 surface wiring、Windows file ID providerは後続とする。
