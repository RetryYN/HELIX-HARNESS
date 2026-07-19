---
plan_id: PLAN-L7-125-route-legacy-command-gate
title: "PLAN-L7-125: route legacy command gate の検査"
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
    slot_label: "TL - route legacy command gate 検査"
generates:
  - artifact_path: docs/plans/PLAN-L7-125-route-legacy-command-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-125-route-legacy-command-gate.md
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
    - docs/plans/PLAN-REVERSE-125-route-legacy-command-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:40:00+09:00"
    tests_green_at: "2026-06-23T16:40:00+09:00"
    verdict: approve
    scope: "route-map の command 出力は、legacy runtime command name が設定された場合に fail closed する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:40:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:40:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:40:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-125: route legacy command gate の検査

## 目的

route-map 設定に legacy runtime command name が含まれる場合、`helix route eval` が実行可能な
command を出力しないようにする。

## 対象範囲

- route-map の command 出力を `RecommendedCommandV1` で検証する。
- command が `helix` で始まらない場合、exit 1 と `legacy-runtime-command` finding を返す。
- deterministic な route-map validation のため、明示的な override surface として
  `--route-map <path>` を追加する。
- requirements と L4 function design を back-fill する。

## 受入条件

- `command: helix reverse` のような route-map entry は exit 1 を返す。
- 結果に `recommended_command` を含めない。
- 既存の built-in routes は引き続き schema-valid な `helix` commands を返す。
