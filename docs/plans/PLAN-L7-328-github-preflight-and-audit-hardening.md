---
plan_id: PLAN-L7-328-github-preflight-and-audit-hardening
title: "PLAN-L7-328: GitHub preflight と監査 hardening"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "GitHub 外部監査、identifier rename cutover snapshot、objective G-06 analyzer、内部識別子 rename residue の L7 fail-close 強化であり、L1-L6 の要求意味は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: tests/cli-surface.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - GitHub operation boundary と安全な自動化方針"
  - role: qa
    slot_label: "QA - L1-L14/GitHub/rename residual audit"
  - role: se
    slot_label: "SE - implementation hardening"
generates:
  - artifact_path: docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/state-db/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/lint/github-guards.ts
    artifact_type: source_module
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/harness-check-workflow.test.ts
    artifact_type: test_code
  - artifact_path: tests/branch-kind.test.ts
    artifact_type: test_code
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/repository-name-paths.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/state-db.test.ts
    artifact_type: test_code
  - artifact_path: .github/workflows/harness-check.yml
    artifact_type: source_module
dependencies:
  parent: docs/design/harness/L6-function-design/function-spec.md
  requires:
    - docs/governance/helix-objective-evidence-audit.md
  references:
    - docs/plans/PLAN-M-02-helix-identifier-rename.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T20:05:44+09:00"
    tests_green_at: "2026-07-05T20:05:44+09:00"
    verdict: approve
    scope: "GitHub external audit preflight を非対話・credential helper 無効へ固定し、identifier rename snapshot と objective G-06 artifact requirement を fail-close 化した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T20:01:44+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:05142ae258f784c014277e79f8afa1fbc573f7147cbe95e450edf7a73f46ea5d"
      - kind: unit_test
        command: "bun test tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T20:01:44+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:18dbd32f611230bbb7e24cad39f651672b88e2b8cdd09ee9af67a0dc2c7c3d54"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T20:01:44+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T20:01:44+09:00"
        evidence_path: docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T20:04:34+09:00"
        evidence_path: docs/plans/PLAN-L7-328-github-preflight-and-audit-hardening.md
        output_digest: "sha256:77ba05b15102b56b45990459f0f68aad8dc5344f643e7008e40057e41eb98fe8"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T20:15:08+09:00"
    tests_green_at: "2026-07-05T20:15:08+09:00"
    verdict: approve
    scope: "consumer readiness / state DB / workflow helper に残っていた旧名由来 camelCase identifier を HELIX 系へ揃え、compact token literal も分割生成へ変更した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/state-db.test.ts tests/cli-surface.test.ts tests/distribution-acceptance.test.ts tests/repository-name-paths.test.ts tests/identifier-rename.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T20:15:08+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:3d1ab5bc34812c474e93086f68d1591e56e39bc6f9ca62d71205baa13ffb9ace"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T20:15:08+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
---

# PLAN-L7-328: GitHub preflight と監査 hardening

## 目的

GitHub 運用が harness の古い前提やローカル credential helper に巻き込まれて不透明に失敗しないよう、
外部監査を非対話・credential helper 無効で実行する。また、名称 cutover と L1-L14 coverage の監査が
件数だけの false green を出さないよう、実装側の digest / artifact requirement を強化する。

## スコープ

- `helix audit objective-external --json` の `git ls-remote` は `credential.helper=`、
  `GIT_TERMINAL_PROMPT=0`、`GCM_INTERACTIVE=Never` で実行し、GitHub 認証不足を明示的な preflight failure とする。
- identifier rename cutover snapshot は、旧名 hit の token/path/count だけでなく対象ファイル content hash に束縛する。
- objective evidence audit の G-06 は、doc row にある HELIX L1-L6 test-design / harness L7 unit test-design も
  required artifact として fail-close する。
- consumer readiness / state DB / workflow test helper の内部 identifier に残る旧名由来の camelCase residue も
  HELIX 系 identifier へ揃え、検索 residue を 0 件に保つ。

## 非スコープ

- GitHub 認証情報の作成、権限昇格、branch protection 適用、PR 作成そのものは実行しない。
- `PLAN-M-02` の不可逆 state move / CLI alias cutover は実行しない。
- 配布 Pack latest tag の採用、version-up activation、外部 repo の bulk import は実行しない。

## 受入条件

- 名称漏れ検索で旧 repo 名、旧 CLI 名、旧 state dir、旧 typo marker の tracked / filesystem residue が 0 件。
- camelCase / compact 表記の旧名由来 internal identifier residue も 0 件。
- `identifier-rename` test が同一 hit count の content drift で snapshot digest drift を検出する。
- `goal-evidence-audit` と `cli-surface` test が G-06 artifact requirement と GitHub preflight isolation を検証する。
- `typecheck` と `doctor` が green。ただし外部 repo が認証必須の場合、`objective-external` は認証不足を明示して blocked とする。
- source `harness-check` は単一 required check のまま、branch type matrix、commitlint、poc direct-main guard、hotfix postmortem guard を job 内 subjob として実行する。

## 2026-07-05 追補: 外部 ledger freshness と G-10 stale 行修正

- `git ls-remote` で 2026-07-05 時点の `RetryYN/HELIX-HARNESS` main、historical Pack main、Pack latest tag を再確認し、
  `docs/governance/helix-objective-evidence-audit.md` と `src/lint/objective-evidence-audit.ts` の external source marker を
  2026-07-05 へ更新した。観測 commit / tag は 2026-07-04 監査から変わらない。
- `PLAN-L7-03-setup-solo-team` は live PLAN status が `confirmed` であり、`status --json` の outstanding item でもないため、
  G-10 の未了 / decision pending PLAN 一覧から外した。人間承認が必要な blocker
  (`PLAN-DISCOVERY-07`、`PLAN-DISCOVERY-10`、`PLAN-DISCOVERY-11`、`PLAN-L7-146`、`PLAN-M-02`) は維持する。
- setup consumer readiness の distribution package surface `sourceCheckedAt` も、同じ 2026-07-05 の実測日に合わせた。

## 現在の判断

GitHub 操作を「自由に」するために guard を外すのではなく、AI agent が必要な操作を正規 preflight、明示権限、
監査証跡つきで実行できるようにする。今回の修正は、古い credential helper や不完全な digest による
不透明な失敗・false green を潰す。
