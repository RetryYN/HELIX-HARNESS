---
plan_id: PLAN-L7-124-route-approval-gate
title: "PLAN-L7-124: ルート承認 gate"
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
    slot_label: "TL - ルート承認 gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-124-route-approval-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-124-route-approval-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
  requires:
    - docs/plans/PLAN-L7-123-route-eval-recommended-command.md
    - docs/plans/PLAN-REVERSE-124-route-approval-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:10:00+09:00"
    tests_green_at: "2026-06-23T16:10:00+09:00"
    verdict: approve
    scope: "route eval は policy / approval がない human-approval-required command を block し、runtime audit evidence を追記する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:10:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-124: ルート承認 gate

## 目的

`requires_human_approval=true` の route output は、policy と一致する approval が利用可能になるまで fail closed にする。

## 範囲

- recovery、incident、retrofit `config_drift` route を human approval 必須として mark する。
- route command の評価時に `.helix/config/approval-policy.yaml` を解決する。
- policy 不足または approval 不足では exit 1 にする。
- block された approval decision を `.helix/audit/route-approval.jsonl` に追記する。

## 受入条件

- `forced_stop` / recovery routing は `requires_human_approval=true` を返す。
- approval policy がない場合は、実行可能な green route ではなく exit 1 を生成する。
- 必須 approver がすべて揃った policy は exit 0 を返す。
- block された CLI run は JSONL audit record を追記する。
