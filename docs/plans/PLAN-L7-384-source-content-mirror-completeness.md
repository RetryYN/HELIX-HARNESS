---
plan_id: PLAN-L7-384-source-content-mirror-completeness
title: "PLAN-L7-384: source content mirror completeness"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-07
updated: 2026-07-07
route_mode: forward
entry_signals:
  - "po_directive:2026-07-07:agent-spec-orchestrator-reconciliation"
backprop_decision: not_required
backprop_decision_reason: "大量外部 source の all-ref/full-content mirror を安全に検証する L7 監査 protocol。外部 source の code import や credential activation はしない。"
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE - chunked full-content source mirror ledger"
  - role: qa
    slot_label: "QA - completeness evidence / retry ledger"
generates:
  - artifact_path: docs/plans/PLAN-L7-384-source-content-mirror-completeness.md
    artifact_type: markdown_doc
  - artifact_path: tests/source-content-mirror-completeness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires: []
  references:
    - PLAN-L7-361-agent-catalog-watch
    - PLAN-L7-383-harness-taxonomy-curation-policy
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
---

# PLAN-L7-384: source content mirror completeness

## 目的

GitHub topic のように対象 repo が数百件へ増える場合でも、全 refs、default branch tree、README、
必要な full blob content を chunked に取得し、漏れ・中断・rate limit・巨大 repo を明示できる
source mirror completeness protocol を追加する。

2026-07-07 の監査 pass では topic `agent-harness` 437 repo の refs / README / default tree /
default branch full blob content digest と、437 repo すべての all-ref blob content chunk 0001-0022 を固定済みである。
本 PLAN は、その evidence ledger を再実行可能な protocol へ昇格し、将来の再取得・retry・巨大 repo を
過剰な完了 claim なしに扱うための実装 PLAN である。

## スコープ

- source mirror job ledger を定義する。
- repo ごとに refs digest、README digest、default tree digest、default branch full content digest、
  all-ref full content status、retry status を持つ。
- full blob mirror は ref scope、chunk id、size budget、timeout、network failure reason を記録する。
- repo 内で同一 blob object を複数 ref / path が参照する場合、blob hash は object id 単位で一度だけ計算し、
  ref/path evidence へ join して記録する。
- aggregate content digest は巨大 repo で一括 detail 文字列を構築せず、sort 済み detail 行を streaming hash へ逐次投入する。
- all-ref content が未取得の repo は `incomplete` として残し、完了 claim を許可しない。
- chunk ledger は `ok` / `pending` / `partial` / `failed` を分け、次 chunk の対象選定を機械的に再開できる。
- 外部 source は read-only 取得に限定し、外部 code 実行、依存 install、credential 使用、secret / PII の保存、
  外部 API write を禁止する。
- commit / push / main merge は source mirror 完了後、HELIX GitHub 運用ルールに従う明示 path staging、
  staged diff 検証、Conventional Commit、必要 review / approval を満たした場合だけ実施する。

## 対象外

- 外部 code の HELIX runtime 取り込み。
- GitHub credential の保存。
- popularity / star count による採用判断。
- mirror 取得中の外部 code 実行、test 実行、依存 install。

## 受入条件

- all-ref refs digest と default tree digest がない repo は fail-close する。
- default branch full content digest と all-ref content status を分離して記録する。
- all-ref full blob mirror 未取得 repo は retry ledger に残る。
- scanner は partial result を success として扱わず、complete / incomplete / failed を分ける。
- chunked run は再実行時に既存 digest を再利用できる。
- `pending` repo が残る間は source content mirror objective の完了 claim を許可しない。

## 検証予定

- `bun test tests/source-content-mirror-completeness.test.ts --timeout 180000`
- `bun run typecheck`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-384-source-content-mirror-completeness.md`
