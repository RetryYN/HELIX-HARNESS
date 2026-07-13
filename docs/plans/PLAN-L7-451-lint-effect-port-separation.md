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
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-004, test_path: tests/source-boundary-design.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-006, test_path: tests/source-boundary-design.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-009, test_path: tests/source-boundary-design.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-010, test_path: tests/source-boundary-design.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-451-lint-effect-port-separation.md, artifact_type: markdown_doc }
  - { artifact_path: tests/source-boundary-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-79-source-boundary-contracts.md
  requires: []
---

# PLAN-L7-451: lint effect port分離

## 実装境界

analyzerをimmutable snapshotだけのpure functionに限定する。probe/materializeはcapability、authorization、snapshot、
idempotency、CAS、durabilityを検証するexecutorへ隔離し、partial writeをacceptedにしない。

## 予定出力（draft、未生成）

次の source artifact は本PLANが `confirmed` になる実装時に `generates` へ昇格させる。未実在の
artifact を `generates` に載せて relation graph の実装済み edge として扱わない。

- `src/lint/effect-intent.ts`
- `src/runtime/lint-effect-executor.ts`

## 検証境界

`tests/source-boundary-design.test.ts` は既存のV-pair structural guardであり、本PLANの生成物ではない。
`verification_bindings` は後続実装時に当該oracleを具体的なbehavior testへ拡張する責務を表す。

## 完了条件

`U-SBOUND-004/006/009/010`と`IT-SBOUND-003/004/007/008`、targeted test、independent reviewがgreenである。
