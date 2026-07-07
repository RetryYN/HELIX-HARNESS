---
plan_id: PLAN-L7-360-github-ops-guard-parity
title: "PLAN-L7-360: GitHub ops branch-type / release guard parity"
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
backprop_decision_reason: "既存 GitHub packet surface への小さな運用 guard 追加。branch protection / release publication の実 apply は行わない。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - branch-type guard / release publication dry-run plan"
  - role: tl
    slot_label: "TL - GitHub operation approval boundary と既存 github packet 群との重複確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-360-github-ops-guard-parity.md
    artifact_type: markdown_doc
  - artifact_path: src/audit/github-ops-guard.ts
    artifact_type: source_module
  - artifact_path: src/audit/github-merge-readiness.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/github-ops-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/function-spec.md
  requires:
    - PLAN-L7-328-github-preflight-and-audit-hardening
  references:
    - docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-360: GitHub ops branch-type / release guard parity

## 目的

HELIX の GitHub operation packet 群に、branch type と release publication の小さな fail-close guard を追加する。
自走 agent が PR / release に近づくほど、branch 種別と公開境界を機械的に誤れないようにする。

## スコープ

- `poc/*` から `main` への直接 merge を禁止する guard。
- `hotfix/*` から `main` への PR は postmortem marker を必須にする guard。
- merge commit を除く commit subject の Conventional Commits 検査。
- release publication plan を dry-run JSON で出す。`git tag` / package / `gh release create` は command suggestion に留める。
- 既存 `helix github merge-readiness` / `pr-create` / `ci-status` と矛盾しない command surface へ統合する。

## 対象外

- GitHub branch protection / ruleset の apply。
- tag 作成、push、GitHub Release 作成。
- commit history rewrite。

## 受入条件

- branch ref normalization が `refs/heads/`、`refs/remotes/`、`origin/` を扱う。
- `poc/* -> main` と postmortem 無し `hotfix/* -> main` が fail-close。
- valid Conventional Commits は pass、invalid subject は finding 化。
- release publication plan は `externalPublishRequiresApproval=true` を返す。

## 検証予定

- `bun test tests/github-ops-guard.test.ts tests/cli-surface.test.ts --timeout 180000`
- `bun run typecheck`
- `bunx biome check src tests docs/plans/PLAN-L7-360-github-ops-guard-parity.md`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-360-github-ops-guard-parity.md`

## 実装記録

2026-07-07:

- `src/audit/github-ops-guard.ts` を追加し、branch ref normalization、`poc/* -> main` の fail-close、
  postmortem marker 無し `hotfix/* -> main` の fail-close、merge commit を除く Conventional Commits
  subject 検査を実装した。
- `github guard` CLI を追加し、branch-type / commit subject guard を JSON / text で出せるようにした。
- `github release-plan` CLI を追加し、release publication の command suggestion を dry-run packet として出すだけにした。
  `git tag` / package / `gh release create` は実行せず、`externalPublishRequiresApproval=true` と
  `mustNotApplyWithoutApproval=true` を固定する。

Green commands:

- `bun test tests/github-ops-guard.test.ts tests/cli-surface.test.ts --timeout 180000` -> 55 pass / 0 fail
- `bun run typecheck` -> exit 0
- `bunx biome check src/audit/github-ops-guard.ts src/cli.ts tests/github-ops-guard.test.ts tests/cli-surface.test.ts` -> exit 0
