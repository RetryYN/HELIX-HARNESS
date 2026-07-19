---
plan_id: PLAN-L7-123-route-eval-recommended-command
title: "PLAN-L7-123: route eval RecommendedCommandV1 surface"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-07-01
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - route eval contract surface"
generates:
  - artifact_path: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-72-task-classify-cli.md
  requires:
    - docs/plans/PLAN-L7-72-task-classify-cli.md
    - docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:28:59+09:00"
    tests_green_at: "2026-07-01T09:28:59+09:00"
    verdict: approve
    scope: "Pair-agent TDD routing signals stay in add-feature mode while recommending the pair-agent planning surface; concept, requirements, L4, L7 tests, and CLI contract are aligned."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: src/workflow/routing-contracts.ts
        output_digest: "sha256:bb0621db65c315b9e92443ed9855b67c8da6fdeab87ed13eb6c403cd4e7b652e"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:30:00+09:00"
    tests_green_at: "2026-06-23T15:30:00+09:00"
    verdict: approve
    scope: "Signal route evaluation CLI returns a schema-validated RecommendedCommandV1 and backfills requirements/L4 design."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-L7-123: route eval の RecommendedCommandV1 surface

## 目的

signal routing requirement を `helix route eval --signal <s> --format json`
で実行可能にする。

## 範囲

- 既知の routing signal に対して deterministic な route evaluation contract を追加する。
- human-facing な `suggest_command` を、machine-facing な `recommended_command` とは分けて返す。
- machine-facing な command を `RecommendedCommandV1` で検証する。
- この実装が design baseline から切り離されないように、requirements と L4 function design を back-fill する。

## 受入条件

- 既知の signal は `mode`、`suggest_command`、schema-valid な `recommended_command` を返す。
- `recommended_command.command` は `helix` で始まり、legacy runtime command name は既存 schema で拒否される。
- 未知の signal は runnable command を返さず、明示的な not-available routing (`exit_code=2`) を返す。
- `version_deferral` は `mode=version-up` を返し、version-up mode 採用後の
  `PLAN-REVERSE-140` / `docs/process/modes/version-up.md` と一致する。
- `pair_agent_tdd` / `pair-agent-tdd` / `pair-agent TDD route` / pair programming signal は
  `mode=add-feature` と `recommended_command.command="helix pair-agent plan"` を返し、
  pair-agent TDD workflow が要求する pair-route args を含む。

## 2026-06-30 version-up route の backfill

当初の route evaluator は `PLAN-DISCOVERY-09` / `PLAN-REVERSE-140` より前に作られていた。
version-up が mode として採用された後、docs/process と requirements では
`version_deferral -> version-up` と記載されたが、`helix route eval --signal version_deferral` は
引き続き `no-route` を返していた。これは docs-only typo ではなく、executable な drive-model gap だった。

この follow-up では `version_deferral` / `version-up` / `version_up` token を
`src/workflow/routing-contracts.ts` に追加し、route evaluator と mode docs の整合を保つため
`tests/workflow-contracts.test.ts` を修正する。

## 2026-07-01 pair-agent TDD route の backfill

pair-agent TDD workflow は planning surface として存在していたが、route evaluation は
`pair_agent_tdd` や `pair-agent TDD route` のような意味的に同等の user signal からそれを推薦していなかった。
そのため、意図した workflow に通常の routing surface から到達できず、generic task classification へ
誤って fall back する可能性があった。

この follow-up では mode taxonomy を `add-feature` のまま安定させ、変更範囲を recommendation contract に限定する。
pair-agent TDD signal は `helix pair-agent plan` を返し、
`pair_route=smart_test_author_to_light_implementation_to_smart_review` と `requires_plan_id=true` を含む。
`Concept §2.6`、`requirements §7.8`、`L4 routing design`、`L7 unit oracle`、
`workflow contract test`、`CLI surface test` も合わせて back-fill する。
