---
plan_id: PLAN-L7-264-consumer-hook-artifact-schema-gate
title: "PLAN-L7-264: consumer hook artifact 構造 gate"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "consumer setup / doctor の hook artifact 構造検査を強化する実装強化。hook runtime 仕様や PLAN-M-02 cutover 境界は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "explorer - consumer hook artifact schema gap"
  - role: tl
    slot_label: "TL - setup/doctor hook artifact gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-264-consumer-hook-artifact-schema-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/setup/index.ts
    - src/doctor/index.ts
    - tests/setup.test.ts
    - tests/doctor.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:10:00+09:00"
    tests_green_at: "2026-07-03T19:10:00+09:00"
    verdict: approve
    scope: "consumer setup / consumer doctor が配布 hook artifact を文字列検索ではなく JSON/schema 契約で検査するようにした。Claude/Codex hard guard の matcher、type=command、blockOnFailure を fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/doctor.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:10:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:d2016c0512a36f45044ab633e02a252b6b9125b0fd905e3fea69963cdae6ac42"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:10:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
---

# PLAN-L7-264: consumer hook artifact 構造 gate

## 目的

consumer setup / consumer doctor は、配布済み `.claude/settings.json` と `.codex/hooks.json` に
`helix hook work-guard` 等の文字列が含まれることを見ていた。これでは、hook が non-command field に移動した、
matcher が drift した、または hard guard の `blockOnFailure` が外れた状態を green にする危険がある。

この PLAN は、配布 hook artifact を JSON/schema 契約として検査し、文字列だけの偽陽性を止める。

## 変更

- Claude / Codex adapter hook contract validator を `src/setup/index.ts` に追加する。
- `.codex/config.toml` は `[features]` section 内の `hooks = true` だけを許可し、コメントや別 section の `hooks = true` は許可しない。
- setup artifact readiness に `claude-adapter-hooks-are-structured` と `codex-adapter-hooks-are-structured` を追加する。
- consumer doctor の `consumer-claude-adapter` / `consumer-codex-adapter` を同じ validator に接続する。
- setup / doctor tests に、command 文字列は残るが `type=command` または `blockOnFailure=true` が壊れた hook artifact を fail する regression を追加する。

## 境界

- repo-local direct Codex/Claude hook runtime の仕様変更は行わない。
- hosted API tool surface の機械 enforcement を主張しない。
- PLAN-M-02 の `helix` alias / `.helix` state cutover は扱わない。

## 完了条件

- setup readiness が壊れた hook artifact template を green にしない。
- consumer doctor が壊れた投影済み hook artifact を green にしない。
- `.codex/config.toml` の `hooks = true` が `[features]` 以外にある場合は green にしない。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
