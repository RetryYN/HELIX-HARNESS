---
plan_id: PLAN-REVERSE-213-tool-contract-registry
title: "PLAN-REVERSE-213: typed agent-tool contract registry の backfill"
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
    reason: "HBR-P2 は、実装済みの typed agent-tool request/response registry core を、loop effort-budget（後続 PLAN-L7-214）および hosted/API preflight（後続 PLAN-L7-215）から区別する。"
  - layer: L3-requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "HR-FR-P2-01 の要求は維持しつつ、residual-gap statement は PLAN-L7-213 を core implementation evidence として記録する。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/architecture.md
    reason: "orchestration module map は、`validateToolContractSurface` を P2 pure contract core の一部として公開する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "HC-P2 は L5 粒度で tool call request、registered surface、tool contract registry、tool request/response schema validator を定義済みであり、この backfill は L6/L7 function を具体化するだけである。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P2 は tool contract の request required fields、response required fields、forbidden fields、explicit defer、deny disposition を明記する。"
  - layer: L1-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "HOT-P2 は P2 全体完了を主張せず、typed contract registry evidence を引用する。"
  - layer: L3-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    reason: "HAT-P2-01 は `tests/tool-contract.test.ts` と doctor `tool-contract-registry` を指す。"
  - layer: L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-P2-01 は request/response contract validation と registered deny surfaces を扱う。"
agent_slots:
  - role: tl
    slot_label: "TL - typed agent-tool contract の backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-213-tool-contract-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
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
  parent: docs/plans/PLAN-L7-213-tool-contract-registry.md
  requires:
    - docs/plans/PLAN-L7-213-tool-contract-registry.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T06:44:00+09:00"
    tests_green_at: "2026-07-01T06:44:00+09:00"
    verdict: pass
    scope: "PLAN-L7-213 を HELIX P2 requirements、architecture、function design、paired test design へ backfill した。この backfill は typed request/response contract registry を実装済みとして記録しつつ、loop effort-budget は PLAN-L7-214、hosted/API preflight は PLAN-L7-215 に残す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:44:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:4b05fe6be6b15f71728b2f363f092f27c79bd207dadc65b8ad4b478618403464"
---

# PLAN-REVERSE-213: typed agent-tool contract registry の backfill

## 目的

`PLAN-L7-213` を backfill し、新しい typed agent-tool contract registry を孤立した実装にしない。
semantic source は HELIX P2 のままとする。agent loop engineering は tool request/response contract を検証し、unknown tool surface が追跡外 autonomy になることを防がなければならない。

## Backfill 結果

- HBR-P2 / HOT-P2 は typed request/response registry を実装済み evidence として記録する。Loop effort-budget は PLAN-L7-214、hosted/API preflight は PLAN-L7-215 で扱う。
- L3 acceptance は HR-FR-P2-01 を変更せず、具体的な test と doctor evidence を指す。
- L4 architecture は `validateToolContractSurface` を orchestration pure contract core に含める。
- L6 HC-P2 は request required fields、response required fields、forbidden fields、registered deny surfaces、explicit defer semantics を明記する。

## 受入条件

- `PLAN-L7-213` とこの Reverse PLAN は、add-impl backfill closure のために相互 require する。
- 新しい registry は `U-TOOLCONTRACT-001..006` から test-cited される。
- Doctor は `tool-contract-registry` を公開する。
- この backfill は P2 全体完了を主張しない。Loop effort-budget は PLAN-L7-214 で別途 close し、hosted/API preflight は PLAN-L7-215 で別途 close する。
