---
plan_id: PLAN-L7-306-fable-advisor-roster-governance
title: "PLAN-L7-306 (impl): Fable advisor 追加 + roster モデル SSoT ガバナンス"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Claude
parent_design: docs/design/helix/L3-requirements/legacy-helix-extension.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "HLX-FR-02 (technical question gate は TL advisor evidence を要求) の運用拡張 (TL の一段上の second-opinion advisor) と、PLAN-L7-58 model-id SSoT の enforcement 拡張 (agent frontmatter への波及)。既存要求の deepening であり新規 L1/L3 要求を追加しない。PO が advisor 階層を要件化する場合は後続 Reverse で L3 back-fill する。"
agent_slots:
  - role: tl
    slot_label: "TL - advisor 階層と呼び出し条件の設計"
  - role: qa
    slot_label: "QA - roster model drift の fail-close 検出"
generates:
  - artifact_path: docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/advisor-fable.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-tech-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-marketing-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-innovation-manager.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/lint/agent-model-ssot.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/agent-model-ssot.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/plans/PLAN-DISCOVERY-02-roster-design.md
    - docs/plans/PLAN-L7-151-refactor-scout-agent.md
    - docs/design/helix/L3-requirements/legacy-helix-extension.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T02:20:21+09:00"
    tests_green_at: "2026-07-04T02:20:21+09:00"
    verdict: approve
    scope: "advisor-fable を advisory-only agent として追加し、SUBAGENT_ALLOWLIST / fable model family / MODEL_IDS / agent-model-ssot doctor gate を接続した。pdm-* model drift と CLI help の model literal drift を是正し、lint が team module に逆依存しないよう canonical model IDs は model-policy source text から読む。"
    worker_model: claude
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/agent-model-ssot.test.ts tests/agent-guard.test.ts tests/model-id-ssot.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: tests/agent-model-ssot.test.ts
        output_digest: "sha256:8ba97d4138618c3b4a5f0c7d420b71fdf2b6786357cfeea5c9973fbe3a0a2fb6"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T02:20:21+09:00"
        evidence_path: docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
        output_digest: "sha256:bc9bce3f526c0cf25229ea8f1101b05fef0dc16927146e00fe842277a1f2b4a0"
---

# PLAN-L7-306: Fable advisor 追加と roster モデル SSoT ガバナンス

## 0. 目的

PO 指示 (2026-07-04): 「アドバイザー機能に Fable を追加。TL アドバイザーとの相談でも疑問が
残るときのような相談時の観点・呼び出す条件を決める」+ 「モデル更新に対する柔軟性とサブ
エージェント群の見直し」。

1. **Fable advisor (Fable 助言役)**: TL advisor (HLX-FR-02) の一段上の second-opinion advisor
   `advisor-fable` (model=claude-fable-5、advisory-only・read-only) を roster に追加し、
   呼び出し条件 5 項と評価観点 5 軸を `.claude/CLAUDE.md` と agent 本文に固定する。
2. **モデル更新柔軟性**: agent frontmatter の `model:` が `MODEL_IDS` (PLAN-L7-58 SSoT) から
   silent 陳腐化する監査ギャップ (2026-07-04 監査で pdm-* 3 件の claude-opus-4-7 残存を実検出)
   を doctor hard gate `agent-model-ssot` で fail-close 化する。
3. **roster 棚卸是正**: 監査で検出した drift を是正する —
   `.claude/CLAUDE.md` allowlist 文書の refactor-scout 欠落 (コード正本 14 種 vs 文書 13 種)、
   pdm-* 3 agent の claude-opus-4-7 → claude-opus-4-8、CLI help の生 model 文字列 2 箇所を
   `MODEL_IDS` 参照へ置換。

## 1. Fable advisor 設計 (正本は .claude/CLAUDE.md と agent 本文)

- 呼び出し条件 (いずれか該当時のみ): ①TL advisor 相談後も疑問が残る ②cross-runtime 判定対立が
  2 回目でも収束しない ③不可逆・高影響操作の approval 前段の技術妥当性 ④PO エスカレーション
  直前の最終確認 ⑤3 回以上の試行失敗または正本間矛盾。
- 評価観点 (5 軸固定): 根拠の強度 / 正本整合 / 不可逆性と blast radius / 代替案 /
  エスカレーション適切性。
- 出力契約: 結論・根拠・残リスク・次の一手。相談証跡は呼び出し側が review_evidence / IMP に記録。
- guard (実行保護): `SUBAGENT_ALLOWLIST` へ追加、`normalizeModelFamily` に fable family を追加
  (曖昧値 fail-close は不変)。`MODEL_IDS.claude.fable = claude-fable-5` を SSoT に登録
  (tier-router の worker 帯には載せない = 実装ワーカーへの誤流用防止)。

## 2. 対象外

- HLX-FR-02 の契約変更 (second_opinion_evidence フィールド追加等の L3 要件化) — PO 判断待ち。
- FE 実装 agent の新設 (棚卸で検出した roster 空白、PO 確認事項として報告)。
- code-reviewer の tools 縮小 (Edit/Write 削除は運用フロー確認が先)。

## 3. 受入条件

- U-AGENTMODEL-001: canonical id / 日付 snapshot 形は pass、未知 id・欠落 model は violation。
- U-AGENTMODEL-002: 実 repo の `.claude/agents/*.md` 全件が MODEL_IDS に解決される
  (real-repo regression、pdm-* の 4-7 残存を再発防止)。
- U-AGENTMODEL-003: advisor-fable が allowlist に載り、fable family が guard で解決される。
- 検証 command は `bun run vitest run tests/agent-model-ssot.test.ts tests/model-id-ssot.test.ts tests/agent-guard.test.ts` green、
  `bun run typecheck` green、`helix doctor` で
  `agent-model-ssot` が hard gate として集約される。

## 4. carry

- 2026-07-04 Codex 追補: `src/cli.ts` の `--allow-frontier` help は、生 model literal
  (`opus/gpt-5.5`) ではなく `MODEL_IDS.claude.opus` / `MODEL_IDS.codex.frontier` から表示する。
  これは §0 の「CLI help の生 model 文字列 2 箇所を `MODEL_IDS` 参照へ置換」の実装 trace であり、
  model 更新時の help drift を `agent-model-ssot` / `model-id-ssot` と同じ SSoT 方針へ寄せる。
- pricing 表 (`token-tracker.ts`) との advisory 突合 (MODEL_IDS にあるが pricing に無いモデルの
  warn) は任意の後続 (監査提案 #3)。
- roster 実使用証跡の粒度強化 (Agent 呼び出しの harness.db 記録) は棚卸 P4 提案の後続。
