---
plan_id: PLAN-REVERSE-218-version-up-reapproval-triggers
title: "PLAN-REVERSE-218: version-up reapproval trigger のバックフィル"
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
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P1-02 は、version-up activation packet が HEAD/scope/source/evidence drift の reapproval trigger を持つことを記録する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-P1 がすでに version-up lifecycle semantics を担うため、この slice は L6 packet output を厳格化する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P1 detailed contract がすでに version-up activation packet boundaries を担うため、新しい L5 block は不要。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P1 は buildVersionUpActivationPackets の一部として reapprovalTriggers[] を記録する。"
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P1-02 は HEAD/scope/source/evidence drift を activation blocker または reapproval route として扱う。"
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P1-02 は activation packet behavior に reapprovalTriggers[] が含まれることを期待する。"
agent_slots:
  - role: tl
    slot_label: "TL - version-up reapproval trigger バックフィル"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
  requires:
    - docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:50:58+09:00"
    tests_green_at: "2026-07-01T07:50:58+09:00"
    verdict: pass
    scope: "PLAN-L7-218 を version-up process、HR-FR-P1-02、L6 HC-P1、対応する L3/L6 test design へバックフィルし、parked/future と approval boundaries は維持した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: unit_test
        command: "npm test"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
---

# PLAN-REVERSE-218: version-up reapproval trigger のバックフィル

## 目的

version-up activation の reapproval trigger をバックフィルし、新しい packet field を
JSON だけの追加ではなく workflow rule として扱う。

## バックフィル結果

- `docs/process/modes/version-up.md` は `reapprovalTriggers[]` を定義する。
- HR-FR-P1-02 は HEAD/scope/source/evidence drift が stale な activation evidence を無効化することを記録する。
- L6 HC-P1 は `buildVersionUpActivationPackets` contract を記録する。
- L3/L6 paired test design は version-up tests を通じてこの behavior を引用する。

## 受入条件

- `PLAN-L7-218` とこの Reverse PLAN は、add-impl backfill のため相互に require する。
- 新しい behavior は `HU-PILLAR-P1-02` により test-cited される。
- この backfill は parked serverless work または `旧 state path -> .helix` cutover を activation しない。
