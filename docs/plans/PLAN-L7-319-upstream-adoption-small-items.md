---
plan_id: PLAN-L7-319-upstream-adoption-small-items
title: "PLAN-L7-319 (impl): 上流突合 小項目 roundup — team prompt provider routing / update-check / provisional lint 確認 / Agent-Task matcher portability"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 小さく独立した採用項目 (provider 1行 / update-check advisory / matcher portability) を各々最小 diff で実装"
  - role: tl
    slot_label: "TL — provisional lint (github-ci-policy/personal-path/toolchain-pin) の LOCAL 等価物確認 grep・配布 surface に触れる項目の escalation 判断"
generates:
  - artifact_path: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
    artifact_type: markdown_doc
  - artifact_path: tests/team-run-prompt.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
---

# PLAN-L7-319 (impl): 上流突合 小項目 roundup

## Objective

上流突合 audit の Tier2/Tier3 の小さく独立した項目を集約起票する。各項目は最小 diff・低リスクだが、
coherent task boundary を保つため実装時は本 PLAN 配下で 1 項目ずつ着地させる（一括 import しない）。

## スコープ

### IN（各項目・確認 → 実装）
- **team prompt provider routing（trivial・確認済）**: `src/team/run.ts buildMemberPrompt()` に `provider: ${selection.provider}` の 1 行を追加（data は `TeamModelSelection.provider` に既存）。
- **setup/update-check（advisory）**: harness 自身のバージョン鮮度を 24h キャッシュで advisory 通知（gate ではない）。配布 surface に触れるため軽 escalation で TL 確認。
- **provisional lint 確認**: `github-ci-policy` / `personal-path` / `toolchain-pin` の LOCAL 等価物を確認 grep し、真に欠落なら低 blast-radius で追加、既存なら skip。
- **Agent/Task matcher portability**: consumer 標準 Claude Code が emit する `"Task"` を guard が拾えるよう `AGENT_TOOL_NAME` を拡張（本 dogfood repo の `"Agent"` 運用は不変）。

### OUT
- 各項目を一括 import しない（1 項目ずつ boundary を切って着地）。
- 配布 surface の実切替（PLAN-M-02 の承認対象）には踏み込まない。

## 受入条件
- 着手した各項目が最小 diff で回帰なし、provisional lint は確認結果（追加/skip）を evidence 化。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地）。
- Step 1: team prompt provider 1 行（最小・先行可）。
- Step 2: provisional lint の LOCAL 等価物確認 grep → 判断。
- Step 3: update-check advisory（配布 surface 触りのため TL escalation 確認）。
- Step 4: `Agent` / `Task` matcher の portability を確認・実装。
- Step 5: 各項目 review → confirmed。

## 壊さない / 再発させない
- 一括 import 禁止（粒度を合わせ 1 項目ずつ）。
- 配布 surface の実切替は PLAN-M-02 承認前に行わない。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2/Tier3。
