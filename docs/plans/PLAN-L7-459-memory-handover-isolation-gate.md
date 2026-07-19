---
plan_id: PLAN-L7-459-memory-handover-isolation-gate
title: "PLAN-L7-459 (troubleshoot): harness memory 引き継ぎコミット孤立の doctor 検出ゲート"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
review_evidence:
  - reviewer: code-reviewer subagent (独立 5 軸レビュー、初回 FAIL→是正→再レビュー PASS)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-19T22:45:00+09:00"
    tests_green_at: "2026-07-19T22:38:07+09:00"
    verdict: pass
    worker_model: claude-sonnet-5
    notes: "PO 指示 (2026-07-19、Codex 遅延時の安全 merge) による単一 runtime 代替証跡。初回指摘 (全ブランチ走査の等価コミット巻き込み / detached HEAD 漏れ / remote 未設定誤検知 / 統合テスト欠如) を patch-id 等価除外・HEAD 包含・noRemote fail-close・実 git fixture 統合テスト 4 件で是正。レビュア独立再実行で vitest 10/10・typecheck・実 repo isolated=0 green を確認。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/memory-handover-isolation.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-19T22:38:07+09:00"
        evidence_path: tests/memory-handover-isolation.test.ts
        output_digest: "sha256:2e82093c871d42b48f2d66e8690cf34741370daff837d4c2a60a36a6a21851d8"
entry_signals: ["po_directive: 2026-07-19 メモリ/GitHub 運用の優先実装指示 (issue #44。merge 済み branch 上に chore(memory) 含む未 push 18 コミットが孤立し引き継ぎ不達、PR #43 で収束した実インシデントの再発防止)"]
created: 2026-07-19
github_issue_id: 44
updated: 2026-07-19
backprop_decision: not_required
backprop_decision_reason: "既存 L6 memory cross-runtime surface の『引き継ぎ基準点 = commit/push 済み HEAD』運用契約を doctor 検査として機械化するのみで、memory 構造・surface 契約の意味変更を伴わない運用是正である。"
owner: AIM (Claude)
parent_design: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: aim
    slot_label: "AIM — 検出条件 (remote 到達判定・閾値・fail-close) の独立監査"
  - role: se
    slot_label: "SE — lint module + doctor 配線の実装"
  - role: qa
    slot_label: "QA — 孤立 fixture / clean / git 不能時の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-459-memory-handover-isolation-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/memory-handover-isolation.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/memory-handover-isolation.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-459: harness memory 引き継ぎコミット孤立の doctor 検出ゲート

## 0. 背景

2026-07-19、merge 済み branch `codex/v050-requirements-collision` 上に `chore(memory)` を含む
未 push 18 コミットが孤立し、harness memory の引き継ぎ（`.helix/memory/harness.jsonl` 更新）が
相手ランタイム（Codex）へ届かない実インシデントが発生した（GitHub issue #44、収束 PR #43）。
CLAUDE.md の hybrid 協調規則は「引き継ぎと検証の基準点 = commit/push 済みの HEAD ただ一つ」と
定めるが、未 push 孤立を検出する機械ゲートが無く prose 運用頼みだった。

## 1. 実装範囲

- `src/lint/memory-handover-isolation.ts` を新設する。全 local branch + HEAD（detached 含む）
  起点で remote 未到達の `.helix/memory/` 変更コミットを列挙し、コミット時刻が閾値（既定 24h）を
  超えたものを violation とする。閾値内は warn 相当のカウントとして surface する。
  実インシデントが非 checkout branch 上で起きたため HEAD 限定にはしない。無関係 branch の
  巻き込み（rebase/cherry-pick 済み等価コミット）は remote 側 memory 変更コミットとの
  patch-id 突合で除外する。
- git 情報が取得できない場合・remote が未設定の場合は fail-close（violation として明示）とし、
  silent skip しない。
- `src/doctor/index.ts` へ `memory-handover-isolation` check として配線し、doctor の ok 判定と
  message 出力に含める。

## 2. 受入条件

- [ ] 孤立コミット fixture（閾値超過）で violation、閾値内で stale count 表示、remote 到達済みで OK。
- [ ] 実 git repo fixture の統合テストで、非 checkout branch の孤立検出・push 後の解消・
      rebase/cherry-pick 済み patch-id 等価の除外・detached HEAD の検出・remote 未設定の
      fail-close を検証する。
- [ ] git 実行不能を模した入力で fail-close violation を返す。
- [ ] `bunx vitest run tests/memory-handover-isolation.test.ts`、typecheck、Biome を green にする。
- [ ] 実 repo で `helix doctor` の `memory-handover-isolation` 行が **green（等価除外後の
      真の孤立 0）** で出力される（gate 新設と同時に doctor 全体を赤くしない）。

## 3. 範囲外

- GitHub 自律運用要件（L3 proposed）本体の実装（PR 放置検出・auto-merge 監視等は L3 承認後）。
- memory v2 構造・surface 契約の変更。push の自動実行（検出のみ。是正はランタイム/PO 判断）。

## 4. Vペア

- L6: `memory-cross-runtime-surface.md` MEMX-S6。
- L8: `U-MEMX-006`（`tests/memory-handover-isolation.test.ts`）。
