---
plan_id: PLAN-REVERSE-224-pair-agent-difficulty-budget
title: "PLAN-REVERSE-224 (reverse): pair-agent difficulty budget"
kind: reverse
layer: cross
workflow_phase: R4
drive: agent
status: confirmed
confirmed_reverse_type: code
forward_routing: L5
promotion_strategy: reuse-with-hardening
created: 2026-07-01
updated: 2026-07-01
owner: Codex
agent_slots:
  - role: tl
    slot_label: "TL - reverse pair-agent difficulty policy"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
---

# PLAN-REVERSE-224: pair-agent difficulty budget の逆流監査

## R0 証跡取得

`src/orchestration/pair-agent.ts` は既に `difficulty?: TaskDifficulty` を受け取っていたが、
`buildPairAgentTddPlan` はそれを無視し、すべての pair-agent run を同じ `maxFixCycles` 値へ default していた。

Review では周辺の release evidence に 2 つの contract hazard も見つかった。CLI `--max-fix-cycles` は
`parseInt` truncation を使っており、green-command digest の doctor gate は妥当な historical digest drift まで hard mismatch と扱っていた。
その結果、original review-time digest を保存する代わりに古い PLAN evidence を書き換える方向を誘発していた。

## R1 観測済み契約

- Pair-agent は smart-test-author -> light-implementation -> smart-review
  sequence を持つ。
- `TaskDifficulty` exists in `src/team/model-policy.ts`.
- CLI `pair-agent plan/run` は `--max-fix-cycles` を公開していたが、`--difficulty` は公開していなかった。
- Review evidence digest は fake evidence を防ぎつつ、後続の source/test 編集後に historical evidence の restamping を要求してはならない。

## R2 As-Is Design

旧 route は task difficulty inference と pair-agent loop sizing を分離していた。
そのため型は user-facing requirement と揃って見える一方で、runtime behavior は固定のままだった。

## R3 意図仮説

Pair-agent は difficulty を使って保守的な default fix-loop budget を設定しつつ、明示的な operator override と auditability を維持するべきである。

Review evidence は immutable であるべきである。malformed placeholder digest と missing evidence file は hard failure とし、
現在の file と一致しなくなった妥当な 64-hex digest は historical drift と扱う。これは古い evidence を書き換えてよい許可ではない。

## R4 gap と routing

L6/L7 add-impl へ route する。

- L6 design: difficulty policy と max-cycle exhaustion invariant を記録する。
- L7 code: difficulty-derived default、CLI difficulty validation、exhaustion finding を適用し、max-cycle CLI input を厳密に validate する。
- L7 tests: inferred/explicit difficulty、CLI validation、exhausted loop finding、audit-safe digest drift behavior を cover する。
