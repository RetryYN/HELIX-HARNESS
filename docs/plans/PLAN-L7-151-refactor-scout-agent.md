---
plan_id: PLAN-L7-151-refactor-scout-agent
title: "PLAN-L7-151: refactor scout agent と policy externalization detector"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "既存の Refactor/DB feedback workflow 内に advisory refactor scout surface と detector heuristic を追加する。public CLI/API behavior、persisted schema、requirements semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - refactor scout detector"
  - role: tl
    slot_label: "TL - policy externalization triage"
generates:
  - artifact_path: docs/plans/PLAN-L7-151-refactor-scout-agent.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/refactor-scout.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router-policy.ts
    artifact_type: source_module
  - artifact_path: docs/process/modes/refactor.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
  - artifact_path: tests/tier-router.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
  requires:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T17:02:30+09:00"
    tests_green_at: "2026-06-25T17:02:30+09:00"
    verdict: approve
    scope: "Refactor Scout advisory agent、externalize-policy detector heuristic、tier-router policy extraction。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\tier-router.test.ts tests\\model-id-ssot.test.ts tests\\agent-guard.test.ts tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T16:48:56+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: unit_test
        command: "bun run vitest run tests\\tier-router.test.ts tests\\model-id-ssot.test.ts tests\\agent-guard.test.ts tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T16:48:56+09:00"
        evidence_path: tests/tier-router.test.ts
        output_digest: "sha256:8c4f57122634806872c53d35f865fc5bf0219653ab04348ba84aee014aa27ed4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T16:47:13+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
      - kind: unit_test
        command: "bun run vitest run tests\\relation-graph-loader.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T17:00:41+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:61c16d3b9e3305cc2e79000f5bde9c6169b0bb1bdaaab6b25541c1ce293804ba"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T16:49:22+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:0b826984a99a3760f8e94fe3fade2d525978387788548757dff4969b61951d5b"
      - kind: smoke
        command: "bun run src\\cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T16:50:09+09:00"
        evidence_path: docs/process/modes/refactor.md
        output_digest: "sha256:915ec6686156b8ed12e57a18b666105a488bc3ae85c31e1d89db2c1336ac94b4"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T16:51:00+09:00"
        evidence_path: docs/process/modes/refactor.md
        output_digest: "sha256:915ec6686156b8ed12e57a18b666105a488bc3ae85c31e1d89db2c1336ac94b4"
---

# PLAN-L7-151: refactor scout agent と policy externalization detector

## 目的

Refactor Scout advisory agent を追加し、code に埋め込まれた stage-based subagent/skill injection rule などの
policy externalization candidate を detector が表出できるようにする。

## スコープ

- allowlist 済みの `refactor-scout` Claude subagent prompt を追加する。
- Scout は advisory のみに保つ。detect、classify、PLAN input の提案、verification fence の提案に限定し、
  production code を自律的に rewrite してはならない。
- 既存の DB refactor candidate pipeline に `externalize-policy` candidate detection を追加する。
- stage/subagent/skill/model/route/approval rule が catalog/config/rule module ではなく code branch として存在する場合、
  externalization candidate であることを文書化する。
- allowlist 済み agent prompt を relation graph に materialize し、prompt change が impact analysis を迂回しないようにする。
- tier router の role/tier/model/review policy table を専用 policy module へ externalize しつつ、
  既存 router の public export は stable に保つ。

## 受入条件

- `refactor-scout` は、matching model family の場合に限り `agent-guard` に accepted される。
- stage/subagent injection policy fixture に対して `externalize-policy` candidate が emitted される。
- `.claude/agents/refactor-scout.md` は relation graph node を持ち、impact analysis はそれに対して
  `missing-projection` を emitted しない。
- true-positive policy candidate は、tier router policy data/function を orchestration code から移し、
  new module を直接 cover することで resolved される。
- 既存の refactor candidate projection behavior は intact のまま残る。
- Targeted tests、typecheck、lint、DB rebuild、doctor が pass する。
