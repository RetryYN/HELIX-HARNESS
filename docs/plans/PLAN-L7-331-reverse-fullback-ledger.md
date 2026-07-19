---
plan_id: PLAN-L7-331-reverse-fullback-ledger
title: "PLAN-L7-331 (impl): reverse fullback 台帳強化 — 空 fullback と seed 未変換を fail-close で検知する"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "既存 scrum-reverse gate (IMP-064、requirements §1.2 / §3.3) の検査強度を上げる troubleshoot 級の延長であり、新しい workflow 意味や上位設計変更を追加しない。検査対象の契約 (confirmed poc → reverse 合流 → 正本反映) は既に正本に存在する。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - reverse 完遂検証 (空 fullback / seed 未変換) の契約設計と doctor 配線"
  - role: qa
    slot_label: "QA - terminal reverse generates / trace seed marker oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-331-reverse-fullback-ledger.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/scrum-reverse.ts
    artifact_type: source_module
  - artifact_path: tests/scrum-reverse.test.ts
    artifact_type: test_code
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  requires:
    - src/lint/scrum-reverse.ts
  references:
    - docs/plans/PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback.md
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T00:45:07+09:00"
    tests_green_at: "2026-07-06T00:45:07+09:00"
    verdict: approve
    scope: "scrum-reverse gate に空 fullback と trace seed 未変換の fail-close 検査を追加し、terminal reverse が正本反映なしに完遂扱いになる穴を塞いだ。created 欠落 reverse は grandfather せず enforcement 対象にする。doctor 配線は既存 scrum-reverse に seed loader を渡すだけに留め、新規 lint surface は増やさない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/scrum-reverse.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:39:10+09:00"
        evidence_path: tests/scrum-reverse.test.ts
        output_digest: "sha256:972be6bc0fbd2c80275652bfc21e098fa365e9cdd3e77699c3519e745a8cea99"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T00:39:10+09:00"
        evidence_path: src/lint/scrum-reverse.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-331-reverse-fullback-ledger.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:42:29+09:00"
        evidence_path: docs/plans/PLAN-L7-331-reverse-fullback-ledger.md
        output_digest: "sha256:4c0741083bc42d2b00bd0c8267e8ee4ddba1f7102048ffd39a802c93c413c226"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor --json"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T00:45:07+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:37796345b0ea1f8898dd655e55cf370bc553934b9646431e6578c5ebefc05917"
---

# PLAN-L7-331 (impl): reverse fullback 台帳強化 — 空 fullback と seed 未変換の fail-close 化

## 目的（PO 指摘 2026-07-06「リバースが台帳漏れ起こしてない？」）

実測結果: reverse draft の**存在**は台帳に閉じている（outstanding items + G-10 completion row に
`PLAN-REVERSE-329` が登録済み、completion を block する）。漏れ得るのは**完遂**の側で、現行
`scrum-reverse` gate は「confirmed poc に reverse が存在するか」しか見ていない:

1. **空 fullback**: reverse PLAN が正本（concept / requirements / process / design）へ何も反映せず
   generates = 自 doc のみのまま terminal (confirmed/completed) になっても green。
2. **seed 未変換**: 上位正本に入れた trace seed（「PoC 段階、confirmed 昇格時に正式追補」注記）が、
   対応 reverse の完了後も PoC 段階のまま放置されても検知されない。

## スコープ

### IN — `scrum-reverse` lint の延長（新 lint は作らない）
- `ParsedSrPlan` に `generates` artifact paths を追加抽出。
- 検査 3 `emptyReverseFullbacks`: kind=reverse かつ terminal status なのに、generates に
  `docs/plans/` 外の正本 artifact が 1 つも無い → violation（fullback の実質ゼロ）。
- 検査 4 `unresolvedSeedMarkers`: 正本 2 doc（concept v3.1 / requirements v1.2）の
  「trace seed」+「PoC 段階」marker が参照する poc PLAN について、その poc を指す reverse が
  terminal になった後も marker が残っている → violation（正式追補への変換漏れ）。
  reverse が draft の間は violation にしない（変換は reverse の作業中で正当）。
- doctor 配線は既存 `scrum-reverse` 呼び出しに loader 引数を追加するのみ（`lint-wiring` 影響なし）。

### OUT / 非対象
- R-phase の時間ベース滞留検知（Date 依存は resume 契約と干渉。滞留は outstanding 台帳が既に可視化）。
- 正本反映「内容」の意味検査（referenced doc に plan_id が実在するかまでは検査 4 の対象、prose 品質は review の領域）。

## 受入条件
- 新規 U-SR oracle green（空 fullback 注入 / seed 残置 fixture で fail-close、draft reverse は許容、live repo green）。
- `helix doctor` green（既存 REVERSE-329 は draft のため violation を出さない = grandfather 不要を実測）。
- confirmed 前に review evidence + green_commands 記録。

## スケジュール
- mode: serial。Step 1: red テスト → Step 2: lint 拡張 green → Step 3: doctor 配線 + test-design 追記 → Step 4: 検証 → review → confirmed。

## 壊さない / 再発させない
- 既存 2 検査（pocOrphans / badReverseRefs）の挙動・メッセージを変えない。
- REVERSE-329（進行中 R3）へ false-positive を出さない（terminal のみ検査）。
- Codex in-flight ファイルへは foreign-edit marker 手続きなしに触れない。
