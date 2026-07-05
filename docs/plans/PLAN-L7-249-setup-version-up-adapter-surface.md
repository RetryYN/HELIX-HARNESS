---
plan_id: PLAN-L7-249-setup-version-up-adapter-surface
title: "PLAN-L7-249: setup version-up adapter surface"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-247/248 で追加した version-up dry-run 初回証跡を、配布 adapter doc / Claude subagent / slash-command 実体と consumer doctor fail-close 判定へ追従する限定実装。L1/L3 の要求意味は変えない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup/version-up adapter surface backfill"
generates:
  - artifact_path: docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/templates/adapter/AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/.claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/.claude/agents/helix-tl.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/.claude/commands/helix-status.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/.claude/commands/helix-test.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
  requires:
    - docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
    - docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
    - src/setup/index.ts
    - src/setup/templates.ts
    - docs/templates/adapter/AGENTS.md
    - docs/templates/adapter/CLAUDE.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T12:04:33+09:00"
    tests_green_at: "2026-07-03T12:04:33+09:00"
    verdict: approve
    scope: "HELIX project setup の version-up dry-run 初回証跡を、配布 adapter doc、Claude subagent、Claude slash-command、consumer doctor artifactReadiness へ伝播し、setup ready が tag 更新 apply や L14 完了 claim に化けないことを固定した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:b1493e7ccd03bff499d5c75e92b9dfc3d522de77d7d7695413a610d9f1ba32bf"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:3b22606b563b24b57ceb002899176d4e4e5162c765c034b5b8f0a4f7563018cc"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
        output_digest: "sha256:7b58271b3209a62959faa17b88453abc17078aa4a1a982a5994bd9e83ffb1041"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:6a1e9336ca187ed6bd63be89f53ae1935f0cffde710afdff6215f5c87cf9ff62"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:04:33+09:00"
        evidence_path: docs/plans/PLAN-L7-249-setup-version-up-adapter-surface.md
        output_digest: "sha256:441ac30ff28ad0e794e49d50d106bc02d07eec693a59d4266a99b19ef190fbb6"
---

# PLAN-L7-249: setup version-up adapter surface の整備

## 目的

PLAN-L7-247 で `helix setup project` の初回 workflow に
`helix version-up dry-run --current v0.1.0 --target v0.1.3 --json` を追加し、
PLAN-L7-248 で L3/L6/L7 の trace を backfill した。

しかし配布される adapter doc、Claude subagent、Claude slash-command の実体と、
consumer doctor の `artifactReadiness` 判定は completion packet / consumer doctor 境界のままで、
version-up dry-run を必須 baseline として fail-close していなかった。

この PLAN では、setup の初回証跡を実際に consumer repo へ配布される surface まで伝播する。

## 変更

- built-in fallback と `docs/templates/adapter/` 実体の `AGENTS.md` / `CLAUDE.md` / `.claude/CLAUDE.md` に
  version-up dry-run を HELIX local state evidence として追加した。
- 配布 Claude subagent と slash-command の baseline / preflight に version-up dry-run を追加した。
- `runConsumerDoctor` が見る `artifactReadiness` を更新し、adapter doc / Claude subagent /
  slash-command が version-up dry-run を欠く場合は `fix_consumer_readiness` へ戻す。
- `tests/setup.test.ts` の built-in fallback と readiness 検査を更新し、配布 surface から
  version-up dry-run が落ちた場合に検出できるようにした。
- L6/L7 設計・テスト設計の文言を、配布 surface まで含めた fail-close 契約へ揃えた。

## 採用判断

- 採用: setup first-run の version-up dry-run を adapter / subagent / slash-command の実体と
  consumer doctor fail-close 判定へ必須化する。
- 不採用: `version-up activation-packet` を consumer first-run 必須 baseline にする。
  通常 consumer repo には dogfood PLAN corpus が無いため、初回稼働証跡は no-write dry-run に限定する。
- 不採用: `.helix` から `.helix` への実 cutover または `helix` executable alias の有効化。
  PLAN-M-02 の cutover/action-binding approval が未承認のため、今回も `mustNotApply` 境界を維持する。

## 完了条件

- 配布 adapter doc / Claude subagent / Claude slash-command の built-in fallback と実テンプレートが
  `helix version-up dry-run --current v0.1.0 --target v0.1.3 --json` を含む。
- consumer doctor の artifact readiness が version-up dry-run 欠落を fail-close する。
- `bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000` が green。
- `bun test tests/design-language.test.ts --timeout 180000` が green。
- `bun run tsc --noEmit`、`git diff --check`、`plan lint --gate governance`、`doctor` が green。
