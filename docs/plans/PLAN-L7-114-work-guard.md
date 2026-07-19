---
plan_id: PLAN-L7-114-work-guard
title: "PLAN-L7-114: Claude/Codex foreign work guard"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "This is a developer-local Claude hook guard that enforces the existing hybrid Git rule against editing foreign uncommitted work; it does not change product requirements or runtime user behavior."
agent_slots:
  - role: tl
    slot_label: "TL - foreign uncommitted work guard"
  - role: aim
    slot_label: "AIM - troubleshoot classification and runtime guard review"
generates:
  - artifact_path: docs/plans/PLAN-L7-114-work-guard.md
    artifact_type: markdown_doc
  - artifact_path: .claude/settings.json
    artifact_type: config
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/hooks/work-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/work-guard.ts
    artifact_type: source_module
  - artifact_path: src/lint/project-hook.ts
    artifact_type: source_module
  - artifact_path: tests/work-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/project-hook.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - AGENTS.md
    - CLAUDE.md
    - .claude/CLAUDE.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T12:30:00+09:00"
    tests_green_at: "2026-06-23T12:29:00+09:00"
    verdict: approve
    scope: "Foreign uncommitted work guard pure function, Claude hook entry, project-hook required hook lint, and regression tests."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\work-guard.test.ts tests\\project-hook.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T12:28:00+09:00"
        evidence_path: tests/work-guard.test.ts
        output_digest: "sha256:5ff89dd03a0e6ec91733514d7c94ee10a7bf2dbe8b148a24c73d779a0681c35b"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T12:29:00+09:00"
        evidence_path: src/runtime/work-guard.ts
        output_digest: "sha256:ad589a73486d347838c5b913d7746df7b8037a50c2e97baa29790b2c22b8c81b"
---

# PLAN-L7-114: Claude/Codex foreign work guard の計画

## 目的

`hybrid` mode で、ある runtime が別 runtime の未 commit 作業中ファイルを編集しないようにする。
対象 path が現在 uncommitted で、現在の Claude session がその path を touched として記録していない場合、
guard は Claude `Edit` / `Write` / `MultiEdit` call を block する。

## 範囲

- `src/runtime` 配下に pure work-guard evaluator を追加する。
- Claude `PreToolUse(Edit|Write|MultiEdit)` hook entry を追加する。
- `.claude/settings.json` に hook を登録する。
- hook の接続が維持されるように `project-hook` lint を拡張する。
- pass / block / bypass / path-normalization behavior を unit tests でカバーする。

## 受入条件

- `HELIX_ALLOW_FOREIGN_EDIT=1` が設定されていない限り、foreign uncommitted file の編集は block される。
- clean files と、現在の session がすでに touched として記録した files は pass する。
- project hook lint は work guard を必須にする。
- typecheck と targeted tests が pass する。

## 修正メモ (2026-06-23, PLAN-RECOVERY-05 dogfood)

AC の "files already touched by the current session pass" は、初回実装では実際には満たせていなかった。
`normalizeRepoRelative` は repo-relative paths を `startsWith(repoRoot)` で解決していたが、
session log は `target` を tool-name prefix 付きで記録する
(例: `"Write c:\\...\\repo\\src\\x.ts"`)。この prefix により `startsWith` が成立せず、
session-touched set が git-porcelain paths と一致しなかったため、guard が agent 自身の
uncommitted files を false-block していた。修正では `repoRoot` を substring (`indexOf`) として
照合し、prefix を許容した。bare absolute paths の behavior は同一のまま維持する。
`tests/work-guard.test.ts` に regression test を追加した
(session-log prefixed target -> repo-relative)。Iron Law (PLAN-RECOVERY-05) の dogfood により、
guard が own-session edit を block した事象が見つかり、blind override ではなく root-causing したことで
normalization bug が surfaced した。

解決済み (2026-06-23): env var と並行して、agent が access 可能な override path を追加した。
`.helix/state/foreign-edit-override` に空ではない reason を書くと
(gitignored runtime state であり、mid-session に Write tool から書ける) guard を bypass する。
空または whitespace だけの marker は bypass しないため、reason なしの silent bypass はできない。
すべての marker bypass は `.helix/logs/foreign-edit-overrides.jsonl` に
(ts/target/reason/session) として append され、audit trail を残す。
pure resolver `resolveForeignEditOverride` と hook marker read/audit は
`tests/work-guard.test.ts` でカバーしている。
