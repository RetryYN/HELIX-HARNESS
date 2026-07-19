---
plan_id: PLAN-L7-415-gpt56-tier-routing-adoption
title: "PLAN-L7-415 (troubleshoot): Codex 側 tier routing の世代 drift 是正 — frontier/worker を gpt-5.6 世代へ更新し pricing / effort SSoT を追随"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11「フォローアップよろしく」— 実 Codex runtime は既に gpt-5.6-sol で稼働（~/.codex/config.toml 実測）なのに、local tier routing 正本（MODEL_IDS.codex: frontier=gpt-5.5 / worker=gpt-5.4）と pricing / effort SSoT が旧世代のままの drift を、上流 UT-TDD PR#41（gpt-5.6 tier routing adoption、採用台帳 2026-07-11 §3.2）の概念採取で是正"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "モデル世代カタログの更新（MODEL_IDS / pricing 表 / effort 上書き表の値差し替え）。tier 構造（T0/T1/T2）、frontier 明示許可 gate、effort 適応調整の contract は不変。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — 世代 drift の incident 判定（実 runtime と routing 正本の乖離）"
  - role: se
    slot_label: "SE — MODEL_IDS / OPENAI_PRICING / EXACT_MODEL_STANDARD_EFFORT の同期更新 + oracle 追随"
  - role: tl
    slot_label: "TL — 旧世代 pricing 行の保持（履歴 cost 計算）と frontier gate 非退行のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-415-gpt56-tier-routing-adoption.md
    artifact_type: markdown_doc
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/model-effort.ts
    artifact_type: source_module
  - artifact_path: src/state-db/token-tracker.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router-policy.ts
    artifact_type: source_module
  - artifact_path: tests/token-tracker.test.ts
    artifact_type: test_code
  - artifact_path: tests/tier-router.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-model-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    - docs/plans/PLAN-L7-65-deterministic-model-policy.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T04:47:00+09:00"
    tests_green_at: "2026-07-11T04:45:42+09:00"
    verdict: pass
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=pass。Critical / Important なし。レビューで確認済み: MODEL_IDS の新値と実 runtime 既定（~/.codex/config.toml = gpt-5.6-sol）の一致、pricing 値の上流確認値との一致（cost oracle 0.035 / 0.0175 実測）、--allow-frontier gate は role ベースで model 文字列非依存のため非退行（U-TIER-005/007）、pricingKeyFor の prefix-match は gpt-5.6-sol / terra が互いに prefix でなく variant boundary 衝突なし、FRONTIER_MODELS は TIER_TABLE.T0 から自動導出のため hardcode drift 残留なし。Minor 1 件（model-policy の旧世代コメント）は是正済み。5 test files の hardcode 期待値追随を diff で確認、105/105 green（1 件の初回 fail は flake で再走 green）。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/tier-router.test.ts tests/team-run.test.ts tests/token-tracker.test.ts tests/team-model-policy.test.ts tests/pair-agent.test.ts tests/model-id-ssot.test.ts tests/effort-observation.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T04:45:42+09:00"
        evidence_path: tests/token-tracker.test.ts
        output_digest: "sha256:3cd7f7321e1da598ce602ebc65d1472dc7e6ea3c8fdeac2b79df1c6209071c63"
---

# PLAN-L7-415 (troubleshoot): Codex 側 tier routing の gpt-5.6 世代更新

## 0. defect（実測 2026-07-11）

- 実 Codex runtime の既定 model は `gpt-5.6-sol`（`~/.codex/config.toml` 実測）。一方 local の
  routing 正本 `src/team/model-policy.ts` は `frontier=gpt-5.5` / `worker=gpt-5.4` のまま。
  tier router / team run が旧世代へ routing し、実環境と正本が乖離している（世代 drift）。
- `src/state-db/token-tracker.ts` の `OPENAI_PRICING` に gpt-5.6 世代の行が無く、実際に
  gpt-5.6 で発生した usage は cost null（計上不能）になる。
- 上流 UT-TDD PR#41（merge 88bd1635、gpt-5.6 tier routing adoption）が同型 drift を解消済み。
  ADR-001 に従い概念採取して local へ再構成する（上流の delegation default model 付与と
  adapter template 更新は local に該当箇所が無いため対象外）。

## 1. 是正内容

1. `src/team/model-policy.ts`: `MODEL_IDS.codex.frontier = "gpt-5.6-sol"` /
   `MODEL_IDS.codex.worker = "gpt-5.6-terra"`（spark / mini / codex は据え置き、上流同値）。
2. `src/state-db/token-tracker.ts`: `OPENAI_PRICING` へ `gpt-5.6-sol`（5 / 0.5 / 30）と
   `gpt-5.6-terra`（2.5 / 0.25 / 15）を追加（OpenAI 公式 pricing、上流 2026-07-10 確認値）。
   旧世代行（gpt-5.5 / gpt-5.4 等）は履歴 usage の cost 計算のため保持する。
3. `src/team/model-effort.ts`: `EXACT_MODEL_STANDARD_EFFORT` へ `gpt-5.6-sol: high` /
   `gpt-5.6-terra: medium` を追加（family 標準の維持）。上流 H4 実測（effort-token 非単調、
   sol は low でも品質維持の傾向）は**固定 pin にしない**（上流 PO 裁定 2026-07-10「型にはめず
   傾向として扱う」）— 適応調整（PLAN-L7-310 の adaptReasoningEffort）に委ねる。
4. tier-router の prose（`src/task/tier-router.ts` / `tier-router-policy.ts` の gpt-5.5 言及）を
   世代非依存の表現または新 id へ更新。
5. 検証判定: 既存 oracle（tier-router / team-run / token-tracker / model-effort ほか）の
   ハードコード期待値を新 id へ追随。gpt-5.6 世代の cost 計算 oracle を token-tracker test へ
   追加。frontier 明示許可 gate（--allow-frontier）の非退行を既存 test で担保。

## 2. 対象外

- tier 構造（T0/T1/T2）・frontier gate・claude 側 model 族の変更。
- effort の世代別固定 pin（H4 は傾向。固定ルール化しない）。
- 上流の delegation default model 付与（`opts.model ?? worker`）と adapter template 更新
  （local に該当コード・記述が無い）。
- 旧世代 pricing 行の削除（履歴 cost 計算に必要）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): 実装 — MODEL_IDS / pricing / effort 表 / prose の同期更新。
- step 2 (mode: serial): oracle 追随 — fast suite 全走で hardcode 期待値を洗い出して更新 +
  gpt-5.6 cost oracle 追加 → typecheck / Biome / green。
- step 3 (mode: serial): レビュー（intra_runtime_subagent 以上）→ review_evidence 記録 → confirm。

## 4. 受入条件

- 影響 oracle（tier-router / team-run / token-tracker / model-effort / model-id-ssot 等）全 green。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-415-gpt56-tier-routing-adoption.md` green。
- `MODEL_IDS.codex.frontier` と実 runtime 既定（gpt-5.6-sol）が一致している。
