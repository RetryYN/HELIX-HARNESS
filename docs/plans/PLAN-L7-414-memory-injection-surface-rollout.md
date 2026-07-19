---
plan_id: PLAN-L7-414-memory-injection-surface-rollout
title: "PLAN-L7-414 (impl): memory recall 注入を team run / task route 呼出面へ段階解禁 — L6-64 §4 の designed follow-up"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11「フォローアップよろしく」— L6-64 §4 が follow-up として宣言した team_run / task_route 呼出面への memory recall 注入解禁を実施（delegation 面は PLAN-L7-406 で稼働済み・実 repo E2E 実測済み）"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "L6-64 設計 §4 が『本 slice では未注入（follow-up）』と宣言済みの段階導入を、同設計の宣言どおり次段階へ進めるもの。注入経路・budget・秘匿境界の contract は L6-64 のまま不変で、surface policy の有効集合だけを広げる。設計 doc §4 の表と MEMX-S5 は本 PLAN で同期更新する。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — MEMORY_ENABLED_SURFACES の全面解禁 + 設計 §4 / MEMX-S5 同期 + oracle 改訂"
  - role: tl
    slot_label: "TL — 呼出面ごとの budget 妥当性（team run fan-out での token 影響）と非退行レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-414-memory-injection-surface-rollout.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
    artifact_type: design_doc
  - artifact_path: src/runtime/memory-injection.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
  requires:
    - docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
    - docs/plans/PLAN-L7-406-memory-delegation-injection.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T04:46:00+09:00"
    tests_green_at: "2026-07-11T04:44:31+09:00"
    verdict: approve_after_fixes
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=approve_after_fixes。Critical なし。Important 1 件を是正済み: L8 単体テスト設計の memory delegation recall 行が旧仕様（team_run / task_route 非注入）のまま残り L6→L8→L7 が 3 者不整合 → L8 該当行を解禁後仕様へ追随（Codex の foreign 変更行とは非衝突の行単位で更新し hunk 単位 stage で分離）。Minor 1 件（§4 表セルの可読性）は現状維持を選択。レビューで確認済み: team_run 側は resolveSkillContextInjection を 1 回だけ呼び buildTeamRunPlan が同一 contextInjection を member 群へ共有するため、memory 読み出しは member 数ぶん複製されず fan-out 増分は固定 cap で有界（PLAN §2 の主張と実装一致）。新呼出面の fail-close 既定・秘匿境界（L6-64 §5）の非退行も確認。是正後 U-MEMX-001..005 を含む 24/24 再 green + team run dry-run E2E で member prompt への MEMORY_RECALL_HEADER 実注入を実測。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/runtime-adapter.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T04:44:31+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:d0db0037433685f613a0e1eaa71de62248b0fa13e4cabba5076ceda601dc3baf"
---

# PLAN-L7-414 (impl): memory recall 注入の team run / task route 解禁

## 1. 背景と根拠

- L6-64 §4 は blast radius 制御のため memory recall 注入を `delegation` 面のみで開始し、
  `team_run` / `task_route` は「本 slice では未注入（follow-up）」と宣言した（PLAN-L7-406 で
  U-MEMX-005 が fail-close に固定）。
- delegation 面は 2026-07-11 に稼働開始し、実 repo E2E（`helix claude --role tl` の plan JSON
  stdin に MEMORY_RECALL_HEADER + 実 memory 6 件 + footer）を実測済み。呼出面の配線は
  両面とも既に contextInjection を adapter prompt 合成（formatAdapterPrompt）へ渡しており、
  memoryLines も同一 resolver（`resolveSkillContextInjection`）で解決済み — 落としているのは
  surface policy だけである。
- PO 指示「フォローアップよろしく」（2026-07-11）により、設計宣言どおり次段階へ進める。

## 2. 変更内容

1. `src/runtime/memory-injection.ts`: `MEMORY_ENABLED_SURFACES` に `team_run` / `task_route` を
   追加（全面解禁）。policy 機構自体は将来の新呼出面の fail-close 既定として残す。
2. budget: 両面とも `DELEGATION_MEMORY_BUDGET`（6 件 / 200 chars、L6-64 §4）を継承する。
   team run は member fan-out で注入が member 数ぶん複製されるが、上限 6 行 × 200 chars の
   固定 cap のため member あたりの増分は有界（TL レビュー観点）。
3. 設計同期: `memory-cross-runtime-surface.md` §4 の表（未注入 → 注入・budget 明記）と
   MEMX-S5（段階導入の fail-close → 全呼出面注入の保証へ改訂）を同 PLAN で更新。
4. oracle 改訂（tests/runtime-adapter.test.ts）: U-MEMX-005 を「`team_run` / `task_route` でも
   memory recall が注入され、skill 0 件 + memory のみでも section が生成される」へ改訂
   （MEMX-S5 改訂の 1:1 降下）。

## 3. 対象外

- SessionStart（chat）面の budget / 挙動（PLAN-L6-62 系、Codex 管掌）。
- orchestration pair-agent 面（`MemoryInjectionSurface` 型に存在しない別経路。必要になれば
  新 surface として追加し、その際は policy 既定 = 非注入から始める）。
- memory 本文の選定・lifecycle（L6-62 / L6-63 系）。

## 4. スケジュール（schedule steps）

- step 1 (mode: serial): oracle 改訂（Red）— U-MEMX-005 を解禁後仕様へ書き換え。
- step 2 (mode: serial): 実装（Green）— MEMORY_ENABLED_SURFACES 解禁 + 設計 §4 / MEMX-S5 同期
  → typecheck / Biome / 対象test green。
- step 3 (mode: serial): レビュー（intra_runtime_subagent 以上）→ review_evidence 記録 → confirm。
  L8 の U-MEMX 行の文言更新は pair file の foreign 変更解消後に同期する。

## 5. 受入条件

- 改訂後 U-MEMX-001..005 green（既存 delegation 面の非退行を含む）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-414-memory-injection-surface-rollout.md` green。
- 設計 doc §4 / MEMX-S5 と `MEMORY_ENABLED_SURFACES` が同期している。
