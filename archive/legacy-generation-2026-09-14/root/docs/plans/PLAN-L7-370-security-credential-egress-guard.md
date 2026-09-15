---
plan_id: PLAN-L7-370-security-credential-egress-guard
title: "PLAN-L7-370: security credential and egress guard"
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
backprop_decision_reason: "本 PLAN は security 境界の L7 採用候補を起票する。L6/P8 contract への昇格は後続 add-design/backprop PLAN で扱い、実 credential 変更はしない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: tl
    slot_label: "Security - credential broker / egress / prompt-injection policy"
  - role: tl
    slot_label: "TL - approval boundary / no secret persistence"
generates:
  - artifact_path: docs/plans/PLAN-L7-370-security-credential-egress-guard.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/security-credential-egress-guard.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/security-credential-egress-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-230-destructive-git-command-guard
  references:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T17:03:38+09:00"
    tests_green_at: "2026-07-09T17:02:40+09:00"
    verdict: approve
    scope: "PLAN-L7-370 security credential and egress guard。security egress-check dry-run surface を追加し、raw secret argument、undefined egress policy、action-binding なしの external/auth/infra activation を fail-close で機械検出した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/agent-observability-provenance.test.ts tests/skill-memory-hygiene.test.ts tests/security-credential-egress-guard.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:02:40+09:00"
        evidence_path: tests/security-credential-egress-guard.test.ts
        output_digest: "sha256:a403e8543d5b720064dda39d8325bd32145f86d2e15cf7deb4bcb9b58208722e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T17:01:05+09:00"
        evidence_path: src/runtime/security-credential-egress-guard.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bunx biome check src/runtime/agent-observability-provenance.ts src/runtime/skill-memory-hygiene.ts src/runtime/security-credential-egress-guard.ts tests/agent-observability-provenance.test.ts tests/skill-memory-hygiene.test.ts tests/security-credential-egress-guard.test.ts tests/cli-surface.test.ts src/cli.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T17:01:05+09:00"
        evidence_path: src/runtime/security-credential-egress-guard.ts
        output_digest: "sha256:04182c5ce545b86948af2269473f3356750ad5df0209bee1807eb31143596bd4"
---

# PLAN-L7-370: security credential と egress guard

## 目的

OneCLI / authsome / Armorer Guard / ActPlane / NemoClaw / microVM sandbox 系の知見を HELIX P8 に接続し、
agent 実行時の credential、network egress、prompt/tool injection、filesystem access を統一 policy として扱う。

## スコープ

- credential broker / scoped token / no raw secret exposure の contract を L6/P8 へ backprop する。
- egress policy、allowed host、offline mode、tool-call argument scanner の schema を定義する。
- prompt injection / data exfiltration finding を gate / actionable / telemetry に分類する。
- actual credential store や OS sandbox apply は plan-only / approval-gated とする。

## 対象外

- secret の保存、移行、表示。
- OAuth provider 設定。
- OS-level eBPF / microVM の実適用。

## 受入条件

- credential を docs / logs / examples に出さない。
- external API / auth / infra activation は action-binding approval なしに ready にならない。
- egress policy 未定義の external tool は fail-close する。

## 検証予定

- `bun test tests/doctor.test.ts tests/readiness-guardrail.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-370-security-credential-egress-guard.md`
