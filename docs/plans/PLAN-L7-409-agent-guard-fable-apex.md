---
plan_id: PLAN-L7-409-agent-guard-fable-apex
title: "PLAN-L7-409 (troubleshoot): agent-guard の fable apex 境界を機械強制 — frontmatter 宣言だけで fable を worker 用途に使える穴を fail-close"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11「サブエージェント関連も頼むわ」— advisor-fable 境界（PLAN-L7-306、.claude/CLAUDE.md Fable advisor 節）が agent-guard で機械強制されていない欠落を、上流 UT-TDD PR#44（fable apex-tier、採用台帳 2026-07-11 §3.2）の概念採取で是正"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "既存 subagent guard の enforcement 欠落修正（guard 判定 1 分岐 + policy const 追加）。allowlist・委譲ブリーフ・model 一致の既存規則と上位 contract は不変。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — fable apex 境界の incident 判定（宣言済み境界の enforcement 欠落）"
  - role: se
    slot_label: "SE — FABLE_APEX_SUBAGENTS policy + guard 分岐 + 決定論 oracle"
  - role: tl
    slot_label: "TL — bypass 監査経路（HELIX_ALLOW_RAW_AGENT one-shot）と既存 guard 規則の非退行レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-409-agent-guard-fable-apex.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - .claude/CLAUDE.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:45:30+09:00"
    tests_green_at: "2026-07-11T03:40:56+09:00"
    verdict: pass
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=pass。Critical/Important なし。分岐位置（family 完全一致 pass 後、missing/unknown/model 未指定は既存規則で先に fail-close）と実 roster 整合（fable frontmatter 宣言は advisor-fable.md のみ、fixture の qa-test:fable はモック内のみで実 frontmatter と混同なし）を実測確認。Minor 1 件: Codex spawn_agent 経路の安全性根拠の文言不正確（同一分岐ではなく、spawn 分岐が model 指定自体を block する既存規則による）→ PLAN §2 文言を是正。既存 agent-guard oracle 全 green（非退行）。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/agent-guard.test.ts tests/agent-guard-brief-substance.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:40:56+09:00"
        evidence_path: tests/agent-guard.test.ts
        output_digest: "sha256:b7c3487fc9a9189512eed217effee8746b382e4ad2c7c5b10a21416304865cd0"
---

# PLAN-L7-409 (troubleshoot): agent-guard の fable apex 境界を機械強制

## 0. defect（実測 2026-07-11）

- 現行 guard は「requested model family = frontmatter 宣言 family の完全一致」のみを検査する
  （`src/runtime/agent-guard.ts` の override 分岐）。そのため **frontmatter に fable を宣言した
  agent は誰でも fable を使えてしまい**、.claude/CLAUDE.md の Fable advisor 節（PLAN-L7-306:
  fable は advisory 専用・呼び出し条件 6 種のみ）がガードとして機械強制されていない。
- 上流 UT-TDD PR#44（commit `1811132b` fix(agent-guard): reserve fable for quality gates、
  採用台帳 §3.2「中〜高」）が同型欠落を fable apex-tier 制約で解決済み。ADR-001 に従い
  概念のみ採取して local guard へ再構成する（上流の rank 順「宣言以上は許可」は採らない —
  local の完全一致規則の方が厳格で、constraint-first 方針に適合）。

## 1. 是正内容

1. `src/runtime/agent-guard-policy.ts`: `FABLE_APEX_SUBAGENTS`（正本 allowlist、現行
   `advisor-fable` のみ）を exported policy const で追加。
2. `src/runtime/agent-guard.ts`: family 完全一致 pass 後に
   `requested === "fable" && !FABLE_APEX_SUBAGENTS.has(subagentType)` を fail-close で block。
   bypass は既存 `HELIX_ALLOW_RAW_AGENT=1`（evidence 必須・audit 前提）に統一。
3. 検証判定（tests/agent-guard.test.ts）: U-AGFA-001（advisor-fable + fable = 許可）/
   U-AGFA-002（fable を frontmatter 宣言した非 apex agent = block、fixture）/
   U-AGFA-003（bypass は allowRaw のみ、WARN message 付き）。
4. .claude/CLAUDE.md の Subagent Guard 規則へ規則 7（fable apex）を同期追記。

## 2. 対象外

- allowlist・委譲ブリーフ marker・model 必須の既存規則（不変、非退行 oracle は既存 test が担保）。
- 上流 FAMILY_RANK（宣言以上許可）の導入（local は完全一致を維持）。
- Codex 側 spawn_agent 経路の同種制約（spawn_agent は model 指定自体を丸ごと block する既存規則
  `src/runtime/agent-guard.ts` の spawn 分岐により fable を含む全 model override が既に禁止されて
  いるため、fable apex 専用分岐の追加は不要。review Minor 所見 2026-07-11 で機構説明を是正）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): test-first（Red）— U-AGFA oracle を tests/agent-guard.test.ts へ追加。
- step 2 (mode: serial): 実装（Green）→ typecheck / Biome / targeted test green。
- step 3 (mode: serial): レビュー（intra_runtime_subagent 以上）→ review_evidence 記録 → confirm。
  L8 test-design への U-AGFA oracle route 追記は pair file の foreign 変更解消後に同期する。

## 4. 受入条件

- U-AGFA-001..003 green + 既存 agent-guard oracle 全 green（非退行）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-409-agent-guard-fable-apex.md` green。
- .claude/CLAUDE.md 規則 7 と `FABLE_APEX_SUBAGENTS` が同期している。
