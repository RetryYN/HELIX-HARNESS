---
plan_id: PLAN-L7-213-tool-contract-registry
title: "PLAN-L7-213 (add-impl): typed agent-tool contract registry"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - HC-P2 typed agent-tool contract registry"
  - role: qa
    slot_label: "QA - request/response contract fail-close regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-213-tool-contract-registry.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/tool-contract.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/tool-contract.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
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
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-L3-06-helix-pillar-descent.md
    - docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
    - docs/plans/PLAN-REVERSE-213-tool-contract-registry.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T06:38:00+09:00"
    tests_green_at: "2026-07-01T06:38:00+09:00"
    verdict: approve
    scope: "HC-P2 typed agent-tool request/response contract registry: known Claude/Codex/runtime tool surfaces now have contract ids, request required fields, response required fields, forbidden fields, and deny/defer disposition. Unknown surfaces fail-close unless explicitly deferred, Codex bulk spawn is registered as denied, and doctor now audits the registry so the contract cannot drift into prose-only coverage. This closes the core typed contract registry gap; loop effort-budget is closed by PLAN-L7-214 and hosted/API preflight by PLAN-L7-215."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/tool-contract.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T06:38:00+09:00"
        evidence_path: tests/tool-contract.test.ts
        output_digest: "sha256:ce84a2c0b51b9eaeb94891cceed37251ac7145101ad4792440b9a7f3ba14ee7a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:38:00+09:00"
        evidence_path: src/orchestration/tool-contract.ts
        output_digest: "sha256:0396a5d233794224a154a6bc5dfe5dd0561992e46e67d80201ef9a63070f8e2d"
      - kind: unit_test
        command: "bun run vitest run tests/tool-contract.test.ts tests/doctor.test.ts --test-timeout=20000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T06:38:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:dedd5abd3116c1da91295b21bf497e62023cec4c49ecad609353562b21ce9c95"
---

# PLAN-L7-213: typed agent-tool contract registry

## Objective

Close the HC-P2 / HR-FR-P2-01 gap where agent-to-tool calls could be discussed in
design as typed contracts while the implementation only guarded selected runtime
surfaces. The implementation must make registered tool surfaces machine-readable,
deny unknown surfaces unless explicitly deferred, and verify both request and
response evidence.

## Scope

- Add `src/orchestration/tool-contract.ts` as the pure typed registry and
  validator for tool request/response contracts.
- Cover Claude `Agent`, Codex `spawn_agent`, denied Codex bulk spawn, Codex edit
  surfaces, and shell command surfaces with contract ids.
- Add a doctor hard gate for registry integrity.
- Add unit tests for registered allow, missing required field, unregistered
  deny/defer, response field validation, forbidden model override, registered
  deny surface, and doctor-ready registry audit.
- Update L1/L3/L4/L6 and paired test-design text so the residual P2 gap no
  longer claims typed contract registry is wholly absent.

## Non-Scope

- This PLAN does not implement loop effort-budget enforcement.
- This PLAN does not make hosted/API developer tools mechanically hook-covered.
- This PLAN does not activate `.ut-tdd -> .helix` cutover.

## Design Notes

`validateToolContractSurface` is intentionally pure. It can be used before a tool
call with `stage="request"`, after a call with `stage="response"`, or for both
with `stage="roundtrip"`. A registered denied surface still has a contract id so
audits can distinguish "known and forbidden" from "unknown and untracked".

## DoD

- [x] Request contract validation exists.
- [x] Response contract validation exists.
- [x] Unknown surface fails closed unless an explicit deferred reason is present.
- [x] Registered denied surface fails closed.
- [x] Doctor exposes `tool-contract-registry`.
- [x] L1/L3/L6 design and paired test-design are updated without claiming whole
      P2 completion.
