---
plan_id: PLAN-L7-121-branch-kind-check
title: "PLAN-L7-121: branch-kind check doctor gate"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - branch-kind check 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-121-branch-kind-check.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-121-branch-kind-check.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/branch-kind.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/branch-kind.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-120-backfill-result-doc-sync.md
  requires:
    - docs/plans/PLAN-L7-120-backfill-result-doc-sync.md
    - docs/plans/PLAN-REVERSE-121-branch-kind-check.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T13:45:00+09:00"
    tests_green_at: "2026-06-23T13:45:00+09:00"
    verdict: approve
    scope: "branch prefix と PLAN kind の gate、github_issue_id warning、doctor wiring を確認する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\branch-kind.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: tests/branch-kind.test.ts
        output_digest: "sha256:d75b67733f22630222c3ddffdc379c691ba299b22da3109b1bb76114f93c630e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: lint
        command: "bunx biome check src\\lint\\branch-kind.ts src\\doctor\\index.ts tests\\branch-kind.test.ts tests\\doctor.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T13:45:00+09:00"
        evidence_path: src/lint/branch-kind.ts
        output_digest: "sha256:27410a6c1ff6cad593bfa919427fb24189dd05dc1b7a63c12a15198ed6e84f08"
---

# PLAN-L7-121: branch-kind check doctor gate の整備

## 目的

requirements の branch-kind rule を実行可能にし、branch prefix、変更対象 PLAN kind、
issue linkage が manual review だけに依存しないようにする。

## スコープ

- pure branch-kind analyzer として `src/lint/branch-kind.ts` を追加する。
- `lint-wiring` が到達可能性を証明できるように、この analyzer を `doctor` へ配線する。
- governed branch prefix で touched PLAN がない場合、または PLAN kind が不一致の場合は hard fail にする。
- Phase 0-B requirements に合わせ、`feature/*` / `hotfix/*` で `github_issue_id` が欠落する場合は warning に留める。

## 受入条件

- touched PLAN がない `feature/*` は fail する。
- non-`impl` PLAN を伴う `feature/*` は fail する。
- `docs/skills/*.md` を除き、`docs/*` / `chore/*` は exempt のままとする。
- `doctor` は `branch-kind-check` を表示し、`lint-wiring` は引き続き pass する。
