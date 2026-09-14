---
plan_id: PLAN-REVERSE-215-hosted-preflight
title: "PLAN-REVERSE-215: hosted/API preflight backfill の逆流反映"
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
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "HBR-P2 は hosted/API preflight core を実装済み evidence として記録しつつ、all-agent rule/memory generalization と Glossary SSoT は別の残作業として保持する。"
  - layer: L3-requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-03 と HR-NFR-AC-02 の要求自体は変えず、residual-gap 記述に PLAN-L7-215 を実装 evidence として記録する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "HB-AC は hosted API/developer tool 境界と preflight-only 挙動を既に定義している。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-AC は adapter rule file、hook map、hosted API/developer-tool surface、preflight audit contract を L5 粒度で既に定義している。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-AC は direct hook coverage、hosted preflight-only classification、required hosted evidence、work-guard block propagation を明示する。"
  - layer: L1-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "HOT-P2/HOT-NAC は whole-program completion を主張せず、hosted/API preflight evidence を cite する。"
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-03 と HAT-NAC-02 は tests/hosted-preflight.test.ts を参照する。"
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-03 と HU-PILLAR-NAC-02 は direct vs hosted classification と hosted preflight evidence を扱う。"
agent_slots:
  - role: tl
    slot_label: "TL - hosted/API preflight backfill 逆流反映"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-215-hosted-preflight.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-215-hosted-preflight.md
  requires:
    - docs/plans/PLAN-L7-215-hosted-preflight.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:20:00+09:00"
    tests_green_at: "2026-07-01T07:20:00+09:00"
    verdict: pass
    scope: "PLAN-L7-215 を HELIX P2/HNFR-AC requirements、function design、paired test design へ逆流反映した。hosted/API preflight を実装済みとして記録しつつ、all-agent rule/memory generalization、Glossary SSoT、whole-program approval blockers は保持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/hosted-preflight.test.ts tests/work-guard.test.ts tests/codex-hook-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: tests/hosted-preflight.test.ts
        output_digest: "sha256:766166f6df5163bb6cc964b8307a37f0139633fefd1b79be5265fb92c1aaf98b"
---

# PLAN-REVERSE-215: hosted/API preflight backfill の逆流反映

## 目的

`PLAN-L7-215` を逆流反映し、hosted/API preflight enforcement が孤立した実装にならないようにする。
意味上の正本は HELIX P2/HNFR-AC のままとする。direct hook surface と hosted/API developer tool を区別し、
hosted edit は preflight evidence なしで通してはならない。

## 逆流反映結果

- HBR-P2 / HOT-P2 は hosted/API preflight を実装済み evidence として記録しつつ、
  whole-program completion は approval/S4/cutover decision により block されたままとする。
- HNFR-AC / HOT-NAC は all-agent rule/memory generalization を residual work として保持する。
- L6 HC-AC は direct hook coverage、hosted preflight-only classification、
  required preflight evidence、work-guard block propagation を明示する。

## 受入条件

- `PLAN-L7-215` とこの Reverse PLAN は、add-impl backfill closure のために相互に require する。
- 新しい preflight enforcement は `HU-PILLAR-P2-03` と `HU-PILLAR-NAC-02` から test-cited される。
- この backfill は hosted/API tool に対する mechanical repo hook coverage を主張しない。
- この backfill は whole-program completion を主張しない。
