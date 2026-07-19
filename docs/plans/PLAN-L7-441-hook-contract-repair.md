---
plan_id: PLAN-L7-441-hook-contract-repair
title: "PLAN-L7-441 (troubleshoot): hook 契約修復 — helix hook work-guard 提供と matcher 三面一致 (PLAN-L7-433 C1/C2 実装スライス)"
kind: troubleshoot
layer: L7
drive: agent
status: completed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「修正対応は？」— PLAN-L7-433 (品質改善第4巡) の確定所見のうち最優先 C1 (配布 hook 契約バグ) と C2 (agent-guard matcher 三面不一致) を実装スライスとして修復"
created: 2026-07-12
updated: 2026-07-12
owner: Claude
agent_slots:
  - { role: aim, slot_label: "AIM — troubleshoot 分類の妥当性と C1 是正方向 (subcommand 実装 vs template 是正) の判定 (Claude)" }
  - { role: se, slot_label: "SE — 共有 runner 抽出と CLI subcommand / matcher 整合の実装 (Claude)" }
  - { role: qa, slot_label: "QA — cross-runtime 独立レビュー (Codex gpt-5.6-sol)" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-12T15:17:56Z"
  review_binding:
    reviewer: codex-qa-independent
    reviewed_at: "2026-07-12T15:17:56Z"
    evidence_digest: "sha256:b000300ca54798a45341a22d9a42481421df0852d6380ffa2e0b7d3f71de806c"
  entries: []
review_evidence:
  - reviewer: codex-qa-independent
    review_kind: cross_agent
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6-sol
    reviewed_at: "2026-07-12T15:17:56Z"
    tests_green_at: "2026-07-12T15:16:52Z"
    verdict: pass
    scope: "helix codex --role qa 委譲で反対 runtime (Codex/gpt-5.6-sol) が diff 全量を独立レビュー。Verdict: Pass、Blocker 0 / High 0。共有 runner の単一実装化、契約テストの検出力 (空集合防止含む)、matcher 三面一致、退行リスク低を確認。残余リスク (CLI 経路の marker one-shot 直接検査なし) は dev-hook 側テストで担保済みと判定。初回レビュー原本 = Codex session rollout-2026-07-13T00-06-22-019f56dd、最終確認 (PLAN ID 修正と設計 doc 撤去後の再判定 Pass) = rollout-2026-07-13T00-17-20-019f56e7。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/hook-contract.test.ts tests/project-hook.test.ts tests/digest.test.ts --reporter=dot", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T15:16:52Z", evidence_path: tests/hook-contract.test.ts, output_digest: "sha256:c87e484b5d9daf254dbeb30bee32b9304f7ab86ef0c83ddf297630fc213e457d" }
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/hook-contract.test.ts
backprop_decision: not_required
backprop_decision_reason: "setup-solo-team.md が既に宣言している adapter 配布契約 (work-guard を配る) への実装追随と、policy 正本 AGENT_TOOL_NAMES への settings/lint の追随であり、要求・設計の意味変更はない。差分内容は本 PLAN 本文に記録した。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-441-hook-contract-repair.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/work-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/hook-contract.test.ts, artifact_type: test_code }
dependencies: { parent: null, requires: [] }
---

# PLAN-L7-441: hook 契約修復

PLAN-L7-433（品質改善第 4 巡）の確定所見 C1/C2 の実装スライス。親設計 =
`docs/design/harness/L6-function-design/setup-solo-team.md`（adapter template が
`agent-guard` / `work-guard` / `git-command-guard` を配る契約）。本 PLAN はその契約の
実装欠落を塞ぐ差分であり、oracle（U-HKC-001〜003）は `tests/hook-contract.test.ts` に定義する。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| U-HKC-001 | template↔CLI 契約 | template 宣言の hook command が CLI に無ければ fail（宣言 0 件の空回りも fail） |
| U-HKC-002 | work-guard CLI 実挙動 | foreign uncommitted → exit 2 block / clean → exit 0 pass |
| U-HKC-003 | matcher 三面一致 | settings / policy / template の matcher 集合が不一致なら fail |

## 実施内容

1. **C1**: `src/runtime/work-guard-hook.ts` に work-guard hook の実行本体
   `runWorkGuardHook()` を単一実装として抽出し、dev repo hook
   （`.claude/hooks/work-guard.ts`、約 120 行 → 薄い wrapper 化）と新設の
   `helix hook work-guard` subcommand（`src/cli.ts` hook group）の両方から呼ぶ。
   これで setup template が配布する hook 契約が実体を持つ。
2. **C1 再発防止**: `tests/hook-contract.test.ts` U-HKC-001 が template 宣言の全
   `helix hook <name>` と CLI subcommand を突合し、宣言だけの hook を fail-close 検出。
   U-HKC-002 が temp git repo で block/pass の実挙動を検証。
3. **C2**: `.claude/settings.json` の agent-guard matcher を `"Agent|Task"` へ揃え、
   `src/lint/project-hook.ts` の `REQUIRED` も同期。U-HKC-003 が settings / policy
   （`AGENT_TOOL_NAMES`）/ consumer template の三面一致を固定。
4. 付随: `src/cli.ts` への挿入で digest hit の行番号が移動したため
   `config/digest-canonicalization-inventory.json` を production AST scan から再生成
   （差分は行番号のみ、`tests/digest.test.ts` 7 green）。

## Schedule

- step 1 (serial): C1/C2 実装 + U-HKC-001〜003（完了）。

## 完了条件（DoD）

- `bunx vitest run tests/hook-contract.test.ts tests/project-hook.test.ts tests/digest.test.ts` green
  （digest 付き green_command として記録済み）。
- cross-runtime review（Codex gpt-5.6-sol）で Blocker/High 0（記録済み）。
- PLAN-L7-433 の残所見（Q1〜Q8 / C3 / annex 未検証分）は本 PLAN の scope 外として
  PLAN-L7-433 側に残る。
