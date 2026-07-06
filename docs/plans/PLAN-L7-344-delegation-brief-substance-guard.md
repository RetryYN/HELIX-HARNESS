---
plan_id: PLAN-L7-344-delegation-brief-substance-guard
title: "PLAN-L7-344 (impl): 委譲ブリーフ実質検査 — 4 marker の空疎ブリーフに advisory warn を出し、allowlist の Codex 専任境界を明文化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-337 で確定した委譲ブリーフ 4 marker 強制の advisory 拡張（fail-close 挙動は不変）とコメントによる設計意図の明文化のみ。gate 意味・L1/L3 要求の変更なし。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/delegation-brief-substance.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - thin-brief advisory と allowlist コメント明文化の実装"
  - role: tl
    slot_label: "TL - guard の fail-close 不変性と誤検知境界のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-344-delegation-brief-substance-guard.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: tests/agent-guard-brief-substance.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - src/runtime/agent-guard-policy.ts
    - src/runtime/agent-guard.ts
  references:
    - docs/plans/PLAN-L6-52-delegation-brief-substance.md
    - docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
    - docs/skills/judgment-core.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T23:59:00+09:00"
    tests_green_at: "2026-07-06T23:59:00+09:00"
    verdict: approve
    scope: "doctor merged-plan-status が draft の既存 generated deliverable 列挙を fail-close したため、PLAN を archive せず confirmed に正規化した。thin-brief advisory 実装は本 PLAN の受入条件に従って後続 slice で実施する。"
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

# PLAN-L7-344 (impl): 委譲ブリーフ実質検査（thin-brief advisory）

## 0. 目的

PLAN-L7-337 の委譲ブリーフ 4 marker 強制（`【目的】【出力形式】【ツール方針】【境界】`）は
**marker 文字列の存在**しか検査しない（2026-07-06 検査: `src/runtime/agent-guard.ts` の
`missingBriefMarkers` は `text.includes(label)` のみで、marker 直後が空でも合格する）。
下位モデル（Sonnet worker 等）への委譲で内容の薄いブリーフが素通りすると、
指示不足による浅い実行・手戻り・重複作業が発生し、judgment-core §5 が期待する委譲粒度を
機械強制できない。本 PLAN は **advisory warn（block しない）** で実質粒度を底上げする。

あわせて、`SUBAGENT_ALLOWLIST`（`src/runtime/agent-guard-policy.ts`）に `be-api` / `be-logic` /
`db-schema` / `devops-deploy` が**意図的に**含まれない（be-* は Codex 委譲組、
`.claude/CLAUDE.md` の FE ロスター節参照）ことがコード上に記録されておらず、
将来の誤 allowlist 追加リスクがあるため、設計意図をコメントで明文化する。

## 1. スコープ（Sonnet 実装手順）

### Step 1: thin-brief 検出関数

1. `src/runtime/agent-guard-policy.ts` に閾値を追加:
   `export const BRIEF_MARKER_MIN_SUBSTANCE_CHARS = 20;`
2. `src/runtime/agent-guard.ts` の `missingBriefMarkers` に隣接して純関数を追加:
   ```ts
   export function thinBriefMarkers(text: string): string[]
   ```
   仕様:
   - `DELEGATION_BRIEF_MARKERS` の各 marker について、いずれかのラベル出現位置から
     「次に出現する任意の marker ラベル位置（無ければ文末）」までの区間を取り、
     空白・改行を除いた実質文字数が `BRIEF_MARKER_MIN_SUBSTANCE_CHARS` 未満なら
     その marker の key（例 `"objective"`）を返す。
   - marker が存在しない場合は対象外（existence 検査は既存 `missingBriefMarkers` の責務。
     二重報告しない）。
   - 英語・日本語ラベル両対応（既存 `DELEGATION_BRIEF_MARKERS.labels` を再利用）。

### Step 2: evaluateAgentGuard への advisory 組み込み

1. `evaluateAgentGuard` で、既存の marker 欠落 block 判定を**変更せず**、全 marker が存在し
   block されないケースに限り `thinBriefMarkers` を評価し、非空なら
   `decision.message` に `thin-brief warning: <keys> の内容が薄い（20文字未満）。委譲粒度を確認`
   を追記する。**decision の allow/deny は一切変えない（fail-close 挙動不変）**。
2. `.claude/hooks/agent-guard.ts` 側は `decision.message` をそのまま表示する既存経路を使う
   （hook 側の変更が必要かは `grep -n message .claude/hooks/agent-guard.ts` で確認し、
   既に message を透過するなら変更しない）。

### Step 3: allowlist 意図の明文化（コード変更なし）

1. `src/runtime/agent-guard-policy.ts` の `SUBAGENT_ALLOWLIST` 直前コメントに追記:
   「be-api / be-logic / db-schema / devops-deploy は意図的に対象外（Codex delegation-only、
   `helix codex --role` 経由。`.claude/CLAUDE.md` FE ロスター節の be-*=Codex 委譲組の定めに従う）。
   allowlist へ追加する場合は同節の改訂と PLAN を伴うこと」。

### Step 4: テスト（tests/agent-guard-brief-substance.test.ts）

- `U-BRIEF-001: 【目的】の直後が空文字に近い（<20 文字）prompt で thinBriefMarkers が objective を返す`
- `U-BRIEF-002: 全 marker に十分な本文がある prompt で空配列`
- `U-BRIEF-003: marker 自体が欠落している場合 thinBriefMarkers は当該 key を返さない（missing 側の責務）`
- `U-BRIEF-004: thin-brief があっても evaluateAgentGuard の allow/deny 判定は不変（advisory のみ）`
- `U-BRIEF-005: 英語ラベル（【objective】等）でも同様に判定`

## 2. 対象外

- thin-brief の fail-close 化（誤検知の運用実績を見てから別 PLAN で判断）。
- ブリーフ内容の意味的品質判定（LLM 評価）。
- allowlist 自体の増減。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1（検出関数）→ Step 2（advisory 組み込み）。
- step 2 (mode: parallel): Step 3（コメント明文化）と Step 4（テスト）— Step 1/2 完了後、並列可。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run vitest run tests/agent-guard-brief-substance.test.ts` green（U-BRIEF-001..005）。
- 既存 guard テスト green: `bun run vitest run tests/agent-guard.test.ts`
  （ファイル名が異なる場合 `grep -rl evaluateAgentGuard tests/` で特定して実行）。
- `bun run typecheck` green。
- `bun run src/cli.ts doctor` に本 PLAN 起因の新規 fail なし。

## 5. carry（持ち越し）

- thin-brief warn の発生率 telemetry 化（feedback_events への記録）と fail-close 昇格判断。
