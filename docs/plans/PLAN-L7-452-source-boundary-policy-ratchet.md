---
plan_id: PLAN-L7-452-source-boundary-policy-ratchet
title: "PLAN-L7-452 (impl): source boundary total-decision ratchet"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #15 EMPTY/default allowをtotal-decisionへratchet"]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE — shared edge extractorとpolicy evaluator" }
  - { role: qa, slot_label: "QA — total-decision mutation oracle" }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-79のfail-close policyを実装候補へ降下し、PLAN-L7-428は要求provenanceとしてのみ参照する。"
parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md
pair_artifact: docs/test-design/harness/L8-source-boundary-contracts.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-003, test_path: tests/source-boundary-policy.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-007, test_path: tests/source-boundary-policy.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-008, test_path: tests/source-boundary-policy.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-011, test_path: tests/source-boundary-policy.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-012, test_path: tests/source-boundary-policy.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-452-source-boundary-policy-ratchet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/source-edge-extractor.ts, artifact_type: source_module }
  - { artifact_path: src/lint/source-boundary-policy.ts, artifact_type: source_module }
  - { artifact_path: tests/source-boundary-policy.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-79-source-boundary-contracts.md
  requires: []
  references:
    - docs/plans/PLAN-L7-428-enforcement-wiring-gap.md
    - docs/plans/PLAN-L7-450-state-db-vscode-decoupling.md
    - docs/plans/PLAN-L7-451-lint-effect-port-separation.md
---

# PLAN-L7-452: source boundary全域判定の段階的強化

## 実装境界

`src/lint/source-edge-extractor.ts`をdirect/type-only/re-export/dynamic import、literal `require()`、import-equalsの
単一extractor ownerとする。computed/nonliteral requireはunknown edgeとしてfail-closeする。
全ownerのdefault denyとexplicit allowでlive edgeをtotal decisionし、未知module・未知edge kind・default欠落をfail-closeする。
`PLAN-L7-428-enforcement-wiring-gap` W2はreachability要求のprovenanceであり、shared extractor dependencyではない。

## 完了条件

`U-SBOUND-003/007/008/011/012`と`IT-SBOUND-005/006`、実repo graph、mutation test、independent reviewがgreenである。
