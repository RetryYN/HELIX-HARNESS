---
plan_id: PLAN-L7-357-distribution-sync-pack-commands
title: "PLAN-L7-357: clean distribution sync / package commands"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:helix-harness-upstream-full-branch-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "既存 distribution plan surface の L7 拡張。配布先 remote への push / release 作成 / tag publish は実行せず、plan-only evidence と local staging までに限定する。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - clean artifact sync / staging / package surface の HELIX 化"
  - role: tl
    slot_label: "TL - no remote mutation / no bulk import / explicit path staging の確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-357-distribution-sync-pack-commands.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - PLAN-L7-303-distribution-package-surface-readiness
  references:
    - docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-357: clean distribution sync / package commands

## 目的

`helix distribution plan` で止まっている clean distribution surface を、配布用 checkout に対する
非破壊 sync plan、local staging、tarball package、release publication dry-run plan まで拡張する。

## スコープ

- `buildCleanDistributionPlan` に source path と artifact path の分離を追加する。
- `docs/skills/*` を配布 artifact では root `skills/*` へ写像する。
- `buildPackSyncPlan` 相当を HELIX 名称で実装し、copy plan と `git add -- <explicit paths>` command を返す。
- `helix distribution sync-plan` / `sync-stage` / `sync-pack` / `package` / `release-plan` を追加する。
- `sync-pack` は local checkout へのファイル同期まで。commit / tag / push / GitHub Release は実行しない。
- `package` は local tarball / sha256 / manifest 生成まで。署名・公開は別承認境界へ残す。

## 対象外

- `RetryYN/HELIX-HARNESS-OS` への push / tag / release 作成。
- PLAN-M-02 rename / cutover。
- `.helix` runtime state の削除や移動。

## 受入条件

- clean artifact set に dogfood docs、`.helix` runtime state、runtime DB、local audit evidence が混入しない。
- Pack checkout への同期は explicit paths だけを提示し、destructive prune は明示 option かつ local-only に限定する。
- `tests/setup.test.ts` と `tests/distribution-acceptance.test.ts` に sync / package / denylist 回帰 test を追加する。

## 検証予定

- `bun test tests/setup.test.ts tests/distribution-acceptance.test.ts --timeout 300000`
- `bun run typecheck`
- `bunx biome check src tests docs/plans/PLAN-L7-357-distribution-sync-pack-commands.md`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-357-distribution-sync-pack-commands.md`

## 実装記録

2026-07-07:

- `buildCleanDistributionPlan` に source path / artifact path の分離を追加し、
  `docs/skills/*` を配布 artifact では `skills/*` へ写像するようにした。
- `buildPackSyncPlan` / `gitAddPathspecCommands` / `transformCleanDistributionArtifact` を追加し、
  explicit pathspec の `git add -- <paths>` suggestion と pack-safe `package.json` test script を生成するようにした。
- `helix distribution sync-plan` / `sync-stage` / `sync-pack` / `package` / `release-plan` を追加した。
  いずれも local-only または dry-run packet で、commit / tag / push / GitHub Release 作成は実行しない。
- clean distribution acceptance test は source/artifact mapping を `cleanDistributionSourcePath` で解決するよう更新した。

Green commands:

- `bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/cli-surface.test.ts --timeout 300000` -> 102 pass / 0 fail
- `bun run typecheck` -> exit 0
- `bunx biome check src/setup/index.ts src/cli.ts tests/setup.test.ts tests/cli-surface.test.ts tests/distribution-acceptance.test.ts` -> exit 0
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-357-distribution-sync-pack-commands.md` -> exit 0
