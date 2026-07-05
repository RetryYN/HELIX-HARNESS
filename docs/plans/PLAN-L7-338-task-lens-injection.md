---
plan_id: PLAN-L7-338-task-lens-injection
title: "PLAN-L7-338 (impl): 思考レンズ注入 — 設計/検証/テスト戦略/トラブルシューティングの観点を委譲へ機械供給する"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-337 の委譲 prompt 合成 (formatAdapterPrompt) に条件注入セクションを additive に追加するもので、role 判断ブリーフ / stdin 帯域外契約 / skill 注入の既存意味を変えない。レンズ内容は既存 skill pack の distillation であり新規概念を導入しない。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: tests/task-lens.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - レンズ内容の skill pack 正本整合と注入条件の妥当性"
  - role: qa
    slot_label: "QA - keyword 判定の誤爆抑制 / 条件注入の両方向 / dead link oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-338-task-lens-injection.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/task-lens.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: tests/task-lens.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
  requires:
    - src/runtime/role-judgment.ts
    - docs/skills/judgment-core.md
  references:
    - docs/skills/design-doc.md
    - docs/skills/verification.md
    - docs/skills/test-driven-development.md
    - docs/skills/debugging-and-error-recovery.md
related_adr:
  - docs/adr/ADR-001-helix-harness-redesign-and-language.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T06:45:00+09:00"
    tests_green_at: "2026-07-06T06:45:00+09:00"
    verdict: approve_after_tests
    scope: "task 本文から設計 / 検証 / テスト戦略 / トラブルシューティングの思考レンズを決定論的に検出し、該当時だけ adapter stdin へ注入する。role 判断ブリーフは常時維持し、無関係 task には lens を注入しない。U-ADAPTER 番号衝突は U-ADAPTER-012 へ補正した。"
    worker_model: claude-fable-5
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/task-lens.test.ts tests/runtime-adapter.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T05:02:42+09:00"
        evidence_path: tests/task-lens.test.ts
        output_digest: "sha256:7746d6739fda86e603a98af574309b4c4c0c61f13b350a03d6455c11c7b9509d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T05:02:42+09:00"
        evidence_path: src/runtime/task-lens.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

# PLAN-L7-338 (impl): 思考レンズ注入 — 観点を委譲へ機械供給する

## 目的（PO 要求 2026-07-06「指示側にも設計・検証・テスト戦略・トラブルシューティングの知能と視点を」）

PLAN-L7-337 で「どう振る舞うか」（role 規律）は全委譲に載るようになったが、
「何を考えるべきか」（領域別の観点網羅）は依然として指示を書く側の力量に依存していた。
本 PLAN は task 本文から思考レンズ（設計 / 検証 / テスト戦略 / トラブルシューティング）を
決定論的に検出し、レンズ別の思考チェックリスト（judgment-core の観点の領域先鋭化 +
詳細 skill pack への pointer）を委譲 prompt へ機械注入する。指示者が観点を書き忘れても、
受信側は Fable 水準の観点セットを必ず受け取る。

## 設計（対案比較）

- **条件注入（該当領域のみ）を採用**: role ブリーフと違い、レンズは領域固有の観点であり
  無関係レンズの常時注入は context を浪費して S/N を下げる（judgment-core §7 の context
  節約原則と同方向）。**対案 = 全レンズ常時注入**は robustness で勝るが 1 委譲あたり
  約 20 行の固定コストと観点の希釈を招くため不採用。
- **keyword 判定（決定論）を採用**: 日本語は includes、英語は語境界 regex で誤爆を抑える。
  **対案 = `helix task classify` の分類器再利用**は task→runtime の依存連鎖（循環依存 gate、
  PLAN-L7-337 と同型の問題）を作るため不採用。同期が必要になった場合は L7-337 の
  U-ROLEJUDG-007 と同様に test 側で機械固定する。
- **レンズ内容は distillation + pointer**: 本文は各 4 行以内に抑え、深掘りは既存 skill pack
  （design-doc / verification / test-driven-development / debugging-and-error-recovery 等）への
  pointer で接続する。pack 本文の複製は judgment-core が塞いだ「prose 点在 drift」を再生する
  ため行わない。dead link は U-TASKLENS-006 が fail-close する。

## スコープ

### Step 1 — task-lens 純関数（着地済み）
- `src/runtime/task-lens.ts` 新設: `detectTaskLenses`（4 レンズ、固定順、複数可）、
  `taskLensBrief`（無 match は空 = 注入しない）、`TASK_LENS_HEADER`。

### Step 2 — adapter 注入（着地済み）
- `formatAdapterPrompt`: 委譲 stdin = task 本文 + role ブリーフ + 思考レンズ（条件）+ skill 注入。
  stdin 帯域外契約（U-ADAPTER-007/008）と role ブリーフ常時注入（U-ADAPTER-010）は不変。

### Step 3 — docs 同期（着地済み）
- `AGENTS.md` 判断コア節へ受信側規約を追記、concept §10.3 へ用語 back-merge、
  L7 test-design へ U-TASKLENS 追補。

### OUT / 非対象
- Claude 側 Agent spawn prompt へのレンズ強制（Claude 側は判断コア配線済み agent 定義が
  観点を保持しており、hook は prompt を書き換えられない。ガイドは agent-design.md /
  judgment-core が担う）。
- keyword 表の config 外部化（requirements-binding 系。運用実績を見てから別 PLAN で判断）。

## 受入条件
- U-TASKLENS-001..006 / U-ADAPTER-012 が green であること
  （検証コマンド: `bun test tests/task-lens.test.ts tests/runtime-adapter.test.ts`）。
- 既存契約（U-ADAPTER-007/008/010、role ブリーフ・stdin 帯域外）が green のまま（同上に包含）。
- `bun run typecheck` green、`helix doctor` exit 0。
- review evidence + green_commands（digest 付き）を記録する。

## スケジュール
- mode: serial。Step 1 純関数 → Step 2 注入配線 → Step 3 docs 同期 → 検証 → レビュー → confirmed。

## 壊さない / 再発させない
- role ブリーフ（常時）とレンズ（条件）の注入条件を混同しない。両者の oracle
  （U-ADAPTER-010 / U-ADAPTER-012）が両方向を固定する。
- レンズ本文は skill pack の複製ではなく distillation + pointer に保つ（pointer の実在は
  U-TASKLENS-006 が fail-close）。
- 誤爆抑制（英語語境界）を keyword 追加時にも維持する（U-TASKLENS-002 が回帰 fence）。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| 思考レンズ (task lens) | 新規 | task 領域別の観点チェックリスト条件注入（role ブリーフと対） | 導入層 L7、concept §10.3 へ追記済み |

## §7 機能要求更新 (FR registry delta)

機能要求更新なし（FR-L1-12 injection の既存機能エリア内での注入強化であり、新規機能エリアを
追加しない）。
