---
plan_id: PLAN-L7-274-objective-external-ledger-refresh
title: "PLAN-L7-274: objective external ledger refresh"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "外部 Pack main HEAD の実測 drift を objective evidence ledger へ同期する source refresh。採用判断や version-up activation は変更しない。"
owner: TL (Codex)
parent_design: docs/governance/helix-objective-evidence-audit.md
pair_artifact: tests/goal-evidence-audit.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "QA - Avicenna objective external drift scan"
  - role: tl
    slot_label: "TL - objective external ledger refresh"
generates:
  - artifact_path: docs/plans/PLAN-L7-274-objective-external-ledger-refresh.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/governance/helix-objective-evidence-audit.md
  requires:
    - src/lint/objective-evidence-audit.ts
    - tests/goal-evidence-audit.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:13:00+09:00"
    tests_green_at: "2026-07-03T16:13:00+09:00"
    verdict: approve
    scope: "Pack main HEAD の external observed drift を objective evidence ledger と関連 oracle へ同期する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts tests/setup.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:13:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:a93e01b9830f2a1701e1cb1548bfe93efa6de24262b67a71e6ea448db02ffc84"
      - kind: smoke
        command: "bun run src/cli.ts audit objective-external --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:13:00+09:00"
        evidence_path: docs/governance/helix-objective-evidence-audit.md
        output_digest: "sha256:103188b4c1e8ac260c5a7552e83ff932dc84224bb714226f430d31c6591437b5"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:13:00+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/oracle-test-trace.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:13:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:08a7f438f5c38096e7c6108299387286d5bdcf4181d02013718c8e06b261b474"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:13:00+09:00"
        evidence_path: docs/plans/PLAN-L7-274-objective-external-ledger-refresh.md
        output_digest: "sha256:952fb3bac7c9545c01d560f1a4c0cd6be3d7cc2e098b54a82c1551dfe6e57584"
---

# PLAN-L7-274: 外部 objective ledger 更新

## 目的

`helix audit objective-external --json` が、配布レポ `unison-ai-product/HELIX-HARNESS-OS`
の `main` HEAD drift を検出した。これは外部 source ledger の実測値更新であり、Pack latest tag `v0.1.3`
の採用や local distribution version の引き上げではない。

この PLAN は、実測 `refs/heads/main = 3196ee5b2f564fd3523d010ddbb854d3c54a2523` を objective evidence
ledger、lint 期待値、setup の consumer boundary、関連テストへ同期する。

## 変更

- objective evidence audit の外部 HEAD 確認日を 2026-07-03 に更新する。
- Pack main HEAD の observed 値を `3196ee5b2f564fd3523d010ddbb854d3c54a2523` に更新する。
- `audit objective-external` の期待値、setup output の distribution reference、関連 tests を同じ値に揃える。

## 境界

- Pack latest tag `v0.1.3` は参照のみで、local `package.json` version `0.1.0` / local tag `v0.1.0` は変更しない。
- version-up activation、external adoption、bulk import、配布物の採用、remote 操作は実行しない。

## 完了条件

- `helix audit objective-external --json` が current external observed 値で green。
- goal evidence / cli surface / setup / distribution acceptance の関連テストが green。
- typecheck、design-language、plan governance、doctor が green。
