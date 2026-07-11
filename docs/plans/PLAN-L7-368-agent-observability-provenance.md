---
plan_id: PLAN-L7-368-agent-observability-provenance
title: "PLAN-L7-368: agent observability and provenance"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-07
updated: 2026-07-09
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:awesome-agent-catalog-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "既存 telemetry / run-debug 証跡の観測面拡張。外部 telemetry service は導入しない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - transcript / cost / diff attribution read model"
  - role: qa
    slot_label: "QA - no secret / PII transcript leakage"
generates:
  - artifact_path: docs/plans/PLAN-L7-368-agent-observability-provenance.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-observability-provenance.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-observability-provenance.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-316-runtime-telemetry-provenance
    - PLAN-L7-202-run-debug-runtime-verification
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:03:38+09:00"
    tests_green_at: "2026-07-09T17:02:40+09:00"
    verdict: approve
    scope: "PLAN-L7-368 agent observability provenance。telemetry sessions の read-only surface を追加し、transcript metadata、command digest、cost summary、commit/session diff attribution hint を raw transcript 保存なしで機械表示した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/agent-observability-provenance.test.ts tests/skill-memory-hygiene.test.ts tests/security-credential-egress-guard.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:02:40+09:00"
        evidence_path: tests/agent-observability-provenance.test.ts
        output_digest: "sha256:a403e8543d5b720064dda39d8325bd32145f86d2e15cf7deb4bcb9b58208722e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:01:05+09:00"
        evidence_path: src/runtime/agent-observability-provenance.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bunx biome check src/runtime/agent-observability-provenance.ts src/runtime/skill-memory-hygiene.ts src/runtime/security-credential-egress-guard.ts tests/agent-observability-provenance.test.ts tests/skill-memory-hygiene.test.ts tests/security-credential-egress-guard.test.ts tests/cli-surface.test.ts src/cli.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:01:05+09:00"
        evidence_path: src/runtime/agent-observability-provenance.ts
        output_digest: "sha256:04182c5ce545b86948af2269473f3356750ad5df0209bee1807eb31143596bd4"
---

# PLAN-L7-368: agent observability と provenance

## 目的

agenttrace / AgentSight / AgentDiff / transcript browser 系の知見を HELIX の telemetry と run-debug に接続し、
cross-runtime session を後から検索・比較・監査できる read model を作る。

## スコープ

- session transcript index、command digest、cost/latency、failure/anomaly、diff attribution の schema を検討する。
- raw transcript は secret/PII sanitization と retention policy を必須にする。
- `helix telemetry sessions --json` 相当の read-only surface を追加する。
- code line attribution は git refs / commit への projection として扱い、真実 claim ではなく provenance hint にする。

## 対象外

- eBPF collector の導入。
- third-party telemetry SaaS は対象外。
- secret を含む raw transcript 保存。

## 受入条件

- transcript index は secret / credential marker を保存しない。
- cost / latency は model_run と command evidence に紐づく。
- diff attribution は commit hash と agent session id を持つ。

## 検証予定

- `bun test tests/token-tracker.test.ts tests/run-debug.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-368-agent-observability-provenance.md`
