---
plan_id: PLAN-L7-370-security-credential-egress-guard
title: "PLAN-L7-370: security credential and egress guard"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
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
  - artifact_path: tests/security-credential-egress-guard.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - PLAN-L7-230-destructive-git-command-guard
  references:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
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
