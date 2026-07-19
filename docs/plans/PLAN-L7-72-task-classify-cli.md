---
plan_id: PLAN-L7-72-task-classify-cli
title: "PLAN-L7-72 (impl): helix task classify public CLI (FR-L1-39)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: confirmed
created: 2026-06-17
updated: 2026-06-17
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "helix task classify CLI は既存 FR-L1-39/41 contracts (scoreTaskComplexity/classifyDrive) と inferTaskDifficulty の上に実装し、kind inference と escalation-risk flags を追加する。PM は tsc、Biome、6 Vitest cases (kind/drive/risk/size/determinism、'author' non-risk guard 含む)、CLI smoke、doctor で検証した。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:10:04+09:00"
    tests_green_at: "2026-07-09T18:10:04+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: task classify CLI / classifier contract を現行 `tests/task-classify.test.ts` で再検証し、review_evidence.green_commands へ投影可能な実行証跡を追加する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/task-classify.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:10:04+09:00"
        evidence_path: tests/task-classify.test.ts
        output_digest: "sha256:c8d664db907a9ebc7ebffe2bd92973a3574faa8884b3267cc3b68460fbbd6089"
agent_slots:
  - role: tl
    slot_label: "TL - 既存 contracts 上の task classify CLI surface"
generates:
  - artifact_path: docs/plans/PLAN-L7-72-task-classify-cli.md
    artifact_type: markdown_doc
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: tests/task-classify.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-71-slash-commands.md
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/migration/helix-fork-completion-plan.md
  references:
    - src/workflow/contracts.ts
    - src/team/model-policy.ts
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
---

# PLAN-L7-72 (impl): helix task classify public CLI 公開

## 0. 目的

fork plan §6 P0 (task classify) を public CLI surface として公開し、close する。
FR-L1-39 extended は、task に対して構造化された
`kind / drive / size / complexity / difficulty / risk` を出力する
`helix task classify` を要求している。基盤 contract である
`scoreTaskComplexity` (FR-L1-39)、`classifyDrive` (FR-L1-41)、
`inferTaskDifficulty` は既に存在するため、これは新しい algorithm ではなく
composing module + CLI surface である。

## 1. 問題

`src/workflow/contracts.ts` implements `scoreTaskComplexity` / `classifyDrive`
and `src/team/model-policy.ts` implements `inferTaskDifficulty` だが、public
`helix task` command が存在しない。FR-L1-39 extended requirement は、
plan lint / gate / skill suggest へ入力する public I/O として
`helix task classify --text/--plan/--diff` を指定している。fork plan §6 では
これを P0 pending として列挙している。

## 2. Scope

- 既存 contracts、escalation-risk flagging (CLAUDE.md safety boundary)、kind
  inference を合成する `classifyTask(input)` を持つ新規 `src/task/classify.ts`。
- 新規 `helix task classify` CLI command (`--text` / `--text-file` / `--plan` /
  `--files` / `--json`).
- drive/kind/size/risk determinism の Vitest coverage。

Scope 外 (fork plan §8(2) による re-scoped defer): `helix task estimate`
enrichment、および `helix scrum` / `helix reverse` runtime mode commands
(large mode state machines。lint は既に存在する)。fork plan で追跡する。

## 3. 受入条件

- `helix task classify --text "..."` は kind/drive/size/complexity/
  difficulty/risk を表示して exit 0 になり、`--json` は structured object を出力する。
- Escalation-sensitive tasks (auth/payments/PII/migration/schema/production) は
  `risk_flags` list と `escalation-risk` warn finding を surface する。
- Classification は同じ入力に対して deterministic である。
- typecheck / Biome / Vitest / `helix doctor` は green のままで、src file は
  この PLAN の `generates` へ trace される。

## 4. Status

Draft。2026-06-17 に実装済み。
