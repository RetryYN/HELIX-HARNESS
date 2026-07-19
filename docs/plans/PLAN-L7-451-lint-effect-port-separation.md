---
plan_id: PLAN-L7-451-lint-effect-port-separation
title: "PLAN-L7-451 (refactor): lint effect port分離"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #13 analyzer effect authorityをfail-close分離"]
created: 2026-07-13
updated: 2026-07-14
owner: Codex
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-18T16:33:00Z"
  review_binding:
    reviewer: agent_lease_cluster
    reviewed_at: "2026-07-18T16:33:00Z"
    evidence_digest: "sha256:6ffec43b1ec32cf493e84f0fb25a50026fefadb54a49338592635c3452ffdf62"
  entries: []
review_evidence:
  - reviewer: agent_lease_cluster
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-18T16:33:00Z"
    tests_green_at: "2026-07-18T16:32:00Z"
    verdict: pass
    scope: "effect/policy oracle、readonly route、durability負例を独立監査。Blocker/High 0。2026-07-19に再検証。"
    green_commands:
      - { kind: integration_test, command: "npx --no-install vitest run tests/source-boundary-policy.test.ts tests/source-boundary-integration.test.ts --testTimeout 300000", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:28:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:cadaacbff7c7843c07095c03e15d9f44b7822c00b147e1ccd203d1f24e1ce3dc" }
      - { kind: integration_test, command: "npx --no-install vitest run tests/slow/lint-readonly-route.test.ts --testTimeout 300000", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:29:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:b6f23889e118797c2e1140dc2df86513ec955fe5d15d06d49eca4b736d2c809c" }
agent_slots:
  - { role: se, slot_label: "SE — effect intent/executor port分離" }
  - { role: qa, slot_label: "QA — authority/drift/durability負例" }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-79のeffect DbCを実装候補へ降下し、外部操作は追加しない。"
parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-004, test_path: tests/lint-effect-intent.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-006, test_path: tests/lint-effect-executor.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-009, test_path: tests/lint-effect-executor.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-010, test_path: tests/lint-effect-executor.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-014, test_path: tests/slow/lint-readonly-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-015, test_path: tests/lint-probe-adapter.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-016, test_path: tests/lint-artifact-write-port.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-451-lint-effect-port-separation.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/effect-intent.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/lint-effect-executor.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/lint-probe-adapter.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/lint-artifact-write-port.ts, artifact_type: source_module }
  - { artifact_path: tests/lint-effect-intent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/lint-effect-executor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/lint-probe-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/lint-artifact-write-port.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/lint-readonly-route.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-79-source-boundary-contracts.md
  requires: []
---

# PLAN-L7-451: lint effect port分離

## 実装境界

analyzerをimmutable snapshotだけのpure functionに限定する。probe/materializeはcapability、authorization、snapshot、
idempotency、CAS、durabilityを検証するexecutorへ隔離し、partial writeをacceptedにしない。

## 実装出力

次の source/test artifact は全て実在し、各oracleを専用behavior testでgreen化した。

- `src/lint/effect-intent.ts`
- `src/runtime/lint-effect-executor.ts`
- `src/runtime/lint-probe-adapter.ts`
- `src/runtime/lint-artifact-write-port.ts`
- `tests/lint-effect-intent.test.ts`
- `tests/lint-effect-executor.test.ts`
- `tests/lint-probe-adapter.test.ts`
- `tests/lint-artifact-write-port.test.ts`
- `tests/slow/lint-readonly-route.test.ts`

## 検証境界

`tests/source-boundary-design.test.ts` は既存のV-pair structural guardであり、本PLANの生成物ではない。
effect behaviorは専用testへ限定し、structural guardをruntime behaviorのgreen根拠に流用しない。

## 完了条件

`U-SBOUND-004/006/009/010/014/015/016`と`IT-SBOUND-003/004/007/008`、targeted test、independent reviewがgreenである。
