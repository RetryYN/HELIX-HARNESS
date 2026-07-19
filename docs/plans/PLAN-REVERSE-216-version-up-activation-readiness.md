---
plan_id: PLAN-REVERSE-216-version-up-activation-readiness
title: "PLAN-REVERSE-216: version-up activation readiness backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "HR-FR-P1-02 already requires version-up activation packets, dry-run, rollback, and no apply permission; this backfill adds packet-level readiness classification only."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P1 already defines version-up as dry-run/rollback-only before activation."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P1 detailed contract already routes version-up through dry-run planner and activation packet; no new L5 block is required."
  - layer: process-mode
    decision: updated
    evidence_path: docs/process/modes/version-up.md
    reason: "Version-up activation packet semantics now include activationReadinessChecks and pending_evidence blocked reasons for external rehearsal/provenance."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P1 now records activation readiness classification as part of the version-up packet contract."
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P1-02 now treats pending external rehearsal/provenance evidence as an activation blocker."
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P1-02 now expects activationReadinessChecks and blocked reasons."
agent_slots:
  - role: tl
    slot_label: "TL - version-up activation readiness backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-216-version-up-activation-readiness.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-216-version-up-activation-readiness.md
  requires:
    - docs/plans/PLAN-L7-216-version-up-activation-readiness.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:23:12+09:00"
    tests_green_at: "2026-07-01T07:23:12+09:00"
    verdict: pass
    scope: "Backfilled PLAN-L7-216 into the version-up process and HELIX P1 test/design contracts. The backfill preserves human approval, action-binding approval, and parked version-up blockers while making pending activation rehearsal evidence visible."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
---

# PLAN-REVERSE-216: version-up activation readiness backfill の backfill

## 目的

version-up activation readiness evidence の変更を backfill し、孤立した packet field 追加にしない。
意味上の source は引き続き HBR-P1 / HR-FR-P1-02 とする。future-version work は保持するが、
dry-run、rollback、approval、audit、source freshness evidence が揃わない限り activation は進めない。

## Backfill 結果

- `docs/process/modes/version-up.md` は `activationReadinessChecks[]` を定義する。
- L6 HC-P1 は readiness classification contract を記録する。
- HAT-P1-02 / HU-PILLAR-P1-02 は、pending external rehearsal/provenance evidence を
  activation blocker として残すことを要求する。
- `PLAN-L7-146` は parked / blocked のままとし、external activation は実行しない。

## 受入条件

- `PLAN-L7-216` と本 Reverse PLAN は、add-impl backfill closure のため相互に要求関係を持つ。
- Tests は `tests/version-up-readiness.test.ts` を cite する。
- この backfill は L14 completion、version-up activation、cutover approval を claim しない。
