---
plan_id: PLAN-L7-33-mcp-profile-config-safety
title: "PLAN-L7-33 (add-impl): MCP profile config と外部検証 safety"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "U-MCPPROFILE-001..012 を green tests に昇格した。Docker MCP Toolkit profile metadata、generated local MCP config rendering、profile safety findings、activation planning は pure functions として実装済み。Critical 0 / Important 0。package installation、MCP server execution、profile enablement、committed .vscode/mcp.json write、inline credential persistence は導入していない。"
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:05:58+09:00"
    tests_green_at: "2026-07-09T15:05:58+09:00"
    verdict: approve
    scope: "PLAN-L7-33 の過去 failed test evidence を削除せず、現行 fast suite の green evidence を追加して MCP profile safety 実装の passed test projection を回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:05:58+09:00"
        evidence_path: tests/verification-profile.test.ts
        output_digest: "sha256:7d0cee1ae554c76191023c276a86d4c7de30817e13bfef210199234426869db4"
agent_slots:
  - role: tl
    slot_label: "TL - MCP profile safety 実装"
  - role: qa
    slot_label: "QA - U-MCPPROFILE oracle"
generates:
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: tests/verification-profile.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-32-mcp-profile-config-safety.md
  requires:
    - docs/plans/PLAN-L6-32-mcp-profile-config-safety.md
    - docs/plans/PLAN-REVERSE-33-mcp-profile-config-safety.md
---

# PLAN-L7-33 (add-impl): MCP profile config と外部検証 safety

## §0 位置づけ

これは PLAN-L6-32 の将来 L7 実装 entry である。Docker MCP Toolkit を profile catalog に追加し、generated MCP config / external-profile safety lint を実装するための承認済み route とする。

## §1 開始条件

実装は、以下が満たされるまで開始してはならない。

- PLAN-L6-32 で function contracts と U-MCPPROFILE oracles が confirmed になっている。
- source 変更前に、`tests/verification-profile.test.ts` が U-MCPPROFILE behavior の TDD Red case を受け取っている。
- review evidence 前に、既存の verification-profile、doctor、typecheck、lint checks が green である。
- 生成 config が、commit される secrets や user-specific absolute home paths を書き出さない。

## §2 実装範囲

開始条件を満たした後に許可される実装:

- Docker/toolkit readiness checks を備えた optional disabled profile として Docker MCP Toolkit を追加する。
- generated config rendering と safety analysis の pure functions を追加する。
- pure functions が green になった後に限り、`helix mcp profile config` または dry-run-only equivalent の配下で CLI を拡張する。

対象外:

- 実際の package installation。
- 実際の MCP server execution または profile enablement。
- `.vscode/mcp.json` またはその他の Git-tracked local config の書き込み。

## §3 作業スケジュール

### Step 1: [直列] TDD Red oracle

直列理由: downstream_dependency. source 変更前に、missing implementation に対して U-MCPPROFILE behavior が fail しなければならない。

### Step 2: [直列] Pure catalog/config/safety functions

直列理由: downstream_dependency. CLI または DB projection は deterministic pure output に依存しなければならない。

### Step 3: [並列] CLI dry-run surface and docs back-fill

pure functions が green になった後、CLI dry-run と documentation back-fill を進めてよい。

### Step 4: [直列] review

直列理由: downstream_dependency. review evidence 前に、typecheck / lint / targeted tests / doctor が green でなければならない。

## §8 DoD

- [x] source implementation 前に Red test が存在する。
- [x] U-MCPPROFILE-001..012 pass.
- [x] `npx --no-install vitest run tests/verification-profile.test.ts` passes before review.
- [x] review 前に `npm run typecheck` と `npm run lint` が pass する。
- [x] Reverse fullback が governance/backlog additions を close する。
