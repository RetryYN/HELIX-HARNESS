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
        output_digest: "sha256:7ed7860b34c01fc2b864f5396880a87d7d71d63367424b190efe87bd5041af86"
---

# PLAN-L7-213: 型付き agent-tool contract registry

## 目的

agent-to-tool call を設計上は型付き contract として扱う一方で、実装では一部の runtime
surface だけを guard していた HC-P2 / HR-FR-P2-01 の gap を閉じる。実装では登録済み tool
surface を machine-readable にし、明示的な defer 理由がない unknown surface を deny し、
request と response の両方の evidence を検証できるようにする。

## スコープ

- `src/orchestration/tool-contract.ts` を tool request/response contract 用の pure typed registry
  と validator として追加する。
- Claude `Agent`、Codex `spawn_agent`、deny される Codex bulk spawn、Codex edit surface、
  shell command surface を contract id 付きで covered surface にする。
- registry integrity を確認する doctor hard gate を追加する。
- 登録済み許可、必須フィールド不足、未登録 surface の deny/defer、response field validation、
  forbidden model override、登録済み deny surface、doctor-ready registry audit の unit test を追加する。
- L1/L3/L4/L6 と対応する test-design の記述を更新し、residual P2 gap が typed contract registry
  全体の欠落であるとは主張しない状態にする。

## 対象外

- この PLAN では loop effort-budget enforcement を実装しない。
- この PLAN では hosted/API developer tools を機械的な hook coverage 対象にしない。
- この PLAN では `旧 state path -> .helix` cutover を有効化しない。

## 設計メモ

`validateToolContractSurface` は意図的に pure にしている。tool call 前の `stage="request"`、
call 後の `stage="response"`、または両方を扱う `stage="roundtrip"` で利用できる。
registered denied surface にも contract id を持たせ、audit が「known and forbidden」と
「unknown and untracked」を区別できるようにする。

## DoD

- [x] Request contract validation が存在する。
- [x] Response contract validation が存在する。
- [x] 明示的な deferred reason がない unknown surface は fail-close する。
- [x] Registered denied surface は fail-close する。
- [x] Doctor exposes `tool-contract-registry`.
- [x] L1/L3/L6 design と対応する test-design は、P2 全体の completion を主張しない形で更新済み。
