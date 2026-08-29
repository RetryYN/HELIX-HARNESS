---
plan_id: PLAN-L7-601-physical-filesystem-identity
title: "PLAN-L7-601 (impl): physical filesystem identityを実行直前まで検証する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
review_evidence:
  - reviewer: "Codex TL preflight"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-19T09:29:30+09:00"
    tests_green_at: "2026-08-19T09:29:19+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "physical filesystem identity実装のcurrent HEAD preflight。exact literal、symlink／hardlink、target-set、TOCTOU再検証、coding-rule、digest inventory接合を確認した。これはClaude Codeの独立exact-HEAD reviewを代替しない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/physical-filesystem-identity.test.ts tests/coding-rules.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-19T09:29:19+09:00"
        evidence_path: tests/physical-filesystem-identity.test.ts
        output_digest: "sha256:f7a4f10c57aa979a7ad642b6b29cdd6ad255dba27e97e1fd68f38354a9012dca"
        result: "3 files / 27 tests green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #679 physical filesystem identity implementation slice"
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 679
behavior_contract_id: SECURITY-CAPABILITY-BROKER-PHYSICAL-IDENTITY-001
responsibility_owner: security-capability-broker
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements v1.3.12とSEC-FR-CAP-002/SEC-AC-CAP-002がcurrent authorityであり、PR #795のauthority migrationがcurrent-mainへread-after済みである"
contract_postconditions: "repo-relative exact literal targetだけをphysical identityへ束縛し、symlink/junction、repo外realpath、mount boundary、hardlink、special file、target-set ambiguity、判定後identity driftをfail-closeする"
contract_invariants: "operation capability、provenance、data/sink、approvalを実行しない。absolute path、raw command、secret、PIIをreceiptへ出さない。identity bindingの再検証なしに後続sliceが実行へ進めない"
contract_failures: "path traversal、glob/再帰、duplicate、exact count不一致、missing target、symlink/junction、mount未検証、device差異、hardlink、special file、open後identity drift、再検証digest driftを成功へ丸めない"
tdd_red_required: false
tdd_red_waiver_reason: "requirements authorityの受入条件を直接実装する既存runtime部品がなく、物理fixtureのnegative oracleと純粋なpreflight/revalidationを同一sliceで追加するため"
complexity_effect: justified_positive
complexity_justification: "lexical pathとphysical identity、exact target set、mount/hardlink boundary、TOCTOU revalidationを別fieldで保持し、既存の広域machine guardへ混載しない"
removal_trigger: "上位capability brokerがこのbinding schemaとrevalidation contractを吸収し、旧moduleへの参照が0になった時"
parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md
pair_artifact: docs/test-design/helix/L8-physical-filesystem-identity-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-62-security-capability-broker-authority.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/plans/PLAN-L3-62-security-capability-broker-authority.md
  references:
    - docs/test-design/helix/security-capability-broker-acceptance.md
  blocks:
    - issue:679-implementation-slice-2
agent_slots:
  - { role: se, slot_label: "SE — physical identity bindingとopen/revalidation boundary" }
  - { role: qa, slot_label: "QA — symlink/mount/hardlink/TOCTOU negative oracle" }
  - { role: tl, slot_label: "TL — #679 authority境界と後続provenance接続" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-001, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-002, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-003, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-004, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-005, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-006, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-007, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-008, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-009, test_path: tests/physical-filesystem-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/physical-filesystem-identity.md, oracle_id: U-PHYSID-010, test_path: tests/physical-filesystem-identity.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-601-physical-filesystem-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/physical-filesystem-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-physical-filesystem-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/physical-filesystem-identity.ts, artifact_type: source_module }
  - { artifact_path: tests/physical-filesystem-identity.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
---

# PLAN-L7-601: physical filesystem identityの実装契約

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | repo-relative literalとexact target setを正規化 | absolute、traversal、glob、再帰、duplicate、count不一致を拒否 |
| 2 | lexical/physical identityをopen後fstatまで束縛 | realpath、file type、device/inode、metadata digestをreceiptへ保持 |
| 3 | boundary oracleを実装 | symlink/junction、repo外、mount/bind、hardlink、special fileをfail-close |
| 4 | 実行直前revalidationを実装 | 判定時と再検証時のidentity digest driftを自動許可しない |
| 5 | L8 oracle、targeted CI、独立レビューへ接続 | current HEADでgreen、completion claimはfalse維持 |

## 責務境界

本PLANは、後続のoperation capability、execution provenance、data/sink、approval bindingを実行しない。
filesystem targetを安全に識別し、後続brokerが同じtargetを実行直前に再検証できるvalue objectだけを提供する。
絶対path、raw command、secret、PIIはreceiptへ保存しない。

mount情報を検証できない環境は、検証済みとして扱わず`PHYSICAL_TARGET_MOUNT_UNVERIFIED`で停止する。
legacy guardや別scannerのgreenでphysical identityの失敗を相殺しない。
