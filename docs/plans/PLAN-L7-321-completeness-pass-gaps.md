---
plan_id: PLAN-L7-321-completeness-pass-gaps
title: "PLAN-L7-321 (impl): 突合 completeness pass の追加 code gap — skill_injection 監査 / route_mode first-class projection / relation-graph node 投影"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "上流突合 completeness pass で見つかった実装欠落を L7 子 PLAN へ分割して閉じた集約 PLAN であり、新規 product requirement や上位設計の意味変更を追加しない。L5/L6/L7 の trace と oracle は各子 PLAN で更新済み。"
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — session-log の skill_injection event + recordSkillInjectionAttempt、route_mode first-class projection、relation-graph の追加 node 投影を実装"
  - role: tl
    slot_label: "TL — LOCAL の既存 session-log / harness-db / relation-graph 構造への接地・superset 設計との整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-325-skill-injection-session-log-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-326-route-mode-first-class-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-327-relation-graph-node-scope.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:51:27+09:00"
    tests_green_at: "2026-07-05T01:51:27+09:00"
    verdict: approve
    scope: "PLAN-L7-321 の 3 つの completeness pass gap が PLAN-L7-325 / PLAN-L7-326 / PLAN-L7-327 として独立 confirmed 済みであることを親 PLAN に集約した。物理 rename、PLAN-M-02 cutover、追加の runtime surface 変更は行っていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/session-log.test.ts tests/projection-writer.test.ts tests/relation-graph-loader.test.ts tests/relation-graph.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:51:27+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:0517e1419846dcb8d71e6eb2b3fe4ef9f2201ce6a6914797c776747fc55aeb51"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:51:27+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:59d40726254c5d3e1c2f82345fcb1d436148351da1951ab1d09119c046adedd8"
      - kind: doctor
        command: "./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:51:27+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:eff33be45091a0a9101d7423921f07662e3da3c4f243d6c825a73b8b514df268"
---

# PLAN-L7-321 (impl): completeness pass 追加 code gap

## Objective

上流突合の completeness pass（audit addendum）で、初回パスが見落としていた追加 code gap を確認した。
各々小〜中規模だが独立に着地させる（一括 import しない）。

1. **skill_injection 監査（上流 L7-262）**: `src/runtime/session-log.ts` に `skill_injection` event 型 +
   `recordSkillInjectionAttempt()` を追加し、skill-context 注入の silent fail-open を可監査化（真の注入失敗を
   `-failed` reason で no-match skip と区別）。LOCAL に該当参照 0。
2. **route_mode first-class projection（上流 L7-243）**: drive mode を harness.db の first-class（`route_mode`）
   として projection。LOCAL は routing-contracts で mode routing は持つが harness.db への first-class 投影が無い
   （src ヒット 0、pillar-requirements.md に言及のみ）。
3. **relation-graph node 投影の補完**: 上流が追加した adr governance node / document-system-map / root skills /
   codex hooks の relation-graph 投影を LOCAL relation-graph へ補完（LOCAL に該当 node source 投影なし）。

## スコープ

### IN
- session-log: skill_injection event + recordSkillInjectionAttempt（fail-open を可監査化、no-match skip と区別）。
- harness-db: route_mode を first-class projection（既存 drive-registration / projection-writer へ接地）。
- relation-graph: 不足 node source（adr governance / document-system-map / root skills / codex hooks）の投影を追加。

### OUT
- 既存 session-log / harness-db / relation-graph の superset 設計を壊さない（追加投影のみ）。
- 3 項目を一括 import しない（粒度を合わせ独立着地）。

## 受入条件
- skill_injection の fail-open が session-log に記録され no-match skip と区別される。
- route_mode が harness.db に first-class projection される。
- 追加 relation-graph node が投影され既存 graph を回帰させない。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial（項目ごとに独立着地）。
- Step 1: skill_injection 監査（session-log、先行可）→ PLAN-L7-325 で confirmed。
- Step 2: route_mode first-class projection（harness-db 接地）→ PLAN-L7-326 で confirmed。
- Step 3: relation-graph 不足 node 投影の補完 → PLAN-L7-327 で confirmed。
- Step 4: 各項目 review → confirmed 済み。本 PLAN は親集約証跡として confirmed。

## 壊さない / 再発させない
- superset 設計（runtime_verification_events 等）と整合させ二重機構を作らない。
- 一括 import 禁止（粒度を合わせ 1 項目ずつ）。

## 着地結果

- `skill_injection` 監査は PLAN-L7-325 で `src/runtime/session-log.ts` と `tests/session-log.test.ts`
  へ着地した。`U-SLOG-009` で event count、failed outcome の digest failure 投影、secret mask を固定した。
  着地 commit は `5cb9a60`。
- `route_modes` first-class projection は PLAN-L7-326 で schema registry、projection writer、
  physical-data / function spec / unit test design へ着地した。`U-ROUTEMODE-001` と
  db projection coverage で table / index / projection を固定した。着地 commit は `25272a7`。
- relation graph node scope 補完は PLAN-L7-327 で `docs/adr/**/*.md`、
  `docs/governance/document-system-map.md`、`docs/skills/**/*.md`、`.codex/hooks.json` を graph 対象へ
  追加した。`U-RELGRAPH-011` と real-repo fence で missing-projection 回帰を固定した。
  着地 commit は `1bc1c98`。

## 名称 / rename 境界

- 本 PLAN の current prose は HELIX 名称へ寄せ、上流突合 docs 参照も `upstream-helix-*` にそろえた。
- `.ut-tdd` / `ut-tdd` / `area=harness` の物理 rename、ファイル名 rename、distribution cutover は
  PLAN-M-02 の `cutover_decision_record` と `action_binding_approval_record` が承認されるまで行わない。
  `ut-tdd rename plan --json` は 2026-07-05 時点で `blocked_pending_cutover_approval` /
  `mustNotApply: true` を返しており、未承認の実 state move は禁止である。

## レビュー / 次工程
- 3 項目は個別 confirmed PLAN で着地済み。親 PLAN は completeness pass gap の集約証跡として confirmed。
- 残る名称切替は PLAN-M-02 の cutover 承認後に、ファイル名 / フォルダ名 / CLI / state / template /
  distribution surface を atomic migration として扱う。
- 出典: [[upstream-helix-reconciliation]] completeness pass addendum。
