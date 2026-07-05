---
plan_id: PLAN-L7-62-runtime-portability-guard
title: "PLAN-L7-62: runtime portability guard for TS/Bun/Node surfaces"
kind: impl
layer: L7
drive: fullstack
parent_design: docs/adr/ADR-001-helix-harness-redesign-and-language.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "runtime-portability doctor hard gate for TS/Bun core, Node stdlib typing, thin wrappers, and shell/Python drift"
agent_slots:
  - role: tl
    slot_label: "TL - runtime portability guard"
generates:
  - artifact_path: package.json
    artifact_type: config
  - artifact_path: src/lint/runtime-portability.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-portability.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/state-db.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L7-60
  requires:
    - docs/design/harness/L1-requirements/nfr.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - docs/governance/repository-structure.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
# IMP-146 trace correction（2026-06-26, Codex cross-review AGREE）: runtime-portability の trace 是正
# guard は L1 nfr.md の NFR-04 (harness=TS/Bun, ADR-001) + NFR-01/§6 (cross-platform
# native / Bun runtime) の機械強制 (enforcement)。欠落していた上流 descent link を補い
# forward-convergence spine-internal とする (Forward 集約)。新規仕様 back-fill は無し。
---

# PLAN-L7-62: runtime portability guard for TS/Bun/Node surfaces（移植性 guard）

## 目的

Windows portability と ADR-001 runtime boundaries を review memory に頼らず、機械的に enforce する。

harness core は TypeScript、Node standard-library APIs、Bun runtime / compiled binary path で構成する。
thin POSIX/PowerShell wrappers は許可するが、Python/Bash runtime logic を current core surfaces に戻してはならない。

## Scope

- package/tsconfig runtime contract、TS-only core surfaces、TypeScript Claude hooks、approved thin wrappers、local absolute paths、shell/Python dispatch 向けに `runtime-portability` lint を追加する。
- tracked files と untracked non-ignored files の両方を scan し、commit 前に active setup/worktree drift を捕捉する。
- `runtime-portability` を `doctor` hard gate として wire する。
- shell-string `execSync` を使っていた CLI `git` helper calls を `execFileSync("git", args)` に置き換える。
- detector meta tests と current-repo guard coverage を追加する。
- Node SQLite fallback path 向けに named `test:node-fallback` smoke script を追加する。

## Verification

- [x] `bunx vitest run tests\runtime-portability.test.ts`
- [x] `bun run test:node-fallback`

## DoD

- [x] `src/` または `.claude/hooks/` 配下の Non-TS runtime files を検出する。
- [x] active worktree setup 中の untracked non-ignored runtime files を検出する。
- [x] unapproved `scripts/` runtime wrappers を検出する。
- [x] TS/Bun/Node guarantees を弱める package/tsconfig drift を検出する。
- [x] Node SQLite fallback behavior を named smoke script で cover する。
- [x] `runtime-portability` が doctor hard-gate aggregation に含まれている。
