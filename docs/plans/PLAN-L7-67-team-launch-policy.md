---
plan_id: PLAN-L7-67-team-launch-policy
title: "PLAN-L7-67: deterministic team launch policy"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/agent-slots.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: Godel
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: inherited
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "deterministic team suggest launch policy, CLI surface, tests, README and L6/L7 trace updates; reviewer findings addressed for Windows CLI timeout margin and standard/risk oracle coverage"
agent_slots:
  - role: tl
    slot_label: "TL - deterministic team launch policy"
generates:
  - artifact_path: src/team/launch-policy.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/team-launch-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: README.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/agent-slots.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: PLAN-L7-65
  requires:
    - docs/design/harness/L6-function-design/agent-slots.md
    - docs/governance/helix-harness-requirements_v1.2.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-67: deterministic team launch policy（決定的なチーム起動ポリシー）

## 目的

provider CLI を起動する前に、subagent の起動タイミングを明示的かつ機械検査可能にする。

## スコープ

- `recommendTeamLaunch` を追加し、free-form task から launch/no-launch、trigger、reason、difficulty、任意の `TeamDefinition` を決定的に返す。
- 非破壊の CLI surface として `helix team suggest --task ... --json` を追加する。
- non-`hybrid` mode は cross-provider review を暗黙に置き換えず、`trigger="unavailable"` で fail-closed に保つ。
- 推奨された定義は既存の `teamDefinitionSchema` / `team run` flow を通す。
- launch trigger を README、L6 design、L7 test design に記録する。

## 検証

- [x] `bun run typecheck`
- [x] `bunx vitest run tests\team-launch-policy.test.ts tests\team-run.test.ts tests\cli-surface.test.ts`
- [x] `bun run lint`
- [x] `bun run test:node-fallback`
- [x] `bun src\cli.ts db rebuild --json`
- [x] `bun src\cli.ts doctor`
- [x] `bun run test`

## 完了条件 (DoD)

- [x] trivial/simple task は、risk term が存在しない限り team を起動しない。
- [x] standard+ または risk を含む task は、`hybrid` mode で cross-provider team を推奨する。
- [x] non-`hybrid` mode は、暗黙 fallback なしで unavailable を返す。
- [x] critical recommendation は、implementation、review、QA role を追加し、決定的な high-effort model selection を行う。
- [x] CLI output は JSON として機械可読であり、provider を起動しない。
