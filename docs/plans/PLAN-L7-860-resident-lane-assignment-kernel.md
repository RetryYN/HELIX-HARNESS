---
plan_id: PLAN-L7-860-resident-lane-assignment-kernel
title: "PLAN-L7-860 (impl): Resident Lane Assignment pure kernelを実装する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: pending_reverse
irreversible_impact: none
created: 2026-09-12
updated: 2026-09-12
red_at: "2026-09-12T11:21:34Z"
green_at: "2026-09-12T11:22:33Z"
owner: Codex / TL
github_issue_id: 860
responsibility_owner: resident-lane-assignment-kernel
behavior_contract_id: RESIDENT-ASSIGNMENT-BRANCH-LEASE-001
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L3-75でRLO要件とL3↔L10がconfirmedであり、#213 lease CAS、#215/#499 event substrate、#1256 reservation pure coreが存在する"
contract_postconditions: "Assignment exact schema、active exact-set projection、review return、takeoverをpure kernelとして提供し、21 oracleがgreenになる"
contract_invariants: "scope意味を管理層が変更せず、provider sessionへfallbackせず、第二lease／第二journal／第二Assignment lifecycleを新設しない"
contract_failures: "scope欠落・併記、unknown field、expired lease、duplicate writer、二active branch、foreign writer/branch、stale HEAD/fence、handover欠落をfail-closeする"
tdd_red_required: true
tdd_red_waiver_reason: "実装前にmodule不存在をU-RLA suiteで再現し、Cannot find moduleでRedを固定した"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-12T13:34:52Z、U-DRB-030がAssignment境界の20 mutationをkillした。独立監査で生存を指摘されたsafe-integer fence除去はU-RLA-020、PLAN scopeのrepository namespacing除去はU-RLA-021でRedとなり、実装・PLAN bindings・L8のoracle exact setは21件で一致した。"
complexity_effect: justified_positive
complexity_justification: "既存の単一assignment provider断片を、I/Oを持たない一つのdomain kernelへ収束させる。event/DB/GitHub責務は追加しない"
removal_trigger: "後継version schemaへ全consumerが移行しv2 input/output consumerが0になった時"
entry_signals:
  - "po_directive:Issue #860のL3 Slice 2 Assignment／Branch Lease Kernelを実装する"
agent_slots:
  - { role: se, slot_label: "SE — exact schemaとpure projection" }
  - { role: qa, slot_label: "QA — ownership／lease／HEAD mutation" }
  - { role: tl, slot_label: "TL — 管理層とproduct V-model境界" }
parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md
pair_artifact: docs/test-design/helix/L8-resident-lane-assignment-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-001, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-002, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-003, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-004, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-005, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-006, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-007, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-008, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-009, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-010, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-011, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-012, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-013, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-014, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-015, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-016, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-017, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-018, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-019, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-020, test_path: tests/resident-lane-assignment.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, oracle_id: U-RLA-021, test_path: tests/resident-lane-assignment.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
backprop_decision: not_required
backprop_decision_reason: "本PLANはconfirmed L3からのForward実装であり、既存上位authorityを変更しない。Reverse pairingは別routeでbackfillする"
dependencies:
  parent: docs/plans/PLAN-L3-75-resident-lane-orchestration-authority.md
  requires:
    - docs/plans/PLAN-L3-75-resident-lane-orchestration-authority.md
  references:
    - "issue:860"
    - "issue:213"
    - "issue:215"
    - "issue:499"
    - "issue:1256"
    - "issue:1771"
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-860-resident-lane-assignment-kernel.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/resident-lane-assignment-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-resident-lane-assignment-boundary-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L5-detail/resident-lane-assignment-contract.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-resident-lane-assignment-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L6-function-design/resident-lane-assignment-kernel.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/resident-lane-assignment.ts, artifact_type: source_module }
  - { artifact_path: tests/resident-lane-assignment.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude independent reviewer / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-12T13:45:10Z"
    tests_green_at: "2026-09-12T13:45:05Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: cc0802ad8c5fb87a385ee99c5ce5089b93af9dbe
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1773#issuecomment-5646273356"
    ci_evidence_generation: "run:34697071410:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1773:cc0802ad8c5fb87a385ee99c5ce5089b93af9dbe:claude:run:34697071410:attempt:1:failure"
    receipt_digest: "sha256:39b2977fbb7617c4cab7d46b6566f5a0752e302d51d9776bdf18a829b5a437a8"
    scope: "exact HEAD cc0802ad8を独立監査しblocker 0。safe-integer fence、repository namespacing、21 oracleのtest／PLAN／L8 exact setを再実測した。CI failureはdraftを検出するPOST_MERGE_PLANだけで、confirmed化後のfresh CIをmerge admissionとする。"
    green_commands:
      - { kind: smoke, command: "Claude exact-HEAD independent review receipt 5646273356", runner: ci, scope: targeted, exit_code: 0, completed_at: "2026-09-12T13:45:10Z", evidence_path: docs/plans/PLAN-L7-860-resident-lane-assignment-kernel.md, output_digest: "sha256:39b2977fbb7617c4cab7d46b6566f5a0752e302d51d9776bdf18a829b5a437a8", result: "reviewerがfresh clean worktreeでtargeted 12 files / 410 tests green、DB projection/replay一致、blocker 0を封緘。fresh CIはconfirmed化後に別途要求する。" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-12T13:45:10Z"
  review_binding:
    reviewer: "Claude independent reviewer / claude-opus-5"
    reviewed_at: "2026-09-12T13:45:10Z"
    evidence_digest: "sha256:39b2977fbb7617c4cab7d46b6566f5a0752e302d51d9776bdf18a829b5a437a8"
  entries: []
---

# Resident Lane Assignment純粋kernel

## 目的

#860全体のうち、L3 Slice 2の純粋contractだけを原子的に実装する。保存、GitHub、branch発行、dispatch、event統合、
#1256の本番配線を本PLANの完了へ含めない。

## TDD記録

1. `tests/resident-lane-assignment.test.ts`を先に追加した。
2. `2026-09-12T11:21:34Z`、対象module不存在でsuiteがRedになった。
3. pure module追加後、`2026-09-12T11:22:33Z`に9/9 green、独立監査と小さな是正を反復してidentity、repository、branch、lease、takeover、replay境界を補強した。
4. `2026-09-12T13:34:52Z`、実テスト・PLAN bindings・L8 test designをU-RLA-001..021へ再同期し、safe-integer fenceとPLAN scope repository namespacingの生存mutationへ反例を追加した。3 surfaceのexact setは各21件で差分0、targeted suiteは23 passed（21 oracle＋U-DRB-028／030）、`tsc --noEmit`とPLAN lintもexit 0となった。

## 完了前の残条件

- PLAN lint、design pair/上下trace、targeted regressionをgreenにする。
- Reverse pairingを独立routeでbackfillする。
- exact HEADの独立review、terminal CI、merge、main read-afterを行う。

本PLANのpure kernel sliceは独立reviewを経てconfirmedとする。保存・event・DB・GitHub接続とReverse pairingは後続義務として残し、本sliceの完了へ混同しない。
