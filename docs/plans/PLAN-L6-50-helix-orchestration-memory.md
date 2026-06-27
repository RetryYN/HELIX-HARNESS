---
plan_id: PLAN-L6-50-helix-orchestration-memory
title: "PLAN-L6-50 (add-design): P2 orchestration + P7 memory 機能設計 (Add-feature route B)"
kind: add-design
layer: L6
drive: agent
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
agent_slots:
  - role: aim
    slot_label: "AIM — 影響範囲特定・機能設計・監視"
  - role: tl
    slot_label: "TL — 設計判断・V-model 統合レビュー (frontier-reviewer class)"
generates:
  - artifact_path: docs/plans/PLAN-L6-50-helix-orchestration-memory.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/orchestration-memory.md
    artifact_type: test_design
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
supersedes:
  - PLAN-L4-50-orchestration-memory-hybrid
dependencies:
  parent: PLAN-L0-01-helix-charter
  requires:
    - PLAN-L0-01-helix-charter
  blocks: []
  references:
    - docs/process/modes/add-feature.md
    - docs/governance/coding-rules.md
    - docs/governance/ddd-tdd-rules.md
    - src/team/run.ts
    - src/runtime/adapter.ts
    - src/state-db/projection-writer.ts
    - src/schema/harness-db-tables-core.ts
---

# PLAN-L6-50 (add-design): P2 orchestration + P7 memory 機能設計

## §0 役割 / mode

HELIX を Claude+Codex マルチエージェント・オーケストレーション前提へ寄せる **Add-feature mode（`docs/process/modes/add-feature.md`、route B = bottom-up）**。誤って `kind=design` master_hub で起票した PLAN-L4-50 を本 `kind=add-design` PLAN で **supersede**（正しいフィーチャーワークフロー設定）。

**route B 連鎖**: add-design(L6 機能設計, 本 PLAN) → add-impl(L7) → **Reverse(R0-R4, fullback, forward_routing=L3) で L3 要件(BR-07/BR-12/NFR-03) を back-fill → G3 ①⇔③ 凍結**。要件後追いは Add-feature の常態（IMP-043: 先行 build 許容、trace 確定は pair-freeze 後）。原則: 仕組み=harness 上 / 個別機能=旧 HELIX 上（機能は仕組みを超えない）、ADR-001 TS/Bun、P8 外部バイナリ不採用。

## §1 影響範囲特定（既存 L1-L14 doc/コードのどこに効くか）

- 新規: `src/orchestration/`（loop-runner/loop-state/loop-stop-rules/cross-verifier/loop-recovery/job-queue）、`src/memory/`（index/memory-types/memory-surface）。
- 改修: `src/team/run.ts`（hybrid cross-provider verifier 強制）、`src/runtime/agent-guard.ts`（BLOCKED_SELF_DELEGATION）、`src/state-db/projection-writer.ts`（projectMemoryEntries）、`src/lint/asset-drift.ts`（.claude/agent-memory scan 除去）、`src/doctor/index.ts`（verifier-provider-mismatch / agent-memory-silo）、`src/cli.ts`（memory subcommand）、`src/schema/harness-db-*`（loop_iterations/jobs/memory 2表 + SCHEMA_VERSION）。
- 先行済: `src/runtime/adapter.ts`（codex --execute writable、enablement、U-ADAPTER-007）。
- L1 要求 trace: BR-07(loop-eng)/BR-12(2層メモリ)/NFR-03(hybrid 前提) は **後段 Reverse で back-fill**（solo 変換 PLAN-L1-06 と整合）。

## §2 L6 機能設計サマリ（分散 subagent 検証済 / file-grounded、function-spec は §工程表 Step 2 で確定）

### P2 hybrid orchestration（旧 HELIX 採用核心3点を TS 再実装）
- loop coordinator `tick()`: stop 判定→worker(codex)/verifier(claude, 相手 runtime 必須) dispatch→loop_iterations 記録→on_failure(escalate/retry/abort)。
- **resume 3条件 AND**（旧 auto_run_engine）: `status==running && within_time_window && should_schedule`（carry= `last_verdict!=pass && iter<max`）。
- stop schema（旧 AgentLoop 拡張）: `verdict|count|file_exists|cost_budget|no_progress|custom`。
- **cross-verifier**: hybrid で verifier≠worker provider を fail-close（旧 BLOCKED_SELF_DELEGATION）。standalone は fallback 記録必須。
- **job-queue**: 旧 BEGIN IMMEDIATE 競合 claim を `bun:sqlite` WAL で TS 移植。
- 却下: heartbeat-scheduler 外部バイナリ / shell・http dispatcher（P8）。

### P7 共有メモリ（2層・全エージェント共有）
- harness.db 2表 `harness_memory_entries`/`project_memory_entries` ＋ `.ut-tdd/memory/*.jsonl`（git 共有、Claude+Codex 読書可）。
- `ut-tdd memory write/list/show/supersede` CLI、SessionStart で harness 層 surface。
- `.claude/agent-memory/` silo 廃止（asset-drift 衝突解消）。既存 upsertRow/migrate/SECRET_PATTERN/recordProjectionEvent 再利用。

> 設計の素材: 旧 HELIX 精読レポート + scratchpad の Codex ドラフト（`scratchpad/codex-draft-orchestration/`、参照のみ、design 準拠で再生成）。

## §3 coding-rule impact（add-feature CODING-RULE-WORKFLOW）

`docs/governance/coding-rules.md` への影響 = **delta**: 新規モジュール `src/orchestration/`・`src/memory/` の命名/配置規約、cross-runtime verifier の self-eval 禁止規約を追記対象。具体追記は Step 2（function design 確定）で SSoT 更新。U-CODE テストで新規規約挙動を被覆。

## §4 DDD / TDD impact（add-feature DDD-TDD-WORKFLOW）

- DDD: orchestration（loop/job）と memory（2層）は別 Bounded Context。memory は `harness`/`project` の 2 集約。境界=ACL（外部 runtime 跨ぎは adapter 経由、状態は CLI 経由でのみ遷移=agent-as-domain-service）。
- TDD: `tdd_red_required` = true（add-impl は Red-first 証跡を保つ。stop-rule/verifier 差異/memory 投影は先に失敗テストを書く）。

## §工程表（Add-feature route B）

### Step 1: [直列] 影響範囲特定 freeze
> 直列理由: downstream_dependency — 影響範囲が後続設計の前提。
§1 の新規/改修点を確定（重複実装チェック=既存 primitive 流用、AP-9 回避）。
- 進捗: 🔄 §1 記載済、freeze 判定待ち。

### Step 2: [直列] add-design = L6 機能設計（function-spec ① 確定）
> 直列理由: downstream_dependency — 機能契約が実装の前提。
各モジュールの function-spec（型 body・契約・擬似コード）を `docs/design/helix/L6-function-design/orchestration-memory.md` に確定。coding-rule SSoT delta 反映。
- 進捗: 🔄 function-design 起草済（9 契約関数 + 型 + 改修 delta + fail-safe + storage）。freeze 判定待ち。

### Step 3: [直列] test-design pair-freeze（①⇔③、片肺禁止）
> 直列理由: downstream_dependency — design を test-design と対凍結。
`docs/test-design/helix/orchestration-memory.md` に U-ORCH/U-MEM oracle 9 本を起票し function-spec と pair-freeze。coverage 単独 pass 禁止。
- 進捗: 🔄 test-design 起草済（9 oracle、契約 1:1、孤児 0）。① ⇔ ③ pair-freeze 判定待ち。

### Step 4: [直列] review（cross-runtime）→ add-design freeze
> 直列理由: downstream_dependency — 定量(plan lint/doctor)→定性レビュー。
tl review（frontier-reviewer class）/ intra_runtime_subagent 記録（tests_green_at ≤ reviewed_at）→ add-design freeze。後続 = `kind=add-impl` PLAN(L7) を本 PLAN を parent に起票。
- 進捗: ⬜

## §3.1 実装計画

| Step | 対象 | 方法 |
|------|------|------|
| 1 | §1 影響範囲 | 既存 doc/コード洗い出し、流用候補確認（重複防止） |
| 2 | L6 function-spec | 型/契約/擬似コードを確定、coding-rule delta、分散 drafting 可 |
| 3 | test-design | U-* oracle 起票、function-spec と pair-freeze |
| 4 | review/freeze | cross-runtime review → add-design freeze → add-impl(L7) へ |

## §4 DoD (add-design)

- [ ] §1 影響範囲が既存 L1-L14/コードに対し確定（重複実装なし）。
- [ ] L6 function-spec ① 確定、coding-rule SSoT delta 反映。
- [ ] test-design ③ と pair-freeze（片肺禁止）。
- [ ] DDD 境界/不変条件 impact 記録（本 §4）、`tdd_red_required: true`。
- [ ] `ut-tdd plan lint` / `doctor` green、cross-runtime review 証跡。

## §5 carry / 後続

- add-impl(L7): 本 add-design freeze 後、`kind=add-impl`・parent=本 PLAN で L7 実装（writable Codex 分散）。
- Reverse(R0-R4, fullback, forward_routing=L3): L3 要件(BR-07/BR-12/NFR-03) を back-fill → G3 凍結（要件後追い正本化）。
- L7 add-impl の G7 4-artifact trace 凍結は Reverse の G3 ペア凍結を待つ（IMP-043）。
