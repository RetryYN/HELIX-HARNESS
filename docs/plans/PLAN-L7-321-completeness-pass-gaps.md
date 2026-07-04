---
plan_id: PLAN-L7-321-completeness-pass-gaps
title: "PLAN-L7-321 (impl): 突合 completeness pass の追加 code gap — skill_injection 監査 / route_mode first-class projection / relation-graph node 投影"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/governance/upstream-uttdd-reconciliation-audit-2026-07-04.md
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — session-log の skill_injection event + recordSkillInjectionAttempt、route_mode first-class projection、relation-graph の追加 node 投影を実装"
  - role: tl
    slot_label: "TL — LOCAL の既存 session-log / harness-db / relation-graph 構造への接地・superset 設計との整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/session-log.ts
    artifact_type: source_module
  - artifact_path: tests/session-log-skill-injection.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-uttdd-reconciliation-completeness-2026-07-04.md
    - docs/governance/upstream-uttdd-reconciliation-audit-2026-07-04.md
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
- Step 1: skill_injection 監査（session-log、先行可）。
- Step 2: route_mode first-class projection（harness-db 接地）。
- Step 3: relation-graph 不足 node 投影の補完。
- Step 4: 各項目 review → confirmed。

## 壊さない / 再発させない
- superset 設計（runtime_verification_events 等）と整合させ二重機構を作らない。
- 一括 import 禁止（粒度を合わせ 1 項目ずつ）。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-uttdd-reconciliation]] completeness pass addendum。
</content>
