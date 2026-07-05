---
plan_id: PLAN-REVERSE-20-runtime-adapter-session-lifecycle
title: "PLAN-REVERSE-20 (reverse): runtime adapter session lifecycle back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
review_evidence:
  - reviewer: claude-pmo-sonnet
    review_kind: cross_agent
    reviewed_at: "2026-06-09T10:57:49+09:00"
    tests_green_at: "2026-06-09T10:55:36+09:00"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-pmo-sonnet
    scope: "PLAN-L6-20/L7-21/REVERSE-20 runtime adapter lifecycle; Critical/High/Important 0 after follow-up review."
forward_routing: L4
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "runtime adapter lifecycle は既存 §6.8 / §6.9 の運用観測・CI dogfood 詳細として requirements へ戻した。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "provider invocation / task-file / plan metadata separation を L4 function design の runtime building block へ戻した。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "adapter lifecycle wrapper は CLI/runtime 境界の機能設計補正であり、L5 物理データ・内部処理 schema は変更しない。"
  - layer: L7-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-SLOG / U-ADAPTER oracle に provider surface を接続した。"
agent_slots:
  - role: tl
    slot_label: "TL - adapter surface back-fill review"
generates:
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
  requires:
    - docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
---

# PLAN-REVERSE-20 (reverse): runtime adapter session lifecycle の back-fill

## §0 位置づけ

`PLAN-L7-21` の implementation fact を上位設計へ戻す reverse/fullback。provider delegation surface は L4 function design の runtime building block に属するため、`forward_routing=L4` とする。requirements 側は既存 §6.8 / §6.9 の運用観測・CI dogfood の詳細化に留め、新規 FR は起こさない。

## §1 R0-R4

| phase | work | result |
|---|---|---|
| R0 evidence | `src/cli.ts`, `src/runtime/adapter.ts`, `src/runtime/session-log.ts`, `.claude/settings.json`, `tests/runtime-hook-entrypoints.test.ts`, `tests/runtime-adapter.test.ts` | shared CLI hook と adapter wrapper は実装済み。 |
| R1 observed contract | 初期 observed contract: Codex provider args = `exec <task>`、Claude provider args = `--print -p <task>`、`--plan` は harness metadata のみ。PLAN-L7-77 / PLAN-L7-78 後の現行 contract: Codex=`exec -`、Claude=`--print --input-format text`、prompt body は `AdapterPlan.stdin` に置く。 | provider boundary は明示済み。 |
| R2 as-is | L4 function doc は `--task-file`、print-mode Claude、plan metadata separation を十分に記述していなかった。 | design drift を特定済み。 |
| R3 intent | これは adapter surface correction であり、新しい top-level requirement ではない。既存 FR-L1-42 / §6.8 / §6.9 が変更を吸収する。 | 新規 FR は不要。 |
| R4 routing | L4 function doc と L7 unit test design へ back-fill する。requirements note は既存の progress / CI governance の範囲に留める。 | reuse-as-is。 |

## §2 工程表

### Step 1: [並列] R0 evidence collection

implementation と tests を evidence として列挙する。

### Step 2: [直列] L4 function design back-fill

直列理由: downstream_dependency。provider surface を文書化する前に R0 observed contract を確定する必要がある。

### Step 3: [直列] test design back-fill

直列理由: downstream_dependency。U-SLOG / U-ADAPTER oracle は、文書化済みの provider surface を反映する必要がある。

### Step 4: [直列] review

直列理由: downstream_dependency。tests と doctor が green になってから back-fill を review する。

## §6 用語更新

- adapter lifecycle wrapper: provider invocation を session-log lifecycle events で包む仕組み。
- plan metadata separation: harness plan id を provider CLIs へ転送しない分離。

## §8 DoD

- [x] L4 function design は provider args、`--task-file`、plan metadata separation を記述している。
- [x] L7 unit test design は U-SLOG-007 と U-ADAPTER-001 oracle を含む。
- [x] L0 §10 glossary は shared hook entrypoint / adapter lifecycle wrapper / plan metadata separation を含む。
- [x] Reverse は `PLAN-L7-21` を required とし、add-impl を orphaned にしない。
- [x] typecheck / full vitest / doctor / review は green。
