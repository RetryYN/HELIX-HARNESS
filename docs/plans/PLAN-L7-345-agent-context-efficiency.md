---
plan_id: PLAN-L7-345-agent-context-efficiency
title: "PLAN-L7-345 (impl): サブエージェント コンテキスト効率 — 全文 Read 指示の role-scoped 化と code-reviewer 5 軸の SSoT 圧縮"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "agent frontmatter の指示文と judgment-core の記載場所を整理するのみで、gate 意味・判断規律の内容・L1/L3 要求は変更しない。judgment-core への 5 軸統合は version up 手続きに従う。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/agent-context-efficiency.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - agent 定義の read 指示置換と judgment-core 統合"
  - role: tl
    slot_label: "TL - judgment-core version up と judgment-core-coverage gate 整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-345-agent-context-efficiency.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/judgment-core.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/code-reviewer.md
    artifact_type: markdown_doc
  - artifact_path: tests/agent-context-efficiency.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/skills/judgment-core.md
  references:
    - docs/plans/PLAN-L6-53-agent-context-efficiency.md
    - docs/plans/PLAN-L7-335-judgment-core.md
    - docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T23:59:00+09:00"
    tests_green_at: "2026-07-06T23:59:00+09:00"
    verdict: approve
    scope: "doctor merged-plan-status が draft の既存 generated deliverable 列挙を fail-close したため、PLAN を archive せず confirmed に正規化した。agent context 効率化実装は本 PLAN の受入条件に従って後続 slice で実施する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-06T23:59:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:5e3992a3efde53826f9f417bcd54e78fb45b4eb1012abb973bc01eb427ea14ba"
---

# PLAN-L7-345 (impl): サブエージェント コンテキスト効率

## 0. 目的

2026-07-06 検査で、サブエージェント委譲 1 回あたりのコンテキスト消費に以下の恒常的な無駄を確認した。

- **C1: 全文 Read 指示 ×9 agent** — `.claude/agents/` の 9 ファイル（be-logic / be-api / db-schema /
  code-reviewer / security-audit / fe-ui / devops-deploy / fe-lead / qa-test）が「作業前に必ず
  `CLAUDE.md` + `.claude/CLAUDE.md` + `docs/governance/README.md` を Read」と指示している。
  CLAUDE.md 263 行 + .claude/CLAUDE.md 239 行 + README で、委譲のたびに 500 行超
  （概算 15–20K tokens）を読む。小粒度タスク（qa-test の単純確認等）では大半が無関係。
- **C2: code-reviewer の 5 軸ベタ書き** — `.claude/agents/code-reviewer.md`（145 行）が
  5 軸 ×4 項目の固定チェックリストを毎回フル展開している。判断規律の正本は
  `docs/skills/judgment-core.md` であり（同ファイル 30–36 行で SSoT 参照パターン確立済み）、
  5 軸詳細だけが SSoT 外にベタ書きされている。他 20 agent は参照 1 行で済ませており、
  code-reviewer だけが逸脱。

サブエージェントの読み込みを role に必要な章へ絞ることで、下位モデル worker の実効
コンテキスト（タスク本体に使える窓）を広げ、実行品質とトークン効率を同時に上げる。

## 1. スコープ（Sonnet 実装手順）

### Step 1: role-scoped read 指示への置換 (C1)

1. 対象 9 ファイルを確認: `grep -l "作業前に必ず" .claude/agents/*.md`（文言が異なる場合は
   `grep -l "CLAUDE.md" .claude/agents/*.md` で全文 Read 指示を持つ agent を特定）。
2. 各 agent の「必ず Read」指示を、role 別に必要な章だけへ絞った指示に置換する。置換規則:
   - 全 role 共通で必須: `CLAUDE.md` の「実装規則」「Git Rules」節、`.claude/CLAUDE.md` の
     「Guard 規則」節（節見出しを明示し「該当節のみ読む」と指示。全文 Read を指示しない）。
   - se/be/fe 系（be-logic, be-api, db-schema, fe-ui, fe-lead, devops-deploy）: 上記 + 「構成境界」節。
   - review 系（code-reviewer, security-audit, qa-test）: 上記 + `docs/skills/judgment-core.md` §4/§5
     （既に参照している場合は重複させない）。
   - `docs/governance/README.md` の全文 Read 指示は全 agent から削除（governance 詳細が必要な
     タスクではオーケストレータ（lead）が委譲ブリーフの【ツール方針】で対象 doc を明示する運用へ寄せる）。
3. 節見出しはこの PLAN 実装時点の実文言を使い、置換後に
   `grep -n "^## " CLAUDE.md .claude/CLAUDE.md` で全指定節が実在することを確認する。

### Step 2: code-reviewer 5 軸の SSoT 統合 (C2)

1. `docs/skills/judgment-core.md` に §「コードレビュー 5 軸」を追加し、
   `.claude/agents/code-reviewer.md` の 5 軸 ×4 項目チェックリスト（現 38–68 行付近）を移す。
   judgment-core は versioned SSoT のため、**version を 1 つ上げ（v1 → v2）、全 marker 追随**の
   改訂手続きに従う（[[judgment-core-ssot]]、`judgment-core-coverage` gate が fail-close）。
   version 表記・参照 marker の更新対象は `grep -rn "judgment-core" .claude/agents/ src/ docs/skills/SKILL_MAP.md`
   で洗い出し、漏れなく追随させる。
2. `.claude/agents/code-reviewer.md` の該当チェックリストを「judgment-core §<新節番号> の 5 軸を
   適用する」の参照 1–2 行へ圧縮する（sdd-review skill 等が同一チェックリストを持つ場合は
   同様に参照へ置換するが、skill 側の変更が judgment-core-coverage gate に触れる場合は
   本 PLAN では code-reviewer.md のみとし、skill 側は carry に残す）。

### Step 3: 回帰フェンス（tests/agent-context-efficiency.test.ts）

- `U-CTX-001: .claude/agents/*.md に「docs/governance/README.md を必ず Read」指示が残っていない`
- `U-CTX-002: 全文 Read 指示（CLAUDE.md 全体を読む指示）を持つ agent が 0 件`
  （検査は「必ず Read」「作業前に必ず」等の指示文言と対象パスの組で判定する文字列 lint。
  節限定 Read 指示は許可）
- `U-CTX-003: code-reviewer.md が judgment-core の 5 軸節を参照し、5 軸チェックリストの
  ベタ書き（軸見出し 5 つ全て）を含まない`
- `U-CTX-004: judgment-core.md の version 表記と全参照 marker の version が一致する`
  （既存 judgment-core-coverage gate がこれを検査するなら重複実装せず、gate 実行を green 条件に使う）

## 2. 対象外

- CLAUDE.md / .claude/CLAUDE.md 本文の削減・再構成（別 PLAN。本 PLAN は読む側の指示のみ変更）。
- SessionStart feedback surface の出力削減（検査の結果、`selectTakeoverFeedback` は既に
  limit + 集約済みで良好と判定。追加変更しない）。
- `helix claude --role` の contextInjection 自動抽出（設計が要るため carry）。

## 3. スケジュール（schedule steps）

- step 1 (mode: parallel): Step 1（9 agent の read 指示置換）と Step 2（judgment-core 統合）—
  触るファイルが重複しない範囲で並列可（code-reviewer.md は Step 2 に寄せる）。
- step 2 (mode: serial): Step 3（回帰フェンス）と統合検証。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run vitest run tests/agent-context-efficiency.test.ts` green（U-CTX-001..004）。
- judgment-core-coverage gate green: `bun run src/cli.ts doctor`（gate 名は doctor 出力で確認）。
- `bun run typecheck` green（テスト追加分）。
- 委譲 1 回あたりの必読行数が置換前 500 行超 → 置換後は指定節のみ（概算 100 行以下）に減る。
  この数値は目安であり、機械検証は U-CTX-001/002 の指示文言 lint で行う。

## 5. carry（持ち越し）

- `helix claude --role <role>` 委譲時に必要章を contextInjection で事前抽出して渡す自動化。
- CLAUDE.md 本文のスリム化（節構成の再設計を伴うため別 PLAN）。
- sdd-review 等 skill 側チェックリストの SSoT 参照化（judgment-core-coverage gate 影響の確認後）。
