---
plan_id: PLAN-L7-309-fe-roster-orchestration
title: "PLAN-L7-309 (impl): FE ロスター (Opus+Sonnet5) と sonnet SSoT の世代更新"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-12
owner: Claude
parent_design: docs/design/harness/L6-function-design/fe-roster-orchestration.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-DISCOVERY-02 roster design の空白 (FE 実装 agent 不在、2026-07-04 棚卸で検出) を PO 指示で埋める。PLAN-L7-58 model-id SSoT / PLAN-L7-306 agent-model-ssot gate の上で sonnet 世代を更新する運用変更であり、新規 L1/L3 要求は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - FE orchestration roster 設計"
  - role: qa
    slot_label: "QA - model SSoT 世代更新の drift 検証"
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/fe-roster-orchestration.md
    oracle_id: U-FEROSTER-001
    test_path: tests/fe-roster-orchestration.test.ts
  - parent_design: docs/design/harness/L6-function-design/fe-roster-orchestration.md
    oracle_id: U-FEROSTER-002
    test_path: tests/fe-roster-orchestration.test.ts
generates:
  - artifact_path: docs/plans/PLAN-L7-309-fe-roster-orchestration.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-lead.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-ui.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/advisor-fable.md
    artifact_type: markdown_doc
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: src/state-db/token-tracker.ts
    artifact_type: source_module
  - artifact_path: tests/fe-roster-orchestration.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-66-fe-roster-orchestration.md
  requires:
    - docs/plans/PLAN-L6-66-fe-roster-orchestration.md
    - docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
review_evidence:
  - reviewer: codex-linnaeus
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T03:18:50+09:00"
    tests_green_at: "2026-07-04T03:18:50+09:00"
    verdict: approve
    scope: "FE roster は fe-lead=Opus lead / fe-ui=Sonnet 5 worker / advisor-fable=UX 相談のみで整合。claude-sonnet-5 は MODEL_IDS、agent frontmatter、team-run、pricing と整合。auth / authorization / destructive / PII などの escalation 必須領域の実変更なし。"
    worker_model: claude
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/agent-model-ssot.test.ts tests/team-model-policy.test.ts tests/team-run.test.ts tests/agent-guard.test.ts tests/token-tracker.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T03:18:50+09:00"
        evidence_path: tests/agent-model-ssot.test.ts
        output_digest: "sha256:3d3a3e19db62f2bc957dea8839b1cad55ac18c7a6104210867f99e403625fb25"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T03:18:50+09:00"
        evidence_path: src/team/model-policy.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-309-fe-roster-orchestration.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T03:18:50+09:00"
        evidence_path: docs/plans/PLAN-L7-309-fe-roster-orchestration.md
        output_digest: "sha256:4c0741083bc42d2b00bd0c8267e8ee4ddba1f7102048ffd39a802c93c413c226"
  - reviewer: codex-fe-roster-vpair-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T18:00:45Z"
    tests_green_at: "2026-07-11T18:00:37Z"
    verdict: approve_after_fixes
    scope: "PLAN-L7-309の専用L6 parent、L8 pair、U001/U002 bindings、test_code逆包含、FE topology/model SSoT semantic deltaを独立レビュー。authority未投入のexpected redを除きblocker/high 0。"
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/fe-roster-orchestration.test.ts -t 'U-FEROSTER-00[12]'"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T18:00:37Z"
        evidence_path: tests/fe-roster-orchestration.test.ts
        output_digest: "sha256:6b056a20a588b83bfb88b33e8de180d092495f8ad72eb5b6f017998f7bb51d1d"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T18:00:37Z"
        evidence_path: tests/fe-roster-orchestration.test.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T18:00:37Z"
        evidence_path: tests/fe-roster-orchestration.test.ts
        output_digest: "sha256:680079cd1e78995c8b70a855fd96fe49dbe9b618f91b4867ec47c23dba3b2cab"
---

# PLAN-L7-309: FE ロスター (Opus+Sonnet5) と sonnet SSoT の世代更新

## 0. 目的

PO 指示 (2026-07-04): 「FE は Opus + Sonnet5 (worker) のオーケストレーション。UX の観点では
Fable アドバイザーを通す (相談。Fable 経由で実装ではない) のがベスト」。2026-07-04 のロスター
棚卸で検出した「FE 実装 agent 不在」の空白を埋める。

1. **FE ロスター**: `fe-lead` (Opus, 設計・分割・レビュー主導) + `fe-ui` (Sonnet 5, 実装 worker) を
   Claude 内オーケストレーションとして追加し、両者を SUBAGENT_ALLOWLIST に登録する
   (be-* が Codex 委譲組なのと対照的に FE は Claude 内)。
2. **UX = Fable 相談 (助言のみ)**: FE の UX/ユーザビリティ判断は `advisor-fable` に相談する運用を
   .claude/CLAUDE.md と fe/advisor agent 本文に明記する。Fable は助言のみで **FE 実装はしない**。
3. **sonnet SSoT 世代更新**: `MODEL_IDS.claude.sonnet` を `claude-sonnet-4-6` → `claude-sonnet-5` に更新。
   T1 worker 帯と全 sonnet agent (12 件) を最新世代に揃え、棚卸で検出した世代陳腐化を解消する。
   pricing 表に `claude-sonnet-5` を追加 (旧 4-6 は履歴 recalc 用に残置)。

## 1. スコープ

- `.claude/agents/fe-lead.md` (opus) / `.claude/agents/fe-ui.md` (sonnet-5) を追加。
- `SUBAGENT_ALLOWLIST` (agent-guard-policy.ts) と .claude/CLAUDE.md allowlist に fe-lead/fe-ui 追加。
- `advisor-fable` 呼び出し条件に「FE の UX/ユーザビリティ相談 (助言のみ)」を追加。
- `MODEL_IDS.claude.sonnet` = claude-sonnet-5、12 sonnet agent frontmatter を sonnet-5 に更新。
- token-tracker CLAUDE_PRICING に claude-sonnet-5 追加。

## 2. 対象外

- FE の実 UI 実装 (本 PLAN は roster と model 世代の整備。実装は FE 工程で fe-lead/fe-ui が行う)。
- Fable による FE 実装 (Fable は UX 相談=助言のみ、実装しない)。
- 旧 sonnet-4-6 の pricing 削除 (履歴ログ recalc の安全性のため残置)。

## 3. 受入条件

- agent-model-ssot gate green (合格): fe-lead=opus / fe-ui=sonnet-5 / 全 sonnet agent=sonnet-5 が
  MODEL_IDS に解決される (tests/agent-model-ssot.test.ts U-AGENTMODEL-002 real-repo regression)。
- team-model-policy / team-run / tier-router が sonnet-5 を返す (T1 worker 世代更新)。
- fe-lead/fe-ui が allowlist に載り agent-guard が model family を解決する。
- `npm run typecheck` green、影響対象 tests (affected tests) green、`helix doctor` green。
- 専用L6/L8と`U-FEROSTER-001/002`が4点bindingで結合され、authority exemptionが
  `PLAN-L7-424-fe-roster-vpair-resolution`により解消される。

## 4. carry

- pricing 表と MODEL_IDS の突合 advisory (監査提案 #3) は任意の後続。
