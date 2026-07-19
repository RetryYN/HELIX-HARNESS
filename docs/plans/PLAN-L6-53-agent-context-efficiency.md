---
plan_id: PLAN-L6-53-agent-context-efficiency
title: "PLAN-L6-53 (add-design): サブエージェント コンテキスト効率の機能設計 — role-scoped read と judgment-core SSoT 統合"
kind: add-design
layer: L6
drive: agent
master_hub: true
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "agent 定義の読み込み指示と判断規律の記載場所を整理する L6 機能設計。判断規律の内容・gate 意味・L1/L3 要求は変更しない。judgment-core 改訂は version up 手続きに従う。"
owner: Claude (Fable)
parent_design: docs/skills/judgment-core.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（role-scoped read 規則 / lint oracle 定義）"
  - role: tl
    slot_label: "TL - judgment-core version up と coverage gate 整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-53-agent-context-efficiency.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/agent-context-efficiency.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/skills/judgment-core.md
  references:
    - docs/plans/PLAN-L7-335-judgment-core.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T00:20:00+09:00"
    tests_green_at: "2026-07-07T00:20:00+09:00"
    verdict: approve
    scope: "L6 agent context efficiency 設計と L7 文字列 lint oracle の対応を確認。judgment-core の規範内容は変えず、読み込み範囲と記載場所だけを整理する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/agent-context-efficiency.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T00:20:00+09:00"
        evidence_path: tests/agent-context-efficiency.test.ts
        output_digest: "sha256:3e396f54170e06a43c992892360f75122b8e8eb6e5848060e1d7746937593fd3"
---

# PLAN-L6-53 (design): サブエージェント コンテキスト効率の機能設計

## 0. 目的

委譲 1 回あたり 500 行超（概算 15–20K tokens）の固定 Read 指示と、code-reviewer の
5 軸ベタ書き（SSoT 逸脱）を 2026-07-06 検査で確認した。変更（L7）前に、role-scoped read の
置換規則・SSoT 統合手続き・regression fence の oracle を L6 機能設計として確定する。

設計正本: `docs/design/harness/L6-function-design/agent-context-efficiency.md`
（規則: role 別必要節の限定 Read / judgment-core v1→v2 version up + 全 marker 追随。
oracle: U-CTX-001..004）。

## 1. 受入条件

- L6 設計 doc が §1 範囲 / §2 設計規則 / §3 runtime 挙動 / §4 test oracle を備え、
  oracle ID（U-CTX-001..004）が PLAN-L7-345 のテストと 1:1 対応する。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-53-agent-context-efficiency.md` green。
- 実装は本 PLAN では行わない（変更・検証は PLAN-L7-345 が担う）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc 起草 → レビュー → confirm。
- step 2 (mode: serial): PLAN-L7-345 の実装解禁（design confirm 後）。
