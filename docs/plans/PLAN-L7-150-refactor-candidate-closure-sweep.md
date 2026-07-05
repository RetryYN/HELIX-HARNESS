---
plan_id: PLAN-L7-150-refactor-candidate-closure-sweep
title: "PLAN-L7-150: refactor candidate closure sweep の完了整理"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/projection-writer.test.ts
backprop_decision: not_required
backprop_decision_reason: "振る舞い不変の module extraction と detector precision tuning のため。public CLI/API contract、persisted schema、requirement、workflow semantics は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - detector candidate closure の完了整理"
  - role: tl
    slot_label: "TL - precision と gate verification"
generates:
  - artifact_path: docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/state-db/feedback-projections.ts
    artifact_type: source_module
  - artifact_path: src/task/classify.ts
    artifact_type: source_module
  - artifact_path: src/task/proposal-coverage-data.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph-evidence.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-catalog.ts
    artifact_type: source_module
  - artifact_path: src/lint/verification-profile-safety.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-148-refactor-candidate-module-extraction.md
  requires:
    - docs/plans/PLAN-L7-148-refactor-candidate-module-extraction.md
    - docs/plans/PLAN-L7-149-relation-graph-process-doc-node.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T15:56:00+09:00"
    tests_green_at: "2026-06-25T15:56:00+09:00"
    verdict: approve
    scope: "振る舞い不変の module extraction と large-but-shallow modules 向け confidence calibration により、detector high-confidence 候補を完了させる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T15:55:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:80fe9c6f5a26f2036489a33f14ba56c5b89e276cde8afcb0c9bc7f9ee777c4a3"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T15:53:00+09:00"
        evidence_path: src/state-db/refactor-candidates.ts
        output_digest: "sha256:0e270c1572d46850fe94dd43359a38c04b75ecc7b23a62cf8bf983f74c8f601a"
---

# PLAN-L7-150: refactor candidate closure sweep の完了整理

## 目的

PLAN-L7-148 後に detector が出す high-confidence refactor candidate を、振る舞い不変の extraction、
または prior signal が広すぎた箇所の detector precision calibration によって完了させる。

## 範囲

- static catalogs と evidence/routing/projection concerns を focused modules へ抽出する。
- 既存 public import paths は re-exports によって安定させる。
- `split-module` confidence を調整し、短く cohesive な functions で構成される large modules は medium として triage する。
  一方で extreme modules や large functions を含む modules は引き続き high-confidence feedback にする。
- DB schema、CLI behavior、projection semantics を維持する。

## 受入条件

- static detector output の high-confidence refactor candidates が 0 件になる。
- `harness.db` rebuild が open high-confidence refactor feedback を出さない。
- 移動した modules の targeted tests が pass する。
- `bun run typecheck`、`bun run lint`、`bun run src\cli.ts doctor` が pass する。

## 2026-07-06 現候補 triage / accepted debt

`PLAN-L7-336` により high-confidence refactor candidate は telemetry ではなく actionable surface に出る。
2026-07-06 時点の `doctor --json` は `doctor.ok=true` のまま `high=8` を表示しており、これは hard gate
ではなく「未 triage に戻さず、refactor PLAN または accepted debt に接続する」要求である。

本節は `PLAN-L7-150` 完了後に再検出された現候補を、同 PLAN の follow-up queue として受ける台帳である。
ここで product requirement / public contract / DB schema の新規変更は発生しない。実修正に入る場合は
候補ごと、または `cli` / `projection-writer` / `doctor` / `setup` / `web-catalog` 単位の小さな
refactor slice に分割し、挙動不変の regression fence を先に置く。

| candidate | kind | disposition | 処置方針 |
|---|---|---|---|
| `src/cli.ts` | `split-module` | `accepted_debt` + `attached_plan=PLAN-L7-150` | command routing と adapter contract への波及が大きい。CLI subcommand 群ごとに分割し、既存 CLI tests を fence にする。 |
| `src/state-db/projection-writer.ts` | `split-module` | `accepted_debt` + `attached_plan=PLAN-L7-150` | DB projection rebuild の中心 module。projection family 単位で抽出し、schema/projection oracle を維持する。 |
| `src/doctor/index.ts` | `split-module` | `accepted_debt` + `attached_plan=PLAN-L7-150` | L1-L14 監査 surface の正本。gate group 単位で抽出し、doctor output の互換性を守る。 |
| `src/setup/index.ts` | `split-module` | `accepted_debt` + `attached_plan=PLAN-L7-150` | setup template / adapter marker / consumer template へ波及するため、template regression と一緒に分割する。 |
| `src/web/catalog.ts#literal:sha256:79f0ff6cab5d` | `externalize-literal` | `resolved` + `attached_plan=PLAN-L7-150` | UI catalog の `L2-screen-specific` source literal を型付き定数へ移し、component registry の挙動を変えずに重複を解消した。 |
| `src/config/requirements-binding.ts#policy:sha256:39498a6e822a` | `externalize-policy` | `accepted_debt` + `attached_plan=PLAN-L7-150` | requirements-binding 自体が policy/config SSoT であり、false positive か二段抽出かを refactor slice で判断する。 |
| `src/setup/templates.ts#literal:sha256:4b69611db37f` | `externalize-literal` | `accepted_debt` + `attached_plan=PLAN-L7-150` | managed block/template 文字列の重複。配布 template 互換性を守って定数化する。 |
| `src/setup/templates.ts#literal:sha256:7111fbd12620` | `externalize-literal` | `accepted_debt` + `attached_plan=PLAN-L7-150` | managed block/template 文字列の重複。配布 template 互換性を守って定数化する。 |

この disposition は「放置」ではなく、現時点の completion blocker から外して follow-up refactor queue に固定する
判断である。新規 high-confidence candidate が増えた場合は、本節または子 refactor PLAN へ追加し、未 triage の
まま完了主張しない。
