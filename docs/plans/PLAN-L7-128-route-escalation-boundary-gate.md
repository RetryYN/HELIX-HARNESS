---
plan_id: PLAN-L7-128-route-escalation-boundary-gate
title: "PLAN-L7-128: route escalation boundary gate"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - route escalation boundary gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-128-route-escalation-boundary-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-128-route-escalation-boundary-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-124-route-approval-gate.md
  requires:
    - docs/plans/PLAN-L7-124-route-approval-gate.md
    - docs/plans/PLAN-REVERSE-128-route-escalation-boundary-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:20:00+09:00"
    tests_green_at: "2026-06-23T15:20:00+09:00"
    verdict: approve
    scope: "Route eval detects escalation boundaries and requires human approval regardless of execution mode."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T15:20:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:20:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:20:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-128: route escalation boundary gate の適用

## 目的

escalation に該当する route signal は、選択された execution mode に依存せず、
human approval が解決されるまで fail closed にする。

## スコープ

- `helix route eval` signal から escalation boundary term を検出する。
- route evaluation result に `escalation_boundaries[]` を出力する。
- escalation を検出した場合、recommended command safety contract を
  `requires_human_approval=true` へ引き上げる。
- 具体的な route mode、または `mode: "*", condition: "escalation"` の
  mode wildcard による approval を許可する。
- requirements と L4 function design へ反映する。

## 受入条件

- payment に言及する通常の add-feature route は、approval がない場合に exit 1 となる。
- 同じ route は escalation approval rule と approval が存在する場合に exit 0 となる。
- route result は検出した escalation boundary term を含む。
- requirements と L4 design の両方に、mode に依存しない escalation gate を記録する。
