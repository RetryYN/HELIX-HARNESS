# Governance Documents（governance 文書）

このディレクトリは HELIX Agent Harness（UT-TDD Agent Harness 土台）の現行正本だけを置く。

## Current Source Of Truth（現行正本）

Claude Code / Codex / human reviewer は、通常タスクでは次の順に読む。

1. `helix-agent-harness-concept_v3.1.md`
2. `helix-agent-harness-requirements_v1.2.md`
3. `helix-agent-harness-extraction-plan_v0.1.md`
4. `../adr/ADR-001-helix-harness-redesign-and-language.md` (再設計方針 + 実装言語 = TypeScript)
5. `repository-structure.md` (リポジトリ構成ルールの正本)

> **ADR-001 連動**: 実装は **source snapshot 概念のみ取り込み + TypeScript で全面再実装**。`../migration/helix-porting-map.md` と `helix-identifier-cutover-strategy.md` の **Python code-port 部分は superseded**。これらは source capability inventory / 再設計思想の参考として残置し、code-port 計画としては使わない (PLAN-001..004 も同様に superseded)。

> **ADR-001 boundary**: implementation は HELIX-owned TypeScript/Bun とする。Migration docs と source snapshots は porting audit と regression idea のための reference-only material であり、Current Source Of Truth でも execution route でもない。

## Reference Only（参考のみ）

次の文書は背景・上位チーム運用の参考であり、HELIX の受入条件や実装導線の正本ではない。

- `ai-dev-team-concept_v1.1.md`
- `ai-dev-team-operations_v1.1.md`

## Archived Or Vendor Material（archive / vendor 資料）

旧版、参照 snapshot、個人 legacy source 原稿は正本として使わない。

- 旧版は `../archive/` に置く。
- source reference snapshot と legacy local state は直接編集しない。
- 旧 runtime command は HELIX の実行導線として記述しない。現行導線は `ut-tdd` command とする。

Claude Code が判断に迷った場合は、本 README と repo root の `CLAUDE.md` を優先し、archive / vendor / local runtime state を正本にしない。
