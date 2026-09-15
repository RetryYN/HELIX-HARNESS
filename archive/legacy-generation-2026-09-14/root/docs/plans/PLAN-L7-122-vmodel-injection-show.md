---
plan_id: PLAN-L7-122-vmodel-injection-show
title: "PLAN-L7-122: vmodel injection show コマンド"
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
    slot_label: "TL - vmodel injection show 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-122-vmodel-injection-show.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-122-vmodel-injection-show.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/vmodel/injection.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/vmodel-injection.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
  requires:
    - docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
    - docs/plans/PLAN-REVERSE-122-vmodel-injection-show.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T14:20:00+09:00"
    tests_green_at: "2026-06-23T14:20:00+09:00"
    verdict: approve
    scope: "V-model drive x layer injection の public CLI surface と docs backfill。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\vmodel-injection.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T14:20:00+09:00"
        evidence_path: tests/vmodel-injection.test.ts
        output_digest: "sha256:2f96c00b1a8110ee1717e291a594c68faa1eb0a9d6fe711ee5b157b3b88ff920"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T14:20:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T14:20:00+09:00"
        evidence_path: src/vmodel/injection.ts
        output_digest: "sha256:09dfbf69280399fc50b720af5b68e4ee8b22e3d28d484997df818edcfceb9a10"
---

# PLAN-L7-122: vmodel injection show コマンド

## 目的

drive x layer injection requirement を `helix vmodel show <drive> <layer> --injection`
で実行可能にする。

## スコープ

- 5 つの required keys に対応する V-model injection resolver を追加する。
- `vmodel show` 配下に public CLI surface を追加する。
- requirements と L4 function design を更新し、この surface に残っている stale な
  `stub` status を取り除く。

## 受入条件

- CLI は `owner_role`、`mandatory_agents`、`recommended_skills`、
  `recommended_commands`、`orchestration_mode` を返す。
- `orchestration_mode` は `VALID_ORCHESTRATION_MODES` のいずれかである。
- 不正な `drive` または `layer` の値は拒否される。
