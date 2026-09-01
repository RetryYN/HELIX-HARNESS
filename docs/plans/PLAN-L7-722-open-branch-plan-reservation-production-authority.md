---
plan_id: PLAN-L7-722-open-branch-plan-reservation-production-authority
title: "PLAN-L7-722: PLAN reservation production authority adapter"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1256
behavior_contract_id: OBPRA-AC-001
responsibility_owner: open-branch-plan-reservation-production-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1256 reservation pure coreをproduction authorityへ接続する"
contract_preconditions: "GitHub current main／PR headsとassignment active writerがtyped materialとして同一capture epochへ束縛される"
contract_postconditions: "canonical reservation snapshotを生成し、既存pure projectionが唯一の競合判定を返す"
contract_invariants: "adapterに競合規則を複製せず、同一branch／HEADのPR-writer mirrorだけを同一作業として扱う"
contract_failures: "unavailable、wrong HEAD／lease、unknown field、terminal evidence不整合をlocal greenへfallbackしない"
tdd_red_required: true
red_at: "2026-09-01T13:21:02+09:00"
green_at: "2026-09-01T13:21:49+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T13:26:46+09:00にPR／writer mirrorのbranch一致guardを一時除去し、npx --no-install vitest run tests/open-branch-plan-identity-reservation.test.tsでU-OBPIR-009が1 failed／8 passedとなりmutationをkillした。直後にguardを復元した。"
complexity_effect: net_neutral
complexity_justification: "既存pure projectionを再利用し、effect materialからcanonical snapshotへのadapterだけを追加する"
removal_trigger: "GitHub／assignment kernelがcanonical reservation snapshotを直接発行する時"
backprop_decision: not_required
backprop_decision_reason: "Issue #1255のpure contractを変更せずproduction effect boundaryを追加する。"
parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md
pair_artifact: docs/test-design/helix/L8-open-branch-plan-reservation-production-authority-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
  requires:
    - docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md
  references:
    - issue:1256
    - docs/plans/PLAN-L7-721-reservation-snapshot-schema-fail-close.md
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, oracle_id: U-OBPRA-001, test_path: tests/open-branch-plan-reservation-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, oracle_id: U-OBPRA-002, test_path: tests/open-branch-plan-reservation-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, oracle_id: U-OBPRA-003, test_path: tests/open-branch-plan-reservation-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, oracle_id: U-OBPRA-004, test_path: tests/open-branch-plan-reservation-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, oracle_id: U-OBPIR-009, test_path: tests/open-branch-plan-identity-reservation.test.ts }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-722-open-branch-plan-reservation-production-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/open-branch-plan-reservation-production-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-open-branch-plan-reservation-production-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/adapters/open-branch-plan-reservation-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/open-branch-plan-reservation-authority.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/runtime/open-branch-plan-identity-reservation.ts, artifact_type: source_module }
  - { artifact_path: tests/open-branch-plan-identity-reservation.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — GitHub／assignment material adapter" }
  - { role: qa, slot_label: "QA — mirror／unavailable／wrong identity mutation" }
  - { role: tl, slot_label: "TL — production authority接続と後続slice境界" }
---

# PLAN reservation production authority adapter

## 工程表

1. typed effect materialとcanonical snapshotの境界を固定する。
2. PR／writer mirror接合のRedを既存pure projectionで再現する。
3. 同一branch／HEAD／identityだけをmirrorとして許可し、targeted testとtypecheckをgreen化する。
4. 後続sliceでGitHub API pagination、PR preflight、doctor、DB projectionを同じprojection digestへ接続する。

本PLAN単独ではIssue #1256のcompletionを主張しない。
