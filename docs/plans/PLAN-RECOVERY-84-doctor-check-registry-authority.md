---
plan_id: PLAN-RECOVERY-84-doctor-check-registry-authority
title: "PLAN-RECOVERY-84: doctor check registry authority"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1392
behavior_contract_id: DOCTOR-CHECK-REGISTRY-AUTHORITY-001
responsibility_owner: doctor-runtime
engineering_discipline_required: true
change_slice: atomic
refactor_step: consolidate_authority
legacy_retirement_state: retire_parallel_authority
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1392の隠れadvisoryと手書きdoctor集計を既存UTH-FR-011へ収束する"
contract_preconditions: "UTH-FR-011／UTH-AC-012とPLAN-L7-359のregistry/timing基盤がmainに存在する"
contract_postconditions: "doctor内部checkのhard/advisory分類とok集計が単一registry authorityから決まり、共有projection fallbackが観測可能になる"
contract_invariants: "個別checkの判定、message順、full doctorのfail-close意味、consumer/toolchain profileを変更しない"
contract_failures: "手書きANDの残存、hard check集計漏れ、advisoryのhard偽装、projection fallback無言化を拒否する"
tdd_red_required: true
red_test: "U-DOCCHECKREG-001..004が旧手書きAND、advisory boolean型、無言fallbackを検出して失敗する"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-02T09:24+09:00にdoctorCheckStatesから生成する全entryのseverityをhardからadvisoryへ反転し、tests/doctor-check-registry-authority.test.ts U-DOCCHECKREG-004がresult.ok=trueを検出して1 failed／exit 1となりmutationをkillした。hardへ復元後は同file 3/3 green。"
complexity_effect: decreases
complexity_justification: "二重のok authorityを一つのtyped registryへ収束し、重複ANDと隠れadvisoryを除去する"
removal_trigger: "なし。doctor内部check集計のcurrent authority"
backprop_decision: not_required
backprop_decision_reason: "既存UTH-FR-011／UTH-AC-012とPLAN-L7-359の未完実装をRecoveryし、要求意味は変更しない"
parent_design: docs/design/helix/L6-function-design/doctor-check-registry-authority.md
pair_artifact: docs/test-design/helix/L8-doctor-check-registry-authority-unit-test-design.md
dependencies:
  parent: null
  requires:
    - PLAN-L7-359-doctor-check-registry-extraction
  references:
    - "issue:1392"
    - docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
    - docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-84-doctor-check-registry-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/doctor-check-registry-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-doctor-check-registry-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/doctor-check-registry-authority.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/check-registry.ts, artifact_type: source_module }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-inventory-lifecycle.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db-legacy-workflow-object-retirement.test.ts, artifact_type: test_code }
  - { artifact_path: tests/nfr-registry-doctor.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — doctor authority重複とadvisory境界の監査" }
  - { role: se, slot_label: "SE — typed registry集計とfallback観測の実装" }
  - { role: qa, slot_label: "QA — hard count、mutation、message順の回帰oracle" }
  - { role: tl, slot_label: "TL — UTH-FR-011境界と非対象の収束判断" }
review_evidence: []
---

# doctor check registry authority復旧

`PLAN-L7-359`で導入した外側profile registryと、`runFullDoctor`内部のcheck集計を接続する。内部checkは`hard`または`advisory`を明示し、full doctorの`ok`はhard entryだけから算出する。旧手書きANDは互換経路として残さず削除する。

共有projection DBの構築失敗は各checkの自前rebuildへfallbackできるが、その事実をwarningとして必ず出力する。fallback成功を共有projection成功へ再解釈しない。
