---
plan_id: PLAN-L6-50-helix-orchestration-memory
title: "PLAN-L6-50 (add-design): P2 orchestration + P7 memory 機能設計 (Add-feature route B)"
kind: add-design
layer: L6
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
review_evidence:
  - reviewer: codex (gpt-5.3-codex)
    review_kind: cross_agent
    reviewed_at: "2026-06-28T16:30:00+09:00"
    tests_green_at: "2026-06-28T16:25:00+09:00"
    verdict: pass
    worker_model: claude-opus-4-8
    reviewer_model: gpt-5.3-codex
    scope: "L6 function-design (9 契約) ⇔ test-design (9 oracle) の cross-runtime review。生成=Claude(Opus)、判断=Codex(別 runtime)。VERDICT PASS (Critical 0)。Important 4 件 (selectVerifier hybrid-unavailable fail-close / LoopState・loop_iterations の blockedReason 列 / writeMemory secret reject 明確化 / evaluateStop 必須フィールド欠落 fail-close) を凍結前に design+test-design へ反映済。pair-freeze 孤児 0、P8 違反なし"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/orchestration tests/memory"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T16:25:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:d1eec04a210514b2253fc73fb88ed435fc5c23108b8acc4e152673dc0c155a30"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28T16:25:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
pair_artifact: docs/test-design/helix/orchestration-memory.md
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
- 進捗: ✅ function-design 確定（9 契約関数 + 型 + 改修 delta + fail-safe + storage、cross-review Important 反映済）。

### Step 3: [直列] test-design pair-freeze（①⇔③、片肺禁止）
> 直列理由: downstream_dependency — design を test-design と対凍結。
`docs/test-design/helix/orchestration-memory.md` に U-ORCH/U-MEM oracle 9 本を起票し function-spec と pair-freeze。coverage 単独 pass 禁止。
- 進捗: ✅ test-design 確定（9 oracle、契約 1:1、孤児 0、forward-citation スタブ充足）。① ⇔ ③ pair-freeze 完了。

### Step 4: [直列] review（cross-runtime）→ add-design freeze
> 直列理由: downstream_dependency — 定量(plan lint/doctor)→定性レビュー。
tl review（frontier-reviewer class）/ intra_runtime_subagent 記録（tests_green_at ≤ reviewed_at）→ add-design freeze。後続 = `kind=add-impl` PLAN(L7) を本 PLAN を parent に起票。
- 進捗: ✅ cross_agent review（Codex, VERDICT PASS / Critical 0、Important 4 反映）→ **add-design freeze（status=confirmed）**。次 = add-impl(L7) を本 PLAN parent で起票し writable Codex へ実装分散。

## §3.1 実装計画

| Step | 対象 | 方法 |
|------|------|------|
| 1 | §1 影響範囲 | 既存 doc/コード洗い出し、流用候補確認（重複防止） |
| 2 | L6 function-spec | 型/契約/擬似コードを確定、coding-rule delta、分散 drafting 可 |
| 3 | test-design | U-* oracle 起票、function-spec と pair-freeze |
| 4 | review/freeze | cross-runtime review → add-design freeze → add-impl(L7) へ |

## §4 DoD (add-design)

- [x] §1 影響範囲が既存 L1-L14/コードに対し確定（重複実装なし）。
- [x] L6 function-spec ① 確定、coding-rule SSoT delta 反映。
- [x] test-design ③ と pair-freeze（片肺禁止）。
- [x] DDD 境界/不変条件 impact 記録（本 §4）、`tdd_red_required: true`。
- [x] `ut-tdd plan lint` / `doctor` green、cross-runtime review 証跡。

## §5 carry / 後続

- add-impl(L7): 本 add-design freeze 後、`kind=add-impl`・parent=本 PLAN で L7 実装（writable Codex 分散）。
- Reverse(R0-R4, fullback, forward_routing=L3): L3 要件(BR-07/BR-12/NFR-03) を back-fill → G3 凍結（要件後追い正本化）。
- L7 add-impl の G7 4-artifact trace 凍結は Reverse の G3 ペア凍結を待つ（IMP-043）。
