---
plan_id: PLAN-L7-451-lint-effect-port-separation
title: "PLAN-L7-451 (refactor): lint effect port分離"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #13 analyzer effect authorityをfail-close分離"]
created: 2026-07-13
updated: 2026-07-14
owner: Codex
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

## 予定出力（draft、未生成）

次の source/test artifact を本PLANの実装出力とする。draft中は未生成を許容するが、closure時は
`generates` の全artifactが実在し、各oracleが専用behavior testでgreenでなければならない。

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
