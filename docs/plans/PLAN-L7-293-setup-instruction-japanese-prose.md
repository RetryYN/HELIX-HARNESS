---
plan_id: PLAN-L7-293-setup-instruction-japanese-prose
title: "PLAN-L7-293: setup instruction 日本語 prose 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "root/runtime instruction の prose を日本語-first へ是正する小変更。CLI 実装、D-API/D-DB、認証/secret、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup instruction 日本語 prose 固定"
  - role: qa
    slot_label: "QA - runtime instruction 日本語 prose 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-293-setup-instruction-japanese-prose.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/adapter/.claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-292-setup-project-instruction-surface.md
  requires:
    - docs/plans/PLAN-L7-292-setup-project-instruction-surface.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T22:22:33+09:00"
    tests_green_at: "2026-07-03T22:22:33+09:00"
    verdict: approve
    scope: "setup project instruction surface 近傍の managed/runtime prose を日本語-first に揃え、英語 prose へ戻らないようにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T22:22:33+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:e71c3328622843302eb984ef03ebe42e2a980f533fcc7d94b7787957ecd7436e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T22:22:33+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T22:22:33+09:00"
        evidence_path: docs/plans/PLAN-L7-293-setup-instruction-japanese-prose.md
        output_digest: "sha256:bdd089a88e762312554f925e0a0e9919c33c1539ebd736194236c216e4dc236b"
---

## 目的

`CLAUDE.md` / `AGENTS.md` / `.claude/CLAUDE.md` は `ut-tdd setup project` を正規 entrypoint として示すようになったが、managed block 周辺に英語 prose が残り、直近修正でも `bootstraps a HELIX-ready project` という英語説明を追加していた。これは「ドキュメントは英語ではなく日本語で統一する」という要求に逆行する。

この PLAN では setup command surface 近傍の runtime instruction prose と配布 adapter template を日本語-first に寄せ、`tests/setup.test.ts` の `U-SETUP-034` / `U-SETUP-035` / `U-SETUP-020` で英語説明の復帰を検出する。

## DoD

- [x] `CLAUDE.md` の managed block は `ut-tdd setup project` を日本語 prose で説明する。
- [x] `AGENTS.md` と `.claude/CLAUDE.md` の managed/runtime prose も日本語-first に寄せる。
- [x] `docs/templates/adapter/` と `src/setup/templates.ts` の配布 adapter label も日本語-first に寄せる。
- [x] `bootstraps a HELIX-ready project` のような英語説明が戻ると test が fail する。
- [x] CLI 実装、branch protection apply、secret / PII / external API apply、PLAN-M-02 cutover は変更しない。
