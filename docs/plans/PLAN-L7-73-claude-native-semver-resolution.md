---
plan_id: PLAN-L7-73-claude-native-semver-resolution
title: "PLAN-L7-73 (troubleshoot): semver-newest native Claude resolution (A-137 #6)"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-17
updated: 2026-06-17
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "Discharge A-137 #6 deferred carry: native Claude resolution sorted full paths lexicographically, so 1.9.0 outranked 1.10.0 and mixed-source path prefixes dominated version order. Replaced with per-source version extraction + numeric semver comparison (newestVersioned). PM verified via tsc, Biome, 2 new Vitest cases (lexicographic-trap + mixed-source/platform-suffix), full regression, and doctor. No public signature change (internal resolution only), so no Reverse pairing required."
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
agent_slots:
  - role: tl
    slot_label: "TL - native Claude semver resolution"
generates:
  - artifact_path: docs/plans/PLAN-L7-73-claude-native-semver-resolution.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-68-provider-dispatch-portability.md
  requires:
    - .helix/audit/A-137-unusable-provider-dispatch-audit.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
  references:
    - src/runtime/detect.ts
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-73: semver-newest native Claude 解決

## 0. 目的

A-137 #6 の deferred carry（「Native Claude version sort — mixed-source
lexicographic sorting may not pick semver-newest native binary」）を解消し、
`helix claude --execute` と spawnability probe が、インストール済みの
native Claude binary のうち実際に最も新しいものを解決できるようにする。

## 1. 問題

`resolveClaudeNativeCommand` は native binary 候補を 2 つの source
（`%APPDATA%\Claude\claude-code\<version>\claude.exe` と VS Code extension
`anthropic.claude-code-<version>`）から集めて連結し、`newestExisting` で
最新候補を選んでいた。`newestExisting` は **full path strings を辞書順で並べ**
最後の要素を採用するため、次の 2 つの欠陥があった。

1. 辞書順の version 比較は誤る。`1.9.0` は `1.10.0` より後に並ぶ
   （3 文字目で `"9" > "1"` となる）ため、古い binary が「最新」として
   選ばれる可能性がある。
2. source が混在すると、比較は version ではなく異なる path prefix に支配される。
   そのため、選ばれる binary は実際の version ではなく root path の並びに依存する。

## 2. スコープ

許可する変更:

- `src/runtime/adapter.ts` の native Claude binary selection で、source ごとに
  version を抽出する（appData directory name、および VS Code extension dir name の
  `anthropic.claude-code-` prefix 後）。比較は semver core の数値比較とし、
  pre-release / build / platform suffixes は無視する。
- version が同じ場合は、先に列挙された preferred source を維持する安定した tie-break。
- 辞書順 trap と mixed-source case の Vitest coverage。

対象外:

- Codex resolution（`[codex.exe, codex.cmd]` は version を持たないため、
  `newestExisting` による `.exe` preference は変更しない）。
- public `resolveClaudeNativeCommand` signature または spawnability probe contract の変更。
- external provider CLI behavior。

## 3. 受入条件

- native candidates として `1.9.0` と `1.10.0` がある場合、resolution は
  `1.10.0` binary を返す。
- appData `1.0.0` と VS Code `anthropic.claude-code-1.2.0-win32-x64` がある場合、
  resolution は `1.2.0` binary を返す（source 間で semver を比較し、platform
  suffix は無視する）。
- `HELIX_CLAUDE_BIN` override と PATH fallback behavior は変更しない。
- typecheck / Biome / Vitest / `helix doctor` は green のままとし、src file は
  この PLAN の `generates` に trace する。

## 4. 検証

- `bunx vitest run tests/runtime-adapter.test.ts`
- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run src\\cli.ts doctor`

## 5. 状態

Draft。2026-06-17 に実装・検証済み。contract change は無いため Reverse
back-fill は不要（A-137 #6 は PLAN-L7-68 の最後の open carry だった）。
