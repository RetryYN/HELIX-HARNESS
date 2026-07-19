---
plan_id: PLAN-L7-452-source-boundary-policy-ratchet
title: "PLAN-L7-452 (impl): source boundary total-decision ratchet"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-13 PLAN-L7-446 #15 EMPTY/default allowをtotal-decisionへratchet"]
created: 2026-07-13
updated: 2026-07-13
owner: Codex
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-18T16:33:00Z"
  review_binding:
    reviewer: agent_lease_cluster
    reviewed_at: "2026-07-18T16:33:00Z"
    evidence_digest: "sha256:c4c2fb37ca9d74582aa5e168d940f2c53bc6fd55e0db2831244cb97978f80743"
  entries: []
review_evidence:
  - reviewer: agent_lease_cluster
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-18T16:33:00Z"
    tests_green_at: "2026-07-18T16:32:00Z"
    verdict: pass
    scope: "total-decision policy、実repo graph、mutation、terminal順序を独立監査。Blocker/High 0。2026-07-19に再検証。"
    green_commands:
      - { kind: integration_test, command: "npx --no-install vitest run tests/source-boundary-policy.test.ts tests/source-boundary-integration.test.ts --testTimeout 300000", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-19T01:28:00+09:00", evidence_path: docs/governance/merged-plan-closure-audit-2026-07-19.md, output_digest: "sha256:cadaacbff7c7843c07095c03e15d9f44b7822c00b147e1ccd203d1f24e1ce3dc" }
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
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: IT-SBOUND-005, test_path: tests/source-boundary-integration.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: IT-SBOUND-006, test_path: tests/source-boundary-integration.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/source-boundary-contracts.md, oracle_id: U-SBOUND-013, test_path: tests/source-boundary-design.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-452-source-boundary-policy-ratchet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/source-edge-extractor.ts, artifact_type: source_module }
  - { artifact_path: src/lint/source-boundary-policy.ts, artifact_type: source_module }
  - { artifact_path: tests/source-boundary-policy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/source-boundary-integration.test.ts, artifact_type: test_code }
  - { artifact_path: tests/source-boundary-design.test.ts, artifact_type: test_code }
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
terminal化は`PLAN-L7-450`と`PLAN-L7-451`がterminalで、temporary source directionが0になった後だけ許可する。
