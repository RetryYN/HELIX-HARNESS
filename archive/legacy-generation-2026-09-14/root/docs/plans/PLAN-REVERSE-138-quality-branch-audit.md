---
plan_id: PLAN-REVERSE-138-quality-branch-audit
title: "PLAN-REVERSE-138: read-only quality and branch audit の backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
drive: be
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "この slice は maintenance visibility のみを公開し、新しい destructive branch operation や product requirement は導入しない。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "新しい read-only audit module を src module inventory に登録する。"
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/harness/L5-detailed-design/if-detail.md
    reason: "CLI interface catalog に audit quality と branch audit surfaces を列挙する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "function spec に bucket semantics と non-destructive branch classification を記録する。"
  - layer: implementation
    decision: updated
    evidence_path: src/audit/quality.ts
    reason: "implementation は read-only quality / branch analyzers と CLI routing を追加する。"
agent_slots:
  - role: tl
    slot_label: "TL - quality and branch audit backfill 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-138-quality-branch-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-138-quality-branch-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/audit/quality.ts
    artifact_type: source_module
  - artifact_path: src/audit/branches.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-138-quality-branch-audit.md
  requires:
    - docs/plans/PLAN-L7-138-quality-branch-audit.md
---

# PLAN-REVERSE-138: read-only quality and branch audit の backfill

## 目的

feedback taxonomy cleanup 後に要求された read-only maintenance audit surfaces の design evidence を backfill する。

## スコープ

- `src/audit/` を architecture module inventory に登録する。
- `audit quality` と `branch audit` の CLI contracts を記録する。
- branch deletion、remote pruning、force operations、history rewrites はこの PLAN の外に置く。

## 受入条件

- `PLAN-L7-138` が paired reverse backfill を持つ。
- Architecture、L5 IF、L6 function design が新しい surfaces を説明している。
- DB rebuild 後も Doctor が green のままである。
