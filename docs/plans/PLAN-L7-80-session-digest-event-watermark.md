---
plan_id: PLAN-L7-80-session-digest-event-watermark
title: "PLAN-L7-80 (troubleshoot): plan digest は per-session high-watermark で incremental events を数え、再要約された session の under-count を防ぐ"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-19
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "内部 harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism) の変更である。harness 自身の enforcement を堅牢化するだけで、product の外部 requirement / design / test-design contract は変更しないため、upstream backprop target はない。"
owner: Claude TL
parent_design: docs/design/harness/L6-function-design/session-log.md
review_evidence:
  - reviewer: codex-gpt-5
    review_kind: cross_agent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "compressPlanDigest は whole-session folding (base.sessions に既にある session の全 event を捨てる挙動) を per-session count high-watermark (session_watermarks[sid]) に置き換えた。複数回要約された session (複数の Stop hooks により append-only の per-session log が伸びる場合) は、全 event を捨てず、watermark を超えた event だけを数える。migration path は pre-L7-80 digest 向けに updated_at から watermarks を seed する (already-folded sessions の ts <= updated_at の event は already counted と扱う)。Codex cross-review (claude-opus-4-8 worker, codex-gpt-5 reviewer) verdict pass: single-call と same-batch re-application は idempotent のまま、migration は double-count せず、genuinely-new events は count される。Documented risks: この修正は caller が complete per-session log を append-only file order で渡すこと (onSessionEnd が whole session jsonl を読むため成立) と、chronological append order が file order と一致することに依存する。Oracle U-SLOG-008 は multi-stop increment、idempotent re-apply、migration を coverage する。"
    worker_model: claude-opus-4-8
    reviewer_model: codex-gpt-5
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: session digest の event-level high-watermark と migration/idempotency contract が現HEADの fast suite で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/session-log.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - session digest event-level high-watermark fix"
generates:
  - artifact_path: docs/plans/PLAN-L7-80-session-digest-event-watermark.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/session-log.ts
    artifact_type: source_module
  - artifact_path: tests/session-log.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/harness/L6-function-design/session-log.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-01-session-log.md
    - docs/plans/PLAN-L7-04-handover-mechanism.md
    - docs/governance/helix-harness-requirements_v1.2.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-80 (troubleshoot): session digest event-level high-watermark の修正

## 0. 目的

`compressPlanDigest` は session 全体を fold していた。いったん `session_id` が
prior digest 由来で `base.sessions` に入ると、loop
`if (folded.has(ev.session_id)) continue` により、その session の全 event が
skip される。Stop hook (`onSessionEnd`) は per-session log 全体を再読込して
digest を再実行するため、Stop が複数回発生した session では、初回 Stop と後続 Stop
の間に append された全 event が捨てられ、PLAN digest (event_counts,
files_touched, commits, failures) が under-count されていた。

## 1. スコープ

対象:

- `PlanDigest` に `session_watermarks?: Record<string, number>` を追加する。これは
  digest に既に fold 済みの matching event 数を session ごとに持つ。
- `compressPlanDigest` は、event の in-session index が session watermark 以上の
  場合だけその event を数え、その後 watermark を進める。Events は append-only file
  order (= chronological = count order) で読まれるため、index は安定する。
- Migration: pre-L7-80 digest には `session_watermarks` がない。already-folded
  sessions について `updated_at` から seed し、`ts <= updated_at` の events を
  contiguous leading already-counted events として扱うことで、re-count を防ぐ。

対象外:

- digest consumer (handover scaffold) や DB projection schema の変更。
- Cross-session ordering。各 session の events は、その session 自身の log にだけ存在する。

## 2. 受入条件

- 2 回 summarize された session (Stops の間に log が増えた場合) で、incremental
  events が 0 ではなく count され、`session_watermarks` が新しい count へ進む。
- Single-call と same-batch re-application は idempotent のまま維持される
  (double count しない)。
- pre-L7-80 digest (`session_watermarks` なし) は、既に反映済みの events を
  re-count せず、genuinely-new events を count して migrate する。
- 既存の U-SLOG-003 は green のまま維持され、typecheck、lint、full Vitest、
  `helix doctor` も green のまま維持される。

## 3. Test Design Pairing との対応

Unit test design entry は `docs/test-design/harness/L7-unit-test-design.md`
(U-SLOG-008)。Red->Green: pre-fix では session の 2 回目 summarize が incremental
events を落として under-count する。post-fix では high-watermark が increment を
count し、migration path が double-counting を回避する。

## 4. 状態

Confirmed。2026-06-19 に実装済み、cross-review 済み。Disposition (D#3) は実装前に
TL-approved 済みであり、具体 diff は Codex cross-reviewed (verdict pass) 済み。
caller-invariant (complete per-session log、append-only file order) も文書化済み。
