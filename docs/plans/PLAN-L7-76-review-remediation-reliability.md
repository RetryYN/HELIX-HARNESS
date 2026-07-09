---
plan_id: PLAN-L7-76-review-remediation-reliability
title: "PLAN-L7-76 (troubleshoot): L7 reliability remediation — DB rebuild atomicity, non-git doctor, agent-slots atomic write"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-17
updated: 2026-06-17
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: PM (Opus) / PO (人間)
parent_design: docs/design/harness/L6-function-design/function-spec.md
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-17"
    tests_green_at: "2026-06-17"
    verdict: pass
    scope: "External status-review report (helix-latest-fix-status-review.md) findings verified against current branch code and the genuinely-present, policy-free reliability defects fixed test-first: P0 rebuildHarnessDb non-atomic truncate+reproject (mid-rebuild failure left the projection DB truncated/half-built), P1 change-impact / change-set-integrity fail-close in a non-git (ZIP-only) checkout (inconsistent with the existing non-git fail-open convention in tracked-canonical / runtime-portability), and P1 agent-slots non-atomic state write (torn-write corruption under concurrent hooks). Each fix is covered by a Red→Green Vitest case; typecheck / Biome / full Vitest / doctor all green."
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: DB rebuild atomicity / non-git doctor / agent-slots atomic write の回帰が現HEADの fast suite で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - L7 reliability remediation from external status review"
generates:
  - artifact_path: docs/plans/PLAN-L7-76-review-remediation-reliability.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-slots.ts
    artifact_type: source_module
  - artifact_path: src/lint/change-impact.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-slots.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - docs/adr/ADR-005-distribution-model-and-central-ui.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-76 (troubleshoot): 外部ステータスレビュー由来の L7 信頼性是正

## 0. 目的

外部ステータスレビュー報告書 `helix-latest-fix-status-review.md` で、snapshot
ZIP に対する指摘が起票された。本 PLAN では各指摘を**現在のブランチコード**に照合する。
当該報告は live tree を再読込せず、ZIP hash の一致だけから「未修正」と推定していたためである。
そのうえで、現在のコードに実在し、かつ governance や contract の判断を伴わない純粋な信頼性欠陥だけを閉じる。
すでに対処済みの指摘、現物に存在しない指摘、または PO による governance 判断が必要な指摘
（requirements の current/future 分割、`status --json` / `skill suggest` の contract 方向、
MCP の launch argv contract）は、扱いを記録するだけに留め、この PLAN の**対象外**とする。

## 1. 範囲

対象範囲は、現物で存在確認済み、かつ policy 判断を伴わない信頼性修正とする。

- **P0 — `rebuildHarnessDb` の atomicity**（`src/state-db/projection-writer.ts`）:
  `truncateProjectionTables` と一連の `project*` 処理全体を、単一の
  `BEGIN IMMEDIATE` / `COMMIT` transaction で包み、エラー時は `ROLLBACK` する。
  これは `projectTokenUsage` で既に使っている手法と同じである。rebuild 中に例外が起きても、
  DB を truncate 済みまたは半端な projection 状態に残さず、直前に commit 済みの projection へ戻す。
- **P1 — non-git 環境の `doctor`**（`src/lint/change-impact.ts`, `src/doctor/index.ts`）:
  `isGitRepository(repoRoot)` を追加し、checkout が git work-tree でない場合は
  `checkChangeImpact` / `checkChangeSetIntegrity` を **skip** させる。
  戻り値は `ok:true` とし、message は `skipped (not a git repository)` とする。
  既存の `tracked-canonical` / `runtime-portability` と同じ non-git fail-open 方針に揃える。
  git は存在するが `status` が壊れている場合は、既存の catch 経由で引き続き fail-close する。
  CI は常に git repo で走るため、CI 挙動は変えない。
- **P1 — `agent-slots` の atomic write**（`src/runtime/agent-slots.ts`）:
  `nodeAgentSlotsDeps.writeText` は一意な temp file に stage してから、target へ `renameSync` する。
  これにより、並行 hook（`PreToolUse` の `agent-guard` / `SubagentStop`）や書き込み途中の crash が起きても、
  `loadSlots` が破損扱いで破棄する torn または partial JSON を残さない。rename 失敗時は temp file を掃除する。

対象外は、扱いだけを記録し、この PLAN では変更しない。

- 現在のコードで対処済み: README の存在、PLAN と `src` の ownership baseline
  （doctor の `impl-plan-trace` は既に OK）。
- PO に委ねる governance / contract 方向の判断: requirements の current/future/carry CLI 分割、
  `status --json` と `skill suggest` の public I/O contract を片方向に reconcile する方針、
  MCP config の `command` / `args` launch contract
  （profile-level の `mcpCommand` / `mcpArgs` schema が必要）。
- より大きな意味変更として defer する項目: session-digest の event-level high-watermark idempotency
  （現在の session-level fold は append の多い session を過少計上し得る）、
  `agent-slots` の full multi-process lost-update prevention（file locking が必要）。

## 2. 受入条件

- `rebuildHarnessDb` は atomic である。projection 中に failure を注入しても、以前の
  `plan_registry` projection は rollback により保持され、0 rows に truncate されない。
- `checkChangeImpact` / `checkChangeSetIntegrity` は、non-git directory では `ok:true` と
  `skipped (not a git repository)` message を返し、読めない repo root では引き続き fail-close する。
- `nodeAgentSlotsDeps` は real fs を通じて slot state を round-trip し、`*.tmp-*` temp file を残さない。
- typecheck / Biome / full Vitest / `helix doctor` は green のままとする。
  `src` は PLAN `generates`（この PLAN）へ trace され、change set は design と test artifact を持つ。

## 3. テスト設計との対応

unit test design entries は `docs/test-design/harness/L7-unit-test-design.md`
（U-DBPROJ-ATOMIC-01、U-CHGIMPACT-NONGIT-01、U-SLOT-009）にある。Red→Green は確認済み。
atomicity case は fix 前の tree で failure となり（`plan_registry` 188 → 0）、
transaction wrapper 適用後に pass する。

## 4. 状態

Confirmed。2026-06-17 に実装・検証済み。3 件の fix は Vitest で Red→Green を確認し、
full suite と doctor も green。残る review 指摘は扱い記録のみであり（§1 の対象外を参照）、
PO governance 判断または別の deferred PLAN を待つ。
