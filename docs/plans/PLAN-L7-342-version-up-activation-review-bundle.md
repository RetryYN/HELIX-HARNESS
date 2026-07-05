---
plan_id: PLAN-L7-342-version-up-activation-review-bundle
title: "PLAN-L7-342 (impl): version-up activation 確認 bundle — 承認前 packet をローカル成果物へ束ねる"
kind: impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-146 の外部 activation 境界は変えず、既存 version-up activation-packet / rehearsal / security-checklist / dry-run evidence をローカル確認 bundle に束ねるだけの実装。新規 product requirement は追加しない。"
owner: Codex
parent_design: docs/process/modes/version-up.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/version-up-readiness.test.ts
agent_slots:
  - role: se
    slot_label: "SE - version-up activation 確認 bundle 実装"
  - role: tl
    slot_label: "TL - plan-only / mustNotApply / approval 境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-342-version-up-activation-review-bundle.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-bundle.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/version-up.md
  requires:
    - src/lint/version-up-readiness.ts
  references:
    - docs/plans/PLAN-L7-146-serverless-readonly-share.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T23:50:00+09:00"
    tests_green_at: "2026-07-06T23:50:00+09:00"
    verdict: approve
    scope: "version-up activation-packet / rehearsal / security-checklist / version dry-run evidence をローカル成果物 bundle として書き出す。Cloudflare/GitHub/secret/access-control の外部 activation は実行せず、activationAllowed=false と mustNotApply=true を維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts tests/semantic-frontier-consistency.test.ts tests/vmodel-pair.test.ts tests/l0-l8-design-consistency-audit.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T23:50:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:70805eb53e8aebeef0e4305200fe570960e9198ae30e3f4a7efed5f7f13625e4"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T23:50:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-342 (impl): version-up activation 確認 bundle

## 目的

`PLAN-L7-146` の version-up parked work は、外部 Cloudflare 配信、GitHub webhook、HMAC secret、
access control を含むため action-binding approval 前に apply しない。一方で、承認前レビューでは
activation packet、external rehearsal、security checklist、version dry-run evidence を同じ snapshot に束ねて
確認できる必要がある。

本 PLAN は、その確認材料を `helix version-up activation-bundle --plan <planId> --out <dir> --json`
としてローカル生成する。

## 実装

- `src/lint/version-up-bundle.ts`: `version-up-activation-review-bundle.v1` を生成する。
- `src/cli.ts`: `version-up activation-bundle` を追加し、指定 `--out` 配下へ JSON 成果物を書く。
- `tests/version-up-readiness.test.ts`: bundle contract、manifest、hash、JSON parse 可能性を検証する。
- `tests/cli-surface.test.ts`: CLI がローカル成果物だけを書き、`planOnly=true` / `mustNotApply=true` /
  `activationAllowed=false` を返すことを検証する。

## 境界

- 外部 deploy、GitHub webhook 登録、secret binding、access control 設定は実行しない。
- `activationAllowed=false` と `applyCommandAvailable=false` を維持する。
- bundle は確認材料であり、PO / action-binding approval の代替ではない。

## 受入条件

- `version-up activation-bundle` が 5 件の JSON 成果物をローカル directory に出力する。
- manifest に `writePolicy=local-artifact-write`、`mustNotApply=true`、`activationAllowed=false` が入る。
- `bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts` と `bun run tsc --noEmit` が green。
- `helix doctor` の impl-plan-trace / change-set-integrity が source-plan-missing を出さない。
