---
plan_id: PLAN-L7-460-git-tracked-source-cas-promotion
title: "PLAN-L7-460 (impl): exact2 raw Git-tracked CAS promotion gate"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "RA-EXACT2-001 trusted custody / restore drill remains open"
created: 2026-07-17
updated: 2026-07-17
owner: Codex / TL
backprop_decision: not_required
backprop_decision_reason: "既存source authority requirementを、repo-owned Git object custodyへ具体化する。"
parent_design: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md
pair_artifact: docs/test-design/helix/L8-git-tracked-source-cas-promotion.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md, oracle_id: U-GTCAS-001, test_path: tests/git-tracked-source-cas.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md, oracle_id: U-GTCAS-002, test_path: tests/git-tracked-source-cas.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md, oracle_id: U-GTCAS-003, test_path: tests/git-tracked-source-cas.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md, oracle_id: U-GTCAS-004, test_path: tests/git-tracked-source-cas.test.ts }
generates:
  - { artifact_path: .gitattributes, artifact_type: source_module }
  - { artifact_path: docs/plans/PLAN-L7-460-git-tracked-source-cas-promotion.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/git-tracked-source-cas-promotion.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-git-tracked-source-cas-promotion.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/git-tracked-source-cas-policy-exact2-v1.json, artifact_type: evidence_json }
  - { artifact_path: src/lint/git-tracked-source-cas.ts, artifact_type: source_module }
  - { artifact_path: tests/git-tracked-source-cas.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/governance/infinity-loop-source-atomization-contract.md
  requires: []
  references:
    - docs/governance/infinity-loop-git-authority-observation-2026-07-16.md
    - docs/governance/generated/git-trusted-custody-promotion-contract-exact2-v1.json
    - .helix/memory/harness.jsonl
---

# exact2 raw Git-tracked CAS promotion gate

## 境界

本PLANはbundle captureやpushを行わず、tracked CASの契約とfail-close gateだけを実装する。通常PRは許可済みだが、
release、tag、Git LFS、GitHub artifact、配布repositoryへのpublishを開始しない。

POは2026-07-11のharness memory `harness:upstream-is-po-own-work:op:auto-478f599113d32385687c2391` でexact2を
PO-owned predecessorと確定し、license/帰属配慮を不要とした。このprovenanceは所有権根拠に限り、secret、PII、credential、
履歴中の不要な機密を公開してよい根拠にはしない。

## 完了条件

U-GTCAS-001..004、typecheck、targeted test、independent reviewがgreenであること。bundle未配置の本sliceでは
`trusted/current/coverage_credit`をfalseのまま保持し、promotion完了をclaimしない。
