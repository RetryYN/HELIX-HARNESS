---
plan_id: PLAN-L7-276-rename-evidence-pack-and-vscode-cutover-source
title: "PLAN-L7-276: rename evidence pack と VS Code cutover source ledger 補強"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-M-02 の不可逆 rename 承認前 evidence packet と cutover source ledger の L7 実装補強。D-API/D-DB や実 cutover は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: tests/identifier-rename.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - rename blocker review"
  - role: qa
    slot_label: "QA - external source ledger review"
generates:
  - artifact_path: docs/plans/PLAN-L7-276-rename-evidence-pack-and-vscode-cutover-source.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-source-ledger.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - tests/identifier-rename.test.ts
    - tests/cutover-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T17:20:00+09:00"
    tests_green_at: "2026-07-03T17:20:00+09:00"
    verdict: approve
    scope: "PLAN-M-02 の承認前 evidence を `helix rename evidence-pack` で安全に生成する。evidence-pack は static/full regression evidence を捏造せず、実コマンド成功出力を `.helix/evidence/rename/` に別途記録する。VS Code Tasks / Workspace Trust の自動実行境界を cutover source ledger と hard gate expectations に追加する。不可逆 `.helix` -> `.helix` cutover は実行しない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:42:00+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:4a53a98607d8a48c486b198983b109c82cb905623c5f35e7bbcc9f33fe956a55"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:42:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/oracle-test-trace.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:39:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:09a9cb6cc8404f83c73b86e7085298fa31039a5428bd4212de71dc043853e07c"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:40:00+09:00"
        evidence_path: docs/plans/PLAN-L7-276-rename-evidence-pack-and-vscode-cutover-source.md
        output_digest: "sha256:33c54bd512501db9c13a5c680994d915d2f0d1c9808eed35147629f7780e73d7"
      - kind: smoke
        command: "bun run src/cli.ts rename evidence-pack --dry-run --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:39:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:7ed4ee6675c9a6623bdb834334d2a90193fba9b52151f79362cfce11517a63f5"
      - kind: smoke
        command: "bun run src/cli.ts rename evidence-pack --write --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:42:00+09:00"
        evidence_path: .helix/evidence/rename/blast-radius-baseline.json
        output_digest: "sha256:be27f02c1d173e41f1e3fce951effb16f5a9b4ec9e82f85e525a970dd8414944"
      - kind: lint
        command: "bun run lint && bun run typecheck && bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:51:00+09:00"
        evidence_path: .helix/evidence/rename/static-state-gates.txt
        output_digest: "sha256:23e02d07772e8b40baa49a14fd51601a19b8de60aefd21bc471926b99c3af106"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:55:00+09:00"
        evidence_path: .helix/evidence/rename/full-regression.txt
        output_digest: "sha256:9a482028945ca4e9c10f047ad7dc59fa5106cba5f444e24cd8370453d70b1828"
---

# PLAN-L7-276: rename evidence pack と VS Code cutover source ledger 補強

## 目的

PLAN-M-02 の L14 rename cutover は、人間承認・action-binding approval・clean HEAD・実コマンド証跡が揃うまで実行してはいけない。一方で、承認レビューに必要な安全な local evidence は毎回手作業で組み立てると漏れやすい。

この PLAN では、非破壊の evidence pack command を追加し、生成可能な証跡と実コマンドでしか埋めない証跡を分離する。あわせて、consumer project の `.vscode/tasks.json` / setup surface に関わる VS Code Tasks / Workspace Trust の自動実行境界を Cutover source ledger に追加する。

## 要件

- `helix rename evidence-pack --dry-run --json` は、書き込みなしで生成予定 artifact、digest、pending artifact、残 blocker を返す。
- `helix rename evidence-pack --write --json` は、`.helix/evidence/rename/` に安全な local evidence だけを書き込む。
- `static-state-gates.txt` と `full-regression.txt` は、実コマンドの成功出力が必要なため evidence-pack では代替生成しない。
- evidence pack は `planOnly=true`、`mustNotApply=true`、`appliesCutover=false`、`approvalStillRequired=true` を固定する。
- Cutover source ledger は VS Code Tasks / Workspace Trust の automatic task execution boundary を公式 source row として持つ。

## 受入条件

- `identifier-rename` tests が dry-run/write/CLI 入力検証を確認する。
- `cutover-readiness` tests が VS Code source ledger row の URL/field impact drift を検出する。
- `rename plan` は引き続き承認待ち blocker を出し、実 cutover を許可しない。
