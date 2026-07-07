---
plan_id: PLAN-L7-358-distribution-update-check-advisory
title: "PLAN-L7-358: distribution update-check advisory"
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
backprop_decision_reason: "status への fail-open advisory 追加であり、version-up activation や外部 release 操作を実行しない。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - update-check cache / remote resolution / status surface"
  - role: tl
    slot_label: "TL - advisory only / consumer cwd origin 誤読防止 / fail-open 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-358-distribution-update-check-advisory.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/update-check.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/update-check.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - PLAN-L7-303-distribution-package-surface-readiness
  references:
    - docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-358: distribution update-check advisory

## 目的

導入済み HELIX checkout が古い場合、`helix status` で軽量に知らせる。これは gate ではなく advisory であり、
remote 失敗・offline・cache write 失敗で status / doctor を赤にしない。

## スコープ

- `package.json` の version と repository URL を基準に release tag を比較する。
- cache は `.helix/state/update-check.json` に 24h TTL で保存する。
- remote override env を用意する。ただし consumer cwd の `origin` を誤って読まない。
- `HELIX_SKIP_UPDATE_CHECK=1` 相当で明示 skip できるようにする。
- `helix status --json` に update advisory field を追加し、text status は 1 行だけ表示する。

## 対象外

- version-up activation の承認判断。
- release tag / GitHub Release の作成。
- 配布先 remote の変更。

## 受入条件

- update check は fail-open。network failure は `checked=false` の detail として返す。
- semver 比較は `v0.1.10 > v0.1.9` を正しく扱う。
- consumer repo から実行しても、consumer `origin` ではなく harness checkout の repository URL を使う。
- JSON / text の両 surface を test で固定する。

## 検証予定

- `bun test tests/update-check.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bunx biome check src tests docs/plans/PLAN-L7-358-distribution-update-check-advisory.md`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-358-distribution-update-check-advisory.md`

## 実装記録

2026-07-07:

- `src/setup/update-check.ts` を追加し、harness checkout の `package.json` version / repository URL を基準にした
  fail-open update advisory、24h cache、remote override、`HELIX_SKIP_UPDATE_CHECK` を実装した。
- `src/cli.ts` の `status` JSON / text surface へ `update` advisory を追加した。test subprocess では
  `HELIX_SKIP_UPDATE_CHECK=1` を既定にし、unit / CLI surface test が network に依存しないよう固定した。
- `docs/governance/helix-objective-evidence-audit.md` の G-10 outstanding 一覧へ
  `PLAN-L7-357`〜`PLAN-L7-360` を追加し、今回の上流追突監査で起票した draft PLAN が完了 claim から
  隠れないようにした。

Green commands:

- `bun test tests/update-check.test.ts tests/cli-surface.test.ts --timeout 180000` -> 55 pass / 0 fail
- `bun run typecheck` -> exit 0
- `bunx biome check src/setup/update-check.ts src/cli.ts tests/update-check.test.ts tests/cli-surface.test.ts docs/plans/PLAN-L7-358-distribution-update-check-advisory.md docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md docs/governance/helix-objective-evidence-audit.md` -> exit 0
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-358-distribution-update-check-advisory.md` -> exit 0
- `HELIX_SKIP_UPDATE_CHECK=1 bun run src/cli.ts status --json` -> exit 0; `objectiveProgress.auditOk=true`,
  `auditViolationCount=0`, `update.checked=false`（明示 skip）
