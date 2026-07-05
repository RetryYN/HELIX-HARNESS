---
plan_id: PLAN-L7-332-plan-filing-completeness
title: "PLAN-L7-332 (impl): PLAN 起票完全性 — 入力漏れを起票時に fail-close する"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "既存 plan lint (requirements §1) の検査強度を上げる延長 + 既存 template の現行 schema 同期であり、新しい frontmatter 意味を追加しない。必須構造 (s4_decision_record / pair_artifact / green_commands) はいずれも正本・既存 gate が要求済みで、本 PLAN は検出時点を事後 gate から起票時へ前倒しする。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: tests/plan-lint.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - 起票完全性検査の schema 整合と template 同期"
  - role: qa
    slot_label: "QA - S3/S4 record / reverse pair / grandfather oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-332-plan-filing-completeness.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint-policy.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint-types.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
  - artifact_path: docs/templates/plan/poc/template.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/plan/reverse/template.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
  requires:
    - src/plan/lint.ts
  references:
    - docs/plans/PLAN-L7-331-reverse-fullback-ledger.md
    - docs/templates/plan/impl/template.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T00:50:55+09:00"
    tests_green_at: "2026-07-06T00:50:55+09:00"
    verdict: approve
    scope: "plan lint の起票完全性検査として、S3/S4 poc の s4_decision_record 欠落と reverse の pair_artifact 欠落を enforcement 境界以降 fail-close 化した。既存 draft PLAN は日付 ratchet で grandfather し、poc/reverse template を現行 schema と同期した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/plan-lint.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:a1f3b55af6fbc01d2eacfa9d33f61bcdf2c74fede5c433c5107e2beb48aa9285"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-332-plan-filing-completeness.md --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: docs/plans/PLAN-L7-332-plan-filing-completeness.md
        output_digest: "sha256:15e6d21a189db5e0828fa7fc516187660e9fcd6fe01c6a3f6bc2450d34e9a3be"
---

# PLAN-L7-332 (impl): PLAN 起票完全性 — 入力漏れの起票時 fail-close 化

## 目的（PO 要求 2026-07-06「起票とかのルールの強化をして入力漏れとかがないように」）

本セッションで実測した起票時入力漏れ 7 種（s4_decision_record 骨格 / review_evidence
green_commands / pair_artifact / 必須 role / generates 規約 / design-language 見出し /
frontier トリガー語）は、いずれも**事後の gate・stop-review・cross-review で検出**されており、
起票時点の構造強制が無い。検出時点を起票時へ前倒しする。

## スコープ

### Step 1 — plan lint 起票完全性検査（本 PLAN で着地済み）
- `missing_s4_decision_record`: workflow_phase S3/S4 の poc は `s4_decision_record:` block 必須
  （discovery.md「source_ledger_freshness は S3 pending PLAN で必須」の機械化）。
- `missing_pair_artifact`: kind=reverse は起票時から `pair_artifact` 必須（PLAN-L7-331 の完遂検査と対）。
- いずれも `FILING_COMPLETENESS_ENFORCEMENT_DATE`（2026-07-06）の日付 ratchet で既存 PLAN
  （DISCOVERY-07/10 の S3 pending 等）を grandfather し、CI green を壊さない。

### Step 2 — template の現行 schema 同期（本 PLAN で着地）
- `docs/templates/plan/poc/template.md` 新設: S-phase / scrum_type / aim role /
  s4_decision_record 16 フィールド骨格 / promotion_strategy / reverse 合流義務の注記。
- `docs/templates/plan/reverse/template.md` 新設: R-phase / confirmed_reverse_type /
  pair_artifact / 正本 generates 義務（空 fullback 禁止）/ seed 変換義務の注記。
- 既存 impl template へ parent_design / pair_artifact / review_evidence + green_commands 骨格を追記。

### Step 3 — `helix plan scaffold` CLI（後続 descent、別 slice）
- kind/layer を引数に、Step 2 template + 当日 created/updated を埋めた骨格を生成する。
  実装は skill scaffold（`src/skill-engine/scaffold.ts`、PLAN-L7-317）のパターンを踏襲。

### OUT / 非対象
- frontmatter schema (zod) 自体の変更（既存フィールド意味を変えない）。
- design-language / frontier トリガー語の起票時検査（既存 gate が同一 working tree 内で検出済み。
  template 内の注記で予防する）。

## 受入条件
- U-PLANGOV-020/021 green（record 欠落 / pair 欠落で fail-close、grandfather、record あり pass）。
- `helix plan lint` / doctor green（既存 PLAN への false-positive ゼロを実測）。
- template は plan lint を通る形の骨格であること（placeholder 明示、機械検査と矛盾しない）。
- confirmed 前に review evidence + green_commands 記録。

## スケジュール
- mode: serial。Step 1: lint 検査 + テスト → Step 2: template 同期 → Step 3: scaffold CLI（後続）→ 検証 → review → confirmed。

## 壊さない / 再発させない
- 既存 plan lint の検査・メッセージを変えない（追加のみ）。
- 日付 ratchet で既存 draft PLAN を壊さない（S3 pending の DISCOVERY-07/10 で実測）。
- template は正本 schema（requirements §1）の写しであり、独自フィールドを発明しない。
